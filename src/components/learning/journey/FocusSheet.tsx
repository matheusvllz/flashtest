import { useState } from "react";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { FocaMark } from "@/components/brand/FocaMark";
import { AREA_NAMES, areaOfSubject, type EnemArea } from "@/content/taxonomy";
import { SUBJECTS } from "@/data/subjects";
import { COPY } from "@/lib/copy";
import type { StudyFocus } from "@/lib/learning/types";
import { cn } from "@/lib/utils";

const AREA_ORDER: EnemArea[] = ["LC", "MT", "CN", "CH"];

/**
 * Folha de foco (docs/30 §15, Fase 12 do docs/31 F12.5) — chips de matéria
 * agrupados por área, "Só hoje" (sessão temporária, expira no fim do dia
 * local) ou "Daqui pra frente" (preferência permanente), "Voltar a todas".
 * Matéria sem conteúdo fica desabilitada com "Em breve" (docs/30 §15, edge
 * case) — nesta rodada nenhuma matéria do banco está sem conteúdo nenhum,
 * então o estado desabilitado nunca dispara na prática (fica pronto pra
 * quando surgir uma).
 */
export function FocusSheet({
  open,
  onClose,
  studyFocus,
  onApply,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  studyFocus: StudyFocus;
  /** `"session"` grava em `learning.focusSession` (só hoje); `"permanent"` grava em `prefs.studyFocus`. */
  onApply: (subjectIds: string[], scope: "permanent" | "session") => void;
  onClear: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(
    studyFocus.mode === "materias" ? studyFocus.subjectIds : [],
  );

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const grupos = AREA_ORDER.map((area) => ({
    area,
    subjects: SUBJECTS.filter((s) => areaOfSubject(s.id) === area),
  }));

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={COPY.foco.titulo}
      icon={<FocaMark expression="neutra" size={56} decorative />}
    >
      <div className="mt-2 max-h-[45vh] space-y-4 overflow-y-auto">
        {grupos.map(({ area, subjects }) => (
          <div key={area}>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-nevoa">
              {AREA_NAMES[area]}
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  aria-pressed={selected.includes(subject.id)}
                  onClick={() => toggle(subject.id)}
                  className={cn(
                    "min-h-11 rounded-full border-2 px-3 text-sm font-semibold transition-colors",
                    selected.includes(subject.id)
                      ? "border-mar bg-mar text-on-mar"
                      : "border-abismo text-abismo",
                  )}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onApply(selected, "session")}
          className="btn-primary w-full disabled:opacity-40"
        >
          {COPY.foco.soHoje}
        </button>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onApply(selected, "permanent")}
          className="btn-outline w-full disabled:opacity-40"
        >
          {COPY.foco.daquiPraFrente}
        </button>
        <button type="button" onClick={onClear} className="btn-ghost w-full">
          {COPY.foco.voltarATodas}
        </button>
      </div>
    </BottomSheet>
  );
}
