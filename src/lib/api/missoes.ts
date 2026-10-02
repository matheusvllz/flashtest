/**
 * Missões do dia, desafio do mês e conquistas (spec 50 §5.4). Pelo `userId` da sessão; o progresso só anda com
 * fatos que o servidor confere na sincronização. Desligáveis por `FUNCOES_DESLIGADAS=missoes`.
 */
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { banco } from "@/server/db/client";
import { profile } from "@/server/db/schema";
import { dataNoFuso } from "@/server/estudo/sincronizar";
import { minhasMissoes as ler, type MinhasMissoes } from "@/server/gamificacao/missoes";
import { exigirSessao, respostaDeErro } from "@/server/http";

type Erro = { ok: false; codigo: string };

export const minhasMissoes = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & MinhasMissoes) | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    const agora = new Date();
    const [p] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, s.userId)).limit(1);
    return { ok: true, ...(await ler(db, s.userId, dataNoFuso(agora, p?.tz ?? "America/Sao_Paulo"), agora)) };
  } catch (e) {
    return respostaDeErro(e);
  }
});
