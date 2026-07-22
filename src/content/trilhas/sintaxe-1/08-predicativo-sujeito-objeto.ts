import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 08: Predicativo do sujeito e do objeto
 */
export const predicativoSujeitoObjeto = defineLesson({
  id: "sintaxe-1-08-predicativo-sujeito-objeto",
  titulo: "Predicativo do sujeito e do objeto",
  descricao: "Qualidades que integram a estrutura de predicado nominal e verbo-nominal.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é predicativo do sujeito?",
      opcoes: [
        "Uma qualidade que descreve ação do sujeito",
        "Uma qualidade ou estado que caracteriza o sujeito através de verbo de ligação",
        "Um objeto indireto que acompanha o verbo",
      ],
      correta: 1,
      explicacao:
        'Predicativo do sujeito liga o sujeito a uma qualidade via verbo de ligação. Em "Ela é bonita", bonita qualifica ela. É estrutura de caracterização, não ação.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem predicativo do sujeito?",
      opcoes: [
        "O gato corria veloz no jardim.",
        "O gato é veloz e ágil.",
        "O gato comeu velozmente a comida.",
      ],
      correta: 1,
      explicacao:
        'Em "é veloz", veloz é predicativo do sujeito: liga à qualidade via "ser" (verbo de ligação). Os outros têm "veloz" como adjunto adverbial (qualifica ação, não estado).',
    }),
    verdadeiroFalso({
      afirmacao: "Predicativo do objeto só aparece com verbos transitivos.",
      verdadeiro: true,
      explicacao:
        'Verdadeiro. Predicativo do objeto qualifica o objeto direto de um verbo transitivo, geralmente verbo de movimento ou transformação: "Achei a prova difícil", "Elegeram-o presidente".',
    }),
    completeLacuna({
      frase:
        'Em "Encontrei a sala vazia", "vazia" é predicativo ___ porque qualifica o objeto direto "a sala".',
      opcoes: ["do objeto", "do sujeito", "adnominal"],
      correta: 0,
      explicacao:
        'Vazia qualifica "sala" (objeto direto), integrando a estrutura do verbo "encontrar". Não é adjunto (que seria "encontrei-a em toda sua vaidade"), é núcleo de sentido.',
    }),
    encontreOErro({
      frase: "O médico declarou os pacientes recuperados e tranquilo.",
      erroIndex: 7,
      explicacao:
        'Os predicativos do objeto concordam em gênero e número com o termo que qualificam. "Os pacientes" está no plural, então o certo é "tranquilos", não "tranquilo". Os dois lados da estrutura precisam combinar.',
    }),
    parear({
      instrucao: "Relacione cada frase com o tipo de predicativo",
      pares: [
        { a: "Maria é inteligente.", b: "Predicativo do sujeito" },
        { a: "Achei Maria inteligente.", b: "Predicativo do objeto" },
        { a: "Maria comporta-se inteligentemente.", b: "Adjunto adverbial" },
      ],
      explicacao:
        "Sujeito: qualidade via verbo de ligação. Objeto: qualidade que caracteriza o OD. Adjunto: apenas modifica a ação (advérbio), não estrutura predicado.",
    }),
    verdadeiroFalso({
      afirmacao: "Predicativo pode ser um nome ou um adjetivo.",
      verdadeiro: true,
      explicacao:
        'Verdadeiro. "Ela é professora" (nome predicativo). "Ela é dedicada" (adjetivo). Os dois estruturam predicado, ligando qualidade ao sujeito ou objeto.',
    }),
    interpretacao({
      texto:
        'Predicativo revela caráter. Quando um redator escreve "A multidão, irritada, invadiu a rua" em vez de "A multidão invadiu irritada a rua", escolhe revelar o estado ANTES da ação. Escolhe estrutura de verbo-nominal que mescla caracterização e movimento. É ferramenta de ritmo: predicativo do sujeito em verbo de ligação cria pausa contemplativa; predicativo do objeto em verbo de ação tira suspense. Tudo estrutura.',
      pergunta:
        'Conforme o texto, qual é a diferença rítmica entre "irritada" em posições diferentes?',
      opcoes: [
        "Antes da ação, contemplação; dentro dela, suspense",
        "A ordem não altera o ritmo, só a clareza",
        "Irritada é sempre advérbio, nunca predicativo",
      ],
      correta: 0,
      explicacao:
        "O texto deixa claro: posição molda timing. Predicativo antes cria pausa; dentro da ação, tira suspense. Estrutura é respiração, é orquestração.",
    }),
  ],
});
