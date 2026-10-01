/**
 * Uma resposta da Foca IA, do pedido validado à resposta (spec 48 F2; 46 §E.7, T-08.1…T-08.5).
 *
 * Ordem: modo de demonstração → sessão → idade e consentimento → tutor desligado → foto → salvaguardas →
 * sem chave (local) → cota e teto → contexto → IA → custo. Só números vão para o log (D-13: o conteúdo da conversa
 * não é guardado).
 *
 * A Foca IA continua só sob demanda (regra dura 7): esta função só roda quando o aluno envia uma mensagem.
 */
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { COPY } from "@/lib/copy";
import { idadePeloAno } from "@/lib/legal";
import { mensagensParaEnviar, type PedidoTutor, type RespostaTutor } from "@/lib/tutor-contrato";
import { buildSystemPrompt, localFallback } from "@/lib/tutor-prompt";
import type { Banco } from "../db/client";
import { auditEvent, consent, profile } from "../db/schema";
import type { Env } from "../env";
import { ErroApp, log, type Sessao } from "../http";
import { limitar } from "../limite";
import { cotaDisponivel, custoMicros, devolverMensagem, diaDaCota, registrarCusto, registrarCustoGlobal, reservarMensagem } from "./cota";
import { focoDoPedido, montarContexto } from "./contexto";
import { chamarIA } from "./ia";
import { validarFoto } from "./imagem";
import { moderar, sinalLocalDeAutolesao } from "./moderacao";

export const FINALIDADE_CONSENTIMENTO_TUTOR = "responsavel_foca_ia";

/** Texto do protocolo de autocuidado (46 §E.7.5): o mesmo do app (`COPY.tutor.autocuidado`). Não passa pela IA. */
export const TEXTO_AUTOCUIDADO = COPY.tutor.autocuidado;

export interface Dependencias {
  env: Pick<
    Env,
    | "contasAtivas"
    | "TUTOR_IDADE_SEM_CONSENTIMENTO"
    | "AI_COTA_GRATIS_MENSAGENS"
    | "AI_COTA_PRO_MENSAGENS"
    | "AI_COTA_PRO_FOTOS"
    | "AI_TETO_DIARIO_USD"
    | "AI_PRECO_ENTRADA_USD_MTOK"
    | "AI_PRECO_SAIDA_USD_MTOK"
  >;
  /** Sessão já resolvida (`null` = sem sessão). */
  sessao: Sessao | null;
  /** Banco, quando as contas estão ligadas. */
  db: Banco | null;
  agora: Date;
  /** Há chave da OpenAI configurada? */
  temChave: boolean;
}

async function respostaLocal(pedido: PedidoTutor): Promise<RespostaTutor> {
  const ultima = pedido.mensagens[pedido.mensagens.length - 1]?.content ?? "";
  const foco = await focoDoPedido(pedido.foco).catch(() => null);
  return { ok: true, tipo: "local", texto: localFallback(ultima, foco), restantes: null };
}

async function temConsentimento(db: Banco, userId: string): Promise<boolean> {
  const [c] = await db
    .select({ id: consent.id })
    .from(consent)
    .where(and(eq(consent.userId, userId), eq(consent.purpose, FINALIDADE_CONSENTIMENTO_TUTOR), isNotNull(consent.grantedAt), isNull(consent.revokedAt)))
    .limit(1);
  return !!c;
}

async function auditar(db: Banco, userId: string, tipo: string): Promise<void> {
  await db.insert(auditEvent).values({ id: randomUUID(), userId, type: tipo }).catch(() => {});
}

/** Estimativa conservadora de tokens quando a API não devolve o `usage` (timeout, rede, erro). */
function estimativaDeUso(sistema: string, pedido: PedidoTutor): { entrada: number; saida: number } {
  const caracteres = sistema.length + pedido.mensagens.reduce((n, m) => n + m.content.length, 0);
  return { entrada: Math.ceil(caracteres / 3) + (pedido.foto ? 1500 : 0), saida: 600 };
}

/** Devoluções de cota por falha técnica, por aluno e por dia: acima disso a falha conta como uso (revisão L2). */
const DEVOLUCOES_POR_DIA = 3;

