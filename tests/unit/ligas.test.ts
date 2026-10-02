/**
 * Ligas 18+ (spec 50 §5.5, T-50.13.2; RF-15) e ofensiva em dupla (§5.6.4) — regras puras.
 */
import { describe, expect, test } from "bun:test";
import { diasPendentesDeProtetor, ofensivaDaDupla } from "../../src/lib/amigos";
import {
  blocosValidos,
  fecharGrupo,
  formarGrupos,
  grupoParaEntrar,
  nomeDaDivisao,
  pontosDaLiga,
  posicoesComEmpate,
  semanaAnterior,
} from "../../src/lib/ligas";

const membros = (pontos: number[]) => pontos.map((p, i) => ({ item: `a${i}`, pontos: p }));
const mov = (r: ReturnType<typeof fecharGrupo<string>>) =>
  Object.fromEntries(r.map((x) => [x.item, x.movimento]));

describe("divisões e pontos", () => {
  test("cinco divisões, de Areia a Abismo", () => {
    expect([1, 2, 3, 4, 5].map(nomeDaDivisao)).toEqual([
      "Areia",
      "Coral",
      "Recife",
      "Mar Aberto",
      "Abismo",
    ]);
  });

  test("pontos: dia × 100 + blocos válidos × 10, até 5 por dia; nunca XP nem tempo", () => {
    // 3 blocos com 12 respostas (3 válidos) + 9 blocos com 40 respostas (teto 5) + dia sem estudo.
    expect(
      pontosDaLiga([
        { blocos: 3, respostasPontuadas: 12 },
        { blocos: 9, respostasPontuadas: 40 },
        { blocos: 0, respostasPontuadas: 0 },
      ]),
    ).toBe(130 + 150);
  });

  test("antifraude: bloco só pontua com 4 respostas pontuadas; o dia de estudo continua valendo 100", () => {
    expect(blocosValidos(3, 7)).toBe(1);
    expect(blocosValidos(2, 100)).toBe(2);
    expect(pontosDaLiga([{ blocos: 5, respostasPontuadas: 0 }])).toBe(100);
  });
});

describe("grupos", () => {
  test("21 entrando na mesma segunda: 2 grupos de 11 e 10 (não 20 + 1)", () => {
    const g = formarGrupos(Array.from({ length: 21 }, (_, i) => i));
    expect(g.map((x) => x.length)).toEqual([11, 10]);
    expect(g.flat()).toEqual(Array.from({ length: 21 }, (_, i) => i)); // ordem de entrada
  });

  test("mínimo de 5: divisão com menos de 5 fica num grupo só; até 20, um grupo", () => {
    expect(formarGrupos([1, 2, 3, 4]).map((x) => x.length)).toEqual([4]);
    expect(formarGrupos(Array.from({ length: 20 }, (_, i) => i)).map((x) => x.length)).toEqual([
      20,
    ]);
    expect(formarGrupos(Array.from({ length: 41 }, (_, i) => i)).map((x) => x.length)).toEqual([
      14, 14, 13,
    ]);
    expect(formarGrupos([])).toEqual([]);
  });

  test("quem chega no meio da semana vai para o grupo com menos gente e vaga; sem vaga, abre outro", () => {
    expect(
      grupoParaEntrar(
        new Map([
          [0, 11],
          [1, 10],
        ]),
      ),
    ).toBe(1);
    expect(
      grupoParaEntrar(
        new Map([
          [0, 20],
          [1, 20],
        ]),
      ),
    ).toBe(2);
    expect(grupoParaEntrar(new Map())).toBe(0);
  });
});

