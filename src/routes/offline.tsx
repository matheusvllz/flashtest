import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/** Estudo sem internet (spec 49 §5.9 item 6, T-49.9.3): Basic e Pro; o portão é o servidor. */
export const Route = createFileRoute("/offline")({
  component: lazyRouteComponent(() => import("@/components/offline/TelaOffline"), "TelaOffline"),
  ssr: false,
});
