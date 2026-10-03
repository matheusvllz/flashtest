/**
 * Tarefas de escrita e corretor v2 no servidor (spec 50 §5.10; T-50.11.1, 11.4, 11.5, 11.7). Banco PGlite real; a IA
 * e a moderação são simuladas e CONTADAS (nenhum teste chama a OpenAI): Free e Basic nunca chegam nelas.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { TAREFAS_DE_ESCRITA } from "../../../src/content/tarefas-escrita";
import { aiUsage, assinatura, completion, missaoDia, perolaMovimento, redacao, studyDay, xpLedger } from "../../../src/server/db/schema";
import { exportarDadosDoAluno } from "../../../src/server/conta/dados";
import { estatisticasDoAluno, garantirMissoesDoDia, temTarefaDeEscritaAberta } from "../../../src/server/gamificacao/missoes";
import { enviarEscrita, minhasTarefasDeEscrita } from "../../../src/server/redacao/escrita";
import { apagarRedacao, avaliarEstimativa, corrigirRedacao, estadoDoCorretor, verCorrecao } from "../../../src/server/redacao/redacao";
import { redefinirEnv } from "../../../src/server/env";
import { definirChamadaIA, type ChamadaIA } from "../../../src/server/tutor/ia";
import { definirModerador } from "../../../src/server/tutor/moderacao";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00-03:00");
const DEPOIS = new Date("2026-12-15T15:00:00Z");
const HOJE = "2026-10-15";

let amb: Ambiente;
let chamadasIA: ChamadaIA[];
let moderacoes: number;
let respostaIA: () => string | null;

beforeEach(async () => {
  amb = await ambiente();
  chamadasIA = [];
  moderacoes = 0;
  respostaIA = () => "Bom começo. Falta mostrar a consequência. Tente ligar ao tema no fim.";
  definirModerador(async () => {
    moderacoes += 1;
    return { autolesao: false, sinalizado: false, categorias: [] };
  });
  definirChamadaIA(async (c) => {
    chamadasIA.push(c);
    const texto = respostaIA();
    return { texto, usage: { entrada: 100, saida: 50 } };
  });
});
afterEach(() => {
  definirChamadaIA(undefined);
  definirModerador(undefined);
  delete process.env.OPENAI_API_KEY;
  delete process.env.FUNCOES_DESLIGADAS;
  redefinirEnv();
});

/** Aluno com os nós "Escreva" abertos (as lições que vêm antes das tarefas concluídas no servidor), salvo `abrir: false`. */
async function aluno(email: string, plano?: "basic" | "pro", abrir = true): Promise<string> {
  const { userId } = await alunoVerificado(amb, email);
  if (abrir)
    await amb.db
      .insert(completion)
      .values([...new Set(TAREFAS_DE_ESCRITA.map((t) => t.depoisDe))].map((l) => ({ userId, key: `licao:redacao:${l}#t`, kind: "licao-redacao", completedAt: AGORA })));
  if (plano)
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
  return userId;
}

async function codigo(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return "sem erro";
  } catch (e) {
    return (e as { codigo?: string }).codigo ?? String(e);
  }
}

const TRECHO =
  "O uso excessivo de telas atrapalha o sono porque o celular fica na cama até tarde. Por isso, o estudante chega cansado à escola e tem mais dificuldade de prestar atenção nas aulas.";
const COMPLETO = TAREFAS_DE_ESCRITA.find((t) => t.id === "estrutura-texto-completo")!.modelo.texto;

