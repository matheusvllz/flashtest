import { Fragment, useEffect, useMemo, useState } from "react";
import type { ExerciseImage, ExerciseTable } from "@/lib/lessons/types";
import { dividirPorMarcadores, indicesCitados } from "@/lib/lessons/marcadores";
import { cn } from "@/lib/utils";
import { FiguraDaQuestao } from "./FiguraDaQuestao";
import { TabelaDaQuestao } from "./TabelaDaQuestao";
import { ehImagemLarga } from "./zoom";

/** Marca de sessão do aviso de girar o celular (spec 50 §5.9.3: uma vez por sessão). */
const CHAVE_AVISO_GIRAR = "foca.questao.avisoGirar";

function avisoJaMostrado(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_AVISO_GIRAR) === "1";
  } catch {
    return false;
  }
}

function marcarAvisoMostrado(): void {
  try {
    sessionStorage.setItem(CHAVE_AVISO_GIRAR, "1");
  } catch {
    // Sem storage: o aviso aparece no máximo uma vez por montagem (o estado abaixo não volta).
  }
}

/**
 * Enunciado com imagens e tabelas na posição do original (spec 50 §5.9.3). O texto pode ter, em linha
 * própria, `[[imagem:N]]` e `[[tabela:N]]`; imagem ou tabela que nenhum marcador cita vai acima do texto,
 * na ordem. Quebras de linha do texto ficam como estão. Só apresentação: o texto não é alterado.
 *
 * `outrosTextos`: os demais textos do mesmo exercício (ex.: a pergunta da interpretação), para uma mídia
 * citada lá não ser desenhada também aqui em cima. `semMarcadorAcima={false}` no segundo bloco evita
 * desenhar duas vezes as mídias sem marcador.
 */
export function EnunciadoComMidia({
  texto,
  imagens,
  tabelas,
  outrosTextos = [],
  semMarcadorAcima = true,
  classeTexto,
  className,
}: {
  texto: string;
  imagens?: ExerciseImage[];
  tabelas?: ExerciseTable[];
  outrosTextos?: string[];
  semMarcadorAcima?: boolean;
  /** Classes de cada trecho de texto (fonte, tamanho, cor). */
  classeTexto?: string;
  className?: string;
}) {
  const segmentos = useMemo(() => dividirPorMarcadores(texto), [texto]);
  const chaveOutros = outrosTextos.join("\u0000");
  const citados = useMemo(
    () => indicesCitados([texto, ...chaveOutros.split("\u0000")]),
    [texto, chaveOutros],
  );

  const imagensAcima = semMarcadorAcima
    ? (imagens ?? []).map((img, i) => ({ img, i })).filter(({ i }) => !citados.imagens.has(i))
    : [];
  const tabelasAcima = semMarcadorAcima
    ? (tabelas ?? []).map((tab, i) => ({ tab, i })).filter(({ i }) => !citados.tabelas.has(i))
    : [];

  // Primeira imagem larga que este bloco desenha, na ordem em que aparecem.
  const ordemDasImagens = [
    ...imagensAcima.map(({ i }) => i),
    ...segmentos.flatMap((s) => (s.tipo === "imagem" ? [s.indice] : [])),
  ];
  const primeiraLarga = ordemDasImagens.find((i) =>
    ehImagemLarga(imagens?.[i]?.largura, imagens?.[i]?.altura),
  );

  // Aviso de girar o celular: na primeira imagem larga, em retrato, uma vez por sessão. Decidido depois
  // de montar (matchMedia e sessionStorage só existem no navegador).
  const [indiceAviso, setIndiceAviso] = useState<number | null>(null);
  useEffect(() => {
    if (indiceAviso !== null || primeiraLarga === undefined) return;
    if (
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(orientation: portrait)").matches
    )
      return;
    if (avisoJaMostrado()) return;
    marcarAvisoMostrado();
    setIndiceAviso(primeiraLarga);
  }, [primeiraLarga, indiceAviso]);

  const figura = (i: number) => {
    const img = imagens?.[i];
    if (!img) return null;
    return <FiguraDaQuestao key={`img-${i}`} imagem={img} avisoGirar={indiceAviso === i} />;
  };
  const tabela = (i: number) => {
    const tab = tabelas?.[i];
    if (!tab) return null;
    return <TabelaDaQuestao key={`tab-${i}`} tabela={tab} />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {imagensAcima.map(({ i }) => figura(i))}
      {tabelasAcima.map(({ i }) => tabela(i))}
      {segmentos.map((s, k) => (
        <Fragment key={k}>
          {s.tipo === "texto" ? (
            <p className={cn("whitespace-pre-line", classeTexto)}>{s.texto}</p>
          ) : s.tipo === "imagem" ? (
            figura(s.indice)
          ) : (
            tabela(s.indice)
          )}
        </Fragment>
      ))}
    </div>
  );
}
