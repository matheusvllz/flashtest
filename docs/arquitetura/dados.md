---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [modelo de dados — estado local e servidor]
substitui: []
substituido-por: null
---

# Dados — estado local e servidor

> Duas partes: §1 descreve o estado local **como está hoje** (schema v6); §2 descreve o modelo do servidor que o 46 implementa (Postgres, ADR 0005). Quando o servidor existir, a fonte de verdade do esquema é `src/server/db/schema.ts` (a criar) + as migrações versionadas em `drizzle/` (a criar); esta página resume e aponta. Dados pessoais, finalidades e retenção: [../seguranca/privacidade.md](../seguranca/privacidade.md). Contratos de regra (XP, conclusão, migração): [contratos.md](contratos.md).

## 1. Estado local (hoje)

- **Um só store:** `src/lib/store.ts` (`useSyncExternalStore` + `localStorage`). Chave `foca.state.v3`; versão interna `CURRENT_SCHEMA_VERSION = 6` (`src/lib/state-migrations.ts:24`). O blob inteiro é regravado a cada `setState`.
- **Carga** (`store.ts`, `load()`): lê `foca.state.v3` (ou, uma única vez, a chave antiga `flashtest.state.v2`); JSON ilegível vai para `foca.state.corrupt.<ISO>`; faz cópias de backup únicas (`foca.state.backup.before-learning-v4`, `foca.state.backup.before-v6`); aplica os campos aditivos de cada versão; **versão futura desconhecida bloqueia a gravação**.
- **Duas abas:** o evento `storage` faz a aba adotar a gravação mais nova (última gravação vence; sem mesclagem).
- **Falha de gravação:** a sessão segue em memória e o `PersistenceBanner` avisa (nunca anuncia "salvo").

| Ramo | Conteúdo | Observação |
|---|---|---|
| `authed`, `onboarded` | Flags de roteamento | `authed` é simulado hoje; passa a espelhar a sessão do servidor (46 T-05.6) |
| `prefs` | Perfil do onboarding (nome, UF, etapa, instituição e curso-alvo, provas), preferências de estudo, som, háptico, tema | Dados pessoais — ver privacidade |
| `progress` | XP, streak, congelamentos, dias de atividade (≤ 60), contadores, flashcards, lições de redação | **Recompensas adulteráveis hoje**; o servidor passa a ser a autoridade (46 T-06.2) |
| `learning` | Sessão ativa, lições concluídas, evidência por habilidade, agenda de revisão, tentativas recentes (≤ 500), `rewardLedger` (sem limite), dicas, `skillModel`, `journey`, `placement`, `focusSession`, eventos (≤ 300) | Motor adaptativo roda no cliente |
| `quiz` | Lacunas heurísticas do onboarding | — |
| `tutor.messages` | Conversa com a Foca IA (só texto) | Sem limite hoje (46 T-08.2) |
| `premiumTrial`, `offline` | Simulações | Saem da produção (46 T-10.1) |

Outras chaves: `foca.flags` (override de flags em dev ou `?debug=1`), `sessionStorage` `foca.voz.<slot>` e `foca.licoes.n`.

**Schema v7 (46 T-05.6, aditivo):** `account { userId, linkedAt, lastSyncAt, outbox[], docRev }` e `deviceId`. Voltar a uma versão anterior do app não perde dado.

## 2. Servidor (Postgres no Neon, São Paulo)

Convenções: ids `uuid` (gerados no cliente quando o registro nasce offline, para idempotência); `created_at`/`updated_at` em `timestamptz`; `user_id` em toda tabela de dado do aluno com `ON DELETE CASCADE`; toda consulta filtra por `user_id` da sessão.

| Tabela | Colunas principais | Restrições e índices | Observação |
|---|---|---|---|
| `user`, `session`, `account`, `verification` | Do Better Auth | `user.email` único; `session.token` único; índice `session.user_id` | `account` guarda o hash da senha e o vínculo Google |
| `profile` | `user_id` PK/FK, `plano` (`gratis` \| `pro`, padrão `gratis`, só o servidor altera), `first_name` (≤ 40), `birth_year`, `level`, `residence_state` (UF), `target_course`, `target_institution`, `exam_targets` jsonb, `study_prefs` jsonb, `onboarding_version`, `onboarded_at` | `check` de UF e de faixa de `birth_year` | Minimização: sem data completa de nascimento, escola, cidade, telefone |
| `legal_acceptance` | `id`, `user_id`, `document` (`termos` \| `privacidade`), `version`, `accepted_at` | único (`user_id`, `document`, `version`) | Aceite contratual; sem IP |
| `consent` | `id`, `user_id`, `purpose` (ex.: `responsavel_foca_ia`), `granted_by`, `guardian_email_hash`, `granted_at`, `revoked_at` | índice (`user_id`, `purpose`) | Separado do aceite |
| `attempt` | `id` (cliente), `user_id`, `item_id`, `item_version`, `skill_ids` text[], `role`, `answer`, `correct` (**recalculado no servidor**), `source`, `duration_ms`, `answered_at`, `local_date`, `activity_attempt_key`, `origin` (`live` \| `import`) | PK (`user_id`, `id`); índices (`user_id`, `answered_at`), (`user_id`, `item_id`) | Fatos de aprendizagem |
| `completion` | `user_id`, `key` (ex.: `atividade:<attemptKey>`), `kind`, `completed_at`, `origin` | PK (`user_id`, `key`) | Conclusão idempotente |
| `xp_ledger` | `user_id`, `key`, `xp` (`check 0..100`), `reason`, `created_at` | PK (`user_id`, `key`) | O servidor calcula o XP; o cliente nunca informa o valor |
| `study_day` | `user_id`, `local_date`, `tz` | PK (`user_id`, `local_date`) | Streak e congelamentos derivados |
| `learning_doc` | `user_id` PK, `rev`, `schema_version`, `doc` jsonb (jornada, nivelamento, `skillModel`, revisão, flashcards, dicas, sessão ativa; teto de tamanho), `updated_at` | concorrência otimista por `rev` | Estado de planejamento; **não é autoridade de recompensa** |
| `data_import` | `id` (import_id), `user_id`, `device_id_hash`, `status`, `summary` jsonb, `created_at` | único (`user_id`, `id`) | Idempotência da importação |
| `ai_usage` | `user_id`, `day`, `messages`, `images`, `input_tokens`, `output_tokens`, `cost_micros` | PK (`user_id`, `day`) | Cota e custo; o conteúdo do chat não é guardado |
| `ai_budget` | `day` PK, `cost_micros` | — | Teto global diário |
| `rate_limit` | Do Better Auth + chaves próprias | PK `key` | Janela fixa em Postgres |
| `audit_event` | `id`, `user_id` nullable, `type`, `request_id`, `ip_prefix`, `created_at` | índice `created_at` | Sem conteúdo; 6 meses |

**Migrações:** SQL versionado gerado por `drizzle-kit generate`, revisado à mão e aplicado com `drizzle-kit migrate` pela conexão **direta** (não o pooler). Migração aditiva por padrão; destrutiva só em tarefa própria, com plano de reversão.

**Sincronização:** 46 §E.4 (outbox no store, `sync.push`/`sync.pull`, fatos só adicionados, `learning_doc` com `rev`, XP e streak sempre do servidor).
