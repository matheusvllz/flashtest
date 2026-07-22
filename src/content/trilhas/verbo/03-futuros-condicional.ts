import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

export const futurosCondicional = defineLesson({
  id: "verbo-03-futuros-condicional",
  titulo: "Futuros e condicional",
  descricao: "Tempos que falam do que virá ou do que seria.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual frase usa o futuro do indicativo de forma correta?",
      opcoes: [
        "Amanhã eu vou fazer o trabalho.",
        "Amanhã eu faço o trabalho.",
        "Amanhã eu farei o trabalho.",
      ],
      correta: 2,
      explicacao:
        'O futuro simples "farei" marca uma ação que ainda vai acontecer num tempo definido. "Vou fazer" é futuro do presente com verbo auxiliar (mais informal). "Faço" é presente. No registro formal e em provas como o ENEM, "farei" é o futuro puro.',
    }),
    multiplaEscolha({
      pergunta: "O que expressa o condicional?",
      opcoes: [
        "Uma possibilidade, uma condição, uma hipótese no presente ou futuro",
        "Uma certeza absoluta de algo que vai acontecer",
        "Um fato que era verdadeiro no passado",
      ],
      correta: 0,
      explicacao:
        'O condicional (ou futuro do pretérito) expressa incerteza, possibilidade, desejo. "Se pudesse, sairia de férias" mostra o "sairia" como hipótese, não fato. Condicional é sempre sobre o que SERIA, não sobre o que É.',
    }),
    completeLacuna({
      frase: "Se eu tivesse grana, eu ___ o mundo todo.",
      opcoes: ["viajo", "viajaria", "viajarei"],
      correta: 1,
      explicacao:
        'A estrutura "se eu tivesse" (subjuntivo) pede condicional na consequência: "viajaria". Condicional é a forma que responde ao "se" do irrealizável. Aqui estamos no plano do sonho, não da realidade.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O futuro do indicativo ("farei") e o futuro do presente ("vou fazer") querem dizer a mesma coisa.',
      verdadeiro: false,
      explicacao:
        'Semanticamente parecem iguais, mas em tom não: "vou fazer" é mais coloquial e soa mais próximo de "agora"; "farei" é mais formal e soa mais distante. Em ENEM e redação culta, o futuro simples é a escolha correta.',
    }),
    encontreOErro({
      frase: "Se eu soubesse a resposta certa, eu digo para você.",
      // Se(0) eu(1) soubesse(2) a(3) resposta(4) certa,(5) eu(6) digo(7) para(8) você(9)
      erroIndex: 7,
      explicacao:
        'O "digo" está no presente, mas a primeira parte da frase é subjuntivo ("soubesse"), que pede condicional na consequência: "eu diria". Sem o condicional, a frase mistura tempos incompatíveis e soa desajustada.',
    }),
    parear({
      instrucao: "Combine cada frase ao tipo de futuro ou condicional correto",
      pares: [
        { a: "Você fará a prova amanhã com tranquilidade.", b: "Futuro do indicativo (afirmação)" },
        { a: "Se pudesse, eu faria o trabalho em casa.", b: "Condicional (hipótese)" },
        { a: "Ele vai chegar em poucos minutos.", b: "Futuro do presente (auxiliar)" },
      ],
      explicacao:
        "O futuro simples afirma certeza. O condicional coloca a hipótese. O futuro com auxiliar é mais informal e soa como próximo de agora. Cada um tem seu lugar e sua atmosfera.",
    }),
    interpretacao({
      texto:
        'Se você estudar agora, conseguirá passar no teste. Mas se não estudar, falhará. Muitos alunos acreditam que o futuro os protegerá: "se eu não estudar hoje, estudarei amanhã". Não funcionará assim. O futuro não vem salvando o presente. Quem espera pela próxima semana ou pelo próximo mês já perdeu a batalha de hoje.',
      pergunta: 'O que o texto sugere ao usar "não funcionará" em vez de "não funciona"?',
      opcoes: [
        "Que essa verdade se aplicará especificamente ao futuro próximo",
        "Que essa é uma lei geral e duradoura, independente de quando você a aplicar",
        "Que há dúvida sobre se isso é realmente verdade",
      ],
      correta: 1,
      explicacao:
        'O futuro "funcionará" abre a perspectiva: não é só hoje que essa lei vale, é sempre, em qualquer tempo que você teste. É uma verdade universal, não uma predição para amanhã.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Se você tivesse coragem, sairia agora", o verbo "sairia" está no condicional e marca uma hipótese que contraria o presente.',
      verdadeiro: true,
      explicacao:
        'Perfeito. "Sairia" é condicional, e a frase toda responde a um "se" irreal: você não tem coragem, então não sairá. O condicional e o subjuntivo andam sempre juntos nessa estrutura de irrealidade.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa futuro e condicional de forma ERRADA?",
      opcoes: [
        "Amanhã trarei o livro que prometi.",
        "Se você quer vencer, vencerá.",
        "Se tivessem cuidado, não cairiam no poço.",
      ],
      correta: 1,
      explicacao:
        'Em "Se você quer vencer, vencerá", o problema é lógico: "quer" é presente indicativo, que pede consequência em futuro. Mas a frase muda o tom: começa afirmando ("quer", certeza) e pula pro futuro como se fosse uma previsão. Deveria ser "Se você quiser vencer, vencerá" (futuro do subjuntivo na condição) ou "Se você quer vencer, você vence" (presente em ambas). Aqui há mistura de modos.',
    }),
  ],
});
