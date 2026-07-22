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
 * Lição 04 da trilha de Concordância: partícula SE (apassivadora vs indeterminadora).
 */
export const particulaSe = defineLesson({
  id: "concordancia-04-particula-se",
  titulo: "Partícula SE (apassivadora vs indeterminadora)",
  descricao: 'O "se" que passa ação para voz passiva e o "se" que indefine o sujeito.',
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a diferença entre SE apassivador e SE indeterminador?",
      opcoes: [
        "O SE apassivador permite concordância com o objeto; o indeterminador deixa o verbo no singular.",
        'Não há diferença; são nomes diferentes para o mesmo "se".',
        "O SE apassivador muda o tempo do verbo; o indeterminador não.",
      ],
      correta: 0,
      explicacao:
        'SE apassivador transforma a frase ativa em passiva, e o verbo concorda com o objeto (que vira sujeito): "Vende-se casas" (=casas são vendidas). SE indeterminador deixa tudo no singular: "Trabalha-se muito" (=alguém trabalha muito, sujeito indefinido). A diferença é na concordância e na passagem de voz.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Compra-se livros", o SE é apassivador e o verbo "compra" deve concordar com "livros".',
      verdadeiro: false,
      explicacao:
        'Aqui o SE é apassivador SIM, mas o verbo está ERRADO. Deveria ser "Compram-se livros" (plural), porque o verbo concorda com o sujeito paciente "livros" (que recebe a ação).',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem SE apassivador com concordância CORRETA?",
      opcoes: ["Vende-se carros aqui.", "Vendem-se carros aqui.", "Venderá-se carro aqui."],
      correta: 1,
      explicacao:
        'SE apassivador: verbo concorda com o sujeito paciente "carros" (plural). "Vendem-se" está certo porque "carros" é o que recebe a ação de vender.',
    }),
    completeLacuna({
      frase: "Precisa-___ de ótimos profissionais para este projeto.",
      opcoes: ["se", "rem", "-se não"],
      correta: 0,
      explicacao:
        'Aqui o SE é INDETERMINADOR (não há objeto direto): significa "alguém precisa". O verbo fica no singular "precisa-se". Não há sujeito paciente para concordância.',
    }),
    encontreOErro({
      frase: "Vende-se casas modernas e bem localizadas.",
      erroIndex: 0,
      explicacao:
        'SE apassivador: o verbo deve concordar com "casas" (plural). Deveria ser "Vendem-se casas", não "Vende-se". Quando há sujeito paciente plural, o verbo sai do singular e entra em plural.',
    }),
    parear({
      instrucao: "Combine cada frase com o tipo de SE",
      pares: [
        {
          a: "Estudam-se obras clássicas nesta escola.",
          b: "SE apassivador (verbo concorda com objeto)",
        },
        {
          a: "Trabalha-se o dia inteiro nessa fábrica.",
          b: "SE indeterminador (sujeito indefinido)",
        },
        {
          a: "Entregam-se encomendas diariamente.",
          b: 'SE apassivador, verbo no plural (concorda com "encomendas")',
        },
      ],
      explicacao:
        "Apassivador: há um objeto que se torna sujeito (obras, encomendas). Indeterminador: a ação é vaga, ninguém é sujeito definido (alguém trabalha).",
    }),
    ordenar({
      blocos: ["Aceita-se", "qualquer", "currículo", "bem", "estruturado."],
      explicacao:
        'SE apassivador: "qualquer currículo" é sujeito paciente, mas está no singular, então o verbo "aceita-se" concorda certinho. A mesma regra do plural vale para o singular: verbo e sujeito paciente andam sempre juntos.',
    }),
    interpretacao({
      texto:
        'A partícula SE cumpre dois papéis diferentes em português. Quando é APASSIVADOR, transforma uma frase ativa em passiva sintética: "Vende-se aquele carro" = "Aquele carro é vendido". Neste caso, o verbo CONCORDA com o sujeito paciente (o objeto da ativa). Quando é INDETERMINADOR, não há voz passiva; é um sujeito indefinido: "Precisa-se de ajuda" = "Alguém precisa de ajuda". Neste caso, o verbo SEMPRE fica no singular, porque o sujeito é vago. A distinção importa para a concordância: apassivador exige variação, indeterminador exige singular.',
      pergunta:
        "Qual é a característica que diferencia SE apassivador de SE indeterminador na concordância?",
      opcoes: [
        "Apassivador requer plural; indeterminador requer singular.",
        "Apassivador concorda com o sujeito paciente; indeterminador deixa verbo singular.",
        "Não há diferença; a concordância é igual nos dois casos.",
      ],
      correta: 1,
      explicacao:
        "O texto deixa claro: apassivador concorda (plural ou singular conforme o objeto), indeterminador fica singular. A concordância é o termômetro que distingue os dois tipos de SE.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Não se sabe o resultado da eleição", o SE é indeterminador e o verbo fica singular "sabe".',
      verdadeiro: true,
      explicacao:
        'Correto: "não se sabe" é indeterminador (alguém não sabe). Não há objeto direto a concordar, só sujeito indefinido, então verbo singular mesmo.',
    }),
  ],
});
