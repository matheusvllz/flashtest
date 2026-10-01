/**
 * Exclusão de conta (46 T-09.2; spec 48 T-48.3.2). PGlite real, autenticação real.
 * Aceite: depois de excluir, nenhuma linha do usuário em tabela nenhuma; login falha; nova conta com o mesmo e-mail
 * começa limpa; o outro aluno fica intacto; auditoria sem o id em claro; e-mail de confirmação enviado.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { eventoEstudo } from "../../../src/lib/sync/contrato";
import { gravarFocaIA } from "../../../src/server/conta/dados";
import { hashDoUsuario } from "../../../src/server/conta/exclusao";
import { auditEvent } from "../../../src/server/db/schema";
import { caixaDeSaida } from "../../../src/server/email";
import { salvarDocumentoDoAluno } from "../../../src/server/estudo/documento";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const AGORA = new Date();
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

async function linhasDoUsuario(userId: string): Promise<Record<string, number>> {
  const tabelas = (await amb.db.execute(
    sql`select table_name from information_schema.columns where table_schema = 'public' and column_name = 'user_id' order by 1`,
  )) as unknown as { rows: { table_name: string }[] };
  const out: Record<string, number> = {};
  for (const { table_name } of tabelas.rows) {
    const r = (await amb.db.execute(sql.raw(`select count(*)::int as n from "${table_name}" where user_id = '${userId.replace(/'/g, "")}'`))) as unknown as {
      rows: { n: number }[];
    };
    out[table_name] = r.rows[0].n;
  }
  const u = (await amb.db.execute(sql`select count(*)::int as n from "user" where id = ${userId}`)) as unknown as { rows: { n: number }[] };
  out.user = u.rows[0].n;
  return out;
}

describe("excluir conta", () => {
  test("apaga tudo do aluno (em cascata), mantém o outro, audita sem o id e manda o e-mail", async () => {
    const a = await alunoVerificado(amb, "sai@teste.dev");
    const b = await alunoVerificado(amb, "fica@teste.dev");
    const ex = await exercicioDoItem("q1");
    if (!ex || ex.type !== "multipla-escolha") throw new Error("q1");
    for (const u of [a, b]) {
      await aplicarEventos(
        amb.db,
        u.userId,
        [eventoEstudo.parse({ tipo: "resposta", id: randomUUID().replaceAll("-", ""), itemId: "q1", resposta: ex.correta, fonte: "questao-geral", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE })],
        AGORA,
      );
      await salvarDocumentoDoAluno(amb.db, u.userId, { rev: 0, schemaVersion: 6, doc: { x: 1 } });
      await gravarFocaIA(amb.db, u.userId, false);
    }
    const antes = await linhasDoUsuario(a.userId);
    expect(Object.values(antes).some((n) => n > 0)).toBe(true);

    const r = await amb.post("/delete-user", { password: "senha-bem-forte-123" }, { cookie: a.cookie });
    expect(r.status).toBe(200);

    const depois = await linhasDoUsuario(a.userId);
    expect(Object.entries(depois).filter(([, n]) => n > 0)).toEqual([]);
    expect(Object.values(await linhasDoUsuario(b.userId)).some((n) => n > 0)).toBe(true);

    const auditoria = await amb.db.select().from(auditEvent).where(eq(auditEvent.type, "conta_excluida"));
    expect(auditoria).toHaveLength(1);
    expect(auditoria[0].userId).toBe(hashDoUsuario(a.userId));
    expect(auditoria[0].userId).not.toContain(a.userId);
    expect(caixaDeSaida().some((m) => m.para === "sai@teste.dev" && /foi excluída/.test(m.assunto))).toBe(true);
  });

  test("senha errada não exclui; depois de excluir, o login falha e o mesmo e-mail recomeça limpo", async () => {
    const a = await alunoVerificado(amb, "volta@teste.dev");
    const errada = await amb.post("/delete-user", { password: "nao-e-essa-senha" }, { cookie: a.cookie });
    expect(errada.status).not.toBe(200);
    expect((await linhasDoUsuario(a.userId)).user).toBe(1);

    expect((await amb.post("/delete-user", { password: "senha-bem-forte-123" }, { cookie: a.cookie })).status).toBe(200);
    const login = await amb.post("/sign-in/email", { email: "volta@teste.dev", password: "senha-bem-forte-123" });
    expect(login.status).not.toBe(200);

    const nova = await alunoVerificado(amb, "volta@teste.dev");
    expect(nova.userId).not.toBe(a.userId);
    const linhas = await linhasDoUsuario(nova.userId);
    expect(linhas.attempt ?? 0).toBe(0);
    expect(linhas.learning_doc ?? 0).toBe(0);
  });
});
