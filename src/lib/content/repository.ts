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

/**
 * `fetch` + leitura do JSON com prazo (docs/36 T-05.4): o `AbortController`
 * cancela de verdade a requisição quando o prazo estoura (antes a promessa só
 * "desistia" e o `fetch` seguia vivo) e o prazo cobre também a leitura do
 * corpo — um servidor que manda os cabeçalhos e trava não pendura a tela.
 * Qualquer falha (rede, não-2xx, JSON inválido, prazo) vira `null`; nunca lança.
 */
async function buscarJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(path, { signal: controller.signal });
    if (!response || !response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function loadManifest(): Promise<ContentManifest | null> {
  if (!manifestPromise) {
    const promessa = (async () => {
      const manifest = await buscarJson<ContentManifest>(MANIFEST_PATH);
      // Forma mínima: sem `subjects` o manifest não serve e conta como falha.
      return manifest && typeof manifest.subjects === "object" && manifest.subjects !== null ? manifest : null;
    })();
    manifestPromise = promessa;
    // Falha NÃO fica em cache pra sempre (docs/36 C7/RF-17): quem já está esperando
    // divide a mesma promessa, mas a PRÓXIMA chamada tenta de novo ("Tentar de novo").
    // Sem retry automático em laço.
    void promessa.then((manifest) => {
      if (manifest === null && manifestPromise === promessa) manifestPromise = null;
    });
  }
  return manifestPromise;
}

/** Pacotes em voo por matéria (docs/36 T-05.4): chamadas concorrentes reusam a mesma promessa; ao resolver (bem ou mal) a entrada sai do mapa. */
const packagesInFlight = new Map<string, Promise<boolean>>();

function loadSubject(manifest: ContentManifest, subjectId: string): Promise<boolean> {
  if (loadedSubjects.has(subjectId)) return Promise.resolve(true);
  const emVoo = packagesInFlight.get(subjectId);
  if (emVoo) return emVoo;
  const entry = manifest.subjects[subjectId];
  if (!entry) return Promise.resolve(false);

  const promessa = (async () => {
    const pkg = await buscarJson<ContentPackage>(entry.path);
    if (!pkg) return false;
    loadedSubjects.set(subjectId, pkg);
    for (const item of pkg.items ?? []) itemsById.set(item.id, item);
    for (const lesson of pkg.lessons ?? []) lessonsById.set(lesson.id, lesson);
    return true;
  })()
    // "Nunca lança": um pacote de forma inesperada vira `false`, não rejeição.
    .catch(() => false)
    .finally(() => {
      packagesInFlight.delete(subjectId);
    });
  packagesInFlight.set(subjectId, promessa);
  return promessa;
}

/**
 * Garante que as matérias pedidas estejam carregadas em memória. Nunca
 * lança — `false` no retorno é "nem tudo carregou" (pacote ausente, 404,
 * prazo, JSON inválido), e quem chama cai no fallback (docs/30 §11.8).
 * Uma falha não fica gravada: chamar de novo tenta de novo (manifest e
 * pacote); duas chamadas simultâneas para a mesma matéria fazem um `fetch` só.
 */
export async function ensureSubjects(subjectIds: string[]): Promise<boolean> {
  const manifest = await loadManifest();
  if (!manifest) return false;
  const resultados = await Promise.all(subjectIds.map((subjectId) => loadSubject(manifest, subjectId)));
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
  packagesInFlight.clear();
  manifestPromise = null;
}
