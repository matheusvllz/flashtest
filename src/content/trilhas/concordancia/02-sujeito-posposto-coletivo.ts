import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  ordenar,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 02 da trilha de Concordância: sujeito posposto e coletivo.
 */
export const sujetoPostosteColetivo = defineLesson({
  id: "concordancia-02-sujeito-posposto-coletivo",
  titulo: "Sujeito posposto e coletivo",
  descricao: "Quando o sujeito vem depois do verbo, e quando ele é uma palavra coletiva.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um sujeito posposto?",
      opcoes: [
        "Um sujeito que vem antes do verbo, como sempre",
        "Um sujeito que vem DEPOIS do verbo, invertendo a ordem",
        "Um sujeito muito curto ou de uma palavra só",
      ],
      correta: 1,
      explicacao:
        'Sujeito posposto é quando o verbo vem primeiro e o sujeito depois: "Chegaram os alunos." A inversão é comum em literatura e deixa a frase mais elegante.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Chegaram os alunos", o sujeito é "chegaram" e o verbo é "os alunos".',
      verdadeiro: false,
      explicacao:
        'Não: "chegaram" é o verbo (ação) e "os alunos" é o sujeito (quem faz a ação). A ordem inversa não muda os papéis das palavras.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem sujeito posposto?",
      opcoes: [
        "Os alunos chegaram cansados.",
        "Chegaram cansados os alunos.",
        "Cansados, os alunos chegaram.",
      ],
      correta: 1,
      explicacao:
        'Na segunda opção, o verbo "chegaram" vem antes do sujeito "os alunos". Essa inversão de ordem é o que marca o sujeito posposto.',
    }),
    completeLacuna({
      frase: "O que é um sujeito coletivo? É uma palavra ___ que representa um grupo de seres.",
      opcoes: ["singular", "plural", "composta"],
      correta: 0,
      explicacao:
        'Um coletivo é SINGULAR em forma, mas representa MUITOS: "a multidão" é uma palavra só que fala de centenas. Essa dualidade confunde até os melhores, mas é assim que funciona.',
    }),
    multiplaEscolha({
      pergunta: "Qual das palavras abaixo é um coletivo?",
      opcoes: [
        "meninas (plural de menina)",
        "turma (grupo de estudantes)",
        "cadernos (objetos vários)",
      ],
      correta: 1,
      explicacao:
        'Turma é coletivo: uma palavra singular que concentra muitas pessoas. "A turma saiu" é singular em forma, mas plural em sentido.',
    }),
    encontreOErro({
      frase: "A multidão foram para as ruas em protesto.",
      erroIndex: 2,
      explicacao:
        'Sujeito coletivo "multidão" é SINGULAR, logo o verbo deve ser singular "foi", não "foram". O grupo é um só, mesmo que cheio de gente dentro.',
    }),
    parear({
      instrucao: "Combine cada termo com seu tipo de sujeito",
      pares: [
        { a: "A assembleia", b: "Sujeito coletivo" },
        { a: "Chegaram os diretores", b: "Sujeito posposto" },
        { a: "Os alunos estudam", b: "Sujeito anteposto (ordem normal)" },
      ],
      explicacao:
        'Assembleia é uma palavra que concentra muitas pessoas (coletivo). "Chegaram os diretores" inverte a ordem (posposto). "Os alunos" vem antes, como de costume (anteposto).',
    }),
    ordenar({
      blocos: ["Na festa,", "dançaram", "animados", "os jovens."],
      explicacao:
        'Sujeito posposto: o verbo "dançaram" vem antes de "jovens". Essa ordem é elegante e muda o ritmo da leitura sem quebrar a concordância.',
    }),
    interpretacao({
      texto:
        'Um coletivo é uma palavra singular que reúne muitos seres de mesma natureza. Exemplos: rebanho (de ovelhas), enxame (de abelhas), bando (de pássaros). Quando o coletivo está sozinho, o verbo permanece singular: "O rebanho pastava no campo." Mas se uma palavra plural vem junto (especificativa), o verbo pode ir para o plural: "Um rebanho de ovelhas comiam capim" é também aceito em literatura. Porém, em prova, prefira o singular: "Um rebanho de ovelhas comia capim".',
      pergunta: "Qual é a regra mais segura para concordância com coletivo em prova?",
      opcoes: [
        "Sempre plural, porque há muitos seres",
        "Sempre singular, pois o coletivo é uma palavra singular",
        "Qualquer um dos dois, pois literatura aceita ambos",
      ],
      correta: 1,
      explicacao:
        'Em ENEM e provas, o singular é o seguro: "A turma chegou". Deixe o plural para quando souber muito bem o que está fazendo.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Saíram correndo da sala o professor e vários alunos", temos sujeito posposto e composto.',
      verdadeiro: true,
      explicacao:
        'Sim: o sujeito "professor e alunos" vem DEPOIS do verbo "saíram" (posposto), E é composto (dois núcleos). Sujeito posposto + composto + plural = verbo plural "saíram".',
    }),
  ],
});
