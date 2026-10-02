import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Um simulado em andamento ou concluído (spec 50 §5.9.4). */
export const Route = createFileRoute("/simulado/$id")({
  component: lazyRouteComponent(() => import("@/components/simulado/TelaDoSimulado"), "TelaDoSimulado"),
  ssr: false,
});
