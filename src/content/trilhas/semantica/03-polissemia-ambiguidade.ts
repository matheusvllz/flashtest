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
 * Polissemia e ambiguidade: quando uma palavra carrega múltiplos sentidos.
 */
export const polissemiaAmbiguidade = defineLesson({
  id: "semantica-03-polissemia-ambiguidade",
  titulo: "Polissemia e ambiguidade",
  descricao: "Uma palavra, múltiplos significados: estrutura de sentido ou confusão?",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é polissemia?",
      opcoes: [
        "Quando uma palavra tem vários significados relacionados",
        "Quando duas palavras soam igual",
        "Quando um texto não fica claro",
      ],
      correta: 0,
      explicacao:
        'Polissemia é uma única palavra carregando significados diferentes, mas conectados. "Página" é papel e também seção de um livro: os sentidos conversam. Dominar polissemia permite criar camadas de sentido que solidificam a redação.',
    }),
    verdadeiroFalso({
      afirmacao: "Polissemia é sempre um defeito na redação e deve ser evitada.",
      verdadeiro: false,
      explicacao:
        'Polissemia é natural da língua e, com contexto claro, é força. "O país precisa abrir suas portas" usa "portas" no sentido polissêmico (abertura física e abertura metafórica para imigrantes). Isso constrói sentido. Defeito é a ambiguidade sem intenção.',
    }),
    encontreOErro({
      frase: "Pedro disse a Paulo que ele passou no exame.",
      erroIndex: 5,
      explicacao:
        'O problema mora em "ele": não fica claro se quem passou foi Pedro ou Paulo. Pronome sem referência definida cria ambiguidade sem intenção, e isso é fraqueza de estrutura. O texto claro nomeia de novo quem fez o quê: "Pedro disse a Paulo que Paulo passou no exame."',
    }),
    multiplaEscolha({
      pergunta: "Qual é a diferença entre polissemia e ambiguidade?",
      opcoes: [
        "Polissemia tem sentidos relacionados e claros pelo contexto; ambiguidade é confusão sem intenção",
        "São a mesma coisa com nomes diferentes",
        "Ambiguidade é rara, polissemia é comum",
      ],
      correta: 0,
      explicacao:
        "Polissemia é estrutura da língua. Ambiguidade é quando a polissemia cria confusão porque o contexto não deixa claro qual sentido você escolheu. A diferença é intenção e clareza.",
    }),
    parear({
      instrucao: "Combine cada palavra com seus múltiplos significados polissêmicos",
      pares: [
        { a: "banco", b: "instituição financeira / móvel para sentar" },
        { a: "folha", b: "papel / parte da planta" },
        { a: "pé", b: "parte do corpo / medida de comprimento / apoio de móvel" },
      ],
      explicacao:
        'A polissemia se estrutura por relacionalidade: os significados conversam. Pé é "parte do corpo" e também "apoio" porque ambos carregam a ideia de base, sustentação. Isso é construção de sentido, não confusão.',
    }),
    interpretacao({
      texto:
        'Em uma redação sobre tecnologia, um aluno escreveu: "A rede social conecta milhões de usuários". Aqui, "rede" é polissêmico: pode ser a plataforma digital ou a malha de conexões entre pessoas. O contexto deixa claro que se trata de plataforma, mas há um sentido mais profundo guardado ali: a rede social é literalmente uma rede de pessoas. Essa polissemia intencional dá camadas ao texto. Mas outro aluno escreveu: "O computador precisa de um drive". Aqui, "drive" é ambíguo demais: pode ser unidade de disco ou motivação (em inglês). Sem contexto claro, a frase confunde. A diferença? Intenção e contexto.',
      pergunta: 'Por que a polissemia em "rede social" é considerada bem usada no texto?',
      opcoes: [
        "Porque não há ambiguidade: o contexto deixa claro que é a plataforma digital",
        "Porque conecta dois sentidos que conversam: a plataforma e a malha de pessoas",
        "Porque torna o texto mais longo e complexo",
      ],
      correta: 1,
      explicacao:
        'A polissemia bem estruturada cria camadas. "Rede" é a plataforma, mas também é literalmente uma rede de conexão humana. Os sentidos não confundem: enriquecem. Essa é a base de uma redação com alicerce.',
    }),
    completeLacuna({
      frase:
        "O discurso do político tinha múltiplas ___, deixando a população confusa sobre sua verdadeira posição.",
      opcoes: ["interpretações", "implicações", "intenções"],
      correta: 0,
      explicacao:
        "Interpretações são as leituras possíveis do discurso ambíguo. Implicações são consequências. Intenções são vontades. Quando um texto deixa múltiplas interpretações, é ambiguidade sem intenção: fraqueza de estrutura.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Um bom redator pode usar polissemia propositalmente para criar sentidos profundos.",
      verdadeiro: true,
      explicacao:
        "Polissemia intencional é técnica: permite que uma palavra carregue dois sentidos que conversam, criando camadas de argumento. Isso é precisamente o que faz uma redação passar de clara para brilhante.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa a polissemia de forma mais eficaz?",
      opcoes: [
        "O livro era pesado para carregar.",
        "O livro era pesado e tocava fundo na alma do leitor.",
        "O tema da redação era pesado.",
      ],
      correta: 1,
      explicacao:
        'A segunda frase usa polissemia: "pesado" é literal (peso físico) e figurado (impacto emocional). Os dois sentidos trabalham juntos para construir a ideia de um livro profundo e denso. Isso é solidez de alicerce.',
    }),
  ],
});
