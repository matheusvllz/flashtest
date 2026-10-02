/**
 * Constantes do modelo adaptativo (docs/30 §9.4/§10.2, Fase 5 do docs/31).
 * Um lugar só — recalibrar exige teste de cenário atualizado e registro no
 * `docs/32` (regra do `30` §1, item 3), nunca "ajustar até passar".
 */

// ---- MODELO (Mastery/Confidence, §9.4) --------------------------------

export const ALGO_VERSION = 1;

/** Prior de habilidade sem nenhuma evidência (logit) — levemente abaixo do meio. */
export const THETA_PRIOR = -0.7;
/** Incerteza inicial (desvio-padrão) — teto de `sigma`. */
export const SIGMA0 = 1.2;
/** Incerteza mínima — nunca "certeza absoluta". */
export const SIGMA_MIN = 0.25;
/** Escorregão — chance de errar mesmo sabendo (descuido, distração). */
export const SLIP = 0.1;
/** Crescimento de `sigma²` por dia sem evidência nova (esquecimento possível, não afirmado). */
export const DRIFT_Q = 0.003;
/** Passo máximo de `theta` por tentativa — nunca um único item vira o mundo. */
export const MAX_STEP = 0.6;
/** Ganho mínimo (estilo Elo) — mesmo com certeza alta, uma tentativa nova ainda move um pouco. */
export const K_MIN = 0.25;
/** Faixa de ganho adicional proporcional à incerteza atual. */
export const K_SPAN = 0.95;

export const THETA_MIN = -4;
export const THETA_MAX = 4;

/** Peso por papel da tentativa (docs/30 §7.3/§9.4). `"checkpoint"` aqui é a checagem DENTRO da aula. */
export const PESO_PAPEL: Record<"pratica" | "revisao" | "desafio" | "diagnostico" | "checkpoint", number> = {
  pratica: 1.0,
  revisao: 1.0,
  desafio: 1.0,
  diagnostico: 1.2,
  checkpoint: 0.5,
};
/** Multiplicador quando a tentativa teve dica/tutor ANTES de responder. */
export const PESO_ASSISTIDA = 0.3;
/** Multiplicador quando a resposta foi "Não sei" (sem chute, mas ainda um sinal honesto — docs/30 §16.1). */
export const PESO_NAO_SEI = 0.8;
/** Peso de uma habilidade SECUNDÁRIA de um item multi-habilidade, relativo à principal. */
export const PESO_HABILIDADE_SECUNDARIA = 0.4;
/** Tentativa repetida do MESMO item no MESMO dia local pesa menos (docs/30 §9.7). */
export const PESO_REPETICAO_MESMO_DIA = 0.5;

/** Últimos N resultados guardados em `recent` (1 certo, 0 errado, 2 não sei). */
export const JANELA_RECENT = 8;
/** Média móvel exponencial de `independentShare` — quanto maior, mais peso pro resultado mais recente. */
export const ALPHA_INDEPENDENT_SHARE = 0.2;

// ---- CONFIDENCE (§10.2) -------------------------------------------------

/** Escala de "quantidade" — Q satura devagar; nEff=4 já dá Q≈0,63. */
export const CONFIDENCE_Q_ESCALA = 4;
/** Pesos dos 3 componentes de diversidade (somam 1). */
export const CONFIDENCE_D_PESO_ITENS = 0.4;
export const CONFIDENCE_D_PESO_DATAS = 0.3;
export const CONFIDENCE_D_PESO_DIFICULDADES = 0.3;
export const CONFIDENCE_D_ITENS_ALVO = 5;
export const CONFIDENCE_D_DATAS_ALVO = 3;
export const CONFIDENCE_D_DIFICULDADES_ALVO = 3;
/** Retenção: 1,0 com evidência de recuperação após intervalo; 0,75 sem. */
export const CONFIDENCE_R_COM_RETENCAO = 1.0;
export const CONFIDENCE_R_SEM_RETENCAO = 0.75;
/** Recência: sem decaimento até 7 dias; depois, decaimento exponencial com essa meia-vida (dias). */
export const CONFIDENCE_T_JANELA_DIAS = 7;
export const CONFIDENCE_T_DECAIMENTO_DIAS = 60;
/** Estabilidade: penalidade máxima por volatilidade total (trocas certo↔errado). */
export const CONFIDENCE_S_PESO_VOLATILIDADE = 0.3;
/** Independência: piso e faixa (0,6 mesmo sem nenhuma evidência independente ainda). */
export const CONFIDENCE_I_PISO = 0.6;
export const CONFIDENCE_I_FAIXA = 0.4;

// ---- FAIXAS DE EXIBIÇÃO (§10.4) -----------------------------------------

export const CONFIDENCE_MOSTRA_MASTERY = 25;
export const CONFIDENCE_EVIDENCIA_RAZOAVEL = 50;
export const CONFIDENCE_BOA_EVIDENCIA = 75;

