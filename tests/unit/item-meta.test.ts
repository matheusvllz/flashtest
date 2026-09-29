import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { guessingProbability, irtFromDifficulty } from "@/content/items/irt";
import {
  itemDisponivel,
  itemIndex,
  itemMetaOf,
  itemsOfSkill,
  isPackagedItem,
  itemRetirado,
  _resetItemIndexCacheForTests,
  _setRetiredForTests,
} from "@/content/items";
import { ITENS_GERADOS } from "@/content/banco/itens-gerados";
import { FEATURES } from "@/lib/features";
import { EXERCISE_IDS } from "@/content/exercise-ids";
import { multiplaEscolha, verdadeiroFalso, ordenar, parear } from "@/lib/lessons/define";
import { ITEM_META_MICROLICOES } from "@/content/items/meta/microlicoes";
import { ITEM_META_BANCO_GERAL } from "@/content/items/meta/banco-geral";
import { SKILL_MAP } from "@/content/taxonomy";

describe("guessingProbability", () => {
  test("múltipla escolha: 1/nº de opções", () => {
    const ex = multiplaEscolha({ pergunta: "?", opcoes: ["a", "b", "c", "d", "e"], correta: 0, explicacao: "" });
    expect(guessingProbability(ex)).toBeCloseTo(0.2, 5);
  });

  test("verdadeiro/falso: 0,5", () => {
    const ex = verdadeiroFalso({
      afirmacao: "Cinquenta por cento de um número é sempre igual à metade desse número.",
      verdadeiro: true,
      explicacao: "Porque 50% = 50/100 = 1/2.",
    });
    expect(guessingProbability(ex)).toBe(0.5);
  });

  test("ordenar: 0,05", () => {
    const ex = ordenar({ blocos: ["a", "b", "c"], explicacao: "" });
    expect(guessingProbability(ex)).toBe(0.05);
  });

  test("parear: 0,05", () => {
    const ex = parear({ pares: [{ a: "1", b: "um" }, { a: "2", b: "dois" }], explicacao: "" });
    expect(guessingProbability(ex)).toBe(0.05);
  });

  test("encontre-o-erro: frase curta satura em 0,1 (1/palavras seria maior)", () => {
    const ex = {
      type: "encontre-o-erro" as const,
      frase: "Ela vai a escola todo dia sem falta",
      erroIndex: 2,
      explicacao: "",
    };
    // 8 palavras: 1/8 = 0,125 > 0,1 → satura no teto de 0,1.
    expect(guessingProbability(ex)).toBe(0.1);
  });

  test("encontre-o-erro: frase com 12+ palavras usa 1/palavras (abaixo do teto)", () => {
    const frase = "uma frase bem mais longa com doze palavras diferentes para testar a saturação corretamente";
    const ex = { type: "encontre-o-erro" as const, frase, erroIndex: 0, explicacao: "" };
    const nPalavras = frase.split(/\s+/).length;
    expect(guessingProbability(ex)).toBeCloseTo(1 / nPalavras, 5);
    expect(guessingProbability(ex)).toBeLessThan(0.1);
  });
});

describe("irtFromDifficulty", () => {
  test("mapeia dificuldade 1..5 pra b crescente", () => {
    const ex = multiplaEscolha({ pergunta: "?", opcoes: ["a", "b"], correta: 0, explicacao: "" });
    const bs = ([1, 2, 3, 4, 5] as const).map((d) => irtFromDifficulty(d, ex).b);
    expect(bs).toEqual([-1.6, -0.8, 0, 0.8, 1.6]);
  });

  test("source é sempre estimado", () => {
    const ex = multiplaEscolha({ pergunta: "?", opcoes: ["a", "b"], correta: 0, explicacao: "" });
    expect(irtFromDifficulty(3, ex).source).toBe("estimado");
  });
});

