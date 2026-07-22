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
 * Lição 01: O que é dissertativo-argumentativo
 */
export const dissertativoArgumentativo = defineLesson({
  id: "redacao-estrutura-01-dissertativo-argumentativo",
  titulo: "O que é dissertativo-argumentativo",
  descricao: "A estrutura que o ENEM exige: dissertar, argumentar, propor solução.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é o objetivo central de uma redação dissertativo-argumentativa?",
      opcoes: [
        "Contar uma história vivida pelo autor",
        "Expor uma ideia sobre um tema e defender essa ideia com argumentos",
        "Descrever lugares, pessoas e sensações",
      ],
      correta: 1,
      explicacao:
        "Dissertar é refletir, expor uma opinião fundamentada. Argumentar é sustentar essa opinião com razões sólidas. No ENEM, esse é o navio-capitânia: você não narra, não descreve só por descrever; você defende um ponto de vista.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma redação dissertativo-argumentativa pode começar com uma cena narrativa desde que volte à argumentação depois.",
      verdadeiro: false,
      explicacao:
        "O tipo é dissertativo-argumentativo: a estrutura de começo a fim segue essa arquitetura. Introdução (tese), desenvolvimento (argumentos), conclusão (proposta). Se você estrutura como narrativa primeiro, a banca vê predominância narrativa e você perde pontos na Competência II.",
    }),
    multiplaEscolha({
      pergunta: "Qual dos textos abaixo é dissertativo-argumentativo?",
      opcoes: [
        "A chuva caía forte. O menino corria pela rua, seus pés batendo no asfalto molhado. Ele respirava fundo e sorria.",
        "A educação digital revoluciona o aprendizado porque amplia o acesso ao conhecimento em comunidades rurais, democratiza o ensino e prepara o aluno para o mercado de trabalho.",
        "A praça é um lugar bonito. Tem árvores verdes, banco de madeira e crianças brincando. O final de tarde é especial lá.",
      ],
      correta: 1,
      explicacao:
        'Só a segunda defende uma ideia ("educação digital revoluciona") com argumentos que sustentam ("amplia acesso", "democratiza", "prepara"). A primeira é narrativa; a terceira, descritiva. O tom dissertativo é: "isso vale porque, porque, porque".',
    }),
    parear({
      instrucao: "Relacione cada tipo de texto com sua característica principal",
      pares: [
        { a: "Dissertativo-argumentativo", b: "Defende uma ideia com argumentos" },
        { a: "Narrativo", b: "Conta uma série de fatos sequenciais" },
        { a: "Descritivo", b: "Retrata características de pessoas, lugares ou objetos" },
      ],
      explicacao:
        'Cada tipo tem seu alicerce. O dissertativo repousa na razão: "por quê?" O narrativo, na sequência de eventos. O descritivo, na sensação visual. No ENEM, você constrói sobre o dissertativo.',
    }),
    completeLacuna({
      frase:
        "A redação dissertativo-argumentativa exige que o aluno exponha um ponto de vista ___ sustente-o com evidências e exemplos que justifiquem sua posição.",
      opcoes: ["e", "ou", "mas"],
      correta: 0,
      explicacao:
        'Dissertar E argumentar são parceiros indivisíveis: não há tese sem fundamento, não há argumento solto sem conexão com a ideia central. O "e" liga os dois movimentos de forma lógica.',
    }),
    encontreOErro({
      frase:
        "A redação dissertativa busca descrever o cenário político, os personagens envolvidos e as emoções do autor durante os eventos.",
      erroIndex: 4,
      explicacao:
        'Repare no verbo "descrever": redação dissertativa não busca descrever cenário nem detalhar emoções. Ela busca argumentar, expor, fundamentar um ponto de vista. Esse trecho traz características do tipo descritivo ou narrativo, não o dissertativo.',
    }),
    ordenar({
      blocos: [
        "A introdução expõe a tese",
        "O desenvolvimento apresenta argumentos que sustentam a tese",
        "A proposta de intervenção encerra o texto",
        "A estrutura dissertativo-argumentativa segue este movimento",
      ],
      explicacao:
        "Essa é a base que você constrói em toda redação do ENEM: apresentação da ideia, estrutura de sustentação, e encerramento com solução. Tese, argumentação, proposta. Esse é o projeto.",
    }),
    multiplaEscolha({
      pergunta: "Qual estrutura melhor organiza uma redação dissertativo-argumentativa?",
      opcoes: [
        "Uma cena de abertura, seguida de reflexões soltas, e encerramento com uma frase linda",
        "Introdução com tese, desenvolvimento com argumentos estruturados em parágrafos temáticos, conclusão com proposta de intervenção",
        "Um parágrafo contendo todas as ideias, sem separação clara entre introdução, desenvolvimento e conclusão",
      ],
      correta: 1,
      explicacao:
        "A estrutura não é convite: é lei. Tese clara no início, argumentos organizados em parágrafos com tópico frasal, proposta de intervenção no fim, respeitando os cinco elementos oficiais (ação, agente, modo, efeito, detalhamento). Isso é o que o ENEM avalia na Competência II.",
    }),
    interpretacao({
      texto:
        "A Competência II da matriz do ENEM exige que o participante compreenda a proposta de redação e aplique conceitos das várias áreas de conhecimento para desenvolver o tema dentro dos limites estruturais do texto dissertativo-argumentativo. Isso significa que o texto não pode misturar características predominantes de tipos textuais diferentes; a redação que se estrutura como narrativa ou descrição recebe penalidades severas, podendo zerar a nota se a predominância for muito marcada.",
      pergunta:
        "Segundo o texto, qual é a consequência de uma redação estruturada predominantemente como narrativa em vez de dissertativo-argumentativa?",
      opcoes: [
        "A redação recebe nota máxima em Competência I",
        "A redação é penalizada na Competência II, podendo chegar a zero",
        "A redação pode usar indistintamente qualquer tipo textual",
      ],
      correta: 1,
      explicacao:
        "O tipo não é negociável. Misturar narrativa ou descrição na estrutura principal prejudica a avaliação na Competência II, que avalia justamente o domínio do tipo dissertativo-argumentativo. Em casos extremos de predominância narrativa ou descritiva, a nota pode ser zero.",
    }),
  ],
});
