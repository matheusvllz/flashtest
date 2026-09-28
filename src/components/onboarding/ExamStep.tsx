import { setExamTarget, setState, useAppState } from "@/lib/store";
import { EXAMS } from "@/data/exams";
import { COPY } from "@/lib/copy";

/**
 * "Sua prova" (docs/30 §12.2, Fase 13 do docs/31 F13.1) — prova obrigatória,
 * data opcional. "Outro vestibular" ainda usa `examId: "enem"` por baixo: o
 * perfil de CONTEÚDO do app é sempre ENEM (docs/30 §12.2 tabela, "outro
 * vestibular → só ENEM como perfil de conteúdo") — a escolha só muda a dica
 * de vestibular mostrada depois (Fase 8), nunca a trilha em si.
 */
export function ExamStep() {
  const s = useAppState();
  const alvo = s.prefs.examTargets[0] ?? null;
  const naoSeiData = alvo?.examDate === undefined;

  return (
    <div>
      <div className="ds-label">{COPY.onboarding.blocoSuaProva}</div>
      <h2 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-abismo">
        {COPY.onboarding.examTitulo}
      </h2>
      <div className="mt-6 flex flex-col gap-2.5">
        {EXAMS.map((exam) => (
          <button
            key={exam.id}
            onClick={() => setExamTarget({ examId: exam.id, stage: exam.stages?.[0] })}
            className={`card-press px-4 py-3.5 text-left text-sm font-semibold text-abismo ${
              alvo?.examId === exam.id ? "border-mar bg-mar/8" : ""
            }`}
          >
            {exam.name}
          </button>
        ))}
        <button
          onClick={() => setExamTarget({ examId: "enem" })}
          className={`card-press px-4 py-3.5 text-left text-sm font-semibold text-abismo ${
            alvo && !EXAMS.some((e) => e.id === alvo.examId) ? "border-mar bg-mar/8" : ""
          }`}
        >
          {COPY.onboarding.outroVestibular}
        </button>
      </div>

      {alvo && (
        <div className="mt-5">
          <label className="ds-label" htmlFor="exam-date">
            {COPY.onboarding.dataProva}
          </label>
          <input
            id="exam-date"
            type="date"
            disabled={naoSeiData}
            value={alvo.examDate ?? ""}
            onChange={(e) =>
              setState((st) => {
                if (st.prefs.examTargets[0]) st.prefs.examTargets[0].examDate = e.target.value;
                return st;
              })
            }
            className="input-ds mt-2 font-mono disabled:opacity-40"
          />
          <button
            onClick={() =>
              setState((st) => {
                if (st.prefs.examTargets[0]) {
                  st.prefs.examTargets[0].examDate = naoSeiData ? "" : undefined;
                }
                return st;
              })
            }
            className="mt-2 text-xs font-semibold text-nevoa underline"
          >
            {naoSeiData ? COPY.onboarding.euSeiAData : COPY.onboarding.aindaNaoSeiData}
          </button>
        </div>
      )}
    </div>
  );
}

export function canAdvanceExamStep(examTargets: { examId: string }[]): boolean {
  return examTargets.length > 0;
}
