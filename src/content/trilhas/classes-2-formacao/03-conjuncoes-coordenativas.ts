import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  ordenar,
  parear,
} from "@/lib/lessons/define";

/**
 * Lição 03: Conjunções coordenativas
 * Tópico: Palavras que ligam termos e orações de mesmo nível
 */
export const conjuncoesCoordenativas = defineLesson({
  id: "classes-2-formacao-03-conjuncoes-coordenativas",
  titulo: "Conjunções coordenativas",
  descricao: "Palavras que ligam termos ou orações de igual importância.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma conjunção coordenativa?",
      opcoes: [
        "Uma palavra que liga termos ou orações de mesmo nível, sem dependência",
        "Uma palavra que subordina uma oração a outra",
        "Um tipo de preposição que marca tempo",
      ],
      correta: 0,
      explicacao:
        'Coordenativa é o "e" da igualdade: ela une termos ou orações que têm o mesmo peso, nenhum depende do outro. É democrática, não comanda.',
    }),
    parear({
      instrucao: "Combine cada conjunção coordenativa com sua função principal",
      pares: [
        { a: "e / nem / mas também", b: "Adição" },
        { a: "mas / porém / contudo", b: "Adversidade" },
        { a: "ou / ou...ou", b: "Alternância" },
        { a: "portanto / logo / então", b: "Conclusão" },
      ],
      explicacao:
        "Cada tipo de coordenativa abre uma lógica diferente: adição une, adversidade confronta, alternância escolhe, conclusão fecha. O sentido da frase depende de qual você escolhe.",
    }),
    completeLacuna({
      frase: "Ela estuda todos os dias ___ ainda não atingiu suas metas.",
      opcoes: ["e", "mas", "portanto"],
      correta: 1,
      explicacao:
        'A adversativa "mas" é a certa: ela confronta dois fatos de peso igual. Estudar é bom, mas não conseguir o resultado desejado é o contraste que "mas" marca com precisão.',
    }),
    encontreOErro({
      frase: "Gosto de ler livros, assistir filmes, e ouvir música.",
      erroIndex: 5,
      explicacao:
        'Essa vírgula depois de "filmes" sobra. Numa lista simples, a vírgula separa os itens e o "e" entra sozinho antes do último, sem vírgula antes dele. O certo é "livros, assistir filmes e ouvir música". Menos é mais.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa corretamente a conjunção coordenativa?",
      opcoes: [
        "Não comeu nem bebeu nada ontem.",
        "Comeu bastante ou bebeu bastante?",
        "Dormiu cedo, portanto acordou cansado.",
      ],
      correta: 0,
      explicacao:
        'Em "nem" (adição negativa), a lógica é perfeita: não fez isso, não fez aquilo. As outras têm problemas: alternância exige escolha clara, e conclusão aqui não se sustenta logicamente.',
    }),
    ordenar({
      blocos: ["Ele era inteligente,", "dedicado", "e ainda possuía criatividade."],
      explicacao:
        'Numa lista simples, a vírgula separa os itens e o "e" entra sozinho antes do último, sem vírgula antes dele: "inteligente, dedicado e ainda possuía criatividade". A conjunção no final une as partes de peso igual.',
    }),
    multiplaEscolha({
      pergunta: "O que diferencia uma conjunção coordenativa de uma subordinativa?",
      opcoes: [
        "Coordenativa liga termos/orações de peso igual; subordinativa cria dependência entre elas",
        "Coordenativa é mais fácil de decorar",
        "Subordinativa é sempre marcada por vírgula",
      ],
      correta: 0,
      explicacao:
        'Coordenação = igualdade. Subordinação = hierarquia. "Eu vejo e aprovo" (iguais). "Eu vejo porque aprovo" (uma depende da outra). Estrutura diferente, papéis diferentes.',
    }),
    interpretacao({
      texto:
        'As conjunções coordenativas são ferramentas de construção rápida e direta. Um redator que domina "e", "mas", "ou", "portanto" consegue estruturar parágrafos inteiros com clareza. O "e" acumula ideias, o "mas" confronta, o "ou" oferece escolha, o "portanto" fecha raciocínios. No ENEM, essa precisão vale pontos de coerência e coesão.',
      pergunta: "Qual é o valor de dominar bem as conjunções coordenativas na redação?",
      opcoes: [
        "Permite estruturar parágrafos com clareza e coerência",
        "Elimina a necessidade de pontuação",
        "Torna a redação automaticamente melhor",
      ],
      correta: 0,
      explicacao:
        'Coordenativas bem usadas garantem fluxo claro de ideias. "E" acumula, "mas" confronta, "portanto" conclui: cada uma constrói lógica. No ENEM, isso é coesão.',
    }),
  ],
});
