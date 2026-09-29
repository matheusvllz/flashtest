// Copia os logos e a Foca do app (LEITURA de ../public/branding/foca) para landing/public/lp/brand, gera as versões
// pequenas que a página realmente usa e registra o hash de cada original (docs/40 §15.4, §16).
// A arte está mudando em paralelo: recopie quando quiser sincronizar. O app nunca é alterado.
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const SRC = resolve(import.meta.dir, "../../public/branding/foca");
const OUT = resolve(import.meta.dir, "../public/lp/brand");
const PUBLIC = resolve(import.meta.dir, "../public");
mkdirSync(OUT, { recursive: true });

const sha = (p: string) => createHash("sha1").update(readFileSync(p)).digest("hex").slice(0, 10);
const hashes: Record<string, string> = {};

// Copiados como estão (ícones e favicon; a página só os referencia no head e no JSON-LD).
for (const f of ["icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
  copyFileSync(resolve(SRC, f), resolve(OUT, f));
  hashes[f] = sha(resolve(SRC, f));
}
copyFileSync(resolve(SRC, "../../favicon.ico"), resolve(PUBLIC, "favicon.ico"));
hashes["favicon.ico"] = sha(resolve(SRC, "../../favicon.ico"));

// Derivados leves. Um logo de 30 px não pode baixar um PNG de 720 px (178 kB) só porque foi o que o app tinha.
const png = { compressionLevel: 9, palette: true, quality: 90 } as const;
for (const [tema, origem] of [
  ["dark", "foca-line-dark-720.png"],
  ["light", "foca-line-light-720.png"],
] as const) {
  hashes[origem] = sha(resolve(SRC, origem));
  await sharp(resolve(SRC, origem)).resize(96).png(png).toFile(resolve(OUT, `foca-line-${tema}-96.png`));
  await sharp(resolve(SRC, origem)).resize(192).png(png).toFile(resolve(OUT, `foca-line-${tema}-192.png`));
}
hashes["foca-color-96.png"] = sha(resolve(SRC, "foca-color-96.png"));
copyFileSync(resolve(SRC, "foca-color-96.png"), resolve(OUT, "foca-color-96.png"));
hashes["foca-color-320.png"] = sha(resolve(SRC, "foca-color-320.png"));
await sharp(resolve(SRC, "foca-color-320.png")).resize(240).webp({ quality: 88 }).toFile(resolve(OUT, "foca-color-240.webp"));

writeFileSync(resolve(OUT, "HASHES.json"), JSON.stringify(hashes, null, 2) + "\n");
console.log("sync:brand OK. Originais (sha1 do app):");
for (const [k, v] of Object.entries(hashes)) console.log(`  ${k}  ${v}`);
