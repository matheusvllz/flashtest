/**
 * Renderizador de posts de feed (4:5) e carrosseis continuos.
 *
 *   bun run render <id>            renderiza conteudos/<id>/conteudo.json
 *   bun run render <id> --so-png   nao gera os JPEG de publicacao
 *
 * O que sai em conteudos/<id>/:
 *   fonte/pagina.html        fonte editavel (HTML panoramico)
 *   export/panoramica.png    a tira inteira (1080*N x 1350) — vista de emenda
 *   export/p01..pNN.png      paginas individuais, 1080x1350 exatos, para revisao e arquivo
 *   export/p01..pNN.jpg      JPEG (o unico formato de imagem que a API da Meta aceita)
 *   export/ordem.json        ordem explicita de publicacao + dimensoes medidas
 *   preview/contato.png      prova de contato (todas as paginas lado a lado, reduzidas)
 *
 * Renderizar NAO publica nada.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright-core";
import { acharChromium } from "../lib/chromium.ts";
import { lerConfig } from "../lib/config.ts";
import { pastaConteudo } from "../lib/paths.ts";
import { PAGINA } from "./base.ts";
import { compor, type Conteudo } from "./compor.ts";
import { lerSnapshot } from "./base.ts";

export async function renderizar(id: string, opcoes: { soPng?: boolean } = {}) {
  const cfg = lerConfig();
  const pasta = pastaConteudo(id);
  if (!existsSync(pasta.conteudo)) throw new Error(`nao achei ${pasta.conteudo}`);
  const c = JSON.parse(readFileSync(pasta.conteudo, "utf8")) as Conteudo;

  for (const d of [pasta.fonte, pasta.export, pasta.preview]) mkdirSync(d, { recursive: true });
  const hashConteudo = createHash("sha256")
    .update(readFileSync(pasta.conteudo))
    .digest("hex")
    .slice(0, 16);
  const versaoArquivada = arquivarVersaoAnterior(pasta, hashConteudo);

  const { html, largura, altura, paginas } = await compor(c);
  const arquivoHtml = join(pasta.fonte, "pagina.html");
  writeFileSync(arquivoHtml, html);

  const navegador = await chromium.launch({ executablePath: acharChromium() });
  const pagina = await navegador.newPage({
    viewport: { width: Math.min(largura, 16000), height: altura },
    deviceScaleFactor: 1,
  });
  await pagina.goto(pathToFileURL(arquivoHtml).href, { waitUntil: "load" });
  await pagina.evaluate(() => (document as unknown as { fonts: FontFaceSet }).fonts.ready);
  const tira = pagina.locator("#tira");
  const panoramica = join(pasta.export, "panoramica.png");
  await tira.screenshot({ path: panoramica, scale: "css" });
  await navegador.close();

  const meta = await sharp(panoramica).metadata();
  if (meta.width !== largura || meta.height !== altura)
    throw new Error(`panoramica saiu ${meta.width}x${meta.height}, esperado ${largura}x${altura}`);

  const ordem: {
    pagina: number;
    png: string;
    jpg?: string;
    largura: number;
    altura: number;
    bytesJpg?: number;
  }[] = [];
  for (let i = 0; i < paginas; i++) {
    const nome = `p${String(i + 1).padStart(2, "0")}`;
    const png = join(pasta.export, `${nome}.png`);
    // Recorte exato, sem sobreposicao e sem lacuna: left = i * 1080, largura = 1080.
    await sharp(panoramica)
      .extract({ left: i * PAGINA.largura, top: 0, width: PAGINA.largura, height: PAGINA.altura })
      .png({ compressionLevel: 9 })
      .toFile(png);
    const item: (typeof ordem)[number] = {
      pagina: i + 1,
      png,
      largura: PAGINA.largura,
      altura: PAGINA.altura,
    };
    if (!opcoes.soPng) {
      const jpg = join(pasta.export, `${nome}.jpg`);
      await sharp(png)
        .jpeg({ quality: cfg.formatos.jpegQualidade, chromaSubsampling: "4:4:4", mozjpeg: true })
        .toFile(jpg);
      item.jpg = jpg;
      item.bytesJpg = statSync(jpg).size;
    }
    ordem.push(item);
  }

  const s = lerSnapshot();
  writeFileSync(
    join(pasta.export, "ordem.json"),
    JSON.stringify(
      {
        id,
        formato: c.formato,
        geradoEm: new Date().toISOString(),
        hashConteudo,
        paginas: ordem,
        panoramica: { arquivo: panoramica, largura, altura },
        referenciasMarca: {
          snapshotEm: s.geradoEm,
          stylesCss:
            s.fontesDocumentais.find((f) => f.arquivo.endsWith("styles.css"))?.hash ?? null,
          logoOficial: s.logos.oficialColorida.hash,
        },
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(pasta.legenda, (c.legenda ?? "").trimEnd() + "\n");
  cpSync(pasta.conteudo, join(pasta.export, "conteudo.renderizado.json"));

  await provaDeContato(
    ordem.map((o) => o.png),
    join(pasta.preview, "contato.png"),
  );

  return { paginas: ordem, panoramica, html: arquivoHtml, versaoArquivada };
}

/**
 * Revisao preserva a versao anterior: se o conteudo.json mudou desde o ultimo render, o render
 * anterior inteiro (conteudo.json, fonte, export, preview, legenda) vai para versoes/vN/ antes de
 * ser sobrescrito. O ID nunca muda. Re-render identico nao cria versao.
 */
