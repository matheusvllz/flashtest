---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [inventário de funcionalidades]
substitui: []
substituido-por: null
---

# Inventário de funcionalidades

O que existe no Foca hoje, em que estado e o que acontece com cada coisa na saída para produção (plano `46`). Classificação do `46` §A.2, conferida no código em 29/09/2026 (branch `producao-46`). Pendências de cada linha estão no [backlog](backlog.md).

**Estados:** Real e operacional · Local sem sincronização · Simulada · Incompleta · Dependente de serviço externo · Ferramenta interna. Uma linha pode ter mais de um.

> **D-07 (29/09/2026):** todas as rotas de estudo passarão a exigir conta, e não haverá modo convidado. O onboarding de perfil (`/quiz`) pode ser respondido antes do cadastro; estudar, nivelar e usar a Foca IA só com sessão. Onde a coluna "Tratamento" diz "exige conta", vale 46 T-05.5/T-05.6 (e T-08.1 para a IA). O texto do 46 T-05.6 ainda fala em "modo convidado": a D-07 prevalece.

**Fato de base:** não há backend. O único código de servidor é a server function do tutor (`src/lib/tutor.ts:15-17`). "Estar logado" é o booleano `authed` no `localStorage` (`src/lib/store.ts:151`, ligado em `:742` e `:761`, desligado em `:1992`), e só `/app` o consulta (`src/routes/app.tsx:26`). Nenhuma rota tem guarda.

## Rotas (`src/routes/`)

27 rotas + o layout raiz. `src/routes/README.md` não é rota; `src/routeTree.gen.ts` é gerado.

