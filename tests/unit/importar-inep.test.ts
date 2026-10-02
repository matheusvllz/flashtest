import { describe, expect, test } from "bun:test";
import { SKILL_MAP } from "@/content/taxonomy";
import { validarMidia } from "../../scripts/content/validate";
import {
  descricaoEntregaResposta,
  explicacaoPendente,
  montarExercicio,
  refDaQuestao,
} from "../../content-pipeline/oficial/importar-inep";
import { classificar } from "../../content-pipeline/oficial/inep/classificar";
import { detectarTabela, type Grade } from "../../content-pipeline/oficial/inep/figuras";
import { lerGabarito } from "../../content-pipeline/oficial/inep/gabarito";
import {
  extrairQuestoes,
  montarLinhas,
  similaridade,
  textoIlegivel,
  type PaginaParaLer,
} from "../../content-pipeline/oficial/inep/parser";
import type {
  FiguraDetectada,
  ItemTexto,
  QuestaoExtraida,
} from "../../content-pipeline/oficial/inep/tipos";

/**
 * Importador do INEP (spec 50 §5.9.2): o parser recebe itens de texto como o pdf.js os entrega (caixa, linha de
 * base, fonte) e separa questão, enunciado, alternativas e crédito. Fixture SINTÉTICA, sem baixar nada e sem
 * texto de prova real.
 */

const LARGURA = 7.0; // largura média de caractere na fixture (pt)

function it(
  str: string,
  x: number,
  base: number,
  opts: { tam?: number; fonte?: string; w?: number } = {},
): ItemTexto {
  const tam = opts.tam ?? 10;
  const w = opts.w ?? (str.trim() ? str.length * LARGURA * (tam / 10) * 0.7 : 2.5);
  return {
    str,
    x0: x,
    x1: x + w,
    y0: base - 0.85 * tam,
    y1: base + 0.25 * tam,
    base,
    tam,
    fonte: opts.fonte ?? "corpo",
    girado: false,
  };
}

/** Linha de texto como palavras separadas por itens de espaço (como alguns cadernos fazem). */
function palavras(
  texto: string,
  x: number,
  base: number,
  opts: { tam?: number; fonte?: string } = {},
): ItemTexto[] {
  const out: ItemTexto[] = [];
  let cx = x;
  for (const p of texto.split(" ")) {
    const item = it(p, cx, base, opts);
    out.push(item);
    out.push({ ...it(" ", item.x1, base, opts), tam: 0 });
    cx = item.x1 + 1.5; // folga pequena: sem o item de espaço, não haveria espaço
  }
  return out;
}

function alternativa(letra: string, texto: string, x: number, base: number): ItemTexto[] {
  return [
    it(letra, x, base, { fonte: "letra", w: 10 }),
    it(letra, x, base, { fonte: "letra", w: 10 }),
    it(texto, x + 17, base),
  ];
}

function pagina(itens: ItemTexto[], figuras: FiguraDetectada[] = []): PaginaParaLer {
  return {
    numero: 2,
    largura: 595,
    altura: 842,
    itens,
    figuras,
    faixa: { topo: 60, base: 800, esq: 20, dir: 575 },
    calha: 297,
  };
}

const letras = new Set(["letra"]);

describe("montarLinhas", () => {
  test("usa os itens de espaço do PDF para separar palavras coladas", () => {
    const linhas = montarLinhas(palavras("Uma frase de teste", 30, 100));
    expect(linhas.map((l) => l.texto)).toEqual(["Uma frase de teste"]);
  });

  test("expoente e índice menores viram caracteres Unicode, sem perder o número", () => {
    const linhas = montarLinhas([
      it("4,0 × 10", 30, 100, { w: 40 }),
      it("2", 70.5, 96.5, { tam: 7, w: 3.5 }),
      it(" N e H", 74.5, 100, { w: 30 }),
      it("2", 105, 102.5, { tam: 7, w: 3.5 }),
      it("O", 109, 100, { w: 7 }),
    ]);
    expect(linhas).toHaveLength(1);
    expect(linhas[0].texto).toBe("4,0 × 10² N e H₂O");
    expect(linhas[0].alertas).toEqual([]);
  });

  test("expoente sem forma Unicode vira alerta (a questão não entra)", () => {
    const linhas = montarLinhas([
      it("massa M", 30, 100, { w: 40 }),
      it("Q", 70.5, 96.5, { tam: 7, w: 4 }),
    ]);
    expect(linhas[0].alertas[0]).toContain("sobrescrito");
  });
});

