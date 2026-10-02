---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [gamificacao, recompensas, sequencia, XP, nivel, feedback sensorial, som, haptico]
substitui: []
substituido-por: null
---

# Gamificação, feedback, som e háptico

> **Como usar.** Documento canônico das regras **vigentes** de recompensa, sequência (streak), XP, nível, intensidade de feedback, identidade sonora e háptico. Consolida o `16` §5, §6 e §9, o `20` §5, §6 e §12, o `24`, o `30` §14.4 e §20 e o `41` V-4, conferidos contra o código em 29/09/2026. Origem de cada regra como `(NN §x)`; os números de documento são permanentes. Os valores exatos moram no código (arquivo e linha citados); se o código e este texto divergirem, o código é o fato e a divergência vai para o registro da iniciativa ativa. A seção 8 lista pontos a avaliar sob o ECA Digital; ela **não** é parecer jurídico.

## 1. Tese e limites

- O Foca otimiza **frequência**, não duração. A métrica é dias seguidos, não minutos por dia; a sessão termina e o app deixa a pessoa ir (16 §0, §2).
- XP mede atividade e recompensa, **não** conhecimento nem nota prevista (20 §12).
- Recompensa previsível e proporcional; nada de recompensa variável (16 §0, §9).
- Não existem, e não entram sem spec própria: moedas, vidas, multiplicadores aleatórios, compra de progresso, ranking competitivo real, conquistas/badges (20 §12; 16 §7). O ranking `/ranking` é mock e a tela diz "Turma de demonstração" (46 §A.2). **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2.

## 2. As linhas que não se cruzam (16 §9)

Lista inegociável. Cada item funciona para engajamento e mesmo assim não entra:

1. Nada de rolagem infinita. Aula tem fim.
2. Nada de recompensa aleatória (loot box, baú surpresa, XP variável).
3. Nada de bloquear estudo como punição (vidas, corações). **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2.
4. Nada de ansiedade monetizada: não se vende recuperação de sequência.
5. Nada de comparação humilhante. Ranking mostra a turma, nunca "você é o pior".
6. Nada de notificação fora de hora: janela 08h–21h, no máximo 1 por dia. (Hoje não há notificações, 46 §A.2.)
7. Nada de esconder o botão de sair.

E a regra do streak (16 §6): **a sequência nunca bloqueia conteúdo, nunca custa dinheiro para recuperar e nunca é usada como chantagem**.

## 3. XP

Toda concessão é idempotente: repetir a mesma conclusão não paga de novo (20 §12; 36 RF-6). Valores no código:

| Fonte | Regra | Código |
|---|---|---|
| Bônus de onboarding | 50 XP, **uma vez** (ledger `onboarding:bonus`); refazer o `/quiz` não repaga | `store.ts:755-773` |
| Questão do banco geral (`/study`) | Teto vitalício de 15 por item; primeira errada dá 5; melhorar para certa dá a diferença (10); repetição não dá nada; errar depois não tira XP | `store.ts:928-970` (`registrarResposta`, linha 943, ledger `questao-geral:<id>`) |
| Lição de redação legada | 10/20/30 por faixa (1/2/3 estrelas, limiares 70 % e 90 %); replay paga só a diferença para a melhor faixa | `store.ts:794-800`, `completeLesson`, `store.ts:828` |
| Microlição | 10/20/30 por faixa, só as questões de prática contam; replay paga só a diferença | `completeMicroLesson`, `store.ts:879` |
| Atividade da jornada (prática, desafio, reforço) | 10/20/30 por faixa | `xpAlvoDaAtividade`, `store.ts:1803-1808` |
| Revisão | 5 fixo | idem (20 §12; 30 §14.4) |
| Checkpoint | 20 fixo (o `30` §14.4 substituiu o "checkpoint não dá XP" do `20` §12) | idem |

