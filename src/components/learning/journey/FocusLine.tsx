import { SUBJECT_MAP } from "@/data/subjects";
import { AREA_NAMES } from "@/content/taxonomy";
import { COPY } from "@/lib/copy";
import type { FocusSession, StudyFocus } from "@/lib/learning/types";

/** Nomes das matérias em foco agora (sessão "só hoje" tem prioridade sobre o permanente, docs/30 §15) — `null` = "todas as matérias". */
export function activeFocusNames(
  studyFocus: StudyFocus,
  focusSession: FocusSession | null,
): string[] | null {
  if (focusSession) return focusSession.subjectIds.map((id) => SUBJECT_MAP[id]?.name ?? id);
  if (studyFocus.mode === "materias" && studyFocus.subjectIds.length > 0) {
    return studyFocus.subjectIds.map((id) => SUBJECT_MAP[id]?.name ?? id);
  }
  if (studyFocus.mode === "areas" && studyFocus.areas.length > 0) {
    return studyFocus.areas.map((a) => AREA_NAMES[a]);
  }
  return null;
}

/**
 * Linha de foco (docs/30 §14.1 item 3/§15, Fase 12 do docs/31 F12.5) —
 * "Todas as matérias" ou "Foco: Matemática, Física" com botão "Mudar" que
 * abre a `FocusSheet`. Matéria sempre em TEXTO, nunca cor (a paleta só tem
 * um accent).
 */
export function FocusLine({
  studyFocus,
  focusSession,
  onOpenSheet,
}: {
  studyFocus: StudyFocus;
  focusSession: FocusSession | null;
  onOpenSheet: () => void;
}) {
  const names = activeFocusNames(studyFocus, focusSession);
  const label = names ? COPY.foco.linhaFoco(names.join(", ")) : COPY.foco.linhaTodas;

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-xs font-semibold text-nevoa">{label}</p>
      <button
        type="button"
        onClick={onOpenSheet}
        className="flex min-h-11 items-center px-2 text-xs font-bold text-mar-fundo"
      >
        {COPY.foco.mudar}
      </button>
    </div>
  );
}
