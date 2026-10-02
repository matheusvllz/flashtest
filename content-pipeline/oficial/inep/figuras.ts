/**
 * Detecção de figuras na página renderizada (spec 50 §5.9.2 passo 3).
 *
 * Ideia: tinta que não é texto. A página é desenhada a 2× no Chromium; cada item de texto do PDF é apagado
 * de uma grade de 1 pt; o que sobra de tinta escura (foto, desenho, eixos de gráfico, molduras com conteúdo)
 * é agrupado por vizinhança. Linhas finas isoladas (fios de separação, sublinhados, traço de fração) e
 * molduras vazias de texto não viram figura. Os textos que caem dentro da figura (rótulos de eixo, falas,
 * texto de cartaz) passam a ser dela — ficam na imagem, como no original, e vão para a descrição longa.
 *
 * Nada aqui edita pixels: o recorte final é a página renderizada, só cortada (`recortar`).
 */
import sharp from "sharp";
import { formulaSemIndice } from "./formula";
import type { Caixa, FiguraDetectada, ItemTexto, PaginaPdf } from "./tipos";

export interface Faixa {
  /** Limites do conteúdo da página (sem cabeçalho, rodapé e margens), em pt. */
  topo: number;
  base: number;
  esq: number;
  dir: number;
}

export interface AnalisePagina {
  faixa: Faixa;
  figuras: FiguraDetectada[];
  /** Tinta pequena que não é texto nem figura (símbolo desenhado, traço de fração). */
  marcas: Caixa[];
  /** Itens de texto que ficaram dentro de alguma figura (saem do fluxo de leitura). */
  absorvidos: Set<ItemTexto>;
}

export const RE_MARCADOR_QUESTAO = /^\s*quest[aãÃ]o\s*\d{1,3}\s*$/i;

export interface Grade {
  w: number;
  h: number;
  tinta: Uint8Array;
  claro: Uint8Array;
}

/** Grade de 1 pt: célula com tinta escura (`tinta`) e com qualquer cor que não seja branco (`claro`). */
async function gradeDaImagem(
  png: Buffer,
  escala: number,
  larguraPt: number,
  alturaPt: number,
): Promise<Grade> {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = Math.ceil(larguraPt);
  const h = Math.ceil(alturaPt);
  const tinta = new Uint8Array(w * h);
  const claro = new Uint8Array(w * h);
  const c = info.channels;
  for (let py = 0; py < info.height; py++) {
    const gy = Math.min(h - 1, Math.floor(py / escala));
    for (let px = 0; px < info.width; px++) {
      const i = (py * info.width + px) * c;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const min = Math.min(r, g, b);
      const gx = Math.min(w - 1, Math.floor(px / escala));
      const k = gy * w + gx;
      if (min < 180) tinta[k] = 1;
      if (min < 243) claro[k] = 1;
    }
  }
  return { w, h, tinta, claro };
}

/** Linhas horizontais longas (fios do cabeçalho e do rodapé). */
function fiosHorizontais(g: Grade, de: number, ate: number): number[] {
  const ys: number[] = [];
  for (let y = Math.max(0, de); y < Math.min(g.h, ate); y++) {
    let corrida = 0;
    let maior = 0;
    for (let x = 0; x < g.w; x++) {
      if (g.claro[y * g.w + x]) {
        corrida++;
        maior = Math.max(maior, corrida);
      } else if (corrida > 0 && x + 2 < g.w && g.claro[y * g.w + x + 2]) {
        corrida++; // fio pontilhado
      } else corrida = 0;
    }
    if (maior > g.w * 0.55) ys.push(y);
  }
  return ys;
}

export function detectarFaixa(g: Grade | null, pagina: PaginaPdf): Faixa {
  let topo = 62;
  let base = pagina.altura - 45;
  if (g) {
    const cima = fiosHorizontais(
      g,
      Math.floor(pagina.altura * 0.03),
      Math.floor(pagina.altura * 0.14),
    );
    // O fio do cabeçalho é o mais alto da zona (abaixo dele pode haver a barra larga de um "QUESTÃO NN"); o do
    // rodapé, o mais baixo.
    if (cima.length) {
      let t = cima[0];
      while (cima.includes(t + 1)) t++;
      topo = t + 2;
    }
    const baixo = fiosHorizontais(
      g,
      Math.floor(pagina.altura * 0.88),
      Math.floor(pagina.altura * 0.985),
    );
    if (baixo.length) {
      let b = baixo[baixo.length - 1];
      while (baixo.includes(b - 1)) b--;
      base = b - 1;
    }
  }
  // Rodapé de texto sem fio ("LC - 1º dia | Caderno 1 - AZUL - Página 12"): corta acima dele.
  for (const it of pagina.itens) {
    if (it.y0 > pagina.altura * 0.9 && /(caderno|página|\bdia\b)/i.test(it.str))
      base = Math.min(base, it.y0 - 2);
  }
  const dentro = pagina.itens.filter((i) => i.str.trim() && i.y0 >= topo && i.y1 <= base);
  const esq = dentro.length ? Math.min(...dentro.map((i) => i.x0)) - 6 : 20;
  const dir = dentro.length ? Math.max(...dentro.map((i) => i.x1)) + 6 : pagina.largura - 20;
  return { topo, base, esq: Math.max(0, esq), dir: Math.min(pagina.largura, dir) };
}

