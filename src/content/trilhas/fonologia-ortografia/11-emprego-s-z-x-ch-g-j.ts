import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const empregoSZXCHGJ = defineLesson({
  id: "fonologia-ortografia-11-emprego-s-z-x-ch-g-j",
  titulo: "Emprego de S, Z, X, CH, G, J",
  descricao: "Regras de quando usar cada letra para representar esses sons em português.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual regra explica quando usar S e quando usar Z?",
      opcoes: [
        "Não há diferença, ambos fazem o mesmo som",
        "S é sempre no início, Z é sempre no fim de palavra",
        'Não existe uma regra fixa: a escolha vem da origem histórica de cada palavra, por isso "análise" tem S (grego) e "azul" tem Z (árabe)',
      ],
      correta: 2,
      explicacao:
        'Essa é a verdade incômoda: não tem fórmula mágica. "Análise" vem do grego e usa S mesmo soando /z/; "azul" vem do árabe e usa Z. O jeito é memorizar por família de palavras, não inventar regra geral.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra está escrita corretamente?",
      opcoes: [
        'Autorização (correto, Z porque vem do verbo "autorizar", terminado em -izar)',
        "Autorização (Z em qualquer sufixo -ação)",
        "Paraiso (S no final, evitando Z)",
      ],
      correta: 0,
      explicacao:
        'Autorização está certo. Substantivos formados a partir de verbos terminados em -izar (autorizar, realizar, civilizar) mantêm o Z: autoriza-ção, realiza-ção. Não é qualquer palavra em -ação que leva Z, "nação" e "estação" usam S. Paraíso tem S, é grafia histórica da palavra toda, sem hífen faltando.',
    }),
    parear({
      pares: [
        { a: 'X em "exame"', b: "Som de Z" },
        { a: 'X em "xarope"', b: "Som de SH" },
        { a: 'X em "sexo"', b: "Som de KS" },
      ],
      explicacao:
        'X é a letra mais imprevisível do português: pode soar Z (exame), SH (xarope) ou KS (sexo). Existe até o som de S puro em palavras como "trouxe". Não há regra fixa, é memorização por palavra.',
    }),
    verdadeiroFalso({
      afirmacao:
        'A letra G sempre faz o som /g/ (como em "gato"), e J sempre faz o som /j/ (como em "jato").',
      verdadeiro: false,
      explicacao:
        'Não. G antes de E ou I faz /j/ (gelo, girafa). J sempre faz /j/ (jelo seria inexistente). Regra: G muda de som conforme a vogal, J é consistente. Por isso "gesso" e "Jesus" começam com sons parecidos.',
    }),
    encontreOErro({
      frase: "O exercício de Português exije muito cuidado na ortografia de palavras com S, Z e X.",
      erroIndex: 4,
      explicacao:
        'Contando: O(0) exercício(1) de(2) Português(3) exije(4) muito(5) cuidado(6) na(7) ortografia(8) de(9) palavras(10) com(11) S(12) Z(13) e(14) X(15). O erro mora em "exije" (índice 4): o certo é "exige", porque G antes de E já soa /j/, sem precisar de J. Toque em "exije".',
    }),
    completeLacuna({
      frase: 'A palavra "análise" é grafada com ___ porque tem origem grega, assim como "síntese".',
      opcoes: ["S", "Z", "C"],
      correta: 0,
      explicacao:
        'Com S. "Análise" vem de "análusis" (grego). Parece que deveria ser Z (por ser estrangeira), mas é S. "Síntese" também (de "synthesis"). A regra é histórica e caprichosa.',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa tem TODOS os sons representados corretamente?",
      opcoes: [
        "Gjota, Xave, Zêlo (errado por inteiro)",
        "Jota, Chave, Zelo (J, CH, Z corretos)",
        "Gota, Xave, Zêlo (G antes de O, X errado)",
      ],
      correta: 1,
      explicacao:
        "Segunda: Jota (J faz /j/), Chave (CH faz som de SH), Zelo (Z faz /z/). As outras misturam: G antes de A faz /g/ (não /j/); X antes de A normalmente faz /KS/ (não SH).",
    }),
    interpretacao({
      texto:
        'A ortografia do português colonial foi herdeira de convenções medievais onde os sons não eram tão rigidamente fixados por letra. Por isso G muda conforme a vogal seguinte, X pode fazer vários sons, e Z tem regras históricas complexas. Estudar essas convenções não é dominar uma "lógica", mas reconhecer padrões herdados. Uma estratégia útil é associar palavra a palavra: se "exercício" usa X, então "excelente" também (ambos começam com EX-). Se "análise" usa S, então "síntese" também (ambas vêm do grego). Padrões, não regras absolutas.',
      pergunta: "Por que a ortografia de S, Z e X em português é tão irregular?",
      opcoes: [
        "Porque o português foi simplificado intencionalmente",
        "Porque é baseada em padrões históricos e origens de palavras, não em sons puros",
        "Porque não há motivo real, é capricho de linguistas",
      ],
      correta: 1,
      explicacao:
        'Exato. A escrita registra história, não apenas som. "Análise" com S porque vem do grego "análysis". "Autorização" com Z porque vem do verbo "autorizar", terminado em -izar. Entender ORIGEM ajuda a lembrar escrita. Não é capricho, é rastro deixado pela evolução da língua.',
    }),
  ],
});
