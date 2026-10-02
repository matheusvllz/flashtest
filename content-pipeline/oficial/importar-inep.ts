#!/usr/bin/env bun
/**
 * Importador automático de questões do ENEM a partir dos PDFs públicos do INEP (spec 50 §5.9.2, T-50.9.3–9.6;
 * decisão 0008). Offline: nada em `src/` importa este arquivo.
 *
 *   bun run content:importar-inep -- --ano 2023 [--dia 1] [--seco] [--relatorio]
 *
 * Passos: (1) baixa prova e gabarito da lista versionada `inep/provas.json` para `cache/` (sha256 registrado);
 * (2) extrai o texto por página (pdf.js) e separa questão, enunciado, alternativas A–E e créditos impressos;
 * (3) desenha cada página a 4× no Chromium do Playwright e recorta as figuras pela caixa, sem retoque, em WebP
 * (≤ 80 KB, até 1200 px); (4) liga o gabarito oficial, tira anuladas e marca língua estrangeira (espanhol fica
 * fora: não há habilidade de espanhol na taxonomia); (5) valida cada questão — falhou, vai para "não importado"
 * com o motivo; (6) com `--relatorio`, gera `relatorios/<ano>-d<dia>.html` com 10% das questões sorteadas,
 * recorte da página ao lado do item; (7) grava os itens em `src/content/banco/oficial/<ano>-<materia>.json` e
 * as imagens em `src/content/banco/oficial/img/<ano>/`.
 *
 * Regra dura 8 e CC BY-ND: enunciado, alternativas, gabarito e imagens ficam como no original. Itens oficiais
 * que já existiam e não foram feitos por este importador (as 18 transcritas de 2023) nunca são reescritos: o
 * importador os reconhece pela referência e só compara o texto no relatório.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ExerciseImage, ExerciseTable, MultipleChoiceExercise } from "@/lib/lessons/types";
import type { ItemMeta } from "@/content/items/types";
import { semMarcadores } from "@/lib/lessons/marcadores";
import {
  buildItemMetaOficial,
  officialItemId,
  type ItemOficialEntrada,
} from "../../scripts/content/import-official-items";
import { validarMidia } from "../../scripts/content/validate";
import { areaDaQuestao, classificar, type Classificacao } from "./inep/classificar";
import { analisarPagina, calhaDaPagina, fontesDeLetra, recortar } from "./inep/figuras";
import { lerGabarito } from "./inep/gabarito";
import {
  caracteresQuebrados,
  extrairQuestoes,
  similaridade,
  textoIlegivel,
  type PaginaParaLer,
} from "./inep/parser";
import { extrairPaginas } from "./inep/pdf";
import { abrirPdfNoNavegador, fecharNavegador } from "./inep/render";
import type { FiguraDetectada, QuestaoExtraida } from "./inep/tipos";

const RAIZ = "content-pipeline/oficial";
const CACHE = join(RAIZ, "cache");
const LISTA = join(RAIZ, "inep", "provas.json");
const RELATORIOS = join(RAIZ, "relatorios");
const BANCO = "src/content/banco/oficial";
const IMG = join(BANCO, "img");
const ESCALA = 4;
export const REVISOR = "importador-inep";

export interface ProvaListada {
  ano: number;
  dia: 1 | 2;
  caderno: number;
  prova: string;
  gabarito: string;
  sha256Prova?: string;
  sha256Gabarito?: string;
}

interface ItemBanco {
  id: string;
  exercise: MultipleChoiceExercise;
  meta: ItemMeta;
  retired?: boolean;
}

export interface NaoImportada {
  numero: number;
  idioma?: string;
  motivo: string;
}

interface ItemGerado {
  numero: number;
  subjectId: string;
  item: ItemBanco;
  classificacao: Classificacao;
  questao: QuestaoExtraida;
  imagens: Array<{ caminho: string; webp: Buffer }>;
  similaridade: number;
}

/** Frase fixa da explicação enquanto a explicação gerada (e marcada como IA) não existe. */
export function explicacaoPendente(letra: string): string {
  return `Gabarito oficial: alternativa ${letra}. Peça para a Foca IA explicar o raciocínio.`;
}

export function refDaQuestao(
  ano: number,
  dia: number,
  caderno: number,
  cor: string,
  numero: number,
  idioma?: string,
): string {
  const lingua = idioma === "ingles" ? " (inglês)" : idioma === "espanhol" ? " (espanhol)" : "";
  return `ENEM ${ano} · ${dia}º dia · caderno ${caderno} ${cor} · questão ${numero}${lingua}`;
}

