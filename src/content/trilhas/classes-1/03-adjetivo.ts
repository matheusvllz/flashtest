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
 * Classes de Palavras I - Lição 03: Adjetivo e locução adjetiva
 */
export const adjetivo = defineLesson({
  id: "classes-1-03-adjetivo",
  titulo: "Adjetivo e locução adjetiva",
  descricao: "A palavra que pinta o substantivo: cores, formas, sensações.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um adjetivo?",
      opcoes: [
        "Uma palavra que modifica ou qualifica o substantivo",
        "Um tipo de verbo no passado",
        "Um nome de sentimentos",
      ],
      correta: 0,
      explicacao:
        'Adjetivo é aquele pintor de palavras que chega e faz "olha só, esse livro é azul, grande, cheio de histórias". Ele caracteriza o substantivo.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O adjetivo "qualquer" pode vir antes ou depois do substantivo, mudando o sentido.',
      verdadeiro: true,
      explicacao:
        'Em "qualquer pessoa" é vago, impessoal. Em "pessoa qualquer" é até um pouco desprezo. O lugar do adjetivo muda a cor da frase.',
    }),
    parear({
      instrucao: "Identifique se é adjetivo simples ou locução adjetiva",
      pares: [
        { a: "Temos um trabalho cansativo.", b: "Adjetivo simples" },
        { a: "Temos um trabalho de muito cansaço.", b: "Locução adjetiva" },
      ],
      explicacao:
        "Adjetivo simples é uma palavra só (cansativo, urbana). Locução adjetiva é um grupo de palavras com sentido adjetivo (de muito cansaço, de gente).",
    }),
    completeLacuna({
      frase: "A redação ___ que enviei conquistou a banca avaliadora.",
      opcoes: ["bem-estruturada", "estruturado", "com estrutura"],
      correta: 0,
      explicacao:
        'Bem-estruturada é um adjetivo (composto) que combina com "redação" (feminino, singular). Estruturado é masculino. Com estrutura vira nome, não adjetivo.',
    }),
    encontreOErro({
      frase: "Os documentos importante chegaram ontem na secretaria.",
      erroIndex: 2,
      explicacao:
        'Importante deveria ser "importantes" para concordar em número com "documentos" (plural). Adjetivo tem que dançar junto com o substantivo.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa o adjetivo de forma mais precisa e elegante?",
      opcoes: [
        "A menina triste estava sentada",
        "A menina de tristeza estava sentada",
        "A tristeza menina estava sentada",
      ],
      correta: 0,
      explicacao:
        'A opção A usa um adjetivo direto e claro. A opção B virou um nome, perdendo elegância. A opção C está errada porque "tristeza" é substantivo, não adjetivo: não dá pra grudar um nome direto na frente de outro sem preposição.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Um adjetivo que quer dizer "cheio de", "que tem", ou "que vem de" pode ser substituído por uma locução adjetiva.',
      verdadeiro: true,
      explicacao:
        "Vaidoso = cheio de vaidade. Pátrio = da pátria. Selvagem = da selva. A língua oferece dois caminhos, e os dois são corretos.",
    }),
    completeLacuna({
      frase: "Aquele artista tem uma sensibilidade ___.",
      opcoes: ["extraordinária", "extraordinário", "extraordinariamente"],
      correta: 0,
      explicacao:
        'Extraordinária concorda com "sensibilidade" (feminino). Extraordinário é masculino. Extraordinariamente é advérbio, modifica o verbo, não o nome.',
    }),
    interpretacao({
      texto:
        'Adjetivos fracos matam a sua redação. Se você escreve "o problema é muito grande", o leitor bate o olho e vira de página. Mas se você escreve "o problema é monumental", "calamitoso", "descomunal", aí sim a mente do leitor acorda. No ENEM, escolher adjetivos específicos e bem colocados é um dos segredos para sair de 600 para 800 pontos. Isso vale para adjetivos simples (bom, lindo, ruim) e para locuções adjetivas (de importância vital, de relevância inegável).',
      pergunta:
        "Segundo o texto, o que diferencia uma redação fraca de uma redação forte em relação aos adjetivos?",
      opcoes: [
        "A quantidade de adjetivos usados",
        "A escolha de adjetivos específicos em vez de genéricos",
        "O tamanho das palavras adjetivas",
      ],
      correta: 1,
      explicacao:
        "O texto fala que adjetivos fracos (muito grande) não impressionam, mas adjetivos específicos (monumental, calamitoso) elevam a qualidade. É sobre ESCOLHA, não quantidade.",
    }),
  ],
});
