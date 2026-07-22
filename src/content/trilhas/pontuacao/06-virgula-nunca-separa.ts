import {
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 06: O que a vírgula NUNCA separa
 */
export const virgulaNuncaSepara = defineLesson({
  id: "pontuacao-06-nunca-separa",
  titulo: "O que a vírgula NUNCA separa",
  descricao:
    "Erros clássicos: onde a vírgula é proibida (sujeito/verbo, verbo/complemento, nome/adjunto).",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Você pode colocar vírgula entre o sujeito e o verbo de uma frase.",
      verdadeiro: false,
      explicacao:
        'Nunca. "O menino, correu" é um erro grave. Sujeito e verbo são inseparáveis na frase: formam o núcleo. Vírgula entre eles é dor no meu coração.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem um erro de vírgula?",
      opcoes: [
        "Meu primo que mora em São Paulo, chegou ontem.",
        "Meu primo, que mora em São Paulo, chegou ontem.",
        "Nenhuma, as duas estão corretas.",
      ],
      correta: 0,
      explicacao:
        'Na primeira frase, a vírgula vem só depois de "Paulo", separando o verbo do resto. Errado. A segunda está certa: o aposto inteiro ("que mora em São Paulo") vem entre vírgulas.',
    }),
    encontreOErro({
      frase: "Os alunos entusiasmados, ficaram em pé aplaudindo o professor.",
      erroIndex: 2,
      explicacao:
        'A vírgula depois de "entusiasmados" está separando o sujeito do verbo. O correto é "Os alunos entusiasmados ficaram em pé aplaudindo o professor." O adjetivo "entusiasmados" faz parte do sujeito, não se separa.',
    }),
    verdadeiroFalso({
      afirmacao: "A vírgula pode separar o verbo de seu complemento direto.",
      verdadeiro: false,
      explicacao:
        'Nunca. "Ele comprou, um livro" é errado. Verbo e complemento são um par inseparável. Quem compra precisa de algo comprado bem ali depois.',
    }),
    encontreOErro({
      frase: "Ela gosta, de ler livros à noite antes de dormir.",
      erroIndex: 1,
      explicacao:
        'A vírgula está separando o verbo "gosta" de seu complemento "de ler livros". Proibido. Deveria ser "Ela gosta de ler livros..." sem vírgula após "gosta".',
    }),
    multiplaEscolha({
      pergunta: "Qual dessas frases está pontuada corretamente?",
      opcoes: [
        "O professor de português, é muito exigente com a norma culta.",
        "O professor de português é muito exigente com a norma culta.",
        "Ambas estão corretas.",
      ],
      correta: 1,
      explicacao:
        'Na primeira, há uma vírgula separando o sujeito ("o professor de português") do verbo ("é"). Proibido. O nome e seu adjunto "de português" não se separam do verbo por vírgula.',
    }),
    encontreOErro({
      frase: "Os alunos da turma inteira, prestaram atenção na explicação final.",
      erroIndex: 4,
      explicacao:
        'A vírgula está separando o sujeito composto ("Os alunos da turma inteira") do verbo ("prestaram"). Errado. Sujeito inteiro, sem pausa com vírgula, depois o verbo.',
    }),
    interpretacao({
      texto:
        "A vírgula é sinal de pausa, mas nem toda pausa na leitura vira vírgula. Especialmente sujeito, verbo e complemento direto formam uma unidade que a vírgula não pode quebrar. Quando você sente a tentação de colocar vírgula antes do verbo, pergunte: o que vem antes é REALMENTE o sujeito ou é um termo que vem depois do sujeito? Se o dúvida vier, leia a frase em voz alta. Se você NÃO faria pausa natural ali, não coloque vírgula.",
      pergunta: "Segundo o texto, o que fazer antes de colocar uma vírgula perto do verbo?",
      opcoes: [
        "Ignorar a sensação de pausa",
        "Verificar se há pausa natural na leitura em voz alta",
        "Colocar vírgula em todos os verbos para garantir",
      ],
      correta: 1,
      explicacao:
        "A leitura em voz alta é seu melhor guia. Se você naturalmente não faria pausa antes do verbo, a vírgula ali é erro.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Você pode separar um nome de seu adjunto adnominal (aquele adjunto que qualifica o nome) com uma vírgula quando quiser.",
      verdadeiro: false,
      explicacao:
        'Não. "O livro, de contos" está errado. O adjunto "de contos" é parte inseparável do nome "livro". Vírgula ali quebra a unidade.',
    }),
  ],
});
