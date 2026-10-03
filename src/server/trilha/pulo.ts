/**
 * "Pular para cá" no servidor (spec 50 §5.7.1, RF-17; T-50.12.1–12.2). Tudo pelo `userId` da sessão.
 *
 * - **Onde:** o servidor recalcula a posição do aluno pelas conclusões que ELE tem (`completion`) e só aceita o
 *   capítulo que `alvoDoPulo` aponta. Redação nunca.
 * - **Teste:** 6 a 10 questões de prática/desafio que o aluno nunca respondeu, pelo menos 1 por habilidade do caminho
 *   e do alvo (`comporTestePulo`), sorteadas por aluno + capítulo + dia (a prévia e o começo mostram o mesmo teste).
 *   Sem vida, sem combo, sem Foca IA: as respostas só chegam aqui no fim, e a correção é pelo gabarito.
 * - **Passa** com ≥ 80% de primeira e nenhuma habilidade zerada: as lições do caminho viram `completion` `kind='pulo'`
 *   (chave `pulo:<tipo>:<licaoId>`, sem XP e sem estrelas; a chave de XP da lição, `licao:<tipo>:<id>`, continua
 *   livre para a primeira conclusão de verdade), 20 XP uma vez por capítulo (`pulo:capitulo:<id>`).
 * - **Sempre que termina** (passando ou não): as respostas viram tentativas (`attempt`, fonte `pulo`, evidência comum)
 *   e o teste conta como 1 bloco (dia de estudo, 5 Pérolas pelo teto de blocos, missão "fazer", ofensiva).
 *   Não passar não marca lição nenhuma e não paga XP.
 * - **Limites:** 1 tentativa por capítulo por dia (chave primária de `pulo_tentativa`) e 3 testes por dia.
 */
import { and, eq, or, sql } from "drizzle-orm";
import { checkAnswer } from "@/lib/lessons/define";
import { alvoDoPulo, avaliarPulo, bloqueioDoPulo, comporTestePulo, PULO, type AlvoDoPulo, type ItemDoPool, type LicaoDoCaminho } from "@/lib/learning/pulo";
import { BLOCOS_PAGOS_POR_DIA, chavePerola, PEROLAS_POR_BLOCO, PEROLAS_POR_NIVEL } from "@/lib/perolas";
import { nivelDeXp } from "@/lib/niveis";
import type { JsonObjeto } from "@/lib/json";
import type { NovidadesDoServidor } from "@/lib/sync/contrato";
import type { Banco } from "../db/client";
import { attempt, completion, profile, puloTentativa, questaoRetirada, xpLedger } from "../db/schema";
import { exercicioDoItem } from "../estudo/conteudo";
import { registrarNoCaderno } from "../estudo/caderno";
import { dataNoFuso, marcarDia, pagarXp, type Tx } from "../estudo/sincronizar";
import { creditar, movimentosNoDia } from "../economia/perolas";
import { avaliarConquistas, progredirMissoes } from "../gamificacao/missoes";
import { avaliarOfensiva, historicoDoAluno } from "../gamificacao/ofensiva";
import { alunoTemFuncao, recursoLigado } from "../planos/funcoes";
import { ErroApp } from "../http";

type Leitor = Pick<Banco, "select" | "selectDistinct">;

export type MotivoSemPulo = "DESLIGADO" | "FORA_DO_ALCANCE" | "SEM_QUESTOES" | "CAPITULO_HOJE" | "LIMITE_DO_DIA";

export interface PreviaDoPulo {
  disponivel: boolean;
  motivo: MotivoSemPulo | null;
  capituloId: string;
  /** Lições que ficam "Puladas" se passar. */
  licoes: LicaoDoCaminho[];
  questoes: number;
  testesHoje: number;
  testesPorDia: number;
  /** Teste deste capítulo começado hoje e não terminado (a retomada tem as mesmas questões). */
  emAndamento: string | null;
  /** Teste deste capítulo já terminado hoje: o resultado (o aparelho que não recebeu a resposta ainda o aplica). */
  resultadoDeHoje: ResultadoDoPulo | null;
}

export interface TesteDoPulo {
  id: string;
  capituloId: string;
  subjectId: string;
  itens: string[];
  licoes: LicaoDoCaminho[];
}

