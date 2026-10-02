/**
 * Tarefas de escrita (spec 50 §5.10.1–5.10.2, T-50.11.1 e T-50.11.3) — parte pura, usada pela tela e pelo servidor.
 *
 * - `validarTarefaDeEscrita`: o validador do tipo `escrita` (R-ESC-9): enunciado, tema de treino, instrução, texto de
 *   apoio opcional, limites coerentes com o modo e **nenhum gabarito**.
 * - `checagemAutomatica`: a checagem sem IA, para todos os planos — tamanho, parágrafos, linhas estimadas, conectivos,
 *   repetição de palavras e os 5 elementos da proposta. Olha a estrutura, **não dá nota**.
 */
import { COPY } from "@/lib/copy";
import type { WritingTask } from "@/lib/lessons/types";
import {
  ELEMENTOS_DA_PROPOSTA,
  LINHAS_DA_FOLHA,
  LINHAS_MINIMAS_ENEM,
  PARTE_MAX,
  PARTE_MIN,
  TEMAS_DE_TREINO,
  TEXTO_MAX,
  TEXTO_MIN,
  linhasEstimadas,
  paragrafosDe,
  type ElementoDaProposta,
} from "@/lib/redacao-ia";

export { CARACTERES_POR_LINHA, LINHAS_DA_FOLHA, LINHAS_MINIMAS_ENEM, linhasEstimadas, paragrafosDe } from "@/lib/redacao-ia";

export type ModoDeEscrita = WritingTask["modo"];

/** Tamanhos aceitos (§5.10.1): trecho 20–1.500 caracteres; texto completo 400–5.000. */
export const LIMITES_DA_ESCRITA: Record<ModoDeEscrita, { min: number; max: number }> = {
  trecho: { min: PARTE_MIN, max: PARTE_MAX },
  completo: { min: TEXTO_MIN, max: TEXTO_MAX },
};

/** XP da primeira vez de cada tarefa (nova fonte C-XP, §5.10.2); as seguintes dão 0. */
export const XP_DA_TAREFA = 10;

