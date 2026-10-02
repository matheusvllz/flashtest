import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/**
 * Ranking semanal de maiores de 18 (spec 49 D49-06, T-49.8.2). A turma fictícia (`src/data/ranking.ts`) saiu daqui
 * e, com isso, do bundle de produção (T-49.8.3); fica só como fixture de teste.
 */
export const Route = createFileRoute("/ranking")({
  component: lazyRouteComponent(() => import("@/components/ranking/TelaDoRanking"), "TelaDoRanking"),
  ssr: false,
});
