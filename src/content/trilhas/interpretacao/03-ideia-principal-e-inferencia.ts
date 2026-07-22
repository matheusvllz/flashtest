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
 * Lição sobre ideia principal e inferência: o coração da interpretação.
 */
export const ideiaEInferencia = defineLesson({
  id: "interpretacao-03-ideia-principal-e-inferencia",
  titulo: "Ideia principal e inferência",
  descricao: "Encontrar o núcleo do texto e deduzir o que está implícito.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é a ideia principal de um texto?",
      opcoes: [
        "A primeira frase de cada parágrafo",
        "O conceito central que sustenta todo o texto",
        "A conclusão escrita no último parágrafo",
      ],
      correta: 1,
      explicacao:
        "Ideia principal é o alicerce. Tudo que vem no texto sustenta ela: exemplos, argumentos, dados. Se você remove a ideia principal, o texto desaba.",
    }),
    verdadeiroFalso({
      afirmacao: "A ideia principal está sempre explícita, escrita claramente no texto.",
      verdadeiro: false,
      explicacao:
        "Nem sempre. Às vezes o autor constrói a ideia através de exemplos e deixa que você deduza. Isso é inferência: usar pistas do texto para chegar ao sentido oculto.",
    }),
    multiplaEscolha({
      pergunta: "O que é fazer uma inferência?",
      opcoes: [
        "Encontrar a palavra-chave que o autor usa mais vezes",
        "Deduzir informação que não está explícita, usando pistas do texto",
        "Contar quantas vezes cada ideia aparece no parágrafo",
      ],
      correta: 1,
      explicacao:
        "Inferência é o trabalho de reconstruir significado a partir de pistas. O autor deixa trilhas; você segue e desvenda. É a base sólida da interpretação profunda.",
    }),
    completeLacuna({
      frase:
        "A ideia que o autor escreve de forma clara é a ideia ___; a que exige inferência do leitor é a implícita.",
      opcoes: ["explícita", "principal", "secundária"],
      correta: 0,
      explicacao:
        "Explícita = está lá, declarada. Implícita = está escondida nas entrelinhas. Você lê a primeira direto; a segunda precisa de dedução para emergir.",
    }),
    encontreOErro({
      frase:
        "Para fazer uma boa inferência, você deve ignorar as pistas do texto e usar apenas sua experiência pessoal.",
      erroIndex: 7,
      explicacao:
        "Inferência SEMPRE se baseia no texto. Sua experiência complementa, mas a base sólida são as pistas do autor. Ignorar o texto é fantasiar, não inferir.",
    }),
    parear({
      instrucao: "Combine cada tipo de informação com seu conceito",
      pares: [
        { a: "A educação muda vidas.", b: "Ideia explícita (declarada)" },
        { a: "Pessoas que estudam ganham mais e vivem melhor.", b: "Pistas para inferência" },
        { a: "O autor mostra dados de escolaridade e renda.", b: "Evidências que apoiam" },
      ],
      explicacao:
        "Ideia explícita é declaração pura. Pistas constroem significado que o leitor deduz. Evidências sustentam a conclusão. Cada nível tem sua base própria.",
    }),
    interpretacao({
      texto:
        "Marina chegou à biblioteca ao amanhecer. Abriu seu caderno já desgastado pela leitura. Pegou o mesmo livro de semana anterior. A bibliotecária, ao vê-la, apenas sorriu e continuou seu trabalho, como quem conhece bem uma velha história.",
      pergunta: "Qual inferência é possível tirar desse trecho?",
      opcoes: [
        "Marina é bibliotecária e trabalha no local há pouco tempo",
        "Marina é uma frequentadora assídua da biblioteca que se dedica ao estudo",
        "Marina vem à biblioteca para socializar com amigos",
      ],
      correta: 1,
      explicacao:
        'As pistas: chegada cedo, caderno gasto, livro que pegou semana anterior, o sorriso da bibliotecária que conhece "bem uma velha história". Não está escrito, mas é dedução sólida.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Se dois leitores chegam a inferências diferentes sobre o mesmo texto, um deles está necessariamente errado.",
      verdadeiro: false,
      explicacao:
        "Não. Se ambos sustentam sua interpretação com pistas reais do texto, ambas têm base sólida. A interpretação não é matemática; é construção de sentido sobre alicerces textuais.",
    }),
    ordenar({
      blocos: [
        "Leia o texto todo uma primeira vez sem parar.",
        "Identifique qual é a ideia principal declarada.",
        "Procure por pistas e exemplos que reforçam essa ideia.",
        "Deduza o que está implícito: o que o autor quis dizer sem declarar.",
        "Confira se sua inferência tem base no texto.",
      ],
      explicacao:
        "Essa é a trajetória que eu construí: leitura primeiro, ideia principal depois, depois dedução. Base sólida em cada etapa.",
    }),
    interpretacao({
      texto:
        "O professor entrou na sala e viu as carteiras vazias. Olhou o relógio: 7h50 da manhã. Sentou-se e esperou. Alguns alunos chegaram atrasados. Outros não apareceram. No final da aula, foram três alunos que ficaram até o fim. Ele guardou seus materiais sem comentar nada e saiu.",
      pergunta: "Que inferência você tira sobre o sentimento do professor com essa situação?",
      opcoes: [
        "Ele estava muito feliz com a participação dos alunos",
        "Ele estava decepcionado e talvez desmotivado com o desinteresse",
        "Ele estava furioso e preparava uma punição severa",
      ],
      correta: 1,
      explicacao:
        'As pistas: falta de alunos, atraso, ausência de comentários do professor, silêncio ao guardar materiais. Não diz "decepcionado", mas as pistas constroem esse significado com base sólida.',
    }),
  ],
});
