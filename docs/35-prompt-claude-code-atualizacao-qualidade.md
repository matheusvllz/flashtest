# Prompt para o Claude Code — atualização de qualidade do Foca

> Artefato de handoff preparado pelo Codex em 28/09/2026, após investigação do checkout no commit `76a7b70`. Este documento é **um prompt de planejamento**, não uma spec aprovada nem uma autorização de implementação. Entregue ao Claude Code o conteúdo completo abaixo. Os achados são uma linha de base a reconferir, pois o repositório pode evoluir.

---

Você está trabalhando dentro do repositório do **Foca**, aplicativo de preparação para ENEM e vestibulares brasileiros. Sua tarefa nesta sessão é investigar o projeto e entregar **um plano técnico completo de implementação**, que será executado posteriormente por Sonnet. Não implemente a atualização agora.

O fluxo é: **Codex investigou e preparou este prompt → Claude Code investiga, decide e escreve o plano → Sonnet executa o plano após autorização, em outra etapa.**

Seu plano deve ser autossuficiente: um novo executor precisa conseguir trabalhar sem esta conversa, sem adivinhar contratos e sem refazer decisões de arquitetura, UX ou pedagogia que você já pode resolver. Não basta produzir um roadmap ou uma lista de intenções. Use arquivos reais, símbolos reais, dependências, comportamento observável, contratos de dados, testes e critérios de conclusão.

## 1. Objetivo de produto e limites desta sessão

Planeje uma atualização que melhore conjuntamente:

1. qualidade pedagógica e confiabilidade do banco de questões;
2. progressão, dificuldade, ensino e explicações das lições;
3. nivelamento, diagnóstico visual e consequência real na trilha;
4. adaptação conservadora, Mastery, Confidence, revisão e checkpoints;
5. desbloqueio, persistência, retomada e consistência de progresso;
6. Home/trilha, clareza do próximo passo e continuidade da jornada;
7. correção dos quatro bugs relatados e de outras falhas relevantes comprovadas;
8. consolidação do Design System e dos assets oficiais da marca;
9. dark mode, desktop, mobile e acessibilidade;
10. descoberta e abrangência dos cursos;
11. performance, compatibilidade, testes e prevenção de regressões;
12. documentação SDD coerente com o comportamento efetivamente entregue.

Prioridade: **UX excelente + aprendizagem real + confiabilidade do sistema**. A referência ao Duolingo diz respeito à clareza, continuidade e motivação, não a copiar sua identidade nem a infantilizar conteúdo de vestibular. A gamificação apoia o estudo. O usuário deve progredir porque aprendeu, não porque reconheceu a alternativa mais comprida.

Nesta sessão:

- Pode ler código/documentação, executar verificações existentes e fazer experimentos locais descartáveis com dados sintéticos para reproduzir problemas.
- Não alterar código, conteúdo publicado, assets, dependências, configuração de produção, flags padrão ou dados reais do usuário.
- Não executar geração de conteúdo paga, publicação, migrations em dados reais, deploy, commit, push, merge ou instalação de skills.
- Não corrigir um bug durante a investigação, mesmo quando a correção parecer pequena.
- A única entrega durável deve ser o plano, em `docs/NN-plano-qualidade-pedagogica-ux-confiabilidade.md`, escolhendo o próximo número livre. Esse é um **caminho proposto**, não um arquivo já existente. Não sobrescrever o presente prompt nem qualquer documento anterior.
- Identificar no próprio plano as mudanças futuras de specs, índices e registros. Não marcar esse plano como aprovado ou implementado por conta própria.
- Se uma ferramenta de planejamento sugerir iniciar execução, ignore essa transição nesta sessão. O usuário já escolheu o fluxo: plano agora, Sonnet depois.

## 2. Autoridade, documentação e conflitos

Leia `AGENTS.md`, `CLAUDE.md`, `docs/00-README.md`, `docs/ai/SDD-WORKFLOW.md`, `docs/ai/SKILL-ROUTING.md`, `docs/ai/SKILLS.md` e `docs/ai/SPEC-TEMPLATE.md` antes de decidir a solução.

Respeite a hierarquia do SDD: pedido explícito atual → specs aprovadas com seus registros → decisões/convenções técnicas → contexto de produto/design → trechos históricos do `CLAUDE.md` → skills. **Código descreve o que acontece; spec vigente descreve o que deveria acontecer.** Não transforme um bug em requisito apenas porque está implementado, nem trate intenção antiga como implementação atual.

O repositório é conectado ao Lovable. Nunca reescrever histórico publicado. Não criar worktree/branch/PR automaticamente por convenção de uma skill. Não editar `src/routeTree.gen.ts` à mão. Não criar segundo store, outra identidade visual ou uma stack nova.

### 2.1 Leitura obrigatória por domínio

Leia os registros primeiro e depois as seções normativas correspondentes. Arquivos grandes podem ser lidos por seção; mantenha uma lista do que foi consultado. Não considerar a leitura do índice equivalente à leitura dos contratos.

| Domínio | Fontes reais a consultar |
|---|---|
| Adaptação vigente | `docs/32-registro-execucao-aprendizagem-adaptativa.md`, especialmente Fases 11–15, achados de 28/09 e G1–G16; `docs/30-plano-aprendizagem-adaptativa.md`, especialmente §§7–19, 21–28 e glossário; `docs/31-plano-execucao-aprendizagem-adaptativa.md`, contratos, dependências e critérios das fases afetadas |
| Jornada por passos e legado | `docs/26-registro-execucao-jornada-v2.md` → `docs/25-plano-jornada-aprendizado-v2.md`, especialmente §§6–12, 15–16, 20–22 |
| Home visual | `docs/29-registro-execucao-home-trilha.md` → `docs/27-plano-home-trilha-visual.md` + `docs/28-plano-execucao-home-trilha.md`, contratos de apresentação, foco, acessibilidade e rollback |
| Feedback, evidência e progressão | `docs/22-validacao-piloto-aprendizagem.md` → `docs/20-plano-evolucao-aprendizagem.md`, especialmente §§5, 7–15 e critérios de aceitação |
| Design e marca | `docs/19-registro-execucao-rabisco.md` → `docs/18-plano-reestilizacao-rabisco.md`; `docs/brand/foca-rabisco-branding.md`, `docs/brand/foca-rabisco-tokens.css`, `docs/DESIGN.md`; `docs/17-plano-migracao-visual-foca.md` e `docs/09-branding.md` para proveniência/migração dos logos, respeitando sua precedência histórica |
| Produto, persona e copy | `docs/PRODUCT.md`, `docs/08-produto-e-estrategia.md`, `docs/14-persona-joao.md`, `docs/00-constituicao.md`, `docs/15-mascote-e-voz.md`, `docs/16-gamificacao-e-dopamina.md`, `docs/21-brand-voice-e-inventario-copy.md` |
| Questões e fontes | `docs/33-taxonomia-habilidades.md`, `docs/34-decisao-questoes-oficiais.md`, `content-pipeline/README.md`, prompts/schemas/relatórios relevantes em `content-pipeline/`, READMEs de `src/content/banco/` e `src/content/oficial/` |
| Decisões anteriores | Se necessário para resolver conflito: `docs/10-prompt-prototipo-app.md`, `docs/11-estado-prototipo-handoff-claude-code.md`, `docs/12-plano-development.md`; não confundir essas auditorias históricas com o checkout atual |
| Som/celebração | `docs/24-integracao-identidade-sonora.md`, referências pertinentes de `docs/23-identidade-sonora-linguagem-musical.md` e pendências da Fase 1 em `docs/32` |

`docs/_arquivo-abroad/` é histórico de outro produto; não ressuscitar Abroad/counselor. `docs/33` é autogerado; atualizá-lo futuramente pelo gerador, não manualmente.

### 2.2 Conflitos já encontrados, que você deve registrar e resolver explicitamente

- `CLAUDE.md` contém simultaneamente informações vigentes e históricas: schema v5 versus v6, 1–2 questões versus lições v2 de 4–8 questões, banco pequeno versus pacotes publicados, tutor automático histórico versus tutor somente manual. O topo aponta para `docs/32`, que precisa ser lido até as entradas mais recentes.
- O `docs/32` preserva seções de 24/09 dizendo que não há pool diagnóstico e que flags estão desligadas; a Onda 1 e o rollout de 27/09 substituíram esse estado. Comentários em `placement-pool.ts`, testes e READMEs também ficaram para trás.
- `docs/00-README.md`, `docs/PRODUCT.md` e `content-pipeline/README.md` contêm trechos históricos contraditórios com o estado atual. Não repetir “não há conteúdo/pool” sem medir.
- O `docs/30` substitui a Home de uma matéria por vez por jornada misturada quando `jornadaAdaptativa` está ligada. O mapa por matéria continua como vista secundária e rollback; não eliminá-lo nem inventar trilhas paralelas.
- O DS vigente é **Rabisco na Margem** (`18`/`19`/`styles.css`), não a paleta Ártica do `09` nem o HTML histórico “Flash Test - design System”.
- Desktop está limitado por escolha histórica a `PhoneFrame` de 440px. O pedido atual autoriza **planejar uma experiência desktop melhor**; registrar a precedência específica sobre a limitação antiga, preservando identidade, conteúdo e lógica. “Sem versão web” histórico não significa que este app não rode em navegador.
- O pedido de flexibilidade pedagógica precisa ser conciliado com validadores atuais que impõem regras concretas de quantidade e progressão. Não propor exceções só na UI, deixando os validadores contraditórios.
- `revisada-humano` não prova que cada item foi revisado por uma pessoa: o `docs/32`, Onda 1, registra autorização do usuário para delegar revisão/promoção à IA e revisão 7b por Sonnet. Preserve essa autorização operacional; registre honestamente a modalidade de revisão, sem inventar avaliação pedagógica externa nem pedir novamente aprovação já concedida.
- O `docs/34` registra autorização de negócio para texto de ENEM e limites de fonte. Não há parecer jurídico formal. Nem apagar a decisão existente nem ampliá-la silenciosamente para outras bancas/imagens.

