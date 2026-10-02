import { SOUND_ASSETS, PRIORIDADE_FECHAMENTO, type SoundEvent } from "./identity";
export type { SoundEvent } from "./identity";

const FADE_S = 0.03;
/** Prazo do som de resposta (C-SOM-4). */
const PRAZO_RESPOSTA_MS = 300;
/** Prazo do fechamento (C-SOM-4). */
const PRAZO_FECHAMENTO_MS = 500;
/**
 * Prazo do PRIMEIRO som da sessão (spec 50 §5.12.1): no celular, destravar + carregar + decodificar a primeira vez
 * passa fácil de 300 ms e o som era descartado em silêncio — um dos motivos de "no celular o som não toca".
 */
const PRAZO_PRIMEIRO_SOM_MS = 900;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let generation = 0;
let freeAt = 0;
let primeiroSomTocado = false;
let somNoSilencioso = false;
const buffers = new Map<SoundEvent, Promise<AudioBuffer | null>>();
const active = new Set<{ source: AudioBufferSourceNode; gain: GainNode }>();

/* ---------------------------------------------------------------- diagnóstico --- */

export interface RegistroDeAudio {
  t: number;
  tipo: string;
  dados?: Record<string, string | number | boolean | null>;
}

const MAX_REGISTROS = 200;
const registros: RegistroDeAudio[] = [];
const inicio = typeof performance !== "undefined" ? performance.now() : 0;

function registrar(tipo: string, dados?: RegistroDeAudio["dados"]) {
  registros.push({ t: Math.round((typeof performance !== "undefined" ? performance.now() : 0) - inicio), tipo, dados });
  if (registros.length > MAX_REGISTROS) registros.shift();
}

/** Estado do áudio para o painel `?diagnostico-audio=1` (spec 50 T-50.1.1); nunca sai do aparelho. */
export function getAudioDiagnostics() {
  const sessao = typeof navigator !== "undefined" ? (navigator as { audioSession?: { type?: string } }).audioSession : undefined;
  return {
    contexto: ctx ? ctx.state : "nao-criado",
    taxa: ctx ? ctx.sampleRate : null,
    habilitado: enabled,
    visivel: visible(),
    primeiroSomTocado,
    somNoSilencioso,
    audioSession: sessao?.type ?? null,
    carregados: [...buffers.keys()],
    registros: [...registros],
  };
}

/* -------------------------------------------------------------------- base --- */

function visible(): boolean {
  return typeof document === "undefined" || !document.hidden;
}

/**
 * iPhone (Safari 16.4+): o modo da sessão de áudio. "playback" toca mesmo com a chave de silencioso (como um vídeo);
 * sem a preferência, o padrão do navegador continua (respeita a chave e mistura com a música do aluno; D50-15).
 */
function aplicarSessaoDeAudio() {
  if (typeof navigator === "undefined") return;
  const sessao = (navigator as { audioSession?: { type?: string } }).audioSession;
  if (!sessao) return;
  try {
    sessao.type = somNoSilencioso ? "playback" : "auto";
  } catch {
    // Navegador sem suporte ao tipo: segue o padrão.
  }
}

/** `running` é o único estado que toca; `suspended` e o `interrupted` do iOS precisam de `resume()` num gesto. */
function precisaRetomar(c: AudioContext): boolean {
  return (c.state as string) !== "running" && (c.state as string) !== "closed";
}

function retomar(c: AudioContext, motivo: string): Promise<void> {
  const antes = c.state as string;
  return c.resume().then(
    () => registrar("resume", { motivo, antes, depois: c.state as string }),
    (erro: unknown) => registrar("resume-falhou", { motivo, antes, erro: String(erro).slice(0, 80) }),
  );
}

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      registrar("sem-web-audio");
      return null;
    }
    try {
      aplicarSessaoDeAudio();
      const created = new Ctor();
      const gain = created.createGain();
      // Approved WAVs already carry their level hierarchy: unity master gain.
      gain.gain.value = 1;
      gain.connect(created.destination);
      ctx = created;
      master = gain;
      registrar("contexto-criado", { estado: created.state as string, taxa: created.sampleRate });
      created.addEventListener?.("statechange", () => registrar("estado", { estado: created.state as string }));
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAllFeedbackSounds();
      });
      window.addEventListener("pagehide", stopAllFeedbackSounds);
    } catch (erro) {
      registrar("contexto-falhou", { erro: String(erro).slice(0, 80) });
      return null;
    }
  }
  return ctx;
}

