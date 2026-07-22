import { createFileRoute, Link } from "@tanstack/react-router";
import { Bolt, BrandMark, PhoneFrame } from "@/components/AppShell";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
  ssr: false,
});

function Welcome() {
  return (
    <PhoneFrame>
      <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-navy px-6 pt-14 pb-8">
        <div className="pointer-events-none absolute -right-20 -top-10 opacity-[0.08]">
          <Bolt size={340} />
        </div>

        <div className="relative flex flex-col items-center text-center text-white">
          <BrandMark size={132} />
          <h1 className="mt-6 font-display text-[34px] font-bold leading-none tracking-tight">
            Flash Test
          </h1>
          <p className="ds-label mt-3 block" style={{ color: "#FEB803" }}>
            Constância que aprova
          </p>

          <h2 className="mt-8 font-display text-[26px] font-bold leading-tight">
            Passar não é sobre <span className="text-yellow">estudar mais.</span> É estudar todo
            dia.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-mist">
            A IA mapeia suas lacunas e monta o treino diário. Você só precisa aparecer 60 segundos.
          </p>

          <ul className="mt-7 flex flex-col gap-3 self-stretch text-left">
            {[
              "Aulas de 60 segundos, não maratonas",
              "Diagnóstico das suas 3 maiores lacunas",
              "Uma IA que explica o seu erro, não o erro médio",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm font-semibold text-white">
                <Bolt size={18} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-8 flex flex-col gap-2">
          <Link to="/quiz" className="btn-primary w-full">
            Começar em 60 segundos
          </Link>
          <Link to="/login" className="py-3 text-center text-sm font-semibold text-navy-mist">
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
