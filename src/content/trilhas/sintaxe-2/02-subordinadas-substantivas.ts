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
 * Lição 02: Subordinadas substantivas (6 tipos)
 */
export const subordinadasSubstantivas = defineLesson({
  id: "sintaxe-2-02-subordinadas-substantivas",
  titulo: "Subordinadas substantivas",
  descricao: "Orações que exercem função de nome, dependendo da principal.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma oração subordinada substantiva?",
      opcoes: [
        "Uma oração que descreve as qualidades de um substantivo",
        "Uma oração que exerce função de nome (sujeito, objeto, etc.)",
        "Uma oração que modifica um adjetivo",
      ],
      correta: 1,
      explicacao:
        'Subordinada substantiva é um alicerce estrutural: ela faz o papel de um nome na frase. "Espero que você passe" (subordinada como objeto direto), "O fato de você ter vindo" (subordinada como sujeito). Nomes disfarçados em orações.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "É importante que todos estudem", a oração "que todos estudem" é subjetiva.',
      verdadeiro: true,
      explicacao:
        'Subjetiva é aquela que funciona como sujeito. "Que todos estudem" é o sujeito da ideia "É importante". Sem ela, fico só com "É importante", que não diz de quê.',
    }),
    parear({
      pares: [
        { a: "Tenho certeza de que você vai passar.", b: "Completiva nominal" },
        { a: "Desejo que você estude bem.", b: "Objetiva direta" },
        { a: "É indiscutível que a pontuação importa.", b: "Subjetiva" },
        { a: "Certifiquei-me de que a aula foi adiada.", b: "Objetiva indireta" },
      ],
      explicacao:
        "Subjetiva completa o verbo da principal como sujeito. Objetiva direta completa verbo transitivo direto. Objetiva indireta completa verbo transitivo indireto, regido por preposição. Completiva nominal completa nome (substantivo, adjetivo).",
    }),
    encontreOErro({
      frase: "Informei-o que sua presença seria essencial na reunião.",
      erroIndex: 0,
      explicacao:
        'O verbo "informar" pede a preposição "de" antes da oração ("informar alguém DE algo"). Faltou o "de" logo depois de "Informei-o": o certo é "Informei-o de que sua presença seria essencial".',
    }),
    completeLacuna({
      frase: "O professor pediu ___ os alunos entregassem o trabalho no prazo.",
      opcoes: ["de que", "que", "para que"],
      correta: 1,
      explicacao:
        'O verbo "pedir" já é transitivo direto com oração subordinada: "pedir que alguém faça algo" é a forma da norma culta, sem precisar de "para". "Para que" traria uma ideia de finalidade que "pedir" não pede aqui, e "de que" não se aplica.',
    }),
    multiplaEscolha({
      pergunta:
        'Em "O problema é que ninguém se preparou", que tipo de subordinada é "que ninguém se preparou"?',
      opcoes: ["Objetiva direta", "Predicativa", "Completiva nominal"],
      correta: 1,
      explicacao:
        'Predicativa completa um verbo de ligação (é, fica, parece). "O problema é [que ninguém se preparou]". A subordinada substitui um adjetivo ou nome predicativo, explicando a natureza do sujeito.',
    }),
    ordenar({
      blocos: ["Ficou provado", "que o aluno copiou a redação.", "A acusação", "tinha base real."],
      explicacao:
        'A subordinada "que o aluno copiou" é predicativa: ela completa o verbo "ficou" (ligação), explicando o que foi provado. Não é sujeito (subjetiva), é um predicativo mascarado em oração.',
    }),
    interpretacao({
      texto:
        'Nas redações do ENEM, subordinadas substantivas são instrumentos de solidez. Quando o aluno traz dados com "Estudos mostram que o crime cresceu", está usando objetiva direta para estruturar seu argumento. Quando escreve "É inegável que a educação transforma vidas", usa subjetiva para fundamentar uma tese. Dominar esses tipos abre portas para argumentação densa e persuasiva.',
      pergunta: "Qual é a função de usar subordinadas substantivas em uma redação de ENEM?",
      opcoes: [
        "Apenas decorar a linguagem com frases mais bonitas",
        "Estruturar argumentos e dados de forma sólida",
        "Substituir adjetivos quando o texto fica longo",
      ],
      correta: 1,
      explicacao:
        'Subordinadas substantivas ancoram ideias: "Pesquisas indicam que" traz dados, "É fato que" estrutura tese. Não é estilo, é alicerce de persuasão. A banca ENEM reconhece essa solidez.',
    }),
    encontreOErro({
      frase: "Convenci-o que mudasse de opinião.",
      erroIndex: 0,
      explicacao:
        'O verbo "convencer" rege preposição: "convencer a" ou "convencer de". Faltou a preposição logo depois de "Convenci-o": o certo é "Convenci-o a que mudasse" ou "Convenci-o de que mudasse".',
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma oração apositiva é aquela que funciona como aposto, explicando um termo anterior.",
      verdadeiro: true,
      explicacao:
        'Apositiva é rara, mas existe: "Tenho uma convicção: de que você vai passar". A segunda oração explica e reforça a primeira, funcionando como aposto. Usa dois-pontos ou vírgula.',
    }),
  ],
});
