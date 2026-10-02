import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { DadosDaConta } from "@/components/conta/DadosDaConta";
import { SecaoConta } from "@/components/conta/SecaoConta";
import { SecaoAssinatura } from "@/components/planos/SecaoAssinatura";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { CourseStep } from "@/components/onboarding/CourseStep";
import { FocusSheet } from "@/components/learning/journey/FocusSheet";
import { activeFocusNames } from "@/components/learning/journey/FocusLine";
import { setAudioEnabled, unlockAudioFromGesture } from "@/lib/audio/engine";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";
import { sessao } from "@/lib/sessao";
import { EXAM_MAP, EXAMS } from "@/data/exams";
import { FEATURES } from "@/lib/features";
import {
  useAppState,
  beginPlacement,
  getState,
  logout,
  reset,
  setDailyMinutes,
  setExamTarget,
  setPrefs,
  setState,
  setShowExamTips,
  setStudyFocus,
  startFocusSession,
  clearFocusSession,
  nivelDeXp,
} from "@/lib/store";
import { studyFocusVazio } from "@/lib/learning/types";
import { ChevronRight, LogOut, RotateCcw, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({ component: Profile, ssr: false });

const MINUTOS_OPCOES = [5, 10, 15, 20, 30] as const;

function Profile() {
  const s = useAppState();
  const nav = useNavigate();
  const p = s.prefs;
  const [focusSheetOpen, setFocusSheetOpen] = useState(false);
  const [cursoSheetOpen, setCursoSheetOpen] = useState(false);
  const nivel = nivelDeXp(s.progress.xp);
  // Com conta, nome e e-mail vêm da conta, não do aparelho (spec 49 D49-13): quem entrou pelo Google nunca preencheu
  // `prefs.name` e via "Sem nome". `null` = ainda carregando.
  const [conta, setConta] = useState<{ comConta: boolean; nome: string | null; email: string | null } | null>(null);
  const [nomeAberto, setNomeAberto] = useState(false);
  useEffect(() => {
    let vivo = true;
    sessao().then(
      (x) => {
        if (!vivo) return;
        const comConta = x.autenticado && x.modo === "contas";
        setConta({ comConta, nome: x.nome, email: x.email });
        // Saudações e Foca usam `prefs.name`: com conta e sem nome no aparelho, usa o primeiro nome da conta.
        if (comConta && x.nome && !getState().prefs.name) {
          const primeiro = x.nome.trim().split(/\s+/)[0];
          setState((ss) => {
            ss.prefs.name = primeiro;
            return ss;
          });
        }
      },
      () => vivo && setConta({ comConta: false, nome: null, email: null }),
    );
    return () => {
      vivo = false;
    };
  }, []);
  const nomeExibido = (conta?.comConta ? conta.nome : null) || p.name || "";
  const initials = (nomeExibido || "F T")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppShell title="Perfil" layout="wide">
      <div className="desk-colunas px-5 pt-4 space-y-4 lg:px-8">
        <div className="card-soft p-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gelo font-display text-lg font-bold text-abismo">
              {initials}
            </div>
            <div className="min-w-0">
              {conta?.comConta ? (
                <button
                  type="button"
                  onClick={() => setNomeAberto(true)}
                  aria-label={`${COPY.perfil.editarNome}: ${nomeExibido || COPY.perfil.semNome}`}
                  className="tap-area block max-w-full text-left font-display font-bold text-abismo underline decoration-gelo decoration-2 underline-offset-4"
                  data-testid="perfil-nome"
                >
                  {/* O corte do texto fica no span: `truncate` no botão esconderia a área de toque ampliada (tap-area). */}
                  <span className="block truncate">{nomeExibido || COPY.perfil.semNome}</span>
                </button>
              ) : (
                <p className="font-display font-bold text-abismo truncate" data-testid="perfil-nome">
                  {nomeExibido || COPY.perfil.semNome}
                </p>
              )}
              <p className="truncate text-xs text-nevoa" data-testid="perfil-email">
                {(conta?.comConta ? conta.email : null) || p.email || "—"}
              </p>
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
              type="button"
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
              type="button"
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
                type="button"
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
                  type="button"
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
                  type="button"
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
            type="button"
            onClick={() => setShowExamTips(!p.showExamTips)}
            aria-pressed={p.showExamTips}
            className={cn("chip mt-2.5 w-full justify-center", p.showExamTips && "chip-on")}
          >
            Dicas de prova {p.showExamTips ? "ativadas" : "desativadas"}
          </button>
        </div>

        {FEATURES.jornadaAdaptativa && (
          <div className="card-soft p-4">
            <p className="ds-label">{COPY.foco.ritmoTitulo}</p>
            <p className="mt-1 text-xs text-nevoa">{COPY.foco.minutosPorDia}</p>
            <div className="mt-2.5 grid grid-cols-5 gap-2">
              {MINUTOS_OPCOES.map((min) => (
                <button
                  type="button"
                  key={min}
                  onClick={() => setDailyMinutes(min)}
                  aria-pressed={p.dailyMinutes === min}
                  className={cn("chip justify-center", p.dailyMinutes === min && "chip-on")}
                >
                  {min}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFocusSheetOpen(true)}
              className="chip mt-2.5 w-full justify-center"
            >
              {activeFocusNames(p.studyFocus, s.learning.focusSession)?.join(", ") ?? COPY.foco.todasAsMaterias}
            </button>
            <FocusSheet
              open={focusSheetOpen}
              onClose={() => setFocusSheetOpen(false)}
              studyFocus={p.studyFocus}
              onApply={(subjectIds, scope) => {
                if (scope === "session") startFocusSession(subjectIds);
                else setStudyFocus({ mode: "materias", subjectIds, areas: [] });
                setFocusSheetOpen(false);
              }}
              onClear={() => {
                clearFocusSession();
                setStudyFocus(studyFocusVazio());
                setFocusSheetOpen(false);
              }}
            />
          </div>
        )}

        {FEATURES.nivelamento && (
          <div className="card-soft p-4">
            <p className="ds-label">{COPY.nivelamento.tituloRota}</p>
            <p className="mt-1 text-xs text-nevoa">{COPY.onboarding.ofertaCorpo}</p>
            <button
              type="button"
              onClick={() => {
                // "Refazer" precisa começar um placement NOVO antes de navegar — a
                // rota `/nivelamento` só chama `beginPlacement` sozinha quando não
                // existe nenhum ainda, senão o resultado recém-concluído nunca
                // apareceria pro aluno que acabou de terminar (docs/32 Fase 13).
                if (s.learning.placement?.status === "concluido") beginPlacement(`plc-${Date.now()}`);
                nav({ to: "/nivelamento" });
              }}
              className="btn-outline mt-2.5 w-full"
            >
              {s.learning.placement?.status === "concluido"
                ? COPY.nivelamento.refazerNivelamento
                : s.learning.placement
                  ? COPY.nivelamento.continuarNivelamento
                  : COPY.nivelamento.fazerNivelamento}
            </button>
          </div>
        )}

        <SecaoAssinatura />

        <div className="card-soft divide-y divide-gelo">
          <Row label="Refazer meu diagnóstico" onClick={() => nav({ to: "/quiz" })} />
          <Row label="Meu plano" onClick={() => nav({ to: "/plan" })} />
          {conta?.comConta && <Row label={COPY.caderno.link} onClick={() => nav({ to: "/caderno" })} />}
          {/* Ranking 18+ (spec 49 §5.6): entrar, ver e sair ficam na própria tela. */}
          {conta?.comConta && <Row label={COPY.ranking.titulo} onClick={() => nav({ to: "/ranking" })} />}
          <Row label="Meta diária" value={`${p.dailyLessons} aulas de 60s`} />
          <Row label="Faculdade-alvo" value={p.targetInstitution || "—"} />
          <div className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0 text-sm font-semibold text-abismo">
              {COPY.cursos.perfilRotulo}: <span className="break-words font-normal text-nevoa">{p.targetCourse || "—"}</span>
            </span>
            <button type="button" onClick={() => setCursoSheetOpen(true)} className="chip shrink-0">
              {COPY.cursos.perfilMudar}
            </button>
          </div>
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
          <Row label={COPY.conta.termos} onClick={() => nav({ to: "/termos" })} />
          <Row label={COPY.conta.privacidade} onClick={() => nav({ to: "/privacidade" })} />
          <Row label={COPY.creditos.titulo} onClick={() => nav({ to: "/creditos" })} />
        </div>

        {conta && !conta.comConta && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                nav({ to: "/" });
              }}
              className="btn-ghost w-full text-sm"
            >
              <RotateCcw size={14} /> Resetar demonstração
            </button>
          </div>
        )}

        <SecaoConta />
        <DadosDaConta />
      </div>
      <BottomSheet open={nomeAberto} onClose={() => setNomeAberto(false)} title={COPY.perfil.editarNome}>
        <EditarNome
          inicial={nomeExibido}
          onSalvo={(nome) => {
            setConta((c) => (c ? { ...c, nome } : c));
            setState((ss) => {
              ss.prefs.name = nome.split(/\s+/)[0];
              return ss;
            });
            setNomeAberto(false);
          }}
        />
      </BottomSheet>
      <BottomSheet open={cursoSheetOpen} onClose={() => setCursoSheetOpen(false)} title={COPY.cursos.perfilSheetTitulo}>
        <div className="max-h-[70vh] overflow-y-auto pb-1">
          <CourseStep
            value={p.targetCourse}
            onSelect={(curso) => {
              setState((st) => {
                st.prefs.targetCourse = curso;
                return st;
              });
              setCursoSheetOpen(false);
            }}
          />
        </div>
      </BottomSheet>
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
      type="button"
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

/** Edita o nome da conta (spec 49 D49-13): grava no servidor pelo Better Auth; ano e aceite continuam protegidos (DV49-01). */
function EditarNome({ inicial, onSalvo }: { inicial: string; onSalvo: (nome: string) => void }) {
  const [nome, setNome] = useState(inicial);
  const [estado, setEstado] = useState<"livre" | "salvando" | "erro" | "curto">("livre");
  async function salvar() {
    const limpo = nome.trim().replace(/\s+/g, " ").slice(0, 60);
    if (limpo.length < 2) {
      setEstado("curto");
      return;
    }
    setEstado("salvando");
    try {
      const { error } = await authClient.updateUser({ name: limpo });
      if (error) throw new Error(error.message);
      await sessao(true).catch(() => undefined);
      setEstado("livre");
      onSalvo(limpo);
    } catch {
      setEstado("erro");
    }
  }
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void salvar();
      }}
    >
      <label className="block text-sm font-semibold text-abismo" htmlFor="perfil-nome-input">
        {COPY.perfil.nomeRotulo}
      </label>
      <input
        id="perfil-nome-input"
        className="input-ds"
        value={nome}
        maxLength={60}
        autoComplete="name"
        onChange={(e) => setNome(e.target.value)}
        aria-describedby="perfil-nome-ajuda"
      />
      <p id="perfil-nome-ajuda" className="text-xs text-nevoa">
        {COPY.perfil.nomeAjuda}
      </p>
      {(estado === "erro" || estado === "curto") && (
        <p role="alert" className="text-sm text-error">
          {estado === "erro" ? COPY.perfil.nomeErro : COPY.perfil.nomeCurto}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={estado === "salvando"}>
        {estado === "salvando" ? COPY.perfil.salvando : COPY.perfil.salvar}
      </button>
    </form>
  );
}