/** A descrição não pode entregar a resposta: nem o texto da alternativa correta, nem "alternativa X"/"letra X". */
export function descricaoEntregaResposta(descricao: string, opcaoCorreta: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const d = ` ${norm(descricao)} `;
  const c = norm(opcaoCorreta);
  if (c.length >= 4 && d.includes(` ${c} `)) return true;
  return /\b(alternativa|letra|opcao|resposta)\s+[a-e]\b/i.test(norm(descricao));
}

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

async function baixar(url: string, destino: string): Promise<Buffer> {
  if (existsSync(destino)) return readFileSync(destino);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} → ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, buf);
  return buf;
}

function lerLista(): { _leia: string; provas: ProvaListada[] } {
  return JSON.parse(readFileSync(LISTA, "utf-8"));
}

function nomeCache(p: ProvaListada, tipo: "PV" | "GB"): string {
  return join(CACHE, `${p.ano}_D${p.dia}_CD${p.caderno}_${tipo}.pdf`);
}

/** Baixa (ou usa o cache), confere e registra o sha256 na lista versionada. */
async function obterPdfs(p: ProvaListada): Promise<{ prova: string; gabarito: string }> {
  const lista = lerLista();
  const registro = lista.provas.find((x) => x.ano === p.ano && x.dia === p.dia)!;
  let mudou = false;
  for (const tipo of ["PV", "GB"] as const) {
    const destino = nomeCache(p, tipo);
    const buf = await baixar(tipo === "PV" ? p.prova : p.gabarito, destino);
    const hash = sha256(buf);
    const campo = tipo === "PV" ? "sha256Prova" : "sha256Gabarito";
    if (registro[campo] && registro[campo] !== hash) {
      throw new Error(
        `${destino}: sha256 diferente do registrado (${registro[campo]} × ${hash}). O PDF mudou no INEP; confira antes de importar.`,
      );
    }
    if (!registro[campo]) {
      registro[campo] = hash;
      mudou = true;
    }
  }
  if (mudou) writeFileSync(LISTA, `${JSON.stringify(lista, null, 2)}\n`, "utf-8");
  return { prova: nomeCache(p, "PV"), gabarito: nomeCache(p, "GB") };
}

function corDoCaderno(paginas: { itens: { str: string }[] }[], caderno: number): string {
  for (const p of paginas.slice(1, 6)) {
    const t = p.itens
      .map((i) => i.str)
      .join(" ")
      .replace(/\s+/g, " ");
    const m = t.match(new RegExp(`CADERNO\\s*${caderno}\\s*[•\\-|–]\\s*([A-ZÇÃÉÍÓÚÂÊ]+)`, "i"));
    if (m) return m[1].toLowerCase();
  }
  return "";
}

/** Itens oficiais já publicados por ano, com a referência decomposta. */
function itensExistentes(ano: number): Map<string, ItemBanco[]> {
  const out = new Map<string, ItemBanco[]>();
  if (!existsSync(BANCO)) return out;
  for (const f of readdirSync(BANCO)) {
    if (!f.startsWith(`${ano}-`) || !f.endsWith(".json")) continue;
    const json = JSON.parse(readFileSync(join(BANCO, f), "utf-8")) as { items: ItemBanco[] };
    out.set(f, json.items);
  }
  return out;
}

function chaveDaRef(ref: string | undefined): string | null {
  const m = ref?.match(/(\d)º dia .*questão (\d{1,3})(?: \((inglês|espanhol)\))?/);
  return m ? `${m[1]}:${Number(m[2])}:${m[3] ?? ""}` : null;
}

function normEspaco(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Comparação tolerante só para o relatório: ignora estilo de aspas, parênteses, colchetes e espaço. */
function semTipografia(s: string): string {
  return s
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[()[\]\s]/g, "");
}

export interface ResultadoProva {
  ano: number;
  dia: number;
  caderno: number;
  cor: string;
  encontradas: number;
  gerados: ItemGerado[];
  mantidos: Array<{
    numero: number;
    id: string;
    textoIgual: boolean;
    /** Igual depois de tirar aspas tipográficas, parênteses e colchetes (a transcrição de 2023 normalizou isso). */
    igualSemTipografia: boolean;
    gabaritoIgual: boolean;
    diferenca?: string;
  }>;
  naoImportadas: NaoImportada[];
  paginasPng: Map<number, Buffer>;
}

function primeiraDiferenca(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return `posição ${i}: «${a.slice(Math.max(0, i - 30), i + 40)}» × «${b.slice(Math.max(0, i - 30), i + 40)}»`;
}

