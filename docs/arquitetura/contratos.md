---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [contratos de código]
substitui: []
substituido-por: null
---

# Contratos de código vigentes

> **Como usar.** Esta é a fonte canônica dos contratos de comportamento do código (junto com os tipos em `src/`). Cada contrato cita a origem como `(NN §x)`, onde `NN` é o ID permanente do documento; o mapa `docs/historico/README.md` resolve cada ID para o caminho atual.
> Se um contrato daqui conflitar com um plano arquivado, **vale este**. Se conflitar com o código, registre a divergência (seção 19 e o registro da iniciativa ativa); não mude nenhum dos dois em silêncio.
> Regras de produto, voz, pedagogia e conteúdo estão em [produto/regras.md](../produto/regras.md). Quando o texto de origem é um contrato preciso, ele é citado entre aspas, sem paráfrase de números.

Convenções: `código:` aponta arquivo e linha conferidos em 29/09/2026. "(46, futuro)" marca o que a iniciativa 46 vai mudar; até lá vale o contrato atual.

## 1. Precedência entre as normas de origem

- **C-PREC-1.** Nos assuntos que cobrem: 36 prevalece sobre 30/31 (início, conclusão e reposição da fila, finalização do nivelamento, versão do plano) e sobre 27 D-7/18 (`PhoneFrame` de 440 px) só em ≥ 768 px; 30 prevalece sobre 25 §6.6 e 20 §13 quando as flags adaptativas estão ligadas; 25 prevalece sobre 20 no que cobre (25 §6.7); 20 prevalece sobre 08, 10, 11, 12, 15, 16, 18. (CLAUDE; 32 "Decisões" 1; 25 §6.7; 20 "Precedência")
- **C-PREC-2.** Tudo o mais do 20 (feedback imutável, tutor manual, som por evento, ledger, evidência, dicas, migração) continua valendo. (25 §6.7)

## 2. Feedback de resposta

- **C-FB-1: Snapshot por interação.** A frase é escolhida dentro de `submit`/`verify`, depois de validar a resposta e antes de publicar o feedback; texto e ID ficam no estado da interação. Nenhum sorteio no render. Nova resposta, novo `interactionId`. Pseudocódigo normativo: (20 §4.1)
  ```text
  ao verificar:
    se fase != answering ou trava sincrona ativa: retornar
    se resposta incompleta: retornar
    ativar trava sincrona
    corrigir usando resposta + ordem apresentada
    escolher mensagem UMA vez
    capturar questao, resposta e contexto do tutor
    registrar tentativa/recompensa uma unica vez
    publicar snapshot e fase feedback
    emitir som/haptico uma unica vez
  ao continuar:
    se fase != feedback ou avanco ja consumido: retornar
    consumir avanco sincronamente
    avancar exatamente uma vez; limpar snapshot apenas ao entrar na proxima questao
  ```
- **C-FB-2: Guarda síncrona.** Clique duplo ou Enter repetido geram uma tentativa e um avanço: ref síncrona mais transação idempotente; estado React sozinho não basta. Sem atraso obrigatório antes de avançar. (20 §4.1, §18)
- **C-FB-3: Quatro responsabilidades.** Correção pura (sem som, storage, animação ou API) → transação de domínio no store (retorna só eventos novos) → coordenação (snapshot de copy/contexto, despacho de som/háptico) → apresentação (renderiza o snapshot). O hook de sessão não cria store concorrente. (20 §5) código: `src/lib/feedback/`, `src/hooks/useExerciseSession.ts`.
- **C-FB-4: `AnswerFeedback`.** Campos: `interactionId`, `exerciseId`, `correct`, `messageId`, `messageText`, `explanation`, `chosenAnswerSnapshot`, `tutorFocusSnapshot`, `xpAwarded`; estáveis durante a interação. Máquina: `answering → feedback → advancing → answering | completed`. Abrir ou fechar o chat não altera a máquina. (20 §5)
- **C-FB-5: Frases decorativas.** Seleção determinística por dia local + slot, ou snapshot criado no evento; nenhuma escrita em storage durante o render; recompensa nunca é disparada por montar componente. (20 §4.1)
- **C-FB-6: Resposta completa.** "Verificar" só habilita com resposta completa: índice para escolha; em `ordenar`, `answer.length === blocos.length`; em `parear`, `answer.length === pares.length`. Array parcial é incompleto e não premia. (25 §9; 20 §18)
- **C-FB-7: Ordem apresentada.** `presentedOrder` é salvo para ordenar/parear; correção, tutor e retomada usam a mesma ordem. Identidade de par/bloco por índice ou ID, não por texto. (20 §9, §18)
- **C-FB-8: Legibilidade das alternativas.** Após validar, cards e textos de resposta com `opacity: 1`; texto ≥ 4,5:1, indicadores ≥ 3:1; resultado distinguível sem cor (ícone + rótulo "Correta", "Sua resposta", "Resposta correta"); a errada não é apagada; `prefers-reduced-motion` elimina deslocamento; fundo do feedback opaco. Não fazer override global em todos os botões. (20 §4.4, §20 A5)
- **C-FB-9: Retomada.** Reload com feedback aberto restaura texto, resultado, ordem e índice, sem tocar som nem premiar de novo. (20 §18, §20 A8)

## 3. Foca IA (tutor)

- **C-TUT-1: Só por ação explícita.** "Errar uma questão nunca abre nem envia mensagem ao tutor de IA automaticamente. Só o CTA explícito abre o balão; só o envio do aluno chama a API." A ação `openTutorWithContext` abre e fixa o snapshot da questão e **não** chama a API. Sugestão preenchida só é enviada com clique. Chat já aberto não recebe mensagem automática ao errar. (25 "Como usar" item 7; 20 §4.2, §20 A2) código: `src/lib/store.ts:1581`.
- **C-TUT-2: Pedido explícito de ensino.** Tocar em "Explicar melhor" (nível 3 da explicação) é pedido explícito: abre o balão e envia a mensagem de ensino com contexto pedagógico. Errar continua sem abrir nada. (30 §16.3; 32 Fase 7 F7.6)
- **C-TUT-3: Contexto da conversa.** Contexto corrente (`currentFocus`) separado do contexto fixado da conversa; navegar não muda o contexto de uma requisição iniciada; resposta assíncrona fica na conversa original ou é descartada. IDs estáveis de questão/lição, nunca título. Ordenar/parear vão como texto na ordem apresentada, com `answered` e `wasCorrect`. (20 §4.2 itens 7–10, §18)
- **C-TUT-4: Servidor e segredo.** O tutor roda no servidor; a chave vive em `OPENAI_API_KEY`, nunca `VITE_*`, nunca no bundle. A lógica fica em `src/server/tutor/` (`responder.ts` orquestra; `ia.ts` chama a OpenAI; `contexto.ts`, `cota.ts`, `imagem.ts`, `moderacao.ts`), sem TanStack; `src/lib/tutor.ts` é só a server function (origem, sessão, limite de 10/min). Modelo `gpt-5.4-mini` via `fetch`, sem SDK. (20 §14.2; 48 F2) código: `src/server/tutor/ia.ts`.
- **C-TUT-5: Fallback e estados.** Sem chave, modo de demonstração, erro ou timeout de 12 s → `localFallback()` (`tipo: "local"`); falha técnica devolve a mensagem à cota. Os outros resultados (`limite`, `indisponivel`, `consentimento`, `desligado`, `recusado`, `foto-invalida`, `autocuidado`, `erro`) aparecem num aviso fora do histórico, com "Tentar de novo" quando cabe. Tutor sem rede não trava estudo nem correção. (20 §14.2, §18; 36 RF-18; 48 T-48.2.7) código: `src/server/tutor/responder.ts`, `src/components/TutorBubble.tsx`.
- **C-TUT-6: Contrato e limites.** O cliente manda só `mensagens` (até 20, de até 4.000 caracteres, a última do aluno), `foco` (`itemId`, `respondeu`, resposta crua, ordem exibida), `modo` e `foto` (JPEG/PNG/WebP até 2 MiB, tipo conferido pelos bytes; o cliente comprime para lado maior 1.600 px, JPEG 0,8). Campos antigos (`context`, `pedagogy`) são descartados. O aparelho guarda as 40 últimas mensagens. O servidor monta o contexto: questão pelo índice de conteúdo com correção recalculada, perfil do banco sem o primeiro nome, desempenho contado no banco, contexto pedagógico pelo documento sincronizado. Exige sessão; abaixo de `TUTOR_IDADE_SEM_CONSENTIMENTO` exige consentimento do responsável; cota por plano (grátis 3/dia, foto conta como mensagem; pro 20 + 5 fotos) e teto global diário de custo pelo `usage`. (46 §E.7, D-12, D-18; 48 F2) código: `src/lib/tutor-contrato.ts`, `src/server/tutor/`.
- **C-TUT-7: Dados, não instruções.** Conteúdo do aluno e enunciado são dados, nunca instruções privilegiadas. (20 §14.2)
- **C-TUT-10: Salvaguardas.** Sinal local de autolesão (português) e moderação `omni-moderation-latest` antes da IA; autolesão → protocolo de autocuidado (CVV 188, `COPY.tutor.autocuidado`) sem passar pela IA e sem seguir a conversa; outra categoria sinalizada → recusa. Aviso visível de que é IA. O aluno pode desligar a Foca IA no perfil (`profile.tutor_desligado`; sem botão quando desligada). (46 §E.7.5; ECA Digital art. 17 §4 VIII–IX; 48 T-48.2.6) código: `src/server/tutor/moderacao.ts`.
- **C-TUT-8: `PedagogicalContext`.** Campos: `skillName`, `subjectName`, `topicName`, `mastery` (`null` quando Confidence < 25), `confidenceLabel`, `recentErrors` (≤ 2), `dontKnowRecent`, `explanationSeen`, `weakPrerequisites` (≤ 3), `examName`, `mode` (`"ensinar-do-zero" | "duvida"`). Montado por função pura (`buildPedagogicalContext`), sem React. (30 §17.1) código: `src/lib/tutor-context.ts`.
- **C-TUT-9: Prompt.** Regras do prompt: anti-LaTeX (o balão é texto puro), números só do contexto, sem cobrança, nunca entregar o gabarito de questão ainda não respondida. No modo `ensinar-do-zero`: começar pelo pré-requisito mais fraco, não repetir a explicação já vista, no máximo 6 frases. Mudança no prompt ou na persona é revisão L2. (30 §17.2; CLAUDE "Stack real", "Copy e escrita")

