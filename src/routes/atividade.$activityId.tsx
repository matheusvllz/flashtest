import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { CheckpointIntro } from "@/components/learning/CheckpointIntro";
import { MicroLessonPlayer } from "@/components/learning/MicroLessonPlayer";
import { selectItemsForActivity } from "@/lib/adaptive";
import { buildActivityLesson } from "@/lib/adaptive/activity-lesson";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { carregarPacotesPara } from "@/lib/content/preload";
import { FEATURES } from "@/lib/features";
import { completeJourneyActivity, hojeISO, setActiveActivity, useAppState } from "@/lib/store";

export const Route = createFileRoute("/atividade/$activityId")({
  component: Atividade,
  ssr: false,
});

/**
 * Prática/revisão/desafio/checkpoint da jornada (docs/30 §14.4, Fase 12 do
 * docs/31 F12.2) — mesmo `MicroLessonPlayer` das aulas, com uma
 * `MicroLessonV2` sintética (`buildActivityLesson`) e uma estratégia de
 * conclusão própria (`completeJourneyActivity`, paga XP pelo ledger
 * `atividade:<id>`, nunca grava em `completedLessons`). Não é loader do
 * router: o estado é síncrono (`useAppState`), igual a `/learn/$lessonId`.
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
  const [comecou, setComecou] = useState(false);
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
    // Pacote da matéria em memória ANTES de escolher/montar (docs/30 §21.3) —
    // item de pacote só resolve depois de `ensureSubjects`.
    void (async () => {
      if (ativa?.id === activityId) {
        await carregarPacotesPara(ativa.skillIds, ativa.itemIds ?? []);
        if (cancelado) return;
        resolvidaRef.current = activityId;
        setTravada(ativa);
        return;
      }
      await carregarPacotesPara(candidata.skillIds);
      if (cancelado) return;
      // Itens escolhidos AGORA, ao começar (docs/30 §11.7) — nunca no
      // planejamento. Recarregar no meio de uma atividade não troca os itens
      // (edge case do `30` §14): `activeActivity` já guarda `itemIds`, então
      // este ramo só roda na primeira entrada.
      const itemIds = selectItemsForActivity(candidata, estadoRef.current, hojeISO(), candidata.id);
      const comItens: PlannedActivity = { ...candidata, itemIds };
      resolvidaRef.current = activityId;
      setActiveActivity(comItens);
      setTravada(comItens);
    })();
    return () => {
      cancelado = true;
    };
  }, [s, activityId, navigate]);

  if (!travada) {
    return (
      <PhoneFrame>
        <div className="min-h-screen bg-neve" />
      </PhoneFrame>
    );
  }

  // Checkpoint tem uma tela de entrada própria (docs/30 §13.3/§13.6, Fase 14
  // F14.4) — "Agora não" só volta pra trilha, sem chamar `completeJourneyActivity`
  // (nada é descontado; a comprometida não iniciada volta no próximo plano).
  if (travada.kind === "checkpoint" && !comecou) {
    return (
      <PhoneFrame>
        <CheckpointIntro
          onComecar={() => setComecou(true)}
          onAgoraNao={() => navigate({ to: "/trilha", replace: true })}
        />
      </PhoneFrame>
    );
  }

  // "Pacote não carrega → atividade vira fallback" (docs/30 §14, Edge cases)
  // — aqui o CONTEÚDO da atividade é que não montou (menos de 2 itens
  // escolhidos, ex.: checkpoint com o pool "diagnostico" vazio hoje, Fase
  // 11 pendente). `navigate()` NUNCA pode rodar direto no corpo do render
  // (achado real: "Cannot update a component (Transitioner) while
  // rendering a different component (Atividade)" — atualiza o router, que é
  // outro componente, então só pode acontecer num efeito, nunca síncrono
  // aqui). `buildActivityLesson` continua chamada aqui (não em efeito) já
  // que é pura/determinística — só o REDIRECT precisa esperar o efeito.
  let lesson;
  try {
    lesson = buildActivityLesson(travada, travada.itemIds ?? []);
  } catch {
    lesson = null;
  }

  if (!lesson) {
    return <AtividadeFalhou navigate={navigate} />;
  }

  return (
    <MicroLessonPlayer
      key={lesson.id}
      lesson={lesson}
      mode={travada.kind === "checkpoint" ? "checkpoint" : "atividade"}
      onComplete={(correct, total) => completeJourneyActivity(travada, correct, total)}
    />
  );
}

/** Redireciona num efeito (não no render) — ver o comentário acima sobre o achado real. */
function AtividadeFalhou({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  useEffect(() => {
    navigate({ to: "/trilha", replace: true });
  }, [navigate]);
  return (
    <PhoneFrame>
      <div className="min-h-screen bg-neve" />
    </PhoneFrame>
  );
}
