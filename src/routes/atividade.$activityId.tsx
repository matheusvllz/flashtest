import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { CheckpointIntro } from "@/components/learning/CheckpointIntro";
import { MicroLessonPlayer } from "@/components/learning/MicroLessonPlayer";
import { selectItemsForActivity } from "@/lib/adaptive";
import { CheckpointResult } from "@/components/learning/CheckpointResult";
import { itemMetaOf } from "@/content/items";
import { checkpointRecalibrationInputs, recalibrar, resultadoDaChecagem, type LinhaDaChecagem } from "@/lib/adaptive/checkpoint";
import { mastery } from "@/lib/adaptive/model";
import { buildActivityLesson } from "@/lib/adaptive/activity-lesson";
import { isReadyToResume } from "@/lib/adaptive/journey";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { carregarPacotesPara, carregarTodosOsPacotes } from "@/lib/content/preload";
import { COPY } from "@/lib/copy";
import { FEATURES } from "@/lib/features";
import {
  applyCheckpointRecalibration,
  completeJourneyActivity,
  guardarDominioAntesDaChecagem,
  discardJourneyActivity,
  getState,
  hojeISO,
  startJourneyActivity,
  useAppState,
} from "@/lib/store";

export const Route = createFileRoute("/atividade/$activityId")({
  component: Atividade,
  ssr: false,
});

/** Depois disto o "Separando suas questões…" vira o erro de carregamento (docs/36 RU-2 → RU-3). */
const LIMITE_CARREGANDO_MS = 10_000;
/** Só mostra o texto de carregamento se demorar mais que isto (docs/36 RU-2). */
const ATRASO_TEXTO_MS = 400;

/**
 * Recalibração pós-checkpoint (docs/36 T-04.4, RP-4): compara o que o modelo previa (`predictedP`,
 * gravado ANTES de cada resposta) com o que o aluno fez nas tentativas DESTE checkpoint — superestimadas
 * antecipam a revisão pra amanhã, subestimadas ficam elegíveis a desafio por 7 dias. Roda depois de
 * `completeJourneyActivity` e só na primeira conclusão da tentativa (idempotente de qualquer forma).
 */
function recalibrarDoCheckpoint(atividade: PlannedActivity, sessionId: string | null): void {
  const { learning } = getState();
  const entradas = checkpointRecalibrationInputs(learning.recentAttempts, {
    sessionId,
    itemIds: atividade.itemIds,
    startedAt: atividade.startedAt,
  });
  const r = recalibrar(entradas);
  applyCheckpointRecalibration({ antecipar: r.antecipandoRevisao, desafio: r.elegivelDesafio, today: hojeISO() });
}

/** Habilidades principais dos itens da checagem. */
function habilidadesDaChecagem(a: PlannedActivity): string[] {
  const ids = new Set<string>();
  for (const itemId of a.itemIds ?? []) {
    try {
      const sk = itemMetaOf(itemId).skillIds[0];
      if (sk) ids.add(sk);
    } catch {
      /* item sem metadados: fica de fora do retrato */
    }
  }
  return [...ids];
}

/** Domínio atual (0–100) de cada habilidade — o retrato de antes e o de depois da checagem. */
function retratoDoDominio(skillIds: string[]): Record<string, number> {
  const modelo = getState().learning.skillModel;
  return Object.fromEntries(skillIds.map((id) => [id, mastery(modelo[id])]));
}

/** Linhas do resultado da checagem (spec 48 T-48.5.1), calculadas logo depois da conclusão. */
function linhasDaChecagem(atividade: PlannedActivity, antes: Record<string, number> | undefined, sessionId: string | null): LinhaDaChecagem[] {
  const { learning } = getState();
  const entradas = checkpointRecalibrationInputs(learning.recentAttempts, { sessionId, itemIds: atividade.itemIds, startedAt: atividade.startedAt });
  return resultadoDaChecagem(antes, retratoDoDominio(entradas.map((e) => e.skillId)), entradas);
}

