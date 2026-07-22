import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

export const imperativo = defineLesson({
  id: "verbo-05-imperativo",
  titulo: "Imperativo: o modo do comando",
  descricao: "Como dar ordens em português com a forma verbal correta.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a função principal do modo imperativo?",
      opcoes: [
        "Afirmar algo que é certo",
        "Dar uma ordem, pedido ou instrução",
        "Expressar uma possibilidade",
      ],
      correta: 1,
      explicacao:
        'O imperativo MANDA. "Abra a porta!", "Não grite!", "Me escuta agora". É o modo da vontade e da ação comandada. Não oferece escolha: é direto, é agora, é assim.',
    }),
    multiplaEscolha({
      pergunta: "Em português, qual é a diferença entre o imperativo tu e o imperativo você?",
      opcoes: [
        'O imperativo "tu" usa a forma do presente do indicativo sem o "s" final (come), o "você" usa a forma do subjuntivo (você coma)',
        "Não há diferença, são iguais",
        'O imperativo "tu" é mais formal que o "você"',
      ],
      correta: 0,
      explicacao:
        'Essa é a armadilha clássica! "Tu brinque" é errado. O imperativo de "tu" é o presente do indicativo SEM o "s" final: "tu brincas" (indicativo) vira "brinca!" no imperativo. Já "você" usa o subjuntivo mesmo: "você brinque". Em prova, esse mix tu/você é prato cheio pro ENEM.',
    }),
    completeLacuna({
      frase: "Tu ___ os livros aqui em cima, por favor.",
      opcoes: ["coloque", "coloca", "colocaria"],
      correta: 1,
      explicacao:
        'Com "tu", o imperativo pega a forma do presente indicativo: "tu coloca". Com "você", seria "você coloque" (subjuntivo). O "tu" é coloquial no imperativo: a forma é a mesma do indicativo presente.',
    }),
    verdadeiroFalso({
      afirmacao: "O imperativo sempre expressa uma ordem agressiva ou rude.",
      verdadeiro: false,
      explicacao:
        'Não. O imperativo é o modo do comando, mas pode ser suave: "Faça um café, por favor", "Veja este filme quando tiver tempo". O tom amável não muda o modo verbal. É imperativo de qualquer jeito, só que polido.',
    }),
    encontreOErro({
      frase: "Tu limpe seu quarto agora mesmo.",
      // Tu(0) limpe(1) seu(2) quarto(3) agora(4) mesmo(5)
      erroIndex: 1,
      explicacao:
        'Com "tu", o imperativo pede o presente do indicativo sem o "s": "tu limpa". "Limpe" é subjuntivo, forma que serve pro "você" ("você limpe"), não pro "tu". Misturar os dois é a armadilha clássica do imperativo.',
    }),
    parear({
      instrucao: "Combine cada frase ao tipo de imperativo ou modo correto",
      pares: [
        { a: "Você faça o dever antes de sair.", b: "Imperativo de você (subjuntivo)" },
        { a: "Tu faz um favor: me empresta o livro.", b: "Imperativo de tu (presente)" },
        {
          a: "Ele estude para não reprovar.",
          b: "Imperativo de 3ª pessoa (subjuntivo, mais formal)",
        },
      ],
      explicacao:
        'O tu pega a forma do presente normal ("faz", não "faça"). Você e ele/ela usam subjuntivo ("faça"). A harmonia é: informal/tu com indicativo; formal/você-ele com subjuntivo no imperativo.',
    }),
    interpretacao({
      texto:
        'O mode imperativo é raro em redação formal, mas essencial em manuais, receitas e instruções. "Misture os ingredientes", "não adicione sal", "deixe descansar por uma hora". A clareza é a marca imperativa. Diferente da redação argumentativa que pede persuasão e engenho, o imperativo é direto: quer ação, não adesão. Quando você vê um imperativo numa redação de prova, cuidado: ele quebra o registro formal a menos que tenha propósito específico (uma carta pessoal, um apelo emocional).',
      pergunta: "Por que o texto avisa cuidado ao usar imperativo em redação de prova?",
      opcoes: [
        "Porque o imperativo é gramaticalmente incorreto",
        "Porque quebra o registro formal e pode parecer agressivo sem propósito",
        "Porque o imperativo é um modo que não existe em português",
      ],
      correta: 1,
      explicacao:
        "Exato. O imperativo é coloquial e direto. Numa redação de ENEM, onde o tom é formal e impessoal, um imperativo soltado do nada soa fora de lugar, quase agressivo. Se você o usa, precisa de um bom motivo (carta pessoal dentro da proposta, apelo ao leitor etc.).",
    }),
    verdadeiroFalso({
      afirmacao:
        'O imperativo negativo ("não fale", "não abra") segue as mesmas regras de formação do imperativo afirmativo.',
      verdadeiro: false,
      explicacao:
        'Não exatamente. O imperativo negativo usa subjuntivo SEMPRE, inclusive com tu: "tu não fales" (subjuntivo), não "tu não fala". O afirmativo com tu é indicativo ("tu fala"), mas o negativo muda pro subjuntivo. É uma troca de modo quando entra o "não".',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa imperativo de forma INCORRETA?",
      opcoes: [
        "Tu escuta bem: isso é importante.",
        "Você escutem agora mesmo.",
        "Tu não faças barulho à noite.",
      ],
      correta: 1,
      explicacao:
        'Em "Você escutem", há mistura de pessoa: "você" é singular, "escutem" é plural (vocês). Além disso, o imperativo de você é "escute", não "escutem". Está gramaticalmente errado na concordância e na forma verbal.',
    }),
    multiplaEscolha({
      pergunta: "Em que contexto faria mais sentido usar imperativo numa redação de ENEM?",
      opcoes: [
        "Na conclusão, para dar um conselho final ao leitor",
        "Na introdução, para afirmar seu ponto de vista",
        "No desenvolvimento, para construir um argumento lógico",
      ],
      correta: 0,
      explicacao:
        'Uma redação pode fechar com um apelo ao leitor: "cuide do ambiente", "leia mais sobre isso". Aquele imperativo final toca e mobiliza. Mas é tático, raro e sempre com propósito claro. Nos demais parágrafos, o tom é impessoal e argumentativo, não imperativo.',
    }),
  ],
});
