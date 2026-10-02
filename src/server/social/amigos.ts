/**
 * Ofensiva com amigos (spec 50 §5.6, D50-06, T-50.14.2; segurança L2). Só maiores de 18 nos dois lados, com apelido
 * social (o mesmo da liga, `ranking_participante`). Sem chat, sem perfil, sem foto, sem contato: cada um vê só o
 * apelido do outro, os dias da dupla, o recorde e se cada um já estudou hoje.
 *
 * - Toda função recebe o `userId` da sessão; o navegador nunca manda id de aluno (só o código do convite, o id da
 *   dupla ou a `ref` opaca do bloqueio, sempre conferidos contra o próprio aluno).
 * - Convite: 128 bits aleatórios em base64url; guardado só o SHA-256; uso único; 72 h; até 10 abertos e 10 por dia.
 *   Quem não pode aceitar (bloqueado, convite inválido, vencido, usado ou de conta que deixou de ser elegível) recebe
 *   a MESMA resposta genérica, sem nada de quem convidou. Menor recebe `MENOR_DE_IDADE` em toda função.
 * - Filtro de idade e de suspensão em toda leitura: o outro lado que virou menor ou foi suspenso some da lista.
 */
import { and, count, eq, gt, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  CODIGO_DO_CONVITE,
  MAX_CONVITES_ABERTOS,
  MAX_CONVITES_POR_DIA,
  MAX_DUPLAS_ATIVAS,
  VALIDADE_DO_CONVITE_MS,
  diasCobertos,
  diasPendentesDeProtetor,
  ofensivaDaDupla,
} from "@/lib/amigos";
import { adultoPeloCadastro, elegibilidade } from "@/lib/ranking";
import type { Banco } from "../db/client";
import {
  amizade,
  bloqueio,
  conviteAmizade,
  profile,
  rankingParticipante,
  studyDay,
  user,
} from "../db/schema";
import { env } from "../env";
import { dataNoFuso } from "../estudo/sincronizar";
import { historicoDoAluno } from "../gamificacao/ofensiva";
import { ErroApp } from "../http";
import { ehLocal } from "../pagamentos/provedor";

const DIA_MS = 86_400_000;
/** Por quanto tempo o outro lado vê "Essa ofensiva em dupla foi encerrada.". */
const AVISO_DE_ENCERRADA_MS = 7 * DIA_MS;

/** Ligado? Implantado: `AMIGOS_HABILITADO`. Local (dev, testes e E2E): ligado, salvo `AMIGOS_HABILITADO=false`. */
export function amigosLigado(): boolean {
  const e = env();
  return e.AMIGOS_HABILITADO === true || (ehLocal(e) && e.AMIGOS_HABILITADO !== false);
}

export function hashDoCodigo(codigo: string): string {
  return createHash("sha256").update(codigo).digest("hex");
}

/* ------------------------------------------------------------------ elegibilidade --- */

type Identidade =
  | { tipo: "ok"; apelido: string }
  | { tipo: "sem-apelido"; confirmarNascimento: boolean };

/** Flag, idade (pelo cadastro atual) e suspensão. Menor → `MENOR_DE_IDADE`; suspenso → `SOCIAL_SUSPENSO`. */
async function identidadeSocial(db: Banco, userId: string, agora: Date): Promise<Identidade> {
  if (!amigosLigado()) throw new ErroApp(409, "AMIGOS_DESLIGADO");
  const [u] = await db
    .select({ ano: user.birthYear })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const [p] = await db
    .select()
    .from(rankingParticipante)
    .where(eq(rankingParticipante.userId, userId))
    .limit(1);
  const e = elegibilidade(u?.ano ?? null, agora);
  if (e === "menor") throw new ErroApp(403, "MENOR_DE_IDADE");
  if (p?.socialSuspensoEm) throw new ErroApp(403, "SOCIAL_SUSPENSO");
  if (e === "confirmar" && !(p && adultoPeloCadastro(u?.ano ?? null, p.maiorDesde, agora)))
    return { tipo: "sem-apelido", confirmarNascimento: true };
  if (!p) return { tipo: "sem-apelido", confirmarNascimento: false };
  return { tipo: "ok", apelido: p.apelido };
}

async function exigirIdentidade(db: Banco, userId: string, agora: Date): Promise<string> {
  const id = await identidadeSocial(db, userId, agora);
  if (id.tipo !== "ok") throw new ErroApp(409, "SEM_APELIDO");
  return id.apelido;
}

/**
 * Para sair, bloquear, desbloquear e denunciar: basta ser adulto com a função ligada. Suspenso também pode se
 * proteger (sair e bloquear nunca ficam presos).
 */
