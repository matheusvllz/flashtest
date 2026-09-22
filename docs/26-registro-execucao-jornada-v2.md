# 26 — Registro de execução: Jornada de Aprendizado V2

Execução de [25-plano-jornada-aprendizado-v2.md](25-plano-jornada-aprendizado-v2.md), tarefa por tarefa, começando por T-01. Este documento é o registro exigido pelo `25` (T-01, T-28): números reais de cada rodada de comandos, não estimativas.

## 1. Baseline

Executado em 21/09/2026, sessão contínua. **Nenhum arquivo de código foi alterado nesta tarefa** — só a criação deste próprio documento (`docs/26-registro-execucao-jornada-v2.md`, novo), conforme T-01 exige.

### 1.1 `git status`

Rodado antes de qualquer comando de verificação, na raiz do repo:

```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
	modified:   .gitignore
	modified:   CLAUDE.md
	modified:   bun.lock
	modified:   docs/00-README.md
	modified:   package.json
	modified:   src/components/TutorBubble.tsx
	modified:   src/components/brand/FocaSays.tsx
	modified:   src/components/ds/EmptyState.tsx
	modified:   src/components/lessons/CelebracaoAula.tsx
	modified:   src/components/lessons/FeedbackSheet.tsx
	modified:   src/components/lessons/LessonPlayer.tsx
	modified:   src/components/lessons/exercises/FillBlank.tsx
	modified:   src/components/lessons/exercises/MatchPairs.tsx
	modified:   src/components/lessons/exercises/TrueFalse.tsx
	modified:   src/components/lessons/exercises/shared.ts
	modified:   src/data/questions.ts
	modified:   src/lib/lessons/tutor-focus.ts
	modified:   src/lib/sfx.ts
	modified:   src/lib/store.ts
	modified:   src/lib/tutor-core.ts
	modified:   src/lib/tutor-prompt.ts
	modified:   src/lib/tutor.ts
	modified:   src/lib/voz.ts
	modified:   src/routeTree.gen.ts
	modified:   src/routes/__root.tsx
	modified:   src/routes/dashboard.tsx
	modified:   src/routes/flashcards.tsx
	modified:   src/routes/index.tsx
	modified:   src/routes/profile.tsx
	modified:   src/routes/progress.tsx
	modified:   src/routes/study.tsx

Untracked files:
	docs/21-brand-voice-e-inventario-copy.md
	docs/22-validacao-piloto-aprendizagem.md
	docs/23-identidade-sonora-linguagem-musical.md
	docs/24-integracao-identidade-sonora.md
	docs/25-plano-jornada-aprendizado-v2.md
	docs/audio-candidates/
	docs/audio-proposal-v2/
	playwright.config.ts
	public/sfx/
	scripts/foca_sound/
	src/components/learning/
	src/content/curriculum.ts
	src/content/exam-tips.ts
	src/content/exercise-ids.ts
	src/content/microlicoes/
	src/data/exams.ts
	src/hooks/useExerciseSession.ts
	src/hooks/useLearningSession.ts
	src/lib/audio/
	src/lib/copy.ts
	src/lib/features.ts
	src/lib/feedback/
	src/lib/learning/
	src/lib/state-migrations.ts
	src/routes/learn.$lessonId.tsx
	src/routes/trilha.tsx
	tests/

no changes added to commit (use "git add" and/or "git commit -a")
```

Leitura: este working tree já contém, não commitado, todo o trabalho das Fases 0–12 do `20` registrado em `docs/22` (motor de microlições, trilha piloto, áudio, feedback compartilhado, testes unitários/E2E). Não há nada do plano `25` (T-02 em diante) ainda aplicado — `src/lib/learning/types.ts` (que existe, dentro de `src/lib/learning/`, não listado individualmente por estar dentro do diretório untracked) segue no formato v1 único, sem `LessonStep`/`chapterId`/`curriculum-tree.ts`. `docs/26` (este arquivo) é o único artefato novo desta tarefa.

### 1.2 `bunx tsc --noEmit`

```
$ bunx tsc --noEmit
(sem saída)
$ echo $?
0
```

**Resultado: limpo.** Nenhum erro de tipo, nenhum warning. Exit code 0.

### 1.3 `bun test tests/unit`

```
$ bun test tests/unit
bun test v1.4.2 (744846f84)

 137 pass
 0 fail
 1824 expect() calls
Ran 137 tests across 15 files. [168.00ms]
```

**Resultado: 137 testes, 0 falhas, 1824 `expect()`, exit code 0.**

