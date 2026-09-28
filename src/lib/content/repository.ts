import type { Exercise } from "@/lib/lessons/types";
import type { MicroLessonV2 } from "@/lib/learning/types";
import type { ContentManifest, ContentPackage, ContentPackageItem } from "@/content/items/package";
import type { ItemMeta } from "@/content/items/types";

/**
 * Repositório de conteúdo em pacotes (docs/30 §21.3, Fase 3 T-3.7) — busca
 * sob demanda, nunca no caminho de render. `resolveExercise`/`itemMetaOf`
 * continuam SÍNCRONOS: quem abre uma tela chama `ensureSubjects` ANTES (e
 * espera a promise), e só depois disso os ids do pacote resolvem no cache em
 * memória daqui — nunca um `fetch` dentro de uma função de resolução pura.
 */

const MANIFEST_PATH = "/content/v1/manifest.json";
const FETCH_TIMEOUT_MS = 8000;

const loadedSubjects = new Map<string, ContentPackage>();
const itemsById = new Map<string, ContentPackageItem>();
const lessonsById = new Map<string, MicroLessonV2>();
let manifestPromise: Promise<ContentManifest | null> | null = null;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function loadManifest(): Promise<ContentManifest | null> {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      try {
        const response = await withTimeout(fetch(MANIFEST_PATH), FETCH_TIMEOUT_MS);
        if (!response || !response.ok) return null;
        return (await response.json()) as ContentManifest;
      } catch {
        return null;
      }
    })();
  }
  return manifestPromise;
}

async function loadPackage(path: string): Promise<ContentPackage | null> {
  try {
    const response = await withTimeout(fetch(path), FETCH_TIMEOUT_MS);
    if (!response || !response.ok) return null;
    return (await response.json()) as ContentPackage;
  } catch {
    return null;
  }
}

/**
 * Garante que as matérias pedidas estejam carregadas em memória. Nunca
 * lança — `false` no retorno é "nem tudo carregou" (pacote ausente, 404,
 * prazo, JSON inválido), e quem chama cai no fallback (docs/30 §11.8).
 */
export async function ensureSubjects(subjectIds: string[]): Promise<boolean> {
  const manifest = await loadManifest();
  if (!manifest) return false;

  const resultados = await Promise.all(
    subjectIds.map(async (subjectId) => {
      if (loadedSubjects.has(subjectId)) return true;
      const entry = manifest.subjects[subjectId];
      if (!entry) return false;
      const pkg = await loadPackage(entry.path);
      if (!pkg) return false;
      loadedSubjects.set(subjectId, pkg);
      for (const item of pkg.items) itemsById.set(item.id, item);
      for (const lesson of pkg.lessons) lessonsById.set(lesson.id, lesson);
      return true;
    }),
  );
  return resultados.every(Boolean);
}

export function isSubjectLoaded(subjectId: string): boolean {
  return loadedSubjects.has(subjectId);
}

export function packagedExercise(id: string): Exercise | undefined {
  return itemsById.get(id)?.exercise;
}

export function packagedItemMeta(id: string): ItemMeta | undefined {
  return itemsById.get(id)?.meta;
}

/** Consultado por `phaseById` (docs/30 §21.3: "embarcado → repositório"). */
export function packagedLesson(id: string): MicroLessonV2 | undefined {
  return lessonsById.get(id);
}

/** Só para teste — evita cache vazando entre casos isolados. */
export function _resetRepositoryForTests(): void {
  loadedSubjects.clear();
  itemsById.clear();
  lessonsById.clear();
  manifestPromise = null;
}
