/**
 * Configuração dos anúncios do Free (spec 49 §5.4), pedida ao servidor uma vez por página e compartilhada.
 */
import { useEffect, useState } from "react";
import { configAnuncios } from "@/lib/api/recompensas";
import type { ConfigAnunciosCliente } from "@/lib/anuncios";

let configCache: Promise<ConfigAnunciosCliente | null> | null = null;

export function carregarConfigAnuncios(forcar = false): Promise<ConfigAnunciosCliente | null> {
  if (!configCache || forcar) {
    configCache = configAnuncios().then(
      (r) => (r.ok ? { ativo: r.ativo, provedor: r.provedor, unidades: r.unidades, menor: r.menor, consentimento: r.consentimento } : null),
      () => null,
    );
  }
  return configCache;
}

/** Depois de uma decisão de cookies: a próxima leitura já vem com ela. */
export function definirConfigAnuncios(c: ConfigAnunciosCliente): void {
  configCache = Promise.resolve(c);
}

export function useConfigAnuncios(ativo: boolean): ConfigAnunciosCliente | null {
  const [cfg, setCfg] = useState<ConfigAnunciosCliente | null>(null);
  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    void carregarConfigAnuncios().then((c) => vivo && setCfg(c));
    return () => {
      vivo = false;
    };
  }, [ativo]);
  return cfg;
}
