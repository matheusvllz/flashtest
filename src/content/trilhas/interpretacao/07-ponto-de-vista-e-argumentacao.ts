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
 * Lição sobre ponto de vista e argumentação: a voz do autor.
 */
export const PontoDeVistaEArgumentacao = defineLesson({
  id: "interpretacao-07-ponto-de-vista-e-argumentacao",
  titulo: "Ponto de vista e argumentação",
  descricao: "Identificar a posição do autor e como ele sustenta sua tese.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é ponto de vista de um autor?",
      opcoes: [
        "O lugar físico onde o autor escreveu o texto",
        "A posição, perspectiva ou opinião que o autor defende sobre o tema",
        "A quantidade de parágrafos que o texto possui",
      ],
      correta: 1,
      explicacao:
        "Ponto de vista é a lente pela qual o autor enxerga o mundo. É sua posição, seu alicerce ideológico. Reconhecer o ponto de vista é entender para que lado o texto puxa.",
    }),
    verdadeiroFalso({
      afirmacao: "Toda argumentação deve ser baseada em fatos e dados verificáveis.",
      verdadeiro: true,
      explicacao:
        "Uma boa argumentação tem base sólida em evidência. Opinião sem fundamento é achismo. O autor que respeita o leitor sustenta sua tese com razões reais.",
    }),
    multiplaEscolha({
      pergunta:
        'Um texto diz: "A tecnologia aproxima as pessoas" e depois apresenta dados de usuários de redes sociais que mantêm contato com amigos distantes. O que sustenta a tese?',
      opcoes: [
        "Apenas a opinião do autor sobre tecnologia",
        "Exemplos concretos com dados que respaldam a afirmação",
        "Crítica àqueles que não gostam de redes sociais",
      ],
      correta: 1,
      explicacao:
        'A tese "tecnologia aproxima" é sustentada por dado real: gente que usa rede social mantém relacionamento. Base sólida de argumento: tese + evidência.',
    }),
    completeLacuna({
      frase:
        "O ___ de um texto é a posição que o autor estabelece sobre o assunto, geralmente expressa na tese.",
      opcoes: ["estilo", "ponto de vista", "propósito"],
      correta: 1,
      explicacao:
        "Ponto de vista é a posição política ou ideológica do autor. De qual lado ele está? Qual é sua tese? Isso é o alicerce que sustenta todo o argumento.",
    }),
    encontreOErro({
      frase:
        "A argumentação por apelo emocional é sempre inválida em textos que exigem rigor, como dissertação acadêmica.",
      erroIndex: 6,
      explicacao:
        'Apelo emocional pode ser válido COMPLEMENTADO por razão e dado. O erro está em "sempre inválida". Base sólida de argumento combina razão e emoção quando apropriado.',
    }),
    parear({
      instrucao: "Combine cada tipo de argumento com seu funcionamento",
      pares: [
        { a: "Argumento por autoridade", b: "Cita especialista ou fonte confiável" },
        { a: "Argumento por exemplo", b: "Apresenta caso específico que sustenta tese" },
        { a: "Argumento por estatística", b: "Usa números e dados para comprovar" },
        { a: "Argumento por analogia", b: "Compara situação A com situação B conhecida" },
      ],
      explicacao:
        "Cada tipo de argumento tem sua base própria. Alguns apelam à confiança, outros ao dado. O alicerce forte vem de combinar múltiplas estratégias.",
    }),
    interpretacao({
      texto:
        'Um ambientalista escreve: "A Amazônia é essencial para a sobrevivência do planeta porque produz 20% do oxigênio mundial e estabiliza clima global. Cientistas das maiores universidades do mundo confirmam isso. Se perdermos a Amazônia, perderemos milhões de espécies e enfrentaremos desastres climáticos. Portanto, proteger a Amazônia não é ecochato, é imperativo de sobrevivência." O texto mescla argumentação científica com apelo à ação.',
      pergunta: "Qual é o ponto de vista e qual argumento é mais forte neste texto?",
      opcoes: [
        "O ponto de vista é pró-ambiente e o argumento mais forte é o apelo emocional",
        "O ponto de vista é científico e o argumento mais forte é dados sobre função da Amazônia",
        "O ponto de vista é político e não há argumentação real, só opinião",
      ],
      correta: 1,
      explicacao:
        "Ponto de vista claro: proteger Amazônia é necessário. Argumento-base: dados sobre produção de oxigênio e estabilidade climática. Apelo emocional complementa, mas a base é razão.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Dois leitores podem discordar sobre o ponto de vista de um texto e ambos estarem com razão.",
      verdadeiro: false,
      explicacao:
        "Não. O ponto de vista está no texto: é expressão clara da posição autoral. Discordância legítima é sobre a validez do argumento, não sobre qual é o ponto de vista.",
    }),
    ordenar({
      blocos: [
        "Localize a tese ou afirmação principal do autor.",
        "Identifique qual é o ponto de vista: favor ou contra.",
        "Procure pelos argumentos: dados, exemplos, autoridade, analogia.",
        "Avalie se os argumentos realmente sustentam a tese.",
        "Perceba se há contra-argumentação ou admissão de exceções.",
      ],
      explicacao:
        "Estratégia estruturada para ler argumentação: tese primeiro, ponto de vista depois, argumentos por fim. Base sólida em cada nível.",
    }),
    interpretacao({
      texto:
        'Um artigo de opinião começa assim: "Muitos acreditam que trabalhar aos domingos diminui qualidade de vida. Mas dados mostram que 30% dos trabalhadores que fazem home office nos domingos relatam maior produtividade. A realidade é mais complexa que o senso comum." O texto não segue o ponto de vista esperado; ele questiona a tese comum.',
      pergunta: "Qual é a estratégia argumentativa do autor?",
      opcoes: [
        "Atacar aqueles que trabalham menos nos fins de semana",
        "Questionar pressuposição comum com dado que a contradiz",
        "Propor que todos devem trabalhar sete dias por semana",
      ],
      correta: 1,
      explicacao:
        "O autor desafia a expectativa: começa reconhecendo crença comum, depois apresenta dado que refuta. É estratégia sofisticada de argumento que questionas base do senso comum.",
    }),
  ],
});
