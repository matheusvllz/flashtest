/**
 * Pérolas, combo e ofensiva no servidor (spec 50 E3: §5.1.3, §5.2.2, §5.2.4, §5.3; RF-2, RF-3, RF-7, RF-8, RF-10).
 * O servidor é a única fonte das recompensas; reenvio e dois aparelhos não pagam duas vezes.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { eventoEstudo, type EventoEstudo } from "../../../src/lib/sync/contrato";
import { assinatura, perolaMovimento, studyDay, xpLedger } from "../../../src/server/db/schema";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { comprarNaLoja, equiparCosmetico } from "../../../src/server/economia/loja";
import { saldoDePerolas } from "../../../src/server/economia/perolas";
import { definirMetaOfensiva, minhaOfensiva } from "../../../src/server/gamificacao/ofensiva";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00-03:00");
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
const id = () => randomUUID().replaceAll("-", "");
let amb: Ambiente;
let certa: number;
let seq = 0;

/** Resposta em sequência (cada uma 20 s depois da anterior, dentro da janela do combo). */
function resposta(r: number | null, extra: Partial<EventoEstudo> = {}): EventoEstudo {
  const quando = new Date(AGORA.getTime() - 3_600_000 + seq++ * 20_000);
  return eventoEstudo.parse({ tipo: "resposta", id: id(), itemId: "q1", resposta: r, fonte: "licao", ocorreuEm: quando.toISOString(), dataLocal: HOJE, ...extra });
}

