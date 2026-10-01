/**
 * Destinos do produto usados pela landing (docs/44 §3). Agora é o mesmo site: rotas internas do roteador, sem URL
 * absoluta nem variável de ambiente. Um único lugar para trocar a topologia.
 */
export const APP_DESTINOS = {
  /** "Começar grátis": o onboarding. */
  comecar: "/quiz",
  /** "Entrar". */
  entrar: "/login",
} as const;