| Funcionalidade | Rota/código | Estado hoje | Evidência | Tratamento para produção | Spec de origem |
|---|---|---|---|---|---|
| Layout raiz (head, 404, erro, `PersistenceBanner`) | `__root.tsx` | Real e operacional | `__root.tsx:135` (manifest), `:140-141` (404 e erro) | Mantém: não importa store, `AppShell` nem conteúdo (code splitting do `44` §3). `lovable-error-reporting` trocado por `error-reporting.ts` (46 T-03.2) | 44, 36 |
| Landing (SSR, indexável) | `/` — `index.tsx` + `src/marketing/` | Real e operacional | `index.tsx:13-19`; `src/marketing/config.ts:11` | Publicação depende do domínio e de `VITE_SITE_URL` (B-032). Links para `/termos` e `/privacidade` (46 T-11.3). Coerência com a D-07 (B-055). Não baixa o produto (teste do `45` continua) | 40, 42, 44 |
| Porta do produto (`start_url` do PWA) | `/app` — `app.tsx` | Real e operacional | `app.tsx:26` (`authed && onboarded` → `HOME_ROUTE`, senão `/quiz`) | Passa a decidir pela sessão do servidor (46 T-05.5, T-05.6) | 44 |
| Boas-vindas antiga | `/welcome` — `welcome.tsx` | Real e operacional (redirecionamento para `/`) | `welcome.tsx:7-9` | Mantém o redirecionamento | 44 |
| Cadastro antigo | `/signup` — `signup.tsx` | Real e operacional (redirecionamento para `/quiz`) | `signup.tsx:7-10` | Redirecionamentos das rotas antigas revistos com `/cadastro` (46 T-05.4) | 12 (D1) |
| Onboarding antigo | `/onboarding` — `onboarding.tsx` | Real e operacional (redirecionamento para `/quiz`) | `onboarding.tsx:8-11` | Idem | 12 (D1) |
| Onboarding de perfil (9 passos) | `/quiz` — `quiz.tsx` | Local sem sincronização | `quiz.tsx:55` (`completeQuiz([], computeGaps(...))`); `:167` ("Sem e-mail, sem senha") | Pode ser respondido antes do cadastro (D-07); o perfil vai para o servidor (46 §E.3, T-05.4). Frase "Sem e-mail, sem senha" sai (46 T-10.2) | 12 (D1), 20, 36 (Fase 9) |
| "Aha" do onboarding (3 lacunas, XP, sequência dia 1) | `/aha` — `aha.tsx` | Local sem sincronização | `aha.tsx:25,33` (lacunas por heurística de `src/lib/gaps.ts`); `:72` ("aulas de 60s") | Exige conta. XP de onboarding calculado no servidor (46 T-06.2). Copy "60s" sai (46 T-10.2). Heurística segue no backlog (B-068) | 12 (D1), 20 |
| Login | `/login` — `login.tsx` | Simulada | `login.tsx:19-23` (aceita qualquer e-mail e senha, descarta a senha); `:80` (Google = `alert`) | Substituída por e-mail + senha verificados e Google (46 T-05.2, T-05.4, T-05.7). Em produção, sem domínio, só Google (D-10) | 11 (protótipo original) |
| "Esqueci a senha" | `/forgot` — `forgot.tsx` | Simulada | `forgot.tsx:33` (só troca o estado para "enviado") | Vira `/esqueci-a-senha` e `/redefinir-senha` (46 T-05.4); desligada em produção até haver domínio (`AUTH_EMAIL_HABILITADO`, D-10) | 11 (protótipo original) |
| Home: jornada adaptativa e mapa da trilha | `/trilha` — `trilha.tsx` | Real e operacional · Local sem sincronização | `trilha.tsx:43`; `src/lib/features.ts:63,125` (`trilhaComoHome`, `HOME_ROUTE`); `src/lib/adaptive/constants.ts:208` (`PLANNER_VERSION = 2`) | Exige conta. Fila e conclusões sincronizam (46 T-06.3, T-06.4) sem mudar o motor, que continua no cliente | 25, 27, 30, 36 |
| Atividade da jornada (dona da seleção de itens) | `/atividade/$activityId` — `atividade.$activityId.tsx` | Real e operacional · Local sem sincronização | `atividade.$activityId.tsx:24-27`; `store.ts:1644,1813` (`attemptKey`) | Exige conta. Conclusão idempotente vira evento de sincronização; XP e sequência calculados no servidor (46 T-06.2, T-06.4) | 30, 36 |
| Lição da trilha (passos intro/teach/tip/question/recap) | `/learn/$lessonId` — `learn.$lessonId.tsx` | Real e operacional · Local sem sincronização | `learn.$lessonId.tsx:13` | Exige conta; sincroniza (46 T-06.4) | 20, 25 |
| Nivelamento adaptativo (opcional) | `/nivelamento` — `nivelamento.tsx` | Real e operacional · Local sem sincronização | `nivelamento.tsx:39`; hook `usePlacementReconciliation` | Exige conta (D-07); resultado sincroniza como `learning_doc` (46 §E.4) | 30 (F13), 36 (Fase 3) |
| Praticar (sessão de 2 questões, flashcard, vídeo sugerido) | `/study` — `study.tsx` | Real e operacional · Local sem sincronização | `study.tsx:43`; `:417-418` (salva flashcard); `:425` ("Salvo!") | Exige conta; tentativas sincronizam (46 T-06.4) | 12 (D1), 20, 36 |
| Redação: mapa das trilhas | `/redacao/` — `redacao.index.tsx` | Real e operacional · Local sem sincronização | `redacao.index.tsx:12`; conteúdo em `src/content/trilhas/` | Exige conta; sincroniza (46 T-06.4) | 12 (D3), 25 |
| Redação: player da lição (7 tipos de exercício) | `/redacao/$licaoId` — `redacao.$licaoId.tsx` | Real e operacional · Local sem sincronização | `redacao.$licaoId.tsx:7` | Exige conta; sincroniza (46 T-06.4) | 12 (D3), 25 |
| Progresso (domínio por matéria, pilar de redação) | `/progress` — `progress.tsx` | Local sem sincronização | `progress.tsx:44`; `:161` ("aula de 60s") | Exige conta; lê o agregado do servidor (46 T-06.4). Copy em B-050/B-051 | 12 (D3), 30, 36 |
| Flashcards com repetição espaçada | `/flashcards` — `flashcards.tsx` | Local sem sincronização | `flashcards.tsx:15,36,78` (`nextReview`); `store.ts:109` | Exige conta. Não há tarefa explícita no 46 para sincronizar `flashcardReviews`; entra no documento de aprendizagem (`learning_doc`, 46 §E.4) a confirmar no T-06.1 | 11 (protótipo original) |
| Perfil | `/profile` — `profile.tsx` | Local sem sincronização · Incompleta | `profile.tsx:59` (nome só exibido); `:277` ("Meta diária" sem ação); `:300-301` (Termos e Privacidade sem ação); `:313` ("Resetar demonstração") | Exige conta. Área `/conta` com perfil editável, sessões, sair e sair de todos (46 T-05.5); linhas ligadas ou removidas e "Apagar dados deste aparelho" (46 T-10.1); links legais (46 T-11.3) | 11 (protótipo original), 36 |
| Plano de estudos | `/plan` — `plan.tsx` | Local sem sincronização · Incompleta | `plan.tsx:32-39` (tarefas fixas; "1 videoaula" sempre com o título do vídeo `v1`); `:35,57,88` ("60s") | Corrigido ou oculto em produção (46 T-10.1); copy (46 T-10.2) | 11 (protótipo original) |
| Tópicos por matéria | `/topics` — `topics.tsx` | Incompleta | `topics.tsx:94-124`; `store.ts:59` (`selectedTopics` sem outro leitor) | Corrigido ou oculto em produção (46 T-10.1) | 11 (protótipo original) |
| Videoaula | `/video/$id` — `video.$id.tsx` | Dependente de serviço externo (YouTube) | `video.$id.tsx:10-21` (10 IDs fixos), `:25` (sem par, usa a primeira questão), `:28-30` (busca como alternativa) | Exige conta. Curadoria no backlog (B-067); YouTube entra no inventário de terceiros da política (46 T-11.1) | 11 (protótipo original) |
| Ranking / turma | `/ranking` — `ranking.tsx` | Simulada | `src/data/ranking.ts:20` (turma fictícia); `ranking.tsx:98` ("Turma de demonstração") | Oculto em produção (D-15, 46 T-10.1); dados só como fixture de desenvolvimento (46 T-10.3) | 12 (D3) |
| Premium | `/premium` — `premium.tsx` | Simulada | `premium.tsx:14-19` (trial de 24 h no aparelho); `:45` ("Preço a definir") | Fora de produção até haver spec de planos e pagamento (46 T-10.1) | 11 (protótipo original) |
| Offline / sincronizar | `/offline` — `offline.tsx` | Simulada | `offline.tsx:35` (`setTimeout` de 1,5 s finge sincronizar) | Fora de produção (46 T-10.1); offline real depende de service worker (B-072) | 11 (protótipo original) |
| Painel de depuração | `/debug` — `debug.tsx` | Ferramenta interna | `debug.tsx:27-29` (abre em dev ou com `?debug=1`, inclusive em produção) | Desligado em produção (46 T-10.1) | 31 (F8.9) |
| Dashboard antigo | `/dashboard` — `dashboard.tsx` | Ferramenta interna (rollback atrás de flag) | `dashboard.tsx:19-20` (redireciona para `/trilha` com `trilhaComoHome`) | Mantido por ora; remover depois que o backend estabilizar (B-071) | 11, 25 |

