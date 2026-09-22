import { multiplaEscolha, verdadeiroFalso } from "@/lib/lessons/define";
import type { Exercise } from "@/lib/lessons/types";
import type { MicroLesson } from "@/lib/learning/types";

/**
 * Citologia — membrana plasmática e organelas (docs/20 §14.1: "duas lições
 * piloto"). Fontes: conteúdo de nível médio, consistente com a matriz de
 * referência do ENEM (Ciências da Natureza) — sem alegação de procedência
 * documental além disso; revisão pedagógica por especialista ainda pendente
 * (`status: "reviewed"`, não `"published"`, até essa revisão acontecer —
 * ver docs/21).
 *
 * Convertidas para o formato v2 (docs/25 §18 T-13): ensino intercalado com
 * 4-8 questões de dificuldade progressiva, em vez de bloco único + 2
 * práticas. `mc:<id>:pratica-3` e `mc:<id>:desafio` são os dois exercícios
 * novos por lição exigidos pela tarefa, autorados aqui (sem id sugerido de
 * banco/trilha, T-13); `reviewExerciseIds` continuam intocados.
 */

export const EXERCICIOS: Record<string, Exercise> = {
  "mc:citologia-membrana:checkpoint": multiplaEscolha({
    pergunta: "Por que a membrana plasmática é chamada de \"seletivamente permeável\"?",
    opcoes: [
      "Porque ela impede a entrada e saída de qualquer substância",
      "Porque ela deixa passar todas as substâncias, sem distinção",
      "Porque ela controla quais substâncias entram e saem da célula",
      "Porque ela só existe em células vegetais",
    ],
    correta: 2,
    explicacao:
      "\"Seletivamente permeável\" quer dizer que a membrana escolhe o que passa — não bloqueia tudo, nem deixa tudo passar livremente.",
  }),
  "mc:citologia-membrana:pratica-1": multiplaEscolha({
    pergunta: "Na bicamada de fosfolipídios, as \"caudas\" (hidrofóbicas) ficam:",
    opcoes: [
      "Viradas para fora, em contato direto com a água",
      "Viradas para dentro, uma de frente para a outra",
      "Dissolvidas dentro do núcleo da célula",
      "Substituídas por proteínas na maior parte da membrana",
    ],
    correta: 1,
    explicacao:
      "As caudas hidrofóbicas se afastam da água virando-se para dentro, uma de frente para a outra — é isso que forma as DUAS camadas da bicamada.",
  }),
  "mc:citologia-membrana:pratica-2": multiplaEscolha({
    pergunta:
      "O modelo que descreve a membrana como uma estrutura fluida, com proteínas que se movem entre os fosfolipídios, é chamado de:",
    opcoes: ["Parede celular rígida", "Mosaico fluido", "Complexo golgiense", "Matriz mitocondrial"],
    correta: 1,
    explicacao:
      "\"Mosaico fluido\" é o nome do modelo: as proteínas ficam encaixadas na bicamada como peças de um mosaico, mas podem se mover — a membrana não é rígida.",
  }),
  "mc:citologia-membrana:revisao-1": verdadeiroFalso({
    afirmacao: "A membrana plasmática é uma estrutura rígida e fixa, sem nenhum movimento.",
    verdadeiro: false,
    explicacao:
      "O modelo do mosaico fluido descreve o oposto: a membrana é fluida, e as proteínas nela se movem.",
  }),
  "mc:citologia-membrana:revisao-2": multiplaEscolha({
    pergunta: "As proteínas encaixadas na membrana plasmática participam principalmente de:",
    opcoes: [
      "Transporte de substâncias e reconhecimento celular",
      "Produção de clorofila",
      "Armazenamento do DNA da célula",
      "Divisão celular exclusivamente",
    ],
    correta: 0,
    explicacao:
      "As proteínas de membrana fazem transporte (canais, bombas) e reconhecimento (receptores) — não é aí que o DNA fica, nem onde a clorofila é produzida.",
  }),

  "mc:citologia-organelas:checkpoint": multiplaEscolha({
    pergunta: "Qual organela é responsável pela síntese de proteínas na célula?",
    opcoes: ["Ribossomo", "Complexo de Golgi", "Lisossomo", "Vacúolo"],
    correta: 0,
    explicacao:
      "O ribossomo lê a informação do RNA mensageiro e monta a proteína, aminoácido por aminoácido.",
  }),
  "mc:citologia-organelas:revisao-1": verdadeiroFalso({
    afirmacao: "O retículo endoplasmático rugoso tem ribossomos grudados na sua superfície.",
    verdadeiro: true,
    explicacao:
      "É exatamente isso que o torna \"rugoso\" ao microscópio — os ribossomos aderidos à sua superfície.",
  }),
  "mc:citologia-organelas:revisao-2": multiplaEscolha({
    pergunta: "Cloroplasto está para fotossíntese assim como mitocôndria está para:",
    opcoes: [
      "Síntese de proteínas",
      "Respiração celular",
      "Digestão intracelular",
      "Divisão celular",
    ],
    correta: 1,
    explicacao:
      "Cloroplasto produz energia química a partir da luz (fotossíntese); mitocôndria produz ATP a partir da respiração celular — funções opostas e complementares.",
  }),

  "mc:citologia-membrana:pratica-3": verdadeiroFalso({
    afirmacao:
      "As \"cabeças\" hidrofílicas dos fosfolipídios ficam voltadas para o meio aquoso, dos dois lados da membrana.",
    verdadeiro: true,
    explicacao:
      "Correto — as cabeças hidrofílicas (que \"gostam\" de água) ficam voltadas para fora, em contato com a água dentro e fora da célula; as caudas hidrofóbicas se escondem entre elas.",
  }),
  "mc:citologia-membrana:desafio": multiplaEscolha({
    pergunta:
      "Uma célula vegetal é colocada em uma solução com concentração de sal maior que a do seu citoplasma (hipertônica). O que a membrana plasmática, seletivamente permeável, permite que aconteça primeiro?",
    opcoes: [
      "Entrada de sal para dentro da célula, equilibrando as concentrações",
      "Saída de água de dentro da célula para o meio externo",
      "Bloqueio total de qualquer troca entre célula e meio",
      "Entrada de proteínas do meio externo para dentro da célula",
    ],
    correta: 1,
    explicacao:
      "Em meio hipertônico, a água se move por osmose do local menos concentrado (dentro da célula) para o mais concentrado (fora) — a membrana seletiva permite a passagem de água, não de soluto.",
  }),

  "mc:citologia-organelas:pratica-3": multiplaEscolha({
    pergunta: "Qual é a função do Complexo de Golgi?",
    opcoes: [
      "Realizar a fotossíntese",
      "Receber, empacotar e enviar proteínas para o destino certo",
      "Armazenar o DNA da célula",
      "Produzir ATP através da respiração celular",
    ],
    correta: 1,
    explicacao:
      "O Golgi é o \"centro de expedição\": recebe proteínas prontas do retículo, empacota em vesículas e as envia para dentro ou fora da célula.",
  }),
  "mc:citologia-organelas:desafio": multiplaEscolha({
    pergunta:
      "Uma célula muscular precisa de grande quantidade de energia para se contrair repetidamente. Espera-se que essa célula tenha, em maior número, qual organela?",
    opcoes: ["Ribossomos", "Mitocôndrias", "Complexo de Golgi", "Cloroplastos"],
    correta: 1,
    explicacao:
      "Células com alta demanda energética (como as musculares) têm mais mitocôndrias, responsáveis pela respiração celular e produção de ATP — a organela que converte glicose em energia utilizável.",
  }),
};

