import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { completeQuiz, setEasySubjects, setState, useAppState, type Prefs } from "@/lib/store";
import { computeGaps } from "@/lib/gaps";
import { ChevronDown } from "lucide-react";
import { CourseStep } from "@/components/onboarding/CourseStep";
import { SUBJECTS } from "@/data/subjects";
import {
  BR_STATES,
  BR_STATE_NAMES,
  COUNTRY_OF,
  FOREIGN_UNIVERSITIES,
  UNIVERSITIES,
} from "@/data/universities";
import { ExamStep, canAdvanceExamStep } from "@/components/onboarding/ExamStep";
import { TimeStep } from "@/components/onboarding/TimeStep";
import { FocusStep, canAdvanceFocusStep } from "@/components/onboarding/FocusStep";
import { PlacementOffer } from "@/components/onboarding/PlacementOffer";
import { FEATURES } from "@/lib/features";

export const Route = createFileRoute("/quiz")({ component: Quiz, ssr: false });

const LEVELS = [
  "1º ano do ensino médio",
  "2º ano do ensino médio",
  "3º ano do ensino médio",
  "Ensino médio concluído",
  "Retomando os estudos",
];

/**
 * Quiz unificado de entrada — substitui /signup + /onboarding (SDD 12, Development 1).
 * É "criar conta" disfarçado de quiz: nenhum e-mail ou senha, só perguntas que geram
 * valor imediato. Curto de propósito — o aluno chega ao diagnóstico em menos de um minuto.
 *
 * `exam`/`time`/`focus` são novos (docs/30 §12.2, Fase 13 do docs/31 F13.1) —
 * 9 passos ao todo, agrupados em 3 blocos (kicker de cada `Wrap`): "Você"
 * (name/level), "Sua prova" (exam/state/target/course), "Seu ritmo"
 * (subjects/time/focus).
 */
const STEPS = ["name", "level", "exam", "state", "target", "course", "subjects", "time", "focus"] as const;

