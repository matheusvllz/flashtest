import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getState, hydrate } from "@/lib/store";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { HOME_ROUTE } from "@/lib/features";
import { sessao } from "@/lib/sessao";

/**
 * `/app` = a porta do produto (docs/44 §3). Com sessão, vai para a home (`HOME_ROUTE`, a trilha); sem sessão, quem já
 * estudou neste aparelho vai para o login e quem é novo vai para o onboarding (`/quiz`) — estudar exige conta
 * (decisão 0006). É o `start_url` do PWA e o destino de "Continuar estudando" na landing.
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
    const local = getState();
    sessao().then(
      (s) => navigate({ to: s.autenticado ? HOME_ROUTE : local.onboarded ? "/login" : "/quiz", replace: true }),
      () => navigate({ to: local.onboarded ? "/login" : "/quiz", replace: true }),
    );
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center bg-neve">
        <FocaMark size={112} decorative expression="neutra" motion="float" />
      </div>
    </PhoneFrame>
  );
}
