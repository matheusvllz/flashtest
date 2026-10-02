import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Caderno de erros (spec 49 §5.9 item 2, T-49.9.1): Basic e Pro; o portão é o servidor. */
export const Route = createFileRoute("/caderno")({
  component: lazyRouteComponent(() => import("@/components/caderno/TelaDoCaderno"), "TelaDoCaderno"),
  ssr: false,
});
