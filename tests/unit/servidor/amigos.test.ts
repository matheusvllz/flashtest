/**
 * Ofensiva com amigos 18+ no servidor (spec 50 §5.6, T-50.14.2/14.3; RF-16). PGlite real; no ambiente local a função
 * vem ligada.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { aplicarRetencao } from "../../../src/server/conta/retencao";
import { exportarDadosDoAluno } from "../../../src/server/conta/dados";
import {
  amizade,
  conviteAmizade,
  denuncia,
  rankingParticipante,
  studyDay,
  user,
} from "../../../src/server/db/schema";
import { gravarApelido, meuRanking } from "../../../src/server/ranking/ranking";
import {
  abrirConvite,
  bloquear,
  criarConvite,
  desbloquear,
  encerrarDupla,
  hashDoCodigo,
  minhasDuplas,
  pedirDupla,
  responderPedido,
} from "../../../src/server/social/amigos";
import { aoCorrigirIdadeParaMenor, denunciar } from "../../../src/server/social/denuncias";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00Z"); // 12h em São Paulo
const HOJE = "2026-10-15";
const DIA = 86_400_000;

let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

let seq = 0;
async function conta(apelido: string | null, ano = 2000): Promise<string> {
  const a = await alunoVerificado(amb, `am-${seq++}@foca.dev`);
  await amb.db.update(user).set({ birthYear: ano }).where(eq(user.id, a.userId));
  if (apelido)
    expect(await gravarApelido(amb.db, a.userId, { apelido }, AGORA, false)).toEqual({ ok: true });
  return a.userId;
}

/** A convida, B pede, A aceita: devolve o id da dupla. */
async function dupla(a: string, b: string, quando = AGORA): Promise<string> {
  const { codigo } = await criarConvite(amb.db, a, quando);
  await pedirDupla(amb.db, b, codigo, quando);
  const r = await minhasDuplas(amb.db, a, quando);
  if (r.estado !== "pronto") throw new Error(r.estado);
  await responderPedido(amb.db, a, r.recebidos[0].id, true, quando);
  return r.recebidos[0].id;
}

describe("idade e elegibilidade", () => {
  test("conta de 17 anos: MENOR_DE_IDADE em cada função social", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const id = await dupla(ana, bia);
    const { codigo } = await criarConvite(amb.db, ana, AGORA);
    const menor = await conta(null, 2009);
    const ref = "00000000-0000-4000-8000-000000000000";
    const chamadas: [string, () => Promise<unknown>][] = [
      ["minhasDuplas", () => minhasDuplas(amb.db, menor, AGORA)],
      ["apelido", () => gravarApelido(amb.db, menor, { apelido: "Menorzinho" }, AGORA, false)],
      ["criarConvite", () => criarConvite(amb.db, menor, AGORA)],
      ["abrirConvite", () => abrirConvite(amb.db, menor, codigo, AGORA)],
      ["pedirDupla", () => pedirDupla(amb.db, menor, codigo, AGORA)],
      ["responderPedido", () => responderPedido(amb.db, menor, id, true, AGORA)],
      ["encerrarDupla", () => encerrarDupla(amb.db, menor, id, AGORA)],
      ["bloquear", () => bloquear(amb.db, menor, id, AGORA)],
      ["desbloquear", () => desbloquear(amb.db, menor, ref, AGORA)],
      ["denunciar", () => denunciar(amb.db, menor, { id, motivo: "outro" }, AGORA)],
    ];
    for (const [nome, f] of chamadas) {
      const erro = await f().then(
        () => null,
        (e: { codigo?: string; message?: string }) => e,
      );
      expect({ nome, codigo: erro?.codigo }).toEqual({ nome, codigo: "MENOR_DE_IDADE" });
      // Nada de quem convidou na resposta.
      expect(JSON.stringify(erro)).not.toContain("Ana");
    }
  });

  test("menor abrindo o link não vê o apelido de quem convidou; adulto sem apelido também não", async () => {
    const ana = await conta("AnaConvida");
    const { codigo } = await criarConvite(amb.db, ana, AGORA);
    const menor = await conta(null, 2009);
    const r = await abrirConvite(amb.db, menor, codigo, AGORA).catch((e: unknown) => e);
    expect(JSON.stringify(r)).not.toContain("AnaConvida");
    const semApelido = await conta(null);
    expect(await abrirConvite(amb.db, semApelido, codigo, AGORA)).toEqual({
      estado: "sem-apelido",
      confirmarNascimento: false,
    });
    const bia = await conta("Bia");
    expect(await abrirConvite(amb.db, bia, codigo, AGORA)).toEqual({
      estado: "disponivel",
      apelido: "AnaConvida",
    });
  });
});