/** Minúsculas e sem acento: "Além" e "alem" contam como a mesma coisa. */
function simplificar(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Conectivos e expressões de coesão mais usados no texto dissertativo-argumentativo (forma simplificada). */
export const CONECTIVOS: readonly string[] = [
  "alem disso",
  "ademais",
  "outrossim",
  "no entanto",
  "entretanto",
  "contudo",
  "todavia",
  "porem",
  "mas",
  "portanto",
  "logo",
  "assim",
  "dessa forma",
  "desse modo",
  "por isso",
  "pois",
  "porque",
  "ja que",
  "uma vez que",
  "visto que",
  "consequentemente",
  "por conseguinte",
  "em primeiro lugar",
  "em segundo lugar",
  "por fim",
  "finalmente",
  "em suma",
  "em sintese",
  "nesse sentido",
  "nesse contexto",
  "diante disso",
  "a medida que",
  "embora",
  "ainda que",
  "apesar de",
  "sobretudo",
  "ou seja",
  "isto e",
  "por exemplo",
  "de acordo com",
  "conforme",
  "enquanto",
];

export function conectivosUsados(texto: string): string[] {
  const t = simplificar(texto);
  return CONECTIVOS.filter((c) => new RegExp(`(?<![\\p{L}])${c.replace(/ /g, "\\s+")}(?![\\p{L}])`, "u").test(t));
}

/** Palavras de 5+ letras que não pesam na repetição (artigos longos, pronomes, advérbios comuns). */
const NAO_CONTAM = new Set(
  [
    "sobre", "entre", "quando", "tambem", "ainda", "muito", "muitos", "muita", "muitas", "mesmo", "mesma", "assim",
    "porque", "sendo", "podem", "estao", "essas", "esses", "nesse", "nessa", "dessa", "desse", "desta", "deste",
    "nesta", "neste", "aquele", "aquela", "pelos", "pelas", "outro", "outra", "outros", "outras", "todos", "todas",
    "cada", "seus", "suas", "deles", "delas", "entao", "apenas", "sempre", "antes", "depois", "quanto", "alem",
    "porem", "contudo", "portanto", "embora", "isso", "isto", "como", "para", "pois", "onde", "qual", "quais",
    "seja", "forma", "modo", "maior", "menor", "parte", "dessas", "desses", "nessas", "nesses", "desses", "tanto",
    "esta", "este", "estas", "estes", "possui", "possuem", "devem", "deve", "precisa", "precisam", "fazer", "feito",
  ].map(simplificar),
);

export function palavrasRepetidas(texto: string, minimo: number): { palavra: string; vezes: number }[] {
  const contagem = new Map<string, { palavra: string; vezes: number }>();
  for (const bruta of texto.match(/\p{L}+/gu) ?? []) {
    const chave = simplificar(bruta);
    if (chave.length < 5 || NAO_CONTAM.has(chave)) continue;
    const atual = contagem.get(chave);
    if (atual) atual.vezes += 1;
    else contagem.set(chave, { palavra: bruta.toLowerCase(), vezes: 1 });
  }
  return [...contagem.values()]
    .filter((x) => x.vezes >= minimo)
    .sort((a, b) => b.vezes - a.vezes || a.palavra.localeCompare(b.palavra))
    .slice(0, 3);
}

export function elementosDaProposta(texto: string): Record<ElementoDaProposta, boolean> {
  return Object.fromEntries(ELEMENTOS_DA_PROPOSTA.map((e) => [e.nome, e.sinais.test(texto)])) as Record<ElementoDaProposta, boolean>;
}

export interface ItemDaChecagem {
  id: "tamanho" | "paragrafos" | "linhas" | "conectivos" | "repeticao" | "proposta";
  /** `atencao` = vale olhar de novo; nunca é erro nem nota. */
  estado: "ok" | "atencao";
  texto: string;
}

export interface Checagem {
  modo: ModoDeEscrita;
  caracteres: number;
  palavras: number;
  paragrafos: number;
  frases: number;
  linhas: number;
  conectivos: string[];
  repetidas: { palavra: string; vezes: number }[];
  /** Elementos da proposta encontrados (no último parágrafo do texto completo), ou `null` quando não se aplica. */
  elementos: Record<ElementoDaProposta, boolean> | null;
  itens: ItemDaChecagem[];
}

/** Checagem automática sem IA (§5.10.2). Determinística: o mesmo texto dá sempre a mesma checagem. */
export function checagemAutomatica(texto: string, modo: ModoDeEscrita, opcoes: { checaProposta?: boolean } = {}): Checagem {
  const c = COPY.escrita.checagem;
  const t = texto.trim();
  const paragrafos = paragrafosDe(t);
  const palavras = (t.match(/\p{L}[\p{L}\p{N}'-]*/gu) ?? []).length;
  const frases = t.split(/[.!?]+/).filter((f) => f.trim().length > 0).length;
  const linhas = linhasEstimadas(t);
  const conectivos = conectivosUsados(t);
  const repetidas = palavrasRepetidas(t, modo === "completo" ? 5 : 3);
  const comProposta = modo === "completo" || !!opcoes.checaProposta;
  const alvoDaProposta = modo === "completo" ? (paragrafos[paragrafos.length - 1] ?? "") : t;
  const elementos = comProposta ? elementosDaProposta(alvoDaProposta) : null;
  const limites = LIMITES_DA_ESCRITA[modo];
  const itens: ItemDaChecagem[] = [];

  itens.push({
    id: "tamanho",
    estado: t.length < limites.min || t.length > limites.max ? "atencao" : "ok",
    texto: t.length < limites.min ? c.tamanhoCurto(t.length, limites.min) : c.tamanho(t.length, palavras),
  });

  if (modo === "completo") {
    const n = paragrafos.length;
    itens.push({ id: "paragrafos", estado: n < 3 || n > 6 ? "atencao" : "ok", texto: n < 3 || n > 6 ? c.paragrafosFora(n) : c.paragrafos(n) });
    itens.push({
      id: "linhas",
      estado: linhas <= LINHAS_MINIMAS_ENEM || linhas > LINHAS_DA_FOLHA ? "atencao" : "ok",
      texto: linhas <= LINHAS_MINIMAS_ENEM ? c.linhasPoucas(linhas) : linhas > LINHAS_DA_FOLHA ? c.linhasDemais(linhas) : c.linhas(linhas),
    });
    itens.push({
      id: "conectivos",
      estado: conectivos.length < 4 ? "atencao" : "ok",
      texto: conectivos.length < 4 ? c.conectivosPoucos(conectivos.length) : c.conectivos(conectivos.length),
    });
  } else {
    if (paragrafos.length > 1) itens.push({ id: "paragrafos", estado: "atencao", texto: c.trechoParagrafos(paragrafos.length) });
    itens.push({ id: "linhas", estado: "ok", texto: c.linhasTrecho(linhas) });
    const semConectivo = frases >= 2 && conectivos.length === 0;
    itens.push({
      id: "conectivos",
      estado: semConectivo ? "atencao" : "ok",
      texto: semConectivo ? c.trechoSemConectivo : conectivos.length ? c.conectivos(conectivos.length) : c.trechoUmaFrase,
    });
  }

  itens.push(
    repetidas.length
      ? { id: "repeticao", estado: "atencao", texto: c.repetidas(repetidas.map((r) => c.repetida(r.palavra, r.vezes)).join(", ")) }
      : { id: "repeticao", estado: "ok", texto: c.semRepeticao },
  );

  if (elementos) {
    const faltam = (Object.keys(elementos) as ElementoDaProposta[]).filter((k) => !elementos[k]);
    const nomes = COPY.redacaoIa.automaticos.elementos;
    itens.push(
      faltam.length
        ? { id: "proposta", estado: "atencao", texto: c.propostaFaltam(faltam.map((k) => nomes[k]).join(", "), modo === "completo") }
        : { id: "proposta", estado: "ok", texto: c.propostaCompleta },
    );
  }

  return { modo, caracteres: t.length, palavras, paragrafos: paragrafos.length, frases, linhas, conectivos, repetidas, elementos, itens };
}

/* --------------------------------------------------------------------- validador --- */

const ID_DE_TAREFA = /^[a-z0-9-]{3,64}$/;

/** Validador do tipo `escrita` (R-ESC-9). Lista vazia = tarefa válida. */
export function validarTarefaDeEscrita(t: WritingTask): string[] {
  const erros: string[] = [];
  const e = t.exercicio;
  const onde = `tarefa ${t.id}`;
  if (!ID_DE_TAREFA.test(t.id)) erros.push(`${onde}: id fora do padrão [a-z0-9-]`);
  if (!t.titulo.trim()) erros.push(`${onde}: sem título`);
  if (t.autoria !== "foca") erros.push(`${onde}: sem o rótulo de autoria do Foca`);
  if (e.type !== "escrita") erros.push(`${onde}: tipo diferente de "escrita"`);
  for (const campo of ["enunciado", "tema", "instrucao"] as const) {
    if (!e[campo]?.trim()) erros.push(`${onde}: ${campo} vazio`);
  }
  if (!TEMAS_DE_TREINO.includes(e.tema)) erros.push(`${onde}: tema fora dos temas de treino`);
  // Sem gabarito: nenhum campo de resposta certa pode existir num exercício de escrita.
  for (const proibido of ["correta", "gabarito", "resposta", "opcoes"]) {
    if (proibido in (e as unknown as Record<string, unknown>)) erros.push(`${onde}: escrita não tem ${proibido}`);
  }
  const limites = LIMITES_DA_ESCRITA[t.modo];
  if (!limites) erros.push(`${onde}: modo desconhecido`);
  else if (e.limites.min < limites.min || e.limites.max > limites.max || e.limites.min >= e.limites.max) {
    erros.push(`${onde}: limites ${e.limites.min}–${e.limites.max} fora de ${limites.min}–${limites.max}`);
  }
  if (e.textoDeApoio) {
    if (!e.textoDeApoio.rotulo.trim() || !e.textoDeApoio.texto.trim()) erros.push(`${onde}: texto de apoio incompleto`);
    if (e.textoDeApoio.texto.length > PARTE_MAX) erros.push(`${onde}: texto de apoio longo demais`);
  }
  if (limites && (t.modelo.texto.trim().length < e.limites.min || t.modelo.texto.trim().length > e.limites.max)) {
    erros.push(`${onde}: texto-modelo fora dos limites da própria tarefa (${t.modelo.texto.trim().length})`);
  }
  if (t.modelo.comentarios.length < 2 || t.modelo.comentarios.some((c) => !c.trim())) erros.push(`${onde}: texto-modelo precisa de 2+ comentários`);
  if (t.modo === "completo" && linhasEstimadas(t.modelo.texto) <= LINHAS_MINIMAS_ENEM) erros.push(`${onde}: modelo completo com poucas linhas`);
  return erros;
}

/** Valida um catálogo: cada tarefa, ids únicos e nó depois de uma lição que existe na trilha. */
export function validarCatalogoDeEscrita(tarefas: readonly WritingTask[], licoesPorTrilha: Record<string, readonly string[]>): string[] {
  const erros = tarefas.flatMap(validarTarefaDeEscrita);
  const vistos = new Set<string>();
  for (const t of tarefas) {
    if (vistos.has(t.id)) erros.push(`tarefa ${t.id}: id repetido`);
    vistos.add(t.id);
    if (!licoesPorTrilha[t.trilhaId]?.includes(t.depoisDe)) erros.push(`tarefa ${t.id}: lição ${t.depoisDe} não está na trilha ${t.trilhaId}`);
  }
  return erros;
}
