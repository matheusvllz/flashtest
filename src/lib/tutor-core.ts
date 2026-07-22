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
