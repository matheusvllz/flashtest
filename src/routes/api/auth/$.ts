import { createFileRoute } from "@tanstack/react-router";

/**
 * Endpoints do Better Auth (cadastro, login, Google, verificação, redefinição, sessão, saída).
 * docs/specs/46-producao T-05.2. O código de autenticação é carregado só no servidor, dentro do
 * handler — esta rota não tem componente e não entra no bundle do navegador.
 */
async function responder({ request }: { request: Request }): Promise<Response> {
  // Modo de demonstração (D-15): sem banco e segredo em produção, a autenticação real fica fora do ar.
  const { env } = await import("@/server/env");
  if (!env().contasAtivas) return Response.json({ code: "CONTAS_DESLIGADAS" }, { status: 503 });
  const { auth } = await import("@/server/auth");
  return (await auth()).handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: responder, POST: responder } },
});