describe("convite e aceite mútuo", () => {
  test("convite: guardado só o hash, uso único e expira em 72 h", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const caio = await conta("Caio");
    const { codigo, expiraEm } = await criarConvite(amb.db, ana, AGORA);
    expect(codigo).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(new Date(expiraEm).getTime() - AGORA.getTime()).toBe(72 * 3_600_000);
    const guardados = await amb.db.select().from(conviteAmizade);
    expect(guardados.map((c) => c.codigoHash)).toEqual([hashDoCodigo(codigo)]);
    expect(JSON.stringify(guardados)).not.toContain(codigo);

    await pedirDupla(amb.db, bia, codigo, AGORA);
    expect(await abrirConvite(amb.db, caio, codigo, AGORA)).toEqual({ estado: "indisponivel" });
    await expect(pedirDupla(amb.db, caio, codigo, AGORA)).rejects.toMatchObject({
      codigo: "CONVITE_INDISPONIVEL",
    });

    const outro = await criarConvite(amb.db, ana, AGORA);
    const depois = new Date(AGORA.getTime() + 72 * 3_600_000 + 1000);
    expect(await abrirConvite(amb.db, caio, outro.codigo, depois)).toEqual({
      estado: "indisponivel",
    });
    expect(await abrirConvite(amb.db, caio, "codigo-que-nao-existe-x", AGORA)).toEqual({
      estado: "indisponivel",
    });
    expect(await abrirConvite(amb.db, ana, outro.codigo, AGORA)).toEqual({
      estado: "indisponivel",
    }); // o próprio
  });

  test("pedido só vira dupla com o aceite de quem convidou; cada um vê só apelido, dias, recorde e hoje", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const { codigo } = await criarConvite(amb.db, ana, AGORA);
    await pedirDupla(amb.db, bia, codigo, AGORA);
    const daBia = await minhasDuplas(amb.db, bia, AGORA);
    if (daBia.estado !== "pronto") throw new Error(daBia.estado);
    expect(daBia.enviados.map((p) => p.apelido)).toEqual(["Ana"]);
    expect(daBia.duplas).toEqual([]);
    // Quem pediu não aceita o próprio pedido.
    await expect(
      responderPedido(amb.db, bia, daBia.enviados[0].id, true, AGORA),
    ).rejects.toMatchObject({ codigo: "PEDIDO_INEXISTENTE" });

    const daAna = await minhasDuplas(amb.db, ana, AGORA);
    if (daAna.estado !== "pronto") throw new Error(daAna.estado);
    expect(daAna.recebidos.map((p) => p.apelido)).toEqual(["Bia"]);
    await amb.db.insert(studyDay).values([
      { userId: ana, localDate: HOJE, blocks: 1 },
      { userId: bia, localDate: HOJE, blocks: 2 },
    ]);
    await responderPedido(amb.db, ana, daAna.recebidos[0].id, true, AGORA);
    const r = await minhasDuplas(amb.db, bia, AGORA);
    if (r.estado !== "pronto") throw new Error(r.estado);
    expect(r.duplas).toEqual([
      {
        id: daAna.recebidos[0].id,
        apelido: "Ana",
        dias: 1,
        recorde: 1,
        voceHoje: true,
        outroHoje: true,
      },
    ]);
    expect(Object.keys(r.duplas[0]).sort()).toEqual([
      "apelido",
      "dias",
      "id",
      "outroHoje",
      "recorde",
      "voceHoje",
    ]);
  });

  test("recusar: o pedido some sem aviso; até 5 duplas ativas", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const { codigo } = await criarConvite(amb.db, ana, AGORA);
    await pedirDupla(amb.db, bia, codigo, AGORA);
    const r = await minhasDuplas(amb.db, ana, AGORA);
    if (r.estado !== "pronto") throw new Error(r.estado);
    await responderPedido(amb.db, ana, r.recebidos[0].id, false, AGORA);
    const daBia = await minhasDuplas(amb.db, bia, AGORA);
    expect(daBia).toMatchObject({ estado: "pronto", enviados: [], duplas: [], encerradas: [] });

    for (let i = 0; i < 5; i++) await dupla(ana, await conta(`Amigo${i}`));
    const extra = await conta("Extra");
    const c = await criarConvite(amb.db, extra, AGORA);
    expect(await abrirConvite(amb.db, ana, c.codigo, AGORA)).toEqual({ estado: "limite" });
    await expect(pedirDupla(amb.db, ana, c.codigo, AGORA)).rejects.toMatchObject({
      codigo: "LIMITE_DE_DUPLAS",
    });
  });

  test("até 10 convites abertos", async () => {
    const ana = await conta("Ana");
    for (let i = 0; i < 10; i++) await criarConvite(amb.db, ana, AGORA);
    await expect(criarConvite(amb.db, ana, AGORA)).rejects.toMatchObject({
      codigo: "LIMITE_DE_CONVITES",
    });
  });
});

