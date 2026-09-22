import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { setAudioEnabled, unlockAudioFromGesture } from "@/lib/audio/engine";
import { EXAM_MAP, EXAMS } from "@/data/exams";
import {
  useAppState,
  logout,
  reset,
  setExamTarget,
  setPrefs,
  setShowExamTips,
  nivelDeXp,
} from "@/lib/store";
import { ChevronRight, LogOut, RotateCcw, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({ component: Profile, ssr: false });

function Profile() {
  const s = useAppState();
  const nav = useNavigate();
  const p = s.prefs;
  const nivel = nivelDeXp(s.progress.xp);
  const initials = (p.name || "F T")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppShell title="Perfil">
      <div className="px-5 pt-4 space-y-4">
        <div className="card-soft p-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gelo font-display text-lg font-bold text-abismo">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-abismo truncate">{p.name || "Sem nome"}</p>
              <p className="truncate text-xs text-nevoa">{p.email || "—"}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="shrink-0 font-mono text-xs font-bold text-nevoa">
              Recorde: {s.progress.bestStreak} dias
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-nevoa">
                <span>Nível {nivel.nivel}</span>
                <span>
                  {nivel.atual}/{nivel.proximo || nivel.atual}
                </span>
              </div>
              <ProgressBar
                value={nivel.atual}
                max={nivel.proximo || 1}
                tone="caneta"
                size="sm"
                label="Progresso de nível"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="card-soft p-4">
          <p className="ds-label">Som e vibração</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const ligar = !p.sound;
                setPrefs({ sound: ligar });
                // Gesto real: desbloqueia se ligou, cessa som em andamento se
                // desligou (docs/20 §6.4, critério A6).
                setAudioEnabled(ligar);
                if (ligar) unlockAudioFromGesture();
              }}
              aria-pressed={p.sound}
              className={cn("chip justify-center", p.sound && "chip-on")}
            >
              Som {p.sound ? "ligado" : "desligado"}
            </button>
            <button
              onClick={() => setPrefs({ haptics: !p.haptics })}
              aria-pressed={p.haptics}
              className={cn("chip justify-center", p.haptics && "chip-on")}
            >
              Vibração {p.haptics ? "ligada" : "desligada"}
            </button>
          </div>
          <p className="mt-3 ds-label">Tema</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {(
              [
                ["auto", "Auto"],
                ["light", "Claro"],
                ["dark", "Escuro"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  setPrefs({ theme: value });
                  const dark =
                    value === "dark" ||
                    (value === "auto" &&
                      window.matchMedia?.("(prefers-color-scheme: dark)").matches);
                  document.documentElement.classList.toggle("dark", Boolean(dark));
                }}
                aria-pressed={p.theme === value}
                className={cn("chip justify-center", p.theme === value && "chip-on")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-soft p-4">
          <p className="ds-label">Vestibular</p>
          <p className="mt-1 text-xs text-nevoa">
            Escolha sua prova pra receber dicas contextuais no fim das lições.
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {EXAMS.map((exam) => {
              const alvoAtual = p.examTargets[0];
              const selecionado = alvoAtual?.examId === exam.id;
              return (
                <button
                  key={exam.id}
                  onClick={() =>
                    setExamTarget(selecionado ? null : { examId: exam.id, stage: exam.stages?.[0] })
                  }
                  aria-pressed={selecionado}
                  className={cn("chip justify-center", selecionado && "chip-on")}
                >
                  {exam.name}
                </button>
              );
            })}
          </div>
          {p.examTargets[0] && EXAM_MAP[p.examTargets[0].examId]?.hasStages && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {EXAM_MAP[p.examTargets[0].examId]?.stages?.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setExamTarget({ examId: p.examTargets[0].examId, stage })}
                  aria-pressed={p.examTargets[0].stage === stage}
                  className={cn("chip", p.examTargets[0].stage === stage && "chip-on")}
                >
                  Etapa {stage}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowExamTips(!p.showExamTips)}
            aria-pressed={p.showExamTips}
            className={cn("chip mt-2.5 w-full justify-center", p.showExamTips && "chip-on")}
          >
            Dicas de prova {p.showExamTips ? "ativadas" : "desativadas"}
          </button>
        </div>

        <div
          className="card-soft p-4"
          style={{
            background: "color-mix(in srgb, var(--color-recompensa) 20%, var(--color-cards))",
            borderColor: "var(--color-recompensa)",
          }}
        >
          <p className="ds-label">Plano atual</p>
          <p className="mt-1 font-display text-lg font-bold text-abismo">
            {s.premiumTrial.active ? "Premium (teste)" : "Gratuito"}
          </p>
          <Link to="/premium" className="btn-outline mt-3 inline-flex">
            <Sparkles size={14} /> Conhecer premium
          </Link>
        </div>

        <div className="card-soft divide-y divide-gelo">
          <Row label="Refazer meu diagnóstico" onClick={() => nav({ to: "/quiz" })} />
          <Row label="Meu plano" onClick={() => nav({ to: "/plan" })} />
          <Row label="Meta diária" value={`${p.dailyLessons} aulas de 60s`} />
          <Row label="Faculdade-alvo" value={p.targetInstitution || "—"} />
          <Row label="Estado" value={p.residenceState || "—"} />
          <Row label="Nível escolar" value={p.level || "—"} />
          <Row label="Dificuldades" value={(p.difficultSubjects ?? []).join(", ") || "—"} />
          <Row label="Assuntos por matéria" onClick={() => nav({ to: "/topics" })} />
        </div>

        <div className="card-soft divide-y divide-gelo">
          <Row
            label="Conteúdo offline"
            value={s.offline.downloaded ? "Baixado" : "Não baixado"}
            onClick={() => nav({ to: "/offline" })}
            icon={<Download size={16} />}
          />
          <Row label="Termos de uso" />
          <Row label="Política de privacidade" />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              reset();
              nav({ to: "/welcome" });
            }}
            className="btn-ghost w-full text-sm"
          >
            <RotateCcw size={14} /> Resetar demonstração
          </button>
          <button
            onClick={() => {
              logout();
              nav({ to: "/welcome" });
            }}
            className="btn-ghost w-full text-sm"
          >
            <LogOut size={14} /> Sair da conta
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Row({
  label,
  value,
  onClick,
  icon,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-between px-4 py-3 text-left"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-abismo">
        {icon}
        {label}
      </span>
      <span className="flex items-center gap-1 text-xs text-nevoa">
        {value}
        <ChevronRight size={14} />
      </span>
    </button>
  );
}
