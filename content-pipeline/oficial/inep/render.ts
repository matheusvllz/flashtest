/**
 * Renderiza páginas de PDF a 2× dentro do Chromium do Playwright (spec 50 §5.9.2 passo 3).
 *
 * Por que no Chromium e não no Node: o `pdfjs-dist` só desenha em Node com `@napi-rs/canvas`, um
 * binário nativo opcional que pode não instalar em toda máquina. O Chromium do Playwright já está
 * instalado para os testes E2E, desenha com o mesmo pdf.js e não pede nada novo. O texto continua
 * sendo extraído no Node (`pdf.ts`), que não precisa de canvas.
 *
 * Nada é servido pela rede: as requisições a `http://pdf.local/` são atendidas por `page.route`
 * com os arquivos do `node_modules/pdfjs-dist` e os bytes do PDF.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser, type Page } from "playwright";

const PDFJS_RAIZ = join(process.cwd(), "node_modules", "pdfjs-dist");
const PDFJS_DIR = join(PDFJS_RAIZ, "build");

const PAGINA_HTML = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<script type="module">
import * as pdfjs from "http://pdf.local/pdf.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "http://pdf.local/pdf.worker.mjs";
let doc = null;
window.abrir = async () => {
  const bytes = new Uint8Array(await (await fetch("http://pdf.local/doc.pdf")).arrayBuffer());
  // Sem wasmUrl, imagem JPEG 2000 (JPX) e JBIG2 sai em branco — e a figura sumiria sem erro.
  doc = await pdfjs.getDocument({
    data: bytes,
    wasmUrl: "http://pdf.local/wasm/",
    cMapUrl: "http://pdf.local/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "http://pdf.local/standard_fonts/",
    iccUrl: "http://pdf.local/iccs/",
  }).promise;
  return doc.numPages;
};
window.desenhar = async (n, escala) => {
  const page = await doc.getPage(n);
  const vp = page.getViewport({ scale: escala });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(vp.width);
  canvas.height = Math.ceil(vp.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, canvas, viewport: vp, background: "#ffffff" }).promise;
  const url = canvas.toDataURL("image/png");
  page.cleanup();
  return url.slice(url.indexOf(",") + 1);
};
window.pronto = true;
</script></body></html>`;

export interface RenderizadorPdf {
  paginas: number;
  /** PNG da página `n` (1-based) na escala pedida. */
  desenhar(n: number, escala?: number): Promise<Buffer>;
  fechar(): Promise<void>;
}

let navegador: Browser | null = null;

async function abrirNavegador(): Promise<Browser> {
  if (!navegador) navegador = await chromium.launch({ headless: true });
  return navegador;
}

export async function fecharNavegador(): Promise<void> {
  if (navegador) await navegador.close();
  navegador = null;
}

export async function abrirPdfNoNavegador(caminhoPdf: string): Promise<RenderizadorPdf> {
  const browser = await abrirNavegador();
  const page: Page = await browser.newPage();
  const pdf = readFileSync(caminhoPdf);
  await page.route("http://pdf.local/**", async (route) => {
    const nome = new URL(route.request().url()).pathname.slice(1);
    if (nome === "index.html")
      return route.fulfill({ contentType: "text/html", body: PAGINA_HTML });
    if (nome === "doc.pdf") return route.fulfill({ contentType: "application/pdf", body: pdf });
    if (nome === "pdf.mjs" || nome === "pdf.worker.mjs")
      return route.fulfill({
        contentType: "text/javascript",
        body: readFileSync(join(PDFJS_DIR, nome)),
      });
    const pasta = nome.split("/")[0];
    if (["wasm", "cmaps", "standard_fonts", "iccs"].includes(pasta) && !nome.includes("..")) {
      const arquivo = join(PDFJS_RAIZ, nome);
      if (existsSync(arquivo)) {
        const tipo = nome.endsWith(".wasm")
          ? "application/wasm"
          : nome.endsWith(".js")
            ? "text/javascript"
            : "application/octet-stream";
        return route.fulfill({ contentType: tipo, body: readFileSync(arquivo) });
      }
    }
    return route.fulfill({ status: 404, body: "" });
  });
  // Aviso do pdf.js sobre imagem que não decodificou: a página sairia sem a figura, então o import para.
  const avisos: string[] = [];
  page.on("console", (msg) => {
    const t = msg.text();
    if (/decode image|JpxError|Jbig2Error|wasm|Unable to (load|decode)/i.test(t)) avisos.push(t);
  });
  await page.goto("http://pdf.local/index.html");
  await page.waitForFunction(() => (window as unknown as { pronto?: boolean }).pronto === true);
  const paginas = await page.evaluate(() =>
    (window as unknown as { abrir: () => Promise<number> }).abrir(),
  );
  return {
    paginas,
    async desenhar(n: number, escala = 2) {
      avisos.length = 0;
      const b64 = await page.evaluate(
        ([num, esc]) =>
          (window as unknown as { desenhar: (a: number, b: number) => Promise<string> }).desenhar(
            num,
            esc,
          ),
        [n, escala] as const,
      );
      if (avisos.length)
        throw new Error(
          `[render] página ${n} de ${caminhoPdf} com imagem não decodificada: ${avisos[0]}`,
        );
      return Buffer.from(b64, "base64");
    },
    async fechar() {
      await page.close();
    },
  };
}
