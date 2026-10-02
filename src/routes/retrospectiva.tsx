import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** "Seu ano no Foca" (spec 50 §5.7.3): sem nota, sem previsão, sem comparação. */
export const Route = createFileRoute("/retrospectiva")({
  component: lazyRouteComponent(() => import("@/components/retrospectiva/TelaRetrospectiva"), "TelaRetrospectiva"),
  ssr: false,
});
