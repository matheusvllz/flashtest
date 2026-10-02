import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { itemRefOf } from "../../scripts/content/build-packs";
import type { ContentPackageItem } from "@/content/items/package";

/**
 * Testa `scripts/content/build-packs.ts` de fora (subprocesso), com `--root <tmp>`: a fixture, os
 * pacotes e os índices gerados vivem num diretório temporário (docs/36 T-07.6). Antes, o teste
 * escrevia em `src/content/banco/__teste_build_packs__` e o script real regravava
 * `src/content/banco/itens-gerados.ts` com o item de fixture — `bun test` deixava o repo sujo.
 * Agora `src/content/banco/**` e `public/content/**` reais nunca são tocados (um teste confere).
 */

const REAL_ITENS = "src/content/banco/itens-gerados.ts";
const REAL_AULAS = "src/content/banco/aulas-geradas.ts";
const REAL_MANIFEST = "public/content/v1/manifest.json";

let root: string;
let fixtureDir: string;
let outDir: string;

function rodarBuildPacks(): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return (async () => {
    const proc = Bun.spawn(["bun", "scripts/content/build-packs.ts", "--root", root], {
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
  })();
}

function item(id: string, extra: Record<string, unknown> = {}, metaExtra: Record<string, unknown> = {}) {
  return {
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
      ...metaExtra,
    },
    ...extra,
  };
}

