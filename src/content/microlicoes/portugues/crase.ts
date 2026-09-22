import { completeLacuna, multiplaEscolha, verdadeiroFalso } from "@/lib/lessons/define";
import type { Exercise } from "@/lib/lessons/types";
import type { MicroLesson } from "@/lib/learning/types";

/**
 * Português — crase: fusão de preposição + artigo e casos proibidos
 * (docs/20 §14.1: "duas lições piloto"). Fonte: matriz de referência ENEM,
 * área de Linguagens (norma-padrão). `status: "reviewed"` — revisão
 * pedagógica por especialista ainda pendente, ver docs/21.
 *
 * Convertidas para o formato v2 (docs/25 §18 T-13): ensino intercalado com
 * 4-8 questões de dificuldade progressiva, em vez de bloco único + 2
 * práticas. `mc:<id>:pratica-3` são os exercícios novos exigidos pela
 * tarefa; o `desafio` de cada lição reaproveita um item das trilhas legadas
 * de crase (ids sugeridos pelo T-13, verificados via `trilhaExerciseById`);
 * `reviewExerciseIds` continuam intocados.
 */

export const EXERCICIOS: Record<string, Exercise> = {
  "mc:crase-quando-usar:checkpoint": multiplaEscolha({
    pergunta: "A crase (à) é a fusão de quais dois elementos?",
    opcoes: [
      "Duas preposições \"a\"",
      "A preposição \"a\" + o artigo feminino \"a\"/\"as\"",
      "O artigo \"a\" + o pronome \"ela\"",
      "A preposição \"a\" + o verbo \"há\"",
    ],
    correta: 1,
    explicacao:
      "Crase é a fusão da preposição \"a\" (exigida por algum termo antes) com o artigo definido feminino \"a\" ou \"as\" (exigido pela palavra depois).",
  }),
  "mc:crase-quando-usar:pratica-2": multiplaEscolha({
    pergunta: "Qual truque ajuda a testar se cabe crase antes de uma palavra feminina?",
    opcoes: [
      "Trocar a palavra por uma masculina equivalente: se virar \"ao\", tem crase",
      "Contar quantas letras tem a palavra",
      "Ver se a frase termina em ponto de interrogação",
      "Verificar se o verbo está no passado",
    ],
    correta: 0,
    explicacao:
      "Substituindo o feminino por um masculino equivalente: \"Vou à escola\" → \"Vou ao colégio\". Se aparece \"ao\", a crase estava certa.",
  }),
  "mc:crase-quando-usar:revisao-1": verdadeiroFalso({
    afirmacao: "Na regra geral da crase, o \"a\" que se funde com a preposição é sempre um artigo feminino.",
    verdadeiro: true,
    explicacao:
      "Sim — na regra geral, o artigo que se funde com a preposição (\"a\"/\"as\") é feminino, por isso a crase pede palavra feminina. Há uma exceção pontual (\"àquele\", \"àquilo\"), onde o \"a\" fundido é do próprio demonstrativo, não do substantivo — mas essa exceção vem só depois, com as trilhas de casos.",
  }),
  "mc:crase-quando-usar:revisao-2": multiplaEscolha({
    pergunta: "Em \"Cheguei à uma da tarde\", por que há crase antes de \"uma\"?",
    opcoes: [
      "Porque toda hora leva crase",
      "Porque \"uma\" aqui é numeral de hora, feminino, e o verbo \"chegar\" pede a preposição \"a\"",
      "Porque a frase está no futuro",
      "Não há crase correta nessa frase",
    ],
    correta: 1,
    explicacao:
      "Indicação de horas específicas (\"à uma\", \"às duas\") usa crase quando o verbo exige a preposição \"a\" — aqui, \"chegar a\" algum horário.",
  }),

  "mc:crase-proibida:checkpoint": multiplaEscolha({
    pergunta: "A crase NUNCA ocorre antes de:",
    opcoes: ["Palavras femininas", "Verbos", "Horas específicas", "A palavra \"casa\", quando determinada"],
    correta: 1,
    explicacao:
      "Verbo não é substantivo e não admite artigo — sem artigo, não tem fusão. \"Começou a chorar\" nunca vira \"à chorar\".",
  }),
  "mc:crase-proibida:pratica-1": multiplaEscolha({
    pergunta: "Assinale a frase com erro de crase:",
    opcoes: [
      "Ela começou à chorar de repente.",
      "Ela começou a chorar de repente.",
      "Fui à padaria de manhã.",
      "Entreguei o presente à Maria.",
    ],
    correta: 0,
    explicacao:
      "\"Chorar\" é verbo — não recebe artigo, então não pode haver crase antes dele. O certo é \"começou a chorar\".",
  }),
  "mc:crase-proibida:pratica-2": multiplaEscolha({
    pergunta: "Por que \"Entreguei à ele o documento\" está errado?",
    opcoes: [
      "Porque \"documento\" é uma palavra masculina",
      "Porque \"ele\" é pronome pessoal e não admite artigo antes dele",
      "Porque o verbo \"entregar\" não existe",
      "Na verdade a frase está certa",
    ],
    correta: 1,
    explicacao:
      "Pronomes pessoais retos (ele, ela, você...) não vêm precedidos de artigo — sem artigo, sem crase. O certo é \"Entreguei a ele\".",
  }),
  "mc:crase-proibida:revisao-1": verdadeiroFalso({
    afirmacao: "\"Fui à Brasília\" está sempre correto, porque toda cidade recebe crase.",
    verdadeiro: false,
    explicacao:
      "Nomes de cidade em geral não têm artigo (\"Brasília\", não \"a Brasília\"), então normalmente não levam crase: \"Fui a Brasília\". Só levam crase quando a cidade É especificada com artigo (\"a São Paulo dos anos 80\").",
  }),
  "mc:crase-proibida:revisao-2": multiplaEscolha({
    pergunta: "\"Refiro-me à ela\" está errado porque:",
    opcoes: [
      "\"Refiro-me\" não existe",
      "\"Ela\" é pronome pessoal e não aceita artigo antes",
      "Falta um acento em \"refiro\"",
      "A frase está correta",
    ],
    correta: 1,
    explicacao:
      "Igual ao caso de \"ele\": pronomes pessoais retos não recebem artigo. O certo é \"Refiro-me a ela\".",
  }),

  "mc:crase-quando-usar:pratica-3": completeLacuna({
    frase: "Cheguei___ escola mais cedo hoje.",
    opcoes: ["a", "ah", "à"],
    correta: 2,
    explicacao:
      "\"Escola\" é palavra feminina e o verbo \"chegar\" pede a preposição \"a\" — logo há fusão: preposição + artigo = crase (à).",
  }),

  "mc:crase-proibida:pratica-3": multiplaEscolha({
    pergunta: "Por que não se usa crase em \"Andava a cavalo pelos campos\"?",
    opcoes: [
      "Porque \"cavalo\" é palavra masculina, sem artigo feminino",
      "Porque \"andava\" é verbo no passado",
      "Porque a frase é uma expressão idiomática sem regra",
      "Porque falta uma vírgula antes de \"cavalo\"",
    ],
    correta: 0,
    explicacao:
      "\"Cavalo\" é substantivo masculino — não existe artigo feminino \"a\" para se fundir com a preposição, então \"a cavalo\" fica sem acento.",
  }),
};

