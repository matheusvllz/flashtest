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
 * Lição 05: Orações reduzidas
 */
export const oracoesReduzidas = defineLesson({
  id: "sintaxe-2-05-oracoes-reduzidas",
  titulo: "Orações reduzidas: gerúndio, infinitivo e particípio",
  descricao: "A oração sem verbo finito, compacta e dinâmica na estrutura.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma oração reduzida?",
      opcoes: [
        "Uma oração muito curta, com poucas palavras",
        "Uma oração cujo verbo não é conjugado (gerúndio, infinitivo ou particípio)",
        "Uma oração que perde o sujeito e fica incompleta",
      ],
      correta: 1,
      explicacao:
        "Reduzida usa verbo em forma nominal: gerúndio (-ando, -endo, -indo), infinitivo (cantar, partir), particípio (-ado, -ido, -ido). Sem flexão de modo-tempo, é compacta, ágil, econômica na redação.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Após terminar a prova, saí correndo", a oração "após terminar" é uma reduzida de infinitivo.',
      verdadeiro: true,
      explicacao:
        'Reduzida de infinitivo usa "terminar" sem conjugação. Equivale a "após ter terminado" (oracional). Na redação, reduzidas economizam palavras sem perder clareza.',
    }),
    parear({
      pares: [
        { a: "Estudando muito, você passa.", b: "Gerúndio (condição)" },
        { a: "Terminado o exame, os alunos saíram felizes.", b: "Particípio" },
        { a: "Para passar nessa prova, é preciso estudar.", b: "Infinitivo" },
        { a: "Vendo a chuva cair, percebi a beleza.", b: "Gerúndio (causa)" },
      ],
      explicacao:
        "Gerúndio (-ando, -endo, -indo) marca ação em processo. Particípio (-ado, -ido) marca resultado. Infinitivo (forma verbal pura) marca ação sem pessoa. Cada um estrutura a oração de forma diferente.",
    }),
    encontreOErro({
      frase: "Chegados o professor, todos se calaram.",
      erroIndex: 0,
      explicacao:
        'O particípio absoluto concorda em gênero e número com seu sujeito. Aqui o sujeito é "o professor" (singular), então o certo é "Chegado", não "Chegados". A forma no plural quebra a concordância logo na abertura da frase.',
    }),
    completeLacuna({
      frase: "___ a redação, o aluno sentiu-se aliviado.",
      opcoes: ["Terminando", "Terminado", "Terminar"],
      correta: 1,
      explicacao:
        'Particípio "terminado" marca resultado: a ação já foi concluída. "Terminando" (gerúndio) marcaria ação em processo. Aqui, como o alívio vem após conclusão, particípio é o correto.',
    }),
    multiplaEscolha({
      pergunta: "Qual sentença traz uma oração reduzida de gerúndio com função adverbial de causa?",
      opcoes: [
        "Para chegar no horário, acordei cedo.",
        "Estudando com disciplina, você progride.",
        "Terminada a aula, saímos em silêncio.",
      ],
      correta: 1,
      explicacao:
        'Gerúndio "estudando" marca causa: por estudar com disciplina, você progride. Infinitivo (para chegar) marca finalidade. Particípio (terminada) marca condição de tempo. Cada forma estrutura um tipo diferente de relação.',
    }),
    ordenar({
      blocos: [
        "Vendo a oportunidade,",
        "o candidato respondeu com segurança",
        "e confiança.",
        "Aproveitando cada instante.",
      ],
      explicacao:
        'Gerúndio "vendo" marca uma ação simultânea (enquanto via). É a técnica reduzida mais econômica de estruturar simultaneidade de ações.',
    }),
    interpretacao({
      texto:
        'Reduzidas são o segredo dos redatores experientes. Ao invés de "Quando o aluno termina a redação, ele se sente alívio", escreve-se "Terminada a redação, o aluno se sente alívio", economizando 5 palavras sem perder clareza. ENEM premia essa elegância sintática: frase densa, sem palavras demais. Gerúndio simula simultaneidade ("observando o mundo"), particípio simula resultado ("observados os dados") e infinitivo simula propósito ("para observar").',
      pergunta: "Por que reduzidas são valorizadas em uma redação de ENEM?",
      opcoes: [
        "Porque todo aluno as usa",
        "Porque economizam palavras mantendo clareza e densidade",
        "Porque são mais fáceis de entender do que orações completas",
      ],
      correta: 1,
      explicacao:
        'Reduzidas não são mero detalhe: são economia de linguagem. Cada palavra vale em ENEM. Usar "terminada a redação" em vez de "quando a redação foi terminada" mostra domínio sintático.',
    }),
    encontreOErro({
      frase: "Estudando para a prova, meu celular tocou.",
      erroIndex: 5,
      explicacao:
        'Aqui há um erro semântico raro de reduzidas: o gerúndio "estudando" refere-se ao sujeito de "tocou", que é "celular". Fica "o celular estudando", o que é absurdo. Deveria ser "Enquanto eu estudava (ou estavam estudando)".',
    }),
    verdadeiroFalso({
      afirmacao: "A oração reduzida de particípio pode vir tanto no início quanto no fim da frase.",
      verdadeiro: true,
      explicacao:
        'Particípio é flexível: "Terminada a prova, saí" ou "Saí, terminada a prova" (menos comum). A posição no início é mais clássica e segura.',
    }),
  ],
});
