import type { TutorMessage } from "@/lib/tutor-prompt";

/**
 * Chamada à OpenAI da Foca IA (SDD 12, D2 — provedor OpenAI desde 22/07; spec 48 T-48.2.3/T-48.2.4).
 *
 * Só o servidor usa este módulo (`src/server/tutor/responder.ts`; `src/server/**` é bloqueado no navegador): a `OPENAI_API_KEY` é lida do ambiente do
 * servidor e nunca chega ao navegador. Sem chave, ou se a chamada falhar, devolve `null` e quem chamou usa o
 * fallback local — o balão nunca fica vazio.
 *
 * `fetch` direto em vez do SDK oficial de propósito: é uma única chamada HTTP feita por uma função de servidor, e
 * uma dependência a mais não compensa.
 */

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * gpt-5.4-mini foi medido contra gpt-4o-mini, gpt-4.1-mini e gpt-5-mini em 22/07 com o prompt real do tutor: foi o
 * mais RÁPIDO (~1,4s contra 1,6–1,7s dos outros minis) e o único que resolveu a questão corretamente em vez de só
 * citar a fórmula. gpt-5-mini foi descartado por gastar ~5,8s com reasoning.
 */
export const TUTOR_MODELO = "gpt-5.4-mini";
const MAX_TOKENS = 600;
/** Teto de espera: melhor cair no fallback do que travar o balão. */
const TIMEOUT_MS = 12_000;

export interface ChamadaIA {
  sistema: string;
  mensagens: TutorMessage[];
  foto: { tipo: string; base64: string } | null;
  /** Teto de tokens da resposta; padrão o do tutor. O corretor de redação precisa de mais (spec 49 §5.9). */
  maxTokens?: number;
  /** Teto de espera; padrão o do tutor. */
  timeoutMs?: number;
}

/**
 * Resultado da chamada. `texto` nulo = falha técnica; `usage` vem sempre que a API o devolveu (inclusive com
 * resposta vazia, que também é cobrada). `null` (sem objeto) = não há chave.
 */
export interface RespostaIA {
  texto: string | null;
  usage: { entrada: number; saida: number } | null;
  motivo?: "status" | "vazio" | "timeout" | "rede";
}

type ChatContent = string | Array<Record<string, unknown>>;

async function chamarOpenAI({ sistema, mensagens, foto, maxTokens, timeoutMs }: ChamadaIA): Promise<RespostaIA | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const chatMessages: Array<{ role: string; content: ChatContent }> = [
    { role: "system", content: sistema },
    ...mensagens.map((m, i) => {
      // A foto acompanha só a última mensagem do aluno.
      if (i === mensagens.length - 1 && m.role === "user" && foto) {
        return {
          role: "user",
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: `data:${foto.tipo};base64,${foto.base64}` } },
          ] as Array<Record<string, unknown>>,
        };
      }
      return { role: m.role, content: m.content as ChatContent };
    }),
  ];

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs ?? TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: TUTOR_MODELO, messages: chatMessages, max_completion_tokens: maxTokens ?? MAX_TOKENS }),
      signal: abort.signal,
    });
    if (!response.ok) {
      // Não logamos o corpo: ele pode ecoar trechos do payload.
      console.error(`[tutor] OpenAI respondeu ${response.status}`);
      return { texto: null, usage: null, motivo: "status" };
    }
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const texto = json.choices?.[0]?.message?.content?.trim() || null;
    const usage = json.usage ? { entrada: json.usage.prompt_tokens ?? 0, saida: json.usage.completion_tokens ?? 0 } : null;
    return texto ? { texto, usage } : { texto: null, usage, motivo: "vazio" };
  } catch (error) {
    const motivo = error instanceof Error && error.name === "AbortError" ? "timeout" : "rede";
    console.error(`[tutor] chamada à OpenAI falhou: ${motivo}`);
    return { texto: null, usage: null, motivo };
  } finally {
    clearTimeout(timer);
  }
}

let chamada: (c: ChamadaIA) => Promise<RespostaIA | null> = chamarOpenAI;

/** Chama a IA (ou a simulação dos testes). `null` = sem chave. */
export function chamarIA(c: ChamadaIA): Promise<RespostaIA | null> {
  return chamada(c);
}

/** Só para testes: troca a chamada real por uma simulada (`undefined` volta à real). Nenhum teste chama a OpenAI. */
export function definirChamadaIA(f: ((c: ChamadaIA) => Promise<RespostaIA | null>) | undefined): void {
  chamada = f ?? chamarOpenAI;
}
