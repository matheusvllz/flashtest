# CLAUDE.md — Foca (protótipo)

Contexto operacional para trabalhar neste repo. As decisões de produto/negócio moram fora daqui — leia-as antes de qualquer mudança de escopo (não só de código).

## Plano vigente — Jornada de Aprendizado V2 (21/09/2026, IMPLEMENTADO em 22/09/2026)

[docs/25-plano-jornada-aprendizado-v2.md](docs/25-plano-jornada-aprendizado-v2.md) é a especificação normativa da reestruturação atual: `/trilha` é a home, hierarquia matéria → seção → capítulo → lição (`CURRICULUM_TREE`), lição como sequência de passos (`LessonStep`: intro/teach/tip/question/recap, 4–8 questões com dificuldade progressiva), revisão sintética de capítulo, as 134 lições de redação entram na trilha como capítulos legados, nav com 4 itens, schema local v5. **Status: as 28 tarefas (T-01…T-28) foram implementadas e testadas em 22/09/2026 — ler [docs/26-registro-execucao-jornada-v2.md](docs/26-registro-execucao-jornada-v2.md) primeiro** pro registro real: o que existe por fase, números de teste (257 unitários + 33 E2E, todos passando, incluindo o projeto Playwright `narrow` 320×700), a tabela de critérios G1–G13 e as decisões editoriais tomadas ao longo da execução (entre elas: o desafio de `porcentagem-valor` não reusou a questão `q21` sugerida pelo plano — tópico incompatível, juros compostos vs. percentual direto —, e uma correção de overclaim encontrada em `crase-quando-usar:revisao-1`). Não é "tudo pronto para sempre": o `26` §8 lista o que continua futuro (revisão pedagógica externa do conteúdo novo, teste em dispositivo físico, observação de participante real). Nos assuntos que cobre, o `25` prevalece sobre o `20` (ver `25` §6.7); todo o resto do `20` (feedback imutável, tutor manual, som por evento, ledger, evidência, migração) continua valendo. Antes de alterar comportamento já entregue por este plano, ler o `25` (a norma) e o `26` (o que foi feito) — não assumir que um trecho do `25` ainda está "não implementado" sem checar o `26`.

## Plano anterior — implementado (21/09/2026)

[docs/20-plano-evolucao-aprendizagem.md](docs/20-plano-evolucao-aprendizagem.md) é a especificação normativa da correção dos bugs e evolução para microaprendizado. **Status: Fases 0–12 implementadas e testadas em 21/09/2026 — ler [docs/22-validacao-piloto-aprendizagem.md](docs/22-validacao-piloto-aprendizagem.md) primeiro** pro registro do que existe, os comandos de teste reais (136 unitários + 20 E2E, todos passando) e as limitações explícitas (sem dispositivo físico, sem escuta humana da identidade sonora, sem observação de participante real). Não é "tudo pronto para sempre": o `22` §6 lista o que continua futuro. Antes de alterar comportamento já entregue, ler o `20` (a norma) e o `22` (o que foi feito) — não assumir que um trecho do `20` ainda está "não implementado" sem checar o `22`.

O `20` prevalece nos assuntos cobertos sobre descrições históricas abaixo e specs antigas incompatíveis, inclusive o gatilho automático do tutor, sorteio de falas no render, tom de cobrança, diagnóstico inicial e promessas de domínio — essas incompatibilidades já foram corrigidas no código, não são mais um risco a evitar, são um comportamento antigo que não existe mais. Consulte a seção 2 do `20` só como diagnóstico histórico PRÉ-implementação, não como estado atual. Convenções técnicas, preservação do store e regras de Git/Lovable continuam válidas, salvo mudança explícita na especificação vigente.

## Onde está a fonte de verdade

As specs completas de produto/negócio/pitch estão em **`docs/`**, dentro deste repo (trazidas para cá em 20/09/2026 — antes viviam numa pasta irmã fora do repo, que não existe mais). Índice e estado em `docs/00-README.md`. Antes de decidir *o quê* construir, ler:

