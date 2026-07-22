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
 * Lição sobre charge e tirinha: imagem que fala.
 * Textos descrevem a cena em vez de usar imagem.
 */
export const ChargeETirinha = defineLesson({
  id: "interpretacao-04-charge-e-tirinha",
  titulo: "Charge e tirinha",
  descricao: "Ler crítica e humor através de imagem e sequência.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a principal diferença entre charge e tirinha?",
      opcoes: [
        "Charge sempre faz crítica social; tirinha só conta histórias divertidas",
        "Charge é um único quadro; tirinha é uma sequência de quadros",
        "Tirinha usa mais cores; charge é sempre em preto e branco",
      ],
      correta: 1,
      explicacao:
        "Charge é única, fotografa um momento de crítica. Tirinha é sequência: mostra ação que se desenrola. Ambas comunicam via imagem, mas a estrutura é diferente.",
    }),
    verdadeiroFalso({
      afirmacao: "Toda charge tem texto escrito dentro da imagem.",
      verdadeiro: false,
      explicacao:
        "Não. Uma charge pode ser só visual, deixando que a imagem fale por si. O desenho e o detalhe já carregam a crítica. Texto é complemento, não regra.",
    }),
    multiplaEscolha({
      pergunta:
        'Observe: um desenho mostra dois executivos em sala de reunião, um dizendo ao outro "Cortamos custos: demitimos quem questionava". O que a charge critica?',
      opcoes: [
        "O custo das reuniões de empresa",
        "A falta de inovação nas estratégias gerenciais",
        "A busca por lucro às custas da liberdade de expressão e direitos dos trabalhadores",
      ],
      correta: 2,
      explicacao:
        'A ironia está no diálogo: "cortar custos" resultou em demissão de quem falava a verdade. A base da crítica é a hipocrisia corporativa disfarçada de eficiência.',
    }),
    completeLacuna({
      frase:
        "A charge é um gênero que usa ___ e frequentemente sarcasmo para criticar temas sociais ou políticos.",
      opcoes: ["crítica verbal", "ironia visual", "humor narrativo"],
      correta: 1,
      explicacao:
        "Ironia visual é o alicerce da charge: mostra A para que você entenda o oposto de A. O desenho constrói essa ironia através de detalhes que o texto sozinho não conseguiria.",
    }),
    encontreOErro({
      frase: "Uma tirinha sempre termina com uma moral clara e educativa para o leitor.",
      erroIndex: 2,
      explicacao:
        'Nem toda tirinha tem moral. Muitas apenas contam um fato engraçado ou uma situação cotidiana sem lição. Pensar que todo texto tem "moral da história" é confundir estrutura de fábula com realidade de gênero.',
    }),
    parear({
      instrucao: "Combine cada descrição de cena com o tipo de texto mais apropriado",
      pares: [
        { a: "Um político prometendo mudança em 5 quadrinhos de ação", b: "Tirinha (sequência)" },
        { a: "Um único desenho mostrando o político em jaula de ouro", b: "Charge (crítica)" },
        {
          a: "Um adolescente em 3 quadrinhos descobrindo que perdeu sua senha",
          b: "Tirinha (humor)",
        },
      ],
      explicacao:
        "Tirinha é história que se desenvolve. Charge é retrato crítico de um único momento. Ambas usam imagem, mas a base estrutural é diferente.",
    }),
    interpretacao({
      texto:
        'Descrição de cena de charge ENEM 2015: um jardim com flores belas; um homem regando as flores com um símbolo de dinheiro em vez de água; as flores estão murchas e cinzentas apesar do "regador dinheiro". No rodapé: "O consumismo não alimenta a alma".',
      pergunta: "Qual é a crítica principal desta charge?",
      opcoes: [
        "O dinheiro é inútil para comprar flores de qualidade",
        "Dinheiro e consumismo não satisfazem as necessidades emocionais e espirituais humanas",
        "Ninguém deveria gastar dinheiro com plantas decorativas",
      ],
      correta: 1,
      explicacao:
        "A ironia visual é forte: o recurso (dinheiro) que deveria alimentar (água) na verdade mata (as flores murcham). O alicerce é a crítica ao consumismo vazio.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Para entender uma charge, você deve ler o contexto histórico e social do momento em que foi criada.",
      verdadeiro: true,
      explicacao:
        "Charge dialoga com seu tempo. Uma charge sobre eleição não faz sentido sem saber qual eleição. O contexto é a base que sustenta a leitura crítica.",
    }),
    ordenar({
      blocos: [
        "Primeiro, olhe a imagem sem ler nenhum texto. O que você vê?",
        "Identifique o sarcasmo ou ironia: o que é mostrado versus o que significa.",
        "Leia qualquer texto escrito na charge.",
        "Deduza a crítica: qual assunto social ou político está em jogo.",
        "Conecte com o momento histórico se souber contexto.",
      ],
      explicacao:
        "Essa é minha estratégia de leitura para charge: visual primeiro, ironia depois, contexto final. Base sólida em cada etapa.",
    }),
    interpretacao({
      texto:
        'Descrição de tirinha com 4 quadrinhos: Quadro 1: Um rapaz diz "Vou parar de usar celular por um mês". Quadro 2: Ele coloca o telefone na mochila. Quadro 3: Passa 10 minutos, ele tira o celular da mochila. Quadro 4: Ele coloca de volta na mochila com expressão de derrota. Ao fundo, uma voz: "Dependência digital: nível especialista".',
      pergunta: "Qual é o tipo de humor predominante nesta tirinha?",
      opcoes: [
        "Humor de situação absurda com personagem exagerado",
        "Humor de reconhecimento: a contradição entre intenção e comportamento real",
        "Humor de trocadilho com jogo de palavras",
      ],
      correta: 1,
      explicacao:
        "A base do humor está na verdade vivida: todo mundo fala que vai desconectar e não consegue. A tirinha funciona porque a maioria reconhece a situação. É humor de espelho, não de ficção.",
    }),
  ],
});
