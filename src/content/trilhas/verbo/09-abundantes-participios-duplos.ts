import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

export const abundantesParticipioDuplo = defineLesson({
  id: "verbo-09-abundantes-participios-duplos",
  titulo: "Verbos abundantes e particípios duplos",
  descricao: "Quando um verbo tem duas formas e quando escolher cada uma.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que caracteriza um verbo abundante?",
      opcoes: [
        "Um verbo que é muito usado na língua",
        "Um verbo que tem duas ou mais formas diferentes para o particípio",
        "Um verbo que aparece em muitas conjugações",
      ],
      correta: 1,
      explicacao:
        'Verbo abundante é aquele que oferece DOIS particípios. "Pegar" tem "pegado" e "pego". "Imprimir" tem "imprimido" e "impresso". Dois caminhos pra mesma meta, com regras de uso diferentes.',
    }),
    multiplaEscolha({
      pergunta: "Em qual contexto se usa o particípio regular (terminado em -ado ou -ido)?",
      opcoes: [
        'Só em locuções com "haver" ou "ter" (pretéritos compostos)',
        'Sempre em voz passiva com "ser"',
        "Nunca, porque o irregular é melhor",
      ],
      correta: 0,
      explicacao:
        'O particípio regular é obrigatório nas locuções com "ter" e "haver": "tenho pegado", "havia imprimido". É lá que ele brilha. Com "ser", geralmente usa-se o irregular: "documento impresso", não "documento imprimido". Há exceções, mas a regra é forte.',
    }),
    completeLacuna({
      frase: "Não temos ___ tantos documentos há muito tempo.",
      opcoes: ["imprimido", "impresso", "imprime"],
      correta: 0,
      explicacao:
        'Com "temos" (ter no presente), o particípio regular "imprimido" é obrigatório. "Temos imprimido" marca ação que se repete ou se acumula. "Impresso" seria mais visual (estado), não temporal. A locução "ter + particípio" exige o regular.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "ele tinha acendido a luz", o particípio regular "acendido" é correto com a locução "ter".',
      verdadeiro: true,
      explicacao:
        'Sim. Com "ter" e "haver", particípio regular é a norma culta. "Tinha acendido" é pretérito mais-que-perfeito composto e está perfeito. "Tinha aceso" soa estranho nesse contexto temporal.',
    }),
    encontreOErro({
      frase: "A sala estava acendida quando cheguei.",
      // A(0) sala(1) estava(2) acendida(3) quando(4) cheguei(5)
      erroIndex: 3,
      explicacao:
        'O erro está em "acendida" com "estar". Deveria ser "acesa": "a sala estava acesa". Com verbo "estar" (que marca estado e qualidade), usa-se o particípio irregular "aceso". Com "ter", seria "tinha acendido" (regular). Voz passiva com "ser" também pediria "acesa": "a luz foi acesa pelo interruptor".',
    }),
    parear({
      instrucao: "Combine cada contexto ao particípio correto",
      pares: [
        {
          a: "Tenho pegado muito trânsito ultimamente.",
          b: "Particípio regular (locuções com ter/haver)",
        },
        {
          a: "Os suspeitos foram presos pela polícia.",
          b: "Particípio irregular (voz passiva com ser)",
        },
        {
          a: "O cão estava morto quando chegamos.",
          b: "Particípio irregular (estar + adjetivo = estado)",
        },
      ],
      explicacao:
        'Regular com "ter/haver", irregular com "ser" ou "estar". Essa é a receita. Claro que há exceções quando um verbo é pouco abundante, mas a maioria segue esse padrão.',
    }),
    interpretacao({
      texto:
        'Verbos abundantes existem porque o português herdou dois sistemas: o latino clássico e o vulgar. O particípio clássico era irregular (preso, feito, dito), marcador de estado finalizado. O vulgar regularizava tudo (presado, faitado, ditado), marcador de ação temporal. Quando o português consolidou-se, guardou os dois. Por séculos, linguistas brigaram sobre qual era "correto". Hoje a regra é pragmática: com "ter/haver" (tempos compostos), usa-se regular; com "estar/ser" (estado ou qualidade), irregular. A língua achou uma solução sábia, mas há verbos que ainda variam (como "pego/pegado" em certos dialetos).',
      pergunta: "O que o texto sugere sobre por que existe um particípio regular e um irregular?",
      opcoes: [
        "Porque os autores antigos não conseguiam se decidir",
        "Porque o português herdou dois sistemas: um clássico e um vulgar, e guardou os dois",
        "Porque irregularidades são sempre erros que precisam ser corrigidos",
      ],
      correta: 1,
      explicacao:
        "Histórico, não capricho. O português é um palimpsesto: guarda camadas. Compreender isso faz a regra soar menos arbitrária e mais respeitável.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "O presidente foi eleito no primeiro turno", o particípio irregular "eleito" é correto porque marca uma ação concluída.',
      verdadeiro: true,
      explicacao:
        'Sim. Com "ser" (voz passiva), o irregular é padrão: "foi eleito", não "foi elegido". Se fosse com "ter" ("tem elegido"), aí sim entraria a forma regular. "Eleito" e "elegido" são as duas faces do mesmo verbo "eleger".',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem USO INCORRETO de particípio abundante?",
      opcoes: [
        "Eu tinha soltado o pássaro naquela manhã.",
        "A porta está suspensa no ar pela corda.",
        "Nós temos expulsos os invasores do prédio.",
      ],
      correta: 2,
      explicacao:
        'Em "temos expulsos", o erro é nítido: com "temos" (ter no presente), o particípio DEVE ser regular "expulsado", não irregular "expulsos". A frase quer dizer "temos expulsado" (ação repetida/acumulada). "Expulsos" é adjetivo qualitativo (eles estão expulsos), não marca ação temporal com "ter".',
    }),
    multiplaEscolha({
      pergunta:
        'Qual alternativa melhor explica a diferença entre "tenho expulsado invasores" e "os invasores estão expulsos"?',
      opcoes: [
        "Não há diferença; ambas significam a mesma coisa",
        "A primeira marca ação temporal repetida; a segunda marca estado qualitativo",
        "A segunda é mais correta porque usa o irregular",
      ],
      correta: 1,
      explicacao:
        'Perfeito. "Tenho expulsado" é narrativa: acumulo de ações ao longo do tempo ("tenho expulsado um invasor por semana"). "Estão expulsos" é pintura: qualidade do momento ("olhe só para eles: estão expulsos, fora daqui"). Tempos diferentes servem finalidades diferentes.',
    }),
  ],
});
