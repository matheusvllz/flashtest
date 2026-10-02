/**
 * Catálogo de planos, produtos e benefícios (spec 49 D49-01, D49-05, D49-07, D49-10; §5.1). Fonte única: preço e
 * benefício mudam aqui, com decisão registrada — nunca por variável de ambiente nem vindo do cliente. Puro (sem
 * servidor, sem store): o servidor decide o plano do aluno (`src/server/planos/plano.ts`); as telas só mostram.
 */

export type Plano = "gratis" | "basic" | "pro";

/** Ordem de valor: quando há mais de uma assinatura válida, vale a maior. */
export const ORDEM_DOS_PLANOS: readonly Plano[] = ["gratis", "basic", "pro"];

export function planoMaior(a: Plano, b: Plano): Plano {
  return ORDEM_DOS_PLANOS.indexOf(a) >= ORDEM_DOS_PLANOS.indexOf(b) ? a : b;
}

export type Funcao =
  | "cadernoDeErros"
  | "cronograma"
  | "semInternet"
  | "simulado"
  | "explicaOutroJeito"
  | "treinoRedacao"
  | "corretorRedacao";

export interface Beneficios {
  anuncios: boolean;
  vidasIlimitadas: boolean;
  iaMensagensDia: number;
  iaFotosDia: number;
  /** Uso justo mensal da Foca IA (escrito nos termos); `null` = sem teto mensal além do diário. */
  iaUsoJustoMes: number | null;
  protetoresBonusMes: number;
  protetoresEstoqueMax: number;
  correcoesRedacaoMes: number;
  funcoes: readonly Funcao[];
}

export const BENEFICIOS: Readonly<Record<Plano, Beneficios>> = {
  gratis: {
    anuncios: true,
    vidasIlimitadas: false,
    iaMensagensDia: 3,
    iaFotosDia: 0,
    iaUsoJustoMes: null,
    protetoresBonusMes: 0,
    protetoresEstoqueMax: 2,
    correcoesRedacaoMes: 0,
    funcoes: [],
  },
  basic: {
    anuncios: false,
    vidasIlimitadas: true,
    iaMensagensDia: 15,
    iaFotosDia: 3,
    iaUsoJustoMes: 300,
    protetoresBonusMes: 2,
    protetoresEstoqueMax: 4,
    correcoesRedacaoMes: 0,
    funcoes: ["cadernoDeErros", "cronograma", "semInternet"],
  },
  pro: {
    anuncios: false,
    vidasIlimitadas: true,
    iaMensagensDia: 30,
    iaFotosDia: 8,
    iaUsoJustoMes: 500,
    protetoresBonusMes: 5,
    protetoresEstoqueMax: 7,
    correcoesRedacaoMes: 10,
    funcoes: ["cadernoDeErros", "cronograma", "semInternet", "simulado", "explicaOutroJeito", "treinoRedacao", "corretorRedacao"],
  },
};

export function temFuncao(plano: Plano, funcao: Funcao): boolean {
  return BENEFICIOS[plano].funcoes.includes(funcao);
}

/** Vidas por dia no Free (D49-03): 5, renovadas à meia-noite do fuso do aluno; o anúncio dá +1 uma vez por dia. */
export const VIDAS_POR_DIA = 5;
export const VIDAS_POR_ANUNCIO_DIA = 1;

export type CodigoProduto =
  | "basic_mensal"
  | "basic_anual"
  | "pro_mensal"
  | "pro_anual"
  | "protetor_1"
  | "protetor_3"
  | "protetor_7";

export interface ProdutoAssinatura {
  tipo: "assinatura";
  plano: Exclude<Plano, "gratis">;
  periodo: "mensal" | "anual";
  centavos: number;
}

export interface ProdutoProtetor {
  tipo: "protetor";
  quantidade: number;
  centavos: number;
}

export type Produto = ProdutoAssinatura | ProdutoProtetor;

/** Preços em centavos (D49-01; protetores D49-05 — o Asaas não cobra menos de R$ 5,00 por cobrança). */
export const PRODUTOS: Readonly<Record<CodigoProduto, Produto>> = {
  basic_mensal: { tipo: "assinatura", plano: "basic", periodo: "mensal", centavos: 2490 },
  basic_anual: { tipo: "assinatura", plano: "basic", periodo: "anual", centavos: 20990 },
  pro_mensal: { tipo: "assinatura", plano: "pro", periodo: "mensal", centavos: 3990 },
  pro_anual: { tipo: "assinatura", plano: "pro", periodo: "anual", centavos: 32990 },
  protetor_1: { tipo: "protetor", quantidade: 1, centavos: 590 },
  protetor_3: { tipo: "protetor", quantidade: 3, centavos: 1290 },
  protetor_7: { tipo: "protetor", quantidade: 7, centavos: 2490 },
};

export const CODIGOS_DE_PRODUTO = Object.keys(PRODUTOS) as CodigoProduto[];

export function ehCodigoDeProduto(x: unknown): x is CodigoProduto {
  return typeof x === "string" && (CODIGOS_DE_PRODUTO as string[]).includes(x);
}

/** Valor mínimo de uma cobrança no Asaas (centavos). Nenhum produto pode ficar abaixo. */
export const MINIMO_COBRANCA_CENTAVOS = 500;

/** "R$ 24,90" — formatação única para telas e e-mails. */
export function formatarReais(centavos: number): string {
  return `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;
}

/** Equivalente mensal e desconto do anual sobre 12 mensais (mostrados na tela de planos, §5.1). */
export function resumoDoAnual(plano: Exclude<Plano, "gratis">): { totalCentavos: number; porMesCentavos: number; descontoPct: number } {
  const anual = PRODUTOS[`${plano}_anual`] as ProdutoAssinatura;
  const mensal = PRODUTOS[`${plano}_mensal`] as ProdutoAssinatura;
  const porMesCentavos = Math.floor(anual.centavos / 12);
  const descontoPct = Math.round((1 - anual.centavos / (mensal.centavos * 12)) * 1000) / 10;
  return { totalCentavos: anual.centavos, porMesCentavos, descontoPct };
}

/** Nome do produto para telas e e-mails ("plano Basic mensal"). */
export const NOME_DO_PRODUTO: Readonly<Record<CodigoProduto, string>> = {
  basic_mensal: "plano Basic mensal",
  basic_anual: "plano Basic anual",
  pro_mensal: "plano Pro mensal",
  pro_anual: "plano Pro anual",
  protetor_1: "1 protetor de sequência",
  protetor_3: "pacote de 3 protetores de sequência",
  protetor_7: "pacote de 7 protetores de sequência",
};

/**
 * Entregas da spec 49 já publicadas (§13). Benefício de entrega não publicada aparece como "em breve" na tela de
 * planos: vender função que ainda não existe seria propaganda enganosa (CDC art. 37). Atualizar a cada entrega.
 */
export type Entrega = "E1" | "E2" | "E3";
export const ENTREGAS_PUBLICADAS: ReadonlySet<Entrega> = new Set<Entrega>(["E1", "E2", "E3"]);