/** Fontes usadas só para as letras das alternativas (A–E dentro do círculo). Calculado no documento todo. */
export function fontesDeLetra(paginas: PaginaPdf[]): Set<string> {
  const contagem = new Map<string, { letras: number; outros: number }>();
  for (const p of paginas) {
    for (const it of p.itens) {
      const s = it.str.trim();
      if (!s) continue;
      const e = contagem.get(it.fonte) ?? { letras: 0, outros: 0 };
      if (/^[A-E]$/.test(s)) e.letras++;
      else e.outros++;
      contagem.set(it.fonte, e);
    }
  }
  const out = new Set<string>();
  // O pdf.js dá um nome por objeto de fonte, e alguns cadernos (2019) trazem uma fonte de letras por página:
  // basta uma questão (5 letras) e nenhum outro uso.
  for (const [f, e] of contagem) if (e.letras >= 5 && e.outros <= e.letras * 0.02) out.add(f);
  return out;
}

/** Calha entre as duas colunas (x), ou `null` em página de coluna única. */
export function calhaDaPagina(pagina: PaginaPdf, faixa: Faixa): number | null {
  const largura = faixa.dir - faixa.esq;
  const cobertura = new Uint16Array(Math.ceil(pagina.largura) + 1);
  for (const it of pagina.itens) {
    if (!it.str.trim() || it.y0 < faixa.topo || it.y1 > faixa.base) continue;
    if (it.x1 - it.x0 > largura * 0.55) continue;
    for (
      let x = Math.max(0, Math.floor(it.x0));
      x < Math.min(cobertura.length, Math.ceil(it.x1));
      x++
    )
      cobertura[x]++;
  }
  const meio = (faixa.esq + faixa.dir) / 2;
  let melhor: { ini: number; fim: number } | null = null;
  let ini = -1;
  for (let x = Math.floor(meio - largura * 0.1); x <= Math.ceil(meio + largura * 0.1); x++) {
    if (cobertura[x] === 0) {
      if (ini < 0) ini = x;
      if (!melhor || x - ini > melhor.fim - melhor.ini) melhor = { ini, fim: x };
    } else ini = -1;
  }
  if (!melhor || melhor.fim - melhor.ini < 3) return null;
  // Só é calha se as duas metades têm texto de verdade.
  const temEsq = pagina.itens.some(
    (i) => i.x1 < melhor!.ini && i.y0 >= faixa.topo && i.y1 <= faixa.base && i.str.trim(),
  );
  const temDir = pagina.itens.some(
    (i) => i.x0 > melhor!.fim && i.y0 >= faixa.topo && i.y1 <= faixa.base && i.str.trim(),
  );
  return temEsq && temDir ? (melhor.ini + melhor.fim) / 2 : null;
}

function intersecta(a: Caixa, b: Caixa, folga = 0): boolean {
  return a.x0 - folga < b.x1 && b.x0 - folga < a.x1 && a.y0 - folga < b.y1 && b.y0 - folga < a.y1;
}

function centroDentro(it: Caixa, c: Caixa, folga = 0): boolean {
  const cx = (it.x0 + it.x1) / 2;
  const cy = (it.y0 + it.y1) / 2;
  return cx >= c.x0 - folga && cx <= c.x1 + folga && cy >= c.y0 - folga && cy <= c.y1 + folga;
}

/** Componentes 8-conexos de uma grade binária; devolve, por componente, as células. */
function componentes(m: Uint8Array, w: number, h: number): number[][] {
  const visto = new Uint8Array(w * h);
  const out: number[][] = [];
  const pilha: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (!m[i] || visto[i]) continue;
    const comp: number[] = [];
    visto[i] = 1;
    pilha.push(i);
    while (pilha.length) {
      const k = pilha.pop()!;
      comp.push(k);
      const x = k % w;
      const y = (k - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (m[j] && !visto[j]) {
            visto[j] = 1;
            pilha.push(j);
          }
        }
      }
    }
    out.push(comp);
  }
  return out;
}