Nota de divergência com `docs/22` §2, que registra "136 testes, 0 falhas, 1.920 `expect()`" na execução de 21/09/2026 anterior a este baseline: a contagem de testes subiu em 1 e a de `expect()` caiu em 96 entre aquele registro e este. Não investiguei a causa (T-01 é só baseline, sem tocar código) — hipótese mais provável é ajuste incremental em algum teste existente no mesmo dia, já que o `git status` acima mostra `tests/` inteiro como untracked (nunca commitado) e portanto sem diff auditável por `git log`. Registrando o número real desta execução, não o de `docs/22`, como manda T-01.

### 1.4 `bunx playwright test`

Pré-checagem: `bunx playwright --version` → `Version 1.63.0`. Havia um processo já ouvindo em `http://localhost:8080` (respondeu HTTP 200 a um `curl` de sondagem antes da rodada) — a config (`playwright.config.ts`, `webServer.reuseExistingServer: true`) reaproveitou esse servidor em vez de subir um novo, então não houve tentativa de bind de porta nem timeout de `webServer`.

```
$ bunx playwright test
Running 25 tests using 3 workers

  ok  1 … audio-assets.spec.ts › WAVs reais: cache, prioridade, mute, expiração e cancelamento (6.8s)
  ok  2 … audio-assets.spec.ts › carregamento atrasado não toca ao terminar (7.6s)
  ok  3 … audio-assets.spec.ts › navegação cancela o som ativo (6.7s)
  ok  4 … audio-assets.spec.ts › WAV indisponível não impede responder (2.4s)
  ok  5 … audio.spec.ts › responder e alternar o som não lança erro de console (engine real do navegador) (15.8s)
  ok  6 … exam-tips.spec.ts › sem perfil de vestibular escolhido, o recap não mostra nenhuma dica (15.4s)
  ok  7 … exam-tips.spec.ts › escolhendo ENEM no perfil, a dica aparece no recap e dispensar não trava a conclusão (28.2s)
  ok  8 … feedback.spec.ts › A1 — a frase do feedback não muda enquanto o relógio da aula continua rodando (12.3s)
  ok  9 … feedback.spec.ts › A5/B4 — alternativas neutras após responder ficam totalmente opacas e legíveis (4.2s)
  ok 10 … feedback.spec.ts › B5 — clique duplo em Continuar avança só uma questão (9.9s)
  ok 11 … flashcards.spec.ts › avaliar 3 cartões seguidos mostra 3 frentes diferentes, sem pular nenhum (2.0s)
  ok 12 … flashcards.spec.ts › não é possível avaliar antes de virar o cartão (1.9s)
  ok 13 … flashcards.spec.ts › trocar de matéria reinicia a posição pro primeiro cartão do novo filtro (2.2s)
  ok 14 … lessons.spec.ts › lição de redação: feedback estável e sem erro de console ao verificar (3.6s)
  ok 15 … microlicoes.spec.ts › percorre a microlição inteira e conclui com XP (4.9s)
  ok 16 … microlicoes.spec.ts › A8 — reload no meio do feedback mantém resposta/frase e não duplica avanço (4.4s)
  ok 17 … microlicoes.spec.ts › lição inexistente mostra estado vazio, não tela branca (2.1s)
  ok 18 … state-migration.spec.ts › usuário com progresso salvo (estado v3 legado) é hidratado e vai pro dashboard, não pro /welcome (8.9s)
  ok 19 … state-migration.spec.ts › migração cria backup v4 uma única vez e adiciona schemaVersion sem apagar XP (9.5s)
  ok 20 … state-migration.spec.ts › usuário novo (sem storage nenhum) ainda vai pro /welcome normalmente (9.1s)
  ok 21 … trilha.spec.ts › trilha mostra os 6 nós com rótulo textual de estado (5.8s)
  ok 22 … trilha.spec.ts › Fase 12 — dashboard mostra a entrada da trilha agora que o piloto está ligado (5.6s)
  ok 23 … trilha.spec.ts › URL direta pra uma lição bloqueada respeita a mesma regra do nó (não pula o bloqueio) (5.3s)
  ok 24 … trilha.spec.ts › concluir a 1ª lição desbloqueia a 2ª — na trilha E por URL direta (7.6s)
  ok 25 … tutor.spec.ts › A2 — tutor não abre nem envia mensagem automaticamente ao errar (2.4s)

  25 passed (1.1m)
```

**Resultado: 25 testes, 25 passaram, 0 falhas, exit code 0.** Ambiente conseguiu rodar Playwright sem problema — nada a reportar sobre bind de porta ou timeout do `webServer` (o servidor reaproveitado já estava de pé). Nota: `docs/22` §2 registra "20 testes, 0 falhas"; esta execução real conta 25 — divergência coerente com o `git status` acima, que mostra `tests/` como diretório inteiro não commitado (sem histórico Git para comparar revisões), então não é possível auditar quais specs foram adicionados entre o registro de `docs/22` e agora só por este comando. Registrando o número real de hoje.

