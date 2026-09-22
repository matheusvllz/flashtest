import { multiplaEscolha, verdadeiroFalso } from "@/lib/lessons/define";
import type { Exercise } from "@/lib/lessons/types";
import type { MicroLesson } from "@/lib/learning/types";

/**
 * Matemática — porcentagem: valor percentual e aumento/desconto (docs/20
 * §14.1: "duas lições piloto"). Fonte: matriz de referência ENEM, área de
 * Matemática (grandezas e medidas). `status: "reviewed"` — revisão
 * pedagógica por especialista ainda pendente, ver docs/21.
 *
 * Convertidas para o formato v2 (docs/25 §18 T-13): ensino intercalado com
 * 4-8 questões de dificuldade progressiva, em vez de bloco único + 2
 * práticas. `mc:<id>:pratica-3` e `mc:<id>:desafio` são os dois exercícios
 * novos por lição exigidos pela tarefa; `reviewExerciseIds` continuam
 * intocados.
 */

export const EXERCICIOS: Record<string, Exercise> = {
  "mc:porcentagem-valor:checkpoint": multiplaEscolha({
    pergunta: "20% equivale a qual fração/decimal?",
    opcoes: ["20/1000 = 0,02", "20/100 = 0,2", "20/10 = 2", "2/100 = 0,002"],
    correta: 1,
    explicacao: "Porcentagem é sempre \"em cada 100\": 20% = 20/100 = 0,2.",
  }),
  "mc:porcentagem-valor:pratica-2": multiplaEscolha({
    pergunta: "Quanto é 8% de R$ 250,00?",
    opcoes: ["R$ 2,00", "R$ 8,00", "R$ 20,00", "R$ 200,00"],
    correta: 2,
    explicacao: "8% = 0,08. Então 0,08 × 250 = R$ 20,00.",
  }),
  "mc:porcentagem-valor:revisao-1": verdadeiroFalso({
    afirmacao: "50% de um número é sempre igual à metade desse número.",
    verdadeiro: true,
    explicacao: "50% = 50/100 = 0,5 = 1/2 — metade, sempre, qualquer que seja o número.",
  }),
  "mc:porcentagem-valor:revisao-2": multiplaEscolha({
    pergunta: "Para calcular X% de N, a forma mais direta é:",
    opcoes: ["N ÷ X", "(X/100) × N", "X × N × 100", "N − X"],
    correta: 1,
    explicacao: "Converte a porcentagem em decimal (X/100) e multiplica pelo total (N).",
  }),

  "mc:porcentagem-aumento-desconto:checkpoint": multiplaEscolha({
    pergunta:
      "Um produto de R$ 200,00 recebe um AUMENTO de 10%. Qual fator multiplicativo dá o preço novo direto?",
    opcoes: ["0,10", "0,90", "1,10", "1,90"],
    correta: 2,
    explicacao: "Aumento de 10% = preço original + 10% dele = 100% + 10% = 110% = fator 1,10.",
  }),
  "mc:porcentagem-aumento-desconto:pratica-1": multiplaEscolha({
    pergunta: "Uma calça de R$ 150,00 está com 20% de DESCONTO. Qual o preço final?",
    opcoes: ["R$ 30,00", "R$ 100,00", "R$ 120,00", "R$ 130,00"],
    correta: 2,
    explicacao: "Desconto de 20% = fator 0,80 (100% − 20% = 80%). 150 × 0,80 = R$ 120,00.",
  }),
  "mc:porcentagem-aumento-desconto:pratica-2": multiplaEscolha({
    pergunta: "Um salário de R$ 1.000,00 recebe um reajuste de 5%. Qual o novo salário?",
    opcoes: ["R$ 1.005,00", "R$ 1.050,00", "R$ 1.500,00", "R$ 1.050,50"],
    correta: 1,
    explicacao: "Fator de aumento de 5% = 1,05. 1000 × 1,05 = R$ 1.050,00.",
  }),
  "mc:porcentagem-aumento-desconto:revisao-1": verdadeiroFalso({
    afirmacao: "Para aplicar um desconto de 30%, o fator multiplicativo é 0,30.",
    verdadeiro: false,
    explicacao: "0,30 seria os 30% ISOLADOS. O fator que dá o preço final direto é 1 − 0,30 = 0,70.",
  }),
  "mc:porcentagem-aumento-desconto:revisao-2": multiplaEscolha({
    pergunta: "Um livro de R$ 80,00 sobe para R$ 88,00. Qual foi o aumento percentual?",
    opcoes: ["8%", "10%", "12%", "88%"],
    correta: 1,
    explicacao: "Aumento = 88 − 80 = 8. Percentual: 8/80 = 0,10 = 10%.",
  }),

  "mc:porcentagem-valor:pratica-3": multiplaEscolha({
    pergunta: "Numa prova com 40 questões, um aluno acertou 60% delas. Quantas questões ele acertou?",
    opcoes: ["20", "24", "28", "32"],
    correta: 1,
    explicacao: "0,6 (60% em decimal) multiplicado por 40 dá 24 questões certas.",
  }),
  "mc:porcentagem-valor:desafio": multiplaEscolha({
    pergunta:
      "Numa pesquisa com 1.200 eleitores, 35% responderam que pretendem votar no candidato A. Dos que NÃO escolheram o candidato A, 40% estão indecisos. Quantos eleitores estão indecisos?",
    opcoes: ["280", "300", "312", "420"],
    correta: 2,
    explicacao:
      "65% de 1.200 (quem não escolheu A) são 780 eleitores; 40% desses 780 são 312 indecisos.",
  }),

  "mc:porcentagem-aumento-desconto:pratica-3": verdadeiroFalso({
    afirmacao: "Dois descontos sucessivos de 10% cada equivalem a um desconto único de 20%.",
    verdadeiro: false,
    explicacao:
      "Falso: aplicar 10% duas vezes dá fator 0,9 × 0,9 = 0,81, ou seja, 19% de desconto total — não 20%, porque o segundo desconto incide sobre um valor já menor.",
  }),
  "mc:porcentagem-aumento-desconto:desafio": multiplaEscolha({
    pergunta:
      "Uma TV custava R$ 2.000,00. Numa promoção, o preço sofreu um aumento de 25% e, na semana seguinte, um desconto de 20% sobre o novo preço. Qual o preço final?",
    opcoes: ["R$ 1.800,00", "R$ 1.900,00", "R$ 2.000,00", "R$ 2.050,00"],
    correta: 2,
    explicacao:
      "Aumento de 25% dá fator 1,25 (2000 × 1,25 = 2500); desconto de 20% dá fator 0,80 (2500 × 0,80 = 2000) — os fatores se cancelam parcialmente e o preço volta ao valor original.",
  }),
};

