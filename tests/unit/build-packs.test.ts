import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

/**
 * Testa `scripts/content/build-packs.ts` de fora (subprocesso), rodando
 * contra uma pasta de fixture isolada via variável de ambiente — mais
 * simples e realista do que importar o script (que roda `build()` na
 * carga do módulo). O script em si sempre lê `src/content/banco/` fixo;
 * aqui testamos indiretamente criando/removendo conteúdo real ali dentro
 * de um subdiretório de teste e limpando depois (docs/31 F3.7 critério:
 * "gera pacote de fixture e carrega de volta", "pacote inválido falha o
 * build com mensagem clara").
 */

const FIXTURE_SUBJECT_DIR = "src/content/banco/__teste_build_packs__";
const OUT_DIR = "public/content/v1";

function limparFixture(): void {
  if (existsSync(FIXTURE_SUBJECT_DIR)) rmSync(FIXTURE_SUBJECT_DIR, { recursive: true, force: true });
}

async function rodarBuildPacks(): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", "scripts/content/build-packs.ts"], {
    stdout: "pipe",
    stderr: "pipe",
    cwd: process.cwd(),
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { exitCode, stdout, stderr };
}

describe("scripts/content/build-packs.ts", () => {
  beforeEach(() => {
    limparFixture();
    mkdirSync(FIXTURE_SUBJECT_DIR, { recursive: true });
  });
  afterEach(() => {
    limparFixture();
  });

  test("pasta banco vazia (sem a fixture) gera manifest vazio sem falhar", async () => {
    limparFixture(); // remove a fixture criada no beforeEach — simula o estado real hoje
    const { exitCode, stdout } = await rodarBuildPacks();
    expect(exitCode).toBe(0);
    expect(stdout).toContain("matéria(s) empacotada(s)");
    expect(existsSync(`${OUT_DIR}/manifest.json`)).toBe(true);
  });

  test("gera pacote a partir de uma fixture e o manifest aponta pra ele", async () => {
    writeFileSync(
      `${FIXTURE_SUBJECT_DIR}/fixture.json`,
      JSON.stringify({
        subjectId: "__teste__",
        items: [
          {
            id: "gen:__teste__:1",
            exercise: { type: "verdadeiro-falso", afirmacao: "teste", verdadeiro: true, explicacao: "teste" },
            meta: {
              id: "gen:__teste__:1",
              version: 1,
              skillIds: [],
              difficulty: 1,
              irt: { a: 1, b: -1.6, c: 0.5, source: "estimado" },
              roles: ["pratica"],
              estimatedSeconds: 30,
              dontKnowAllowed: true,
              source: { kind: "ia-validada" },
              validation: { status: "verificada-ia" },
              examProfiles: ["enem"],
            },
          },
        ],
        lessons: [],
      }),
    );

    const { exitCode, stdout } = await rodarBuildPacks();
    expect(exitCode).toBe(0);
    expect(stdout).toContain("matéria(s) empacotada(s)");

    const manifest = JSON.parse(readFileSync(`${OUT_DIR}/manifest.json`, "utf-8"));
    expect(manifest.subjects.__teste__).toBeDefined();
    const pkgPath = manifest.subjects.__teste__.path.replace("/content/v1/", `${OUT_DIR}/`);
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    expect(pkg.items).toHaveLength(1);
    expect(pkg.items[0].id).toBe("gen:__teste__:1");
  });

  test("JSON inválido faz o build falhar com mensagem clara (exit != 0)", async () => {
    writeFileSync(`${FIXTURE_SUBJECT_DIR}/quebrado.json`, "{ isso não é json válido");
    const { exitCode, stderr } = await rodarBuildPacks();
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("não é JSON válido");
  });

  test("id de item duplicado na mesma matéria falha o build", async () => {
    const item = (id: string) => ({
      id,
      exercise: { type: "verdadeiro-falso", afirmacao: "teste", verdadeiro: true, explicacao: "teste" },
      meta: {
        id,
        version: 1,
        skillIds: [],
        difficulty: 1,
        irt: { a: 1, b: -1.6, c: 0.5, source: "estimado" },
        roles: ["pratica"],
        estimatedSeconds: 30,
        dontKnowAllowed: true,
        source: { kind: "ia-validada" },
        validation: { status: "verificada-ia" },
        examProfiles: ["enem"],
      },
    });
    writeFileSync(
      `${FIXTURE_SUBJECT_DIR}/a.json`,
      JSON.stringify({ subjectId: "__teste__", items: [item("gen:__teste__:dup")], lessons: [] }),
    );
    writeFileSync(
      `${FIXTURE_SUBJECT_DIR}/b.json`,
      JSON.stringify({ subjectId: "__teste__", items: [item("gen:__teste__:dup")], lessons: [] }),
    );
    const { exitCode, stderr } = await rodarBuildPacks();
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("duplicado");
  });
});
