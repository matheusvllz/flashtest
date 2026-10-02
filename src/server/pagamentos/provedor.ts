/**
 * Qual provedor de pagamento usar (spec 49 T-49.3.1): o Asaas quando as credenciais existem; o falso só em
 * desenvolvimento local e testes (sem `VERCEL_ENV`). Num ambiente implantado sem credenciais, não há provedor.
 */
import { env, type Env } from "../env";
import { criarAsaas } from "./asaas";
import { provedorFalso } from "./falso";
import type { Provedor } from "./tipos";

/** Local = fora da Vercel (dev e testes): é onde o provedor falso e a simulação de pagamento existem. */
export function ehLocal(e: Pick<Env, "VERCEL_ENV" | "producao">): boolean {
  return !e.VERCEL_ENV && !e.producao;
}

export function provedorDePagamento(): Provedor | null {
  const e = env();
  if (e.ASAAS_API_URL && e.ASAAS_API_KEY) return criarAsaas(e.ASAAS_API_URL, e.ASAAS_API_KEY);
  return ehLocal(e) ? provedorFalso : null;
}

/** A venda está aberta? Implantado: só com `pagamentosAtivos`. Local: com contas, usando o provedor falso. */
export function vendaLigada(e: Env): boolean {
  return e.pagamentosAtivos || (ehLocal(e) && e.contasAtivas && e.PAGAMENTOS_HABILITADO !== false);
}
