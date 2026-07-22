import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const mauMalHaAOndeAonde = defineLesson({
  id: "fonologia-ortografia-09-mau-mal-ha-a-onde-aonde",
  titulo: "Mau/mal, há/a, onde/aonde",
  descricao:
    "Trios de palavras fáceis de confundir no ENEM: a diferença está no sentido e na classe.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual frase usa "mau" corretamente?',
      opcoes: [
        "Esse mau comportamento não é aceitável.",
        "Ele agiu mau durante a reunião.",
        "O mau de sua decisão foi o apresso.",
      ],
      correta: 0,
      explicacao:
        'Mau é ADJETIVO: "mau comportamento". Mal é ADVÉRBIO: "agiu mal". Regra fácil: mau vem antes de nome (mau + substantivo). Mal vem depois de verbo ou sozinho (verbo + mal).',
    }),
    multiplaEscolha({
      pergunta: 'Qual alternativa diferencia "há" e "a" corretamente?',
      opcoes: [
        "Há é verbo haver (tempo); a é preposição ou artigo",
        "Há é mais formal que a",
        "Não há diferença prática entre elas",
      ],
      correta: 0,
      explicacao:
        'Há = verbo. "Há três dias que espero" (fazem três dias). A = preposição. "Vou a São Paulo" ou "a menina saiu". Truque: se conseguir trocar por "faz" (há = faz), é verbo há.',
    }),
    parear({
      pares: [
        { a: "Mau", b: "Adjetivo (mau comportamento)" },
        { a: "Mal", b: "Advérbio (agiu mal) ou conjunção (mal chegou)" },
        { a: "Há", b: "Verbo haver (há três dias)" },
      ],
      explicacao:
        "Mau é qualidade de algo. Mal é modo de agir ou duração. Há é tempo. Lembre: MALDADE tem MAL, não MAU. MALDOSO tem MAU (qualidade ruim).",
    }),
    verdadeiroFalso({
      afirmacao:
        'A palavra "onde" e "aonde" podem ser usadas indistintamente em qualquer contexto.',
      verdadeiro: false,
      explicacao:
        'Não. Onde pergunta LOCALIZAÇÃO: "onde você mora?" (em que lugar). Aonde pergunta MOVIMENTO, DIREÇÃO: "aonde você vai?" (para que lugar). Onde = parado, aonde = movimento.',
    }),
    encontreOErro({
      frase: "Desde há uma semana que ele não come mau, apenas ignora a comida.",
      erroIndex: 8,
      explicacao:
        'Contando: Desde(0) há(1) uma(2) semana(3) que(4) ele(5) não(6) come(7) mau,(8) apenas(9) ignora(10) a(11) comida.(12). "Come mau" está errado: depois de verbo usamos advérbio, "mal", não o adjetivo "mau". O certo é "não come mal". Toque em "mau,".',
    }),
    completeLacuna({
      frase: "Ela chegou à noite e agiu ___ durante toda a discussão.",
      opcoes: ["mau", "mal", "mau,"],
      correta: 1,
      explicacao:
        'Mal, advérbio que modifica o verbo "agiu" (o modo de agir). Mau é adjetivo e viria antes de um substantivo, tipo "mau comportamento", não é o caso aqui.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase está totalmente correta?",
      opcoes: [
        "Aonde ele vai? Onde ele mora? Há dois anos, mal me lembro.",
        "Onde ele vai? Aonde ele mora? Há dois anos, mau me lembro.",
        "Aonde ele mora? Onde ele vai? Há dois anos, mal me lembro.",
      ],
      correta: 0,
      explicacao:
        'Primeira opção. "Aonde ele vai" pergunta destino, verbo de movimento. "Onde ele mora" pergunta local fixo, verbo de estado. "Há dois anos" é o verbo haver marcando tempo. "Mal me lembro" é advérbio, não "mau". A segunda troca onde/aonde e usa "mau" errado. A terceira inverte vai/mora.',
    }),
    interpretacao({
      texto:
        'Em português, palavras que soam parecido mas têm origem em classes gramaticais diferentes frequentemente causam confusão. "Mau" (adjetivo latino) descreve qualidade, enquanto "mal" (advérbio latino) descreve modo ou tempo. "Há" (verbo haver) marca duração de tempo no passado, enquanto "a" (preposição) marca direção ou lugar. "Onde" pergunta pelo local onde se está, enquanto "aonde" pergunta para qual local se vai. Dominar essas distinções não é capricho, mas compreensão de classes e funções gramaticais que, quando bem aplicadas, tornam a escrita precisa.',
      pergunta: 'Por que "mau" e "mal" são frequentemente confundidos?',
      opcoes: [
        "Porque têm origem na mesma palavra latina",
        "Porque pertencem a classes diferentes (adjetivo vs advérbio) mas soam parecido",
        "Porque são sempre intercambiáveis em textos formais",
      ],
      correta: 1,
      explicacao:
        "Exato. O confuso é que PARECEM a mesma coisa, mas gramaticalmente são diferentes. Mau modifica nome (qualidade), mal modifica verbo ou ação (modo). A confusão nasce dessa similaridade sonora versus função diferente.",
    }),
  ],
});
