import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Planos e assinatura (spec 49 §6, T-49.3.4). Exige conta (guarda da raiz); o componente vem sob demanda. */
export const Route = createFileRoute("/planos")({
  component: lazyRouteComponent(() => import("@/components/planos/TelaDePlanos"), "TelaDePlanos"),
  ssr: false,
});
