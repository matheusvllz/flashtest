import { useEffect } from "react";
import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { COPY, textoSePersistiu } from "@/lib/copy";
import { reportarErro } from "@/lib/error-reporting";
import { usePersistStatus } from "@/lib/store";

/**
 * Erro da rota `/trilha` (docs/27 §6.7, docs/28 T-16) — mesmo layout do erro
 * global de `__root.tsx`, incluindo o mesmo relato de erro (achado da
 * revisão de T-28: um `errorComponent` de rota não reporta por padrão, só o
 * global — sem isso, erro capturado aqui em vez de subir pro boundary
 * global ficaria mudo). Destino do relato: `src/lib/error-reporting.ts`.
 */
export function TrailError({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const persist = usePersistStatus();
  useEffect(() => {
    reportarErro(error, { boundary: "trilha_route_error_component" });
  }, [error]);
  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-6 text-center">
        <FocaMark expression="desapontada" size={96} decorative /> {/* falha do app, não do aluno (docs/44 §6) */}
        <div>
          <h1 className="font-display text-xl font-bold text-abismo">{COPY.trilha.erroTitulo}</h1>
          <p className="mt-2 text-sm text-nevoa">{textoSePersistiu(persist, COPY.trilha.erroCorpo, COPY.trilha.erroCorpoSemSalvo)}</p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          <button
            type="button"
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
