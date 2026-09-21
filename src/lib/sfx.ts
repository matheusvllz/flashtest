import { getState } from "@/lib/store";

/**
 * Sistema de som (docs/16-gamificacao-e-dopamina.md §3, docs/18-plano-
 * reestilizacao-rabisco.md §10.2, decisão D3). Sintetizado via WebAudio puro
 * — sem arquivo, sem biblioteca. O alvo do build é worker; cada dependência
 * de áudio pesaria por nada (mesma lógica do `CLAUDE.md` pro cliente de IA).
 *
 * Todos os eventos na mesma escala (dó maior), curtos, timbre suave — a
 * "mesma tonalidade" é o que faz soar como sistema, não como efeitos soltos.
 * Nunca dois sons ao mesmo tempo: cada `play()` agenda depois do anterior.
 */
export type Evento =
  | "acerto"
  | "acerto3"
  | "erro"
  | "xp"
  | "fim"
  | "streak"
  | "marco"
  | "desbloqueio"
  | "pop";

type Nota = { freq: number; inicio: number; dur: number; tipo?: OscillatorType; ganho?: number };

const NOTA = { A3: 220, C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.51 };

const EVENTOS: Record<Evento, Nota[]> = {
  // Acerto: 2 notas ascendentes, ~180ms (16 §3).
  acerto: [
    { freq: NOTA.C5, inicio: 0, dur: 0.09 },
    { freq: NOTA.E5, inicio: 0.09, dur: 0.09 },
  ],
  // Acerto difícil / streak de acertos: 3 notas, ~260ms.
  acerto3: [
    { freq: NOTA.C5, inicio: 0, dur: 0.08 },
    { freq: NOTA.E5, inicio: 0.08, dur: 0.08 },
    { freq: NOTA.G5, inicio: 0.16, dur: 0.1 },
  ],
  // Erro: 1 nota grave, neutra, curta — nunca buzina (16 §3).
  erro: [{ freq: NOTA.A3, inicio: 0, dur: 0.15, tipo: "triangle", ganho: 0.4 }],
  // XP subindo: tick sutil por incremento. O caller limita a ~6 chamadas (16 §3).
  xp: [{ freq: NOTA.C6, inicio: 0, dur: 0.04, ganho: 0.22 }],
  // Fim de aula: fanfarra curta, único som "grande" do app, ~900ms.
  fim: [
    { freq: NOTA.C5, inicio: 0, dur: 0.18 },
    { freq: NOTA.E5, inicio: 0.18, dur: 0.18 },
    { freq: NOTA.G5, inicio: 0.36, dur: 0.18 },
    { freq: NOTA.C6, inicio: 0.54, dur: 0.36 },
  ],
  // Streak mantido / meta fechada: sino claro, ~300ms.
  streak: [{ freq: NOTA.C6, inicio: 0, dur: 0.3, ganho: 0.3 }],
  // Streak novo recorde / level up: sino + brilho, oitava acima, ~450ms.
  marco: [
    { freq: NOTA.C6, inicio: 0, dur: 0.22, ganho: 0.3 },
    { freq: NOTA.E6, inicio: 0.15, dur: 0.3, ganho: 0.25 },
  ],
  // Lição desbloqueada: clique de destrave, ~200ms.
  desbloqueio: [
    { freq: NOTA.E5, inicio: 0, dur: 0.09, ganho: 0.18 },
    { freq: NOTA.G5, inicio: 0.1, dur: 0.09, ganho: 0.18 },
  ],
  // Abertura do balão da Foca: pop curtíssimo, sem melodia — é UI, não recompensa.
  pop: [{ freq: NOTA.C6, inicio: 0, dur: 0.08, ganho: 0.15 }],
};

/** Ordem de prioridade pra `playRecompensa` — a mais alta ganha quando várias coincidem numa resposta (16 §3, regra 5). */
const PRIORIDADE: Evento[] = [
  "marco",
  "streak",
  "fim",
  "acerto3",
  "acerto",
  "xp",
  "desbloqueio",
  "pop",
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
/** Instante (em `ctx.currentTime`) em que a fila fica livre — garante que nunca dois sons tocam juntos. */
let livreEm = 0;

function getCtx(): { ctx: AudioContext; master: GainNode } {
  if (!ctx) {
    ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { ctx, master: master! };
}

function tocarNota(c: AudioContext, dest: GainNode, nota: Nota, tempoBase: number) {
  const osc = c.createOscillator();
  osc.type = nota.tipo ?? "sine";
  osc.frequency.value = nota.freq;
  const gain = c.createGain();
  const alvo = nota.ganho ?? 0.28;
  const t0 = tempoBase + nota.inicio;
  const t1 = t0 + nota.dur;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(alvo, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t1);
  osc.connect(gain).connect(dest);
  osc.start(t0);
  osc.stop(t1 + 0.02);
}

function habilitado(): boolean {
  try {
    return getState().prefs.sound;
  } catch {
    return true;
  }
}

/**
 * Toca um evento sonoro. Silencioso em SSR, com som desligado, ou se o
 * navegador recusar o áudio (política de autoplay, contexto bloqueado) —
 * áudio que falha nunca pode quebrar a UI (16 §3, regras 1 e 2 — mudo é
 * sagrado, e o silencioso do sistema também).
 */
export function play(evento: Evento) {
  if (typeof window === "undefined" || !habilitado()) return;
  try {
    const { ctx: c, master: m } = getCtx();
    const notas = EVENTOS[evento];
    const tempoBase = Math.max(c.currentTime, livreEm);
    let fim = tempoBase;
    for (const nota of notas) {
      tocarNota(c, m, nota, tempoBase);
      fim = Math.max(fim, tempoBase + nota.inicio + nota.dur);
    }
    livreEm = fim;
  } catch {
    // Contexto de áudio indisponível ou bloqueado — falha em silêncio.
  }
}

/** Toca só o mais alto da hierarquia entre os eventos de recompensa da resposta (16 §3, regra 5). */
export function playRecompensa(eventos: Evento[]) {
  if (eventos.length === 0) return;
  const [primeiro] = [...eventos].sort((a, b) => PRIORIDADE.indexOf(a) - PRIORIDADE.indexOf(b));
  play(primeiro);
}
