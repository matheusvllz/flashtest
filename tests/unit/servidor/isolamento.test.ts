/**
 * Isolamento entre alunos em TODAS as funções de servidor (46 T-06.6; spec 48 T-48.1.1, RF-3; modelo de ameaças T6).
 *
 * 1. **Inventário:** toda `createServerFn` de `src/` precisa estar na tabela abaixo, com a prova de isolamento.
 *    Função nova sem linha aqui faz este teste falhar.
 * 2. **Regra estática:** função que abre o banco pega o aluno da sessão (`exigirSessao`/`sessaoAtual`) e o
 *    contrato de entrada não tem `userId`.
 * 3. **Duas contas:** a lógica de cada função, chamada como o handler chama, com A e B.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { eventoEstudo, type EventoEstudo } from "../../../src/lib/sync/contrato";
import { pedidoImportacao } from "../../../src/lib/sync/importacao";
import { exportarDadosDoAluno, focaIALigada, gravarFocaIA } from "../../../src/server/conta/dados";
import { gravarPerfil } from "../../../src/server/conta/perfil";
import { profile } from "../../../src/server/db/schema";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { estadoDoAluno, salvarDocumentoDoAluno } from "../../../src/server/estudo/documento";
import { importarEstado } from "../../../src/server/estudo/importar";
import { aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { definirChamadaIA } from "../../../src/server/tutor/ia";
import { definirModerador } from "../../../src/server/tutor/moderacao";
import { responderTutor } from "../../../src/server/tutor/responder";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const RAIZ = resolve(import.meta.dir, "..", "..", "..");

/** Função de servidor → como o isolamento é garantido e onde está provado. */
const INVENTARIO: Record<string, string> = {
  "src/lib/api/sessao.ts#obterSessao": "só devolve a sessão do próprio cookie; sem banco de dados do aluno",
  "src/lib/api/conta.ts#configAcesso": "configuração pública; não lê dado de aluno",
  "src/lib/api/conta.ts#salvarPerfil": "gravarPerfil(db, s.userId) — prova: 'perfil'",
  "src/lib/api/conta.ts#completarCadastro": "atualiza user/legal_acceptance onde id = s.userId — regra estática",
  "src/lib/api/conta.ts#exportarDados": "exportarDadosDoAluno(db, s.userId) — prova: 'exportação'",
  "src/lib/api/conta.ts#preferenciaFocaIA": "focaIALigada(db, s.userId) — prova: 'Foca IA desligada'",
  "src/lib/api/conta.ts#definirFocaIA": "gravarFocaIA(db, s.userId) — prova: 'Foca IA desligada'",
  "src/lib/api/estudo.ts#enviarEventos": "aplicarEventos(db, s.userId) — prova: 'eventos'",
  "src/lib/api/estudo.ts#obterEstado": "estadoDoAluno(db, s.userId) — prova: 'documento'",
  "src/lib/api/estudo.ts#salvarDocumento": "salvarDocumentoDoAluno(db, s.userId) — prova: 'documento'",
  "src/lib/api/estudo.ts#importarEstadoLocal": "importarEstado(db, s.userId) — prova: 'importação'",
  "src/lib/tutor.ts#askTutor": "responderTutor({ sessao }) — prova: 'Foca IA' e tests/unit/servidor/tutor.test.ts",
};

function arquivos(dir: string): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...arquivos(p));
    else if (/\.(ts|tsx)$/.test(n) && !n.endsWith(".gen.ts")) out.push(p);
  }
  return out;
}

/** `arquivo#nome` → trecho do código da função (até a próxima exportação). */
function funcoesDeServidor(): Map<string, string> {
  const achadas = new Map<string, string>();
  for (const arq of arquivos(join(RAIZ, "src"))) {
    const txt = readFileSync(arq, "utf8").replace(/\r\n/g, "\n");
    const re = /export const (\w+) = createServerFn\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(txt))) {
      const fim = txt.indexOf("\nexport ", m.index + 10);
      achadas.set(`${relative(RAIZ, arq).split("\\").join("/")}#${m[1]}`, txt.slice(m.index, fim < 0 ? undefined : fim));
    }
  }
  return achadas;
}

describe("inventário das funções de servidor", () => {
  const achadas = funcoesDeServidor();

  test("toda createServerFn está no inventário de isolamento (função nova precisa de prova aqui)", () => {
    expect([...achadas.keys()].sort()).toEqual(Object.keys(INVENTARIO).sort());
  });

  test("função que abre o banco tira o aluno da sessão; nenhum contrato de entrada aceita userId", () => {
    for (const [nome, corpo] of achadas) {
      if (corpo.includes("banco()")) expect({ nome, sessao: /exigirSessao\(\)|sessaoAtual\(\)/.test(corpo) }).toEqual({ nome, sessao: true });
      expect({ nome, userIdNaEntrada: /validator[\s\S]*?userId[\s\S]*?\.handler/.test(corpo) }).toEqual({ nome, userIdNaEntrada: false });
    }
  });
});

const AGORA = new Date("2026-09-30T15:00:00-03:00");
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
const id = () => randomUUID().replaceAll("-", "");

