import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Tarefa de escrita da trilha de redação (spec 50 §5.10.1): todos os planos; recompensa e IA decididas no servidor. */
export const Route = createFileRoute("/redacao/escreva/$tarefaId")({
  component: lazyRouteComponent(() => import("@/components/redacao/TelaDaTarefa"), "TelaDaTarefa"),
  ssr: false,
});
