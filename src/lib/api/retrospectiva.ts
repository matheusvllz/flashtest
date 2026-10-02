/** Retrospectiva pós-ENEM (spec 50 §5.7.3): só do próprio aluno (`userId` da sessão). */
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { banco } from "@/server/db/client";
import { profile } from "@/server/db/schema";
import { dataNoFuso } from "@/server/estudo/sincronizar";
import { exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import { minhaRetrospectiva as ler, type Retrospectiva } from "@/server/retrospectiva";

type Erro = { ok: false; codigo: string };

export const minhaRetrospectiva = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & Retrospectiva) | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    await limitar(db, `retrospectiva:${s.userId}`, 3600, 60);
    const agora = new Date();
    const [p] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, s.userId)).limit(1);
    return { ok: true, ...(await ler(db, s.userId, dataNoFuso(agora, p?.tz ?? "America/Sao_Paulo"), agora)) };
  } catch (e) {
    return respostaDeErro(e);
  }
});