Produza uma tabela: **conflito → fontes/seções e datas → evidência no código → decisão proposta → documentos a atualizar → impacto no executor**. Recência sozinha não resolve autoridade. Uma correção declarada em registro precisa ser comprovada nos ramos pertinentes.

## 3. Skills: descobrir de verdade e usar com critério

Inventarie `.claude/settings.json`, `.claude/skills-registry.json`, `.claude/skills/`, `skills-lock.json`, catálogo e caches disponíveis na máquina. Diferencie skill catalogada, instalada, habilitada e realmente carregada. Não presuma que o ambiente tenha tudo que a máquina anterior tinha.

Foram encontrados no checkout e/ou no catálogo:

- `foca-sdd`, em `.claude/skills/foca-sdd/SKILL.md`;
- `web-design-guidelines`, em `.claude/skills/web-design-guidelines/SKILL.md`;
- `vercel-react-best-practices`, em `.claude/skills/vercel-react-best-practices/SKILL.md`;
- Superpowers, incluindo `systematic-debugging`, `writing-plans` e `verification-before-completion`;
- Addy Agent Skills, incluindo planejamento, testes, revisão e documentação;
- Impeccable, Frontend Design, Humanizer, UI UX Pro Max;
- referências TanStack Start/Router e Tailwind v4/shadcn;
- skills de motion, segurança e marketing no catálogo, com GSAP e marketing desativados por padrão.

Na investigação do Codex, os arquivos de Superpowers 6.4.1 estavam em `~/.claude/plugins/cache/superpowers-marketplace/superpowers/6.4.1/skills/`. Reconferir, não hardcodar caminho de usuário no plano.

Leia as instruções das skills relevantes antes de usá-las. Sugestão de roteamento, sujeita à disponibilidade real:

| Skill | Onde ajuda | Limite |
|---|---|---|
| `foca-sdd` | precedência, specs e formato de handoff | ler primeiro |
| `superpowers:systematic-debugging` | bugs de progressão, placement e overlays | investigar/reproduzir agora; fase de correção fica no plano |
| `superpowers:writing-plans` **ou** `agent-skills:planning-and-task-breakdown` | contratos e tarefas executáveis | escolher uma; formato/arquivo do Foca prevalecem |
| `impeccable` | crítica da UI existente, diagnóstico e desktop | não redesenhar identidade nem editar telas nesta sessão |
| `web-design-guidelines` | semântica, teclado, foco, acessibilidade | seguir instrução de buscar regras atuais ao realizar a revisão; não declarar revisão formal sem fazê-la |
| `vercel-react-best-practices` | fronteiras de bundle e renderizações comprovadamente relevantes | aplicar regras pertinentes a React/TanStack; não importar soluções exclusivas de Next/RSC |
| `tailwind-v4-shadcn` | tokens, CSS compilado, portais e dark mode | referência pontual, sem mudar stack |
| `humanizer:humanizer` | copy visível ao aluno | voz do `20`/`21`; nunca alterar gabarito, matemática, enunciado factual ou tornar spec ambígua |

Carregue 1–3 primárias por etapa e uma revisão pertinente, sem despejar todas no contexto. Não instalar dependências, habilitar pacotes ou iniciar execução automaticamente. OmniRoute é ferramenta externa, não runtime do produto nem substituto do tutor. O plano deve conter **Skill → tarefa/fase → motivo → disponibilidade verificada** e alternativa quando algo não estiver disponível.

## 4. Linha de base técnica já investigada

Reconferir esses fatos no checkout; os caminhos abaixo existem na linha de base. Não procurar Supabase, Prisma, Redux ou Next.js como se fossem pressupostos do Foca.

### 4.1 Stack e persistência

- TanStack Start + React 19 + TanStack Router com rotas por arquivos; Vite 8; Bun; Tailwind CSS v4 e shadcn/Radix. Scripts reais em `package.json`; configuração em `vite.config.ts`, `playwright.config.ts`, `tsconfig.json`, `eslint.config.js`.
- Estado central em `src/lib/store.ts`, via `useSyncExternalStore`, `structuredClone` e `localStorage`. Chave atual **`foca.state.v3`**, com **`schemaVersion: 6`**; chave legada `flashtest.state.v2`. Nome da chave e versão do schema são conceitos distintos.
- Migrações em `src/lib/state-migrations.ts`. Não há banco remoto, ORM, migrations SQL nem autenticação real. `login`/`logout` são simulação local. Logout preserva dados no dispositivo; não confundir com sincronização por conta.
- React Query é criado em `src/router.tsx`, mas não é o mecanismo de progresso. Verificar usos reais de `useQuery`/`useMutation` antes de propor invalidation de QueryClient para estes bugs.
- O tutor usa `src/lib/tutor.ts` (`askTutor`, server function) e `tutor-core.ts`/`tutor-prompt.ts`/`tutor-context.ts`. Segredo somente no servidor. Fluxos de estudo e correção precisam funcionar sem IA.
- Existem outras requisições reais: pacotes de conteúdo em `src/lib/content/repository.ts` e assets de áudio. A frase antiga “só a IA usa rede” não descreve mais o projeto.
- `sessionStorage` também aparece em `src/lib/voz.ts` e `src/routes/redacao.index.tsx`; diferenciar memória de apresentação de fonte de progresso.
- As nove flags adaptativas estão ligadas/`on` em `src/lib/features.ts`. Existe override `foca.flags`, só em dev ou `?debug=1`. Flags não podem apagar progresso.

### 4.2 Mapa funcional a completar com símbolos e relações

| Parte do fluxo | Arquivos reais de entrada e domínio |
|---|---|
| Boot, tema, navegação | `src/routes/index.tsx`, `src/routes/__root.tsx`, `src/router.tsx`, `src/components/AppShell.tsx`, `src/lib/features.ts` |
| Entrada e conta local | `src/routes/welcome.tsx`, `login.tsx`, `signup.tsx`, `onboarding.tsx`, `quiz.tsx`, `aha.tsx`; `src/lib/store.ts`, `src/lib/gaps.ts` |
| Perfil declarado | `src/routes/quiz.tsx`; `src/components/onboarding/ExamStep.tsx`, `TimeStep.tsx`, `FocusStep.tsx`, `PlacementOffer.tsx`; `src/data/courses.ts`, `universities.ts`, `subjects.ts`, `exams.ts` |
| Nivelamento | `src/routes/nivelamento.tsx`; `src/lib/adaptive/placement.ts`, `placement-pool.ts`, `constants.ts`; ações `beginPlacement`, `submitPlacementResponse`, `finishPlacement`, `setPlacementState`, `invalidateJourneyPlan` no store |
| Modelo pedagógico | `src/lib/adaptive/model.ts`, `confidence.ts`, `display.ts`, `bootstrap.ts`, `classify.ts`; `src/lib/learning/review.ts`, `attempt-builder.ts`, `types.ts` |
| Planejamento | `src/lib/adaptive/index.ts`, `planner.ts`, `scoring.ts`, `candidates.ts`, `journey.ts`, `select-items.ts`, `checkpoint.ts`, `fallback.ts`, `trace.ts` |
| Home/jornada | `src/routes/trilha.tsx`; `src/components/learning/journey/SessionCard.tsx`, `JourneyPath.tsx`, `FocusLine.tsx`, `FocusSheet.tsx`; `src/components/learning/path/PathNode.tsx` |
| Mapa curricular | `src/content/curriculum-tree.ts`; `src/lib/learning/trail.ts`, `path-layout.ts`, `recommend.ts`, `selectors.ts`; `src/components/learning/LearningPath.tsx` e `path/`; `src/hooks/usePathFocusScroll.ts` |
| Lições por passos | `src/routes/learn.$lessonId.tsx`; `src/components/learning/MicroLessonPlayer.tsx`, `steps/QuestionStepView.tsx` e demais views; `src/hooks/useLearningSession.ts`; `src/lib/learning/steps.ts`, `session-logic.ts` |
| Atividades dinâmicas | `src/routes/atividade.$activityId.tsx`; `src/lib/adaptive/activity-lesson.ts`; `selectItemsForActivity`, `setActiveActivity`, `completeJourneyActivity` |
| Redação legada | `src/routes/redacao.index.tsx`, `redacao.$licaoId.tsx`; `src/components/lessons/LessonPlayer.tsx`; `src/lib/lessons/registry.ts`, `define.ts`, `types.ts`; `src/content/trilhas/` |
| Prática curta | `src/routes/study.tsx`; `src/hooks/useExerciseSession.ts`; `src/data/questions.ts`; adaptadores em `src/lib/learning/adapters.ts` |
| Feedback e conclusão | `src/components/lessons/FeedbackSheet.tsx`; `src/components/ds/BottomSheet.tsx`; `src/components/learning/ChapterCompleteSheet.tsx`; `src/lib/feedback/` |
| Progresso e sessão | `src/routes/progress.tsx`, `profile.tsx`; `src/components/progress/SkillRow.tsx`; ações do store e migrações |
| Catálogo | `src/content/items/index.ts`, `types.ts`, `irt.ts`, `meta/`; `src/content/taxonomy/`; `src/content/exercise-ids.ts`; `src/content/microlicoes/`; `src/content/banco/` |
| Conteúdo sob demanda | `src/lib/content/repository.ts`, `preload.ts`; `scripts/content/build-packs.ts`; índices gerados `src/content/banco/aulas-geradas.ts` e `itens-gerados.ts`; saída ignorada pelo Git `public/content/v1/` |
| Pipeline editorial | `scripts/content/validate.ts`, `verify.ts`, `publish.ts`, `run-stage.ts`, `humanize-guard.ts`, `pipeline-types.ts`, `aulas.ts`, `coverage.ts`, `promover-diagnostico.ts`, importadores oficiais; `content-pipeline/prompts/`, `schemas/`, `relatorios/` |
| Identidade | `src/styles.css`, `src/lib/brand.ts`, `src/lib/copy.ts`, `src/lib/voz.ts`, `src/components/brand/FocaMark.tsx`, `scripts/gerar-logos-foca.ps1`, assets originais e derivados |

