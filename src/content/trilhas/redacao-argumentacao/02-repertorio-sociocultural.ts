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
 * Lição 02: Repertório sociocultural legitimado (o que conta e o que não conta)
 */
export const repertorioSociocultural = defineLesson({
  id: "redacao-argumentacao-02-repertorio-sociocultural",
  titulo: "Repertório sociocultural legitimado",
  descricao: "O que a banca do ENEM aceita como repertório e o que ela rejeita.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um repertório sociocultural legítimo na redação do ENEM?",
      opcoes: [
        "Qualquer referência a livros, filmes ou pessoas famosas que o aluno conhece",
        "Informação, fato, citação ou experiência vivida que seja relacionada ao tema e contribua como argumento",
        "Decoração de frases prontas memorizadas no Instagram",
      ],
      correta: 1,
      explicacao:
        'Legitimidade é nexo: a referência tem que estar amarrada ao tema e servir de base para o argumento. Não é enfeite. Se a banca perceber que você citou Marx porque está na moda, ela marca como "repertório de bolso" e reduz sua nota em Competência II.',
    }),
    parear({
      instrucao: 'Classifique cada referência como legítima ou "de bolso"',
      pares: [
        {
          a: 'Citar Hannah Arendt sobre "banalidade do mal" porque realmente se relaciona com o tema da falta de engajamento social',
          b: "Repertório legítimo: conexão explicada com o tema",
        },
        {
          a: 'Mencionar "Utopia de Thomas More" sem explicar por que é relevante para o tema',
          b: "Repertório de bolso: citação sem nexo explicado",
        },
        {
          a: "Usar estatísticas do IBGE sobre desemprego no parágrafo sobre mercado de trabalho",
          b: "Repertório legítimo: dado aplicado ao argumento certo",
        },
        {
          a: 'Citar Freud porque ele é "clássico", sem conexão com o argumento',
          b: "Repertório de bolso: nome solto por prestígio",
        },
      ],
      explicacao:
        "A diferença está na raiz: repertório legítimo está fundo no solo temático; repertório de bolso é colhido só porque cabe em uma mochila pronta. A banca enxerga quando você PENSA versus quando você COLA mentalmente.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma experiência pessoal (ter passado por bullying, estudar em escola pública) é válida como repertório se bem conectada ao tema.",
      verdadeiro: true,
      explicacao:
        'Verdade. A Cartilha do ENEM reconhece "conhecimento de mundo" e "vivências e relações interpessoais" como fontes legítimas. O que torna legítimo é a CONEXÃO clara com o tema, não isolamento em "minha história".',
    }),
    completeLacuna({
      frase: "Repertório ___ é aquele que está memorizado, genérico e desconectado do tema real.",
      opcoes: ["de bolso", "cultural", "produtivo"],
      correta: 0,
      explicacao:
        'A Cartilha ENEM chama de "repertório de bolso" essa referência rápida, pronta, que não mostra pensamento. É o contrário do repertório "produtivo", que a banca quer.',
    }),
    encontreOErro({
      frase: "Como Platão disse em A República, precisamos de mais inclusão social.",
      erroIndex: 6,
      explicacao:
        'Repare em "precisamos": o texto salta direto pro seu argumento sem explicar o NEXO com a citação. Platão não falou especificamente sobre isso. Se vai citar clássico, contextualize: "Platão debatia justiça distributiva; hoje...". Caso contrário, é de bolso.',
    }),
    multiplaEscolha({
      pergunta: "Qual desses repertórios a banca considera mais produtivo?",
      opcoes: [
        "Citar Guimarães Rosa porque ele é escritor importante.",
        'Citar "Grande Sertão Veredas" explicando como a estrutura de Rosa sobre identidade se relaciona com o tema de migração',
        "Mencionar qualquer livro que o aluno leu uma vez",
      ],
      correta: 1,
      explicacao:
        "Produtivo é quando você MOSTRA o pensamento. Não é a referência que importa; é o que você FAZ com ela. Uma citação vazia é de bolso; uma que você explica e articula é ouro.",
    }),
    interpretacao({
      texto:
        'Um aluno escreveu: "Segundo dados do UNICEF, 50% das meninas não completam o ensino médio. Assim como Carolina Maria de Jesus precisou suplicar por educação, muitas mulheres hoje enfrentam barreiras estruturais. Por isso, políticas de permanência escolar são essenciais." A banca avaliou positivamente e citou: repertório sociocultural produtivo (Carolina sem ser de bolso, porque houve explicação do paralelo histórico).',
      pergunta: "Por que a referência a Carolina Maria de Jesus foi considerada produtiva aqui?",
      opcoes: [
        "Porque Carolina é uma autora famosa",
        "Porque o aluno explicou o nexo entre a experiência histórica de Carolina e o problema atual das mulheres",
        "Porque o aluno citou dados depois",
      ],
      correta: 1,
      explicacao:
        "Produtivo é transparência de pensamento. O aluno não só citou Carolina; ele mostrou COMO ela se relaciona com o argumento sobre barreiras estruturais. A banca vê que você pensa, não decora.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma referência a um podcast, documentário ou notícia que você assistiu é tão legítima quanto uma citação de livro clássico, desde que bem explicada.",
      verdadeiro: true,
      explicacao:
        'Verdade. A Cartilha reconhece "filmes, documentários, podcasts, palestras, notícias" como conhecimento de mundo válido. A hierarquia não é "clássico > contemporâneo"; é "bem articulado > solto". Uma notícia conectada vence um clássico decorado.',
    }),
    multiplaEscolha({
      pergunta: 'O que marca uma referência como "de bolso" aos olhos da banca?',
      opcoes: [
        "Ser muito conhecida",
        "Aparecer sem explicação ou contexto temático claro",
        "Vir de um autor estrangeiro",
      ],
      correta: 1,
      explicacao:
        "De bolso é quando você NOTA que a referência foi metida sem nexo, como um pano-rápido para parecer culto. A banca tem experiência: lê 500 redações por dia e enxerga o decorado. Explique, articule, mostre o fio.",
    }),
  ],
});