export async function processarProva(p: ProvaListada): Promise<ResultadoProva> {
  const pdfs = await obterPdfs(p);
  const paginas = await extrairPaginas(pdfs.prova);
  const gab = lerGabarito(
    await extrairPaginas(pdfs.gabarito),
    p.dia === 1 ? { de: 1, ate: 90 } : { de: 91, ate: 180 },
  );
  const letras = fontesDeLetra(paginas);
  const cor = corDoCaderno(paginas, p.caderno);
  const render = await abrirPdfNoNavegador(pdfs.prova);
  const paraLer: PaginaParaLer[] = [];
  const paginasPng = new Map<number, Buffer>();
  for (const pagina of paginas) {
    if (pagina.numero === 1) continue; // capa e instruções
    const png = await render.desenhar(pagina.numero, ESCALA);
    paginasPng.set(pagina.numero, png);
    const analise = await analisarPagina(png, ESCALA, pagina, letras);
    paraLer.push({
      numero: pagina.numero,
      largura: pagina.largura,
      altura: pagina.altura,
      itens: pagina.itens.filter((i) => !analise.absorvidos.has(i)),
      figuras: analise.figuras,
      faixa: analise.faixa,
      marcas: analise.marcas,
      calha: calhaDaPagina(pagina, analise.faixa),
    });
  }
  await render.fechar();
  const questoes = extrairQuestoes(paraLer, letras);

  const existentes = itensExistentes(p.ano);
  const porChave = new Map<string, ItemBanco>();
  for (const itens of existentes.values()) {
    for (const it of itens) {
      const k = chaveDaRef(it.meta.source.ref);
      if (k) porChave.set(k, it);
    }
  }

  const res: ResultadoProva = {
    ano: p.ano,
    dia: p.dia,
    caderno: p.caderno,
    cor,
    encontradas: questoes.length,
    gerados: [],
    mantidos: [],
    naoImportadas: [],
    paginasPng,
  };
  const vistas = new Set<string>();
  const faixa = p.dia === 1 ? [1, 90] : [91, 180];
  for (const q of questoes) {
    const idiomaRef = q.idioma === "ingles" ? "inglês" : q.idioma === "espanhol" ? "espanhol" : "";
    const chave = `${p.dia}:${q.numero}:${idiomaRef}`;
    if (q.numero < faixa[0] || q.numero > faixa[1]) continue;
    if (vistas.has(chave)) {
      res.naoImportadas.push({
        numero: q.numero,
        idioma: q.idioma,
        motivo: "número de questão repetido na extração",
      });
      continue;
    }
    vistas.add(chave);
    const fora = (motivo: string) =>
      res.naoImportadas.push({ numero: q.numero, idioma: q.idioma, motivo });

    const g = gab.get(q.numero);
    const resposta = g
      ? q.numero <= 5 && p.dia === 1
        ? g.respostas[q.idioma === "espanhol" ? 1 : 0]
        : g.respostas[0]
      : undefined;
    const existente = porChave.get(chave);
    if (existente && existente.meta.validation.reviewer !== REVISOR) {
      // Item transcrito antes (as 18 de 2023): nunca reescrito. Só a comparação.
      const letraEx = "ABCDE"[existente.exercise.correta];
      const gerado = montarExercicio(q, p, cor, resposta ?? "?");
      const textoGerado = gerado.ok
        ? `${gerado.ex.pergunta} | ${gerado.ex.opcoes.join(" | ")}`
        : "";
      const textoExistente = `${existente.exercise.pergunta} | ${existente.exercise.opcoes.join(" | ")}`;
      res.mantidos.push({
        numero: q.numero,
        id: existente.id,
        textoIgual: gerado.ok && normEspaco(textoGerado) === normEspaco(textoExistente),
        igualSemTipografia:
          gerado.ok && semTipografia(textoGerado) === semTipografia(textoExistente),
        gabaritoIgual: resposta === letraEx,
        diferenca: gerado.ok
          ? primeiraDiferenca(normEspaco(textoGerado), normEspaco(textoExistente))
          : gerado.motivo,
      });
      continue;
    }
    if (q.idioma === "espanhol") {
      fora("espanhol: não há habilidade de espanhol na taxonomia");
      continue;
    }
    if (!resposta) {
      fora("sem gabarito no PDF de gabarito");
      continue;
    }
    if (resposta === "ANULADA") {
      fora("anulada no gabarito oficial");
      continue;
    }
    const textoExtraido = [
      ...q.blocos.map((b) => (b.tipo === "texto" ? b.texto : "")),
      ...q.alternativas.map((a) => a.texto),
    ].join(" ");
    // eslint-disable-next-line no-control-regex -- procura justamente caractere de controle (fonte quebrada)
    if (textoIlegivel(textoExtraido) || /[\u0000-\u0008\u000E-\u001F]/.test(textoExtraido)) {
      fora("texto do PDF ilegível (fonte sem mapa Unicode; só daria com OCR)");
      continue;
    }
    if (q.problemas.length) {
      fora(q.problemas.join("; "));
      continue;
    }
    const montado = montarExercicio(q, p, cor, resposta);
    if (!montado.ok) {
      fora(montado.motivo);
      continue;
    }
    const { ex, figuras } = montado;
    // Rede de segurança: o texto cita uma figura, mas nenhuma foi recortada (imagem que não desenhou, figura clara
    // demais para a detecção). Sem a figura a questão fica incompleta.
    const citaFigura =
      /\b(na|da|pela|nesta|nessa|desta|dessa|a seguinte|o seguinte|no|do|pelo|neste|nesse) (figura|imagem|charge|tirinha|gráfico|mapa|fotografia|foto|cartaz|infográfico|ilustração|esquema)\b/i;
    const temFigura = figuras.some((f) => !f.figura.sintetica);
    if (!temFigura && citaFigura.test(semMarcadores(ex.pergunta))) {
      fora("o texto cita uma figura, mas nenhuma figura foi achada na página");
      continue;
    }
    const textoTabelas = (ex.tabelas ?? []).flatMap((t) => [...t.cabecalho, ...t.linhas.flat()]);
    const textoTodo = [semMarcadores(ex.pergunta), ...ex.opcoes, ...textoTabelas].join("\n");
    const quebra = caracteresQuebrados(textoTodo);
    if (quebra) {
      fora(`texto com ${quebra}`);
      continue;
    }
    const montadoBruto = [
      ...q.blocos.map((b) =>
        b.tipo === "texto" ? b.texto : [b.figura.textos.join(""), b.credito ?? ""].join(""),
      ),
      ...q.alternativas.map((a) => a.texto + a.figuras.map((f) => f.textos.join("")).join("")),
    ].join("");
    const sim = similaridade(montadoBruto, q.textoBruto);
    if (sim < 0.97) {
      fora(`texto montado difere do texto da página (similaridade ${sim.toFixed(3)})`);
      continue;
    }
    const alta = figuras.find((f) => f.figura.y1 - f.figura.y0 > 0.8 * 700);
    if (alta) {
      fora("figura do tamanho da página (recorte suspeito)");
      continue;
    }
    // Recortes.
    const imagens: Array<{ caminho: string; webp: Buffer }> = [];
    let falhaImagem = "";
    for (const f of figuras) {
      const png = res.paginasPng.get(f.figura.pagina);
      if (!png) {
        falhaImagem = `página ${f.figura.pagina} sem desenho`;
        break;
      }
      const r = await recortar(png, ESCALA, f.figura, { margem: f.figura.sintetica ? 0 : 2 });
      if (r.webp.length > 80 * 1024)
        falhaImagem = `imagem ${f.nome} com ${Math.round(r.webp.length / 1024)} KB (> 80 KB)`;
      f.imagem.largura = r.largura;
      f.imagem.altura = r.altura;
      imagens.push({ caminho: join(IMG, String(p.ano), f.nome), webp: r.webp });
    }
    if (falhaImagem) {
      fora(falhaImagem);
      continue;
    }
    const midia = validarMidia(ex, { oficial: true });
    if (midia.length) {
      fora(`mídia: ${midia.map((m) => m.message).join("; ")}`);
      continue;
    }
    const classificacao = classificar(q.numero, textoTodo, q.idioma);
    const entrada: ItemOficialEntrada = {
      ano: p.ano,
      ref: refDaQuestao(p.ano, p.dia, p.caderno, cor, q.numero, q.idioma),
      area: areaDaQuestao(q.numero),
      skillId: classificacao.skillId,
      difficulty: 3,
      exercise: ex,
    };
    const meta = buildItemMetaOficial(entrada);
    meta.validation = {
      status: "oficial-conferida",
      reviewedAt: meta.validation.reviewedAt,
      reviewer: REVISOR,
      reviewKind: "gabarito-oficial",
    };
    meta.explicacaoPendente = true;
    // Fora do pool do nivelamento: a habilidade foi classificada por palavra-chave (confiança no relatório) e
    // ainda não há explicação. Entra em prática e revisão; o papel "diagnostico" fica para depois da revisão.
    meta.roles = ["pratica", "revisao"];
    const id = officialItemId(entrada);
    res.gerados.push({
      numero: q.numero,
      subjectId: classificacao.skillId.split(":")[0],
      item: { id, exercise: ex, meta: { ...meta, id } },
      classificacao,
      questao: q,
      imagens,
      similaridade: sim,
    });
  }
  // Caderno com fonte sem mapa Unicode na maior parte: nem as poucas que passaram são confiáveis.
  const ilegiveis = res.naoImportadas.filter((n) =>
    n.motivo.startsWith("texto do PDF ilegível"),
  ).length;
  if (ilegiveis > questoes.length * 0.5) {
    for (const g of res.gerados)
      res.naoImportadas.push({
        numero: g.numero,
        idioma: g.questao.idioma,
        motivo: `caderno com texto ilegível em ${ilegiveis} questões; a prova inteira fica fora por segurança`,
      });
    res.gerados = [];
  }
  // Questões do caderno que nem apareceram na extração.
  for (let n = faixa[0]; n <= faixa[1]; n++) {
    const idiomas = p.dia === 1 && n <= 5 ? ["inglês", "espanhol"] : [""];
    for (const idi of idiomas) {
      if (!vistas.has(`${p.dia}:${n}:${idi}`)) {
        res.naoImportadas.push({
          numero: n,
          idioma: idi === "inglês" ? "ingles" : idi === "espanhol" ? "espanhol" : undefined,
          motivo: 'marcador "QUESTÃO" não encontrado na extração',
        });
      }
    }
  }
  return res;
}