function Quiz() {
  const nav = useNavigate();
  const s = useAppState();
  const [idx, setIdx] = useState(0);
  const [oferta, setOferta] = useState(false);
  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  function fecharQuiz() {
    completeQuiz([], computeGaps([], s.prefs.difficultSubjects));
  }

  function next() {
    if (isLast) {
      if (FEATURES.nivelamento) {
        setOferta(true);
        return;
      }
      fecharQuiz();
      nav({ to: "/aha" });
      return;
    }
    setIdx(idx + 1);
  }

  if (oferta) {
    return (
      <PhoneFrame variant="reading">
        <div className="flex min-h-screen flex-col justify-center bg-neve px-6">
          <PlacementOffer
            onFazer={() => {
              fecharQuiz();
              nav({ to: "/nivelamento" });
            }}
            onPular={() => {
              fecharQuiz();
              nav({ to: "/aha" });
            }}
          />
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame variant="reading">
      <div className="flex min-h-screen flex-col bg-neve">
        {/* Barra de progresso estilo Stories */}
        <header className="px-5 pt-6">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-gelo">
                <div
                  className="h-full rounded-full bg-mar transition-all duration-300"
                  style={{ width: i < idx ? "100%" : i === idx ? "45%" : "0%" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (idx === 0 ? nav({ to: "/welcome" }) : setIdx(idx - 1))}
              className="min-h-11 text-sm font-bold text-nevoa"
            >
              ← Voltar
            </button>
            <div className="flex items-center gap-1.5">
              <FocaMark size={18} decorative />
              <span className="font-display text-sm font-bold text-abismo">Foca</span>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 pt-8 pb-32">
          <StepView step={step} onNext={next} />
        </div>

        <footer className="fixed bottom-0 left-1/2 col-max-w -translate-x-1/2 border-t-2 border-gelo bg-neve/95 px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur">
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance(step, s)}
            className="btn-primary w-full disabled:opacity-30"
          >
            {isLast ? "Ver meu diagnóstico" : "Continuar"}
          </button>
        </footer>
      </div>
    </PhoneFrame>
  );
}

function canAdvance(step: string, s: ReturnType<typeof useAppState>) {
  const p = s.prefs;
  if (step === "name") return p.name.trim().length > 0;
  if (step === "level") return !!p.level;
  if (step === "exam") return canAdvanceExamStep(p.examTargets);
  if (step === "state") return !!p.residenceState;
  if (step === "target") return !!p.targetInstitution;
  if (step === "course") return !!p.targetCourse;
  if (step === "subjects") return p.difficultSubjects.length > 0;
  if (step === "time") return !!p.dailyMinutes;
  if (step === "focus") return canAdvanceFocusStep(p.studyFocus);
  return true;
}

function StepView({ step, onNext }: { step: string; onNext: () => void }) {
  const s = useAppState();
  const p = s.prefs;
  const set = (fn: (prefs: Prefs) => void) =>
    setState((st) => {
      fn(st.prefs);
      return st;
    });

  if (step === "name")
    return (
      <Wrap
        kicker="Vamos começar"
        title="Como devemos te chamar?"
        hint="Sem e-mail, sem senha. Só o seu nome."
      >
        <input
          autoFocus
          aria-label="Seu primeiro nome"
          autoComplete="given-name"
          name="nome"
          value={p.name}
          onChange={(e) =>
            set((pp) => {
              pp.name = e.target.value;
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && p.name.trim()) onNext();
          }}
          placeholder="Seu primeiro nome"
          className="input-ds font-display text-lg font-bold"
        />
      </Wrap>
    );

  if (step === "level")
    return (
      <Wrap kicker="Você" title="Em que ponto você está?">
        <div className="flex flex-col gap-2.5">
          {LEVELS.map((v) => (
            <Choice
              key={v}
              label={v}
              on={p.level === v}
              onClick={() => {
                set((pp) => {
                  pp.level = v;
                });
                onNext();
              }}
            />
          ))}
        </div>
      </Wrap>
    );

  if (step === "state")
    return (
      <Wrap
        kicker="Sua prova"
        title="Onde você mora?"
        hint="Usamos para sugerir as faculdades certas."
      >
        <div className="relative">
          <select
            aria-label="Onde você mora?"
            value={p.residenceState}
            onChange={(e) => {
              const st = e.target.value;
              set((pp) => {
                pp.residenceState = st;
                if (st && !pp.interestStates.includes(st)) pp.interestStates.push(st);
              });
            }}
            className="input-ds appearance-none pr-11 font-display font-bold"
          >
            <option value="">Selecione seu estado</option>
            {BR_STATES.map((st) => (
              <option key={st} value={st}>
                {BR_STATE_NAMES[st]} ({st})
              </option>
            ))}
          </select>
          <ChevronDown
            size={20}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-nevoa"
          />
        </div>
      </Wrap>
    );

  if (step === "exam") return <ExamStep />;

  if (step === "target") return <TargetStep onNext={onNext} />;

  if (step === "course") return <CourseStepView onNext={onNext} />;

  if (step === "subjects")
    return (
      <Wrap kicker="Seu ritmo" title="O que mais te trava hoje?" hint="Escolha uma ou mais.">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => {
            const on = p.difficultSubjects.includes(sub.name);
            return (
              <button
                type="button"
                key={sub.id}
                onClick={() =>
                  set((pp) => {
                    pp.difficultSubjects = on
                      ? pp.difficultSubjects.filter((x) => x !== sub.name)
                      : [...pp.difficultSubjects, sub.name];
                  })
                }
                className={`chip ${on ? "chip-on" : ""}`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
        <EasySubjectsDisclosure />
      </Wrap>
    );

  if (step === "time") return <TimeStep />;

  if (step === "focus") return <FocusStep />;

  return null;
}

/** Seção recolhida "Alguma você já manda bem?" (docs/30 §12.2, Fase 13 F13.1) — opcional, dentro da tela de matérias difíceis. */
function EasySubjectsDisclosure() {
  const s = useAppState();
  const [aberta, setAberta] = useState(false);
  const p = s.prefs;

  if (!aberta) {
    return (
      <button
        type="button"
        onClick={() => setAberta(true)}
        className="mt-4 text-sm font-semibold text-mar-fundo underline underline-offset-2"
      >
        Alguma você já manda bem?
      </button>
    );
  }

  return (
    <div className="mt-4">
      <p className="ds-label">Alguma você já manda bem?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SUBJECTS.map((sub) => {
          const on = p.easySubjects.includes(sub.name);
          return (
            <button
              type="button"
              key={sub.id}
              onClick={() =>
                setEasySubjects(on ? p.easySubjects.filter((x) => x !== sub.name) : [...p.easySubjects, sub.name])
              }
              className={`chip ${on ? "chip-on" : ""}`}
            >
              {sub.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CourseStepView({ onNext }: { onNext: () => void }) {
  const s = useAppState();
  const p = s.prefs;

  return (
    <Wrap
      kicker="Sua prova"
      title="Qual curso você quer?"
      hint={
        p.targetInstitution && p.targetInstitution !== "Ainda não decidi"
          ? `Em ${p.targetInstitution}, ou onde der certo.`
          : "Não precisa ter certeza — dá pra mudar depois."
      }
    >
      <CourseStep
        value={p.targetCourse}
        onSelect={(curso) => {
          setState((st) => {
            st.prefs.targetCourse = curso;
            return st;
          });
          onNext();
        }}
      />
    </Wrap>
  );
}

function TargetStep({ onNext }: { onNext: () => void }) {
  const s = useAppState();
  const p = s.prefs;
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<"br" | "world">("br");

  // No Brasil, as do estado do aluno vêm primeiro — é o resultado mais provável.
  const brPool = [
    ...(UNIVERSITIES[p.residenceState] || []),
    ...Object.entries(UNIVERSITIES)
      .filter(([st]) => st !== p.residenceState)
      .flatMap(([, us]) => us),
  ];
  const pool = scope === "br" ? brPool : FOREIGN_UNIVERSITIES;
  const filtered = q ? pool.filter((u) => u.toLowerCase().includes(q.toLowerCase())) : pool;
  const list = filtered.slice(0, 12);

  const legend = (u: string) =>
    scope === "world"
      ? COUNTRY_OF[u]
      : Object.entries(UNIVERSITIES).find(([, us]) => us.includes(u))?.[0];

  return (
    <Wrap
      kicker="Sua prova"
      title="Qual é o seu alvo?"
      hint="A faculdade que você quer. É por ela que vamos montar seu plano."
    >
      <div className="mb-3 flex gap-2">
        {(
          [
            ["br", "Brasil"],
            ["world", "Exterior"],
          ] as const
        ).map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => {
              setScope(key);
              setQ("");
            }}
            className={`chip ${scope === key ? "chip-on" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        aria-label={scope === "br" ? "Buscar faculdade no Brasil" : "Buscar faculdade no exterior"}
        autoComplete="off"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={
          scope === "br" ? "Buscar faculdade no Brasil..." : "Buscar faculdade no exterior..."
        }
        className="input-ds mb-3"
      />

      <div className="flex flex-col gap-2">
        {list.map((u) => (
          <button
            type="button"
            key={u}
            onClick={() => {
              setState((st) => {
                st.prefs.targetInstitution = u;
                if (!st.prefs.institutions.includes(u)) st.prefs.institutions.push(u);
                return st;
              });
              onNext();
            }}
            className={`card-press flex items-center justify-between gap-3 px-4 py-3 text-left ${
              p.targetInstitution === u ? "border-mar bg-mar/8" : ""
            }`}
          >
            <span className="min-w-0 text-sm font-semibold text-abismo">{u}</span>
            <span className="shrink-0 text-[11px] font-semibold text-nevoa">{legend(u)}</span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="py-4 text-center text-sm text-nevoa">Nenhuma faculdade encontrada.</p>
        )}
      </div>

      {filtered.length > list.length && (
        <p className="mt-3 text-center text-xs text-nevoa">
          +{filtered.length - list.length} outras — refine a busca
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setState((st) => {
            st.prefs.targetInstitution = "Ainda não decidi";
            return st;
          });
          onNext();
        }}
        className="mt-3 w-full rounded-lg border-2 border-dashed border-gelo py-3 text-sm font-semibold text-nevoa"
      >
        Ainda não decidi
      </button>
    </Wrap>
  );
}

function Wrap({
  kicker,
  title,
  hint,
  children,
}: {
  kicker: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="ds-label">{kicker}</div>
      <h2 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-abismo">
        {title}
      </h2>
      {hint && <p className="mt-2 text-sm leading-relaxed text-nevoa">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card-press px-4 py-3.5 text-left text-sm font-semibold text-abismo ${
        on ? "border-mar bg-mar/8" : ""
      }`}
    >
      {label}
    </button>
  );
}
