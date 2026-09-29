// Texto das TELAS DO APP refeitas em HTML na landing (docs/42 §5, F-24). Cópia LITERAL do app: nada aqui é copy de
// marketing, e nenhuma skill de copy mexe nestas strings (copy/05: enunciado, alternativas e explicação são conteúdo
// pedagógico). tests/unit/app-screens.test.ts confere cada string contra o código do app em ../src.
// Referência visual: os retratos capturados do app em assets-src/shots/ (bun run shots).

/** Tela de atividade da trilha, motivo `reforco-erros` (COPY.jornada.motivos). Hero e cena "próximo passo". */
export const TELA_ATIVIDADE = {
  trilha: "Porcentagem", // content/microlicoes/matematica/porcentagem.ts
  tipo: "Reforço", // lib/copy.ts
  habilidade: "Entender porcentagem como fração de 100", // content/taxonomy/skills/mat.ts
  motivo: "Essa travou duas vezes. Vamos por partes, com calma.", // COPY.jornada.motivos["reforco-erros"]
  botao: "Começar", // COPY.licao.comecar
} as const;

/** Mesma tela, motivo `revisao-atrasada`. Cena "revisão". */
export const TELA_REVISAO = {
  trilha: "Porcentagem",
  tipo: "Revisão", // COPY.jornada.kinds.revisao
  habilidade: "Entender porcentagem como fração de 100",
  motivo: "Já faz um tempo que você não revisa isso. Vamos recuperar antes que esfrie.", // COPY.jornada.motivos["revisao-atrasada"]
  botao: "Começar",
} as const;

/** Onboarding, passo "Sua prova" (routes/quiz.tsx, COPY.onboarding). */
export const TELA_PROVA = {
  voltar: "Voltar",
  marca: "Foca",
  bloco: "Sua prova", // COPY.*.blocoSuaProva
  titulo: "Qual prova você está estudando pra fazer?", // COPY.*.examTitulo
  opcoes: ["ENEM", "PAS/UnB", "Outro vestibular"], // data/exams.ts, COPY.*.outroVestibular
} as const;

/** Resultado do nivelamento (routes/nivelamento.tsx, COPY.nivelamento). Faixas: 1 construção, 2 caminho, 3 firme. */
export const TELA_NIVELAMENTO = {
  titulo: "Pronto. Sua trilha foi ajustada.", // COPY.nivelamento.resultadoTitulo
  corpo: "Isso é um ponto de partida, não uma nota. Muda conforme você estuda.", // COPY.nivelamento.resultadoCorpo
  areas: [
    { nome: "Linguagens, Códigos e suas Tecnologias", faixa: 2 }, // content/taxonomy/areas.ts
    { nome: "Matemática e suas Tecnologias", faixa: 1 },
    { nome: "Ciências da Natureza e suas Tecnologias", faixa: 2 },
    { nome: "Ciências Humanas e suas Tecnologias", faixa: 1 },
  ],
  faixas: ["Base em construção", "No caminho", "Base firme"], // COPY.nivelamento.faixa*
  precisao: "Poucas questões. Vamos confirmar estudando.", // COPY.nivelamento.precisaoPoucas
  porOnde: "Por onde começamos", // COPY.nivelamento.porOndeComecamos
  primeiraPrefixo: "Sua primeira atividade:", // COPY.nivelamento.primeiraAtividade
  primeiraTipo: "Prática", // COPY.jornada.kinds.pratica
  primeiraHabilidade: "Resolver expressões numéricas com as quatro operações e potenciação", // content/taxonomy/skills/mat.ts
  primeiraMotivo: "Rápido: só pra confirmar que esse fundamento está firme.", // COPY.jornada.motivos["confirmar-fundamento"]
  botao: "Começar",
} as const;

/** Questão com a folha de feedback aberta (components/lessons/FeedbackSheet.tsx). Item real do banco:
 *  content/banco/mat/mat-porcentagem-conceito.json. O aluno marcou "50" (A); a certa é "40" (C). */
export const TELA_QUESTAO = {
  trilha: "Porcentagem",
  tipo: "Prática",
  habilidade: "Entender porcentagem como fração de 100",
  pergunta: "Se 50% de uma turma são meninas e há 20 meninas, quantos alunos há no total?",
  opcoes: ["50", "45", "40", "35"],
  escolhida: 0,
  correta: 2,
  fala: "Marquei aqui. Bora ver onde travou.", // voz.ts, slot errou
  explicacao: "50% significa metade. Se metade = 20, então o total = 20 × 2 = 40 alunos. Quando é 50%, o total é o dobro da quantidade que você tem.",
  explicarMelhor: "Explicar melhor", // COPY.feedback.explicarMelhor
  continuar: "Continuar", // COPY.feedback.continuar
} as const;

/** Balão da Foca aberto por "Explicar melhor" (components/TutorBubble.tsx, COPY.tutor). A resposta é a do app sem a
 *  chave de IA (lib/tutor-prompt.ts, localFallback: "Você marcou X, mas o certo é Y. {explicação}"), a mesma do
 *  retrato capturado em assets-src/shots/tutor-balao-*.png. */
export const TELA_TUTOR = {
  nome: "Foca", // COPY.tutor.nome
  falandoSobre: "Falando sobre:", // COPY.tutor.falandoSobre
  contexto: ["Porcentagem", "Prática", "Entender porcentagem como fração de 100", "Matemática"],
  pedido: "Me ensina isso do começo.", // COPY.tutor.ensinarDoZero
  respostaInicio: "Você marcou A, mas o certo é C.", // tutor-prompt.ts, localFallback
  sugestoes: ["Por que minha resposta está errada?", "Explica de forma mais simples", "Me dá outra parecida"], // COPY.tutor.sugestoesErro
  placeholder: "Pergunta qualquer coisa...", // COPY.tutor.placeholder
} as const;
