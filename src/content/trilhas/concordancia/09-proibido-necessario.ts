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
 * Lição 09 da trilha de Concordância: é proibido / é necessário.
 */
export const prohibidoNecessario = defineLesson({
  id: "concordancia-09-proibido-necessario",
  titulo: "É proibido / é necessário",
  descricao: "Como adjetivos predicativos concordam (ou não) em expressões com SER.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Em "É proibido entrar", por que "proibido" não concorda com nada?',
      opcoes: [
        'Porque não há sujeito explícito (o sujeito é o infinitivo "entrar", que é invariável)',
        'Porque "proibido" sempre é invariável',
        "Porque não é uma regra do português português",
      ],
      correta: 0,
      explicacao:
        'Sem artigo ou sujeito claro, "proibido" fica como adjetivo predicativo invariável: "É proibido entrar." Mas se vier "É proibida a entrada", aí concorda (feminino singular). Sujeito claro = concordância.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "São proibidas as entradas pelos fundos", o adjetivo "proibidas" está correto porque concorda com "entradas".',
      verdadeiro: true,
      explicacao:
        'Sim! Com sujeito explícito "entradas" (feminino plural), o adjetivo vai para "proibidas" (feminino plural). Sujeito claro força a concordância.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem concordância correta?",
      opcoes: [
        "É necessária a presença de todos os candidatos.",
        "É necessário a presença de todos os candidatos.",
        "É necessário presença de todos os candidatos.",
      ],
      correta: 0,
      explicacao:
        'Com sujeito explícito feminino "presença", o adjetivo deve concordar: "necessária" (feminino singular). Sujeito feminino força o adjetivo feminino.',
    }),
    completeLacuna({
      frase: "___ entradas sem autorização nesta propriedade.",
      opcoes: ["É proibida", "É proibido", "São proibidas"],
      correta: 2,
      explicacao:
        'Aqui "entradas" é sujeito explícito, feminino plural, logo verbo e adjetivo concordam no plural: "São proibidas". Sujeito claro na frente do adjetivo sempre puxa a concordância.',
    }),
    encontreOErro({
      frase: "É necessário as documentações completas para fazer a inscrição.",
      erroIndex: 1,
      explicacao:
        'Com sujeito explícito "documentações" (feminino plural), o adjetivo deveria concordar: "necessárias" (feminino plural). Aqui "necessário" (invariável) deixa de lado o sujeito que está ali. Concordância falta.',
    }),
    parear({
      instrucao: "Combine cada frase com o tipo de construção",
      pares: [
        {
          a: "É proibido colar na prova.",
          b: 'Sem sujeito explícito, infinitivo "colar" (adjetivo invariável)',
        },
        { a: "É proibida a cola na prova.", b: "Com sujeito explícito (adjetivo concorda)" },
        {
          a: "É necessário ler as instruções.",
          b: 'Sem sujeito explícito, infinitivo "ler" (adjetivo invariável)',
        },
      ],
      explicacao:
        "Presença de sujeito determina concordância. Sem sujeito, adjetivo singular. Com sujeito, adjetivo segue o sujeito.",
    }),
    ordenar({
      blocos: ["São", "fundamentais", "as", "revisões", "regulares", "do", "projeto."],
      explicacao:
        'Com sujeito explícito "revisões" (feminino plural), verbo e adjetivo concordam no plural: "São fundamentais". Sujeito claro na frente do adjetivo sempre puxa a concordância.',
    }),
    interpretacao({
      texto:
        'Expressões com o verbo SER e adjetivos predicativos (proibido, permitido, necessário, importante, fundamental, obrigatório) apresentam uma regra de concordância peculiar. Quando o adjetivo vem SEM sujeito explícito (geralmente seguido de infinitivo), permanece no masculino singular invariável: "É proibido fumar." Quando o sujeito é explícito, o adjetivo deve concordar com ele em gênero e número: "É proibida a entrada de menores." A presença ou ausência do artigo definido (a, o, as, os) marca a diferença entre uma construção e outra. Este é um dos pontos mais sutis da concordância nominal em português e frequentemente aparece em provas.',
      pergunta:
        'Qual é o fator que determina se o adjetivo em "É proibido/proibida..." concorda ou não?',
      opcoes: [
        "O tempo do verbo SER",
        "A presença ou ausência de sujeito explícito após o adjetivo",
        "O tipo de infinitivo que segue",
      ],
      correta: 1,
      explicacao:
        'O texto deixa claro: sujeito explícito força concordância. Sem sujeito, adjetivo invariável. "É proibido entrar" vs "É proibida a entrada".',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "É importante os alunos estudarem", o adjetivo "importante" deveria ser "importantes" porque "alunos" é plural.',
      verdadeiro: false,
      explicacao:
        'Aqui não há sujeito explícito tradicional; "os alunos estudarem" é uma oração reduzida de infinitivo pessoal, e essa oração inteira funciona como sujeito. Nesse caso "importante" fica singular. Se fosse "São importantes as atitudes dos alunos", aí sim concordaria (plural).',
    }),
  ],
});
