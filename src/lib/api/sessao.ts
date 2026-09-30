/**
 * Estado da sessão para a interface (docs/specs/46-producao T-05.5). Módulo propositalmente
 * pequeno e sem zod: é importado pela raiz do app (guarda das rotas), e a raiz não pode puxar
 * nada pesado para a landing (regra de code splitting, docs/arquitetura/contratos.md).
 */
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { COOKIE_DEMONSTRACAO } from "@/lib/conta/demonstracao";
import { LEGAL } from "@/lib/legal";
import { env } from "@/server/env";
import { sessaoAtual } from "@/server/http";

export interface EstadoDaSessao {
  autenticado: boolean;
  /** Dono da sessão: o estado local só é mostrado se for desta conta (aparelho compartilhado, T-07.2). */
  userId: string | null;
  /** Cadastro completo: ano de nascimento informado e documentos legais vigentes aceitos. */
  cadastroCompleto: boolean;
  emailVerificado: boolean;
  nome: string | null;
  email: string | null;
  /** Precisa aceitar de novo porque a versão dos termos ou da política mudou. */
  reaceitePendente: boolean;
  /** "demonstracao" = contas desligadas no servidor (D-15): entrada local, progresso só no aparelho. */
  modo: "contas" | "demonstracao";
}

export const obterSessao = createServerFn({ method: "GET" }).handler(async (): Promise<EstadoDaSessao> => {
  if (!env().contasAtivas) {
    const entrou = getCookie(COOKIE_DEMONSTRACAO) === "1";
    return { autenticado: entrou, userId: null, cadastroCompleto: entrou, emailVerificado: entrou, nome: null, email: null, reaceitePendente: false, modo: "demonstracao" };
  }
  const s = await sessaoAtual();
  if (!s) return { autenticado: false, userId: null, cadastroCompleto: false, emailVerificado: false, nome: null, email: null, reaceitePendente: false, modo: "contas" };
  const aceitouVigentes = s.termosVersao === LEGAL.termos.versao && s.privacidadeVersao === LEGAL.privacidade.versao;
  return {
    autenticado: true,
    userId: s.userId,
    cadastroCompleto: s.anoNascimento !== null && aceitouVigentes,
    emailVerificado: s.emailVerificado,
    nome: s.nome,
    email: s.email,
    reaceitePendente: s.anoNascimento !== null && !aceitouVigentes,
    modo: "contas",
  };
});