interface FiguraNomeada {
  figura: FiguraDetectada;
  nome: string;
  imagem: ExerciseImage;
}

type Montagem =
  | { ok: true; ex: MultipleChoiceExercise; figuras: FiguraNomeada[] }
  | { ok: false; motivo: string };

/** Monta o exercício no formato dos itens oficiais (sem alterar texto: só junta blocos e marca posições). */
export function montarExercicio(
  q: QuestaoExtraida,
  p: { ano: number; dia: number },
  _cor: string,
  resposta: string,
): Montagem {
  const letraIdx = "ABCDE".indexOf(resposta);
  const sufixo = q.idioma === "ingles" ? "-ing" : q.idioma === "espanhol" ? "-esp" : "";
  const base = `d${p.dia}-q${String(q.numero).padStart(3, "0")}${sufixo}`;
  const figuras: FiguraNomeada[] = [];
  const imagens: ExerciseImage[] = [];
  const partes: string[] = [];
  const opcoesTexto = q.alternativas.map((a) => a.texto);
  const correta = letraIdx >= 0 ? (opcoesTexto[letraIdx] ?? "") : "";
  const alt = (n: number) =>
    `Imagem${n > 0 ? ` ${n + 1}` : ""} da questão ${q.numero} do ENEM ${p.ano} (descrição em revisão)`;
  const tabelas: ExerciseTable[] = [];
  for (const b of q.blocos) {
    if (b.tipo === "texto") partes.push(b.texto);
    else if (b.figura.tabela) {
      // Tabela com texto extraível: vira tabela HTML; o crédito impresso segue como texto logo abaixo.
      tabelas.push({ cabecalho: b.figura.tabela.cabecalho, linhas: b.figura.tabela.linhas });
      partes.push(`[[tabela:${tabelas.length - 1}]]`);
      if (b.credito) partes.push(b.credito);
    } else {
      const n = imagens.length;
      const nome = `${base}-${n + 1}.webp`;
      const descricaoBruta = b.figura.textos.join("\n").trim();
      const img: ExerciseImage = {
        url: `/content/img/${p.ano}/${nome}`,
        alt: b.figura.sintetica
          ? `Trecho com fórmula ou símbolo da questão ${q.numero} do ENEM ${p.ano} (descrição em revisão)`
          : alt(n),
        altAutomatico: true,
      };
      // A descrição de recorte de fórmula ficaria com o texto quebrado que motivou o recorte: não vai.
      if (
        !b.figura.sintetica &&
        descricaoBruta &&
        !descricaoEntregaResposta(descricaoBruta, correta)
      )
        img.descricao = `Texto na imagem: ${descricaoBruta}`;
      if (b.credito) img.credito = b.credito;
      imagens.push(img);
      figuras.push({ figura: b.figura, nome, imagem: img });
      partes.push(`[[imagem:${n}]]`);
    }
  }
  const pergunta = partes.join("\n\n").trim();
  if (!pergunta) return { ok: false, motivo: "enunciado vazio" };
  const opcoes: string[] = [];
  const opcoesImagem: (ExerciseImage | null)[] = [];
  for (const a of q.alternativas) {
    if (a.figuras.length > 1)
      return { ok: false, motivo: `alternativa ${a.letra} com mais de uma figura` };
    if (a.figuras.length === 1) {
      const nome = `${base}-alt-${a.letra.toLowerCase()}.webp`;
      const img: ExerciseImage = {
        url: `/content/img/${p.ano}/${nome}`,
        alt: `Imagem da alternativa ${a.letra} da questão ${q.numero} do ENEM ${p.ano} (descrição em revisão)`,
        altAutomatico: true,
      };
      const desc = a.figuras[0].textos.join("\n").trim();
      if (desc && !descricaoEntregaResposta(desc, correta) && a.letra !== resposta)
        img.descricao = `Texto na imagem: ${desc}`;
      opcoesImagem.push(img);
      figuras.push({ figura: a.figuras[0], nome, imagem: img });
      opcoes.push(a.texto || `Alternativa ${a.letra} (imagem)`);
    } else {
      if (!a.texto) return { ok: false, motivo: `alternativa ${a.letra} vazia` };
      opcoesImagem.push(null);
      opcoes.push(a.texto);
    }
  }
  if (new Set(opcoes.map((o) => normEspaco(o).toLowerCase())).size !== 5)
    return { ok: false, motivo: "alternativas repetidas na extração" };
  const ex: MultipleChoiceExercise = {
    type: "multipla-escolha",
    pergunta,
    opcoes,
    correta: letraIdx,
    explicacao: explicacaoPendente(resposta),
    fonte: `ENEM ${p.ano}`,
  };
  if (imagens.length) ex.imagens = imagens;
  if (tabelas.length) ex.tabelas = tabelas;
  if (opcoesImagem.some((o) => o !== null)) ex.opcoesImagem = opcoesImagem;
  if (letraIdx < 0) return { ok: false, motivo: `gabarito inválido "${resposta}"` };
  return { ok: true, ex, figuras };
}

