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
 * Funções da linguagem: as 6 funções segundo Jakobson.
 * Referencial, emotiva, conativa, fática, metalinguística, poética.
 */
export const funcoesLinguagem = defineLesson({
  id: "semantica-09-funcoes-linguagem",
  titulo: "Funções da linguagem",
  descricao: "As 6 funções: referencial, emotiva, conativa, fática, metalinguística, poética.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a função referencial da linguagem?",
      opcoes: [
        "Transmitir informações sobre o mundo de forma objetiva",
        "Expressar sentimentos e emoções do falante",
        "Construir um efeito estético nas palavras",
      ],
      correta: 0,
      explicacao:
        'Função referencial informa, descreve, narra. "A capital do Brasil é Brasília" é referencial puro. Em redação, é o alicerce: você transmite fatos, argumentos, informações. Sem referencial, não há estrutura.',
    }),
    verdadeiroFalso({
      afirmacao: "A função emotiva expressa as emoções e sensações do falante.",
      verdadeiro: true,
      explicacao:
        'Função emotiva: "Que tristeza perdi meu irmão" ou "Estou furioso com essa injustiça!". O foco está no "eu", não na realidade. Em redação, emotiva pura enfraquece argumentação. Mas combinada com referencial, humaniza.',
    }),
    parear({
      instrucao: "Combine cada função com um exemplo",
      pares: [
        { a: "Referencial", b: "Os números mostram que 70% dos alunos passaram no exame." },
        { a: "Emotiva", b: "Que vergonha, não acredito que isso aconteceu." },
        { a: "Poética", b: "A noite sussurra segredos ao ouvido da cidade." },
      ],
      explicacao:
        "Referencial transmite fatos. Emotiva expressa sentimento. Poética cria efeito estético. Juntas, elas tecem a redação: fato + sentimento + beleza.",
    }),
    multiplaEscolha({
      pergunta: "O que é função conativa?",
      opcoes: [
        "Tentar persuadir, influenciar ou ordenar o receptor",
        "Manter o contato entre os interlocutores",
        "Refletir sobre a própria linguagem",
      ],
      correta: 0,
      explicacao:
        'Função conativa busca ação do receptor. "Venha aqui agora!", propagandas ("Compre hoje!"), pedidos. Em redação argumentativa, você apela à conativa: quer que o leitor concorde e aja.',
    }),
    completeLacuna({
      frase:
        'A expressão "Alô, você está aí?" é um exemplo de função ___ da linguagem, porque seu propósito é manter o contato.',
      opcoes: ["fática", "emotiva", "referencial"],
      correta: 0,
      explicacao:
        'Função fática apenas abre e mantém contato: "Oi", "Você está me ouvindo?", "Tá bom?". A informação é quase zero; o propósito é manter o canal de comunicação aberto.',
    }),
    interpretacao({
      texto:
        'Um anúncio de produto diz: "Experimente a nova bebida tropical que faz você se sentir vivo novamente! Com extratos naturais que refrescam alma e corpo, você vai se transformar." Este texto combina múltiplas funções. Referencial: "extratos naturais" (informação). Emotiva: "sentir vivo", "refrescam alma" (sentimento do consumidor). Conativa: "Experimente", "você vai se transformar" (persuasão para comprar). Poética: "refrescam alma e corpo" (efeito sonoro e imagético). Um anúncio que usasse apenas referencial ("Contém 15% de suco concentrado") seria fraco de venda; a combinação de funções cria estrutura que move o receptor.',
      pergunta: "Qual função é mais importante para a persuasão em um anúncio?",
      opcoes: [
        "Referencial, porque precisa dar fatos",
        "Emotiva e conativa juntas, porque tocam sentimento e pedindo ação",
        "Poética, porque torna belo o produto",
      ],
      correta: 1,
      explicacao:
        'Conativa pede ação ("Compre!"). Emotiva toca o coração ("viva melhor"). Juntas, vendem. Referencial dá base (fatos), mas sozinha não move. A arte está em combinar as funções.',
    }),
    verdadeiroFalso({
      afirmacao: "Função metalinguística é quando a linguagem fala sobre si mesma.",
      verdadeiro: true,
      explicacao:
        'Metalinguagem: "A palavra casa significa moradia" ou "Este texto é uma crítica". A linguagem reflete sobre a própria linguagem. Em redação acadêmica, você usa metalinguagem quando cita autores ou define termos.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa a função poética mais claramente?",
      opcoes: [
        "O livro tem 200 páginas e custa 50 reais.",
        "Sombras dançam na parede enquanto a noite respira.",
        "Leia o livro porque vai aprender muito.",
      ],
      correta: 1,
      explicacao:
        'A segunda cria efeito estético: aliteração em "s" (sombras), personificação (noite respira), metáfora (sombras dançam). É poética pura. A primeira é referencial, a terceira é conativa.',
    }),
  ],
});
