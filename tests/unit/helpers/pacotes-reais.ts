import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { _resetRepositoryForTests, ensureSubjects } from "@/lib/content/repository";
import type { ContentManifest, ContentPackage } from "@/content/items/package";

/**
 * Carrega pacotes REAIS (montados a partir de `src/content/banco/<materia>/*.json`, como o
 * `build-packs.ts` faz) na memória do repositório, com `fetch` simulado — sem depender de
 * `public/content/v1/` (gitignorado e só existe depois de um build) e sem rede. Usado pelos testes
 * de seleção/pool/checkpoint que precisam de item de pacote DISPONÍVEL (docs/36 T-07.6).
 *
 * Devolve uma função de limpeza (restaura `fetch` e zera o repositório); chame no `afterAll`.
 */
export async function carregarPacotesReais(subjectIds: string[]): Promise<() => void> {
  const originalFetch = globalThis.fetch;
  _resetRepositoryForTests();

  const subjects: ContentManifest["subjects"] = {};
  const pacotes: Record<string, ContentPackage> = {};
  for (const subjectId of subjectIds) {
    const dir = join("src/content/banco", subjectId);
    const items: ContentPackage["items"] = [];
    for (const nome of readdirSync(dir).sort()) {
      const arquivo = join(dir, nome);
      if (statSync(arquivo).isDirectory() || !nome.endsWith(".json")) continue;
      const parte = JSON.parse(readFileSync(arquivo, "utf-8")) as Partial<ContentPackage>;
      items.push(...(parte.items ?? []));
    }
    pacotes[subjectId] = { version: 1, subjectId, items, lessons: [] };
    subjects[subjectId] = { path: `/content/v1/${subjectId}.teste.json`, hash: "teste", itemCount: items.length, lessonCount: 0 };
  }
  const manifest: ContentManifest = { version: 1, generatedAt: "2026-09-28T00:00:00.000Z", subjects };

  globalThis.fetch = ((url: string | URL) => {
    const u = String(url);
    if (u.endsWith("manifest.json")) return Promise.resolve(new Response(JSON.stringify(manifest)));
    for (const [subjectId, pkg] of Object.entries(pacotes)) {
      if (u.endsWith(`${subjectId}.teste.json`)) return Promise.resolve(new Response(JSON.stringify(pkg)));
    }
    return Promise.reject(new Error(`fetch inesperado no teste: ${u}`));
  }) as typeof fetch;

  const ok = await ensureSubjects(subjectIds);
  if (!ok) throw new Error("pacotes reais de teste não carregaram");

  return () => {
    globalThis.fetch = originalFetch;
    _resetRepositoryForTests();
  };
}
