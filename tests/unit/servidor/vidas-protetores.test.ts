/**
 * Vidas do Free e protetores por plano no servidor (spec 49 T-49.5.1, T-49.7.1, T-49.7.2; RF-5, RF-7, RF-10).
 * No ambiente de teste (local), as vidas ligam só para contas `e2e-vidas…` (ou com `VIDAS_HABILITADO`).
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { eventoEstudo, type EventoEstudo } from "../../../src/lib/sync/contrato";
import { assinatura } from "../../../src/server/db/schema";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { agregadoDoAluno, aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { bonusDasAssinaturas, creditarCompraDeProtetores, estornarCompraDeProtetores } from "../../../src/server/planos/protetores";
import { ganharVidaPorAnuncio } from "../../../src/server/vidas/vidas";
import { sequenciaDosDias, SEQUENCIA_INICIAL } from "../../../src/lib/recompensas";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00-03:00");
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
const id = () => randomUUID().replaceAll("-", "");
let amb: Ambiente;
let certa: number;

function resposta(r: number | null, fonte: string): EventoEstudo {
  return eventoEstudo.parse({ tipo: "resposta", id: id(), itemId: "q1", resposta: r, fonte, ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
}

beforeEach(async () => {
  amb = await ambiente();
  const ex = await exercicioDoItem("q1");
  if (!ex || ex.type !== "multipla-escolha") throw new Error("q1 deveria ser múltipla escolha");
  certa = ex.correta;
});

describe("vidas (Free)", () => {
  test("desligadas por padrão: o agregado não traz vidas", async () => {
    const { userId } = await alunoVerificado(amb, "sem-vidas@foca.dev");
    const r = await aplicarEventos(amb.db, userId, [resposta((certa + 1) % 4, "licao")], AGORA);
    expect(r.agregado.vidas).toBeNull();
  });

  test("erro em lição custa 1; 'Não sei', nivelamento e checagem não; zera em 0 e a resposta nunca é recusada", async () => {
    const { userId } = await alunoVerificado(amb, "e2e-vidas-a@foca.dev");
    const errada = (certa + 1) % 4;
    let r = await aplicarEventos(amb.db, userId, [resposta(null, "licao"), resposta(errada, "nivelamento"), resposta(errada, "checagem"), resposta(certa, "licao")], AGORA);
    expect(r.agregado.vidas).toEqual({ dia: HOJE, restantes: 5, anuncioUsado: false });
    r = await aplicarEventos(amb.db, userId, [resposta(errada, "licao"), resposta(errada, "atividade"), resposta(errada, "questao-geral")], AGORA);
    expect(r.agregado.vidas?.restantes).toBe(2);
    r = await aplicarEventos(amb.db, userId, [resposta(errada, "licao"), resposta(errada, "licao"), resposta(errada, "licao")], AGORA);
    expect(r.aplicados.length).toBe(3);
    expect(r.rejeitados.length).toBe(0);
    expect(r.agregado.vidas?.restantes).toBe(0);
  });

  test("anúncio dá +1 uma vez por dia (servidor decide)", async () => {
    const { userId } = await alunoVerificado(amb, "e2e-vidas-b@foca.dev");
    const errada = (certa + 1) % 4;
    await aplicarEventos(amb.db, userId, Array.from({ length: 5 }, () => resposta(errada, "licao")), AGORA);
    const um = await ganharVidaPorAnuncio(amb.db, userId, HOJE);
    expect(um).toMatchObject({ ok: true, vidas: { restantes: 1, anuncioUsado: true } });
    const dois = await ganharVidaPorAnuncio(amb.db, userId, HOJE);
    expect(dois.ok).toBe(false);
    expect(dois.vidas.restantes).toBe(1);
  });

  test("quem paga não tem vidas", async () => {
    const { userId } = await alunoVerificado(amb, "e2e-vidas-pro@foca.dev");
    await amb.db.insert(assinatura).values({
      id: randomUUID(), userId, provedor: "teste", origem: "web", idExterno: randomUUID(), produto: "pro_mensal", plano: "pro", estado: "ativa",
      inicio: new Date(AGORA.getTime() - 86_400_000), validoAte: new Date(AGORA.getTime() + 20 * 86_400_000),
    });
    const r = await aplicarEventos(amb.db, userId, [resposta((certa + 1) % 4, "licao")], AGORA);
    expect(r.agregado.vidas).toBeNull();
    expect(r.agregado.plano).toBe("pro");
    expect(r.agregado.protetoresMax).toBe(7);
  });
});

describe("protetores", () => {
  test("cada protetor cobre um dia parado; dois dias parados pedem dois", () => {
    const dias = ["2026-10-01", "2026-10-02", "2026-10-05"]; // parou dias 3 e 4
    const sem = sequenciaDosDias(dias); // começa com 1 protetor: não basta
    expect(sem.sequencia).toBe(1);
    const com = sequenciaDosDias(dias, SEQUENCIA_INICIAL, { creditos: [{ dia: "2026-10-02", quantidade: 1 }], estoqueMax: 4 });
    expect(com.sequencia).toBe(3);
    expect(com.diaProtegido).toBe("2026-10-04");
    expect(com.congelamentos).toBe(0);
  });

  test("teto do plano: compra não passa do teto; estoque acima do teto (de plano anterior) não é tirado", () => {
    expect(sequenciaDosDias([], SEQUENCIA_INICIAL, { creditos: [{ dia: "2026-10-01", quantidade: 7 }], estoqueMax: 4 }).congelamentos).toBe(4);
    const alto = { ...SEQUENCIA_INICIAL, congelamentos: 6 };
    expect(sequenciaDosDias([], alto, { creditos: [{ dia: "2026-10-01", quantidade: 1 }], estoqueMax: 2 }).congelamentos).toBe(6);
    expect(sequenciaDosDias([], alto, { creditos: [{ dia: "2026-10-01", quantidade: -10 }], estoqueMax: 2 }).congelamentos).toBe(0);
  });

  test("bônus mensal derivado da assinatura: Basic +2 por mês enquanto valia; reembolsada não dá", () => {
    const inicio = new Date("2026-08-15T12:00:00Z");
    const ate = new Date("2026-11-15T12:00:00Z");
    const b = bonusDasAssinaturas([{ plano: "basic", estado: "ativa", inicio, validoAte: ate }], new Date("2026-10-20T12:00:00Z"));
    expect(b).toEqual([
      { dia: "2026-08-15", quantidade: 2 },
      { dia: "2026-09-15", quantidade: 2 },
      { dia: "2026-10-15", quantidade: 2 },
    ]);
    expect(bonusDasAssinaturas([{ plano: "pro", estado: "reembolsada", inicio, validoAte: ate }], new Date("2026-10-20T12:00:00Z"))).toEqual([]);
  });

  test("compra creditada uma vez (idempotente) e estorno tira; o agregado mostra o estoque", async () => {
    const { userId } = await alunoVerificado(amb, "prot@foca.dev");
    await creditarCompraDeProtetores(amb.db, userId, "c1", 3, HOJE);
    await creditarCompraDeProtetores(amb.db, userId, "c1", 3, HOJE);
    let ag = await agregadoDoAluno(amb.db, userId, AGORA);
    expect(ag.congelamentos).toBe(2); // 1 inicial + 3 comprados, teto do Free 2
    await estornarCompraDeProtetores(amb.db, userId, "c1", 3, HOJE);
    ag = await agregadoDoAluno(amb.db, userId, AGORA);
    expect(ag.congelamentos).toBe(0);
  });
});
