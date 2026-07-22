import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bolt, PhoneFrame } from "@/components/AppShell";
import { completeQuiz, setState, useAppState, type Prefs } from "@/lib/store";
import { computeGaps } from "@/lib/gaps";
import { ChevronDown } from "lucide-react";
import { AREA_OF, COURSES } from "@/data/courses";
import { SUBJECTS } from "@/data/subjects";
import {
  BR_STATES,
  BR_STATE_NAMES,
  COUNTRY_OF,
  FOREIGN_UNIVERSITIES,
  UNIVERSITIES,
} from "@/data/universities";

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
 */
const STEPS = ["name", "level", "state", "target", "course", "subjects"] as const;

function Quiz() {
  const nav = useNavigate();
  const s = useAppState();
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  function next() {
    if (isLast) {
      completeQuiz([], computeGaps([], s.prefs.difficultSubjects));
      nav({ to: "/aha" });
      return;
    }
    setIdx(idx + 1);
  }

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col bg-navy text-white">
        {/* Barra de progresso estilo Stories */}
        <header className="px-5 pt-6">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-yellow transition-all duration-300"
                  style={{ width: i < idx ? "100%" : i === idx ? "45%" : "0%" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => (idx === 0 ? nav({ to: "/welcome" }) : setIdx(idx - 1))}
              className="text-sm font-semibold text-navy-mist"
            >
              ← Voltar
            </button>
            <div className="flex items-center gap-1.5">
              <Bolt size={14} />
              <span className="font-display text-sm font-bold">Flash Test</span>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 pt-8 pb-32">
          <StepView step={step} onNext={next} />
        </div>

        <footer className="fixed bottom-0 left-1/2 w-full max-w-[440px] -translate-x-1/2 bg-navy px-6 pt-3 pb-6">
          <button
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
  if (step === "state") return !!p.residenceState;
  if (step === "target") return !!p.targetInstitution;
  if (step === "course") return !!p.targetCourse;
  if (step === "subjects") return p.difficultSubjects.length > 0;
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
          className="w-full rounded-[10px] border-2 border-white/20 bg-white/10 px-4 py-4 font-display text-xl font-bold text-white outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-navy-mist focus:border-yellow"
        />
      </Wrap>
    );

  if (step === "level")
    return (
      <Wrap kicker="Etapa 2" title="Em que ponto você está?">
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
        kicker="Etapa 3"
        title="Onde você mora?"
        hint="Usamos para sugerir as faculdades certas."
      >
        <div className="relative">
          <select
            value={p.residenceState}
            onChange={(e) => {
              const st = e.target.value;
              set((pp) => {
                pp.residenceState = st;
                if (st && !pp.interestStates.includes(st)) pp.interestStates.push(st);
              });
            }}
            className="w-full appearance-none rounded-[10px] border-2 border-white/20 bg-white/10 px-4 py-4 pr-11 font-display text-lg font-bold text-white outline-none focus:border-yellow"
          >
            <option value="" style={{ color: "#8B91A8" }}>
              Selecione seu estado
            </option>
            {BR_STATES.map((st) => (
              <option key={st} value={st} style={{ color: "#02104E" }}>
                {BR_STATE_NAMES[st]} ({st})
              </option>
            ))}
          </select>
          <ChevronDown
            size={20}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-navy-mist"
          />
        </div>
      </Wrap>
    );

  if (step === "target") return <TargetStep onNext={onNext} />;

  if (step === "course") return <CourseStep onNext={onNext} />;

  if (step === "subjects")
    return (
      <Wrap kicker="Última etapa" title="O que mais te trava hoje?" hint="Escolha uma ou mais.">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => {
            const on = p.difficultSubjects.includes(sub.name);
            return (
              <button
                key={sub.id}
                onClick={() =>
                  set((pp) => {
                    pp.difficultSubjects = on
                      ? pp.difficultSubjects.filter((x) => x !== sub.name)
                      : [...pp.difficultSubjects, sub.name];
                  })
                }
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  on ? "bg-yellow text-navy" : "bg-white/10 text-white"
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      </Wrap>
    );

  return null;
}

function CourseStep({ onNext }: { onNext: () => void }) {
  const s = useAppState();
  const p = s.prefs;
  const [q, setQ] = useState("");
  const filtered = q ? COURSES.filter((c) => c.toLowerCase().includes(q.toLowerCase())) : COURSES;
  const list = filtered.slice(0, 12);

  return (
    <Wrap
      kicker="Etapa 5"
      title="Qual curso você quer?"
      hint={
        p.targetInstitution && p.targetInstitution !== "Ainda não decidi"
          ? `Em ${p.targetInstitution}, ou onde der certo.`
          : "Não precisa ter certeza — dá pra mudar depois."
      }
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar curso..."
        className="mb-3 w-full rounded-[10px] border-2 border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-navy-mist focus:border-yellow"
      />
      <div className="flex flex-col gap-2">
        {list.map((c) => (
          <button
            key={c}
            onClick={() => {
              setState((st) => {
                st.prefs.targetCourse = c;
                return st;
              });
              onNext();
            }}
            className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
              p.targetCourse === c ? "border-yellow bg-yellow/15" : "border-white/15 bg-white/5"
            }`}
          >
            <span className="min-w-0 text-sm font-semibold text-white">{c}</span>
            <span className="shrink-0 text-[11px] font-semibold text-navy-mist">{AREA_OF[c]}</span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="py-4 text-center text-sm text-navy-mist">Nenhum curso encontrado.</p>
        )}
      </div>

      {filtered.length > list.length && (
        <p className="mt-3 text-center text-xs text-navy-mist">
          +{filtered.length - list.length} outros — refine a busca
        </p>
      )}

      <button
        onClick={() => {
          setState((st) => {
            st.prefs.targetCourse = "Ainda não decidi";
            return st;
          });
          onNext();
        }}
        className="mt-3 w-full rounded-[10px] border border-dashed border-white/30 py-3 text-sm font-semibold text-navy-mist"
      >
        Ainda não decidi
      </button>
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
      kicker="Etapa 4"
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
            key={key}
            onClick={() => {
              setScope(key);
              setQ("");
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              scope === key ? "bg-yellow text-navy" : "bg-white/10 text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={
          scope === "br" ? "Buscar faculdade no Brasil..." : "Buscar faculdade no exterior..."
        }
        className="mb-3 w-full rounded-[10px] border-2 border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-navy-mist focus:border-yellow"
      />

      <div className="flex flex-col gap-2">
        {list.map((u) => (
          <button
            key={u}
            onClick={() => {
              setState((st) => {
                st.prefs.targetInstitution = u;
                if (!st.prefs.institutions.includes(u)) st.prefs.institutions.push(u);
                return st;
              });
              onNext();
            }}
            className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
              p.targetInstitution === u
                ? "border-yellow bg-yellow/15"
                : "border-white/15 bg-white/5"
            }`}
          >
            <span className="min-w-0 text-sm font-semibold text-white">{u}</span>
            <span className="shrink-0 text-[11px] font-semibold text-navy-mist">{legend(u)}</span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="py-4 text-center text-sm text-navy-mist">Nenhuma faculdade encontrada.</p>
        )}
      </div>

      {filtered.length > list.length && (
        <p className="mt-3 text-center text-xs text-navy-mist">
          +{filtered.length - list.length} outras — refine a busca
        </p>
      )}

      <button
        onClick={() => {
          setState((st) => {
            st.prefs.targetInstitution = "Ainda não decidi";
            return st;
          });
          onNext();
        }}
        className="mt-3 w-full rounded-[10px] border border-dashed border-white/30 py-3 text-sm font-semibold text-navy-mist"
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
      <div className="ds-label" style={{ color: "#FEB803" }}>
        {kicker}
      </div>
      <h2 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-white">
        {title}
      </h2>
      {hint && <p className="mt-2 text-sm leading-relaxed text-navy-mist">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition ${
        on ? "border-yellow bg-yellow/15 text-white" : "border-white/15 bg-white/5 text-white"
      }`}
    >
      {label}
    </button>
  );
}
