/**
 * Extração de texto por página com o `pdfjs-dist` (build legacy, roda no Node/bun sem canvas).
 * Converte cada item para caixas no espaço da página renderizada (origem no topo, `tipos.ts`), aplicando a
 * matriz do viewport — algumas provas têm caixa de recorte deslocada (2024), e sem isso o texto não casaria
 * com a imagem.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { ItemTexto, PaginaPdf } from "./tipos";

interface ItemPdfJs {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

const FONTES_PADRAO = join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts") + "/";

/** Caixa de um item de texto a partir da matriz do pdf.js e da matriz do viewport (escala 1). */
export function itemDeTransform(it: ItemPdfJs, vt: number[]): ItemTexto {
  const [a, b, , , e, f] = it.transform;
  const escala = Math.hypot(a, b) || 1;
  const dx = a / escala;
  const dy = b / escala;
  const nx = -dy;
  const ny = dx;
  const tam = it.height || escala;
  const w = it.width;
  const paraTela = (x: number, y: number): [number, number] => [
    vt[0] * x + vt[2] * y + vt[4],
    vt[1] * x + vt[3] * y + vt[5],
  ];
  const cantos: Array<[number, number]> = [];
  for (const s of [0, w]) {
    for (const t of [-0.25 * tam, 0.85 * tam])
      cantos.push(paraTela(e + s * dx + t * nx, f + s * dy + t * ny));
  }
  const xs = cantos.map((c) => c[0]);
  const ys = cantos.map((c) => c[1]);
  return {
    str: it.str,
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
    base: paraTela(e, f)[1],
    tam,
    fonte: it.fontName,
    girado: Math.abs(b) > 0.01 * escala,
  };
}

export async function extrairPaginas(caminho: string): Promise<PaginaPdf[]> {
  const data = new Uint8Array(readFileSync(caminho));
  const tarefa = getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    verbosity: 0,
    standardFontDataUrl: FONTES_PADRAO,
  });
  const doc = await tarefa.promise;
  const paginas: PaginaPdf[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const vp = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    const itens: ItemTexto[] = [];
    for (const raw of tc.items as unknown[]) {
      const it = raw as ItemPdfJs;
      if (typeof it.str !== "string" || !it.transform || it.str.length === 0) continue;
      itens.push(itemDeTransform(it, vp.transform));
    }
    paginas.push({ numero: n, largura: vp.width, altura: vp.height, itens });
    page.cleanup();
  }
  await tarefa.destroy();
  return paginas;
}