/** Grava os itens do ano: troca os itens deste importador dos dias processados, mantém todos os outros. */
function gravar(ano: number, resultados: ResultadoProva[]): void {
  const dias = new Set(resultados.map((r) => r.dia));
  const dirImg = join(IMG, String(ano));
  if (existsSync(dirImg)) {
    for (const f of readdirSync(dirImg))
      if ([...dias].some((d) => f.startsWith(`d${d}-`))) rmSync(join(dirImg, f));
  }
  mkdirSync(dirImg, { recursive: true });
  const existentes = itensExistentes(ano);
  const porArquivo = new Map<string, ItemBanco[]>();
  for (const [f, itens] of existentes) {
    porArquivo.set(
      f,
      itens.filter((it) => {
        if (it.meta.validation.reviewer !== REVISOR) return true;
        const k = chaveDaRef(it.meta.source.ref);
        return !k || !dias.has(Number(k.split(":")[0]));
      }),
    );
  }
  const datasAntigas = new Map<string, string>();
  for (const itens of existentes.values())
    for (const it of itens)
      if (it.meta.validation.reviewedAt) datasAntigas.set(it.id, it.meta.validation.reviewedAt);
  for (const r of resultados) {
    for (const g of r.gerados) {
      const f = `${ano}-${g.subjectId}.json`;
      const lista = porArquivo.get(f) ?? [];
      const data = datasAntigas.get(g.item.id);
      if (data) g.item.meta.validation.reviewedAt = data;
      lista.push(g.item);
      porArquivo.set(f, lista);
      for (const img of g.imagens) writeFileSync(img.caminho, img.webp);
    }
  }
  const ordem = (it: ItemBanco) => {
    const k = chaveDaRef(it.meta.source.ref);
    return k
      ? Number(k.split(":")[1]) * 10 + (k.endsWith("espanhol") ? 2 : k.endsWith("inglês") ? 1 : 0)
      : 0;
  };
  for (const [f, itens] of porArquivo) {
    if (!itens.length) {
      if (existsSync(join(BANCO, f))) rmSync(join(BANCO, f));
      continue;
    }
    const subjectId = f.replace(/^\d{4}-/, "").replace(/\.json$/, "");
    const ordenados = [...itens].sort((a, b) => ordem(a) - ordem(b));
    writeFileSync(
      join(BANCO, f),
      `${JSON.stringify({ subjectId, items: ordenados }, null, 2)}\n`,
      "utf-8",
    );
  }
}