function arquivarVersaoAnterior(pasta: ReturnType<typeof pastaConteudo>, hashAtual: string) {
  const ordemArq = join(pasta.export, "ordem.json");
  if (!existsSync(ordemArq)) return null;
  const anterior = JSON.parse(readFileSync(ordemArq, "utf8")) as {
    hashConteudo?: string;
    conteudoCopia?: string;
  };
  if (!anterior.hashConteudo || anterior.hashConteudo === hashAtual) return null; // render legado ou identico
  mkdirSync(pasta.versoes, { recursive: true });
  const n = readdirSync(pasta.versoes).filter((d) => /^vd+$/.test(d)).length + 1;
  const destino = join(pasta.versoes, `v${n}`);
  for (const d of ["fonte", "export", "preview"]) {
    const origem = join(pasta.base, d);
    if (existsSync(origem))
      cpSync(origem, join(destino, d), { recursive: true, filter: (f) => !f.includes("quadros") });
  }
  // o conteudo.json anterior foi guardado no ultimo render; o atual ja foi editado
  const copia = join(pasta.export, "conteudo.renderizado.json");
  if (existsSync(copia)) cpSync(copia, join(destino, "conteudo.json"));
  if (existsSync(pasta.legenda)) cpSync(pasta.legenda, join(destino, "legenda.txt"));
  return destino;
}

/** Prova de contato: todas as paginas numa faixa reduzida, para conferir ritmo e emendas. */
export async function provaDeContato(pngs: string[], saida: string) {
  const alturaMini = 420;
  const larguraMini = Math.round((PAGINA.largura / PAGINA.altura) * alturaMini);
  const vao = 12;
  const largura = pngs.length * larguraMini + (pngs.length + 1) * vao;
  const base = sharp({
    create: { width: largura, height: alturaMini + vao * 2, channels: 3, background: "#e1dfda" },
  });
  const camadas = await Promise.all(
    pngs.map(async (p, i) => ({
      input: await sharp(p).resize(larguraMini, alturaMini).png().toBuffer(),
      left: vao + i * (larguraMini + vao),
      top: vao,
    })),
  );
  await base.composite(camadas).png().toFile(saida);
  return saida;
}

if (import.meta.main) {
  const [id, ...flags] = process.argv.slice(2);
  if (!id) throw new Error("uso: bun run render <id> [--so-png]");
  const formato = (JSON.parse(readFileSync(pastaConteudo(id).conteudo, "utf8")) as { formato: string }).formato;
  if (formato === "story") {
    // Destaque: stories 9:16 + capa 1:1 (stories.ts)
    const { renderizarStories } = await import("./stories.ts");
    const r = await renderizarStories(id);
    console.log(`${r.paginas.length} story(s) 1080x1920 + capa 1080x1080`);
    for (const p of r.paginas) console.log(`  ${p.pagina}. ${p.png}  +jpg ${(p.bytesJpg / 1024).toFixed(0)} KB`);
    console.log(`capa: ${r.capa}\nfonte editavel: ${r.html}`);
    if (r.problemas.length) console.log(`MEDICAO:\n  ${r.problemas.join("\n  ")}`);
    process.exit(0);
  }
  const r = await renderizar(id, { soPng: flags.includes("--so-png") });
  console.log(`${r.paginas.length} pagina(s) em ${PAGINA.largura}x${PAGINA.altura}`);
  for (const p of r.paginas)
    console.log(
      `  ${p.pagina}. ${p.png}${p.jpg ? `  +jpg ${(p.bytesJpg! / 1024).toFixed(0)} KB` : ""}`,
    );
  console.log(`panoramica: ${r.panoramica}\nfonte editavel: ${r.html}`);
  if (r.versaoArquivada) console.log(`versao anterior preservada em ${r.versaoArquivada}`);
}