function bloco(): EventoEstudo {
  return eventoEstudo.parse({ tipo: "bloco-concluido", id: id(), bloco: "flashcards", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
}

beforeEach(async () => {
  amb = await ambiente();
  seq = 0;
  const ex = await exercicioDoItem("q1");
  if (!ex || ex.type !== "multipla-escolha") throw new Error("q1 deveria ser múltipla escolha");
  certa = ex.correta;
});

describe("combo no servidor (spec 50 §5.1.3)", () => {
  test("5 e 10 seguidas devolvem vida (Free com vidas), no máximo 2 por dia e nunca acima de 5", async () => {
    const { userId } = await alunoVerificado(amb, "e2e-vidas-combo@foca.dev");
    const errada = (certa + 1) % 4;
    // Perde 3 vidas (fica com 2); depois 10 certas seguidas: +1 em 5 e +1 em 10.
    await aplicarEventos(amb.db, userId, [resposta(errada), resposta(errada), resposta(errada)], AGORA);
    const r = await aplicarEventos(amb.db, userId, Array.from({ length: 10 }, () => resposta(certa)), AGORA);
    expect(r.agregado.vidas?.restantes).toBe(4);
    expect(r.agregado.novidades?.vidasDoCombo).toBe(2);
    expect(r.agregado.combo?.atual).toBe(10);
    // Mais 5 seguidas: o teto diário (2) já foi usado.
    const r2 = await aplicarEventos(amb.db, userId, Array.from({ length: 5 }, () => resposta(certa)), AGORA);
    expect(r2.agregado.vidas?.restantes).toBe(4);
    // Reenviar os mesmos eventos não dá vida de novo.
    const evs = Array.from({ length: 5 }, () => resposta(certa));
    await aplicarEventos(amb.db, userId, evs, AGORA);
    const r3 = await aplicarEventos(amb.db, userId, evs, AGORA);
    expect(r3.agregado.novidades?.vidasDoCombo).toBe(0);
  });

  test("Basic e Pro não têm vidas: o combo não devolve vida (RF-2)", async () => {
    const { userId } = await alunoVerificado(amb, "combo-basic@foca.dev");
    await amb.db.insert(assinatura).values({
      id: randomUUID(),
      userId,
      provedor: "teste",
      origem: "web",
      idExterno: randomUUID(),
      produto: "basic_mensal",
      plano: "basic",
      estado: "ativa",
      validoAte: new Date("2026-12-01T00:00:00Z"),
    });
    const r = await aplicarEventos(amb.db, userId, Array.from({ length: 10 }, () => resposta(certa)), AGORA);
    expect(r.agregado.novidades?.vidasDoCombo ?? 0).toBe(0);
    expect(r.agregado.combo?.atual).toBe(10);
  });

  test("bônus de XP do combo tem teto de 20 por dia (RF-3)", async () => {
    const { userId } = await alunoVerificado(amb, "combo-teto@foca.dev");
    for (const [key, licao] of [["t1", "porcentagem-valor"], ["t2", "porcentagem-aumento-desconto"], ["t3", "citologia-membrana"]]) {
      const fim = eventoEstudo.parse({ tipo: "licao-concluida", id: id(), licaoId: licao, tipoLicao: "micro", acertos: 10, total: 10, attemptKey: key, ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
      await aplicarEventos(amb.db, userId, [...Array.from({ length: 10 }, () => resposta(certa, { attemptKey: key })), fim], AGORA);
    }
    const bonus = (await amb.db.select().from(xpLedger).where(eq(xpLedger.userId, userId))).filter((l) => l.key.startsWith("combo:"));
    expect(bonus.reduce((s, l) => s + l.xp, 0)).toBe(20);
  });

  test("checagem dentro da lição (não pontuada) e revisão não contam nem zeram", async () => {
    const { userId } = await alunoVerificado(amb, "combo-checagem@foca.dev");
    const errada = (certa + 1) % 4;
    await aplicarEventos(amb.db, userId, [resposta(certa), resposta(certa), resposta(errada, { pontuada: false }), resposta(errada, { tentativa: "revisao" })], AGORA);
    const r = await aplicarEventos(amb.db, userId, [resposta(certa)], AGORA);
    expect(r.agregado.combo?.atual).toBe(3);
  });

  test("bônus fixo de XP do combo na conclusão: +10 com 10 seguidas; replay não paga", async () => {
    const { userId } = await alunoVerificado(amb, "combo-xp@foca.dev");
    const key = "ls-tentativa-1";
    const respostas = Array.from({ length: 10 }, () => resposta(certa, { attemptKey: key }));
    const fim = eventoEstudo.parse({ tipo: "licao-concluida", id: id(), licaoId: "porcentagem-valor", tipoLicao: "micro", acertos: 10, total: 10, attemptKey: key, ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
    await aplicarEventos(amb.db, userId, [...respostas, fim], AGORA);
    const [bonus] = await amb.db.select().from(xpLedger).where(and(eq(xpLedger.userId, userId), eq(xpLedger.key, `combo:${key}`)));
    expect(bonus.xp).toBe(10);
    // Replay da mesma lição, nova tentativa: sem bônus.
    const key2 = "ls-tentativa-2";
    const fim2 = eventoEstudo.parse({ tipo: "licao-concluida", id: id(), licaoId: "porcentagem-valor", tipoLicao: "micro", acertos: 5, total: 5, attemptKey: key2, ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
    await aplicarEventos(amb.db, userId, [...Array.from({ length: 5 }, () => resposta(certa, { attemptKey: key2 })), fim2], AGORA);
    const outro = await amb.db.select().from(xpLedger).where(and(eq(xpLedger.userId, userId), eq(xpLedger.key, `combo:${key2}`)));
    expect(outro.length).toBe(0);
  });
});

describe("Pérolas (spec 50 §5.3)", () => {
  test("bloco sem evidência não paga (revisão L2): aula de 60 s sem respostas e bloco de dias atrás só marcam o dia", async () => {
    const { userId } = await alunoVerificado(amb, "perolas-evidencia@foca.dev");
    const pagas = async () =>
      (await amb.db.select().from(perolaMovimento).where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, "bloco")))).length;
    const aula = (dataLocal = HOJE) => eventoEstudo.parse({ tipo: "bloco-concluido", id: id(), bloco: "aula-60s", ocorreuEm: AGORA.toISOString(), dataLocal });
    await aplicarEventos(amb.db, userId, [aula()], AGORA);
    expect(await pagas()).toBe(0);
    const antigo = eventoEstudo.parse({ tipo: "bloco-concluido", id: id(), bloco: "flashcards", ocorreuEm: AGORA.toISOString(), dataLocal: "2026-10-10" });
    await aplicarEventos(amb.db, userId, [antigo], AGORA);
    expect(await pagas()).toBe(0);
    const dias = (await amb.db.select().from(studyDay).where(eq(studyDay.userId, userId))).map((d) => d.localDate).sort();
    expect(dias).toEqual(["2026-10-10", HOJE]);
    // Com as 2 respostas da aula no dia, paga.
    await aplicarEventos(amb.db, userId, [resposta(certa, { fonte: "questao-geral" }), resposta(certa, { fonte: "questao-geral", itemId: "q2" }), aula()], AGORA);
    expect(await pagas()).toBe(1);
  });

  test("5 por bloco, até 5 blocos por dia; reenvio não paga de novo", async () => {
    const { userId } = await alunoVerificado(amb, "perolas-bloco@foca.dev");
    const evs = Array.from({ length: 7 }, bloco);
    const somaDosBlocos = async () =>
      (await amb.db.select().from(perolaMovimento).where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, "bloco")))).reduce(
        (s, m) => s + m.quantidade,
        0,
      );
    await aplicarEventos(amb.db, userId, evs, AGORA);
    expect(await somaDosBlocos()).toBe(25);
    // Reenviar o mesmo lote não paga de novo (nem bloco, nem missão).
    const antes = (await aplicarEventos(amb.db, userId, [], AGORA).catch(() => null))?.agregado.perolas;
    const r2 = await aplicarEventos(amb.db, userId, evs, AGORA);
    expect(await somaDosBlocos()).toBe(25);
    if (antes !== undefined) expect(r2.agregado.perolas).toBe(antes);
  });

  test("lição perfeita: +5 só com 4+ pontuadas certas de primeira e sem ajuda", async () => {
    const { userId } = await alunoVerificado(amb, "perolas-perfeita@foca.dev");
    const fim = (key: string) =>
      eventoEstudo.parse({ tipo: "licao-concluida", id: id(), licaoId: "porcentagem-valor", tipoLicao: "micro", acertos: 4, total: 4, attemptKey: key, ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
    await aplicarEventos(amb.db, userId, [...Array.from({ length: 4 }, () => resposta(certa, { attemptKey: "p1" })), fim("p1")], AGORA);
    const ajudada = [...Array.from({ length: 3 }, () => resposta(certa, { attemptKey: "p2" })), resposta(certa, { attemptKey: "p2", assistida: true })];
    await aplicarEventos(amb.db, userId, [...ajudada, fim("p2")], AGORA);
    // "Não sei" (resposta nula) também tira a lição perfeita (RF-5).
    const naoSei = [...Array.from({ length: 4 }, () => resposta(certa, { attemptKey: "p3" })), resposta(null, { attemptKey: "p3" })];
    await aplicarEventos(amb.db, userId, [...naoSei, fim("p3")], AGORA);
    const perfeitas = await amb.db
      .select()
      .from(perolaMovimento)
      .where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, "perfeita")));
    expect(perfeitas.map((p) => p.chave)).toEqual(["perfeita:p1"]);
  });

  test("Pérolas desligadas (FUNCOES_DESLIGADAS=perolas) não concedem", async () => {
    process.env.FUNCOES_DESLIGADAS = "perolas";
    const { redefinirEnv } = await import("../../../src/server/env");
    redefinirEnv();
    try {
      const { userId } = await alunoVerificado(amb, "perolas-off@foca.dev");
      const r = await aplicarEventos(amb.db, userId, [bloco()], AGORA);
      expect(r.agregado.perolas).toBe(0);
    } finally {
      delete process.env.FUNCOES_DESLIGADAS;
      redefinirEnv();
    }
  });
});

describe("loja (spec 50 §5.3.3; RF-7, RF-8)", () => {
  async function comSaldo(email: string, perolas: number) {
    const { userId } = await alunoVerificado(amb, email);
    await amb.db.insert(perolaMovimento).values({ userId, chave: `teste:${id()}`, quantidade: perolas, motivo: "conquista", localDate: HOJE });
    return userId;
  }

  test("protetor: cobra 250, entra no estoque e respeita o teto do plano", async () => {
    const userId = await comSaldo("loja-protetor@foca.dev", 1000);
    const a = await comprarNaLoja(amb.db, userId, "protetor", randomUUID(), AGORA);
    expect(a).toMatchObject({ ok: true, saldo: 750 });
    expect((await minhaOfensiva(amb.db, userId, AGORA)).protetores).toBe(2);
    const b = await comprarNaLoja(amb.db, userId, "protetor", randomUUID(), AGORA);
    expect(b).toMatchObject({ ok: false, motivo: "ESTOQUE_CHEIO" });
    expect(await saldoDePerolas(amb.db, userId)).toBe(750);
  });

  test("mesmo pedido duas vezes cobra uma vez; duas compras ao mesmo tempo com saldo para uma: uma passa", async () => {
    const userId = await comSaldo("loja-concorrencia@foca.dev", 400);
    const pedido = randomUUID();
    await comprarNaLoja(amb.db, userId, "roupa:bone", pedido, AGORA);
    const repetido = await comprarNaLoja(amb.db, userId, "roupa:bone", pedido, AGORA);
    expect(repetido).toMatchObject({ ok: true, repetido: true, saldo: 100 });
    const userId2 = await comSaldo("loja-concorrencia-2@foca.dev", 400);
    const [x, y] = await Promise.all([
      comprarNaLoja(amb.db, userId2, "roupa:oculos", randomUUID(), AGORA),
      comprarNaLoja(amb.db, userId2, "roupa:oculos", randomUUID(), AGORA),
    ]);
    expect([x.ok, y.ok].filter(Boolean).length).toBe(1);
    expect(await saldoDePerolas(amb.db, userId2)).toBe(0);
  });

  test("recarga de vidas só no Free com vidas, uma por dia; volta a 5", async () => {
    const userId = await comSaldo("e2e-vidas-recarga@foca.dev", 1000);
    const errada = (certa + 1) % 4;
    await aplicarEventos(amb.db, userId, [resposta(errada), resposta(errada), resposta(errada)], AGORA);
    const ok = await comprarNaLoja(amb.db, userId, "recarga-vidas", randomUUID(), AGORA);
    expect(ok.ok).toBe(true);
    const segunda = await comprarNaLoja(amb.db, userId, "recarga-vidas", randomUUID(), AGORA);
    expect(segunda).toMatchObject({ ok: false });
    const pro = await comSaldo("loja-pro@foca.dev", 1000);
    await amb.db.insert(assinatura).values({
      id: randomUUID(), userId: pro, provedor: "teste", origem: "web", idExterno: randomUUID(), produto: "pro_mensal", plano: "pro", estado: "ativa",
      inicio: new Date(AGORA.getTime() - 86_400_000), validoAte: new Date(AGORA.getTime() + 20 * 86_400_000),
    });
    expect(await comprarNaLoja(amb.db, pro, "recarga-vidas", randomUUID(), AGORA)).toMatchObject({ ok: false, motivo: "SEM_VIDAS_NO_PLANO" });
  });

  test("equipar só o que tem", async () => {
    const userId = await comSaldo("loja-equipar@foca.dev", 1000);
    expect(await equiparCosmetico(amb.db, userId, "roupa", "roupa:bone")).toEqual({ ok: false });
    await comprarNaLoja(amb.db, userId, "roupa:bone", randomUUID(), AGORA);
    expect(await equiparCosmetico(amb.db, userId, "roupa", "roupa:bone")).toEqual({ ok: true });
    expect(await equiparCosmetico(amb.db, userId, "tema", "roupa:bone")).toEqual({ ok: false });
  });
});

describe("ofensiva: meta e marcos (spec 50 §5.2; RF-10)", () => {
  async function diasDeEstudo(userId: string, n: number) {
    for (let i = n; i >= 1; i--) {
      const d = new Date(AGORA.getTime() - i * 86_400_000);
      await amb.db.insert(studyDay).values({ userId, localDate: dataNoFuso(d, "America/Sao_Paulo"), blocks: 1 });
    }
  }

  test("marco de 7 dias abre o baú uma vez (50 Pérolas)", async () => {
    const { userId } = await alunoVerificado(amb, "marco-7@foca.dev");
    await diasDeEstudo(userId, 6);
    const r = await aplicarEventos(amb.db, userId, [bloco()], AGORA);
    expect(r.agregado.novidades?.marco).toMatchObject({ dias: 7, perolas: 50 });
    const r2 = await aplicarEventos(amb.db, userId, [bloco()], AGORA);
    expect(r2.agregado.novidades?.marco).toBeNull();
  });

  test("meta de 7 dias cumprida paga a tabela (7 → 50 Pérolas) uma vez", async () => {
    const { userId } = await alunoVerificado(amb, "meta-7@foca.dev");
    await diasDeEstudo(userId, 2); // sequência de 2 até ontem
    const ontem = new Date(AGORA.getTime() - 86_400_000);
    await definirMetaOfensiva(amb.db, userId, 7, ontem);
    // Mais dias até completar 7 a partir de ontem.
    for (let i = 0; i < 6; i++) {
      const d = new Date(AGORA.getTime() + i * 86_400_000);
      await aplicarEventos(amb.db, userId, [eventoEstudo.parse({ tipo: "bloco-concluido", id: id(), bloco: "flashcards", ocorreuEm: d.toISOString(), dataLocal: dataNoFuso(d, "America/Sao_Paulo") })], d);
    }
    const metas = await amb.db
      .select()
      .from(perolaMovimento)
      .where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, "meta-ofensiva")));
    expect(metas.length).toBe(1);
    expect(metas[0].quantidade).toBe(50);
  });
});
