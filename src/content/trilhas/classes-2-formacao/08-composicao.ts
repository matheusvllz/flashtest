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
 * Lição 08: Composição (justaposição, aglutinação)
 * Tópico: Processo de formar palavras combinando radicais
 */
export const composicao = defineLesson({
  id: "classes-2-formacao-08-composicao",
  titulo: "Composição (justaposição, aglutinação)",
  descricao: "Formação de palavras pela combinação de dois ou mais radicais.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é composição de palavras?",
      opcoes: [
        "Processo de juntar dois ou mais radicais para criar uma palavra nova",
        "Ação de separar a palavra em partes",
        "Mudança de som na frase",
      ],
      correta: 0,
      explicacao:
        'Composição é o casamento de radicais: "gira" + "sol" = girassol, "passado" + "tempo" = passatempo. Dois radicais, um sentido novo, uma palavra só.',
    }),
    parear({
      instrucao: "Combine cada palavra com seu tipo de composição",
      pares: [
        {
          a: "Passatempo (composto por justaposição)",
          b: "Palavras se juntam, cada uma mantém forma",
        },
        { a: "Planalto (composto por aglutinação)", b: "Palavras se fundem, uma sofre alteração" },
        {
          a: "Girassol (composto por justaposição)",
          b: "Duas palavras com hífen ou separadas visualmente",
        },
      ],
      explicacao:
        "Justaposição: as palavras se juntam mas cada uma mantém sua identidade visual. Aglutinação: elas se fundem tão intimamente que uma muda para caber bem na outra.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "água + ardente = aguardente", a composição é por justaposição porque as palavras não perdem suas formas originais.',
      verdadeiro: false,
      explicacao:
        'Na verdade, é aglutinação: "água" perde o "a" final ao se fundir com "ardente". Justaposição seria manter as duas formas inteiras, como em "passatempo".',
    }),
    completeLacuna({
      frase:
        'A palavra "pé-de-meia" é composta por justaposição porque ___ palavras mantêm sua forma original.',
      opcoes: ["as", "os", "a"],
      correta: 0,
      explicacao:
        'As três palavras ("pé", "de", "meia") ligam-se por hífen mas cada uma permanece intacta. Justaposição: as palavras não se alteram, apenas se unem visualmente.',
    }),
    encontreOErro({
      frase: "O parachoque do carro foi danificado ontem à noite.",
      erroIndex: 1,
      explicacao:
        'A grafia correta é "para-choque" (com hífen). Sem hífen, fica confundido. É uma palavra composta por justaposição que exige marca visual do hífen na maioria dos casos.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra é exemplo clássico de composição por aglutinação?",
      opcoes: [
        "Planalto (plano + alto, com fusão)",
        "Guarda-chuva (guarda + chuva, com hífen)",
        "Bem-te-vi (bem + te + vi, com hífens)",
      ],
      correta: 0,
      explicacao:
        'Em "planalto", "plano" perde a vogal final e funde-se com "alto" em uma forma única, sem hífen. Aglutinação é essa fusão. Os outros mantêm hífens (justaposição).',
    }),
    verdadeiroFalso({
      afirmacao:
        "A diferença entre justaposição e aglutinação é principalmente visual: se tem hífen, é justaposição; se não tem, é aglutinação.",
      verdadeiro: false,
      explicacao:
        'Não é só visual. A diferença está se há ALTERAÇÃO no radical: em "planalto" (aglutinação), "plano" perde a vogal final ao se fundir com "alto". Em "passatempo" (justaposição), ambas as palavras se preservam inteiras, mesmo sem hífen. Visual ajuda, mas não define.',
    }),
    interpretacao({
      texto:
        'A composição revela como a língua economiza e cria. Em vez de descrever "um pé que poupa dinheiro", o português compõe "pé-de-meia". Em vez de "tempo passado", cria "passatempo". A criatividade vem de combinar radicais conhecidos em ordens novas. No texto, compostos como "guarda-chuva", "couve-flor", "amor-próprio" soam familiares porque reencontram velhos amigos em novos contextos. Dominar composição no ENEM é reconhecer essas palavras e não cair em pegadinhas de hífen ou alteração de radical.',
      pergunta: "Por que a composição de palavras revela economia e criatividade linguística?",
      opcoes: [
        "Porque combina radicais conhecidos para evitar descrever longamente",
        "Porque torna a redação mais curta",
        "Porque elimina a necessidade de vocabulário variado",
      ],
      correta: 0,
      explicacao:
        'A língua não descreve "pé que guarda dinheiro": compõe "pé-de-meia". Criatividade = reutilizar radicais em novas ordens. No ENEM, isso é precisão e concisão.',
    }),
    multiplaEscolha({
      pergunta: "Qual é a principal diferença entre composição e derivação?",
      opcoes: [
        "Composição junta radicais; derivação modifica um radical com afixos",
        "Composição usa hífen; derivação não usa",
        "Derivação é mais comum que composição",
      ],
      correta: 0,
      explicacao:
        'Composição: dois radicais ("guarda" + "chuva"). Derivação: um radical + afixos ("guarda" + "-ia" = guarda-ria). Estruturas diferentes, estratégias de formação distintas.',
    }),
  ],
});