describe("duas contas", () => {
  let amb: Ambiente;
  let a: { userId: string };
  let b: { userId: string };
  let certa: number;

  beforeEach(async () => {
    amb = await ambiente();
    a = await alunoVerificado(amb, "ana@teste.dev");
    b = await alunoVerificado(amb, "bia@teste.dev");
    const ex = await exercicioDoItem("q1");
    if (!ex || ex.type !== "multipla-escolha") throw new Error("q1");
    certa = ex.correta;
  });

  const resposta = (): EventoEstudo =>
    eventoEstudo.parse({ tipo: "resposta", id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });

  test("eventos: o que A envia não muda o agregado de B; reenviar o id de A como B não aproveita nada de A", async () => {
    const ev = resposta();
    await aplicarEventos(amb.db, a.userId, [ev], AGORA);
    expect((await estadoDoAluno(amb.db, b.userId)).agregado.xp).toBe(0);
    await aplicarEventos(amb.db, b.userId, [ev], AGORA); // mesmo id, outra conta: conta para B como fato de B
    expect((await estadoDoAluno(amb.db, a.userId)).agregado.xp).toBe(15);
    expect((await estadoDoAluno(amb.db, b.userId)).agregado.xp).toBe(15);
  });

  test("documento: B não lê o de A, não sobrescreve o de A e o conflito de B só revela a revisão de B", async () => {
    await salvarDocumentoDoAluno(amb.db, a.userId, { rev: 0, schemaVersion: 6, doc: { segredo: "de-A" } });
    expect((await estadoDoAluno(amb.db, b.userId)).documento).toBeNull();
    const r = await salvarDocumentoDoAluno(amb.db, b.userId, { rev: 1, schemaVersion: 6, doc: { x: 1 } });
    expect(r.ok).toBe(true); // B cria o próprio documento (rev 1), sem tocar no de A
    expect((await estadoDoAluno(amb.db, a.userId)).documento?.doc).toEqual({ segredo: "de-A" });
    const conflito = await salvarDocumentoDoAluno(amb.db, b.userId, { rev: 99, schemaVersion: 6, doc: {} });
    expect(conflito).toEqual({ ok: false, codigo: "CONFLITO", rev: 1 });
  });

  test("importação: o pedido de A não aparece em B, e o mesmo importId em B não é tratado como repetido", async () => {
    const p = pedidoImportacao.parse({
      importId: id(),
      aparelhoId: id(),
      schemaVersion: 6,
      xpNoAparelho: 100,
      respostas: [{ id: id(), itemId: "q1", resposta: certa, fonte: "questao-geral", ocorreuEm: "2026-09-20T10:00:00-03:00", dataLocal: "2026-09-20" }],
      licoes: [],
      atividades: [],
      diasComAtividade: [],
      bonusDeEntrada: false,
    });
    await importarEstado(amb.db, a.userId, p, AGORA);
    expect((await estadoDoAluno(amb.db, b.userId)).agregado.xp).toBe(0);
    const emB = await importarEstado(amb.db, b.userId, p, AGORA);
    expect(emB.resumo.repetida).toBe(false);
  });

  test("perfil: gravar o de A não toca o de B", async () => {
    await gravarPerfil(amb.db, a.userId, { primeiroNome: "Ana" });
    await gravarPerfil(amb.db, b.userId, { primeiroNome: "Bia" });
    const [pa] = await amb.db.select({ n: profile.firstName }).from(profile).where(eq(profile.userId, a.userId));
    expect(pa.n).toBe("Ana");
  });

  test("exportação: a de A não contém nada de B", async () => {
    await aplicarEventos(amb.db, b.userId, [resposta()], AGORA);
    await salvarDocumentoDoAluno(amb.db, b.userId, { rev: 0, schemaVersion: 6, doc: { marca: "bia-secreta" } });
    const exp = JSON.stringify(await exportarDadosDoAluno(amb.db, a.userId, AGORA));
    expect(exp).toContain("ana@teste.dev");
    expect(exp).not.toContain("bia@teste.dev");
    expect(exp).not.toContain("bia-secreta");
    expect(exp).not.toContain(b.userId);
  });

  test("Foca IA desligada: a escolha de A não vale para B", async () => {
    await gravarFocaIA(amb.db, a.userId, false);
    expect(await focaIALigada(amb.db, a.userId)).toBe(false);
    expect(await focaIALigada(amb.db, b.userId)).toBe(true);
  });

  test("Foca IA: a resposta de A não usa dados de B (desempenho e documento vêm só do aluno da sessão)", async () => {
    let sistema = "";
    definirChamadaIA(async (c) => {
      sistema = c.sistema;
      return { texto: "ok", usage: { entrada: 1, saida: 1 } };
    });
    definirModerador(async () => ({ autolesao: false, sinalizado: false, categorias: [] }));
    try {
      for (let i = 0; i < 5; i++) await aplicarEventos(amb.db, b.userId, [resposta()], AGORA);
      await responderTutor(
        {
          env: { contasAtivas: true, TUTOR_IDADE_SEM_CONSENTIMENTO: 18, AI_COTA_GRATIS_MENSAGENS: 3, AI_COTA_PRO_MENSAGENS: 20, AI_COTA_PRO_FOTOS: 5, AI_TETO_DIARIO_USD: 1, AI_PRECO_ENTRADA_USD_MTOK: 1, AI_PRECO_SAIDA_USD_MTOK: 8 },
          sessao: { userId: a.userId, email: "ana@teste.dev", emailVerificado: true, nome: "Ana", anoNascimento: 2000, termosVersao: null, privacidadeVersao: null },
          db: amb.db,
          agora: AGORA,
          temChave: true,
        },
        { mensagens: [{ role: "user", content: "como estou?" }], foco: null, modo: "duvida", foto: null },
      );
      expect(sistema).not.toContain("questões corretas"); // A não respondeu nada; os acertos de B não aparecem
    } finally {
      definirChamadaIA(undefined);
      definirModerador(undefined);
    }
  });
});
