// Configuração da landing (rota `/`). Só valores PÚBLICOS (VITE_*): nada aqui é segredo (docs/40 §20).
const env = import.meta.env;

/** URL pública do site (canonical, og:url, JSON-LD). Vazia = sem canonical (domínio ainda não decidido). */
export const SITE_URL: string = ((env.VITE_SITE_URL as string | undefined) || "").replace(/\/+$/, "");

/**
 * A landing é indexável (docs/44 §7, pedido do usuário de 29/09/2026). `VITE_LP_INDEXABLE=false` desliga, para um
 * ambiente de teste público que não deve aparecer em busca. O produto (demais rotas) é sempre `noindex`.
 */
export const INDEXABLE: boolean = env.VITE_LP_INDEXABLE !== "false";
