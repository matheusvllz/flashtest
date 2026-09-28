import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Fronteira do pipeline (docs/30 §19.1/§19, "Segurança", Fase 9 F9 — teste
 * exigido pelos critérios de aceite): nenhum arquivo de `src/` importa
 * `scripts/content/**`. O pipeline roda OFFLINE, fora do app; o app nunca
 * deveria puxar chave/lógica do pipeline pro bundle do client.
 */

function todosOsArquivos(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...todosOsArquivos(full));
    else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

test("nenhum arquivo de src/ importa scripts/content", () => {
  const arquivos = todosOsArquivos("src");
  const RE_IMPORT_PIPELINE = /from\s+["'](\.\.\/)*scripts\/content/;
  const ofensores: string[] = [];
  for (const arquivo of arquivos) {
    const conteudo = readFileSync(arquivo, "utf-8");
    if (RE_IMPORT_PIPELINE.test(conteudo)) ofensores.push(arquivo);
  }
  expect(ofensores).toEqual([]);
});
