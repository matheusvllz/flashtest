// Fonte ÚNICA de todo texto de marketing visível da landing (docs/40 §15.5; v2: docs/42 §5): títulos, corpos, botões,
// alt, aria. Nenhuma string visível mora no JSX. O texto das TELAS DO APP fica em app-screens.ts (cópia literal do app).
// Regras (docs/40 §9.2): zero travessão, zero duração, zero número de pessoas, zero preço. "Grátis" só como "começar
// grátis" (decisão do usuário U-3, docs/42 §1). Nada de "sem conta/sem e-mail" (U-2) nem lista do que o Foca não faz (U-1).
// Cada bloco cita o F-x da lista de afirmações (docs/40 §9.4 + docs/42 §5).

export const MARCA = "Foca" as const;

/** Linha de apoio sob os CTAs: diz o que acontece depois do clique (F-1). */
const DEPOIS_DO_CLIQUE = "Você conta qual é a sua prova e o primeiro passo já aparece.";

export const META = {
  title: "Foca: o próximo passo do seu ENEM, já escolhido",
  description:
    "O Foca acompanha o que você acerta e erra, escolhe a próxima atividade do seu ENEM e mostra o motivo. Lições curtas, que cabem no intervalo. Comece grátis.",
  ogAlt: "Foca: por onde eu começo? O Foca já escolheu.",
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
  cta: "Começar grátis", // F-22
  /** Quem já tem conta neste aparelho (docs/44 §3): todos os CTAs viram este, para /app. */
  ctaComConta: "Continuar estudando",
} as const;

// S-1 Hero. A pergunta do João primeiro, a promessa do Foca depois (docs/42 §5; 14 §3, §7).
export const HERO = {
  eyebrow: "App de estudo para o ENEM",
  pergunta: "Por onde eu começo?",
  respostaAntes: "O Foca ",
  respostaDestaque: "já escolheu.", // F-1
  subtitulo: "Ele acompanha o que você acerta e erra, escolhe a próxima atividade e mostra o motivo. Cada lição cabe no intervalo.", // F-1, F-2
  cta: "Começar grátis", // F-22
  apoio: DEPOIS_DO_CLIQUE,
  anotacao: "o motivo vem junto",
  telaAria: "Tela do Foca com a próxima atividade já escolhida. A Foca diz o motivo: essa travou duas vezes, vamos por partes, com calma. Abaixo, o botão Começar.",
  /** Bilhetes do material que ele já tem (14 §1: videoaula, apostila, cronograma, feed de dica, mais um app). */
  bilhetes: ["videoaula salva", "apostila", "cronograma novo", "dica do feed"],
} as const;

// S-2 A semana (14 §2, literal na estrutura: domingo cronograma, quarta não abre, quinta culpa, sexta o feed).
export const SEMANA = {
  titulo: "Domingo você monta o cronograma. Na quarta, ele já ficou pra trás.",
  semanaAria:
    "Uma semana comum: domingo, cronograma novo. Segunda, feito. Terça, metade. Quarta, hoje não dá. Quinta, segunda eu recomeço. Sexta, no feed, a rotina perfeita de outra pessoa.",
  dias: [
    { dia: "Dom", nota: "cronograma novo", estado: "novo" },
    { dia: "Seg", nota: "feito", estado: "feito" },
    { dia: "Ter", nota: "metade", estado: "metade" },
    { dia: "Qua", nota: "hoje não dá", estado: "vazio" },
    { dia: "Qui", nota: "segunda eu recomeço", estado: "vazio" },
    { dia: "Sex", nota: "no feed, a rotina perfeita de outra pessoa", estado: "feed" },
  ],
  corpo: "Material você já tem de sobra. O que pesa é decidir por onde começar toda vez e voltar depois de parar.",
  ponte: "O Foca tira essas duas decisões da sua frente.", // F-1
} as const;

// S-3 A história (#como-funciona). Cinco cenas; cada legenda funciona sozinha (Ogilvy: legenda é um anúncio pequeno).
export const HISTORIA = {
  titulo: "Como o Foca escolhe o que vem agora",
  cenaRotulo: "Parte",
  cenas: [
    {
      id: "material",
      titulo: "Continua com a sua videoaula e a sua apostila.",
      corpo: "O Foca entra na parte que falta: escolher o que você pratica agora.", // F-1
    },
    {
      id: "prova",
      titulo: "Você conta qual é a sua prova.",
      corpo: "O curso que você quer e as matérias que pesam pra você. Com isso o Foca monta o ponto de partida.", // F-1
    },
    {
      id: "nivelamento",
      titulo: "Se quiser, faz um nivelamento.",
      corpo: "Tem “Não sei” em toda questão. O resultado mostra, área por área, onde a base está firme e onde ainda está em construção.", // F-6, F-7, F-12
    },
    {
      id: "proximo",
      titulo: "Você abre e o próximo passo está ali.",
      corpo: "Com o motivo escrito: uma parte que travou, um assunto pra firmar, uma revisão na hora certa. Cada lição tem de 4 a 8 questões.", // F-1, F-3
    },
    {
      id: "revisao",
      titulo: "O que você estudou volta na hora de revisar.",
      corpo: "Você não precisa lembrar qual era. E cada área mostra a faixa em que está, conforme você estuda.", // F-11, F-12
    },
  ],
  /** Bilhetes da primeira cena (14 §1, §3: videoaula, apostila, app oficial, feed de dica, mais um app de estudo). */
  bilhetes: ["playlist de videoaula", "apostila", "cronograma novo", "dicas salvas do feed", "app oficial", "mais um app de estudo"],
  anotacaoMotivo: "o motivo",
  anotacaoFaixa: "sua faixa muda",
} as const;