export const LICOES: MicroLesson[] = [
  {
    id: "porcentagem-valor",
    version: 2,
    format: 2,
    subjectId: "mat",
    topicId: "porc",
    chapterId: "mat-porcentagem",
    title: "O que é porcentagem",
    objective: "Entender porcentagem como fração de 100 e calcular o valor percentual de uma quantidade.",
    skillIds: ["mat:porcentagem-conceito", "mat:porcentagem-valor"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 45,
    estimatedPracticeSeconds: 150,
    steps: [
      {
        kind: "intro",
        title: "O que é porcentagem",
        body: "Entender porcentagem como fração de 100 e calcular o valor percentual de uma quantidade.",
      },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "Porcentagem é fração de 100",
          body: "\"Por cento\" (%) significa \"a cada 100\". 20% é o mesmo que 20/100, ou 0,2 em decimal. Pra calcular X% de um número N, é só multiplicar N pelo decimal.",
        },
      },
      { kind: "question", exerciseId: "mc:porcentagem-valor:checkpoint", role: "checkpoint", difficulty: 1 },
      {
        kind: "teach",
        block: {
          type: "worked-example",
          title: "Exemplo: 15% de 500",
          problem: "Em uma turma de 500 alunos, 15% foram aprovados com nota máxima. Quantos alunos são?",
          steps: ["Converta 15% em decimal: 15/100 = 0,15.", "Multiplique pelo total: 0,15 × 500."],
          result: "0,15 × 500 = 75 alunos.",
        },
      },
      { kind: "question", exerciseId: "q10", role: "pratica", difficulty: 1 },
      { kind: "question", exerciseId: "mc:porcentagem-valor:pratica-2", role: "pratica", difficulty: 2 },
      {
        kind: "tip",
        body: "Erro comum: multiplicar pelo número do percentual sem dividir por 100 antes. 20% de 50 não é 20 × 50 — é 0,20 × 50. Sempre converta primeiro.",
      },
      { kind: "question", exerciseId: "mc:porcentagem-valor:pratica-3", role: "pratica", difficulty: 2 },
      { kind: "question", exerciseId: "mc:porcentagem-valor:desafio", role: "desafio", difficulty: 3 },
      {
        kind: "recap",
        body: "Porcentagem é fração de 100 — converta pra decimal (X/100) e multiplique pelo total.",
      },
    ],
    reviewExerciseIds: ["mc:porcentagem-valor:revisao-1", "mc:porcentagem-valor:revisao-2"],
    recap: "Porcentagem é fração de 100 — converta pra decimal (X/100) e multiplique pelo total.",
    sources: ["Matriz de referência ENEM — Matemática e suas Tecnologias, competência de área 2"],
    reviewedAt: "2026-09-21",
  },
  {
    id: "porcentagem-aumento-desconto",
    version: 2,
    format: 2,
    subjectId: "mat",
    topicId: "porc",
    chapterId: "mat-porcentagem",
    title: "Aumento e desconto percentual",
    objective: "Calcular o valor final de um aumento ou desconto percentual usando o fator multiplicativo.",
    skillIds: ["mat:porcentagem-fator-multiplicativo"],
    prerequisiteLessonIds: ["porcentagem-valor"],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 60,
    estimatedPracticeSeconds: 150,
    steps: [
      {
        kind: "intro",
        title: "Aumento e desconto percentual",
        body: "Calcular o valor final de um aumento ou desconto percentual usando o fator multiplicativo.",
      },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "O fator multiplicativo",
          body: "Em vez de calcular a porcentagem e depois somar ou subtrair, dá pra ir direto: aumento de X% é multiplicar por (1 + X/100); desconto de X% é multiplicar por (1 − X/100).",
        },
      },
      {
        kind: "question",
        exerciseId: "mc:porcentagem-aumento-desconto:checkpoint",
        role: "checkpoint",
        difficulty: 1,
      },
      {
        kind: "teach",
        block: {
          type: "worked-example",
          title: "Exemplo: desconto de 20%",
          problem: "Uma calça de R$ 150,00 está com 20% de desconto. Qual o preço final?",
          steps: [
            "Desconto de 20% = fator 1 − 0,20 = 0,80.",
            "Multiplique o preço original pelo fator: 150 × 0,80.",
          ],
          result: "150 × 0,80 = R$ 120,00.",
        },
      },
      {
        kind: "question",
        exerciseId: "mc:porcentagem-aumento-desconto:pratica-1",
        role: "pratica",
        difficulty: 1,
      },
      {
        kind: "question",
        exerciseId: "mc:porcentagem-aumento-desconto:pratica-2",
        role: "pratica",
        difficulty: 2,
      },
      {
        kind: "tip",
        body: "Erro comum: somar ou subtrair percentuais sucessivos direto (25% − 20% = 5%). O correto é multiplicar os fatores em sequência — cada percentual incide sobre o valor já alterado, não sobre o original.",
      },
      {
        kind: "teach",
        block: {
          type: "diagram",
          kind: "fator-percentual",
          title: "Fator multiplicativo em reta numérica",
          caption: "Desconto reduz o fator abaixo de 1; aumento eleva acima de 1",
          accessibleDescription:
            "Uma reta numérica horizontal com o valor 1 marcado ao centro. À esquerda do 1, a região de desconto (fatores entre 0 e 1, como 0,80 para 20% de desconto). À direita do 1, a região de aumento (fatores maiores que 1, como 1,10 para 10% de aumento).",
        },
      },
      {
        kind: "question",
        exerciseId: "mc:porcentagem-aumento-desconto:pratica-3",
        role: "pratica",
        difficulty: 2,
      },
      {
        kind: "question",
        exerciseId: "mc:porcentagem-aumento-desconto:desafio",
        role: "desafio",
        difficulty: 3,
      },
      {
        kind: "recap",
        body: "Aumento de X% = multiplicar por (1 + X/100). Desconto de X% = multiplicar por (1 − X/100).",
      },
    ],
    reviewExerciseIds: [
      "mc:porcentagem-aumento-desconto:revisao-1",
      "mc:porcentagem-aumento-desconto:revisao-2",
    ],
    recap: "Aumento de X% = multiplicar por (1 + X/100). Desconto de X% = multiplicar por (1 − X/100).",
    sources: ["Matriz de referência ENEM — Matemática e suas Tecnologias, competência de área 2"],
    reviewedAt: "2026-09-21",
  },
];