Mapeie o fluxo completo:

`boot/hidratação → entrada local → perfil → oferta opcional → nivelamento ou /aha → diagnóstico → aplicar modelo → invalidar/recompor jornada → iniciar atividade → carregar pacote/escolher itens → responder → feedback → concluir → persistir → XP/streak/agenda/evidência → sincronizar jornada → Home → próxima atividade`.

Para cada transição, informe chamador, função, entradas, mutação, momento de persistência, evento, cache envolvido, navegação, fallback e teste existente. Não confundir:

- `learning.completedLessons` de microlições;
- `progress.lessons` de redação legada;
- `learning.journey.history`/`committed`/`upcoming`/`activeActivity` de atividades;
- `learning.activeSession` do player;
- ledger de recompensa, evidência por habilidade, agenda e placar de XP.

Conclusão, recompensa, evidência, revisão e desbloqueio têm responsabilidades diferentes. Streak avançar não prova que a fila avançou.

## 5. Quatro bugs relatados: auditoria obrigatória

Para cada bug entregue: status, gravidade e impacto, reprodução com precondições, causa raiz ou hipótese explícita, arquivos/símbolos, estados antes/depois, cobertura existente, correção planejada e testes de regressão. Categorias: **confirmado**, **provável**, **dúvida técnica**, **melhoria**, **comportamento intencional**, **corrigido anteriormente e reconfirmado**. Não chamar toda preferência visual de bug.

### B1 — Explicação transparente

Relato: alternativas continuam visíveis atrás do feedback, prejudicando leitura.

O `docs/32`, F15.3 de 28/09, registra a causa: aliases `--color-success`/`--color-error` de `@theme inline` não disponíveis como custom properties no CSS compilado tornavam o `color-mix` inválido. O código atual de **`src/components/lessons/FeedbackSheet.tsx`** usa variáveis base `--success`/`--error`/`--cards`.

Reconferir CSS computado e aparência em acerto, erro e “Não sei”; expansão da explicação; `/study`, microlições e legado; sete formatos; temas claro/escuro; mobile/desktop. Verificar sticky, scroll, z-index, ancestrais, opacidade e superfícies. Incluir build de produção quando a geração do CSS for relevante. Uma assertiva sobre opacidade das alternativas não prova opacidade da folha.

Não aplicar branco arbitrário nem “opacity: 1” sem rastrear o valor computado. Preservar superfície do DS e snapshot imutável de feedback.

### B2 — Conclui, ganha streak e a próxima lição continua inacessível

O registro de 28/09 descreve duas correções existentes: marcar `activeActivity` nos links da Home e chamar `syncJourneyWithCompletions` na montagem de `/trilha`. Reconferir **todos os tipos de atividade**, pois o mesmo ajuste introduz uma interação relevante com atividades dinâmicas, confirmada na investigação abaixo.

Rastrear `SessionCard` e `JourneyPath` → `PathNode` → `navigationTargetFor` → rota correta → seleção de itens/retomada → `completeMicroLesson`/`completeLesson`/`completeJourneyActivity` → `syncJourneyWithCompletions` → `ensurePlan` → `commitPlan`.

Investigar especialmente IDs, campos de conclusão, gravação em storage, montagem da Home, estado capturado por efeitos, clique duplo, reload, logout/login local, abas, reforço de conteúdo já concluído, links diretos, pool curto e conteúdo removido. Separar próximo nó do mapa de próxima atividade da jornada adaptativa.

### B3 — Nivelamento não muda a trilha

O registro de 28/09 diz que `invalidateJourneyPlan()` passou a esvaziar `committed`/`upcoming`. A chamada existe, mas **não cobre todo caminho de término**. Não assumir que a presença da função resolve o requisito.

Verificar encerramento por última resposta, teto por área, orçamento total, precisão, pool insuficiente, abandono/retomada e refazer. O diagnóstico precisa ser persistido, aplicado ao modelo e consumido pelo planner; UI bonita sozinha não satisfaz o pedido.

Além de invalidar a fila, comparar perfis controlados com evidências distintas e mesmo foco/seed/data. Uma fila recalculada pode legitimamente manter alguns itens; exigir influência causal observável em candidatos, ordem, tipo, dificuldade ou motivo quando os perfis justificarem, sem exigir embaralhamento cosmético em toda execução.

### B4 — Véu esbranquiçado na conclusão em dark mode

O registro de 28/09 aponta `src/components/ds/BottomSheet.tsx`: `bg-abismo/40` usava token de texto que fica quase branco no escuro; o código agora usa `bg-black/40`.

Reconferir capítulo/seção, overlays de saída, foco, diálogos, drawers, toast, portais e celebrações em temas/mobile/desktop. Preto no scrim tem justificativa funcional; não substituí-lo mecanicamente por um token de texto que inverte com tema. Se consolidar token semântico de scrim, definir ambos os temas e alcance da mudança. Verificar que fechar restaura foco/scroll e não deixa camada invisível interceptando interação.

## 6. Evidências novas do Codex — reproduzir antes de fechar o plano

### C1 — Finalização normal do CAT deixa a jornada antiga: confirmado em navegador

No checkout `76a7b70`, foi executado Chromium headless a 390×844 com storage sintético isolado, tema escuro, perfil já onboarded e flags padrão. Fluxo:

1. Abrir `/trilha` para materializar uma fila de três atividades.
2. Guardar os IDs de `learning.journey.committed`.
3. Navegar a `/nivelamento` com pacotes reais disponíveis.
4. Responder a primeira alternativa de cada questão, clicar Verificar e Continuar até o resultado.
5. Ler o storage no resultado e depois de “Ir para a trilha”.

Resultado: **24 respostas; `placement.status = "concluido"`; as mesmas três atividades antes, no resultado e após retornar à Home; 24 entradas com `source: "evidencia"` e nenhuma entrada `prior-nivelamento`**. Não houve alteração do código para o experimento.

Causa rastreada:

- `submitPlacementResponse` no store marca `status: "concluido"` quando `placementConcluido` é verdadeiro.
- A rota deriva `emAndamento` desse status.
- Seu efeito retorna em `if (!emAndamento || !escolha) return`.
- `applyPlacement` + `finishPlacement` + `invalidateJourneyPlan` só estão no ramo em que o seletor fica sem próximo item durante um placement ainda em andamento.
- Portanto, o término normal pela resposta final pode pular a aplicação de priors e a invalidação. As entradas de habilidade vistas no teste vêm de `submitPlacementResponse`, não provam que `applyPlacement` rodou.

O E2E atual `tests/e2e/placement.spec.ts` verifica status e `skillModel` não vazio; isso permite passar mesmo com esse bug. Seu plano deve fechar um contrato único, idempotente e recuperável de finalização: proprietário, cálculo, aplicação, indicador/versionamento se necessário, persistência, invalidação e retomada após interrupção. Não prescrever apenas outro efeito sem analisar execução repetida, estado stale e conta antiga com placement concluído mas não aplicado.

### C2 — Iniciar prática pela Home retorna à Home sem questão: confirmado em navegador

Com storage sintético válido, foi montada fila de três atividades `kind: "pratica"`, habilidade `mat:porcentagem-conceito`, `targetP: 0.7`, `planVersion: 1`, sem `itemIds` e `activeActivity: null`, conforme o contrato de escolher itens ao começar.

Ao clicar no CTA real de `SessionCard`, o browser retornou a `/trilha`; não abriu questões. `activeActivity` ficou preenchida **sem `itemIds`**.

Causa rastreada:

- O `onClick` de `SessionCard` chama `setActiveActivity(current)` para qualquer tipo.
- A rota `/atividade/$activityId` encontra a atividade já ativa, usa o ramo de retomada e não chama `selectItemsForActivity`.
- `buildActivityLesson(travada, travada.itemIds ?? [])` recebe zero itens, falha e `AtividadeFalhou` volta à Home.
- O nó atual de `JourneyPath` também marca atividade ativa; reconferir esse ponto de entrada.

