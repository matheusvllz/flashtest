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
 * Lição 06: O que zera a redação
 */
export const oQuezeraRedacao = defineLesson({
  id: "redacao-estrutura-06-o-que-zera-redacao",
  titulo: "O que zera a redação",
  descricao: "Motivos oficiais para receber nota zero e anulação pela banca do ENEM.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual situação NÃO resulta em nota zero automática na redação do ENEM?",
      opcoes: [
        "Texto com menos de 8 linhas manuscritas",
        "Fuga total ao tema proposto",
        "Redação com três erros gramaticais",
      ],
      correta: 2,
      explicacao:
        "Erros gramaticais prejudicam a Competência I, mas não zeram a redação sozinhos. Nota zero é reservada para situações graves: tamanho insuficiente, fuga ao tema, tipo textual errado ou violações claras de direitos humanos. Três erros, por piores que sejam, não chegam aí.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma redação que não é dissertativo-argumentativa recebe automaticamente nota zero em todas as competências.",
      verdadeiro: false,
      explicacao:
        "Se o texto for predominantemente narrativo ou descritivo, não recebe zero total. Recebe penalização severa na Competência II, podendo zerar APENAS nela. O zero total só vem se for PREDOMINÂNCIA MUITO MARCADA ou se houver fuga ao tema.",
    }),
    multiplaEscolha({
      pergunta: 'O que caracteriza "fuga total ao tema"?',
      opcoes: [
        "Desvio leve do assunto em um parágrafo",
        "Nem o assunto amplo nem o tema específico proposto são desenvolvidos",
        "Tangenciamento do tema baseado só no assunto mais amplo",
      ],
      correta: 1,
      explicacao:
        'Fuga é zero: o aluno ignora completamente o que foi pedido. Se o tema é "inclusão digital" e ele escreve sobre futebol, zera. Se escreve sobre tecnologia em geral sem conectar à inclusão, ainda pode ser fuga dependendo do grau de desconexão.',
    }),
    completeLacuna({
      frase:
        "Uma redação escrita em ___ linhas ou menos é considerada insuficiente e recebe nota zero.",
      opcoes: ["3", "7", "15"],
      correta: 1,
      explicacao:
        "A regra oficial é clara: menos de 8 linhas (note: até 7) = insuficiente = zero. O motivo é que não há espaço para argumentação adequada. Você precisa de volume mínimo de texto para sustentar uma discussão complexa.",
    }),
    parear({
      instrucao: "Combine cada razão de zero com sua descrição oficial",
      pares: [
        { a: "Fuga ao tema", b: "Nem assunto amplo nem tema específico são desenvolvidos" },
        {
          a: "Tipo textual errado",
          b: "Predominância de características narrativas ou descritivas",
        },
        { a: "Texto insuficiente", b: "Até 7 linhas manuscritas (ou até 10 em Braille)" },
        { a: "Anulação", b: "Impropérios, desenhos, identificação fora do espaço, ilegibilidade" },
        {
          a: "Desrespeito humano",
          b: "Proposta que viola direitos humanos (zero na Competência V)",
        },
      ],
      explicacao:
        "Cada motivo é uma linha vermelha oficial. Não são interpretações: são critérios cravados pela Cartilha do ENEM. Conhecê-los evita desastres.",
    }),
    encontreOErro({
      frase:
        "Texto ilegível não é penalizado na redação do ENEM; apenas diminui a nota em Competência I.",
      erroIndex: 2,
      explicacao:
        'Repare no "não": ele inverte a verdade. Texto ilegível que impossibilita a leitura por dois avaliadores independentes recebe ZERO e é marcado como "Anulada", o oposto do que a frase afirma. Ilegibilidade não é detalhe: inviabiliza a avaliação. Sempre escreva com letra clara.',
    }),
    ordenar({
      blocos: [
        "Ilegibilidade zera e anula o texto",
        "Fuga total ao tema zera toda a redação",
        "Menos de 8 linhas zera toda a redação",
        "Violação de direitos humanos na proposta de intervenção zera a Competência V",
        "Predominância narrativa/descritiva prejudica Competência II",
        "Os critérios de zero do ENEM, do mais grave ao mais técnico",
      ],
      explicacao:
        "Alguns critérios zeram tudo, outros apenas uma competência. Os que zeram tudo são os inegociáveis: tamanho, tema, tipo, leitura. Conhecer essa hierarquia ajuda a evitar passos falsos.",
    }),
    multiplaEscolha({
      pergunta: "Qual situação resulta em zero E anulação da redação?",
      opcoes: [
        "Três erros de pontuação em pontos estratégicos",
        "Nome escrito fora do espaço destinado, ou desenhos com propósito de anular",
        "Três erros de concordância no segundo parágrafo",
      ],
      correta: 1,
      explicacao:
        "Anulação é mais severa que zero simples: significa que o texto não é nem considerado. Identificação errada, desenhos propositais, impropérios, ilegibilidade são as causas. Erros linguísticos não anulam; redação é avaliada mesmo com erros, desde que legível.",
    }),
    interpretacao({
      texto:
        "A Cartilha do ENEM 2025 destaca que propostas de intervenção desrespeitosas aos direitos humanos recebem nota 0 apenas na Competência V, não na redação toda. Isso diferencia de fuga ao tema ou tipo textual errado, que zera a nota final completa (nota 0 em todas as competências). A intencionalidade importa: se você escreve algo ofensivo sem intencionalidade ou se está debatendo a temática respeitosamente mas usa linguagem contundente, pode não ser considerado desrespeito. Mas defesa explícita de tortura, execução, ou ódio contra grupos é zero automático na Competência V.",
      pergunta: "Qual é a diferença entre receber zero na Competência V e zero em toda a redação?",
      opcoes: [
        "Não há diferença; os dois resultam em nota final zero",
        "Zero na Competência V permite que outras competências sejam avaliadas; zero em toda a redação anula tudo completamente",
        "Zero em toda a redação é mais fácil de recuperar",
      ],
      correta: 1,
      explicacao:
        "Zero na Competência V (por desrespeito humano) permite que Competências I, II, III, IV sejam avaliadas e contribuam para uma nota final (mesmo que menor). Zero em toda a redação (fuga ao tema, tipo errado) não permite avaliação nenhuma. A segunda opção é mais grave.",
    }),
  ],
});
