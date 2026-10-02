/**
 * Conteúdo no servidor (docs/specs/46-producao §E.4): o servidor precisa do exercício para
 * recalcular a correção de uma resposta (`checkAnswer`) e saber se o item/lição existe.
 *
 * - Itens embarcados (banco geral, trilhas de redação, microlições): `resolveExercise`.
 * - Itens de pacote: as fontes de `src/content/banco/**` (as mesmas que o `build-packs.ts` usa),
 *   empacotadas pelo Vite no build do servidor (`import.meta.glob`) ou lidas do disco nos testes.
 * O conteúdo continua estático: nada disso vai para o banco de dados.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { ContentPackage, ContentPackageItem } from "@/content/items/package";
import type { Exercise } from "@/lib/lessons/types";

let pacotes: Map<string, ContentPackageItem> | undefined;
let licoesDePacote: Set<string> | undefined;

function carregarDoDisco(): Partial<ContentPackage>[] {
  const raiz = join(process.cwd(), "src", "content", "banco");
  const saida: Partial<ContentPackage>[] = [];
  const andar = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      const p = join(dir, nome);
      if (statSync(p).isDirectory()) andar(p);
      else if (nome.endsWith(".json")) saida.push(JSON.parse(readFileSync(p, "utf8")) as Partial<ContentPackage>);
    }
  };
  andar(raiz);
  return saida;
}

function carregarDoBundle(): Partial<ContentPackage>[] | undefined {
  // O Vite troca a CHAMADA `import.meta.glob(...)` pelos módulos no build; `import.meta.glob` como valor continua
  // `undefined`, então não dá para testar com `typeof` (era o que deixava a produção lendo um disco que não existe:
  // `ENOENT … src/content/banco`, spec 48 D48-17). No `bun test` a chamada lança e cai no disco.
  try {
    const modulos = import.meta.glob<Partial<ContentPackage>>("/src/content/banco/**/*.json", {
      eager: true,
      import: "default",
    });
    return Object.values(modulos);
  } catch {
    return undefined;
  }
}

function indice(): Map<string, ContentPackageItem> {
  if (pacotes) return pacotes;
  const partes = carregarDoBundle() ?? carregarDoDisco();
  pacotes = new Map();
  licoesDePacote = new Set();
  for (const parte of partes) {
    for (const item of parte.items ?? []) pacotes.set(item.id, item);
    for (const licao of parte.lessons ?? []) licoesDePacote.add(licao.id);
  }
  return pacotes;
}

/** O exercício do item, ou `undefined` se o id não existe em nenhuma fonte. */
export async function exercicioDoItem(itemId: string): Promise<Exercise | undefined> {
  const doPacote = indice().get(itemId);
  if (doPacote) return doPacote.exercise;
  try {
    const { resolveExercise } = await import("@/content/microlicoes");
    return resolveExercise(itemId);
  } catch {
    return undefined;
  }
}

/** A lição existe (microlição embarcada, lição de pacote ou lição legada de redação)? */
export async function licaoExiste(licaoId: string, tipo: "redacao" | "micro"): Promise<boolean> {
  indice();
  if (tipo === "micro") {
    if (licoesDePacote?.has(licaoId)) return true;
    const { phaseById } = await import("@/content/microlicoes");
    return phaseById(licaoId) !== undefined;
  }
  const { lessonById } = await import("@/content/trilhas");
  return lessonById(licaoId) !== null;
}

/** Só testes. */
export function _limparCacheDeConteudo(): void {
  pacotes = undefined;
  licoesDePacote = undefined;
}

/**
 * Área do ENEM de um item (spec 50 §5.4.1: missão "Praticar <área>"). Pelo metadado do pacote ou, para os itens
 * embarcados, pelo índice do app; sem habilidade conhecida, `null`.
 */
export async function areaDoItem(itemId: string): Promise<"LC" | "CH" | "CN" | "MT" | null> {
  const { SKILL_MAP } = await import("@/content/taxonomy");
  const { areaOfSubject } = await import("@/content/taxonomy/areas");
  let skillIds = indice().get(itemId)?.meta?.skillIds;
  if (!skillIds?.length) {
    try {
      const { itemMetaOf } = await import("@/content/items");
      skillIds = itemMetaOf(itemId).skillIds;
    } catch {
      skillIds = [];
    }
  }
  for (const s of skillIds ?? []) {
    const area = areaOfSubject(SKILL_MAP[s]?.subjectId ?? "");
    if (area === "LC" || area === "CH" || area === "CN" || area === "MT") return area;
  }
  return null;
}

export interface ItemOficial {
  id: string;
  ano: number;
  dia: 1 | 2;
  numero: number;
  area: "LC" | "CH" | "CN" | "MT";
  skillIds: string[];
}

let oficiais: ItemOficial[] | undefined;

/**
 * Questões oficiais do ENEM nos pacotes (spec 50 §5.9.4), com ano, dia, número e área tirados da referência do
 * caderno ("ENEM 2022 · 2º dia · caderno 7 azul · questão 136"). A área sai do número: dia 1, 1–45 Linguagens e
 * 46–90 Humanas; dia 2, 91–135 Natureza e 136–180 Matemática. Itens retirados (`retired`) ficam fora.
 */
export function itensOficiais(): ItemOficial[] {
  if (oficiais) return oficiais;
  oficiais = [];
  for (const item of indice().values()) {
    const meta = item.meta as { source?: { kind?: string; exam?: string; year?: number; ref?: string }; retired?: boolean; skillIds?: string[] } | undefined;
    const s = meta?.source;
    if (!s || s.kind !== "oficial" || s.exam !== "ENEM" || !s.year || meta?.retired) continue;
    const dia = /(\d)º dia/.exec(s.ref ?? "")?.[1];
    const numero = Number(/questão (\d+)/.exec(s.ref ?? "")?.[1]);
    if ((dia !== "1" && dia !== "2") || !numero) continue;
    const area = numero <= 45 ? "LC" : numero <= 90 ? "CH" : numero <= 135 ? "CN" : "MT";
    oficiais.push({ id: item.id, ano: s.year, dia: Number(dia) as 1 | 2, numero, area, skillIds: meta?.skillIds ?? [] });
  }
  oficiais.sort((a, b) => a.ano - b.ano || a.numero - b.numero);
  return oficiais;
}
