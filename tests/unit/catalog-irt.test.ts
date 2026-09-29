import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { irtFromDifficulty } from "@/content/items/irt";
import { ITENS_GERADOS } from "@/content/banco/itens-gerados";
import type { Exercise } from "@/lib/lessons/types";
import {
  ehIrtDefault,
  recalibrarPacote,
  serializar,
} from "../../scripts/content/recalibrar-irt-dificuldade";

/**
 * Catálogo de pacotes: `irt` por dificuldade editorial (docs/36 T-04.2,
 * RP-2, G-7). Antes, 755 itens tinham `{a:1,b:0,c:0.2}` (default de
 * publicação) e a seleção "por informação" degenerava (Fisher idêntica).
 */

const BANCO = "src/content/banco";

interface ItemJson {
  id: string;
  exercise: Exercise;
  meta: {
    difficulty: 1 | 2 | 3 | 4 | 5;
    irt: { a: number; b: number; c: number; source: string; calibratedFrom?: string };
  };
}

function jsonDoBanco(dir = BANCO): string[] {
  const out: string[] = [];
  for (const nome of readdirSync(dir)) {
    const full = join(dir, nome);
    if (statSync(full).isDirectory()) out.push(...jsonDoBanco(full));
    else if (nome.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

const TODOS: ItemJson[] = jsonDoBanco().flatMap(
  (f) => (JSON.parse(readFileSync(f, "utf-8")) as { items: ItemJson[] }).items,
);

describe("catálogo de pacotes — irt por dificuldade (RP-2, G-7)", () => {
  test("o acervo é o esperado (755 itens de pacote, todos de múltipla escolha)", () => {
    expect(TODOS.length).toBe(755);
    expect(TODOS.every((i) => i.exercise.type === "multipla-escolha")).toBe(true);
  });

  test("todo item sem calibratedFrom tem exatamente irtFromDifficulty(dificuldade, exercício), source 'estimado'", () => {
    const fora: string[] = [];
    for (const it of TODOS) {
      if (it.meta.irt.calibratedFrom) continue;
      const esperado = irtFromDifficulty(it.meta.difficulty, it.exercise);
      const { a, b, c, source } = it.meta.irt;
      if (a !== esperado.a || b !== esperado.b || c !== esperado.c || source !== "estimado") fora.push(it.id);
    }
    expect(fora).toEqual([]);
  });

  test("b = 0 só existe em dificuldade 3 (nenhum item ficou com o default por esquecimento)", () => {
    const b0ForaD3 = TODOS.filter((i) => i.meta.irt.b === 0 && i.meta.difficulty !== 3).map((i) => i.id);
    expect(b0ForaD3).toEqual([]);
  });

  test("nenhum item com o default antigo {a:1,b:0,c:0.2} fora dos que o mapa leva exatamente a ele (d3 com 5 alternativas)", () => {
    const restantes = TODOS.filter((i) => ehIrtDefault(i.meta.irt));
    for (const it of restantes) {
      expect(it.meta.difficulty).toBe(3);
      expect((it.exercise as { opcoes: string[] }).opcoes.length).toBe(5);
    }
  });

  test("b reflete a escala 1–5: existem itens em pelo menos 4 valores distintos e b cresce com a dificuldade", () => {
    const porDif = new Map<number, Set<number>>();
    for (const it of TODOS) {
      const s = porDif.get(it.meta.difficulty) ?? new Set<number>();
      s.add(it.meta.irt.b);
      porDif.set(it.meta.difficulty, s);
    }
    // cada dificuldade tem UM b só, e a ordem é crescente
    const bs = [...porDif.entries()].sort((x, y) => x[0] - y[0]).map(([, set]) => {
      expect(set.size).toBe(1);
      return [...set][0];
    });
    expect(bs).toEqual([...bs].sort((x, y) => x - y));
    expect(new Set(TODOS.map((i) => i.meta.irt.b)).size).toBeGreaterThanOrEqual(4);
  });

  test("c = 1/nOpções (4 alternativas -> 0,25; 5 -> 0,2)", () => {
    for (const it of TODOS) {
      const n = (it.exercise as { opcoes: string[] }).opcoes.length;
      expect(it.meta.irt.c).toBeCloseTo(1 / n, 10);
    }
  });

  test("o índice derivado itens-gerados.ts está em dia com o JSON (rode `bun run build` se falhar)", () => {
    const porId = new Map(TODOS.map((i) => [i.id, i]));
    // ignora itens de fixture de outros testes (ex.: `gen:__teste__:1`) — só confere os que existem no JSON
    const doAcervo = ITENS_GERADOS.filter((r) => porId.has(r.id));
    expect(doAcervo.length).toBe(TODOS.length);
    for (const ref of doAcervo) {
      const it = porId.get(ref.id)!;
      expect([ref.a, ref.b, ref.c]).toEqual([it.meta.irt.a, it.meta.irt.b, it.meta.irt.c]);
    }
  });
});

describe("recalibrar-irt-dificuldade — script", () => {
  const ex4: Exercise = {
    type: "multipla-escolha",
    pergunta: "Pergunta de teste?",
    opcoes: ["a", "b", "c", "d"],
    correta: 1,
    explicacao: "x",
  };
  const DEFAULT = { a: 1, b: 0, c: 0.2, source: "estimado" };

  function pacote(difficulty: number, irt: Record<string, unknown> = { ...DEFAULT }) {
    return {
      subjectId: "mat",
      items: [{ id: `gen:mat:x:${difficulty}`, exercise: ex4, meta: { difficulty, irt, roles: ["pratica"] } }],
    };
  }

  test("ehIrtDefault: só o default exato, sem calibratedFrom e sem chaves extras", () => {
    expect(ehIrtDefault({ ...DEFAULT })).toBe(true);
    expect(ehIrtDefault({ ...DEFAULT, calibratedFrom: "inep-distribuicao" })).toBe(false);
    expect(ehIrtDefault({ ...DEFAULT, b: 0.8 })).toBe(false);
    expect(ehIrtDefault({ ...DEFAULT, source: "inep" })).toBe(false);
    expect(ehIrtDefault({ ...DEFAULT, extra: 1 })).toBe(false);
    expect(ehIrtDefault(undefined)).toBe(false);
  });

  test("aplica irtFromDifficulty (b pela dificuldade, c = 1/4) e relata por dificuldade", () => {
    const p = pacote(4);
    const rel = recalibrarPacote(p as never);
    expect(p.items[0].meta.irt).toEqual({ a: 1, b: 0.8, c: 0.25, source: "estimado" });
    expect(rel).toEqual({ comDefault: 1, alterados: 1, porDificuldade: { 4: 1 }, ignorados: [] });
  });

  test("idempotente: a 2ª passada não altera nada", () => {
    const p = pacote(1);
    recalibrarPacote(p as never);
    const depois = JSON.stringify(p);
    const rel2 = recalibrarPacote(p as never);
    expect(rel2.alterados).toBe(0);
    expect(JSON.stringify(p)).toBe(depois);
  });

  test("item com calibratedFrom ou irt não-default fica intacto", () => {
    const calibrado = pacote(2, { a: 1, b: 0.3, c: 0.2, source: "estimado", calibratedFrom: "inep-distribuicao" });
    const manual = pacote(5, { a: 1.4, b: 1.1, c: 0.2, source: "estimado" });
    const antesC = JSON.stringify(calibrado);
    const antesM = JSON.stringify(manual);
    expect(recalibrarPacote(calibrado as never).alterados).toBe(0);
    expect(recalibrarPacote(manual as never).alterados).toBe(0);
    expect(JSON.stringify(calibrado)).toBe(antesC);
    expect(JSON.stringify(manual)).toBe(antesM);
  });

  test("dificuldade 3 com 4 alternativas muda só o c (0,2 -> 0,25); com 5 alternativas nada muda", () => {
    const p4 = pacote(3);
    expect(recalibrarPacote(p4 as never).alterados).toBe(1);
    expect(p4.items[0].meta.irt).toEqual({ a: 1, b: 0, c: 0.25, source: "estimado" });
    const p5 = pacote(3);
    (p5.items[0].exercise as { opcoes: string[] }).opcoes = ["a", "b", "c", "d", "e"];
    expect(recalibrarPacote(p5 as never).alterados).toBe(0);
  });

  test("só o irt muda: enunciado, alternativas, gabarito e o resto do meta ficam idênticos", () => {
    const p = pacote(5);
    const antes = structuredClone(p);
    recalibrarPacote(p as never);
    const strip = (x: typeof p) => ({ ...x, items: x.items.map((i) => ({ ...i, meta: { ...i.meta, irt: undefined } })) });
    expect(JSON.stringify(strip(p))).toBe(JSON.stringify(strip(antes)));
  });

  test("dificuldade inválida é ignorada e relatada", () => {
    const p = pacote(9);
    const rel = recalibrarPacote(p as never);
    expect(rel.alterados).toBe(0);
    expect(rel.ignorados).toEqual(["gen:mat:x:9"]);
  });

  test("todo arquivo do banco já está na forma canônica (o script não gera diff além do irt)", () => {
    for (const f of jsonDoBanco()) {
      const bruto = readFileSync(f, "utf-8");
      expect(serializar(JSON.parse(bruto))).toBe(bruto);
    }
  });

  test("`--check` no acervo real sai com exit 0 (nada a alterar) — trava regressão do default", () => {
    const r = Bun.spawnSync(["bun", "scripts/content/recalibrar-irt-dificuldade.ts", "--check"], {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(r.exitCode).toBe(0);
  });
});
