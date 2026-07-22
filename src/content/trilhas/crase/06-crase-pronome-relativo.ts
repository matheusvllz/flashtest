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
 * Lição 06: Crase e pronome relativo.
 * A qual vs ao qual, crase com "qual" e seus derivados.
 */
export const crasePronomeRelativo = defineLesson({
  id: "crase-06-crase-pronome-relativo",
  titulo: "Crase e pronome relativo",
  descricao: '"À qual", "ao qual": como a crase interage com relativos.',
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual é a diferença correta entre "ao qual" (masculino) e "à qual" (feminino)?',
      opcoes: [
        'A qual traz crase porque há preposição "a" + artigo feminino; ao qual tem preposição "a" + artigo masculino',
        "São completamente iguais em significado e gramaticais",
        "Ao qual é mais formal que à qual",
      ],
      correta: 0,
      explicacao:
        'A crase aparece em "à qual" porque há preposição "a" + artigo feminino "a". Em "ao qual", a contração é "a" + "o", não há crase, é só contração simples. O pronome relativo "qual" pode vir com artigo masculino ou feminino conforme o antecedente.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Se a frase anterior é "Refiro-me à mulher", então a oração relativa seria "à qual conheci ontem", com crase obrigatória.',
      verdadeiro: true,
      explicacao:
        'Sim. O pronome relativo "qual" carrega consigo um artigo que concorda com o antecedente. Se o antecedente é feminino (mulher), vem "à qual". A preposição "a" (de referir-se a) + artigo feminino de "qual" = crase obrigatória.',
    }),
    completeLacuna({
      frase: "A questão___ me refiro é complicada e exige reflexão profunda.",
      opcoes: ["a qual", "à qual"],
      correta: 1,
      explicacao:
        'O pronome relativo "qual" concorda com seu antecedente (questão = feminino). Como há preposição "a" (referir-se a algo) + artigo feminino de "qual", forma-se crase: "à qual". A crase vem do encontro da preposição com o artigo do pronome relativo.',
    }),
    multiplaEscolha({
      pergunta: "Em qual frase a crase está INCORRETA com um pronome relativo?",
      opcoes: [
        "Esse é o projeto ao qual dediquei meu tempo.",
        "Essa é a meta à qual aspiro com toda a força.",
        "Esses são os amigos ao qual confio meus segredos.",
      ],
      correta: 2,
      explicacao:
        'Em "ao qual" (opção 2), o antecedente é "amigos" (masculino plural), mas o pronome relativo vem em número singular "qual", o que é incoerência também. O correto seria "aos quais" (preposição "a" + artigo "os"). Na verdade, há duplo erro: falta o plural.',
    }),
    parear({
      instrucao: "Combine cada frase relativa com a forma correta de crase",
      pares: [
        {
          a: "O livro ___ li com interesse...",
          b: "ao qual (preposição a + artigo masculino)",
        },
        {
          a: "A história ___ refiro é memorável...",
          b: "à qual (preposição a + artigo feminino)",
        },
        {
          a: "Os alunos ___ entreguei a tarefa...",
          b: "aos quais (preposição a + artigo masculino plural)",
        },
      ],
      explicacao:
        'O pronome relativo "qual" carrega consigo um artigo que concorda sempre com o antecedente em número e gênero. A crase só aparece se o antecedente é feminino singular.',
    }),
    encontreOErro({
      frase: "A professora a qual tenho tanto respeito trabalha naquela escola.",
      // Tokenização: A(0) professora(1) a(2) qual(3) tenho(4) tanto(5) respeito(6) trabalha(7) naquela(8) escola(9)
      // "Professora" é feminino. O verbo "ter respeito a" exige preposição "a".
      // Logo, preposição "a" + artigo feminino de "qual" = crase "à qual"
      // Deveria ser "à qual". Erro em "a(2)"
      erroIndex: 2,
      explicacao:
        'O pronome relativo "qual" carrega artigo feminino porque seu antecedente é "professora" (feminino). Com a preposição "a" (de ter respeito a), forma-se crase: "à qual". O correto é "A professora à qual tenho tanto respeito". Faltou a contração no pronome relativo.',
    }),
    interpretacao({
      texto:
        'Os pronomes relativos criam um desafio especial com crase porque trazem consigo um artigo que se adapta ao antecedente. "Qual" é um pronome especial: ele carrega um artigo que muda conforme o antecedente exija (ao qual para masculino, à qual para feminino). Quando há uma preposição "a" na regência do verbo anterior e o antecedente é feminino, o encontro de preposição + artigo feminino do relativo produz crase. Por isso frases como "A mulher com a qual conversei" usam "com qual" (sem crase, porque "com" é preposição diferente), mas "A mulher à qual me refiro" usa crase (porque há preposição "a").',
      pergunta: 'Por que em "à qual" aparece crase?',
      opcoes: [
        'Porque há preposição "a" exigida pelo verbo + artigo feminino que o pronome "qual" carrega',
        "Porque todo pronome relativo naturalmente recebe crase",
        'Porque "qual" é uma palavra que exige crase sempre',
      ],
      correta: 0,
      explicacao:
        'A crase no pronome relativo segue a mesma lógica de sempre: preposição "a" + artigo feminino = fusão. O pronome relativo não é exceção; ele só participa da regra geral porque traz consigo um artigo que concorda com o antecedente.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "A lei à qual obedeço" há crase porque "lei" é feminino e há preposição "a" no verbo obedecer.',
      verdadeiro: true,
      explicacao:
        'Correto. "Obedecer a" exige preposição "a". "Lei" é feminino, logo o pronome relativo traz artigo feminino. Preposição "a" + artigo feminino de "qual" = crase "à qual". A construção está correta.',
    }),
    encontreOErro({
      frase: "Essas são as metas ao qual o projeto se dedica inteiramente.",
      // Tokenização: Essas(0) são(1) as(2) metas(3) ao(4) qual(5) o(6) projeto(7) se(8) dedica(9) inteiramente(10)
      // "Metas" é feminino plural. O pronome relativo deveria concordar em número e gênero.
      // Deveria ser "às quais" (preposição "a" + artigo feminino "as")
      // Não apenas "ao qual" (que é masculino singular)
      // Aqui há erro de concordância E de crase.
      // erroIndex: pode ser "ao(4)" que deveria ser "às"
      erroIndex: 4,
      explicacao:
        'Duplicação de erro aqui: "metas" é feminino PLURAL, logo o pronome relativo deve vir em plural "quais" com artigo feminino "as". A preposição "a" (de dedica a) + artigo feminino plural = "às quais". O correto é "Essas são as metas às quais o projeto se dedica". Faltou concordar em número e gênero.',
    }),
  ],
});
