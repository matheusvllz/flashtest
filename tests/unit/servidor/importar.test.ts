/**
 * Importação do progresso local para a conta (docs/specs/46-producao T-07.1, T-07.4; modelo de ameaças T7).
 * Banco real (PGlite) e conteúdo real.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { pedidoImportacao, type PedidoImportacao } from "../../../src/lib/sync/importacao";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { importarEstado } from "../../../src/server/estudo/importar";
import { agregadoDoAluno } from "../../../src/server/estudo/sincronizar";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-09-30T15:00:00-03:00");
const id = () => randomUUID().replaceAll("-", "");

function pedido(extra: Partial<PedidoImportacao> = {}): PedidoImportacao {
  return pedidoImportacao.parse({
    importId: id(),
    aparelhoId: id(),
    schemaVersion: 6,
    xpNoAparelho: 1000,
    respostas: [],
    licoes: [],
    atividades: [],
    diasComAtividade: [],
    bonusDeEntrada: false,
    ...extra,
  });
}

let amb: Ambiente;
let certa: number;
beforeEach(async () => {
  amb = await ambiente();
  const ex = await exercicioDoItem("q1");
  if (!ex || ex.type !== "multipla-escolha") throw new Error("q1");
  certa = ex.correta;
});

describe("importação", () => {
  test("importa respostas, lição, dias e bônus; o XP sai das regras, não do número do aparelho", async () => {
    const { userId } = await alunoVerificado(amb, "imp@teste.dev");
    const { resumo, agregado } = await importarEstado(
      amb.db,
      userId,
      pedido({
        bonusDeEntrada: true,
        respostas: [{ id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: "2026-09-20T10:00:00-03:00", dataLocal: "2026-09-20" }],
        diasComAtividade: ["2026-09-19", "2026-09-20"],
      }),
      AGORA,
    );
    expect(resumo).toMatchObject({ respostas: 1, dias: 2, xp: 65, repetida: false }); // 50 de entrada + 15 da questão
    expect(agregado.xp).toBe(65);
    expect(agregado.diasComAtividade).toBe(2);
  });

  test("XP importado nunca passa do XP que o aparelho mostrava (localStorage editado não vira recompensa)", async () => {
    const { userId } = await alunoVerificado(amb, "teto@teste.dev");
    const { resumo } = await importarEstado(amb.db, userId, pedido({ xpNoAparelho: 20, bonusDeEntrada: true }), AGORA);
    expect(resumo.xp).toBe(20);
    expect((await agregadoDoAluno(amb.db, userId)).xp).toBe(20);
  });

  test("resposta errada informada como certa: a correção vem do gabarito", async () => {
    const { userId } = await alunoVerificado(amb, "gab@teste.dev");
    const errada = (certa + 1) % 4;
    const { resumo } = await importarEstado(
      amb.db,
      userId,
      pedido({ respostas: [{ id: id(), itemId: "q1", resposta: errada, fonte: "questao-geral", ocorreuEm: "2026-09-20T10:00:00-03:00", dataLocal: "2026-09-20" }] }),
      AGORA,
    );
    expect(resumo.xp).toBe(5);
  });

  test("repetir a mesma importação (mesmo importId) não aplica de novo", async () => {
    const { userId } = await alunoVerificado(amb, "rep@teste.dev");
    const p = pedido({ bonusDeEntrada: true, diasComAtividade: ["2026-09-20"] });
    await importarEstado(amb.db, userId, p, AGORA);
    const segunda = await importarEstado(amb.db, userId, p, AGORA);
    expect(segunda.resumo.repetida).toBe(true);
    expect(segunda.agregado.xp).toBe(50);
  });

  test("datas impossíveis (antes do app existir, ou no futuro) e itens inexistentes são ignorados", async () => {
    const { userId } = await alunoVerificado(amb, "data@teste.dev");
    const { resumo } = await importarEstado(
      amb.db,
      userId,
      pedido({
        respostas: [
          { id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: "2020-01-01T10:00:00Z", dataLocal: "2020-01-01" },
          { id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: "2027-01-01T10:00:00Z", dataLocal: "2027-01-01" },
          { id: id(), itemId: "nao-existe", resposta: 0, fonte: "questao-geral", ocorreuEm: "2026-09-20T10:00:00Z", dataLocal: "2026-09-20" },
        ],
        diasComAtividade: ["2019-05-05", "2030-01-01"],
      }),
      AGORA,
    );
    expect(resumo).toMatchObject({ respostas: 0, dias: 0, xp: 0 });
  });

  test("a importação de A não aparece para B (isolamento)", async () => {
    const a = await alunoVerificado(amb, "ia@teste.dev");
    const b = await alunoVerificado(amb, "ib@teste.dev");
    await importarEstado(amb.db, a.userId, pedido({ bonusDeEntrada: true }), AGORA);
    expect((await agregadoDoAluno(amb.db, b.userId)).xp).toBe(0);
  });

  test("o contrato recusa listas acima do limite", () => {
    const muitas = Array.from({ length: 501 }, () => ({ id: id(), itemId: "q1", resposta: 0, fonte: "questao-geral", ocorreuEm: "2026-09-20T10:00:00Z", dataLocal: "2026-09-20" }));
    expect(() => pedido({ respostas: muitas as PedidoImportacao["respostas"] })).toThrow();
  });
});

describe("importação interrompida (spec 48 T-48.1.2; 46 T-07.1)", () => {
  test("queda no meio da transação não grava nada; repetir depois aplica tudo, uma vez", async () => {
    const { userId } = await alunoVerificado(amb, "queda@teste.dev");
    const p = pedido({
      bonusDeEntrada: true,
      respostas: [
        { id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: "2026-09-20T10:00:00-03:00", dataLocal: "2026-09-20" },
        { id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: "2026-09-21T10:00:00-03:00", dataLocal: "2026-09-21" },
      ],
      diasComAtividade: ["2026-09-20", "2026-09-21"],
    });
    // Banco que derruba a transação na 4ª escrita (depois de já ter gravado respostas dentro dela).
    let escritas = 0;
    const comQueda = new Proxy(amb.db, {
      get(alvo, chave, rec) {
        if (chave !== "transaction") return Reflect.get(alvo, chave, rec);
        return (fn: (tx: unknown) => Promise<unknown>) =>
          alvo.transaction((tx) =>
            fn(
              new Proxy(tx, {
                get(t, k, r) {
                  const v = Reflect.get(t, k, r);
                  if (k !== "insert") return typeof v === "function" ? v.bind(t) : v;
                  return (...args: unknown[]) => {
                    if (++escritas === 4) throw new Error("queda simulada");
                    return (v as (...a: unknown[]) => unknown).apply(t, args);
                  };
                },
              }),
            ),
          );
      },
    });
    await expect(importarEstado(comQueda as typeof amb.db, userId, p, AGORA)).rejects.toThrow("queda simulada");
    expect(escritas).toBeGreaterThanOrEqual(4);
    const depoisDaQueda = await agregadoDoAluno(amb.db, userId);
    expect(depoisDaQueda).toMatchObject({ xp: 0, diasComAtividade: 0 });

    const ok = await importarEstado(amb.db, userId, p, AGORA);
    expect(ok.resumo).toMatchObject({ respostas: 2, repetida: false });
    const de_novo = await importarEstado(amb.db, userId, p, AGORA);
    expect(de_novo.resumo.repetida).toBe(true);
    expect(de_novo.agregado.xp).toBe(ok.agregado.xp);
  });
});
