/**
 * Entrada de demonstração (decisão D-15, temporária — docs/specs/46-producao §0). Enquanto o servidor de produção
 * não tem banco e segredo configurados, as contas ficam desligadas e "entrar" é só local: um cookie que a guarda de
 * rotas lê. Não é credencial: não dá acesso a dado nenhum no servidor, e deixa de valer sozinho quando as contas
 * são ligadas (aí a guarda pede o login real e o progresso local vai para a tela de importação).
 */
export const COOKIE_DEMONSTRACAO = "foca_demo";
const UM_ANO_S = 365 * 24 * 60 * 60;

function segura(): string {
  return typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
}

export function entrarEmDemonstracao(): void {
  document.cookie = `${COOKIE_DEMONSTRACAO}=1; path=/; max-age=${UM_ANO_S}; samesite=lax${segura()}`;
}

export function sairDaDemonstracao(): void {
  document.cookie = `${COOKIE_DEMONSTRACAO}=; path=/; max-age=0; samesite=lax${segura()}`;
}
