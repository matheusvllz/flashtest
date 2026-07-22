import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Competência V do ENEM: Elaborar proposta de intervenção para o problema abordado,
 * respeitando os direitos humanos.
 */
export const c5PropostaDetalhada = defineLesson({
  id: "redacao-competencias-05-c5-proposta-detalhada",
  titulo: "C5: A proposta detalhada",
  descricao:
    "Elaborar uma solução concreta, específica ao tema e com todos os 5 elementos oficiais.",
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        'Em C5, apenas constatar que "faltam investimentos em educação" é suficiente como proposta de intervenção.',
      verdadeiro: false,
      explicacao:
        'Constatação é diagnóstico, não proposta. A banca exige sugestão de iniciativa: ação concreta. "Aumentar investimentos em capacitação docente nas escolas rurais através de parcerias público-privadas" é uma proposta. "Faltam investimentos" é lamento, não solução.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual desses elementos NÃO é obrigatório na proposta de intervenção oficial do ENEM?",
      opcoes: [
        "Ação (o que deve ser feito)",
        "Agente (quem executará)",
        "Modo/meio (como viabilizar)",
        "Número exato de pessoas que serão beneficiadas",
      ],
      correta: 3,
      explicacao:
        "Os 5 elementos oficiais são: ação, agente, modo/meio, efeito/finalidade e detalhamento. Estatística exata de beneficiados é interessante, mas não obrigatória. Detalhamento é o espaço para aprofundar qualquer um dos 4 primeiros.",
    }),
    encontreOErro({
      frase: "Se o governo investir em educação, talvez a mobilidade social melhore no futuro.",
      // Tokenização: Se(0) o(1) governo(2) investir(3) em(4) educação,(5) talvez(6) a(7) mobilidade(8) social(9) melhore(10) no(11) futuro.(12)
      // Erro: Estrutura condicional ("Se...talvez") em vez de proposta explícita. A palavra-alvo é "talvez" (índice 6) ou "Se" (índice 0). Vou usar "talvez" (índice 6).
      erroIndex: 6,
      explicacao:
        'Propostas condicionais ("se", "talvez", "poderia") não valem em C5. A banca exige afirmação clara de ação. "Talvez melhore" é especulação; "estruturará" é proposta. A diferença é entre sugestão tímida e solução decidida.',
    }),
    multiplaEscolha({
      pergunta:
        "Uma proposta completa em C5 tem 5 elementos. Qual ordem é mais natural em um parágrafo de conclusão?",
      opcoes: [
        "Ação, agente, modo/meio, efeito, detalhamento",
        "Agente, ação, efeito, modo/meio, detalhamento",
        "Efeito (abertura), ação, agente, modo/meio, detalhamento",
      ],
      correta: 0,
      explicacao:
        'A ordem natural de construção é: "O quê (ação) deve ser feito + Quem (agente) faz + Como (modo/meio) + Para quê (efeito) + Exemplo/detalhe". Essa sequência é lógica e facilita leitura. Ordem invertida também funciona se bem conectada, mas a ordem clássica é mais robusta.',
    }),
    parear({
      instrucao: "Associe cada frase incompleta ao elemento que falta",
      pares: [
        {
          a: "O governo deve criar programas de bolsa acadêmica para alunos de baixa renda.",
          b: "Falta detalhamento (tipo de bolsa, duração, critérios)",
        },
        {
          a: "Programas de bolsa acadêmica reduzem desigualdade educacional e aumentam a mobilidade social.",
          b: "Falta agente claro (quem executa)",
        },
        {
          a: "Por meio de parcerias entre governo e institutos privados, estruturar programa de capacitação docente.",
          b: "Falta efeito/finalidade (para quê)",
        },
      ],
      explicacao:
        "Cada frase tem força, mas está incompleta em C5. A primeira é boa, mas vaga; qual bolsa? A segunda é efeito puro, sem quem faz; a terceira tem modo/meio, mas não explicita resultado esperado. Completude é o trabalho de C5.",
    }),
    completeLacuna({
      frase:
        "A redação deve apresentar uma proposta de intervenção___ ao tema, não vaga ou genérica, que desrespeite os direitos humanos.",
      opcoes: ["relacionada", "contraditória", "semelhante"],
      correta: 0,
      explicacao:
        'A proposta tem que estar "relacionada" ao tema discutido na redação. Vaga demais (ex: "sociedade melhor") ou genérica ("investimentos") recebe pontos baixos. Específica ao problema abordado é o padrão de 200 em C5.',
    }),
    multiplaEscolha({
      pergunta: "O que diferencia uma proposta com 200 pontos em C5 de uma com 120?",
      opcoes: [
        "Nota 200 é mais longa",
        "Nota 200 é muito bem detalhada, relacionada ao tema e articulada à discussão desenvolvida",
        "Nota 200 não precisa de todos os 5 elementos",
      ],
      correta: 1,
      explicacao:
        "Nota 200 em C5 é proposta detalhada que se liga ao que você discutiu. Você debateu os desafios de acesso à educação rural? Sua proposta é específica para essa realidade, com ação clara, agente definido, viabilidade explícita. Não é genérica, não é solta. Articulação com a discussão é o piso para 200.",
    }),
    interpretacao({
      texto:
        'Uma proposta bem formulada em C5 parte do problema abordado na redação. Se o tema era "Segurança nas ruas de bairros periféricos", a proposta não pode ser sobre presídios (desconectado) nem tão vaga quanto "melhorar segurança" (sem ação concreta). O ideal é algo como: "As prefeituras das cidades devem implementar programas de iluminação pública e policiamento comunitário em bairros periféricos, treinando moradores para atuar como multiplicadores de segurança, com o objetivo de reduzir criminalidade e restaurar confiança comunitária; para isso, direcionar 15% do orçamento municipal de segurança a esses bairros". Nota: ação (iluminação + policiamento + capacitação), agente (prefeituras), modo (treinamento + budget), efeito (redução de crime), detalhamento (15% do orçamento).',
      pergunta: "Qual frase propõe intervenção completa em C5, segundo o texto?",
      opcoes: [
        '"Melhorar segurança nas ruas"',
        '"As prefeituras devem implementar iluminação e policiamento com budget direcionado"',
        '"Segurança é importante e precisa de atenção"',
      ],
      correta: 1,
      explicacao:
        "A segunda frase tem os 5 elementos integrados: ação (iluminação, policiamento), agente (prefeituras), modo (treinamento, budget de 15%), efeito (redução de crime), detalhamento (bairros periféricos, 15% do orçamento). As demais são vaga ou afirmação sem proposta. C5 é a síntese de toda argumentação em uma ação decidida.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma proposta que desrespeita direitos humanos recebe zero em C5, mas a redação ainda é avaliada nas outras competências.",
      verdadeiro: false,
      explicacao:
        "Se a proposta desrespeita direitos humanos (defesa de violência, discriminação, censura, etc.), recebe zero em C5. Além disso, a tangenciação causada por fuga ao tema afeta também C2, C3 e C5 (limitadas a 40 pontos). É uma penalidade composta. Cuidado extremo: verificar se sua solução não é tendenciosa ou violenta.",
    }),
  ],
});
