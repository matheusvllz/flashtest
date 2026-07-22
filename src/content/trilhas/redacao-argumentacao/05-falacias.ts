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
 * Lição 05: Falácias que derrubam nota
 */
export const falacias = defineLesson({
  id: "redacao-argumentacao-05-falacias",
  titulo: "Falácias que derrubam nota",
  descricao:
    "Reconhecer argumentos falhos antes de cometê-los: apelo à autoridade cega, generalização, petição de princípio.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma falácia argumentativa?",
      opcoes: [
        "Um argumento que finge ser forte mas é logicamente fraco ou infundado",
        "Qualquer citação de um especialista",
        "Uma opinião que não concorda com a maioria",
      ],
      correta: 0,
      explicacao:
        "Falácia é o arranha-céu construído sobre areia. Parece forte à primeira vista, mas quando você tira os sapatos e caminha por dentro, não há chão. A banca enxerga isso na estrutura do seu argumento.",
    }),
    parear({
      instrucao: "Associe cada falácia ao seu exemplo",
      pares: [
        {
          a: '"Bill Gates é bilionário, então educação online é a solução para pobreza."',
          b: "Apelo à autoridade (argumento ad verecundiam)",
        },
        {
          a: '"Todos os adolescentes veem pornô, portanto, proibir não funciona."',
          b: "Generalização indevida (argumento ad populum)",
        },
        {
          a: '"Temos que punir bandido porque bandido é bandido."',
          b: "Petição de princípio (argumento circular)",
        },
        {
          a: '"Se você não concorda com educação sexual na escola, é retrógrado."',
          b: "Ataque à pessoa em vez do argumento (ad hominem)",
        },
      ],
      explicacao:
        "Cada falácia tem um nome e um defeito estrutural. Conheça os nomes, reconheça os defeitos, evite-os em seu texto. A banca vê quando alguém pensa com clareza versus quando cai em armadilhas lógicas.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Uma frase que começa com "é óbvio que" está provavelmente construindo uma petição de princípio.',
      verdadeiro: true,
      explicacao:
        'Verdade. "É óbvio" é um sinal de alerta: você está AFIRMANDO em vez de DEMONSTRAR. Se precisar dizer "óbvio", provavelmente não é. Mostre a estrutura lógica, não passe a verdade como axioma.',
    }),
    completeLacuna({
      frase:
        "Citar um especialista sem analisar o argumento dele é um apelo à ___, uma falácia comum.",
      opcoes: ["autoridade", "emoção", "tradição"],
      correta: 0,
      explicacao:
        "Ad verecundiam é o nome técnico: você se esconde no prestígio alheio em vez de PENSAR. Especialista é base, não escudo. Mostre por que o argumento DELE é sólido.",
    }),
    encontreOErro({
      frase: "Ninguém questiona a importância da família porque família é importante.",
      erroIndex: 6,
      explicacao:
        'Isso é petição de princípio: você prova a tese usando a tese mesma como axioma. "Importante porque é importante" não é argumento. Mostre POR QUE é importante: qual função exerce, que estudos comprovam, que consequências vêm de sua ausência.',
    }),
    multiplaEscolha({
      pergunta: "Qual dessas frases evita falácia?",
      opcoes: [
        '"Vidro é sólido, logo, diamante é sólido, portanto, vidro é diamante."',
        '"Alguns estudos indicam que exercício reduz depressão. Portanto, exercício frequente é ferramenta eficaz complementar no tratamento."',
        '"É claro que redes sociais viciam porque vício é ruim."',
      ],
      correta: 1,
      explicacao:
        'Nota a diferença: a opção correta reconhece a limitação ("alguns estudos"), a implicação real ("complementar", não "cura total") e diferencia conclusão de afirmação. Sem generalização, sem círculo, sem obviedade forçada.',
    }),
    interpretacao({
      texto:
        'Argumento comum: "A maioria das crianças gosta de açúcar, então crianças naturalmente gostam de açúcar, portanto, controlar açúcar é cárcere injusto." O erro? Confunde preferência com necessidade biológica e generaliza "maioria" para "natureza essencial". A realidade é que preferência adquirida (construída por marketing) não é dado biológico. Logo, regulação alimentar em escolas não é cárcere; é pedagogia de saúde.',
      pergunta: "Qual falácia predomina no argumento criticado?",
      opcoes: [
        "Apelo à autoridade",
        'Generalização: elevar observação de frequência ("maioria gosta") a lei biológica ("naturalmente gostam")',
        "Petição de princípio",
      ],
      correta: 1,
      explicacao:
        'A armadilha está aqui: "maioria" é frequência social; "naturalmente" é afirmação sobre essência. Um dado comportamental não prova lei da natureza. A banca vê quando alguém tira conclusão demais de premissa fraca.',
    }),
    verdadeiroFalso({
      afirmacao: "Usar dados estatísticos garante que você não cometeu nenhuma falácia.",
      verdadeiro: false,
      explicacao:
        'Não. Você pode ter um dado REAL mas tirar conclusão mentirosa dele. "90% dos ricos estudaram em escola privada" é dado. "Logo, escola privada garante sucesso" é falácia: esqueceu a correlação ao inverso (muitos pobres também estudaram em privada e não ficaram ricos) e os fatores de confusão (conexões familiares, patrimônio).',
    }),
    multiplaEscolha({
      pergunta: "Qual estratégia reduz o risco de cair em falácia argumentativa?",
      opcoes: [
        "Usar palavras complicadas para parecer erudito",
        'Testar cada afirmação: "Por QUE isso é verdade? Há contra-exemplo? Estou generalizando?"',
        "Repetir o mesmo argumento várias vezes para convencer",
      ],
      correta: 1,
      explicacao:
        "Questionamento é a melhor ferramenta. Antes de digitar, pergunta a si mesmo se o argumento resiste a crítica. Se não resiste, não é estrutura; é barraco. Meu trabalho é carpintaria séria.",
    }),
  ],
});
