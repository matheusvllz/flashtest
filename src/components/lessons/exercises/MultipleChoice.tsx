import { useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { EnunciadoComMidia } from "@/components/questao/EnunciadoComMidia";
import { precarregarVisualizador } from "@/components/questao/carregar-visualizador";
import { VisualizadorSobDemanda } from "@/components/questao/VisualizadorSobDemanda";
import { COPY } from "@/lib/copy";
import type { MultipleChoiceExercise } from "@/lib/lessons/types";
import { choiceClasses, type ExerciseViewProps } from "./shared";

export function MultipleChoiceView({
  exercise,
  answer,
  onAnswer,
  checked,
}: ExerciseViewProps<MultipleChoiceExercise>) {
  // Alternativa-imagem ampliada (spec 50 §5.9.3): índice da alternativa, ou null.
  const [ampliada, setAmpliada] = useState<number | null>(null);
  const botoesAmpliar = useRef(new Map<number, HTMLButtonElement>());

  return (
    <div className="space-y-4">
      <EnunciadoComMidia
        texto={exercise.pergunta}
        imagens={exercise.imagens}
        tabelas={exercise.tabelas}
        classeTexto="font-display text-lg font-bold leading-snug text-abismo"
      />
      <div className="space-y-2.5" role="radiogroup" aria-label="Opções de resposta">
        {exercise.opcoes.map((opcao, i) => {
          const imagem = exercise.opcoesImagem?.[i] ?? null;
          const radio = (
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
              {imagem ? (
                <>
                  {/* "Alternativa X (imagem)" + o alt: o nome que o leitor de tela lê. Na tela, só a imagem. */}
                  <span className="sr-only">{opcao}</span>
                  <span className="block rounded-md bg-papel-figura p-1">
                    <img
                      src={imagem.url}
                      alt={imagem.alt}
                      width={imagem.largura}
                      height={imagem.altura}
                      loading="lazy"
                      decoding="async"
                      className="mx-auto block h-auto max-h-48 max-w-full object-contain"
                    />
                  </span>
                </>
              ) : (
                opcao
              )}
            </button>
          );
          if (!imagem) return radio;
          return (
            <div key={i} className="flex items-stretch gap-2">
              <div className="min-w-0 flex-1">{radio}</div>
              <button
                type="button"
                ref={(el) => {
                  if (el) botoesAmpliar.current.set(i, el);
                  else botoesAmpliar.current.delete(i);
                }}
                aria-label={COPY.questao.ampliarImagemDe(opcao)}
                onClick={() => setAmpliada(i)}
                onPointerEnter={precarregarVisualizador}
                onFocus={precarregarVisualizador}
                className="grid w-11 shrink-0 place-items-center rounded-lg border-2 border-gelo bg-cards text-abismo"
              >
                <Maximize2 size={18} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      {ampliada !== null && exercise.opcoesImagem?.[ampliada] && (
        <VisualizadorSobDemanda
          imagem={exercise.opcoesImagem[ampliada]!}
          titulo={exercise.opcoes[ampliada]}
          onClose={() => setAmpliada(null)}
          devolverFocoPara={() => botoesAmpliar.current.get(ampliada) ?? null}
        />
      )}
    </div>
  );
}