| Arquivo em `docs/` | Quando consultar |
|---|---|
| `20-plano-evolucao-aprendizagem.md` | **Ler primeiro para a evolução atual.** Plano completo, precedência, arquitetura, arquivos novos/existentes, fases, testes e critérios; não implementado |
| `08-produto-e-estrategia.md` | Definição do produto, jornada completa, telas do MVP, estratégia de IA (Seção 6), Golden Path da demo (Seção 7) |
| `09-branding.md` | Design system oficial (cores/tipografia/logo) — tokens não-negociáveis |
| `10-prompt-prototipo-app.md` | Especificação tela-a-tela do MVP completo (8 telas) que este protótipo deveria implementar |
| `11-estado-prototipo-handoff-claude-code.md` | **Ler primeiro.** Auditoria linha-a-linha do que existe no código vs. o que foi pedido, com prioridades P0/P1/P2 |
| `14-persona-joao.md` | A persona única (João). Toda feature se testa contra ele — se resolve "estudante genérico", está errado |
| `00-constituicao.md` | Regra central: "IA no centro, não cosmética" — qualquer feature de IA precisa responder o que ela decide/gera, com que dado, e o que acontece se errar |

Não duplicar essas specs neste arquivo. Se uma decisão de produto mudar, o registro vai para `docs/`, não para o CLAUDE.md.

**Histórico que evita confusão:** em 23/07/2026 o projeto pivotou para outro produto (o "Abroad" — plataforma de counselor para estudar no exterior). **O código nunca foi convertido** — este repo sempre foi o Flash Test. O pivô foi revertido em 20/09/2026 e toda a documentação daquela fase está preservada em `docs/_arquivo-abroad/`. Se encontrar uma referência a Abroad, Liz ou counselor, ela é histórica.

## O produto em uma frase

App mobile-first de preparação para ENEM em **aulas de 60 segundos** (1–2 questões por vez) com uma IA que aprende a lacuna de cada aluno e decide a próxima questão. Diferencial: **constância e personalização**, não conteúdo (o app grátis do governo, MEC Enem, já cobre conteúdo + correção de redação). Ver `08-produto-e-estrategia.md` Seção 0 antes de propor qualquer feature que compita em "mais conteúdo".

## Stack real

- **Framework:** TanStack Start (React 19) + TanStack Router com rotas *file-based* — cada arquivo em `src/routes/` é uma rota. `src/routeTree.gen.ts` é **autogerado, nunca editar à mão**.
- **Build/pacotes:** Vite 8, gerenciador é **bun** (`bun.lock`, `bunfig.toml`). Rodar `bun install && bun run dev` — não usar npm/yarn (gera lockfile paralelo/conflitante).
- **Estilo:** Tailwind CSS v4 (`@tailwindcss/vite`), tokens em `src/styles.css` (`@theme inline`), shadcn/ui completo em `src/components/ui/` — usar os componentes prontos em vez de construir do zero.
- **Estado:** tudo em `src/lib/store.ts` (`useSyncExternalStore` + `localStorage`, chave `foca.state.v3` — a v1 ficou incompatível ao migrar para o quiz unificado e a aula de 60s; a v2 era a chave `flashtest.state.v2`, lida uma única vez como fallback no rebranding para Foca, docs/17 Fase 8). **Não criar um segundo mecanismo de estado paralelo** — qualquer feature nova (balão global, questões de redação, ranking) estende esse store.
- **Dados mockados:** `src/data/*.ts` (arrays TypeScript tipados) — `questions.ts`, `subjects.ts`, `universities.ts`. Seguir o mesmo padrão para conteúdo novo (ex.: questões de redação).
- **Persistência/backend:** nenhum banco. `login()`/`logout()` só ligam uma flag local — é intencional (cadastro é mock no MVP), não um TODO. A única chamada de rede real é a da IA (abaixo).
- **Segredos:** `.env` na raiz, gitignorado. Copiar de `.env.example`. Nunca commitar chave, nunca expor via `VITE_*` (isso a colocaria no bundle do client).
- **IA:** OpenAI (`gpt-5.4-mini`) via `fetch` direto, sem SDK — o build tem como alvo o runtime de worker, onde uma dependência pensada para Node é risco desnecessário. A separação é intencional: **`src/lib/tutor-core.ts` tem a lógica** (não importa nada do TanStack, então é testável fora do transporte) e **`src/lib/tutor.ts` é só a server function**. A chave vive em `.env` (`OPENAI_API_KEY`, gitignorado) e é lida **só no servidor** — nunca chega ao client, e não deve ser prefixada com `VITE_`. Sem chave, ou em erro/timeout (12s), `generateTutorReply()` cai no `localFallback()` de `tutor-prompt.ts` em vez de quebrar. Prompt estruturado em PACE (`07`), montado em `buildSystemPrompt()` — que inclui uma regra dura **anti-LaTeX**, porque o balão renderiza texto puro e o modelo por padrão devolve `\(x_v\)`.