export async function responderTutor(dep: Dependencias, entrada: PedidoTutor): Promise<RespostaTutor> {
  const inicio = Date.now();
  // O servidor também apara (o cliente já manda no máximo 20, e o zod recusa mais).
  const pedido: PedidoTutor = { ...entrada, mensagens: mensagensParaEnviar(entrada.mensagens) };
  const ultima = pedido.mensagens[pedido.mensagens.length - 1].content;

  // Autocuidado vale em qualquer modo, inclusive no de demonstração e sem sessão (46 §E.7.5): sinal local, sem rede.
  if (sinalLocalDeAutolesao(ultima)) {
    log("aviso", "tutor.autocuidado", { categorias: "local:autolesao" });
    if (dep.db && dep.sessao) await auditar(dep.db, dep.sessao.userId, "ia_autocuidado");
    return { ok: false, tipo: "autocuidado", texto: TEXTO_AUTOCUIDADO };
  }

  // Modo de demonstração (D-15): sem contas, sem custo — resposta local, como antes.
  if (!dep.env.contasAtivas || !dep.db) return respostaLocal(pedido);
  if (!dep.sessao) return { ok: false, tipo: "sem-sessao" };
  const db = dep.db;
  const userId = dep.sessao.userId;

  // Idade e consentimento (D-08; contrato da OpenAI §3.3(c)). Sem ano conhecido, trata como menor (conservador).
  const idade = dep.sessao.anoNascimento ? idadePeloAno(dep.sessao.anoNascimento, dep.agora) : 0;
  if (idade < dep.env.TUTOR_IDADE_SEM_CONSENTIMENTO && !(await temConsentimento(db, userId))) {
    return { ok: false, tipo: "consentimento" };
  }

  const [p] = await db.select({ desligado: profile.tutorDesligado }).from(profile).where(eq(profile.userId, userId)).limit(1);
  if (p?.desligado) return { ok: false, tipo: "desligado" };

  const foto = pedido.foto ? validarFoto(pedido.foto) : null;
  if (pedido.foto && !foto) return { ok: false, tipo: "foto-invalida" };

  // Sem chave: fallback local, sem gastar cota (46 §E.7.1).
  if (!dep.temChave) return respostaLocal(pedido);

  // Cota esgotada responde antes da moderação externa (não gasta chamada à OpenAI com quem não vai ser atendido).
  if (!(await cotaDisponivel(db, userId, !!foto, dep.agora, dep.env))) {
    await auditar(db, userId, "ia_cota_excedida");
    return { ok: false, tipo: "limite" };
  }

  const mod = await moderar({ texto: ultima, foto });
  if (mod.autolesao) {
    log("aviso", "tutor.autocuidado", { categorias: mod.categorias.join(",") });
    await auditar(db, userId, "ia_autocuidado");
    return { ok: false, tipo: "autocuidado", texto: TEXTO_AUTOCUIDADO };
  }
  if (mod.sinalizado) {
    log("aviso", "tutor.recusado", { categorias: mod.categorias.join(",") });
    return { ok: false, tipo: "recusado" };
  }

  let restantes: number;
  try {
    ({ restantes } = await reservarMensagem(db, userId, !!foto, dep.agora, dep.env));
  } catch (e) {
    if (e instanceof ErroApp && e.codigo === "COTA_ESGOTADA") {
      await auditar(db, userId, "ia_cota_excedida");
      return { ok: false, tipo: "limite" };
    }
    if (e instanceof ErroApp && e.codigo === "TETO_GLOBAL") {
      log("aviso", "tutor.teto_global", {});
      return { ok: false, tipo: "indisponivel" };
    }
    throw e;
  }

  const preco = { entrada: dep.env.AI_PRECO_ENTRADA_USD_MTOK, saida: dep.env.AI_PRECO_SAIDA_USD_MTOK };
  let sistema = "";
  let ia: Awaited<ReturnType<typeof chamarIA>>;
  try {
    const ctx = await montarContexto(db, userId, pedido, dep.agora, diaDaCota(dep.agora));
    sistema = buildSystemPrompt(ctx);
    ia = await chamarIA({ sistema, mensagens: pedido.mensagens, foto: foto ? { tipo: foto.tipo, base64: foto.base64 } : null });
  } catch (e) {
    // Erro nosso antes de a IA responder: a mensagem volta para a cota.
    await devolverMensagem(db, userId, !!foto, dep.agora).catch(() => {});
    throw e;
  }

  if (ia?.texto) {
    const micros = custoMicros(ia.usage ?? { entrada: 0, saida: 0 }, preco);
    await registrarCusto(db, userId, dep.agora, ia.usage ?? { entrada: 0, saida: 0 }, micros);
    log("info", "tutor.resposta", { ms: Date.now() - inicio, entrada: ia.usage?.entrada ?? 0, saida: ia.usage?.saida ?? 0, micros, foto: !!foto });
    return { ok: true, tipo: "ia", texto: ia.texto, restantes };
  }

  // Falha técnica. O custo entra no teto global (real, se a API devolveu o uso; senão uma estimativa conservadora).
  const usage = ia?.usage ?? estimativaDeUso(sistema, pedido);
  const micros = custoMicros(usage, preco);
  log("aviso", "tutor.falha_ia", { ms: Date.now() - inicio, motivo: ia?.motivo ?? "desconhecido", micros });
  let devolveu = false;
  if (ia?.usage) {
    // A API cobrou (resposta vazia): conta como uso do aluno e do teto.
    await registrarCusto(db, userId, dep.agora, usage, micros);
  } else {
    await registrarCustoGlobal(db, dep.agora, micros);
    try {
      await limitar(db, `tutor-devolucao:${userId}`, 86_400, DEVOLUCOES_POR_DIA);
      await devolverMensagem(db, userId, !!foto, dep.agora);
      devolveu = true;
    } catch {
      /* passou do teto de devoluções do dia: a falha conta como uso */
    }
  }
  const local = await respostaLocal(pedido);
  return local.ok ? { ...local, restantes: devolveu ? restantes + 1 : restantes } : local;
}