export interface ResultadoDoPulo {
  id: string;
  capituloId: string;
  passou: boolean;
  acertos: number;
  total: number;
  itens: { itemId: string; skillId: string; correta: boolean }[];
  /** Habilidades do teste com erro, as zeradas primeiro. */
  valeRevisar: string[];
  /** Marcadas agora como "Puladas" (vazio quando não passou). */
  licoesPuladas: LicaoDoCaminho[];
  /** Habilidades puladas sem questão no teste (só quando passou): ganham revisão agendada no aparelho. */
  semQuestao: string[];
  /** Quando não passou: a primeira lição do caminho ("Comece por"). */
  comecePor: LicaoDoCaminho | null;
  xp: number;
  perolas: number;
}

export interface RespostaDoPulo {
  itemId: string;
  /** `null` = "Não sei". */
  resposta: number | number[] | null;
  exibidos?: string[];
}

async function hojeDoAluno(db: Leitor, userId: string, agora: Date): Promise<string> {
  const [p] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).limit(1);
  return dataNoFuso(agora, p?.tz ?? "America/Sao_Paulo");
}

/** Lições que o servidor considera feitas (conclusão de verdade ou pulo), pelo id da lição. */
export async function licoesConcluidasNoServidor(db: Leitor, userId: string): Promise<Set<string>> {
  const linhas = await db
    .select({ k: completion.key })
    .from(completion)
    .where(and(eq(completion.userId, userId), or(sql`${completion.key} like 'licao:%'`, sql`${completion.key} like 'pulo:%'`)));
  const ids = new Set<string>();
  // `licao:<tipo>:<id>#<evento>` (conclusão) e `pulo:<tipo>:<id>` (pulo).
  for (const { k } of linhas) {
    const partes = k.split("#")[0].split(":");
    if (partes.length >= 3) ids.add(partes.slice(2).join(":"));
  }
  return ids;
}

async function materiaDoCapitulo(capituloId: string) {
  const { CURRICULUM_TREE } = await import("@/content/curriculum-tree");
  return CURRICULUM_TREE.subjects.find((s) => s.sections.some((sec) => sec.chapters.some((c) => c.id === capituloId)));
}

async function alvoNoServidor(db: Leitor, userId: string, capituloId: string): Promise<{ alvo: AlvoDoPulo; subjectId: string } | null> {
  const materia = await materiaDoCapitulo(capituloId);
  if (!materia) return null;
  const feitas = await licoesConcluidasNoServidor(db, userId);
  const alvo = alvoDoPulo(materia, (id) => feitas.has(id));
  return alvo && alvo.capituloId === capituloId ? { alvo, subjectId: materia.id } : null;
}

/** Questões de prática/desafio publicadas e não retiradas (a composição tira as já vistas). */
async function poolDoPulo(db: Leitor): Promise<ItemDoPool[]> {
  const { itemIndex, itemRetirado } = await import("@/content/items");
  const fora = new Set((await db.select({ id: questaoRetirada.itemId }).from(questaoRetirada)).map((r) => r.id));
  return itemIndex()
    .filter((e) => e.status !== "gerada" && !itemRetirado(e.id) && !fora.has(e.id) && (e.roles.includes("pratica") || e.roles.includes("desafio")))
    .map((e) => ({ id: e.id, skills: e.skills, difficulty: e.difficulty }));
}

async function vistosPeloAluno(db: Leitor, userId: string): Promise<Set<string>> {
  return new Set((await db.selectDistinct({ id: attempt.itemId }).from(attempt).where(eq(attempt.userId, userId))).map((r) => r.id));
}

async function composicao(db: Leitor, userId: string, alvo: AlvoDoPulo, hoje: string) {
  // Só itens das habilidades do teste e que o servidor sabe corrigir (há metadado sem exercício publicado).
  const doTeste = (await poolDoPulo(db)).filter((i) => i.skills.some((h) => alvo.habilidades.includes(h)));
  const corrigiveis: ItemDoPool[] = [];
  for (const i of doTeste) if (await exercicioDoItem(i.id)) corrigiveis.push(i);
  return comporTestePulo(alvo.habilidades, corrigiveis, await vistosPeloAluno(db, userId), `${userId}:${alvo.capituloId}:${hoje}`);
}

