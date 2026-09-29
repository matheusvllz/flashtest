import type { Exercise } from "@/lib/lessons/types";
import type { MicroLessonV2 } from "@/lib/learning/types";
import type { ItemMeta, ItemSource } from "./types";

/**
 * Formato de um pacote de conteúdo por matéria (docs/30 §21.3, Fase 3 T-3.7)
 * — o que `scripts/content/build-packs.ts` escreve em
 * `public/content/v1/<materia>.<hash>.json` e `src/lib/content/repository.ts`
 * carrega em runtime. Nunca importado pelas rotas do app diretamente —
 * sempre via `repository.ts`, que decide quando buscar.
 */
export interface ContentPackageItem {
  id: string;
  exercise: Exercise;
  meta: ItemMeta;
  /**
   * Item retirado de circulação pela revisão de qualidade (docs/36 §G.6): sai de pools, seleção,
   * checkpoint e aulas novas, mas continua RESOLVÍVEL (tentativas antigas, sessão ativa e aulas
   * que o referenciam não quebram). Ausente = `false`.
   */
  retired?: boolean;
}

export interface ContentPackage {
  version: number;
  subjectId: string;
  items: ContentPackageItem[];
  lessons: MicroLessonV2[];
}

export interface ContentManifestEntry {
  /** Caminho público do pacote, ex. "/content/v1/mat.a1b2c3.json". */
  path: string;
  /** Hash do conteúdo — muda o nome do arquivo pra invalidar cache HTTP sem query string. */
  hash: string;
  itemCount: number;
  lessonCount: number;
}

export interface ContentManifest {
  version: number;
  generatedAt: string;
  subjects: Record<string, ContentManifestEntry>;
}

/**
 * Índice leve de um item em pacote (docs/30 §21.3, "~60 B por item: id, skill,
 * dif, b, papéis, status") — embarcado, pro motor saber que o item EXISTE e
 * poder escolhê-lo antes do pacote carregar. O texto do item só chega com
 * `ensureSubjects`.
 */
export interface GeneratedItemRef {
  id: string;
  subjectId: string;
  skillIds: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  a: number;
  b: number;
  c: number;
  roles: ItemMeta["roles"];
  status: ItemMeta["validation"]["status"];
  /**
   * Origem do item, só quando NÃO é o padrão `ia-validada` (item oficial: `{ kind, exam, year, ref }`),
   * pra `metaFromRef` não afirmar "IA" sobre uma questão do ENEM enquanto o pacote não carregou
   * (docs/36 T-07.5). Ausente = `{ kind: "ia-validada" }`.
   */
  source?: Pick<ItemSource, "kind" | "exam" | "year" | "ref">;
  /** Item retirado (ver `ContentPackageItem.retired`); gravado só quando `true`. */
  retired?: true;
}

/** Uma aula gerada pelo pipeline, registrada pra a árvore de currículo saber que ela existe (docs/30 §21.3). */
export interface GeneratedLessonRef {
  lessonId: string;
  chapterId: string;
  subjectId: string;
  skillIds: string[];
  /** Título da aula — a árvore monta o capítulo antes do pacote carregar. */
  title: string;
}
