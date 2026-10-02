import { useId, useRef, useState } from "react";
import { Maximize2, RotateCw } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { ExerciseImage } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import { precarregarVisualizador } from "./carregar-visualizador";
import { VisualizadorSobDemanda } from "./VisualizadorSobDemanda";

/**
 * Imagem do enunciado (spec 50 §5.9.3): fiel ao original, sobre um papel claro próprio nos dois temas (o
 * original foi feito para papel branco; nunca inverter cores), com o crédito impresso, a descrição longa
 * sob demanda ("Ver descrição") e o toque que abre o visualizador em tela cheia.
 *
 * `width`/`height` reservam o espaço antes de a imagem chegar (sem pulo de layout); a imagem nunca passa da
 * largura da coluna.
 */
export function FiguraDaQuestao({
  imagem,
  className,
  avisoGirar = false,
}: {
  imagem: ExerciseImage;
  className?: string;
  /** Mostra "Gire o celular para ver melhor" (quem decide é `EnunciadoComMidia`: uma vez por sessão). */
  avisoGirar?: boolean;
}) {
  const [ampliada, setAmpliada] = useState(false);
  const [descricaoAberta, setDescricaoAberta] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const descricaoId = useId();

  return (
    <figure className={cn("w-full", className)}>
      <button
        ref={botaoRef}
        type="button"
        aria-label={COPY.questao.ampliarImagemDe(imagem.alt)}
        onClick={() => setAmpliada(true)}
        onPointerEnter={precarregarVisualizador}
        onFocus={precarregarVisualizador}
        className="group relative mx-auto block min-h-11 max-w-full cursor-zoom-in rounded-xl border-2 border-gelo bg-papel-figura p-1.5"
      >
        <img
          src={imagem.url}
          alt={imagem.alt}
          width={imagem.largura}
          height={imagem.altura}
          loading="lazy"
          decoding="async"
          className="mx-auto block h-auto max-h-[70vh] max-w-full object-contain"
        />
        <span
          aria-hidden="true"
          className="absolute right-1.5 bottom-1.5 grid h-8 w-8 place-items-center rounded-full border-2 border-gelo bg-cards text-abismo opacity-90 group-hover:opacity-100"
        >
          <Maximize2 size={16} />
        </span>
      </button>

      {avisoGirar && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-nevoa">
          <RotateCw size={16} aria-hidden="true" />
          {COPY.questao.gireOCelular}
        </p>
      )}

      {(imagem.credito || imagem.descricao) && (
        <figcaption className="mt-1.5 text-center">
          {imagem.credito && <span className="block text-[11px] text-nevoa">{imagem.credito}</span>}
          {imagem.descricao && (
            <>
              <button
                type="button"
                aria-expanded={descricaoAberta}
                aria-controls={descricaoId}
                onClick={() => setDescricaoAberta((v) => !v)}
                className="mt-1 inline-flex min-h-11 items-center px-2 text-sm font-semibold text-mar-fundo underline underline-offset-2"
              >
                {descricaoAberta ? COPY.questao.esconderDescricao : COPY.questao.verDescricao}
              </button>
              <div
                id={descricaoId}
                hidden={!descricaoAberta}
                className="mt-1 rounded-lg border-2 border-gelo bg-cards px-3 py-2 text-left text-sm leading-relaxed whitespace-pre-line text-abismo"
              >
                {imagem.descricao}
                {imagem.altAutomatico && (
                  <span className="mt-1.5 block text-[11px] text-nevoa">
                    {COPY.questao.descricaoAutomatica}
                  </span>
                )}
              </div>
            </>
          )}
        </figcaption>
      )}

      {ampliada && (
        <VisualizadorSobDemanda
          imagem={imagem}
          onClose={() => setAmpliada(false)}
          devolverFocoPara={() => botaoRef.current}
        />
      )}
    </figure>
  );
}