O E2E atual de prática em `journey.spec.ts` entra diretamente na URL da atividade. Ele exercita o ramo de seleção e pode passar enquanto o caminho real da Home falha. Planeje teste **pelo CTA e pelo nó**, não apenas `page.goto` no player. Defina claramente “selecionada”, “iniciada” e “pronta para retomar”; escolha um proprietário da seleção de itens e preserve os itens já selecionados em reload.

### C3 — Retomada do CAT pode perder contexto dos itens anteriores: provável, por inspeção

`itemsShownRef` em `nivelamento.tsx` nasce como `new Map()` e recebe itens vistos na montagem atual. `recordPlacementResponse` recalcula EAP a partir de todas as respostas, mas filtra silenciosamente aquelas cujos itens não estão em `itemsById`. `applyPlacement` também depende desse mapa para estimar por matéria.

Verificar pausa/reload após algumas respostas e comparar θ/SE/prior com execução contínua de mesma sequência. Planejar reconstituição pelo catálogo/versionamento, sem recontar respostas nem trocar itens. Também conferir `lastSubjectRef`, scope, ordem apresentada e item congelado entre Verificar/Continuar. Até reproduzir, manter classificação “provável”, não inventar resultado.

### C4 — Divergências de fonte de conclusão: sinais estáticos de risco

- `legacyCandidateForSkill` em `adaptive/candidates.ts` consulta `learning.completedLessons`, enquanto `completeLesson` grava redação em `progress.lessons`; o planner passa `s.learning`. Verificar repetição de primeira lição legada e bloqueio/desbloqueio após uma conclusão real.
- O planner usa `lessonForSkill` para conclusão e pré-requisitos, mas a escolha da aula também possui `lessonIdForSkill` incluindo `AULAS_GERADAS`. Verificar habilidade com aula gerada concluída, sem aula embarcada correspondente. Não contar apenas aulas estáticas quando a recomendação pode servir aulas de pacote.
- `syncJourneyWithCompletions` considera existência de conclusão, sem identificar a tentativa atual. Verificar iniciar reforço de aula anteriormente concluída e voltar sem terminá-lo: não registrar estudo novo por conclusão antiga.
- `completeJourneyActivity` protege XP pelo ledger, mas empilha histórico e incrementa `sinceCheckpoint` em cada chamada. Verificar idempotência de **todos** os efeitos, não apenas XP.
- `ensurePlan` recalcula as três comprometidas ao repor fila curta. Confrontar com estabilidade visual documentada no `30` §11.5 e preservação da atividade em andamento. Distinguir exceções legítimas, como resultado de nivelamento/foco, de reordenação acidental.

### C5 — Persistência e sincronização local

`persist()` retorna `false` em quota/storage bloqueado, mas `setState()` ignora esse retorno. Investigar o que o aluno vê e quais chamadas anunciam sucesso persistido. Não vender estado em memória como dado salvo após refresh.

Não foi encontrado listener de `storage` no store na leitura inicial. Avaliar conflito entre abas e documentar a garantia de consistência escolhida. Não criar backend para contornar um problema local. Planejar limite/poda, recuperação de JSON inválido, versões futuras e backups sem descartar progresso silenciosamente.

### C6 — Pendências já declaradas em `docs/32`

Reavaliar com evidência e incluir no escopo principal quando afetam esta atualização:

- G7: `recalibrar` existe em `adaptive/checkpoint.ts`, mas as referências encontradas são declaração e testes; falta integração de produção para antecipar revisão/ajustar plano.
- G4: mix 70/20/10 pode ser dominado por habilidades NOVA. O registro relata janela com 100% de conteúdo atual. Definir intenção e cenários antes de alterar pesos.
- `run-stage.ts` Modo B tem pendência documentada de `finalAnswer` não propagado para `exercise.correta`. Inspecionar fluxo e planejar correção se ainda existir; não gerar conteúdo no pipeline defeituoso.
- Classificação dos 1.204 exercícios legados foi por habilidade de capítulo/dificuldade padrão 2, não revisão fina item a item. O status herdado não garante adequação diagnóstica.
- Há lacunas de cobertura de aulas/revisões, formalmente registradas na Fase 11. Medir as atuais antes de propor expansão.
- Áudio/háptico físico, checklist F15.3 formal, E2E do tutor com rede bloqueada e revisão formal de acessibilidade têm limitações documentadas. Não alegar que estão resolvidos porque outros testes passaram.

### C7 — Outras hipóteses relevantes a confirmar, sem ampliar arbitrariamente o projeto

Auditar foco mudado fora da Home, expiração de “só hoje” com app aberto, checkpoints repetidos na mesma geração de plano, falha de pacote que retorna à mesma atividade inválida e retry de manifest após falha. `repository.ts` mantém promessa de manifest e cache de pacotes; medir antes de propor deduplicação/invalidade.

Também revisar botões sem ação, feedback duplicado, navegação por histórico, empty states, loading em branco, chamadas redundantes, erro silencioso, semântica dos overlays e hydration. Algumas rotas têm `ssr: false`; não diagnosticar hydration genericamente sem localizar o limite real.

## 7. Auditoria pedagógica e do banco inteiro

### 7.1 Fontes existentes e números da linha de base

Há múltiplas fontes, não um único JSON:

- banco geral em `src/data/questions.ts` (59 questões conforme docs; reconte);
- exercícios de redação em `src/content/trilhas/` (134 lições/1.204 exercícios conforme docs; reconte e considere IDs estáveis);
- microlições e exercícios locais em `src/content/microlicoes/`;
- itens de pacote em `src/content/banco/`, incluindo oficiais;
- metadados laterais/índices em `src/content/items/` e taxonomia;
- parâmetros oficiais em `src/content/oficial/inep-parametros.json`.

Contagem direta do Codex em todos os JSONs de `src/content/banco/`:

| Propriedade | Resultado observado |
|---|---|
| Itens | 755, todos `multipla-escolha` |
| Origem | 737 `ia-validada`; 18 `oficial` |
| Status gravado | 737 `revisada-humano`; 18 `oficial-conferida` |
| Dificuldade 1/2/3/4/5 | 122 / 103 / 316 / 213 / 1 |
| Aulas de pacote | 48, também confirmadas pelo `predev` |
| Heurística de comprimento | 89/755 com correta ≥ 2 vezes o número de caracteres da maior incorreta |

A heurística contou `.Length` das strings de alternativas, sem normalização semântica. Não representa 89 erros pedagógicos confirmados nem taxa de erro do catálogo completo. Não extrapolar aos exercícios fora dos pacotes.

Exemplos reais para começar a inspeção:

- `src/content/banco/bio/bio-membrana-estrutura.json`, `gen:bio:membrana-estrutura:6553a1bf`: correta aproximadamente 4,51× a maior incorreta, explicação estrutural longa contra distratores curtos.
- Mesmo arquivo, `gen:bio:membrana-estrutura:5ae4f57c`: correta aproximadamente 4,27× a maior incorreta; distratores como “A temperatura não afeta a membrana”.
- `src/content/banco/bio/bio-ecologia-relacoes-ecossistema.json`, `gen:bio:ecologia-relacoes-ecossistema:b9bc002a`: correta aproximadamente 4,30×; revisar também precisão/ambiguidade da distinção entre sucessão primária/secundária, não só tamanho.
- `src/content/banco/bio/bio-organelas-funcao.json`, `gen:bio:organelas-funcao:a655cd73`: pergunta no singular e alternativa correta reúne estruturas; avaliar formulação e distratores com rigor editorial.

### 7.2 O que deve ser analisado e planejado

Inventarie por origem, área, matéria, habilidade, dificuldade, papel, formato e status. Diferencie IDs únicos de referências repetidas em aulas e de itens oficiais versus parâmetros numéricos do Inep; 5.526 parâmetros não são 5.526 questões utilizáveis.

Estabeleça uma rubrica verificável para:

- habilidade medida, raciocínio exigido e relação com vestibular;
- gabarito único e inequívoco, solução independente e explicação correta;
- distratores plausíveis baseados em erros conceituais reais;
- paralelismo de forma, nível de detalhe e linguagem das alternativas;
- pistas de tamanho, vocabulário, absolutismos, sintaxe e posição;
- ausência de pistas no ensino imediatamente anterior quando o item pretende medir independência;
- contextualização útil, interpretação, aplicação, comparação e análise;
- gráficos/tabelas/situações-problema quando pertinentes, com formato de conteúdo e acessibilidade existentes ou explicitamente propostos;
- dificuldade justificada pelo raciocínio, e não só quantidade de texto;
- português correto, carga de leitura proporcional, nível etário apropriado;
- metadados, fonte e rastreabilidade editorial.

Conteúdo básico pode ser necessário para remediação. Não apagar fundamentos porque parecem fáceis nem confundir pré-requisito acessível com questão sem valor. Não transformar todas as perguntas em textos enormes para aparentar ENEM.

Use varredura automatizada completa + amostra estratificada de leitura profunda + revisão completa dos itens de maior risco. Defina no plano tamanho mínimo por estrato, ordem, critérios de expansão da amostra, lotes, responsável lógico e saída auditável. Para revisão futura de todo o acervo, especificar como cada ID receberá decisão; não entregar “revisar as questões” como tarefa ilimitada.