### 1.5 `bun run build`

```
$ bun run build
$ vite build
[aviso] plugin "vite-tsconfig-paths" — Vite agora suporta resolve.tsconfigPaths nativamente (não bloqueante)
[aviso] createServerFn().inputValidator() is deprecated. Use createServerFn().validator() instead. (src/lib/tutor.ts:15:25, repetido nos 3 ambientes: client/ssr/nitro — não bloqueante)
✓ 2147 modules transformed. (ambiente client)
✓ built in 2.22s
[aviso] Some chunks are larger than 500 kB after minification (dist/assets/trilhas-*.js, 577.73 kB — conteúdo de trilhas de redação; não bloqueante)
✓ 324 modules transformed. (ambiente ssr)
✓ built in 1.42s
[nitro] ✔ Generated public dist
✓ 1952 modules transformed. (ambiente nitro/netlify)
✓ built in 816ms
[nitro] ✔ You can preview this build using npx vite preview
[nitro] ✔ Generated .netlify/functions-internal/nitro.json
```

**Resultado: build completo nos três ambientes (client, ssr, nitro/netlify), exit code 0.** Avisos preexistentes, não bloqueantes:
- `createServerFn().inputValidator()` deprecated (API do TanStack Start, não do nosso código de negócio) em `src/lib/tutor.ts:15:25`.
- Chunk `trilhas-*.js` acima de 500 kB minificado (conteúdo das 15 trilhas/134 lições de redação em `src/content/trilhas/`).
- Aviso informativo do plugin `vite-tsconfig-paths` sobre uma opção nativa equivalente.

`dist/` e `.netlify/` (artefatos de build) são ignorados pelo `.gitignore` (`dist`, `dist-ssr`, `.netlify/`), confirmado: `git status` depois do build não lista nada novo em `dist`/`.netlify`.

### 1.6 Resumo dos números reais desta baseline

| Comando | Resultado | Exit code |
|---|---|---|
| `bunx tsc --noEmit` | limpo, 0 erros | 0 |
| `bun test tests/unit` | 137 pass, 0 fail, 1824 expect() | 0 |
| `bunx playwright test` | 25 passed, 0 failed | 0 |
| `bun run build` | client+ssr+nitro OK, só avisos preexistentes não bloqueantes | 0 |

`bun`/`bunx` estavam disponíveis no PATH (`/c/Users/mathe/.bun/bin/bun`, `/c/Users/mathe/.bun/bin/bunx`, versão `1.4.2`; Playwright `1.63.0`) — nenhum problema de ambiente a registrar. Nenhum arquivo de código foi tocado nesta tarefa; o único artefato novo é este documento.

**Critério de aceite de T-01 (baseline registrado com números reais; nenhum arquivo de código tocado): cumprido.**

---

## 2. T-02 a T-27 — o que existe no código, por fase

Esta seção foi escrita na rodada final (T-28, 22/09/2026), depois de T-02…T-27 já executados em sessões anteriores contínuas a este mesmo baseline. Diferente da seção 1 (comandos rodados ao vivo por mim), aqui eu audito o que o código tem hoje contra o que cada tarefa do `25` pedia — não reconstituo o histórico sessão a sessão, porque `docs/26` só nasceu em T-01 e o `git status` (§1.1) mostra que nada disto está commitado nem tem histórico de diff auditável. Cada linha abaixo foi conferida por leitura/grep direto do arquivo citado nesta mesma sessão, não copiada de relato anterior.