## 4. Intensidade de feedback, som e háptico

- **C-SOM-1: Níveis de intensidade.** (20 §5)

  | Nível | Evento | Visual/copy | Som |
  |---|---|---|---|
  | 0 | Navegar, selecionar opção, abrir resolução | Resposta direta da interface | Silêncio |
  | 1 | Acerto/erro | Alternativa + explicação + frase curta | Assinatura curta de acerto/erro |
  | 2 | Terceiro acerto consecutivo | Microcelebração, uma vez por sessão | Variação curta; sem multiplicador de XP |
  | 3 | Concluir bloco/meta | Recap, progresso e mascote | Uma resolução musical média |
  | 4 | Nível, capítulo ou conquista relevante | Celebração maior, não obrigatória | Um som especial, até 1 s |

- **C-SOM-2: Prioridade no fechamento.** Com várias recompensas, toca só a de maior prioridade: "especial → nível → conquista → capítulo → meta → marco → streak diário → lição". Os outros resultados aparecem sem fila de jingles. Som de XP não toca a cada mudança numérica. (24, que amplia a lista do 20 §5) código: `src/lib/audio/identity.ts:19-28`, `src/lib/audio/engine.ts:131-137`.
- **C-SOM-3: Quando o som de resposta toca.** No gesto de verificar, uma vez, depois de correção válida, em todos os formatos e nos dois players. Nunca ao selecionar, abrir resolução, renderizar ou recarregar feedback persistido. "Não sei": sem som nem vibração de erro. Checkpoint e nivelamento: sem som de acerto/erro por item. (20 §4.3; 30 §13.3, §16.1)
- **C-SOM-4: Contrato técnico.** Um `AudioContext`, criado só no navegador, desbloqueado por gesto; `resume` tratado; indisponibilidade é silenciosa e nunca impede a questão. Prazo de 300 ms para som de resposta e 500 ms para fechamento, **incluindo** carregamento, decodificação, `resume` e fila; expirado é descartado, não tocado sobre a próxima questão. Mute, aba oculta e `pagehide` cancelam fontes com fade de 30 ms (teste admite cessação em até 50 ms) e invalidam pedidos pendentes; voltar não reproduz fila antiga. Nunca dois sons simultâneos. Som de erro nunca sinaliza erro de rede. Web Audio não é requisito de navegação. (20 §6.4; 24; 16 §3 regras 4 e 7) código: `src/lib/audio/engine.ts:4,87-137`.
- **C-SOM-5: Assets.** Os 12 WAVs aprovados em `public/sfx/v2/`, sem alteração de bytes, mapeados por evento em `identity.ts`; sem dependência nova. Substitui a síntese por osciladores e a regra "nenhuma amostra de áudio no MVP" do 20 §6.4. Verificação: `py scripts/foca_sound/verify.py --integrated`. (24)
- **C-SOM-6: Preferências.** Mudo persiste e é respeitado sempre. Primeiro uso começa com som ligado e aviso visível de como desligar. Som e háptico têm toggles independentes; aparelho sem vibração não é erro. (16 §3 regras 1 e 3, §4; 20 §6.4) iPhone no silencioso: padrão é respeitar a chave (decisão do proprietário pendente). (32 "Decisões" 3; 30 §20.2 item 6)
- **C-SOM-7: Não implementado.** O diagnóstico de áudio (`getAudioDiagnostics`), o orçamento de 900 ms no primeiro som, o desbloqueio em `pointerup`/`touchend`/`click` e o adaptador de háptico (30 §20.2, §20.3) não existem no código; são pendência, não contrato. (32 Fase 15 "Achado mais importante", G11)

## 5. Trilha, lições e tamanhos

- **C-TRI-1: Hierarquia.** Matéria → seção → capítulo → lição, declarada em `CURRICULUM_TREE`. A habilidade (`SkillDef`, id `<subjectId>:<slug>`) liga currículo, itens e modelo; a árvore é organização de apresentação. Redação tem área própria `RED` e não é medida no nivelamento. (25 §6.1; 30 §8.1)
- **C-TRI-2: Estado dos nós.** (25 §6.3)
  ```text
  locked      = capítulo bloqueado (prerequisiteChapterIds não concluídos)
                OU lição com prerequisiteLessonIds não concluídos (micro)
                OU !isLessonUnlocked (legado)
  completed   = micro: learning.completedLessons[id] existe
                legado: progress.lessons[id] existe
  in-progress = micro: learning.activeSession?.contentId === id && completedAt === null && !completed
  current     = id === trail.continue.lessonId && !completed
  available   = o resto
  Precedência de avaliação: locked → completed → in-progress → current → available.
  ```
  Revisão devida e estrelas são texto secundário, não status. Estado distinguível por texto/ícone. URL direta respeita o mesmo bloqueio. (25 §6.3; 20 §20 A12)
