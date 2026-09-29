import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { EmptyState } from "@/components/ds/EmptyState";
import { MicroLessonPlayer } from "@/components/learning/MicroLessonPlayer";
import { TrailSkeleton } from "@/components/learning/path/TrailSkeleton";
import { phaseById } from "@/content/microlicoes";
import { subjectOfAulaGerada } from "@/content/curriculum-tree";
import { ensureSubjects, isSubjectLoaded } from "@/lib/content/repository";
import { isTrailLessonLocked } from "@/lib/learning/trail";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/learn/$lessonId")({ component: Learn, ssr: false });

function Learn() {
  const { lessonId } = Route.useParams();
  const s = useAppState();
  // Aula gerada pelo pipeline mora no pacote da matéria (docs/30 §21.3):
  // carrega antes de resolver, com o esqueleto da trilha enquanto isso.
  const materiaDaAulaGerada = subjectOfAulaGerada(lessonId);
  const [pacotePronto, setPacotePronto] = useState(() => !materiaDaAulaGerada || isSubjectLoaded(materiaDaAulaGerada));
  useEffect(() => {
    if (pacotePronto || !materiaDaAulaGerada) return;
    let vivo = true;
    void ensureSubjects([materiaDaAulaGerada]).finally(() => {
      if (vivo) setPacotePronto(true);
    });
    return () => {
      vivo = false;
    };
  }, [pacotePronto, materiaDaAulaGerada]);
  if (!pacotePronto) return <TrailSkeleton />;

  // `phaseById` é o lookup canônico (docs/25 §18 T-05) — inclui as revisões
  // sintéticas de capítulo além das microlições autorais. A checagem de
  // bloqueio usa `isTrailLessonLocked` (T-15) — a mesma que `trail.ts` usa
  // pra status do nó, que também sabe de pré-requisito de CAPÍTULO, não só
  // de lição; `microLessonNodeState` ficava cego a isso (docs/25 §22 "Deep
  // link bloqueado", T-25 c).
  const lesson = phaseById(lessonId);

  // Link errado ou lição despublicada não pode virar tela branca (docs/20 §8.1, item 9).
  if (!lesson) {
    return (
      <PhoneFrame variant="reading">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-8">
          <EmptyState
            text="Essa lição não existe ou ainda não foi publicada."
            cta={{ label: "Voltar ao início", to: "/trilha" }}
          />
        </div>
      </PhoneFrame>
    );
  }

  // Mesma regra de acesso da trilha (`LessonNode`/`trail.ts`) — URL direta não
  // pode ignorar o bloqueio por acidente (docs/20 §11, Fase 9, item 6).
  if (isTrailLessonLocked(lessonId, s)) {
    return (
      <PhoneFrame variant="reading">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-8">
          <EmptyState
            text="Essa lição ainda está bloqueada — conclua a anterior primeiro."
            cta={{ label: "Ver a trilha", to: "/trilha" }}
          />
        </div>
      </PhoneFrame>
    );
  }

  // `key` pelo id: mudar de lição pela URL reinicializa o player do zero,
  // não deixa estado da lição anterior vazar (docs/20 §8.1, item 9).
  return <MicroLessonPlayer key={lesson.id} lesson={lesson} />;
}
