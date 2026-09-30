/**
 * Banco editorial: um JSON unico (historico/banco.json). Proporcional ao tamanho do projeto —
 * centenas de registros, leitura e escrita por processo curto, nada concorrente.
 *
 * Estados: ideia | em_producao | em_revisao | pronto | agendado | publicado | falhou | arquivado
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { P } from "../lib/paths.ts";

export const ESTADOS = [
  "ideia",
  "em_producao",
  "em_revisao",
  "pronto",
  "agendado",
  "publicado",
  "falhou",
  "arquivado",
] as const;
export type Estado = (typeof ESTADOS)[number];

export type Formato = "carrossel" | "post-estatico" | "reels" | "motion" | "story";

export type Registro = {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
  versao: number;
  estado: Estado;
  formato: Formato;
  pilar: string;
  tema: string;
  gancho: string;
  /** O argumento central em 1-2 frases. E o campo que a checagem de repeticao compara. */
  argumento: string;
  publico?: string;
  objetivo?: string;
  conceitoVisual?: string;
  cta?: string;
  legenda?: string;
  assets?: string[];
  /** Hash das fontes de marca usadas (snapshot.geradoEm + hashes relevantes). */
  referenciasMarca?: { snapshotEm: string; stylesCss: string | null; logoOficial: string | null };
  /** Relacao com conteudo anterior: mesmo tema por outro angulo. */
  revisita?: { de: string; diferenca: string };
  arquivos?: { pasta?: string; export?: string[]; preview?: string };
  publicacao?: {
    tentativas: {
      em: string;
      /** incerto = o pedido de publicacao saiu mas a resposta nao voltou (timeout). Conferir antes de repetir. */
      resultado: "ok" | "erro" | "simulado" | "incerto" | "em-andamento";
      chave?: string;
      modo?: "real" | "simulacao";
      mediaId?: string;
      creationId?: string;
      containerIds?: string[];
      erro?: string;
    }[];
    mediaId?: string;
    permalink?: string;
    idempotencia?: string;
  };
  agendamento?: { quando: string; fuso: string; cancelado?: boolean };
  historicoEstados?: { em: string; de: Estado | null; para: Estado }[];
  notas?: string;
};

type Banco = { versaoEsquema: 1; registros: Registro[] };

function vazio(): Banco {
  return { versaoEsquema: 1, registros: [] };
}

export function ler(): Banco {
  if (!existsSync(P.banco)) return vazio();
  const b = JSON.parse(readFileSync(P.banco, "utf8")) as Banco;
  if (!Array.isArray(b.registros)) return vazio();
  return b;
}

export function gravar(b: Banco) {
  mkdirSync(P.historico, { recursive: true });
  writeFileSync(P.banco, JSON.stringify(b, null, 2) + "\n");
}

/** ID estavel: AAAAMMDD-formato-slug. Colisao ganha sufixo -2, -3… */
export function novoId(formato: Formato, tema: string, quando = new Date()) {
  const d = quando.toISOString().slice(0, 10).replace(/-/g, "");
  const slug = normalizar(tema).slice(0, 4).join("-") || "sem-tema";
  const base = `${d}-${formato}-${slug}`;
  const b = ler();
  if (!b.registros.some((r) => r.id === base)) return base;
  for (let i = 2; ; i++)
    if (!b.registros.some((r) => r.id === `${base}-${i}`)) return `${base}-${i}`;
}

export function obter(id: string) {
  return ler().registros.find((r) => r.id === id) ?? null;
}

export function salvar(reg: Registro) {
  const b = ler();
  const i = b.registros.findIndex((r) => r.id === reg.id);
  reg.atualizadoEm = new Date().toISOString();
  if (i >= 0) b.registros[i] = reg;
  else b.registros.push(reg);
  gravar(b);
  return reg;
}

export function criar(
  r: Omit<Registro, "criadoEm" | "atualizadoEm" | "versao" | "historicoEstados">,
) {
  const agora = new Date().toISOString();
  return salvar({
    ...r,
    criadoEm: agora,
    atualizadoEm: agora,
    versao: 1,
    historicoEstados: [{ em: agora, de: null, para: r.estado }],
  } as Registro);
}

export function mudarEstado(id: string, para: Estado) {
  const r = obter(id);
  if (!r) throw new Error(`conteudo ${id} nao existe no banco`);
  const de = r.estado;
  r.estado = para;
  r.historicoEstados = [...(r.historicoEstados ?? []), { em: new Date().toISOString(), de, para }];
  return salvar(r);
}

/** Sobe a versao preservando a anterior. O ID nunca muda. */
export function novaVersao(id: string, mudancas: Partial<Registro>) {
  const r = obter(id);
  if (!r) throw new Error(`conteudo ${id} nao existe no banco`);
  const anterior = { ...r };
  const atualizado = { ...r, ...mudancas, versao: r.versao + 1 } as Registro;
  salvar(atualizado);
  return { anterior, atualizado };
}

// ---------------------------------------------------------------------------
// Checagem de repeticao — comparacao real, nao promessa
// ---------------------------------------------------------------------------

const VAZIAS = new Set(
  "a o as os um uma de do da dos das em no na nos nas por para com que e ou se ao aos e mais menos seu sua seus suas voce eu ele ela isso este esta esse essa nao sim ja so muito pouco todo toda todos todas quando onde como porque qual quais entao mas nem tambem ate sobre sem".split(
    " ",
  ),
);

export function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !VAZIAS.has(t));
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

function trigramas(s: string) {
  const t = normalizar(s).join(" ");
  const g = new Set<string>();
  for (let i = 0; i + 3 <= t.length; i++) g.add(t.slice(i, i + 3));
  return g;
}

/**
 * Semelhanca entre duas propostas. 0 a 1. Pesa gancho (40 %), argumento (40 %) e tema (20 %),
 * cada um combinando Jaccard de palavras com trigramas (pega parafrase curta e troca de palavra).
 */
export function semelhanca(
  a: { gancho: string; argumento: string; tema: string },
  b: { gancho: string; argumento: string; tema: string },
) {
  const par = (x: string, y: string) =>
    0.6 * jaccard(new Set(normalizar(x)), new Set(normalizar(y))) +
    0.4 * jaccard(trigramas(x), trigramas(y));
  return (
    0.4 * par(a.gancho, b.gancho) + 0.4 * par(a.argumento, b.argumento) + 0.2 * par(a.tema, b.tema)
  );
}

export type Achado = {
  id: string;
  estado: Estado;
  score: number;
  gancho: string;
  tema: string;
  motivo: string;
};

/**
 * Compara uma proposta com TODO o historico (inclusive ideias nao produzidas e conteudo nao publicado).
 * >= 0,55 = repeticao provavel (barra) · 0,35 a 0,55 = mesmo terreno (exige angulo declarado).
 */
export function checarRepeticao(
  prop: { gancho: string; argumento: string; tema: string },
  limite = 0.35,
): Achado[] {
  return ler()
    .registros.filter((r) => r.estado !== "arquivado")
    .map((r) => {
      const score = semelhanca(prop, r);
      return {
        id: r.id,
        estado: r.estado,
        score: Number(score.toFixed(3)),
        gancho: r.gancho,
        tema: r.tema,
        motivo: score >= 0.55 ? "repeticao provavel" : "mesmo terreno",
      };
    })
    .filter((a) => a.score >= limite)
    .sort((a, b) => b.score - a.score);
}