export const LICOES: MicroLesson[] = [
  {
    id: "citologia-membrana",
    version: 2,
    format: 2,
    subjectId: "bio",
    topicId: "cit",
    chapterId: "bio-citologia",
    title: "A membrana plasmática",
    objective:
      "Entender por que a membrana plasmática controla o que entra e sai da célula, a partir da sua estrutura.",
    skillIds: ["bio:membrana-estrutura", "bio:membrana-funcao"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 60,
    estimatedPracticeSeconds: 150,
    steps: [
      {
        kind: "intro",
        title: "A membrana plasmática",
        body: "Entender por que a membrana plasmática controla o que entra e sai da célula, a partir da sua estrutura.",
      },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "Bicamada de fosfolipídios",
          body: "A membrana é formada por duas camadas de fosfolipídios. Cada fosfolipídio tem uma \"cabeça\" que gosta de água (hidrofílica) e uma \"cauda\" que foge da água (hidrofóbica). As caudas ficam viradas uma para a outra, escondidas da água — é isso que forma as duas camadas.",
        },
      },
      { kind: "question", exerciseId: "mc:citologia-membrana:checkpoint", role: "checkpoint", difficulty: 1 },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "Mosaico fluido",
          body: "Proteínas ficam encaixadas nessa bicamada e podem se mover — por isso o modelo se chama \"mosaico fluido\". Essas proteínas fazem o trabalho pesado: deixam substâncias específicas entrarem ou saírem, e reconhecem outras células.",
        },
      },
      { kind: "question", exerciseId: "mc:citologia-membrana:pratica-1", role: "pratica", difficulty: 1 },
      { kind: "question", exerciseId: "mc:citologia-membrana:pratica-2", role: "pratica", difficulty: 2 },
      {
        kind: "tip",
        body: "Erro comum: trocar hidrofílico (\"gosta\" de água — as cabeças) com hidrofóbico (\"foge\" da água — as caudas). Lembre: cabeça fica pra fora, perto da água; cauda se esconde no meio da bicamada.",
      },
      {
        kind: "teach",
        block: {
          type: "diagram",
          kind: "membrana-celular",
          title: "Corte transversal da membrana",
          caption: "Bicamada de fosfolipídios com proteínas encaixadas",
          accessibleDescription:
            "Duas fileiras paralelas de fosfolipídios, com as cabeças (círculos) voltadas para fora, em contato com a água de cada lado, e as caudas (linhas onduladas) voltadas para dentro, uma de frente para a outra. Entre os fosfolipídios, formas maiores representam proteínas atravessando a bicamada de um lado a outro.",
        },
      },
      { kind: "question", exerciseId: "mc:citologia-membrana:pratica-3", role: "pratica", difficulty: 2 },
      { kind: "question", exerciseId: "mc:citologia-membrana:desafio", role: "desafio", difficulty: 3 },
      {
        kind: "recap",
        body: "A membrana controla o que entra e sai da célula — a bicamada de fosfolipídios dá a barreira, e as proteínas encaixadas nela fazem a seleção.",
      },
    ],
    reviewExerciseIds: ["mc:citologia-membrana:revisao-1", "mc:citologia-membrana:revisao-2"],
    recap: "A membrana controla o que entra e sai da célula — a bicamada de fosfolipídios dá a barreira, e as proteínas encaixadas nela fazem a seleção.",
    sources: ["Matriz de referência ENEM — Ciências da Natureza e suas Tecnologias, competência de área 1"],
    reviewedAt: "2026-09-21",
  },
  {
    id: "citologia-organelas",
    version: 2,
    format: 2,
    subjectId: "bio",
    topicId: "cit",
    chapterId: "bio-citologia",
    title: "As organelas e suas funções",
    objective: "Associar cada organela citoplasmática à sua função principal.",
    skillIds: ["bio:organelas-funcao"],
    prerequisiteLessonIds: ["citologia-membrana"],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 75,
    estimatedPracticeSeconds: 150,
    steps: [
      {
        kind: "intro",
        title: "As organelas e suas funções",
        body: "Associar cada organela citoplasmática à sua função principal.",
      },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "Ribossomo: a fábrica de proteínas",
          body: "O ribossomo lê a receita trazida pelo RNA mensageiro e monta a proteína, aminoácido por aminoácido. Pode estar livre no citoplasma ou grudado no retículo endoplasmático rugoso.",
        },
      },
      { kind: "question", exerciseId: "mc:citologia-organelas:checkpoint", role: "checkpoint", difficulty: 1 },
      {
        kind: "teach",
        block: {
          type: "concept",
          title: "Complexo de Golgi: o centro de expedição",
          body: "Recebe proteínas prontas, empacota em vesículas e envia para o destino certo — dentro da célula ou para fora dela.",
        },
      },
      { kind: "question", exerciseId: "q6", role: "pratica", difficulty: 1 },
      { kind: "question", exerciseId: "q47", role: "pratica", difficulty: 2 },
      {
        kind: "tip",
        body: "Erro comum: achar que ribossomo só existe solto no citoplasma. Ele também fica grudado no retículo endoplasmático rugoso — as duas formas produzem proteína, só mudam o destino final dela.",
      },
      {
        kind: "teach",
        block: {
          type: "comparison",
          title: "Mitocôndria x cloroplasto",
          left: { label: "Mitocôndria", body: "Respiração celular: quebra glicose e produz ATP. Presente em (quase) toda célula." },
          right: { label: "Cloroplasto", body: "Fotossíntese: usa luz para produzir glicose e O₂. Só em células vegetais/algas." },
        },
      },
      { kind: "question", exerciseId: "mc:citologia-organelas:pratica-3", role: "pratica", difficulty: 2 },
      { kind: "question", exerciseId: "mc:citologia-organelas:desafio", role: "desafio", difficulty: 3 },
      {
        kind: "recap",
        body: "Cada organela tem um trabalho: ribossomo monta proteína, Golgi embala e despacha, mitocôndria e cloroplasto lidam com energia — em direções opostas.",
      },
    ],
    reviewExerciseIds: ["mc:citologia-organelas:revisao-1", "mc:citologia-organelas:revisao-2"],
    recap: "Cada organela tem um trabalho: ribossomo monta proteína, Golgi embala e despacha, mitocôndria e cloroplasto lidam com energia — em direções opostas.",
    sources: ["Matriz de referência ENEM — Ciências da Natureza e suas Tecnologias, competência de área 1"],
    reviewedAt: "2026-09-21",
  },
];