describe("enviar tarefa de escrita (todos os planos)", () => {
  test("Free envia: checagem automática, bloco (Pérolas e dia de estudo), XP 10 só na primeira vez; nenhuma IA nem moderação", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("esc-free@foca.dev");
    const r = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-complete-paragrafo", texto: TRECHO }, AGORA);
    expect(r.ok).toBe(true);
    expect(r.xp).toBe(10);
    expect(r.bloco).toBe(true);
    expect(r.envio.comentarioIa).toBeNull();
    expect(r.avisoIa).toBeNull();
    expect(r.envio.checagem.itens.map((i) => i.id)).toContain("conectivos");
    expect(r.novidades.perolasGanhas).toBeGreaterThanOrEqual(5);
    const [dia] = await amb.db.select().from(studyDay).where(and(eq(studyDay.userId, u), eq(studyDay.localDate, HOJE)));
    expect(dia.blocks).toBe(1);

    const de_novo = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-complete-paragrafo", texto: `${TRECHO} Isso pesa na saúde mental.` }, new Date(AGORA.getTime() + 86_400_000));
    expect(de_novo.xp).toBe(0);
    expect(de_novo.bloco).toBe(true);
    const xp = await amb.db.select().from(xpLedger).where(and(eq(xpLedger.userId, u), eq(xpLedger.key, "escrita:argumentacao-complete-paragrafo")));
    expect(xp.map((x) => x.xp)).toEqual([10]);
    const blocos = await amb.db.select().from(perolaMovimento).where(and(eq(perolaMovimento.userId, u), eq(perolaMovimento.motivo, "bloco")));
    expect(blocos).toHaveLength(2);

    // Nenhum pedido à IA nem à moderação para o Free (o texto não sai do servidor do Foca).
    expect(chamadasIA).toHaveLength(0);
    expect(moderacoes).toBe(0);
  });

  test("Basic também não chama a IA; texto igual ao último envio fica guardado mas não paga bloco", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("esc-basic@foca.dev", "basic");
    await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-complete-paragrafo", texto: TRECHO }, AGORA);
    const igual = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-complete-paragrafo", texto: `  ${TRECHO}\n` }, AGORA);
    expect(igual.bloco).toBe(false);
    expect(igual.novidades.perolasGanhas).toBe(0);
    expect(await amb.db.select().from(redacao).where(eq(redacao.userId, u))).toHaveLength(2);
    expect(chamadasIA).toHaveLength(0);
    expect(moderacoes).toBe(0);
  });

  test("Pro: o trecho ganha o comentário da Foca IA (1 mensagem da cota, texto entre marcas); o texto completo não", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("esc-pro@foca.dev", "pro");
    const r = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-complete-paragrafo", texto: TRECHO }, AGORA);
    expect(r.envio.comentarioIa).toContain("Bom começo");
    expect(chamadasIA).toHaveLength(1);
    expect(chamadasIA[0].mensagens[0].content).toContain("<<<INICIO_DO_TEXTO>>>");
    expect(chamadasIA[0].sistema).toContain("Os impactos do excesso de telas");
    expect(moderacoes).toBe(1);
    const [uso] = await amb.db.select().from(aiUsage).where(eq(aiUsage.userId, u));
    expect(uso.messages).toBe(1);

    const c = await enviarEscrita(amb.db, u, { tarefaId: "estrutura-texto-completo", texto: COMPLETO }, AGORA);
    expect(c.envio.comentarioIa).toBeNull();
    expect(c.envio.checagem.modo).toBe("completo");
    expect(chamadasIA).toHaveLength(1);
  });

  test("Pro sem chave da IA: tarefa enviada com a checagem e aviso de indisponível; falha técnica devolve a mensagem", async () => {
    const u = await aluno("esc-pro-sem@foca.dev", "pro");
    const r = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA);
    expect(r.avisoIa).toBe("indisponivel");
    expect(r.bloco).toBe(true);
    expect(chamadasIA).toHaveLength(0);

    process.env.OPENAI_API_KEY = "teste";
    respostaIA = () => null;
    const f = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: `${TRECHO} Outra versão.` }, AGORA);
    expect(f.envio.comentarioIa).toBeNull();
    const [uso] = await amb.db.select().from(aiUsage).where(eq(aiUsage.userId, u));
    expect(uso.messages).toBe(0);
  });

  test("tamanho fora dos limites da tarefa, tarefa desconhecida e escrita desligada são recusados", async () => {
    const u = await aluno("esc-lim@foca.dev");
    expect(await codigo(enviarEscrita(amb.db, u, { tarefaId: "estrutura-texto-completo", texto: TRECHO }, AGORA))).toBe("TAMANHO");
    expect(await codigo(enviarEscrita(amb.db, u, { tarefaId: "nao-existe", texto: TRECHO }, AGORA))).toBe("TAREFA_DESCONHECIDA");
    process.env.FUNCOES_DESLIGADAS = "escrita";
    redefinirEnv();
    expect(await codigo(enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA))).toBe("ESCRITA_DESLIGADA");
  });

  test("missão de escrita anda; a conquista conta tarefas diferentes, não reenvios", async () => {
    const u = await aluno("esc-missao@foca.dev");
    const missoes = await amb.db.transaction((tx) => garantirMissoesDoDia(tx, u, HOJE, AGORA));
    const temEscrita = missoes.some((m) => m.missaoId === "escrita-1");
    await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA);
    await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: `${TRECHO} De novo.` }, AGORA);
    await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-repertorio", texto: `${TRECHO} Com repertório.` }, AGORA);
    const fazer = (await amb.db.select().from(missaoDia).where(eq(missaoDia.userId, u))).find((m) => m.missaoId.startsWith("fazer-"));
    expect(fazer?.progresso).toBeGreaterThanOrEqual(1);
    if (temEscrita) {
      const [m] = await amb.db.select().from(missaoDia).where(and(eq(missaoDia.userId, u), eq(missaoDia.missaoId, "escrita-1")));
      expect(m.concluidaEm).not.toBeNull();
    }
    expect((await estatisticasDoAluno(amb.db, u, HOJE, 1)).escritas).toBe(2);
  });

  test("a missão de escrita só entra no sorteio de quem tem um nó 'Escreva' aberto", async () => {
    const u = await aluno("esc-aberta@foca.dev", undefined, false);
    expect(await temTarefaDeEscritaAberta(amb.db, u)).toBe(false);
    await amb.db.insert(completion).values({ userId: u, key: "licao:redacao:redacao-argumentacao-05-falacias#x", kind: "licao-redacao", completedAt: AGORA });
    expect(await temTarefaDeEscritaAberta(amb.db, u)).toBe(false);
    await amb.db.insert(completion).values({ userId: u, key: "licao:redacao:redacao-argumentacao-01-tipos-argumento#import", kind: "licao-redacao", completedAt: AGORA });
    expect(await temTarefaDeEscritaAberta(amb.db, u)).toBe(true);
  });

  test("tarefa fechada (lição anterior não concluída) guarda o texto mas não paga; 1 bloco por tarefa por dia; autocuidado local para todos", async () => {
    const fechado = await aluno("esc-fechada@foca.dev", undefined, false);
    const r = await enviarEscrita(amb.db, fechado, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA);
    expect(r.ok && r.xp).toBe(0);
    expect(r.ok && r.bloco).toBe(false);
    const u = await aluno("esc-um-por-dia@foca.dev");
    const a = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA);
    expect(a.ok && a.bloco).toBe(true);
    const b = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: `${TRECHO} Outra versão.` }, AGORA);
    expect(b.ok && b.bloco).toBe(false);
    const free = await aluno("esc-autocuidado@foca.dev");
    const c = await enviarEscrita(amb.db, free, { tarefaId: "argumentacao-coesao", texto: `${TRECHO} Às vezes eu quero me matar.` }, AGORA);
    expect(c.ok && c.avisoIa).toBe("autocuidado");
  });

  test("minhas tarefas: contagem e último envio; apagar limpa o texto e mantém a contagem", async () => {
    const u = await aluno("esc-lista@foca.dev");
    const a = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA);
    const b = await enviarEscrita(amb.db, u, { tarefaId: "argumentacao-coesao", texto: `${TRECHO} Segunda.` }, new Date(AGORA.getTime() + 1000));
    let m = await minhasTarefasDeEscrita(amb.db, u);
    expect(m.tarefas).toHaveLength(1);
    expect(m.tarefas[0]).toMatchObject({ tarefaId: "argumentacao-coesao", enviadas: 2 });
    expect(m.tarefas[0].ultima?.id).toBe(b.envio.id);
    expect(await apagarRedacao(amb.db, u, b.envio.id)).toBe(true);
    m = await minhasTarefasDeEscrita(amb.db, u);
    expect(m.tarefas[0].enviadas).toBe(2);
    expect(m.tarefas[0].ultima?.id).toBe(a.envio.id);
    const [linha] = await amb.db.select().from(redacao).where(eq(redacao.id, b.envio.id));
    expect({ texto: linha.texto, resultado: linha.resultado }).toEqual({ texto: "", resultado: null });
  });
});

