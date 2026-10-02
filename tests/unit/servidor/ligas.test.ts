/**
 * Ligas 18+ no servidor (spec 50 §5.5, T-50.13.3; RF-15). PGlite real; no ambiente local as ligas vêm ligadas.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { diasDaSemana } from "../../../src/lib/ranking";
import {
  attempt,
  ligaFechamento,
  ligaResultado,
  rankingGrupo,
  rankingParticipante,
  studyDay,
  user,
} from "../../../src/server/db/schema";
import { redefinirEnv } from "../../../src/server/env";
import { fecharSemana, formarGruposDaSemana, rodarLigas } from "../../../src/server/ranking/ligas";
import { entrarNoRanking, meuRanking, sairDoRanking } from "../../../src/server/ranking/ranking";
import { aoCorrigirIdadeParaMenor } from "../../../src/server/social/denuncias";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00Z"); // quinta; semana 2026-10-12
const SEMANA = "2026-10-12";
const SEGUNDA_SEGUINTE = new Date("2026-10-19T03:30:00Z"); // 00h30 de segunda em São Paulo

let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});
afterEach(() => {
  delete process.env.LIGAS_HABILITADO;
  redefinirEnv();
});

let seq = 0;
async function adulto(apelido: string, ano = 2000): Promise<string> {
  const a = await alunoVerificado(amb, `lg-${seq++}-${apelido.toLowerCase()}@foca.dev`);
  await amb.db.update(user).set({ birthYear: ano }).where(eq(user.id, a.userId));
  if (ano <= 2007)
    expect(
      await entrarNoRanking(amb.db, a.userId, { apelido }, new Date("2026-09-01T12:00:00Z")),
    ).toEqual({ ok: true });
  return a.userId;
}

/** `dias` dias de estudo na semana, cada um com `blocos` blocos e 4 respostas pontuadas por bloco. */
async function estudar(
  userId: string,
  semana: string,
  dias: number,
  blocos = 1,
  respostasPorBloco = 4,
) {
  for (const dia of diasDaSemana(semana).slice(0, dias)) {
    await amb.db.insert(studyDay).values({ userId, localDate: dia, blocks: blocos });
    const n = blocos * respostasPorBloco;
    if (n)
      await amb.db
        .insert(attempt)
        .values(
          Array.from({ length: n }, () => ({
            userId,
            id: randomUUID(),
            itemId: "q1",
            correct: true,
            source: "questao-geral",
            answeredAt: new Date(`${dia}T15:00:00Z`),
            localDate: dia,
          })),
        );
  }
}