- Atividade da jornada: idempotência por tentativa, `attemptKey = "<id>@<startedAt>"`; ledger `atividade:<attemptKey>` (36 RF-6; `completeJourneyActivity`, `store.ts:1827`).
- Som de XP não toca a cada mudança numérica (20 §5).
- Não confundir com `prefs.level`, que é o nível **escolar** (16 §10).

## 4. Nível

Derivado do XP, 10 patamares fixos (`NIVEL_TABELA = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200]`, `nivelDeXp`, `store.ts:1017-1034`; origem 18 §9). Limiares preservados no MVP (20 §12). Subir de nível dispara o som `level-up` no fechamento (§6.3).

## 5. Meta diária e sequência

### 5.1 Meta diária

- Unidade: **blocos concluídos**. Contam aula geral, lição de redação, microlição, atividade da jornada e sessão de revisão; não contam checkpoint isolado, abrir o tutor, ver um card sem concluir nem abrir o app (20 §12). Flashcards: um lote de até três itens devidos conta como **um** bloco (`registrarLoteFlashcardsConcluido`, `store.ts:1006`).
- Bater a meta não dá recompensa escalonada; passar da meta não dá bônus (16 §8).
- A meta fechada celebra uma vez por dia (`today.celebrouMeta`, `marcarMetaCelebrada`, `store.ts:1045`).
- **Divergência conhecida:** o `20` §12 e o `16` §8 pedem meta inicial de **1** bloco para usuário novo; o padrão no código é `dailyLessons: 3` (`store.ts:238`). Decisão pendente; vai para `produto/backlog.md` (46 T-01.4).
- **Divergência conhecida:** a trilha conta a meta por blocos (`today.completedBlockIds`, `src/components/learning/TrailHeader.tsx:18`, `src/routes/trilha.tsx:121`), mas o som `meta-diaria` no fechamento de lição e de `/study` compara `today.lessons` (`src/hooks/useLearningSession.ts:325-327`, `src/routes/study.tsx:198`). Redação e flashcards contam bloco mas não somam em `today.lessons`. O `20` §12 manda contar blocos.

### 5.2 Sequência (streak) e congelamento

Regra conferida em `registrarAtividade` (`store.ts:691-738`) e no `41` V-4:

- Avança **no máximo uma vez por dia**, com qualquer bloco concluído; o critério é presença, não volume (16 §6; 20 §12). As datas são **locais** (`hojeISO`), nunca UTC.
- Primeira atividade de sempre: sequência 1. Veio ontem: +1. Perdeu **um** dia e tem congelamento: gasta 1 e a sequência continua. Qualquer outro intervalo: volta a 1.
- **Congelamento:** estoque inicial 1 (`store.ts:274`); **+1 a cada 7 dias de atividade, máximo 2**; cada um cobre **um** dia parado (41 V-4). O contador é explícito (`activityDaysSinceFreezeAward`), independente do histórico de 60 dias (20 §12; `store.ts:716-720`). O gasto é automático e o aluno descobre depois.
- Quebrar a sequência não tem drama: sem animação de vidro quebrando, sem som de derrota. A Foca recebe com a voz de retorno (16 §6; `design/mascote.md` §1).
- `bestStreak` guarda o recorde, mostrado como alvo depois de quebrar (16 §6).
- Marcos com celebração maior: 7, 30 e 100 dias (`isStreakMilestone`, `store.ts:1058-1061`).
- Limite de hoje: streak, XP e congelamento são calculados com o relógio do aparelho e podem ser adulterados. O plano `46` §E.4 move o cálculo para o servidor.

## 6. Feedback: intensidade, som e háptico

### 6.1 Separação de responsabilidades (20 §5)

Correção pura (sem efeito) → transação no store (retorna só eventos novos) → coordenação (despacha som e háptico) → apresentação (renderiza o snapshot). Som e háptico só disparam em reação a um evento de domínio, nunca num efeito de montagem (`src/lib/feedback/dispatch-feedback.ts:16-24`). O feedback é imutável durante a interação (20 §4.1).

