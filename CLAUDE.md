# CLAUDE.md — Flash Test (protótipo)

Contexto operacional para trabalhar neste repo. As decisões de produto/negócio moram fora daqui — leia-as antes de qualquer mudança de escopo (não só de código).

## Onde está a fonte de verdade

Este repo é **só o protótipo**. As specs completas do produto/negócio/pitch estão em `D:\Matheus Vellozo\Pre College SDD\` (pasta irmã, fora deste repo). Antes de decidir *o quê* construir, ler:

| Arquivo em `Pre College SDD/` | Quando consultar |
|---|---|
| `08-produto-e-estrategia.md` | Definição do produto, jornada completa, telas do MVP, estratégia de IA (Seção 6), Golden Path da demo (Seção 7) |
| `09-branding.md` | Design system oficial (cores/tipografia/logo) — tokens não-negociáveis |
| `10-prompt-prototipo-app.md` | Especificação tela-a-tela do MVP completo (8 telas) que este protótipo deveria implementar |
| `11-estado-prototipo-handoff-claude-code.md` | **Ler primeiro.** Auditoria linha-a-linha do que existe no código vs. o que foi pedido, com prioridades P0/P1/P2 |
| `00-constituicao.md` | Regra central: "IA no centro, não cosmética" — qualquer feature de IA precisa responder o que ela decide/gera, com que dado, e o que acontece se errar |

Não duplicar essas specs aqui. Se uma decisão de produto mudar, o registro fica lá, não neste arquivo.

## O produto em uma frase

App mobile-first de preparação para ENEM em **aulas de 60 segundos** (1–2 questões por vez) com uma IA que aprende a lacuna de cada aluno e decide a próxima questão. Diferencial: **constância e personalização**, não conteúdo (o app grátis do governo, MEC Enem, já cobre conteúdo + correção de redação). Ver `08-produto-e-estrategia.md` Seção 0 antes de propor qualquer feature que compita em "mais conteúdo".

## Stack real

- **Framework:** TanStack Start (React 19) + TanStack Router com rotas *file-based* — cada arquivo em `src/routes/` é uma rota. `src/routeTree.gen.ts` é **autogerado, nunca editar à mão**.
- **Build/pacotes:** Vite 8, gerenciador é **bun** (`bun.lock`, `bunfig.toml`). Rodar `bun install && bun run dev` — não usar npm/yarn (gera lockfile paralelo/conflitante).
- **Estilo:** Tailwind CSS v4 (`@tailwindcss/vite`), tokens em `src/styles.css` (`@theme inline`), shadcn/ui completo em `src/components/ui/` — usar os componentes prontos em vez de construir do zero.
- **Estado:** tudo em `src/lib/store.ts` (`useSyncExternalStore` + `localStorage`, chave `flashtest.state.v2` — a v1 ficou incompatível ao migrar para o quiz unificado e a aula de 60s). **Não criar um segundo mecanismo de estado paralelo** — qualquer feature nova (balão global, questões de redação, ranking) estende esse store.
- **Dados mockados:** `src/data/*.ts` (arrays TypeScript tipados) — `questions.ts`, `subjects.ts`, `universities.ts`. Seguir o mesmo padrão para conteúdo novo (ex.: questões de redação).
- **Persistência/backend:** nenhum banco. `login()`/`logout()` só ligam uma flag local — é intencional (cadastro é mock no MVP), não um TODO. A única chamada de rede real é a da IA (abaixo).
- **Segredos:** `.env` na raiz, gitignorado. Copiar de `.env.example`. Nunca commitar chave, nunca expor via `VITE_*` (isso a colocaria no bundle do client).
- **IA:** OpenAI (`gpt-5.4-mini`) via `fetch` direto, sem SDK — o build tem como alvo o runtime de worker, onde uma dependência pensada para Node é risco desnecessário. A separação é intencional: **`src/lib/tutor-core.ts` tem a lógica** (não importa nada do TanStack, então é testável fora do transporte) e **`src/lib/tutor.ts` é só a server function**. A chave vive em `.env` (`OPENAI_API_KEY`, gitignorado) e é lida **só no servidor** — nunca chega ao client, e não deve ser prefixada com `VITE_`. Sem chave, ou em erro/timeout (12s), `generateTutorReply()` cai no `localFallback()` de `tutor-prompt.ts` em vez de quebrar. Prompt estruturado em PACE (`07`), montado em `buildSystemPrompt()` — que inclui uma regra dura **anti-LaTeX**, porque o balão renderiza texto puro e o modelo por padrão devolve `\(x_v\)`.

## Git / Lovable

Repo conectado ao [Lovable](https://lovable.dev) (ver `AGENTS.md`). **Nunca reescrever histórico já publicado** — sem force-push, sem rebase/amend/squash de commits enviados — isso quebra a sincronia do editor Lovable. Push simples é seguro.

## Design system — aplicar com fidelidade

Fonte completa: `09-branding.md` + `Flash Test - design System.html` (raiz do projeto pai). Tokens centrais:

- Flash Navy `#02104E` (fundo da marca) · Flash Gold `#FEB803` (CTA/destaque, usar com parcimônia) · Sucesso `#0AA35A` / Erro `#C0392B` (**só** para feedback de resposta certa/errada, nunca decorativo).
- Títulos: Space Grotesk (bold) · Corpo: Plus Jakarta Sans.
- Geometria: botões/inputs raio 10px (`--radius`), cards 16px (`--radius-card`), chips pílula. Proporção de uso: navy 70% · gold 8% · neutros 22%.
- Motivo assinatura: o **raio** (`<Bolt />` em `AppShell.tsx`), sempre em Flash Gold, nunca esticado. Não existe mascote (a foca foi cortada, ver `12` Seção 0).
- Tokens aplicados em `src/styles.css` na Development 1 (22/07) — as cores antigas `#10284E`/`#FEC641` não existem mais no código.

## Estado do protótipo vs. spec — não assumir que está pronto

O código diverge do que `08`/`10` pediram em vários pontos estruturais (auditoria completa em `11-estado-prototipo-handoff-claude-code.md`, feita 22/07/2026 — reconferir se muito tempo tiver passado). Os pontos que mais importam para quem for programar:

**Fechado na Development 1 (22/07):** quiz unificado em `/quiz` (substitui signup+onboarding, sem e-mail/senha, com 3 questões de conteúdo real), tela de aha em `/aha` (3 lacunas + XP + streak dia 1), unidade "aula de 60s" com 2 questões fixas em `study.tsx`, tokens oficiais em `styles.css`. `/signup` e `/onboarding` viraram redirects para `/quiz`.

**Fechado na Development 2 (22/07):** balão do tutor global e persistente (`TutorBubble`, montado no `AppShell` — vale para toda tela pós-quiz), IA real, foto de questão multimodal, e o gatilho automático de errar uma questão (o balão abre sozinho explicando). O chat de tela cheia que existia em `/study` foi absorvido pelo balão. O provedor migrou de Claude para OpenAI em 22/07 (ver Stack acima e o registro de decisões do `12`).

**Fechado na Development 3 (22/07):**

- **Micro-treino de redação** em `/redacao` (mapa das trilhas) e `/redacao/$licaoId` (player). O app de redação era Next.js + Supabase — stack incompatível para integrar direto —, então o que foi trazido é o **motor de lições e o conteúdo**, reconstruídos nativamente aqui: `src/lib/lessons/` (motor), `src/content/trilhas/` (15 trilhas, 134 lições, 1.204 exercícios), `src/components/lessons/` (player + 7 tipos de exercício no design system). Os mascotes do app de origem foram removidos — quem explica é o tutor do Flash Test.
- **Ranking/turma** mockado em `/ranking` (`src/data/ranking.ts`). O XP do aluno é real; a turma é fictícia, e a tela diz isso.
- **Progresso virou mapa de lacunas** (`/progress`): domínio por matéria com faixas, "ataque primeiro" e o pilar de redação no mesmo painel.
- **Banco de questões: 20 → 59**, cobrindo as 11 matérias, com gabarito distribuído entre A–E.
- **Nav:** os dois pilares (`/study` e `/redacao`) estão na bottom nav; plano, flashcards e ranking são alcançados pelo dashboard.

**Ainda aberto:**

- **Lacunas ainda são heurística local** (`src/lib/gaps.ts`), não refinadas por IA.

Antes de "consertar" qualquer um desses pontos, checar `11` Seção 5 (prioridades P0/P1/P2) e Seção 7 (perguntas em aberto — ex. qual provedor de IA usar, se mantém "sessão" ou migra pra "aula de 60s") — algumas dessas são decisões do time, não bugs.

## O que já está sólido (reaproveitar, não reconstruir)

Design system centralizado em `styles.css` (fácil de corrigir tokens num só lugar) · quiz de entrada com 27 estados + busca de instituições · flashcards com repetição espaçada real (`nextReview`) · progresso por matéria/tópico com barras · player de vídeo real do YouTube por tópico · `AppShell` com bottom nav + `PhoneFrame` mobile-first.

## Regras de escopo (não construir agora)

Sem autenticação real, sem pagamento, sem perfil/conquistas separado, sem versão web, sem biblioteca de conteúdo extensa além do necessário para o Golden Path da demo. Ranking e plano de estudos podem ser mock — não precisam de lógica real por trás.
