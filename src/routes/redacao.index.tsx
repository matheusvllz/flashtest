import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Lock, Star, PenLine } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { TRILHAS, TOTAL_LICOES, allLessonsInOrder } from "@/content/trilhas";
import { useAppState, isLessonUnlocked } from "@/lib/store";
import type { Trilha } from "@/lib/lessons/types";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { tarefasDepoisDe } from "@/content/tarefas-escrita";
import { minhasTarefasDeEscrita } from "@/lib/api/redacao";
import type { WritingTask } from "@/lib/lessons/types";

export const Route = createFileRoute("/redacao/")({ component: Redacao, ssr: false });

function Redacao() {
  const s = useAppState();
  const done = s.progress.lessons;
  const doneCount = Object.keys(done).length;

  // "Continuar de onde parou": a primeira lição ainda não concluída na ordem
  // de desbloqueio. É o CTA principal — ninguém deve precisar caçar onde parou.
  const next = useMemo(() => allLessonsInOrder().find(({ lesson }) => !done[lesson.id]), [done]);

  // Detecta se uma lição foi desbloqueada desde a última visita a esta tela —
  // o nó recém-liberado entra com pop-in em vez do respiro contínuo (docs/18 §13.7).
  const [houveDesbloqueio, setHouveDesbloqueio] = useState(false);
  useEffect(() => {
    let anterior = 0;
    try {
      anterior = Number(sessionStorage.getItem("foca.licoes.n") ?? "0");
    } catch {
      // sessionStorage indisponível — segue sem a animação de destrave.
    }
    if (doneCount > anterior) setHouveDesbloqueio(true);
    try {
      sessionStorage.setItem("foca.licoes.n", String(doneCount));
    } catch {
      // idem.
    }
  }, [doneCount]);

  // Tarefas de escrita já enviadas (spec 50 §5.10.1): só para o selo "Enviada" nos nós "Escreva"; sem rede, sem selo.
  const temConta = !!s.account?.userId;
  const [tarefasEnviadas, setTarefasEnviadas] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    if (!temConta) return;
    let vivo = true;
    minhasTarefasDeEscrita()
      .then((r) => {
        if (vivo && r.ok) setTarefasEnviadas(new Set(r.tarefas.map((x) => x.tarefaId)));
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [temConta]);

  const [eixo, setEixo] = useState<"redacao" | "base">("redacao");
  const trilhas = TRILHAS.filter((t) => t.eixo === eixo);

  return (
    <AppShell layout="wide">
      {/* Desktop (spec 48 T-48.7.1, B-074): resumo e "continuar" num painel fixo à direita; as trilhas em duas
          colunas. No celular, a ordem de sempre. */}
      <div className="desk-split">
        <div className="desk-aside bg-neve px-5 pt-8 pb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PenLine size={18} className="text-mar-fundo" />
              <p className="ds-label">Micro-treino de redação</p>
            </div>
            {/* Este mapa é o legado (docs/25 §11) — a trilha unificada (T-15/T-18)
              é o novo lugar-padrão; este link é a saída pra lá sem remover o mapa. */}
            <Link to="/trilha" className="btn-ghost shrink-0">
              Ver na trilha
            </Link>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-abismo">
            A nota 1000 sai de mil <br /> exercícios de 1 minuto
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <ProgressBar
              value={doneCount}
              max={TOTAL_LICOES}
              tone="caneta"
              label="Progresso geral da trilha"
              className="flex-1"
            />
            <span className="font-mono text-xs font-bold text-nevoa">
              {doneCount}/{TOTAL_LICOES}
            </span>
          </div>

          {next && (
            <Link
              to="/redacao/$licaoId"
              params={{ licaoId: next.lesson.id }}
              className="card-soft mt-5 block p-4"
              style={{ borderColor: "var(--mar)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="ds-label">
                    {doneCount === 0 ? "Comece por aqui" : "Continuar de onde parou"}
                  </p>
                  <p className="mt-1.5 font-display text-base font-bold leading-tight text-abismo">
                    {next.lesson.titulo}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-nevoa">
                    {next.trilha.nome} · {next.lesson.exercicios.length} exercícios
                  </p>
                </div>
                <FocaMark size={22} decorative />
              </div>
              <span className="btn-primary mt-3 w-full">Praticar</span>
            </Link>
          )}

          {/* Corretor e treino por partes (spec 49 §5.9): Pro; quem não tem o plano vê o convite na própria tela. */}
          {s.account?.userId && (
            <div className="mt-4 grid grid-cols-2 gap-2" data-testid="redacao-ia-links">
              <Link to="/redacao/treino" className="card-soft flex min-h-12 items-center justify-center p-3 text-center text-sm font-bold text-abismo">
                {COPY.redacaoIa.treinoTitulo}
              </Link>
              <Link to="/redacao/corretor" className="card-soft flex min-h-12 items-center justify-center p-3 text-center text-sm font-bold text-abismo">
                {COPY.redacaoIa.corretorTitulo}
              </Link>
            </div>
          )}
        </div>

        <div className="desk-main">
          {/* Eixos: a redação em si e a base de português que sustenta a nota. */}
          <div className="sticky top-0 z-10 flex gap-2 border-b-2 border-gelo bg-neve/95 px-5 py-3 backdrop-blur">
            <button
              type="button"
              onClick={() => setEixo("redacao")}
              className={cn("chip", eixo === "redacao" && "chip-on")}
            >
              Redação
            </button>
            <button
              type="button"
              onClick={() => setEixo("base")}
              className={cn("chip", eixo === "base" && "chip-on")}
            >
              Base de português
            </button>
          </div>

          <div className="desk-grid space-y-5 bg-neve px-5 py-5 lg:space-y-0">
            {trilhas.map((trilha) => (
              <TrilhaCard
                key={trilha.id}
                trilha={trilha}
                state={s}
                houveDesbloqueio={houveDesbloqueio}
                tarefasEnviadas={tarefasEnviadas}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TrilhaCard({
  trilha,
  state,
  houveDesbloqueio,
  tarefasEnviadas,
}: {
  trilha: Trilha;
  state: ReturnType<typeof useAppState>;
  houveDesbloqueio: boolean;
  tarefasEnviadas: ReadonlySet<string>;
}) {
  const done = state.progress.lessons;
  const concluidas = trilha.licoes.filter((l) => done[l.id]).length;
  // O "nó atual": primeira lição desbloqueada ainda não concluída desta trilha.
  const atualId = trilha.licoes.find(
    (l) => !done[l.id] && isLessonUnlocked(trilha.licoes, l.id, state),
  )?.id;

  return (
    <section className="card-soft overflow-hidden">
      <header className="border-b-2 border-gelo px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold leading-tight text-abismo">
              {trilha.nome}
            </h2>
            <p className="mt-1 text-xs leading-snug text-nevoa">{trilha.descricao}</p>
          </div>
          <span className="chip shrink-0">
            {concluidas}/{trilha.licoes.length}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar
            value={concluidas}
            max={trilha.licoes.length}
            tone="caneta"
            size="sm"
            label={`Progresso de ${trilha.nome}`}
          />
        </div>
      </header>

      <ul className="divide-y divide-gelo">
        {trilha.licoes.map((licao, i) => {
          const prog = done[licao.id];
          const unlocked = isLessonUnlocked(trilha.licoes, licao.id, state);
          const isAtual = licao.id === atualId;
          const content = (
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Nó da trilha: número, check ou cadeado. */}
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-[13px] font-bold",
                  prog
                    ? "bg-mar text-on-mar"
                    : isAtual
                      ? cn(
                          "border-2 text-abismo",
                          houveDesbloqueio ? "anim-pop-in" : "anim-breathe",
                        )
                      : unlocked
                        ? "border-2 border-abismo text-abismo"
                        : "bg-gelo text-nevoa",
                )}
                style={isAtual && !prog ? { borderColor: "var(--mar)" } : undefined}
              >
                {prog ? <Check size={18} strokeWidth={3} /> : unlocked ? i + 1 : <Lock size={14} />}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-display text-[14px] font-bold leading-tight",
                    unlocked ? "text-abismo" : "text-nevoa",
                  )}
                >
                  {licao.titulo}
                </p>
                {licao.descricao && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-nevoa">{licao.descricao}</p>
                )}
              </div>

              {prog ? (
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      size={16}
                      className={n <= prog.stars ? "fill-recompensa text-recompensa" : "text-gelo"}
                    />
                  ))}
                </div>
              ) : (
                unlocked && (
                  <span className="shrink-0 text-[11px] font-bold text-nevoa">
                    {licao.exercicios.length} ex.
                  </span>
                )
              )}
            </div>
          );

          return [
            <li key={licao.id}>
              {unlocked ? (
                <Link to="/redacao/$licaoId" params={{ licaoId: licao.id }} className="block">
                  {content}
                </Link>
              ) : (
                <div className="cursor-not-allowed opacity-60">{content}</div>
              )}
            </li>,
            // Nós "Escreva" (spec 50 §5.10.1): depois da lição do assunto; abrem quando ela está concluída.
            ...tarefasDepoisDe(licao.id).map((tarefa) => (
              <li key={tarefa.id}>
                <NoEscreva tarefa={tarefa} aberto={!!prog} enviada={tarefasEnviadas.has(tarefa.id)} />
              </li>
            )),
          ];
        })}
      </ul>
    </section>
  );
}

