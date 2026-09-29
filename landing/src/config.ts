// Configuração da landing. Só valores PÚBLICOS (VITE_*): nada aqui é segredo (docs/40 §15.6, §20).
const env = import.meta.env;

/** Onde o app do Foca está publicado. Todo link para o app passa por `appUrl()`. */
export const APP_URL: string = (env.VITE_APP_URL as string | undefined) || "http://localhost:8080";

/** URL pública desta landing. Vazia = sem canonical/og:url (domínio ainda não decidido, docs/40 DEP-4). */
export const SITE_URL: string = ((env.VITE_SITE_URL as string | undefined) || "").replace(/\/+$/, "");

/** Só vira `true` depois de o proprietário aprovar a publicação (D-LP-5). Padrão: noindex. */
export const INDEXABLE: boolean = env.VITE_LP_INDEXABLE === "true";

/**
 * D-LP-1: a página pode dizer "Começar não custa nada"? Enquanto o usuário não confirmar,
 * fica `true` só para desenvolvimento; a publicação exige a confirmação (docs/40 §10).
 * `false` troca a microcopy e remove a pergunta "Precisa pagar?" das dúvidas.
 */
export const LP_FALA_DE_PRECO = true;