- **C-TRI-3: Tipos de nó do mapa.** `aula` (microlição com ≥ 1 passo `teach`), `pratica` (lição legada de redação ou microlição sem `teach`), `revisao` (revisão sintética de capítulo). (25 §6.4) Tipos de atividade da jornada: `"aula" | "pratica" | "revisao" | "desafio" | "checkpoint" | "legado" | "reforco"`. (30 §11.6)
- **C-TRI-4: Passos da lição.** `LessonStep.kind` ∈ `intro`, `teach`, `tip`, `question` (com `exerciseId`, `role: "checkpoint" | "pratica" | "desafio" | "revisao"`, `difficulty: 1 | 2 | 3`), `recap`. (25 §6.5)
- **C-TRI-5: Composição da lição v2.** "começa com 1 `intro`, termina com 1 `recap`; `steps[1]` é `teach`; 4–8 `question`; ≥ 2 `teach`; no máximo 3 `question` seguidas; dificuldades das questões nunca decrescem; primeira questão `difficulty: 1` e `role: "checkpoint"`; última questão `difficulty ≥ 2`; ≥ 3 questões pontuadas (role ≠ checkpoint)". Ensino v2: até 4 passos `teach` e ≤ 220 palavras somadas (intro + teach + tip); v1 mantém 100 palavras e 2 práticas. O validador de aula v2 não é afrouxado; exceções vivem em contratos separados. (25 §6.5, §6.7; 36 K7) código: `validateLessonSteps` em `src/lib/learning/validate.ts:209`.
- **C-TRI-6: Validação na carga.** Questão repetida na lição, alternativa repetida, lição curta (< 4 questões em v2), explicação vazia/curta, enunciado duplicado, dificuldade inconsistente, `chapterId` inexistente, referência quebrada e ciclo de pré-requisito. Conteúdo não executa ações do store; blocos são renderizados por componentes controlados, sem HTML/JS vindo do conteúdo. (25 §10; 20 §8.3)
- **C-TRI-7: Progressão.** Lição concluída = `completeMicroLesson` (micro) ou `completeLesson` (legado). Capítulo concluído = todas as `lessonIds` concluídas (a revisão sintética não conta). Seção = todos os capítulos. Desbloqueio: `prerequisiteLessonIds` (micro) ou ordem sequencial (legado); entre capítulos, `prerequisiteChapterIds`. Celebração de capítulo uma vez (`learning.celebratedChapterIds`), som disparado no evento de conclusão, não na montagem da folha. (25 §6.6)
- **C-TRI-8: Revisão de capítulo.** Nó sintético `revisao--<chapterId>` com 4 a 8 questões dos `reviewExerciseIds`, opcional, desbloqueia ao concluir o capítulo. (25 §6.2, §6.7)
- **C-TRI-9: Home e navegação.** `/trilha` é a home (`FEATURES.trilhaComoHome`). Com `jornadaAdaptativa`, a home é a jornada misturada; o mapa por matéria é vista secundária (`?vista=mapa`) e caminho de rollback, e não é removido. Navegação com 4 itens: Aprender (`/trilha`), Praticar (`/study`), Progresso (`/progress`), Perfil (`/profile`); `dashboard.tsx` e `NAV_ITEMS_V1` ficam como rollback. Um `btn-primary` por tela. (25 §6.2, §8; 36 K4; 30 §22)
- **C-TRI-10: Tamanhos coexistentes.** Aula v2: 4 a 8 questões. `/study`: 2 (`LESSON_SIZE = 2`). Atividade dinâmica: `ITENS_POR_ATIVIDADE = { pratica: 5, revisao: 4, desafio: 3, reforco: 4, introducao: 4 }`, com pool curto reduzindo até o mínimo de 2. Legado: fixo. Não aplicar 4–8 fora da aula v2. (36 K2; 37 D-14; 30 §11.7) código: `src/lib/study/escolher-questoes.ts:9`, `src/lib/adaptive/constants.ts:121`.
- **C-TRI-11: Três escalas de dificuldade (documentar, não unificar).** Editorial `ItemMeta.difficulty` 1–5 (seleção por papel e promoção a diagnóstico; define `b` via `irtFromDifficulty`). Relativa à aula `QuestionStep.difficulty` 1–3 (validação de progressão; derivada da editorial **e da posição**, por isso 1→2→3 não prova aumento cognitivo). Modelo `irt.a/b/c`, θ, `targetP` (CAT, `selectItems`, `predictedP`; `source` = `estimado`, `inep` ou `calibrado-foca`). (36 §G.2)

## 6. Progressão e XP

- **C-XP-1: Faixas.** Estrelas por porcentagem de questões pontuadas: ≥ 90 → 3; ≥ 70 → 2; senão 1. XP por faixa 10/20/30. A checagem dentro da lição (`role: "checkpoint"`) não conta para a nota nem dá XP. (25 §6.2, §6.6; 20 §12) código: `src/lib/store.ts:794-799`.
- **C-XP-2: Replay.** Replay de lição paga só a diferença para a melhor faixa; nunca XP integral repetido (1→2→3 estrelas paga 10+10+10; repetir faixa paga 0). (20 §12, §20 A14) código: `src/lib/store.ts:850`.
- **C-XP-3: Outras fontes.** Revisão devida: 5 XP uma vez por ocorrência de agenda concluída, nunca por abrir card ou sessão vazia. Revisão de capítulo/desafio: 10/20/30 pela melhor faixa, sem bônus duplicado. Questão do banco geral: teto vitalício de 15 por item; primeira errada 5, melhorar para correta +10, repetições 0. "Não sei" paga igual a erro. Bônus de onboarding único (ledger `onboarding:bonus`). (20 §12; 30 §16.1) código: `src/lib/store.ts:756,928-929`.
- **C-XP-4: Atividades da jornada.** Prática, desafio e reforço 10/20/30 pela faixa; revisão 5 fixo; checkpoint 20 fixo, independente de acerto, e conta como 1 bloco. XP pelo ledger da tentativa (C-ATV-7). (30 §13.5, §14.4) código: `src/lib/store.ts:1802-1808`.
- **C-XP-5: Blocos e meta.** Contam: estudo geral concluído, redação, microlição, atividade, sessão de revisão (flashcards: até 3 itens devidos; com 1 ou 2, concluir todos conta 1 bloco). Não contam: checagem, abrir tutor, card sem concluir, abrir o app, sessão vazia. Contagem única por sessão, pela data local da conclusão (sessão que cruza meia-noite conta no dia da conclusão). (20 §12, §18)
- **C-XP-6: Sequência e congelamento.** Sequência avança no máximo uma vez por dia. Congelamento por contador explícito `activityDaysSinceFreezeAward` (a cada 7 dias de atividade +1, máximo 2), independente do histórico `activityDays` truncado em 60 dias. Limiares de nível preservados. (20 §12; 41 V-4) código: `src/lib/store.ts:710-730`.
- **C-XP-7: Ledger não depende de retenção.** Agregados e ledger não dependem de arrays podados; podar tentativas nunca libera XP de novo nem apaga conclusão ou melhor resultado. Migração preserva XP; questões legadas concluídas entram como teto consumido, sem recalcular XP passado. (20 §12, §15.2, §15.3)
- **C-XP-8: Conclusão de lição por tentativa.** `completeMicroLesson(…, { sessionStartedAt })` e `completeLesson(…, { sessionStartedAt })` não fazem nada quando o registro já tem `completedAt >= sessionStartedAt`; sem `sessionStartedAt`, vale o comportamento antigo (replay paga a diferença). "Refazer lição" inicia tentativa nova. (37 D-79) código: `src/lib/store.ts:810,828-890`.
- **C-XP-9: (46, futuro).** O servidor passa a ser a autoridade de recompensas: calcula o XP pelas regras desta seção, e o cliente nunca informa o valor. (46 §B.1 item 3, §E.2 `xp_ledger`)

## 7. Estado local, schema e migração

- **C-DADOS-1: Chave e versão.** Chave `foca.state.v3`; versão interna `schemaVersion` 6 (`CURRENT_SCHEMA_VERSION = 6`); não confundir nome da chave com versão. A chave `flashtest.state.v2` é lida uma única vez como fallback. (20 §15.2; 30 §21.1; CLAUDE) código: `src/lib/store.ts:181-182`, `src/lib/state-migrations.ts:24`.
- **C-DADOS-2: Um store.** Tudo em `src/lib/store.ts` (`useSyncExternalStore` + `localStorage`); nunca um segundo mecanismo de estado; hooks controlam fluxo, não criam storage. Conteúdo é imutável e versionado, sem dado de sessão. Não chamar áudio nem API em seletores, render ou correção. Inicialização antes do redirect; acesso a browser protegido no SSR. (20 §14.2; CLAUDE "Stack real")
- **C-DADOS-3: Ordem obrigatória da migração.** (20 §15.3)
  1. Ler v3; se ausente, fallback v2.
  2. Parse protegido; validar estrutura sem confiar no cast TS.
  3. Preservar XP, preferências, lições concluídas, flashcards, sequência e histórico.
  4. Backup antes da escrita; não sobrescrever backup existente.
  5. Defaults aditivos; sem inferir PAS/etapa/ciclo da faculdade.
  6. Questões legadas concluídas = teto consumido.
  7. Evidência nova vazia sem dados suficientes; conclusão legada não prova retenção.
  8. Validar o objeto migrado; gravar só versão válida.
  9. Em quota/erro de escrita, preservar o estado anterior, seguir em memória e informar que não salvou.
  10. Migração idempotente; "Estado com versão futura desconhecida não deve ser sobrescrito por versão antiga."
