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
 * Lição 09: Paralelismo sintático
 */
export const parallelismoSintatico = defineLesson({
  id: "sintaxe-2-09-paralelismo-sintatico",
  titulo: "Paralelismo sintático",
  descricao: "A simetria estrutural que torna a linguagem fluida, memorável e persuasiva.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é paralelismo sintático?",
      opcoes: [
        "Usar a mesma palavra várias vezes em uma frase",
        "Construir frases com estruturas gramaticais idênticas ou semelhantes",
        "Abreviar frases para que fiquem mais simétricas",
      ],
      correta: 1,
      explicacao:
        'Paralelismo é o alicerce da elegância: quando irmãos (orações coordenadas, termos de mesma classe) compartilham estrutura, a frase flui, respira, persuade. "Vim, vi, venci" é párallelo pela ação repetida; "Estudar, trabalhar e crescer" o é pela forma nominal.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Ela gosta de ler, escrever e de ouvir música", há quebra de paralelismo.',
      verdadeiro: true,
      explicacao:
        'As duas primeiras ações (ler, escrever) usam infinitivo simples; a terceira (ouvir) também deveria. Deveria ser "Ela gosta de ler, escrever e ouvir música" (sem segundo "de"). Paralelismo lexical: mesmo tipo gramatical para itens correlatos.',
    }),
    parear({
      pares: [
        { a: "O aluno era sério e dedicado.", b: "Paralelismo léxico (adjetivos)" },
        {
          a: "Chegou correndo, subiu rápido, respondeu tarde.",
          b: "Paralelismo rítmico (ações curtas)",
        },
        {
          a: "Nem todo estudo garante nota nem toda nota garante sucesso.",
          b: "Paralelismo semântico (negações)",
        },
        { a: "Ação, reação, reflexão.", b: "Paralelismo estrutural (nomes substantivos)" },
      ],
      explicacao:
        "Léxico: mesma classe gramatical. Rítmico: mesma duração/cadência. Semântico: mesma ideia em formas iguais. Estrutural: mesma hierarquia sintática. Cada um contribui para fluidez.",
    }),
    encontreOErro({
      frase: "O Brasil precisa de mais investimento em educação, saúde e ser mais justo.",
      erroIndex: 9,
      explicacao:
        'Paralelismo quebrado: dois nomes (educação, saúde) e, depois do "e", uma oração verbal (ser mais justo). Deveria ser "mais investimento em educação, saúde e justiça" (três nomes) ou trocar tudo por verbos. A quebra aparece bem no "e" que junta as duas estruturas diferentes.',
    }),
    completeLacuna({
      frase:
        "Estudar para compreender, trabalhar para crescer e lutar ___ transformar-se é o caminho.",
      opcoes: ["para", "de", "a"],
      correta: 0,
      explicacao:
        'Paralelismo: três infinitivas com "para" (compreender, crescer, transformar). O terceiro "para" completa a simetria estrutural. Sem ele ("lutar transformar-se"), a frase perde elegância.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase exemplifica melhor o paralelismo semântico?",
      opcoes: [
        "A educação liberta o pobre, enriquece o rico e ilumina todos.",
        "Estudar é bom. Trabalhar é bom. Descansar é bom.",
        "Alguns vêm, outros ficam, muitos se perdem.",
      ],
      correta: 0,
      explicacao:
        'Semântico é quando ideias opostas ou complementares se espelham em formas iguais. "Liberta/enriquece/ilumina" são três ações paralelas; "pobre/rico/todos" criam uma progressão (do particular ao universal).',
    }),
    ordenar({
      blocos: [
        "Ser bom aluno não é apenas tirar nota alta,",
        "é também respeitar colegas,",
        "é aprender para servir",
        "e servir para crescer.",
      ],
      explicacao:
        'Paralelismo estrutural: "não é apenas X, é também Y, é Z". Repetição do verbo "ser" estrutura cada termo. O leitor sente fluidez porque cada oração espelha a anterior.',
    }),
    interpretacao({
      texto:
        'Paralelismo é a música da linguagem. Quando um redator escreve "Fome de aprender, sede de conhecer, anseio de transformar", cria uma tríade que o leitor absorve como verdade. A mente humana ama simetria: reconhece padrão e confia. ENEM premia isso: períodos paralelos mostram domínio de linguagem, não apenas informação. Um texto que usa paralelismo parece mais convincente porque flui sem atrito. A banca sente no ritmo da leitura que o aluno não apenas escreve, mas constrói.',
      pergunta: "Por que paralelismo é tão valorizado em redações de ENEM?",
      opcoes: [
        "Porque torna o texto mais comprido",
        "Porque flui sem atrito e projeta domínio de linguagem",
        "Porque substitui argumentação real",
      ],
      correta: 1,
      explicacao:
        "Paralelismo não é enfeite: é estrutura que mostra que quem escreve pensa em proporções, em equilíbrio. A banca ENEM reconhece isso como marca de maturidade linguística.",
    }),
    encontreOErro({
      frase: "Ele falava com clareza, humildade e comunicava-se bem.",
      erroIndex: 5,
      explicacao:
        'Quebra de paralelismo: "clareza" e "humildade" (nomes) vs "comunicava-se bem" (oração verbal). Deveria ser "falava com clareza, humildade e eficiência" ou "falava claro, humilde e eficaz". Mantém a classe gramatical.',
    }),
    verdadeiroFalso({
      afirmacao: "Paralelismo é obrigatório em toda frase bem escrita.",
      verdadeiro: false,
      explicacao:
        "Paralelismo é uma ferramenta poderosa, não uma lei. Há frases boas sem paralelismo formal, mas toda frase que usa paralelismo precisa mantê-lo para ser lida como clara e persuasiva.",
    }),
  ],
});