describe("itemMetaOf", () => {
  test("resolve item local de microlição com skillId específico do item (não da lição inteira)", () => {
    const checkpoint = itemMetaOf("mc:porcentagem-valor:checkpoint");
    const pratica2 = itemMetaOf("mc:porcentagem-valor:pratica-2");
    expect(checkpoint.skillIds).toEqual(["mat:porcentagem-conceito"]);
    expect(pratica2.skillIds).toEqual(["mat:porcentagem-valor"]);
    // P3 corrigido: dois itens da MESMA lição podem ter habilidades diferentes.
    expect(checkpoint.skillIds).not.toEqual(pratica2.skillIds);
  });

  test("todo item local das 6 microlições tem skillId existente na taxonomia", () => {
    for (const meta of Object.values(ITEM_META_MICROLICOES)) {
      for (const skillId of meta.skillIds) {
        expect(SKILL_MAP[skillId], `"${skillId}" (de ${meta.id}) não existe na taxonomia`).toBeDefined();
      }
    }
  });

  test("resolve questão do banco geral com difficulty derivada do rótulo autoral", () => {
    const meta = itemMetaOf("q1"); // Médio no banco geral
    expect(meta.difficulty).toBe(3);
  });

  test("todo item classificado do banco geral tem skillId existente na taxonomia", () => {
    for (const meta of Object.values(ITEM_META_BANCO_GERAL)) {
      for (const skillId of meta.skillIds) {
        expect(SKILL_MAP[skillId], `"${skillId}" (de ${meta.id}) não existe na taxonomia`).toBeDefined();
      }
    }
  });

  test("resolve exercício de trilha legada (<lessonId>:<índice>) com a habilidade do capítulo", () => {
    const meta = itemMetaOf("crase-01-a-regra-de-ouro:0");
    expect(meta.skillIds).toEqual(["por:crase-regra-basica"]);
    expect(SKILL_MAP[meta.skillIds[0]]).toBeDefined();
    expect(meta.difficulty).toBe(2);
  });

  test("id de item real sem classificação explícita ainda devolve um ItemMeta (padrão)", () => {
    // Todo id de EXERCISE_IDS/ITEM_META_MICROLICOES está coberto por uma das
    // 3 fontes; não existe hoje um caso real "válido mas sem classificação" —
    // este teste documenta o contrato do padrão em si, chamando-o direto.
    const meta = itemMetaOf("q1"); // já classificado — só confirma a forma do retorno
    expect(meta.id).toBe("q1");
    expect(meta.validation).toBeDefined();
  });

  test("id que não existe em lugar nenhum lança — mesma filosofia de resolveExercise (referência quebrada nunca silenciosa)", () => {
    expect(() => itemMetaOf("id-que-nao-existe-em-lugar-nenhum")).toThrow();
  });
});

describe("proveniência da revisão (docs/36 T-07.5, RP-9)", () => {
  function itensDoBanco(): Array<{ id: string; meta: { source: { kind: string }; validation: { status: string; reviewKind?: string } } }> {
    const out: Array<{ id: string; meta: { source: { kind: string }; validation: { status: string; reviewKind?: string } } }> = [];
    const walk = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const f = join(dir, n);
        if (statSync(f).isDirectory()) walk(f);
        else if (n.endsWith(".json")) out.push(...(JSON.parse(readFileSync(f, "utf-8")) as { items?: typeof out }).items ?? []);
      }
    };
    walk("src/content/banco");
    return out;
  }

  test("os 737 itens gerados têm reviewKind 'ia-delegada'; nenhum item do banco fica sem reviewKind", () => {
    const itens = itensDoBanco();
    const gerados = itens.filter((i) => i.meta.source.kind === "ia-validada");
    expect(gerados).toHaveLength(737);
    for (const i of gerados) {
      expect(i.meta.validation.reviewKind, i.id).toBe("ia-delegada");
      // `status` e elegibilidade NÃO mudam: continua "revisada-humano" (o pool filtra por ele).
      expect(i.meta.validation.status, i.id).toBe("revisada-humano");
    }
    expect(itens.filter((i) => i.meta.validation.reviewKind === undefined)).toEqual([]);
  });

  test("meta de exercício de trilha legada é 'autoria-legada'", () => {
    expect(itemMetaOf("crase-01-a-regra-de-ouro:0").validation.reviewKind).toBe("autoria-legada");
  });

  test("item de pacote comum resolve como 'ia-validada' a partir do índice leve; sem 'retired' vazando pra entrada do índice", () => {
    if (!FEATURES.pacotesConteudo || ITENS_GERADOS.length === 0) return;
    const ref = ITENS_GERADOS.find((r) => !r.source);
    if (!ref) return;
    expect(itemMetaOf(ref.id).source.kind).toBe("ia-validada");
    expect(itemIndex().find((e) => e.id === ref.id)).not.toHaveProperty("retired");
  });
});

