import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Corretor de redação (spec 49 §5.9, T-49.9.7): Pro; o portão é o servidor. */
export const Route = createFileRoute("/redacao/corretor")({
  component: lazyRouteComponent(() => import("@/components/redacao/TelaDoCorretor"), "TelaDoCorretor"),
  ssr: false,
});
