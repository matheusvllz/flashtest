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

  // ---- docs/36 T-05.4 (RF-17, C7): retry sem cache de falha e dedupe em voo ----

  const MANIFEST_MAT: ContentManifest = {
    version: 1,
    generatedAt: "2026-09-28T00:00:00.000Z",
    subjects: {
      mat: { path: "/content/v1/mat.abc.json", hash: "abc", itemCount: 0, lessonCount: 0 },
      por: { path: "/content/v1/por.def.json", hash: "def", itemCount: 0, lessonCount: 0 },
    },
  };
  const pacoteVazio = (subjectId: string): ContentPackage => ({ version: 1, subjectId, items: [], lessons: [] });

  /** fetch falso que conta chamadas por arquivo e deixa o teste controlar quando/como cada uma responde. */
  function fetchContado(responder: (url: string, chamada: number) => Response | null | Promise<Response | null>) {
    const contagem = new Map<string, number>();
    globalThis.fetch = (async (url: string | URL) => {
      const u = String(url);
      const n = (contagem.get(u) ?? 0) + 1;
      contagem.set(u, n);
      const res = await responder(u, n);
      if (!res) throw new Error("network error (simulado)");
      return res;
    }) as typeof fetch;
    return contagem;
  }

  test("RF-17: manifest que falhou na 1ª chamada NÃO fica em cache — a 2ª chamada carrega", async () => {
    const contagem = fetchContado((url, n) => {
      if (url.endsWith("manifest.json")) return n === 1 ? null : json(MANIFEST_MAT);
      if (url.endsWith("mat.abc.json")) return json(pacoteVazio("mat"));
      return null;
    });
    expect(await ensureSubjects(["mat"])).toBe(false);
    expect(isSubjectLoaded("mat")).toBe(false);
    expect(await ensureSubjects(["mat"])).toBe(true);
    expect(isSubjectLoaded("mat")).toBe(true);
    expect(contagem.get("/content/v1/manifest.json")).toBe(2);
  });

  test("RF-17: manifest 404 e manifest sem 'subjects' também contam como falha e permitem tentar de novo", async () => {
    let fase: "404" | "sem-subjects" | "ok" = "404";
    fetchContado((url) => {
      if (url.endsWith("manifest.json")) {
        if (fase === "404") return new Response("nope", { status: 404 });
        if (fase === "sem-subjects") return json({ version: 1 });
        return json(MANIFEST_MAT);
      }
      return json(pacoteVazio("mat"));
    });
    expect(await ensureSubjects(["mat"])).toBe(false);
    fase = "sem-subjects";
    expect(await ensureSubjects(["mat"])).toBe(false);
    fase = "ok";
    expect(await ensureSubjects(["mat"])).toBe(true);
  });

  test("RF-17: pacote que falhou na 1ª chamada é buscado de novo na 2ª", async () => {
    const contagem = fetchContado((url, n) => {
      if (url.endsWith("manifest.json")) return json(MANIFEST_MAT);
      if (url.endsWith("mat.abc.json")) return n === 1 ? new Response("erro", { status: 500 }) : json(pacoteVazio("mat"));
      return null;
    });
    expect(await ensureSubjects(["mat"])).toBe(false);
    expect(isSubjectLoaded("mat")).toBe(false);
    expect(await ensureSubjects(["mat"])).toBe(true);
    expect(contagem.get("/content/v1/mat.abc.json")).toBe(2);
    expect(contagem.get("/content/v1/manifest.json")).toBe(1); // manifest válido fica em cache
  });

  test("RF-17: 2 chamadas concorrentes fazem 1 fetch por arquivo (manifest e pacote)", async () => {
    const contagem = fetchContado(async (url) => {
      await new Promise((r) => setTimeout(r, 15)); // dá tempo da 2ª chamada chegar enquanto a 1ª está em voo
      if (url.endsWith("manifest.json")) return json(MANIFEST_MAT);
      if (url.endsWith("mat.abc.json")) return json(pacoteVazio("mat"));
      if (url.endsWith("por.def.json")) return json(pacoteVazio("por"));
      return null;
    });
    const [a, b, c] = await Promise.all([ensureSubjects(["mat"]), ensureSubjects(["mat", "por"]), ensureSubjects(["mat"])]);
    expect([a, b, c]).toEqual([true, true, true]);
    expect(contagem.get("/content/v1/manifest.json")).toBe(1);
    expect(contagem.get("/content/v1/mat.abc.json")).toBe(1);
    expect(contagem.get("/content/v1/por.def.json")).toBe(1);
  });

  test("RF-17: falha em voo é compartilhada por quem já esperava, e a entrada sai do mapa (a próxima tenta de novo)", async () => {
    let liberar!: () => void;
    const trava = new Promise<void>((r) => (liberar = r));
    const contagem = fetchContado(async (url, n) => {
      if (url.endsWith("manifest.json")) return json(MANIFEST_MAT);
      if (url.endsWith("mat.abc.json")) {
        await trava;
        return n === 1 ? new Response("erro", { status: 500 }) : json(pacoteVazio("mat"));
      }
      return null;
    });
    const p1 = ensureSubjects(["mat"]);
    const p2 = ensureSubjects(["mat"]);
    await new Promise((r) => setTimeout(r, 10));
    liberar();
    expect(await Promise.all([p1, p2])).toEqual([false, false]);
    expect(contagem.get("/content/v1/mat.abc.json")).toBe(1);
    expect(await ensureSubjects(["mat"])).toBe(true);
    expect(contagem.get("/content/v1/mat.abc.json")).toBe(2);
  });

  test("T-05.4: o fetch recebe um AbortSignal e o prazo de 8 s o aborta de verdade (não só desiste)", async () => {
    const sinais: AbortSignal[] = [];
    globalThis.fetch = ((url: string | URL, init?: RequestInit) => {
      const signal = init?.signal as AbortSignal;
      sinais.push(signal);
      if (String(url).endsWith("manifest.json")) {
        // Nunca responde por conta própria; só rejeita quando a requisição é abortada.
        return new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new DOMException("abortado", "AbortError")));
        });
      }
      return Promise.reject(new Error("não deveria chegar aqui"));
    }) as typeof fetch;

    const realSetTimeout = globalThis.setTimeout;
    const atrasos: number[] = [];
    // Encolhe só o prazo de 8000 ms para 20 ms — o resto do teste segue em tempo real.
    globalThis.setTimeout = ((fn: () => void, ms?: number, ...args: unknown[]) => {
      atrasos.push(ms ?? 0);
      return realSetTimeout(fn, ms === 8000 ? 20 : ms, ...args);
    }) as typeof setTimeout;
    try {
      expect(await ensureSubjects(["mat"])).toBe(false);
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }
    expect(atrasos).toContain(8000); // o prazo continua 8 s
    expect(sinais).toHaveLength(1);
    expect(sinais[0]!.aborted).toBe(true);
  });

  test("pacote de forma inesperada (sem 'items'/'lessons') não lança", async () => {
    fetchContado((url) => {
      if (url.endsWith("manifest.json")) return json(MANIFEST_MAT);
      return json({ version: 1, subjectId: "mat" });
    });
    await expect(ensureSubjects(["mat"])).resolves.toBe(true);
    expect(isSubjectLoaded("mat")).toBe(true);
  });

  test("item/lição não carregados devolvem undefined, não lançam", () => {
    expect(packagedExercise("nao-existe")).toBeUndefined();
    expect(packagedItemMeta("nao-existe")).toBeUndefined();
    expect(packagedLesson("nao-existe")).toBeUndefined();
  });
});
