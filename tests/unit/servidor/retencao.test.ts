/**
 * Rotinas de retenção (46 T-09.3; spec 48 T-48.3.3) com relógio simulado. PGlite real.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { aplicarRetencao } from "../../../src/server/conta/retencao";
import { aiBudget, aiUsage, auditEvent, comboDia, denuncia, missaoDia, questaoReporte, rankingGrupo, rankingParticipante, rateLimit, user } from "../../../src/server/db/schema";
import { ambiente, alunoVerificado, cadastroValido, type Ambiente } from "./ajuda";

let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

const DIA = 86_400_000;

describe("retenção", () => {
  test("apaga só o que a política manda, com o relógio adiantado", async () => {
    const verificado = await alunoVerificado(amb, "ok@teste.dev");
    expect((await amb.post("/sign-up/email", cadastroValido("nunca@teste.dev"))).status).toBe(200);
    const [nunca] = await amb.db.select({ id: user.id }).from(user).where(eq(user.email, "nunca@teste.dev"));
    await amb.db.insert(auditEvent).values([
      { id: randomUUID(), userId: null, type: "velho", createdAt: new Date(Date.now() - 200 * DIA) },
      { id: randomUUID(), userId: null, type: "novo" },
    ]);
    await amb.db.insert(aiUsage).values([
      { userId: verificado.userId, day: "2026-01-01" },
      { userId: verificado.userId, day: "2026-09-30" },
    ]);
    await amb.db.insert(aiBudget).values([{ day: "2026-01-01" }, { day: "2026-09-30" }]);
    await amb.db.insert(rateLimit).values({ id: randomUUID(), key: "foca:teste", count: 1, lastRequest: Date.now() - 3 * DIA });

    // Hoje: nada de conta some (a não verificada tem menos de 7 dias).
    const hoje = await aplicarRetencao(amb.db, new Date("2026-09-30T12:00:00-03:00"));
    expect(hoje.contasNaoVerificadas).toBe(0);

    // Daqui a 8 dias: a conta não verificada vai embora; a verificada fica.
    const depois = await aplicarRetencao(amb.db, new Date(Date.now() + 8 * DIA));
    expect(depois.contasNaoVerificadas).toBe(1);
    expect(await amb.db.select().from(user).where(eq(user.id, nunca.id))).toHaveLength(0);
    expect(await amb.db.select().from(user).where(eq(user.id, verificado.userId))).toHaveLength(1);

    // Auditoria de mais de 6 meses, uso de IA de mais de 90 dias e limites parados saem; o recente fica.
    expect((await amb.db.select().from(auditEvent).where(eq(auditEvent.type, "velho"))).length).toBe(0);
    expect((await amb.db.select().from(auditEvent).where(eq(auditEvent.type, "novo"))).length).toBe(1);
    expect((await amb.db.select().from(aiUsage)).map((u) => u.day)).toEqual(["2026-09-30"]);
    expect((await amb.db.select().from(aiBudget)).map((u) => u.day)).toEqual(["2026-09-30"]);
    expect(await amb.db.select().from(rateLimit).where(eq(rateLimit.key, "foca:teste"))).toHaveLength(0);
  });

  test("ranking (spec 49 §9): quem saiu há mais de 30 dias e grupos antigos saem; quem participa fica", async () => {
    const agora = new Date("2026-10-15T12:00:00-03:00");
    const saiu = await alunoVerificado(amb, "saiu@teste.dev");
    const fica = await alunoVerificado(amb, "fica@teste.dev");
    const recente = await alunoVerificado(amb, "recente@teste.dev");
    await amb.db.insert(rankingParticipante).values([
      { userId: saiu.userId, apelido: "Saiu", maiorDesde: agora, saiuEm: new Date(agora.getTime() - 40 * DIA) },
      { userId: fica.userId, apelido: "Fica", maiorDesde: agora },
      { userId: recente.userId, apelido: "Recente", maiorDesde: agora, saiuEm: new Date(agora.getTime() - 5 * DIA) },
    ]);
    await amb.db.insert(rankingGrupo).values([
      { semana: "2026-08-31", userId: fica.userId, grupo: 0 },
      { semana: "2026-10-12", userId: fica.userId, grupo: 0 },
    ]);
    const r = await aplicarRetencao(amb.db, agora);
    expect(r.ranking).toBe(1);
    expect((await amb.db.select().from(rankingParticipante)).map((p) => p.apelido).sort()).toEqual(["Fica", "Recente"]);
    expect((await amb.db.select().from(rankingGrupo)).map((g) => g.semana)).toEqual(["2026-10-12"]);
  });

  test("spec 50 §9: combo do dia em 30 dias, missões em 90, reportes de questão em 90; denúncia aberta segura o participante", async () => {
    const agora = new Date("2026-10-15T12:00:00-03:00");
    const a = await alunoVerificado(amb, "gam@teste.dev");
    const denunciado = await alunoVerificado(amb, "denunciado@teste.dev");
    await amb.db.insert(comboDia).values([
      { userId: a.userId, localDate: "2026-09-01", atual: 1, maximo: 3 },
      { userId: a.userId, localDate: "2026-10-14", atual: 1, maximo: 3 },
    ]);
    await amb.db.insert(missaoDia).values([
      { userId: a.userId, localDate: "2026-07-01", missaoId: "fazer-1", ordem: 0, alvo: 1 },
      { userId: a.userId, localDate: "2026-10-01", missaoId: "fazer-1", ordem: 0, alvo: 1 },
    ]);
    await amb.db.insert(questaoReporte).values([
      { userId: a.userId, itemId: "oficial:velho", motivo: "texto", criadoEm: new Date(agora.getTime() - 100 * DIA) },
      { userId: a.userId, itemId: "oficial:novo", motivo: "texto", criadoEm: new Date(agora.getTime() - 10 * DIA) },
    ]);
    await amb.db.insert(rankingParticipante).values({
      userId: denunciado.userId,
      apelido: "Oculto",
      maiorDesde: agora,
      saiuEm: new Date(agora.getTime() - 40 * DIA),
      ocultoPorDenuncia: true,
    });
    await amb.db.insert(denuncia).values({ id: randomUUID(), autorId: a.userId, alvoId: denunciado.userId, contexto: "amigos", motivo: "apelido", criadaEm: agora });
    await aplicarRetencao(amb.db, agora);
    expect((await amb.db.select().from(comboDia)).map((c) => c.localDate)).toEqual(["2026-10-14"]);
    expect((await amb.db.select().from(missaoDia)).map((m) => m.localDate)).toEqual(["2026-10-01"]);
    expect((await amb.db.select().from(questaoReporte)).map((q) => q.itemId)).toEqual(["oficial:novo"]);
    // Com a denúncia aberta, a ocultação do apelido não some pela retenção.
    expect((await amb.db.select().from(rankingParticipante).where(eq(rankingParticipante.userId, denunciado.userId))).length).toBe(1);
  });
});
