#!/usr/bin/env bun
/**
 * Constrói os pacotes de conteúdo públicos a partir de `src/content/banco/`
 * (docs/30 §21.3, Fase 3 T-3.7/T-3.8) — roda em `predev`/`prebuild`
 * (`package.json`). Com `src/content/banco/` vazio (estado normal até a
 * Fase 11 gerar conteúdo de verdade), gera um manifest vazio e não quebra o
 * build (Definition of Done da T-3.8).
 *
 * Formato de entrada esperado (quando existir): `src/content/banco/
 * <materia>/<qualquerNome>.json`, cada arquivo um `ContentPackage` PARCIAL
 * (`{ subjectId, items?, lessons? }` — `version` é opcional na entrada,
 * default 1). Vários arquivos da mesma matéria são fundidos num pacote só.
 *
 * `--root <dir>` (docs/36 T-07.6): constrói TUDO dentro de `<dir>` — entrada em `<dir>/banco`,
 * pacotes em `<dir>/public-content`, índices gerados em `<dir>/aulas-geradas.ts` e
 * `<dir>/itens-gerados.ts` — sem tocar `src/content/banco` nem `public/content`. É o que os testes
 * usam (fixture em diretório temporário); sem a flag, o comportamento é o de sempre.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { createHash } from "node:crypto";
import type { Exercise, ExerciseImage } from "@/lib/lessons/types";
import type {
  ContentManifest,
  ContentPackage,
  ContentPackageItem,
  GeneratedItemRef,
  GeneratedLessonRef,
} from "@/content/items/package";

export interface BuildPaths {
  bancoDir: string;
  outDir: string;
  aulasGeradasPath: string;
  itensGeradosPath: string;
}

export const DEFAULT_PATHS: BuildPaths = {
  bancoDir: "src/content/banco",
  outDir: "public/content/v1",
  aulasGeradasPath: "src/content/banco/aulas-geradas.ts",
  itensGeradosPath: "src/content/banco/itens-gerados.ts",
};

/** Caminhos de um build isolado sob `root` (ver `--root`). */
export function pathsUnderRoot(root: string): BuildPaths {
  return {
    bancoDir: join(root, "banco"),
    outDir: join(root, "public-content"),
    aulasGeradasPath: join(root, "aulas-geradas.ts"),
    itensGeradosPath: join(root, "itens-gerados.ts"),
  };
}

/** Índice leve de um item de pacote (docs/30 §21.3) — só o que o motor precisa pra escolher o item antes do pacote carregar. */
export function itemRefOf(subjectId: string, item: ContentPackageItem): GeneratedItemRef {
  const source = item.meta.source;
  return {
    id: item.id,
    subjectId,
    skillIds: item.meta.skillIds,
    difficulty: item.meta.difficulty,
    a: item.meta.irt.a,
    b: item.meta.irt.b,
    c: item.meta.irt.c,
    roles: item.meta.roles,
    status: item.meta.validation.status,
    // Só o que foge do padrão: oficial carrega a atribuição no índice (docs/36 T-07.5) e retirado é marcado (T-07.6).
    ...(source.kind !== "ia-validada"
      ? {
          source: {
            kind: source.kind,
            ...(source.exam !== undefined ? { exam: source.exam } : {}),
            ...(source.year !== undefined ? { year: source.year } : {}),
            ...(source.ref !== undefined ? { ref: source.ref } : {}),
          },
        }
      : {}),
    ...(item.retired === true ? { retired: true as const } : {}),
  };
}

function findJsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...findJsonFiles(full));
    else if (entry.endsWith(".json")) out.push(full);
  }
  return out;
}

function hashOf(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 10);
}

/** Prefixo das imagens de questão nos itens (spec 50 §5.9.3). */
const PREFIXO_IMG = "/content/img/";

/**
 * Copia as imagens de questão (`<banco>/oficial/img/**`) para `<public>/content/img/`, com o hash do conteúdo no
 * nome (`d1-q012-1.<hash>.webp`), e devolve o mapa url original → url publicada. Nome com hash permite o
 * `Cache-Control: immutable` do `vercel.json`: imagem nova = url nova.
 */
