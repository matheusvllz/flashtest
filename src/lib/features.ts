/**
 * Flags locais de rollout (docs/20 §17, Fase 12) — não é um serviço remoto,
 * só constantes que ligam/desligam entrada sem apagar dados. Ligadas em
 * 21/09/2026 depois do piloto completo (Fases 6-11) passar em 136 testes
 * unitários + 20 E2E reais de navegador — ver docs/22 pro registro da
 * validação e das limitações (sem dispositivo real, sem observação de
 * participante humano). A nova identidade sonora (Fase 4) nunca teve flag —
 * já estava em produção, sem risco de dado.
 *
 * `microlicoes` é a flag que efetivamente gateia algo hoje (a entrada do
 * dashboard pra `/trilha`); `dicasVestibular`/`recomendacaoAdaptativa` vivem
 * dentro do fluxo de microlição e não têm um gate próprio ainda — mantidas
 * aqui como registro de rollout, não como interruptor funcional separado.
 *
 * Desativar uma flag esconde a entrada correspondente; nunca apaga dado já
 * salvo (docs/20 §17) — nenhuma leitura de estado deve depender do valor
 * atual de uma flag pra decidir o que existe no storage.
 */
export interface FeatureFlags {
  microlicoes: boolean;
  trilhaAprendizado: boolean;
  dicasVestibular: boolean;
  recomendacaoAdaptativa: boolean;
  /**
   * `/trilha` como home (docs/25 §17/§18 Fase 7). `false` durante T-01…T-19 e
   * ainda em T-20/T-21 enquanto a trilha nova é construída — T-22 liga em
   * definitivo depois dos E2E de T-27 existirem. Desligada, `/dashboard`
   * continua sendo a home real; ligada, `/dashboard` redireciona pra `/trilha`.
   */
  trilhaComoHome: boolean;
}

export const FEATURES: FeatureFlags = {
  microlicoes: true,
  trilhaAprendizado: true,
  dicasVestibular: true,
  recomendacaoAdaptativa: true,
  trilhaComoHome: true,
};

/** Alvo único de "voltar pro início" — segue a flag acima (docs/25 §18 T-20). */
export const HOME_ROUTE = FEATURES.trilhaComoHome ? "/trilha" : "/dashboard";