async function testesDeHoje(db: Leitor, userId: string, hoje: string) {
  return db
    .select({ id: puloTentativa.id, capituloId: puloTentativa.capituloId, concluidoEm: puloTentativa.concluidoEm })
    .from(puloTentativa)
    .where(and(eq(puloTentativa.userId, userId), eq(puloTentativa.localDate, hoje)));
}

/** O que a tela de entrada mostra antes de "Começar" (não gasta tentativa). */
export async function previaDoPulo(db: Banco, userId: string, capituloId: string, agora: Date): Promise<PreviaDoPulo> {
  const hoje = await hojeDoAluno(db, userId, agora);
  const deHoje = await testesDeHoje(db, userId, hoje);
  const base = { capituloId, licoes: [] as LicaoDoCaminho[], questoes: 0, testesHoje: deHoje.length, testesPorDia: PULO.TESTES_POR_DIA };
  const emAndamento = deHoje.find((t) => t.capituloId === capituloId && !t.concluidoEm)?.id ?? null;
  const sem = (motivo: MotivoSemPulo) => ({ ...base, disponivel: false, motivo, emAndamento, resultadoDeHoje: null });
  if (!recursoLigado("pulo")) return sem("DESLIGADO");
  const bloqueio = bloqueioDoPulo(deHoje.map((t) => ({ capituloId: t.capituloId, concluido: !!t.concluidoEm })), capituloId);
  if (bloqueio === "CAPITULO_HOJE") {
    const [feito] = await db
      .select({ d: puloTentativa.detalhe })
      .from(puloTentativa)
      .where(and(eq(puloTentativa.userId, userId), eq(puloTentativa.capituloId, capituloId), eq(puloTentativa.localDate, hoje)))
      .limit(1);
    return { ...sem(bloqueio), resultadoDeHoje: (feito?.d as unknown as ResultadoDoPulo | null) ?? null };
  }
  if (bloqueio) return sem(bloqueio);
  const achado = await alvoNoServidor(db, userId, capituloId);
  if (!achado && !emAndamento) return sem("FORA_DO_ALCANCE");
  if (emAndamento) {
    const [linha] = await db.select().from(puloTentativa).where(and(eq(puloTentativa.userId, userId), eq(puloTentativa.id, emAndamento))).limit(1);
    return { ...base, disponivel: true, motivo: null, emAndamento, resultadoDeHoje: null, licoes: linha?.licoes ?? [], questoes: linha?.itens.length ?? 0 };
  }
  const comp = await composicao(db, userId, achado!.alvo, hoje);
  if (!comp) return { ...sem("SEM_QUESTOES"), licoes: achado!.alvo.licoes };
  return { ...base, disponivel: true, motivo: null, emAndamento: null, resultadoDeHoje: null, licoes: achado!.alvo.licoes, questoes: comp.itens.length };
}

/** Começa (ou retoma) o teste do capítulo. Gasta a tentativa do dia. */
export async function iniciarPulo(db: Banco, userId: string, capituloId: string, agora: Date): Promise<TesteDoPulo> {
  if (!recursoLigado("pulo")) throw new ErroApp(409, "DESLIGADO");
  return db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [perfil] = await tx.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).for("update");
    const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");
    const deHoje = await testesDeHoje(tx, userId, hoje);
    const bloqueio = bloqueioDoPulo(deHoje.map((t) => ({ capituloId: t.capituloId, concluido: !!t.concluidoEm })), capituloId);
    if (bloqueio) throw new ErroApp(409, bloqueio);
    const aberto = deHoje.find((t) => t.capituloId === capituloId);
    if (aberto) {
      const [l] = await tx.select().from(puloTentativa).where(and(eq(puloTentativa.userId, userId), eq(puloTentativa.id, aberto.id))).limit(1);
      return { id: l.id, capituloId, subjectId: l.subjectId, itens: l.itens.map((i) => i.itemId), licoes: l.licoes };
    }
    const achado = await alvoNoServidor(tx, userId, capituloId);
    if (!achado) throw new ErroApp(409, "FORA_DO_ALCANCE");
    const comp = await composicao(tx, userId, achado.alvo, hoje);
    if (!comp) throw new ErroApp(409, "SEM_QUESTOES");
    const id = `pulo-${crypto.randomUUID()}`;
    await tx.insert(puloTentativa).values({
      userId,
      capituloId,
      localDate: hoje,
      id,
      subjectId: achado.subjectId,
      itens: comp.itens,
      licoes: achado.alvo.licoes,
      semQuestao: comp.semQuestao,
      iniciadoEm: agora,
    });
    return { id, capituloId, subjectId: achado.subjectId, itens: comp.itens.map((i) => i.itemId), licoes: achado.alvo.licoes };
  });
}