| Fase | Tarefas | O que existe hoje | Evidência conferida nesta sessão |
|---|---|---|---|
| 0 | T-01 | Baseline registrado (seção 1) | — |
| 1 — Modelo de dados | T-02…T-06 | `LessonStep` (`intro`/`teach`/`tip`/`question`/`recap`), união `MicroLessonV1 \| MicroLessonV2`, `chapterId` em `src/lib/learning/types.ts`; `resolveExercise` em `steps.ts`; validação v2 em `validate.ts` (inclui as regras de `prerequisiteChapterIds` — ver §3.4 sobre por que esse caminho só é exercitado por fixture sintética); `CURRICULUM_TREE` em `src/content/curriculum-tree.ts` com `prerequisiteChapterIds: []` em todo capítulo do conteúdo publicado; revisão sintética em `src/lib/learning/chapter-review.ts` (`buildChapterReview`, descarta capítulo com < 4 itens de revisão) | Leitura de `types.ts`, `curriculum-tree.ts`, `chapter-review.ts`; grep de `prerequisiteChapterIds` (só `[]` fora dos testes) |
| 2 — Estado | T-07 | `CURRENT_SCHEMA_VERSION = 5` em `src/lib/state-migrations.ts`, migração aditiva a partir de `schemaVersion` implícito 3 | `grep CURRENT_SCHEMA_VERSION` → `= 5` |
| 3 — Motor | T-08/T-09 | `src/hooks/useLearningSession.ts` orientado a passos (não mais índice numérico fixo), `src/lib/learning/session-logic.ts` com pontuação/`presentedOrders`; conclusão com capítulo/seção em `trail-completion`-adjacente | `tests/unit/session-logic.test.ts`, `tests/unit/trail-completion.test.ts` passando (ver §4) |
| 4 — Player | T-10…T-12 | `src/components/learning/steps/{IntroStepView,TeachStepView,TipStepView,QuestionStepView,RecapStepView}.tsx`; `COPY.licao.*` centralizado (`src/lib/copy.ts`); `MicroLessonPlayer.tsx` reescrito com header contextual (breadcrumb "Capítulo › Lição") e saída com confirmação (`COPY.licao.sairTitulo`) | Leitura de `copy.ts`; `tests/e2e/lesson-v2.spec.ts` confere breadcrumb e fluxo completo |
| 5 — Conteúdo v2 | T-13/T-14 | 6 lições piloto (citologia×2, porcentagem×2, crase×2) convertidas para `MicroLessonV2`, cada uma com `pratica-3` + `desafio` novos (12 exercícios novos no total) além do `checkpoint`/`pratica-2`/revisão já existentes; ver §3.1 e §3.2 para os dois desvios editoriais desta fase | Leitura de `src/content/microlicoes/{biologia/citologia,matematica/porcentagem,portugues/crase}.ts`; grep confirma 12 ocorrências de `:pratica-3`/`:desafio` |
| 6 — Trilha | T-15…T-19 | `buildTrail` puro em `src/lib/learning/trail.ts` (assinatura `(s: AppState, hoje: string) => TrailModel`, sem `Date.now()` interno); `LessonNode`/`ChapterCard`/`SectionHeader`; `TrailHeader`/`ContinueCard`; rota `src/routes/trilha.tsx`; legado (134 lições de redação) entra como capítulos na árvore | Leitura de `trail.ts` (assinatura), `trilha.tsx`; medição de performance em §5 |
| 7 — Home/nav | T-20…T-22 | `HOME_ROUTE`/`FEATURES.trilhaComoHome = true` em `src/lib/features.ts`; `dashboard.tsx` com `beforeLoad` que redireciona pra `/trilha` quando a flag está ligada, mas mantém o componente antigo funcional por trás pra rollback; `AppShell.tsx` com `NAV_ITEMS_V2` (Aprender/Praticar/Progresso/Perfil, 4 itens) quando a flag está ligada, `NAV_ITEMS_V1` (5 itens) como fallback | Leitura de `features.ts`, `dashboard.tsx` (linhas 12-21), `AppShell.tsx` (linhas 24-42) |
| 8 — Gamificação | T-23/T-24 | `ChapterCompleteSheet.tsx` (folha idempotente, prop `reviewTarget` opcional que abre a revisão do capítulo); destaque de desbloqueio em `LessonNode` via prop `highlightDelayMs` | Leitura de `ChapterCompleteSheet.tsx`, `LessonNode.tsx`; ver §3.3 sobre o gap de wiring encontrado e corrigido |
| 9 — Edge cases | T-25 | Tabela de edge cases do `25` §22 coberta nos testes unitários/E2E listados na seção 21 do plano | `bun test tests/unit` + `bunx playwright test` verdes (§4) — não reconferi cada edge case individualmente linha a linha nesta sessão, ver §5 |
| 10 — Testes/docs | T-26/T-27/T-28 | `tests/unit/*` (22 arquivos, 257 testes) e `tests/e2e/*` (14 specs, 33 testes incluindo o projeto `narrow`) | Rodados ao vivo nesta sessão (§4) |

## 3. Decisões editoriais tomadas ao longo da execução

Registradas aqui porque o `25` (regra 3 da introdução) pede que qualquer divergência do texto do plano vire registro em `docs/26`, não decisão silenciosa.

### 3.1 T-13 — o desafio de `porcentagem-valor` não reusou `q21`

O `25` §18 T-13 (linha 832) sugeria, como opção preguiçosa, reaproveitar a questão `q21` do banco geral (`src/data/questions.ts`) como o passo `desafio` de `porcentagem-valor`, "se o enunciado couber no objetivo; senão autorar". `q21` é sobre **juros compostos** (`"Um capital de R$ 1.000,00 é aplicado a juros compostos de 10% ao mês..."`) — um tópico de crescimento exponencial, distinto do que a lição `porcentagem-valor` ensina (cálculo direto de percentual de um valor, sem juros compostos nem a ideia de taxa aplicada repetidamente sobre uma base que já cresceu). Usar `q21` ali quebraria a regra de dificuldade não-decrescente com um salto de assunto não ensinado na lição, não só de dificuldade. Optei por autorar um desafio novo (pesquisa eleitoral, `mc:porcentagem-valor:desafio` em `src/content/microlicoes/matematica/porcentagem.ts`) que usa só o que a lição ensinou (percentual de um total, e percentual de um subconjunto), num contexto mais elaborado. `q21` continua no banco geral, sem uso na trilha — não foi apagado nem realocado.

### 3.2 Correção de conteúdo em `crase-quando-usar:revisao-1`

O item `mc:crase-quando-usar:revisao-1` (verdadeiro/falso, `src/content/microlicoes/portugues/crase.ts`) afirma que "o 'a' que se funde com a preposição é sempre um artigo feminino" e marca isso como verdadeiro. Na autoria original essa explicação não mencionava a exceção das locuções com demonstrativo (`àquele`, `àquilo`), onde o "a" fundido é do demonstrativo, não de um artigo — um overclaim que um aluno atento poderia contestar com um contraexemplo real da língua. A explicação hoje no arquivo já inclui a ressalva ("Há uma exceção pontual ('àquele', 'àquilo')... mas essa exceção vem só depois, com as trilhas de casos") — corrigida durante a verificação desta rodada final, sem mudar o gabarito (`verdadeiro: true` continua correto pra regra geral que a pergunta testa) nem os IDs consumidos por `reviewExerciseIds`.

### 3.3 `ChapterCompleteSheet.reviewTarget` — gap de wiring encontrado e fechado

A prop `reviewTarget` de `ChapterCompleteSheet.tsx` existe e é opcional; sem ela, a folha de "Capítulo concluído" não oferece link pra revisão mesmo quando uma revisão existe pro capítulo — regressão silenciosa de G8 (`25` §20). Hoje `src/routes/trilha.tsx` passa `reviewTarget={revisaoDoSheet?.href}` (linha 143) e `tests/e2e/chapter-complete.spec.ts` cobre o caminho ponta a ponta (concluir as 2 lições de Citologia → folha → nó "Revisão" fica `Disponível`). Registrado aqui porque esse é exatamente o tipo de gap de integração (prop existe no componente, mas ninguém a passa no call site) que não aparece no `tsc` nem em teste unitário do componente isolado — só no E2E que monta a árvore real.

### 3.4 `prerequisiteChapterIds` — caminho de código sem conteúdo real que o exercite

`validate.ts` valida `prerequisiteChapterIds` (ids fantasma, ciclos) e `trail.ts` (`chapterPrereqsMet`, linha 121-123) checa se os pré-requisitos de capítulo estão cumpridos antes de liberar um capítulo. Confirmado por grep: **todo capítulo em `CURRICULUM_TREE` (conteúdo publicado) tem `prerequisiteChapterIds: []`** — os únicos lugares onde o array vem preenchido são fixtures sintéticas de teste (`tests/unit/validate-v2.test.ts`, linhas 438/446-447, pra testar exatamente a detecção de id fantasma e de ciclo). Ou seja: a validação e o bloqueio por pré-requisito de capítulo estão implementados e testados contra estado inventado, mas **nunca rodaram contra uma árvore real onde algum capítulo trava outro** — porque o `25` não pediu nenhum capítulo com pré-requisito cruzado nesta entrega (só pré-requisito de *lição*, via `prerequisiteLessonIds`, que é outro campo e esse sim é usado no conteúdo real, ex. `crase.ts` linha 213). Isso não é um bug: é a mesma categoria de limitação que `docs/22` §3 já registrava para outras funções ("existe e está testado, não tem consumidor real ainda"). Se um capítulo publicado vier a usar `prerequisiteChapterIds` não-vazio no futuro, vale rodar `tests/e2e` de novo com esse cenário específico antes de confiar no bloqueio em produção — o teste unitário sintético prova a lógica, não a integração ponta a ponta com dado real.

## 4. Testes executados nesta rodada final (T-28) — evidência real

Comandos rodados ao vivo nesta sessão, 22/09/2026, depois de T-02…T-27 já aplicados (não é o baseline da seção 1 — é a verificação final que T-28 pede).

### 4.1 `bunx tsc --noEmit`

```
$ bunx tsc --noEmit
(sem saída)
$ echo $?
0
```
Limpo.

### 4.2 `bun test tests/unit`

```
$ bun test tests/unit
bun test v1.4.2 (744846f84)

 257 pass
 0 fail
 2151 expect() calls
Ran 257 tests across 22 files. [124.00ms]
```
**257 testes, 0 falhas, 2151 `expect()`.** Contra os 137/1824 do baseline da seção 1: 22 arquivos de teste (vs. 15 no baseline) — T-02…T-27 adicionaram `steps.test.ts`, `validate-v2.test.ts`, `curriculum-tree.test.ts`, `chapter-review.test.ts`, `session-logic.test.ts`, `trail-completion.test.ts`, `trail.test.ts` e outros, conforme `25` §21 previa.

