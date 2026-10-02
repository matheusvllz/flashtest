/**
 * Funções pagas (spec 49 §5.9, F9). O plano vem só do servidor; função fechada responde `fechado: true` (os dados
 * continuam guardados, para voltar quando o aluno assinar de novo).
 */
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Funcao } from "@/lib/planos";
import { banco } from "@/server/db/client";
import { profile } from "@/server/db/schema";
import { itensDoCaderno, type ItemDoCaderno } from "@/server/estudo/caderno";
import { lerCronograma, salvarCronograma as salvar, type CronogramaSalvo } from "@/server/estudo/cronograma";
import { dataNoFuso } from "@/server/estudo/sincronizar";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import { alunoTemFuncao, funcaoLigada } from "@/server/planos/funcoes";
import { planoDoAluno } from "@/server/planos/plano";
import { temFuncao, BENEFICIOS } from "@/lib/planos";

type Erro = { ok: false; codigo: string };

async function hojeDoAluno(db: Awaited<ReturnType<typeof banco>>, userId: string, agora: Date): Promise<string> {
  const [p] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).limit(1);
  return dataNoFuso(agora, p?.tz ?? "America/Sao_Paulo");
}

/** Funções abertas para o aluno agora (plano do servidor + chaves de desligamento). Sem sessão: nenhuma. */
export const minhasFuncoes = createServerFn({ method: "GET" }).handler(async (): Promise<{ ok: true; funcoes: Funcao[] } | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    const plano = await planoDoAluno(db, s.userId, new Date());
    return { ok: true, funcoes: BENEFICIOS[plano].funcoes.filter((f) => temFuncao(plano, f) && funcaoLigada(f)) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

export const meuCaderno = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: true; fechado: boolean; itens: ItemDoCaderno[]; hoje: string } | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      const agora = new Date();
      const hoje = await hojeDoAluno(db, s.userId, agora);
      // Plano caiu (ou nunca teve): o que já foi guardado continua visível, só para leitura (spec 49 §18).
      const fechado = !(await alunoTemFuncao(db, s.userId, "cadernoDeErros", agora));
      return { ok: true, fechado, itens: await itensDoCaderno(db, s.userId, hoje), hoje };
    } catch (e) {
      return respostaDeErro(e);
    }
  },
);

export const meuCronograma = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: true; fechado: boolean; cronograma: CronogramaSalvo | null } | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      const fechado = !(await alunoTemFuncao(db, s.userId, "cronograma", new Date()));
      return { ok: true, fechado, cronograma: fechado ? null : await lerCronograma(db, s.userId) };
    } catch (e) {
      return respostaDeErro(e);
    }
  },
);

const pedidoCronograma = z.object({
  diasSemana: z.number().int().min(1).max(7),
  minutosDia: z.number().int().min(10).max(240),
  dataProva: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const salvarCronograma = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoCronograma.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; cronograma: CronogramaSalvo } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `cronograma:${s.userId}`, 600, 20);
      if (!(await alunoTemFuncao(db, s.userId, "cronograma", new Date()))) return { ok: false, codigo: "FUNCAO_FECHADA" };
      return { ok: true, cronograma: await salvar(db, s.userId, data, new Date()) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });
