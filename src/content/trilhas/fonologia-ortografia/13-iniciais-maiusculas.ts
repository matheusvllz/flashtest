import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const iniciaisMaiusculas = defineLesson({
  id: "fonologia-ortografia-13-iniciais-maiusculas",
  titulo: "Iniciais maiúsculas",
  descricao: "Quando usar letra maiúscula: nomes próprios, dias, meses, conceitos e exceções.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual regra define o uso de maiúscula em português?",
      opcoes: [
        "Sempre no início de frase e em nomes próprios",
        "Apenas em nomes de pessoas e cidades",
        "No início de frase, nomes próprios e conceitos que designam totalidade (Deus, Nação quando usada como totalidade)",
      ],
      correta: 2,
      explicacao:
        'Maiúscula marca identidade: começo de frase, nomes próprios (Maria, Lisboa, Junho), e conceitos de totalidade (Pátria, República quando são entidades específicas). "Deus" recebe maiúscula quando se refere ao conceito religioso específico.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa maiúsculas corretamente?",
      opcoes: [
        "O Rio de Janeiro fica no Sudeste do Brasil.",
        "O rio de janeiro fica no sudeste do brasil.",
        "O Rio de janeiro fica no Sudeste do Brasil.",
      ],
      correta: 0,
      explicacao:
        'Rio de Janeiro é nome próprio, cada parte recebe maiúscula. "Sudeste" é região geográfica (maiúscula), Brasil é nação (maiúscula). A primeira está impecável. A terceira deixa "janeiro" minúsculo, o que é errado em nome próprio.',
    }),
    parear({
      pares: [
        { a: "Maria, São Paulo, Junho", b: "Nomes próprios (sempre maiúscula inicial)" },
        { a: "Rio, montanha, semana", b: "Nomes comuns (minúscula, a não ser no início de frase)" },
        {
          a: "Deus, Estado (como entidade), Constituição",
          b: "Conceitos de totalidade ou autoridade (maiúscula opcional ou necessária)",
        },
      ],
      explicacao:
        "Nome próprio = maiúscula. Nome comum = minúscula. Conceitos abstratos que designam uma entidade específica podem receber maiúscula para enfatizar sua importância ou unicidade.",
    }),
    verdadeiroFalso({
      afirmacao: "Os dias da semana e meses do ano sempre levam maiúscula inicial em português.",
      verdadeiro: false,
      explicacao:
        'Falso, mas depende do contexto. No português europeu tradicional, segunda-feira e janeiro levam minúscula. No português brasileiro e em alguns contextos formais, pode haver maiúscula. Regra: normalmente, minúscula ("segunda-feira chegou cedo"), mas se for título ou nome solene, pode maiúscula.',
    }),
    encontreOErro({
      frase: "O Presidente da república discursou na abertura do evento.",
      erroIndex: 3,
      explicacao:
        'Contando: O(0) Presidente(1) da(2) república(3) discursou(4) na(5) abertura(6) do(7) evento.(8). O erro mora em "república" (índice 3): quando se refere à instituição específica, ao lado de "Presidente", o R fica maiúsculo, "República". Toque em "república".',
    }),
    completeLacuna({
      frase: "A festa de ___ reúne toda a família todos os anos.",
      opcoes: ["Natal", "natal", "NataL"],
      correta: 0,
      explicacao:
        'Natal, com maiúscula, porque se refere à festividade específica, não a um substantivo comum. "A festa de Natal" nomeia a comemoração, igual "São João" ou "Páscoa".',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa está com maiúsculas corretas?",
      opcoes: [
        "O Presidente visitou a Escola Nacional de Administração.",
        "O presidente visitou a escola nacional de administração.",
        "O presidente visitou a Escola Nacional de Administração.",
      ],
      correta: 2,
      explicacao:
        'Terceira: "presidente" é cargo comum quando genérico (o presidente, qualquer), mas "Escola Nacional de Administração" é nome próprio de instituição (maiúscula em cada palavra essencial). A primeira sobre-capitaliza. A segunda sub-capitaliza a instituição específica.',
    }),
    interpretacao({
      texto:
        'A convenção de maiúsculas em português marca não apenas o início de frases e nomes próprios, mas também a importância ou unicidade de conceitos. Uma "escola" é qualquer lugar de aprendizado (minúscula), mas a "Escola de Samba do Salgueiro" é uma entidade específica e histórica (maiúscula em cada termo próprio). Da mesma forma, "presidente" é um cargo, mas "o Presidente da República" refere-se à figura institucional específica, merecendo maiúsculas. Essa distinção reflete a realidade linguística: maiúscula é um sinal de que o termo refere-se a algo único, específico, com identidade própria.',
      pergunta: 'O que diferencia o uso de maiúscula em "presidente" versus "Presidente"?',
      opcoes: [
        "Apenas preferência estilística do escritor",
        "Generidade (presidente = qualquer cargo) versus especificidade (Presidente = figura institucional única)",
        "A formalidade do texto (mais formal = mais maiúsculas)",
      ],
      correta: 1,
      explicacao:
        'Exato. "O presidente da escola" (qualquer presidente, qualquer escola, minúscula). "O Presidente da República" (figura única, institucional, maiúscula). A maiúscula marca identidade e singularidade. Quando o referente é específico, único, a maiúscula entra em cena.',
    }),
  ],
});
