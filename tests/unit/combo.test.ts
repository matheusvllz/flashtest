import { describe, expect, test } from "bun:test";
import {
  COMBO_JANELA_MS,
  aplicarAoCombo,
  comboVazio,
  marcoDoCombo,
  xpBonusDoCombo,
  type EstadoCombo,
  type RespostaParaCombo,
} from "@/lib/combo";

const DIA = "2026-10-02";
const T0 = Date.parse("2026-10-02T15:00:00Z");

function serie(resultados: Array<RespostaParaCombo["resultado"]>, inicio: EstadoCombo | null = null, passoMs = 20_000) {
  let estado = inicio;
  const marcos: Array<number | null> = [];
  const vidas: boolean[] = [];
  resultados.forEach((resultado, i) => {
    const r = aplicarAoCombo(estado, { resultado, dia: DIA, em: T0 + i * passoMs, conta: true });
    estado = r.estado;
    marcos.push(r.marco);
    vidas.push(r.vida);
  });
  return { estado: estado!, marcos, vidas };
}

describe("combo (spec 50 §5.1.1)", () => {
  test("marcos 3, 5 e 10; depois de 10, cada múltiplo de 10", () => {
    expect([1, 2, 3, 4, 5, 9, 10, 11, 20, 30].map(marcoDoCombo)).toEqual([null, null, 3, null, 5, null, 10, null, 10, 10]);
  });

  test("conta acertos seguidos e devolve vida em múltiplos de 5", () => {
    const { estado, marcos, vidas } = serie(Array(10).fill("certa"));
    expect(estado.atual).toBe(10);
    expect(estado.maximo).toBe(10);
    expect(marcos.filter(Boolean)).toEqual([3, 5, 10]);
    expect(vidas.map((v, i) => (v ? i + 1 : 0)).filter(Boolean)).toEqual([5, 10]);
  });

  test("erro e 'Não sei' zeram em silêncio; o máximo do dia fica", () => {
    const { estado } = serie(["certa", "certa", "certa", "certa", "errada"]);
    expect(estado.atual).toBe(0);
    expect(estado.maximo).toBe(4);
    const r = aplicarAoCombo(estado, { resultado: "nao-sei", dia: DIA, em: T0 + 999_000, conta: true });
    expect(r.estado.atual).toBe(0);
    expect(r.marco).toBeNull();
  });

  test("o que não conta (revisão de erros, checagem) não soma nem zera", () => {
    const { estado } = serie(["certa", "certa"]);
    const certaNaRevisao = aplicarAoCombo(estado, { resultado: "certa", dia: DIA, em: T0 + 60_000, conta: false });
    expect(certaNaRevisao.estado.atual).toBe(2);
    const erroNaChecagem = aplicarAoCombo(estado, { resultado: "errada", dia: DIA, em: T0 + 60_000, conta: false });
    expect(erroNaChecagem.estado.atual).toBe(2);
  });

  test("Foca IA antes de responder: acerto não soma, mas não zera", () => {
    const { estado } = serie(["certa", "certa"]);
    const r = aplicarAoCombo(estado, { resultado: "certa", dia: DIA, em: T0 + 60_000, conta: true, assistida: true });
    expect(r.estado.atual).toBe(2);
    expect(r.marco).toBeNull();
  });

  test("atravessa lições em até 30 min; depois recomeça", () => {
    const { estado } = serie(["certa", "certa", "certa", "certa"]);
    const dentro = aplicarAoCombo(estado, { resultado: "certa", dia: DIA, em: estado.ultimaEm! + COMBO_JANELA_MS, conta: true });
    expect(dentro.estado.atual).toBe(5);
    expect(dentro.marco).toBe(5);
    const fora = aplicarAoCombo(estado, { resultado: "certa", dia: DIA, em: estado.ultimaEm! + COMBO_JANELA_MS + 1, conta: true });
    expect(fora.estado.atual).toBe(1);
    expect(fora.estado.maximo).toBe(4);
  });

  test("virada do dia recomeça, inclusive o máximo", () => {
    const { estado } = serie(["certa", "certa", "certa"]);
    const r = aplicarAoCombo(estado, { resultado: "certa", dia: "2026-10-03", em: estado.ultimaEm! + 60_000, conta: true });
    expect(r.estado).toEqual({ dia: "2026-10-03", atual: 1, maximo: 1, ultimaEm: estado.ultimaEm! + 60_000 });
  });

  test("bônus de XP fixo, sem somar 5 e 10", () => {
    expect([0, 4, 5, 9, 10, 25].map(xpBonusDoCombo)).toEqual([0, 0, 5, 5, 10, 10]);
  });

  test("estado vazio do dia", () => {
    expect(comboVazio(DIA)).toEqual({ dia: DIA, atual: 0, maximo: 0, ultimaEm: null });
  });
});