export const LICOES: MicroLesson[] = [
  {
    id: "crase-quando-usar",
    version: 2,
    format: 2,
    subjectId: "por",
    topicId: "crase",
    chapterId: "por-crase",
    title: "Quando usar crase",
    objective: "Identificar quando a crase deve ser usada, pela regra da fusão preposição + artigo.",
    skillIds: ["por:crase-regra-basica"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 60,
    estimatedPracticeSeconds: 150,
    steps: [
      {
        kind: "intro",
        title: "Quando usar crase",
        body: "Identificar quando a crase deve ser usada, pela regra da fusão preposição + artigo.",
      },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "Duas peças que se encontram",
          body: "Crase (à) acontece quando duas coisas se encontram na mesma palavra: a preposição \"a\", exigida por um verbo ou nome antes (\"ir A\", \"referir-se A\"), e o artigo \"a\"/\"as\", exigido por um substantivo feminino depois.",
        },
      },
      { kind: "question", exerciseId: "mc:crase-quando-usar:checkpoint", role: "checkpoint", difficulty: 1 },
      {
        kind: "teach",
        block: {
          type: "worked-example",
          title: "O truque da substituição",
          problem: "\"Vou à escola\" — tem crase mesmo?",
          steps: [
            "Troque \"escola\" (feminina) por uma palavra masculina equivalente: \"colégio\".",
            "Reescreva: \"Vou ao colégio\".",
            "Se apareceu \"ao\", é porque havia preposição + artigo escondidos no \"à\" original.",
          ],
          result: "\"Vou ao colégio\" confirma: \"Vou à escola\" está correto.",
        },
      },
      { kind: "question", exerciseId: "q12", role: "pratica", difficulty: 1 },
      { kind: "question", exerciseId: "mc:crase-quando-usar:pratica-2", role: "pratica", difficulty: 2 },
      {
        kind: "tip",
        body: "Erro comum: confundir \"à\" (crase) com \"há\" (verbo haver, indica tempo passado ou existência). São homófonos, mas com funções bem diferentes — o teste da substituição não serve pra esse caso.",
      },
      { kind: "question", exerciseId: "mc:crase-quando-usar:pratica-3", role: "pratica", difficulty: 2 },
      {
        kind: "question",
        exerciseId: "crase-01-a-regra-de-ouro:2",
        role: "desafio",
        difficulty: 3,
      },
      {
        kind: "recap",
        body: "Crase = preposição \"a\" + artigo \"a\"/\"as\". Teste: troque por uma palavra masculina — se virar \"ao\", tinha crase.",
      },
    ],
    reviewExerciseIds: ["mc:crase-quando-usar:revisao-1", "mc:crase-quando-usar:revisao-2"],
    recap: "Crase = preposição \"a\" + artigo \"a\"/\"as\". Teste: troque por uma palavra masculina — se virar \"ao\", tinha crase.",
    sources: ["Matriz de referência ENEM — Linguagens, Códigos e suas Tecnologias, competência de área 8"],
    reviewedAt: "2026-09-21",
  },
  {
    id: "crase-proibida",
    version: 2,
    format: 2,
    subjectId: "por",
    topicId: "crase",
    chapterId: "por-crase",
    title: "Casos proibidos de crase",
    objective: "Reconhecer os casos em que a crase não pode ocorrer.",
    skillIds: ["por:crase-casos-proibidos"],
    prerequisiteLessonIds: ["crase-quando-usar"],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 60,
    estimatedPracticeSeconds: 150,
    steps: [
      {
        kind: "intro",
        title: "Casos proibidos de crase",
        body: "Reconhecer os casos em que a crase não pode ocorrer.",
      },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "Sem artigo, sem crase",
          body: "Se a palavra depois do \"a\" não pode receber artigo \"a\"/\"as\", não há crase — por mais que o verbo peça preposição. Os casos mais comuns: antes de verbo (\"começou a chorar\"), antes de palavra masculina (\"a lápis\"), antes de pronome pessoal (\"a ela\", \"a mim\").",
        },
      },
      { kind: "question", exerciseId: "mc:crase-proibida:checkpoint", role: "checkpoint", difficulty: 1 },
      {
        kind: "teach",
        block: {
          type: "worked-example",
          title: "Aplicando o truque em um verbo",
          problem: "\"Ela começou à chorar\" — a crase está certa?",
          steps: [
            "\"Chorar\" é verbo, não substantivo — não existe \"o chorar\"/\"a choração\" natural aqui.",
            "Teste da substituição: \"começou ao chorar\" soa estranho porque verbo não tem gênero.",
            "Verbo nunca recebe artigo → nunca há crase antes dele.",
          ],
          result: "O certo é \"Ela começou a chorar\", sem acento.",
        },
      },
      { kind: "question", exerciseId: "mc:crase-proibida:pratica-1", role: "pratica", difficulty: 1 },
      { kind: "question", exerciseId: "mc:crase-proibida:pratica-2", role: "pratica", difficulty: 2 },
      {
        kind: "tip",
        body: "Erro comum: usar crase em \"casa\" e \"terra\" sem qualificador. Sem especificação, ficam sem artigo: \"Cheguei a casa\", \"Voltamos a terra\" — só levam crase quando determinadas: \"à casa de Marta\".",
      },
      { kind: "question", exerciseId: "mc:crase-proibida:pratica-3", role: "pratica", difficulty: 2 },
      {
        kind: "question",
        exerciseId: "crase-02-casos-proibidos:4",
        role: "desafio",
        difficulty: 3,
      },
      {
        kind: "recap",
        body: "Sem artigo cabível depois do \"a\", não há crase: nunca antes de verbo, de palavra masculina ou de pronome pessoal (ele, ela, mim...).",
      },
    ],
    reviewExerciseIds: ["mc:crase-proibida:revisao-1", "mc:crase-proibida:revisao-2"],
    recap: "Sem artigo cabível depois do \"a\", não há crase: nunca antes de verbo, de palavra masculina ou de pronome pessoal (ele, ela, mim...).",
    sources: ["Matriz de referência ENEM — Linguagens, Códigos e suas Tecnologias, competência de área 8"],
    reviewedAt: "2026-09-21",
  },
];
