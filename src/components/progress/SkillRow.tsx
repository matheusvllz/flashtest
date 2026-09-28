import { ProgressBar } from "@/components/ds/ProgressBar";
import type { SkillDef } from "@/content/taxonomy";
import { skillDisplay } from "@/lib/adaptive/display";
import type {
  ReviewScheduleEntry,
  SkillEvidenceEntry,
  SkillModelEntry,
} from "@/lib/learning/types";
import { cn } from "@/lib/utils";

/**
 * Uma linha de habilidade em `/progress` (docs/30 §9/§10.4, Fase 12 do
 * docs/31 F12.8) — `skillDisplay` já garante que nenhum número aparece sem
 * evidência suficiente (Confidence < 25) e que "Dominado" só bate quando
 * Mastery, Confidence E o selo "Consistente" concordam.
 */
export function SkillRow({
  skill,
  entry,
  evidence,
  schedule,
  today,
}: {
  skill: SkillDef;
  entry: SkillModelEntry | undefined;
  evidence: SkillEvidenceEntry | undefined;
  schedule: ReviewScheduleEntry | undefined;
  today: string;
}) {
  const display = skillDisplay(entry, evidence, schedule, today);

  return (
    <li>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className={cn("font-semibold", display.showMastery ? "text-abismo" : "text-nevoa")}>
          {skill.name}
          {display.dominated && (
            <span className="ml-1.5 rounded-full bg-recompensa px-1.5 py-0.5 text-[10px] font-bold text-abismo">
              Consistente
            </span>
          )}
        </span>
        <span className="shrink-0 text-[11px] font-bold text-nevoa">
          {display.showMastery ? `${display.mastery}% · ${display.label}` : display.label}
        </span>
      </div>
      <div className="mt-1">
        {display.showMastery ? (
          <ProgressBar
            value={display.mastery ?? 0}
            tone={display.dominated ? "success" : "caneta"}
            size="sm"
            label={`Domínio em ${skill.name}`}
          />
        ) : (
          <div className="h-2 w-full rounded-full border-2 border-dashed border-gelo" />
        )}
      </div>
    </li>
  );
}
