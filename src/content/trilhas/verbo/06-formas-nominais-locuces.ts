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

export const formasNominaisLocucoes = defineLesson({
  id: "verbo-06-formas-nominais-locuces",
  titulo: "Formas nominais (infinitivo, gerúndio, particípio) e locuções verbais",
  descricao: "Quando o verbo se disfarça de nome e quando dois verbos viram um.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a principal característica das formas nominais do verbo?",
      opcoes: [
        "Elas expressam tempo e modo verbais normalmente",
        "Elas têm características de nomes (substantivos, adjetivos) e podem perder traços verbais",
        "Elas só aparecem no passado",
      ],
      correta: 1,
      explicacao:
        'As formas nominais (infinitivo, gerúndio, particípio) parecem verbo, mas agem como nomes. "Correr" é um verbo, mas também é substantivo ("gosto de correr"). "Estudando" é verbo, mas também é adjetivo ("aluno estudando"). Eles vestem terno, mas no coração são nomes.',
    }),
    multiplaEscolha({
      pergunta: "O que caracteriza uma locução verbal?",
      opcoes: [
        "Um verbo acompanhado por um advérbio",
        "Um verbo auxiliar + um verbo principal em forma nominal",
        "Dois verbos conjugados um depois do outro",
      ],
      correta: 1,
      explicacao:
        'Locução é dupla: um auxiliar (que marca tempo, modo, aspecto) + um principal em forma nominal (infinitivo, gerúndio, particípio). "Vou estudar", "estou correndo", "tenho comido". O auxiliar carrega a informação temporal; o principal diz o que acontece.',
    }),
    completeLacuna({
      frase: 'O infinitivo "correr" em "Gosto de correr todas as manhãs" funciona como ___.',
      opcoes: ["verbo conjugado", "substantivo", "advérbio"],
      correta: 1,
      explicacao:
        'Aqui "correr" é o objeto do verbo "gostar". Age como substantivo. Se disséssemos "gosto de corrida", seria claro que é substantivo. "Correr" é a mesma coisa, só em forma nominal do verbo. Nome de ação.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "estou comendo uma maçã", "comendo" é gerúndio e funciona como verbo naquela locução.',
      verdadeiro: true,
      explicacao:
        'Sim. "Estou" é o auxiliar (marca o presente contínuo). "Comendo" é gerúndio, mas funciona como verbo dentro da locução "estou comendo". Juntos formam uma ideia única: ação em progresso agora.',
    }),
    encontreOErro({
      frase:
        "Particípios de verbos irregulares como feito, escrito, vindo são geralmente invariáveis.",
      // Particípios(0) de(1) verbos(2) irregulares(3) como(4) feito(5) escrito(6) vindo(7) são(8) geralmente(9) invariáveis(10)
      erroIndex: 10,
      explicacao:
        'O erro está em dizer "invariáveis". Particípios como "feito", "escrito", "vindo" são VARIÁVEIS em gênero e número: "a porta foi aberta", "os livros escritos", "as moedas vistas". Particípios não só variam, eles DEVEM variar quando usados em passiva ou como adjetivo.',
    }),
    parear({
      instrucao: "Combine cada forma nominal ao seu uso correto",
      pares: [
        {
          a: "Infinitivo (correr, fazer)",
          b: "Age como substantivo; marca ação sem flexão de tempo",
        },
        {
          a: "Gerúndio (correndo, fazendo)",
          b: "Age como adjetivo ou em locuções; marca duração/continuidade",
        },
        {
          a: "Particípio (corrido, feito)",
          b: "Age como adjetivo; marca ação concluída, é variável",
        },
      ],
      explicacao:
        "Cada forma nominal tem um trabalho específico. O infinitivo é nome puro. O gerúndio mostra ação em andamento. O particípio mostra conclusão. Nenhum deles é tempo verbal: todos são disfarçados.",
    }),
    ordenar({
      blocos: [
        "Ao acordar,",
        "comecei meu dia",
        "visitando amigos",
        "e conversando sobre planos futuros.",
      ],
      explicacao:
        'O infinitivo "acordar" é substantivo (objeto de "ao", preposição). Os gerúndios "visitando" e "conversando" descrevem as ações contínuas que fazem parte do dia. Sequência natural: despertar, então agir.',
    }),
    interpretacao({
      texto:
        'As formas nominais são ferramentas poderosas para economia de palavras. Em vez de "eu encho a bolsa de livros todos os dias", você escreve "enchendo a bolsa de livros todos os dias, vou pra escola". O gerúndio reduz, fluidifica. Particípios, quando bem usados, criam textos enxutos: "o aluno preparado pela escola pública" é mais eficiente que "o aluno que foi preparado pela escola pública". O particípio trabalha por você.',
      pergunta:
        'Por que o texto diz que formas nominais são "ferramentas poderosas para economia de palavras"?',
      opcoes: [
        "Porque permitem resumir ações longas em uma palavra só",
        "Porque são mais fáceis de pronunciar",
        "Porque não precisam concordar com nada",
      ],
      correta: 0,
      explicacao:
        'Exato. Um gerúndio ou particípio substitui uma oração inteira: "enchendo" = "enquanto encho". Uma redação bem escrita aproveita formas nominais pra ser elegante e breve ao mesmo tempo. É isso que separa o texto amador do polido.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O particípio, ao ser usado em vozes passivas como "o livro foi lido", funciona como adjetivo do objeto.',
      verdadeiro: true,
      explicacao:
        'Sim. Em "o livro foi lido", "lido" é particípio funcionando como adjetivo (descreve estado do livro). E varia: "os livros foram lidos", "a carta foi lida". Particípio é sempre variável quando marca um resultado ou qualidade.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa corretamente uma locução verbal?",
      opcoes: [
        "Ele tenho estado estudando demais.",
        "Eles têm estado estudando demais.",
        "Nós está comendo bem ultimamente.",
      ],
      correta: 1,
      explicacao:
        'Em "eles têm estado estudando", o auxiliar "têm" concorda com "eles" (plural), e a locução é "têm estado estudando" (perfeito composto + gerúndio). As outras têm erros de concordância: "tenho" com "ele", "está" com "nós".',
    }),
  ],
});
