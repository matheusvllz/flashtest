import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 03: Casos OBRIGATÓRIOS de crase.
 * Quando a crase DEVE estar lá, sem exceção.
 */
export const casosObrigatorios = defineLesson({
  id: "crase-03-casos-obrigatorios",
  titulo: "Casos obrigatórios",
  descricao: "Contextos em que crase é obrigatória, sem escapatória.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'A crase é OBRIGATÓRIA quando temos preposição "a" + qual elemento?',
      opcoes: [
        'Demonstrativo iniciado por "a" (àquela, àquele, àquilo)',
        'Substantivo feminino com artigo definido "a"',
        "Ambos os casos acima",
      ],
      correta: 2,
      explicacao:
        'Crase é obrigatória em DOIS contextos: 1) antes de aquele, aquela, aquilo, que começam com "a" e se fundem com a preposição, não importa o gênero; 2) antes de substantivo feminino singular com artigo "a" (à casa, à escola). No primeiro caso a fusão é com o "a" do próprio pronome, no segundo é com o artigo feminino, mas nos dois a contração é mandatória.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Se eu digo "Vou à praia", a crase é obrigatória porque "praia" é um substantivo feminino e há preposição "a".',
      verdadeiro: true,
      explicacao:
        'Exato. "Ir a um lugar" exige preposição "a". "Praia" é feminino singular com artigo "a" (a praia). Preposição + artigo feminino = crase obrigatória. Sem crase, seria erro. "Vou a praia" é errado neste contexto.',
    }),
    completeLacuna({
      frase: "Chegamos___ sala de espera do hospital com cuidado.",
      opcoes: ["à", "a"],
      correta: 0,
      explicacao:
        '"Chegar a" exige a preposição "a" (chegar a um lugar). "Sala" é feminino singular com artigo "a" (a sala). Logo, crase obrigatória. Preposição + artigo feminino = fusão.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual frase tem a crase CORRETAMENTE OBRIGATÓRIA antes de um demonstrativo feminino?",
      opcoes: [
        "Dirijo-me àquela mulher ali.",
        "Dirijo-me a aquela mulher ali.",
        "Dirijo-me àquele homem ali.",
      ],
      correta: 0,
      explicacao:
        '"Aquela" (demonstrativo feminino) traz artigo feminino embutido. "Dirigir-se a" exige preposição "a". Então: preposição + artigo feminino do demonstrativo = crase obrigatória "àquela". A opção B falta crase, e a C tem demonstrativo masculino.',
    }),
    encontreOErro({
      frase: "Assistimos a aquela apresentação de dança clássica no fim de semana.",
      // Tokenização: Assistimos(0) a(1) aquela(2) apresentação(3) de(4) dança(5) clássica(6) no(7) fim(8) de(9) semana(10)
      // "Aquela" é demonstrativo feminino, leva artigo. Deveria ser "àquela"
      // O erro está em "a(1)" que deveria ser "à"
      erroIndex: 1,
      explicacao:
        '"Assistir a" é uma regência que exige preposição "a". "Aquela" é um demonstrativo feminino que contém artigo feminino. Logo, preposição + artigo = crase OBRIGATÓRIA. O correto é "Assistimos àquela apresentação". Faltou a contração.',
    }),
    parear({
      instrucao: "Relacione cada contexto com sua obrigatoriedade de crase",
      pares: [
        {
          a: "Vou à escola. (verbo: ir a)",
          b: "Substantivo feminino com artigo",
        },
        {
          a: "Refiro-me àquela situação. (verbo: referir-se a)",
          b: "Verbo pede A e funde com o demonstrativo",
        },
        {
          a: "Sou contrário àquela ideia. (adjetivo: contrário a)",
          b: "Nome pede A e funde com o demonstrativo",
        },
      ],
      explicacao:
        'Sempre que uma preposição "a" encontra um artigo feminino (de substantivo ou demonstrativo), a crase é mandatória. Não há espaço para discussão nestes contextos.',
    }),
    verdadeiroFalso({
      afirmacao: 'Posso escolher entre "Vou a Paris" e "Vou à Paris" sem risco de estar errado.',
      verdadeiro: false,
      explicacao:
        '"Paris" é nome de cidade que a língua não acompanha de artigo ("Paris é linda", nunca "a Paris é linda"). Sem artigo, não tem com o que a preposição se fundir, então nunca leva crase: o certo é sempre "Vou a Paris". A crase realmente opcional é outra história, ela existe só com nome de pessoa, tema da próxima lição.',
    }),
    interpretacao({
      texto:
        'A crase é obrigatória em dois cenários bem específicos: primeiro, quando uma preposição "a" (regida pelo verbo ou adjetivo) encontra um artigo feminino definido antes de um substantivo comum feminino; segundo, quando essa preposição encontra um demonstrativo feminino que carrega consigo o artigo "a". Nesses dois casos, não há escapatória gramatical. A fusão deve acontecer. Errar aí é erro puro e simples, não é variação ou liberdade estilística. Por isso dizem que dominar a crase é saber identificar esses dois contextos bem.',
      pergunta: "Segundo o texto, a crase é obrigatória em contextos que envolvem:",
      opcoes: [
        'Preposição "a" + artigo feminino ou demonstrativo feminino',
        "Qualquer palavra feminina que aparece após um verbo",
        "Nomes de cidades, independentemente de gênero",
      ],
      correta: 0,
      explicacao:
        "A obrigatoriedade vem da combinação sintática, não do gênero aleatório de palavras. Preposição + artigo feminino = fusão obrigatória. Sem os dois elementos, sem obrigatoriedade.",
    }),
    encontreOErro({
      frase: "Fui a biblioteca municipal ontem de tarde.",
      // Tokenização: Fui(0) a(1) biblioteca(2) municipal(3) ontem(4) de(5) tarde(6)
      // "Ir a" exige preposição. "Biblioteca" é feminino singular, deveria vir com artigo "a" (a biblioteca).
      // Logo, preposição + artigo = crase obrigatória. Deveria ser "Fui à biblioteca".
      // Erro está em "a(1)"
      erroIndex: 1,
      explicacao:
        '"Ir a um lugar" exige preposição "a". "Biblioteca" é um substantivo feminino singular que naturalmente traz artigo "a" (a biblioteca). Então: preposição + artigo feminino = crase OBRIGATÓRIA. O correto é "Fui à biblioteca". Sem crase, está faltando a contração.',
    }),
  ],
});
