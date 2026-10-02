import { createFileRoute } from "@tanstack/react-router";

/**
 * Lembrete diário por push (spec 50 §5.2.5, T-50.15.4), chamado pelo Vercel Cron 4 vezes por dia, uma por janela
 * (`vercel.json` → `crons`, `?janela=manha|tarde|fim-de-tarde|noite`), com `Authorization: Bearer <CRON_SECRET>`.
 * Sem o segredo configurado, ou com segredo errado, nada roda (401). Sem `LEMBRETES_HABILITADO` ou sem as chaves VAPID,
 * responde que está desligado. Responde e registra só contagens (nunca endereço de push).
 */
async function lembretes(request: Request): Promise<Response> {
  const semCache = { "cache-control": "no-store" };
  const { env } = await import("@/server/env");
  const e = env();
  const { timingSafeEqual } = await import("node:crypto");
  const recebido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${e.CRON_SECRET ?? ""}`);
  const autorizado = Boolean(e.CRON_SECRET) && recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
  if (!autorizado) return Response.json({ ok: false }, { status: 401, headers: semCache });
  const { JANELAS_DO_LEMBRETE } = await import("@/lib/lembretes/regras");
  const janela = JANELAS_DO_LEMBRETE.find((j) => j === new URL(request.url).searchParams.get("janela"));
  if (!janela) return Response.json({ ok: false, codigo: "JANELA_INVALIDA" }, { status: 400, headers: semCache });
  if (!e.contasAtivas) return Response.json({ ok: true, contas: "desligadas" }, { headers: semCache });
  const { banco } = await import("@/server/db/client");
  const { enviarJanela } = await import("@/server/lembretes/push");
  const { log } = await import("@/server/http");
  const resultado = await enviarJanela(await banco(), janela);
  log("info", "lembretes", { janela, ...resultado });
  return Response.json({ ok: true, janela, ...resultado }, { headers: semCache });
}

export const Route = createFileRoute("/api/cron/lembretes")({
  server: { handlers: { GET: ({ request }) => lembretes(request) } },
});