- **C-DADOS-4: Backups.** `foca.state.backup.before-learning-v4` e `foca.state.backup.before-v6`, cada um gravado uma única vez e nunca sobrescrito. (20 §15.2; 30 §24.1) código: `src/lib/state-migrations.ts:25,27`.
- **C-DADOS-5: Migração v5→v6.** Campos aditivos com default (30 §21.1); `dailyMinutes` derivado de `dailyLessons`; `onboardingVersion = 1` para quem já tinha `onboarded`; `skillModel` por replay de `recentAttempts`; prior de matéria (C-MOD-5); lições legadas concluídas contam para pré-requisito, não como evidência; XP, sequência, ledger, flashcards, conclusões e `activeSession` intocados. Sessão ativa sem `stepIndex` é descartada. (30 §24.1; 25 §7.6)
- **C-DADOS-6: Sem subir o schema no 36.** Os campos do 36 são opcionais, com default na leitura; os parsers preservam campos extras; código antigo lê e mantém. Não subir para 7 sem plano, porque o código antigo trataria dado novo como versão futura. (36 §H) (46, futuro: v6→v7 e modelo no servidor em `arquitetura/dados.md`.)
- **C-DADOS-7: Limites.** 500 tentativas recentes; `distinctExerciseIds` até 50 e `distinctLocalDates` até 20 por habilidade; 100 entradas de dicas; 300 eventos; histórico da jornada 200. Estado sintético pesado serializa em < 1 MB. (20 §15.2; 30 §9.3, §14.3, §21.1)
- **C-DADOS-8: Regras de gravação.** Tentativa → modelo → agenda → evidência numa única `setState`. Confidence nunca é gravada. Plano da jornada gravado só em conclusão ou mudança de foco, nunca no render. (30 §21.2)
- **C-DADOS-9: Fronteira de bundle do store.** `src/lib/store.ts` não importa módulos pesados de conteúdo (`@/content/items`, `microlicoes`, `trilhas`, `taxonomy`). (32 Fase 5) código: `tests/unit/store-bundle-boundary.test.ts`.
- **C-DADOS-10: Flags não apagam dado.** Nenhuma leitura de estado depende do valor atual de uma flag para decidir o que existe no storage; desligar uma flag nunca reverte migração. (22 §5) código: `src/lib/features.ts:1-18`.

## 8. Persistência e rede

- **C-PERS-1: Falha de gravação.** Falha no `localStorage` nunca é anunciada como salva: faixa persistente (`PersistenceBanner`) com "Tentar de novo"; frases que prometem "salvo" têm variante neutra escolhida por `textoSePersistiu(usePersistStatus(), salvo, neutro)`. Estado de persistência é de runtime, não persistido. (36 RF-14, §H; 37 D-30, D-77)
- **C-PERS-2: Duas abas.** A aba em segundo plano adota o estado gravado pela outra (evento `storage`) antes da próxima mutação e nunca sobrescreve progresso mais novo. Storage de versão futura vindo da outra aba não é adotado e trava a gravação da aba atual. (36 RF-15; 37 D-31) código: `src/lib/store.ts:576`.
- **C-PERS-3: JSON ilegível.** O bruto é copiado para `foca.state.corrupt.<ISO>` antes de qualquer escrita; o aluno vê o aviso uma vez. (36 RF-16) código: `src/lib/store.ts:342`.
- **C-PERS-4: Versão futura.** Dado de versão mais nova do app não é gravado; aviso pede recarregar. (36 RU-6, §M)
- **C-PERS-5: Pacotes de conteúdo.** `manifest.json` e um JSON por matéria em `public/content/v1/`; prazo de 8 s (cobre `fetch` e leitura do corpo); falha pode ser tentada de novo na mesma sessão; o mesmo pacote nunca é baixado 2 vezes em paralelo. Pacote que não carrega → o motor planeja só com conteúdo embarcado (`plan-fallback`). (36 RF-17; 37 D-32; 30 §21.3) código: `src/lib/content/repository.ts:15`.
- **C-PERS-6: Sem garantia remota.** Sem backend, não há garantia entre aparelhos, origens ou após limpar o navegador, e a copy nunca promete isso. (36 §M) (46, futuro: servidor como autoridade, 46 §E.4.)

## 9. Modelo do aluno: Mastery e Confidence

- **C-MOD-1: Definição.** "Mastery(h) ∈ [0, 100] é a probabilidade estimada, em %, de o aluno acertar sem chute uma questão de dificuldade média (b = 0) da habilidade h, sem ajuda." `Mastery = round(100 · logistic(θ))`. Não é nota nem percentual de acerto. (30 §9.1)
- **C-MOD-2: Probabilidade.** `p₂(θ) = logistic(a · (θ − b))`; `p = c + (1 − c − s) · p₂`, com escorregão s = 0,10. (30 §9.2)
- **C-MOD-3: Constantes v1.** "THETA_PRIOR = −0,7 SIGMA0 = 1,2 SIGMA_MIN = 0,25 SLIP = 0,10 DRIFT_Q = 0,003 por dia MAX_STEP = 0,6 K_MIN = 0,25 K_SPAN = 0,95". Pesos: prática, revisão e desafio 1,0; diagnóstico 1,2; checagem de aula 0,5; assistida (ajuda antes de responder) × 0,3; "não sei" 0,8. Habilidade secundária recebe peso × 0,4. Mesmo item no mesmo dia: × 0,5 e não conta como distinto. Constantes só mudam com teste de cenário atualizado e registro, nunca "ajustar até passar". (30 §9.4, §9.7, "Como usar" item 3) código: `src/lib/adaptive/constants.ts`.
- **C-MOD-4: Atualização.** Passo tipo Elo com ganho proporcional à incerteza, limitado por `MAX_STEP`; σ cresce com o tempo sem evidência e encolhe pela informação de Fisher. "Mastery só muda com evidência": o tempo aumenta σ e derruba Confidence, nunca θ. Erro em revisão/diagnóstico com Mastery ≥ 70 incrementa `lapses`. (30 §9.4; 36 §G.1)
- **C-MOD-5: Prior sem evidência (ordem).** Estimativa do nivelamento para a habilidade → da área/matéria do nivelamento (σ = max(0,9; SE + 0,3)) → θ da matéria pelas tentativas de `/study` (`taxa = (k + 1)/(n + 2)`; `θ_m = clamp(logit(taxa) − 0,3, −2, 2)`, σ = 1,0, `nEff = 0`, `source: "prior-materia"`) → `THETA_PRIOR`. Priors têm `nEff 0` e Confidence 0; não viram evidência, e evidência de uma habilidade não se espalha para a área. (30 §9.4, §24.3; 36 §G.1)
- **C-MOD-6: Confidence.** Derivada na leitura, nunca gravada: (30 §10.1, §10.2)
  ```text
  quantidade   Q = 1 − e^(−nEff / 4)
  diversidade  D = 0,4·min(1, itensDistintos/5) + 0,3·min(1, datasDistintas/3) + 0,3·min(1, dificuldadesVistas/3)
  retenção     R = hasReviewCorrectAfter24h OU checkpoint correto ≥ 3 dias depois da 1ª evidência ? 1,0 : 0,75
  recência     T = d ≤ 7 ? 1 : e^(−(d − 7)/60)
  estabilidade S = 1 − 0,3 · volatilidade
  independência I = 0,6 + 0,4 · independentShare
  Confidence = round(100 · Q · (0,4 + 0,6·D) · R · T · S · I)
  ```
  Evidência só de checagem de aula não sobe Confidence; "não sei" conta em Q, não em dificuldades vistas; 0 sem entrada, nunca acima de 100. (30 §10.6)
- **C-MOD-7: Faixas de exibição.** 0–24 "Ainda medindo" (não mostra Mastery); 25–49 "Pouca evidência"; 50–74 "Evidência razoável"; ≥ 75 "Boa evidência". O selo "consistente" exige o critério da R-PED-1. (30 §10.4) Sobre o rótulo "Dominado", ver produto/regras R-VOZ-7.
- **C-MOD-8: Freios.** Introduzir habilidade exige cada pré-requisito com aula concluída ou (Mastery ≥ 60 e Confidence ≥ 30). Desafio exige Mastery ≥ 75 e Confidence ≥ 50. Aula opcional exige Mastery ≥ 80 e Confidence ≥ 60 vindos de nivelamento/checkpoint; habilidade `core` ainda recebe prática curta de confirmação (3 itens). (30 §10.5)
- **C-MOD-9: Versões e replay.** `ALGO_VERSION = 1` controla só o modelo: mudou fórmula ou constante, incrementa, e a carga recalcula por replay de `recentAttempts` (até 500, em ordem). `PLANNER_VERSION = 2` controla o plano: mudou a regra de plano, incrementa, e cada conta ganha 1 replano preservando a atividade iniciada, sem tocar `ALGO_VERSION`. `ensurePlan` compara e `commitPlan` grava `PLANNER_VERSION`. `bootstrapModel` mescla: mantém entradas `evidencia` e `prior-nivelamento` que o replay não tocou (as respostas do nivelamento não são `Attempt`). Versão futura no storage não é recalculada para trás. (30 §9.6, §9.7, §24.2; 36 RP-5, §G.4; 37 D-1, G-10) código: `src/lib/adaptive/constants.ts:9,208`.
- **C-MOD-10: Calibração.** Recalibração de itens por dados de resposta (`calibrado-foca`) exige muitos alunos, portanto backend; não existe. (30 §9.6)

