import { useEffect } from "react";
import { computePlacementOutcome } from "@/lib/adaptive/placement-pool";
import { carregarTodosOsPacotes } from "@/lib/content/preload";
import { FEATURES } from "@/lib/features";
import { applyPlacementOutcome, getState, hojeISO, useAppState } from "@/lib/store";

/**
 * Aplica o nivelamento terminado que ainda não foi aplicado (docs/36 T-03.3,
 * RF-10/RF-11; bug C1/B3). É o ÚNICO caminho que aplica priors: cobre o término
 * normal (última resposta), o pool que acaba antes do teto, a interrupção entre
 * "concluído" e "aplicado" (reload) e as contas que terminaram o nivelamento
 * antes deste plano (`status "concluido"` sem `appliedAt`).
 *
 * Vive fora do store de propósito: `computePlacementOutcome` importa o catálogo
 * (`placement-pool.ts`) e `store.ts` não pode (fronteira de bundle, docs/30
 * §21.3). O store só recebe o resultado, em `applyPlacementOutcome`, que é
 * idempotente e reconfere o estado fresco — então rodar duas vezes (StrictMode,
 * duas rotas) nunca aplica duas vezes.
 *
 * `aplicando` é derivado do estado (não é um `useState` à parte): é verdadeiro
 * enquanto houver placement concluído sem `appliedAt`, e volta a falso na mesma
 * renderização em que `appliedAt` aparece — sem quadro intermediário mostrando o
 * plano velho.
 */
export function usePlacementReconciliation(): { aplicando: boolean } {
  const placement = useAppState().learning.placement;
  const pendente = FEATURES.nivelamento && placement?.status === "concluido" && !placement.appliedAt;

  useEffect(() => {
    if (!pendente) return;
    let cancelado = false;
    void (async () => {
      // Pacotes primeiro: com eles em memória o pool diagnóstico atual resolve os itens
      // (sem eles o mapa ainda se reconstitui pela meta do catálogo). Falha de rede não impede aplicar.
      await carregarTodosOsPacotes();
      if (cancelado) return;
      const atual = getState().learning;
      const p = atual.placement;
      if (!p || p.status !== "concluido" || p.appliedAt) return;
      const outcome = computePlacementOutcome(p, atual.skillModel, hojeISO());
      applyPlacementOutcome({
        skillModel: outcome.skillModel,
        appliedAt: new Date().toISOString(),
        ausentes: outcome.ausentes.length,
      });
    })();
    return () => {
      cancelado = true;
    };
  }, [pendente]);

  return { aplicando: Boolean(pendente) };
}
