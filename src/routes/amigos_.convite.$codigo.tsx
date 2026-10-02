import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

/**
 * Convite para ofensiva em dupla (spec 50 §5.6.2): `/amigos/convite/<código>`. Fora do aninhamento de `/amigos`
 * (o `_` no nome), como `planos_.retorno.tsx`. A tela nunca mostra nada de quem convidou a quem não pode aceitar.
 */
export const Route = createFileRoute("/amigos_/convite/$codigo")({
  component: lazyRouteComponent(() => import("@/components/amigos/TelaConvite"), "TelaConvite"),
  ssr: false,
});
