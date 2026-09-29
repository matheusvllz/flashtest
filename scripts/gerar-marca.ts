// Gera TODOS os derivados de marca a partir dos originais de src/assets/branding/foca/ (docs/44 §6, §7).
// Substitui scripts/gerar-logos-foca.ps1. Rodar da raiz:  bun scripts/gerar-marca.ts
//
// Regras:
//  - Cores NUNCA digitadas aqui: vêm dos tokens de src/styles.css (--mar e --neve do :root claro, --neve do .dark).
//  - Ícone institucional (favicon, apple-touch, PWA, og) = logo oficial (Foca de frente colorida) sobre o azul --mar
//    (regra de marca I-4, docs/44 §1). Expressões da mascote são contextuais e nunca viram ícone.
//  - Nunca esticar, rotacionar ou recolorir: a arte é recortada pela caixa de alfa e centralizada num quadrado.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dir, "..");
const SRC = resolve(ROOT, "src/assets/branding/foca");
const OUT = resolve(ROOT, "public/branding/foca");
const OUT_EXPR = resolve(OUT, "expressoes");
mkdirSync(OUT_EXPR, { recursive: true });

/* ------------------------------------------------------------------ tokens */
const css = readFileSync(resolve(ROOT, "src/styles.css"), "utf8");
function token(bloco: RegExp, nome: string): string {
  const corpo = css.match(bloco)?.[1];
  const v = corpo?.match(new RegExp(`--${nome}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  if (!v) throw new Error(`token --${nome} não encontrado em src/styles.css`);
  return v.toLowerCase();
}
const ROOT_BLOCK = /\n:root\s*\{([\s\S]*?)\n\}/;
const DARK_BLOCK = /\n\.dark\s*\{([\s\S]*?)\n\}/;
const MAR = token(ROOT_BLOCK, "mar");
const NEVE = token(ROOT_BLOCK, "neve");
const NEVE_ESCURO = token(DARK_BLOCK, "neve");
console.log(`tokens: --mar ${MAR} · --neve ${NEVE} · --neve (escuro) ${NEVE_ESCURO}`);

/* ------------------------------------------------------------------ recorte */
const TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 };
/** A arte recortada pela caixa de alfa e centralizada num quadrado transparente (nunca deforma). */
async function quadrado(arquivo: string): Promise<Buffer> {
  const recortada = await sharp(arquivo).trim({ threshold: 16 }).png().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = recortada.info;
  const lado = Math.max(w, h);
  return sharp(recortada.data)
    .extend({ top: Math.floor((lado - h) / 2), bottom: Math.ceil((lado - h) / 2), left: Math.floor((lado - w) / 2), right: Math.ceil((lado - w) / 2), background: TRANSPARENTE })
    .png()
    .toBuffer();
}

/** Arte transparente em `lado` px, com `folga` (fração de cada borda). */
async function transparente(base: Buffer, lado: number, folga = 0.04) {
  const miolo = Math.round(lado * (1 - 2 * folga));
  const arte = await sharp(base).resize(miolo, miolo, { kernel: "lanczos3" }).toBuffer();
  const pad = Math.floor((lado - miolo) / 2);
  return sharp({ create: { width: lado, height: lado, channels: 4, background: TRANSPARENTE } }).composite([{ input: arte, left: pad, top: pad }]);
}

/** Arte sobre fundo chapado (ícones e og). `ocupa` = fração do menor lado que a cabeça ocupa. */
async function sobreFundo(base: Buffer, w: number, h: number, fundo: string, ocupa: number) {
  const miolo = Math.round(Math.min(w, h) * ocupa);
  const arte = await sharp(base).resize(miolo, miolo, { kernel: "lanczos3" }).toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background: fundo } }).composite([{ input: arte, left: Math.round((w - miolo) / 2), top: Math.round((h - miolo) / 2) }]);
}

const png = { compressionLevel: 9, adaptiveFiltering: true } as const;
const webp = { quality: 88, alphaQuality: 100, effort: 6 } as const;
async function salvar(img: sharp.Sharp, caminho: string, formatos: ("png" | "webp")[] = ["png"]) {
  const buf = await img.png().toBuffer();
  for (const f of formatos) {
    const destino = caminho.replace(/\.png$/, `.${f}`);
    if (f === "png") await sharp(buf).png(png).toFile(destino);
    else await sharp(buf).webp(webp).toFile(destino);
  }
}

/* ------------------------------------------------------------------ logo e marcas d'água */
const oficial = await quadrado(resolve(SRC, "Logo Oficial.png"));
await salvar(await transparente(oficial, 96), resolve(OUT, "foca-color-96.png"), ["png", "webp"]);
await salvar(await transparente(oficial, 320), resolve(OUT, "foca-color-320.png"), ["png", "webp"]);
// Marca d'água de linha: o par de contorno de lado (única pose nas duas cores; o tema não troca a pose).
await salvar(await transparente(await quadrado(resolve(SRC, "Logo de lado Contorno Preto.png")), 720), resolve(OUT, "foca-line-dark-720.png"));
await salvar(await transparente(await quadrado(resolve(SRC, "Logo de lado Contorno Branco.png")), 720), resolve(OUT, "foca-line-light-720.png"));

/* ------------------------------------------------------------------ expressões (docs/15 §5, docs/44 §6) */
export const EXPRESSOES = ["neutra", "acolhedora", "orgulhosa", "empolgada", "surpresa", "entediada", "desapontada", "cobrando"] as const;
for (const nome of EXPRESSOES) {
  const base = await quadrado(resolve(SRC, "expressoes", `${nome}.png`));
  for (const lado of [96, 320]) await salvar(await transparente(base, lado), resolve(OUT_EXPR, `${nome}-${lado}.png`), ["png", "webp"]);
}

/* ------------------------------------------------------------------ ícones institucionais (I-4) */
const ICONES: [string, number, number][] = [
  // [arquivo, lado, fração ocupada pela cabeça]
  ["favicon-16.png", 16, 0.9],
  ["favicon-32.png", 32, 0.86],
  ["favicon-48.png", 48, 0.84],
  ["apple-touch-icon.png", 180, 0.74],
  ["icon-192.png", 192, 0.74],
  ["icon-512.png", 512, 0.74],
  // Maskable: o sistema recorta até um círculo de 80 % do lado; a cabeça fica dentro dele com folga.
  ["icon-maskable-512.png", 512, 0.58],
];
const icones: Record<string, Buffer> = {};
for (const [arq, lado, ocupa] of ICONES) {
  const buf = await (await sobreFundo(oficial, lado, lado, MAR, ocupa)).png(png).toBuffer();
  icones[arq] = buf;
  writeFileSync(resolve(OUT, arq), buf);
}
await (await sobreFundo(oficial, 1200, 630, MAR, 0.62)).png(png).toFile(resolve(OUT, "og-image.png"));

/** favicon.ico com as três resoluções (PNG embutido, formato aceito por todos os navegadores atuais). */
function ico(imagens: { lado: number; dados: Buffer }[]): Buffer {
  const cab = Buffer.alloc(6 + 16 * imagens.length);
  cab.writeUInt16LE(0, 0);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(imagens.length, 4);
  let offset = cab.length;
  imagens.forEach(({ lado, dados }, i) => {
    const e = 6 + i * 16;
    cab.writeUInt8(lado >= 256 ? 0 : lado, e);
    cab.writeUInt8(lado >= 256 ? 0 : lado, e + 1);
    cab.writeUInt8(0, e + 2);
    cab.writeUInt8(0, e + 3);
    cab.writeUInt16LE(1, e + 4);
    cab.writeUInt16LE(32, e + 6);
    cab.writeUInt32LE(dados.length, e + 8);
    cab.writeUInt32LE(offset, e + 12);
    offset += dados.length;
  });
  return Buffer.concat([cab, ...imagens.map((x) => x.dados)]);
}
writeFileSync(
  resolve(ROOT, "public/favicon.ico"),
  ico([16, 32, 48].map((lado) => ({ lado, dados: icones[`favicon-${lado}.png`] }))),
);

/* ------------------------------------------------------------------ manifest (PWA) */
const manifest = {
  name: "Foca",
  short_name: "Foca",
  description: "Preparação para o ENEM em lições curtas, com o próximo passo já escolhido.",
  lang: "pt-BR",
  start_url: "/app",
  scope: "/",
  display: "standalone",
  background_color: NEVE,
  theme_color: NEVE,
  icons: [
    { src: "/branding/foca/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/branding/foca/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/branding/foca/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};
writeFileSync(resolve(ROOT, "public/site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
console.log("marca gerada: logo, marcas d'água, 8 expressões (png + webp), ícones sobre --mar, favicon.ico, og-image, site.webmanifest");
