/**
 * Anúncios no navegador (spec 49 §5.4, T-49.6.2–6.4). Só para o Free, carregado sob demanda (nunca no bundle nem na
 * landing). Provedor `falso` no desenvolvimento e nos E2E; `gam` (Google Publisher Tag) nos ambientes implantados.
 *
 * Privacidade: anúncio NÃO personalizado para todos; menor de 18 marcado como adolescente (TFAT 2); sem
 * consentimento de cookies, o GPT vem no modo "limited ads" (sem cookies). Nenhum dado do aluno vai como segmentação.
 * Pontos do GPT a confirmar com a conta real (spike T-49.6.1): URL do modo sem cookies e o intersticial numa SPA —
 * por isso o formato depois da lição é o retângulo dentro da tela (reserva da spec), não um intersticial por cima.
 */
export interface ConfigAnunciosCliente {
  ativo: boolean;
  provedor: "falso" | "gam";
  unidades: { recompensado: string | null; retangulo: string | null };
  menor: boolean;
  consentimento: "aceito" | "recusado" | null;
}

export type ResultadoRecompensado = "ganhou" | "fechou" | "indisponivel";

// ------------------------------------------------------------------ frequência do retângulo (§5.4)

const CHAVE_FREQUENCIA = "foca.anuncios.frequencia";
/** Nunca depois da 1ª lição do dia; no máximo 1 a cada 2 lições; no máximo 3 por dia. */
const MAX_POR_DIA = 3;

interface Frequencia {
  dia: string;
  licoes: number;
  exibidos: number;
}

function diaLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lerFrequencia(): Frequencia {
  try {
    const f = JSON.parse(localStorage.getItem(CHAVE_FREQUENCIA) ?? "null") as Frequencia | null;
    if (f && f.dia === diaLocal()) return f;
  } catch {
    /* sem storage: trata como dia novo */
  }
  return { dia: diaLocal(), licoes: 0, exibidos: 0 };
}

function gravarFrequencia(f: Frequencia): void {
  try {
    localStorage.setItem(CHAVE_FREQUENCIA, JSON.stringify(f));
  } catch {
    /* sem storage: só não guarda */
  }
}

/** Chamado uma vez por tela de conclusão de lição: conta a lição e diz se o retângulo aparece nesta. */
export function retanguloNestaConclusao(): boolean {
  const f = lerFrequencia();
  f.licoes += 1;
  const mostra = f.licoes >= 2 && f.licoes % 2 === 0 && f.exibidos < MAX_POR_DIA;
  if (mostra) f.exibidos += 1;
  gravarFrequencia(f);
  return mostra;
}

// ------------------------------------------------------------------ provedor falso (dev e E2E)

function recompensadoFalso(): Promise<ResultadoRecompensado> {
  return new Promise((resolve) => {
    const fundo = document.createElement("div");
    fundo.setAttribute("role", "dialog");
    fundo.setAttribute("aria-modal", "true");
    fundo.setAttribute("aria-label", "Anúncio de teste");
    fundo.setAttribute("data-anuncio-falso", "recompensado");
    fundo.style.cssText = "position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:var(--scrim)";
    const caixa = document.createElement("div");
    caixa.style.cssText = "background:var(--cards);color:var(--abismo);border-radius:20px;padding:24px;max-width:320px;text-align:center";
    const titulo = document.createElement("p");
    titulo.style.cssText = "font-weight:700;margin:0 0 12px";
    titulo.textContent = "Anúncio de teste";
    caixa.append(titulo);
    const concluir = document.createElement("button");
    concluir.type = "button";
    concluir.className = "btn-primary w-full";
    concluir.textContent = "Concluir anúncio de teste";
    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "btn-ghost w-full";
    fechar.textContent = "Fechar";
    caixa.append(concluir, fechar);
    fundo.append(caixa);
    document.body.append(fundo);
    const fim = (r: ResultadoRecompensado) => {
      fundo.remove();
      resolve(r);
    };
    concluir.addEventListener("click", () => fim("ganhou"));
    fechar.addEventListener("click", () => fim("fechou"));
  });
}

// ------------------------------------------------------------------ Google Publisher Tag

