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
 * Lição 05 da trilha de Concordância: verbos impessoais (haver, fazer).
 */
export const verbosImpessoais = defineLesson({
  id: "concordancia-05-verbos-impessoais",
  titulo: "Verbos impessoais (haver, fazer)",
  descricao: "Verbos que não têm sujeito e ficam SEMPRE no singular.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um verbo impessoal?",
      opcoes: [
        "Um verbo que muda conforme o sujeito, como qualquer outro.",
        "Um verbo que NÃO tem sujeito definido e fica sempre no singular.",
        "Um verbo que só aparece em textos formais.",
      ],
      correta: 1,
      explicacao:
        'Verbo impessoal é aquele que não pede sujeito: ninguém faz a ação, apenas acontece. "Choveu" é impessoal porque chuva não é sujeito de ninguém; só chove. E sempre no singular.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Havia muitas pessoas na festa", o verbo "havia" é impessoal e fica no singular mesmo com "pessoas" (plural) depois.',
      verdadeiro: true,
      explicacao:
        'Sim! "Havia" é impessoal (significando "existir"). O verbo fica singular SEMPRE, não importa quantas pessoas havia. Não há sujeito a concordar.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem concordância correta com verbo impessoal?",
      opcoes: [
        "Faz cinco anos que não o vejo.",
        "Fazem cinco anos que não o vejo.",
        "Fará cinco anos que não o vejo.",
      ],
      correta: 0,
      explicacao:
        'Fazer (no sentido de "tempo decorrido") é impessoal: "Faz cinco anos" (singular). Não é "cinco anos faz algo"; é apenas uma medida de tempo sem sujeito. Dor no meu coração ver este errado na rua.',
    }),
    completeLacuna({
      frase: "___ dias terríveis, cheios de dúvida e ansiedade.",
      opcoes: ["Havia", "Haviam", "Haveria"],
      correta: 0,
      explicacao:
        'Haver (significando "existir") é impessoal e fica no singular "havia". Mesmo que tenha "dias" (plural) depois, o verbo não concorda: é sempre singular. A existência não pede pluralidade.',
    }),
    encontreOErro({
      frase: "Neste mês já choveram muitas vezes na região.",
      erroIndex: 3,
      explicacao:
        'Choveu (no sentido de "caiu chuva") é impessoal. O verbo deve ser singular "choveu", não "choveram". Chuva não é sujeito que age; é apenas fenômeno natural.',
    }),
    parear({
      instrucao: "Combine cada frase com o tipo de verbo",
      pares: [
        { a: "Havia problemas no código.", b: "Verbo impessoal haver (singular)" },
        { a: "Faz três meses que saiu.", b: "Verbo impessoal fazer (tempo)" },
        { a: "Choveu demais na semana passada.", b: "Verbo impessoal chover" },
      ],
      explicacao:
        "Haver, fazer (tempo) e chover são os impessoais mais frequentes. Todos ficam no singular, independente do que vier depois.",
    }),
    ordenar({
      blocos: ["Faz", "dois", "anos", "que", "trabalho", "aqui."],
      explicacao:
        'Fazer impessoal: "Faz dois anos". Não é "Fazem dois anos"; o verbo não concorda com a duração. Singular sempre.',
    }),
    interpretacao({
      texto:
        'Verbos impessoais são aqueles que não possuem sujeito. Os mais comuns em português são: haver (no sentido de existir: "Havia gente lá"), fazer (indicando tempo: "Faz três dias"), chover, nevar, amanhecer, anoitecer. Todos esses verbos ficam SEMPRE no singular, não importa o contexto. Mesmo se houver uma palavra plural depois, o verbo não concorda. Alguns desses verbos podem tomar sujeito em contextos especiais (chover chuva de prata = simbólico), mas na prosa comum, eles permanecem impessoais. Uma dica: se não consegue responder "quem?" antes do verbo, ele é provavelmente impessoal.',
      pergunta: "Qual é o teste para saber se um verbo é impessoal?",
      opcoes: [
        "Observar se há uma palavra plural depois dele",
        'Tentar responder "quem?" antes do verbo; se não conseguir, é impessoal',
        "Contar quantos tempos verbais o verbo possui",
      ],
      correta: 1,
      explicacao:
        'O texto ensina: se não há "quem" fazendo a ação, não há sujeito, logo o verbo é impessoal. "Quem choveu?" Não faz sentido. Logo, impessoal.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Fazia muito frio durante o inverno", o verbo "fazia" é impessoal porque ninguém "faz" o frio.',
      verdadeiro: true,
      explicacao:
        'Correto! Fazer (significando "estar um certo tempo") é impessoal: "Fazia frio" = "o tempo estava frio". Ninguém faz; é apenas uma condição do clima.',
    }),
  ],
});