export async function exigirAdulto(db: Banco, userId: string, agora: Date): Promise<void> {
  if (!amigosLigado()) throw new ErroApp(409, "AMIGOS_DESLIGADO");
  const [u] = await db
    .select({ ano: user.birthYear })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (elegibilidade(u?.ano ?? null, agora) === "menor") throw new ErroApp(403, "MENOR_DE_IDADE");
}

/** O outro lado, como pode aparecer: adulto, não suspenso, com apelido. `null` = não aparece. */
async function outroVisivel(
  db: Banco,
  outroId: string,
  agora: Date,
): Promise<{ apelido: string } | null> {
  const [o] = await db
    .select({
      apelido: rankingParticipante.apelido,
      oculto: rankingParticipante.ocultoPorDenuncia,
      maiorDesde: rankingParticipante.maiorDesde,
      suspenso: rankingParticipante.socialSuspensoEm,
      ano: user.birthYear,
    })
    .from(rankingParticipante)
    .innerJoin(user, eq(user.id, rankingParticipante.userId))
    .where(eq(rankingParticipante.userId, outroId))
    .limit(1);
  if (!o || o.suspenso || !adultoPeloCadastro(o.ano, o.maiorDesde, agora)) return null;
  return { apelido: o.oculto ? "Apelido em revisão" : o.apelido };
}

async function haBloqueio(db: Banco, x: string, y: string): Promise<boolean> {
  const [b] = await db
    .select({ n: count() })
    .from(bloqueio)
    .where(
      or(
        and(eq(bloqueio.userId, x), eq(bloqueio.bloqueadoId, y)),
        and(eq(bloqueio.userId, y), eq(bloqueio.bloqueadoId, x)),
      ),
    );
  return Number(b?.n ?? 0) > 0;
}

async function duplasAtivas(db: Banco, userId: string): Promise<number> {
  const [r] = await db
    .select({ n: count() })
    .from(amizade)
    .where(
      and(eq(amizade.estado, "ativa"), or(eq(amizade.userA, userId), eq(amizade.userB, userId))),
    );
  return Number(r?.n ?? 0);
}

function par(x: string, y: string): [string, string] {
  return x < y ? [x, y] : [y, x];
}

async function amizadeDoPar(db: Banco, x: string, y: string) {
  const [a, b] = par(x, y);
  const [r] = await db
    .select()
    .from(amizade)
    .where(and(eq(amizade.userA, a), eq(amizade.userB, b)))
    .limit(1);
  return r ?? null;
}

/** Dupla (em qualquer estado) da qual o aluno faz parte. */
async function amizadeDoAluno(db: Banco, userId: string, id: string) {
  const [r] = await db
    .select()
    .from(amizade)
    .where(and(eq(amizade.id, id), or(eq(amizade.userA, userId), eq(amizade.userB, userId))))
    .limit(1);
  return r ?? null;
}

const outroLado = (a: { userA: string; userB: string }, userId: string) =>
  a.userA === userId ? a.userB : a.userA;

/* ------------------------------------------------------------------ convites --- */

export async function criarConvite(
  db: Banco,
  userId: string,
  agora: Date,
): Promise<{ codigo: string; expiraEm: string }> {
  await exigirIdentidade(db, userId, agora);
  const [abertos] = await db
    .select({ n: count() })
    .from(conviteAmizade)
    .where(
      and(
        eq(conviteAmizade.userId, userId),
        isNull(conviteAmizade.usadoEm),
        gt(conviteAmizade.expiraEm, agora),
      ),
    );
  if (Number(abertos?.n ?? 0) >= MAX_CONVITES_ABERTOS) throw new ErroApp(429, "LIMITE_DE_CONVITES");
  const [noDia] = await db
    .select({ n: count() })
    .from(conviteAmizade)
    .where(
      and(
        eq(conviteAmizade.userId, userId),
        gt(conviteAmizade.criadoEm, new Date(agora.getTime() - DIA_MS)),
      ),
    );
  if (Number(noDia?.n ?? 0) >= MAX_CONVITES_POR_DIA) throw new ErroApp(429, "LIMITE_DE_CONVITES");
  const codigo = randomBytes(16).toString("base64url");
  const expiraEm = new Date(agora.getTime() + VALIDADE_DO_CONVITE_MS);
  await db
    .insert(conviteAmizade)
    .values({ codigoHash: hashDoCodigo(codigo), userId, expiraEm, criadoEm: agora });
  return { codigo, expiraEm: expiraEm.toISOString() };
}

