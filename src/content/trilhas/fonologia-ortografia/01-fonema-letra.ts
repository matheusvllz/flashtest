import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const fonemaVsLetra = defineLesson({
  id: "fonologia-ortografia-01-fonema-letra",
  titulo: "Fonema vs letra",
  descricao: "Entenda a diferença entre o som que falamos e o símbolo que escrevemos.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um fonema?",
      opcoes: [
        "A letra que escrevemos no papel",
        "O menor som que diferencia duas palavras",
        "O acento usado em uma sílaba",
      ],
      correta: 1,
      explicacao:
        'Fonema é o som. Quando você fala "pato" e "gato", a diferença está no som inicial, não na letra. Cada som que muda o sentido é um fonema.',
    }),
    multiplaEscolha({
      pergunta: 'Quantas letras e quantos fonemas tem a palavra "carro"?',
      opcoes: ["5 letras, 4 fonemas", "5 letras, 5 fonemas", "6 letras, 6 fonemas"],
      correta: 0,
      explicacao:
        "Carro tem 5 letras, mas o RR faz um único som, não dois. Logo, 4 fonemas: /ca-rro/ (o som do R duplo é um só). Letra e som nem sempre combinam.",
    }),
    parear({
      pares: [
        { a: 'X em "xícara"', b: "Fonema /x/ (som de sh)" },
        { a: 'C em "carro"', b: "Letra (representa o fonema /k/)" },
        { a: 'O som de "ch" em "chave"', b: "Fonema (som único, duas letras)" },
      ],
      explicacao:
        "Letra é símbolo no papel. Fonema é o som. Uma letra pode representar sons diferentes, e um som pode ter várias letras.",
    }),
    verdadeiroFalso({
      afirmacao: 'As palavras "cela" (jaula) e "sela" (assento de cavalo) têm os mesmos fonemas.',
      verdadeiro: true,
      explicacao:
        'Sim, e é por isso que essa dupla existe. "Cela" e "sela" soam exatamente igual, /s/-/e/-/l/-/a/: mesmos fonemas do início ao fim. A letra muda (C vira S), mas o som que sai da boca é idêntico. Prova viva de que letra e fonema não são a mesma coisa.',
    }),
    encontreOErro({
      frase: 'O X em "táxi" faz o som de "z", não de "ks".',
      erroIndex: 8,
      explicacao:
        'Contando: O(0) X(1) em(2) "táxi"(3) faz(4) o(5) som(6) de(7) "z",(8) não(9) de(10) "ks".(11). O X em "táxi" faz o som /ks/, não /z/. A frase inverteu os sons. Toque em "z", que é a palavra errada.',
    }),
    completeLacuna({
      frase: "Em português, a letra H nunca representa um ___ , apenas indica aspecto gráfico.",
      opcoes: ["fonema", "sílaba", "som"],
      correta: 0,
      explicacao:
        'Correto, a letra H é muda em português. "Hora" tem H escrito, mas o som começa direto com o /o/. Letra seca, nenhum fonema.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra tem 7 letras mas apenas 6 fonemas, por causa de um dígrafo?",
      opcoes: [
        "Melancia (8 letras, 8 fonemas, sem dígrafo)",
        "Passada (7 letras, 6 fonemas)",
        "Achado (6 letras, 5 fonemas)",
      ],
      correta: 1,
      explicacao:
        "Passada: P-A-S-S-A-D-A, 7 letras. O SS é dígrafo e faz um único som /s/, então os fonemas são /p/ /a/ /s/ /a/ /d/ /a/: 6 no total. Letra e fonema não precisam bater.",
    }),
    interpretacao({
      texto:
        'A ortografia é a arte de escrever as palavras corretamente, mas a fonética estuda os sons da fala. Uma palavra pode ter letras que não representam sons (como o H inicial), ou um som representado por letras diferentes (como /s/ em "sapo" e "cena"). Entender essa distinção é essencial para dominar tanto a pronúncia quanto a escrita.',
      pergunta: "Segundo o texto, qual é a diferença entre ortografia e fonética?",
      opcoes: [
        "Ortografia escreve corretamente, fonética estuda os sons",
        "Ortografia é mais fácil que fonética",
        "Ortografia e fonética são exatamente a mesma coisa",
      ],
      correta: 0,
      explicacao:
        "Ortografia cuida de COMO ESCREVER, fonética cuida de COMO PRONUNCIAR. São domínios diferentes, e por isso uma letra pode não ter som, e um som pode ter várias letras.",
    }),
    verdadeiroFalso({
      afirmacao: 'A letra "ç" representa sempre o mesmo fonema.',
      verdadeiro: true,
      explicacao:
        'Sim. O "ç" sempre faz o som /s/: "coração", "cabeça", "açúcar". Nenhuma variação. A letra nasceu pra isso e cumpre direitinho.',
    }),
  ],
});