## Git / Lovable

Repo conectado ao [Lovable](https://lovable.dev) (ver `AGENTS.md`). **Nunca reescrever histórico já publicado** — sem force-push, sem rebase/amend/squash de commits enviados — isso quebra a sincronia do editor Lovable. Push simples é seguro.

## Design system — aplicar com fidelidade

Fonte completa: `docs/brand/foca-rabisco-branding.md` (direção de marca) + `docs/18-plano-reestilizacao-rabisco.md` (design system completo, componente a componente). `docs/09-branding.md` é **histórico** — documentava a paleta Ártica, substituída em 20/09/2026. Tokens centrais:

- Paleta **Rabisco na Margem** (`docs/18` §6.1), tokens em `src/styles.css`: Abismo `#3A3A3C` (grafite — texto forte, contorno, **nunca fundo grande**) · Mar `#2E6BFF` (caneta — **único** accent: ação/seleção/progresso/foco) · Recompensa `#D9A017` (marca-texto — **só** XP/streak/marco, fundo com texto Abismo, nunca texto amarelo) · Gelo/Neve/Pelo/Névoa/Cards (neutros de papel) · Sucesso `#2E9E5B` / Erro `#C23B3B` (**só** feedback de resposta certa/errada). **Dark mode existe** (`.dark` em `src/styles.css`) — qualquer token de marca novo precisa ir em `:root`/`.dark` como variável base (`--abismo`, `--mar`…) referenciada por `--color-*` em `@theme inline`, nunca como hex literal direto no `@theme inline` (Tailwind v4 grava o valor literal nesse caso e a classe gerada — `bg-x`, `text-x` — ignora `.dark`; só variáveis CSS soltas usadas via `var()` em `@utility` escritas à mão propagam sozinhas).
- Títulos: Space Grotesk (bold) · Corpo: Plus Jakarta Sans · Dados/números (XP, streak, cronômetro): Space Mono (bold, `font-mono`).
- Geometria: raio único por papel — marcador 6px, botão/input 16px (`--radius`), card 20px (`--radius-card`), folha de baixo 28px, chip/pílula 999px. Elevação por **aresta** (`box-shadow: 0 3-4px 0 <cor escura>`, desce ao `:active`), não por sombra difusa — ver `btn-primary`/`card-press` em `styles.css`.
- Logo e mascote: a **cabeça da Foca**, sempre via `<FocaMark />` (`src/components/brand/FocaMark.tsx`), nunca esticada nem rotacionada. Aceita `expression` (8 estados, `docs/15` §5) — arte final ainda pendente, cai em fallback neutro (`docs/18` D5). Originais em `src/assets/branding/foca/`, derivados em `public/branding/foca/` (gerados por `scripts/gerar-logos-foca.ps1`). Onde a Foca aparece e onde não aparece: `docs/15` §4. Falas do personagem vêm de `src/lib/voz.ts` (`fala(slot)`), nunca hardcoded numa tela.

## Estado do protótipo vs. spec — não assumir que está pronto

O código diverge do que `08`/`10` pediram em vários pontos estruturais (auditoria completa em `11-estado-prototipo-handoff-claude-code.md`, feita 22/07/2026 — reconferir se muito tempo tiver passado). Os pontos que mais importam para quem for programar:

**Fechado na Development 1 (22/07):** quiz unificado em `/quiz` (substitui signup+onboarding, sem e-mail/senha, com 3 questões de conteúdo real), tela de aha em `/aha` (3 lacunas + XP + streak dia 1), unidade "aula de 60s" com 2 questões fixas em `study.tsx`, tokens oficiais em `styles.css`. `/signup` e `/onboarding` viraram redirects para `/quiz`.

**Fechado na Development 2 (22/07):** balão do tutor global e persistente (`TutorBubble`, montado no `AppShell` — vale para toda tela pós-quiz), IA real, foto de questão multimodal, e o gatilho automático de errar uma questão (o balão abre sozinho explicando). O chat de tela cheia que existia em `/study` foi absorvido pelo balão. O provedor migrou de Claude para OpenAI em 22/07 (ver Stack acima e o registro de decisões do `12`).

**Fechado na Development 3 (22/07):**

- **Micro-treino de redação** em `/redacao` (mapa das trilhas) e `/redacao/$licaoId` (player). O app de redação era Next.js + Supabase — stack incompatível para integrar direto —, então o que foi trazido é o **motor de lições e o conteúdo**, reconstruídos nativamente aqui: `src/lib/lessons/` (motor), `src/content/trilhas/` (15 trilhas, 134 lições, 1.204 exercícios), `src/components/lessons/` (player + 7 tipos de exercício no design system). Os mascotes do app de origem foram removidos — quem explica é a Foca.
- **Ranking/turma** mockado em `/ranking` (`src/data/ranking.ts`). O XP do aluno é real; a turma é fictícia, e a tela diz isso.
- **Progresso virou mapa de lacunas** (`/progress`): domínio por matéria com faixas, "ataque primeiro" e o pilar de redação no mesmo painel.
- **Banco de questões: 20 → 59**, cobrindo as 11 matérias, com gabarito distribuído entre A–E.
- **Nav (histórico — substituída pela Jornada V2, ver abaixo):** os dois pilares (`/study` e `/redacao`) estavam na bottom nav; plano, flashcards e ranking eram alcançados pelo dashboard.

**Nav e home atuais (Jornada de Aprendizado V2, docs/25/26, 22/09/2026):** a home é `/trilha` (`FEATURES.trilhaComoHome = true` em `src/lib/features.ts`), e a bottom nav (`src/components/AppShell.tsx`, `NAV_ITEMS_V2`) tem 4 itens: Aprender (`/trilha`), Praticar (`/study`), Progresso (`/progress`), Perfil (`/profile`). `dashboard.tsx` continua no código, intacto, só como caminho de rollback: com a flag desligada ele volta a ser a home real e a nav volta a `NAV_ITEMS_V1` (5 itens, incluindo `/redacao` e `Início`) — desligar a flag não apaga dado nenhum (schema v5 é aditivo). Fora do fluxo de nav, `/redacao` continua existindo e sendo alcançável (as 134 lições de redação entraram na trilha como capítulos legados, `docs/26` §2).

**Ainda aberto:**

- **Lacunas ainda são heurística local** (`src/lib/gaps.ts`), não refinadas por IA.

Antes de "consertar" qualquer um desses pontos, checar `11` Seção 5 (prioridades P0/P1/P2) e Seção 7 (perguntas em aberto — ex. qual provedor de IA usar, se mantém "sessão" ou migra pra "aula de 60s") — algumas dessas são decisões do time, não bugs.

## O que já está sólido (reaproveitar, não reconstruir)

Design system centralizado em `styles.css` (fácil de corrigir tokens num só lugar) · quiz de entrada com 27 estados + busca de instituições · flashcards com repetição espaçada real (`nextReview`) · progresso por matéria/tópico com barras · player de vídeo real do YouTube por tópico · `AppShell` com bottom nav + `PhoneFrame` mobile-first.

## Regras de escopo (não construir agora)

Sem autenticação real, sem pagamento, sem perfil/conquistas separado, sem versão web, sem biblioteca de conteúdo extensa além do necessário para o Golden Path da demo. Ranking e plano de estudos podem ser mock — não precisam de lógica real por trás.
