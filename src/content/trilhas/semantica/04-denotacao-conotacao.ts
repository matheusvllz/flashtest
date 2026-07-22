import {
  defineLesson,
  encontreOErro,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
  interpretacao,
  completeLacuna,
} from "@/lib/lessons/define";

/**
 * Denotação e conotação: o sentido literal versus o sentido carregado de emoção.
 */
export const denotacaoConotacao = defineLesson({
  id: "semantica-04-denotacao-conotacao",
  titulo: "Denotação e conotação",
  descricao: "O significado literal e o significado carregado de emoção e cultura.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é denotação?",
      opcoes: [
        "O significado literal e direto de uma palavra, sem carga emocional",
        "Quando uma palavra recebe sentido figurado ou simbólico",
        "Uma palavra inventada pelo autor",
      ],
      correta: 0,
      explicacao:
        'Denotação é o sentido objetivo, dicionário. "Casa" denota um edifício com paredes, portas e janelas. Sem emoção, sem símbolo. Em redação, denotação é a fundação; conotação é o que constrói em cima.',
    }),
    multiplaEscolha({
      pergunta: "O que é conotação?",
      opcoes: [
        "O significado literal de uma palavra",
        "Significados emocionais, culturais ou simbólicos que uma palavra carrega",
        "Uma palavra que soa parecido com outra",
      ],
      correta: 1,
      explicacao:
        'Conotação é tudo que a palavra carrega além do dicionário. "Casa" denota uma estrutura, mas conotar família, aconchego, raiz, segurança. Em redação sobre identidade ou memória, a conotação constrói emoção.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma redação forte precisa usar apenas palavras com conotação, nunca denotação pura.",
      verdadeiro: false,
      explicacao:
        "Você precisa dos dois. Denotação é alicerce: clareza. Conotação é construção emocional em cima dela. Uma redação só com conotação vira vaga; só com denotação vira robótica. A arte é equilibrio.",
    }),
    parear({
      instrucao: "Combine cada palavra com a conotação que ela típicamente carrega em português",
      pares: [
        { a: "morte", b: "fim, tristeza, medo" },
        { a: "luz", b: "esperança, conhecimento, vida" },
        { a: "chuva", b: "tristeza, renovação, purificação" },
      ],
      explicacao:
        'Conotações variam com a cultura e o contexto pessoal, mas existem núcleos compartilhados. "Luz" quase sempre carreia esperança na redação. Quando você escreve sobre esperança, invocar "luz" é convocar uma conotação que já está na base da língua. Isso solidifica o alicerce.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa conotação de forma mais eficaz?",
      opcoes: [
        "A criança tinha uma lâmpada acesa no quarto.",
        "A criança teve uma luz de esperança no olhar quando recebeu a notícia.",
        "A criança viu a luz de uma lâmpada brilhante.",
      ],
      correta: 1,
      explicacao:
        'A segunda frase constrói "luz" como símbolo de esperança. Não é apenas o fenômeno físico (denotação), mas a emoção que acompanha. Isso é conotação trabalhando a serviço de uma estrutura de sentido mais profunda.',
    }),
    completeLacuna({
      frase: "Ele carregava aquele fardo como se fosse o peso do mundo inteiro nos ___ .",
      opcoes: ["ombros", "braços", "costas"],
      correta: 0,
      explicacao:
        'Ombros carregam a conotação de responsabilidade e força. "Peso do mundo nos ombros" é uma expressão que já existe na língua porque trabalha conotação. Braços ou costas enfraqueceriam a estrutura metafórica que você está montando.',
    }),
    interpretacao({
      texto:
        'Em uma redação sobre mudanças climáticas, uma candidata escreveu: "O aquecimento global torna o planeta mais quente". É denotação pura, clara mas fraca. Outra escreveu: "O planeta respira dificuldade quando a temperatura sobe, e suas cicatrizes deixam marcas profundas no tempo". Aqui, "respira" (personificação com conotação de vida), "dificuldade" (emocional), "cicatrizes" (conotação de sofrimento) e "marcas no tempo" (conotação de memória e sequela) constroem a mesma ideia, mas sobre um alicerce de simbolismo. A diferença não é verdade: é profundidade de construção.',
      pergunta: "Qual é a vantagem da segunda frase em relação à primeira?",
      opcoes: [
        "A segunda é mais correta gramaticalmente",
        "A segunda usa conotação para construir emotividade e profundidade sobre a mesma ideia",
        "A segunda é mais curta e clara",
      ],
      correta: 1,
      explicacao:
        "Ambas dizem a mesma coisa: o planeta aquece. Mas a primeira usa apenas denotação (fatos objetivos), enquanto a segunda convoca conotações (vida, sofrimento, memória) para construir uma argumentação que toca mais fundo.",
    }),
    verdadeiroFalso({
      afirmacao: "Conotação é sempre subjetiva e varia completamente de pessoa para pessoa.",
      verdadeiro: false,
      explicacao:
        'Conotação tem núcleos compartilhados pela cultura e língua. "Morte" carrega tristeza para quase todos em português. Mas a intensidade e as associações pessoais variam. O redator trabalha com os núcleos compartilhados e adiciona camadas pessoais sobre eles.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra carrega a conotação mais clara de esperança em português?",
      opcoes: ["sombra", "aurora", "inverno"],
      correta: 1,
      explicacao:
        "Aurora é o amanhecer: nova luz, recomeço, esperança. É quase um símbolo automático na língua. Sombra carrega escuridão, inverno carrega frialdade. Escolher a palavra certa é escolher a conotação que já trabalha por você na estrutura.",
    }),
  ],
});
