/**
 * Corretor e treino de redação no servidor (spec 49 §5.9, T-49.9.7 e T-49.9.8). Só Pro, decidido aqui (D49-01).
 *
 * - Corretor: 10 por mês (catálogo), reservadas numa transação com o perfil travado; sem chave da IA, fica
 *   indisponível (nunca nota inventada). Desligado fora do ambiente local até a rubrica ser revisada (B-040).
 * - Treino por partes: cada parte comentada gasta 1 mensagem da cota da Foca IA; sem chave, comentário automático
 *   (checagem simples), que não gasta cota.
 * - As mesmas portas do tutor: idade/consentimento, Foca IA desligada pelo aluno, moderação, teto global de custo.
 * - O texto fica guardado para o aluno rever e pode ser apagado por ele (privacidade.md, linha "Redação").
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { COPY } from "@/lib/copy";
import { idadePeloAno } from "@/lib/legal";
import { BENEFICIOS } from "@/lib/planos";
import {
  SISTEMA_CORRETOR,
  VERSAO_RUBRICA,
  comentarioLocal,
  lerCorrecao,
  mensagemDoCorretor,
  segundaDaSemana,
  sistemaDoTreino,
  temaDaSemana,
  type Correcao,
  type ParteDoTreino,
} from "@/lib/redacao-ia";
import type { JsonObjeto } from "@/lib/json";
import type { Banco } from "../db/client";
import { profile, redacao, user } from "../db/schema";
import { env } from "../env";
import { ErroApp, log } from "../http";
import { alunoTemFuncao, funcaoLigada } from "../planos/funcoes";
import { planoDoAluno } from "../planos/plano";
import { custoMicros, devolverMensagem, diaDaCota, registrarCusto, registrarCustoGlobal, reservarMensagem, tetoEstourado } from "../tutor/cota";
import { chamarIA } from "../tutor/ia";
import { moderar } from "../tutor/moderacao";
import { temConsentimento } from "../tutor/responder";

export type Bloqueio = "fechado" | "desligado-servidor" | "consentimento" | "ia-desligada" | "indisponivel";

/** Início do mês corrente em São Paulo (UTC−3 fixo desde 2019). */
export function inicioDoMes(agora: Date): Date {
  const [a, m] = diaDaCota(agora).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, 1, 3, 0, 0));
}

async function portasDaIA(db: Banco, userId: string, agora: Date): Promise<Bloqueio | null> {
  const e = env();
  const [u] = await db.select({ ano: user.birthYear }).from(user).where(eq(user.id, userId)).limit(1);
  const idade = u?.ano ? idadePeloAno(u.ano, agora) : 0;
  if (idade < e.TUTOR_IDADE_SEM_CONSENTIMENTO && !(await temConsentimento(db, userId))) return "consentimento";
  const [p] = await db.select({ desligado: profile.tutorDesligado }).from(profile).where(eq(profile.userId, userId)).limit(1);
  if (p?.desligado) return "ia-desligada";
  return null;
}

function temChave(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

/* ------------------------------------------------------------------------- corretor --- */

export interface ResumoCorrecao {
  id: string;
  tema: string;
  criadaEm: string;
  total: number | null;
}

export interface EstadoDoCorretor {
  bloqueio: Bloqueio | null;
  restantesMes: number;
  historico: ResumoCorrecao[];
}

async function usadasNoMes(db: Pick<Banco, "select">, userId: string, agora: Date): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "correcao"), gte(redacao.criadaEm, inicioDoMes(agora))));
  return r?.n ?? 0;
}

export async function estadoDoCorretor(db: Banco, userId: string, agora: Date): Promise<EstadoDoCorretor> {
  const linhas = await db
    .select({ id: redacao.id, tema: redacao.tema, criadaEm: redacao.criadaEm, resultado: redacao.resultado })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "correcao"), ne(redacao.texto, "")))
    .orderBy(desc(redacao.criadaEm))
    .limit(20);
  const historico = linhas.map((l) => ({
    id: l.id,
    tema: l.tema,
    criadaEm: l.criadaEm.toISOString(),
    total: typeof (l.resultado as { total?: unknown } | null)?.total === "number" ? (l.resultado as { total: number }).total : null,
  }));
  const plano = await planoDoAluno(db, userId, agora);
  const limite = BENEFICIOS[plano].correcoesRedacaoMes;
  let bloqueio: Bloqueio | null = null;
  if (!(await alunoTemFuncao(db, userId, "corretorRedacao", agora))) {
    bloqueio = funcaoLigada("corretorRedacao") ? "fechado" : "desligado-servidor";
  } else {
    bloqueio = (await portasDaIA(db, userId, agora)) ?? (temChave() ? null : "indisponivel");
  }
  return { bloqueio, restantesMes: Math.max(0, limite - (await usadasNoMes(db, userId, agora))), historico };
}

export type ResultadoCorrecao =
  | { ok: true; id: string; correcao: Correcao }
  | { ok: false; motivo: Bloqueio | "limite" | "recusado" | "autocuidado" | "falha"; texto?: string };

