import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 07: Ponto e vírgula
 */
export const pontoEVirgula = defineLesson({
  id: "pontuacao-07-ponto-e-virgula",
  titulo: "Ponto e vírgula",
  descricao: "A pausa forte que não fecha a frase, mas avisa que há mais vindo.",
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        "O ponto e vírgula marca uma pausa mais forte que a vírgula, mas não fecha a frase.",
      verdadeiro: true,
      explicacao:
        "Exatamente. É quase um ponto, mas não é. Você usa quando precisa de uma pausa bem marcada e ainda tem ideias ligadas vindo depois.",
    }),
    multiplaEscolha({
      pergunta: "Qual é o uso mais comum do ponto e vírgula em uma frase com duas orações?",
      opcoes: [
        "Separar orações muito longas e independentes de sentido",
        "Indicar que uma ideia continua com outra de peso parecido",
        "Ambas as respostas estão corretas",
      ],
      correta: 2,
      explicacao:
        'Verdade. O ponto e vírgula separa orações longas que não precisam de "e" ou "mas", mantendo-as conectadas no mesmo pensamento.',
    }),
    completeLacuna({
      frase: "A redação exige clareza; a pontuação exige atenção___ ambas exigem treino constante.",
      opcoes: [",", ";", "."],
      correta: 1,
      explicacao:
        "Essas três orações têm pesos parecidos mas são independentes. O ponto e vírgula as une sem precisar de conectivo. Cria uma sequência de pensamentos equilibrados.",
    }),
    encontreOErro({
      frase: "O aluno estudou com dedicação, ele passou na prova com uma nota excelente.",
      erroIndex: 4,
      explicacao:
        'Vírgula sozinha não segura duas orações independentes como essas: fica fraca demais. O ponto e vírgula é o certo aqui: "...dedicação; ele passou..." Ele marca a pausa forte que a vírgula não dá.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual frase demonstra o uso adequado do ponto e vírgula para listar ideias de peso igual?",
      opcoes: [
        "A gramática é estudada por linguistas; a história é estudada por historiadores",
        "A gramática, a história, a matemática são disciplinas importantes",
        "Ambas estão corretas",
      ],
      correta: 0,
      explicacao:
        "Na primeira frase, o ponto e vírgula une duas orações completas que estabelecem paralelo. Na segunda, é uma simples lista com vírgulas. O ponto e vírgula marca o paralelismo de orações longas.",
    }),
    completeLacuna({
      frase:
        "Há quem ame ler em silêncio; há quem prefira ouvir histórias___ o importante é cultivar o hábito.",
      opcoes: [",", ";", ":"],
      correta: 1,
      explicacao:
        "Duas orações de peso igual introduzem uma conclusão. O ponto e vírgula marca a pausa entre elas, e a mesma pausa forte volta a ligar a conclusão que fecha o pensamento.",
    }),
    verdadeiroFalso({
      afirmacao:
        "O ponto e vírgula é totalmente opcional: você pode usar vírgula ou ponto no lugar dele sempre.",
      verdadeiro: false,
      explicacao:
        "Não é bem assim. Ponto fecha demais. Vírgula separa pouco. O ponto e vírgula é ideal quando você tem orações longas e independentes mas conectadas. Não é opcional, é a escolha certa para esse caso.",
    }),
    interpretacao({
      texto:
        "O ponto e vírgula é raro no português coloquial porque a fala natural usa tom, pausa e gestos para indicar esses momentos; na escrita formal, ele volta a ser valioso. Em uma redação do ENEM sobre um tema complexo, o ponto e vírgula conecta ideias de igual peso sem deixar o texto fragmentado. Usar bem o ponto e vírgula marca a diferença entre um texto que parece escrito às pressas e outro que respira com naturalidade intelectual.",
      pergunta:
        "Segundo o texto, em qual situação o ponto e vírgula marca a diferença estilística?",
      opcoes: [
        "Em textos informais e rápidos",
        "Em redações formais e complexas que exigem elegância",
        "Não faz diferença de estilo",
      ],
      correta: 1,
      explicacao:
        "O ponto e vírgula é marca de texto bem construído e pensado. Em redação de ENEM, seu uso correto eleva a qualidade percebida do texto.",
    }),
  ],
});
