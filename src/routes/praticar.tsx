import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Praticar (spec 50 §5.7.2): hub de revisão rápida, erros recentes, caderno, flashcards, simulados e matérias. */
export const Route = createFileRoute("/praticar")({
  component: lazyRouteComponent(() => import("@/components/praticar/TelaPraticar"), "TelaPraticar"),
  ssr: false,
});