function caixaDe(celulas: number[], w: number): Caixa {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const k of celulas) {
    const x = k % w;
    const y = (k - x) / w;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

/** Moldura vazia: toda a tinta fica junto da borda da caixa (o texto de dentro continua sendo texto). */
function ehMoldura(celulas: number[], w: number, c: Caixa): boolean {
  if (c.x1 - c.x0 < 30 || c.y1 - c.y0 < 15) return false;
  for (const k of celulas) {
    const x = k % w;
    const y = (k - x) / w;
    const perto = x - c.x0 < 3 || c.x1 - 1 - x < 3 || y - c.y0 < 3 || c.y1 - 1 - y < 3;
    if (!perto) return false;
  }
  return true;
}

/** Junta textos de uma figura em ordem de leitura (linha a linha). */
export function textoDosItens(itens: ItemTexto[]): string {
  const ordenados = itens
    .filter((i) => i.str.trim())
    .sort((a, b) => a.base - b.base || a.x0 - b.x0);
  const linhas: ItemTexto[][] = [];
  for (const it of ordenados) {
    const ultima = linhas[linhas.length - 1];
    if (ultima && Math.abs(ultima[0].base - it.base) <= Math.max(2, it.tam * 0.35)) ultima.push(it);
    else linhas.push([it]);
  }
  return linhas
    .map((l) =>
      l
        .sort((a, b) => a.x0 - b.x0)
        .map((i) => i.str.trim())
        .join(" ")
        .replace(/\s+/g, " "),
    )
    .join("\n");
}

export async function analisarPagina(
  png: Buffer,
  escala: number,
  pagina: PaginaPdf,
  letras: Set<string>,
): Promise<AnalisePagina> {
  const g = await gradeDaImagem(png, escala, pagina.largura, pagina.altura);
  const faixa = detectarFaixa(g, pagina);
  const calha = calhaDaPagina(pagina, faixa);
  const { w, h } = g;
  const m = new Uint8Array(w * h);
  for (let y = Math.ceil(faixa.topo); y < Math.floor(faixa.base); y++) {
    for (let x = Math.ceil(faixa.esq); x < Math.floor(faixa.dir); x++)
      m[y * w + x] = g.tinta[y * w + x];
  }
  const apagar = (c: Caixa, folga: number) => {
    for (
      let y = Math.max(0, Math.floor(c.y0 - folga));
      y < Math.min(h, Math.ceil(c.y1 + folga));
      y++
    ) {
      for (
        let x = Math.max(0, Math.floor(c.x0 - folga));
        x < Math.min(w, Math.ceil(c.x1 + folga));
        x++
      )
        m[y * w + x] = 0;
    }
  };
  const itens = pagina.itens.filter((i) => i.str.trim());
  // Células com texto (para a borda clara da figura não crescer por cima de uma linha de texto).
  const comTexto = new Uint8Array(w * h);
  for (const it of itens) {
    for (let y = Math.max(0, Math.floor(it.y0)); y < Math.min(h, Math.ceil(it.y1)); y++) {
      comTexto.fill(
        1,
        y * w + Math.max(0, Math.floor(it.x0)),
        y * w + Math.min(w, Math.ceil(it.x1)),
      );
    }
  }
  // Caixa do glifo com folga para acento de maiúscula e descendente.
  for (const it of itens) {
    if (it.girado) apagar(it, 1);
    else
      apagar({ x0: it.x0, x1: it.x1, y0: it.base - it.tam * 1.0, y1: it.base + it.tam * 0.32 }, 1);
  }
  // Cabeçalho "QUESTÃO NN": a faixa colorida ao lado é decoração, não figura.
  for (const cab of marcadoresDaPagina(pagina)) {
    const fimColuna = calha !== null && cab.x0 < calha ? calha : faixa.dir;
    apagar({ x0: cab.x0, x1: fimColuna, y0: cab.y0 - 4, y1: cab.y1 + 5 }, 0);
  }

  // 0) O fio (às vezes pontilhado) da calha entre colunas sai: só a tinta da faixa da calha que não tem tinta
  // dos lados (a 5–10 pt) na mesma altura. Tabela ou figura que atravessa a calha tem tinta dos lados e fica.
  if (calha !== null) {
    const c0 = Math.max(0, Math.floor(calha - 3));
    const c1 = Math.min(w, Math.ceil(calha + 3));
    const temTintaFora = (y: number) => {
      for (let yy = Math.max(0, y - 2); yy <= Math.min(h - 1, y + 2); yy++) {
        for (let x = c0 - 7; x < c0 - 2; x++) if (x >= 0 && m[yy * w + x]) return true;
        for (let x = c1 + 2; x < c1 + 7; x++) if (x < w && m[yy * w + x]) return true;
      }
      return false;
    };
    for (let y = 0; y < h; y++) if (!temTintaFora(y)) m.fill(0, y * w + c0, y * w + c1);
  }
  // 1) Fios finos isolados saem. Fio curto (sublinhado, traço de fração) fica registrado como marca.
  const fiosCurtos: Caixa[] = [];
  const fios: Caixa[] = [];
  for (const comp of componentes(m, w, h)) {
    const c = caixaDe(comp, w);
    const fio = (c.y1 - c.y0 <= 3 && c.x1 - c.x0 >= 20) || (c.x1 - c.x0 <= 3 && c.y1 - c.y0 >= 20);
    if (fio) {
      for (const k of comp) m[k] = 0;
      fios.push(c);
      if (c.y1 - c.y0 <= 3 && c.x1 - c.x0 < 150) fiosCurtos.push(c);
    }
  }
  // 2) Dilata 4 pt para juntar partes do mesmo desenho (pontilhado, barras separadas).
  const R = 4;
  const dil = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue;
      for (let yy = Math.max(0, y - R); yy <= Math.min(h - 1, y + R); yy++) {
        dil.fill(1, yy * w + Math.max(0, x - R), yy * w + Math.min(w - 1, x + R) + 1);
      }
    }
  }
  const caixas: Caixa[] = [];
  const marcas: Caixa[] = [];
  for (const grupo of componentes(dil, w, h)) {
    const celulas = grupo.filter((k) => m[k]);
    const c = caixaDe(celulas, w);
    if (celulas.length < 40 || c.x1 - c.x0 < 12 || c.y1 - c.y0 < 12) {
      // Tinta pequena junto do texto: radical, traço de fração, seta, sinal desenhado.
      if (celulas.length >= 4) marcas.push(c);
      continue;
    }
    if (ehMoldura(celulas, w, c)) continue;
    caixas.push(c);
  }
  // 2b) Fio que encosta numa figura (linha de tabela, eixo) volta para ela e junta as partes que ele liga.
  // Fio vertical longo (separador de coluna, borda de página) nunca entra.
  const religaveis = fios.filter((f) => f.y1 - f.y0 <= 3 || f.y1 - f.y0 < 150);
  for (let volta = 0; volta < 20; volta++) {
    let mudou = false;
    for (const f of religaveis) {
      const tocadas = caixas.filter((c) => intersecta(c, f, 4));
      if (!tocadas.length) continue;
      const dentro =
        tocadas.length === 1 &&
        f.x0 >= tocadas[0].x0 &&
        f.x1 <= tocadas[0].x1 &&
        f.y0 >= tocadas[0].y0 &&
        f.y1 <= tocadas[0].y1;
      if (dentro) continue;
      const uniao = tocadas.reduce(
        (a, c) => ({
          x0: Math.min(a.x0, c.x0),
          y0: Math.min(a.y0, c.y0),
          x1: Math.max(a.x1, c.x1),
          y1: Math.max(a.y1, c.y1),
        }),
        { ...f },
      );
      for (const t of tocadas) caixas.splice(caixas.indexOf(t), 1);
      caixas.push(uniao);
      mudou = true;
    }
    if (!mudou) break;
  }
  // 2c) Partes lado a lado do mesmo desenho (dois cones e a seta entre eles): mesma faixa vertical, vão de até
  // 40 pt e nenhum texto no vão.
  for (let volta = 0; volta < 20; volta++) {
    let juntou = false;
    for (let i = 0; i < caixas.length && !juntou; i++) {
      for (let j = 0; j < caixas.length && !juntou; j++) {
        if (i === j) continue;
        const a = caixas[i];
        const b = caixas[j];
        if (b.x0 < a.x1) continue; // b à direita de a
        const vao = b.x0 - a.x1;
        const sobreposicaoV = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (sobreposicaoV < 0.5 * Math.min(a.y1 - a.y0, b.y1 - b.y0)) continue;
        if (calha !== null && a.x1 <= calha && b.x0 >= calha) continue;
        const regiao = { x0: a.x1, x1: b.x0, y0: Math.max(a.y0, b.y0), y1: Math.min(a.y1, b.y1) };
        // Rótulo curto no vão (átomo de fórmula estrutural: "S", "O", "CH") não separa as partes.
        if (itens.some((t) => intersecta(t, regiao) && t.str.trim().length > 3)) continue;
        // Vão maior só quando há um traço no meio (seta ligando as duas partes).
        const ponte = [...fios, ...marcas].some(
          (f) =>
            f.x0 >= regiao.x0 - 2 &&
            f.x1 <= regiao.x1 + 2 &&
            f.y0 >= regiao.y0 &&
            f.y1 <= regiao.y1,
        );
        if (vao > 40 && !(vao <= 100 && ponte)) continue;
        caixas.splice(Math.max(i, j), 1);
        caixas.splice(Math.min(i, j), 1);
        caixas.push({ x0: a.x0, y0: Math.min(a.y0, b.y0), x1: b.x1, y1: Math.max(a.y1, b.y1) });
        juntou = true;
      }
    }
    if (!juntou) break;
  }

  // 3) Bordas claras de foto (céu, papel) entram na caixa, até 6 pt.
  const crescer = (c: Caixa): Caixa => {
    const out = { ...c };
    // Não cresce por cima da calha.
    const limEsq = calha !== null && c.x0 > calha ? calha + 1 : faixa.esq + 1;
    const limDir = calha !== null && c.x1 < calha ? calha - 1 : faixa.dir - 1;
    const linhaClara = (y: number, x0: number, x1: number) => {
      let n = 0;
      for (let x = x0; x < x1; x++) {
        if (comTexto[y * w + x]) return false;
        n += g.claro[y * w + x];
      }
      return n > (x1 - x0) * 0.5;
    };
    const colunaClara = (x: number, y0: number, y1: number) => {
      let n = 0;
      for (let y = y0; y < y1; y++) n += g.claro[y * w + x];
      return n > (y1 - y0) * 0.5;
    };
    for (let i = 0; i < 6 && out.y0 > faixa.topo + 1 && linhaClara(out.y0 - 1, out.x0, out.x1); i++)
      out.y0--;
    for (let i = 0; i < 6 && out.y1 < faixa.base - 1 && linhaClara(out.y1, out.x0, out.x1); i++)
      out.y1++;
    for (let i = 0; i < 6 && out.x0 > limEsq && colunaClara(out.x0 - 1, out.y0, out.y1); i++)
      out.x0--;
    for (let i = 0; i < 6 && out.x1 < limDir && colunaClara(out.x1, out.y0, out.y1); i++) out.x1++;
    return out;
  };

  // 4) Textos dentro e colados à figura passam a ser dela.
  const protegidos = new Set<ItemTexto>(
    itens.filter((i) => letras.has(i.fonte) || RE_MARCADOR_QUESTAO.test(i.str)),
  );
  // Trechos: itens vizinhos na mesma linha de base. A decisão é por trecho, para não engolir meia linha do
  // texto corrido que passa logo abaixo da figura.
  const trechos: Array<Caixa & { itens: ItemTexto[] }> = [];
  for (const it of [...itens]
    .filter((i) => !protegidos.has(i))
    .sort((a, b) => a.base - b.base || a.x0 - b.x0)) {
    const t = trechos.find(
      (tr) =>
        !it.girado &&
        !tr.itens[0].girado &&
        Math.abs(tr.itens[0].base - it.base) <= Math.max(1.5, it.tam * 0.3) &&
        // Folga de texto justificado (até ~1,6 corpo): a linha corrida fica num trecho só.
        it.x0 - tr.x1 <= Math.max(3, it.tam * 1.6) &&
        it.x0 >= tr.x0,
    );
    if (t) {
      t.itens.push(it);
      t.x1 = Math.max(t.x1, it.x1);
      t.y0 = Math.min(t.y0, it.y0);
      t.y1 = Math.max(t.y1, it.y1);
    } else trechos.push({ x0: it.x0, x1: it.x1, y0: it.y0, y1: it.y1, itens: [it] });
  }
  const tamanhos = itens
    .filter((i) => !i.girado)
    .map((i) => i.tam)
    .sort((a, b) => a - b);
  const tamCorpo = tamanhos[Math.floor(tamanhos.length / 2)] ?? 10;
  // Margem esquerda de cada coluna (o x0 mais comum das linhas de corpo): trecho que começa ali, em corpo de
  // texto, é o fim de um parágrafo ("figura."), nunca rótulo de figura.
  const margens: number[] = [];
  for (const lado of [0, 1]) {
    const conta = new Map<number, number>();
    for (const i of itens) {
      if (i.girado || Math.abs(i.tam - tamCorpo) > 0.6) continue;
      if (calha !== null && (lado === 0) !== i.x0 < calha) continue;
      const k = Math.round(i.x0);
      conta.set(k, (conta.get(k) ?? 0) + 1);
    }
    const melhor = [...conta].sort((a, b) => b[1] - a[1])[0];
    if (melhor && melhor[1] >= 4) margens.push(melhor[0]);
  }
  const ehLinhaDeCorpo = (tr: Caixa & { itens: ItemTexto[] }) =>
    margens.some((x) => Math.abs(tr.x0 - x) <= 2.5) &&
    Math.max(...tr.itens.map((i) => i.tam)) >= tamCorpo * 0.95;
  const ehIndiceDeTexto = (tr: Caixa & { itens: ItemTexto[] }, fig: Caixa) => {
    const tam = Math.max(...tr.itens.map((i) => i.tam));
    if (tam >= tamCorpo * 0.85) return false;
    return itens.some(
      (o) =>
        !tr.itens.includes(o) &&
        !o.girado &&
        o.tam >= tamCorpo * 0.9 &&
        !centroDentro(o, fig) &&
        (Math.abs(o.x1 - tr.x0) < 3 || Math.abs(tr.x1 - o.x0) < 3) &&
        Math.abs(o.base - tr.itens[0].base) < o.tam * 0.8,
    );
  };
  const absorvidos = new Set<ItemTexto>();
  const usados = new Set<(typeof trechos)[number]>();
  const figuras: FiguraDetectada[] = [];
  for (const base of caixas.map(crescer)) {
    const c = { ...base };
    const meus: ItemTexto[] = [];
    for (let volta = 0; volta < 8; volta++) {
      let mudou = false;
      for (const tr of trechos) {
        if (usados.has(tr)) continue;
        const dentro = centroDentro(tr, c, 1);
        // Colado (≤ 3 pt), curto e sem passar muito da figura: rótulo de eixo, legenda curta, fala.
        // Linha de corpo de texto encostada na figura nunca entra; rótulo curto ou em fonte menor, sim.
        const tamTrecho = Math.max(...tr.itens.map((i) => i.tam));
        const colado =
          volta < 3 &&
          !ehLinhaDeCorpo(tr) &&
          intersecta(tr, c, 3) &&
          tr.x0 >= c.x0 - 25 &&
          tr.x1 <= c.x1 + 25 &&
          (tr.x1 - tr.x0 <= Math.max(60, (c.x1 - c.x0) * 0.5) || tamTrecho < tamCorpo * 0.95);
        if (!dentro && !colado) continue;
        // Índice ou expoente de uma palavra do texto corrido (N₁ logo acima da figura) fica com o texto.
        if (ehIndiceDeTexto(tr, c)) continue;
        if (!dentro && calha !== null && tr.x0 < calha !== c.x0 < calha && c.x1 <= calha) continue;
        usados.add(tr);
        for (const it of tr.itens) {
          absorvidos.add(it);
          meus.push(it);
        }
        c.x0 = Math.min(c.x0, tr.x0);
        c.y0 = Math.min(c.y0, tr.y0);
        c.x1 = Math.max(c.x1, tr.x1);
        c.y1 = Math.max(c.y1, tr.y1);
        mudou = true;
      }
      if (!mudou) break;
    }
    figuras.push({
      pagina: pagina.numero,
      ...c,
      textos: meus.length ? [textoDosItens(meus)] : [],
      itens: meus,
    });
  }

  // 5) Figuras que se sobrepõem de verdade (> 15% da menor) viram uma só; encostar pelo rótulo não basta.
  const area = (c: Caixa) => Math.max(0, c.x1 - c.x0) * Math.max(0, c.y1 - c.y0);
  const sobreposicao = (a: Caixa, b: Caixa) =>
    area({
      x0: Math.max(a.x0, b.x0),
      y0: Math.max(a.y0, b.y0),
      x1: Math.min(a.x1, b.x1),
      y1: Math.min(a.y1, b.y1),
    }) / Math.max(1, Math.min(area(a), area(b)));
  // Repete até estabilizar: uma fusão pode fazer a figura crescer por cima de outra.
  let fundidas: FiguraDetectada[] = figuras.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  for (let volta = 0; volta < 20; volta++) {
    const proximas: FiguraDetectada[] = [];
    let juntou = false;
    for (const f of fundidas) {
      const outra = proximas.find((o) => intersecta(o, f) && sobreposicao(o, f) > 0.15);
      if (outra) {
        outra.x0 = Math.min(outra.x0, f.x0);
        outra.y0 = Math.min(outra.y0, f.y0);
        outra.x1 = Math.max(outra.x1, f.x1);
        outra.y1 = Math.max(outra.y1, f.y1);
        outra.textos.push(...f.textos);
        outra.itens = [...(outra.itens ?? []), ...(f.itens ?? [])];
        juntou = true;
      } else proximas.push(f);
    }
    fundidas = proximas;
    if (!juntou) break;
  }
  // Texto curto ou miúdo encostado na figura e que não entrou nela (rótulo cortado, índice solto de fórmula):
  // o recorte ficaria incompleto e o texto, solto no enunciado. A questão com essa figura não entra.
  for (const f of fundidas) {
    const solto = trechos.find((tr) => {
      if (usados.has(tr) || !intersecta(tr, f, 6) || ehLinhaDeCorpo(tr) || ehIndiceDeTexto(tr, f))
        return false;
      // Texto que o recorte corta ao meio: sempre suspeito.
      if (intersecta(tr, f, -0.5)) return true;
      // Perto (até 6 pt): número ou rótulo sem palavra ("200", "2", "%") é pedaço da figura que escapou.
      const texto = tr.itens.map((i) => i.str).join("");
      return !/[A-Za-zÀ-ÿ]{3}/.test(texto) && texto.trim().length <= 8;
    });
    if (solto)
      f.suspeita = `texto "${solto.itens
        .map((i) => i.str)
        .join("")
        .slice(0, 20)}" encostado na figura, fora do recorte`;
  }
  // Marcas dentro de figura são parte dela.
  // O círculo da letra da alternativa e a faixa do "QUESTÃO" também não contam.
  const soltas = [...marcas, ...fiosCurtos].filter(
    (mc) =>
      !fundidas.some((f) => intersecta(f, mc, 1)) &&
      ![...protegidos].some((p) => intersecta(p, mc, 1)),
  );
  for (const f of fundidas) {
    const t = detectarTabela(g, f);
    if (t) f.tabela = t;
  }
  return { faixa, figuras: fundidas, absorvidos, marcas: soltas };
}