async function pagarPerolasDoBloco(tx: Tx, userId: string, conclusao: string, dia: string): Promise<number> {
  if ((await movimentosNoDia(tx, userId, "bloco", dia)) >= BLOCOS_PAGOS_POR_DIA) return 0;
  return (await creditar(tx, userId, chavePerola.bloco(conclusao), PEROLAS_POR_BLOCO, "bloco", dia)) ? PEROLAS_POR_BLOCO : 0;
}

async function xpDoAluno(db: Leitor, userId: string): Promise<number> {
  const [x] = await db.select({ s: sql<number>`coalesce(sum(${xpLedger.xp}), 0)` }).from(xpLedger).where(eq(xpLedger.userId, userId));
  return Number(x?.s ?? 0);
}

/** Corrige e aplica os efeitos. Chamar de novo devolve o mesmo resultado, sem pagar nada de novo. */
export async function concluirPulo(db: Banco, userId: string, id: string, respostas: RespostaDoPulo[], agora: Date): Promise<ResultadoDoPulo> {
  const [linha] = await db.select().from(puloTentativa).where(and(eq(puloTentativa.userId, userId), eq(puloTentativa.id, id))).limit(1);
  if (!linha) throw new ErroApp(404, "NAO_ENCONTRADO");
  if (linha.concluidoEm && linha.detalhe) return linha.detalhe as unknown as ResultadoDoPulo;
  // O teste vale só no dia em que começou (revisão L2): ninguém abre, sai para procurar as respostas e conclui depois.
  if (linha.localDate !== (await hojeDoAluno(db, userId, agora))) throw new ErroApp(409, "TESTE_EXPIRADO");
  const porItem = new Map(respostas.map((r) => [r.itemId, r]));
  if (linha.itens.some((i) => !porItem.has(i.itemId))) throw new ErroApp(400, "RESPOSTAS_INCOMPLETAS");

  const corretas = new Map<string, boolean>();
  for (const i of linha.itens) {
    const r = porItem.get(i.itemId)!;
    const ex = await exercicioDoItem(i.itemId);
    corretas.set(i.itemId, !!ex && r.resposta !== null && checkAnswer(ex, r.resposta, r.exibidos));
  }
  const av = avaliarPulo(linha.itens, corretas);
  const comCaderno = await alunoTemFuncao(db, userId, "cadernoDeErros", agora);
  const comPerolas = recursoLigado("perolas");
  const novidades: NovidadesDoServidor = { perolasGanhas: 0, vidasDoCombo: 0, metaCumprida: null, marco: null, perfeitas: 0, conquistas: [], missoesConcluidas: [], desafioDoMes: false };

  return db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [perfil] = await tx.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).for("update");
    const [ja] = await tx.select({ d: puloTentativa.detalhe, c: puloTentativa.concluidoEm }).from(puloTentativa).where(and(eq(puloTentativa.userId, userId), eq(puloTentativa.id, id))).limit(1);
    if (ja?.c && ja.d) return ja.d as unknown as ResultadoDoPulo;
    const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");
    const xpAntes = await xpDoAluno(tx, userId);
    const chaveTentativa = `pulo:${id}`;

    // Evidência: só as respostas do teste, como tentativas comuns (sem combo, sem vida).
    for (const [n, i] of linha.itens.entries()) {
      const r = porItem.get(i.itemId)!;
      const correta = corretas.get(i.itemId) === true;
      await tx
        .insert(attempt)
        .values({
          userId,
          id: `${id.slice(0, 50)}-${n}`,
          itemId: i.itemId,
          skillIds: [i.skillId],
          role: "pratica",
          answer: JSON.stringify(r.resposta),
          correct: correta,
          source: "pulo",
          answeredAt: agora,
          localDate: hoje,
          activityAttemptKey: chaveTentativa,
        })
        .onConflictDoNothing();
      if (comCaderno) await registrarNoCaderno(tx, userId, i.itemId, "pulo", correta, hoje);
    }

    const licoesPuladas: LicaoDoCaminho[] = [];
    let xp = 0;
    if (av.passou) {
      const feitas = await licoesConcluidasNoServidor(tx, userId);
      for (const l of linha.licoes) {
        if (feitas.has(l.id)) continue; // feita de verdade entre o começo e o fim do teste: fica como está
        const r = await tx
          .insert(completion)
          .values({ userId, key: `pulo:${l.tipo}:${l.id}`, kind: "pulo", completedAt: agora })
          .onConflictDoNothing()
          .returning({ k: completion.key });
        if (r.length) licoesPuladas.push(l);
      }
      const chaveXp = `pulo:capitulo:${linha.capituloId}`;
      const [pago] = await tx.select({ k: xpLedger.key }).from(xpLedger).where(and(eq(xpLedger.userId, userId), eq(xpLedger.key, chaveXp))).limit(1);
      if (!pago) {
        await pagarXp(tx, userId, chaveXp, PULO.XP, "pulo", hoje);
        xp = PULO.XP;
      }
    }

    // O teste conta como 1 bloco, passando ou não (spec 50 §5.3.2).
    const chaveBloco = `pulo-teste:${id}`;
    await tx
      .insert(completion)
      .values({ userId, key: chaveBloco, kind: "pulo-teste", scorePct: Math.round((av.acertos * 100) / Math.max(1, av.total)), completedAt: agora })
      .onConflictDoNothing();
    await marcarDia(tx, userId, hoje);
    if (comPerolas) novidades.perolasGanhas += await pagarPerolasDoBloco(tx, userId, chaveBloco, hoje);
    await progredirMissoes(tx, userId, hoje, [{ tipo: "bloco", flashcards: false }], agora, novidades);
    let melhor: number | null = null;
    if (comPerolas) {
      const nivel = nivelDeXp(await xpDoAluno(tx, userId)).nivel;
      if (nivel > nivelDeXp(xpAntes).nivel) {
        for (let n = 2; n <= nivel; n++) {
          if (await creditar(tx, userId, chavePerola.nivel(n), PEROLAS_POR_NIVEL, "nivel", hoje, String(n))) novidades.perolasGanhas += PEROLAS_POR_NIVEL;
        }
      }
      const ofensiva = await avaliarOfensiva(tx, userId, hoje, agora);
      melhor = ofensiva.melhor;
      if (ofensiva.metaCumprida) novidades.perolasGanhas += ofensiva.metaCumprida.perolas;
      if (ofensiva.marco) novidades.perolasGanhas += ofensiva.marco.perolas;
    }
    await avaliarConquistas(tx, userId, hoje, melhor ?? (await historicoDoAluno(tx, userId, agora)).estado.melhorSequencia, novidades);

    const resultado: ResultadoDoPulo = {
      id,
      capituloId: linha.capituloId,
      passou: av.passou,
      acertos: av.acertos,
      total: av.total,
      itens: linha.itens.map((i) => ({ ...i, correta: corretas.get(i.itemId) === true })),
      valeRevisar: av.valeRevisar,
      licoesPuladas,
      semQuestao: av.passou ? linha.semQuestao : [],
      comecePor: av.passou ? null : (linha.licoes[0] ?? null),
      xp,
      perolas: novidades.perolasGanhas,
    };
    await tx
      .update(puloTentativa)
      .set({ resultado: av.passou ? "passou" : "nao-passou", acertos: av.acertos, concluidoEm: agora, detalhe: resultado as unknown as JsonObjeto })
      .where(and(eq(puloTentativa.userId, userId), eq(puloTentativa.id, id)));
    return resultado;
  });
}
