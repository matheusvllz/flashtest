import { useEffect } from "react";
import { assinaturaDoFoco, ensurePlan } from "@/lib/adaptive/journey";
import { FEATURES } from "@/lib/features";
import {
  clearExpiredFocusSession,
  commitPlan,
  getState,
  hojeISO,
  type AppState,
} from "@/lib/store";

/**
 * Mantém o plano da jornada em dia (docs/30 §14–§15; docs/36 RF-9). Extraído da `/trilha` (spec 48 T-48.4.2) para o
 * `/plan` mostrar o MESMO plano, sem um segundo planejador: refaz a fila quando falta atividade, quando a versão do
 * planejador muda ou quando o foco/os assuntos escolhidos mudam (`assinaturaDoFoco`); a atividade em andamento fica.
 * Não roda enquanto o nivelamento está sendo aplicado (`aplicando`), para não planejar com o modelo velho.
 */
export function useJornadaEmDia(s: AppState, aplicando: boolean): void {
  const focusSignature = assinaturaDoFoco(s);

  useEffect(() => {
    if (!FEATURES.jornadaAdaptativa) return;
    if (aplicando) return;
    const hoje = hojeISO();
    // "Só hoje" vencido some sem recarregar o app (docs/36 RF-9). Ao limpar, o
    // estado muda e este efeito roda de novo com o foco já sem a sessão.
    if (clearExpiredFocusSession(hoje)) return;
    // Estado MAIS RECENTE (não a fotografia do render): quem chama pode ter acabado de
    // mover/tirar a atividade concluída de `committed`.
    const atual = getState();
    // Mudança de foco força replano mesmo com `committed` cheio (docs/30 §15:
    // "comprometidas fora do novo foco são descartadas") — `ensurePlan` sozinho só
    // replaneja por `committed` curto/`planVersion` velha. Compara com a assinatura
    // PERSISTIDA no último plano (docs/36 RF-9), não com um ref desta montagem: o
    // foco mudado em `/profile` ou em `/topics` também é visto aqui. Sem assinatura
    // persistida (conta antiga) grava sem forçar.
    const persistida = atual.learning.journey.focusSignature;
    const focusMudou = persistida !== undefined && persistida !== focusSignature;
    const result = ensurePlan(atual, hoje, hoje, { forceReplan: focusMudou });
    if (result) commitPlan(result.committed, result.upcoming, focusSignature);
    else if (persistida !== focusSignature) {
      // Nada a trocar na fila, mas a assinatura precisa ser registrada (senão o replano forçado repetiria a cada mudança de estado).
      commitPlan(atual.learning.journey.committed, atual.learning.journey.upcoming, focusSignature);
    }
  }, [s, focusSignature, aplicando]);

  // Volta ao app depois da meia-noite (aba em segundo plano): o "só hoje" de ontem some (docs/36 RF-9).
  useEffect(() => {
    if (!FEATURES.jornadaAdaptativa) return;
    const aoVoltar = () => {
      if (document.visibilityState === "visible") clearExpiredFocusSession(hojeISO());
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, []);
}
