/**
 * Lembrete diário por push (spec 50 §5.2.5, D50-12; §0.3 A e C; revisão L2).
 *
 * - **Chaves VAPID** só pelas variáveis do servidor (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`). Sem as
 *   chaves, ou sem `LEMBRETES_HABILITADO`, tudo fica desligado sem erro: nada é salvo nem enviado.
 * - **Envio** (`enviarJanela`, chamado pelos 4 crons diários): para cada assinatura da janela, sem pausa, no máximo 1
 *   por dia por aparelho, só se o aluno ainda não concluiu um bloco hoje no fuso do perfil e só entre 08h e 21h no
 *   fuso dele. Depois de 7 lembretes seguidos sem estudo, pausa (`pausada_em`) até o aluno religar. 404/410 do
 *   serviço de push apagam a assinatura; outros erros contam em `falhas` e, em 5, apagam.
 * - **Endereço de push** só dos serviços conhecidos (FCM, Mozilla, Apple, Windows) e só HTTPS: o servidor faz POST
 *   nesse endereço, então endereço arbitrário seria SSRF. O endereço nunca vai para log.
 * - Texto neutro de `voz.ts` (slot `lembrete`), sem nome nem dado do aluno.
 */
import { and, asc, eq, gt, inArray, isNull, max, ne, sql } from "drizzle-orm";
import { endpointDePushValido, type JanelaDoLembrete } from "@/lib/lembretes/regras";
import { VOZ } from "@/lib/voz";
import type { Banco } from "../db/client";
import { profile, pushAssinatura, studyDay } from "../db/schema";
import { env } from "../env";
import { dataNoFuso } from "../estudo/sincronizar";

/** Lembretes seguidos sem estudo antes de pausar. */
export const PAUSA_DEPOIS_DE = 7;
/** Erros seguidos (fora 404/410) antes de apagar a assinatura. */
export const FALHAS_PARA_APAGAR = 5;
/** Aparelhos por aluno (o mais antigo sai). */
export const APARELHOS_POR_ALUNO = 10;
/** Horário permitido no fuso do aluno (R-GAM-2 item 6): das 08h até antes das 21h. */
const HORA_INICIO = 8;
const HORA_FIM = 21;
/** Validade da mensagem no serviço de push: aparelho desligado não recebe o lembrete horas depois, fora da janela. */
const TTL_SEGUNDOS = 3600;
const FUSO_PADRAO = "America/Sao_Paulo";