## 10. Motor adaptativo

- **C-MOT-1: Fronteira.** O motor (`src/lib/adaptive/`) é puro: não importa React nem o store, recebe estado e catálogo por parâmetro, relógio e semente injetados, nenhuma chamada de IA ou rede; mesmo estado + mesma data + mesma semente = mesmo plano. (30 §11.1)
- **C-MOT-2: Classificação.** `classify`: IGNORAR (planejada/sem conteúdo) → BLOQUEADA → NOVA → REFORÇO (erros distintos ≥ 2 em 7 dias OU `dontKnowRecent` ≥ 2 OU `helpHeavyRecent` ≥ 2) → DEVIDA (acumula) → FIRME (Mastery ≥ 75 e Confidence ≥ 50) → EM_APRENDIZADO. (30 §11.2)
- **C-MOT-3: Pontuação.** `score = 0,30·necessidade + 0,20·objetivo + 0,15·urgênciaRevisão + 0,15·ordemCurricular + 0,10·equilíbrio + 0,10·variedade`. Necessidade de NOVA com `source === "prior-nivelamento"`: `clamp(0,55 + 0,5 × (1 − m/100), 0,55, 0,95)`; demais NOVA 0,8. (30 §11.4; 36 §G.4)
- **C-MOT-4: Restrições duras.** Nunca a mesma habilidade duas vezes seguidas (exceto aula → prática da mesma); no máximo 2 atividades seguidas da mesma matéria; aula de X seguida de prática de X em até 2 posições; desafio no máximo 2 a cada 10; `core` com Mastery alta só de prior nunca vira aula opcional sem confirmação. (30 §11.4)
- **C-MOT-5: Mix 70/20/10.** Janela móvel de **10** atividades: ~70 % atual, ~20 % revisão, ~10 % desafio. Com revisão devida disponível, toda janela de 10 tem ≥ 2 revisões (≥ 3 se alguma atrasada > 3 dias); teto duro de 3 revisões por janela (35 %), salvo se só houver revisão; desafio ≤ 2. Sem revisão devida, 100 % atual é correto. A validação mede duas janelas consecutivas de 10 num plano de 20; não é outra regra. (30 §7.4, §11.5; 36 K12, RP-3, §G.4; 37 D-26) código: `src/lib/adaptive/constants.ts:106-160`.
- **C-MOT-6: Fila comprometida.** As 3 primeiras atividades ficam em `learning.journey.committed` e só mudam se ficarem inválidas; o resto (`upcoming`) é provisório. A reposição preenche **só** as vagas: comprometidas válidas mantêm a ordem, e a atividade iniciada nunca sai do topo por replano. Substituem tudo (menos a iniciada): aplicação do nivelamento, mudança de foco, `PLANNER_VERSION` nova, comprometida inválida. Atividade iniciada é sempre válida. (30 §11.5; 36 RF-8; 37 D-9) código: `src/lib/adaptive/journey.ts:27,130`.
- **C-MOT-7: Sem repetição na fila.** Identidade de atividade = tipo + `lessonId` (quando há) ou tipo + habilidade (checkpoint é um só). `ensurePlan` pede 16 ao planner e descarta repetidas contra a base; repetição gravada em `upcoming` dispara replano. Com foco estreito, a fila fica menor em vez de repetir. (37 D-78) código: `src/lib/adaptive/journey.ts:46`.
- **C-MOT-8: Mudança de foco.** Mudança feita fora da home força replano na próxima montagem da home (`focusSignature`); foco "só hoje" expirado some sem recarregar o app. (36 RF-9, §H)
- **C-MOT-9: Seleção de itens na hora de começar.** Pool da habilidade (principal, depois secundárias), papel e status permitidos, sem retirados; exclui vistos hoje e, em revisão, nos últimos 3 dias; alvo `bAlvo = θ − ln(targetP' / (1 − targetP')) / a`; entre os 3n mais próximos, escolhe n por hash da semente; apresenta em dificuldade crescente; pool curto → habilidade vizinha do mesmo tema → reduz n (mínimo 2). (30 §11.7)
- **C-MOT-10: Fallback.** `planWithFallback` envolve o planner; em exceção, pacote indisponível ou flag desligada, devolve a próxima lição de `buildTrail` e as seguintes na ordem da árvore, com motivo `"fallback"` e evento `plan-fallback`. O aluno sempre tem o que estudar. (30 §11.8)
- **C-MOT-11: Desempenho.** Planejar < 20 ms para 500 habilidades e 6.000 itens. O plano é recalculado só na carga da home, na conclusão de atividade e na mudança de foco; nunca no render. (30 §11.9)
- **C-MOT-12: `/study`.** Com `jornadaAdaptativa`, `/study` escolhe itens pelo motor para a habilidade de maior pontuação entre EM_APRENDIZADO/DEVIDA do banco geral, mantendo `LESSON_SIZE = 2`. (30 §11.10; 32 Fase 12 divergência 3)

## 11. Ciclo de vida da atividade

- **C-ATV-1: Estados.** "**comprometida** (em `committed`, sem `startedAt`); **iniciada** (`activeActivity` com `startedAt`); **pronta para retomar** (iniciada **e** — se dinâmica — `itemIds.length ≥ 2`; se aula/legado — `lessonId`)". (36 RF-2)
- **C-ATV-2: Dona da seleção.** A rota `/atividade/$activityId` é a única que escolhe e grava `itemIds`; o planner nunca grava. Reload no meio mantém os mesmos `itemIds`. (36 RF-2, §H; 37 D-14)
- **C-ATV-3: Abertura.** Toda atividade de `committed[0]` abre pelo CTA do card **e** pelo nó atual, em qualquer família, sem depender de URL direta. Card, nó e resultado do nivelamento usam o mesmo `hrefForActivity`; aula e legado marcam o início ao navegar, atividade dinâmica só navega (`iniciaAoNavegar`). `startedAt` é gravado uma vez por tentativa. (36 RF-1, §H; 37 D-39) código: `src/lib/adaptive/journey.ts:220,234`, `src/lib/store.ts:1685`.
- **C-ATV-4: Poucas questões.** Atividade dinâmica com menos de 2 itens é descartada do topo, sem XP e sem histórico, com evento `activity-skipped`; a home repõe e mostra um aviso de uma linha. Nunca há loop home → atividade → home. (36 RF-3) código: `src/lib/store.ts:1729`.
- **C-ATV-5: Conclusão desta tentativa.** Conclusão só conta se `completedAt ≥ startedAt`; atividade sem `startedAt` (anterior ao 36) segue a regra antiga (existência). (36 RF-4)
- **C-ATV-6: Fonte de conclusão.** Lição legada é lida de `progress.lessons`; aula (autoral ou gerada) de `learning.completedLessons`, em todos os leitores (candidato, classificação, pré-requisito, sincronização, fallback). (36 RF-5)
- **C-ATV-7: Idempotência.** `attemptKey = "${activityId}@${startedAt ?? "sem-inicio"}"`, único no histórico. Concluir a mesma tentativa de novo não duplica XP, bloco do dia, histórico, `sinceCheckpoint`, evento nem tentativa (devolve `alreadyCompleted`). Ledger `atividade:<attemptKey>` quando há `startedAt`; sem `startedAt`, a chave antiga `atividade:<id>`. A diferença de faixa em replay vale só onde há replay (lições). (36 RF-6, §H; 37 D-4, D-11) código: `src/lib/store.ts:1644,1832-1841`.
- **C-ATV-8: Contador monotônico.** `JourneyState.seq` (default `history.length`) sobe +1 em cada conclusão, sincronização e descarte, nunca diminui, e entra no id da atividade para não colidir com uma já concluída. (36 RF-7, §H) código: `src/lib/store.ts:1641`.
- **C-ATV-9: Rotas por tipo.** Aula e reforço → `/learn/$lessonId`; legado → `/redacao/$licaoId`; prática, revisão, desafio e checkpoint → `/atividade/$activityId` com lição sintética. Atividade não grava em `completedLessons`; conclui por `completeJourneyActivity`, move para `history` e registra o bloco. (30 §14.4)
- **C-ATV-10: Estado persistido da jornada.** `JourneyState`: `committed` (até 3), `upcoming` (até 5), `history` (até 200, com `attemptKey` e `localDate`), `activeActivity`, `sinceCheckpoint`, `lastCheckpointDate`, `planVersion`, `seq`, `challengeEligible`, `focusSignature`. (30 §14.3; 36 §H)

