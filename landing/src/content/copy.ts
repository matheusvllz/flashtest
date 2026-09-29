// Fonte ÚNICA de todo texto visível da landing (docs/40 §15.5): títulos, corpos, botões, alt, aria.
// Nenhuma string visível mora no JSX. Regras (docs/40 §9.2): zero travessão, zero "60 segundos", zero duração,
// zero número de pessoas, zero preço. Cada bloco cita o F-x da lista fechada de afirmações (docs/40 §9.4).
import { LP_FALA_DE_PRECO } from "../config";

const risco = LP_FALA_DE_PRECO ? "Sem e-mail e sem senha. Começar não custa nada." : "Sem e-mail e sem senha.";

export const MARCA = "Foca" as const;

export const META = {
  title: "Foca: preparação para o ENEM que cabe no intervalo",
  description: LP_FALA_DE_PRECO
    ? "O Foca escolhe o próximo passo dos seus estudos para o ENEM e mostra por quê. Atividades curtas, sem e-mail e sem senha para começar."
    : "O Foca escolhe o próximo passo dos seus estudos para o ENEM e mostra por quê. Atividades curtas, sem e-mail e sem senha.",
  ogAlt: "Foca: você abre e o próximo passo já está escolhido.",
  lang: "pt-BR",
} as const;

export const A11Y = {
  skip: "Pular para o conteúdo",
  navPrincipal: "Principal",
  logoLink: "Foca, início da página",
  rodape: "Rodapé",
} as const;

export const NAV = {
  comoFunciona: "Como funciona",
  duvidas: "Dúvidas",
  entrar: "Entrar",
  cta: "Começar agora", // F-4
} as const;

// S-1 Hero
export const HERO = {
  eyebrow: "Preparação para o ENEM",
  linha1: "Você abre.",
  linha2Antes: "O próximo passo já está ",
  tituloDestaque: "escolhido.", // F-1
  subtitulo: "O Foca acompanha o que você acerta e erra, escolhe o que estudar agora e mostra o motivo. Cabe no intervalo.", // F-1, F-2
  cta: "Começar agora",
  risco, // F-4, F-5 (D-LP-1)
  anotacao: "o motivo vem junto",
  fotoAlt: "Tela do Foca com a primeira atividade da lista. A Foca diz o motivo: essa travou duas vezes, vamos por partes, com calma. Abaixo, o botão Começar.",
} as const;

// S-2 A cena
export const CENA = {
  titulo: "Domingo você monta o cronograma. Na quarta, ele já ficou pra trás.",
  semanaAria: "Uma semana comum: domingo cronograma novo, segunda feito, terça metade, quarta hoje não dá, quinta segunda eu recomeço.",
  dias: [
    { dia: "Dom", nota: "cronograma novo", estado: "novo" },
    { dia: "Seg", nota: "feito", estado: "feito" },
    { dia: "Ter", nota: "metade", estado: "metade" },
    { dia: "Qua", nota: "hoje não dá", estado: "vazio" },
    { dia: "Qui", nota: "segunda eu recomeço", estado: "vazio" },
  ],
  corpo: "Material você já tem de sobra. O que pesa é decidir por onde começar toda vez e voltar depois de parar.",
  ponte: "O Foca tira essas duas decisões da sua frente.", // F-1
} as const;

