import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { COPY } from "@/lib/copy";

/** Créditos e fontes das questões (spec 50 §5.9.2, decisão 0008, T-50.9.7): pública, com SSR e sem depender de conta. */
export const Route = createFileRoute("/creditos")({
  head: () => ({
    meta: [
      { title: COPY.creditos.tituloPagina },
      { name: "description", content: COPY.creditos.descricaoPagina },
    ],
  }),
  component: lazyRouteComponent(
    () => import("@/components/legal/PaginaCreditos"),
    "PaginaCreditos",
  ),
});