/* -------------------------------------------------------------------- corretor v2 --- */

const TEXTO_LONGO = `${"A leitura entre jovens no Brasil ainda enfrenta barreiras. ".repeat(9)}Por isso, o Ministério da Educação deve ampliar bibliotecas.`;

function estimada(dh: "respeitados" | "violados" = "respeitados"): string {
  return JSON.stringify({
    situacao: "estimada",
    direitosHumanos: dh,
    competencias: [1, 2, 3, 4, 5].map((c) => ({ c, nota: 160, justificativa: `J${c}.`, trecho: null, paraSubir: `A${c}.` })),
    comentario: "Bom. Siga.",
  });
}
const SEM = JSON.stringify({ situacao: "sem-estimativa", motivo: "fuga-ao-tema", explicacao: "Fala de outro assunto.", oQueMudar: "Volte ao tema." });

describe("corretor v2 (Pro)", () => {
  test("até 7 linhas: sem estimativa na hora, sem IA e sem gastar o mês", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("cor-curto@foca.dev", "pro");
    const r = await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: "Texto curto demais. ".repeat(20) }, AGORA);
    expect(r).toMatchObject({ ok: true, id: null, correcao: { situacao: "sem-estimativa", motivo: "poucas-linhas" } });
    expect(chamadasIA).toHaveLength(0);
    expect((await estadoDoCorretor(amb.db, u, AGORA)).restantesMes).toBe(10);
  });

  test("sem estimativa da IA não conta na cota; teto técnico de 15 chamadas no mês", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("cor-sem@foca.dev", "pro");
    respostaIA = () => SEM;
    for (let i = 0; i < 5; i++) {
      const r = await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA);
      expect(r).toMatchObject({ ok: true, correcao: { situacao: "sem-estimativa", motivo: "fuga-ao-tema" } });
    }
    // 5 chamadas usadas: sobram 10 estimativas pela cota, mas só 10 chamadas pelo teto técnico.
    expect((await estadoDoCorretor(amb.db, u, AGORA)).restantesMes).toBe(10);
    respostaIA = () => estimada();
    for (let i = 0; i < 9; i++) expect((await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA)).ok).toBe(true);
    expect((await estadoDoCorretor(amb.db, u, AGORA)).restantesMes).toBe(1);
    respostaIA = () => SEM;
    expect((await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA)).ok).toBe(true);
    // 15 chamadas no mês: o teto técnico fecha, mesmo com 1 estimativa ainda na cota.
    expect(await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA)).toEqual({ ok: false, motivo: "limite" });
  });

  test("1 nova tentativa automática em falha de formato; duas falhas devolvem a vaga", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("cor-retry@foca.dev", "pro");
    let n = 0;
    respostaIA = () => (n++ === 0 ? "sem JSON" : estimada());
    const r = await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA);
    expect(r.ok).toBe(true);
    expect(chamadasIA).toHaveLength(2);
    respostaIA = () => "sem JSON";
    expect(await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA)).toEqual({ ok: false, motivo: "falha" });
    expect(chamadasIA).toHaveLength(4);
    expect((await estadoDoCorretor(amb.db, u, AGORA)).restantesMes).toBe(9);
  });

  test("direitos humanos violados zeram só a C5 na correção guardada", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("cor-dh@foca.dev", "pro");
    respostaIA = () => estimada("violados");
    const r = await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA);
    if (!r.ok || !r.id) throw new Error("deveria estimar");
    const v = await verCorrecao(amb.db, u, r.id);
    expect(v?.correcao?.competencias.map((c) => c.nota)).toEqual([160, 160, 160, 160, 0]);
    expect(v?.correcao?.total).toBe(640);
  });

  test("Ajudou / Achei estranha: só em estimativa do próprio aluno; vai na exportação", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const a = await aluno("cor-av-a@foca.dev", "pro");
    const b = await aluno("cor-av-b@foca.dev", "pro");
    respostaIA = () => estimada();
    const r = await corrigirRedacao(amb.db, a, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA);
    if (!r.ok || !r.id) throw new Error("deveria estimar");
    expect(await avaliarEstimativa(amb.db, b, r.id, "estranha", AGORA)).toBe(false);
    expect(await avaliarEstimativa(amb.db, a, r.id, "estranha", AGORA)).toBe(true);
    expect(await avaliarEstimativa(amb.db, a, r.id, "ajudou", AGORA)).toBe(true);
    expect((await verCorrecao(amb.db, a, r.id))?.avaliacao).toBe("ajudou");
    respostaIA = () => SEM;
    const s = await corrigirRedacao(amb.db, a, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA);
    if (!s.ok || !s.id) throw new Error("deveria responder");
    expect(await avaliarEstimativa(amb.db, a, s.id, "ajudou", AGORA)).toBe(false);

    await enviarEscrita(amb.db, a, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA);
    const dados = (await exportarDadosDoAluno(amb.db, a)) as unknown as { redacoes: { tipo: string; tarefa: string | null; avaliacao: string | null; texto: string }[] };
    expect(dados.redacoes.find((x) => x.tipo === "tarefa")).toMatchObject({ tarefa: "argumentacao-coesao", texto: TRECHO });
    expect(dados.redacoes.some((x) => x.avaliacao === "ajudou")).toBe(true);
  });

  test("apagar uma 'sem estimativa' mantém ela fora da cota", async () => {
    process.env.OPENAI_API_KEY = "teste";
    const u = await aluno("cor-apaga@foca.dev", "pro");
    respostaIA = () => SEM;
    const r = await corrigirRedacao(amb.db, u, { tema: "Leitura", texto: TEXTO_LONGO }, AGORA);
    if (!r.ok || !r.id) throw new Error("deveria responder");
    expect(await apagarRedacao(amb.db, u, r.id)).toBe(true);
    expect((await estadoDoCorretor(amb.db, u, AGORA)).restantesMes).toBe(10);
  });
});

describe("isolamento", () => {
  test("B não vê, não apaga e não avalia o que é de A", async () => {
    const a = await aluno("esc-iso-a@foca.dev");
    const b = await aluno("esc-iso-b@foca.dev");
    const r = await enviarEscrita(amb.db, a, { tarefaId: "argumentacao-coesao", texto: TRECHO }, AGORA);
    expect((await minhasTarefasDeEscrita(amb.db, b)).tarefas).toEqual([]);
    expect(await apagarRedacao(amb.db, b, r.envio.id)).toBe(false);
    expect(await avaliarEstimativa(amb.db, b, r.envio.id, "ajudou", AGORA)).toBe(false);
    expect((await minhasTarefasDeEscrita(amb.db, a)).tarefas[0].ultima?.texto).toBe(TRECHO);
  });
});