describe("fechamento do grupo", () => {
  test("empate: mesma pontuação, mesma posição", () => {
    expect(
      posicoesComEmpate([{ pontos: 300 }, { pontos: 500 }, { pontos: 300 }, { pontos: 100 }]).map(
        (l) => l.posicao,
      ),
    ).toEqual([1, 2, 2, 4]);
  });

  test("sobem os 4 primeiros com ≥ 300; empate no 4º lugar com 5 pessoas → todas sobem", () => {
    const r = fecharGrupo(2, membros([900, 800, 700, 400, 400, 400, 400, 400, 220]));
    const m = mov(r);
    expect(["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7"].every((k) => m[k] === "sobe")).toBe(
      true,
    );
    expect(m.a8).toBe("fica"); // 220: estudou 2 dias, nunca desce
    expect(r.find((x) => x.item === "a3")?.novaDivisao).toBe(3);
  });

  test("entre os 4 primeiros mas abaixo de 300: fica", () => {
    expect(mov(fecharGrupo(1, membros([290, 250, 150])))).toEqual({
      a0: "fica",
      a1: "fica",
      a2: "fica",
    });
  });

  test("descem os 3 últimos com < 200; quem estudou 2+ dias nunca desce; Areia não desce", () => {
    const m = mov(fecharGrupo(3, membros([800, 600, 500, 450, 400, 230, 150, 120, 110])));
    expect([m.a6, m.a7, m.a8]).toEqual(["desce", "desce", "desce"]);
    expect(m.a5).toBe("fica");
    const so2dias = mov(fecharGrupo(3, membros([800, 600, 500, 450, 400, 230, 220, 210])));
    expect(Object.values(so2dias).includes("desce")).toBe(false);
    const areia = mov(fecharGrupo(1, membros([800, 600, 150, 120, 110])));
    expect(Object.values(areia).includes("desce")).toBe(false);
  });

  test("empate no corte de baixo: ninguém desce por causa do empate", () => {
    const m = mov(fecharGrupo(2, membros([600, 500, 450, 150, 150, 150, 150])));
    expect(Object.values(m).includes("desce")).toBe(false);
  });

  test("Abismo não sobe", () => {
    expect(mov(fecharGrupo(5, membros([1050, 900])))).toEqual({ a0: "fica", a1: "fica" });
  });

  test("inativo (0 pontos): pausa na mesma divisão, sem posição, e não ocupa vaga dos 3 últimos", () => {
    const r = fecharGrupo(2, membros([500, 400, 350, 300, 150, 0, 0, 0]));
    const zero = r.filter((x) => x.pontos === 0);
    expect(
      zero.every(
        (x) => x.pausa && x.posicao === null && x.movimento === "fica" && x.novaDivisao === 2,
      ),
    ).toBe(true);
    expect(r.find((x) => x.item === "a4")?.movimento).toBe("desce");
  });

  test("sozinho no grupo: sobe com ≥ 300, nunca desce", () => {
    expect(mov(fecharGrupo(2, membros([320])))).toEqual({ a0: "sobe" });
    expect(mov(fecharGrupo(2, membros([120])))).toEqual({ a0: "fica" });
  });

  test("semana anterior", () => {
    expect(semanaAnterior("2026-10-12")).toBe("2026-10-05");
  });
});

describe("ofensiva em dupla", () => {
  const dias = (...d: string[]) => new Set(d);

  test("conta só os dias em que os dois estudaram; quebrou = 0, o recorde fica", () => {
    const a = dias("2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05", "2026-10-06");
    const b = dias(
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-05",
      "2026-10-06",
    );
    expect(ofensivaDaDupla(a, b, "2026-10-01", "2026-10-06")).toEqual({ dias: 2, recorde: 3 });
  });

  test("hoje em aberto não quebra a sequência; só conta quando os dois estudaram", () => {
    const a = dias("2026-10-01", "2026-10-02", "2026-10-03");
    const b = dias("2026-10-01", "2026-10-02");
    expect(ofensivaDaDupla(a, b, "2026-10-01", "2026-10-03")).toEqual({ dias: 2, recorde: 2 });
    expect(
      ofensivaDaDupla(
        a,
        dias("2026-10-01", "2026-10-02", "2026-10-03"),
        "2026-10-01",
        "2026-10-03",
      ),
    ).toEqual({ dias: 3, recorde: 3 });
  });

  test("dias antes do aceite não contam", () => {
    expect(
      ofensivaDaDupla(
        dias("2026-10-01", "2026-10-02"),
        dias("2026-10-01", "2026-10-02"),
        "2026-10-02",
        "2026-10-02",
      ).dias,
    ).toBe(1);
  });

  test("dia parado coberto por protetor conta para aquele lado (pendente até voltar a estudar)", () => {
    expect(diasPendentesDeProtetor("2026-10-01", "2026-10-03", 1)).toEqual(["2026-10-02"]);
    expect(diasPendentesDeProtetor("2026-10-01", "2026-10-04", 1)).toEqual([]);
    const a = new Set(["2026-10-01", ...diasPendentesDeProtetor("2026-10-01", "2026-10-03", 1)]);
    const b = dias("2026-10-01", "2026-10-02");
    expect(ofensivaDaDupla(a, b, "2026-10-01", "2026-10-03").dias).toBe(2);
  });
});
