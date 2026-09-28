import { packagedSubjectOf, subjectsComItensGerados } from "@/content/items";
import { FEATURES } from "@/lib/features";
import { ensureSubjects } from "./repository";

/**
 * Carrega os pacotes das matérias dessas habilidades/itens antes de uma tela
 * escolher ou montar questões (docs/30 §21.3: "antes de abrir uma atividade, o
 * planner chama ensureSubjects"). Nunca lança nem bloqueia pra sempre — se um
 * pacote falhar, a seleção simplesmente não escolhe os itens dele
 * (`itemDisponivel`), e a tela segue com o conteúdo embarcado.
 */
export async function carregarPacotesPara(skillIds: string[], itemIds: string[] = []): Promise<void> {
  if (!FEATURES.pacotesConteudo) return;
  const comPacote = new Set(subjectsComItensGerados());
  const materias = new Set<string>();
  for (const skillId of skillIds) {
    const subjectId = skillId.split(":")[0];
    if (comPacote.has(subjectId)) materias.add(subjectId);
  }
  for (const id of itemIds) {
    const subjectId = packagedSubjectOf(id);
    if (subjectId) materias.add(subjectId);
  }
  if (materias.size === 0) return;
  await ensureSubjects([...materias]);
}

/** Todas as matérias com itens de pacote — o nivelamento cobre áreas inteiras, então carrega tudo de uma vez. */
export async function carregarTodosOsPacotes(): Promise<void> {
  if (!FEATURES.pacotesConteudo) return;
  const materias = subjectsComItensGerados();
  if (materias.length === 0) return;
  await ensureSubjects(materias);
}