async function conviteValido(db: Banco, codigo: string, agora: Date) {
  if (!CODIGO_DO_CONVITE.test(codigo)) return null;
  const [c] = await db
    .select()
    .from(conviteAmizade)
    .where(
      and(
        eq(conviteAmizade.codigoHash, hashDoCodigo(codigo)),
        isNull(conviteAmizade.usadoEm),
        gt(conviteAmizade.expiraEm, agora),
      ),
    )
    .limit(1);
  return c ?? null;
}

export type AberturaDoConvite =
  | { estado: "disponivel"; apelido: string }
  /** Genérica: inválido, vencido, usado, bloqueado, próprio ou de conta que deixou de ser elegível. */
  | { estado: "indisponivel" }
  | { estado: "sem-apelido"; confirmarNascimento: boolean }
  | { estado: "limite" }
  | { estado: "ja-em-dupla" };

/** Quem convidou e se dá para pedir. Nada de quem convidou sai antes de todas as checagens passarem. */
async function avaliarConvite(
  db: Banco,
  userId: string,
  codigo: string,
  agora: Date,
): Promise<{ r: AberturaDoConvite; donoId?: string }> {
  const c = await conviteValido(db, codigo, agora);
  if (!c || c.userId === userId) return { r: { estado: "indisponivel" } };
  if (await haBloqueio(db, userId, c.userId)) return { r: { estado: "indisponivel" } };
  const dono = await outroVisivel(db, c.userId, agora);
  if (!dono) return { r: { estado: "indisponivel" } };
  const existente = await amizadeDoPar(db, userId, c.userId);
  if (existente?.estado === "ativa") return { r: { estado: "ja-em-dupla" } };
  if ((await duplasAtivas(db, userId)) >= MAX_DUPLAS_ATIVAS) return { r: { estado: "limite" } };
  return { r: { estado: "disponivel", apelido: dono.apelido }, donoId: c.userId };
}

export async function abrirConvite(
  db: Banco,
  userId: string,
  codigo: string,
  agora: Date,
): Promise<AberturaDoConvite> {
  const id = await identidadeSocial(db, userId, agora);
  // Sem apelido: responde antes de olhar o código (nada sobre o convite nem sobre quem convidou).
  if (id.tipo !== "ok")
    return { estado: "sem-apelido", confirmarNascimento: id.confirmarNascimento };
  return (await avaliarConvite(db, userId, codigo, agora)).r;
}

/** B pede a dupla pelo convite de A: o convite é usado e A recebe o pedido (aceite mútuo explícito). */
export async function pedirDupla(
  db: Banco,
  userId: string,
  codigo: string,
  agora: Date,
): Promise<{ ok: true }> {
  await exigirIdentidade(db, userId, agora);
  const { r, donoId } = await avaliarConvite(db, userId, codigo, agora);
  if (r.estado === "limite") throw new ErroApp(409, "LIMITE_DE_DUPLAS");
  if (r.estado === "ja-em-dupla") throw new ErroApp(409, "JA_EM_DUPLA");
  if (r.estado !== "disponivel" || !donoId) throw new ErroApp(404, "CONVITE_INDISPONIVEL");
  await db.transaction(async (tx) => {
    const usado = await tx
      .update(conviteAmizade)
      .set({ usadoEm: agora })
      .where(
        and(
          eq(conviteAmizade.codigoHash, hashDoCodigo(codigo)),
          isNull(conviteAmizade.usadoEm),
          gt(conviteAmizade.expiraEm, agora),
        ),
      )
      .returning({ h: conviteAmizade.codigoHash });
    if (!usado.length) throw new ErroApp(404, "CONVITE_INDISPONIVEL");
    const [a, b] = par(userId, donoId);
    await tx
      .insert(amizade)
      .values({
        id: randomUUID(),
        userA: a,
        userB: b,
        estado: "pedido",
        pedidaPor: userId,
        criadaEm: agora,
      })
      .onConflictDoUpdate({
        target: [amizade.userA, amizade.userB],
        // Encerrada antes: recomeça como pedido (o recorde é da dupla nova). Pedido aberto: fica como está.
        set: {
          estado: sql`case when ${amizade.estado} = 'encerrada' then 'pedido' else ${amizade.estado} end`,
          pedidaPor: sql`case when ${amizade.estado} = 'encerrada' then ${userId} else ${amizade.pedidaPor} end`,
          criadaEm: sql`case when ${amizade.estado} = 'encerrada' then ${agora.toISOString()}::timestamptz else ${amizade.criadaEm} end`,
          aceitaEm: sql`case when ${amizade.estado} = 'encerrada' then null else ${amizade.aceitaEm} end`,
          encerradaEm: sql`case when ${amizade.estado} = 'encerrada' then null else ${amizade.encerradaEm} end`,
        },
      });
  });
  return { ok: true };
}

