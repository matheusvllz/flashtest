/**
 * Regras do lembrete diário que o navegador e o servidor dividem (spec 50 §5.2.5). Sem dependências.
 *
 * Janelas: o cron do plano Hobby da Vercel roda uma vez por dia com precisão de 1 hora, então cada janela é "por volta
 * de" um horário de Brasília (UTC−3): manhã 09h, tarde 14h, fim de tarde 18h, noite 20h (`vercel.json`).
 */
export const JANELAS_DO_LEMBRETE = ["manha", "tarde", "fim-de-tarde", "noite"] as const;
export type JanelaDoLembrete = (typeof JANELAS_DO_LEMBRETE)[number];
export const JANELA_PADRAO: JanelaDoLembrete = "fim-de-tarde";

const SERVICOS_DE_PUSH = [
  /^fcm\.googleapis\.com$/,
  /^android\.googleapis\.com$/,
  /^([\w-]+\.)*push\.services\.mozilla\.com$/,
  /^([\w-]+\.)*push\.apple\.com$/,
  /^([\w-]+\.)*notify\.windows\.com$/,
];

/**
 * Endereço de push aceito: só HTTPS, porta padrão, sem usuário/senha e só nos serviços de push conhecidos (FCM,
 * Mozilla, Apple, Windows). O servidor faz POST nesse endereço: aceitar qualquer um seria SSRF.
 */
export function endpointDePushValido(endpoint: string): boolean {
  try {
    const u = new URL(endpoint);
    if (u.protocol !== "https:" || u.port !== "" || u.username || u.password) return false;
    return SERVICOS_DE_PUSH.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}
