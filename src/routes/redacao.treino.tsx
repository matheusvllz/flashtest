import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Treino de redação por partes (spec 49 §5.9, T-49.9.8): Pro; o portão é o servidor. */
export const Route = createFileRoute("/redacao/treino")({
  component: lazyRouteComponent(() => import("@/components/redacao/TelaDoTreino"), "TelaDoTreino"),
  ssr: false,
});
