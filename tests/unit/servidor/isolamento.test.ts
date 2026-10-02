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
  // Spec 49 (planos e pagamentos): provas em tests/unit/servidor/pagamentos.test.ts e planos-cota.test.ts.
  "src/lib/api/planos.ts#meuPlano": "meuPlano(db, s.userId) — prova: 'compra de um aluno nunca vira plano de outro'",
  "src/lib/api/planos.ts#iniciarCheckout": "iniciarCheckout(db, p, s.userId) — compra gravada com o userId da sessão; preço do catálogo",
  "src/lib/api/planos.ts#estadoDaCompra": "estadoDaCompra(db, s.userId, compraId) filtra por userId — prova: 'estado de compra de outro aluno: 404'",
  "src/lib/api/planos.ts#cancelarAssinatura": "cancelarAssinatura(db, p, s.userId) — só a assinatura vigente do próprio aluno",
  "src/lib/api/planos.ts#pedirReembolso": "pedirReembolso(db, p, s.userId) — só a assinatura e as cobranças do próprio aluno",
  "src/lib/api/planos.ts#simularPagamentoLocal": "só local (404 implantado); confere estadoDaCompra(db, s.userId) antes de simular",
  "src/lib/api/recompensas.ts#configAnuncios": "configDeAnuncios(db, s.userId) — só o plano e o ano do próprio aluno",
  "src/lib/api/recompensas.ts#decidirCookiesDeAnuncio": "registrarConsentimentoDeCookies(db, s.userId) — consentimento do próprio aluno",
  "src/lib/api/recompensas.ts#ganharVidaPorAnuncio": "ganharVidaPorAnuncio(db, s.userId, dia) — prova: 'anúncio dá +1 uma vez por dia'",
  "src/lib/api/ranking.ts#meuRanking": "meuRanking(db, s.userId) — prova: 'menor de 18 nunca entra nem vê o ranking'",
  "src/lib/api/ranking.ts#entrarNoRanking": "entrarNoRanking(db, s.userId) — idade pelo ano do próprio cadastro",
  "src/lib/api/ranking.ts#sairDoRanking": "sairDoRanking(db, s.userId)",
  "src/lib/api/ranking.ts#denunciar": "denunciarApelido(db, s.userId) — só apelido do próprio grupo",
  "src/lib/api/funcoes.ts#minhasFuncoes": "planoDoAluno(db, s.userId) — plano só do servidor",
  "src/lib/api/funcoes.ts#meuCaderno": "itensDoCaderno(db, s.userId) — prova: 'caderno é do próprio aluno'",
  "src/lib/api/funcoes.ts#meuCronograma": "lerCronograma(db, s.userId)",
  "src/lib/api/funcoes.ts#salvarCronograma": "salvar(db, s.userId, data) — chave primária é o userId da sessão",
  "src/lib/api/redacao.ts#meuCorretor": "estadoDoCorretor(db, s.userId)",
  "src/lib/api/redacao.ts#corrigirRedacao": "corrigir(db, s.userId, data) — limite do mês pelo userId da sessão",
  "src/lib/api/redacao.ts#verCorrecao": "ver(db, s.userId, id) — prova: 'aluno B não lê a correção de A'",
  "src/lib/api/redacao.ts#apagarRedacao": "apagar(db, s.userId, id) — prova: 'aluno B não apaga o texto de A'",
  "src/lib/api/redacao.ts#meuTreino": "estadoDoTreino(db, s.userId)",
  "src/lib/api/redacao.ts#enviarParte": "comentarParte(db, s.userId, data)",
  // Spec 50 E9 — lembrete por push: assinatura pelo userId da sessão; provas em tests/unit/servidor/lembretes.test.ts.
  "src/lib/api/lembretes.ts#chavePublicaDoLembrete": "chavePublica() — só a chave pública VAPID, igual para todos; exige sessão",
  "src/lib/api/lembretes.ts#meuLembrete": "estadoDoLembrete(db, s.userId, endpoint) — prova: 'B com o endereço de A não vê A ligado'",
  "src/lib/api/lembretes.ts#salvarLembrete": "salvarAssinatura(db, s.userId, data) — prova: 'a janela de B não muda a de A'",
  "src/lib/api/lembretes.ts#removerLembrete": "removerAssinatura(db, s.userId, endpoint) — prova: 'B não apaga a assinatura de A'",
  // Spec 50 E3 — economia e ofensiva: tudo pelo userId da sessão; saldo, preço e estoque só do servidor.
  "src/lib/api/economia.ts#minhaEconomia": "saldoDePerolas/minhaOfensiva(db, s.userId)",
  "src/lib/api/economia.ts#meuHistoricoDePerolas": "historicoDePerolas(db, s.userId)",
  "src/lib/api/economia.ts#comprarNaLoja": "comprar(db, s.userId, itemId, pedidoId) — prova: 'duas compras ao mesmo tempo com saldo para uma'",
  "src/lib/api/economia.ts#equiparCosmetico": "equipar(db, s.userId, …) — prova: 'equipar só o que tem'",
  "src/lib/api/economia.ts#definirMetaOfensiva": "definir(db, s.userId, alvo)",
  "src/lib/api/economia.ts#encerrarMetaOfensiva": "encerrar(db, s.userId)",
  "src/lib/api/economia.ts#calendarioDaOfensiva": "calendario(db, s.userId, mes)",
  "src/lib/api/missoes.ts#minhasMissoes": "ler(db, s.userId, dia) — missões sorteadas pelo próprio userId",
  // Spec 50 F10 — simulado e reporte: tudo pelo userId da sessão; gabarito só depois de terminar.
  "src/lib/api/simulado.ts#meusSimulados": "opcoesDeSimulado(db, s.userId)",
  "src/lib/api/simulado.ts#iniciarSimulado": "iniciar(db, s.userId, pedido) — Pro checado no servidor",
  "src/lib/api/simulado.ts#verSimulado": "estadoDoSimulado(db, s.userId, id) — prova: 'outro aluno não vê, não responde e não conclui'",
  "src/lib/api/simulado.ts#responderSimulado": "responder(db, s.userId, id, …)",
  "src/lib/api/simulado.ts#concluirSimulado": "concluir(db, s.userId, id) — correção do servidor",
  "src/lib/api/simulado.ts#reportarQuestao": "reportar(db, s.userId, itemId, motivo) — um reporte por pessoa e motivo",
  // Spec 50 E8 — ofensiva com amigos (18+): só o userId da sessão; ids de dupla e refs de bloqueio conferidos contra o
  // próprio aluno. Provas em tests/unit/servidor/amigos.test.ts ('B não lê nem altera as duplas de A com C').
  "src/lib/api/amigos.ts#minhasDuplas": "minhas(db, s.userId) — só as duplas do próprio aluno, com filtro de idade",
  "src/lib/api/amigos.ts#definirApelidoSocial": "gravarApelido(db, s.userId) — idade pelo cadastro do próprio aluno",
  "src/lib/api/amigos.ts#criarConvite": "criar(db, s.userId) — convite do próprio aluno",
  "src/lib/api/amigos.ts#abrirConvite": "abrir(db, s.userId, codigo) — resposta genérica sem dado de quem convidou",
  "src/lib/api/amigos.ts#pedirDupla": "pedir(db, s.userId, codigo) — o pedido nasce com pedida_por = sessão",
  "src/lib/api/amigos.ts#responderPedido": "responder(db, s.userId, id) — prova: 'B não lê nem altera as duplas de A com C'",
  "src/lib/api/amigos.ts#encerrarDupla": "encerrar(db, s.userId, id) — prova: 'B não lê nem altera as duplas de A com C'",
  "src/lib/api/amigos.ts#bloquear": "bloq(db, s.userId, id) — prova: 'B não lê nem altera as duplas de A com C'",
  "src/lib/api/amigos.ts#desbloquear": "desbloq(db, s.userId, ref) — só apaga bloqueio com user_id = sessão",
  "src/lib/api/amigos.ts#denunciar": "denunciarNoServidor(db, s.userId, data) — prova: 'B não lê nem altera as duplas de A com C'",
  "src/lib/api/retrospectiva.ts#minhaRetrospectiva": "ler(db, s.userId, hoje) — só contagens do próprio aluno",
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
          env: { contasAtivas: true, TUTOR_IDADE_SEM_CONSENTIMENTO: 18, AI_COTA_GRATIS_MENSAGENS: 3, AI_TETO_DIARIO_USD: 1, AI_TETO_DIARIO_PAGOS_USD: 5, AI_PRECO_ENTRADA_USD_MTOK: 1, AI_PRECO_SAIDA_USD_MTOK: 8 },
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