function embaralharDeterministico<T>(xs: T[], semente: string, chave: (x: T) => string): T[] {
  return [...xs].sort((a, b) => {
    const ha = createHash("sha256")
      .update(`${semente}:${chave(a)}`)
      .digest("hex");
    const hb = createHash("sha256")
      .update(`${semente}:${chave(b)}`)
      .digest("hex");
    return ha.localeCompare(hb);
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Relatório da prova: resumo versionado em JSON + HTML com a amostra (recortes gerados localmente). */
async function relatorio(r: ResultadoProva, gerarHtml: boolean): Promise<string[]> {
  mkdirSync(RELATORIOS, { recursive: true });
  const nome = `${r.ano}-d${r.dia}`;
  const amostra = embaralharDeterministico(r.gerados, nome, (g) => String(g.numero)).slice(
    0,
    Math.max(1, Math.ceil(r.gerados.length * 0.1)),
  );
  const resumo = {
    prova: `ENEM ${r.ano} · ${r.dia}º dia · caderno ${r.caderno} ${r.cor}`,
    geradoEm: new Date().toISOString().slice(0, 10),
    questoesNoCaderno: r.dia === 1 ? 95 : 90,
    extraidas: r.encontradas,
    importadas: r.gerados.length,
    mantidasDeAntes: r.mantidos,
    comImagem: r.gerados.filter((g) => g.item.exercise.imagens?.length).length,
    comAlternativaImagem: r.gerados.filter((g) => g.item.exercise.opcoesImagem).length,
    comTabela: r.gerados.filter((g) => g.item.exercise.tabelas?.length).length,
    naoImportadas: r.naoImportadas.sort((a, b) => a.numero - b.numero),
    classificacao: r.gerados.map((g) => ({
      numero: g.numero,
      id: g.item.id,
      skillId: g.classificacao.skillId,
      confianca: g.classificacao.confianca,
      pistas: g.classificacao.pistas.slice(0, 4),
    })),
    amostra: amostra.map((g) => ({ numero: g.numero, id: g.item.id })),
  };
  writeFileSync(join(RELATORIOS, `${nome}.json`), `${JSON.stringify(resumo, null, 2)}\n`, "utf-8");
  if (!gerarHtml) return [];
  const dir = join(RELATORIOS, nome);
  mkdirSync(dir, { recursive: true });
  const blocos: string[] = [];
  const recortes: string[] = [];
  const sharp = (await import("sharp")).default;
  for (const g of amostra) {
    const imgs: string[] = [];
    // Regiões da mesma página que se sobrepõem viram uma (não repete o recorte).
    const regioes: typeof g.questao.regioes = [];
    for (const r0 of g.questao.regioes) {
      const o = regioes.find(
        (x) =>
          x.pagina === r0.pagina && x.x0 < r0.x1 && r0.x0 < x.x1 && x.y0 < r0.y1 && r0.y0 < x.y1,
      );
      if (o)
        Object.assign(o, {
          x0: Math.min(o.x0, r0.x0),
          y0: Math.min(o.y0, r0.y0),
          x1: Math.max(o.x1, r0.x1),
          y1: Math.max(o.y1, r0.y1),
        });
      else regioes.push({ ...r0 });
    }
    for (const reg of regioes) {
      const png = r.paginasPng.get(reg.pagina);
      if (!png) continue;
      const arq = `q${g.numero}-p${reg.pagina}.jpg`;
      const meta = await sharp(png).metadata();
      const left = Math.max(0, Math.floor((reg.x0 - 4) * ESCALA));
      const top = Math.max(0, Math.floor((reg.y0 - 4) * ESCALA));
      const width = Math.min((meta.width ?? 0) - left, Math.ceil((reg.x1 - reg.x0 + 8) * ESCALA));
      const height = Math.min((meta.height ?? 0) - top, Math.ceil((reg.y1 - reg.y0 + 8) * ESCALA));
      await sharp(png)
        .extract({ left, top, width, height })
        .resize({ width: Math.min(900, width) })
        .jpeg({ quality: 70 })
        .toFile(join(dir, arq));
      imgs.push(`<img src="${nome}/${arq}" alt="recorte da página ${reg.pagina}">`);
      recortes.push(join(dir, arq));
    }
    const ex = g.item.exercise;
    const pergunta = esc(ex.pergunta)
      .split("\n")
      .map((linha) => {
        const t = linha.match(/^\[\[tabela:(\d+)\]\]$/);
        if (t) {
          const tb = ex.tabelas![Number(t[1])];
          const tr = (cels: string[], tag: string) =>
            `<tr>${cels.map((c) => `<${tag}>${c}</${tag}>`).join("")}</tr>`;
          return `<table>${tr(tb.cabecalho, "th")}${tb.linhas.map((l) => tr(l, "td")).join("")}</table>`;
        }
        const m = linha.match(/^\[\[imagem:(\d+)\]\]$/);
        if (!m) return linha;
        const im = ex.imagens![Number(m[1])];
        return `<figure><img src="../../../${BANCO}/img${im.url.replace("/content/img", "")}" width="${im.largura}" height="${im.altura}"><figcaption>${esc(im.credito ?? "")}</figcaption></figure>`;
      })
      .join("\n");
    const opcoes = ex.opcoes
      .map((o, i) => {
        const im = ex.opcoesImagem?.[i];
        const fig = im
          ? `<img src="../../../${BANCO}/img${im.url.replace("/content/img", "")}" style="max-width:260px">`
          : "";
        return `<li class="${i === ex.correta ? "certa" : ""}"><b>${"ABCDE"[i]}</b> ${esc(o)} ${fig}</li>`;
      })
      .join("");
    blocos.push(`<section><h2>Questão ${g.numero} · ${esc(g.item.id)} · ${esc(g.classificacao.skillId)} (${g.classificacao.confianca})</h2>
<div class="lado"><div class="pdf">${imgs.join("")}</div><div class="item"><div class="perg">${pergunta}</div><ol>${opcoes}</ol><p class="gab">Gabarito: ${"ABCDE"[ex.correta]} · similaridade ${g.similaridade.toFixed(3)}</p></div></div></section>`);
  }
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Importação ${esc(resumo.prova)}</title>
<style>body{font:14px system-ui;margin:16px;color:#111;background:#fff}.lado{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pdf img{max-width:100%;border:1px solid #ccc;display:block;margin-bottom:8px}.perg{white-space:pre-wrap}figure{margin:8px 0}figure img{max-width:100%;border:1px solid #ddd}figcaption{font-size:11px;color:#555}li{margin:4px 0}li.certa{background:#e6f6e6}section{border-top:2px solid #333;padding-top:8px;margin-top:24px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:2px 6px}</style></head><body>
<h1>${esc(resumo.prova)}</h1>
<p>Importadas: ${resumo.importadas} · mantidas de antes: ${r.mantidos.length} · não importadas: ${r.naoImportadas.length} · com imagem: ${resumo.comImagem} · alternativas-imagem: ${resumo.comAlternativaImagem}. Amostra: ${amostra.length} questões sorteadas (10%). Os recortes da página ficam em <code>${esc(nome)}/</code>, gerados localmente por <code>--relatorio</code> (não versionados).</p>
<h2>Não importadas</h2><table><tr><th>Questão</th><th>Motivo</th></tr>${r.naoImportadas.map((n) => `<tr><td>${n.numero}${n.idioma ? ` (${n.idioma})` : ""}</td><td>${esc(n.motivo)}</td></tr>`).join("")}</table>
<h2>Itens que já existiam (não reescritos)</h2><table><tr><th>Questão</th><th>id</th><th>Texto igual</th><th>Gabarito igual</th><th>Primeira diferença</th></tr>${r.mantidos.map((m) => `<tr><td>${m.numero}</td><td>${esc(m.id)}</td><td>${m.textoIgual ? "sim" : "não"}</td><td>${m.gabaritoIgual ? "sim" : "não"}</td><td>${esc(m.diferenca ?? "")}</td></tr>`).join("")}</table>
${blocos.join("\n")}
</body></html>`;
  writeFileSync(join(RELATORIOS, `${nome}.html`), html, "utf-8");
  return recortes;
}

function argumento(args: string[], nome: string): string | undefined {
  const i = args.indexOf(`--${nome}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1];
  return args.find((a) => a.startsWith(`--${nome}=`))?.split("=")[1];
}

async function main() {
  const args = process.argv.slice(2);
  const anoArg = argumento(args, "ano");
  const diaArg = argumento(args, "dia");
  const seco = args.includes("--seco");
  const gerarRelatorio = args.includes("--relatorio");
  const anos = anoArg ? anoArg.split(",").map(Number) : [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const lista = lerLista().provas.filter(
    (p) => anos.includes(p.ano) && (!diaArg || p.dia === Number(diaArg)),
  );
  if (!lista.length) {
    console.error(
      "Nenhuma prova na lista para esse filtro. Uso: --ano 2023 [--dia 1] [--seco] [--relatorio]",
    );
    process.exit(1);
  }
  try {
    for (const ano of anos) {
      const resultados: ResultadoProva[] = [];
      for (const p of lista.filter((x) => x.ano === ano)) {
        const r = await processarProva(p);
        resultados.push(r);
        const total = p.dia === 1 ? 95 : 90;
        const motivos = new Map<string, number[]>();
        for (const n of r.naoImportadas) {
          const chave = n.motivo.replace(/\d+(\.\d+)?/g, "N").slice(0, 70);
          motivos.set(chave, [...(motivos.get(chave) ?? []), n.numero]);
        }
        console.log(
          `[importar-inep] ENEM ${ano} dia ${p.dia} (caderno ${p.caderno} ${r.cor}): ${r.gerados.length} novas + ${r.mantidos.length} mantidas de ${total}; não importadas ${r.naoImportadas.length}`,
        );
        for (const [m, ns] of motivos) console.log(`    ${ns.length}× ${m} [${ns.join(",")}]`);
        for (const m of r.mantidos) {
          console.log(
            `    mantida q${m.numero} ${m.id}: texto ${m.textoIgual ? "igual" : m.igualSemTipografia ? "igual fora aspas/créditos" : "diferente"}, gabarito ${m.gabaritoIgual ? "igual" : "DIFERENTE"}${m.textoIgual ? "" : ` — ${m.diferenca}`}`,
          );
        }
        if (!seco) await relatorio(r, gerarRelatorio);
      }
      if (!seco) gravar(ano, resultados);
    }
  } finally {
    await fecharNavegador();
  }
}

if (import.meta.main) {
  await main();
}
