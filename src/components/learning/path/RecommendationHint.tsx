import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { ContinueTarget } from "@/lib/learning/trail";

/** Dica secundária quando o foco global está em outra matéria (RF-11) — nunca `btn-primary`. */
export function RecommendationHint({ target, subjectName }: { target: ContinueTarget; subjectName: string }) {
  return (
    <Link
      {...target.href}
      className="mt-3 flex min-h-11 items-center gap-2 rounded-lg border-2 border-dashed border-gelo px-3 py-2 text-sm font-semibold text-mar-fundo"
    >
      <span className="min-w-0 flex-1">{COPY.trilha.recomenda(target.title, subjectName)}</span>
      <ArrowRight size={16} aria-hidden="true" className="shrink-0" />
    </Link>
  );
}