export async function corrigirRedacao(db: Banco, userId: string, entrada: { tema: string; texto: string }, agora: Date): Promise<ResultadoCorrecao> {
  if (!(await alunoTemFuncao(db, userId, "corretorRedacao", agora))) {
    return { ok: false, motivo: funcaoLigada("corretorRedacao") ? "fechado" : "desligado-servidor" };
  }
  const porta = await portasDaIA(db, userId, agora);
  if (porta) return { ok: false, motivo: porta };
  if (!temChave()) return { ok: false, motivo: "indisponivel" };
  if (await tetoEstourado(db, diaDaCota(agora), true, env())) return { ok: false, motivo: "indisponivel" };

  const mod = await moderar({ texto: entrada.texto });
  if (mod.autolesao) return { ok: false, motivo: "autocuidado", texto: COPY.tutor.autocuidado };
  if (mod.sinalizado) return { ok: false, motivo: "recusado" };

  // Reserva: a linha nasce sem resultado, dentro da trava do perfil (duas abas não passam do limite do mês).
  const id = randomUUID();
  const limite = BENEFICIOS[await planoDoAluno(db, userId, agora)].correcoesRedacaoMes;
  try {
    await db.transaction(async (tx) => {
      await tx.insert(profile).values({ userId }).onConflictDoNothing();
      await tx.select({ userId: profile.userId }).from(profile).where(eq(profile.userId, userId)).for("update");
      if ((await usadasNoMes(tx, userId, agora)) >= limite) throw new ErroApp(429, "LIMITE_CORRECOES");
      await tx.insert(redacao).values({ id, userId, tipo: "correcao", tema: entrada.tema, texto: entrada.texto, versaoRubrica: VERSAO_RUBRICA, criadaEm: agora });
    });
  } catch (e) {
    if (e instanceof ErroApp && e.codigo === "LIMITE_CORRECOES") return { ok: false, motivo: "limite" };
    throw e;
  }

  const preco = { entrada: env().AI_PRECO_ENTRADA_USD_MTOK, saida: env().AI_PRECO_SAIDA_USD_MTOK };
  const ia = await chamarIA({
    sistema: SISTEMA_CORRETOR,
    mensagens: [{ role: "user", content: mensagemDoCorretor(entrada.tema, entrada.texto) }],
    foto: null,
    maxTokens: 1800,
    timeoutMs: 45_000,
  }).catch(() => null);
  const usage = ia?.usage ?? null;
  if (usage) await registrarCustoGlobal(db, agora, custoMicros(usage, preco), true);
  const correcao = ia?.texto ? lerCorrecao(ia.texto, entrada.texto) : null;
  if (!correcao) {
    // Falha técnica ou resposta fora do formato: a correção volta para o mês do aluno.
    await db.delete(redacao).where(and(eq(redacao.id, id), eq(redacao.userId, userId)));
    log("aviso", "redacao.falha_ia", { motivo: ia?.motivo ?? (ia?.texto ? "formato" : "desconhecido") });
    return { ok: false, motivo: "falha" };
  }
  await db
    .update(redacao)
    .set({ resultado: correcao as unknown as JsonObjeto })
    .where(and(eq(redacao.id, id), eq(redacao.userId, userId)));
  log("info", "redacao.correcao", { total: correcao.total });
  return { ok: true, id, correcao };
}

export async function verCorrecao(db: Banco, userId: string, id: string): Promise<{ tema: string; texto: string; correcao: Correcao | null; criadaEm: string } | null> {
  const [l] = await db
    .select()
    .from(redacao)
    .where(and(eq(redacao.id, id), eq(redacao.userId, userId), eq(redacao.tipo, "correcao"), ne(redacao.texto, "")))
    .limit(1);
  if (!l) return null;
  return { tema: l.tema, texto: l.texto, correcao: (l.resultado as unknown as Correcao | null) ?? null, criadaEm: l.criadaEm.toISOString() };
}

/**
 * Apaga um texto do próprio aluno. Correção: tema, texto e resultado somem, mas a linha fica (vazia) para continuar
 * contando no mês — senão apagar e corrigir de novo furaria o limite. Parte do treino: a linha sai.
 */
export async function apagarRedacao(db: Banco, userId: string, id: string): Promise<boolean> {
  const doAluno = and(eq(redacao.id, id), eq(redacao.userId, userId));
  const vazia = await db
    .update(redacao)
    .set({ tema: "", texto: "", resultado: null })
    .where(and(doAluno, eq(redacao.tipo, "correcao"), ne(redacao.texto, "")))
    .returning({ id: redacao.id });
  if (vazia.length) return true;
  const r = await db.delete(redacao).where(and(doAluno, eq(redacao.tipo, "treino"))).returning({ id: redacao.id });
  return r.length > 0;
}

/* ---------------------------------------------------------------- treino por partes --- */

