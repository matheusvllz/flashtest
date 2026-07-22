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
 * Classes de Palavras I - Lição 05: Pronomes pessoais (eu/mim, o uso de si)
 */
export const pronomePessoal = defineLesson({
  id: "classes-1-05-pronome-pessoal",
  titulo: "Pronomes pessoais",
  descricao: "Eu, tu, ele, nós: as palavras que falam do sujeito.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um pronome pessoal?",
      opcoes: [
        "Uma palavra que substitui ou retoma o nome de uma pessoa",
        "Um nome próprio de uma pessoa",
        "Um adjetivo que descreve pessoas",
      ],
      correta: 0,
      explicacao:
        'Pronome pessoal substitui o nome: em vez de dizer "João saiu", digo "ele saiu". Poupo repetição e deixo o texto leve.',
    }),
    verdadeiroFalso({
      afirmacao: 'As formas "eu" e "mim" podem ser usadas indistintamente antes de um verbo.',
      verdadeiro: false,
      explicacao:
        'Nunca! Eu é o sujeito (eu falo). Mim é o objeto (falam comigo, para mim). O erro "para mim fazer" dói no meu coração, mas a forma certa é "para eu fazer".',
    }),
    parear({
      instrucao: "Combine cada pronome com sua função na frase",
      pares: [
        { a: "Eu gosto de dançar.", b: "Sujeito" },
        { a: "Ele fala comigo.", b: "Objeto indireto" },
        { a: "Nós estudamos juntos.", b: "Sujeito (plural)" },
        { a: "Ela viu você na festa.", b: "Objeto direto" },
      ],
      explicacao:
        "Eu, tu, ele, nós são sujeitos (quem faz). Me, te, lhe (objeto) vêm depois. Comigo, contigo, consigo vêm depois de preposição.",
    }),
    completeLacuna({
      frase: "Entre ___ e você, acho que a ideia é boa.",
      opcoes: ["mim", "eu", "me"],
      correta: 0,
      explicacao:
        'Mim vem após preposição (entre, para, de). Nunca "entre eu e você" (soaria infantil). Eu só funciona como sujeito.',
    }),
    encontreOErro({
      frase: "Se eu errar, a culpa é só minha e de vocês mesmo.",
      erroIndex: 11,
      explicacao:
        'Mesmo devia virar mesmos, concordando com "vocês" (plural). Quando esse intensificador acompanha um pronome, ele vai pro plural junto: "de vocês mesmos".',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa corretamente os pronomes pessoais?",
      opcoes: [
        "Para mim fazer a tarefa, preciso de mais tempo.",
        "Para eu fazer a tarefa, preciso de mais tempo.",
        "Para me fazer a tarefa, preciso de mais tempo.",
      ],
      correta: 1,
      explicacao:
        'Eu é sujeito do verbo "fazer". A preposição "para" pede a forma do sujeito infinitivo. Opção A é armadilha clássica, mas está errada.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O pronome "si" é reflexivo e só aparece quando o sujeito faz algo para si mesmo, como em "ele falou consigo mesmo".',
      verdadeiro: true,
      explicacao:
        'Si é reflexivo: o sujeito volta para si mesmo. "Ele falou consigo" = consigo mesmo. "Ela trouxe consigo" = ela levou consigo. Pronome refinado, mais formal.',
    }),
    completeLacuna({
      frase: "Eles cuidam muito de ___.",
      opcoes: ["si", "se", "eles"],
      correta: 0,
      explicacao:
        "Si aparece após preposição quando há reflexão (cuidam de si = cuidam de si mesmos). Se seria pronome pessoal objetivo, não funciona com preposição.",
    }),
    interpretacao({
      texto:
        'Em uma redação, o uso excessivo de "eu" e "nós" pode soar egocêntrico e até quebrar a norma culta do ENEM, que pede 3ª pessoa. Mas quando você precisa usar pronomes pessoais (em alguns gêneros textuais é obrigatório), ser preciso com eu/mim, tu/ti e ele/lhe mostra domínio da língua. Um avaliador vê logo o erro "entre eu e meu amigo" e já desconfia da sua compreensão gramatical.',
      pergunta:
        "Por que é importante usar corretamente os pronomes pessoais em uma redação formal?",
      opcoes: [
        "Porque torna o texto mais longo",
        "Porque sinaliza domínio da norma culta e credibilidade",
        "Porque o ENEM exige sempre pronomes pessoais",
      ],
      correta: 1,
      explicacao:
        "O texto diz que a precisão com pronomes mostra domínio e credibilidade. Um erro (entre eu e meu amigo) levanta dúvida sobre sua competência gramatical.",
    }),
  ],
});
