import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Simulados (spec 50 §5.9.4): mini da semana para todos; prova oficial e nível ENEM no Pro. */
export const Route = createFileRoute("/simulado/")({
  component: lazyRouteComponent(() => import("@/components/simulado/TelaSimulados"), "TelaSimulados"),
  ssr: false,
});
