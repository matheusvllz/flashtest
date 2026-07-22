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
 * Lição 01 da trilha de Concordância: concordância verbal com sujeito simples e composto.
 */
export const concordanciaVerbalSimplesComposto = defineLesson({
  id: "concordancia-01-verbal-simples-composto",
  titulo: "Concordância verbal com sujeito simples e composto",
  descricao: "O verbo concorda com o número e pessoa do sujeito.",
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        'Em "O aluno estuda muito", o verbo "estuda" concorda com o sujeito "aluno" em número e pessoa.',
      verdadeiro: true,
      explicacao:
        'Sujeito singular requer verbo singular. "O aluno" é um, "estuda" também é um. Essa harmonia é a concordância.',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa tem concordância verbal correta?",
      opcoes: [
        "Os meninos gostam de jogar bola.",
        "Os meninos gosta de jogar bola.",
        "Os menino gostam de jogar bola.",
      ],
      correta: 0,
      explicacao:
        'Sujeito plural "meninos" exige verbo plural "gostam". Quando o verbo e o sujeito dançam juntos em número, a frase soa certa ao ouvido.',
    }),
    completeLacuna({
      frase: "O professor e a aluna ___ a resposta correta.",
      opcoes: ["sabem", "sabe"],
      correta: 0,
      explicacao:
        'Com sujeito composto (professor E aluna), o verbo vai para o plural "sabem". Dois sujeitos juntos pelo "e" viram uma turma só.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem erro de concordância?",
      opcoes: ["Eu e você somos amigos.", "Ele e ela é uma dupla perfeita.", "Eles viajam juntos."],
      correta: 1,
      explicacao:
        'Sujeito composto sempre exige verbo plural. "Ele e ela" são DOIS, então o verbo é "são", não "é". Parece sutileza, mas é lei de concordância que rege toda frase certinha.',
    }),
    encontreOErro({
      frase: "A mãe e a filha chegou cansadas da viagem.",
      erroIndex: 5,
      explicacao:
        'Aqui temos sujeito composto: "mãe E filha" são duas pessoas. O verbo "chegou" erra porque deveria ser "chegaram" (plural). Sujeito composto = verbo plural, sem exceção.',
    }),
    parear({
      instrucao: "Combine cada sujeito com a forma verbal correta",
      pares: [
        { a: "A criança", b: "chora muito à noite" },
        { a: "As crianças", b: "choram muito à noite" },
        { a: "O carro e o ônibus", b: "saem do estacionamento todos os dias" },
      ],
      explicacao:
        "Sujeito singular com verbo singular, sujeito plural com verbo plural. É o jeito de o português exigir que sujeito e verbo andem de mãos dadas.",
    }),
    ordenar({
      blocos: ["Os candidatos", "aguardavam", "ansiosos", "o resultado do exame."],
      explicacao:
        'Sujeito plural "candidatos" com verbo plural "aguardavam". A ordem responde que a multidão era a que esperava, e isto é concordância bem-feita.',
    }),
    interpretacao({
      texto:
        'A concordância verbal é o acordo entre sujeito e verbo. Quando o sujeito é singular, o verbo também é singular: "O aluno corre." Quando o sujeito é plural, o verbo é plural: "Os alunos correm." Há um caso especial: quando dois sujeitos se unem pelo "e", o verbo vai para o plural: "João e Maria correm." Essa regra vale sempre, mesmo que haja vírgula entre os sujeitos.',
      pergunta: "Segundo o texto, quando o verbo vai para o plural?",
      opcoes: [
        "Quando o sujeito é singular",
        'Quando o sujeito é plural ou quando dois sujeitos se unem pelo "e"',
        "Sempre que há uma pausa na frase",
      ],
      correta: 1,
      explicacao:
        'O texto ensina duas situações de plural: sujeito plural direto OU dois sujeitos unidos pelo "e". Ambas exigem que o verbo respeite essa multiplicidade.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Meu avó, meu pai e eu vamos viajar", o verbo está no plural porque há sujeito composto.',
      verdadeiro: true,
      explicacao:
        'Sujeito composto "avó, pai e eu" são três pessoas unidas pelo "e", então o verbo é plural "vamos". Quem abre o "e" fecha com plural.',
    }),
  ],
});
