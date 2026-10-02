/**
 * Funções pagas abertas para o aluno (spec 49 §5.9), pedidas ao servidor uma vez por página e compartilhadas.
 * Sem conta (modo de demonstração) ou sem plano pago: lista vazia — nada pago aparece.
 */
import { useEffect, useState } from "react";
import { minhasFuncoes } from "@/lib/api/funcoes";
import { removerOffline } from "@/lib/offline/service-worker";
import type { Funcao } from "@/lib/planos";

let cache: Promise<ReadonlySet<Funcao>> | null = null;
const VAZIO: ReadonlySet<Funcao> = new Set();

export function carregarMinhasFuncoes(forcar = false): Promise<ReadonlySet<Funcao>> {
  if (!cache || forcar) {
    cache = minhasFuncoes().then(
      (r) => {
        if (!r.ok) return VAZIO;
        // Plano sem estudo sem internet (cancelou, venceu): o que estava baixado sai do aparelho.
        if (!r.funcoes.includes("semInternet")) void removerOffline();
        return new Set(r.funcoes);
      },
      () => VAZIO,
    );
  }
  return cache;
}

/** `ativo = false` (ex.: aluno sem conta no aparelho) não pede nada ao servidor. */
export function useMinhasFuncoes(ativo: boolean): ReadonlySet<Funcao> {
  const [f, setF] = useState<ReadonlySet<Funcao>>(VAZIO);
  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    void carregarMinhasFuncoes().then((x) => vivo && setF(x));
    return () => {
      vivo = false;
    };
  }, [ativo]);
  return f;
}
