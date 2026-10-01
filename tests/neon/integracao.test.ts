/**
 * Integração contra um Postgres real do Neon (spec 48 T-48.0.4, RF-2). **Não roda no `bun test tests/unit`.**
 * Rode com `bun scripts/db/neon.ts testar`: cria uma branch temporária filha de `dev` (expira em 2 h), aplica as
 * migrações e passa a conexão em `FOCA_TESTE_NEON_URL`. Nunca aponte isto para a branch `production` (D48-03).
 *
 * Cobre o que o PGlite não exercita: driver serverless por WebSocket, várias conexões ao mesmo tempo (o
 * `FOR UPDATE` da 46 DV-11) e a autenticação real sobre o Neon.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { eventoEstudo, type EventoEstudo } from "../../src/lib/sync/contrato";
import { pedidoImportacao } from "../../src/lib/sync/importacao";
import { exercicioDoItem } from "../../src/server/estudo/conteudo";
import { importarEstado } from "../../src/server/estudo/importar";
import { ATIVIDADES_PAGAS_POR_DIA, agregadoDoAluno, aplicarEventos, dataNoFuso } from "../../src/server/estudo/sincronizar";
import { reservarMensagem } from "../../src/server/tutor/cota";
import { ambiente, alunoVerificado, type Ambiente } from "../unit/servidor/ajuda";

const URL = process.env.FOCA_TESTE_NEON_URL;
const AGORA = new Date();
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
const id = () => randomUUID().replaceAll("-", "");
const rodada = id().slice(0, 8);
const email = (n: string) => `${n}-${rodada}@teste.dev`;
const T = 60_000;

function resposta(itemId: string, r: number | null, extra: Partial<Extract<EventoEstudo, { tipo: "resposta" }>> = {}): EventoEstudo {
  return eventoEstudo.parse({ tipo: "resposta", id: id(), itemId, resposta: r, fonte: "questao-geral", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE, ...extra });
}

describe.skipIf(!URL)("Neon (branch temporária)", () => {
  let amb: Ambiente;
  let certa: number;

  beforeAll(async () => {
    // A conexão traz o endpoint, não o nome da branch: o script informa o nome, e só branch temporária é aceita.
    if (!/^teste-\d{14}$/.test(process.env.FOCA_TESTE_NEON_BRANCH ?? "")) throw new Error("recusado: só roda numa branch teste-* criada pelo scripts/db/neon.ts testar");
    amb = await ambiente(URL);
    const ex = await exercicioDoItem("q1");
    if (!ex || ex.type !== "multipla-escolha") throw new Error("q1 deveria ser múltipla escolha");
    certa = ex.correta;
  }, T);

  test("as 17 tabelas do esquema existem e o driver responde", async () => {
    const r = await amb.db.execute(sql`select count(*)::int as n from information_schema.tables where table_schema = 'public'`);
    const linhas = (r as unknown as { rows: { n: number }[] }).rows;
    expect(linhas[0].n).toBe(17);
  }, T);

  test("cadastro → verificação → login → sessão, com o Better Auth sobre o Neon", async () => {
    const { userId, cookie } = await alunoVerificado(amb, email("ana"));
    expect(userId).toBeTruthy();
    const s = await amb.auth.api.getSession({ headers: new Headers({ cookie }) });
    expect(s?.user.id).toBe(userId);
  }, T);

  test("isolamento: o que A faz não aparece para B", async () => {
    const a = await alunoVerificado(amb, email("a"));
    const b = await alunoVerificado(amb, email("b"));
    await aplicarEventos(amb.db, a.userId, [resposta("q1", certa)], AGORA);
    expect((await agregadoDoAluno(amb.db, a.userId)).xp).toBe(15);
    expect((await agregadoDoAluno(amb.db, b.userId)).xp).toBe(0);
  }, T);

  test("concorrência entre conexões: envios simultâneos do mesmo aluno não pagam a mesma chave duas vezes", async () => {
    const { userId } = await alunoVerificado(amb, email("zeca"));
    await Promise.all(Array.from({ length: 6 }, () => aplicarEventos(amb.db, userId, [resposta("q1", certa)], AGORA)));
    expect((await agregadoDoAluno(amb.db, userId)).xp).toBe(15);
  }, T);

  test("concorrência entre conexões: o teto diário de atividades pagas vale com envios paralelos", async () => {
    const { userId } = await alunoVerificado(amb, email("teto"));
    // Lotes paralelos de conclusões de atividade (cada uma com 1 resposta). O teto é por dia.
    const lote = () => {
      const chave = `${id()}@1`;
      return [
        resposta("q1", certa, { fonte: "atividade", attemptKey: chave }),
        eventoEstudo.parse({ tipo: "atividade-concluida", id: id(), attemptKey: chave, atividadeId: "pratica-mat", kind: "pratica", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE }),
      ];
    };
    const porGrupo = Math.ceil((ATIVIDADES_PAGAS_POR_DIA + 6) / 6);
    const grupos = Array.from({ length: 6 }, () => Array.from({ length: porGrupo }, lote).flat());
    await Promise.all(grupos.map((evs) => aplicarEventos(amb.db, userId, evs, AGORA)));
    const r = await amb.db.execute(sql`select count(*)::int as n from completion where user_id = ${userId} and key like 'atividade:%'`);
    const pagas = await amb.db.execute(sql`select count(*)::int as n from xp_ledger where user_id = ${userId} and key like 'atividade:%' and xp > 0`);
    const n = (x: unknown) => (x as { rows: { n: number }[] }).rows[0].n;
    expect(n(r)).toBeGreaterThan(0);
    expect(n(pagas)).toBeLessThanOrEqual(ATIVIDADES_PAGAS_POR_DIA);
  }, T);

  test("importação é tudo ou nada e idempotente no Neon", async () => {
    const { userId } = await alunoVerificado(amb, email("imp"));
    const p = pedidoImportacao.parse({
      importId: id(),
      aparelhoId: id(),
      schemaVersion: 6,
      xpNoAparelho: 100,
      respostas: [{ id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: new Date(AGORA.getTime() - 86_400_000).toISOString(), dataLocal: dataNoFuso(new Date(AGORA.getTime() - 86_400_000), "America/Sao_Paulo") }],
      licoes: [],
      atividades: [],
      diasComAtividade: [],
      bonusDeEntrada: false,
    });
    const um = await importarEstado(amb.db, userId, p, AGORA);
    const dois = await importarEstado(amb.db, userId, p, AGORA);
    expect(dois.resumo.repetida).toBe(true);
    expect(dois.agregado.xp).toBe(um.agregado.xp);
  }, T);
  test("cota da Foca IA com conexões reais: 8 reservas simultâneas, cota 3 → exatamente 3", async () => {
    const { userId } = await alunoVerificado(amb, email("cota"));
    const limites = { AI_COTA_GRATIS_MENSAGENS: 3, AI_COTA_PRO_MENSAGENS: 20, AI_COTA_PRO_FOTOS: 5, AI_TETO_DIARIO_USD: 1 };
    const rs = await Promise.allSettled(Array.from({ length: 8 }, () => reservarMensagem(amb.db, userId, false, AGORA, limites)));
    expect(rs.filter((r) => r.status === "fulfilled").length).toBe(3);
  }, T);
});
