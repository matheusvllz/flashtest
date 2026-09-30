import { createFileRoute } from "@tanstack/react-router";
import { PaginaLegal } from "@/components/legal/PaginaLegal";
import { POLITICA_DE_PRIVACIDADE } from "@/content/legal/privacidade";

/** Política de privacidade (docs/specs/46-producao T-11.3): pública, com SSR e sem depender de conta. */
export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Política de privacidade — Foca" }] }),
  component: () => <PaginaLegal doc={POLITICA_DE_PRIVACIDADE} />,
});