function load(event: SoundEvent, c: AudioContext): Promise<AudioBuffer | null> {
  const cached = buffers.get(event);
  if (cached) return cached;
  const request = (async () => {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 8000);
    const t0 = Date.now();
    try {
      const response = await fetch(SOUND_ASSETS[event], { signal: abort.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await c.decodeAudioData(await response.arrayBuffer());
      registrar("carregado", { evento: event, ms: Date.now() - t0 });
      return buffer;
    } catch (erro) {
      registrar("carga-falhou", { evento: event, erro: String(erro).slice(0, 80) });
      buffers.delete(event);
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();
  buffers.set(event, request);
  return request;
}

async function within<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), Math.max(0, ms));
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Destrava e aquece os sons num gesto, sem tocar nada. Chamado na raiz em `pointerdown`, `pointerup`, `touchend`,
 * `click` e `keydown` (spec 50 §5.12.1): no toque, só `pointerup`/`touchend`/`click` contam como ativação do usuário
 * para áudio; ouvir só `pointerdown` deixava o contexto suspenso no celular.
 */
export function unlockAudioFromGesture(evento = "gesto"): void {
  if (!enabled || !visible()) return;
  const c = context();
  if (!c) return;
  if (precisaRetomar(c)) void retomar(c, evento);
  for (const event of Object.keys(SOUND_ASSETS) as SoundEvent[]) void load(event, c);
}

/** Pré-aquece contexto e sons ao abrir uma lição (sem tocar). Fora de gesto, só carrega. */
export function preaquecerAudio(): void {
  if (!enabled) return;
  const c = context();
  if (!c) return;
  for (const event of Object.keys(SOUND_ASSETS) as SoundEvent[]) void load(event, c);
}

/** iOS: ligação, bloqueio de tela ou outro app deixam o contexto `interrupted`; ao voltar, tenta retomar. */
export function retomarAudioSeInterrompido(motivo: string): void {
  if (!ctx || !enabled || !visible()) return;
  if (precisaRetomar(ctx)) void retomar(ctx, motivo);
}

async function play(event: SoundEvent, requestedAt: number, prazoMs: number): Promise<void> {
  const expiresMs = primeiroSomTocado ? prazoMs : Math.max(prazoMs, PRAZO_PRIMEIRO_SOM_MS);
  if (!enabled || !visible() || Date.now() - requestedAt >= expiresMs) {
    registrar("descartado", { evento: event, motivo: !enabled ? "mudo" : !visible() ? "oculto" : "prazo-antes" });
    return;
  }
  const c = context();
  if (!c) return;
  const requestGeneration = generation;
  try {
    const ready = await within(
      Promise.all([precisaRetomar(c) ? retomar(c, `tocar:${event}`) : Promise.resolve(), load(event, c)]),
      expiresMs - (Date.now() - requestedAt),
    );
    if (!ready || !ready[1] || !enabled || !visible() || generation !== requestGeneration || (c.state as string) !== "running") {
      registrar("descartado", {
        evento: event,
        motivo: !ready ? "prazo" : !ready[1] ? "sem-buffer" : (c.state as string) !== "running" ? `estado-${c.state}` : "cancelado",
        ms: Date.now() - requestedAt,
      });
      return;
    }
    const start = Math.max(c.currentTime, freeAt);
    // Deadline includes fetch, decoding, resume AND queue wait.
    if (Date.now() - requestedAt + (start - c.currentTime) * 1000 >= expiresMs) {
      registrar("descartado", { evento: event, motivo: "fila", ms: Date.now() - requestedAt });
      return;
    }
    const source = c.createBufferSource();
    const gain = c.createGain();
    source.buffer = ready[1];
    source.connect(gain).connect(master!);
    const entry = { source, gain };
    source.onended = () => {
      active.delete(entry);
      source.disconnect();
      gain.disconnect();
    };
    active.add(entry);
    source.start(start);
    freeAt = start + ready[1].duration;
    primeiroSomTocado = true;
    registrar("tocou", { evento: event, ms: Date.now() - requestedAt });
  } catch (erro) {
    // Network/autoplay/decoding failures never interrupt a lesson.
    registrar("erro", { evento: event, erro: String(erro).slice(0, 80) });
  }
}

export function playFeedbackSound(event: SoundEvent, requestedAt = Date.now()): Promise<void> {
  return play(event, requestedAt, PRAZO_RESPOSTA_MS);
}

export function selectHighestPrioritySound(events: SoundEvent[]): SoundEvent | null {
  return PRIORIDADE_FECHAMENTO.find((event) => events.includes(event)) ?? events[0] ?? null;
}

export function playClosingSound(events: SoundEvent[], requestedAt = Date.now()): Promise<void> {
  const event = selectHighestPrioritySound(events);
  return event ? play(event, requestedAt, PRAZO_FECHAMENTO_MS) : Promise.resolve();
}

/** Invalidates pending async playback as well as scheduled/running sources. */
export function stopAllFeedbackSounds(): void {
  generation++;
  if (!ctx) return;
  const now = ctx.currentTime;
  const hadActive = active.size > 0;
  for (const { source, gain } of active) {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + FADE_S);
      source.stop(now + FADE_S);
    } catch {
      // Already ended.
    }
  }
  freeAt = now + (hadActive ? FADE_S : 0);
}

export function setAudioEnabled(value: boolean): void {
  enabled = value;
  if (!value) stopAllFeedbackSounds();
}

/** Preferência do Perfil (só faz diferença no iPhone): tocar mesmo com a chave de silencioso. */
export function setSomNoSilencioso(value: boolean): void {
  if (somNoSilencioso === value) return;
  somNoSilencioso = value;
  aplicarSessaoDeAudio();
  registrar("som-no-silencioso", { valor: value });
}

/** Só para testes: volta o motor ao estado inicial. */
export function __reiniciarMotorParaTestes(): void {
  ctx = null;
  master = null;
  enabled = true;
  generation = 0;
  freeAt = 0;
  primeiroSomTocado = false;
  somNoSilencioso = false;
  buffers.clear();
  active.clear();
  registros.length = 0;
}