Classificações: **manter; corrigir; reclassificar dificuldade/habilidade; melhorar alternativas; melhorar enunciado; revisar explicação; substituir; retirar de circulação**. Uma questão pode ter várias ações. Registrar ID, arquivo, versão anterior/nova, motivo, decisão, revisão executada, impacto em referências e elegibilidade de diagnóstico. Não apagar item referenciado por histórico/sessão/aula sem política de compatibilidade.

### 7.3 Pipeline: estender o que existe

O pipeline offline já possui geração → crítica → solução cega → verificação/escalonamento → humanização com invariantes → validação → revisão/publicação. `scripts/content/validate.ts` já distingue `issues` de `warnings`, verifica alternativas duplicadas, limites de gabarito, prefixos de letra, certas alternativas proibidas, extensão do enunciado/explicação, LaTeX, rascunhos, texto de apoio, URL de imagem e similaridade por 5-gramas.

Planeje mudanças nos validadores, prompts, relatórios e portões existentes. Não criar pipeline paralelo nem chamar as validações atuais de um schema Zod completo só porque Zod está instalado.

Novos sinais devem incluir correta muito maior/menor, dispersão de tamanhos, padrões de posição por lote/área, duplicatas e quase duplicatas, explicação incompatível, distratores fracos e dificuldade incoerente. Separe o que é determinístico do que exige julgamento editorial. Comprimento e similaridade lexical são alertas com falso positivo; não excluir automaticamente questões válidas.

Defina fórmula, limiares iniciais justificados pela distribuição real, exceções registradas, severidade, formato de saída, tratamento de warnings e política de reavaliação. Diferencie erro estrutural bloqueante de suspeita semântica. Inclua exemplos positivos, negativos e falsos positivos nos testes.

Audite `ItemValidation.status`/`reviewer`/`reviewedAt`: separar “revisão humana”, “revisão por IA autorizada” e “gabarito oficial conferido”, preservando proveniência e decisões anteriores. Escolha uma migração/representação honesta; não marcar pessoa revisora sem evidência, nem despublicar cegamente 737 itens por renomeação de enum. Defina elegibilidade do pool diagnóstico à luz da política explícita atual.

Verifique se geração e resolvedor têm independência efetiva. Solução cega pelo mesmo tipo de modelo não equivale a famílias diferentes nem garante ausência de erros correlacionados; registrar limites reais, sem prometer validação científica.

Não gerar novos lotes agora. No plano, prever orçamento e checkpoints editoriais sem presumir aprovação para gasto/API. As autorizações já registradas de decisão editorial não exigem que o usuário refaça manualmente revisões delegadas.

## 8. Dificuldade, composição de lições, TRI, Mastery e Confidence

### 8.1 Não confundir três escalas

- `ItemMeta.difficulty` é editorial, de 1 a 5.
- `QuestionStep.difficulty` é relativa à lição, de 1 a 3; `scripts/content/aulas.ts` contém `dificuldadeNaAula`.
- `irt.a/b/c`, θ e probabilidade-alvo pertencem ao modelo adaptativo e têm proveniência própria.

Audite a relação entre elas. Um roteiro rotulado 1→2→3 não prova que os itens ficaram cognitivamente mais difíceis. Use metadados, solução e contexto de ensino.

Lições v2 já possuem intro/teach/tip/question/recap e regra de 4–8 questões; `/study` mantém `LESSON_SIZE = 2` deliberadamente. Redação legada e atividades sintéticas têm contratos próprios. Não aplicar “tudo deve ter 4–8” indistintamente. Se propor exceções, identificar mudanças necessárias em tipos, `validateLessonSteps`, autoria, seleção, player, métricas e testes.

Uma sequência acessível → média → desafio é útil quando compatível com objetivo e aluno. O CAT deve continuar escolhendo por informação/estimativa/cobertura; **não ordenar um teste adaptativo inteiro de fácil a difícil como se fosse uma aula**.

### 8.2 Modelo existente, a preservar salvo decisão fundamentada

Leia fórmulas e constantes em `docs/30` §§9–12 e implementações correspondentes. O modelo atual é heurístico inspirado em TRI; Mastery deriva de θ por logística. Confidence é derivada da evidência, não um número persistido independente. Quantidade, diversidade, recência, independência e retenção importam.

Regras documentadas que devem ser reconferidas e explicitadas no plano:

- Confidence < 25: “Ainda medindo”, sem mostrar Mastery numérica como se estivesse sustentada.
- Confidence 25–49/50–74/≥75: faixas de evidência distintas.
- “Dominado” exige Mastery ≥80, Confidence ≥75 e consistência.
- Desafio exige limiares de Mastery/Confidence; pré-requisitos têm critérios próprios.
- Checagem dentro da aula pode influenciar Mastery com peso baixo, mas não prova retenção nem deve inflar Confidence.
- Ajuda anterior à resposta reduz independência; “Não sei” é sinal distinto, sem punição visual.
- Evidência de uma habilidade não pode ser fabricada para todas as outras da área.
- Priors de placement para habilidades não medidas têm `nEff = 0`, Confidence 0 e origem explícita.
- Tempo sem estudar pode reduzir confiança; não declarar esquecimento como fato sem evidência de desempenho.
- Alterar fórmula/constantes exige estratégia de `ALGO_VERSION`, replay limitado, dados podados e versões futuras.

Distinguir: TRI calibrada por dados de respostas; parâmetros oficiais do Inep; parâmetros editoriais estimados; parâmetros editoriais ajustados à distribuição do Inep (`calibratedFrom: "inep-distribuicao"`); estimativa CAT; Mastery; Confidence. Importar parâmetros oficiais para alguns itens **não transforma o sistema completo em TRI validada**, nem autoriza previsão de nota ENEM. Não trocar por um sistema novo sem necessidade demonstrada.

### 8.3 Adaptação conservadora e mix

O `30` §7.4 define aproximadamente **70% nível atual, 20% revisão, 10% desafio em janela móvel de 10**; não cota rígida. Revisão atrasada pode ir a 35%; desafio nunca mais de 2 em 10. Alguns critérios de verificação citam janela de 20: resolver explicitamente a relação entre regra operacional e cenário de validação.

Simular iniciante, aluno com backlog grande, aluno estabelecido com revisão atrasada, domínio alto com baixa confiança, erros com ajuda, repetição, foco estreito e catálogo curto. Definir precedência entre fundamentos, revisões, novidade e desafio, tolerâncias e exceções. Não subir pesos até um único fixture passar.

Verificar se estado NOVA e seu score fixo abafam priors de placement; invalidar fila é necessário mas pode não bastar para personalização significativa. Definir como o teste influencia prioridade e dificuldade sem liberar saltos que a confiança não sustenta.

## 9. Diagnóstico, nivelamento e recomposição da trilha

O perfil de `/quiz` tem nove passos: `name/level/exam/state/target/course/subjects/time/focus`. Não confundir autodeclaração com evidência de conhecimento. `/aha` é caminho de quem pula o placement; deve continuar honesto sobre a origem das lacunas.

O CAT existe: LC/MT/CN/CH, RED fora, até 24 itens, 4–6 por área conforme prioridade, EAP e informação Fisher. Existe pool real; não inventar novo motor ou formular teste de personalidade.

Planeje uma tela de resultado simples, visual e séria, aproveitando `PlacementResultView` em `nivelamento.tsx`:

- desempenho/faixa por área realmente medida;
- confiança/limite da estimativa, distinguindo SE de área de Confidence por habilidade;
- poucos pontos fortes e lacunas sustentados por evidência;
- explicação curta do que mudará na recomendação;
- CTA principal para estudar;
- áreas não medidas ou pool insuficiente sem número fictício;
- comportamento sem respostas, parcial, retomado e refeito;
- sem nota prevista, ranking, “Nível 7” arbitrário ou dashboard denso.

Se usar barra/indicador, decidir escala, rótulos, limites, acessibilidade e regra para pouca evidência. Não colocar porcentagem no diagnóstico só porque há θ. Defina copy final proposta, estados e hierarquia, não apenas “melhorar visual”.

Defina exatamente **quando replanejar**: conclusão/aplicação do placement; conclusão de atividade; mudança de foco; conteúdo inválido; versão de algoritmo; eventual expiração de foco/revisão. Especifique o que preserva atividade ativa, conclusões, evidências e histórico, e o que pode substituir comprometidas/upcoming. Não zerar progresso para personalizar.

Cobrir usuário novo; antigo sem placement; antigo com resultado; parcial; resultado concluído cujo efeito não foi aplicado; refazer sem sobrescrever evidência válida; retorno ao app após atualização; flags desligadas. Escolha transação e estratégia de reparação idempotente se necessária. Não manter apenas uma função correta que nunca é chamada.

## 10. Questões oficiais e rastreabilidade

Leia `docs/34` integralmente antes de sugerir restrição ou expansão. Há 18 questões reais ENEM 2023 já importadas e autorização registrada para texto do ENEM com atribuição visível. O registro não é parecer jurídico, não cobre automaticamente outras bancas nem imagens de terceiros.