/** Agrupa posições vizinhas (≤ 2 pt) e devolve o centro de cada grupo. */
function agruparPosicoes(xs: number[]): number[] {
  const out: number[][] = [];
  for (const x of xs.sort((a, b) => a - b)) {
    const g = out[out.length - 1];
    if (g && x - g[g.length - 1] <= 2) g.push(x);
    else out.push([x]);
  }
  return out.map((g) => (g[0] + g[g.length - 1]) / 2);
}

/**
 * Tabela com fios (spec 50 §5.9.2 passo 3): fios verticais e horizontais longos dentro da figura definem a grade;
 * cada item de texto da figura vai para a célula que contém o centro dele. Só aceita quando a grade é completa
 * (≥ 2 colunas e ≥ 2 linhas), todo texto cai numa célula, toda linha tem texto e não sobra tinta fora dos fios e
 * do texto (senão é figura com fios, como um gráfico). Na dúvida, devolve `null` e a figura fica como imagem.
 */
export function detectarTabela(g: Grade, f: FiguraDetectada): FiguraDetectada["tabela"] | null {
  const itens = (f.itens ?? []).filter((i) => i.str.trim() && !i.girado);
  if (itens.length < 4) return null;
  const x0 = Math.max(0, Math.floor(f.x0) - 2);
  const x1 = Math.min(g.w - 1, Math.ceil(f.x1) + 2);
  const y0 = Math.max(0, Math.floor(f.y0) - 2);
  const y1 = Math.min(g.h - 1, Math.ceil(f.y1) + 2);
  const altura = y1 - y0;
  const largura = x1 - x0;
  const dentroDeTexto = (x: number, y: number) =>
    itens.some(
      (i) =>
        x >= i.x0 - 0.5 &&
        x <= i.x1 + 0.5 &&
        y >= i.base - i.tam * 0.9 &&
        y <= i.base + i.tam * 0.3,
    );
  const tinta = (x: number, y: number) => g.tinta[y * g.w + x] === 1 && !dentroDeTexto(x, y);
  const maiorCorrida = (n: number, em: (k: number) => boolean) => {
    let melhor = 0;
    let atual = 0;
    for (let k = 0; k < n; k++) {
      if (em(k)) melhor = Math.max(melhor, ++atual);
      else atual = 0;
    }
    return melhor;
  };
  const vx: number[] = [];
  for (let x = x0; x <= x1; x++)
    if (maiorCorrida(altura, (k) => tinta(x, y0 + k)) >= altura * 0.6) vx.push(x);
  const hy: number[] = [];
  for (let y = y0; y <= y1; y++)
    if (maiorCorrida(largura, (k) => tinta(x0 + k, y)) >= largura * 0.6) hy.push(y);
  // Cabeçalho com fundo cinza e sem fio embaixo: a borda do fundo também separa linhas.
  const fundo = (y: number) => {
    let n = 0;
    for (let x = x0; x <= x1; x++) if (g.claro[y * g.w + x] && !g.tinta[y * g.w + x]) n++;
    return n / (largura + 1);
  };
  for (let y = y0 + 1; y <= y1; y++) {
    const a = fundo(y - 1);
    const b = fundo(y);
    if ((a > 0.5 && b < 0.15) || (a < 0.15 && b > 0.5)) hy.push(y);
  }
  // Só fios dentro da extensão do texto (o fio da calha ou uma moldura distante não são da tabela); borda que
  // não está desenhada (tabela só com fios internos) é a extensão do texto.
  const tx0 = Math.min(...itens.map((i) => i.x0));
  const tx1 = Math.max(...itens.map((i) => i.x1));
  const ty0 = Math.min(...itens.map((i) => i.y0));
  const ty1 = Math.max(...itens.map((i) => i.y1));
  const colunas = agruparPosicoes(vx).filter((x) => x >= tx0 - 14 && x <= tx1 + 14);
  const linhas = agruparPosicoes(hy).filter((y) => y >= ty0 - 14 && y <= ty1 + 14);
  if (!colunas.length || colunas[0] > tx0) colunas.unshift(tx0 - 1);
  if (colunas[colunas.length - 1] < tx1) colunas.push(tx1 + 1);
  if (process.env.DEBUG_TABELA)
    console.log(
      "tabela?",
      f.pagina,
      Math.round(f.x0),
      Math.round(f.y0),
      colunas.map(Math.round),
      linhas.map(Math.round),
    );
  if (colunas.length < 3 || linhas.length < 3) return null;
  // Só fios e texto: tinta fora dos fios (± 1,5 pt) e do texto é desenho.
  let sobra = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!tinta(x, y)) continue;
      if (vx.some((c) => Math.abs(c - x) <= 1) || hy.some((l) => Math.abs(l - y) <= 1)) continue;
      sobra++;
    }
  }
  if (process.env.DEBUG_TABELA) console.log("sobra", sobra, largura * altura);
  if (sobra > largura * altura * 0.012) return null;
  const nCol = colunas.length - 1;
  const nLin = linhas.length - 1;
  const celulas: ItemTexto[][][] = Array.from({ length: nLin }, () =>
    Array.from({ length: nCol }, () => []),
  );
  for (const it of itens) {
    const cx = (it.x0 + it.x1) / 2;
    const cy = it.base - it.tam * 0.35;
    const c = colunas.findIndex((x, k) => k < nCol && cx > x && cx < colunas[k + 1]);
    const l = linhas.findIndex((y, k) => k < nLin && cy > y && cy < linhas[k + 1]);
    if (c < 0 || l < 0) {
      if (process.env.DEBUG_TABELA)
        console.log("fora da grade", it.str, Math.round(cx), Math.round(cy));
      return null; // texto fora da grade (título, legenda): melhor deixar como imagem
    }
    celulas[l][c].push(it);
  }
  // Índice, expoente ou caractere quebrado dentro de célula: o texto corrido perderia a estrutura; fica imagem.
  for (const linha of celulas) {
    for (const cel of linha) {
      const maior = Math.max(0, ...cel.map((i) => i.tam));
      if (cel.some((i) => i.tam < maior * 0.85)) return null;
      // eslint-disable-next-line no-control-regex -- caractere de controle = fonte quebrada
      if (cel.some((i) => /[\u0000-\u001F�-]/.test(i.str))) return null;
    }
  }
  const texto = celulas.map((linha) =>
    linha.map((cel) => textoDosItens(cel).replace(/\n/g, " ").trim()),
  );
  if (texto.some((linha) => linha.every((t) => !t))) return null;
  // Célula só com "l"/"ll": o PDF às vezes mapeia o numeral romano I como l minúsculo. Não dá para conferir
  // sem OCR, então a tabela fica como imagem (fiel ao impresso).
  if (texto.flat().some((t) => /^[lI|]+$/.test(t) && t.includes("l"))) return null;
  // Fórmula com índice que o texto perdeu ("CO2"): fica imagem.
  if (texto.flat().some((t) => formulaSemIndice(t))) return null;
  // Grade de gráfico tem quase todas as células vazias; tabela tem quase todas cheias.
  const cheias = texto.flat().filter(Boolean).length;
  if (cheias < texto.flat().length * 0.85) return null;
  // Célula mesclada (texto que atravessa um fio vertical) não cabe no modelo simples.
  for (const it of itens) if (colunas.some((x) => x > it.x0 + 1 && x < it.x1 - 1)) return null;
  // Linha logo abaixo do cabeçalho só com unidades entre parênteses ("(R$)", "(km)") é a continuação dele.
  let cabecalho = texto[0];
  let corpo = texto.slice(1);
  while (corpo.length > 1 && corpo[0].every((t) => !t || /^\(.*\)$/.test(t))) {
    cabecalho = cabecalho.map((h, k) => [h, corpo[0][k]].filter(Boolean).join(" "));
    corpo = corpo.slice(1);
  }
  return { cabecalho, linhas: corpo };
}

