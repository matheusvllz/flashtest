import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getState, hydrate } from "@/lib/store";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { HOME_ROUTE } from "@/lib/features";

/**
 * `/app` = a porta do produto (docs/44 §3; era o splash de `/`). Quem já tem conta com onboarding feito neste
 * aparelho vai para a home (`HOME_ROUTE`, a trilha); quem não tem vai para o onboarding (`/quiz`). É o `start_url`
 * do PWA e o destino de "Continuar estudando" na landing.
 */
export const Route = createFileRoute("/app")({
  component: Entrada,
  ssr: false,
});

function Entrada() {
  const navigate = useNavigate();
  // Hidrata AGORA, síncrono na montagem: a decisão de redirecionar lê o estado salvo, não o padrão vazio
  // (docs/20 §2.5, §15.3).
  hydrate();

  useEffect(() => {
    const s = getState();
    navigate({ to: s.authed && s.onboarded ? HOME_ROUTE : "/quiz", replace: true });
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center bg-neve">
        <FocaMark size={112} decorative expression="neutra" motion="float" />
      </div>
    </PhoneFrame>
  );
}