## 12. Nivelamento

- **C-NIV-1: Fluxo.** `/quiz` (perfil em 3 blocos) → oferta → `/nivelamento` → resultado → primeira atividade; ou "Começar sem nivelamento" → `/aha` → `/trilha`. Disponível depois no Perfil e na home. (30 §12.1, §12.2)
- **C-NIV-2: CAT com EAP.** Escopo: áreas do foco (LC, MT, CN, CH; RED fora). Orçamento: até 24 itens no total e 4 a 6 por área (prioritárias até 6); área com menos de 4 itens elegíveis não é medida. Prior θ ~ N(−0,3; 1,0), grade de −4 a 4 com passo 0,2. Primeiro item com `b` mais próximo de 0 na habilidade de maior incidência; próximo entre os 3 de maior informação de Fisher 3PL em θ̂, com balanceamento, escolhido por hash da semente. Para a área quando SE ≤ 0,45, no teto da área ou no fim do orçamento. Não ordenar de fácil para difícil. (30 §12.3; 36 K13, §G.1) código: `src/lib/adaptive/constants.ts:164-183`.
- **C-NIV-3: Pool.** Itens com papel `diagnostico` e status `revisada-humano` ou `oficial-conferida`, não retirados. (30 §8.4, §12.3; 36 §G.6)
- **C-NIV-4: Durante.** Sem feedback por item, sem dica, sem tutor, sem som por item; "Não sei" permitido; pode sair a qualquer momento e o que foi respondido conta. (30 §12.3, §13.3)
- **C-NIV-5: Finalização única.** Terminar por **qualquer** caminho (última resposta, teto de área, orçamento, pool insuficiente) aplica os priors **uma vez**, grava `placement.appliedAt` (e `appliedVersion = PLACEMENT_APPLY_VERSION = 1`), invalida a fila preservando a iniciada, e sobrevive a reload a qualquer momento. Conta com `concluido` sem `appliedAt` é reparada na próxima abertura de `/trilha` ou `/nivelamento` pelo hook `usePlacementReconciliation`, sem apagar evidência. "Aplicando" é derivado do estado. (36 RF-10, RF-11, §H; 37 D-17) código: `src/hooks/usePlacementReconciliation.ts:25`, `src/lib/store.ts:1447`.
- **C-NIV-6: Retomada.** Retomar depois de reload produz o mesmo θ̂/SE da execução contínua para a mesma sequência (reconstituição por `placementItemsById`). (36 RF-12)
- **C-NIV-7: Refazer.** Refazer não apaga evidência medida (`source: evidencia`); substitui só priors. (36 RF-13)
- **C-NIV-8: Tela de resultado.** `h1` "Pronto. Sua trilha foi ajustada."; um card por área do escopo; área medida com 3 segmentos "Base em construção" · "No caminho" · "Base firme" (θ̂ < −0,5; < 0,7; ≥ 0,7), rótulo em texto e `aria-label="{Área}: {faixa}. {precisão}."`; precisão pela SE da área: SE ≤ 0,45 "Estimativa firme"; ≤ 0,70 "Estimativa inicial"; acima, "Poucas questões. Vamos confirmar estudando."; área não medida com selo "Não medida" e segmentos tracejados, sem faixa; área com poucas questões (SE > 0,70) com o segmento listrado e "(a confirmar)" — os três estados distintos por texto e forma, nunca só cor; legenda das faixas uma vez por tela (48 T-48.5.2). O `/aha` reaproveita o mesmo cartão quando o nivelamento foi aplicado (48 T-48.4.3). "Por onde começamos" mostra a primeira atividade de `committed`. CTA único "Começar" abre `committed[0]` pelo mesmo caminho do card. Nunca porcentagem, θ, SE numérica, nota prevista, comparação ou habilidades individuais. (36 §F.5; 37 D-38)
- **C-NIV-9: Aplicação dos priors.** Habilidade medida: `updateSkill` com papel diagnóstico (peso 1,2). Não medida: θ = θ̂ da área (ou da matéria com ≥ 2 itens), σ = max(0,9; SE + 0,3), `source = "prior-nivelamento"`, `nEff = 0`. (30 §12.3)
- **C-NIV-10: Inep fora do modelo.** Os parâmetros do Inep importados não entram no modelo (escalas não ligadas); servem só a `scripts/content/incidence.ts`. (36 §G.3; 34 nota)

## 13. Checkpoint da trilha

- **C-CKP-1: Quando.** Inserir se as atividades desde o último checkpoint ≥ limite (15 se a Confidence média das habilidades praticadas < 40 ou ≥ 4 habilidades novas; senão 20), ≥ 3 habilidades distintas praticadas, nenhum checkpoint concluído hoje e ≥ 6 atividades no total; forçar com ≥ 25, ainda 1 por dia. (30 §13.1)
- **C-CKP-2: Composição.** 6 a 8 itens: ~60 % habilidades praticadas desde o último, ~30 % antigas devidas ou com `lapses > 0`, ~10 % um item de esticada (p ≈ 0,5) numa habilidade firme; p-alvo 0,65; só `revisada-humano`/`oficial-conferida` não vistos em 14 dias; pool curto aceita `verificada-ia` e registra no trace. Histórico filtrado por `localDate`. (30 §13.2; 36 §G.4) código: `src/lib/adaptive/constants.ts:187-197`.
- **C-CKP-3: Durante.** Papel `diagnostico` (peso 1,2); sem dica, tutor ou feedback por item ("Resposta registrada"); "Não sei" permitido; sem som de acerto/erro; pode sair e as respostas contam. (30 §13.3, §13.4)
- **C-CKP-4: Recalibração.** Ao concluir, `recalibrar` usa o `predictedP` das tentativas da sessão e `applyCheckpointRecalibration`: superestimada (previu p ≥ 0,8 e errou) → revisão antecipada para amanhã (só antecipa, cria agenda de 1 dia se não houver); subestimada (previu p ≤ 0,4 e acertou) → `challengeEligible` por 7 dias, no máximo 1 desafio por plano, consumido pelo desafio da habilidade. (30 §13.4; 36 RP-4, §G.4; 37 D-27) código: `src/lib/store.ts:1770`.
- **C-CKP-5: Resultado.** XP 20 fixo e 1 bloco (C-XP-4). Tela dedicada `CheckpointResult` ("Checagem feita"): uma linha por habilidade respondida com "Subiu" (ΔDomínio ≥ +5), "Firme" (|Δ| < 5) ou "Vale revisar" (Δ ≤ −5 ou erro com p prevista ≥ 0,8), texto + ícone de forma diferente, sem número; uma frase do que muda ("A revisão de X vem amanhã.", "Um desafio de X fica liberado." ou "Sua trilha segue no mesmo ritmo."); um CTA. Δ contra o retrato do Domínio gravado ao tocar "Começar" (`activeActivity.masteryAntes`, uma vez; recarregar não troca nem volta à entrada). Na tela, o termo é "checagem". (30 §13.5; 31 Fase 14; 48 T-48.5.1, D48-13) código: `src/lib/adaptive/checkpoint.ts#resultadoDaChecagem`, `src/components/learning/CheckpointResult.tsx`.

## 14. Experiência da questão

- **C-QST-1: "Não sei".** Onde `ItemMeta.dontKnowAllowed !== false`, em aula, atividade, `/study`, legado, nivelamento e checkpoint; botão de texto secundário, alvo ≥ 44 px, nunca competindo com "Verificar". Grava `Attempt` com `response: "dont-know"`, `correct: false`, `answer: null`. Feedback neutro (sem vermelho, som ou vibração de erro): correta destacada + explicação curta; em nivelamento e checkpoint, só "Resposta registrada". Tentativas antigas sem `response` são `"answered"`. (30 §16.1)
- **C-QST-2: Explicação em camadas.** Nível 1: a explicação curta do item, sempre visível no feedback. Nível 2: "Ver resolução" (camada detalhada ou passo a passo), só se houver conteúdo. Nível 3: "Explicar melhor" abre a Foca com contexto pedagógico e envia o pedido (C-TUT-2). A camada alcançada vai para `Attempt.helpLevel`; o nível 3 conta para `helpHeavyRecent`. Sem IA, o nível 3 mostra o fallback local. (30 §16.2, §16.4; 32 Fase 7 F7.1/F7.2, divergência de UI registrada)
- **C-QST-3: Atalhos no desktop.** `1`–`5` ou `A`–`E` escolhem, `Enter` verifica e continua, `Esc` fecha folhas; opções marcadas por `role="radio"`/`data-opcao` e ação principal por `data-acao-principal`. (44 §5; 45 §4) código: `src/hooks/useAtalhosDeQuestao.ts:14`.