describe("ligas no servidor", () => {
  test("conta de 17 anos: MENOR_DE_IDADE ao entrar; nunca vê a liga", async () => {
    const menor = await adulto("Menorzinho", 2009);
    expect(await meuRanking(amb.db, menor, AGORA)).toEqual({ estado: "menor" });
    await expect(
      entrarNoRanking(amb.db, menor, { apelido: "Menorzinho" }, AGORA),
    ).rejects.toMatchObject({ codigo: "MENOR_DE_IDADE" });
  });

  test("liga da semana: começa em Areia, empate divide a posição, zona de subida só no topo; bloco sem 4 respostas não pontua", async () => {
    const ana = await adulto("Ana");
    const bia = await adulto("Bia");
    const caio = await adulto("Caio");
    await estudar(ana, SEMANA, 2, 1);
    await estudar(bia, SEMANA, 2, 1);
    await estudar(caio, SEMANA, 2, 3, 1); // 3 blocos por dia, mas só 3 respostas: os blocos não valem
    for (const u of [ana, bia, caio]) await meuRanking(amb.db, u, AGORA);
    const r = await meuRanking(amb.db, ana, AGORA);
    if (r.estado !== "participando" || !r.liga) throw new Error("deveria estar na liga");
    expect(r.liga).toMatchObject({
      divisao: 1,
      maiorDivisao: 1,
      formando: false,
      vagasDeSubida: 4,
      resultado: null,
    });
    expect(r.grupo).toEqual([
      { posicao: 1, apelido: "Ana", pontos: 220, voce: true },
      { posicao: 1, apelido: "Bia", pontos: 220, voce: false },
      { posicao: 3, apelido: "Caio", pontos: 200, voce: false },
    ]);
  });

  test("sozinho: liga em formação", async () => {
    const ana = await adulto("Ana");
    const r = await meuRanking(amb.db, ana, AGORA);
    expect(r.estado === "participando" && r.liga?.formando).toBe(true);
  });

  test("fechamento da semana: promoção, rebaixamento, pausa; idempotente pela chave liga:<semana>", async () => {
    const ids: Record<string, string> = {};
    for (const n of ["Ana", "Bia", "Caio", "Davi", "Eva", "Fabi", "Gil"]) ids[n] = await adulto(n);
    // Todos em Coral na semana.
    await amb.db.update(rankingParticipante).set({ divisao: 2 });
    expect(await formarGruposDaSemana(amb.db, SEMANA, new Date("2026-10-12T04:00:00Z"))).toBe(7);
    expect(
      new Set((await amb.db.select().from(rankingGrupo)).map((g) => `${g.divisao}:${g.grupo}`)),
    ).toEqual(new Set(["2:0"]));
    await estudar(ids.Ana, SEMANA, 4); // 440
    await estudar(ids.Bia, SEMANA, 3); // 330
    await estudar(ids.Caio, SEMANA, 2); // 220: estudou 2 dias, não desce
    await estudar(ids.Davi, SEMANA, 1); // 110
    await estudar(ids.Eva, SEMANA, 1, 1, 0); // 100 (sem respostas: o bloco não vale)
    await estudar(ids.Fabi, SEMANA, 1, 2, 2); // 101.. → 100 + 1 bloco válido = 110
    // Gil: 0 pontos → pausa

    const r1 = await rodarLigas(amb.db, SEGUNDA_SEGUINTE);
    expect(r1).toMatchObject({
      ligas: "ok",
      fechamento: { semana: SEMANA, fechada: true, participantes: 7 },
    });
    const res = Object.fromEntries(
      (await amb.db.select().from(ligaResultado)).map((r) => [r.userId, r]),
    );
    expect(res[ids.Ana]).toMatchObject({ posicao: 1, pontos: 440, movimento: "sobe", divisao: 2 });
    expect(res[ids.Bia]).toMatchObject({ posicao: 2, movimento: "sobe" });
    expect(res[ids.Caio]).toMatchObject({ posicao: 3, movimento: "fica" });
    expect([res[ids.Davi].movimento, res[ids.Eva].movimento, res[ids.Fabi].movimento]).toEqual([
      "desce",
      "desce",
      "desce",
    ]);
    expect(res[ids.Gil]).toMatchObject({ posicao: null, pontos: 0, movimento: "fica" });
    const div = Object.fromEntries(
      (await amb.db.select().from(rankingParticipante)).map((p) => [p.userId, p]),
    );
    expect([
      div[ids.Ana].divisao,
      div[ids.Caio].divisao,
      div[ids.Davi].divisao,
      div[ids.Gil].divisao,
    ]).toEqual([3, 2, 1, 2]);
    expect(div[ids.Gil].pausado).toBe(true);

    // Rodar de novo (outro dia da mesma semana) não muda nada.
    const r2 = await rodarLigas(amb.db, new Date("2026-10-20T03:30:00Z"));
    expect(r2).toMatchObject({ ligas: "ok", fechamento: { fechada: false } });
    expect((await fecharSemana(amb.db, SEMANA, SEGUNDA_SEGUINTE)).fechada).toBe(false);
    expect(
      (
        await amb.db
          .select()
          .from(rankingParticipante)
          .where(eq(rankingParticipante.userId, ids.Ana))
      )[0].divisao,
    ).toBe(3);
    expect(await amb.db.select().from(ligaFechamento)).toHaveLength(1);

    // Grupos da semana nova: quem não está em pausa, por divisão.
    const novos = await amb.db
      .select()
      .from(rankingGrupo)
      .where(eq(rankingGrupo.semana, "2026-10-19"));
    expect(novos.map((g) => g.userId).sort()).toEqual(
      [ids.Ana, ids.Bia, ids.Caio, ids.Davi, ids.Eva, ids.Fabi].sort(),
    );

    // Resultado neutro na tela da semana seguinte; selo da maior divisão.
    const ana = await meuRanking(amb.db, ids.Ana, new Date("2026-10-21T15:00:00Z"));
    expect(ana.estado === "participando" && ana.liga).toMatchObject({
      divisao: 3,
      maiorDivisao: 3,
      resultado: { movimento: "sobe", divisao: 2, novaDivisao: 3 },
    });

    // Pausa: sem estudar não aparece em grupo; estudando, volta para a mesma divisão.
    const gil = await meuRanking(amb.db, ids.Gil, new Date("2026-10-21T15:00:00Z"));
    expect(gil).toMatchObject({ estado: "pausado", liga: { divisao: 2 } });
    await estudar(ids.Gil, "2026-10-19", 1);
    const gil2 = await meuRanking(amb.db, ids.Gil, new Date("2026-10-21T15:00:00Z"));
    expect(gil2.estado === "participando" && gil2.liga?.divisao).toBe(2);
  });

  test("menor (ano corrigido) some do grupo na leitura e no fechamento; a correção tira da liga na hora", async () => {
    const ana = await adulto("Ana");
    const bia = await adulto("Bia");
    await meuRanking(amb.db, ana, AGORA);
    await meuRanking(amb.db, bia, AGORA);
    await amb.db.update(user).set({ birthYear: 2010 }).where(eq(user.id, bia));
    const r = await meuRanking(amb.db, ana, AGORA);
    expect(r.estado === "participando" && r.grupo.map((l) => l.apelido)).toEqual(["Ana"]);
    expect(await meuRanking(amb.db, bia, AGORA)).toEqual({ estado: "menor" });
    await aoCorrigirIdadeParaMenor(amb.db, bia, AGORA);
    expect(
      await amb.db.select().from(rankingGrupo).where(eq(rankingGrupo.userId, bia)),
    ).toHaveLength(0);
    expect(
      (
        await amb.db.select().from(rankingParticipante).where(eq(rankingParticipante.userId, bia))
      )[0].saiuEm,
    ).not.toBeNull();
    await estudar(ana, SEMANA, 3);
    await estudar(bia, SEMANA, 3);
    await amb.db.insert(rankingGrupo).values({ semana: SEMANA, userId: bia, grupo: 0, divisao: 1 }); // mesmo se sobrar no grupo
    await fecharSemana(amb.db, SEMANA, new Date("2026-10-19T03:30:00Z"));
    expect((await amb.db.select().from(ligaResultado)).map((r) => r.userId)).toEqual([ana]);
  });

  test("sair tira o apelido do grupo na hora; nenhuma Pérola pela liga", async () => {
    const ana = await adulto("Ana");
    const bia = await adulto("Bia");
    await meuRanking(amb.db, ana, AGORA);
    await meuRanking(amb.db, bia, AGORA);
    await sairDoRanking(amb.db, bia, AGORA);
    const r = await meuRanking(amb.db, ana, AGORA);
    expect(r.estado === "participando" && r.grupo.map((l) => l.apelido)).toEqual(["Ana"]);
    const { perolaMovimento } = await import("../../../src/server/db/schema");
    await fecharSemana(amb.db, SEMANA, new Date("2026-10-19T03:30:00Z"));
    expect(
      await amb.db
        .select()
        .from(perolaMovimento)
        .where(and(eq(perolaMovimento.userId, ana))),
    ).toHaveLength(0);
  });

  test("com LIGAS_HABILITADO desligado: ranking da 49, sem divisões; o cron não faz nada", async () => {
    process.env.LIGAS_HABILITADO = "false";
    redefinirEnv();
    const ana = await adulto("Ana");
    const r = await meuRanking(amb.db, ana, AGORA);
    expect(r.estado).toBe("participando");
    expect("liga" in r).toBe(false);
    expect(await rodarLigas(amb.db, SEGUNDA_SEGUINTE)).toEqual({ ligas: "desligadas" });
  });
});
