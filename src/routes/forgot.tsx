import { createFileRoute, redirect } from "@tanstack/react-router";

/** Link antigo de "esqueci a senha": leva ao pedido de redefinição real (docs/specs/46-producao T-05.4). */
export const Route = createFileRoute("/forgot")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/esqueci-a-senha" });
  },
});
