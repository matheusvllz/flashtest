/**
 * Anúncios do Free no servidor (spec 49 D49-02, D49-03b, §5.4; T-49.6.2, T-49.6.4).
 *
 * - Só para o plano Free e com `ANUNCIOS_HABILITADO` (no ambiente local, também para contas de teste `e2e-vidas…` e
 *   `e2e-anuncios…`, com o provedor falso).
 * - Não personalizado para todos; quem tem menos de 18 pelo ano de nascimento vai marcado (TFAT = adolescente).
 * - Consentimento de cookies (Guia de cookies da ANPD): guardado em `consent` (finalidade `anuncios_cookies`); recusar
 *   não bloqueia nada — o app carrega o modo sem cookies ("limited ads").
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { idadePeloAno } from "@/lib/legal";
import type { Banco } from "../db/client";
import { consent, user } from "../db/schema";
import { env } from "../env";
import { ehLocal } from "../pagamentos/provedor";
import { planoDoAluno } from "../planos/plano";

export const FINALIDADE_COOKIES_ANUNCIO = "anuncios_cookies";

export interface ConfigDeAnuncios {
  ativo: boolean;
  provedor: "falso" | "gam";
  unidades: { recompensado: string | null; retangulo: string | null };
  menor: boolean;
  consentimento: "aceito" | "recusado" | null;
}

const DESLIGADO: ConfigDeAnuncios = { ativo: false, provedor: "falso", unidades: { recompensado: null, retangulo: null }, menor: false, consentimento: null };

export async function configDeAnuncios(db: Banco, userId: string, agora: Date): Promise<ConfigDeAnuncios> {
  const e = env();
  if ((await planoDoAluno(db, userId, agora)) !== "gratis") return DESLIGADO;
  const [u] = await db.select({ email: user.email, ano: user.birthYear }).from(user).where(eq(user.id, userId)).limit(1);
  if (!u) return DESLIGADO;
  const local = ehLocal(e);
  const ligado = e.ANUNCIOS_HABILITADO === true || (local && /^e2e-(vidas|anuncios)/.test(u.email));
  if (!ligado) return DESLIGADO;
  const provedor = e.ANUNCIOS_PROVEDOR ?? (local ? "falso" : "gam");
  const unidades = { recompensado: e.GAM_UNIDADE_RECOMPENSADO ?? null, retangulo: e.GAM_UNIDADE_RETANGULO ?? null };
  if (provedor === "gam" && !unidades.recompensado && !unidades.retangulo) return DESLIGADO;
  return {
    ativo: true,
    provedor,
    unidades,
    // Sem ano conhecido, trata como menor (conservador).
    menor: !u.ano || idadePeloAno(u.ano, agora) < 18,
    consentimento: await consentimentoDeCookies(db, userId),
  };
}

export async function consentimentoDeCookies(db: Banco, userId: string): Promise<"aceito" | "recusado" | null> {
  const [c] = await db
    .select({ concedido: consent.grantedAt, revogado: consent.revokedAt })
    .from(consent)
    .where(and(eq(consent.userId, userId), eq(consent.purpose, FINALIDADE_COOKIES_ANUNCIO)))
    .orderBy(desc(consent.createdAt))
    .limit(1);
  if (!c) return null;
  return c.concedido && !c.revogado ? "aceito" : "recusado";
}

/** Cada decisão vira uma linha (histórico como prova do consentimento); a mais recente vale. Revogável em /profile. */
export async function registrarConsentimentoDeCookies(db: Banco, userId: string, aceito: boolean, agora: Date): Promise<void> {
  await db.insert(consent).values({
    id: randomUUID(),
    userId,
    purpose: FINALIDADE_COOKIES_ANUNCIO,
    grantedBy: "titular",
    grantedAt: aceito ? agora : null,
    revokedAt: aceito ? null : agora,
  });
}
