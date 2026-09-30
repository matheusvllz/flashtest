/**
 * Estado da sessão para a interface (docs/specs/46-producao T-05.5). Módulo propositalmente
 * pequeno e sem zod: é importado pela raiz do app (guarda das rotas), e a raiz não pode puxar
 * nada pesado para a landing (regra de code splitting, docs/arquitetura/contratos.md).
 */
import { createServerFn } from "@tanstack/react-start";
import { LEGAL } from "@/lib/legal";
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
}

export const obterSessao = createServerFn({ method: "GET" }).handler(async (): Promise<EstadoDaSessao> => {
  const s = await sessaoAtual();
  if (!s) return { autenticado: false, userId: null, cadastroCompleto: false, emailVerificado: false, nome: null, email: null, reaceitePendente: false };
  const aceitouVigentes = s.termosVersao === LEGAL.termos.versao && s.privacidadeVersao === LEGAL.privacidade.versao;
  return {
    autenticado: true,
    userId: s.userId,
    cadastroCompleto: s.anoNascimento !== null && aceitouVigentes,
    emailVerificado: s.emailVerificado,
    nome: s.nome,
    email: s.email,
    reaceitePendente: s.anoNascimento !== null && !aceitouVigentes,
  };
});
