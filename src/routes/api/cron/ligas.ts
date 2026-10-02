import { createFileRoute } from "@tanstack/react-router";

/**
 * Rotina diária das ligas 18+ (spec 50 §5.5, T-50.13.3), chamada pelo Vercel Cron (`vercel.json` → `crons`) com
 * `Authorization: Bearer <CRON_SECRET>`, como `/api/cron/retencao`. Fecha a semana anterior se ainda não fechou
 * (idempotente, chave `liga:<semana>`) e forma os grupos da semana. Sem o segredo, ou com segredo errado, nada roda
 * (401). Responde só contagens.
 */
async function ligas(request: Request): Promise<Response> {
  const { env } = await import("@/server/env");
  const e = env();
  const { timingSafeEqual } = await import("node:crypto");
  const recebido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${e.CRON_SECRET ?? ""}`);
  const autorizado =
    Boolean(e.CRON_SECRET) &&
    recebido.length === esperado.length &&
    timingSafeEqual(recebido, esperado);
  if (!autorizado)
    return Response.json({ ok: false }, { status: 401, headers: { "cache-control": "no-store" } });
  if (!e.contasAtivas)
    return Response.json(
      { ok: true, contas: "desligadas" },
      { headers: { "cache-control": "no-store" } },
    );
  const { banco } = await import("@/server/db/client");
  const { rodarLigas } = await import("@/server/ranking/ligas");
  const { log } = await import("@/server/http");
  const r = await rodarLigas(await banco(), new Date());
  const resumo =
    r.ligas === "ok"
      ? {
          ligas: r.ligas,
          semana: r.fechamento.semana,
          fechada: r.fechamento.fechada,
          participantes: r.fechamento.participantes,
          novosNosGrupos: r.novosNosGrupos,
        }
      : { ligas: r.ligas };
  log("info", "ligas", resumo);
  return Response.json({ ok: true, ...resumo }, { headers: { "cache-control": "no-store" } });
}

export const Route = createFileRoute("/api/cron/ligas")({
  server: { handlers: { GET: ({ request }) => ligas(request) } },
});
