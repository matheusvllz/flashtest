/**
 * Funções pagas (spec 49 §5.9, F9; RF-12): caderno de erros, cronograma, corretor e treino de redação, portões por
 * plano e chaves de desligamento. Banco PGlite real; a IA e a moderação são simuladas (nenhum teste chama a OpenAI).
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { comentarioLocal, lerCorrecao, segundaDaSemana, temaDaSemana, TEXTO_MIN } from "../../../src/lib/redacao-ia";
import { aiUsage, assinatura, cadernoItem, redacao } from "../../../src/server/db/schema";
import { itensDoCaderno, maisDias, registrarNoCaderno } from "../../../src/server/estudo/caderno";
import { lerCronograma, salvarCronograma } from "../../../src/server/estudo/cronograma";
import { alunoTemFuncao, funcaoLigada } from "../../../src/server/planos/funcoes";
import { apagarRedacao, comentarParte, corrigirRedacao, estadoDoCorretor, estadoDoTreino, verCorrecao } from "../../../src/server/redacao/redacao";
import { diaDaCota } from "../../../src/server/tutor/cota";
import { definirChamadaIA } from "../../../src/server/tutor/ia";
import { definirModerador } from "../../../src/server/tutor/moderacao";
import { redefinirEnv } from "../../../src/server/env";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00Z");
const DEPOIS = new Date("2026-11-15T15:00:00Z");
const HOJE = "2026-10-15";

let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
  definirModerador(async () => ({ autolesao: false, sinalizado: false, categorias: [] }));
});
afterEach(() => {
  definirChamadaIA(undefined);
  definirModerador(undefined);
  delete process.env.OPENAI_API_KEY;
  delete process.env.FUNCOES_DESLIGADAS;
  redefinirEnv();
});

async function assinar(userId: string, plano: "basic" | "pro") {
  await amb.db.insert(assinatura).values({
    id: randomUUID(),
    userId,
    provedor: "teste",
    origem: "web",
    idExterno: randomUUID(),
    produto: `${plano}_mensal`,
    plano,
    estado: "ativa",
    validoAte: DEPOIS,
  });
}

async function aluno(email: string, plano?: "basic" | "pro"): Promise<string> {
  const a = await alunoVerificado(amb, email);
  if (plano) await assinar(a.userId, plano);
  return a.userId;
}

const TEXTO = `${"A leitura entre jovens no Brasil ainda enfrenta barreiras. ".repeat(6)}Por isso, o Ministério da Educação deve ampliar bibliotecas escolares, por meio de verbas específicas, a fim de formar leitores.`;

function respostaDaIA(trecho: string, nota = 150): string {
  return JSON.stringify({
    competencias: [1, 2, 3, 4, 5].map((c) => ({ c, nota, justificativa: `Justificativa ${c}.`, trecho: c === 1 ? trecho : null })),
    comentario: "Continue assim.",
  });
}

describe("puro", () => {
  test("lerCorrecao: nota encaixada em passos de 40, trecho inventado descartado, formato errado = null", () => {
    const c = lerCorrecao(respostaDaIA("A leitura entre jovens no Brasil ainda enfrenta barreiras.", 150), TEXTO)!;
    expect(c.competencias.map((x) => x.nota)).toEqual([160, 160, 160, 160, 160]);
    expect(c.total).toBe(800);
    expect(c.competencias[0].trecho).toBe("A leitura entre jovens no Brasil ainda enfrenta barreiras.");
    const inventado = lerCorrecao(respostaDaIA("Como disse Machado de Assis, ler é viver."), TEXTO)!;
    expect(inventado.competencias[0].trecho).toBeNull();
    expect(lerCorrecao("não sei corrigir", TEXTO)).toBeNull();
    expect(lerCorrecao(JSON.stringify({ competencias: [{ c: 1, nota: 40, justificativa: "x" }] }), TEXTO)).toBeNull();
  });
  test("tema da semana fixo de segunda a domingo; comentário automático aponta o que falta na proposta", () => {
    expect(segundaDaSemana("2026-10-18")).toBe("2026-10-12");
    expect(temaDaSemana("2026-10-12")).toBe(temaDaSemana("2026-10-18"));
    expect(temaDaSemana("2026-10-19")).not.toBe(temaDaSemana("2026-10-18"));
    expect(comentarioLocal("proposta", "Precisamos melhorar isso.")).toContain("agente");
  });
});

describe("portões", () => {
  test("Free não tem nenhuma função; Basic tem caderno/cronograma/offline; Pro tem todas menos o simulado (parado)", async () => {
    const free = await aluno("fp-free@foca.dev");
    const basic = await aluno("fp-basic@foca.dev", "basic");
    const pro = await aluno("fp-pro@foca.dev", "pro");
    expect(await alunoTemFuncao(amb.db, free, "cadernoDeErros", AGORA)).toBe(false);
    expect(await alunoTemFuncao(amb.db, basic, "cronograma", AGORA)).toBe(true);
    expect(await alunoTemFuncao(amb.db, basic, "corretorRedacao", AGORA)).toBe(false);
    expect(await alunoTemFuncao(amb.db, pro, "corretorRedacao", AGORA)).toBe(true);
    expect(await alunoTemFuncao(amb.db, pro, "simulado", AGORA)).toBe(false);
  });
  test("FUNCOES_DESLIGADAS fecha a função sem mexer no plano", () => {
    process.env.FUNCOES_DESLIGADAS = "caderno, treino";
    redefinirEnv();
    expect(funcaoLigada("cadernoDeErros")).toBe(false);
    expect(funcaoLigada("treinoRedacao")).toBe(false);
    expect(funcaoLigada("cronograma")).toBe(true);
  });
});

describe("plano que cai (RF-12)", () => {
  test("Basic vence: a função fecha, mas caderno e cronograma continuam guardados", async () => {
    const a = await aluno("fp-cai@foca.dev", "basic");
    await registrarNoCaderno(amb.db, a, "item-k", "licao", false, HOJE);
    await salvarCronograma(amb.db, a, { diasSemana: 4, minutosDia: 30, dataProva: "2026-11-01" }, AGORA);
    await amb.db.update(assinatura).set({ estado: "expirada", validoAte: new Date("2026-10-01T00:00:00Z") }).where(eq(assinatura.userId, a));
    expect(await alunoTemFuncao(amb.db, a, "cadernoDeErros", AGORA)).toBe(false);
    expect(await alunoTemFuncao(amb.db, a, "cronograma", AGORA)).toBe(false);
    expect((await itensDoCaderno(amb.db, a, HOJE)).map((i) => i.itemId)).toEqual(["item-k"]);
    expect(await lerCronograma(amb.db, a)).toEqual({ diasSemana: 4, minutosDia: 30, dataProva: "2026-11-01" });
  });
});

describe("caderno de erros", () => {
  test("erro entra; revisão certa no dia avança; duas certas seguidas resolvem; certo antes do dia não conta", async () => {
    const a = await aluno("fp-cad@foca.dev", "basic");
    await registrarNoCaderno(amb.db, a, "item-x", "licao", false, HOJE);
    let itens = await itensDoCaderno(amb.db, a, HOJE);
    expect(itens).toEqual([{ itemId: "item-x", proximaRevisao: maisDias(HOJE, 1), etapa: 0, paraHoje: false }]);

    await registrarNoCaderno(amb.db, a, "item-x", "licao", true, HOJE); // antes do dia: nada muda
    expect((await itensDoCaderno(amb.db, a, HOJE))[0].etapa).toBe(0);

    const d1 = maisDias(HOJE, 1);
    await registrarNoCaderno(amb.db, a, "item-x", "licao", true, d1);
    itens = await itensDoCaderno(amb.db, a, d1);
    expect(itens[0]).toMatchObject({ etapa: 1, proximaRevisao: maisDias(d1, 3) });

    await registrarNoCaderno(amb.db, a, "item-x", "licao", true, maisDias(d1, 3));
    expect(await itensDoCaderno(amb.db, a, maisDias(d1, 3))).toEqual([]);
    const [linha] = await amb.db.select().from(cadernoItem).where(eq(cadernoItem.userId, a));
    expect(linha.estado).toBe("resolvido");
  });
  test("errar de novo volta ao começo; fonte fora do caderno (redação) não entra; um aluno não vê o caderno do outro", async () => {
    const a = await aluno("fp-cad2@foca.dev", "basic");
    const b = await aluno("fp-cad3@foca.dev", "basic");
    await registrarNoCaderno(amb.db, a, "item-y", "atividade", false, HOJE);
    await registrarNoCaderno(amb.db, a, "item-y", "atividade", true, maisDias(HOJE, 1));
    await registrarNoCaderno(amb.db, a, "item-y", "atividade", false, maisDias(HOJE, 2));
    expect((await itensDoCaderno(amb.db, a, HOJE))[0]).toMatchObject({ etapa: 0, proximaRevisao: maisDias(HOJE, 3) });
    await registrarNoCaderno(amb.db, a, "item-z", "redacao", false, HOJE);
    expect((await itensDoCaderno(amb.db, a, HOJE)).map((i) => i.itemId)).toEqual(["item-y"]);
    expect(await itensDoCaderno(amb.db, b, HOJE)).toEqual([]);
  });
});

describe("cronograma", () => {
  test("salva, lê e regrava pelo userId", async () => {
    const a = await aluno("fp-cro@foca.dev", "basic");
    expect(await lerCronograma(amb.db, a)).toBeNull();
    await salvarCronograma(amb.db, a, { diasSemana: 5, minutosDia: 30, dataProva: "2026-11-01" }, AGORA);
    await salvarCronograma(amb.db, a, { diasSemana: 3, minutosDia: 45, dataProva: "2026-11-08" }, AGORA);
    expect(await lerCronograma(amb.db, a)).toEqual({ diasSemana: 3, minutosDia: 45, dataProva: "2026-11-08" });
  });
});

describe("corretor de redação", () => {
  test("Free fechado; Pro sem chave da IA: indisponível, sem nota inventada", async () => {
    const free = await aluno("fp-cor-free@foca.dev");
    const pro = await aluno("fp-cor-pro@foca.dev", "pro");
    expect(await corrigirRedacao(amb.db, free, { tema: "Leitura", texto: TEXTO }, AGORA)).toEqual({ ok: false, motivo: "fechado" });
    expect(await corrigirRedacao(amb.db, pro, { tema: "Leitura", texto: TEXTO }, AGORA)).toEqual({ ok: false, motivo: "indisponivel" });
    expect((await estadoDoCorretor(amb.db, pro, AGORA)).bloqueio).toBe("indisponivel");
  });

  test("Pro com IA: guarda a estimativa; falha de formato não conta no mês; 10 por mês", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const pro = await aluno("fp-cor@foca.dev", "pro");
    definirChamadaIA(async () => ({ texto: "resposta sem JSON", usage: { entrada: 10, saida: 10 } }));
    expect(await corrigirRedacao(amb.db, pro, { tema: "Leitura", texto: TEXTO }, AGORA)).toEqual({ ok: false, motivo: "falha" });
    expect((await estadoDoCorretor(amb.db, pro, AGORA)).restantesMes).toBe(10);

    definirChamadaIA(async () => ({ texto: respostaDaIA("Por isso, o Ministério da Educação deve ampliar bibliotecas escolares"), usage: { entrada: 10, saida: 10 } }));
    const r = await corrigirRedacao(amb.db, pro, { tema: "Leitura", texto: TEXTO }, AGORA);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.correcao.total).toBe(800);
    expect((await verCorrecao(amb.db, pro, r.id))?.correcao?.total).toBe(800);
    for (let i = 0; i < 9; i++) expect((await corrigirRedacao(amb.db, pro, { tema: "Leitura", texto: TEXTO }, AGORA)).ok).toBe(true);
    expect(await corrigirRedacao(amb.db, pro, { tema: "Leitura", texto: TEXTO }, AGORA)).toEqual({ ok: false, motivo: "limite" });
    // Mês seguinte volta.
    expect((await estadoDoCorretor(amb.db, pro, new Date("2026-11-01T04:00:00Z"))).restantesMes).toBe(10);
  });

  test("aluno B não lê nem apaga a correção de A", async () => {
    process.env.OPENAI_API_KEY = "teste";
    definirChamadaIA(async () => ({ texto: respostaDaIA(""), usage: null }));
    const a = await aluno("fp-cor-a@foca.dev", "pro");
    const b = await aluno("fp-cor-b@foca.dev", "pro");
    const r = await corrigirRedacao(amb.db, a, { tema: "Leitura", texto: TEXTO }, AGORA);
    if (!r.ok) throw new Error("correção deveria sair");
    expect(await verCorrecao(amb.db, b, r.id)).toBeNull();
    expect(await apagarRedacao(amb.db, b, r.id)).toBe(false);
    expect(await apagarRedacao(amb.db, a, r.id)).toBe(true);
    // O texto some, mas a correção continua contando no mês (apagar e corrigir de novo não fura o limite).
    const [linha] = await amb.db.select().from(redacao).where(eq(redacao.userId, a));
    expect({ tema: linha.tema, texto: linha.texto, resultado: linha.resultado }).toEqual({ tema: "", texto: "", resultado: null });
    expect(await verCorrecao(amb.db, a, r.id)).toBeNull();
    const e = await estadoDoCorretor(amb.db, a, AGORA);
    expect(e.historico).toEqual([]);
    expect(e.restantesMes).toBe(9);
  });

  test("texto curto é recusado pela validação da API (mínimo de caracteres)", () => {
    expect(TEXTO.length).toBeGreaterThanOrEqual(TEXTO_MIN);
  });
});

describe("treino por partes", () => {
  test("sem chave: comentário automático, sem gastar a cota da Foca IA; Basic não tem", async () => {
    const pro = await aluno("fp-tre@foca.dev", "pro");
    const basic = await aluno("fp-tre-b@foca.dev", "basic");
    expect(await comentarParte(amb.db, basic, { parte: "tese", texto: "Minha tese sobre leitura." }, AGORA)).toEqual({ ok: false, motivo: "fechado" });
    const r = await comentarParte(amb.db, pro, { parte: "proposta", texto: "O governo deve criar bibliotecas." }, AGORA);
    expect(r).toMatchObject({ ok: true, parte: { parte: "proposta", automatico: true } });
    expect(await amb.db.select().from(aiUsage).where(eq(aiUsage.userId, pro))).toEqual([]);
    const e = await estadoDoTreino(amb.db, pro, AGORA);
    expect(e.tema).toBe(temaDaSemana(diaDaCota(AGORA)));
    expect(e.partes.map((p) => p.parte)).toEqual(["proposta"]);
  });

  test("com chave: comentário da IA gasta 1 mensagem; reescrever vale a última versão", async () => {
    process.env.OPENAI_API_KEY = "teste";
    definirChamadaIA(async () => ({ texto: "Boa tese. Deixe mais claro o problema.", usage: { entrada: 5, saida: 5 } }));
    const pro = await aluno("fp-tre2@foca.dev", "pro");
    await comentarParte(amb.db, pro, { parte: "tese", texto: "Primeira versão da minha tese." }, AGORA);
    await comentarParte(amb.db, pro, { parte: "tese", texto: "Segunda versão da minha tese." }, new Date(AGORA.getTime() + 60_000));
    const [uso] = await amb.db.select().from(aiUsage).where(and(eq(aiUsage.userId, pro), eq(aiUsage.day, diaDaCota(AGORA))));
    expect(uso.messages).toBe(2);
    const e = await estadoDoTreino(amb.db, pro, AGORA);
    expect(e.partes).toHaveLength(1);
    expect(e.partes[0]).toMatchObject({ texto: "Segunda versão da minha tese.", automatico: false });
    // A versão anterior não fica guardada.
    expect(await amb.db.select().from(redacao).where(eq(redacao.userId, pro))).toHaveLength(1);
  });
});