## 15. Web: rotas, code splitting e layout

- **C-WEB-1: Rotas de entrada.** `/` é a landing (SSR, indexável). `/app` é a porta do produto e o `start_url` do PWA: com sessão autenticada → `HOME_ROUTE` (`/trilha`); sem sessão e com onboarding local concluído → `/login`; nos demais casos → `/quiz`. `/welcome` redireciona para `/`. **Nunca redirecionar a landing.** Todos os CTAs de começar → `/quiz`, independentemente de flags antigas no aparelho; "Entrar" → `/login`. A landing não lê o store nem decide o CTA por `authed`/`onboarded`. CTAs são `<Link>` do roteador. O cadastro vem no fim do onboarding, ao começar a estudar (46 D-16/D-20). Código: `src/routes/app.tsx`, `src/marketing/components/CtaButton.tsx`.
- **C-WEB-2: Code splitting (não regredir).** A raiz (`__root.tsx`) não importa store, `AppShell` nem conteúdo; o `PersistenceBanner` entra com `lazy()` e só fora da landing; páginas de erro da raiz usam coluna simples. Arquivo de rota não exporta nada além de `Route`. `pendingComponent`/`errorComponent` pesados vão com `lazyRouteComponent`. O destravamento de áudio ignora a rota `/`. (44 §3; 45 §3; CLAUDE "Produto web integrado") código: `src/routes/__root.tsx:24-29`, `src/routes/trilha.tsx:48-49`.
- **C-WEB-3: Landing isolada no bundle.** GSAP só na landing, em import dinâmico depois do `load`. CSS de marketing (`src/marketing/styles/marketing.css`) só pela rota `/`, usando tokens base (`--mar`, `--gelo`…), nunca `var(--color-*)`. Quem abre `/trilha` não baixa esse CSS nem o GSAP. (44 §3, §4; 45 §3; CLAUDE) código: `src/routes/index.tsx:5`.
- **C-WEB-4: Metadados e PWA.** Raiz `noindex, nofollow`; `/` sobrescreve com `index, follow`, título, descrição, Open Graph, JSON-LD e canonical (`VITE_SITE_URL`). `site.webmanifest` gerado: `start_url: /app`, `scope: /`, `display: standalone`, cores do token `--neve`, ícones sobre `--mar`. Sem service worker. Fontes autohospedadas em `public/fonts/`, sem Google Fonts. (44 §4, §7; 45 §6)
- **C-WEB-5: Tokens de layout.** Valores em `src/styles.css` (base 440 px abaixo de 768): (36 §F.6; 44 §4; 45 §4) código: `src/styles.css:112-201`.

  | Token | < 768 | 768–1023 | 1024–1279 | ≥ 1280 | ≥ 1600 |
  |---|---|---|---|---|---|
  | `--app-col` | 440 | 560 | 600 | 680 | 680 |
  | `--reading-col` | 440 | 560 | 640 | 720 | 720 |
  | `--path-col` | 440 | 440 | 440 | 440 | 440 |
  | `--nav-rail` | 0 | 0 | 96 | 232 | 232 |
  | `--wide-col` | `--app-col` | `--app-col` | 880 | 1000 | 1120 |
  | `--side-col` | 0 | 0 | 300 | 320 | 340 |
  | `--tutor-painel` | 0 | 0 | 400 | 420 | 420 |

- **C-WEB-6: Regras de layout.** Abaixo de 768 px nada muda visualmente (gate de regressão do mobile); abaixo de 1024 px nada do desktop se aplica. Em ≥ 1024, `BottomNav` some e aparece `NavRail` com os mesmos itens; em ≥ 1280, barra lateral com logo e rótulos. Elementos fixos ancoram à coluna em que moram pelos tokens, nunca por `13.75rem`. `BottomSheet` é um componente só, ancorado embaixo, na largura da coluna. O caminho em zigue-zague fica em `--path-col` (geometria calibrada para 440). Leitura limitada a ~65ch. Trilha em ≥ 1024: duas colunas, painel de contexto só com o que já existe. Foca IA em ≥ 1024: painel lateral direito que não cobre a questão; folha de baixo no celular; abre só sob demanda. Hover só em `@media (hover: hover)`. (36 §F.6; 37 D-55; 44 §5; 45 §4)
- **C-WEB-7: Acessibilidade verificável.** Diálogos com trap de foco e `inert` (`useDialogA11y`); alvos de toque ≥ 44 px; `type="button"` em todo botão; scrim no token `--scrim` (0,4 no claro, 0,55 no escuro); texto sobre preenchimento pelos tokens `--on-*`; foco visível; 320 px sem rolagem horizontal; `aria-live` no feedback. (36 §F.6, T-08.*; 37 D-60, D-64, D-67; 20 §20 A5; 30 §22) código: `src/hooks/useDialogA11y.ts:116`, `src/styles.css:125,210`.
- **C-WEB-8: Build e deploy.** Um build (`bun run build`), um deploy na Vercel; o preset do Nitro é escolhido por ambiente. (27 §14.3; 44 §9; CLAUDE) (46, futuro: sem Lovable e sem Netlify, padrão fora da Vercel `node-server`; 46 §C.6, F03.)

## 16. Feature flags

Em `src/lib/features.ts`; override local por `localStorage["foca.flags"]` (JSON parcial) só em dev ou com `?debug=1`. Rollout por porcentagem exige backend e não existe. (30 §25; 22 §5) Estado em 29/09/2026 (todas ligadas desde 27/09, 32 F15.1):

| Flag | Valor | Controla | Desligada |
|---|---|---|---|
| `microlicoes` | `true` | Entrada do dashboard para a trilha | Esconde a entrada |
| `trilhaAprendizado` | `true` | Registro de rollout (20) | — |
| `dicasVestibular` | `true` | Registro de rollout (20) | — |
| `recomendacaoAdaptativa` | `true` | Registro de rollout (20) | — |
| `trilhaComoHome` | `true` | `/trilha` como home, nav V2 | `/dashboard` home, nav V1 |
| `pacotesConteudo` | `true` | Carrega `public/content/v1` | Só conteúdo embarcado |
| `masteryModel` | `"on"` | `shadow` calcula só no debug; `on` UI e motor usam | Volta a `shadow`; dados ficam |
| `sinaisAmpliados` | `true` | `/study` e `LessonPlayer` gravam tentativas | Para de gravar |
| `botaoNaoSei` | `true` | Botão e variante neutra | Some o botão |
| `explicacaoEmCamadas` | `true` | Escada de explicação | Volta a "Explicar melhor" único |
| `contextoPedagogicoIA` | `true` | `pedagogy` no tutor | Contexto anterior |
| `jornadaAdaptativa` | `true` | Jornada na home, `/atividade`, `/study` pelo motor | Home = mapa por matéria |
| `nivelamento` | `true` | Oferta e reconciliação do nivelamento | Some a oferta; resultado salvo vira prior |
| `checkpointsTrilha` | `true` | Checkpoint no plano | Planner não insere |

A flag `audioDiagnostico` do 30 §25 não existe no código (C-SOM-7). (32 Fase 8 F8.9)

## 17. Metadados de item e proveniência