describe("extrairQuestoes", () => {
  const col1: ItemTexto[] = [
    it("QUESTÃO 91", 30, 80, { fonte: "titulo" }),
    ...palavras("Texto-base sintético da questão noventa e um, que ocupa a", 30, 100),
    ...palavras("coluna da esquerda até a margem direita da coluna sem", 30, 112),
    ...palavras("terminar o parágrafo.", 30, 124),
    it("Disponível em: www.exemplo.org. Acesso em: 1 jan. 2020 (adaptado).", 60, 140, { tam: 7 }),
    ...palavras("Qual é o comando da questão sintética?", 30, 160),
    ...alternativa("A", "primeira opção.", 30, 178),
    ...alternativa("B", "segunda opção, mais longa, que quebra e continua", 30, 192),
    it("na linha de baixo.", 47, 204),
    ...alternativa("C", "terceira opção.", 30, 218),
    ...alternativa("D", "quarta opção.", 30, 232),
    ...alternativa("E", "quinta opção.", 30, 246),
  ];
  const col2: ItemTexto[] = [
    it("QUESTÃO 92", 305, 80, { fonte: "titulo" }),
    ...palavras("Enunciado da noventa e dois com figura logo abaixo.", 305, 100),
    ...palavras("Qual figura representa a situação?", 305, 260),
    ...["A", "B", "C", "D", "E"].flatMap((l, i) => [
      it(l, 305, 290 + i * 60, { fonte: "letra", w: 10 }),
    ]),
  ];
  const figuras: FiguraDetectada[] = [
    { pagina: 2, x0: 310, y0: 110, x1: 560, y1: 245, textos: ["Rótulo do eixo"] },
    ...[0, 1, 2, 3, 4].map((i) => ({
      pagina: 2,
      x0: 330,
      y0: 270 + i * 60,
      x1: 500,
      y1: 320 + i * 60,
      textos: [],
    })),
  ];
  // Ajusta a largura das linhas da coluna 1 para parecerem justificadas (chegam à margem).
  for (const item of col1)
    if (item.base === 100 || item.base === 112) item.x1 = Math.min(item.x1, 285);
  const qs = extrairQuestoes([pagina([...col1, ...col2], figuras)], letras);

  test("acha as duas questões, em ordem", () => {
    expect(qs.map((q) => q.numero)).toEqual([91, 92]);
  });

  test("separa enunciado, crédito impresso e as cinco alternativas, juntando a linha de continuação", () => {
    const q = qs[0];
    expect(q.problemas).toEqual([]);
    const texto = q.blocos.map((b) => (b.tipo === "texto" ? b.texto : "[fig]")).join("\n\n");
    expect(texto).toContain("Texto-base sintético");
    expect(texto).toContain("Disponível em: www.exemplo.org");
    expect(texto).toContain("Qual é o comando da questão sintética?");
    expect(q.creditos.some((c) => c.startsWith("Disponível em"))).toBe(true);
    expect(q.alternativas.map((a) => a.texto)).toEqual([
      "primeira opção.",
      "segunda opção, mais longa, que quebra e continua na linha de baixo.",
      "terceira opção.",
      "quarta opção.",
      "quinta opção.",
    ]);
  });

  test("figura do enunciado fica no lugar; figura ao lado da letra vira alternativa-imagem", () => {
    const q = qs[1];
    expect(q.problemas).toEqual([]);
    expect(q.blocos.map((b) => b.tipo)).toEqual(["texto", "figura", "texto"]);
    expect(q.alternativas.every((a) => a.figuras.length === 1 && a.texto === "")).toBe(true);
  });

  test("o texto montado bate com o texto da página (conferência de similaridade)", () => {
    const q = qs[0];
    const montado = [
      ...q.blocos.map((b) => (b.tipo === "texto" ? b.texto : "")),
      ...q.alternativas.map((a) => a.texto),
    ].join("");
    expect(similaridade(montado, q.textoBruto)).toBeGreaterThanOrEqual(0.97);
  });

  test("símbolo desenhado junto de uma linha do enunciado: o trecho vira recorte (imagem do original)", () => {
    const p = pagina(col1);
    p.marcas = [{ x0: 100, y0: 150, x1: 108, y1: 158 }];
    const [q] = extrairQuestoes([p], letras);
    expect(q.problemas).toEqual([]);
    const recorte = q.blocos.find((b) => b.tipo === "figura");
    expect(recorte?.tipo === "figura" && recorte.figura.sintetica).toBe(true);
    expect(
      q.blocos.map((b) => (b.tipo === "texto" ? b.texto : "[recorte]")).join(" "),
    ).not.toContain("Qual é o comando");
  });

  test("símbolo desenhado nas alternativas tira a questão (alternativa não vira recorte)", () => {
    const p = pagina(col1);
    p.marcas = [{ x0: 120, y0: 214, x1: 128, y1: 220 }];
    const [q] = extrairQuestoes([p], letras);
    expect(q.problemas.some((x) => x.startsWith("símbolo"))).toBe(true);
  });
});

