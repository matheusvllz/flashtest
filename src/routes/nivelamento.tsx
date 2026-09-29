import { useEffect, useMemo, useRef, useState } from "react";
import { useAtalhosDeQuestao } from "@/hooks/useAtalhosDeQuestao";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { PlacementResult } from "@/components/learning/PlacementResult";
import { QuestionStepView } from "@/components/learning/steps/QuestionStepView";
import { resolveExercise } from "@/content/microlicoes";
import { AREA_NAMES, areaOfSubject } from "@/content/taxonomy/areas";
import { checkAnswer } from "@/lib/lessons/define";
import { presentedOrderFor } from "@/lib/learning/session-logic";
import type { ExerciseAnswer } from "@/lib/lessons/types";
import type { EnemArea } from "@/content/taxonomy/types";
import type { QuestionStep } from "@/lib/learning/types";
import {
  currentPlacementArea,
  pickPlacementItem,
  placementConcluido,
  type PlacementPoolItem,
  type PlacementScope,
} from "@/lib/adaptive/placement";
import { placementItemsById, poolDiagnosticoDaArea } from "@/lib/adaptive/placement-pool";
import { ensurePlan, hrefForActivity, iniciaAoNavegar } from "@/lib/adaptive/journey";
import { usePlacementReconciliation } from "@/hooks/usePlacementReconciliation";
import { SUBJECTS } from "@/data/subjects";
import { FEATURES } from "@/lib/features";
import { carregarTodosOsPacotes } from "@/lib/content/preload";
import { COPY } from "@/lib/copy";
import {
  beginPlacement,
  commitPlan,
  getState,
  hojeISO,
  setPlacementState,
  startJourneyActivity,
  submitPlacementResponse,
  useAppState,
} from "@/lib/store";

export const Route = createFileRoute("/nivelamento")({ component: Nivelamento, ssr: false });

const AREAS_MEDIDAS: EnemArea[] = ["LC", "MT", "CN", "CH"]; // RED fica de fora (docs/30 §12.3)

/** Escopo do nivelamento a partir do que o aluno já declarou no onboarding (docs/30 §12.2/§12.3). */
function scopeFromPrefs(prefs: {
  studyFocus: { mode: string; subjectIds: string[]; areas: EnemArea[] };
  difficultSubjects: string[];
}): PlacementScope {
  const { studyFocus, difficultSubjects } = prefs;
  let areas: EnemArea[];
  if (studyFocus.mode === "materias") {
    const dasMaterias = studyFocus.subjectIds
      .map((id) => areaOfSubject(id))
      .filter((a): a is EnemArea => !!a && a !== "RED");
    areas = dasMaterias.length > 0 ? [...new Set(dasMaterias)] : AREAS_MEDIDAS;
  } else if (studyFocus.mode === "areas") {
    const escolhidas = studyFocus.areas.filter((a) => a !== "RED");
    areas = escolhidas.length > 0 ? escolhidas : AREAS_MEDIDAS;
  } else {
    areas = AREAS_MEDIDAS;
  }

  const areasDificeis = new Set(
    difficultSubjects
      .map((nome) => SUBJECTS.find((s) => s.name === nome)?.id)
      .map((id) => (id ? areaOfSubject(id) : undefined))
      .filter((a): a is EnemArea => !!a && areas.includes(a)),
  );
  // Ordem: prioritárias primeiro (docs/30 §12.3) — as difíceis, senão a ordem declarada.
  const ordenadas = [...areas].sort(
    (a, b) => Number(areasDificeis.has(b)) - Number(areasDificeis.has(a)),
  );
  return {
    areas: ordenadas,
    priorityAreas: areasDificeis.size > 0 ? areasDificeis : new Set(areas),
  };
}

/**
 * Nivelamento adaptativo (docs/30 §12, Fase 13 do docs/31 F13.4) — CAT com
 * EAP, sem feedback por item, sem dica, sem tutor, "Não sei" disponível.
 * Não usa `MicroLessonV2`/`useLearningSession` (a sequência não é fixa: cada
 * próximo item depende do θ̂ da resposta anterior) — orquestra direto sobre
 * o motor puro (`placement.ts`) e `QuestionStepView` em modo `silent`.
 */
