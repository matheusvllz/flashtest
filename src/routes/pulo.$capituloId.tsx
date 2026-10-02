import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** "Pular para cá" (spec 50 §5.7.1): entrada, teste e resultado do capítulo-alvo. */
export const Route = createFileRoute("/pulo/$capituloId")({
  component: lazyRouteComponent(() => import("@/components/learning/pulo/TelaDoPulo"), "TelaDoPulo"),
  ssr: false,
});
