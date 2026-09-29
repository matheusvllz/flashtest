import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { COPY, textoSePersistiu } from "@/lib/copy";

/**
 * docs/36 RF-14 / G-15 (achado A1 do spec-verifier): nenhuma tela afirma que o
 * progresso está "salvo" quando a gravação local não está ok. O texto que
 * promete persistência tem uma variante neutra, e a variante é escolhida pelo
 * status de runtime do store (`usePersistStatus`/`getRuntimeStatus`).
 */

const PROMETE_SALVO = /\bsalv(o|a|ou)\b/i;

/** Pares [frase que promete, variante neutra] — cada um vive em `copy.ts` (docs/21 §2.9). */
const PARES: Array<[string, string, string]> = [
  ["jornada.recap", COPY.jornada.recap, COPY.jornada.recapSemSalvo],
  ["licao.sairCorpo", COPY.licao.sairCorpo, COPY.licao.sairCorpoSemSalvo],
  ["licao.sairCorpoLegado", COPY.licao.sairCorpoLegado, COPY.licao.sairCorpoLegadoSemSalvo],
  ["trilha.erroCorpo", COPY.trilha.erroCorpo, COPY.trilha.erroCorpoSemSalvo],
];

describe("textoSePersistiu — escolha da variante", () => {
  test("só 'ok' devolve a frase que promete; falhou e versao-futura devolvem a neutra", () => {
    expect(textoSePersistiu("ok", "salvo", "neutro")).toBe("salvo");
    expect(textoSePersistiu("falhou", "salvo", "neutro")).toBe("neutro");
    expect(textoSePersistiu("versao-futura", "salvo", "neutro")).toBe("neutro");
    expect(textoSePersistiu("qualquer-outro", "salvo", "neutro")).toBe("neutro");
  });

  for (const [nome, salvo, neutro] of PARES) {
    test(`${nome}: a variante 'ok' mantém o texto atual e a neutra não promete nada`, () => {
      expect(salvo.length).toBeGreaterThan(0);
      expect(neutro.length).toBeGreaterThan(0);
      expect(neutro).not.toBe(salvo);
      expect(neutro).not.toMatch(PROMETE_SALVO);
      expect(neutro).not.toMatch(/guardad|gravad|persist/i);
      expect(neutro).not.toMatch(/!/);
      expect(textoSePersistiu("ok", salvo, neutro)).toBe(salvo);
      expect(textoSePersistiu("falhou", salvo, neutro)).toBe(neutro);
    });
  }

  test("a variante 'ok' continua sendo o texto histórico (nada foi reescrito por engano)", () => {
    expect(COPY.jornada.recap).toBe("Por agora é isso — seu progresso já está salvo.");
    expect(COPY.licao.sairCorpo).toBe(
      "Seu progresso nesta lição fica salvo — você retoma de onde parou na próxima vez.",
    );
    expect(COPY.trilha.erroCorpo).toBe("Tenta de novo. Seu progresso está salvo neste aparelho.");
  });
});

/* ------------------------------------------------------------------------- *
 * O status vem do store: uma gravação que lança muda o status, e a escolha da
 * variante segue o status (mesmo ambiente falso de store-persist.test.ts).
 * ------------------------------------------------------------------------- */

const g = globalThis as unknown as Record<string, unknown>;
let n = 0;
let falhar = false;

function instalar() {
  const data = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => {
      if (falhar) throw new Error("QuotaExceededError");
      data.set(k, v);
    },
    removeItem: (k: string) => void data.delete(k),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
  g.window = { location: { search: "" }, addEventListener: () => {} };
}

afterEach(() => {
  delete g.window;
  delete g.localStorage;
  falhar = false;
});

