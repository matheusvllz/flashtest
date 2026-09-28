import type { EnemArea } from "./types";

/**
 * Mapa matéria → área ENEM (docs/30 §8.1, fixo). `red` é área própria
 * (`RED`) — o nivelamento (Fase 13) não mede redação, texto livre.
 */
export const SUBJECT_AREA: Record<string, EnemArea> = {
  mat: "MT",
  por: "LC",
  lit: "LC",
  ing: "LC",
  red: "RED",
  fis: "CN",
  qui: "CN",
  bio: "CN",
  his: "CH",
  geo: "CH",
  fil: "CH",
  soc: "CH",
};

export const AREA_NAMES: Record<EnemArea, string> = {
  LC: "Linguagens, Códigos e suas Tecnologias",
  MT: "Matemática e suas Tecnologias",
  CN: "Ciências da Natureza e suas Tecnologias",
  CH: "Ciências Humanas e suas Tecnologias",
  RED: "Redação",
};

export function areaOfSubject(subjectId: string): EnemArea | undefined {
  return SUBJECT_AREA[subjectId];
}