export interface Vapid {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export function vapid(): Vapid | null {
  const e = env();
  if (!e.VAPID_PUBLIC_KEY || !e.VAPID_PRIVATE_KEY) return null;
  return { publicKey: e.VAPID_PUBLIC_KEY, privateKey: e.VAPID_PRIVATE_KEY, subject: e.VAPID_SUBJECT ?? "https://www.focaedu.com" };
}

/** Lembrete ligado de fato: contas ativas, `LEMBRETES_HABILITADO` e as duas chaves. */
export function lembretesLigados(): boolean {
  const e = env();
  return e.contasAtivas && e.LEMBRETES_HABILITADO === true && vapid() !== null;
}

/** Chave pública para o navegador assinar (pública por natureza; vem do servidor, nunca de `VITE_*`). */
export function chavePublica(): string | null {
  return lembretesLigados() ? (vapid()?.publicKey ?? null) : null;
}

/* ---------- preferência do aluno ---------- */

export interface EstadoDoLembrete {
  /** O servidor está pronto para lembrar (variáveis e chaves). */
  disponivel: boolean;
  /** Este aparelho (pelo endereço) está assinado para este aluno. */
  ligado: boolean;
  janela: JanelaDoLembrete | null;
  /** Pausado depois de 7 lembretes sem estudo; volta ao religar. */
  pausado: boolean;
}

export async function estadoDoLembrete(db: Banco, userId: string, endpoint: string | null): Promise<EstadoDoLembrete> {
  const linhas = await db
    .select({ endpoint: pushAssinatura.endpoint, janela: pushAssinatura.janela, pausadaEm: pushAssinatura.pausadaEm })
    .from(pushAssinatura)
    .where(eq(pushAssinatura.userId, userId));
  const deste = endpoint ? linhas.find((l) => l.endpoint === endpoint) : undefined;
  return {
    disponivel: lembretesLigados(),
    ligado: !!deste,
    janela: deste?.janela ?? linhas[0]?.janela ?? null,
    pausado: !!deste?.pausadaEm,
  };
}

export interface NovaAssinatura {
  endpoint: string;
  p256dh: string;
  auth: string;
  janela: JanelaDoLembrete;
}

/**
 * Liga (ou religa, ou troca a janela de) o lembrete neste aparelho. A janela é uma preferência do aluno: vale para
 * todos os aparelhos dele, e religar tira a pausa de todos. O mesmo endereço vindo de outra conta (aparelho
 * compartilhado sem sair da conta) passa para a conta da sessão: só quem está no aparelho tem o endereço.
 */
export async function salvarAssinatura(db: Banco, userId: string, a: NovaAssinatura, agora = new Date()): Promise<EstadoDoLembrete> {
  if (!endpointDePushValido(a.endpoint)) throw new Error("endereço de push inválido");
  await db.transaction(async (tx) => {
    await tx
      .insert(pushAssinatura)
      .values({ userId, endpoint: a.endpoint, p256dh: a.p256dh, auth: a.auth, janela: a.janela, criadaEm: agora })
      .onConflictDoUpdate({
        target: pushAssinatura.endpoint,
        set: { userId, p256dh: a.p256dh, auth: a.auth, janela: a.janela, criadaEm: agora, pausadaEm: null, semEstudoSeguidos: 0, falhas: 0 },
      });
    await tx
      .update(pushAssinatura)
      .set({ janela: a.janela, pausadaEm: null, semEstudoSeguidos: 0 })
      .where(and(eq(pushAssinatura.userId, userId), ne(pushAssinatura.endpoint, a.endpoint)));
    // Teto de aparelhos: os mais antigos saem.
    const todas = await tx
      .select({ id: pushAssinatura.id })
      .from(pushAssinatura)
      .where(eq(pushAssinatura.userId, userId))
      .orderBy(sql`${pushAssinatura.criadaEm} desc`, asc(pushAssinatura.id));
    const sobra = todas.slice(APARELHOS_POR_ALUNO).map((t) => t.id);
    if (sobra.length) await tx.delete(pushAssinatura).where(inArray(pushAssinatura.id, sobra));
  });
  return estadoDoLembrete(db, userId, a.endpoint);
}

/** Desliga: tira o aparelho do endereço dado; sem endereço (o aparelho perdeu a assinatura), todos os do aluno. */
export async function removerAssinatura(db: Banco, userId: string, endpoint: string | null): Promise<void> {
  await db
    .delete(pushAssinatura)
    .where(endpoint ? and(eq(pushAssinatura.userId, userId), eq(pushAssinatura.endpoint, endpoint)) : eq(pushAssinatura.userId, userId));
}

/* ---------- envio ---------- */

export interface AssinaturaPush {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}
/** Envia uma notificação; em erro, rejeita com `statusCode` (quando o serviço respondeu). */
export type EnviarPush = (assinatura: AssinaturaPush, corpo: string, chaves: Vapid) => Promise<void>;

const enviarComWebPush: EnviarPush = async (assinatura, corpo, chaves) => {
  const { default: webpush } = await import("web-push");
  await webpush.sendNotification(assinatura, JSON.stringify({ corpo }), {
    vapidDetails: chaves,
    TTL: TTL_SEGUNDOS,
    urgency: "normal",
    topic: "lembrete",
    timeout: 10_000,
  });
};

let enviarDeTeste: EnviarPush | null = null;
/** Só para testes: substitui o envio real (nenhuma chamada de rede). */
export function definirEnvioDePush(f: EnviarPush | null): void {
  enviarDeTeste = f;
}

export interface ResultadoDaJanela {
  ligado: boolean;
  candidatas: number;
  enviados: number;
  jaEnviados: number;
  estudaram: number;
  foraDoHorario: number;
  pausadas: number;
  apagadas: number;
  falhas: number;
}

function horaNoFuso(quando: Date, tz: string): number {
  const h = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(quando);
  return Number(h) % 24;
}

/** Fuso do perfil, ou o padrão se estiver vazio ou inválido. */
function fusoValido(tz: string | null | undefined): string {
  if (!tz) return FUSO_PADRAO;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return tz;
  } catch {
    return FUSO_PADRAO;
  }
}

/** Frase do dia: muda a cada dia, igual para todos (sem sorteio por aluno). */
function textoDoDia(dia: string): string {
  const n = [...dia].reduce((s, c) => s + c.charCodeAt(0), 0);
  return VOZ.lembrete[n % VOZ.lembrete.length];
}

async function emParalelo<T>(itens: T[], limite: number, fazer: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const trabalhadores = Array.from({ length: Math.min(limite, itens.length) }, async () => {
    while (i < itens.length) await fazer(itens[i++]);
  });
  await Promise.all(trabalhadores);
}

