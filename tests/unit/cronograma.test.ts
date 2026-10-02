import { describe, expect, test } from "bun:test";
import { blocosPorDia, dataProvaPadrao, planoDaSemana } from "@/lib/cronograma";

/** Cronograma até o ENEM (spec 49 T-49.9.2). */
describe("cronograma", () => {
  test("blocos por dia e data padrão da prova (primeiro domingo de novembro)", () => {
    expect(blocosPorDia(30)).toBe(4);
    expect(blocosPorDia(5)).toBe(1);
    expect(dataProvaPadrao("2026-10-02")).toBe("2026-11-01");
    expect(dataProvaPadrao("2026-11-20")).toBe("2027-11-07");
  });
  test("meta da semana dividida pela lacuna: área mais fraca recebe mais; redação 1 bloco; reorganiza com o que falta", () => {
    const p = planoDaSemana({ diasSemana: 5, minutosDia: 30, dataProva: "2026-11-01" }, { MT: 20, LC: 80, CN: null, CH: 60 }, 0, "2026-10-02");
    expect(p.metaSemana).toBe(20);
    expect(p.diasAteProva).toBe(30);
    expect(p.porArea.reduce((a, x) => a + x.blocos, 0)).toBe(20);
    const mt = p.porArea.find((x) => x.area === "MT")!.blocos;
    const lc = p.porArea.find((x) => x.area === "LC")!.blocos;
    expect(mt).toBeGreaterThan(lc);
    expect(p.porArea.find((x) => x.area === "RED")!.blocos).toBe(1);
    const depois = planoDaSemana({ diasSemana: 5, minutosDia: 30, dataProva: "2026-11-01" }, {}, 18, "2026-10-02");
    expect(depois.faltamSemana).toBe(2);
    expect(depois.porArea.reduce((a, x) => a + x.blocos, 0)).toBe(2);
  });
});