- **C-ITEM-1: `ItemMeta`.** Arquivo lateral indexado pelo id estável (itens legados não são editados em massa): `skillIds` (principal em `[0]`, até 3), `difficulty` 1–5, `irt {a, b, c, source}`, `roles`, `estimatedSeconds`, `dontKnowAllowed` (padrão `true`), `explanationLayers?`, `source {kind: "autoral" | "ia-validada" | "oficial" | "adaptada-de-oficial", …}`, `validation {status, reviewedAt?, reviewer?, reviewKind?, reviewNote?}`, `examProfiles`. Item sem meta: habilidade da lição, dificuldade 2, papéis prática/revisão. (30 §8.4; 36 §G.5)
- **C-ITEM-2: Status e elegibilidade.** `ItemValidationStatus` = `"gerada" | "verificada-ia" | "revisada-humano" | "oficial-conferida"`, sem renomear. Nivelamento e checkpoint: só `revisada-humano` ou `oficial-conferida`; prática, revisão e desafio aceitam `verificada-ia`. (30 §8.4; 36 §G.5)
- **C-ITEM-3: `reviewKind`.** `"humano" | "ia-delegada" | "gabarito-oficial" | "autoria-legada"`; ausente = desconhecido. `revisada-humano` significa "aprovada no portão de revisão"; `reviewKind` diz quem revisou. Preenchido por script (`reviewer` com "delegada"/"amostra" → `ia-delegada`; `oficial-conferida` → `gabarito-oficial`; metas de trilhas legadas → `autoria-legada`) e gravado também por `publish.ts` e `import-official-items.ts` em item novo. Não muda status nem elegibilidade. Estado: 737 `ia-delegada`, 18 `gabarito-oficial`. (36 §G.5, RP-9; 37 D-47) Verificação: `scripts/content/marcar-proveniencia.ts --check`.
- **C-ITEM-4: `retired`.** Campo opcional `retired: true` no JSON e em `GeneratedItemRef`. `itemDisponivel(id)` devolve `false` para retirado, e seleção, pool do nivelamento e checkpoint passam por ele. O item continua resolvível por id (histórico, sessão ativa, aula que o referencie). Aula gerada que referencia item retirado troca a referência por outro da mesma habilidade e dificuldade, se houver. (36 §G.6; 37 D-49) código: `src/content/items/index.ts:29,38`.
- **C-ITEM-5: `irtFromDifficulty`.** Itens de pacote recebem `b` ∈ {−1,6; −0,8; 0; 0,8; 1,6} para dificuldade 1–5, `a = 1`, `c = 1/nº de opções`, `source: "estimado"`; aplicado na fonte (`src/content/banco/**`) e por `publish.ts` e `import-official-items.ts`, para não reintroduzir o default `a=1, b=0, c=0.2`. Tentativas antigas não são reinterpretadas. (36 §G.3, RP-2; 37 D-24, G-7) código: `src/content/items/irt.ts:39`. Mapeamento de outras fontes: banco geral Fácil/Médio/Difícil → 2/3/4; passo de microlição 1/2/3 → 1/2/3 (`desafio` +1); trilha legada padrão 2. (30 §8.4)
- **C-ITEM-6: Versão e revisão.** Item alterado incrementa `version`; `Attempt.exerciseVersion` fica; nunca reescrever tentativa; nunca mudar a ordem das alternativas (quebraria `presentedOrders` e letras citadas); reescrever alternativa mantém o índice da correta. (36 §G.6; 20 §9)
- **C-ITEM-7: Atribuição oficial.** `Exercise.fonte` ("ENEM 2023") renderizado abaixo do enunciado em todo consumidor; `atribuicaoOficial(meta.source)` alimenta a folha de feedback ("Questão do ENEM 2023") em aula, atividade e revisão; nivelamento e checkpoint mostram só o enunciado com `fonte`. A regra de direitos está em produto/regras R-CONT-1…5. (34 "Requisito", nota de 28/09; 37 D-51) código: `src/content/items/atribuicao.ts:12`.

## 18. Pipeline de conteúdo

- **C-PIPE-1: Fora do app.** Roda offline, em desenvolvimento; nada de `scripts/content/` é importado por `src/`; chaves `CONTENT_LLM_*` só no `.env` de quem roda, nunca no bundle nem na Vercel. O OmniRoute entra só aqui, como ferramenta. (30 §19.1, §19.3) código: `tests/unit/pipeline-boundary.test.ts`.
- **C-PIPE-2: Estágios.** 0 planejar → 1 gerar (JSON com schema estrito, sem mudar `Exercise`) → 2 criticar → 3 resolver sem gabarito (família de modelo diferente quando possível) → 4 verificar (determinístico; iguais e confiança ≥ 0,8 seguem) → 4b escalar → 5 humanizar (só explicação e ensino) → 6 validar → 7 amostrar (humano 10 % do lote, mínimo 10, + 100 % dos que passaram por 4b; reprovação > 5 % volta ao 2) → 8 publicar em `src/content/banco/<materia>/<habilidade>.json` com `validation.status` e `source.generatedBy`. O estágio 7b (revisão completa delegada) está documentado em `content-pipeline/README.md`. (30 §19.2; 36 §I)
- **C-PIPE-3: Guarda do Humanizer.** Muda a forma, nunca o conteúdo: a versão humanizada é descartada se mudar números e unidades, fórmulas, nomes próprios e datas, alternativas, índice do gabarito, termos técnicos da habilidade ou negações. Nunca roda em enunciado nem alternativa. (30 §19.4)
- **C-PIPE-4: Validação de item (bloqueante).** Schema de `ItemMeta` e `Exercise`; gabarito no intervalo; alternativas distintas; enunciado 15–120 palavras (interpretação até 250); explicação 25–80; sem "todas/nenhuma das anteriores"; sem LaTeX; sem "segundo o texto" sem texto; habilidade existente e `ativo`; nenhum `imagem.url` externo; duplicata (Jaccard de 5-gramas > 0,6 na mesma habilidade) rejeita. (30 §19.5)
- **C-PIPE-5: Avisos de forma (não bloqueiam).** `tamanho-correta-maior` (≥ 2,0 alta; 1,5–2,0 média), `tamanho-correta-menor` (≤ 0,4), `dispersao-tamanhos` (> 0,6), `absolutismo-distratores`, `travessao-alternativa`, `posicao-lote` (> 40 % com ≥ 20 itens), `quase-duplicata` (bigramas ≥ 0,4), `explicacao-cita-alternativa-errada` (alta). Exceção registrável por id em `content-pipeline/excecoes-qualidade.json`. Com aviso alto, só `humanReview.verdict === "aprova"` do próprio item libera a publicação. Auditoria: `scripts/content/auditar-qualidade.ts`. (36 §G.7, RP-8; 37 D-44, D-45)
- **C-PIPE-6: Métricas por lote.** Conflito no estágio 4 > 15 % ou reprovação humana > 5 % bloqueia a onda até revisar o prompt. (30 §19.6)
- **C-PIPE-7: Pacotes.** Fonte em `src/content/banco/`; `scripts/content/build-packs.ts` (predev e prebuild) gera `public/content/v1/` (índice leve + um JSON por matéria, com hash e `manifest.json`), `src/content/banco/aulas-geradas.ts` e `itens-gerados.ts`. Conteúdo em TypeScript (microlições, trilhas, banco geral) fica onde está e é síncrono; só conteúdo do pipeline vai para pacotes. Validação pesada no build e nos testes; em runtime, só checagem de forma. (30 §21.3; 37 D-48, D-50)

## 19. Divergências conhecidas (contrato × código)

Registradas, não corrigidas por este documento.

| ID | Contrato | Código | Situação |
|---|---|---|---|
| DC-1 | 30 §13.5: XP do checkpoint pelo ledger `checkpoint:<id>`, constante `CHECKPOINT_XP` | `xpAlvoDaAtividade` fixa 20 (`src/lib/store.ts:1805`) e grava `atividade:<attemptKey>` (`:1833`); `CHECKPOINT_XP` (`src/lib/adaptive/constants.ts:197`) não é usada | O valor bate; a chave segue C-ATV-7 (36), que prevalece. Remover a constante ou usá-la é limpeza |
| DC-2 | 30 §17.3: `validateTutorRequest` rejeita acima de 2 erros, 3 pré-requisitos, 240 caracteres | **Resolvida na 48 F2:** o cliente não manda mais o contexto pedagógico; o servidor o calcula com `buildPedagogicalContext` (2/3/240) sobre o documento sincronizado | Sem divergência |
| DC-3 | 30 §20.2/§20.3, flag `audioDiagnostico` | Não existem | Pendência de aparelho físico (32 G11); ver C-SOM-7 |
| DC-4 | 30 §16.2: nível 1 recolhido no acerto, componente `ExplanationLadder` | Nível 1 sempre visível; `FeedbackSheet` reaproveitada | Divergência de UI aceita (32 F7.1/F7.2) |
| DC-5 | 30 §13.5: tela de resultado do checkpoint por habilidade | Tela genérica de atividade | Fora do escopo do 36 (§F.8); backlog |
