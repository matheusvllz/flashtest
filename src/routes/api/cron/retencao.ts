import { createFileRoute } from "@tanstack/react-router";

/**
 * Rotina diária de retenção (46 T-09.3; spec 48 T-48.3.3), chamada pelo Vercel Cron (`vercel.json` → `crons`), que
 * manda `Authorization: Bearer <CRON_SECRET>`. Sem o segredo configurado, ou com segredo errado, nada roda (401).
 * Responde só contagens.
 */
async function retencao(request: Request): Promise<Response> {
  const { env } = await import("@/server/env");
  const e = env();
  const { timingSafeEqual } = await import("node:crypto");
  const recebido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${e.CRON_SECRET ?? ""}`);
  const autorizado = Boolean(e.CRON_SECRET) && recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
  if (!autorizado) return Response.json({ ok: false }, { status: 401, headers: { "cache-control": "no-store" } });
  if (!e.contasAtivas) return Response.json({ ok: true, contas: "desligadas" }, { headers: { "cache-control": "no-store" } });
  const { banco } = await import("@/server/db/client");
  const { aplicarRetencao } = await import("@/server/conta/retencao");
  const { log } = await import("@/server/http");
  const resultado = await aplicarRetencao(await banco());
  log("info", "retencao", { ...resultado });
  return Response.json({ ok: true, ...resultado }, { headers: { "cache-control": "no-store" } });
}

export const Route = createFileRoute("/api/cron/retencao")({
  server: { handlers: { GET: ({ request }) => retencao(request) } },
});