// ---- PROGRESSÃO (§10.5) --------------------------------------------------

export const MASTERY_PREREQUISITO_MIN = 60;
export const CONFIDENCE_PREREQUISITO_MIN = 30;
export const MASTERY_DESAFIO_MIN = 75;
export const CONFIDENCE_DESAFIO_MIN = 50;
/** Mastery mínima pra o sinal de desafio da recalibração do checkpoint valer numa habilidade EM_APRENDIZADO (docs/36 T-04.4). */
export const MASTERY_SINAL_DESAFIO_MIN = 60;
export const MASTERY_AULA_OPCIONAL_MIN = 80;
export const CONFIDENCE_AULA_OPCIONAL_MIN = 60;

// ---- MOTOR (planejador, docs/30 §11, Fase 8) ----------------------------

/** Pesos dos 6 fatores de pontuação (§11.4) — somam 1. */
export const PESOS_SCORE = {
  necessidade: 0.3,
  objetivo: 0.2,
  urgencia: 0.15,
  ordem: 0.15,
  equilibrio: 0.1,
  variedade: 0.1,
} as const;

/** Proporção-alvo dos 3 "baldes" de atividade numa janela (§11.5). */
export const MIX_ALVO = { atual: 0.7, revisao: 0.2, desafio: 0.1 } as const;
/** Bônus de score por déficit de balde abaixo do alvo (§11.5). */
export const BONUS_DEFICIT = 0.25;
/** Teto de revisão elevado quando há atraso grande (§11.5). */
export const REVISAO_MAX_ATRASO = 0.35;
/** Tamanho da janela usada pro déficit de proporção (§11.5). */
export const JANELA_MIX = 10;
/** Tamanho da janela usada pro fator de equilíbrio de área (§11.4). */
export const JANELA_EQUILIBRIO = 20;
/** Tamanho padrão de um plano (§11.5). */
export const PLANO_N = 8;
/** Quantas atividades no topo do plano ficam "comprometidas" — estáveis na tela (§11.5). */
export const COMPROMETIDAS = 3;

/** Quantidade de itens por tipo de atividade (§11.3). */
export const ITENS_POR_ATIVIDADE = { pratica: 5, revisao: 4, desafio: 3, reforco: 4, introducao: 4 } as const;
/** Probabilidade-alvo (p) por tipo de atividade, usada em `selectItems` (§11.3/§11.7). */
export const P_ALVO_POR_ATIVIDADE = { pratica: 0.7, revisao: 0.8, desafio: 0.5, reforco: 0.85, introducao: 0.8 } as const;

/** Duração padrão de um item sem `estimatedSeconds` próprio (minutos estimados, §11.9). */
export const ITEM_SEGUNDOS_PADRAO = 60;

/** Peso de matéria declarada — objetivo do aluno (§11.4). */
export const PESO_MATERIA = { prioritaria: 1.5, normal: 1.0, vaiBem: 0.8 } as const;
/**
 * Assunto escolhido em `/topics` (spec 48 D48-10): multiplica a pontuação de aula, prática, desafio e legado das
 * habilidades daquele assunto. Preferência, não filtro: revisão devida, reforço e checagem não mudam, e pré-requisito
 * fraco continua bloqueando (a evidência de aprendizagem vence a preferência).
 */
export const PESO_TOPICO_ESCOLHIDO = 1.3;

/** Limiares de classificação de habilidade (§11.2). */
export const REFORCO_ERROS_DISTINTOS_MIN = 2;
export const REFORCO_JANELA_DIAS = 7;
export const REFORCO_DONT_KNOW_MIN = 2;
export const REFORCO_HELP_HEAVY_MIN = 2;
export const FIRME_MASTERY_MIN = 75;
export const FIRME_CONFIDENCE_MIN = 50;

/** Restrições duras do planejador (§11.4). */
export const MAX_MESMA_MATERIA_SEGUIDAS = 2;
export const MAX_DESAFIOS_POR_10 = 2;
/**
 * Cota mínima de revisão por janela de `JANELA_MIX` (docs/36 T-04.3, G4/RP-3):
 * com revisão DEVIDA disponível e menos que isto na janela, a posição vai pra
 * melhor revisão (nunca 2 forçadas seguidas). `_ATRASO` vale quando alguma
 * revisão devida está atrasada > 3 dias. Regra de PLANO (`PLANNER_VERSION`),
 * não do modelo.
 */
export const REVISAO_MIN_JANELA = 2;
export const REVISAO_MIN_JANELA_ATRASO = 3;
/** Atraso (dias) acima do qual a revisão devida conta como "atrasada" (mesmo limiar de `reasonsFor`/mix). */
export const REVISAO_ATRASO_DIAS = 3;
/** Teto de desafio por janela (docs/36 T-04.3) — mesmo valor e mesmo limite duro de `MAX_DESAFIOS_POR_10`. */
export const DESAFIO_MAX_JANELA = MAX_DESAFIOS_POR_10;
/**
 * Teto de revisão por janela de `JANELA_MIX` (RP-3: "teto 35 %"): `floor(0,35 × 10) = 3`. Com o
 * teto atingido, revisão só volta a ser escolhida quando NÃO há outro candidato. Sem isto, com
 * várias revisões muito atrasadas o score já satura em 4 por janela (medido no `37`).
 */