/** Quem recebeu o pedido aceita (a dupla passa a existir) ou recusa (o pedido some, sem aviso explícito). */
export async function responderPedido(
  db: Banco,
  userId: string,
  id: string,
  aceitar: boolean,
  agora: Date,
): Promise<{ ok: true }> {
  await exigirIdentidade(db, userId, agora);
  const a = await amizadeDoAluno(db, userId, id);
  if (!a || a.estado !== "pedido" || a.pedidaPor === userId)
    throw new ErroApp(404, "PEDIDO_INEXISTENTE");
  const outro = outroLado(a, userId);
  if (!aceitar) {
    await db
      .update(amizade)
      .set({ estado: "encerrada", encerradaEm: agora })
      .where(and(eq(amizade.id, id), eq(amizade.estado, "pedido")));
    return { ok: true };
  }
  if (!(await outroVisivel(db, outro, agora)) || (await haBloqueio(db, userId, outro)))
    throw new ErroApp(404, "PEDIDO_INEXISTENTE");
  if (
    (await duplasAtivas(db, userId)) >= MAX_DUPLAS_ATIVAS ||
    (await duplasAtivas(db, outro)) >= MAX_DUPLAS_ATIVAS
  )
    throw new ErroApp(409, "LIMITE_DE_DUPLAS");
  const r = await db
    .update(amizade)
    .set({ estado: "ativa", aceitaEm: agora })
    .where(and(eq(amizade.id, id), eq(amizade.estado, "pedido")))
    .returning({ id: amizade.id });
  if (!r.length) throw new ErroApp(404, "PEDIDO_INEXISTENTE");
  return { ok: true };
}

/** Qualquer lado encerra, a qualquer momento. O outro vê só "Essa ofensiva em dupla foi encerrada.". */
export async function encerrarDupla(
  db: Banco,
  userId: string,
  id: string,
  agora: Date,
): Promise<{ ok: true }> {
  await exigirAdulto(db, userId, agora);
  const r = await db
    .update(amizade)
    .set({ estado: "encerrada", encerradaEm: agora })
    .where(
      and(
        eq(amizade.id, id),
        or(eq(amizade.userA, userId), eq(amizade.userB, userId)),
        inArray(amizade.estado, ["pedido", "ativa"]),
      ),
    )
    .returning({ id: amizade.id });
  if (!r.length) throw new ErroApp(404, "DUPLA_INEXISTENTE");
  return { ok: true };
}

/** Bloquear: encerra a dupla (ou o pedido) e impede convites e pedidos entre as duas contas, nos dois sentidos. */
export async function bloquear(
  db: Banco,
  userId: string,
  id: string,
  agora: Date,
): Promise<{ ok: true }> {
  await exigirAdulto(db, userId, agora);
  const a = await amizadeDoAluno(db, userId, id);
  if (!a) throw new ErroApp(404, "DUPLA_INEXISTENTE");
  const outro = outroLado(a, userId);
  await db
    .insert(bloqueio)
    .values({ userId, bloqueadoId: outro, ref: randomUUID(), criadoEm: agora })
    .onConflictDoNothing();
  await db
    .update(amizade)
    .set({ estado: "encerrada", encerradaEm: agora })
    .where(and(eq(amizade.id, id), ne(amizade.estado, "encerrada")));
  return { ok: true };
}

export async function desbloquear(
  db: Banco,
  userId: string,
  ref: string,
  agora: Date,
): Promise<{ ok: true }> {
  await exigirAdulto(db, userId, agora);
  await db.delete(bloqueio).where(and(eq(bloqueio.userId, userId), eq(bloqueio.ref, ref)));
  return { ok: true };
}

/* ------------------------------------------------------------------ leitura --- */

export interface DuplaVisivel {
  id: string;
  apelido: string;
  dias: number;
  recorde: number;
  voceHoje: boolean;
  outroHoje: boolean;
}

export type MinhasDuplas =
  | { estado: "desligado" }
  | { estado: "suspenso" }
  | { estado: "sem-apelido"; confirmarNascimento: boolean }
  | {
      estado: "pronto";
      apelido: string;
      duplas: DuplaVisivel[];
      recebidos: { id: string; apelido: string }[];
      enviados: { id: string; apelido: string }[];
      /** Duplas encerradas pelo outro lado (ou pelo suporte) nos últimos 7 dias: só o aviso neutro, sem apelido. */
      encerradas: { id: string }[];
      bloqueados: { ref: string; apelido: string | null }[];
      maxDuplas: number;
    };

