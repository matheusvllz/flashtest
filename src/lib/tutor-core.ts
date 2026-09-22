import {
  buildSystemPrompt,
  localFallback,
  type TutorContext,
  type TutorMessage,
} from "@/lib/tutor-prompt";

/**
 * Camada de IA do balão do tutor (SDD 12, D2 — provedor trocado para a OpenAI
 * em 22/07, ver Registro de decisões do `12`).
 *
 * Roda como server function do TanStack Start: a `OPENAI_API_KEY` é lida do
 * ambiente do servidor e nunca chega ao navegador. Se a chave não existir ou a
 * chamada falhar, devolvemos o fallback local — o balão nunca aparece vazio na
 * frente da banca.
 *
 * Usamos `fetch` direto em vez do SDK oficial de propósito: o build tem como
 * alvo o runtime de worker (Nitro/Cloudflare), onde uma dependência pensada
 * para Node é risco desnecessário — e a API de chat é uma única chamada HTTP.
 */

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * gpt-5.4-mini foi medido contra gpt-4o-mini, gpt-4.1-mini e gpt-5-mini em
 * 22/07 com o prompt real do tutor: foi o mais RÁPIDO (~1,4s contra 1,6–1,7s
 * dos outros minis) e o único que resolveu a questão corretamente em vez de só
 * citar a fórmula. gpt-5-mini foi descartado por gastar ~5,8s com reasoning —
 * inviável numa demo ao vivo.
 */
const MODEL = "gpt-5.4-mini";
const MAX_TOKENS = 600;
/** Teto de espera: melhor cair no fallback do que travar o balão na banca. */
const TIMEOUT_MS = 12_000;

export type TutorImage = {
  /** image/jpeg, image/png ou image/webp */
  mediaType: string;
  /** base64 puro, sem o prefixo `data:...;base64,` */
  data: string;
};

export type TutorRequest = {
  messages: TutorMessage[];
  context: TutorContext;
  image?: TutorImage | null;
};

export type TutorReply = {
  text: string;
  /** true = veio do fallback local, não da IA. A UI sinaliza isso ao aluno. */
  fallback: boolean;
};

type ChatContent = string | Array<Record<string, unknown>>;

/**
 * Validação de runtime do payload (docs/20 §14.2, Fase 7 item 8): o
 * `.inputValidator` da server function era um cast, não validação de
 * verdade — nada impedia mensagem vazia, conversa enorme ou imagem fora do
 * limite. "Proposta inicial 5 MiB por arquivo, PNG/JPEG/WebP, verificação
 * real de tipo e tamanho" (docs/20 §14.2).
 */
export const TUTOR_IMAGE_TYPES_PERMITIDOS = new Set(["image/png", "image/jpeg", "image/webp"]);
export const TUTOR_IMAGEM_MAX_BYTES = 5 * 1024 * 1024; // 5 MiB
export const TUTOR_MAX_MENSAGENS = 40;
export const TUTOR_MAX_TAMANHO_MENSAGEM = 4000;

/** Tamanho em bytes de uma string base64 (sem decodificar) — conta os `=` de padding fora. */
function tamanhoBase64EmBytes(base64: string): number {
  const semPadding = base64.replace(/=+$/, "");
  return Math.floor((semPadding.length * 3) / 4);
}

export class TutorRequestInvalido extends Error {}

/**
 * Lança `TutorRequestInvalido` se o payload não for seguro de processar.
 * Nunca confia no cast TS do RPC — mesma filosofia de `state-migrations.ts`.
 */
export function validateTutorRequest(data: unknown): TutorRequest {
  if (typeof data !== "object" || data === null) {
    throw new TutorRequestInvalido("payload ausente ou não é um objeto");
  }
  const d = data as Partial<TutorRequest>;

  if (!Array.isArray(d.messages) || d.messages.length === 0) {
    throw new TutorRequestInvalido("mensagens ausentes");
  }
  if (d.messages.length > TUTOR_MAX_MENSAGENS) {
    throw new TutorRequestInvalido(`conversa longa demais (máx. ${TUTOR_MAX_MENSAGENS} mensagens)`);
  }
  for (const m of d.messages) {
    if (
      typeof m?.content !== "string" ||
      m.content.length === 0 ||
      m.content.length > TUTOR_MAX_TAMANHO_MENSAGEM ||
      (m.role !== "user" && m.role !== "assistant")
    ) {
      throw new TutorRequestInvalido("mensagem com formato inválido");
    }
  }

  if (d.image) {
    if (!TUTOR_IMAGE_TYPES_PERMITIDOS.has(d.image.mediaType)) {
      throw new TutorRequestInvalido(`tipo de imagem não suportado: "${d.image.mediaType}"`);
    }
    if (typeof d.image.data !== "string" || d.image.data.length === 0) {
      throw new TutorRequestInvalido("imagem sem dados");
    }
    if (tamanhoBase64EmBytes(d.image.data) > TUTOR_IMAGEM_MAX_BYTES) {
      throw new TutorRequestInvalido("imagem maior que 5 MiB");
    }
  }

  if (typeof d.context !== "object" || d.context === null) {
    throw new TutorRequestInvalido("contexto ausente");
  }

  return data as TutorRequest;
}

/**
 * Toda a lógica do tutor, separada da server function para poder ser exercitada
 * fora do transporte (o RPC do TanStack serializa com seroval, o que torna a
 * server function impossível de chamar direto num teste).
 */
export async function generateTutorReply(req: TutorRequest): Promise<TutorReply> {
  const { messages, context, image } = req;
  const lastUserPrompt = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const fail = () => ({ text: localFallback(lastUserPrompt, context.focus), fallback: true });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fail();

  const chatMessages: Array<{ role: string; content: ChatContent }> = [
    { role: "system", content: buildSystemPrompt(context) },
    ...messages.map((m, i) => {
      // A foto acompanha só a última mensagem do aluno.
      if (i === messages.length - 1 && m.role === "user" && image) {
        return {
          role: "user",
          content: [
            { type: "text", text: m.content },
            {
              type: "image_url",
              image_url: { url: `data:${image.mediaType};base64,${image.data}` },
            },
          ] as Array<Record<string, unknown>>,
        };
      }
      return { role: m.role, content: m.content as ChatContent };
    }),
  ];

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatMessages,
        max_completion_tokens: MAX_TOKENS,
      }),
      signal: abort.signal,
    });

    if (!response.ok) {
      // Não logamos o corpo inteiro: ele pode ecoar trechos do payload.
      console.error(`[tutor] OpenAI respondeu ${response.status}`);
      return fail();
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null }; finish_reason?: string }>;
    };

    const text = json.choices?.[0]?.message?.content?.trim();
    return text ? { text, fallback: false } : fail();
  } catch (error) {
    const motivo = error instanceof Error && error.name === "AbortError" ? "timeout" : error;
    console.error("[tutor] chamada à OpenAI falhou:", motivo);
    return fail();
  } finally {
    clearTimeout(timer);
  }
}
