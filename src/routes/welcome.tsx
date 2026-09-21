import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
  ssr: false,
});

function Welcome() {
  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col justify-between bg-neve px-6 pt-14 pb-8">
        <div className="flex flex-col items-center text-center">
          <FocaMark size={132} decorative expression="empolgada" motion="pop" />
          <h1 className="mt-6 font-display text-[34px] font-bold leading-none tracking-tight text-abismo">
            Foca
          </h1>
          <p className="ds-label mt-3 block">Foca 60 segundos.</p>

          <h2 className="mt-8 font-display text-[26px] font-bold leading-tight text-abismo">
            Passar não é sobre estudar mais. É estudar <span className="mark-texto">todo dia</span>.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-nevoa">
            A IA mapeia suas lacunas e monta o treino diário. Você só precisa aparecer 60 segundos.
          </p>

          <ul className="mt-7 flex flex-col gap-2.5 self-stretch text-left">
            {[
              "Aulas de 60 segundos, não maratonas",
              "Diagnóstico das suas 3 maiores lacunas",
              "Uma IA que explica o seu erro, não o erro médio",
            ].map((t) => (
              <li key={t} className="card-soft flex items-center gap-3 p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mar/12">
                  <Check size={15} className="text-mar-fundo" />
                </span>
                <span className="text-sm font-semibold text-abismo">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Link to="/quiz" className="btn-primary w-full">
            Começar em 60 segundos
          </Link>
          <Link to="/login" className="btn-ghost w-full">
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