export const REVISAO_TETO_JANELA = Math.floor(REVISAO_MAX_ATRASO * JANELA_MIX);
export const AULA_PRATICA_JANELA_MAX = 2;

// ---- NIVELAMENTO (CAT com EAP, §12.3, Fase 13) ---------------------------

/** Prior de θ por área no início do nivelamento — mesmo espírito de `THETA_PRIOR`, mas próprio (§12.3). */
export const PLACEMENT_PRIOR_MEAN = -0.3;
export const PLACEMENT_PRIOR_SD = 1.0;
/** Grade de EAP: -4 a 4, passo 0,2 → 41 pontos. */
export const PLACEMENT_GRID_MIN = -4;
export const PLACEMENT_GRID_MAX = 4;
export const PLACEMENT_GRID_STEP = 0.2;
/** Parada por área: erro-padrão da posterior ≤ este valor. */
export const PLACEMENT_SE_STOP = 0.45;
export const PLACEMENT_MAX_ITENS_AREA_PRIORITARIA = 6;
export const PLACEMENT_MAX_ITENS_AREA_NORMAL = 4;
export const PLACEMENT_MIN_ITENS_ELEGIVEIS_AREA = 4;
export const PLACEMENT_MAX_ITENS_TOTAL = 24;
/**
 * Nivelamento de tamanho fixo (spec 49 D49-11): 30 questões, sem parada antecipada por SE — o aviso "São 30
 * questões" tem de ser verdadeiro. As constantes acima (SE, 6/4 por área, 24 no total) continuam valendo só para
 * nivelamentos começados antes (estado sem `cotas`).
 */
export const PLACEMENT_TOTAL_ITENS = 30;
/** Peso de uma área prioritária na divisão das 30 (2 prioritárias + 2 normais = 9, 9, 6, 6). */
export const PLACEMENT_PESO_PRIORITARIA = 1.5;
/** Minutos estimados por questão no aviso de abertura (30 × 50 s ≈ 25 min). */
export const PLACEMENT_SEGUNDOS_POR_QUESTAO = 50;
/** σ mínimo do prior aplicado a habilidades não medidas da área (§12.3). */
export const PLACEMENT_SIGMA_MIN_PRIOR = 0.9;
/** a/c nominais pra Fisher information quando o item real não tem `a`/`c` calibrados (mesmo espírito de `select-items.ts`). */
export const PLACEMENT_A_NOMINAL = 1;
export const PLACEMENT_C_NOMINAL = 0.2;

// ---- CHECKPOINT (composição/recalibração, §13.2-13.4, Fase 14) ----------

export const CHECKPOINT_MIN_ITENS = 6;
export const CHECKPOINT_MAX_ITENS = 8;
/** Cota por grupo (§13.2) — praticadas/antigas/firmes, soma 1. */
export const CHECKPOINT_COTA_PRATICADAS = 0.6;
export const CHECKPOINT_COTA_ANTIGAS = 0.3;
export const CHECKPOINT_COTA_FIRMES = 0.1;
export const CHECKPOINT_TARGET_P = 0.65;
/** Recalibração (§13.4): limiares de super/subestimação. */
export const CHECKPOINT_SUPERESTIMADO_PREDICTED_MIN = 0.8;
export const CHECKPOINT_SUBESTIMADO_PREDICTED_MAX = 0.4;
/** XP fixo por checkpoint (§13.6, ledger `checkpoint:<id>`). */
export const CHECKPOINT_XP = 20;

// ---- PLANO vs. MODELO (docs/36 §H, T-01.1) --------------------------------

/**
 * Versão do PLANEJADOR (fila da jornada) — separada de `ALGO_VERSION` (modelo
 * Mastery/Confidence, que NÃO muda: RP-5). Mudar a política de plano incrementa
 * esta constante e provoca 1 replano por conta, preservando a atividade
 * iniciada. Lida por `ensurePlan` e gravada por `commitPlan` desde a T-02.7 (antes
 * ambos usavam `ALGO_VERSION`, docs/37 D-1).
 */
export const PLANNER_VERSION = 2;
/** Versão do procedimento de aplicação do nivelamento (`PlacementState.appliedVersion`); reaplicar se a gravada for menor. */
export const PLACEMENT_APPLY_VERSION = 1;
/** Validade (dias) do sinal "elegível a desafio" gravado pela recalibração do checkpoint (`JourneyState.challengeEligible`). */
export const DESAFIO_SINAL_DIAS = 7;
