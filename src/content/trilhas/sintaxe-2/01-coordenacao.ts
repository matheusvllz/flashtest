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
 * Lição 01: Coordenação - assindéticas e sindéticas (5 tipos)
 */
export const coordenacao = defineLesson({
  id: "sintaxe-2-01-coordenacao",
  titulo: "Coordenação: assindéticas e sindéticas",
  descricao: "A junção de orações de mesmo nível, com ou sem conectivo.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que diferencia uma coordenação assindética de uma sindética?",
      opcoes: [
        "A assindética tem conectivo; a sindética não",
        "A assindética não tem conectivo; a sindética tem",
        "Uma depende de verbo; a outra, não",
      ],
      correta: 1,
      explicacao:
        'Coordenação assindética: orações lado a lado, sem conectivo ("Chegou. Sentou. Saiu."). Sindética: com conectivo ("Chegou e sentou"). Ambas constroem estrutura de igual nível.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "João estuda e Maria trabalha", o "e" liga duas orações coordenadas aditivas.',
      verdadeiro: true,
      explicacao:
        'O "e" é conjunção coordenativa aditiva: soma ambas as ações numa mesma ideia. Elas não dependem uma da outra, apenas se somam.',
    }),
    encontreOErro({
      frase: "Estudei, estudei, e ainda perdi a prova de português.",
      erroIndex: 1,
      explicacao:
        'A vírgula antes do "e" em coordenação simples é desnecessária. Aqui temos três ações: estudei, estudei (repetição) e perdi. O "e" já liga tudo; a vírgula depois do segundo "estudei" sobra estrutura.',
    }),
    completeLacuna({
      frase: "Nem todos assistem aula___ nem todos estudam em casa.",
      opcoes: [",", ";", "nada"],
      correta: 0,
      explicacao:
        'Duas orações ligadas pela correlação aditiva "nem... nem..." pedem vírgula simples entre elas, como em qualquer coordenação sindética curta. Ponto-e-vírgula seria pesado demais para duas orações tão curtas.',
    }),
    parear({
      pares: [
        { a: "Vi a cena: corri, gritei, caí.", b: "Coordenação assindética" },
        { a: "A prova foi fácil, porém ninguém acertou tudo.", b: "Coordenação adversativa" },
        { a: "Quer café ou chá?", b: "Coordenação alternativa" },
        { a: "Estudou bastante, logo passou.", b: "Coordenação conclusiva" },
      ],
      explicacao:
        "Coordenação assindética é ritmo de ações sem conectivo. Adversativa (porém, contudo, mas) opõe; alternativa (ou) escolhe; conclusiva (logo, pois, portanto) conclui; explicativa (pois, porque) explica a razão.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase exemplifica coordenação explicativa?",
      opcoes: [
        "Viajou para Europa e também visitou a Ásia.",
        "Estudou muito, pois queria passar de ano.",
        "Ou você come ou você estuda para a prova.",
      ],
      correta: 1,
      explicacao:
        'A explicativa traz o porquê da ação anterior. "Estudou muito, pois queria passar" explica a razão do estudo. O "pois" (ou "porque") estrutura essa relação causal entre irmãs, não entre mãe e filha.',
    }),
    ordenar({
      blocos: ["Chegou tarde,", "porém entrou sem fazer barulho.", "Silencioso", "e respeitoso."],
      explicacao:
        'Coordenação adversativa: a ação se repete, mas com ressalva. "Chegou tarde" contrasta com "entrou sem barulho". A estrutura é de orações irmãs, não dependentes uma da outra.',
    }),
    interpretacao({
      texto:
        'A coordenação é o alicerce do ritmo na redação. Orações coordenadas assindéticas ("Estudei. Treinei. Peguei a nota") criam velocidade, movimento, urgência. Já as sindéticas, com seus conectivos, desaceleram: permitem ao leitor entender as nuances (adição, oposição, alternativa) entre as ações.',
      pergunta: "Qual é o efeito de usar coordenação assindética, segundo o texto?",
      opcoes: [
        "Cria dúvida sobre quais ações aconteceram",
        "Estabelece uma hierarquia clara entre as orações",
        "Gera velocidade, movimento e urgência",
      ],
      correta: 2,
      explicacao:
        'Coordenação assindética elimina conectivos, encadeando ações umas após as outras. Isso simula a urgência de quem vive o momento. Sindética, com seus "e", "mas", "pois", permite pausa para reflexão.',
    }),
    encontreOErro({
      frase: "Acordei cedo mas não consegui me concentrar na aula.",
      erroIndex: 1,
      explicacao:
        'Conjunção adversativa como "mas" pede vírgula quando liga duas orações completas: "Acordei cedo" e "não consegui me concentrar" são duas ações plenas, cada uma com seu verbo. Faltou a vírgula logo depois de "cedo".',
    }),
    verdadeiroFalso({
      afirmacao:
        'Coordenação conclusiva usa "logo", "portanto" ou "pois" para introduzir a razão de algo.',
      verdadeiro: false,
      explicacao:
        'Conclusiva usa "logo" e "portanto" para trazer uma conclusão ("Estudou bem, logo passou"). Explicativa usa "pois" ou "porque" para trazer a razão ("Passou, pois estudou bem"). Não confunda as duas.',
    }),
  ],
});