Audite `ItemSource`, `ItemIrt`, `Exercise.fonte`, arquivos `src/content/banco/oficial/`, `content-pipeline/oficial/enem-2023-transcricao.json`, importadores e renderização. Exigir quando aplicável: prova, ano, aplicação/caderno, número/referência, fonte primária, gabarito e proveniência dos parâmetros.

Verificar atribuição em **todos** os consumidores elegíveis: aula, prática, nivelamento, checkpoint, revisão. Reordenar alternativas exige mapear gabarito e referências sem falsificar enunciado oficial. Uma questão modificada substantivamente deve ter origem editorial honesta, não permanecer “oficial” indistinguível do original.

Para fontes/condições de uso novas, recomendar validação pertinente e consultar fontes oficiais atuais se necessário. Não construir o plano sobre uma afirmação jurídica não verificada. Não baixar microdados de participantes nem incluir informações pessoais para estudar parâmetros de itens.

## 11. Home, progressão e UX global

A jornada principal deve responder rapidamente: **onde estou; o que faço agora; quanto avancei; por que esta atividade; o que vem depois**.

Preservar jornada única, mapa secundário e quatro destinos principais. Não criar dezenas de telas/mini-trilhas. Examinar card atual, nó atual, callout, rótulos, estimativa de tempo, continuidade e retorno após conclusão. Card e nó devem apontar ao mesmo próximo passo válido.

Defina contratos observáveis para estados vazio, carregando, pacote indisponível, erro recuperável, fim de catálogo, revisão, atividade em andamento, conclusão e retorno. O aluno precisa conseguir continuar; spinner/tela branca indefinida ou loop Home→atividade inválida→Home não são fallback suficiente.

Streak/XP devem refletir o evento correto, sem duplicar ao recarregar/reabrir, sem punir retorno e sem transformar conclusão em domínio. Distinguir dia local, meta diária por blocos e `dailyMinutes`. Conferir virada de dia, múltiplas conclusões e replay permitido.

Conservar feedback imutável, explicação estática primeiro e tutor manual. Uma resposta errada não abre nem envia chat automaticamente. Não inserir pop-ups, animações ou métricas que atrapalhem estudar.

## 12. Design System, logos, dark mode e desktop

### 12.1 Sistema vigente e inventário de marca

Use Rabisco na Margem: papel/grafite, azul-caneta para ação/seleção/progresso/foco, marca-texto para recompensa, sucesso/erro para feedback. Fontes Space Grotesk, Plus Jakarta Sans e Space Mono. Leia os tokens reais de `src/styles.css`; respeite `:root`/`.dark` e referência por variável no `@theme inline`.

Não inventar nem redesenhar logo. Originais oficiais estão em `src/assets/branding/foca/`, com README; derivados em `public/branding/foca/`; geração em `scripts/gerar-logos-foca.ps1`. `<FocaMark />` é o ponto central. `BrandMark` delega a ele. Há variantes colorida/contorno claro/contorno escuro e oito expressões com fallback neutro documentado, não oito artes finais distintas comprovadas.

A investigação encontrou seis PNGs originais e derivados já usados. **Não foi identificada uma segunda família mais recente de logos além dessas fontes.** Reconferir arquivos, histórico, documentação e referências; se a “nova logo” não existir, registrar a dependência de asset exato e planejar a consolidação dos oficiais disponíveis. Não produzir nova arte nem bloquear o restante do plano por isso.

Inventário obrigatório: **superfície/rota → componente → asset atual → asset canônico → ação → tema/tamanho → teste**. Cobrir splash, welcome/auth, onboarding, Home, tutor, feedback, celebração, modais, páginas secundárias, favicon, apple touch icon, ícones e metadados OG. `src/routes/__root.tsx` contém links/metadados; `src/lib/brand.ts` ainda tem copy antiga de “60 segundos”/“te cobra todo dia”, que deve ser confrontada com voz e escopo atuais.

Verificar manifest/PWA/service worker por busca real. Não foi encontrado manifest de PWA no inventário inicial; não confundir manifests de conteúdo/áudio com manifest de instalação, nem criar PWA só porque o checklist menciona manifest.

### 12.2 Dark mode e acessibilidade

Auditar backgrounds, surfaces, textos, bordas, hover, pressed, selected, disabled, loading, sucesso/erro, feedback, overlays, diálogos e celebração. Verificar valores computados e contraste com seus fundos reais. Um grep sem hex literal não prova contraste nem opacidade.

Definir foco visível, navegação por teclado, semântica de controles, labels além de placeholders, nomes acessíveis, alternativas selecionadas, leitura de feedback, touch targets ≥44px, reduced motion, zoom 200%, overflow e ordem de foco.

`BottomSheet` implementa foco no título/Escape, mas isso sozinho não garante contenção de foco, retorno ao disparador, bloqueio de scroll ou fundo inerte. Investigar e planejar comportamento completo reutilizando primitives existentes se adequado. Não duplicar modal só para desktop.

### 12.3 Desktop não é apenas ampliar o telefone

Inventarie `PhoneFrame`, bottom nav, FAB do tutor, folhas e players com `max-w-[440px]` ou offsets dependentes dessa largura. Defina uma estratégia coerente de layout para app e telas imersivas: largura máxima, coluna de leitura, navegação, trilha, componentes auxiliares, modais e posição do tutor.

Escolha breakpoints e dimensões justificadas pela UI real. Considere mobile 320/360/390/440, tablet e desktop 1024/1280/1440. Manter enunciados legíveis e trilha central com continuidade; não ocupar todo espaço com dashboard nem colocar sidebar sem função.

Plano deve especificar arquivos e responsabilidade do shell, migração de medidas compartilhadas, comportamento de rodapés fixos/safe area, interação de teclado/hover e foco/scroll ao trocar viewport. Um simples aumento de `max-width` pode desalinhar nav, tutor e folhas; auditar todos juntos. Não duplicar estado ou lógica pedagógica entre layouts.

## 13. Cursos: corrigir descoberta e ampliar cobertura com intenção

`src/data/courses.ts` já contém **59 cursos em seis grupos**: Negócios e Economia; Exatas e Engenharias; Saúde; Humanas e Sociais; Artes e Design; Ciências Naturais e Agrárias.

`CourseStep` em `src/routes/quiz.tsx` achata a lista, faz busca por `toLowerCase().includes()` e mostra `filtered.slice(0, 12)`. Sem busca aparecem os oito cursos de Negócios e os quatro primeiros de Engenharias. Isso explica a percepção de concentração mesmo havendo Saúde/Humanas/etc. no catálogo.

Planeje solução de descoberta, não só acrescentar strings ao fim. Escolha entre categorias, busca/autocomplete acessível e seleção inicial diversa; justificar a decisão. Não inventar “populares” sem dado. Favoritos só se houver utilidade concreta demonstrada.

Cobrir Saúde, Engenharias, Computação/Tecnologia, Exatas, Biológicas, Humanas, Sociais Aplicadas, Comunicação, Direito, Administração/Negócios, Educação/Licenciaturas, Artes, Arquitetura/Design, Agrárias e outros, sem transformar em lista cansativa.

Decidir busca sem sensibilidade a acentos/caixa, sinônimos, ausência de resultado, “Ainda não decidi”, escolha fora da lista, teclado e manutenção da seleção durante busca. Auditar possibilidade de editar depois, pois a copy promete isso. Se mudar strings para IDs, especificar mapeamento compatível para `prefs.targetCourse`, valores legados e desconhecidos. Não usar curso para prever nota de corte ou inferir perfil de prova sem evidência.

## 14. Persistência, compatibilidade e fronteiras arquiteturais

Nenhuma feature deste pedido exige automaticamente banco remoto/autenticação real. Planeje sobre armazenamento local. Teste logout/login no mesmo browser/origin como fluxo local; não prometer persistência entre dispositivos, origens ou limpeza de storage.

Para cada campo novo/alterado, indicar tipo, default, fonte de verdade, escritor, leitores, migração, validação, limites, idempotência e rollback. Se não precisar subir schema, explique. Se precisar, definir versão seguinte em relação à atual reconfirmada, sem presumir que v6 continuará sendo HEAD.

Preservar XP, streak, conclusões, melhor desempenho, preferências, sessões, respostas/ordens, histórico, evidências, agenda e ledger. Definir comportamento para versões v3/v4/v5/v6 relevantes, versão futura, JSON corrompido, storage bloqueado/cheio, conta sem novos campos, catálogo atualizado e conteúdo retirado.

Versionar mudanças editoriais relevantes: não reinterpretar resposta antiga contra gabarito novo. Preservar IDs estáveis (`exercise-ids.ts`) e referências de lições; planejar tombstone/mapeamento/versionamento se necessário. Avaliar sessões em andamento com conteúdo trocado, não somente banco recém-instalado.

Manter a fronteira de bundle: store pode importar núcleo puro, não catálogo inteiro/motor que o puxa. `tests/unit/store-bundle-boundary.test.ts` e `pipeline-boundary.test.ts` existem por esse motivo. Orquestração com conteúdo ocorre na camada apropriada e escreve dados prontos nas ações centrais.

Não trazer pipeline offline para runtime do aluno. Não gerar aula livre na hora da questão. Não introduzir analytics externo ou coleta adicional de dados de menores. Revisão de segurança proporcional às mudanças de store/tutor; achados de deploy antigos devem ser classificados segundo exposição comprovada, sem alegar estado de produção que você não verificou.

