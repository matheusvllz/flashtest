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
 * Lição 03: Vírgula no vocativo
 */
export const virgulaNoVocativo = defineLesson({
  id: "pontuacao-03-vocativo",
  titulo: "Vírgula no vocativo",
  descricao: "A vírgula que chama alguém para atenção.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Vocativo é uma palavra que chama a atenção de quem está ouvindo.",
      verdadeiro: true,
      explicacao:
        'Exato. Vocativo é o chamamento. Quando você escreve "Maria, venha aqui", está falando COM a Maria, não sobre ela. E chamamento pede vírgula sim.',
    }),
    multiplaEscolha({
      pergunta: "Qual dessas frases tem um vocativo?",
      opcoes: [
        "O professor explicou a lição com paciência.",
        "Professor, explique a lição com paciência.",
        "A professora era pacienciosa em suas explicações.",
      ],
      correta: 1,
      explicacao:
        'Na segunda frase, você está chamando o professor para fazer algo. A vírgula depois de "Professor" marca esse chamamento.',
    }),
    completeLacuna({
      frase: "João___ você pode me ajudar com este exercício?",
      opcoes: [",", ";", "nada"],
      correta: 0,
      explicacao:
        'Você está chamando o João para pedir ajuda. O vocativo vem com vírgula: "João, você pode..."',
    }),
    encontreOErro({
      frase: "Meus amigos deixem a bagunça de lado.",
      erroIndex: 1,
      explicacao:
        'Você está falando COM os amigos, chamando-os. Falta a vírgula depois de "amigos": "Meus amigos, deixem..."',
    }),
    multiplaEscolha({
      pergunta: "Onde fica a vírgula do vocativo?",
      opcoes: [
        "Sempre no final da frase",
        "Antes ou depois do termo que chama, dependendo de onde ele estiver",
        "Somente entre o nome e o verbo",
      ],
      correta: 1,
      explicacao:
        'Se o vocativo está no início, a vírgula vem depois dele: "Maria, vem aqui". No meio: "Você sabe, João, aquela regra?" No final: "Faça isso, por favor, João."',
    }),
    parear({
      instrucao: "Combine cada frase com seu tipo",
      pares: [
        { a: "Pedro, traga o livro.", b: "Vocativo no início" },
        { a: "Traga, Pedro, o livro da mesa.", b: "Vocativo no meio" },
        { a: "Traga o livro, Pedro.", b: "Vocativo no final" },
      ],
      explicacao:
        "Onde estiver o vocativo, a vírgula o abraça. No início, no meio ou no final: o chamamento sempre leva seu ponto de pontuação.",
    }),
    completeLacuna({
      frase: "Querida mãe___ obrigado por tudo o que você faz por mim.",
      opcoes: [",", ".", ";"],
      correta: 0,
      explicacao:
        'Você está falando COM a mãe, chamando-a com carinho. Vocativo exige vírgula: "Querida mãe, obrigado..."',
    }),
    encontreOErro({
      frase: "Guardem os celulares agora pessoal.",
      erroIndex: 3,
      explicacao:
        'O vocativo "pessoal" fecha a frase chamando quem está ouvindo. Vocativo no final também pede vírgula, sem exceção: "agora, pessoal."',
    }),
    interpretacao({
      texto:
        'A vírgula do vocativo marca o diálogo. Quando você escreve "Amor, faça um favor", está criando uma conversa. Sem a vírgula, "Amor faça um favor" perde o carinho e soa como uma ordem distante. Em textos de redação, usar o vocativo com vírgula torna o discurso mais fluido e natural, como se o escritor conversasse direto com o leitor.',
      pergunta: "De acordo com o texto, qual é o efeito da vírgula no vocativo?",
      opcoes: [
        "Torna o discurso mais fluido e marca a conversa com carinho",
        "Separa a pessoa do verbo para respeitar a norma",
        "Serve apenas para frases interrogativas",
      ],
      correta: 0,
      explicacao:
        "A vírgula no vocativo cria o clima de diálogo, de conversa. Ela não é só uma regra técnica, é uma ferramenta de sentido na frase.",
    }),
  ],
});
