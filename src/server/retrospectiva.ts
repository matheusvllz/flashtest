/**
 * Retrospectiva pós-ENEM (spec 50 §5.7.3): "Seu ano no Foca". Só contagens do próprio aluno, sem nota, sem previsão,
 * sem comparação com outros. Disponível do dia seguinte ao 2º dia de prova (ou `RETROSPECTIVA_INICIO`) até 31/01.
 */
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import type { Banco } from "./db/client";
import { attempt, completion, redacao, simulado, studyDay } from "./db/schema";
import { env } from "./env";
import { historicoDoAluno } from "./gamificacao/ofensiva";
import { areaDoItem } from "./estudo/conteudo";
import { recursoLigado } from "./planos/funcoes";

/** Segundo domingo de novembro do ano (2º dia de prova padrão do ENEM; a data oficial entra por variável). */
export function segundoDomingoDeNovembro(ano: number): string {
  const d = new Date(Date.UTC(ano, 10, 1));
  while (d.getUTCDay() !== 0) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

/** Janela da retrospectiva para o "ano do ENEM" de `hoje`: [início, 31/01 do ano seguinte]. */
export function janelaDaRetrospectiva(hoje: string, inicioConfigurado?: string): { ano: number; inicio: string; fim: string; aberta: boolean } {
  const anoHoje = Number(hoje.slice(0, 4));
  // Em janeiro, a retrospectiva ainda é a do ano anterior.
  const ano = hoje.slice(5, 7) === "01" ? anoHoje - 1 : anoHoje;
  const segundoDia = inicioConfigurado && Number(inicioConfigurado.slice(0, 4)) === ano ? inicioConfigurado : segundoDomingoDeNovembro(ano);
  const d = new Date(`${segundoDia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (inicioConfigurado && Number(inicioConfigurado.slice(0, 4)) === ano ? 0 : 1));
  const inicio = d.toISOString().slice(0, 10);
  const fim = `${ano + 1}-01-31`;
  return { ano, inicio, fim, aberta: hoje >= inicio && hoje <= fim };
}

export interface Retrospectiva {
  aberta: boolean;
  ano: number;
  inicio: string;
  dias: number;
  licoes: number;
  questoes: number;
  melhorOfensiva: number;
  /** Áreas mais praticadas, da mais para a menos. */
  areas: { area: "LC" | "CH" | "CN" | "MT"; questoes: number }[];
  redacoes: number;
  simulados: number;
}

export async function minhaRetrospectiva(db: Banco, userId: string, hoje: string, agora: Date): Promise<Retrospectiva> {
  const j = janelaDaRetrospectiva(hoje, env().RETROSPECTIVA_INICIO);
  const desde = `${j.ano}-01-01`;
  const ate = j.fim;
  const vazio: Retrospectiva = { aberta: false, ano: j.ano, inicio: j.inicio, dias: 0, licoes: 0, questoes: 0, melhorOfensiva: 0, areas: [], redacoes: 0, simulados: 0 };
  if (!recursoLigado("retrospectiva") || !j.aberta) return vazio;

  const [dias] = await db.select({ n: count() }).from(studyDay).where(and(eq(studyDay.userId, userId), gte(studyDay.localDate, desde), lte(studyDay.localDate, ate)));
  const [lic] = await db
    .select({ n: count() })
    .from(completion)
    .where(
      and(
        eq(completion.userId, userId),
        sql`${completion.kind} in ('licao-micro', 'licao-redacao', 'pratica', 'desafio', 'reforco', 'introducao', 'revisao')`,
        gte(completion.completedAt, new Date(`${desde}T00:00:00Z`)),
      ),
    );
  const [q] = await db
    .select({ n: count() })
    .from(attempt)
    .where(and(eq(attempt.userId, userId), eq(attempt.tentativa, "primeira"), gte(attempt.localDate, desde), lte(attempt.localDate, ate)));
  // Áreas: conta por item distinto (no máximo 400 itens, para a consulta não pesar).
  const porItem = await db
    .select({ item: attempt.itemId, n: count() })
    .from(attempt)
    .where(and(eq(attempt.userId, userId), eq(attempt.tentativa, "primeira"), gte(attempt.localDate, desde), lte(attempt.localDate, ate)))
    .groupBy(attempt.itemId)
    .limit(400);
  const areas = new Map<"LC" | "CH" | "CN" | "MT", number>();
  for (const r of porItem) {
    const a = await areaDoItem(r.item);
    if (a) areas.set(a, (areas.get(a) ?? 0) + Number(r.n));
  }
  const [red] = await db.select({ n: count() }).from(redacao).where(and(eq(redacao.userId, userId), gte(redacao.criadaEm, new Date(`${desde}T00:00:00Z`))));
  const [sim] = await db
    .select({ n: count() })
    .from(simulado)
    .where(and(eq(simulado.userId, userId), sql`${simulado.concluidoEm} is not null`, gte(simulado.iniciadoEm, new Date(`${desde}T00:00:00Z`))));
  return {
    aberta: true,
    ano: j.ano,
    inicio: j.inicio,
    dias: Number(dias?.n ?? 0),
    licoes: Number(lic?.n ?? 0),
    questoes: Number(q?.n ?? 0),
    melhorOfensiva: (await historicoDoAluno(db, userId, agora)).estado.melhorSequencia,
    areas: [...areas.entries()].sort((a, b) => b[1] - a[1]).map(([area, questoes]) => ({ area, questoes })),
    redacoes: Number(red?.n ?? 0),
    simulados: Number(sim?.n ?? 0),
  };
}
