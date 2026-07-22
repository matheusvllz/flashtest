import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * "Criar conta" deixou de ser uma tela: virou o quiz de entrada (SDD 12, Development 1).
 * A rota fica só como redirect para não quebrar links antigos.
 */
export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/quiz" });
  },
});