describe("montarExercicio — formato dos oficiais (regra dura 8: só junta, não muda texto)", () => {
  const fig = (y: number): FiguraDetectada => ({
    pagina: 3,
    x0: 30,
    y0: y,
    x1: 280,
    y1: y + 100,
    textos: ["Legenda interna"],
  });
  const q: QuestaoExtraida = {
    numero: 137,
    blocos: [
      { tipo: "texto", texto: "Parágrafo sintético." },
      { tipo: "figura", figura: fig(100), credito: "Disponível em: www.exemplo.org." },
      { tipo: "texto", texto: "Comando sintético?" },
    ],
    alternativas: (["A", "B", "C", "D", "E"] as const).map((letra) => ({
      letra,
      texto: letra === "C" ? "" : `opção ${letra}`,
      figuras: letra === "C" ? [fig(300)] : [],
    })),
    creditos: [],
    regioes: [],
    textoBruto: "",
    problemas: [],
  };

  test("marca a posição da figura, grava crédito, alt honesto e alternativa-imagem com rótulo", () => {
    const r = montarExercicio(q, { ano: 2022, dia: 2 }, "azul", "B");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.ex.pergunta).toBe("Parágrafo sintético.\n\n[[imagem:0]]\n\nComando sintético?");
    expect(r.ex.imagens?.[0]).toMatchObject({
      url: "/content/img/2022/d2-q137-1.webp",
      credito: "Disponível em: www.exemplo.org.",
      altAutomatico: true,
      descricao: "Texto na imagem: Legenda interna",
    });
    expect(r.ex.imagens?.[0].alt).toBe("Imagem da questão 137 do ENEM 2022 (descrição em revisão)");
    expect(r.ex.opcoes[2]).toBe("Alternativa C (imagem)");
    expect(r.ex.opcoesImagem?.[2]?.url).toBe("/content/img/2022/d2-q137-alt-c.webp");
    expect(r.ex.correta).toBe(1);
    expect(r.ex.fonte).toBe("ENEM 2022");
    expect(r.ex.explicacao).toBe(explicacaoPendente("B"));
    // Com as dimensões que o recorte grava, o item passa no contrato de mídia.
    for (const f of r.figuras) Object.assign(f.imagem, { largura: 1000, altura: 400 });
    expect(validarMidia(r.ex, { oficial: true })).toEqual([]);
  });

  test("alternativa vazia e sem figura não entra", () => {
    const vazia = { ...q, alternativas: q.alternativas.map((a) => ({ ...a, figuras: [] })) };
    const r = montarExercicio(vazia, { ano: 2022, dia: 2 }, "azul", "A");
    expect(r.ok).toBe(false);
  });

  test("referência no formato dos oficiais", () => {
    expect(refDaQuestao(2023, 1, 1, "azul", 3, "ingles")).toBe(
      "ENEM 2023 · 1º dia · caderno 1 azul · questão 3 (inglês)",
    );
    expect(refDaQuestao(2023, 2, 8, "rosa", 137)).toBe(
      "ENEM 2023 · 2º dia · caderno 8 rosa · questão 137",
    );
  });
});

