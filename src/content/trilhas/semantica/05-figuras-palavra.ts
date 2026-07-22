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
 * Figuras de palavra: metáfora, metonímia, comparação, catacrese.
 * Ferramentas que constroem imagem e significado além do literal.
 */
export const figuransPalavra = defineLesson({
  id: "semantica-05-figuras-palavra",
  titulo: "Figuras de palavra",
  descricao: "Metáfora, metonímia, comparação e catacrese: além do literal.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é metáfora?",
      opcoes: [
        'Uma comparação entre duas coisas diferentes, usando "como" ou "tal qual"',
        "A identificação implícita entre duas coisas diferentes, sem usar conectivo comparativo",
        "A atribuição de qualidades humanas a seres inanimados",
      ],
      correta: 1,
      explicacao:
        'Metáfora é identificação: você diz que uma coisa É outra coisa. "A vida é uma jornada" não compara, identifica. A vida tem os atributos de uma jornada: caminho, destino, fases. Metáfora constrói o alicerce simbólico da argumentação.',
    }),
    multiplaEscolha({
      pergunta: "Qual é um exemplo de metáfora?",
      opcoes: [
        "A menina era tão rápida quanto um guepardo.",
        "O menino é um anjo.",
        "Ela corria mais rápido que o vento.",
      ],
      correta: 1,
      explicacao:
        'Na segunda, menino É anjo: identificação metafórica. As outras usam "como" ou "que", que indicam comparação, não metáfora. Metáfora diz "você É isso", não "você É como isso".',
    }),
    verdadeiroFalso({
      afirmacao:
        "Metonímia é quando uma palavra substitui outra porque têm significados relacionados.",
      verdadeiro: true,
      explicacao:
        'Metonímia é substituição por relação: "Leia mais Machado de Assis" significa sua obra, não o homem. "O Brasil ganhou a copa" é o time, não a nação inteira. Metonímia economiza palavras construindo camadas de sentido.',
    }),
    parear({
      instrucao: "Combine cada figura de palavra com um exemplo",
      pares: [
        { a: "Metáfora", b: "A vida é uma montanha" },
        { a: "Metonímia", b: "Gosto de ler Clarice Lispector" },
        { a: "Comparação", b: "Aquele homem é como uma rocha" },
      ],
      explicacao:
        'Metáfora diz "é", metonímia substitui por relação (obra pelo autor), comparação diz "é como". Cada uma constrói um tipo diferente de alicerce simbólico. Dominar as três é estruturar a linguagem em camadas.',
    }),
    completeLacuna({
      frase: "Seu coração era uma ___ que bate em ritmo constante e seguro.",
      opcoes: ["máquina", "pedra", "música"],
      correta: 0,
      explicacao:
        "Máquina constrói a metáfora de precisão e funcionamento. A frase diz que o coração é máquina porque é previsível, seguro, confiável. Pedra ou música quebraria a estrutura que você montou.",
    }),
    interpretacao({
      texto:
        'Na redação sobre identidade, um aluno escreveu: "Eu sou uma árvore com raízes profundas". Metáfora: identifica-se com a árvore, convocando suas qualidades de estabilidade, crescimento, enraizamento. Outro escreveu: "As raízes me prendem ao chão". Aqui, "raízes" é metonímia: significa origem, família, passado (tudo que "raízes" traz consigo). Ambas falam de enraizamento, mas por caminhos diferentes. A primeira solidifica a imagem; a segunda cria movimento e tensão (prende = limitação). Em um texto sobre liberdade versus pertencimento, a metonímia trabalha melhor porque convoca a relação de causa (raízes = o que restringe).',
      pergunta:
        'Por que a metonímia "raízes me prendem" funciona melhor que a metáfora "sou uma árvore" no contexto de liberdade versus pertencimento?',
      opcoes: [
        "Porque é mais fácil de entender",
        "Porque convoca a relação de causa (raízes = o que restringe) e cria tensão",
        "Porque usa palavras mais comuns",
      ],
      correta: 1,
      explicacao:
        "Metonímia trabalha por associação: raízes não apenas significam origem, significam algo que te prende. Isso cria a tensão que o tema exige. Metáfora seria mais estável, mais integrada; metonímia cria conflito.",
    }),
    multiplaEscolha({
      pergunta: "O que é catacrese?",
      opcoes: [
        "Uma metáfora tão antiga que virou literalidade",
        "Uma metáfora errada",
        'Uma comparação sem "como"',
      ],
      correta: 0,
      explicacao:
        'Catacrese é metáfora lexicalizada, tão desgastada que ninguém mais vê como figura. "Pé da montanha", "boca do rio", "braço da cadeira": todas eram metáforas que viraram palavras comuns. Em redação, evite: use "braço da cadeira", mas em argumentação profunda, convoque metáforas novas.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma boa redação deve evitar metáforas clichês e buscar criatividade em suas figuras.",
      verdadeiro: true,
      explicacao:
        'Catacrese e metáforas desgastadas ("chuva de problemas", "labirinto da vida") enfraquecem o alicerce. Uma redação brilha quando cria metáforas novas que ainda assim se enraízam na lógica da língua. Criatividade é precisão sobre novo terreno.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa uma figura de palavra de forma mais original e eficaz?",
      opcoes: [
        "A política é um labirinto confuso.",
        "A política é um tabuleiro onde cada peça tem seu lugar e suas limitações.",
        "A política é complicada como um labirinto.",
      ],
      correta: 1,
      explicacao:
        'A primeira usa catacrese (labirinto é lugar-comum). A terceira é comparação fraca. A segunda constrói uma metáfora: política É tabuleiro, e cada "peça", cada "lugar" trazem consigo o jogo de xadrez, suas regras de poder, movimento e estratégia. É uma metáfora estruturada que não é clichê.',
    }),
  ],
});
