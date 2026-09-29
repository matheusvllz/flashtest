import { COURSES_CATALOG, type CourseDef } from "@/data/courses";

/** Sem acento, minúsculo, sem espaços nas pontas — aplicado à entrada e ao alvo (docs/36 §F.7). */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Busca de curso por nome ou sinônimo, sem acento nem caixa. Ordem: igual ao
 * termo, depois começa com o termo, depois só contém; dentro de cada faixa, a
 * ordem do catálogo. Busca vazia devolve `[]` (o componente mostra os grupos).
 */
export function buscarCursos(consulta: string): CourseDef[] {
  const q = normalizar(consulta);
  if (!q) return [];
  const achados: { curso: CourseDef; faixa: number; ordem: number }[] = [];
  COURSES_CATALOG.forEach((curso, ordem) => {
    const alvos = [normalizar(curso.name), ...curso.synonyms.map(normalizar)];
    if (!alvos.some((a) => a.includes(q))) return;
    const faixa = alvos.some((a) => a === q) ? 0 : alvos.some((a) => a.startsWith(q)) ? 1 : 2;
    achados.push({ curso, faixa, ordem });
  });
  achados.sort((a, b) => a.faixa - b.faixa || a.ordem - b.ordem);
  return achados.map((x) => x.curso);
}