/** Itens que formam o cabeçalho "QUESTÃO NN" (às vezes partidos em vários itens: "Q", "UEST", "ã", "O", "06"). */
export function marcadoresDaPagina(pagina: PaginaPdf): Caixa[] {
  const porBase = new Map<number, ItemTexto[]>();
  for (const it of pagina.itens) {
    if (!it.str.trim()) continue;
    const k = Math.round(it.base);
    porBase.set(k, [...(porBase.get(k) ?? []), it]);
  }
  const out: Caixa[] = [];
  for (const linha of porBase.values()) {
    const ord = linha.sort((a, b) => a.x0 - b.x0);
    for (let i = 0; i < ord.length; i++) {
      let s = "";
      for (let j = i; j < Math.min(ord.length, i + 6); j++) {
        if (j > i && ord[j].x0 - ord[j - 1].x1 > 6) break;
        s += ord[j].str;
        if (RE_MARCADOR_QUESTAO.test(s) && /\d$/.test(s.trim())) {
          out.push({ x0: ord[i].x0, y0: ord[i].y0, x1: ord[j].x1, y1: ord[j].y1 });
          break;
        }
      }
    }
  }
  return out;
}

/**
 * Recorta uma caixa (pt) de uma página renderizada na escala dada, sem retoque: só corte, redução para no
 * máximo `larguraMax` px e conversão para WebP (qualidade baixa até caber em `limiteBytes`).
 */
