import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Rever erros recentes (spec 50 §5.7.2): sem vida, sem XP, sem mexer no domínio. */
export const Route = createFileRoute("/praticar_/erros")({
  component: lazyRouteComponent(() => import("@/components/praticar/TelaErrosRecentes"), "TelaErrosRecentes"),
  ssr: false,
});
