/**
 * Domínio médio (0–100) por área do ENEM a partir do modelo do aluno (spec 49 T-49.9.2): a lacuna que o cronograma
 * usa para dividir a semana. Área sem habilidade medida = `null`.
 */
import { areaOfSubject } from "@/content/taxonomy/areas";
import { SKILL_MAP } from "@/content/taxonomy";
import { mastery } from "@/lib/adaptive/model";
import type { AreaObjetiva } from "@/lib/cronograma";
import type { SkillModelEntry } from "@/lib/learning/types";

export function dominioPorArea(modelo: Record<string, SkillModelEntry | undefined>): Record<AreaObjetiva, number | null> {
  const soma: Record<string, { t: number; n: number }> = {};
  for (const [skillId, entrada] of Object.entries(modelo)) {
    if (!entrada) continue;
    const area = areaOfSubject(SKILL_MAP[skillId]?.subjectId ?? "");
    if (!area || area === "RED") continue;
    const s = (soma[area] ??= { t: 0, n: 0 });
    s.t += mastery(entrada);
    s.n += 1;
  }
  const media = (a: AreaObjetiva) => (soma[a] ? Math.round(soma[a].t / soma[a].n) : null);
  return { LC: media("LC"), MT: media("MT"), CN: media("CN"), CH: media("CH") };
}
