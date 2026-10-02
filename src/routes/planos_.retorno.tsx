import { createFileRoute } from "@tanstack/react-router";
import { RetornoDoPagamento } from "@/components/planos/RetornoDoPagamento";

/** Volta do checkout do Asaas (spec 49 T-49.3.4). A URL nunca libera nada: quem decide é o servidor. */
export const Route = createFileRoute("/planos_/retorno")({
  // `teste` (só no ambiente local, provedor falso): o roteador regrava a busca como JSON, então aceita 1, "1" e true.
  validateSearch: (s: Record<string, unknown>): { compra: string; r?: string; teste?: boolean } => ({
    compra: typeof s.compra === "string" ? s.compra : "",
    ...(typeof s.r === "string" ? { r: s.r } : {}),
    ...(s.teste === 1 || s.teste === "1" || s.teste === true ? { teste: true } : {}),
  }),
  component: Retorno,
  ssr: false,
});

function Retorno() {
  const { compra, r, teste } = Route.useSearch();
  return <RetornoDoPagamento compra={compra} r={r} teste={teste === true} />;
}