interface EstudoDoAluno {
  fuso: string;
  hoje: string;
  estudados: Set<string>;
  cobertos: Set<string>;
}

async function estudoDoAluno(db: Banco, userId: string, agora: Date): Promise<EstudoDoAluno> {
  const [p] = await db
    .select({ tz: profile.timezone })
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);
  const fuso = p?.tz ?? "America/Sao_Paulo";
  const hoje = dataNoFuso(agora, fuso);
  const estudados = new Set(
    (
      await db
        .select({ d: studyDay.localDate })
        .from(studyDay)
        .where(and(eq(studyDay.userId, userId), gt(studyDay.blocks, 0)))
    ).map((r) => r.d),
  );
  const h = await historicoDoAluno(db, userId, agora);
  const pendentes = diasPendentesDeProtetor(h.estado.ultimoDia, hoje, h.estado.congelamentos);
  return { fuso, hoje, estudados, cobertos: diasCobertos(estudados, h.protegidos, pendentes) };
}

export async function minhasDuplas(db: Banco, userId: string, agora: Date): Promise<MinhasDuplas> {
  if (!amigosLigado()) return { estado: "desligado" };
  let id: Identidade;
  try {
    id = await identidadeSocial(db, userId, agora);
  } catch (e) {
    if (e instanceof ErroApp && e.codigo === "SOCIAL_SUSPENSO") return { estado: "suspenso" };
    throw e;
  }
  if (id.tipo !== "ok")
    return { estado: "sem-apelido", confirmarNascimento: id.confirmarNascimento };

  const linhas = await db
    .select()
    .from(amizade)
    .where(
      and(
        or(eq(amizade.userA, userId), eq(amizade.userB, userId)),
        or(
          inArray(amizade.estado, ["pedido", "ativa"]),
          and(
            eq(amizade.estado, "encerrada"),
            sql`${amizade.aceitaEm} is not null`,
            gt(amizade.encerradaEm, new Date(agora.getTime() - AVISO_DE_ENCERRADA_MS)),
          ),
        ),
      ),
    )
    .orderBy(amizade.criadaEm);
  const estudos = new Map<string, EstudoDoAluno>();
  const estudoDe = async (u: string) => {
    if (!estudos.has(u)) estudos.set(u, await estudoDoAluno(db, u, agora));
    return estudos.get(u)!;
  };

  const duplas: DuplaVisivel[] = [];
  const recebidos: { id: string; apelido: string }[] = [];
  const enviados: { id: string; apelido: string }[] = [];
  const encerradas: { id: string }[] = [];
  for (const a of linhas) {
    if (a.estado === "encerrada") {
      encerradas.push({ id: a.id });
      continue;
    }
    const outro = outroLado(a, userId);
    const vis = await outroVisivel(db, outro, agora);
    if (!vis) continue; // virou menor, foi suspenso ou saiu: some (filtro de idade em toda leitura)
    if (a.estado === "pedido") {
      (a.pedidaPor === userId ? enviados : recebidos).push({ id: a.id, apelido: vis.apelido });
      continue;
    }
    const eu = await estudoDe(userId);
    const ele = await estudoDe(outro);
    // Os dias da dupla contam a partir do aceite, no dia de quem está vendo.
    const desde = dataNoFuso(a.aceitaEm ?? a.criadaEm, eu.fuso);
    const o = ofensivaDaDupla(eu.cobertos, ele.cobertos, desde, eu.hoje);
    duplas.push({
      id: a.id,
      apelido: vis.apelido,
      dias: o.dias,
      recorde: o.recorde,
      voceHoje: eu.estudados.has(eu.hoje),
      outroHoje: ele.estudados.has(ele.hoje),
    });
  }

  const meus = await db
    .select({ ref: bloqueio.ref, alvo: bloqueio.bloqueadoId })
    .from(bloqueio)
    .where(eq(bloqueio.userId, userId));
  const bloqueados = await Promise.all(
    meus.map(async (b) => ({
      ref: b.ref,
      apelido: (await outroVisivel(db, b.alvo, agora))?.apelido ?? null,
    })),
  );
  return {
    estado: "pronto",
    apelido: id.apelido,
    duplas,
    recebidos,
    enviados,
    encerradas,
    bloqueados,
    maxDuplas: MAX_DUPLAS_ATIVAS,
  };
}
