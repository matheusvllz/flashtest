import { useEffect, useState } from "react";

/**
 * Destinos do produto usados pela landing (docs/44 §3). Agora é o mesmo site: rotas internas do roteador, sem URL
 * absoluta nem variável de ambiente. Um único lugar para trocar a topologia.
 */
export const APP_DESTINOS = {
  /** "Começar grátis": o onboarding. */
  comecar: "/quiz",
  /** "Entrar". */
  entrar: "/login",
  /** Quem já tem conta neste aparelho: a porta do produto decide trilha ou onboarding. */
  continuar: "/app",
} as const;

/** Mesma chave do store do app (src/lib/store.ts). Leitura só para decidir o CTA; a landing nunca grava estado. */
const CHAVE_ESTADO = "foca.state.v3";

/**
 * `true` quando este aparelho já tem uma conta com onboarding feito. Lido DEPOIS da montagem: o HTML do servidor
 * (e o primeiro render do cliente) é sempre o do visitante novo, então não há diferença de hidratação. Sem
 * redirecionamento: a landing continua visível para quem quiser lê-la (docs/44 §3).
 */
export function useContaNoAparelho(): boolean {
  const [temConta, setTemConta] = useState(false);
  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE_ESTADO);
      const estado = bruto ? (JSON.parse(bruto) as { authed?: boolean; onboarded?: boolean }) : null;
      setTemConta(!!estado?.authed && !!estado?.onboarded);
    } catch {
      /* armazenamento bloqueado ou JSON ilegível: trata como visitante novo */
    }
  }, []);
  return temConta;
}
