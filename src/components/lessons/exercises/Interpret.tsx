import { EnunciadoComMidia } from "@/components/questao/EnunciadoComMidia";
import type { InterpretExercise } from "@/lib/lessons/types";
import { choiceClasses, type ExerciseViewProps } from "./shared";

export function InterpretView({
  exercise,
  answer,
  onAnswer,
  checked,
}: ExerciseViewProps<InterpretExercise>) {
  return (
    <div className="space-y-4">
      {/* Texto de apoio: cartão com pauta discreta — "leia isto primeiro" (docs/18 §13.8). */}
      <div className="surface-pauta card-soft px-4 py-3">
        {/* Imagens e tabelas na posição do original (spec 50 §5.9.3); as sem marcador vão acima do texto. */}
        <EnunciadoComMidia
          texto={exercise.texto}
          imagens={exercise.imagens}
          tabelas={exercise.tabelas}
          outrosTextos={[exercise.pergunta]}
          classeTexto="text-[15px] leading-relaxed text-abismo"
        />
        {exercise.fonte && (
          <p className="mt-2 text-[11px] font-semibold text-nevoa">{exercise.fonte}</p>
        )}
      </div>
      <EnunciadoComMidia
        texto={exercise.pergunta}
        imagens={exercise.imagens}
        tabelas={exercise.tabelas}
        outrosTextos={[exercise.texto]}
        semMarcadorAcima={false}
        classeTexto="font-display text-lg font-bold leading-snug text-abismo"
      />
      <div className="space-y-2.5" role="radiogroup" aria-label="Opções de resposta">
        {exercise.opcoes.map((opcao, i) => (
          <button
            type="button"
            key={i}
            role="radio"
            aria-checked={answer === i}
            disabled={checked}
            onClick={() => onAnswer(answer === i ? null : i)}
            className={choiceClasses({
              selected: answer === i,
              checked,
              isCorrect: checked && i === exercise.correta,
              isWrongPick: checked && answer === i && i !== exercise.correta,
            })}
          >
            {opcao}
          </button>
        ))}
      </div>
    </div>
  );
}
