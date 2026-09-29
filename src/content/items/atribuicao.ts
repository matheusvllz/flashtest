import type { ItemSource } from "./types";

/**
 * Atribuição pública de um item OFICIAL — "ENEM 2023" (ano + prova; `docs/34`, requisito
 * não-negociável, RP-10). É o que a tela mostra abaixo do enunciado e na folha de feedback
 * ("Questão do ENEM 2023"). `undefined` para item que não é oficial ou sem nome de prova: quem
 * chama não desenha nada (nunca inventa fonte).
 *
 * Pura e sem imports de conteúdo: serve tanto à meta resolvida (`itemMetaOf`) quanto ao índice
 * leve (`metaFromRef`, antes de o pacote carregar).
 */
export function atribuicaoOficial(source: Pick<ItemSource, "kind" | "exam" | "year"> | undefined): string | undefined {
  if (!source || source.kind !== "oficial") return undefined;
  const prova = source.exam?.trim();
  if (!prova) return undefined;
  return source.year ? `${prova} ${source.year}` : prova;
}
