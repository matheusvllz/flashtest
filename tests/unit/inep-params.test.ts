import { describe, expect, test } from "bun:test";
import {
  decodeLatin1,
  mergeInepParametros,
  parseInepCSV,
  resolverColunas,
  type InepItemParams,
} from "../../scripts/content/import-inep-params";

/**
 * Importador de parâmetros do Inep (docs/30 §12.4, Fase 10 do docs/31
 * F10.2) — CSV de FIXTURE (5 linhas, como o critério do `31` pede),
 * separador `;`, latin-1. Números/códigos genéricos, não é nenhum dado real
 * do Inep — só o FORMATO (nomes de coluna documentados no `31`).
 */

const CABECALHO =
  "CO_POSICAO;SG_AREA;CO_ITEM;TX_GABARITO;CO_HABILIDADE;NU_PARAM_A;NU_PARAM_B;NU_PARAM_C;IN_ITEM_ABAN;IN_ITEM_ADAPTADO";

const CSV_FIXTURE_5_LINHAS = [
  CABECALHO,
  "1;MT;100001;A;16;1.2;0.5;0.2;0;0",
  "2;MT;100002;B;16;0.9;-0.3;0.18;0;0",
  "3;LC;100003;C;5;1.1;1.4;0.15;0;0",
  "4;MT;100004;D;16;1.0;0.1;0.2;1;0", // IN_ITEM_ABAN=1 -> abandonado, mantido no parse (quem filtra é a incidência)
  "5;CH;100005;E;10;;;;0;0", // sem parâmetro publicado -> pulado
].join("\n");

describe("decodeLatin1", () => {
  test("decodifica byte latin-1 fora do ASCII (0xE9 = 'é') corretamente", () => {
    const bytes = new Uint8Array([0x4a, 0x6f, 0xe3, 0x6f]); // "Jo" + 0xE3 ('ã' em latin-1) + "o" = "João"
    expect(decodeLatin1(bytes)).toBe("João");
  });
});

describe("resolverColunas", () => {
  test("acha os índices pelos nomes exatos do cabeçalho", () => {
    const colunas = resolverColunas(CABECALHO.split(";"));
    expect(colunas.area).toBe(1);
    expect(colunas.coItem).toBe(2);
    expect(colunas.habilidade).toBe(4);
  });

  test("aceita alias alternativo de abandono (IN_ABANDONO em vez de IN_ITEM_ABAN)", () => {
    const colunas = resolverColunas([
      "SG_AREA",
      "CO_ITEM",
      "CO_POSICAO",
      "CO_HABILIDADE",
      "TX_GABARITO",
      "NU_PARAM_A",
      "NU_PARAM_B",
      "NU_PARAM_C",
      "IN_ABANDONO",
    ]);
    expect(colunas.abandonado).toBe(8);
  });
});

describe("parseInepCSV — fixture de 5 linhas (critério F10.2 do docs/31)", () => {
  test("parseia os 5 registros, marcando abandonado e pulando o sem parâmetro", () => {
    const { itens, puladas } = parseInepCSV(CSV_FIXTURE_5_LINHAS, 2019);
    expect(itens).toHaveLength(4); // a linha 5 (sem NU_PARAM_*) foi pulada
    expect(puladas).toBe(1);

    const abandonado = itens.find((i) => i.coItem === 100004);
    expect(abandonado?.abandonado).toBe(true);

    const primeiro = itens[0];
    expect(primeiro).toMatchObject({
      ano: 2019,
      area: "MT",
      coItem: 100001,
      habilidade: 16,
      gabarito: "A",
      a: 1.2,
      b: 0.5,
      c: 0.2,
      abandonado: false,
    });
  });

  test("latin-1 real: CSV com acento decodificado corretamente antes do parse", () => {
    // Simula o arquivo salvo em latin-1 de verdade (Buffer.from com encoding 'latin1' == ISO-8859-1).
    const textoComAcento = `${CABECALHO}\n1;MT;100001;A;16;1.2;0.5;0.2;0;0 # observação: nível médio`;
    const bytes = new Uint8Array(Buffer.from(textoComAcento, "latin1"));
    const decodificado = decodeLatin1(bytes);
    const { itens } = parseInepCSV(decodificado, 2019);
    expect(itens).toHaveLength(1);
  });

  test("cabeçalho sem coluna obrigatória (ex.: CO_HABILIDADE ausente) lança erro claro", () => {
    const semHabilidade =
      "CO_POSICAO;SG_AREA;CO_ITEM;TX_GABARITO;NU_PARAM_A;NU_PARAM_B;NU_PARAM_C\n1;MT;1;A;1;1;0.2";
    expect(() => parseInepCSV(semHabilidade, 2019)).toThrow(/habilidade/);
  });

  test("área desconhecida (fora de LC/MT/CN/CH) é pulada, não lança", () => {
    const areaEstranha = `${CABECALHO}\n1;XX;1;A;1;1;1;0.2;0;0`;
    const { itens, puladas } = parseInepCSV(areaEstranha, 2019);
    expect(itens).toHaveLength(0);
    expect(puladas).toBe(1);
  });

  test("CSV vazio (só cabeçalho) não lança, devolve lista vazia", () => {
    expect(parseInepCSV(CABECALHO, 2019)).toEqual({ itens: [], puladas: 0 });
  });
});

describe("mergeInepParametros — idempotente por (ano, coItem)", () => {
  function item(overrides: Partial<InepItemParams> = {}): InepItemParams {
    return {
      ano: 2019,
      area: "MT",
      coItem: 1,
      coPosicao: 1,
      habilidade: 16,
      gabarito: "A",
      a: 1,
      b: 0,
      c: 0.2,
      adaptado: false,
      abandonado: false,
      ...overrides,
    };
  }

  test("importar o mesmo item 2x não duplica — a versão nova substitui", () => {
    const v1 = [item({ b: 0.1 })];
    const v2 = [item({ b: 0.5 })]; // reimportação com parâmetro atualizado
    const combinado = mergeInepParametros(v1, v2);
    expect(combinado).toHaveLength(1);
    expect(combinado[0].b).toBe(0.5);
  });

  test("itens de anos diferentes se acumulam", () => {
    const combinado = mergeInepParametros([item({ ano: 2018 })], [item({ ano: 2019 })]);
    expect(combinado).toHaveLength(2);
    expect(combinado.map((i) => i.ano)).toEqual([2018, 2019]); // ordenado por ano
  });
});