## Funcionalidades sem rota própria

| Funcionalidade | Rota/código | Estado hoje | Evidência | Tratamento para produção | Spec de origem |
|---|---|---|---|---|---|
| Foca IA (balão global, só sob demanda) | `src/components/TutorBubble.tsx`, montado no `AppShell`; `src/lib/tutor.ts`, `tutor-core.ts`, `tutor-prompt.ts` | Dependente de serviço externo (OpenAI) | `tutor.ts:15-17` (sem autenticação nem cota); `tutor-core.ts:34` (timeout de 12 s), `:66` (máximo de 40 mensagens); `tutor-prompt.ts:172` (`localFallback`); `AppShell.tsx:130` | Exige conta e política de idade (46 T-08.1); contexto montado no servidor e histórico aparado (T-08.2); cotas por plano e teto de custo (T-08.3, D-12); moderação e salvaguardas (T-08.5). Sem chave, continua o fallback local | 12 (D2), 20, 30 |
| Foto de questão (multimodal) | `TutorBubble.tsx` | Dependente de serviço externo (OpenAI) | `TutorBubble.tsx:29,224` (até 5 MiB, sem compressão) | Compressão no cliente, 2 MiB no servidor, tipo pelo conteúdo (46 T-08.4); no plano grátis a foto conta como uma das 3 mensagens (D-12) | 12 (D2) |
| Histórico do chat | `store.ts:1955` (`tutor.messages`) | Local sem sincronização | Sem limite de tamanho (`store.ts:1955`) | Fica só no aparelho; o servidor guarda só contadores (D-13) | 20 |
| Sons de feedback e recompensa | `src/lib/audio/engine.ts`, `identity.ts`, `src/lib/sfx.ts`, `public/sfx/` | Real e operacional (sem validação em aparelho) | `engine.ts:79,127`; `sfx.ts:130,148` | Sem mudança. Validação em aparelho e diagnóstico no backlog (B-003) | 16, 20, 24 |
| Háptico | `src/lib/haptics.ts` | Real e operacional (sem teste próprio) | `haptics.ts:19-23` (`navigator.vibrate`; iOS degrada em silêncio) | Sem mudança; teste e validação em aparelho (B-003) | 16, 20 |
| PWA | `public/site.webmanifest`, ícones em `public/branding/` | Incompleta | `__root.tsx:135`; nenhum service worker em `src/` nem `public/` | Sem mudança no 46; service worker no backlog (B-072) | 44, 45 |
| Notificações | — | Não existe | Nenhum uso de `Notification` ou `PushManager` em `src/` | Fora do escopo do 46 (§B.3); backlog (B-073) | 15, 16 |
| Persistência local | `src/lib/store.ts` (chave `foca.state.v3`, schema v6), `state-migrations.ts`, `PersistenceBanner.tsx` | Local sem sincronização | `store.ts:181`; `state-migrations.ts:25,27` (backups brutos com nome e e-mail, nunca apagados) | Migração aditiva v6 → v7 com `account`, `outbox` e `deviceId` (46 T-05.6); o store continua único e ganha o outbox (T-06.4); backups apagados depois da importação (T-07.2) | 20, 30, 36 |
| Várias abas | `store.ts` (evento `storage`) | Local sem sincronização | Vale a última gravação (46 §A.3) | Coexiste com o `pull` do servidor (46 T-06.5) | 36 |
| Pacotes de conteúdo | `src/lib/content/repository.ts`, `public/content/v1/` | Real e operacional | `repository.ts:15` (prazo de 8 s) | Sem mudança; correção de respostas no servidor passa a usar o gabarito do índice de conteúdo (46 T-06.2) | 30 (F11), 36 |
| Motor adaptativo (modelo de domínio, planner, checkpoint) | `src/lib/adaptive/` | Real e operacional · Local sem sincronização | `constants.ts:208`; `checkpoint.ts`; `src/components/learning/CheckpointIntro.tsx` | Continua no cliente; o estado sincroniza (46 §E.4). Tela de resultado do checkpoint não existe (B-069) | 30, 36 |
| Sequência, XP e congelamentos | `store.ts` | Local sem sincronização (adulterável) | `store.ts:676-730` (relógio do aparelho); `learning.rewardLedger` sem limite | Servidor vira a autoridade (46 T-06.2, G-8) | 16, 20 |
| "Não sei" e explicação em camadas | `DontKnowButton.tsx`, `ExplanationLayers.tsx` | Real e operacional | `DontKnowButton.tsx:9` | Sem mudança | 30 (F6, F7) |
| Mascote e 8 expressões | `src/lib/brand/foca-expressions.ts`, `FocaMark.tsx` | Real e operacional | Registro das 8 expressões oficiais (45 §5) | Sem mudança | 15, 44 |
| Layout desktop e atalhos de teclado | `NavRail.tsx`, `src/hooks/useAtalhosDeQuestao.ts`, tokens em `src/styles.css` | Real e operacional | `NavRail.tsx`; `useAtalhosDeQuestao.ts` | Sem mudança; legibilidade subjetiva no backlog (B-005) | 36 (§F.6), 44 |
| Tema escuro | `src/styles.css` (`.dark`) | Real e operacional | `styles.css:33` | Sem mudança | 18 |
| Flags de funcionalidade | `src/lib/features.ts` | Real e operacional | `features.ts:58` (`BASE_FEATURES`), `:114` (override por `localStorage["foca.flags"]`, também em produção) | Nova flag `contasHabilitadas` desligada em produção até a publicação final (46 T-11.3) | 30 (§25) |
| Relatório de erro | `src/lib/lovable-error-reporting.ts` | Ferramenta interna (no-op fora da Lovable) | Usado por `__root.tsx` e `TrailError.tsx` (46 §A.1) | Trocado por `src/lib/error-reporting.ts` (46 T-03.2) | — |
