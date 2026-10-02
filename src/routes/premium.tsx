import { createFileRoute, redirect } from "@tanstack/react-router";

/** O antigo "Premium (teste)" virou a tela de planos (spec 49 D49-13). */
export const Route = createFileRoute("/premium")({
  beforeLoad: () => {
    throw redirect({ to: "/planos", replace: true });
  },
});
