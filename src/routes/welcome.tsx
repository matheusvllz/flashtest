import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * `/welcome` era a "landing" antiga dentro do app (copy com "60 segundos" e "Não é X. É Y.", `copy/06` §5). Desde a
 * integração (docs/44 §3) a porta de entrada é a landing em `/`; links antigos continuam funcionando.
 */
export const Route = createFileRoute("/welcome")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