// S-3 Como funciona
export const COMO_FUNCIONA = {
  titulo: "Como o Foca escolhe o que vem agora",
  passoRotulo: "Passo",
  passos: [
    {
      id: "prova",
      titulo: "Conta o que você vai prestar",
      corpo: "Prova, curso e as matérias que pesam pra você. Sem e-mail e sem senha.", // F-4
      foto: "quiz-prova",
      alt: "Tela do Foca perguntando qual prova você está estudando pra fazer, com ENEM marcado.",
    },
    {
      id: "nivelamento",
      titulo: "Se quiser, faz um nivelamento",
      corpo: "É opcional e tem o botão “Não sei”. O resultado mostra onde a base está firme e onde ainda está em construção. É um ponto de partida e muda conforme você estuda.", // F-6, F-7, F-12
      foto: "nivelamento-resultado",
      alt: "Resultado do nivelamento no Foca: sua trilha foi ajustada, com quatro áreas do ENEM, cada uma numa faixa, no caminho ou base em construção.",
    },
    {
      id: "atividade",
      titulo: "Abre e o próximo passo está ali",
      corpo: "Cada atividade vem com o motivo escrito: uma parte que travou, um assunto em que você foi bem, uma revisão na hora certa. Lições de 4 a 8 questões.", // F-1, F-3
      foto: "atividade-consolidar",
      alt: "Tela do Foca com a Foca dizendo: você foi bem nesse assunto, antes de avançar, mais umas questões pra firmar.",
    },
    {
      id: "erro",
      titulo: "Errou? Você vê onde",
      corpo: "A explicação aparece na hora. Se não bastar, “Explicar melhor” chama a Foca. Não sabe? Toca em “Não sei” em vez de chutar.", // F-7, F-8
      foto: "feedback-explicar",
      alt: "Questão de porcentagem respondida errada no Foca: a alternativa certa aparece em verde, a explicação vem na hora e há o botão Explicar melhor.",
    },
    {
      id: "revisao",
      titulo: "O que você estudou volta",
      corpo: "Na hora de revisar, o assunto que você estudou aparece de novo. Você não precisa lembrar qual era.", // F-11
      foto: "atividade-motivo",
      alt: "Tela do Foca com a Foca dizendo: já faz um tempo que você não revisa isso, vamos recuperar antes que esfrie.",
    },
  ],
} as const;

// S-4 Tenta uma
export const TENTA_UMA = {
  titulo: "Tenta uma.",
  subtitulo: "Uma questão do Foca, do jeito que ela aparece no app.",
  alternativasAria: "Alternativas",
  verificar: "Verificar", // = COPY.questao.verificar do app
  naoSei: "Não sei", // = COPY.questao.naoSei
  naoSeiAria: "Não sei a resposta desta questão",
  desabilitadoDica: "Escolha uma alternativa para verificar.",
  resultadoCerta: "Certa.",
  resultadoErrada: "Marquei aqui. Bora ver onde travou.", // fala real do app (voz.ts, slot errou)
  resultadoNaoSei: "Tudo bem. Veja como resolve:", // fala real do app (voz.ts, slot naosei)
  outraVez: "Tentar de novo",
  depois: "No app, essa resposta entra na conta do que você sabe e ajuda a escolher o que vem depois.", // F-1
  cta: "Começar agora",
  semJs: "Para responder, abre no app.",
} as const;

// S-5 Recomeço
export const RECOMECO = {
  titulo: "Parou uns dias? Continua de onde estava.", // F-14
  corpo: "Quando você volta, o app vai direto pro próximo passo. E a sequência tem congelamento: cada um cobre um dia parado. A cada 7 dias de estudo você ganha um, e dá pra guardar até 2.", // F-13, F-14
  calendarioAria: "Exemplo de semana com um dia coberto pelo congelamento.",
  congelamento: "congelamento",
  chip: "sequência mantida", // F-13, F-14
  diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
} as const;

// S-6 O que você já tem
export const JA_TEM = {
  titulo: "Continua usando o que você já usa.",
  colunaA: { rotulo: "O que você já tem", itens: ["Videoaula para entender", "Apostila com a matéria toda", "App oficial de graça"] },
  colunaB: { rotulo: "O que o Foca faz com o seu tempo", itens: ["Escolhe o que estudar hoje", "Traz de volta o que está na hora de revisar", "Mostra onde a base já firmou"] }, // F-1, F-11, F-12
} as const;