describe("a variante segue o status de runtime do store", () => {
  test("gravação ok → frase que promete; gravação que lança → neutra; volta a ok → promete de novo", async () => {
    instalar();
    n += 1;
    const store = (await import(`@/lib/store?persistcopy=${n}`)) as typeof import("@/lib/store");
    store.hydrate();
    const escolher = () => textoSePersistiu(store.getRuntimeStatus().persist, COPY.jornada.recap, COPY.jornada.recapSemSalvo);

    store.setState((s) => {
      s.prefs.name = "Ana";
    });
    expect(escolher()).toBe(COPY.jornada.recap);

    falhar = true;
    store.setState((s) => {
      s.prefs.name = "Bia";
    });
    expect(store.getRuntimeStatus().persist).toBe("falhou");
    expect(escolher()).toBe(COPY.jornada.recapSemSalvo);
    expect(escolher()).not.toMatch(PROMETE_SALVO);

    falhar = false;
    expect(store.retryPersist()).toBe(true);
    expect(escolher()).toBe(COPY.jornada.recap);
  });
});

/* ------------------------------------------------------------------------- *
 * Guarda estática: os componentes que exibem esses textos passam pela escolha.
 * (Sem isso, um componente novo poderia voltar a usar a frase incondicional.)
 * ------------------------------------------------------------------------- */

describe("os componentes escolhem a variante pelo status", () => {
  const usos: Array<[string, string, RegExp]> = [
    ["src/components/learning/MicroLessonPlayer.tsx", "sairCorpo", /textoSePersistiu\([^)]*COPY\.licao\.sairCorpo,\s*COPY\.licao\.sairCorpoSemSalvo/],
    ["src/components/lessons/LessonPlayer.tsx", "sairCorpoLegado", /textoSePersistiu\([^)]*COPY\.licao\.sairCorpoLegado,\s*COPY\.licao\.sairCorpoLegadoSemSalvo/],
    ["src/components/learning/path/TrailError.tsx", "erroCorpo", /textoSePersistiu\([^)]*COPY\.trilha\.erroCorpo,\s*COPY\.trilha\.erroCorpoSemSalvo/],
    ["src/components/learning/steps/RecapStepView.tsx", "recap", /textoSePersistiu\([^)]*COPY\.jornada\.recap,\s*COPY\.jornada\.recapSemSalvo/],
  ];
  for (const [arquivo, nome, padrao] of usos) {
    test(`${arquivo} usa usePersistStatus e textoSePersistiu (${nome})`, () => {
      const fonte = readFileSync(arquivo, "utf-8");
      expect(fonte).toMatch(/usePersistStatus\(\)/);
      expect(fonte).toMatch(padrao);
    });
  }

  test("nenhum outro arquivo de src usa as frases que prometem sem passar pela escolha", () => {
    const proibidos = [
      /COPY\.licao\.sairCorpo(?!SemSalvo|Legado)\b/,
      /COPY\.licao\.sairCorpoLegado(?!SemSalvo)\b/,
      /COPY\.trilha\.erroCorpo(?!SemSalvo)\b/,
      /COPY\.jornada\.recap(?!SemSalvo)\b/,
    ];
    const permitidos = new Set([
      "src/components/learning/MicroLessonPlayer.tsx",
      "src/components/lessons/LessonPlayer.tsx",
      "src/components/learning/path/TrailError.tsx",
      "src/components/learning/steps/RecapStepView.tsx",
      // monta o `MicroLesson` sintético; o texto é trocado na renderização (RecapStepView)
      "src/lib/adaptive/activity-lesson.ts",
      "src/lib/copy.ts",
    ]);
    const arquivos: string[] = [];
    const andar = (dir: string) => {
      for (const nome of readdirSync(dir)) {
        const p = `${dir}/${nome}`;
        if (statSync(p).isDirectory()) andar(p);
        else if (/\.(ts|tsx)$/.test(nome)) arquivos.push(p);
      }
    };
    andar("src");
    const invasores = arquivos.filter(
      (a) => !permitidos.has(a) && proibidos.some((p) => p.test(readFileSync(a, "utf-8"))),
    );
    expect(invasores).toEqual([]);
  });
});
