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
  /**
   * Aprendizagem adaptativa (docs/30/31, aprovado em 23/09/2026). Uma flag
   * por sinal, ligada só depois da fase correspondente ter suíte verde —
   * ver `docs/32` pro estado real de cada uma. Desligada = comportamento
   * idêntico ao pré-`30`; nenhuma leitura de estado depende do valor atual
   * pra decidir o que existe no storage (mesma regra das flags acima).
   */
  /** Fase 3 (T-3.7): busca pacotes de conteúdo (`src/lib/content/repository.ts`) como 4ª fonte de `resolveExercise`/`phaseById`. */
  pacotesConteudo: boolean;
  /** Fase 5: calcula Mastery/Confidence em modo sombra ("shadow") ou visível ("on") ao gravar tentativa. */
  masteryModel: "off" | "shadow" | "on";
  /** Fase 6: `/study`/`LessonPlayer` também gravam `Attempt` (hoje só a microlição grava). */
  sinaisAmpliados: boolean;
  /** Fase 6: botão "Não sei" nas telas de questão. */
  botaoNaoSei: boolean;
  /** Fase 7: escada de 3 níveis de explicação em vez de "Explicar melhor" único. */
  explicacaoEmCamadas: boolean;
  /** Fase 7: Foca IA recebe `PedagogicalContext` (habilidade, Mastery/Confidence, erros recentes). */
  contextoPedagogicoIA: boolean;
  /** Fase 12: home com jornada única misturada (em vez do mapa por matéria) e `/atividade/$activityId`. */
  jornadaAdaptativa: boolean;
  /** Fase 13: oferta de nivelamento adaptativo no onboarding/perfil/home. */
  nivelamento: boolean;
  /** Fase 14: checkpoints periódicos inseridos no plano da jornada. */
  checkpointsTrilha: boolean;
}

const BASE_FEATURES: FeatureFlags = {
  microlicoes: true,
  trilhaAprendizado: true,
  dicasVestibular: true,
  recomendacaoAdaptativa: true,
  trilhaComoHome: true,
  // Ligada ao fim da Onda 0 (docs/31 F11.2), com o índice leve `itens-gerados.ts`
  // e a pré-carga por rota (`carregarPacotesPara`) — docs/32 Fase 11.
  pacotesConteudo: true,
  // Ligada F15.1 (docs/31), 27/09/2026 — Fase 11 já roda de verdade (755 itens,
  // 48 aulas), então há dado suficiente pra Mastery/Confidence ter sinal real
  // por habilidade em vez de ficar em "shadow" sem efeito visível. Regressão
  // completa verde antes e depois (docs/32) — ver `mastery-model.test.ts`/
  // `confidence.test.ts` (Fase 5) e o "Domínio por habilidade" de F12.8.
  masteryModel: "on",
  // Ligadas ao fim da Fase 6 (docs/30/31), depois de regressão completa
  // verde com as duas desligadas e com o E2E dedicado (`dont-know.spec.ts`)
  // verde com as duas ligadas — ver docs/32.
  sinaisAmpliados: true,
  botaoNaoSei: true,
  // Ligadas ao fim da Fase 7 (docs/30/31), depois de regressão completa
  // verde com as duas desligadas e com o E2E existente (tutor.spec.ts,
  // feedback.spec.ts, dont-know.spec.ts) verde com as duas ligadas — docs/32.
  explicacaoEmCamadas: true,
  contextoPedagogicoIA: true,
  // Ligada F15.1 (docs/31), 27/09/2026 — a condição que a Fase 12 pedia pra
  // ligar de vez ("flag só liga com F11 cobrindo ≥ 3 áreas") está satisfeita:
  // Fase 11 publicou 755 itens e 48 aulas cobrindo as 4 áreas do ENEM.
  // `/trilha` vira a jornada única (SessionCard/JourneyPath) por padrão;
  // `dashboard.tsx`/`NAV_ITEMS_V1` continuam intactos como rollback (docs/32
  // Fase 12, divergência 2 registrada — sem reverter dado nenhum).
  jornadaAdaptativa: true,
  // Ligada F15.1 (docs/31), 27/09/2026 — pool "diagnostico" real nas 4 áreas
  // (F11.6) e a pré-carga (`carregarTodosOsPacotes`/`pacotesProntos`) já
  // testada de ponta a ponta com CAT real (`placement.spec.ts`, docs/32).
  nivelamento: true,
  // Ligada F15.1 (docs/31), 27/09/2026 — `composeCheckpoint` usa o pool
  // "diagnostico" (mesmo do nivelamento), que a F11.6 populou de verdade
  // (CH/CN/LC/MT acima do mínimo). Continua exigindo sinal real do aluno
  // (praticadas/antigas/firmes) pra montar um checkpoint — aluno sem
  // nenhum sinal ainda não vê checkpoint, comportamento correto (docs/32).
  checkpointsTrilha: true,
};

/**
 * Override local pra teste (docs/30 §25) — `localStorage["foca.flags"]`
 * (JSON parcial), lido só em dev ou com `?debug=1` na URL. Nunca roda no
 * servidor (SSR) nem em produção sem o parâmetro — não é um mecanismo de
 * rollout remoto, só um jeito de ligar uma flag pontualmente num aparelho ou
 * numa suíte E2E sem mudar `BASE_FEATURES`.
 */
function readFlagOverrides(): Partial<FeatureFlags> {
  if (typeof window === "undefined") return {};
  const debugOn = import.meta.env.DEV || new URLSearchParams(window.location.search).get("debug") === "1";
  if (!debugOn) return {};
  try {
    const raw = window.localStorage.getItem("foca.flags");
    if (!raw) return {};
    return JSON.parse(raw) as Partial<FeatureFlags>;
  } catch {
    return {};
  }
}

export const FEATURES: FeatureFlags = { ...BASE_FEATURES, ...readFlagOverrides() };

/** Alvo único de "voltar pro início" — segue a flag acima (docs/25 §18 T-20). */
export const HOME_ROUTE = FEATURES.trilhaComoHome ? "/trilha" : "/dashboard";