interface Slot {
  addService(s: unknown): Slot;
}
interface EventoRecompensado {
  slot: Slot;
  makeRewardedVisible?: () => void;
}
interface GoogleTag {
  cmd: Array<() => void>;
  pubads(): {
    setPrivacySettings(p: Record<string, unknown>): void;
    addEventListener(nome: string, cb: (e: EventoRecompensado) => void): void;
    removeEventListener?(nome: string, cb: (e: EventoRecompensado) => void): void;
  };
  defineOutOfPageSlot(path: string, formato: unknown): Slot | null;
  defineSlot(path: string, tamanho: [number, number], div: string): Slot | null;
  enums: { OutOfPageFormat: { REWARDED: unknown } };
  enableServices(): void;
  display(alvo: Slot | string): void;
  destroySlots(slots?: Slot[]): void;
}

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}

let gptCarregando: Promise<GoogleTag> | null = null;

function carregarGpt(cfg: ConfigAnunciosCliente): Promise<GoogleTag> {
  if (gptCarregando) return gptCarregando;
  gptCarregando = new Promise((resolve, reject) => {
    window.googletag = window.googletag ?? ({ cmd: [] } as unknown as GoogleTag);
    const script = document.createElement("script");
    script.async = true;
    // Sem consentimento de cookies: modo "limited ads" (sem cookies), servido pelo domínio de anúncios do Google.
    script.src =
      cfg.consentimento === "aceito"
        ? "https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        : "https://pagead2.googlesyndication.com/tag/js/gpt.js";
    script.onload = () => {
      const g = window.googletag!;
      g.cmd.push(() => {
        g.pubads().setPrivacySettings({
          nonPersonalizedAds: true,
          limitedAds: cfg.consentimento !== "aceito",
          ...(cfg.menor ? { tagForAgeTreatment: 2 } : {}),
        });
        g.enableServices();
        resolve(g);
      });
    };
    script.onerror = () => {
      gptCarregando = null;
      reject(new Error("gpt indisponível"));
    };
    document.head.append(script);
  });
  return gptCarregando;
}

async function recompensadoGpt(cfg: ConfigAnunciosCliente): Promise<ResultadoRecompensado> {
  if (!cfg.unidades.recompensado) return "indisponivel";
  let g: GoogleTag;
  try {
    g = await carregarGpt(cfg);
  } catch {
    return "indisponivel";
  }
  return new Promise((resolve) => {
    let ganhou = false;
    let pronto = false;
    const slot = g.defineOutOfPageSlot(cfg.unidades.recompensado!, g.enums.OutOfPageFormat.REWARDED);
    if (!slot) {
      resolve("indisponivel");
      return;
    }
    slot.addService(g.pubads());
    const encerrar = (r: ResultadoRecompensado) => {
      g.destroySlots([slot]);
      resolve(r);
    };
    const prazo = setTimeout(() => !pronto && encerrar("indisponivel"), 10_000);
    g.pubads().addEventListener("rewardedSlotReady", (e) => {
      if (e.slot !== slot) return;
      pronto = true;
      clearTimeout(prazo);
      e.makeRewardedVisible?.();
    });
    g.pubads().addEventListener("rewardedSlotGranted", (e) => {
      if (e.slot === slot) ganhou = true;
    });
    g.pubads().addEventListener("rewardedSlotClosed", (e) => {
      if (e.slot === slot) encerrar(ganhou ? "ganhou" : "fechou");
    });
    g.display(slot);
  });
}

// ------------------------------------------------------------------ API

export function exibirRecompensado(cfg: ConfigAnunciosCliente): Promise<ResultadoRecompensado> {
  if (!cfg.ativo) return Promise.resolve("indisponivel");
  return cfg.provedor === "gam" ? recompensadoGpt(cfg) : recompensadoFalso();
}

/** Monta o retângulo 300×250 no elemento (já com o espaço reservado). Devolve a limpeza. */
export async function montarRetangulo(el: HTMLElement, cfg: ConfigAnunciosCliente): Promise<() => void> {
  if (!cfg.ativo) return () => undefined;
  if (cfg.provedor === "falso") {
    el.setAttribute("data-anuncio-falso", "retangulo");
    el.textContent = "Anúncio de teste";
    return () => {
      el.textContent = "";
    };
  }
  if (!cfg.unidades.retangulo) return () => undefined;
  try {
    const g = await carregarGpt(cfg);
    el.id = el.id || `anuncio-${Math.random().toString(36).slice(2)}`;
    let slot: Slot | null = null;
    g.cmd.push(() => {
      slot = g.defineSlot(cfg.unidades.retangulo!, [300, 250], el.id);
      if (slot) {
        slot.addService(g.pubads());
        g.display(el.id);
      }
    });
    return () => {
      if (slot) g.destroySlots([slot]);
    };
  } catch {
    return () => undefined;
  }
}
