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
 * Figuras de sintaxe e de som: repetição, inversão, aliteração, assonância.
 * Ferramentas que constroem ritmo e ênfase na frase.
 */
export const figurasSintaxeSom = defineLesson({
  id: "semantica-07-figuras-sintaxe-som",
  titulo: "Figuras de sintaxe e de som",
  descricao: "Repetição, inversão, aliteração, assonância: ritmo e estrutura.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é anáfora?",
      opcoes: [
        "A repetição de palavras no início de frases consecutivas",
        "Uma mudança na ordem normal da frase",
        "O uso de sons semelhantes consecutivos",
      ],
      correta: 0,
      explicacao:
        'Anáfora repete a mesma palavra ou sequência no início. "Não há dor sem cicatriz, não há cicatriz sem tempo, não há tempo sem memória." A repetição em "não há" constrói ritmo e enfatiza a ideia. É alicerce de ênfase.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Inversão sintática (anástrofe) muda a ordem esperada das palavras para criar efeito estético ou de ênfase.",
      verdadeiro: true,
      explicacao:
        'Em vez de "Aquela noite, eu não vou esquecer", dizer "Aquela noite, não vou esquecer eu" cria estranhamento. A inversão pode construir poesia ou ênfase quando bem usada. Evite em redação acadêmica sem propósito claro.',
    }),
    parear({
      instrucao: "Combine cada figura com um exemplo",
      pares: [
        { a: "Aliteração", b: "Bruno bebia belas bebidas baratas." },
        { a: "Assonância", b: "Teu corpo é fogo, fogo de desejo." },
        { a: "Anáfora", b: "Vencemos, venceremos, sempre venceremos." },
      ],
      explicacao:
        "Aliteração repete sons consonantais. Assonância repete vogais. Anáfora repete palavras ou sequências. Cada uma constrói ritmo de forma diferente.",
    }),
    multiplaEscolha({
      pergunta: "O que é zeugma?",
      opcoes: [
        "Uma palavra que funciona em dois contextos diferentes da mesma frase",
        "Uma figura muito comum em redações acadêmicas",
        "Uma repetição de palavras no final de frases",
      ],
      correta: 0,
      explicacao:
        'Zeugma é economia criativa: "Ele perdeu a chave e a cabeça." "Perdeu" funciona literal para chave e figurado para cabeça. Isso constrói compacidade inteligente. Evite em acadêmico formal; perfeito em criativo.',
    }),
    completeLacuna({
      frase: "Rápidas ___ correm pelo rio, levando consigo histórias antigas e memórias perdidas.",
      opcoes: ["águas", "ondas", "correntes"],
      correta: 1,
      explicacao:
        'Ondas cria assonância em "o": ondas, histórias, memórias. O som de "o" se repete naturalmente, criando musicalidade (repetição de vogal é assonância; de consoante é aliteração). Isso é figura de som a serviço da estrutura.',
    }),
    interpretacao({
      texto:
        'Em um poema moderno, o poeta escreveu: "Vem, vem, vem a noite / trazendo seu silêncio / seu sussurro / seu segredo". A anáfora em "vem" cria urgência e encantamento. A assonância em "su-" (sussurro, segredo) cria efeito de intimidade e murmúrio. Ambas trabalham para construir a sensação de noite como presença ativa. Em contraste, uma redação acadêmica que usasse "A noite vem com silêncio, sussurro e segredo" teria a mesma informação, mas sem o ritmo que prende.',
      pergunta: "Como anáfora e assonância trabalham na construção sensorial do poema?",
      opcoes: [
        "Anáfora cria urgência, assonância cria musicalidade de intimidade",
        "Ambas significam a mesma coisa",
        "Apenas anáfora tem efeito; assonância não muda nada",
      ],
      correta: 0,
      explicacao:
        'Anáfora "vem, vem, vem" é martelo rítmico que cria presença ativa. Assonância "su-" é sussurro visual-sonoro que faz o leitor sentir. Juntas, constroem uma arquitetura sensorial que a prosa plana não consegue.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Figuras de sintaxe e de som são apenas ornamentação e não afetam o significado real do texto.",
      verdadeiro: false,
      explicacao:
        'Figuras de som e sintaxe construem significado. "A polícia bateu na porta" e "A porta sofreu com a polícia" dizem a mesma informação, mas a inversão sintática e a personificação mudam como o leitor sente. Forma e sentido são inseparáveis.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa figura de sintaxe ou som de forma mais eficaz?",
      opcoes: [
        "Os pés pisam na terra com firmeza.",
        "Pisam, pisam, pisam os pés na terra firme.",
        "Os pés pisavam enquanto a terra os recebia.",
      ],
      correta: 1,
      explicacao:
        'A segunda inverte a ordem (anástrofe) e repete "pisam" (anáfora), criando ritmo de marcha, de movimento. A primeira é plana, a terceira é inversão fraca. A segunda constrói a ação através do ritmo das palavras.',
    }),
  ],
});
