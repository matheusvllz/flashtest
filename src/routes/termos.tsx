import { createFileRoute } from "@tanstack/react-router";
import { PaginaLegal } from "@/components/legal/PaginaLegal";
import { TERMOS_DE_USO } from "@/content/legal/termos";

/** Termos de uso (docs/specs/46-producao T-11.3): público, com SSR e sem depender de conta. */
export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [{ title: "Termos de uso — Foca" }] }),
  component: () => <PaginaLegal doc={TERMOS_DE_USO} />,
});
