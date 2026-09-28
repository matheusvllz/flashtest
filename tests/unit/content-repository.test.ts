import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  _resetRepositoryForTests,
  ensureSubjects,
  isSubjectLoaded,
  packagedExercise,
  packagedItemMeta,
  packagedLesson,
} from "@/lib/content/repository";
import type { ContentManifest, ContentPackage } from "@/content/items/package";

const originalFetch = globalThis.fetch;

function mockFetch(handler: (url: string) => Response | null): void {
  globalThis.fetch = ((url: string | URL) => {
    const res = handler(String(url));
    if (!res) return Promise.reject(new Error("network error (simulado)"));
    return Promise.resolve(res);
  }) as typeof fetch;
}

function json(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), { status: ok ? status : 500 });
}

describe("content/repository", () => {
  beforeEach(() => {
    _resetRepositoryForTests();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("carrega um pacote real e resolve item/lição por id", async () => {
    const manifest: ContentManifest = {
      version: 1,
      generatedAt: "2026-09-23T00:00:00.000Z",
      subjects: { mat: { path: "/content/v1/mat.abc.json", hash: "abc", itemCount: 1, lessonCount: 0 } },
    };
    const pkg: ContentPackage = {
      version: 1,
      subjectId: "mat",
      items: [
        {
          id: "gen:mat:teste",
          exercise: {
            type: "multipla-escolha",
            pergunta: "2+2?",
            opcoes: ["3", "4"],
            correta: 1,
            explicacao: "2+2=4",
          },
          meta: {
            id: "gen:mat:teste",
            version: 1,
            skillIds: ["mat:operacoes-fundamentais"],
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
    };
    mockFetch((url) => {
      if (url.endsWith("manifest.json")) return json(manifest);
      if (url.endsWith("mat.abc.json")) return json(pkg);
      return null;
    });

    const ok = await ensureSubjects(["mat"]);
    expect(ok).toBe(true);
    expect(isSubjectLoaded("mat")).toBe(true);
    expect(packagedExercise("gen:mat:teste")?.type).toBe("multipla-escolha");
    expect(packagedItemMeta("gen:mat:teste")?.skillIds).toEqual(["mat:operacoes-fundamentais"]);
  });

  test("matéria sem entrada no manifest devolve false sem lançar", async () => {
    mockFetch((url) => {
      if (url.endsWith("manifest.json")) return json({ version: 1, generatedAt: "x", subjects: {} });
      return null;
    });
    const ok = await ensureSubjects(["mat"]);
    expect(ok).toBe(false);
    expect(isSubjectLoaded("mat")).toBe(false);
  });

  test("manifest ausente (404) devolve false sem lançar", async () => {
    mockFetch((url) => {
      if (url.endsWith("manifest.json")) return new Response("not found", { status: 404 });
      return null;
    });
    await expect(ensureSubjects(["mat"])).resolves.toBe(false);
  });

  test("erro de rede devolve false sem lançar", async () => {
    mockFetch(() => null); // handler nulo → fetch rejeita
    await expect(ensureSubjects(["mat"])).resolves.toBe(false);
  });

  test("JSON inválido no pacote devolve false sem lançar", async () => {
    mockFetch((url) => {
      if (url.endsWith("manifest.json")) {
        return json({
          version: 1,
          generatedAt: "x",
          subjects: { mat: { path: "/content/v1/mat.abc.json", hash: "abc", itemCount: 0, lessonCount: 0 } },
        });
      }
      if (url.endsWith("mat.abc.json")) return new Response("{ isso não é json", { status: 200 });
      return null;
    });
    await expect(ensureSubjects(["mat"])).resolves.toBe(false);
  });

  test("item/lição não carregados devolvem undefined, não lançam", () => {
    expect(packagedExercise("nao-existe")).toBeUndefined();
    expect(packagedItemMeta("nao-existe")).toBeUndefined();
    expect(packagedLesson("nao-existe")).toBeUndefined();
  });
});
