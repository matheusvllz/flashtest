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
 * Usamos `fetch` direto em vez do SDK oficial de propósito: a API de chat é uma
 * única chamada HTTP feita por uma função de servidor (Nitro na Vercel), e uma
 * dependência a mais não compensa.
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

/**
 * Limites do `pedagogy` (docs/30 §17.3, Fase 7 F7.5) — construído no client
 * (`tutor-context.ts`) e enviado por RPC, então é payload de cliente como
 * qualquer outro: nunca confiar no cast TS, validar tamanho/forma de verdade
 * antes de embutir no prompt. Tetos generosos (folga sobre os limites que o
 * PRÓPRIO `buildPedagogicalContext` já aplica — 2 erros, 3 pré-requisitos),
 * só pra travar um payload malformado ou hostil, não o uso normal.
 */
const TUTOR_PEDAGOGY_MAX_STRING = 500;
const TUTOR_PEDAGOGY_MAX_RECENT_ERRORS = 5;
const TUTOR_PEDAGOGY_MAX_WEAK_PREREQUISITES = 10;
/** Teto do payload serializado (docs/30 §17.3) — checado ANTES de validar campo a campo, defesa em profundidade sobre os tetos por campo acima. */
const TUTOR_PEDAGOGY_MAX_SERIALIZED = 2000;
const CONFIDENCE_LABELS = new Set(["ainda medindo", "pouca evidência", "evidência razoável", "boa evidência"]);
const EXPLANATION_SEEN_VALUES = new Set(["nenhuma", "curta", "detalhada"]);
const PEDAGOGY_MODES = new Set(["ensinar-do-zero", "duvida"]);

function stringValida(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length <= max;
}

function validatePedagogy(pedagogy: unknown): void {
  if (pedagogy === null || pedagogy === undefined) return;
  if (typeof pedagogy !== "object") throw new TutorRequestInvalido("pedagogy com formato inválido");
  // JSON.stringify antes de validar campo a campo: barato e recusa um payload
  // hostil (ex.: muitos campos extras não declarados no tipo) antes de gastar
  // tempo nas checagens finas abaixo.
  let serializado: string;
  try {
    serializado = JSON.stringify(pedagogy);
  } catch {
    throw new TutorRequestInvalido("pedagogy não serializável");
  }
  if (serializado.length > TUTOR_PEDAGOGY_MAX_SERIALIZED) {
    throw new TutorRequestInvalido(`pedagogy maior que o limite de ${TUTOR_PEDAGOGY_MAX_SERIALIZED} caracteres`);
  }
  const p = pedagogy as Record<string, unknown>;

  if (!stringValida(p.skillId, TUTOR_PEDAGOGY_MAX_STRING)) throw new TutorRequestInvalido("pedagogy.skillId inválido");
  if (!stringValida(p.skillName, TUTOR_PEDAGOGY_MAX_STRING)) throw new TutorRequestInvalido("pedagogy.skillName inválido");
  if (!stringValida(p.subjectName, TUTOR_PEDAGOGY_MAX_STRING)) throw new TutorRequestInvalido("pedagogy.subjectName inválido");
  if (!stringValida(p.topicName, TUTOR_PEDAGOGY_MAX_STRING)) throw new TutorRequestInvalido("pedagogy.topicName inválido");
  if (p.mastery !== null && (typeof p.mastery !== "number" || p.mastery < 0 || p.mastery > 100)) {
    throw new TutorRequestInvalido("pedagogy.mastery inválido");
  }
  if (typeof p.confidenceLabel !== "string" || !CONFIDENCE_LABELS.has(p.confidenceLabel)) {
    throw new TutorRequestInvalido("pedagogy.confidenceLabel inválido");
  }
  if (!Array.isArray(p.recentErrors) || p.recentErrors.length > TUTOR_PEDAGOGY_MAX_RECENT_ERRORS) {
    throw new TutorRequestInvalido("pedagogy.recentErrors inválido");
  }
  for (const erro of p.recentErrors) {
    if (typeof erro !== "object" || erro === null) throw new TutorRequestInvalido("pedagogy.recentErrors com item inválido");
    const e = erro as Record<string, unknown>;
    if (!stringValida(e.statement, TUTOR_PEDAGOGY_MAX_STRING)) throw new TutorRequestInvalido("pedagogy.recentErrors[].statement inválido");
    if (e.chosen !== null && !stringValida(e.chosen, TUTOR_PEDAGOGY_MAX_STRING)) {
      throw new TutorRequestInvalido("pedagogy.recentErrors[].chosen inválido");
    }
    if (!stringValida(e.correct, TUTOR_PEDAGOGY_MAX_STRING)) throw new TutorRequestInvalido("pedagogy.recentErrors[].correct inválido");
  }
  if (typeof p.dontKnowRecent !== "number" || p.dontKnowRecent < 0) {
    throw new TutorRequestInvalido("pedagogy.dontKnowRecent inválido");
  }
  if (typeof p.explanationSeen !== "string" || !EXPLANATION_SEEN_VALUES.has(p.explanationSeen)) {
    throw new TutorRequestInvalido("pedagogy.explanationSeen inválido");
  }
  if (
    !Array.isArray(p.weakPrerequisites) ||
    p.weakPrerequisites.length > TUTOR_PEDAGOGY_MAX_WEAK_PREREQUISITES ||
    !p.weakPrerequisites.every((w) => stringValida(w, TUTOR_PEDAGOGY_MAX_STRING))
  ) {
    throw new TutorRequestInvalido("pedagogy.weakPrerequisites inválido");
  }
  if (p.examName !== null && !stringValida(p.examName, TUTOR_PEDAGOGY_MAX_STRING)) {
    throw new TutorRequestInvalido("pedagogy.examName inválido");
  }
  if (typeof p.mode !== "string" || !PEDAGOGY_MODES.has(p.mode)) {
    throw new TutorRequestInvalido("pedagogy.mode inválido");
  }
}

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
  validatePedagogy((d.context as { pedagogy?: unknown }).pedagogy);

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