export function copiarImagens(bancoDir: string, imgOutDir: string): Map<string, string> {
  const origem = join(bancoDir, "oficial", "img");
  const mapa = new Map<string, string>();
  rmSync(imgOutDir, { recursive: true, force: true });
  if (!existsSync(origem)) return mapa;
  const andar = (dir: string, rel: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      const relativo = rel ? `${rel}/${entry}` : entry;
      if (statSync(full).isDirectory()) andar(full, relativo);
      else if (/\.(webp|png|jpe?g|svg)$/i.test(entry)) {
        const buf = readFileSync(full);
        const ext = extname(entry);
        const publicado = `${relativo.slice(0, -ext.length)}.${hashOf(buf)}${ext}`;
        mkdirSync(dirname(join(imgOutDir, publicado)), { recursive: true });
        writeFileSync(join(imgOutDir, publicado), buf);
        mapa.set(`${PREFIXO_IMG}${relativo}`, `${PREFIXO_IMG}${publicado}`);
      }
    }
  };
  andar(origem, "");
  return mapa;
}

/** Troca as urls de imagem do item pelas publicadas (com hash). Url local sem arquivo = erro de build. */
export function reescreverImagens(item: ContentPackageItem, mapa: Map<string, string>): ContentPackageItem {
  const ex = item.exercise as Exercise;
  const troca = (img: ExerciseImage): ExerciseImage => {
    if (!img.url.startsWith(PREFIXO_IMG)) return img;
    const nova = mapa.get(img.url);
    if (!nova) throw new Error(`[build-packs] item "${item.id}" cita imagem que não existe: "${img.url}"`);
    return { ...img, url: nova };
  };
  if (!ex.imagem && !ex.imagens && !(ex.type === "multipla-escolha" && ex.opcoesImagem)) return item;
  const novo: Exercise = { ...ex };
  if (ex.imagem) novo.imagem = troca(ex.imagem);
  if (ex.imagens) novo.imagens = ex.imagens.map(troca);
  if (ex.type === "multipla-escolha" && ex.opcoesImagem && novo.type === "multipla-escolha") {
    novo.opcoesImagem = ex.opcoesImagem.map((o) => (o ? troca(o) : null));
  }
  return { ...item, exercise: novo };
}

function mergePackages(subjectId: string, parts: Partial<ContentPackage>[]): ContentPackage {
  const items: ContentPackageItem[] = [];
  const lessons: ContentPackage["lessons"] = [];
  const seenItemIds = new Set<string>();
  const seenLessonIds = new Set<string>();
  for (const part of parts) {
    for (const item of part.items ?? []) {
      if (seenItemIds.has(item.id)) {
        throw new Error(`[build-packs] id de item duplicado dentro da matéria "${subjectId}": "${item.id}"`);
      }
      seenItemIds.add(item.id);
      items.push(item);
    }
    for (const lesson of part.lessons ?? []) {
      if (seenLessonIds.has(lesson.id)) {
        throw new Error(`[build-packs] id de lição duplicado dentro da matéria "${subjectId}": "${lesson.id}"`);
      }
      seenLessonIds.add(lesson.id);
      lessons.push(lesson);
    }
  }
  return { version: 1, subjectId, items, lessons };
}

