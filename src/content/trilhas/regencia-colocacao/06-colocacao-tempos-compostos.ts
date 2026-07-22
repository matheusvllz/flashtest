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
 * Lição 06: Colocação nos Tempos Compostos
 * Foco: onde vai o pronome quando há auxiliar (tenho visitado, havia levado, etc.)
 */
export const colocacaoTemposCompostos = defineLesson({
  id: "regencia-colocacao-06-colocacao-tempos-compostos",
  titulo: "Colocação pronominal nos tempos compostos",
  descricao: "Com auxiliar, o pronome segue antes do auxiliar ou depois do principal.",
  exercicios: [
    multiplaEscolha({
      pergunta:
        "Em tempos compostos (tenho visitado, havia levado), onde vai o pronome em português correto?",
      opcoes: [
        'Sempre antes do verbo auxiliar: "tenho-o visitado".',
        'Sempre depois do verbo principal: "tenho visitado-o".',
        "Antes do auxiliar (próclise) quando há atrator; depois do principal caso contrário.",
      ],
      correta: 2,
      explicacao:
        'Tempos compostos respeitam a mesma lógica: com palavra atrativa, próclise antes do auxiliar ("não o tenho visitado"); sem atrator, ênclise depois do principal ("tenho visitado-o").',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Tinha-a deixado em casa", o pronome está em posição correta.',
      verdadeiro: false,
      explicacao:
        'Errado. Ênclise no auxiliar é raro em português culto. O correto é "tinha deixado-a em casa" (ênclise após o particípio) ou "a tinha deixado" (próclise antes do auxiliar, mas sem atrator, é menos comum).',
    }),
    encontreOErro({
      // "Ele" (0) "não" (1) "tem" (2) "ajudado-o" (3) "suficientemente." (4)
      frase: "Ele não tem ajudado-o suficientemente.",
      erroIndex: 3,
      explicacao:
        '"Não" é atrator: próclise é obrigatória antes do auxiliar. O correto é "não o tem ajudado", não "tem ajudado-o". Atrator na frase, pronome vem pra frente.',
    }),
    completeLacuna({
      frase: "Se ___ tivéssemos visitado, tudo seria diferente agora.",
      opcoes: ["o", "lhe", "vos"],
      correta: 0,
      explicacao:
        'Com "se" (atrator), a próclise vem antes do auxiliar: "se o tivéssemos visitado". O pronome fica logo antes do verbo auxiliar "tivéssemos", puxado pela conjunção condicional.',
    }),
    parear({
      instrucao: "Combine cada frase com a análise correta de colocação",
      pares: [
        {
          a: "Não o tenho visitado nos últimos dias.",
          b: 'Próclise: "não" atrai antes do auxiliar',
        },
        {
          a: "Tenho deixado-a esperando sozinha.",
          b: "Ênclise: sem atrator, após o particípio",
        },
        {
          a: "Quando o havia encontrado, estava feliz.",
          b: 'Próclise: "quando" atrai antes do auxiliar',
        },
        {
          a: "Havia visitado-o muitas vezes antes.",
          b: "Ênclise: no fim do tempo composto",
        },
      ],
      explicacao:
        "Tempos compostos seguem a orquestração: atrator puxa próclise antes do auxiliar; sem atrator, ênclise após o particípio.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase está gramaticalmente correta?",
      opcoes: [
        "Nunca tinha-o visto antes dessa festa.",
        "Nunca o tinha visto antes dessa festa.",
        "Nunca tinha visto-o antes dessa festa.",
      ],
      correta: 1,
      explicacao:
        '"Nunca" é palavra negativa, atrai próclise. O correto é "nunca o tinha visto". A ênclise no auxiliar ("tinha-o") é arcaica; após o particípio ("visto-o") é menos comum que antes do auxiliar.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Teríamos-te auxiliado se possível", o pronome está em mesóclise no tempo composto.',
      verdadeiro: false,
      explicacao:
        'Não é mesóclise, é ênclise no auxiliar. E em português moderno, preferimos próclise ou ênclise após o particípio: "teríamos te auxiliado" ou "teria-te auxiliado" é raro. Melhor: "teríamos auxiliado-te".',
    }),
    encontreOErro({
      // "Quando" (0) "tinha" (1) "deixado" (2) "me" (3) "sozinho," (4) "meu" (5) "irmão" (6) "chegou." (7)
      frase: "Quando tinha deixado me sozinho, meu irmão chegou.",
      erroIndex: 3,
      explicacao:
        '"Quando" é atrator de próclise. O correto é "quando me tinha deixado sozinho". O pronome deve vir logo após a palavra atrativa, antes do auxiliar "tinha".',
    }),
    interpretacao({
      texto:
        'Tempos compostos mantêm a lei da proximidade: o pronome prefere vir perto de quem o chama. Se há negação ou interrogação, ele corre para antes do auxiliar. Se não há atrator, ele segue após o particípio, como um resto que termina a estrutura verbal. A frase "Não o tenho visto" revela que o "não" convida o pronome à frente; "Tenho visto-o" mostra que, sem companhia atrativa, o pronome fica no fim. Ambas são corretas: o contexto sintático é quem escolhe.',
      pergunta:
        'O texto afirma que o pronome em tempos compostos "prefere vir perto de quem o chama". Isso quer dizer:',
      opcoes: [
        "Que o pronome sempre vem no mesmo lugar, independentemente de atratores.",
        "Que palavras atrativas determinam se o pronome vem antes do auxiliar ou após o particípio.",
        "Que tempos compostos não permitem colocação pronominal de forma alguma.",
      ],
      correta: 1,
      explicacao:
        'O texto explica que "atratores" (negação, interrogação) puxam o pronome para a frente (próclise); sem eles, fica no fim (ênclise). Isso é "lei da proximidade".',
    }),
  ],
});