### 6.2 Níveis de intensidade (20 §5)

| Nível | Evento | Visual/copy | Som | Estado no código |
|---|---|---|---|---|
| 0 | Navegar, selecionar opção, abrir resolução | Resposta direta da interface | Silêncio | ok |
| 1 | Acerto/erro | Alternativa + explicação + frase curta | `resposta-correta` / `resposta-incorreta` | `dispatchAnswerFeedback` |
| 2 | Terceiro acerto consecutivo | Microcelebração, uma vez por sessão | `acerto-consecutivo` | **não disparado** (24) |
| 3 | Concluir bloco/meta | Recap, progresso e mascote | Resolução média | `dispatchClosingFeedback` |
| 4 | Nível, capítulo ou conquista | Celebração maior, nunca obrigatória para avançar | Especial, até 1 s | nível e capítulo sim; conquista não existe |

- "Não sei" não tem som nem vibração: nem de acerto (não seria honesto) nem de erro (não é punição) (30 §16.1; `dispatch-feedback.ts:26`).
- Erro de rede não toca som de erro (20 §6.4).
- Não atribuir a causa do erro a "desatenção" ou "falta de esforço" sem evidência (20 §5).

### 6.3 Prioridade no fechamento

Numa conclusão com várias recompensas, toca **só o som de maior prioridade**, sem fila de jingles (20 §5). Ordem vigente (24, que substitui a do `20` §5):

especial → nível → conquista → capítulo → meta → marco de sequência → sequência diária → lição

Código: `PRIORIDADE_FECHAMENTO` em `src/lib/audio/identity.ts:18-27`; `dispatchClosingFeedback` sempre inclui `conclusao-licao` como base (`dispatch-feedback.ts:41-49`).

### 6.4 Identidade sonora v2 (24)

- 12 WAVs aprovados pelo proprietário em 21/09/2026, copiados sem alteração de bytes para `public/sfx/v2/`: `resposta-correta`, `resposta-incorreta`, `acerto-consecutivo`, `conclusao-licao`, `level-up`, `conquista`, `streak-diario`, `marco-streak`, `capitulo-desbloqueado`, `meta-diaria`, `abertura-importante`, `recompensa-especial` (`SOUND_ASSETS`, `identity.ts:2-15`).
- Cinco estão preparados sem disparo: `acerto-consecutivo`, `conquista`, `capitulo-desbloqueado`, `abertura-importante`, `recompensa-especial` (24). Aprovar um som não cria o evento de domínio.
- Partituras e QA de sinal: `docs/design/audio/v2/`; `py scripts/foca_sound/verify.py --integrated` confere a igualdade produção × aprovados (24).
- `src/lib/sfx.ts` é fachada histórica sem uso; não adicionar chamada nova (`sfx.ts:8-13`).

### 6.5 Motor de áudio (`src/lib/audio/engine.ts`)

Contrato (20 §6.4; 24):

- Um `AudioContext`, criado só no navegador e destravado por gesto. Hoje o destravamento ouve `pointerdown` e `keydown` na raiz e **ignora a rota `/`**, para a landing não baixar os sons (`src/routes/__root.tsx:183-197`; 45 §3).
- Evento de resposta atrasado mais de 300 ms é descartado; recompensa espera no máximo 500 ms (`engine.ts:127-137`). O prazo inclui carregar, decodificar, `resume` e fila.
- Mudo, aba oculta, `pagehide` e navegação cancelam os sons com fade de 30 ms (`FADE_S = 0.03`, `engine.ts:4,32-35`).
- Falha de rede, decodificação ou autoplay é silenciosa e não impede a questão.
- Preferências de som (`prefs.sound`) e háptico (`prefs.haptics`) são **independentes**; ambas começam ligadas (`store.ts:243-244`). Mudo persiste e é respeitado sempre (16 §3).

### 6.6 Háptico (`src/lib/haptics.ts`)