### 4.3 `bunx playwright test` (suíte completa, incluindo o projeto `narrow`)

```
$ bunx playwright test
Running 33 tests using 3 workers
...
  33 passed (56.3s)
```
**33 testes, 33 passaram, 0 falhas.** Inclui os 2 specs novos no projeto `narrow` (320×700): `trail-home.spec.ts` (2 testes) e `lesson-v2.spec.ts` (1 teste) rodando duas vezes cada (uma no projeto `chromium` 390×844, outra no `narrow`) — por isso 33 e não simplesmente "25 do baseline + 8 novos specs"; alguns specs rodam nos dois projetos.

### 4.4 `bun run build`

```
$ bun run build
...
✓ 2147 modules transformed. (client) ... built in <1s
✓ 324 modules transformed. (ssr) ... built em <1s
[nitro] ✔ Generated public dist / .netlify/functions-internal/nitro.json
```
Build completo nos três ambientes (client/ssr/nitro), exit code 0. Mesmos avisos preexistentes não-bloqueantes do baseline (`inputValidator()` deprecated em `tutor.ts:15`, chunk `trilhas-*.js`/`@tanstack/react-router` acima de 500 kB minificado — este último cresceu com o conteúdo novo, mas é o mesmo tipo de aviso informativo, não erro).

### 4.5 `bunx eslint` nos arquivos tocados pelo plano inteiro

Rodado contra `src/lib/learning/`, `src/components/learning/`, `src/content/curriculum-tree.ts`, `src/content/microlicoes/`, `src/hooks/useLearningSession.ts`, `src/routes/trilha.tsx`, `src/routes/learn.$lessonId.tsx`:

```
✖ 259 problems (259 errors, 0 warnings)
  259 errors and 0 warnings potentially fixable with the `--fix` option.
```

**Confirmado por grep no output: as 259 ocorrências são todas `prettier/prettier`** — sem nenhuma regra de correção (`no-unused-vars`, `react-hooks/*`, `no-undef` etc.) entre elas. A maioria é `Delete `␍`` (quebra de linha CRLF, ruído do Windows já documentado desde `docs/22` §2 — "ruído CRLF do ESLint é conhecido"); o resto é preferência de quebra de linha do Prettier em JSX/import com várias props (ex. `trilha.tsx` linhas 12/132/135). Nenhum erro de lógica, tipo ou hook encontrado nos arquivos do plano inteiro.

### 4.6 Dark mode — hex literal fora de `styles.css`

```
$ grep -rEn "#[0-9a-fA-F]{3,6}" src/lib/learning src/components/learning \
    src/content/curriculum-tree.ts src/content/microlicoes \
    src/hooks/useLearningSession.ts src/routes/trilha.tsx "src/routes/learn.\$lessonId.tsx"
(nenhum resultado)
```
**Nenhuma ocorrência.** Todo os arquivos do plano usam classes utilitárias (`bg-mar`, `text-abismo` etc.) ou `var(--color-*)`, nunca hex literal — consistente com a regra do `CLAUDE.md` sobre Tailwind v4 não propagar hex literal pro `.dark`.

### 4.7 320 px — as asserções do projeto `narrow` não são triviais

Reli os dois specs que o projeto `narrow` roda:
- `tests/e2e/trail-home.spec.ts` linha 63: `await expect(cta).toBeInViewport()` — sobre o link "Continuar" (`href="/learn/porcentagem-valor"`) do card de continuar, depois de já ter confirmado por `getByRole` que é o único elemento com esse nome exato (não o nó da trilha, cujo `aria-label` contém "Continuar" mas não é esse role/nome exato).
- `tests/e2e/lesson-v2.spec.ts` linha 23: `await expect(page.getByRole("button", { name: "Começar" })).toBeInViewport()` — o botão que inicia a lição, antes de clicar nele.

Ambas checam que o CTA principal realmente aparece dentro da viewport de 320×700 sem precisar rolar — não são apenas `toBeVisible()` (que passaria mesmo com o elemento cortado por overflow); `toBeInViewport()` do Playwright falha se o elemento estiver fora da área visível. Confirma G12 (`25` §20): "Mobile: 320–440 px sem scroll horizontal... alvos ≥ 44 px" no que toca ao CTA principal.

### 4.8 `prefers-reduced-motion`

