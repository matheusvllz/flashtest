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
 * Lição 08 da trilha de Concordância: anexo, obrigado, meio, bastante.
 */
export const anexoObrigadoMeioBastante = defineLesson({
  id: "concordancia-08-anexo-obrigado-meio-bastante",
  titulo: "Anexo, obrigado, meio, bastante",
  descricao: "Palavras que às vezes concordam e às vezes não.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual é a regra para "anexo"?',
      opcoes: [
        "Sempre invariável; nunca muda",
        "Sempre concorda com o nome, como um adjetivo normal",
        "Pode variar ou ficar invariável, conforme o uso como adjetivo ou advérbio",
      ],
      correta: 2,
      explicacao:
        'Anexo é volúvel: adjetivo quando significa "junto a" e concorda ("Cartas anexas ao processo"), mas pode ficar invariável como advérbio ("Envio anexo os documentos"). Em redação de ENEM, prefira fazer concordar: "anexas".',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Obrigado, menina!", a palavra "obrigado" concorda com "menina" porque ambas são feminino.',
      verdadeiro: false,
      explicacao:
        'Não: "obrigado" é uma forma fixa (masculino singular) que vem de "sou obrigado" subentendido. Quem fala usa "obrigado" (mesmo se for mulher). Apenas em textos muito formais, uma mulher pode dizer "obrigada", mas é raro.',
    }),
    multiplaEscolha({
      pergunta: 'Qual frase usa "obrigado" corretamente?',
      opcoes: [
        "Obrigada pela ajuda, menina!",
        "Obrigado pela ajuda, menina!",
        "Obrigadas pela ajuda, menina!",
      ],
      correta: 1,
      explicacao:
        '"Obrigado" é invariável na maioria dos casos. Significa "sou obrigado" e fica no masculino singular. Mulheres podem dizer "obrigada" em contextos muito formais, mas "obrigado" é universal.',
    }),
    completeLacuna({
      frase: "A sala estava ___ cheia de gente no primeiro dia de aula.",
      opcoes: ["meio", "meia", "meios"],
      correta: 0,
      explicacao:
        'Quando "meio" quer dizer "aproximadamente" (advérbio), fica invariável: "meio cheia". Se fosse "uma meia garrafa" (noun + adjetivo), aí seria "meia" (concordância). Aqui é advérbio, então fica singular.',
    }),
    encontreOErro({
      frase: "Os documentos anexo ao processo foram analisados pelo juiz.",
      erroIndex: 2,
      explicacao:
        'Aqui "anexo" funciona como adjetivo (significa "ligado a", "que acompanha") e deveria concordar: "anexos" (plural masculino para "documentos"). Adjetivo que não concorda me tira do sério.',
    }),
    parear({
      instrucao: "Combine cada palavra com sua natureza nesta frase",
      pares: [
        {
          a: "Bastante gente chegou cedo.",
          b: 'Bastante = adjetivo, concorda com "gente" (singular)',
        },
        { a: "As críticas bastantes foram ouvidas.", b: "Bastante = adjetivo (concorda)" },
        {
          a: "Achei bastante inteligente sua resposta.",
          b: "Bastante = advérbio modificando adjetivo",
        },
      ],
      explicacao:
        "Bastante muda de papel: adjetivo quando precisa concordar, advérbio quando é invariável. Confira a função antes de usar.",
    }),
    ordenar({
      blocos: ["As", "documentações", "anexas", "devem", "ser", "entregues", "juntas."],
      explicacao:
        'Anexo como adjetivo: "documentações" é feminino plural, então "anexas" também é feminino plural. Quando "anexo" concorda, segue a regra de adjetivo.',
    }),
    interpretacao({
      texto:
        'Algumas palavras em português possuem um comportamento instável quanto à concordância. "Anexo" pode ser adjetivo (concordando: "documentos anexos") ou advérbio (invariável: "envio anexo"). "Obrigado" é fixo no masculino singular por ser uma forma elíptica de "sou obrigado", embora em contextos muito formais uma mulher possa usar "obrigada". "Meio" é advérbio quando modifica adjetivo ("meio cansado") e permanece invariável. "Bastante" é adjetivo quando modifica nome ("bastantes pessoas") e advérbio quando modifica adjetivo ("bastante bonito"). A tendência moderna é fazer esses termos concordarem, mas a academia aceita ambas as formas em muitos casos. Em provas, prefira a concordância explícita, que é sempre acertada.',
      pergunta:
        'Qual é a estratégia mais segura em prova para usar "anexo", "obrigado" e similares?',
      opcoes: [
        "Deixar sempre invariável",
        "Fazer concordância explícita, que é sempre acertada",
        "Alternar entre as formas",
      ],
      correta: 1,
      explicacao:
        'O texto ensina: concordância explícita é o caminho mais seguro. "Anexos", "bastantes", "meios" (quando adjetivos) não erram.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "As cartas anexas ao e-mail têm informações importantes", "anexas" concorda corretamente com "cartas".',
      verdadeiro: true,
      explicacao:
        'Sim: "cartas" é feminino plural, e "anexas" (como adjetivo, neste contexto) também é feminino plural. Concordância perfeita.',
    }),
  ],
});
