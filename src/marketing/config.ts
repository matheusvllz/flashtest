// Configuração da landing (rota `/`). Só valores PÚBLICOS (VITE_*): nada aqui é segredo (docs/40 §20).
const env = import.meta.env;

/** Domínio de produção (spec 48 D48-05). */
export const DOMINIO_PRODUCAO = "https://focaedu.com";

/**
 * URL pública do site (canonical, og:url, JSON-LD). `VITE_SITE_URL` prevalece; sem ela, o build de produção usa o
 * domínio oficial (inclusive nos previews, para o canonical não apontar para um endereço temporário) e o
 * desenvolvimento fica sem canonical.
 */
export const SITE_URL: string = ((env.VITE_SITE_URL as string | undefined) || (env.PROD ? DOMINIO_PRODUCAO : "")).replace(
  /\/+$/,
  "",
);

/**
 * A landing é indexável (docs/44 §7, pedido do usuário de 29/09/2026). `VITE_LP_INDEXABLE=false` desliga, para um
 * ambiente de teste público que não deve aparecer em busca. O produto (demais rotas) é sempre `noindex`.
 */
export const INDEXABLE: boolean = env.VITE_LP_INDEXABLE !== "false";
