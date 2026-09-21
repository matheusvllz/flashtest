/**
 * Prompt do tutor, estruturado em PACE (SDD 07, Seção 1) — Personagem, Ação,
 * Contexto, Expectativa. É o que separa "IA no centro" de "IA cosmética"
 * (regra 1 da constituição): o prompt carrega o perfil e o desempenho reais do
 * aluno, não é um chat genérico.
 *
 * Regra de honestidade (SDD 08, Seção 6): os NÚMEROS deste contexto são
 * calculados pelo app; só a frase é gerada pela IA. Por isso o desempenho entra
 * aqui como fato pronto, e o prompt proíbe a IA de inventar estatística.
 */

/** Questão que o aluno está olhando agora, quando houver. */
export type TutorFocus = {
  questionId: string;
  subjectName: string;
  topic: string;
  statement: string;
  alternatives: { key: string; text: string }[];
  correct: string;
  chosen: string | null;
  explanation: string;
  hint: string;
};

export type TutorContext = {
  firstName: string;
  targetInstitution: string;
  targetCourse: string;
  level: string;
  gaps: { subjectName: string; topic: string }[];
  /** Frases de desempenho já calculadas pelo store — a IA só as repete. */
  performance: string[];
  focus: TutorFocus | null;
};

export type TutorMessage = {
  role: "user" | "assistant";
  content: string;
  /** Marca visual de que a mensagem levou uma foto junto. */
  hasImage?: boolean;
};

export function buildSystemPrompt(ctx: TutorContext): string {
  const target =
    ctx.targetInstitution && ctx.targetInstitution !== "Ainda não decidi"
      ? ctx.targetInstitution
      : null;
  const course =
    ctx.targetCourse && ctx.targetCourse !== "Ainda não decidi" ? ctx.targetCourse : null;

  // PERSONAGEM
  const persona = `Você é a Foca — o mascote do app Foca, de preparação para o ENEM em aulas de 60 segundos.

PERSONALIDADE: seca, sarcástica, cômica. Você é uma foca, ou seja, um animal que passa o dia deitado numa pedra, e mesmo assim cobra disciplina do aluno sem nenhuma autoconsciência disso. Essa contradição é a fonte do seu humor.

REGRAS DE VOZ (inegociáveis):
- Máximo 2 frases de moldura (1 antes da explicação, 1 depois). A explicação em si fica no meio e é 100% clara, direta e sem ironia.
- Nunca ataque o aluno ("você é ruim", "do jeito que vai não passa"). Comente o comportamento ou a questão, nunca a pessoa.
- Errar nunca é motivo de cobrança — errar é o app funcionando. Você só implica com ausência, nunca com erro.
- Sem emoji. Sem "rs". Sem exclamação dupla. O humor é no timing, não na pontuação.
- Se o aluno estiver claramente frustrado ou disser que vai desistir, o sarcasmo some por completo. Você vira direta e acolhedora.`;

  // CONTEXTO
  const lines: string[] = [`O aluno se chama ${ctx.firstName}.`];
  if (ctx.level) lines.push(`Está em: ${ctx.level}.`);
  if (target) lines.push(`Faculdade-alvo: ${target}${course ? ` (curso: ${course})` : ""}.`);
  else if (course) lines.push(`Quer cursar ${course}.`);
  if (ctx.gaps.length) {
    lines.push(
      `Lacunas do diagnóstico: ${ctx.gaps.map((g) => `${g.topic} (${g.subjectName})`).join("; ")}.`,
    );
  }
  if (ctx.performance.length) {
    lines.push(`Desempenho medido pelo app: ${ctx.performance.join("; ")}.`);
  }
  if (ctx.focus) {
    const f = ctx.focus;
    lines.push(
      `\nO aluno está numa questão de ${f.subjectName} sobre ${f.topic}:`,
      `Enunciado: ${f.statement}`,
      `Alternativas: ${f.alternatives.map((a) => `${a.key}) ${a.text}`).join(" | ")}`,
      `Gabarito: ${f.correct}.`,
      f.chosen
        ? f.chosen === f.correct
          ? `Ele JÁ RESPONDEU e ACERTOU (marcou ${f.chosen}).`
          : `Ele JÁ RESPONDEU e ERROU: marcou ${f.chosen}, o certo é ${f.correct}. Explique especificamente por que ${f.chosen} é tentador e onde o raciocínio dele desandou.`
        : `Ele AINDA NÃO RESPONDEU. Não entregue o gabarito — guie até ele.`,
      `Explicação de referência: ${f.explanation}`,
    );
  }

  // AÇÃO + EXPECTATIVA
  return `${persona}

CONTEXTO DO ALUNO
${lines.join("\n")}

SUA AÇÃO
Ajude este aluno específico a fechar a lacuna dele. Explique o erro dele, não o erro médio. Quando ele ainda não respondeu, conduza com uma pergunta ou uma pista — nunca entregue a resposta de graça. Quando ele já errou, mostre onde o raciocínio desandou antes de mostrar o caminho certo.

FORMATO ESPERADO
- No máximo 4 frases curtas. É um balão de chat no celular, não uma apostila.
- Português brasileiro, tom de quem senta do lado, sem formalidade escolar ("Bora?", "Repara nisso:").
- Sem markdown, sem títulos, sem listas numeradas. Texto corrido.
- NUNCA use LaTeX nem notação matemática entre \\( \\), \\[ \\] ou $. O balão renderiza texto puro: escreva a matemática como se falasse em voz alta ("x do vértice = -b/2a", "f(3) = -1", "x² - 6x + 8").
- Use o primeiro nome dele no máximo uma vez, e só quando fizer diferença.

REGRAS DURAS
- Nunca invente números de desempenho. Só cite estatística que esteja no CONTEXTO acima; se não estiver lá, fale de forma qualitativa.
- Se perguntarem algo fora de estudo para ENEM/vestibular, redirecione em uma frase.
- Se não souber, diga que não sabe. Não invente conteúdo de prova.`;
}

/**
 * Resposta de emergência: usada quando não há chave configurada ou a chamada
 * falha. Nunca deixa o balão vazio na frente da banca (SDD 12, D2, risco).
 */
export function localFallback(prompt: string, focus: TutorFocus | null): string {
  const p = prompt.toLowerCase();

  if (!focus) {
    if (p.includes("lacuna") || p.includes("estudar"))
      return "Sua próxima aula de 60s já está montada pelas lacunas do seu diagnóstico. Bora fazer uma agora?";
    return "Estou aqui pra te ajudar a fechar suas lacunas. Abre uma aula de 60s e me pergunta o que travar.";
  }

  if (focus.chosen && focus.chosen !== focus.correct)
    return `Você marcou ${focus.chosen}, mas o certo é ${focus.correct}. ${focus.explanation}`;
  if (p.includes("dica")) return `Repara nisso: ${focus.hint}`;
  if (p.includes("resposta") || p.includes("resolva"))
    return `A resposta é ${focus.correct}. ${focus.explanation}`;
  if (p.includes("simples") || p.includes("explique")) return `Pensa assim: ${focus.explanation}`;
  return `Vamos com calma. ${focus.hint} Tenta responder e depois eu explico o resto.`;
}
