import { useEffect } from "react";
import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { COPY } from "@/lib/copy";
import { reportLovableError } from "@/lib/lovable-error-reporting";

/**
 * Erro da rota `/trilha` (docs/27 §6.7, docs/28 T-16) — mesmo layout do erro
 * global de `__root.tsx`, incluindo o mesmo report pro Lovable (achado da
 * revisão de T-28: um `errorComponent` de rota não reporta por padrão, só o
 * global — sem isso, erro capturado aqui em vez de subir pro boundary
 * global ficaria mudo pro Lovable).
 */
export function TrailError({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "trilha_route_error_component" });
  }, [error]);
  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-6 text-center">
        <FocaMark expression="entediada" size={96} decorative />
        <div>
          <h1 className="font-display text-xl font-bold text-abismo">{COPY.trilha.erroTitulo}</h1>
          <p className="mt-2 text-sm text-nevoa">{COPY.trilha.erroCorpo}</p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary w-full"
          >
            {COPY.trilha.tentarDeNovo}
          </button>
          <Link to="/study" className="btn-ghost w-full">
            {COPY.trilha.praticar}
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