describe("detectarTabela — grade de fios com texto extraível", () => {
  function grade(): Grade {
    const w = 120;
    const h = 80;
    const tinta = new Uint8Array(w * h);
    for (const x of [10, 60, 110]) for (let y = 10; y <= 70; y++) tinta[y * w + x] = 1;
    for (const y of [10, 30, 50, 70]) for (let x = 10; x <= 110; x++) tinta[y * w + x] = 1;
    return { w, h, tinta, claro: new Uint8Array(tinta) };
  }
  const cel = (s: string, x: number, base: number) => it(s, x, base, { tam: 8, w: s.length * 3 });
  const fig = (itens: ItemTexto[]): FiguraDetectada => ({
    pagina: 1,
    x0: 10,
    y0: 10,
    x1: 111,
    y1: 71,
    textos: [],
    itens,
  });

  test("grade completa vira cabeçalho + linhas", () => {
    const t = detectarTabela(
      grade(),
      fig([
        cel("Ano", 20, 25),
        cel("Total", 70, 25),
        cel("2019", 20, 45),
        cel("10", 70, 45),
        cel("2020", 20, 65),
        cel("12", 70, 65),
      ]),
    );
    expect(t).toEqual({
      cabecalho: ["Ano", "Total"],
      linhas: [
        ["2019", "10"],
        ["2020", "12"],
      ],
    });
  });

  test("índice ou expoente numa célula: fica imagem", () => {
    const t = detectarTabela(
      grade(),
      fig([
        cel("Ano", 20, 25),
        cel("Total", 70, 25),
        cel("H", 20, 45),
        it("2", 24, 47, { tam: 5, w: 2 }),
        cel("10", 70, 45),
        cel("2020", 20, 65),
        cel("12", 70, 65),
      ]),
    );
    expect(t).toBeNull();
  });

  test("texto fora da grade ou tinta de desenho: fica imagem", () => {
    expect(
      detectarTabela(
        grade(),
        fig([
          cel("Ano", 20, 25),
          cel("Total", 70, 25),
          cel("2019", 20, 45),
          cel("10", 70, 45),
          cel("legenda", 20, 78),
        ]),
      ),
    ).toBeNull();
    const g = grade();
    for (let y = 33; y < 48; y++) for (let x = 25; x < 45; x++) g.tinta[y * g.w + x] = 1; // barra de gráfico
    expect(
      detectarTabela(
        g,
        fig([
          cel("Ano", 20, 25),
          cel("Total", 70, 25),
          cel("2019", 20, 45),
          cel("10", 70, 45),
          cel("2020", 20, 65),
          cel("12", 70, 65),
        ]),
      ),
    ).toBeNull();
  });
});

describe("descrição longa não entrega a resposta (T-50.9.5)", () => {
  test("texto da alternativa correta ou menção à letra são recusados", () => {
    expect(
      descricaoEntregaResposta("Texto na imagem: a resposta é a fotossíntese", "fotossíntese"),
    ).toBe(true);
    expect(descricaoEntregaResposta("Gráfico que aponta a alternativa C", "qualquer coisa")).toBe(
      true,
    );
    expect(descricaoEntregaResposta("Texto na imagem: título do cartaz", "fotossíntese")).toBe(
      false,
    );
  });
});

describe("gabarito, texto ilegível e classificação", () => {
  test("lê a tabela do gabarito, com duas respostas nas questões de língua e anulada por nota", () => {
    const itens = [
      it("1", 100, 100),
      it("B", 170, 100),
      it("A", 240, 100),
      it("12", 100, 112),
      it("1", 109.2, 112),
      it("D", 170, 112), // número partido em dois itens
      it("46", 400, 100),
      it("Anulado", 470, 100),
      it("* Questão 47 Anulada", 400, 300),
    ];
    const g = lerGabarito([{ numero: 1, largura: 595, altura: 842, itens }], { de: 1, ate: 90 });
    expect(g.get(1)?.respostas).toEqual(["B", "A"]);
    expect(g.get(121)).toBeUndefined();
    expect(g.get(46)?.respostas).toEqual(["ANULADA"]);
    expect(g.get(47)?.respostas).toEqual(["ANULADA"]);
  });

  test("texto de fonte sem mapa Unicode é reconhecido como ilegível", () => {
    expect(textoIlegivel("H x ( 8 ( ! 4 F k # & $ + ( =W( *+F F >%5")).toBe(true);
    expect(
      textoIlegivel("O texto mostra que a cidade cresceu e o rio ficou mais poluído com o tempo"),
    ).toBe(false);
  });

  test("a classificação só devolve habilidade que existe e está ativa", () => {
    const amostras: Array<[number, string]> = [
      [10, "O poema usa a metáfora do mar e a ironia do narrador"],
      [60, "Durante a ditadura militar, o AI-5"],
      [100, "A célula realiza a fotossíntese no cloroplasto"],
      [150, "A probabilidade de sortear uma bola"],
      [170, "Texto sem nenhuma pista"],
    ];
    for (const [n, t] of amostras) {
      const c = classificar(n, t);
      expect(SKILL_MAP[c.skillId]?.status, c.skillId).toBe("ativo");
    }
    expect(classificar(170, "Texto sem nenhuma pista").confianca).toBe("baixa");
    expect(classificar(3, "The text says", "ingles").skillId.startsWith("ing:")).toBe(true);
  });
});