describe("sair, bloquear, denunciar e correção de idade", () => {
  test("encerrar: qualquer lado; o outro vê só o aviso neutro, sem apelido", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const id = await dupla(ana, bia);
    await encerrarDupla(amb.db, bia, id, AGORA);
    const r = await minhasDuplas(amb.db, ana, AGORA);
    expect(r).toMatchObject({ estado: "pronto", duplas: [], encerradas: [{ id }] });
    expect(JSON.stringify(r.estado === "pronto" && r.encerradas)).not.toContain("Bia");
  });

  test("bloqueio nos dois sentidos: encerra e impede convites e pedidos; desbloquear libera", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const id = await dupla(ana, bia);
    await bloquear(amb.db, ana, id, AGORA);
    expect(await minhasDuplas(amb.db, bia, AGORA)).toMatchObject({ duplas: [] });
    const daBia = await criarConvite(amb.db, bia, AGORA);
    expect(await abrirConvite(amb.db, ana, daBia.codigo, AGORA)).toEqual({
      estado: "indisponivel",
    });
    const daAna = await criarConvite(amb.db, ana, AGORA);
    expect(await abrirConvite(amb.db, bia, daAna.codigo, AGORA)).toEqual({
      estado: "indisponivel",
    });
    await expect(pedirDupla(amb.db, bia, daAna.codigo, AGORA)).rejects.toMatchObject({
      codigo: "CONVITE_INDISPONIVEL",
    });

    const r = await minhasDuplas(amb.db, ana, AGORA);
    if (r.estado !== "pronto") throw new Error(r.estado);
    expect(r.bloqueados.map((b) => b.apelido)).toEqual(["Bia"]);
    await desbloquear(amb.db, ana, r.bloqueados[0].ref, AGORA);
    expect(await abrirConvite(amb.db, bia, daAna.codigo, AGORA)).toEqual({
      estado: "disponivel",
      apelido: "Ana",
    });
  });

  test("denúncia: oculta o apelido e entra na fila; 'parece menor' suspende as funções sociais do denunciado", async () => {
    const ana = await conta("Ana");
    const bia = await conta("BiaSuspeita");
    const id = await dupla(ana, bia);
    await denunciar(amb.db, ana, { id, motivo: "menor" }, AGORA);
    expect(
      await amb.db.select({ motivo: denuncia.motivo, contexto: denuncia.contexto }).from(denuncia),
    ).toEqual([{ motivo: "menor", contexto: "amigos" }]);
    expect(await minhasDuplas(amb.db, bia, AGORA)).toEqual({ estado: "suspenso" });
    await expect(criarConvite(amb.db, bia, AGORA)).rejects.toMatchObject({
      codigo: "SOCIAL_SUSPENSO",
    });
    expect(await meuRanking(amb.db, bia, AGORA)).toEqual({ estado: "suspenso" });
    // Quem denunciou deixa de ver a dupla com a conta suspensa; ela ainda pode sair.
    expect(await minhasDuplas(amb.db, ana, AGORA)).toMatchObject({ duplas: [] });
    await encerrarDupla(amb.db, bia, id, AGORA);
  });

  test("correção de idade para menor: encerra duplas, pedidos e convites e tira da liga na hora", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const caio = await conta("Caio");
    await dupla(ana, bia);
    const pendente = await criarConvite(amb.db, caio, AGORA);
    await pedirDupla(amb.db, ana, pendente.codigo, AGORA);
    const aberto = await criarConvite(amb.db, ana, AGORA);

    await amb.db.update(user).set({ birthYear: 2010 }).where(eq(user.id, ana));
    await aoCorrigirIdadeParaMenor(amb.db, ana, AGORA);
    expect(await minhasDuplas(amb.db, bia, AGORA)).toMatchObject({
      estado: "pronto",
      duplas: [],
      encerradas: [{}],
    });
    expect(await minhasDuplas(amb.db, caio, AGORA)).toMatchObject({ recebidos: [] });
    expect(await abrirConvite(amb.db, caio, aberto.codigo, AGORA)).toEqual({
      estado: "indisponivel",
    });
    expect((await amb.db.select().from(amizade)).every((a) => a.estado === "encerrada")).toBe(true);
    expect(
      (
        await amb.db.select().from(rankingParticipante).where(eq(rankingParticipante.userId, ana))
      )[0].saiuEm,
    ).not.toBeNull();
  });
});

