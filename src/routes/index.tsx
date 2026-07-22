import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getState } from "@/lib/store";
import { BrandMark, PhoneFrame } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  component: Splash,
  ssr: false,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      const s = getState();
      // O quiz unificado é a única porta de entrada: ele autentica e onboarda de uma vez.
      if (!s.authed || !s.onboarded) navigate({ to: "/welcome" });
      else navigate({ to: "/dashboard" });
    }, 1100);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-navy text-white">
        <div className="animate-pulse">
          <BrandMark size={144} />
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">Flash Test</h1>
          <p className="ds-label mt-2 block" style={{ color: "#FEB803" }}>
            Constância que aprova
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