/** `true` quando a atividade já monta com o que está em memória (itens embarcados ou pacote já carregado). */
function consegueMontar(a: PlannedActivity): boolean {
  try {
    buildActivityLesson(a, a.itemIds ?? []);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prática/revisão/desafio/checkpoint da jornada (docs/30 §14.4, Fase 12 do
 * docs/31 F12.2) — mesmo `MicroLessonPlayer` das aulas, com uma
 * `MicroLessonV2` sintética (`buildActivityLesson`) e uma estratégia de
 * conclusão própria (`completeJourneyActivity`, paga XP pelo ledger, nunca
 * grava em `completedLessons`). Não é loader do router: o estado é síncrono
 * (`useAppState`), igual a `/learn/$lessonId`.
 *
 * Esta rota é a ÚNICA proprietária da seleção de itens (docs/36 RF-2, T-02.1):
 * a Home só navega. Estados: `isReadyToResume` → retoma com os mesmos
 * `itemIds`; senão carrega pacotes, escolhe itens e inicia a tentativa
 * (`startJourneyActivity`). Sem questões suficientes → descarta (RF-3); sem
 * pacote por falha de rede → erro com "Tentar de novo" (RU-3), nunca descarta.
 */
function Atividade() {
  const { activityId } = Route.useParams();
  const navigate = useNavigate();
  const s = useAppState();

  // Trava a atividade resolvida uma ÚNICA vez (achado real, F12.5: sem essa
  // trava, o efeito abaixo reavaliava a CADA mudança de store — inclusive as
  // que `completeJourneyActivity` provoca ao concluir, o que tira a
  // atividade de `committed`/`activeActivity` e disparava um redirect pra
  // `/trilha` bem no meio da tela de conclusão, antes do aluno ver o
  // resultado). Depois de travada, a atividade só muda se `activityId` mudar
  // (nova navegação pra outra atividade). SÓ marca DEPOIS que o trabalho
  // assíncrono termina de verdade (achado real, F14: em dev o React roda o
  // efeito 2x — a 1ª chamada é cancelada pelo próprio cleanup dela antes de
  // `carregarPacotesPara` resolver; marcar a trava ANTES disso impedia a 2ª
  // chamada, a que sobrevive, de sequer começar — `travada` nunca chegava a
  // ser setado e a tela ficava em branco pra sempre).
  const resolvidaRef = useRef<string | null>(null);
  const [travada, setTravada] = useState<PlannedActivity | null>(null);
  // Checagem já começada (retrato do Domínio gravado) não volta para a tela de entrada ao recarregar (spec 48 T-48.8.1).
  const [comecou, setComecou] = useState(() => {
    const ativa = getState().learning.journey.activeActivity;
    return ativa?.id === activityId && Boolean(ativa.masteryAntes);
  });
  /** Resultado da checagem, calculado na conclusão (spec 48 T-48.5.1). */
  const linhasRef = useRef<LinhaDaChecagem[] | null>(null);
  const [erroPacote, setErroPacote] = useState(false);
  const [lento, setLento] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const estadoRef = useRef(s);
  estadoRef.current = s;

  useEffect(() => {
    if (resolvidaRef.current === activityId) return;

    if (!FEATURES.jornadaAdaptativa) {
      navigate({ to: "/trilha", replace: true });
      return;
    }

    // A atividade só pode ser a que já está ativa OU a primeira comprometida
    // (docs/30 §14.4: "só a primeira comprometida pode começar; as outras
    // mostram 'a seguir'") — um id antigo, de outro dia, ou fora de ordem cai
    // no edge case "redireciona à home com a próxima" (docs/30 §14, Edge cases).
    const ativa = s.learning.journey.activeActivity;
    const candidata =
      ativa?.id === activityId
        ? ativa
        : s.learning.journey.committed[0]?.id === activityId
          ? s.learning.journey.committed[0]
          : null;
    if (!candidata) {
      navigate({ to: "/trilha", replace: true });
      return;
    }

    // Local a esta invocação do efeito (não um ref compartilhado): o cleanup
    // ABAIXO só cancela ESTA chamada específica, nunca marca `resolvidaRef`
    // — assim a invocação que sobra depois do StrictMode duplo ainda roda
    // do zero, e só ela, ao terminar de verdade, marca a trava.
    let cancelado = false;
    void (async () => {
      // Pacote da matéria em memória ANTES de escolher/montar (docs/30 §21.3) —
      // item de pacote só resolve depois de `ensureSubjects`. Checkpoint mistura
      // habilidades que só se sabe na composição: carrega todos os pacotes.
      const prontaParaRetomar = isReadyToResume(candidata);
      const carregou =
        candidata.kind === "checkpoint" && !prontaParaRetomar
          ? await carregarTodosOsPacotes()
          : await carregarPacotesPara(candidata.skillIds, prontaParaRetomar ? (candidata.itemIds ?? []) : []);
      if (cancelado) return;

      if (prontaParaRetomar) {
        // Retomada: os MESMOS `itemIds` (recarregar no meio não troca as questões,
        // docs/30 §14 edge case). Falha de rede só bloqueia se a atividade não
        // monta com o que já está em memória.
        if (!carregou && !consegueMontar(candidata)) {
          setErroPacote(true);
          return;
        }
        resolvidaRef.current = activityId;
        setErroPacote(false);
        // Garante `startedAt` também em `activeActivity` vindas de antes do plano 36.
        setTravada(candidata.startedAt ? candidata : startJourneyActivity(candidata));
        return;
      }

      // Rede falhou: NÃO descarta — o aluno pode tentar de novo (docs/36 RF-3/RU-3).
      if (!carregou) {
        setErroPacote(true);
        return;
      }

      // Itens escolhidos AGORA, ao começar (docs/30 §11.7) — nunca no planejamento.
      const itemIds = selectItemsForActivity(candidata, estadoRef.current, hojeISO(), candidata.id);
      resolvidaRef.current = activityId;
      if (itemIds.length < 2) {
        discardJourneyActivity(candidata.id, "sem-itens");
        navigate({ to: "/trilha", search: { pulada: "1" }, replace: true });
        return;
      }
      setErroPacote(false);
      setTravada(startJourneyActivity({ ...candidata, itemIds }));
    })();
    return () => {
      cancelado = true;
    };
  }, [s, activityId, navigate, tentativa]);

  // Carregando > 400 ms mostra texto (RU-2); > 10 s vira o erro (RU-3).
  useEffect(() => {
    if (travada || erroPacote) return;
    const t1 = setTimeout(() => setLento(true), ATRASO_TEXTO_MS);
    const t2 = setTimeout(() => setErroPacote(true), LIMITE_CARREGANDO_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [travada, erroPacote, tentativa]);

  function tentarDeNovo() {
    setErroPacote(false);
    setLento(false);
    setTentativa((n) => n + 1);
  }

  if (!travada) {
    if (erroPacote) {
      return (
        <PhoneFrame variant="reading">
          <div className="flex min-h-screen flex-col justify-center px-5">
            <h1 className="font-display text-xl font-bold text-abismo">{COPY.jornada.erroPacoteTitulo}</h1>
            <p className="mt-2 text-sm text-nevoa">{COPY.jornada.erroPacoteCorpo}</p>
            <button type="button" onClick={tentarDeNovo} className="btn-primary mt-6 w-full">
              {COPY.comum.tentarDeNovo}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/trilha", replace: true })}
              className="btn-outline mt-3 w-full"
            >
              {COPY.jornada.voltarTrilha}
            </button>
          </div>
        </PhoneFrame>
      );
    }
    return (
      <PhoneFrame variant="reading">
        <div className="flex min-h-screen items-center justify-center bg-neve px-5">
          {lento && (
            <p role="status" className="text-sm text-nevoa">
              {COPY.jornada.carregando}
            </p>
          )}
        </div>
      </PhoneFrame>
    );
  }

  // Checkpoint tem uma tela de entrada própria (docs/30 §13.3/§13.6, Fase 14
  // F14.4) — "Agora não" só volta pra trilha, sem chamar `completeJourneyActivity`
  // (nada é descontado; a comprometida não iniciada volta no próximo plano).
  if (travada.kind === "checkpoint" && !comecou) {
    return (
      <PhoneFrame variant="reading">
        <CheckpointIntro
          onComecar={() => {
            // Retrato do Domínio antes da primeira resposta (o "Subiu / Firme / Vale revisar" compara com ele).
            guardarDominioAntesDaChecagem(travada.id, retratoDoDominio(habilidadesDaChecagem(travada)));
            setComecou(true);
          }}
          onAgoraNao={() => navigate({ to: "/trilha", replace: true })}
        />
      </PhoneFrame>
    );
  }

  // Conteúdo que não monta (item removido do catálogo, pacote sem o item): a
  // atividade é DESCARTADA (docs/36 RF-3) e a Home repõe — nunca o loop
  // Home→atividade→Home de antes. `navigate()` NUNCA pode rodar direto no corpo
  // do render (achado real: "Cannot update a component (Transitioner) while
  // rendering a different component"), só num efeito — `AtividadeSemConteudo`.
  // `buildActivityLesson` continua chamada aqui (pura/determinística).
  let lesson;
  try {
    lesson = buildActivityLesson(travada, travada.itemIds ?? []);
  } catch {
    lesson = null;
  }

  if (!lesson) {
    return <AtividadeSemConteudo atividade={travada} navigate={navigate} />;
  }

  return (
    <MicroLessonPlayer
      key={lesson.id}
      lesson={lesson}
      mode={travada.kind === "checkpoint" ? "checkpoint" : "atividade"}
      onComplete={(correct, total) => {
        // Antes de concluir: a sessão e o retrato ainda estão na atividade em andamento.
        const { learning } = getState();
        const sessionId = learning.activeSession?.id ?? null;
        const antes = learning.journey.activeActivity?.id === travada.id ? learning.journey.activeActivity.masteryAntes : undefined;
        const resultado = completeJourneyActivity(travada, correct, total);
        if (travada.kind === "checkpoint" && !resultado.alreadyCompleted) {
          recalibrarDoCheckpoint(travada, sessionId);
          linhasRef.current = linhasDaChecagem(travada, antes, sessionId);
        }
        return resultado;
      }}
      conclusao={
        travada.kind === "checkpoint"
          ? ({ xpGanho }) => <CheckpointResult linhas={linhasRef.current ?? []} xpGanho={xpGanho} />
          : undefined
      }
    />
  );
}

/** Descarta e redireciona num efeito (não no render) — ver o comentário acima sobre o achado real. */
function AtividadeSemConteudo({
  atividade,
  navigate,
}: {
  atividade: PlannedActivity;
  navigate: ReturnType<typeof useNavigate>;
}) {
  useEffect(() => {
    discardJourneyActivity(atividade.id, "conteudo-removido");
    navigate({ to: "/trilha", search: { pulada: "1" }, replace: true });
  }, [atividade.id, navigate]);
  return (
    <PhoneFrame variant="reading">
      <div className="min-h-screen bg-neve" />
    </PhoneFrame>
  );
}
