import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * O servidor de produção não lê conteúdo do disco (spec 48 D48-17).
 *
 * Em produção (Vercel) não existe `src/`: o servidor recorrige as respostas com os pacotes de `src/content/banco/**`
 * embutidos no bundle por `import.meta.glob(...)`. Um teste de existência (`typeof import.meta.glob`) dava sempre falso
 * no build e a produção caía na leitura do disco → `ENOENT` em toda sincronização, sem nenhum teste local falhar.
 *
 * Duas camadas, como `css-tokens.test.ts`:
 *  1) código-fonte (sempre roda): `conteudo.ts` chama `import.meta.glob(` e não testa a função como valor;
 *  2) bundle (roda quando há um build em `.output` ou `.vercel`, no gate depois de `bun run build`): o chunk do servidor
 *     que carrega o conteúdo tem os pacotes embutidos, com a chave de cada arquivo.
 */

const RAIZ = join(import.meta.dir, "..", "..");

function listar(dir: string, saida: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) {
      if (nome !== "node_modules") listar(p, saida);
    } else if (nome.endsWith(".mjs") || nome.endsWith(".js")) saida.push(p);
  }
  return saida;
}

describe("conteúdo de pacote no servidor", () => {
  test("conteudo.ts chama import.meta.glob em vez de testar a função como valor", () => {
    const fonte = readFileSync(join(RAIZ, "src", "server", "estudo", "conteudo.ts"), "utf8");
    expect(fonte).toContain("import.meta.glob<");
    expect(fonte).not.toMatch(/typeof\s+glob|import\.meta as unknown/);
  });

  const builds = [join(RAIZ, ".output", "server", "_ssr"), join(RAIZ, ".vercel", "output", "functions", "__server.func", "_ssr")].filter(existsSync);

  test.skipIf(builds.length === 0)("o bundle do servidor embute os pacotes de src/content/banco", () => {
    for (const pasta of builds) {
      const comConteudo = listar(pasta).filter((p) => readFileSync(p, "utf8").includes("function carregarDoBundle"));
      expect(comConteudo.length).toBeGreaterThan(0);
      for (const p of comConteudo) expect(readFileSync(p, "utf8")).toContain('"/src/content/banco/');
    }
  }, 30_000);
});
