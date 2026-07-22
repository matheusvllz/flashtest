import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
  ordenar,
} from "@/lib/lessons/define";

export const divisaoSilabica = defineLesson({
  id: "fonologia-ortografia-04-divisao-silabica",
  titulo: "Divisão silábica",
  descricao: "As regras para separar as sílabas de uma palavra corretamente.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual é a silabação correta de "telefone"?',
      opcoes: ["Te-le-fo-ne", "Tel-e-fone", "Tele-fone"],
      correta: 0,
      explicacao:
        "Te-le-fo-ne. Cada sílaba precisa de uma vogal. E consoante isolada entre duas vogais vai pra sílaba seguinte: L entre E e E vai pro segundo E.",
    }),
    multiplaEscolha({
      pergunta: 'Como se divide "psicologia"?',
      opcoes: ["Psi-co-lo-gia", "P-si-co-lo-gia", "Psi-cologia"],
      correta: 0,
      explicacao:
        "Psi-co-lo-gia. PS é um encontro consonantal de início de palavra, e encontro consonantal nunca se separa: ele viaja inteiro grudado na vogal seguinte. Por isso PSI é uma sílaba só, não PI-SI.",
    }),
    parear({
      pares: [
        { a: "Consoante isolada entre vogais", b: "Vai pra sílaba seguinte" },
        { a: "Encontro consonantal", b: "Nunca se separa, viaja inteiro" },
        { a: "Dígrafo separável (RR, SS)", b: "Primeiro símbolo fica, segundo vai" },
      ],
      explicacao:
        "Ca-sa (S isolado vai pro A). Pra-to (PR viaja junto). Car-ro (primeiro R fica, segundo vai). Essas três regras cobrem 95% das divisões.",
    }),
    verdadeiroFalso({
      afirmacao:
        'A palavra "abstrair" se divide como "abs-tra-ir" porque AB é um encontro consonantal.',
      verdadeiro: false,
      explicacao:
        'Não. "Abstrair" é ABS-TRAIR porque o S fica com AB (consoante antes de encontro consonantal vai com a sílaba anterior). AB é consoante simples, não encontro.',
    }),
    encontreOErro({
      frase:
        'A palavra "telefone" divide-se em "te-lef-one", respeitando o padrão consoante-vogal.',
      erroIndex: 5,
      explicacao:
        'Contando: A(0) palavra(1) "telefone"(2) divide-se(3) em(4) "te-lef-one",(5) respeitando(6) o(7) padrão(8) consoante-vogal.(9). O erro está em "te-lef-one": consoante isolada entre vogais vai pra sílaba seguinte, então o certo é "te-le-fo-ne". Toque em "te-lef-one".',
    }),
    completeLacuna({
      frase:
        'Em "professor", o SS é dígrafo e se divide na escrita, então a divisão é pro-fes-___ .',
      opcoes: ["sor", "ssor", "or"],
      correta: 0,
      explicacao:
        'Pro-fes-sor. O SS é dígrafo e se divide na escrita: o primeiro S fecha "fes" e o segundo abre a sílaba seguinte. Por isso a lacuna completa com "sor", não "ssor" (dobraria o S à toa) nem "or" (perderia o S).',
    }),
    ordenar({
      blocos: ["Pa", "ra", "dig", "ma"],
      explicacao:
        "Pa-ra-dig-ma. Cada bloco termina em vogal ou em consoante+vogal. Não existe sílaba vazia ou sem vogal em português.",
    }),
    interpretacao({
      texto:
        "A separação de sílabas segue regras precisas que não são apenas ortográficas, mas fonéticas. Uma consoante isolada entre duas vogais vai sempre para a sílaba seguinte porque em português cada sílaba deve começar com uma vogal ou consoante + vogal. Dígrafos separáveis como RR dividem-se porque representam sons distintos na pronúncia: o primeiro R pertence à sílaba anterior e o segundo à sílaba seguinte.",
      pergunta: "Por que uma consoante isolada entre vogais vai para a sílaba seguinte?",
      opcoes: [
        "Porque é mais fácil de pronunciar assim",
        "Porque cada sílaba em português precisa de padrão C+V ou V",
        "Porque a regra é arbitrária e histórica",
      ],
      correta: 1,
      explicacao:
        "Exato. Em português, sílaba sem vogal é fantasma. Uma consoante sozinha não faz som de sílaba, então ela busca a vogal seguinte. Isso não é capricho, é fono-lógica pura.",
    }),
  ],
});
