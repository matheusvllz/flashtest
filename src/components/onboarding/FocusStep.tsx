import { setStudyFocus, useAppState } from "@/lib/store";
import { SUBJECTS } from "@/data/subjects";
import { COPY } from "@/lib/copy";

/** "Seu ritmo" — foco permanente (docs/30 §12.2/§15, Fase 13 do docs/31 F13.1). Padrão "todas". */
export function FocusStep() {
  const s = useAppState();
  const foco = s.prefs.studyFocus;
  const escolhendo = foco.mode === "materias";

  return (
    <div>
      <div className="ds-label">{COPY.onboarding.blocoSeuRitmo}</div>
      <h2 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-abismo">
        {COPY.onboarding.focoTitulo}
      </h2>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setStudyFocus({ mode: "todas", subjectIds: [], areas: [] })}
          className={`chip ${!escolhendo ? "chip-on" : ""}`}
        >
          {COPY.foco.todasAsMaterias}
        </button>
        <button
          onClick={() => {
            if (!escolhendo) setStudyFocus({ mode: "materias", subjectIds: [], areas: [] });
          }}
          className={`chip ${escolhendo ? "chip-on" : ""}`}
        >
          {COPY.onboarding.escolherMaterias}
        </button>
      </div>

      {escolhendo && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => {
            const on = foco.subjectIds.includes(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() =>
                  setStudyFocus({
                    mode: "materias",
                    subjectIds: on
                      ? foco.subjectIds.filter((id) => id !== sub.id)
                      : [...foco.subjectIds, sub.id],
                    areas: [],
                  })
                }
                className={`chip ${on ? "chip-on" : ""}`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function canAdvanceFocusStep(studyFocus: { mode: string; subjectIds: string[] }): boolean {
  return studyFocus.mode === "todas" || studyFocus.subjectIds.length > 0;
}