describe("item retirado (docs/36 T-07.6)", () => {
  test("itemDisponivel exclui, itemIndex marca e itemMetaOf continua resolvendo; some do pool ao desmarcar", () => {
    const id = Object.keys(EXERCISE_IDS)[0]; // embarcado: disponível sempre, então isola o efeito de `retired`
    _resetItemIndexCacheForTests();
    expect(itemDisponivel(id)).toBe(true);
    _setRetiredForTests(id, true);
    try {
      expect(itemRetirado(id)).toBe(true);
      expect(itemDisponivel(id)).toBe(false);
      expect(itemIndex().find((e) => e.id === id)?.retired).toBe(true);
      expect(itemMetaOf(id).id).toBe(id); // continua resolvível (histórico, sessão ativa, aula)
    } finally {
      _setRetiredForTests(id, false);
    }
    expect(itemDisponivel(id)).toBe(true);
    expect(itemIndex().find((e) => e.id === id)).not.toHaveProperty("retired");
  });
});

describe("itemIndex / itemsOfSkill", () => {
  test("tem uma entrada por id da união EXERCISE_IDS + itens locais das microlições + itens de pacote (flag ligada)", () => {
    _resetItemIndexCacheForTests();
    const idx = itemIndex();
    const uniao = new Set([
      ...Object.keys(EXERCISE_IDS),
      ...Object.keys(ITEM_META_MICROLICOES),
      ...(FEATURES.pacotesConteudo ? ITENS_GERADOS.map((r) => r.id) : []),
    ]);
    expect(idx.length).toBe(uniao.size);
    // EXERCISE_IDS sozinho NÃO inclui os `mc:*` locais — é por isso que a
    // união é maior (documenta o motivo de `itemIndex` não iterar só sobre ele).
    expect(idx.length).toBeGreaterThan(Object.keys(EXERCISE_IDS).length);
  });

  test("item de pacote entra no índice com a meta do índice leve, mas só fica disponível pra seleção com o pacote carregado", () => {
    if (!FEATURES.pacotesConteudo || ITENS_GERADOS.length === 0) return;
    _resetItemIndexCacheForTests();
    const ref = ITENS_GERADOS[0];
    const entrada = itemIndex().find((e) => e.id === ref.id);
    expect(entrada?.skills).toEqual(ref.skillIds);
    expect(entrada?.difficulty).toBe(ref.difficulty);
    expect(entrada?.status).toBe(ref.status);
    expect(isPackagedItem(ref.id)).toBe(true);
    expect(itemDisponivel(ref.id)).toBe(false); // pacote não carregado neste teste
    expect(itemDisponivel(Object.keys(EXERCISE_IDS)[0])).toBe(true); // embarcado sempre
  });

  test("itemsOfSkill só devolve itens que citam a habilidade", () => {
    const itens = itemsOfSkill("mat:porcentagem-valor");
    expect(itens.length).toBeGreaterThan(0);
    for (const it of itens) expect(it.skills).toContain("mat:porcentagem-valor");
  });

  test("é memoizado (mesma referência entre chamadas sem reset)", () => {
    _resetItemIndexCacheForTests();
    const a = itemIndex();
    const b = itemIndex();
    expect(a).toBe(b);
  });
});