function NoEscreva({ tarefa, aberto, enviada }: { tarefa: WritingTask; aberto: boolean; enviada: boolean }) {
  const t = COPY.escrita;
  const content = (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-full",
          enviada ? "bg-mar text-on-mar" : aberto ? "border-2 border-dashed border-abismo text-abismo" : "bg-gelo text-nevoa",
        )}
      >
        {enviada ? <Check size={18} strokeWidth={3} /> : aberto ? <PenLine size={16} /> : <Lock size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="ds-label">{tarefa.modo === "completo" ? t.noCompleto : t.noTrecho}</p>
        <p className={cn("font-display text-[14px] font-bold leading-tight", aberto ? "text-abismo" : "text-nevoa")}>{tarefa.titulo}</p>
        {!aberto && <p className="mt-0.5 text-[11px] text-nevoa">{t.noBloqueado}</p>}
      </div>
      {enviada && <span className="chip shrink-0">{t.enviadaChip}</span>}
    </div>
  );
  return aberto ? (
    <Link to="/redacao/escreva/$tarefaId" params={{ tarefaId: tarefa.id }} className="block" data-testid={`no-escreva-${tarefa.id}`}>
      {content}
    </Link>
  ) : (
    <div className="cursor-not-allowed opacity-60" data-testid={`no-escreva-${tarefa.id}`}>
      {content}
    </div>
  );
}
