import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Ofensiva com amigos, só 18+ (spec 50 §5.6, T-50.14.4): duplas, pedidos, convite e bloqueios. */
export const Route = createFileRoute("/amigos")({
  component: lazyRouteComponent(() => import("@/components/amigos/TelaAmigos"), "TelaAmigos"),
  ssr: false,
});
