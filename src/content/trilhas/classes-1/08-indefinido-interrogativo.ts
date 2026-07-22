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
 * Classes de Palavras I - Lição 08: Indefinidos e interrogativos
 */
export const indefinidoInterrogativo = defineLesson({
  id: "classes-1-08-indefinido-interrogativo",
  titulo: "Indefinidos e interrogativos",
  descricao: "Alguém, ninguém, qual, quem: as palavras que deixam em aberto.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um pronome indefinido?",
      opcoes: [
        "Uma palavra que se refere a algo ou alguém de forma vaga ou indeterminada",
        "Um pronome que questiona sempre",
        "Um nome que muda de pessoa",
      ],
      correta: 0,
      explicacao:
        "Indefinido é aquele que não aponta para ninguém ou nada específico: alguém (uma pessoa qualquer), nada (absolutamente nada), tudo (coletividade vaga).",
    }),
    verdadeiroFalso({
      afirmacao: 'O pronome "ninguém" sempre leva o verbo para a 3ª pessoa do singular.',
      verdadeiro: true,
      explicacao:
        'Ninguém é singular: "ninguém foi" (não "ninguém foram"). Mesmo que falemos de muitas pessoas, o pronome ninguém puxa verbo singular.',
    }),
    parear({
      instrucao: "Identifique cada pronome como indefinido ou interrogativo",
      pares: [
        { a: "Alguém entrou na sala.", b: "Indica pessoa não identificada" },
        { a: "Quem abriu a porta?", b: "Pergunta sobre identidade" },
        { a: "Qual dessas opções você escolheu?", b: "Pergunta sobre escolha entre opções" },
        { a: "Ninguém sabe a resposta.", b: "Nega a existência de alguém" },
      ],
      explicacao:
        "Indefinidos (alguém, ninguém, tudo, nada) não apontam ninguém específico. Interrogativos (quem, qual, quanto) fazem perguntas.",
    }),
    completeLacuna({
      frase: "Alguém viu o filme no cinema, mas ___ gostou.",
      opcoes: ["ninguém", "alguém", "tudo"],
      correta: 0,
      explicacao:
        "Ninguém marca ausência total: nem uma pessoa da plateia saiu satisfeita. Alguém repetiria a ideia anterior sem sentido, e tudo não combina com pessoas.",
    }),
    encontreOErro({
      frase: "Ninguém dos candidatos trouxeram os documentos completos.",
      erroIndex: 3,
      explicacao:
        "Trouxeram está no plural, mas ninguém é sempre singular, então o verbo certo é trouxe. Mesmo falando de vários candidatos, ninguém puxa o verbo pro singular: regra que não abre exceção.",
    }),
    multiplaEscolha({
      pergunta: "Em qual frase o pronome interrogativo está bem colocado?",
      opcoes: [
        "O que você fez ontem no cinema?",
        "No cinema ontem você fez o que?",
        "Você fez o que no cinema ontem?",
      ],
      correta: 0,
      explicacao:
        "A opção A coloca o interrogativo no início, bem formal e claro. B e C deixam a pergunta informal ou até estranha, com o interrogativo deslocado.",
    }),
    verdadeiroFalso({
      afirmacao: 'O pronome "quanto" é sempre interrogativo, nunca indefinido.',
      verdadeiro: false,
      explicacao:
        'Quanto pode ser interrogativo: "Quanto custa?" Mas também pode ser indefinido, sem fazer pergunta: "Fico feliz com quanto você puder ajudar" (aqui, quanto não pergunta nada, só indica uma quantidade indeterminada).',
    }),
    completeLacuna({
      frase: "Alguns alunos chegaram cedo, enquanto ___ chegaram atrasados.",
      opcoes: ["outros", "outra", "alguns"],
      correta: 0,
      explicacao:
        'Outros é um indefinido que contrasta com "alguns". Outra é feminino, não combina com "alunos". Alguns repetiria a palavra anterior.',
    }),
    interpretacao({
      texto:
        'Pronomes indefinidos e interrogativos servem a propósitos bem diferentes na redação. Um indefinido te ajuda a generalizar sem nomear: "algumas pessoas argumentam que...". Um interrogativo abre a mente do leitor para uma reflexão: "Qual é o verdadeiro valor da educação?". No ENEM, saber usar interrogativos para começar parágrafos cria engajamento. Já indefinidos ajudam quando você quer não apontar um culpado específico, mas uma classe inteira.',
      pergunta:
        "Para que serve usar um pronome interrogativo no início de um parágrafo de redação?",
      opcoes: [
        "Para preencher espaço no texto",
        "Para criar engajamento e convidar o leitor a reflexão",
        "Para economizar palavras",
      ],
      correta: 1,
      explicacao:
        "O texto explica que interrogativos abrem a mente do leitor para reflexão, criando engajamento. Uma boa estratégia retórica para o ENEM.",
    }),
  ],
});
