/**
 * Metadados pedagógicos de item (docs/30 §8.4, Fase 3 do docs/31). Lateral
 * aos ~1.300 exercícios existentes (`src/data/questions.ts`,
 * `src/content/trilhas/`, `src/content/microlicoes/`) — nunca edita esses
 * arquivos, só aponta pra eles pelo id estável de `exercise-ids.ts`.
 */

export type ItemSourceKind = "autoral" | "ia-validada" | "oficial" | "adaptada-de-oficial";

export type ItemValidationStatus =
  | "gerada" // saiu do gerador (pipeline, Fase 9); nunca publicada nesse estado
  | "verificada-ia" // passou crítico + solucionador independente + verificador + validação automática
  | "revisada-humano" // amostra humana aprovou o lote (ou, no legado: revisão feita na autoria — docs/22/26)
  | "oficial-conferida"; // item oficial com gabarito conferido contra a fonte (Fase 10)

export type ItemRole = "pratica" | "revisao" | "desafio" | "diagnostico";

export interface ItemIrt {
  a: number;
  b: number;
  c: number;
  source: "estimado" | "inep" | "calibrado-foca";
  year?: number;
  /** Preenchido só quando `b` foi ajustado pela distribuição real do Inep (Fase 10, docs/30 §12.4). */
  calibratedFrom?: "inep-distribuicao";
}

export interface ItemExplanationLayers {
  detalhada?: string;
  passos?: string[];
}

export interface ItemCommonMistake {
  optionIndex?: number;
  text: string;
}

export interface ItemSource {
  kind: ItemSourceKind;
  exam?: string;
  year?: number;
  /** Ex.: "caderno azul · questão 142". */
  ref?: string;
  license?: string;
  /** Ex.: "pipeline@v1:haiku-4.5" — preenchido pelo pipeline (Fase 9). */
  generatedBy?: string;
}

/**
 * COMO o item foi revisado (docs/36 §G.5, RP-9) — separado de `status` de propósito: `revisada-humano`
 * é "passou no portão de revisão" (é o que o pool filtra), e renomeá-lo despublicaria itens e
 * reinterpretaria a autorização de `32`. Ausente = desconhecido.
 * - `humano`: pessoa leu e aprovou;
 * - `ia-delegada`: revisão feita por modelo por delegação do usuário (completa ou por amostra);
 * - `gabarito-oficial`: item oficial com gabarito conferido contra a fonte;
 * - `autoria-legada`: conteúdo autoral das trilhas antigas, revisado na autoria (docs/22/26).
 */
export type ItemReviewKind = "humano" | "ia-delegada" | "gabarito-oficial" | "autoria-legada";

export interface ItemValidation {
  status: ItemValidationStatus;
  reviewedAt?: string;
  reviewer?: string;
  reviewKind?: ItemReviewKind;
  /** Id do lote de revisão de qualidade (docs/36 Fase 7) que decidiu sobre o item, quando houve. */
  reviewNote?: string;
}

export interface ItemMeta {
  id: string;
  version: number;
  /** [0] = habilidade principal; no máximo 3 (docs/30 §8.4). */
  skillIds: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  irt: ItemIrt;
  roles: ItemRole[];
  estimatedSeconds: number;
  /** Padrão `true` — item compatível com o botão "Não sei" (docs/30 §16.1). */
  dontKnowAllowed: boolean;
  explanationLayers?: ItemExplanationLayers;
  commonMistakes?: ItemCommonMistake[];
  source: ItemSource;
  validation: ItemValidation;
  examProfiles: string[];
  /**
   * `true` quando a explicação é só a frase fixa do importador ("Gabarito oficial: alternativa X. Peça para a
   * Foca IA explicar o raciocínio."), à espera da explicação gerada e marcada como IA (spec 50 §5.9.2).
   */
  explicacaoPendente?: boolean;
}
