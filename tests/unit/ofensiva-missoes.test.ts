import { describe, expect, test } from "bun:test";
import { historicoDaOfensiva, ofensivaViva, partidaDaMeta, situacaoDaMeta } from "@/lib/ofensiva";
import { elegiveis, sortearMissoes, type ContextoDasMissoes } from "@/lib/missoes";
import { CONQUISTAS, novasConquistas, type Estatisticas } from "@/lib/conquistas";

const seq = (inicio: string, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(`${inicio}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });

describe("ofensiva: histórico, protetores e início (spec 50 §5.2)", () => {
  test("marca o dia coberto por protetor e o início da sequência", () => {
    const dias = [...seq("2026-10-01", 3), ...seq("2026-10-05", 2)]; // parou dia 4; começa com 1 protetor
    const h = historicoDaOfensiva(dias);
    expect(h.protegidos).toEqual(["2026-10-04"]);
    expect(h.inicio).toBe("2026-10-01");
    expect(h.estado.sequencia).toBe(5);
  });

  test("quebra sem protetor: a sequência recomeça e o início muda", () => {
    const dias = [...seq("2026-10-01", 2), ...seq("2026-10-06", 2)];
    const h = historicoDaOfensiva(dias);
    expect(h.inicio).toBe("2026-10-06");
    expect(h.estado.sequencia).toBe(2);
  });

  test("viva: estudou hoje ou ontem, ou protetores cobrem os dias parados", () => {
    const h = historicoDaOfensiva(seq("2026-10-01", 3)); // até 03, 1 protetor
    expect(ofensivaViva(h.estado, "2026-10-04")).toBe(true);
    expect(ofensivaViva(h.estado, "2026-10-05")).toBe(true); // 1 dia parado, 1 protetor
    expect(ofensivaViva(h.estado, "2026-10-06")).toBe(false);
  });
});

describe("meta de ofensiva (spec 50 §5.2.2)", () => {
  test("hoje conta se já estudou; cumpre ao chegar ao alvo; não duplica", () => {
    const h0 = historicoDaOfensiva(seq("2026-10-01", 4)); // estudou de 01 a 04; hoje 04
    const meta = partidaDaMeta(h0, "2026-10-04", 7);
    expect(meta.sequenciaInicial).toBe(3);
    expect(situacaoDaMeta(meta, h0, "2026-10-04")).toMatchObject({ tipo: "andando", feitos: 1 });
    const h1 = historicoDaOfensiva(seq("2026-10-01", 10)); // até 10
    expect(situacaoDaMeta(meta, h1, "2026-10-10").tipo).toBe("cumprida");
  });

  test("ofensiva quebrada encerra a meta em silêncio", () => {
    const h0 = historicoDaOfensiva(seq("2026-10-01", 3));
    const meta = partidaDaMeta(h0, "2026-10-03", 7);
    const h1 = historicoDaOfensiva([...seq("2026-10-01", 3), "2026-10-07"]);
    expect(situacaoDaMeta(meta, h1, "2026-10-07").tipo).toBe("quebrou");
  });

  test("meta sem sequência viva liga na primeira sequência que começar depois", () => {
    const h0 = historicoDaOfensiva(["2026-09-01"]);
    const meta = partidaDaMeta(h0, "2026-10-10", 7);
    expect(meta.inicioSequencia).toBeNull();
    const h1 = historicoDaOfensiva(["2026-09-01", ...seq("2026-10-11", 2)]);
    expect(situacaoDaMeta(meta, h1, "2026-10-12")).toMatchObject({ tipo: "andando", feitos: 2, inicioSequencia: "2026-10-11" });
  });
});

const CTX: ContextoDasMissoes = {
  metaDiaria: 1,
  diasDeEstudo: 2,
  precisaoRecente: null,
  revisaoDevida: false,
  areaComLacuna: "CN",
  cadernoParaHoje: 0,
  temEscrita: false,
  miniDisponivel: false,
  flashcardsDevidos: 0,
};

describe("missões (spec 50 §5.4.1)", () => {
  test("mesma semente → mesmas missões; três tipos", () => {
    const a = sortearMissoes("aluno-1", "2026-10-02", CTX);
    expect(sortearMissoes("aluno-1", "2026-10-02", CTX)).toEqual(a);
    expect(a.map((m) => m.tipo)).toEqual(["fazer", "acertar", "conteudo"]);
  });

  test("elegibilidade pelo conteúdo e plano", () => {
    expect(elegiveis(CTX).conteudo).toEqual(["pratica-CN"]);
    expect(elegiveis({ ...CTX, cadernoParaHoje: 5, temEscrita: true, flashcardsDevidos: 3 }).conteudo).toEqual([
      "pratica-CN",
      "caderno-3",
      "escrita-1",
      "flashcards-1",
    ]);
    expect(elegiveis({ ...CTX, diasDeEstudo: 9, precisaoRecente: 0.8 }).acertar).toEqual(["combo-3", "combo-5", "perfeita"]);
    expect(elegiveis({ ...CTX, metaDiaria: 3 }).fazer).toEqual(["fazer-2"]);
  });

  test("nenhuma missão por tempo, por abrir o app ou social", () => {
    const todas = [...Object.values(elegiveis({ ...CTX, revisaoDevida: true, cadernoParaHoje: 9, temEscrita: true, miniDisponivel: true, flashcardsDevidos: 2 })).flat()];
    expect(todas.some((id) => /minut|tempo|abrir|amigo|liga|compr/.test(id))).toBe(false);
  });
});

describe("conquistas (spec 50 §5.4.3)", () => {
  const zero: Estatisticas = {
    licoes: 0, melhorOfensiva: 0, perfeitas: 0, maiorCombo: 0, simulados: 0, simulados90: 0, escritas: 0, estimativas: 0,
    areasNaSemana: 0, cadernoResolvidos: 0, nivel: 1,
  };
  test("18+ conquistas, Pérolas entre 20 e 100, ids únicos", () => {
    expect(CONQUISTAS.length).toBeGreaterThanOrEqual(18);
    expect(new Set(CONQUISTAS.map((x) => x.id)).size).toBe(CONQUISTAS.length);
    expect(CONQUISTAS.every((x) => x.perolas >= 20 && x.perolas <= 100)).toBe(true);
  });
  test("só as novas; idempotente pelo que já tem", () => {
    const e = { ...zero, licoes: 12, melhorOfensiva: 7 };
    expect(novasConquistas(e, new Set()).map((x) => x.id)).toEqual(["primeira-licao", "licoes-10", "ofensiva-7"]);
    expect(novasConquistas(e, new Set(["primeira-licao", "licoes-10", "ofensiva-7"]))).toEqual([]);
  });
});