describe("scripts/content/build-packs.ts", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "foca-build-packs-"));
    fixtureDir = join(root, "banco", "__teste__");
    outDir = join(root, "public-content");
    mkdirSync(fixtureDir, { recursive: true });
  });
  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test("banco vazio gera manifest vazio sem falhar", async () => {
    rmSync(join(root, "banco"), { recursive: true, force: true });
    const { exitCode, stdout } = await rodarBuildPacks();
    expect(exitCode).toBe(0);
    expect(stdout).toContain("matéria(s) empacotada(s)");
    expect(existsSync(join(outDir, "manifest.json"))).toBe(true);
  });

  test("gera pacote a partir de uma fixture e o manifest aponta pra ele", async () => {
    writeFileSync(
      join(fixtureDir, "fixture.json"),
      JSON.stringify({ subjectId: "__teste__", items: [item("gen:__teste__:1")], lessons: [] }),
    );

    const { exitCode, stdout } = await rodarBuildPacks();
    expect(exitCode).toBe(0);
    expect(stdout).toContain("matéria(s) empacotada(s)");

    const manifest = JSON.parse(readFileSync(join(outDir, "manifest.json"), "utf-8"));
    expect(manifest.subjects.__teste__).toBeDefined();
    const pkgPath = join(outDir, manifest.subjects.__teste__.path.replace("/content/v1/", ""));
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    expect(pkg.items).toHaveLength(1);
    expect(pkg.items[0].id).toBe("gen:__teste__:1");

    // O índice leve gerado também vai pro diretório de fixture.
    const indice = readFileSync(join(root, "itens-gerados.ts"), "utf-8");
    expect(indice).toContain("gen:__teste__:1");
  });

  test("JSON inválido faz o build falhar com mensagem clara (exit != 0)", async () => {
    writeFileSync(join(fixtureDir, "quebrado.json"), "{ isso não é json válido");
    const { exitCode, stderr } = await rodarBuildPacks();
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("não é JSON válido");
  });

  test("id de item duplicado na mesma matéria falha o build", async () => {
    writeFileSync(
      join(fixtureDir, "a.json"),
      JSON.stringify({ subjectId: "__teste__", items: [item("gen:__teste__:dup")], lessons: [] }),
    );
    writeFileSync(
      join(fixtureDir, "b.json"),
      JSON.stringify({ subjectId: "__teste__", items: [item("gen:__teste__:dup")], lessons: [] }),
    );
    const { exitCode, stderr } = await rodarBuildPacks();
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("duplicado");
  });

  test("retired e a origem oficial chegam ao índice leve; item comum não ganha campos extras", async () => {
    writeFileSync(
      join(fixtureDir, "fixture.json"),
      JSON.stringify({
        subjectId: "__teste__",
        items: [
          item("gen:__teste__:comum"),
          item("gen:__teste__:retirado", { retired: true }),
          item("oficial:2023:x", {}, { source: { kind: "oficial", exam: "ENEM", year: 2023, ref: "caderno 8 · questão 99" } }),
        ],
        lessons: [],
      }),
    );
    const { exitCode } = await rodarBuildPacks();
    expect(exitCode).toBe(0);
    const src = readFileSync(join(root, "itens-gerados.ts"), "utf-8");
    const refs = JSON.parse(src.slice(src.indexOf("= [") + 2, src.lastIndexOf("];") + 1)) as Array<Record<string, unknown>>;
    const porId = new Map(refs.map((r) => [r.id as string, r]));
    expect(porId.get("gen:__teste__:comum")).not.toHaveProperty("retired");
    expect(porId.get("gen:__teste__:comum")).not.toHaveProperty("source");
    expect(porId.get("gen:__teste__:retirado")?.retired).toBe(true);
    expect(porId.get("oficial:2023:x")?.source).toEqual({ kind: "oficial", exam: "ENEM", year: 2023, ref: "caderno 8 · questão 99" });
  });

  test("com --root, o banco e os pacotes REAIS não são tocados", async () => {
    const antes = [REAL_ITENS, REAL_AULAS].map((p) => readFileSync(p, "utf-8"));
    const manifestAntes = existsSync(REAL_MANIFEST) ? readFileSync(REAL_MANIFEST, "utf-8") : null;
    writeFileSync(
      join(fixtureDir, "fixture.json"),
      JSON.stringify({ subjectId: "__teste__", items: [item("gen:__teste__:1")], lessons: [] }),
    );
    const { exitCode } = await rodarBuildPacks();
    expect(exitCode).toBe(0);
    expect([REAL_ITENS, REAL_AULAS].map((p) => readFileSync(p, "utf-8"))).toEqual(antes);
    expect(antes[0]).not.toContain("__teste__");
    expect(existsSync(REAL_MANIFEST) ? readFileSync(REAL_MANIFEST, "utf-8") : null).toBe(manifestAntes);
    expect(existsSync("src/content/banco/__teste_build_packs__")).toBe(false);
  });

  test("imagens de questão: copiadas com hash no nome e url reescrita no pacote (spec 50 §5.9.3)", async () => {
    const imgDir = join(root, "banco", "oficial", "img", "2019");
    mkdirSync(imgDir, { recursive: true });
    writeFileSync(join(imgDir, "d1-q001-1.webp"), Buffer.from("imagem-sintetica"));
    const comImagem = item("oficial:2019:abc", {
      exercise: {
        type: "multipla-escolha",
        pergunta: "Texto.\n[[imagem:0]]",
        opcoes: ["a", "b", "c", "d", "e"],
        correta: 0,
        explicacao: "x",
        imagens: [{ url: "/content/img/2019/d1-q001-1.webp", alt: "Imagem sintética", largura: 10, altura: 10 }],
      },
    });
    writeFileSync(join(fixtureDir, "fixture.json"), JSON.stringify({ subjectId: "__teste__", items: [comImagem] }));
    const { exitCode } = await rodarBuildPacks();
    expect(exitCode).toBe(0);
    const manifest = JSON.parse(readFileSync(join(outDir, "manifest.json"), "utf-8"));
    const pacote = JSON.parse(readFileSync(join(root, manifest.subjects.__teste__.path.replace("/content/v1/", "public-content/")), "utf-8"));
    const url: string = pacote.items[0].exercise.imagens[0].url;
    expect(url).toMatch(/^\/content\/img\/2019\/d1-q001-1\.[0-9a-f]{10}\.webp$/);
    expect(existsSync(join(root, "img", url.replace("/content/img/", "")))).toBe(true);
  });

  test("imagem citada que não existe faz o build falhar", async () => {
    const semArquivo = item("oficial:2019:def", {
      exercise: { type: "multipla-escolha", pergunta: "T", opcoes: ["a", "b"], correta: 0, explicacao: "x", imagens: [{ url: "/content/img/2019/nao-existe.webp", alt: "Imagem" }] },
    });
    writeFileSync(join(fixtureDir, "fixture.json"), JSON.stringify({ subjectId: "__teste__", items: [semArquivo] }));
    const { exitCode, stderr } = await rodarBuildPacks();
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("nao-existe.webp");
  });
});

describe("itemRefOf", () => {
  const base = item("gen:x:1") as unknown as ContentPackageItem;

  test("item comum: sem source e sem retired", () => {
    const ref = itemRefOf("x", base);
    expect(ref).not.toHaveProperty("source");
    expect(ref).not.toHaveProperty("retired");
  });

  test("oficial leva exam/year/ref; retired só quando true (false não grava)", () => {
    const oficial = { ...base, meta: { ...base.meta, source: { kind: "oficial", exam: "ENEM", year: 2023 } } } as ContentPackageItem;
    expect(itemRefOf("x", oficial).source).toEqual({ kind: "oficial", exam: "ENEM", year: 2023 });
    expect(itemRefOf("x", { ...base, retired: false })).not.toHaveProperty("retired");
    expect(itemRefOf("x", { ...base, retired: true }).retired).toBe(true);
  });
});