## 15. Performance e custo: só propostas sustentadas

Medir ou apontar cadeia causal concreta antes de otimizar. Conferir:

- recomputação de `buildTrail`/`ensurePlan` por mudanças não pedagógicas no store;
- clonagem/serialização do estado e tamanho de storage;
- tamanho de bundle e fronteira conteúdo/store;
- pacotes carregados no placement versus início de atividade;
- deduplicação em voo, timeout, retorno após falha e cache de manifest;
- listas e layouts desktop, imagens/derivados e animações;
- renderizações e event listeners, além de lógica pura rápida em Bun;
- latência do tutor e fallback, sem requisições para selecionar questão ou corrigir resposta.

A meta de planejamento rápido do `30` não é prova de fluidez em celular; separar benchmark puro, browser e dispositivo físico. Não inserir bibliotecas de estado, animação, virtualização ou dados por preferência. Se houver dependência indispensável, justificar custo, alternativa existente e impacto de manutenção no plano.

## 16. Testes: cobrir comportamentos que a suíte atual não cobre

Ferramentas existentes: **Bun test** e **Playwright**. Não adicionar framework novo sem necessidade. Unitários ficam em `tests/unit`; E2E em `tests/e2e`. `playwright.config.ts` usa servidor em 8080, Chromium e projeto `narrow` 320×700 restrito a alguns specs. O nome “chromium” não significa automaticamente viewport mobile: conferir `devices["Desktop Chrome"]` e overrides efetivos.

### 16.1 Linha de base e honestidade

O Codex executou `bun test tests/unit`: **811 pass, 0 fail, 77 arquivos, 3.657 expect**; `bunx tsc --noEmit`: **exit 0**. Também reproduziu C1 e C2 em navegador com script temporário fora do repositório. Não foram criados testes permanentes nem correções nesta investigação.

O subconjunto E2E existente também passou: **13 testes**, comando `bunx playwright test tests/e2e/placement.spec.ts tests/e2e/journey.spec.ts tests/e2e/feedback.spec.ts tests/e2e/chapter-complete.spec.ts --project=chromium --workers=2`. Esses testes verdes coexistiram com C1/C2 reproduzidos: faltam assertivas e caminhos de entrada relevantes, não apenas mais execuções da mesma suíte. O Codex não executou a suíte E2E completa nem o build de produção nesta investigação; a opacidade dos overlays foi confrontada com código/registro, sem uma nova aprovação visual completa em todos os temas e dispositivos.

Reconferir comandos e resultados na sua sessão. Números dos registros antigos são históricos; não copiados como evidência sua. Testes verdes não anulam reprodução real. Registre comando, escopo, data, exit code e limitações. Build/testes podem gerar artefatos; verificar `git status` antes/depois e preservar alterações preexistentes.

### 16.2 Matriz obrigatória no plano

| Grupo | Cenários mínimos e observáveis |
|---|---|
| Início real da jornada | CTA de Home e nó atual abrem aula embarcada, aula de pacote, legado e atividade dinâmica; dinâmica recebe itens uma vez; não depende de URL direta |
| Conclusão/desbloqueio | responder → concluir → gravações corretas → histórico/fila avançam → Home oferece próxima válida; testar micro/legado/prática/revisão/desafio/checkpoint/reforço |
| Idempotência | clique duplo/re-render/retorno/reload não duplicam XP, tentativa, bloco diário, histórico, eventos e contador de checkpoint |
| Persistência | conclusão → reload; pausa → reload; logout/login local; serialização/migração reais; ordem de resposta/feedback preservada |
| Nivelamento completo | fila pré-existente → 24 respostas ou outro limite → aplicação única de priors → invalidação/replano → mudança justificada para perfis controlados |
| Nivelamento parcial | pausa/reload entre respostas; EAP idêntico para mesma sequência; sem perda de mapa de itens nem duplicação; pool parcial/vazio; refazer preserva evidência anterior |
| Diagnóstico | área não medida sem número; confiança correta; CTA; sem nota prevista; resultado visual acessível e correspondente aos dados persistidos |
| Adaptação | fundamentos/pré-requisitos; Mastery versus Confidence; ajuda/Não sei; mix com backlog e aluno estabelecido; foco; revisão atrasada; checkpoint integrado |
| Questões | schemas/formatos reais, índices, fontes, IDs/versões, dificuldade, quality warnings, falsos positivos, distribuição e referências após correção |
| Ordem de alternativas | se houver mudança, correção/tutor/explicação/snapshot/retomada usam a mesma ordem e identidade; não quebrar referências internas do enunciado |
| Feedback visual | superfície computada opaca e texto legível em três variantes, temas e fluxos; overlay dark sem véu branco; estado estável ao abrir tutor |
| Responsividade | 320px, larguras mobile usuais, tablet e desktop definidos; zoom 200%; sem conteúdo cortado/scroll horizontal/CTA coberto; shell e overlays alinhados |
| Acessibilidade | teclado, foco/retorno/containment, labels, semântica, reduced motion, contraste e alvos; separar automatizado de leitor de tela real |
| Cursos | distribuição inicial, busca por acento/sinônimo, teclado, nenhum resultado, persistência e valor legado |
| Falhas | pacote ausente/lento/invalidado, offline e retry; tutor bloqueado sem travar estudo; storage que falha sem falso sucesso; rota inválida |
| Rollback | flags relevantes desligadas/ligadas sem apagar dados; mapa por matéria e fluxo legado preservados |

Use os testes existentes como pontos de extensão: `placement.spec.ts`, `journey.spec.ts`, `feedback.spec.ts`, `chapter-complete.spec.ts`, `lesson-v2.spec.ts`, `microlicoes.spec.ts`, `lessons.spec.ts`, `focus.spec.ts`, `checkpoint.spec.ts`, `state-migration.spec.ts`, `onboarding.spec.ts`, `trail-home.spec.ts`, `trail-path.spec.ts`, `trilha.spec.ts`, `tutor.spec.ts`.

Unitários relevantes incluem `store-placement-actions.test.ts`, `store-journey-actions.test.ts`, `journey.test.ts`, `placement.test.ts`, `placement-pool.test.ts`, `mastery-model.test.ts`, `confidence.test.ts`, `state-migrations.test.ts`, `rewards.test.ts`, `adaptive-candidates.test.ts`, `adaptive-planner.test.ts`, `checkpoint-compose.test.ts`, `pipeline-validate.test.ts`, `pipeline-e2e.test.ts`, `pipeline-aulas.test.ts`, `storage-budget.test.ts` e testes de fronteira. Confirmar cada nome antes de incluí-lo como arquivo existente no novo checkout; nome novo deve ser marcado **NOVO**.

Especificar por teste: fixture realista, precondições, interações, asserções de UI **e de estado**, falha que detecta e fase proprietária. Não escrever testes que só espelham a função nem remover assertivas para acomodar regressão. `page.addInitScript` não pode reseedar o estado incondicionalmente a cada reload e mascarar persistência.

Para validação de implementação futura, usar comandos reais conforme escopo:

```text
bunx tsc --noEmit
bun test tests/unit
bunx playwright test
bun run build
```

Defina subconjuntos por checkpoint e regressão completa final. Há ruído histórico de lint no Windows/CRLF e artefatos em registros; investigar baseline antes de exigir “zero lint global” ou reformatar o repositório inteiro. Não reformatar arquivos alheios para fechar esta atualização.

Hardware: não afirmar Safari iOS, Chrome Android físico, som/háptico ou leitor de tela real validados por emulação. Planejar verificação manual objetiva com status separado e não fingir evidência.

## 17. Decisões que você deve fechar no planejamento

Não deixar para Sonnet escolher arquitetura durante execução. Resolva, com justificativa:

1. Proprietário e contrato da finalização de placement, incluindo recuperação de estados antigos incompletamente aplicados.
2. Proprietário da transição iniciar/retomar atividade e da seleção de itens.
3. Fonte de conclusão para cada família de conteúdo e impacto na fila/pré-requisitos.
4. Critério de idempotência de tentativa/conclusão/ledger/histórico/eventos.
5. Política de preservação de comprometidas e atividade ativa ao replanejar.
6. Como priors/evidência alteram recomendação sem saltar fundamentos com baixa confiança.
7. Integração de checkpoint e mix, com precedência, tolerâncias e expiração de sinais.
8. Escalas e linguagem do diagnóstico visual, inclusive áreas não medidas.
9. Rubrica editorial, alertas automáticos, portões de publicação e estratégia de revisão do acervo.
10. Proveniência verdadeira da revisão e compatibilidade de status de conteúdo.
11. Estratégia de alternativas e dificuldade por tipo de atividade.
12. Shell/layout desktop, medidas compartilhadas e componentes afetados.
13. Catálogo/descoberta de cursos e compatibilidade da escolha salva.
14. Assets canônicos e ação por consumidor, sem supor arte nova inexistente.
15. Necessidade real de schema/algoritmo/versionamento e migrações.
16. Flags, rollback, observabilidade local, testes e gates finais.

Quando faltar uma informação externa indispensável, separar **decisão fechada**, **hipótese testável**, **dependência externa** e **bloqueio real**. Para hipótese técnica, preferir investigá-la nesta sessão. Para pendência externa, indicar exatamente o que falta, quem pode fornecer, o que impede e o que pode prosseguir; não usar “TBD” espalhado pelo plano. Não inventar autorização, asset ou resultado para fechar uma tabela.

