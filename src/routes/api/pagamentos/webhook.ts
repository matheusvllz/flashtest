import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook do Asaas (spec 49 T-49.3.3; segurança L3). O Asaas manda o token no cabeçalho `asaas-access-token`.
 *
 * 1. Token conferido em tempo constante; sem token configurado ou errado → 401, nada registrado.
 * 2. Corpo limitado e normalizado (só id e tipo do evento e os ids dos objetos; o resto do corpo é descartado).
 * 3. `evento_pagamento` registra o id antes de agir: repetido e já processado → 200 sem efeito.
 * 4. A ação consulta a API do Asaas (`processarEvento`) e nunca confia no corpo.
 * 5. Falha ao processar → 500 (o Asaas tenta de novo); evento desconhecido → 200 (não pausa a fila).
 *
 * Funciona mesmo com a venda desligada: renovações, atrasos e reembolsos de quem já assina precisam ser aplicados.
 */
const LIMITE_CORPO = 64 * 1024;

async function webhook(request: Request): Promise<Response> {
  const semCache = { "cache-control": "no-store" };
  const { env } = await import("@/server/env");
  const e = env();
  const { registrarEProcessar, tokenValido } = await import("@/server/pagamentos/webhook");
  if (!tokenValido(request.headers.get("asaas-access-token"), e.ASAAS_WEBHOOK_TOKEN)) return Response.json({ ok: false }, { status: 401, headers: semCache });
  if (!e.contasAtivas) return Response.json({ ok: false }, { status: 503, headers: semCache });

  const bruto = await request.text();
  if (bruto.length > LIMITE_CORPO) return Response.json({ ok: false }, { status: 413, headers: semCache });
  const { eventoDoAsaas } = await import("@/server/pagamentos/asaas");
  let corpo: unknown;
  try {
    corpo = JSON.parse(bruto);
  } catch {
    return Response.json({ ok: false }, { status: 400, headers: semCache });
  }
  const evento = eventoDoAsaas(corpo);
  if (!evento) return Response.json({ ok: false }, { status: 400, headers: semCache });

  const { banco } = await import("@/server/db/client");
  const { provedorDePagamento } = await import("@/server/pagamentos/provedor");
  const { log } = await import("@/server/http");
  const p = provedorDePagamento();
  if (!p || p.nome !== "asaas") return Response.json({ ok: false }, { status: 503, headers: semCache });
  try {
    const resultado = await registrarEProcessar(await banco(), p, evento, new Date());
    log("info", "pagamentos.webhook", { tipo: evento.tipo, resultado });
    return Response.json({ ok: true }, { headers: semCache });
  } catch (erro) {
    log("erro", "pagamentos.webhook_falhou", { tipo: evento.tipo, mensagem: erro instanceof Error ? erro.message.slice(0, 120) : "?" });
    return Response.json({ ok: false }, { status: 500, headers: semCache });
  }
}

export const Route = createFileRoute("/api/pagamentos/webhook")({
  server: { handlers: { POST: ({ request }) => webhook(request) } },
});