export async function recortar(
  png: Buffer,
  escala: number,
  c: Caixa,
  opts: { margem?: number; larguraMax?: number; limiteBytes?: number } = {},
): Promise<{ webp: Buffer; largura: number; altura: number }> {
  const margem = opts.margem ?? 2;
  const meta = await sharp(png).metadata();
  const left = Math.max(0, Math.floor((c.x0 - margem) * escala));
  const top = Math.max(0, Math.floor((c.y0 - margem) * escala));
  const width = Math.min((meta.width ?? 0) - left, Math.ceil((c.x1 - c.x0 + 2 * margem) * escala));
  const height = Math.min((meta.height ?? 0) - top, Math.ceil((c.y1 - c.y0 + 2 * margem) * escala));
  const larguraMax = opts.larguraMax ?? 1200;
  const limite = opts.limiteBytes ?? 80 * 1024;
  let alvo = Math.min(width, larguraMax);
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    for (const q of [82, 72, 62, 52]) {
      const { data, info } = await sharp(png)
        .extract({ left, top, width, height })
        .resize({ width: alvo, withoutEnlargement: true })
        .webp({ quality: q, effort: 5 })
        .toBuffer({ resolveWithObject: true });
      if (data.length <= limite) return { webp: data, largura: info.width, altura: info.height };
    }
    alvo = Math.round(alvo * 0.85);
  }
  const { data, info } = await sharp(png)
    .extract({ left, top, width, height })
    .resize({ width: alvo })
    .webp({ quality: 50 })
    .toBuffer({ resolveWithObject: true });
  return { webp: data, largura: info.width, altura: info.height };
}
