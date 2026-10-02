/**
 * Portão das funções pagas (spec 49 §5.9, RF-12): o plano vem do servidor (D49-01) e cada função tem uma chave para
 * ser desligada sem deploy (`FUNCOES_DESLIGADAS`). Desligar ou perder o plano fecha a tela; os dados ficam guardados.
 */
import type { Funcao } from "@/lib/planos";
import { temFuncao } from "@/lib/planos";
import type { Banco } from "../db/client";
import { env } from "../env";
import { ehLocal } from "../pagamentos/provedor";
import { planoDoAluno } from "./plano";

const CHAVE: Partial<Record<Funcao, string>> = {
  cadernoDeErros: "caderno",
  cronograma: "cronograma",
  explicaOutroJeito: "explica",
  semInternet: "offline",
  treinoRedacao: "treino",
  corretorRedacao: "corretor",
  simulado: "simulado",
};

export function funcaoLigada(f: Funcao): boolean {
  const e = env();
  if (f === "corretorRedacao" && e.CORRETOR_HABILITADO !== true && !ehLocal(e)) return false;
  // Simulado parado por falta de itens revisados (T-49.9.5, B-040/B-041).
  if (f === "simulado") return false;
  const desligadas = new Set((e.FUNCOES_DESLIGADAS ?? "").split(",").map((x) => x.trim()).filter(Boolean));
  const chave = CHAVE[f];
  return !(chave && desligadas.has(chave));
}

export async function alunoTemFuncao(db: Banco, userId: string, f: Funcao, agora: Date): Promise<boolean> {
  return funcaoLigada(f) && temFuncao(await planoDoAluno(db, userId, agora), f);
}

/**
 * Recursos da spec 50 que valem para TODOS os planos (não são funções pagas): ligados por padrão e desligáveis sem
 * deploy pela mesma `FUNCOES_DESLIGADAS` (D50-14 / DV50: o dono quer ver o resultado em produção). Os recursos
 * sociais (ligas, amigos) e os lembretes NÃO entram aqui: dependem de variável própria ligada de propósito.
 */
export type Recurso50 = "perolas" | "missoes" | "miniSimulado" | "escrita" | "retrospectiva" | "pulo";

export function recursoLigado(r: Recurso50): boolean {
  const desligadas = new Set((env().FUNCOES_DESLIGADAS ?? "").split(",").map((x) => x.trim()).filter(Boolean));
  return !desligadas.has(r);
}
