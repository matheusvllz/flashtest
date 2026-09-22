import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getState, hydrate } from "@/lib/store";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { HOME_ROUTE } from "@/lib/features";

export const Route = createFileRoute("/")({
  component: Splash,
  ssr: false,
});

function Splash() {
  const navigate = useNavigate();
  // Hidrata AGORA, síncrono na montagem — não dentro do timeout abaixo.
  // `getState()` sozinho não carrega o storage; sem isso, um usuário
  // retornando com progresso salvo caía em `/welcome` porque a decisão de
  // redirect lia o estado padrão vazio (docs/20 §2.5, §15.3 — "inicialização
  // explícita deve anteceder decisões de redirecionamento").
  hydrate();

  useEffect(() => {
    const t = setTimeout(() => {
      const s = getState();
      // O quiz unificado é a única porta de entrada: ele autentica e onboarda de uma vez.
      if (!s.authed || !s.onboarded) navigate({ to: "/welcome" });
      else navigate({ to: HOME_ROUTE });
    }, 1100);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neve">
        <FocaMark size={144} decorative motion="float" />
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-abismo">Foca</h1>
          <p className="ds-label mt-2 block">Foca 60 segundos.</p>
        </div>
      </div>
    </PhoneFrame>
  );
}