export function build(paths: BuildPaths = DEFAULT_PATHS): void {
  const { bancoDir: BANCO_DIR, outDir: OUT_DIR, aulasGeradasPath: AULAS_GERADAS_PATH, itensGeradosPath: ITENS_GERADOS_PATH } = paths;
  const files = findJsonFiles(BANCO_DIR);
  const bySubject = new Map<string, Partial<ContentPackage>[]>();

  for (const file of files) {
    let parsed: Partial<ContentPackage>;
    try {
      parsed = JSON.parse(readFileSync(file, "utf-8")) as Partial<ContentPackage>;
    } catch (error) {
      throw new Error(`[build-packs] "${file}" não é JSON válido: ${(error as Error).message}`);
    }
    if (!parsed.subjectId || typeof parsed.subjectId !== "string") {
      throw new Error(`[build-packs] "${file}" não declara "subjectId"`);
    }
    const lista = bySubject.get(parsed.subjectId) ?? [];
    lista.push(parsed);
    bySubject.set(parsed.subjectId, lista);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  // `public/content/v1` → `public/content/img` (com `--root`: `<root>/img`).
  const imagens = copiarImagens(BANCO_DIR, join(dirname(OUT_DIR), "img"));
  mkdirSync(dirname(AULAS_GERADAS_PATH), { recursive: true });
  mkdirSync(dirname(ITENS_GERADOS_PATH), { recursive: true });

  const manifest: ContentManifest = { version: 1, generatedAt: new Date().toISOString(), subjects: {} };
  const aulasGeradas: GeneratedLessonRef[] = [];
  const itensGerados: GeneratedItemRef[] = [];

  for (const [subjectId, parts] of [...bySubject].sort(([a], [b]) => a.localeCompare(b))) {
    const pkg = mergePackages(subjectId, parts);
    pkg.items = pkg.items.map((item) => reescreverImagens(item, imagens));
    for (const item of pkg.items) itensGerados.push(itemRefOf(subjectId, item));
    const json = JSON.stringify(pkg);
    const hash = hashOf(json);
    const fileName = `${subjectId}.${hash}.json`;
    writeFileSync(join(OUT_DIR, fileName), json, "utf-8");
    manifest.subjects[subjectId] = {
      path: `/content/v1/${fileName}`,
      hash,
      itemCount: pkg.items.length,
      lessonCount: pkg.lessons.length,
    };
    for (const lesson of pkg.lessons) {
      aulasGeradas.push({
        lessonId: lesson.id,
        chapterId: lesson.chapterId,
        subjectId: lesson.subjectId,
        skillIds: lesson.skillIds,
        title: lesson.title,
      });
    }
  }

  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest), "utf-8");

  const aulasGeradasSrc = `/**
 * GERADO por \`scripts/content/build-packs.ts\` a partir de \`src/content/banco/\`
 * (docs/30 §21.3, Fase 3 T-3.7). Não editar à mão — rodar \`bun scripts/
 * content/build-packs.ts\` de novo depois de mudar o conteúdo em pacotes.
 * Vazio até a Fase 11 gerar conteúdo de verdade.
 */
import type { GeneratedLessonRef } from "@/content/items/package";

export const AULAS_GERADAS: GeneratedLessonRef[] = ${JSON.stringify(aulasGeradas, null, 2)};
`;
  writeFileSync(AULAS_GERADAS_PATH, aulasGeradasSrc, "utf-8");

  const itensGeradosSrc = `/**
 * GERADO por \`scripts/content/build-packs.ts\` a partir de \`src/content/banco/\`
 * (docs/30 §21.3, índice leve). Não editar à mão. Lista os itens de pacote
 * pro motor poder escolhê-los antes do pacote da matéria carregar; o texto do
 * item só chega com \`ensureSubjects\`.
 */
import type { GeneratedItemRef } from "@/content/items/package";

export const ITENS_GERADOS: GeneratedItemRef[] = ${JSON.stringify(itensGerados)};
`;
  writeFileSync(ITENS_GERADOS_PATH, itensGeradosSrc, "utf-8");

  console.log(
    `[build-packs] ${bySubject.size} matéria(s) empacotada(s), ${aulasGeradas.length} aula(s) gerada(s) — manifest em ${OUT_DIR}/manifest.json`,
  );
}

function parseRoot(argv: string[]): string | undefined {
  const i = argv.indexOf("--root");
  if (i >= 0) {
    const v = argv[i + 1];
    if (!v || v.startsWith("--")) throw new Error("[build-packs] --root exige um diretório");
    return v;
  }
  return argv.find((a) => a.startsWith("--root="))?.split("=")[1];
}

if (import.meta.main) {
  const root = parseRoot(process.argv.slice(2));
  build(root ? pathsUnderRoot(root) : DEFAULT_PATHS);
}
