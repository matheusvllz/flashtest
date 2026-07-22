import type { Gap, QuizAnswer } from "@/lib/store";
import { QUESTIONS } from "@/data/questions";
import { SUBJECTS } from "@/data/subjects";

/**
 * Heurística local das 3 lacunas (Development 1). O quiz de entrada é curto e não mede
 * conteúdo, então hoje as lacunas saem das matérias declaradas difíceis, completadas com
 * tópicos de alta incidência. `answers` já está no contrato porque a Development 2
 * reintroduz calibração — aí respostas erradas viram lacuna confirmada e a IA refina.
 */
export function computeGaps(answers: QuizAnswer[], difficultSubjects: string[]): Gap[] {
  const gaps: Gap[] = [];
  const seen = new Set<string>();

  const push = (g: Gap) => {
    if (gaps.length >= 3 || seen.has(g.topic)) return;
    seen.add(g.topic);
    gaps.push(g);
  };

  // 1. Errou na calibração → lacuna confirmada.
  for (const a of answers) {
    if (!a.correct) {
      push({
        subject: a.subject,
        subjectName: a.subjectName,
        topic: a.topic,
        severity: "alta",
        reason: `Você errou a questão de calibração deste assunto.`,
      });
    }
  }

  // 2. Matérias que o aluno declarou difíceis → pega um tópico representativo.
  for (const name of difficultSubjects) {
    const subject = SUBJECTS.find((s) => s.name === name);
    if (!subject) continue;
    const topic = topicWithQuestions(subject.id) ?? subject.topics[0]?.name;
    if (!topic) continue;
    push({
      subject: subject.id,
      subjectName: subject.name,
      topic,
      severity: "média",
      reason: `Você marcou ${subject.name} como uma das suas maiores dificuldades.`,
    });
  }

  // 3. Fallback: assuntos de maior incidência no ENEM presentes no banco.
  for (const q of QUESTIONS) {
    push({
      subject: q.subject,
      subjectName: q.subjectName,
      topic: q.topic,
      severity: "baixa",
      reason: "Assunto de alta incidência que ainda não medimos com você.",
    });
  }

  return gaps.slice(0, 3);
}

function topicWithQuestions(subjectId: string) {
  return QUESTIONS.find((q) => q.subject === subjectId)?.topic;
}