```
$ grep -n "prefers-reduced-motion" -A 8 src/styles.css
508:@media (prefers-reduced-motion: reduce) {
509-  *,
510-  *::before,
511-  *::after {
512-    animation-duration: 0.01ms !important;
513-    animation-iteration-count: 1 !important;
514-    transition-duration: 0.01ms !important;
515-  }
516-}
```
O bloco global (Fase 8 do `20`, já validado em `docs/19`) usa seletor universal (`*, *::before, *::after`) — cobre `anim-pop-in` (usado por `LessonNode.tsx` com `highlightDelayMs` do T-24, `AppShell.tsx`, `FocaMark.tsx`, `CelebracaoAula.tsx`) sem precisar de guarda por componente. `LessonNode.tsx` linhas 40-42 documenta isso explicitamente no próprio código: "sem necessidade de guard de `prefers-reduced-motion` aqui — o bloco global em `styles.css` já zera `animation-duration`, então um atraso sozinho não produz movimento perceptível." Reconfirmado, não é alegação sem checagem.

### 4.9 Performance de `buildTrail`

Medido com um script descartável (`performance.now()`, 5 iterações de aquecimento + 200 medidas, apagado depois — nenhum `console.time`/`console.log` de debug ficou no código versionado) contra dois estados sintéticos via o mesmo padrão de fixture de `tests/unit/trail.test.ts`:

| Estado | Média | Mediana | Máximo (200 amostras) |
|---|---|---|---|
| Vazio (nenhuma lição concluída) | 0.225 ms | 0.149 ms | 2.851 ms |
| Tudo concluído (todas as `ALL_PHASES` + todas as `allLessonsInOrder()`, ~134 lições legadas + 6 micro) | 0.171 ms | 0.140 ms | 1.618 ms |

Ambos bem abaixo da meta informal de < 5 ms do `25` §17 mesmo no pior caso de 200 amostras (o máximo de 2.851 ms na primeira medida do estado vazio parece ruído de JIT/GC da própria máquina, não do código — a mediana e a média de ambos os estados ficam consistentemente abaixo de 0.25 ms). Medido em Bun (não no navegador real) — não é uma medição de frame budget do Chromium, mas prova que a função em si não é o gargalo.

## 5. O que este ambiente NÃO conseguiu validar

Mesmas categorias de limitação que `docs/22` §3 já registrava para o plano `20` — estendidas aqui pro conteúdo e pras telas novas do `25`. Repetir isso não é desleixo: é a mesma ressalva, porque nada mudou no ambiente de teste disponível entre uma execução e outra.

- **Nenhum teste em dispositivo físico.** Toda a verificação de layout 320–440 px, dark mode e dos dois projetos Playwright (`chromium`/`narrow`) rodou em Chromium desktop headless — real, mas não prova iOS Safari/Android real.
- **Nenhuma revisão pedagógica externa dos 12 exercícios novos (`pratica-3`/`desafio` × 6 lições) nem das 6 dicas novas de vestibular (T-13, `25` §24 "Decisões pendentes").** O que existe é: (a) validação estrutural automatizada (`validate-v2.test.ts` — gabarito distribuído, explicação com tamanho mínimo, dificuldade não-decrescente) e (b) a releitura de matemática/gramática/biologia que eu mesmo fiz nesta sessão ao auditar o conteúdo (que encontrou e corrigiu o overclaim de §3.2). Isso é revisão própria na autoria, não validação por um professor da área — a mesma ressalva que `docs/21` já registrava para o conteúdo da Fase 3 do `20`.
- **Nenhuma observação de participante real** percorrendo a nova `/trilha` como home, entendendo a hierarquia matéria → seção → capítulo → lição sem explicação prévia, ou reagindo à folha de "Capítulo concluído" pela primeira vez.
- **Nenhuma medição de tempo real de leitura/resposta** nos passos de ensino intercalados — o limite de ≤ 220 palavras de ensino por lição (`25` §18 T-13) é uma meta de design validada por contagem de palavras no teste unitário, não por cronômetro em pessoa lendo.
- **Zoom 200% e leitor de tela real (NVDA/VoiceOver) não testados manualmente** nas telas novas (`trail.tsx`, `learn.$lessonId.tsx`, `ChapterCompleteSheet`) — os componentes seguem o mesmo contrato de acessibilidade da Fase 1 do `20` (rótulo textual de estado nos nós, `aria-current` na nav, `aria-pressed` nos chips), mas isso é revisão de código e teste automatizado (`nav.spec.ts` confere `aria-current`), não teste assistido real.
- **`prerequisiteChapterIds` sem conteúdo publicado que o exercite** — ver §3.4. A lógica está implementada e testada contra fixture sintética, não contra um capítulo real bloqueado por outro.
- **Performance de `buildTrail` medida em Bun, não no navegador real** (§4.9) — prova que a função não é cara, não mede frame budget real de um celular físico renderizando a árvore inteira.
- **`bunx eslint` rodado só no subconjunto de arquivos do plano `25`**, não no repositório inteiro — não é uma alegação de que o repo inteiro está livre de ruído CRLF, só que essa fatia está.