describe("isolamento e dados", () => {
  test("B não lê nem altera as duplas de A com C", async () => {
    const ana = await conta("Ana");
    const caio = await conta("Caio");
    const bia = await conta("Bia");
    const id = await dupla(ana, caio);
    expect(await minhasDuplas(amb.db, bia, AGORA)).toMatchObject({
      estado: "pronto",
      duplas: [],
      recebidos: [],
      enviados: [],
    });
    await expect(encerrarDupla(amb.db, bia, id, AGORA)).rejects.toMatchObject({
      codigo: "DUPLA_INEXISTENTE",
    });
    await expect(bloquear(amb.db, bia, id, AGORA)).rejects.toMatchObject({
      codigo: "DUPLA_INEXISTENTE",
    });
    await expect(denunciar(amb.db, bia, { id, motivo: "apelido" }, AGORA)).rejects.toMatchObject({
      codigo: "DUPLA_INEXISTENTE",
    });
    await expect(responderPedido(amb.db, bia, id, true, AGORA)).rejects.toMatchObject({
      codigo: "PEDIDO_INEXISTENTE",
    });
    expect((await amb.db.select().from(amizade))[0].estado).toBe("ativa");
  });

  test("exportação: duplas, bloqueios e denúncias próprios, sem id nem apelido de outra conta", async () => {
    const ana = await conta("Ana");
    const bia = await conta("BiaOutra");
    const id = await dupla(ana, bia);
    await denunciar(amb.db, ana, { id, motivo: "apelido" }, AGORA);
    await bloquear(amb.db, ana, id, AGORA);
    const dados = await exportarDadosDoAluno(amb.db, ana, AGORA);
    expect(dados.duplas).toHaveLength(1);
    expect(dados.bloqueios).toHaveLength(1);
    expect(dados.denunciasFeitas).toEqual([
      { contexto: "amigos", motivo: "apelido", em: expect.any(Date), resolvidaEm: null },
    ]);
    const texto = JSON.stringify({ d: dados.duplas, b: dados.bloqueios, x: dados.denunciasFeitas });
    expect(texto).not.toContain(bia);
    expect(texto).not.toContain("BiaOutra");
    expect((await exportarDadosDoAluno(amb.db, bia, AGORA)).denunciasFeitas).toEqual([]);
  });

  test("retenção: dupla encerrada 30 dias, convite 7, denúncia resolvida 90; apelido com dupla ativa fica", async () => {
    const ana = await conta("Ana");
    const bia = await conta("Bia");
    const caio = await conta("Caio");
    const ativa = await dupla(ana, bia);
    const fim = await dupla(ana, caio);
    await encerrarDupla(amb.db, caio, fim, AGORA);
    await denunciar(amb.db, ana, { id: ativa, motivo: "outro" }, AGORA);
    await amb.db.update(denuncia).set({ resolvidaEm: AGORA });
    await criarConvite(amb.db, ana, AGORA);
    // Ana só tem o apelido dos amigos (saiu_em preenchido): com dupla ativa, a linha fica.
    const r = await aplicarRetencao(amb.db, new Date(AGORA.getTime() + 91 * DIA));
    expect(r.social).toBeGreaterThanOrEqual(3);
    expect((await amb.db.select().from(amizade)).map((a) => a.id)).toEqual([ativa]);
    expect(await amb.db.select().from(conviteAmizade)).toHaveLength(0);
    expect(await amb.db.select().from(denuncia)).toHaveLength(0);
    const apelidos = (await amb.db.select().from(rankingParticipante)).map((p) => p.apelido).sort();
    expect(apelidos).toEqual(["Ana", "Bia"]);
  });
});
