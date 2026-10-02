import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Missões (spec 50 §5.4, §5.11.2): missões do dia, desafio do mês, conquistas; liga e amigos só para 18+. */
export const Route = createFileRoute("/missoes")({
  component: lazyRouteComponent(() => import("@/components/missoes/TelaMissoes"), "TelaMissoes"),
  ssr: false,
});