// S-7 A Foca
export const FOCA = {
  titulo: "A Foca explica quando você pede.", // F-9
  corpo: "Ela só responde quando você chama. Pergunta do seu jeito e, se quiser, manda a foto de uma questão.", // F-9, F-10 (V-1)
  corpoSemFoto: "Ela só responde quando você chama. Pergunta do seu jeito.",
  fotoAlt: "Conversa com a Foca aberta a partir de uma questão errada, com a explicação, sugestões de pergunta e um botão para enviar foto.",
  naoFazTitulo: "O que o Foca não faz",
  // F-19 nota e aprovação (`copy/06` §4: o Foca não promete), F-20 redação escrita (o app não a corrige), F-21 cobrança
  // (`15` §8, sem notificação no código). "Não te compara com outros alunos" foi descartado: o app tem um ranking de turma fictício.
  naoFaz: ["Não promete nota nem aprovação.", "Não corrige a redação que você escreve.", "Não cobra quando você some."],
} as const;

// S-8 Dúvidas
export const FAQ = {
  titulo: "Dúvidas",
  itens: [
    ...(LP_FALA_DE_PRECO
      ? [{ id: "pagar", p: "Precisa pagar?", r: "Não. Hoje você usa o Foca sem pagar nada e sem cartão." }] // F-5 (D-LP-1)
      : []),
    { id: "conta", p: "Preciso criar conta?", r: "Não precisa de e-mail nem de senha. Você responde umas perguntas sobre sua prova e já começa." }, // F-4
    { id: "progresso", p: "Onde fica meu progresso?", r: "Neste aparelho, no navegador. Se você trocar de celular ou limpar os dados do navegador, o progresso não vai junto." }, // F-15
    { id: "licao", p: "De quantas questões é uma lição?", r: "De 4 a 8 questões. Dá pra fazer uma no intervalo e parar quando quiser." }, // F-3
    { id: "cursinho", p: "Já faço cursinho. Serve pra mim?", r: "Serve pra escolher o que praticar entre uma aula e outra e pra revisar o que já viu. O Foca não substitui a aula." },
    { id: "atrasado", p: "E se eu estiver muito mal numa matéria?", r: "Tem faixa pra isso: Base em construção. O app começa pelo que falta, com lições curtas e o “Não sei” sempre liberado." }, // F-7, F-12
    { id: "redacao", p: "Tem redação?", r: "Tem lições curtas de redação. O Foca não corrige a redação que você escreve." }, // F-17, F-20 (V-3: as lições de redação usam o player legado, então não se diz "no mesmo formato")
    { id: "mec", p: "O Foca tem ligação com o MEC ou o INEP?", r: "Não. O Foca é um projeto independente de preparação para o ENEM." }, // F-18
  ],
} as const;

// S-9 Fechamento
export const FECHAMENTO = {
  tituloAntes: "O próximo passo já está ",
  tituloDestaque: "escolhido.",
  corpo: "Falta só você abrir.",
  cta: "Começar agora",
  risco,
  falaFoca: "Enquanto isso, eu volto pra minha pedra.", // única piada da página (copy/04 §3.3)
} as const;

// Navegação fixa no mobile
export const STICKY = { cta: "Começar agora" } as const;

// Rodapé
export const RODAPE = {
  tagline: "Preparação para o ENEM",
  aviso: "O Foca não tem vínculo com o INEP nem com o MEC.", // F-18
  direitos: "© 2026 Foca",
} as const;

/** Todas as seções juntas (SSR, SEO e testes). O cliente importa as constantes de que precisa, não este objeto. */
export const LP = {
  marca: MARCA,
  meta: META,
  a11y: A11Y,
  nav: NAV,
  hero: HERO,
  cena: CENA,
  comoFunciona: COMO_FUNCIONA,
  tentaUma: TENTA_UMA,
  recomeco: RECOMECO,
  jaTem: JA_TEM,
  foca: FOCA,
  faq: FAQ,
  fechamento: FECHAMENTO,
  sticky: STICKY,
  rodape: RODAPE,
} as const;

export type Lp = typeof LP;
