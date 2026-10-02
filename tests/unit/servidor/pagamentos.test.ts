/**
 * Pagamentos (spec 49 T-49.3.1, T-49.3.3; RF-1, RF-3; segurança L3). Banco PGlite real e provedor falso; o adaptador
 * do Asaas é testado com `fetch` simulado.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { assinatura, cobranca, compra } from "../../../src/server/db/schema";
import { criarAsaas, eventoDoAsaas, statusDaCobranca } from "../../../src/server/pagamentos/asaas";
import { alterarCobrancaFalsa, provedorFalso, simularPagamento } from "../../../src/server/pagamentos/falso";
import { processarAssinatura, processarEvento } from "../../../src/server/pagamentos/processar";
import { registrarEProcessar, tokenValido } from "../../../src/server/pagamentos/webhook";
import { planoDoAluno } from "../../../src/server/planos/plano";
import type { CodigoProduto } from "../../../src/lib/planos";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00Z");
const DIA = 86_400_000;
let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

async function comprar(userId: string, produto: CodigoProduto, metodo: "cartao" | "pix" = "cartao"): Promise<string> {
  const id = randomUUID();
  const { checkoutId } = await provedorFalso.criarCheckout({ compraId: id, produto, metodo, urls: { sucesso: "/", cancelado: "/", expirado: "/" } });
  await amb.db.insert(compra).values({ id, userId, produto, provedor: "teste", checkoutId, declarouMaioridadeEm: AGORA });
  return id;
}

const evento = (cobrancaId: string, tipo = "PAYMENT_CONFIRMED") => ({ id: `evt_${randomUUID()}`, tipo, cobrancaId, assinaturaId: null, checkoutId: null });

describe("máquina de estados", () => {
  test("pagamento aprovado do Basic mensal libera o plano por um mês, com 7 dias de arrependimento", async () => {
    const { userId } = await alunoVerificado(amb, "pag-basic@foca.dev");
    const compraId = await comprar(userId, "basic_mensal");
    const sim = simularPagamento(compraId, "aprovado", AGORA)!;
    expect(await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId), AGORA)).toBe("processado");
    expect(await planoDoAluno(amb.db, userId, AGORA)).toBe("basic");
    const [a] = await amb.db.select().from(assinatura).where(eq(assinatura.userId, userId));
    expect(a.estado).toBe("ativa");
    expect(Math.round((a.validoAte!.getTime() - AGORA.getTime()) / DIA)).toBeGreaterThanOrEqual(31);
    expect(Math.round((a.reembolsavelAte!.getTime() - AGORA.getTime()) / DIA)).toBe(7);
    const [c] = await amb.db.select().from(compra).where(eq(compra.id, compraId));
    expect(c.estado).toBe("paga");
  });

  test("evento repetido não tem segundo efeito", async () => {
    const { userId } = await alunoVerificado(amb, "pag-rep@foca.dev");
    const sim = simularPagamento(await comprar(userId, "pro_mensal"), "aprovado", AGORA)!;
    const ev = evento(sim.cobrancaId);
    expect(await registrarEProcessar(amb.db, provedorFalso, ev, AGORA)).toBe("processado");
    expect(await registrarEProcessar(amb.db, provedorFalso, ev, AGORA)).toBe("repetido");
    expect((await amb.db.select().from(cobranca).where(eq(cobranca.userId, userId))).length).toBe(1);
    expect((await amb.db.select().from(assinatura).where(eq(assinatura.userId, userId))).length).toBe(1);
  });

  test("fora de ordem: reembolso antes do pagamento atrasado termina reembolsado (sem plano)", async () => {
    const { userId } = await alunoVerificado(amb, "pag-ordem@foca.dev");
    const sim = simularPagamento(await comprar(userId, "pro_mensal"), "aprovado", AGORA)!;
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId), AGORA);
    alterarCobrancaFalsa(sim.cobrancaId, { status: "reembolsada" });
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId, "PAYMENT_REFUNDED"), AGORA);
    alterarCobrancaFalsa(sim.cobrancaId, { status: "paga" }); // um "confirmado" velho chegando depois
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId), AGORA);
    expect(await planoDoAluno(amb.db, userId, AGORA)).toBe("gratis");
  });

  test("cobrança sem compra conhecida não libera nada", async () => {
    const { userId } = await alunoVerificado(amb, "pag-sem@foca.dev");
    const compraId = await comprar(userId, "pro_mensal");
    const sim = simularPagamento(compraId, "aprovado", AGORA)!;
    alterarCobrancaFalsa(sim.cobrancaId, { referencia: "compra-que-nao-existe", checkoutId: "outro", assinaturaId: null });
    expect(await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId), AGORA)).toBe("sem-compra");
    expect(await planoDoAluno(amb.db, userId, AGORA)).toBe("gratis");
  });

  test("valor abaixo do produto não libera (preço vem do catálogo)", async () => {
    const { userId } = await alunoVerificado(amb, "pag-valor@foca.dev");
    const sim = simularPagamento(await comprar(userId, "pro_mensal"), "aprovado", AGORA)!;
    alterarCobrancaFalsa(sim.cobrancaId, { valorCentavos: 100 });
    expect(await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId), AGORA)).toBe("valor-divergente");
    expect(await planoDoAluno(amb.db, userId, AGORA)).toBe("gratis");
  });

  test("atraso mantém o plano até o fim do período; cancelada no provedor vale até o fim e depois cai", async () => {
    const { userId } = await alunoVerificado(amb, "pag-atraso@foca.dev");
    const sim = simularPagamento(await comprar(userId, "basic_mensal"), "aprovado", AGORA)!;
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId), AGORA);
    alterarCobrancaFalsa(sim.cobrancaId, { status: "atrasada" });
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId, "PAYMENT_OVERDUE"), AGORA);
    expect(await planoDoAluno(amb.db, userId, AGORA)).toBe("basic");
    await provedorFalso.cancelarAssinatura(sim.assinaturaId!);
    expect(await processarAssinatura(amb.db, provedorFalso, sim.assinaturaId!, AGORA)).toBe("processado");
    const [a] = await amb.db.select().from(assinatura).where(eq(assinatura.userId, userId));
    expect(a.estado).toBe("cancelada");
    expect(await planoDoAluno(amb.db, userId, AGORA)).toBe("basic");
    expect(await planoDoAluno(amb.db, userId, new Date(AGORA.getTime() + 40 * DIA))).toBe("gratis");
  });

  test("Pix anual (pagamento único, sem assinatura no provedor) vale 12 meses", async () => {
    const { userId } = await alunoVerificado(amb, "pag-pix@foca.dev");
    const sim = simularPagamento(await comprar(userId, "pro_anual", "pix"), "aprovado", AGORA)!;
    expect(sim.assinaturaId).toBeNull();
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId, "PAYMENT_RECEIVED"), AGORA);
    expect(await planoDoAluno(amb.db, userId, new Date(AGORA.getTime() + 360 * DIA))).toBe("pro");
    expect(await planoDoAluno(amb.db, userId, new Date(AGORA.getTime() + 370 * DIA))).toBe("gratis");
  });

  test("compra de um aluno nunca vira plano de outro", async () => {
    const ana = await alunoVerificado(amb, "pag-ana@foca.dev");
    const bia = await alunoVerificado(amb, "pag-bia@foca.dev");
    const sim = simularPagamento(await comprar(ana.userId, "pro_mensal"), "aprovado", AGORA)!;
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId), AGORA);
    expect(await planoDoAluno(amb.db, ana.userId, AGORA)).toBe("pro");
    expect(await planoDoAluno(amb.db, bia.userId, AGORA)).toBe("gratis");
  });
});

describe("webhook e adaptador do Asaas", () => {
  test("token: tempo constante, errado ou sem configuração recusa", () => {
    expect(tokenValido("abc", "abc")).toBe(true);
    expect(tokenValido("abd", "abc")).toBe(false);
    expect(tokenValido(null, "abc")).toBe(false);
    expect(tokenValido("abc", undefined)).toBe(false);
  });

  test("evento normalizado só com ids e tipo", () => {
    expect(eventoDoAsaas({ id: "evt_1", event: "PAYMENT_CONFIRMED", payment: { id: "pay_1", value: 1, customer: "cus_x" } })).toEqual({
      id: "evt_1",
      tipo: "PAYMENT_CONFIRMED",
      cobrancaId: "pay_1",
      assinaturaId: null,
      checkoutId: null,
    });
    expect(eventoDoAsaas({ event: "X" })).toBeNull();
    expect(eventoDoAsaas("lixo")).toBeNull();
  });

  test("status das cobranças: desconhecido nunca libera", () => {
    expect(statusDaCobranca("CONFIRMED")).toBe("paga");
    expect(statusDaCobranca("RECEIVED")).toBe("paga");
    expect(statusDaCobranca("OVERDUE")).toBe("atrasada");
    expect(statusDaCobranca("REFUNDED")).toBe("reembolsada");
    expect(statusDaCobranca("CHARGEBACK_REQUESTED")).toBe("estornada");
    expect(statusDaCobranca("ALGO_NOVO")).toBe("pendente");
  });

  test("checkout: cartão mensal é recorrente com o preço do catálogo e a referência da compra; chave só no cabeçalho", async () => {
    const pedidos: { url: string; init: RequestInit }[] = [];
    const fetcher = (async (url: string, init: RequestInit) => {
      pedidos.push({ url, init });
      return new Response(JSON.stringify({ id: "chk_1", link: "https://sandbox.asaas.com/checkoutSession/show/chk_1" }), { status: 200 });
    }) as unknown as typeof fetch;
    const p = criarAsaas("https://api-sandbox.asaas.com/v3", "chave-secreta", fetcher);
    const r = await p.criarCheckout({ compraId: "compra-1", produto: "basic_mensal", metodo: "cartao", urls: { sucesso: "https://x/ok", cancelado: "https://x/c", expirado: "https://x/e" } });
    expect(r).toEqual({ checkoutId: "chk_1", link: "https://sandbox.asaas.com/checkoutSession/show/chk_1" });
    const corpo = JSON.parse(String(pedidos[0].init.body));
    expect(pedidos[0].url).toBe("https://api-sandbox.asaas.com/v3/checkouts");
    expect(corpo.chargeTypes).toEqual(["RECURRENT"]);
    expect(corpo.subscription.cycle).toBe("MONTHLY");
    expect(corpo.items[0].value).toBe(24.9);
    expect(corpo.externalReference).toBe("compra-1");
    expect((pedidos[0].init.headers as Record<string, string>).access_token).toBe("chave-secreta");
    expect(String(pedidos[0].init.body)).not.toContain("chave-secreta");

    await p.criarCheckout({ compraId: "compra-2", produto: "pro_anual", metodo: "pix", urls: { sucesso: "a", cancelado: "b", expirado: "c" } });
    const pix = JSON.parse(String(pedidos[1].init.body));
    expect(pix.chargeTypes).toEqual(["DETACHED"]);
    expect(pix.billingTypes).toEqual(["PIX"]);
    expect(pix.items[0].value).toBe(329.9);
  });
});

describe("ações do aluno", () => {
  const BASE = "http://localhost:8080";
  const acoes = () => import("../../../src/server/pagamentos/acoes");
  const caixa = () => import("../../../src/server/email");

  async function assinarPago(userId: string, produto: CodigoProduto, quando = AGORA) {
    const { iniciarCheckout } = await acoes();
    const { compraId } = await iniciarCheckout(amb.db, provedorFalso, userId, { produto, metodo: "cartao" }, BASE, quando);
    const sim = simularPagamento(compraId, "aprovado", quando)!;
    await registrarEProcessar(amb.db, provedorFalso, evento(sim.cobrancaId), quando);
    return { compraId, sim };
  }

  test("checkout: só assinatura, Pix só no anual, sem assinar o mesmo plano duas vezes", async () => {
    const { iniciarCheckout } = await acoes();
    const { userId } = await alunoVerificado(amb, "acao-checkout@foca.dev");
    await expect(iniciarCheckout(amb.db, provedorFalso, userId, { produto: "protetor_3", metodo: "pix" }, BASE, AGORA)).rejects.toMatchObject({ codigo: "PRODUTO_INDISPONIVEL" });
    await expect(iniciarCheckout(amb.db, provedorFalso, userId, { produto: "basic_mensal", metodo: "pix" }, BASE, AGORA)).rejects.toMatchObject({ codigo: "METODO_INDISPONIVEL" });
    const r = await iniciarCheckout(amb.db, provedorFalso, userId, { produto: "basic_mensal", metodo: "cartao" }, BASE, AGORA);
    expect(r.link).toContain(`compra=${r.compraId}`);
    const [c] = await amb.db.select().from(compra).where(eq(compra.id, r.compraId));
    expect(c.checkoutId).toBeTruthy();
    expect(c.declarouMaioridadeEm).toBeTruthy();
    await registrarEProcessar(amb.db, provedorFalso, evento(simularPagamento(r.compraId, "aprovado", AGORA)!.cobrancaId), AGORA);
    await expect(iniciarCheckout(amb.db, provedorFalso, userId, { produto: "basic_anual", metodo: "pix" }, BASE, AGORA)).rejects.toMatchObject({ codigo: "JA_ASSINANTE" });
    // Subir para o Pro continua possível.
    await expect(iniciarCheckout(amb.db, provedorFalso, userId, { produto: "pro_mensal", metodo: "cartao" }, BASE, AGORA)).resolves.toBeTruthy();
  });

  test("recibo vai uma vez por cobrança paga", async () => {
    const { limparCaixaDeSaida, caixaDeSaida } = await caixa();
    limparCaixaDeSaida();
    const { userId } = await alunoVerificado(amb, "acao-recibo@foca.dev");
    const { sim } = await assinarPago(userId, "pro_mensal");
    await processarEvento(amb.db, provedorFalso, evento(sim.cobrancaId, "PAYMENT_RECEIVED"), AGORA);
    expect(caixaDeSaida().filter((m) => m.para === "acao-recibo@foca.dev" && m.assunto.startsWith("Pagamento confirmado")).length).toBe(1);
  });

  test("cancelar: não renova, vale até o fim do período, manda e-mail", async () => {
    const { cancelarAssinatura, meuPlano } = await acoes();
    const { caixaDeSaida } = await caixa();
    const { userId } = await alunoVerificado(amb, "acao-cancela@foca.dev");
    await assinarPago(userId, "basic_mensal");
    await cancelarAssinatura(amb.db, provedorFalso, userId, BASE, AGORA);
    const m = await meuPlano(amb.db, userId, AGORA);
    expect(m.plano).toBe("basic");
    expect(m.assinatura?.estado).toBe("cancelada");
    expect(m.assinatura?.renova).toBe(false);
    expect(caixaDeSaida().some((x) => x.para === "acao-cancela@foca.dev" && x.assunto === "Assinatura cancelada")).toBe(true);
    await expect(cancelarAssinatura(amb.db, provedorFalso, userId, BASE, AGORA)).rejects.toMatchObject({ codigo: "SEM_ASSINATURA_ATIVA" });
  });

  test("reembolso: integral nos 7 dias, volta ao Free; fora do prazo, não; segundo em 90 dias, pelo suporte", async () => {
    const { pedirReembolso, meuPlano } = await acoes();
    const { userId } = await alunoVerificado(amb, "acao-reembolso@foca.dev");
    await assinarPago(userId, "pro_mensal");
    await pedirReembolso(amb.db, provedorFalso, userId, BASE, new Date(AGORA.getTime() + 3 * DIA));
    expect((await meuPlano(amb.db, userId, AGORA)).plano).toBe("gratis");

    const depois = new Date(AGORA.getTime() + 10 * DIA);
    await assinarPago(userId, "pro_mensal", depois);
    await expect(pedirReembolso(amb.db, provedorFalso, userId, BASE, depois)).rejects.toMatchObject({ codigo: "REEMBOLSO_PELO_SUPORTE" });

    const outro = await alunoVerificado(amb, "acao-prazo@foca.dev");
    await assinarPago(outro.userId, "basic_mensal");
    await expect(pedirReembolso(amb.db, provedorFalso, outro.userId, BASE, new Date(AGORA.getTime() + 8 * DIA))).rejects.toMatchObject({ codigo: "FORA_DO_PRAZO" });
  });

  test("estado de compra de outro aluno: 404", async () => {
    const { iniciarCheckout, estadoDaCompra } = await acoes();
    const ana = await alunoVerificado(amb, "acao-ana@foca.dev");
    const bia = await alunoVerificado(amb, "acao-bia@foca.dev");
    const { compraId } = await iniciarCheckout(amb.db, provedorFalso, ana.userId, { produto: "pro_mensal", metodo: "cartao" }, BASE, AGORA);
    expect((await estadoDaCompra(amb.db, ana.userId, compraId, AGORA)).estado).toBe("aberta");
    await expect(estadoDaCompra(amb.db, bia.userId, compraId, AGORA)).rejects.toMatchObject({ codigo: "COMPRA_INEXISTENTE" });
  });
});
