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
 * Card de "continuar" da trilha (docs/25 §12.1, §18 T-17) — o único
 * `btn-primary` da tela. `target === null` (nada publicado que ainda falte)
 * cai no `EmptyState` com CTA pra `/study`, nunca numa tela em branco.
 */
export function ContinueCard({ target }: { target: ContinueTarget | null }) {
  if (!target) {
    return <EmptyState text={COPY.trilha.tudoConcluido} cta={{ label: COPY.trilha.praticar, to: "/study" }} />;
  }

  const { kindLabel, questionCount } = detalhesDoAlvo(target);

  return (
    <div className="card-soft p-5" style={{ borderColor: "var(--color-mar)" }}>
      <p className="ds-label">{target.firstTime ? COPY.trilha.comecarAqui : COPY.trilha.continuar}</p>
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
