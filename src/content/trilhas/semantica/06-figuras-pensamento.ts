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
 * Figuras de pensamento: ironia, hipérbole, eufemismo, antítese, paradoxo.
 * Ferramentas que constroem uma atitude, uma posição do falante.
 */
export const figurasPensamento = defineLesson({
  id: "semantica-06-figuras-pensamento",
  titulo: "Figuras de pensamento",
  descricao: "Ironia, hipérbole, eufemismo, antítese, paradoxo: atitude e crítica.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é ironia?",
      opcoes: [
        "Dizer algo com intenção de afirmar o oposto, criando crítica ou humor",
        "Uma exageração proposital de uma qualidade",
        "Uma substituição de uma palavra ofensiva por outra suave",
      ],
      correta: 0,
      explicacao:
        'Ironia é quando você diz uma coisa mas quer dizer o oposto. "Que belo dia para uma enchente." A intenção é crítica. Ironia constrói posicionamento: mostra seu descontentamento com uma situação.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa ironia de forma eficaz?",
      opcoes: [
        "Ele é tão inteligente que não consegue resolver uma equação simples.",
        "Ele é uma pessoa inteligente.",
        "Ele parecia inteligente quando o conheci.",
      ],
      correta: 0,
      explicacao:
        'A primeira diz "inteligente" mas demonstra incompetência: a contradição evidencia a ironia. Isso cria crítica aguda. A intenção é derribar uma afirmação exagerada sobre inteligência.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Hipérbole é o uso de exageração proposital para criar efeito emocional ou cômico.",
      verdadeiro: true,
      explicacao:
        'Hipérbole é amplificação: "Já lhe disse um trilhão de vezes". Ninguém disse trilhões de vezes; a exageração é a força. Hipérbole constrói ênfase e convoca emoção para que o leitor sinta a profundidade de algo.',
    }),
    parear({
      instrucao: "Combine cada figura de pensamento com um exemplo",
      pares: [
        { a: "Ironia", b: "Que perfeita eleição tivemos, sem fraude alguma." },
        { a: "Hipérbole", b: "Morrer de vergonha, estar morrendo de fome." },
        { a: "Eufemismo", b: 'Ele faleceu (em lugar de "morreu").' },
      ],
      explicacao:
        "Ironia inverte a verdade para criar crítica. Hipérbole amplifica. Eufemismo abrandar. Cada uma constrói uma atitude diferente diante do real.",
    }),
    multiplaEscolha({
      pergunta: "O que é antítese?",
      opcoes: [
        "A aproximação de dois termos opostos na mesma frase para criar contraste",
        "O aumento de intensidade em uma série de palavras",
        "A repetição de uma mesma palavra no início de frases consecutivas",
      ],
      correta: 0,
      explicacao:
        'Antítese coloca opostos lado a lado: "Na guerra e na paz", "na morte e na vida". O contraste que antítese cria é uma estrutura que solidifica a argumentação, permitindo que o leitor sinta a tensão.',
    }),
    completeLacuna({
      frase: "Para obter a ___ , é preciso às vezes estar disposto a perder a segurança.",
      opcoes: ["liberdade", "felicidade", "razão"],
      correta: 0,
      explicacao:
        "Liberdade cria a antítese: ganhar liberdade e perder segurança são opostos que trabalham na mesma estrutura. Essa contradição é o alicerce da frase. Felicidade ou razão enfraqueceriam.",
    }),
    interpretacao({
      texto:
        'Em uma redação sobre tecnologia, um candidato escreveu: "A tecnologia nos conecta cada vez mais, e cada vez mais nos isolamos". Antítese: conecta e isola são opostos. Depois: "Moramos em mundos paralelos: reais e virtuais, em guerra silenciosa um com o outro". Antítese novamente, agora com paradoxo (guerra silenciosa é contraditório). O texto constrói tensão através dessas figuras. Sem elas, o argumento seria: "A tecnologia nos afeta de formas boas e ruins". Fraco. Com elas, a estrutura ganha profundidade.',
      pergunta: "Como antítese e paradoxo trabalham juntos na construção do texto?",
      opcoes: [
        "Antítese cria contraste, paradoxo cria tensão dentro do contraste",
        "São figuras redundantes que significam a mesma coisa",
        "Paradoxo é mais importante que antítese",
      ],
      correta: 0,
      explicacao:
        "Antítese aproxima opostos: A versus não-A. Paradoxo é contradição que convive: A e não-A simultaneamente. Quando usadas juntas, criam camadas de significado que prendem o leitor.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Paradoxo é quando duas afirmações contraditórias convivem na mesma frase sem se negar.",
      verdadeiro: true,
      explicacao:
        'Paradoxo é "guerra silenciosa", "solidão acompanhada". Não resolvem a contradição; vivem com ela. Paradoxo constrói uma verdade além da lógica simples: é a ferramenta mais sofisticada de construção de significado.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa paradoxo de forma mais eficaz?",
      opcoes: [
        "Ele era forte e fraco ao mesmo tempo.",
        "Sua força residia em sua capacidade de reconhecer sua própria fragilidade.",
        "Ele tinha boas e más qualidades.",
      ],
      correta: 1,
      explicacao:
        "A segunda constrói paradoxo: força e fragilidade não se negam, mas se ligam. Existe um alicerce lógico (reconhecer fragilidade é força). A primeira é apenas contradição plana. A terceira é lista: não é figura.",
    }),
  ],
});
