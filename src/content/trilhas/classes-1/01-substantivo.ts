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
 * Classes de Palavras I - Lição 01: Substantivo
 */
export const substantivo = defineLesson({
  id: "classes-1-01-substantivo",
  titulo: "Substantivo",
  descricao: "A palavra que nomeia tudo: seres, objetos, sentimentos, ideias.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Substantivo é a palavra que nomeia seres, coisas, sentimentos e conceitos.",
      verdadeiro: true,
      explicacao:
        "Isso mesmo: João, mesa, alegria, liberdade. Se dá nome para algo que existe (ou a gente imagina que existe), é substantivo.",
    }),
    multiplaEscolha({
      pergunta: "Qual palavra abaixo NÃO é um substantivo?",
      opcoes: ["Coragem", "Rapidamente", "Professora", "Livro"],
      correta: 1,
      explicacao:
        "Rapidamente é um advérbio, modifica o verbo. Coragem, professora e livro são substantivos porque nomeiam seres e coisas.",
    }),
    parear({
      instrucao: "Classifique cada substantivo por seu tipo",
      pares: [
        { a: "João", b: "Concreto" },
        { a: "Democracia", b: "Abstrato" },
        { a: "Brasil", b: "Próprio" },
        { a: "Menino", b: "Comum" },
      ],
      explicacao:
        "Próprio tem maiúscula (João, Brasil); comum é genérico (menino, país). Concreto se toca (mesa, cachorro); abstrato é puro sentimento ou ideia (amor, democracia).",
    }),
    completeLacuna({
      frase: "A ___ da cidade cresceu muito nos últimos anos.",
      opcoes: ["população", "colorido", "rapidamente"],
      correta: 0,
      explicacao:
        "População é um substantivo que faz sentido no vazio deixado. Colorido é adjetivo, rapidamente é advérbio: nenhum dos dois completa um nome vazio.",
    }),
    encontreOErro({
      frase: "Os livro estão organizados na estante da biblioteca.",
      erroIndex: 1,
      explicacao:
        'Livro devia estar no plural: livros. Ele precisa concordar com "Os" e com o verbo "estão", que já avisaram que são vários. Substantivo tem que combinar com quem o cerca.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual frase tem um substantivo flexionado corretamente em número (singular/plural)?",
      opcoes: [
        "As três professora ensinaram bem.",
        "Os alunos estudaram a lições.",
        "A menina brincou com os brinquedos.",
      ],
      correta: 2,
      explicacao:
        'Na opção C, "menina" (singular) e "brinquedos" (plural) combinam bem com seus determinantes (a, os). Nas outras, há desacordo: professora deveria ser professoras, lições deveria ser lição.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O substantivo "óculos" não tem uma forma no singular usada no dia a dia: ele já nasce no plural.',
      verdadeiro: true,
      explicacao:
        "Óculos, parabéns e férias são assim: mesmo falando de uma coisa só, a gente usa no plural. Chamamos isso de substantivo que só existe no plural, e a língua não erra por isso.",
    }),
    completeLacuna({
      frase: "A ___ da música clássica é incomparável.",
      opcoes: ["beleza", "belo", "embelezar"],
      correta: 0,
      explicacao:
        "Beleza é um substantivo abstrato que completa a frase. Belo é adjetivo, embelezar é verbo: nenhum deles funciona aí com a mesma naturalidade.",
    }),
    interpretacao({
      texto:
        'O substantivo é a base do nome. Cada coisa no mundo tem um rótulo, um nome que a gente reconhece: pessoa, lugar, objeto, sentimento, ideia. Quando o ENEM pede para você reescrever uma frase melhorando a clareza, muitas vezes o segredo está em trocar um verbo ou adjetivo vago por um substantivo específico. Exemplo: em vez de "O atleta corria muito", diga "A corrida do atleta era intensa".',
      pergunta:
        "Segundo o texto, qual é a vantagem de usar um substantivo específico em vez de um verbo ou adjetivo vago?",
      opcoes: [
        "Economiza palavras na frase",
        "Aumenta a clareza e a precisão do texto",
        "Faz a frase soar mais formal",
      ],
      correta: 1,
      explicacao:
        'O texto fala que substituir verbo/adjetivo vago por um substantivo específico melhora a clareza. "Corrida intensa" é mais visual e preciso do que "correr muito".',
    }),
  ],
});
