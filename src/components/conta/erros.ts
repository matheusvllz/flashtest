/**
 * Tradução dos erros da autenticação para as mensagens do Foca (docs/copy/03-ux-writing.md §2).
 * Nenhuma mensagem diz se um e-mail tem conta (anti-enumeração).
 */
import { COPY } from "@/lib/copy";

export interface ErroDeAuth {
  status?: number;
  code?: string;
  message?: string;
}

export function mensagemDeErro(e: ErroDeAuth | null | undefined): string {
  if (!e) return COPY.conta.erros.generico;
  const E = COPY.conta.erros;
  if (e.status === 429) return E.muitasTentativas;
  switch (e.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "USER_NOT_FOUND":
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return E.credenciais;
    case "EMAIL_NOT_VERIFIED":
      return E.emailNaoVerificado;
    case "PASSWORD_TOO_SHORT":
      return E.senhaCurta;
    case "INVALID_EMAIL":
      return E.emailInvalido;
    case "INVALID_TOKEN":
      return COPY.conta.linkInvalido;
  }
  if (e.status === 0 || e.message === "Failed to fetch") return E.rede;
  return E.generico;
}

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
