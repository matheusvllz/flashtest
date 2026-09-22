import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, setState } from "@/lib/store";
import { Check, Sparkles, Clock } from "lucide-react";
import { HOME_ROUTE } from "@/lib/features";

export const Route = createFileRoute("/premium")({ component: Premium, ssr: false });

function Premium() {
  const s = useAppState();
  const nav = useNavigate();
  const trial = s.premiumTrial;
  const remaining =
    trial.active && trial.startedAt
      ? Math.max(0, 86400000 - (Date.now() - new Date(trial.startedAt).getTime()))
      : 0;
  const hours = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const expired = trial.active && remaining === 0;

  const benefits = [
    "Questões ilimitadas quando disponíveis",
    "IA sem limite diário",
    "Resoluções completas",
    "Videoaulas completas",
    "Flashcards personalizados",
    "Estatísticas completas",
    "Sessões personalizadas",
    "Conteúdo offline ampliado",
    "Sem anúncios",
  ];

  return (
    <AppShell title="Premium">
      <div className="px-5 pt-4 space-y-4">
        <div
          className="card-soft p-5"
          style={{
            background: "color-mix(in srgb, var(--color-recompensa) 20%, var(--color-cards))",
            borderColor: "var(--color-recompensa)",
          }}
        >
          <Sparkles className="text-abismo" />
          <h2 className="mt-2 font-display text-2xl font-bold text-abismo">Foca Premium</h2>
          <p className="mt-1 text-sm text-abismo">Preço a definir · Em breve</p>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-abismo">Benefícios</h3>
          <ul className="mt-3 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-abismo">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mar/12">
                  <Check size={14} className="text-mar-fundo" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {!trial.active && (
          <button
            onClick={() =>
              setState((ss) => {
                ss.premiumTrial = { active: true, startedAt: new Date().toISOString() };
                return ss;
              })
            }
            className="btn-primary w-full"
          >
            Testar Premium grátis por 1 dia
          </button>
        )}

        {trial.active && !expired && (
          <div className="card-soft p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-nevoa">
              <Clock size={14} /> TESTE ATIVO
            </div>
            <p className="mt-2 font-display text-lg font-bold text-abismo">
              Tempo restante: {hours}h {mins}min
            </p>
            <p className="mt-1 text-xs text-nevoa">
              Aproveite IA sem limite, videoaulas e estatísticas completas.
            </p>
          </div>
        )}

        {expired && (
          <div className="card-soft p-4">
            <p className="font-display font-bold text-abismo">Seu teste gratuito terminou.</p>
            <p className="mt-1 text-sm text-nevoa">
              Continue acompanhando a Foca para conhecer os planos de assinatura.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setState((ss) => {
                    ss.premiumTrial = { active: false, startedAt: null };
                    return ss;
                  });
                  nav({ to: HOME_ROUTE });
                }}
                className="btn-outline"
              >
                Voltar ao gratuito
              </button>
              <button className="btn-abismo">Quero ser avisado</button>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-nevoa">
          Não solicitamos cartão. Sem cobrança automática.
        </p>
        <Link to={HOME_ROUTE} className="btn-outline w-full">
          Voltar ao início
        </Link>
      </div>
    </AppShell>
  );
}
