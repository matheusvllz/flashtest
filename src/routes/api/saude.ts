import { createFileRoute } from "@tanstack/react-router";

/**
 * Saúde do serviço (docs/specs/46-producao T-13.5): o banco responde? Sem dado sensível.
 * Usado para conferir um preview ou a produção depois do deploy.
 */
async function saude(): Promise<Response> {
  const inicio = Date.now();
  try {
    const { banco } = await import("@/server/db/client");
    const { sql } = await import("drizzle-orm");
    const db = await banco();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, banco: "ok", ms: Date.now() - inicio }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ ok: false, banco: "indisponivel" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}

export const Route = createFileRoute("/api/saude")({
  server: { handlers: { GET: saude } },
});