/**
 * Envia os lembretes de uma janela (cron). Lotes de `lote` assinaturas (paginação pelo id), `concorrencia` envios ao
 * mesmo tempo. Devolve só contagens (nada de endereço em log).
 */
export async function enviarJanela(
  db: Banco,
  janela: JanelaDoLembrete,
  agora = new Date(),
  opcoes: { lote?: number; concorrencia?: number } = {},
): Promise<ResultadoDaJanela> {
  const r: ResultadoDaJanela = { ligado: false, candidatas: 0, enviados: 0, jaEnviados: 0, estudaram: 0, foraDoHorario: 0, pausadas: 0, apagadas: 0, falhas: 0 };
  const chaves = vapid();
  if (!lembretesLigados() || !chaves) return r;
  r.ligado = true;
  const enviar = enviarDeTeste ?? enviarComWebPush;
  const lote = opcoes.lote ?? 100;
  const concorrencia = opcoes.concorrencia ?? 10;
  let depoisDe: string | null = null;

  for (;;) {
    const assinaturas = await db
      .select()
      .from(pushAssinatura)
      .where(and(eq(pushAssinatura.janela, janela), isNull(pushAssinatura.pausadaEm), depoisDe ? gt(pushAssinatura.id, depoisDe) : undefined))
      .orderBy(asc(pushAssinatura.id))
      .limit(lote);
    if (!assinaturas.length) break;
    depoisDe = assinaturas[assinaturas.length - 1].id;
    r.candidatas += assinaturas.length;

    const alunos = [...new Set(assinaturas.map((a) => a.userId))];
    const fusos = new Map(
      (await db.select({ userId: profile.userId, tz: profile.timezone }).from(profile).where(inArray(profile.userId, alunos))).map((p) => [p.userId, p.tz]),
    );
    const ultimoEstudo = new Map(
      (
        await db
          .select({ userId: studyDay.userId, dia: max(studyDay.localDate) })
          .from(studyDay)
          .where(and(inArray(studyDay.userId, alunos), gt(studyDay.blocks, 0)))
          .groupBy(studyDay.userId)
      ).map((d) => [d.userId, d.dia]),
    );

    await emParalelo(assinaturas, concorrencia, async (a) => {
      const tz = fusoValido(fusos.get(a.userId));
      const hoje = dataNoFuso(agora, tz);
      if (a.ultimoEnvioDia === hoje) {
        r.jaEnviados += 1;
        return;
      }
      const hora = horaNoFuso(agora, tz);
      if (hora < HORA_INICIO || hora >= HORA_FIM) {
        r.foraDoHorario += 1;
        return;
      }
      const estudou = ultimoEstudo.get(a.userId) ?? null;
      if (estudou !== null && estudou >= hoje) {
        r.estudaram += 1;
        if (a.semEstudoSeguidos > 0) await db.update(pushAssinatura).set({ semEstudoSeguidos: 0 }).where(eq(pushAssinatura.id, a.id));
        return;
      }
      // Estudou depois do último lembrete: a contagem recomeça.
      const seguidos = a.ultimoEnvioDia !== null && estudou !== null && estudou >= a.ultimoEnvioDia ? 0 : a.semEstudoSeguidos;
      if (seguidos >= PAUSA_DEPOIS_DE) {
        r.pausadas += 1;
        await db.update(pushAssinatura).set({ pausadaEm: agora, semEstudoSeguidos: seguidos }).where(eq(pushAssinatura.id, a.id));
        return;
      }
      try {
        await enviar({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, textoDoDia(hoje), chaves);
        r.enviados += 1;
        await db.update(pushAssinatura).set({ ultimoEnvioDia: hoje, semEstudoSeguidos: seguidos + 1, falhas: 0 }).where(eq(pushAssinatura.id, a.id));
      } catch (erro) {
        const status = Number((erro as { statusCode?: unknown })?.statusCode);
        if (status === 404 || status === 410 || a.falhas + 1 >= FALHAS_PARA_APAGAR) {
          r.apagadas += 1;
          await db.delete(pushAssinatura).where(eq(pushAssinatura.id, a.id));
          return;
        }
        r.falhas += 1;
        await db.update(pushAssinatura).set({ falhas: a.falhas + 1, semEstudoSeguidos: seguidos }).where(eq(pushAssinatura.id, a.id));
      }
    });
    if (assinaturas.length < lote) break;
  }
  return r;
}