## 18. Estrutura e granularidade das fases

Defina a ordem pelas dependências reais. Uma sequência candidata é: linha de base/decisões SDD → contratos/migração indispensável → integridade de início/conclusão/persistência → placement/recomposição → modelo/checkpoints/seleção → qualidade/revisão de conteúdo → diagnóstico/Home → DS/desktop/acessibilidade/cursos → regressão/documentação. Ajuste com justificativa.

**Testes acompanham cada fase**, não ficam todos no fim. Bugs confirmados de fluxo e perda de confiança no progresso têm prioridade sobre polimento. Mudanças de schema precedem consumidores. Conteúdo e algoritmo precisam de compatibilidade conjunta. Não copiar as 16 fases do `31` como se estivessem todas pendentes.

Cada fase deve ter:

- ID, objetivo observável e valor ao aluno;
- requisitos/bugs atendidos e dependências;
- Context Pack pequeno, com documentos/seções e arquivos/símbolos;
- estado atual versus contrato esperado;
- tarefas atômicas ordenadas;
- arquivos existentes a alterar e arquivos novos explicitamente marcados;
- entradas/saídas compartilhadas com outras fases;
- efeitos em dados, conteúdo, UI e rollback;
- testes/comandos e critérios de checkpoint;
- condição de parada, retomada e conclusão.

Cada tarefa deve seguir este nível de precisão:

```text
T-XX — resultado concreto
Requisitos/bugs: RF-..., B.../C...
Depende de: T-...
Context Pack: documentos/seções e arquivos/símbolos
Arquivos: alterar/criar/testar/gerar (distinguir fonte e derivado)
Comportamento atual: evidência com caminho e símbolo
Comportamento esperado: estados e transições
Contrato: tipos, parâmetros, retorno, invariantes, versão e erros
Mudança: responsabilidade de cada função/componente, algoritmo ou pseudocódigo curto
Compatibilidade: dados antigos, IDs, sessões, conteúdo e flags
Testes: fixture, interação, assertivas, comando exato e resultado esperado
Aceitação: Given/When/Then observável
Riscos: falhas concretas e sua mitigação
Skills: somente as necessárias, com motivo
Checkpoint: o que precisa passar para liberar a tarefa seguinte
```

Não copiar milhares de linhas de implementação. Pseudocódigo e assinaturas devem fixar interfaces, estado e ordem de efeitos; o executor pode escrever código idiomático dentro do contrato. Não usar “atualizar componente”, “melhorar UX”, “adicionar testes adequados” como tarefas completas.

Refactor só com motivo concreto: causa raiz, fonte de verdade, testabilidade, eliminação de duplicação relevante ou fronteira de bundle. Não reescrever tudo nem aproveitar o escopo para trocar framework/gerenciador/estilo. Documentar o que será deliberadamente preservado.

## 19. Estrutura obrigatória da sua entrega

Entregue um único plano principal, seguindo o formato SDD local e incorporando as seções abaixo. Escreva em português; os títulos A–P podem manter os nomes solicitados. O plano não pode depender de referências vagas a “este prompt”: transcreva nele os requisitos e contratos necessários ao executor.

### A. Executive Summary

O que existe, o que falha, o que precisa evoluir, prioridades e limites. Diferenciar achados de código, navegador, registros históricos e hipóteses.

### B. Current Architecture

Stack real, estado, persistência, conteúdo, motor, transporte de IA, caches e limites. Mapa de dependências com arquivos/símbolos e fontes de verdade. Tabela de conflitos documentais e decisões.

### C. Current User Flow

Fluxo real novo/antigo, com e sem placement, jornada/mapa/prática/legado. Transições de início/conclusão e gravação, não apenas wireframes.

### D. Confirmed Bugs

Status dos quatro relatos, C1/C2 reconfirmados e demais achados reproduzidos, com severidade, causa, reprodução, testes que faltam e escopo da correção.

### E. Additional Problems Found

Hipóteses, dívidas, melhorias e comportamentos intencionais separados. Pendências do `32` reavaliadas, incluindo integridade editorial e limitações de validação.

### F. Target Behavior

Requisitos numerados, estados de UX, copy proposta, fluxo futuro e não objetivos. Critérios para perceber adaptação e progresso reais.

### G. Pedagogical Architecture

Modelo preservado/ajustado, dificuldade, composição de lições, independência/ajuda, revisão, seleção, CAT, priors, confidence, checkpoints e política de questões. Rubrica, pipeline e estratégia concreta para o acervo.

### H. Data Model Changes

Somente as necessárias; caso contrário “não se aplica” fundamentado. Tipos, defaults, writers/readers, fonte canônica, índices/versões, dados derivados, limites e contratos de migração.

### I. SDD Changes

Quais documentos/seções serão alterados futuramente e por quê. Precedência específica do novo plano, atualização de `docs/00-README.md`, topo/trechos conflitantes de `CLAUDE.md`, `PRODUCT`/`DESIGN`, inventário `21`, READMEs e futuros registros quando pertinente. Não apagar histórico nem marcar auditorias antigas como novas.

### J. Implementation Phases

Fases em ordem topológica, Context Packs, tarefas, interfaces e checkpoints verificáveis. Decisões encerradas antes da execução.

### K. File-by-File Plan

Tabela `arquivo real/proposto → função/responsabilidade → mudança → tarefa proprietária → consumidores → teste → motivo`. Marcar gerados, fontes e **NOVO**. Conferir todos os caminhos no filesystem antes de finalizar.

### L. Tests

Matriz requisito × teste existente/novo × dados × comando × resultado esperado, cobrindo comportamento, persistência, UX e falhas. Separar baseline executada de verificações futuras e hardware pendente.

### M. Migration / Compatibility

Usuários antigos, placement concluído mas não aplicado, sessões ativas, mudanças editoriais, IDs, schema futuro, rollback, flags e armazenamento indisponível. Não pressupor backend.

### N. Risks

Riscos técnicos, pedagógicos, editoriais, performance e dependências externas com probabilidade/impacto qualitativos, evidência e mitigação proporcional. Sem lista genérica desconectada dos arquivos.

### O. Acceptance Criteria

Critérios objetivos globais e por fase, ligados a requisitos/testes. Nenhum requisito desta atualização pode desaparecer; o que já existe recebe critério de preservação/revalidação, o que não cabe recebe justificativa explícita.

### P. Execution Checklist for Sonnet

Checklist detalhado, ordem exata, Context Packs, interfaces, comandos, dados de teste, migrações, rollback e instruções de retomada. Sonnet não deve precisar escolher entre alternativas arquiteturais não decididas.

## 20. Revisão final do próprio plano

Antes de entregar, confira:

- Cada tema das seções 1 e 5–16 está associado a requisito, tarefa, teste e aceite, ou a justificativa explícita de preservação/não aplicação.
- C1 e C2 foram investigados por caminho real, não neutralizados por testes de rota direta.
- Confiança de área, Confidence por habilidade e Mastery não foram misturadas.
- O DS atual e os assets oficiais foram preservados; não foi inventada logo nova.
- Cursos foram tratados como problema de descoberta e cobertura, não como catálogo vazio.
- A solução de progressão reconhece as diferentes fontes de conclusão e o custo de pacotes assíncronos.
- Migração de conteúdo/progresso não reinicia o aluno nem reinterpreta tentativa antiga silenciosamente.
- A autorização de revisão editorial delegada e os limites de fontes oficiais foram respeitados sem alegar revisão humana inexistente.
- Todos os caminhos “existentes” existem; novos estão marcados. Tipos/símbolos e interfaces entre fases são consistentes.
- Testes estão nas fases que introduzem comportamentos e incluem observáveis que falhariam nos bugs identificados.
- Não há alegação de “tudo pronto” com base apenas em status de documento ou suíte verde.
- Não há placeholder técnico evitável, refactor sem motivo, dependência sem justificativa, código implementado ou instrução de executar nesta sessão.

O plano deve terminar com o título exato:

### READY FOR SONNET EXECUTION

Sob esse título, inclua obrigatoriamente:

1. **Ordem exata das fases e tarefas**, sem opções ambíguas.
2. **Arquivos envolvidos**, com fontes/gerados e novos/existentes separados.
3. **Testes obrigatórios**, comandos, fixtures e resultados esperados em cada gate.
4. **Migrations necessárias**, ou justificativa explícita de ausência; execução/rollback e preservação dos dados.
5. **Dependências entre fases**, contratos consumidos/produzidos e condição de retomada.
6. **Pontos que NÃO podem ser alterados**, incluindo invariantes de dados, tutor manual, identidade, stack, fronteiras e Git/Lovable.
7. **Critérios finais de conclusão**, objetivos, completos e rastreáveis.

Esse título significa que o documento está preparado para o executor, **não** que existe autorização para executar. Se houver dependência externa indispensável ainda não resolvida, declare-a nesse bloco e identifique as fases bloqueadas; não esconda a pendência para aparentar prontidão.

**NÃO IMPLEMENTE NADA AINDA. NESTA ETAPA, SUA ÚNICA ENTREGA É O PLANO COMPLETO DE IMPLEMENTAÇÃO.**