export interface ParteFeita {
  id: string;
  parte: ParteDoTreino;
  texto: string;
  comentario: string;
  automatico: boolean;
}

export interface EstadoDoTreino {
  bloqueio: Bloqueio | null;
  tema: string;
  semana: string;
  automatico: boolean;
  partes: ParteFeita[];
}

function lerParte(l: { id: string; texto: string; resultado: unknown }): ParteFeita | null {
  const r = l.resultado as { parte?: ParteDoTreino; comentario?: string; automatico?: boolean } | null;
  if (!r?.parte || !r.comentario) return null;
  return { id: l.id, parte: r.parte, texto: l.texto, comentario: r.comentario, automatico: !!r.automatico };
}

export async function estadoDoTreino(db: Banco, userId: string, agora: Date): Promise<EstadoDoTreino> {
  const hoje = diaDaCota(agora);
  const semana = segundaDaSemana(hoje);
  const tema = temaDaSemana(hoje);
  let bloqueio: Bloqueio | null = null;
  if (!(await alunoTemFuncao(db, userId, "treinoRedacao", agora))) {
    bloqueio = funcaoLigada("treinoRedacao") ? "fechado" : "desligado-servidor";
  } else {
    bloqueio = await portasDaIA(db, userId, agora);
  }
  const desde = new Date(Date.parse(`${semana}T03:00:00Z`));
  const linhas = await db
    .select({ id: redacao.id, texto: redacao.texto, resultado: redacao.resultado })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "treino"), eq(redacao.tema, tema), gte(redacao.criadaEm, desde)))
    .orderBy(desc(redacao.criadaEm));
  // A última versão de cada parte vale.
  const porParte = new Map<ParteDoTreino, ParteFeita>();
  for (const l of linhas) {
    const p = lerParte(l);
    if (p && !porParte.has(p.parte)) porParte.set(p.parte, p);
  }
  return { bloqueio, tema, semana, automatico: !temChave(), partes: [...porParte.values()] };
}

export type ResultadoParte =
  | { ok: true; parte: ParteFeita }
  | { ok: false; motivo: Bloqueio | "limite" | "recusado" | "autocuidado"; texto?: string };

export async function comentarParte(db: Banco, userId: string, entrada: { parte: ParteDoTreino; texto: string }, agora: Date): Promise<ResultadoParte> {
  if (!(await alunoTemFuncao(db, userId, "treinoRedacao", agora))) {
    return { ok: false, motivo: funcaoLigada("treinoRedacao") ? "fechado" : "desligado-servidor" };
  }
  const porta = await portasDaIA(db, userId, agora);
  if (porta) return { ok: false, motivo: porta };
  const tema = temaDaSemana(diaDaCota(agora));

  const mod = await moderar({ texto: entrada.texto });
  if (mod.autolesao) return { ok: false, motivo: "autocuidado", texto: COPY.tutor.autocuidado };
  if (mod.sinalizado) return { ok: false, motivo: "recusado" };

  let comentario = comentarioLocal(entrada.parte, entrada.texto);
  let automatico = true;
  if (temChave()) {
    let pago = true;
    try {
      ({ pago } = await reservarMensagem(db, userId, false, agora, env()));
    } catch (e) {
      if (e instanceof ErroApp && e.codigo === "COTA_ESGOTADA") return { ok: false, motivo: "limite" };
      if (e instanceof ErroApp && e.codigo === "TETO_GLOBAL") return { ok: false, motivo: "indisponivel" };
      throw e;
    }
    const ia = await chamarIA({ sistema: sistemaDoTreino(entrada.parte, tema), mensagens: [{ role: "user", content: entrada.texto }], foto: null }).catch(
      () => null,
    );
    const preco = { entrada: env().AI_PRECO_ENTRADA_USD_MTOK, saida: env().AI_PRECO_SAIDA_USD_MTOK };
    if (ia?.texto) {
      const usage = ia.usage ?? { entrada: 0, saida: 0 };
      await registrarCusto(db, userId, agora, usage, custoMicros(usage, preco), pago);
      comentario = ia.texto;
      automatico = false;
    } else {
      // Falha técnica: devolve a mensagem e fica o comentário automático.
      if (ia?.usage) await registrarCustoGlobal(db, agora, custoMicros(ia.usage, preco), pago);
      await devolverMensagem(db, userId, false, agora);
    }
  }
  const id = randomUUID();
  // Reescrever substitui: só a última versão de cada parte do tema fica guardada (menos texto pessoal retido).
  await db
    .delete(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "treino"), eq(redacao.tema, tema), sql`${redacao.resultado}->>'parte' = ${entrada.parte}`));
  await db.insert(redacao).values({
    id,
    userId,
    tipo: "treino",
    tema,
    texto: entrada.texto,
    resultado: { parte: entrada.parte, comentario, automatico },
    criadaEm: agora,
  });
  return { ok: true, parte: { id, parte: entrada.parte, texto: entrada.texto, comentario, automatico } };
}