## 6. Critérios de aceite globais (docs/25 §20) — status

| ID | Critério | Status | Evidência |
|---|---|---|---|
| G1 | `/trilha` primeira tela pós-onboarding, responde "onde estudo/progresso/próximo passo" acima da dobra em 390×844 | ✅ | `tests/e2e/trail-home.spec.ts` ("header com meta, card de continuar...") |
| G2 | Um único `btn-primary` no viewport da trilha ("Continuar") | ✅ | Mesmo spec, `getByRole("link", { name: "Continuar", exact: true })` |
| G3 | Seções e capítulos visíveis; capítulo colapsa; nó tem rótulo textual de estado | ✅ | `tests/e2e/trilha.spec.ts` |
| G4 | Cada lição v2 tem 4–8 questões intercaladas com ≥ 2 passos de ensino e dificuldade não decrescente | ✅ | `tests/unit/validate-v2.test.ts`, `tests/unit/microlicoes.test.ts` |
| G5 | Os 7 formatos funcionam no player novo com ordem apresentada persistida | ✅ | `tests/unit/session-logic.test.ts` + E2E A8 (`microlicoes.spec.ts`) |
| G6 | Errar não abre o tutor; CTA abre; só o envio chama a API | ✅ | `tests/e2e/lesson-v2.spec.ts` (zero requisições `_serverFn` até envio explícito) + `tutor.spec.ts` |
| G7 | Retomada após reload/saída mantém passo, resposta, frase e ordem; XP não duplica | ✅ | `tests/e2e/microlicoes.spec.ts` A8, `tests/unit/rewards.test.ts` |
| G8 | Conclusão mostra estrelas/XP/"Você aprendeu"; capítulo fechado gera folha uma vez e som `capitulo-desbloqueado` | ✅ | `tests/e2e/chapter-complete.spec.ts`, `tests/unit/trail-completion.test.ts` — ver §3.3 sobre o gap de wiring já corrigido |
| G9 | Conteúdo legado: 134 lições na trilha, tocáveis, progresso preservado | ✅ | `tests/e2e/trilha.spec.ts` |
| G10 | Migração v4→v5 preserva XP/conclusões; sessão antiga descartada sem erro | ✅ | `tests/unit/state-migrations.test.ts` + `tests/e2e/state-migration.spec.ts` |
| G11 | Nav com 4 itens; `/dashboard` redireciona; rollback por flag | ✅ | `tests/e2e/nav.spec.ts`, `tests/e2e/trilha.spec.ts` ("/dashboard redireciona pra /trilha") |
| G12 | Mobile 320–440 px sem scroll horizontal, alvos ≥ 44 px, safe-area, dark mode sem hex literal novo | ✅ (parcial — ver §5) | Projeto `narrow` (§4.7) + grep de hex literal (§4.6); zoom/leitor de tela real não testados |
| G13 | `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build` verdes | ✅ | §4.1–§4.4 desta rodada |

Nenhum critério marcado ✅ sem o comando/arquivo de teste que sustenta a marca, mesma regra que `docs/22` §4 seguiu.

## 7. Rollback

`FEATURES.trilhaComoHome = false` (`src/lib/features.ts`) reverte a home pra `/dashboard` (o componente antigo continua no código, só deixa de ser alvo do redirect) e a nav pra `NAV_ITEMS_V1` (5 itens, `AppShell.tsx`). A migração de schema v4→v5 é aditiva e de mão única — como já valia para v3→v4 (`docs/20` §15.3) — então desligar a flag não desfaz a migração nem apaga `completedLessons`/XP; só esconde a entrada nova. `/study`, `/redacao` e `/flashcards` continuam funcionando exatamente como antes, independente da flag.

## 8. O que fica pra depois — não fabricado aqui

- Revisão pedagógica externa do conteúdo v2 (12 exercícios + 6 dicas novas) e das 6 lições convertidas — mesma lacuna que `docs/22` §6 já registrava para o conteúdo original.
- Ampliar o conteúdo v2 além das 6 lições piloto (`25` só pediu a conversão destas 6; as outras microlições, se vierem a existir, seguem o mesmo processo).
- Testar `prerequisiteChapterIds` com conteúdo publicado real, quando/se algum capítulo vier a precisar de pré-requisito cruzado (§3.4).
- Teste de dispositivo físico, leitor de tela real, zoom 200%, observação de participante real — mesma lista do `docs/22` §3, agora valendo também pras telas novas do `25`.
- Diagnóstico real de conhecimento, revisão espaçada com UI própria, simulado completo, backend — inalterado desde `docs/22` §6, o `25` não tocou nenhum destes.
