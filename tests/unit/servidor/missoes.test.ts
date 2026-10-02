/**
 * Missões, desafio do mês, conquistas e retrospectiva no servidor (spec 50 §5.4, §5.7.3; RF-13, RF-14, RF-19).
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { eventoEstudo, type EventoEstudo } from "../../../src/lib/sync/contrato";
import { conquista, desafioMes, missaoDia, perolaMovimento } from "../../../src/server/db/schema";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { minhasMissoes } from "../../../src/server/gamificacao/missoes";
import { janelaDaRetrospectiva, minhaRetrospectiva, segundoDomingoDeNovembro } from "../../../src/server/retrospectiva";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00-03:00");
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
const id = () => randomUUID().replaceAll("-", "");
let amb: Ambiente;
let certa: number;
let seq = 0;

function resposta(r: number | null): EventoEstudo {
  const quando = new Date(AGORA.getTime() - 3_600_000 + seq++ * 20_000);
  return eventoEstudo.parse({ tipo: "resposta", id: id(), itemId: "q1", resposta: r, fonte: "licao", ocorreuEm: quando.toISOString(), dataLocal: HOJE });
}
const bloco = () => eventoEstudo.parse({ tipo: "bloco-concluido", id: id(), bloco: "flashcards", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });

beforeEach(async () => {
  amb = await ambiente();
  seq = 0;
  const ex = await exercicioDoItem("q1");
  if (!ex || ex.type !== "multipla-escolha") throw new Error("q1 deveria ser múltipla escolha");
  certa = ex.correta;
});

describe("missões do dia (spec 50 §5.4.1)", () => {
  test("sorteio estável: ler duas vezes devolve as mesmas 3 missões, uma de cada tipo", async () => {
    const { userId } = await alunoVerificado(amb, "missoes-a@foca.dev");
    const a = await minhasMissoes(amb.db, userId, HOJE, AGORA);
    const b = await minhasMissoes(amb.db, userId, HOJE, AGORA);
    expect(a.missoes.length).toBe(3);
    expect(a.missoes).toEqual(b.missoes);
    expect(a.missoes[0].id.startsWith("fazer-")).toBe(true);
  });

  test("concluir um bloco cumpre a missão 'fazer' e paga 10 Pérolas uma vez; 3 seguidas cumprem 'combo-3'", async () => {
    const { userId } = await alunoVerificado(amb, "missoes-b@foca.dev");
    const ini = await minhasMissoes(amb.db, userId, HOJE, AGORA);
    expect(ini.missoes[0].id).toBe("fazer-1");
    const r = await aplicarEventos(amb.db, userId, [bloco(), resposta(certa), resposta(certa), resposta(certa)], AGORA);
    expect(r.agregado.novidades?.missoesConcluidas).toContain("fazer-1");
    const depois = await minhasMissoes(amb.db, userId, HOJE, AGORA);
    expect(depois.missoes.find((m) => m.id === "fazer-1")?.concluida).toBe(true);
    if (depois.missoes.some((m) => m.id === "combo-3")) expect(depois.missoes.find((m) => m.id === "combo-3")?.concluida).toBe(true);
    await aplicarEventos(amb.db, userId, [bloco()], AGORA);
    const missoesPagas = await amb.db
      .select()
      .from(perolaMovimento)
      .where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, "missao"), eq(perolaMovimento.ref, "fazer-1")));
    expect(missoesPagas.length).toBe(1);
  });

  test("desafio do mês: 20 missões concluídas dão a medalha e 150 Pérolas uma vez", async () => {
    const { userId } = await alunoVerificado(amb, "missoes-c@foca.dev");
    await amb.db.insert(desafioMes).values({ userId, mes: HOJE.slice(0, 7), progresso: 19 });
    await minhasMissoes(amb.db, userId, HOJE, AGORA);
    const r = await aplicarEventos(amb.db, userId, [bloco()], AGORA);
    expect(r.agregado.novidades?.desafioDoMes).toBe(true);
    const pago = await amb.db.select().from(perolaMovimento).where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, "desafio")));
    expect(pago.map((p) => p.quantidade)).toEqual([150]);
    const m = await minhasMissoes(amb.db, userId, HOJE, AGORA);
    expect(m.medalhas).toEqual([HOJE.slice(0, 7)]);
  });

  test("missões desligadas (FUNCOES_DESLIGADAS=missoes) não sorteiam nem avançam", async () => {
    process.env.FUNCOES_DESLIGADAS = "missoes";
    const { redefinirEnv } = await import("../../../src/server/env");
    redefinirEnv();
    try {
      const { userId } = await alunoVerificado(amb, "missoes-off@foca.dev");
      await aplicarEventos(amb.db, userId, [bloco()], AGORA);
      const linhas = await amb.db.select().from(missaoDia).where(eq(missaoDia.userId, userId));
      expect(linhas.length).toBe(0);
      expect((await minhasMissoes(amb.db, userId, HOJE, AGORA)).ligado).toBe(false);
    } finally {
      delete process.env.FUNCOES_DESLIGADAS;
      redefinirEnv();
    }
  });
});

describe("conquistas (spec 50 §5.4.3)", () => {
  test("primeira lição concluída dá a conquista e 20 Pérolas uma vez", async () => {
    const { userId } = await alunoVerificado(amb, "conquista-a@foca.dev");
    const fim = () =>
      eventoEstudo.parse({ tipo: "licao-concluida", id: id(), licaoId: "porcentagem-valor", tipoLicao: "micro", acertos: 3, total: 4, ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
    const r = await aplicarEventos(amb.db, userId, [fim()], AGORA);
    expect(r.agregado.novidades?.conquistas).toContain("primeira-licao");
    await aplicarEventos(amb.db, userId, [fim()], AGORA);
    const linhas = await amb.db.select().from(conquista).where(and(eq(conquista.userId, userId), eq(conquista.conquistaId, "primeira-licao")));
    expect(linhas.length).toBe(1);
  });
});

describe("retrospectiva (spec 50 §5.7.3)", () => {
  test("janela: do dia seguinte ao 2º dia de prova até 31/01; em janeiro é a do ano anterior", () => {
    expect(segundoDomingoDeNovembro(2026)).toBe("2026-11-08");
    expect(janelaDaRetrospectiva("2026-11-08").aberta).toBe(false);
    expect(janelaDaRetrospectiva("2026-11-09")).toMatchObject({ ano: 2026, aberta: true });
    expect(janelaDaRetrospectiva("2027-01-20")).toMatchObject({ ano: 2026, aberta: true });
    expect(janelaDaRetrospectiva("2027-02-01").aberta).toBe(false);
    // Data oficial por variável: abre no próprio dia configurado.
    expect(janelaDaRetrospectiva("2026-11-16", "2026-11-16").aberta).toBe(true);
  });

  test("fechada antes do ENEM; aberta conta só o próprio aluno, sem nota", async () => {
    const { userId } = await alunoVerificado(amb, "retro@foca.dev");
    expect((await minhaRetrospectiva(amb.db, userId, "2026-10-15", AGORA)).aberta).toBe(false);
    await aplicarEventos(amb.db, userId, [resposta(certa), bloco()], AGORA);
    const r = await minhaRetrospectiva(amb.db, userId, "2026-11-20", new Date("2026-11-20T15:00:00-03:00"));
    expect(r.aberta).toBe(true);
    expect(r.questoes).toBe(1);
    expect(r.dias).toBe(1);
    expect(Object.keys(r)).not.toContain("nota");
  });
});
