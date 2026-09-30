import { createFileRoute, redirect } from "@tanstack/react-router";

/** Link antigo de "criar conta": leva ao cadastro real (docs/specs/46-producao T-05.4). */
export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/cadastro" });
  },
});
