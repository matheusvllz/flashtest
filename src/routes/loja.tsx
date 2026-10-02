import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Loja das Pérolas (spec 50 §5.3.3): proteção, vidas e estilo; o servidor decide saldo, preço e estoque. */
export const Route = createFileRoute("/loja")({
  component: lazyRouteComponent(() => import("@/components/economia/TelaDaLoja"), "TelaDaLoja"),
  ssr: false,
});
