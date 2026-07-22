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
 * Lição 05: Crase em expressões.
 * Horas, "à moda de", locuções adverbiais e conjuntivas.
 */
export const craseExpressoes = defineLesson({
  id: "crase-05-crase-expressoes",
  titulo: "Crase em expressões",
  descricao: "Contextos especiais: horas, locuções e expressões cristalizadas.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é o contexto de crase mais comum em expressões de tempo (horas)?",
      opcoes: [
        "Às 8 horas, às 15h, às 21h: crase obrigatória antes do número",
        "A 8 horas é mais informal, mas também correto",
        "Nunca se usa crase com horas em português",
      ],
      correta: 0,
      explicacao:
        'Indicação de horas usa crase: às 8 horas, às 14h30, às 21h. A crase aparece porque existe uma preposição "a" (marcando o momento) que se funde com o artigo "a" feminino de "horas" (a hora). Frase: "Chegarei às 10 horas" = o "a" preposicional + o artigo de "horas" = crase.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Trabalho de 9 às 17 horas", a crase em "às" é obrigatória.',
      verdadeiro: true,
      explicacao:
        'Sim. Indicação de horário pede crase: de 9 às 17 horas. Preposição "a" (marcando limite temporal) + artigo "a" de horas = crase obrigatória. Sem crase seria erro.',
    }),
    completeLacuna({
      frase: "Chegamos___ noite e nos acomodamos no hotel com calma.",
      opcoes: ["à", "a"],
      correta: 0,
      explicacao:
        'Expressão "à noite" é locução adverbial de tempo que já carrega crase cristalizada. Assim como "à tarde", "à madrugada". São expressões que trazem crase de forma fixa. Preposição "a" + artigo feminino de "noite".',
    }),
    multiplaEscolha({
      pergunta: 'A expressão "à moda de" sempre traz crase. Por que motivo?',
      opcoes: [
        'Porque é uma locução que carrega preposição "a" + artigo feminino de "moda"',
        'Porque "moda" é uma palavra que obrigatoriamente recebe crase',
        "Porque essa expressão é de origem francesa",
      ],
      correta: 0,
      explicacao:
        'Em "à moda de", a preposição "a" + artigo feminino "a" de moda = crase fixa. É uma expressão cristalizada. "Fruta à moda de Paris" = fruta no estilo de Paris. A crase é parte da expressão, não variável.',
    }),
    parear({
      instrucao: "Combine cada expressão com sua classificação de crase",
      pares: [
        {
          a: "Às 10 horas da manhã",
          b: "Crase em indicação de hora",
        },
        {
          a: "À noite, caminho pela praia",
          b: "Crase em locução adverbial temporal",
        },
        {
          a: "Bife à moda de Minas",
          b: 'Crase em expressão fixa com "à moda de"',
        },
      ],
      explicacao:
        "Expressões cristalizadas em português trazem crase como parte de sua estrutura. Essas locuções já vêm com crase de fábrica na língua. Conhecê-las evita erros recorrentes.",
    }),
    encontreOErro({
      frase: "Saí para jantar a noite na companhia de amigos queridos.",
      // Tokenização: Saí(0) para(1) jantar(2) a(3) noite(4) na(5) companhia(6) de(7) amigos(8) queridos(9)
      // "À noite" é locução adverbial cristalizada que exige crase.
      // Deveria ser "à noite". Erro em "a(3)"
      erroIndex: 3,
      explicacao:
        'A locução adverbial "à noite" é cristalizada na língua com crase. Assim como "à tarde", "à madrugada", "à noite" traz crase obrigatória. O correto é "Saí para jantar à noite". Faltou a contração nessa expressão fixa.',
    }),
    interpretacao({
      texto:
        'Muitas expressões em português nasceram com crase porque combinam uma preposição "a" com um artigo feminino. Essas expressões cristalizaram-se assim ao longo dos séculos. Indicações de hora, expressões adverbiais de tempo (à noite, à tarde, à madrugada, às vezes), e formações com "à moda de" já vêm com crase incorporada ao idioma. Um falante fluente nem pensa nisso; apenas escreve "às 8 horas" sem hesitar. Para o aprendiz, o truque é memorizar essas expressões como blocos indivisíveis: elas já trazem crase de fábrica.',
      pergunta: "Segundo o texto, por que muitas expressões em português trazem crase?",
      opcoes: [
        'Porque combinam preposição "a" com artigo feminino, cristalizadas assim ao longo do tempo',
        "Porque a crase é mais bonita em expressões",
        "Porque toda expressão em português obrigatoriamente precisa de crase",
      ],
      correta: 0,
      explicacao:
        "As expressões se cristalizaram assim porque nasceram de construções gramaticais genuínas (preposição + artigo). Com o tempo, viraram blocos fixos. Conhecer essas expressões como unidades fechadas evita erros.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Posso escrever tanto "Chegarei a 15 horas" quanto "Chegarei às 15 horas" sem estar errado.',
      verdadeiro: false,
      explicacao:
        'Não. Indicações de hora exigem crase: "às 15 horas" é o correto. "A 15 horas" seria erro em português culto. A expressão de horário é cristalizada com crase.',
    }),
    encontreOErro({
      frase: "Assisti à apresentação a tarde inteira, sem parar de aplaudir.",
      // Tokenização: Assisti(0) à(1) apresentação(2) a(3) tarde(4) inteira(5) sem(6) parar(7) de(8) aplaudir(9)
      // "à apresentação" já está certo (substantivo comum feminino). O único erro da frase é
      // "a(3) tarde", que deveria ser "à tarde" (locução adverbial cristalizada).
      erroIndex: 3,
      explicacao:
        'A expressão "à tarde" é locução adverbial cristalizada que exige crase. O correto é "Assisti à apresentação à tarde inteira". Faltou a contração nessa locução de tempo.',
    }),
  ],
});
