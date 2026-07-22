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
 * Lição 11: Conectivos de causa e conclusão
 */
export const conectivosCausaConclusao = defineLesson({
  id: "pontuacao-11-conectivos-causa-conclusao",
  titulo: "Conectivos de causa e conclusão",
  descricao:
    'Pontuação com "porque", "pois", "portanto", "logo": sinais que estabelecem lógica causal.',
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Conectivos de causa e conclusão sempre precisam de vírgula antes deles.",
      verdadeiro: false,
      explicacao:
        'Nem sempre. "Ele não estudou porque estava cansado" não tem vírgula porque "porque" está ligando cláusulas simples. Mas "Ele sabia que teria prova, portanto estudou bastante" pede vírgula.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase está pontuada corretamente?",
      opcoes: [
        "Ele passou porque estudou bastante todo semestre.",
        "Ele passou, porque estudou bastante todo semestre.",
        "As duas podem estar corretas, depende do contexto.",
      ],
      correta: 2,
      explicacao:
        "A primeira é natural se a causa explica diretamente o resultado. A segunda é correta se você quer destacar a causa com mais força. O contexto e o ritmo que você quer dar determinam.",
    }),
    encontreOErro({
      frase: "Não estudou logo não deveria ter passado.",
      erroIndex: 1,
      explicacao:
        '"Logo" aqui marca conclusão, "portanto". Antes dele, a vírgula avisa a virada lógica: "Não estudou, logo não deveria ter passado." Sem ela, a conclusão salta sem aviso.',
    }),
    completeLacuna({
      frase: "Ela estudou todos os dias___ portanto conseguiu uma nota excelente na prova.",
      opcoes: [",", ".", "nada"],
      correta: 0,
      explicacao:
        'Vírgula antes de "portanto" é necessária. Este conectivo conclui a ideia anterior: "Ela estudou todos os dias" é a premissa, "portanto conseguiu nota excelente" é o resultado lógico.',
    }),
    parear({
      instrucao: "Combine cada conectivo com seu papel",
      pares: [
        { a: "porque", b: "Introduz a causa de algo" },
        { a: "portanto", b: "Marca a conclusão baseada na ideia anterior" },
        { a: "pois", b: "Formal: introduz razão ou conclusão" },
      ],
      explicacao:
        '"Porque" é sempre causa. "Portanto" é sempre conclusão. "Pois" é versátil e aparece em textos formais com ambos os papéis.',
    }),
    multiplaEscolha({
      pergunta:
        'Em "Ele não tinha estudado; logo, não deveria ter passado, mas passou", qual é o papel de "logo"?',
      opcoes: [
        "Indicar que algo vai acontecer no futuro",
        "Marcar a conclusão esperada baseada na premissa anterior",
        "Indicar repetição",
      ],
      correta: 1,
      explicacao:
        '"Logo" aqui significa "portanto", "assim". Marca a conclusão: se não estudou, então (logo) não deveria ter passado. O ponto e vírgula separa as duas orações, e a vírgula logo depois de "logo" isola o conectivo, como se faz com "portanto" e "entretanto".',
    }),
    encontreOErro({
      frase:
        "A pontuação é importante para a clareza portanto todo escritor deve dominar este conhecimento.",
      erroIndex: 6,
      explicacao:
        'Falta vírgula antes de "portanto". Essas são duas ideias: premissa ("pontuação é importante") e conclusão ("todo escritor deve dominar"). Deveria ser: "A pontuação é importante para a clareza, portanto todo escritor..."',
    }),
    verdadeiroFalso({
      afirmacao:
        'Quando "pois" tem sentido de conclusão (equivale a "portanto"), o costume da norma culta é colocá-lo depois do verbo, nunca abrindo a oração.',
      verdadeiro: true,
      explicacao:
        'Isso mesmo. "Estudei bastante; passarei, pois" soa natural. Já abrir a oração com "pois" nesse sentido de conclusão foge do costume da língua. Guarda esse "pois" deslocado, viu?',
    }),
    interpretacao({
      texto: `Conectivos de causa e conclusão são a espinha dorsal de uma argumentação. Quando você escreve "Os alunos não aprendem pontuação porque os métodos tradicionais são enfadonhos, logo precisamos de estratégias mais lúdicas", está construindo um raciocínio encadeado. Cada conectivo com sua vírgula marca um passo na lógica. Em redações argumentativas, dominar esses conectivos e sua pontuação é o que diferencia um texto que persuade de um que apenas afirma.`,
      pergunta:
        "De acordo com o texto, qual é a importância de conectivos de causa e conclusão em uma argumentação?",
      opcoes: [
        "São apenas decorativos",
        "Marcam os passos da lógica e constroem persuasão",
        "Só importam em textos científicos",
      ],
      correta: 1,
      explicacao:
        "Esses conectivos são os alicerces de um argumento. Sem eles bem pontuados, o leitor não segue a lógica. Com eles, o texto persuade e convence.",
    }),
  ],
});