function Nivelamento() {
  // Desktop: 1–5 / A–E escolhem, Enter confirma (docs/44 §5).
  useAtalhosDeQuestao();
  const nav = useNavigate();
  const s = useAppState();
  const scope = useMemo(
    () => scopeFromPrefs(s.prefs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.prefs.studyFocus, s.prefs.difficultSubjects],
  );
  const seedRef = useRef(`plc-${Date.now()}`);
  const itemsShownRef = useRef(new Map<string, PlacementPoolItem>());
  const lastSubjectRef = useRef<string | null>(null);
  // Item TRAVADO enquanto `checked` é true (achado de teste em dispositivo
  // físico, docs/32 F15.3): `submitPlacementResponse` já commita a resposta
  // no `placement` do store de forma síncrona, então sem isso o item exibido
  // (derivado de `escolha`, calculado a cada render a partir do `placement`
  // atual) avançava pro PRÓXIMO item assim que a resposta era registrada —
  // mostrando a pergunta seguinte com a "resposta registrada" da anterior.
  const itemTravadoRef = useRef<PlacementPoolItem | null>(null);
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [checked, setChecked] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // Itens diagnósticos de pacote só entram no pool com o pacote em memória
  // (docs/30 §21.3). Sem a flag, nada a carregar.
  const [pacotesProntos, setPacotesProntos] = useState(!FEATURES.pacotesConteudo);
  useEffect(() => {
    if (pacotesProntos) return;
    let vivo = true;
    void carregarTodosOsPacotes().finally(() => {
      if (vivo) setPacotesProntos(true);
    });
    return () => {
      vivo = false;
    };
  }, [pacotesProntos]);

  // Aplica o resultado de um nivelamento concluído e ainda não aplicado (docs/36 T-03.3): é o
  // único caminho que aplica priors, então a rota não decide mais nada sobre isso.
  const { aplicando } = usePlacementReconciliation();

  // Fila recomposta com o nivelamento aplicado (docs/36 T-06.1): o resultado mostra "Por onde começamos"
  // com a atividade que a Home vai oferecer, então a fila é recomposta AQUI (a aplicação a esvaziou) antes
  // de a tela aparecer — sem quadro com a atividade velha nem seção que aparece depois. Mesma chamada da
  // Home (`ensurePlan` + `commitPlan`, idempotente: sem mudança devolve `null`).
  const aplicado = s.learning.placement?.status === "concluido" && Boolean(s.learning.placement.appliedAt);
  const [planoPronto, setPlanoPronto] = useState(!FEATURES.jornadaAdaptativa);
  useEffect(() => {
    if (!FEATURES.jornadaAdaptativa || !FEATURES.nivelamento || !aplicado) return;
    const atual = getState();
    const hoje = hojeISO();
    const result = ensurePlan(atual, hoje, hoje);
    if (result) commitPlan(result.committed, result.upcoming, atual.learning.journey.focusSignature);
    setPlanoPronto(true);
  }, [aplicado]);

  const placement = s.learning.placement;
  const emAndamento = !!placement && placement.status !== "concluido";
  // Retomar depois de recarregar (docs/36 T-03.2, RF-12, bug C3): o motor recalcula θ̂/SE da área a
  // cada resposta e descarta as respostas cujo item não está no mapa. Reconstitui o mapa dos itens JÁ
  // respondidos, uma vez por montagem e antes do primeiro `pickPlacementItem`; os itens já mostrados
  // nesta montagem têm precedência.
  const mapaReconstituidoRef = useRef(false);
  if (pacotesProntos && placement && !mapaReconstituidoRef.current) {
    mapaReconstituidoRef.current = true;
    for (const [id, item] of placementItemsById(placement).byId) {
      if (!itemsShownRef.current.has(id)) itemsShownRef.current.set(id, item);
    }
  }
  // Calculada uma vez por render, reusada pelo efeito (que só COMMITA se
  // precisar) e pela renderização (que só LÊ) — evita rodar o motor 2x.
  const escolha =
    emAndamento && pacotesProntos
      ? pickPlacementItem(placement, scope, poolDiagnosticoDaArea, placement.seed, lastSubjectRef.current)
      : null;
  if (escolha?.item) itemsShownRef.current.set(escolha.item.id, escolha.item);

  useEffect(() => {
    if (!FEATURES.nivelamento) {
      nav({ to: "/trilha", replace: true });
      return;
    }
    if (!pacotesProntos) return;
    if (!placement) {
      beginPlacement(seedRef.current);
      return;
    }
    if (!emAndamento || !escolha) return;
    seedRef.current = placement.seed;

    if (escolha.item) {
      if (escolha.state !== placement) setPlacementState(escolha.state);
      return;
    }
    // Sem mais item nenhum (áreas fechadas por SE/limite, OU pool que acabou antes do teto) —
    // SÓ fecha o status. Quem aplica os priors e recompõe a fila é `usePlacementReconciliation`
    // (docs/36 T-03.3): o término normal também fecha o status pelo store, e os dois caminhos
    // precisam terminar no mesmo lugar.
    setPlacementState({ ...escolha.state, status: "concluido" as const, finishedAt: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, scope, pacotesProntos]);

  if (!FEATURES.nivelamento || !pacotesProntos)
    return (
      <PhoneFrame variant="reading">
        <div className="min-h-screen bg-neve" />
      </PhoneFrame>
    );

  // Concluído e ainda não aplicado (ou aplicando agora): nunca mostra o resultado antes do
  // `appliedAt` (docs/36 F.5 "estados", RU-11).
  if (!emAndamento && (aplicando || (placement?.status === "concluido" && (!placement.appliedAt || !planoPronto)))) {
    return (
      <PhoneFrame variant="reading">
        <div className="flex min-h-screen flex-col items-center justify-center bg-neve px-6 text-center">
          <p role="status" className="text-sm font-semibold text-nevoa">
            {COPY.nivelamento.aplicando}
          </p>
        </div>
      </PhoneFrame>
    );
  }

  if (!emAndamento) {
    if (!placement) {
      return (
        <PhoneFrame variant="reading">
          <div className="min-h-screen bg-neve" />
        </PhoneFrame>
      );
    }
    const primeira = FEATURES.jornadaAdaptativa ? (s.learning.journey.committed[0] ?? null) : null;
    return (
      <PlacementResult
        placement={placement}
        scope={scope}
        primeira={primeira}
        onComecar={() => {
          if (!primeira) {
            void nav({ to: "/trilha" });
            return;
          }
          // Mesmo caminho do card e do nó da Home (RF-1): aula/legado marcam o início antes de sair.
          if (iniciaAoNavegar(primeira)) startJourneyActivity(primeira);
          void nav(hrefForActivity(primeira));
        }}
      />
    );
  }

  const area = currentPlacementArea(placement, scope);
  const itemAtual = checked && itemTravadoRef.current ? itemTravadoRef.current : (escolha?.item ?? null);

  if (!itemAtual) {
    return (
      <PhoneFrame variant="reading">
        <div className="min-h-screen bg-neve" />
      </PhoneFrame>
    );
  }

  const exercise = resolveExercise(itemAtual.id);
  const step: QuestionStep = {
    kind: "question",
    exerciseId: itemAtual.id,
    role: "diagnostico",
    difficulty: 2,
  };
  const ordem = presentedOrderFor(exercise);

  function responder(dontKnow: boolean) {
    if (!itemAtual) return;
    itemTravadoRef.current = itemAtual;
    const correct = dontKnow ? false : checkAnswer(exercise, answer!, ordem);
    setLastCorrect(correct);
    setChecked(true);
    submitPlacementResponse(scope, itemsShownRef.current, itemAtual, correct, dontKnow);
  }

  function proxima() {
    lastSubjectRef.current = itemAtual!.subjectId;
    itemTravadoRef.current = null;
    setAnswer(null);
    setChecked(false);
    setLastCorrect(null);
  }

  const totalRespondidas = Object.values(placement.areas).reduce(
    (acc, a) => acc + a.itemIds.length,
    0,
  );

  return (
    <PhoneFrame variant="reading">
      <div className="flex min-h-screen flex-col bg-neve">
        <header className="px-5 pt-6">
          <p className="ds-label">{COPY.nivelamento.tituloRota}</p>
          <p className="mt-1 text-xs font-semibold text-nevoa">
            {area ? AREA_NAMES[area] : ""} · {totalRespondidas + 1}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-nevoa">{COPY.nivelamento.duranteHint}</p>
        </header>
        <div className="flex-1 px-6 py-6">
          <QuestionStepView
            step={step}
            exercise={exercise}
            answer={answer}
            onAnswer={setAnswer}
            presentedOrder={ordem}
            feedback={
              checked
                ? {
                    interactionId: "nivelamento",
                    exerciseId: itemAtual.id,
                    correct: !!lastCorrect,
                    kind: lastCorrect ? "correct" : "incorrect",
                    messageId: "acertou",
                    messageText: "",
                    explanation: "",
                  }
                : null
            }
            canVerify={answer !== null}
            onVerify={() => responder(false)}
            onContinue={proxima}
            onAskTutor={() => {}}
            onDontKnow={() => responder(true)}
            isLast={false}
            questionNumber={totalRespondidas + 1}
            questionTotal={totalRespondidas + 1}
            silent
          />
        </div>
        <footer className="px-6 pb-8">
          <button
            type="button"
            onClick={() => nav({ to: "/trilha" })}
            className="tap-area w-full text-center text-xs font-semibold text-nevoa underline"
          >
            {COPY.nivelamento.pausarEContinuar}
          </button>
        </footer>
      </div>
    </PhoneFrame>
  );
}
