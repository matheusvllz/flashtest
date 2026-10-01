/**
 * Salvaguardas da entrada da Foca IA (spec 48 T-48.2.6; 46 §E.7.5, T-08.5; ECA Digital, Lei 15.211/2025
 * art. 17 §4 IX).
 *
 * 1. **Sinal local de autolesão**, em português, antes de qualquer chamada externa. Com sinal, a conversa não segue:
 *    a resposta é o protocolo de autocuidado (CVV 188), sem passar pela IA.
 * 2. **Moderação da OpenAI** (`omni-moderation-latest`, gratuita) no texto e na foto. Categoria de autolesão →
 *    protocolo; outra categoria sinalizada → recusa educada.
 * 3. Falha técnica da moderação externa não bloqueia o estudo: o sinal local (1) já cobriu o caso crítico, e o
 *    prompt continua com as regras da persona. Fica registrado no log (sem conteúdo).
 *
 * Nos testes, `definirModerador` troca a chamada externa (nenhum teste chama a OpenAI de verdade).
 */
import { log } from "../http";

export interface ResultadoModeracao {
  autolesao: boolean;
  sinalizado: boolean;
  /** Nomes das categorias (para log); nunca o conteúdo. */
  categorias: string[];
}

export type Moderador = (entrada: { texto: string; foto?: { tipo: string; base64: string } | null }) => Promise<ResultadoModeracao>;

const TERMOS_AUTOLESAO = [
  /\bme\s+matar\b/,
  /\bmatar\s+a\s+mim\b/,
  /\bsuic[ií]d/,
  /\btirar\s+(a\s+)?minha\s+(pr[oó]pria\s+)?vida\b/,
  /\bme\s+(cortar|machucar|ferir)\b/,
  /\bautoles/,
  /\bautomutila/,
  /\bn[aã]o\s+quero\s+mais\s+(viver|existir|estar\s+aqui)\b/,
  /\bquero\s+morrer\b/,
  /\bacabar\s+com\s+(a\s+)?minha\s+vida\b/,
  /\bsumir\s+de\s+vez\b/,
];

/** Sinal local, sem rede. Normaliza caixa; não tenta adivinhar ironia (na dúvida, acolhe). */
export function sinalLocalDeAutolesao(texto: string): boolean {
  const t = texto.toLowerCase();
  return TERMOS_AUTOLESAO.some((r) => r.test(t));
}

const CATEGORIAS_AUTOLESAO = new Set(["self-harm", "self-harm/intent", "self-harm/instructions"]);

async function moderarNaOpenAI(entrada: Parameters<Moderador>[0]): Promise<ResultadoModeracao> {
  const chave = process.env.OPENAI_API_KEY?.trim();
  if (!chave) return { autolesao: false, sinalizado: false, categorias: [] };
  const input: Array<Record<string, unknown>> = [{ type: "text", text: entrada.texto }];
  if (entrada.foto) input.push({ type: "image_url", image_url: { url: `data:${entrada.foto.tipo};base64,${entrada.foto.base64}` } });
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 6000);
  try {
    const r = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input }),
      signal: abort.signal,
    });
    if (!r.ok) {
      log("aviso", "tutor.moderacao.falhou", { status: r.status });
      return { autolesao: false, sinalizado: false, categorias: [] };
    }
    const json = (await r.json()) as { results?: Array<{ flagged?: boolean; categories?: Record<string, boolean> }> };
    const res = json.results?.[0];
    const categorias = Object.entries(res?.categories ?? {})
      .filter(([, v]) => v)
      .map(([k]) => k);
    return { autolesao: categorias.some((c) => CATEGORIAS_AUTOLESAO.has(c)), sinalizado: !!res?.flagged, categorias };
  } catch {
    log("aviso", "tutor.moderacao.falhou", { motivo: "rede-ou-tempo" });
    return { autolesao: false, sinalizado: false, categorias: [] };
  } finally {
    clearTimeout(timer);
  }
}

let moderador: Moderador = moderarNaOpenAI;

/** Só para testes: troca a moderação externa por uma simulada (`undefined` volta à real). */
export function definirModerador(m: Moderador | undefined): void {
  moderador = m ?? moderarNaOpenAI;
}

/** Sinal local primeiro (sem rede); depois a moderação externa. */
export async function moderar(entrada: Parameters<Moderador>[0]): Promise<ResultadoModeracao> {
  if (sinalLocalDeAutolesao(entrada.texto)) return { autolesao: true, sinalizado: true, categorias: ["local:autolesao"] };
  return moderador(entrada);
}