| Padrão | Vibração | Quando |
|---|---|---|
| `acerto` | 30 ms | Resposta certa |
| `erro` | 25-40-25 ms | Resposta errada |
| `fim` | 60 ms | Fechamento |
| `marco` | 30-50-40-50-60 ms | Fechamento com nível ou marco de sequência |

Degrada em silêncio onde `navigator.vibrate` não existe (iOS Safari); falha nunca quebra a interface (16 §4).

### 6.7 Pendências de áudio e háptico

- **iPhone no modo silencioso: decisão do proprietário pendente** (30 §20.2 item 6; 32, decisão 3). Enquanto isso, vale o padrão recomendado: respeitar a chave de silencioso. A frase no Perfil ("No iPhone, o som segue a chave de silencioso") ainda não existe no código.
- A Fase 1 do `31` (áudio e háptico) não foi executada (32, "Achado mais importante do spec-verifier"): não existem `getAudioDiagnostics()`, o destravamento em `pointerup`/`touchend`/`click`, a pré-carga priorizada, a política de prazo em duas partes, o adaptador de háptico do `30` §20.3 nem o cabeçalho de cache de `/sfx/v2/` no `vercel.json`.
- Teste em aparelho físico e escuta humana: nunca feitos (37 §5).

## 7. Movimento e `prefers-reduced-motion`

- Toda recompensa funciona sem animação: com `prefers-reduced-motion`, a cor, o som e o número continuam (16 §5).
- Regra global em `src/styles.css:695-703` (animações e transições reduzidas a 0,01 ms) e regras locais (ex.: o "piscar" da Foca, `styles.css:1023-1027`; `FocaMark`, `TutorBubble`, `LessonNode`, `usePathFocusScroll`).
- Erro: tremor curto de baixa amplitude; tremor longo humilha (16 §5).
- A landing tem regras próprias de movimento (42/43); o app usa só CSS funcional, sem scrollytelling (44 §8).

## 8. ECA Digital (Lei 15.211/2025) — pontos de atenção

O plano `46` §H.1 registra que a Lei 15.211/2025 está em vigor desde 17/03/2026 (com o Decreto 12.880/2026) e que o Foca tem acesso provável por adolescentes. Os itens abaixo são **perguntas a avaliar na tarefa 46 T-11.2** (`legal/avaliacao-eca-digital.md`), com revisão jurídica. Este documento não conclui se há ou não conformidade.

| Tema da lei (46 §H.1) | O que existe no Foca hoje | A avaliar |
|---|---|---|
| Evitar uso compulsivo, incluindo "recompensas pelo tempo de uso" (art. 17 §4 II; Decreto art. 9) | Sequência diária com congelamento, meta diária, XP, nível, sons de marco. Recompensa por conclusão e por dia de presença, não por minutos; sem recompensa por passar da meta (§3, §5) | Se sequência, congelamento e sons de marco se enquadram como mecanismo de uso compulsivo; se o limite de 1 aula por meta e a saída limpa bastam |
| Proteção máxima por padrão (arts. 3, 7) | Som e háptico ligados por padrão; sequência e meta sempre visíveis | Quais padrões mudam para quem tem menos de 18 anos |
| Controle de recomendação personalizada (art. 17 §4 V) | O motor adaptativo escolhe a próxima atividade (30 §9–§13) | Se e como oferecer controle ou explicação da recomendação |
| Revisão e desligamento de IA não essencial (art. 17 §4 VIII) | Foca IA só sob demanda (20 §4.2) | Opção de desligar (prevista em 46 §E.7) |
| Comparação social | Ranking mock, identificado como demonstração | Se o ranking deve sair ou ficar desligado para menores |

Notificações, loja, moeda e recompensa aleatória não existem hoje (§1–§2); qualquer proposta de adicioná-las passa por esta avaliação antes. **Revista pela 50 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 50](../specs/50-gamificacao-e-pratica/spec.md) que a implementa for publicada; ver 50 §0.2 e §0.3.
