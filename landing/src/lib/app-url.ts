import { APP_URL } from "../config";

/**
 * Único jeito de montar link para o app (docs/40 §15.6). Trocar a topologia de hospedagem
 * (subdomínio, `/app`, mesmo domínio) é trocar VITE_APP_URL, sem tocar nas seções.
 */
export function appUrl(path: string, base: string = APP_URL): string {
  new URL(base); // falha cedo se a base não for uma URL válida
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/** Destinos do app usados pela landing. */
export const APP_DESTINOS = {
  comecar: "/quiz",
  entrar: "/",
} as const;
