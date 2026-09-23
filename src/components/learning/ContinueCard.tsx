import { type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/ds/EmptyState";
import { phaseById } from "@/content/microlicoes";
import { lessonById } from "@/content/trilhas";
import { COPY } from "@/lib/copy";
import type { ContinueTarget } from "@/lib/learning/trail";
import { nodeKindOf, questionSteps, stepsOf } from "@/lib/learning/steps";

/**
 * `ContinueTarget` não carrega `kind`/`questionCount` (docs/25 §7.5 — só o
 * necessário pra recomendar e navegar); a linha "Capítulo › Seção · Aula · N
 * questões" (§12.1) busca isso de volta no catálogo certo pela `source`.
 */
function detalhesDoAlvo(target: ContinueTarget): { kindLabel: string; questionCount: number } {
  if (target.source === "micro") {
    const lesson = phaseById(target.lessonId);
    if (!lesson) return { kindLabel: "", questionCount: 0 };
    return {
      kindLabel: COPY.trilha.kinds[nodeKindOf(lesson)],
      questionCount: questionSteps(stepsOf(lesson)).length,
    };
  }
  const found = lessonById(target.lessonId);
  return { kindLabel: COPY.trilha.kinds.pratica, questionCount: found?.lesson.exercicios.length ?? 0 };
}

/**
 * Card de "continuar" da trilha (docs/25 §12.1, §18 T-17; docs/27/28 T-10
 * acrescenta a variante `callout`, ancorada ao nó foco na trilha visual). O
 * único `btn-primary` da tela. `target === null` cai no `EmptyState` no
 * `variant="card"` (nada publicado que ainda falte); no `callout` não há
 * onde renderizar o vazio (o chamador não monta o callout sem `target`).
 */
export function ContinueCard({
  target,
  variant = "card",
  label,
  pointerK,
  lead,
}: {
  target: ContinueTarget | null;
  variant?: "card" | "callout";
  /** Sobrescreve "Continuar"/"Começar por aqui" (ex.: "Próxima nesta matéria"). */
  label?: string;
  /** Só no callout: posição X do nó (mesmo `k` da linha) para a seta. */
  pointerK?: number;
  /** Só no callout: conteúdo acima do rótulo (a fala da Foca). */
  lead?: ReactNode;
}) {
  if (!target) {
    if (variant === "callout") return null;
    return <EmptyState text={COPY.trilha.tudoConcluido} cta={{ label: COPY.trilha.praticar, to: "/study" }} />;
  }

  const { kindLabel, questionCount } = detalhesDoAlvo(target);
  const rotulo = label ?? (target.firstTime ? COPY.trilha.comecarAqui : COPY.trilha.continuar);

  if (variant === "callout") {
    return (
      <div
        className="card-soft relative p-4"
        style={{ borderColor: "var(--color-mar)", "--pointer-k": pointerK ?? 0 } as CSSProperties}
      >
        <span className="path-callout-pointer" aria-hidden="true" />
        {lead && <div className="mb-3">{lead}</div>}
        <p className="ds-label">{rotulo}</p>
        <h2 className="mt-2 font-display text-lg font-bold leading-tight text-abismo">{target.title}</h2>
        <p className="mt-1 text-xs font-semibold text-nevoa">
          {target.chapterTitle} › {target.sectionTitle} · {kindLabel} · {COPY.trilha.questoes(questionCount)}
        </p>
        {target.explanation && <p className="mt-1 text-xs text-nevoa">{target.explanation}</p>}
        <Link {...target.href} className="btn-primary mt-4 w-full">
          {COPY.trilha.continuar}
        </Link>
      </div>
    );
  }

  return (
    <div className="card-soft p-5" style={{ borderColor: "var(--color-mar)" }}>
      <p className="ds-label">{rotulo}</p>
      <h2 className="mt-2 font-display text-[22px] font-bold leading-tight text-abismo">{target.title}</h2>
      <p className="mt-1 text-xs font-semibold text-nevoa">
        {target.chapterTitle} › {target.sectionTitle} · {kindLabel} · {COPY.trilha.questoes(questionCount)}
      </p>
      {target.explanation && <p className="mt-1 text-xs text-nevoa">{target.explanation}</p>}
      <Link {...target.href} className="btn-primary mt-4 w-full">
        {COPY.trilha.continuar}
      </Link>
    </div>
  );
}
