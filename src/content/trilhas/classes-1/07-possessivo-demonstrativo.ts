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
 * Classes de Palavras I - Lição 07: Possessivos e demonstrativos (este/esse/aquele)
 */
export const possessivoWDemonstrativo = defineLesson({
  id: "classes-1-07-possessivo-demonstrativo",
  titulo: "Possessivos e demonstrativos",
  descricao: "Meu, seu, este, esse: as palavras que mostram pertença e posição.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um pronome possessivo?",
      opcoes: [
        "Uma palavra que indica posse ou pertencimento",
        "Um nome de um objeto que pertence a alguém",
        "Um advérbio que localiza algo no espaço",
      ],
      correta: 0,
      explicacao:
        "Possessivo marca quem dono: meu livro (meu é de mim), seu carro (seu é de você), nosso time (nosso é de nós). Pertença pura.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Os pronomes demonstrativos (este, esse, aquele) indicam a distância de quem fala.",
      verdadeiro: true,
      explicacao:
        "Este é perto de mim. Esse é perto de você ou neutro. Aquele é longe dos dois. Distância no espaço, no tempo, até no conceito.",
    }),
    parear({
      instrucao: "Combine cada pronome com sua função",
      pares: [
        { a: "Este livro aqui é meu.", b: "Demonstrativo (perto)" },
        { a: "Esse carro aí é bonito.", b: "Demonstrativo (médio)" },
        { a: "Aquele prédio lá é histórico.", b: "Demonstrativo (longe)" },
        { a: "Minha redação foi aprovada.", b: "Possessivo" },
      ],
      explicacao:
        "Este/esse/aquele localizam no espaço. Meu/seu/nosso indicam posse. Ambos são pronomes, mas papéis diferentes.",
    }),
    completeLacuna({
      frase: "Este livro que estou lendo é ___ e muito bom.",
      opcoes: ["meu", "seu", "nosso"],
      correta: 0,
      explicacao:
        'Meu é o possessivo que combina com quem fala. Já que "este" aponta que o livro está perto de mim, faz sentido que também seja meu. Seu seria de você, nosso seria de nós.',
    }),
    encontreOErro({
      frase: "Aqueles alunas deixaram suas mochilas na sala.",
      erroIndex: 0,
      explicacao:
        'Aquelas (feminino plural) é o certo, combinando com "alunas". Aqueles é masculino ou misto. Pronome demonstrativo tem que concordar em gênero e número.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa corretamente possessivos e demonstrativos juntos?",
      opcoes: [
        "Este seu livro é meu livro.",
        "Esse seu tempo é precioso.",
        "Aquele meu amigo aquele é legal.",
      ],
      correta: 1,
      explicacao:
        'A opção B combina bem: "esse seu tempo" (demonstrativo + possessivo). A opção A redunda ("este seu livro é meu livro"). A opção C repete "aquele".',
    }),
    verdadeiroFalso({
      afirmacao:
        'Os pronomes demonstrativos também podem marcar tempo, não só espaço: "naquele tempo", "neste momento".',
      verdadeiro: true,
      explicacao:
        "Demonstrativo no tempo: este momento (presente), esse tempo (passado próximo), aquele tempo (passado distante). A língua é criativa assim.",
    }),
    completeLacuna({
      frase: "Entre ___ duas opções, escolha a que mais combina com o seu gosto.",
      opcoes: ["estas", "essas", "aquelas"],
      correta: 0,
      explicacao:
        "Estas marca o que está perto de quem fala, como as duas opções que estão bem aqui, diante de você. Essas seria mais neutro, aquelas indicaria opções distantes.",
    }),
    interpretacao({
      texto:
        'Confundir "esse" com "este" é armadilha clássica. Na redação do ENEM, quando você retoma uma ideia já mencionada, use "esse" ou "aquele": "O acesso à educação é fundamental. Esse direito é universal." Não diga "Este direito", porque "este" sugere novidade. A confusão entre possessivo e demonstrativo também atrapalha: "nesse seu argumento" vs "neste meu exemplo". Saiba exatamente a quem pertence e a que distância fica.',
      pergunta: 'Por que é importante distinguir "este" e "esse" em uma redação?',
      opcoes: [
        "Porque significam a mesma coisa em contextos diferentes",
        'Porque "este" marca novidade e "esse" marca retomada',
        "Porque um é singular e outro é plural",
      ],
      correta: 1,
      explicacao:
        'O texto esclarece: "este" para o novo, "esse" para retomar o já mencionado. A confusão prejudica a fluidez da argumentação.',
    }),
  ],
});