// S-4 Tenta uma (demo interativa).
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
  cta: "Começar grátis",
  semJs: "Para responder, abre no app.",
} as const;

// S-5 Errou? (substitui "A Foca, e o que a gente não promete": decisão U-1). Benefício: entender sem sair do fluxo.
export const ERROU = {
  titulo: "Errou? Entende antes de seguir.",
  corpo: "A explicação aparece ali, embaixo da questão. Se não bastar, toca em “Explicar melhor” e pergunta do seu jeito. A Foca já sabe de qual questão você está falando.", // F-8, F-9, F-23
  corpoFoto: "Também dá pra mandar a foto de uma questão.", // F-10 (V-1)
  fechamento: "Você entende, fecha e continua a lição de onde parou.", // F-8
  anotacao: "sem sair da lição",
  telaAria:
    "Animação da tela do Foca: a questão errada mostra a explicação; o aluno toca em Explicar melhor, pede à Foca que ensine do começo e recebe a explicação ali mesmo.",
} as const;

// S-6 Recomeço (14 §6: alívio, não cobrança).
export const RECOMECO = {
  titulo: "Parou uns dias? Continua de onde estava.", // F-14
  corpo: "Você abre e o próximo passo está lá, sem contagem de dias perdidos.", // F-14
  fatos: "A sequência tem congelamento: cada um cobre um dia parado. A cada 7 dias de estudo você ganha um, e dá pra guardar até 2.", // F-13
  calendarioAria: "Exemplo de semana com um dia coberto pelo congelamento e a sequência mantida.",
  congelamento: "congelamento",
  chip: "sequência mantida", // F-13, F-14
  diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
} as const;

// S-7 Dúvidas. Só respostas afirmativas (U-1); nada de conta ou aparelho (U-2).
export const FAQ = {
  titulo: "Dúvidas",
  itens: [
    { id: "gratis", p: "É grátis?", r: "Começar é. Você faz as lições da trilha e acompanha o seu progresso sem pagar nada." }, // F-22
    { id: "licao", p: "Quanto cabe numa lição?", r: "De 4 a 8 questões. Dá pra fazer uma no intervalo e parar quando quiser." }, // F-2, F-3
    { id: "material", p: "Já uso videoaula e apostila. Pra que o Foca?", r: "Continua usando. O Foca cuida de decidir o que você estuda agora e de trazer de volta o que está na hora de revisar." }, // F-1, F-11
    { id: "cursinho", p: "Já faço cursinho. Serve pra mim?", r: "Serve. Entre uma aula e outra, o Foca escolhe o que praticar e traz de volta o que você já viu." }, // F-1, F-11
    { id: "atrasado", p: "E se eu estiver muito mal numa matéria?", r: "Tem faixa pra isso: Base em construção. O Foca começa pelo que falta, com lições curtas e o “Não sei” sempre liberado." }, // F-7, F-12
    { id: "redacao", p: "Tem redação?", r: "Tem lições curtas de redação na trilha, junto com as outras matérias." }, // F-17
  ],
} as const;

// S-8 Fechamento: rima com o hero.
export const FECHAMENTO = {
  tituloAntes: "Seu próximo passo já está ",
  tituloDestaque: "escolhido.",
  corpo: "Falta só você abrir.",
  cta: "Começar grátis",
  apoio: DEPOIS_DO_CLIQUE,
  falaFoca: "Enquanto isso, eu volto pra minha pedra.", // única piada da página (copy/04 §3.3)
} as const;

// Barra fixa no celular.
export const STICKY = { cta: "Começar grátis" } as const;

// Rodapé.
export const RODAPE = {
  tagline: "Preparação para o ENEM",
  aviso: "O Foca é um projeto independente, sem vínculo com o INEP nem com o MEC.", // F-18
  direitos: "© 2026 Foca",
} as const;

/** Todas as seções juntas (SSR, SEO e testes). O cliente importa as constantes de que precisa, não este objeto. */
export const LP = {
  marca: MARCA,
  meta: META,
  a11y: A11Y,
  nav: NAV,
  hero: HERO,
  semana: SEMANA,
  historia: HISTORIA,
  tentaUma: TENTA_UMA,
  errou: ERROU,
  recomeco: RECOMECO,
  faq: FAQ,
  fechamento: FECHAMENTO,
  sticky: STICKY,
  rodape: RODAPE,
} as const;

export type Lp = typeof LP;
