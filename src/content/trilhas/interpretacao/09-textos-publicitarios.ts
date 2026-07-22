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
 * Lição sobre textos publicitários: persuasão estruturada.
 */
export const TextosPublicitarios = defineLesson({
  id: "interpretacao-09-textos-publicitarios",
  titulo: "Textos publicitários",
  descricao: "Reconhecer estratégias de persuasão e efeitos de sentido na publicidade.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a principal função de um texto publicitário?",
      opcoes: [
        "Informar dados técnicos sobre um produto sem contexto",
        "Contar uma história fictícia sobre um marca",
        "Persuadir o leitor a comprar ou agir através de apelo emocional, racional ou social",
      ],
      correta: 2,
      explicacao:
        "Publicidade é persuasão. Ela constrói desejo, credibilidade, urgência. Base sólida de anúncio: conhecer o público-alvo e tocá-lo na ferida, no sonho ou na insegurança.",
    }),
    verdadeiroFalso({
      afirmacao: "Um bom anúncio sempre diz a verdade total sobre o produto.",
      verdadeiro: false,
      explicacao:
        "Anúncio enuncia o melhor, omite limites. Base ética existe (não pode mentir frontalmente), mas seleção de verdades é tática central. Publicidade tem estrutura de sedução, não de relatório.",
    }),
    multiplaEscolha({
      pergunta:
        "Um anúncio de tênis mostra um atleta em voo realizando um movimento impossível. Qual é o efeito?",
      opcoes: [
        "Informar sobre especificações técnicas do calçado",
        "Criar aspiração e vínculo emocional com performance heroica",
        "Descrever de forma realista como o produto funciona",
      ],
      correta: 1,
      explicacao:
        "A base do anúncio não é o tênis: é o sonho. Athlete em voo você não consegue, mas o produto promete aproximá-lo desse ideal. Persuasão através de aspiração.",
    }),
    completeLacuna({
      frase:
        "A ___ é um texto curto que resume a mensagem central de uma campanha publicitária em slogan memorável.",
      opcoes: ["punchline", "manchete", "tagline"],
      correta: 2,
      explicacao:
        'Tagline é o alicerce verbal da marca: "Just do it", "Porque você merece". É breve, memorável, repetível. Estrutura que cola na mente do consumidor.',
    }),
    encontreOErro({
      frase:
        "Um anúncio que usa celebridade em vez de argumentos racionais está sendo desonesto com o consumidor.",
      erroIndex: 12,
      explicacao:
        "Nem sempre. Usar celebridade é estratégia legítima de persuasão (apelo por autoridade/admiração). O erro seria dizer que TODAS as estratégias persuasivas que não são racionais são desonestidade.",
    }),
    parear({
      instrucao: "Combine cada estratégia de persuasão com seu funcionamento",
      pares: [
        { a: "Apelo emocional", b: "Toca sentimentos (medo, alegria, culpa, desejo)" },
        { a: "Apelo racional", b: "Usa dados, benefícios tangíveis, lógica" },
        { a: "Apelo por autoridade", b: "Usa celebridade, especialista ou fonte confiável" },
        { a: "Apelo social", b: 'Mostra que "todos estão usando", pressão de grupo' },
      ],
      explicacao:
        "Publicidade eficaz mescla estratégias. Uma não exclui a outra. Base sólida de persuasão combina razão, emoção, confiança e pertencimento.",
    }),
    interpretacao({
      texto:
        'Anúncio de shampoo: "Seu cabelo merecia mais. Merecia brilho. Merecia força. Merecia você. Apresentamos Luxo Hair: porque o melhor é o mínimo." O texto não descreve ingredientes: constrói autoimagem. A mensagem é: "você é especial, merece coisas boas, use este produto para confirmar seu valor."',
      pergunta: "Qual estratégia de persuasão domina este anúncio?",
      opcoes: [
        "Apelo racional com dados científicos sobre proteína",
        "Apelo emocional conectado à autoestima e autossuperação",
        "Apelo social mostrando celebridades que usam o produto",
      ],
      correta: 1,
      explicacao:
        "Base do anúncio está no sentimento: você merece, você é especial. Não há ingrediente mencionado. Apelo é puro emocional ligado a valor pessoal.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Um anúncio pode ser convincente mesmo sem apresentar nenhum argumento racional sobre o produto.",
      verdadeiro: true,
      explicacao:
        "Sim. Publicidade sofisticada vende emoção, não características. Alguns dos anúncios mais memoráveis e eficazes dispensam argumentação racional. Emoção é base tão sólida quanto razão.",
    }),
    ordenar({
      blocos: [
        "Identifique qual é o produto ou serviço anunciado.",
        "Procure pela mensagem central: qual é a promessa feita.",
        "Detecte a estratégia persuasiva: apelo racional, emocional, autoridade ou social.",
        "Observe o público-alvo: para quem esta mensagem foi desenhada.",
        "Critique: quais desejos ou medos o anúncio está explorando.",
      ],
      explicacao:
        "Estratégia de leitura crítica de publicidade: produto primeiro, mensagem depois, persuasão, público, crítica final. Base sólida em cada nível.",
    }),
    interpretacao({
      texto:
        'Anúncio de bebida energética: "Pessoas comuns fazem coisas extraordinárias todos os dias. Ela acordou cedo para escrever um livro antes do trabalho. Ele correu uma maratona depois do expediente. Você não é diferente deles, só precisa de energia. Energize-se." O anúncio mistura apelo social (outros fazem) com emocional (você também pode).',
      pergunta: "A qual insegurança específica este anúncio apela?",
      opcoes: [
        "Medo de fracasso profissional",
        "Insegurança sobre capacidade pessoal, comparação com outros",
        "Preocupação com saúde e exercício físico",
      ],
      correta: 1,
      explicacao:
        "O alicerce é comparação: outros fazem coisas notáveis, você não, precisa mudar. Base do apelo está em insegurança subconsciente de não estar à altura.",
    }),
  ],
});
