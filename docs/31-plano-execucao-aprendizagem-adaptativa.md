# 31 — Aprendizagem adaptativa: plano de execução por fases

**Status:** escrito em 23/09/2026, **aprovado junto com o [30](30-plano-aprendizagem-adaptativa.md) em 23/09/2026** — em execução, começando pela Fase 0.
**Norma:** o `30` (o quê e por quê). Este `31` é o como: 16 fases, 120 tarefas, cada fase com Context Pack e prompt de executor.
**Registro de execução:** `docs/32-registro-execucao-aprendizagem-adaptativa.md` — criado na tarefa F0.1 e atualizado ao fim de cada fase.

---

## 1. Como usar este documento (para a IA executora)

1. Você recebe **uma fase**. Leia o **Context Pack** dela primeiro. Ele lista o que ler do `30`, os arquivos reais, os contratos e o que não pode mudar. Não leia o repositório inteiro.
2. Confira no `32` se as fases de que a sua depende estão marcadas como concluídas. Se não estiverem, pare e diga isso.
3. Execute as tarefas **na ordem numerada** (`F<fase>.<n>`). Ao fim de cada tarefa o projeto compila (`bunx tsc --noEmit`) e `bun test tests/unit` está verde. Se a tarefa toca UI, `bunx playwright test` também.
4. Não tome decisão de arquitetura. Se o código divergir do que o Context Pack descreve, registre no `32` ("Divergências") e siga a intenção do `30`.
5. Carregue só as skills indicadas na tarefa (`ai/SKILL-ROUTING.md`). No máximo 3 primárias + 1 revisão.
6. Sem commit, push ou PR sem pedido do usuário. Nunca reescrever histórico publicado (Lovable).
7. Ao terminar a fase: rode os 4 comandos (`bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`), cole a saída real (números) no `32`, marque cada critério de aceite com evidência, rode o agente `spec-verifier` com o caminho deste arquivo e os IDs da fase.

### 1.1 Convenções

- **ID de tarefa:** `F<fase>.<n>`. Critérios de aceite da fase: `AC-<fase>.<n>`. Critérios globais: `G1…G16` (§20).
- **Modelo recomendado** por tarefa: `HAIKU` (barato: classificação, geração em lote, transformação mecânica), `SONNET` (implementação comum), `FORTE` (algoritmo, julgamento pedagógico, bug arquitetural). É recomendação, não regra. Via OmniRoute ou subagente do Claude Code (`model: haiku | sonnet | opus`).
- **Tipo de fase:** `BLOQUEANTE` (outras dependem dela), `PARALELIZÁVEL` (pode rodar ao mesmo tempo que outra, sem editar os mesmos arquivos), `OPCIONAL`, `FUTURA`.
- **Arquivo novo** aparece como **NOVO**. Qualquer outro caminho já existe no repo (conferido em 23/09/2026).
- Todo texto que o aluno lê: `src/lib/copy.ts` (funcional) ou `src/lib/voz.ts` (fala da Foca) + linha no inventário `docs/21`, voz do `20` §7.1, passada final do Humanizer (`humanizer:humanizer`) com amostra = copy aprovada do `21` §2. O Humanizer nunca mexe em conteúdo pedagógico factual.

---

## 2. Dependências entre fases

```text
F0 ──┬──────────────────────────────► F1  áudio/háptico (PARALELIZÁVEL, independente do resto)
     ├──► F2 ──┬──► F3 ──┬──► F5 ──► F6 ──┬──► F7  (PARALELIZÁVEL com F8)
     │         │         │                └──► F8 ──► F12 ──┬──► F13 (PARALELIZÁVEL com F14)
     │         └──► F4 ──┘                                   └──► F14
     │               F3 ──► F9 ──► F11 (Ondas 0–1) ─── libera as flags de F12/F13/F14
     └──► F10 (dados oficiais Inep + questões oficiais do ENEM, aprovado)
todas ──► F15
```

| Fase | Nome | Tipo | Depende de | Pode rodar junto com |
|---|---|---|---|---|
| F0 | Linha de base e registro | BLOQUEANTE | — | — |
| F1 | Áudio e háptico | PARALELIZÁVEL | F0 | F2–F14 (arquivos disjuntos) |
| F2 | Taxonomia | BLOQUEANTE | F0 | F1 |
| F3 | Catálogo de itens | BLOQUEANTE | F2 | F4 (arquivos disjuntos), F1 |
| F4 | Schema v6 e migração | BLOQUEANTE | F2 | F3, F1 |
| F5 | Mastery e Confidence | BLOQUEANTE | F3, F4 | F9, F1 |
| F6 | Sinais e "Não sei" | BLOQUEANTE | F5 | F9, F1 |
| F7 | Camadas e Foca IA | PARALELIZÁVEL | F6 | F8, F9 |
| F8 | Motor adaptativo | BLOQUEANTE | F5, F6 | F7, F9 |
| F9 | Pipeline de conteúdo | PARALELIZÁVEL | F2, F3 | F4–F8 |
| F10 | Fontes oficiais e questões do ENEM | PARALELIZÁVEL | F3 | qualquer |
| F11 | Conteúdo Ondas 0–1 | BLOQUEANTE (para ligar flags) | F9 | F12–F14 (código) |
| F12 | Jornada e foco | BLOQUEANTE | F8; flag liga só após F11 | F7 |
| F13 | Onboarding e nivelamento | PARALELIZÁVEL | F5, F8, F11 | F14 |
| F14 | Checkpoints | PARALELIZÁVEL | F8, F12 | F13 |
| F15 | Rollout e registro | BLOQUEANTE (final) | todas | — |

Regra de paralelismo (`ai/SDD-WORKFLOW.md` §7): dois executores nunca editam o mesmo arquivo ao mesmo tempo. Arquivos "quentes" que várias fases tocam — `src/lib/store.ts`, `src/lib/learning/types.ts`, `src/lib/state-migrations.ts`, `src/lib/copy.ts`, `src/lib/features.ts` — só por uma fase de cada vez; a fase que os edita está marcada em cada Context Pack.

---

## 3. Recomendação de modelo por fase

| Fase | HAIKU / barato | SONNET | FORTE |
|---|---|---|---|
| F0 | — | tudo | — |
| F1 | — | F1.1, F1.2, F1.4–F1.10 | F1.3 análise dos dados de aparelho, se H1–H4 não explicarem |
| F2 | rascunho das listas de habilidades (F2.4) | F2.1–F2.3, F2.6, F2.7 | F2.5 revisão do grafo de pré-requisitos |
| F3 | classificação de 1.204 + 59 itens (F3.4, F3.5) | F3.1–F3.3, F3.6–F3.8 | — |
| F4 | — | tudo | — |
| F5 | — | F5.1, F5.3–F5.7 | F5.2 e F5.8 (modelo e cenários) |
| F6 | — | tudo | — |
| F7 | — | tudo | revisão do prompt (F7.4) |
| F8 | — | F8.1, F8.3, F8.6–F8.9 | F8.2, F8.4, F8.5, F8.10 |
| F9 | prompts de classificação (rascunho) | tudo | desenho dos prompts de crítico/escalonamento (F9.3) |
| F10 | extração de CSV (F10.2) | F10.1, F10.3, F10.4 | — |
| F11 | geração, crítica, solução, humanização | escalonamento | conflitos persistentes, aulas difíceis |
| F12 | — | tudo | — |
| F13 | — | F13.1, F13.2, F13.4–F13.8 | F13.3 (CAT/EAP) |
| F14 | — | tudo | — |
| F15 | — | tudo | revisão final de segurança (se L3) |

---

## 4. Fase 0 — Linha de base, registro e decisões

**Tipo:** BLOQUEANTE · **Depende de:** aprovação do `30`/`31` · **Modelo:** SONNET · **Skills:** nenhuma primária; revisão: `superpowers:verification-before-completion`

### Objetivo
Registrar o estado verde de partida, abrir o registro de execução `32`, corrigir dois detalhes de higiene e deixar escritas as decisões que dependem do usuário.

### Motivação
Toda fase seguinte compara contra esta linha de base. Sem ela não dá para provar que nada quebrou.

### Dependências
Plano aprovado pelo usuário (data registrada no topo do `30` e do `31`).

### Estado atual
290 testes unitários verdes (rodado em 23/09/2026); `29` registra 55 E2E verdes. `.vercel/` não está no `.gitignore`. O `CLAUDE.md` ainda diz que o `/quiz` tem "3 questões de conteúdo real" (hoje não tem nenhuma).

### Alterações necessárias
Criar `docs/32`, rodar os 4 comandos, higiene de `.gitignore`, correção factual do `CLAUDE.md`, registrar decisões abertas.

### Arquivos afetados
`.gitignore`, `CLAUDE.md`, `docs/00-README.md`.

### Novos arquivos
**NOVO** `docs/32-registro-execucao-aprendizagem-adaptativa.md`.

### Dados / Backend / Frontend / Algoritmo
Não se aplica — fase de registro.

### Edge cases
Algum teste já vermelho na linha de base: registrar no `32` com a saída, **não corrigir aqui**, e avisar o usuário antes de seguir.

### Performance / Segurança
Não se aplica.

### Tarefas

**F0.1 — Abrir o registro de execução** · SONNET
- Arquivos: **NOVO** `docs/32-registro-execucao-aprendizagem-adaptativa.md`.
- Faz: cabeçalho (data, plano `30`/`31`), seções "Linha de base", "Por fase" (uma subseção por F0–F15, vazia), "Divergências", "Decisões do usuário", "Critérios globais G1–G16" (tabela vazia).
- Critério: arquivo existe com as seções.
- Verificação: `grep -n "^## " docs/32-registro-execucao-aprendizagem-adaptativa.md`.

**F0.2 — Linha de base** · SONNET
- Faz: rodar `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`; copiar os números reais para "Linha de base" do `32` (passaram/falharam, tamanho dos chunks `trilhas-*` e `index-*`).
- Critério: os 4 resultados registrados com números.

**F0.3 — Higiene do `.gitignore`** · SONNET
- Arquivos: `.gitignore`.
- Faz: acrescentar `.vercel/` (saída local do preset Vercel) e, desde já, `content-pipeline/lotes/` e `public/content/` (gerados nas Fases 3 e 9).
- Critério: `VERCEL=1 bun run build` não deixa arquivo não rastreado (`git status --short` sem `.vercel`). Apagar `.vercel/` depois.

**F0.4 — Correção factual do `CLAUDE.md`** · SONNET
- Arquivos: `CLAUDE.md` (seção "Fechado na Development 1").
- Faz: trocar "com 3 questões de conteúdo real" por nota de que o `/quiz` atual coleta só perfil (desde o `20`) e que o nivelamento de conteúdo é a Fase 13 do `31`. Acrescentar no topo o bloco "Plano proposto — Aprendizagem adaptativa (`30`/`31`), status" apontando para o `32`.
- Critério: nenhuma afirmação do `CLAUDE.md` contradiz `quiz.tsx:33-46`.

**F0.5 — Decisões abertas** · SONNET
- Arquivos: `docs/32` ("Decisões do usuário"), `docs/00-README.md`.
- Faz: registrar as 3 decisões do `30` §32 (texto de questão oficial; iPhone no silencioso; aprovação) com status "pendente" ou a resposta do usuário, com data. Atualizar o topo do `00-README` (plano vigente = `30`/`31`, status).
- Critério: decisões visíveis no `32` e no índice.

### Testes
Os 4 comandos da linha de base.

### Critérios de aceite
- **AC-0.1** `32` existe com linha de base numérica dos 4 comandos.
- **AC-0.2** `.gitignore` cobre `.vercel/`, `content-pipeline/lotes/`, `public/content/`.
- **AC-0.3** `CLAUDE.md` sem a afirmação falsa sobre o quiz; aponta para `30`/`31`/`32`.
- **AC-0.4** Decisões do usuário registradas com status.

### Definition of Done
AC-0.1…0.4 com evidência no `32`; nenhum arquivo de código alterado.

### Instruções para a IA executora
Não conserte teste quebrado aqui. Não mexa em `src/`. Se a linha de base não estiver verde, pare e reporte.

### Context Pack
- Objetivo: linha de base + registro. Arquivos: `.gitignore`, `CLAUDE.md`, `docs/00-README.md`, **NOVO** `docs/32`.
- Ler do `30`: §2.1 (tecnologias), §32 (decisões).
- Não pode mudar: qualquer coisa em `src/`, `tests/`.
- Comandos: `bunx tsc --noEmit` · `bun test tests/unit` · `bunx playwright test` · `bun run build`.

### Prompt para o executor
> Você vai executar a Fase 0 do SDD do Foca, descrita em `docs/31-plano-execucao-aprendizagem-adaptativa.md` §4. Leia só essa seção e o `docs/30-plano-aprendizagem-adaptativa.md` §2.1 e §32. Objetivo: abrir `docs/32-registro-execucao-aprendizagem-adaptativa.md`, rodar a linha de base (`bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`) e registrar os números reais, acrescentar `.vercel/`, `content-pipeline/lotes/` e `public/content/` ao `.gitignore`, corrigir a frase do `CLAUDE.md` sobre "3 questões de conteúdo real" no quiz e registrar as decisões abertas do `30` §32. Não altere nada em `src/` nem `tests/`. Se algo da linha de base falhar, pare e me mostre a saída. Critérios: AC-0.1 a AC-0.4. Sem commit.

---

## 5. Fase 1 — Áudio e háptico

**Tipo:** PARALELIZÁVEL (pode começar logo depois da F0) · **Depende de:** F0 · **Modelo:** SONNET; FORTE só se os dados de aparelho não baterem com H1–H4 · **Skills:** `superpowers:systematic-debugging`, `superpowers:test-driven-development`; revisão `agent-skills:code-review-and-quality`

### Objetivo
Som de feedback funcionando na versão publicada (Chrome Android e Safari iOS), com diagnóstico que mostra por que um som não tocou; háptico que detecta suporte e não promete o que o aparelho não faz.

### Motivação
Relato do usuário: sons não funcionam na versão publicada; vibração não funciona. O motor de áudio já é centralizado e bem testado em dev, então o problema está em condições que os testes não cobrem (rede real, ativação por toque, iOS).

### Dependências
F0. Acesso a um celular Android e um iPhone (usuário) para F1.3 e F1.10. Deployment Protection do Vercel desligada ou link de bypass (pendência do `29` §7).

### Estado atual
Ver `30` §2.8 e §20.1. `src/lib/audio/engine.ts`: `context()` cria o `AudioContext`; `unlockAudioFromGesture()` (linha 79) retoma e pré-carrega os 12 WAVs; `play()` descarta se `Date.now() − requestedAt ≥ expiresMs` em qualquer ponto (inclui `resume`, `fetch`, `decodeAudioData`, fila); `playFeedbackSound` usa 300 ms (linhas 127-128). `__root.tsx:154-163` chama o unlock em `pointerdown`/`keydown` (captura). `src/lib/haptics.ts`: `vibrar()` com `navigator.vibrate`. Build Vercel inclui os WAVs (verificado).

### Alterações necessárias
Instrumentar → reproduzir em aparelho → corrigir desbloqueio, pré-carga, prazo e estado `interrupted` → cache → háptico com detecção.

### Arquivos afetados
`src/lib/audio/engine.ts`, `src/lib/audio/identity.ts` (só ordem de prioridade de pré-carga), `src/routes/__root.tsx`, `src/lib/haptics.ts`, `src/lib/feedback/dispatch-feedback.ts` (só se a assinatura de `vibrar` mudar), `src/routes/profile.tsx`, `vercel.json`, `src/lib/copy.ts` (bloco `perfil`), `docs/21`, `tests/e2e/audio-assets.spec.ts`, `tests/e2e/audio.spec.ts`, `tests/unit/audio.test.ts`.

### Novos arquivos
**NOVO** `tests/unit/audio-diagnostics.test.ts`, **NOVO** `tests/unit/haptics.test.ts`, **NOVO** `tests/e2e/audio-slow-network.spec.ts`.

### Dados
Nenhum campo novo no store (a preferência `prefs.haptics` já existe). Diagnóstico de áudio fica em memória.

### Backend
`vercel.json`: bloco `headers` com `Cache-Control: public, max-age=31536000, immutable` para `/sfx/v2/(.*)`.

### Frontend
Perfil: toggle de háptico desabilitado com explicação quando `hapticsSupport() === "none"`; nota sobre iPhone e chave de silencioso (se a decisão do usuário for "respeitar").

### Algoritmo

```text
// Motivos de descarte (engine.ts)
type DropReason = "disabled" | "hidden" | "no-context" | "expired-before-start" | "expired-resume"
                | "expired-loading" | "expired-queue" | "not-running" | "fetch-failed" | "decode-failed" | "stale-generation"

diagnostics = { contextState, createdAt, firstRunningAt, buffers: {evento: "loading"|"ready"|"failed"},
                lastDrops: DropReason[] (anel de 20), timings: {resumeMs, fetchMs: {evento}, decodeMs: {evento}},
                playedCount, firstSoundPlayedAt }

// Desbloqueio
__root: pointerdown → unlockAudioFromGesture({ warmOnly: true })   // cria contexto e pré-aquece
        pointerup | touchend | click | keydown → unlockAudioFromGesture({ resume: true })  // resume() DENTRO do handler

// Pré-carga priorizada
PRELOAD_ORDER = ["resposta-correta", "resposta-incorreta", "conclusao-licao", ...resto]
load sequencial para os 2 primeiros (garante que cheguem primeiro), paralelo para o resto

// Prazo em duas fases
se diagnostics.playedCount == 0 (primeiro som depois do desbloqueio):
     orçamento de preparação (resume + load) = FIRST_SOUND_BUDGET_MS (inicial 900, ajustar com dados)
     fila continua limitada a 300 ms
senão: 300 ms total como hoje
// Estado interrompido (iOS)
se ctx.state ∈ {"interrupted","suspended"} → tenta resume() no próximo gesto; registra "not-running"
```

### Edge cases
- Aba em segundo plano no meio do carregamento: continua descartando (`hidden`).
- Som desligado nas preferências: `disabled`, sem pré-carga.
- Rede cai depois da pré-carga: buffers em cache tocam; os que falharam tentam de novo no próximo gesto (comportamento existente).
- iPhone no silencioso: comportamento conforme decisão do usuário (F0.5); nunca erro.
- `navigator.vibrate` existe mas o sistema está sem vibração: nada a fazer, nada a prometer.
- Navegador sem `navigator.userActivation`: tratar como ativo.

### Performance
Pré-carga sequencial dos 2 primeiros sons: 2 requisições de ~35 KB e ~22 KB antes das demais. Cache imutável elimina revalidação nas visitas seguintes.

### Segurança
Nível L1. Sem dependência nova.

### Tarefas

**F1.1 — Diagnóstico no motor de áudio** · SONNET · TDD
- Arquivos: `src/lib/audio/engine.ts`, **NOVO** `tests/unit/audio-diagnostics.test.ts`.
- Faz: `export function getAudioDiagnostics(): AudioDiagnostics` com os campos do algoritmo; cada `return` antecipado em `play()` registra o `DropReason`; medir `resumeMs`, `fetchMs`, `decodeMs` com `performance.now()`. Sem mudar comportamento ainda.
- Critério: teste com `AudioContext` falso cobre cada motivo de descarte; testes existentes de áudio continuam verdes.
- Verificação: `bun test tests/unit/audio-diagnostics.test.ts tests/unit/audio.test.ts`.

**F1.2 — Leitura do diagnóstico em aparelho** · SONNET
- Arquivos: `src/routes/__root.tsx` (ou um componente pequeno montado lá).
- Faz: com `?debug=1` na URL, um botão flutuante discreto "Áudio" mostra `getAudioDiagnostics()` em JSON e um botão "Tocar teste" (`playFeedbackSound("resposta-correta")`). Sem `?debug=1`, nada renderiza. (Na F8 isso migra para `/debug`.)
- Critério: E2E abre `/study?debug=1`, clica "Áudio", vê `contextState`.
- Verificação: `bunx playwright test tests/e2e/audio.spec.ts`.

**F1.3 — Reprodução em aparelho real** · FORTE para análise · depende do usuário
- Faz: com o usuário, abrir a URL de produção (commit conferido) com `?debug=1` em Chrome Android e Safari iOS; responder 3 questões; copiar o JSON do diagnóstico depois de cada uma; repetir com o iPhone no silencioso e com rede "3G lenta" (Android: modo desenvolvedor, ou só dados móveis). Registrar a matriz no `32` (aparelho × cenário × tocou? × motivo).
- Critério: matriz com ≥ 6 linhas preenchidas e hipótese confirmada/descartada para H1–H5 do `30` §20.1.
- Se nenhuma hipótese explicar: parar, escalar para modelo FORTE com a matriz, não "tentar coisas".

**F1.4 — Desbloqueio no gesto certo** · SONNET · TDD
- Arquivos: `src/routes/__root.tsx`, `src/lib/audio/engine.ts`.
- Faz: `unlockAudioFromGesture(opts)`; `pointerdown` só pré-aquece; `pointerup`, `touchend`, `click`, `keydown` chamam `resume()` de forma síncrona dentro do handler. Listeners em captura, `passive: true`, removidos no cleanup.
- Critério: teste unitário confirma que `resume()` é chamado no handler de `click`/`touchend`; diagnóstico mostra `firstRunningAt` depois do primeiro toque em aparelho.

**F1.5 — Pré-carga priorizada** · SONNET
- Arquivos: `src/lib/audio/identity.ts` (`PRELOAD_ORDER`), `engine.ts`.
- Faz: os dois sons de resposta carregam primeiro, em sequência; os outros em paralelo depois. Rotas de estudo (`/learn`, `/study`, `/redacao/$licaoId`, futura `/atividade`) chamam `preloadAnswerSounds()` ao montar (sem tocar nada).
- Critério: E2E conta a ordem das requisições `/sfx/v2/` e confirma os 2 primeiros.

**F1.6 — Prazo em duas fases** · SONNET · TDD
- Arquivos: `engine.ts`.
- Faz: constante `FIRST_SOUND_BUDGET_MS` (valor inicial 900; o valor final é o medido em F1.3, registrado no `32`). Regras do algoritmo. O teste existente "Queue would exceed 300ms" continua passando (fila segue limitada).
- Critério: E2E **NOVO** `audio-slow-network.spec.ts` (atrasa `/sfx/v2/*` em 500 ms com `page.route`) confirma que o primeiro som toca e que, depois dele, um som com fila > 300 ms é descartado.

**F1.7 — Estado interrompido** · SONNET
- Arquivos: `engine.ts`.
- Faz: tratar `"interrupted"` como `"suspended"` (tentar `resume()` no próximo gesto); listener `statechange` atualiza o diagnóstico.
- Critério: teste com contexto falso em `"interrupted"`.

**F1.8 — Cache dos WAVs** · SONNET
- Arquivos: `vercel.json`.
- Faz: `headers` para `/sfx/v2/(.*)`. Não mexer em `installCommand`/`buildCommand`.
- Critério: `VERCEL=1 bun run build` e `.vercel/output/config.json` contém a regra; depois do deploy, `curl -sI <url>/sfx/v2/resposta-correta.wav` mostra o header (usuário ou executor com acesso).

**F1.9 — Háptico com detecção** · SONNET · TDD
- Arquivos: `src/lib/haptics.ts`, `src/routes/profile.tsx`, `src/lib/copy.ts`, `docs/21`, **NOVO** `tests/unit/haptics.test.ts`.
- Faz: `HapticsAdapter` (`web-vibrate` | `none`), `hapticsSupport()`, `vibrar()` mantém a assinatura (chamadores intactos). Perfil: se `none`, toggle desabilitado e texto `COPY.perfil.hapticoIndisponivel` = "Seu aparelho não vibra pelo navegador." (passar pelo Humanizer; registrar no `21`). Se a decisão da F0.5 for "respeitar silencioso": `COPY.perfil.somIphone` = "No iPhone, o som segue a chave de silencioso."
- Critério: teste sem `navigator.vibrate` → `none` e nenhuma exceção; com `vibrate` → chamado com o padrão certo; E2E do perfil sem erro de console.

**F1.10 — Checklist em aparelho** · depende do usuário
- Faz: repetir a matriz da F1.3 depois das correções. Registrar no `32`.
- Critério: Chrome Android e Safari iOS tocam o primeiro som de resposta (com o iPhone fora do silencioso) e o diagnóstico mostra 0 `expired-*` em 5 respostas seguidas com 4G.

### Testes
Unitários: diagnóstico (todos os motivos), desbloqueio, prazo, interrupted, háptico. E2E: `audio-assets.spec.ts` e `audio.spec.ts` existentes verdes + `audio-slow-network.spec.ts`. Manual: matriz F1.3/F1.10.

### Critérios de aceite
- **AC-1.1** Todo descarte de som registra um motivo visível com `?debug=1`.
- **AC-1.2** Matriz de aparelho antes/depois registrada no `32`.
- **AC-1.3** Primeiro som de resposta toca em Chrome Android e Safari iOS físicos (fora do silencioso).
- **AC-1.4** E2E com atraso de rede verde.
- **AC-1.5** Háptico: sem suporte → toggle desabilitado com explicação; nenhum erro de console.
- **AC-1.6** Suíte existente verde; `bun run build` ok.

### Definition of Done
AC-1.1…1.6 com evidência. Se AC-1.3 depender de aparelho que não está disponível, a fase fica "concluída com pendência de aparelho" no `32`, nunca "concluída".

### Instruções para a IA executora
Não reescreva o motor. Não troque os WAVs nem converta formato (a identidade sonora foi aprovada byte a byte, `24`). Não mude os prazos "no chute": o valor final do primeiro som vem da medição. Som nunca pode bloquear o estudo.

### Context Pack
- Objetivo: som em produção + háptico honesto.
- Ler do `30`: §2.8, §20. Do `24`: tudo (curto). Do `20`: §6.4 (contrato de áudio).
- Arquivos: `src/lib/audio/engine.ts`, `identity.ts`, `src/routes/__root.tsx`, `src/lib/haptics.ts`, `src/lib/feedback/dispatch-feedback.ts`, `src/routes/profile.tsx`, `vercel.json`, testes de áudio.
- Contratos que não mudam: `playFeedbackSound(event, requestedAt?)`, `playClosingSound(events, requestedAt?)`, `stopAllFeedbackSounds()`, `setAudioEnabled(v)`, `vibrar(padrao)`, eventos de `SOUND_ASSETS`, prioridade de fechamento.
- Não pode mudar: arquivos WAV; `prefs.sound`/`prefs.haptics`; comportamento de cancelar som ao navegar/ocultar aba.
- Arquivos quentes tocados: `copy.ts` (só bloco `perfil`).

### Prompt para o executor
> Você vai executar a Fase 1 do SDD do Foca (`docs/31-plano-execucao-aprendizagem-adaptativa.md` §5). Leia o Context Pack da fase, o `docs/30` §2.8 e §20, e o `docs/24`. Objetivo: fazer o som de feedback funcionar na versão publicada e tornar o háptico honesto sobre suporte, sem reescrever `src/lib/audio/engine.ts`. Siga as tarefas F1.1 a F1.10 na ordem, com TDD onde indicado. Comece instrumentando (motivos de descarte) e só corrija depois de ter a matriz de aparelho da F1.3 — peça ao usuário para abrir a URL de produção com `?debug=1` no Android e no iPhone. Não altere os WAVs, não adicione dependências, não mude contratos públicos do motor. Testes: `bun test tests/unit`, `bunx playwright test` (inclua o novo `audio-slow-network.spec.ts`), `bun run build`. Critérios: AC-1.1 a AC-1.6. Registre tudo no `docs/32`. Sem commit.

---

## 6. Fase 2 — Taxonomia de habilidades

**Tipo:** BLOQUEANTE · **Depende de:** F0 · **Modelo:** SONNET; HAIKU para rascunho de listas; FORTE para revisar o grafo · **Skills:** `superpowers:test-driven-development`; revisão `agent-skills:code-review-and-quality`

### Objetivo
Criar a taxonomia Área → Matéria → Tema → Habilidade com pré-requisitos, validada, com as ~60 habilidades da Onda 1 ativas e o resto planejado.

### Motivação
Mastery, Confidence, revisão, motor e pipeline precisam de uma unidade comum. Hoje existem só 8 `skillIds` soltos nas microlições.

### Dependências
F0.

### Estado atual
`src/data/subjects.ts`: 11 matérias, ~120 tópicos (id + nome). `skillIds` aparecem só em `src/content/microlicoes/*/` (6 valores: `mat:porcentagem-conceito`, `mat:porcentagem-valor`, `mat:porcentagem-fator-multiplicativo`, `por:crase-regra-basica`, `por:crase-casos-proibidos`, `bio:membrana-estrutura`, `bio:membrana-funcao`, `bio:organelas-funcao` — conferir com `grep -rn skillIds src/content/microlicoes`). `CurriculumChapter` (`src/content/curriculum-tree.ts`) não tem habilidades.

### Alterações necessárias
Tipos, mapa matéria→área, arquivos de habilidades por matéria, validação (DAG), ligação capítulo→habilidades.

### Arquivos afetados
`src/content/curriculum-tree.ts` (campo opcional `skillIds` nos capítulos), `src/lib/learning/validate.ts` (checar que `skillIds` de lição/capítulo existem na taxonomia).

### Novos arquivos
**NOVOS** `src/content/taxonomy/types.ts`, `areas.ts`, `index.ts`, `validate.ts`, `skills/mat.ts`, `skills/por.ts`, `skills/lit.ts`, `skills/red.ts`, `skills/fis.ts`, `skills/qui.ts`, `skills/bio.ts`, `skills/his.ts`, `skills/geo.ts`, `skills/fil.ts`, `skills/soc.ts`, `skills/ing.ts`; **NOVO** `tests/unit/taxonomy.test.ts`; **NOVO** `docs/33-taxonomia-habilidades.md` (tabela legível para revisão humana, gerada por script a partir dos arquivos TS — nunca editada à mão).

### Dados
Só dados estáticos de conteúdo. Contrato `SkillDef` do `30` §8.2.

### Backend / Frontend
Não se aplica.

### Algoritmo

```text
validateTaxonomy(skills):
  ids únicos; formato /^[a-z]{2,4}:[a-z0-9-]+$/; prefixo == subjectId
  subjectId ∈ SUBJECTS; topicId ∈ SUBJECTS[subjectId].topics
  area == SUBJECT_AREA[subjectId]
  todo pré-requisito existe; grafo sem ciclo (DFS com cores)
  habilidade "ativo" não pode ter pré-requisito "planejado" que seja core (senão ficaria bloqueada para sempre) → erro
topologicalOrder(subjectId): Kahn, desempate por posição do topicId em SUBJECTS e depois id
```

### Edge cases
Pré-requisito entre matérias (ex.: `fis:mru` depende de `mat:funcao-afim`) é permitido. Habilidade sem tema correspondente em `subjects.ts`: acrescentar o tópico em `subjects.ts` é permitido só com registro no `32` (IDs de tópico nunca mudam).

### Performance
Validação roda em teste e na carga de `taxonomy/index.ts` (centenas de itens, < 5 ms).

### Segurança
Não se aplica.

### Tarefas

**F2.1 — Tipos e áreas** · SONNET
- Arquivos: **NOVOS** `taxonomy/types.ts`, `taxonomy/areas.ts`.
- Faz: `SkillDef`, `EnemArea` (`30` §8.2), `SUBJECT_AREA` e `AREA_NAMES` ("Linguagens", "Matemática", "Ciências da Natureza", "Ciências Humanas", "Redação").
- Critério: `bunx tsc --noEmit`.

**F2.2 — Validação** · SONNET · TDD
- Arquivos: **NOVOS** `taxonomy/validate.ts`, `tests/unit/taxonomy.test.ts`.
- Faz: `validateTaxonomy`, `topologicalOrder` conforme o algoritmo. Testes com taxonomias pequenas: ciclo, pré-requisito inexistente, topicId inválido, prefixo errado, ordem topológica estável.
- Verificação: `bun test tests/unit/taxonomy.test.ts`.

**F2.3 — Habilidades existentes** · SONNET
- Arquivos: `taxonomy/skills/mat.ts`, `por.ts`, `bio.ts`, `taxonomy/index.ts`.
- Faz: registrar as habilidades já usadas nas microlições **com os mesmos ids**, `status: "ativo"`. `index.ts` exporta `SKILLS`, `SKILL_MAP`, `skillsOfSubject`, `activeSkills`, `topologicalOrder`, e chama `validateTaxonomy` (lança em erro, como `define.ts`).
- Critério: teste "toda `skillId` de `MICROLICOES` existe em `SKILL_MAP`".

**F2.4 — Rascunho das listas por matéria** · HAIKU (rascunho) → SONNET (revisão)
- Arquivos: `taxonomy/skills/*.ts`.
- Faz: para cada tópico de `subjects.ts`, 2–6 habilidades Foca (verbo + objeto, ex. "Calcular X% de um valor"), com `level`, `incidence` (1–3), `core`. Marcar como `ativo` ~60 no total (≈15 por área LC/MT/CN/CH, priorizando `incidence: 3` e fundamentos), o resto `planejado`. Português/Redação: derivar das 15 trilhas legadas (cada trilha ≈ 1 tema; cada lição ≈ 1 habilidade ou um grupo).
- Prompt HAIKU sugerido: "Para a matéria X e o tópico Y do ENEM, liste de 2 a 6 habilidades observáveis, cada uma com: id em kebab-case, nome curto (até 60 caracteres, começando por verbo), nível base/intermediario/avancado, incidência 1–3 no ENEM, se é fundamento (core). Responda só JSON no formato […]."
- Critério: `validateTaxonomy` sem erro; ≥ 55 e ≤ 70 habilidades `ativo`; cada área LC/MT/CN/CH com ≥ 12 ativas.

**F2.5 — Revisão do grafo de pré-requisitos** · FORTE
- Faz: revisar pré-requisitos (entre e dentro das matérias), `core` e `incidence`. Critério pedagógico: pré-requisito só quando sem ele o aluno não consegue resolver itens da habilidade. Registrar decisões difíceis no `32`.
- Critério: nenhuma habilidade ativa com profundidade de pré-requisitos > 5; nenhuma ativa bloqueada por planejada `core`.

**F2.6 — Capítulo → habilidades** · SONNET
- Arquivos: `src/content/curriculum-tree.ts`, `src/lib/learning/validate.ts`.
- Faz: `CurriculumChapter.skillIds?: string[]` preenchido nos 3 capítulos micro e nos 15 legados. `validateCurriculumTree` passa a checar que todo `skillId` existe na taxonomia.
- Critério: teste existente `curriculum-tree.test.ts` verde + caso novo de `skillId` inválido.

**F2.7 — Referência à Matriz do ENEM e doc legível** · SONNET
- Arquivos: `taxonomy/skills/*.ts` (campo `enemSkills`), **NOVO** `scripts/content/taxonomy-doc.ts`, **NOVO** `docs/33-taxonomia-habilidades.md`.
- Faz: preencher `enemSkills` ("MT:H16" etc.) para as habilidades ativas usando a Matriz de Referência do Inep (link no `20` §10); script gera a tabela do `33` a partir dos TS.
- Critério: `bun scripts/content/taxonomy-doc.ts` regenera o `33` sem diff quando nada mudou.

### Testes
`tests/unit/taxonomy.test.ts`, `curriculum-tree.test.ts`, `microlicoes.test.ts` (existentes) verdes.

### Critérios de aceite
- **AC-2.1** Taxonomia válida (sem ciclo, ids consistentes), carregada no bundle.
- **AC-2.2** 55–70 habilidades ativas; ≥ 12 por área LC/MT/CN/CH; as 8 habilidades existentes com o mesmo id.
- **AC-2.3** Capítulos declaram `skillIds` válidos.
- **AC-2.4** `docs/33` gerado por script e revisado pelo usuário (aprovação registrada no `32`).

### Definition of Done
AC-2.1…2.4; suíte verde.

### Instruções para a IA executora
Não renomeie ids de habilidade existentes nem ids de tópico. Não crie entidade "Competência". Habilidade com nome vago ("Entender funções") é reprovada: nome começa por verbo observável.

### Context Pack
- Objetivo: taxonomia validada.
- Ler do `30`: §8.1–8.3, §18.1.
- Arquivos: `src/data/subjects.ts` (ler), `src/content/curriculum-tree.ts`, `src/lib/learning/validate.ts`, `src/content/microlicoes/*` (ler `skillIds`).
- Contratos: `SkillDef`; formato de id `<subjectId>:<slug>`.
- Não pode mudar: ids de tópico em `subjects.ts`, ids de lição, ids de capítulo.
- Arquivos quentes: nenhum.

### Prompt para o executor
> Você vai executar a Fase 2 do SDD do Foca (`docs/31` §6). Leia o Context Pack da fase e o `docs/30` §8.1–8.3 e §18.1. Objetivo: criar `src/content/taxonomy/` com tipos, mapa matéria→área ENEM, habilidades por matéria (55–70 ativas, ≥12 por área LC/MT/CN/CH, o resto "planejado"), validação de grafo acíclico e ordem topológica, e ligar capítulos da árvore a habilidades. Mantenha exatamente os ids de habilidade já usados nas microlições. Use subagentes baratos só para o rascunho das listas (F2.4) e revise você mesmo. TDD em F2.2. Testes: `bun test tests/unit`, `bunx tsc --noEmit`. Critérios AC-2.1 a AC-2.4 (o 2.4 precisa de aprovação do usuário para a tabela gerada no `docs/33`). Registre no `docs/32`. Sem commit.

---

## 7. Fase 3 — Catálogo de itens e metadados

**Tipo:** BLOQUEANTE · **Depende de:** F2 · **Modelo:** SONNET; HAIKU para classificação em lote · **Skills:** `superpowers:test-driven-development`; revisão `agent-skills:code-review-and-quality`

### Objetivo
Todo item existente (≈ 1.300) ganha metadado (`ItemMeta`) sem editar os arquivos de conteúdo; existe um índice unificado de itens; existe a infraestrutura de pacotes JSON para conteúdo novo.

### Motivação
O motor precisa escolher itens por habilidade e dificuldade (P3, P4, P11). Conteúdo em escala não cabe no bundle (P12).

### Dependências
F2 (habilidades existem).

### Estado atual
`30` §2.2. `resolveExercise` em `src/content/microlicoes/index.ts`; ids em `src/content/exercise-ids.ts`; adaptador `questionToExercise` em `src/lib/learning/adapters.ts`. Chunk `trilhas-*` com 578 KB.

### Alterações necessárias
Tipos + schema zod; derivação de IRT; metadados laterais para as 3 fontes; índice; repositório de pacotes; script de build de pacotes.

### Arquivos afetados
`src/content/microlicoes/index.ts` (`resolveExercise` ganha 4ª fonte), `package.json` (scripts `predev`/`prebuild`), `src/lib/features.ts` (flag `pacotesConteudo`).

### Novos arquivos
**NOVOS** `src/content/items/types.ts`, `schema.ts` (zod), `irt.ts`, `meta/microlicoes.ts`, `meta/banco-geral.json`, `meta/trilhas.json`, `index.ts` (`ITEM_META`, `itemMetaOf(id)`, `itemIndex()`), `src/content/banco/` (pasta, vazia até a F11), `src/lib/content/repository.ts`, `scripts/content/build-packs.ts`, `scripts/content/classify-legacy.ts`; testes `tests/unit/item-meta.test.ts`, `tests/unit/content-repository.test.ts`, `tests/unit/build-packs.test.ts`.

### Dados
Metadado estático. `meta/trilhas.json` ≈ 1.204 entradas compactas `{ id, skillIds, difficulty }` (resto derivado por padrão) — mantido fora do chunk das trilhas (import dinâmico onde for usado pelo motor).

### Backend
Pacotes estáticos em `public/content/v1/` (gerados, gitignored).

### Frontend
Nenhuma mudança visível.

### Algoritmo

```text
irtFromDifficulty(d, exercise):
  b = {1: −1.6, 2: −0.8, 3: 0, 4: 0.8, 5: 1.6}[d] ; a = 1.0
  c = múltipla-escolha|lacuna|interpretação → 1/opcoes.length ; verdadeiro-falso → 0.5
      encontre-o-erro → min(0.1, 1/nPalavras) ; ordenar|parear → 0.05
itemMetaOf(id):
  ITEM_META[id] ?? default(id)    // default: skill da lição dona do item, dificuldade 2, papéis [pratica, revisao],
                                  // validation "verificada-ia"? NÃO: conteúdo legado autoral → "revisada-humano"
                                  // (já foi publicado e revisado na autoria, `26`), source.kind "autoral"
itemIndex(): IndexEntry[] = [{ id, skill: skillIds[0], skills, difficulty, b, roles, status, subjectId }]
             construído de: microlições + banco geral + trilhas (sync) + pacotes carregados (async, quando houver)
repository.ensureSubjects(ids): para cada matéria sem pacote em memória → fetch(manifest) → fetch(pacote) → valida forma leve → registra
build-packs: lê src/content/banco/**/*.json → zod → regras (§19.5 do 30) → escreve public/content/v1/{manifest.json, index.<hash>.json, <materia>.<hash>.json}
```

Decisão de status do legado: as 1.204 trilhas e as 59 questões foram publicadas depois de revisão de autoria (`22`, `26`), mas nunca por especialista externo. Status `"revisada-humano"` com `reviewer: "autoria-legada"` — o motor as aceita em prática/revisão; o nivelamento/checkpoint só usa as que tiverem dificuldade classificada e passarem pela conferência de gabarito da F3.5.

### Edge cases
Pacote corrompido ou 404 → `repository` registra falha, motor segue com conteúdo embarcado. Item em pacote com id que colide com id embarcado → build falha. Exercício de trilha legado reordenado depois da classificação → id muda (`exercise-ids.ts`); o teste F3.5 detecta meta órfão.

### Performance
`ITEM_META` das microlições e banco geral no bundle (poucos KB). `meta/trilhas.json` via `import()` dinâmico só quando o motor precisar. Meta: bundle inicial cresce < 15 KB gzip.

### Segurança
Pacotes são dados, renderizados como texto (nenhum HTML/JS de conteúdo; mesma regra de `LearningDiagram`, `20` §8.3).

### Tarefas

**F3.1 — Tipos e schema** · SONNET
- Arquivos: **NOVOS** `items/types.ts`, `items/schema.ts`.
- Faz: `ItemMeta`, `ItemIrt`, `ItemSourceKind`, `ItemValidationStatus` (`30` §8.4) e schema zod espelho (inclui schema zod do `Exercise` dos 7 tipos). Exportar `z.infer` para garantir igualdade com os tipos TS (teste de tipo).
- Critério: `bunx tsc --noEmit`; teste rejeita meta com `difficulty: 6`, `skillIds: []`, gabarito fora do intervalo.

**F3.2 — IRT e padrões** · SONNET · TDD
- Arquivos: **NOVO** `items/irt.ts`, `tests/unit/item-meta.test.ts`.
- Faz: `irtFromDifficulty`, `defaultMetaFor(id)` (resolve lição dona via `lessonById`/`phaseById`/`QUESTIONS`).
- Critério: testes para os 7 tipos de exercício e para as 3 fontes.

**F3.3 — Metadado das microlições (à mão)** · SONNET
- Arquivos: **NOVO** `items/meta/microlicoes.ts`.
- Faz: para cada exercício local das 6 microlições (`mc:*`), `skillIds` **por item** (corrige P3; ex.: `mc:porcentagem-aumento-desconto:checkpoint` → `mat:porcentagem-fator-multiplicativo`), dificuldade a partir do passo (`difficulty` 1/2/3; `desafio` +1), papéis.
- Critério: teste "todo exercício local tem meta e todo `skillId` existe".

**F3.4 — Metadado do banco geral** · HAIKU (classificação) → SONNET (revisão)
- Arquivos: **NOVO** `items/meta/banco-geral.json`, **NOVO** `scripts/content/classify-legacy.ts`.
- Faz: `topic` (nome livre) → `topicId` de `subjects.ts`; habilidade (lista fechada = habilidades daquela matéria, ativas ou planejadas); dificuldade Fácil/Médio/Difícil → 2/3/4. Classificação por modelo barato com lista fechada; revisão de 100% por SONNET (são só 59).
- Critério: 59 entradas, todas válidas no schema.

**F3.5 — Metadado das trilhas legadas** · HAIKU (lote) → SONNET (amostra 5% + conflitos)
- Arquivos: **NOVO** `items/meta/trilhas.json`.
- Faz: por lição legada, habilidade(s) de Português/Redação (lista fechada da F2); por exercício, dificuldade 1–5 e conferência de gabarito (o modelo resolve sem ver `correta` e compara, como o estágio 3/4 do pipeline). Divergência de gabarito → lista no `32` para revisão humana; **não** corrigir conteúdo automaticamente.
- Critério: 1.204 entradas; relatório de divergências no `32`; teste "nenhum meta órfão" (id existe em `EXERCISE_IDS`).

**F3.6 — Índice unificado** · SONNET · TDD
- Arquivos: **NOVO** `items/index.ts`.
- Faz: `itemMetaOf(id)`, `itemIndex()` (memoizado), `itemsOfSkill(skillId)`.
- Critério: teste de contagem (≈ 1.300 entradas) e de que todo item do índice resolve com `resolveExercise`.

**F3.7 — Repositório e pacotes** · SONNET · TDD
- Arquivos: **NOVOS** `src/lib/content/repository.ts`, `scripts/content/build-packs.ts`, testes; `src/content/microlicoes/index.ts` (4ª fonte em `resolveExercise`, só se `FEATURES.pacotesConteudo`); `src/lib/features.ts` (flag `pacotesConteudo: false`).
- Faz: formato de pacote `{ version, subjectId, items: Array<{ id, exercise, meta }>, lessons: MicroLessonV2[] }`; `manifest.json` com hashes; `ensureSubjects` com timeout de 8 s e cache em memória. Aulas em pacote (`30` §21.3): `build-packs` gera também **NOVO** `src/content/banco/aulas-geradas.ts` (versionado) com `{ lessonId, chapterId, subjectId, skillIds }[]`; `validateCurriculumTree` aceita esses ids; `phaseById` consulta embarcado → repositório; `repository.lessonById(id)`.
- Critério: teste gera pacote de um diretório de fixture e carrega de volta; pacote inválido falha o build com mensagem clara; com 404 o repositório devolve `false` sem lançar; teste de sincronia falha se `aulas-geradas.ts` estiver desatualizado em relação a `src/content/banco/`.

**F3.8 — Integração de build** · SONNET
- Arquivos: `package.json`.
- Faz: `"predev": "bun scripts/content/build-packs.ts"`, `"prebuild": "bun scripts/content/build-packs.ts"`. Com `src/content/banco/` vazio, gera manifest vazio. Conferir que `bun run dev` e `VERCEL=1 bun run build` funcionam; registrar no `32` se o editor Lovable roda `predev` (risco R9 do `30`).
- Critério: build ok; `public/content/v1/manifest.json` gerado e ignorado pelo Git.

### Testes
Novos: `item-meta`, `content-repository`, `build-packs`. Existentes verdes (em especial `content-identity.test.ts`, `microlicoes.test.ts`).

### Critérios de aceite
- **AC-3.1** 100% dos itens existentes com `itemMetaOf` válido (meta explícito ou padrão).
- **AC-3.2** Habilidade por item nas microlições (não mais por lição).
- **AC-3.3** Divergências de gabarito do legado listadas no `32` (não corrigidas automaticamente).
- **AC-3.4** Pacotes: build, carga, falha graciosa testados; flag `pacotesConteudo` desligada por padrão.
- **AC-3.5** Bundle inicial cresce < 15 KB gzip (comparar com a linha de base F0.2).

### Definition of Done
AC-3.1…3.5; suíte verde; build Vercel ok.

### Instruções para a IA executora
Não edite `src/content/trilhas/**`, `src/data/questions.ts` nem os exercícios das microlições. Metadado é lateral. Não mude a fórmula de id de `exercise-ids.ts`.

### Context Pack
- Objetivo: metadado para ~1.300 itens + infraestrutura de pacotes.
- Ler do `30`: §8.4, §18.2, §21.3.
- Arquivos: `src/content/exercise-ids.ts`, `src/content/microlicoes/index.ts`, `src/lib/learning/adapters.ts`, `src/lib/lessons/types.ts` (tipos `Exercise`), `src/data/questions.ts` (ler), `src/content/trilhas/index.ts` (ler), `package.json`, `src/lib/features.ts`.
- Contratos: `ItemMeta`; `resolveExercise(id): Exercise` continua síncrono e lançando para id inexistente.
- Não pode mudar: conteúdo existente; ids; `EXERCISE_IDS`.
- Arquivos quentes: `features.ts` (só acrescentar `pacotesConteudo`).

### Prompt para o executor
> Você vai executar a Fase 3 do SDD do Foca (`docs/31` §7). Leia o Context Pack e o `docs/30` §8.4, §18.2 e §21.3. Objetivo: dar metadado pedagógico (`ItemMeta`: habilidades por item, dificuldade 1–5, parâmetros IRT estimados, papéis, fonte, status) a todos os ~1.300 itens existentes SEM editar os arquivos de conteúdo, criar o índice unificado e a infraestrutura de pacotes JSON (`scripts/content/build-packs.ts`, `src/lib/content/repository.ts`, flag `pacotesConteudo` desligada). Use subagentes HAIKU para classificar o banco geral e as trilhas legadas com lista fechada de habilidades, e revise (100% do banco geral; 5% + conflitos das trilhas). Divergência de gabarito vai para o `docs/32`, nunca é corrigida sozinha. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bun run build` (e `VERCEL=1 bun run build`). Critérios AC-3.1 a AC-3.5. Sem commit.

---

## 8. Fase 4 — Schema v6, eventos e migração

**Tipo:** BLOQUEANTE · **Depende de:** F2 · **Modelo:** SONNET · **Skills:** `superpowers:test-driven-development`; revisão `agent-skills:code-review-and-quality` (nível L2: dados do aluno)

### Objetivo
Store com os campos novos do `30` §21.1, migração v5→v6 aditiva, idempotente e com backup, e o anel de eventos locais.

### Motivação
Todas as fases de comportamento gravam nesses campos. Migração é o ponto de maior risco para quem já usa (R5).

### Dependências
F2 (tipos de área para `studyFocus`).

### Estado atual
`src/lib/state-migrations.ts`: `CURRENT_SCHEMA_VERSION = 5`, `computeAdditiveFields`, `parseActiveSession`, backup `foca.state.backup.before-learning-v4`. `src/lib/store.ts#load()` funde `prefs`/`progress` e usa os aditivos. Testes: `tests/unit/state-migrations.test.ts`, `tests/e2e/state-migration.spec.ts`.

### Alterações necessárias
Tipos aditivos; `CURRENT_SCHEMA_VERSION = 6`; novo backup; defaults; `Attempt` com campos opcionais; ações de store para eventos; limites de `skillEvidence`.

### Arquivos afetados
`src/lib/learning/types.ts`, `src/lib/state-migrations.ts`, `src/lib/store.ts`, `src/lib/learning/review.ts` (limites 50/20 em `updateSkillEvidence`), `tests/unit/state-migrations.test.ts`, `tests/e2e/state-migration.spec.ts`.

### Novos arquivos
**NOVOS** `tests/unit/fixtures/state-v3.json`, `state-v4.json`, `state-v5.json`, `state-v5-pesado.json`; **NOVO** `tests/unit/storage-budget.test.ts`.

### Dados
Tabela completa no `30` §21.1. Tipos novos em `learning/types.ts`: `SkillModelEntry`, `JourneyState`, `PlacementState`, `FocusSession`, `LearningEvent`, `StudyFocus`; `PlannedActivity` é importado de `src/lib/adaptive/types.ts` (criado aqui como **NOVO**, só tipos, para evitar ciclo — a F8 preenche a lógica).

```ts
export interface PlacementState {
  status: "em-andamento" | "concluido" | "abandonado";
  startedAt: string; finishedAt: string | null;
  areas: Record<string, { itemIds: string[]; responses: Array<{ itemId: string; correct: boolean; dontKnow: boolean }>;
                          theta: number | null; se: number | null; done: boolean }>;
  seed: string;
}
export interface FocusSession { subjectIds: string[]; startedAt: string; expiresOn: string /* YYYY-MM-DD */ }
export interface StudyFocus { mode: "todas" | "materias" | "areas"; subjectIds: string[]; areas: EnemArea[] }
export interface LearningEvent { type: LearningEventType; at: string; localDate: string;
                                 skillId?: string; activityId?: string; meta?: Record<string, string | number | boolean> }
```

### Backend / Frontend
Não se aplica.

### Algoritmo

```text
computeAdditiveFields(parsed) v6:
  (tudo que já fazia) +
  prefs.studyFocus  = válido ? parsed : { mode: "todas", subjectIds: [], areas: [] }
  prefs.easySubjects = arrayOr(parsed, [])
  prefs.dailyMinutes = válido ∈ {5,10,15,20,30} ? parsed : derivarDe(prefs.dailyLessons)
  prefs.onboardingVersion = number ? parsed : (parsed.onboarded ? 1 : 2)
  learning.skillModel = recordOr(raw.skillModel, {})     // bootstrap/replay é da F5, não daqui
  learning.journey = parseJourney(raw.journey) ?? journeyVazia()
  learning.placement = parsePlacement(raw.placement)      // forma inválida → null
  learning.focusSession = parseFocusSession(raw.focusSession) // expirada → null
  learning.events = arrayOr(raw.events, []).slice(-300)
  learning.modelMeta = recordOr(raw.modelMeta, { algoVersion: 0, bootstrappedAt: null })
backup: BACKUP_KEY_V6 = "foca.state.backup.before-v6" — criado se schemaVersion existente < 6 e ainda não existir
recordEvent(type, extra): setState → push → corta em 300
```

### Edge cases
Estado sem `learning` (v3 puro); `activeSession` v4 sem `stepIndex` (já descartada pelo v5); versão futura 7 (não sobrescreve); `localStorage` cheio no backup (segue sem backup, avisa no console, estado em memória ok); `focusSession` expirada na carga.

### Performance
Migração < 50 ms com o fixture pesado (teste).

### Segurança
L2 (dados do aluno em `localStorage`): nenhum dado novo sai do aparelho; eventos sem texto livre do aluno.

### Tarefas

**F4.1 — Tipos aditivos** · SONNET
- Arquivos: `src/lib/learning/types.ts`, **NOVO** `src/lib/adaptive/types.ts` (só tipos do `30` §11.6).
- Faz: tipos acima; `Attempt` ganha opcionais `response`, `helpLevel`, `assisted`, `itemDifficulty`, `predictedP`, `source`; `LearningSessionKind` ganha 3 valores; `ReviewScheduleEntry.intervalDays` estende para `30 | 60`; `LearningState` ganha os campos; `learningStateVazio()` atualizado.
- Critério: `bunx tsc --noEmit` sem erro em todo o repo.

**F4.2 — Migração v6** · SONNET · TDD
- Arquivos: `src/lib/state-migrations.ts`, `tests/unit/state-migrations.test.ts`.
- Faz: `CURRENT_SCHEMA_VERSION = 6`; algoritmo acima; parsers defensivos.
- Critério: testes de cada campo com entrada válida, inválida e ausente.

**F4.3 — Store** · SONNET
- Arquivos: `src/lib/store.ts`.
- Faz: `defaultState` com os campos; `load()` aplica os novos `prefs`; ações `setStudyFocus`, `startFocusSession`, `clearFocusSession`, `setDailyMinutes`, `setEasySubjects`, `recordEvent`. Nenhuma lógica de modelo/motor aqui.
- Critério: testes unitários das ações (padrão de `record-learning-attempt.test.ts`).

**F4.4 — Limites da evidência** · SONNET
- Arquivos: `src/lib/learning/review.ts`, `tests/unit/review.test.ts`.
- Faz: `distinctExerciseIds` mantém os últimos 50; `distinctLocalDates` os últimos 20.
- Critério: teste com 60 itens; `skillEvidenceState` inalterado para os casos existentes.

**F4.5 — Fixtures reais** · SONNET
- Arquivos: **NOVOS** `tests/unit/fixtures/state-v3.json`, `state-v4.json`, `state-v5.json`.
- Faz: montar a partir dos fixtures já usados em `state-migrations.test.ts`/`state-migration.spec.ts` (sem dado pessoal real); v5 com `recentAttempts` de microlição, `progress.bySubject` de `/study` e `progress.lessons` legadas.
- Critério: migração de cada fixture preserva XP, streak, `bestStreak`, `lessons`, `completedLessons`, `flashcardReviews`, `rewardLedger`; rodar 2× dá o mesmo JSON; fixture com `schemaVersion: 7` não é reescrito.

**F4.6 — Orçamento de armazenamento** · SONNET
- Arquivos: **NOVOS** `tests/unit/fixtures/state-v5-pesado.json` (gerado por script de teste), `tests/unit/storage-budget.test.ts`.
- Faz: estado sintético com 400 entradas de `skillModel`, 500 tentativas, 200 de histórico de jornada, 300 eventos → `JSON.stringify` < 1 MB; migração < 50 ms.
- Critério: teste verde.

**F4.7 — E2E de migração** · SONNET
- Arquivos: `tests/e2e/state-migration.spec.ts`.
- Faz: caso novo: `localStorage` com v5 → abrir `/trilha` → estado gravado com `schemaVersion: 6`, backup `before-v6` presente, XP igual.
- Critério: E2E verde.

### Testes
`state-migrations`, `review`, `storage-budget`, E2E `state-migration`.

### Critérios de aceite
- **AC-4.1** v3/v4/v5 migram para v6 preservando tudo o que o `30` §24.1 item 8 lista.
- **AC-4.2** Idempotência e proteção de versão futura testadas.
- **AC-4.3** Backup `before-v6` criado uma única vez.
- **AC-4.4** Estado pesado < 1 MB e migração < 50 ms.
- **AC-4.5** Nenhuma tela muda de comportamento (E2E existentes verdes).

### Definition of Done
AC-4.1…4.5; suíte completa verde.

### Instruções para a IA executora
Esta fase só cria contêineres e migra. Não calcule Mastery aqui. Não remova nem renomeie campo existente. Não mude a chave `foca.state.v3`.

### Context Pack
- Objetivo: schema v6 aditivo.
- Ler do `30`: §21.1, §21.2, §21.4, §24.1.
- Arquivos: `src/lib/learning/types.ts`, `src/lib/state-migrations.ts`, `src/lib/store.ts`, `src/lib/learning/review.ts`, testes de migração.
- Contratos: `computeAdditiveFields(parsed): AdditiveFields`; `setState(mut)`; `recordLearningAttempt(attempt)` (não mudar ainda).
- Não pode mudar: chave de storage, backup v4 existente, semântica de XP/streak.
- Arquivos quentes: `store.ts`, `learning/types.ts`, `state-migrations.ts` (esta fase é dona deles enquanto roda).

### Prompt para o executor
> Você vai executar a Fase 4 do SDD do Foca (`docs/31` §8). Leia o Context Pack e o `docs/30` §21 e §24.1. Objetivo: schema local v6 aditivo sobre `foca.state.v3` — tipos novos em `src/lib/learning/types.ts` (e só tipos em `src/lib/adaptive/types.ts`), migração em `src/lib/state-migrations.ts` com backup `foca.state.backup.before-v6`, ações novas no `src/lib/store.ts` (foco, minutos por dia, matérias fáceis, eventos), limites 50/20 na evidência. Não calcule Mastery nem mexa em comportamento de tela. TDD. Crie fixtures v3/v4/v5 e um estado pesado; prove idempotência, proteção de versão futura, orçamento < 1 MB e migração < 50 ms. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`. Critérios AC-4.1 a AC-4.5. Sem commit.

---

## 9. Fase 5 — Mastery e Confidence (modo sombra)

**Tipo:** BLOQUEANTE · **Depende de:** F3, F4 · **Modelo:** FORTE para F5.2 e F5.8; SONNET no resto · **Skills:** `superpowers:test-driven-development`; revisão `agent-skills:code-review-and-quality`

### Objetivo
Implementar o modelo do `30` §9–10 como funções puras, ligá-lo à gravação de tentativas em modo sombra (calcula e guarda, mas nada na UI muda), com bootstrap para quem já usa e replay por versão de algoritmo.

### Motivação
É o coração do sistema. Rodar em sombra antes de afetar o aluno permite comparar com o selo "consistente" existente e calibrar (R3).

### Dependências
F3 (`itemMetaOf` para `a`, `b`, `c`, dificuldade), F4 (campos).

### Estado atual
`recordLearningAttempt` (`src/lib/store.ts:792`) atualiza `skillEvidence` e `reviewSchedule` via `recordAttemptForSkill` (`src/lib/learning/review.ts`).

### Alterações necessárias
Constantes, modelo, confidence, faixas de exibição, integração na transação de `recordLearningAttempt`, bootstrap/replay, prior de matéria, simulador e cenários.

### Arquivos afetados
`src/lib/store.ts` (`recordLearningAttempt`, `load()` para replay), `src/lib/features.ts` (`masteryModel: "shadow"`), `src/lib/learning/review.ts` (agenda: acerto independente em prática cria entrada se não existir — `30` §11.2 precisa de "DEVIDA" para habilidades praticadas; erro em qualquer papel reinicia para 1 dia).

### Novos arquivos
**NOVOS** `src/lib/adaptive/constants.ts`, `model.ts`, `confidence.ts`, `display.ts`, `bootstrap.ts`; `tests/unit/mastery-model.test.ts`, `confidence.test.ts`, `mastery-bootstrap.test.ts`, `tests/unit/helpers/simulated-student.ts`, `tests/unit/sim-model.test.ts`.

### Dados
Grava `learning.skillModel[skillId]` e `learning.modelMeta`. Confidence nunca gravada.

### Backend / Frontend
Nenhuma mudança visível (sombra). O painel de debug da F8 é quem mostra.

### Algoritmo
`30` §9.4 (atualização), §10.2 (Confidence), §24.3 (prior de matéria), §9.6 (replay). Mudança na agenda de revisão:

```text
recordAttemptForSkill (review.ts), além do que já faz:
  se role ∈ {pratica, desafio, diagnostico} e correct e não assistida e não existe agenda → cria agenda intervalo 1
  se !correct (qualquer papel exceto checkpoint-de-aula) e existe agenda → reinicia para 1
  (role "revisao" continua avançando a escada como hoje; escada estendida 1/3/7/14/30/60)
```

### Edge cases
`30` §9.7 e §10.6. Mais: tentativa com `skillIds` vazio (item sem meta e lição sem habilidade) → não atualiza modelo, registra evento `plan-fallback`? Não: registra só no trace de debug. Habilidade que não existe na taxonomia (conteúdo antigo) → ignora com aviso de console em dev.

### Performance
`updateSkill` O(1). Replay de 500 tentativas < 10 ms (teste).

### Segurança
Não se aplica além de L1.

### Tarefas

**F5.1 — Constantes** · SONNET
- Arquivos: **NOVO** `src/lib/adaptive/constants.ts`.
- Faz: todas as constantes do `30` §9.4 e §10.2, `ALGO_VERSION = 1`, pesos por papel, faixas de exibição. Um comentário por grupo apontando para a seção do `30`.
- Critério: `tsc`.

**F5.2 — Modelo** · FORTE · TDD
- Arquivos: **NOVO** `src/lib/adaptive/model.ts`, `tests/unit/mastery-model.test.ts`.
- Faz: `probabilityCorrect(theta, irt, {dontKnow})`, `updateSkill(entry, attempt, meta, today)`, `mastery(entry)`, `priorFor(skillId, state)`. Casos de teste: a tabela do `30` §9.5 (faixa ±5), "não sei" cai menos que erro com chute, assistida move ≤ 30% de uma independente, `MAX_STEP` respeitado, `sigma` nunca abaixo de `SIGMA_MIN`, drift aumenta sigma sem mexer em theta, item repetido no dia com peso 0,5.
- Critério: todos os casos verdes; conta do primeiro passo bate com o `30` §9.5 (θ = −0,337 ± 0,01).

**F5.3 — Confidence** · SONNET · TDD
- Arquivos: **NOVO** `src/lib/adaptive/confidence.ts`, `tests/unit/confidence.test.ts`.
- Faz: `confidence(entry, evidence, schedule, today): { value; parts: {Q,D,R,T,S,I} }`. Casos: cada linha do `30` §10.3 (±3), limites 0/100, checagem de aula não sobe, "não sei" conta em Q e não em dificuldades.
- Critério: testes verdes.

**F5.4 — Faixas de exibição** · SONNET
- Arquivos: **NOVO** `src/lib/adaptive/display.ts`.
- Faz: `skillDisplay(entry, evidence, schedule, today) → { label; showMastery; mastery?; consistent: boolean; dominated: boolean }` conforme `30` §10.4.
- Critério: teste de fronteira (24/25/49/50/74/75).

**F5.5 — Integração em sombra** · SONNET
- Arquivos: `src/lib/store.ts`, `src/lib/learning/review.ts`, `src/lib/features.ts`.
- Faz: dentro da **mesma** `setState` de `recordLearningAttempt`, se `FEATURES.masteryModel !== "off"`, chamar `updateSkill` para cada habilidade (principal peso w, secundárias w × 0,4) usando `itemMetaOf(attempt.exerciseId)`; gravar `predictedP` na tentativa. Regra nova da agenda (algoritmo acima). Flag `masteryModel: "shadow"`.
- Critério: `record-learning-attempt.test.ts` estendido: uma tentativa atualiza evidência, agenda e modelo numa transação; com flag `"off"` nada do modelo muda.

**F5.6 — Bootstrap e replay** · SONNET · TDD
- Arquivos: **NOVO** `src/lib/adaptive/bootstrap.ts`, `src/lib/store.ts#load()`, `tests/unit/mastery-bootstrap.test.ts`.
- Faz: `bootstrapModel(state)` = prior de matéria (§24.3) + replay de `recentAttempts`; roda na carga quando `modelMeta.algoVersion < ALGO_VERSION` (inclusive 0 = nunca rodou) e grava `modelMeta`. Nunca roda se `schemaVersion` for futura.
- Critério: fixture v5 → modelo com entradas para as habilidades das tentativas; rodar 2× = igual; < 10 ms.

**F5.7 — Prior de matéria** · SONNET
- Arquivos: `bootstrap.ts`.
- Faz: `30` §24.3 para `progress.bySubject`; `source: "prior-materia"`, `nEff = 0`.
- Critério: teste com 10/7 em Matemática → θ ≈ logit(8/12) − 0,3 ≈ 0,39; Confidence 0.

**F5.8 — Simulador e cenários do modelo** · FORTE
- Arquivos: **NOVOS** `tests/unit/helpers/simulated-student.ts`, `tests/unit/sim-model.test.ts`.
- Faz: aluno simulado (θ verdadeiro por habilidade, respostas pela 3PL com semente, opções de ajuda/não sei/esquecimento). Cenários C, D, E, F do `30` §26.3 aplicados só ao modelo (sem motor).
- Critério: asserções do `30` §26.3 para C, D, E, F verdes com 3 sementes diferentes.

### Testes
Os novos + `record-learning-attempt`, `review`, `state-migrations` existentes.

### Critérios de aceite
- **AC-5.1** Fórmulas batem com o `30` §9.5 e §10.3 dentro das tolerâncias.
- **AC-5.2** Modelo atualizado na mesma transação da tentativa, só com flag ≠ `"off"`.
- **AC-5.3** Bootstrap/replay idempotente e < 10 ms.
- **AC-5.4** Cenários C, D, E, F verdes com 3 sementes.
- **AC-5.5** Nenhuma mudança visível na UI (E2E existentes verdes).

### Definition of Done
AC-5.1…5.5; constantes documentadas; `32` com as tabelas de referência reproduzidas pelo teste.

### Instruções para a IA executora
Não mude constantes para fazer teste passar sem registrar no `32` o porquê e atualizar a tabela do `30`. Confidence é derivada: não grave. Não mostre nada na UI nesta fase.

### Context Pack
- Objetivo: modelo de Mastery/Confidence em sombra.
- Ler do `30`: §9, §10, §24.2, §24.3, §26.3 (C–F).
- Arquivos: `src/lib/store.ts` (`recordLearningAttempt`, `load`), `src/lib/learning/review.ts`, `src/lib/learning/types.ts` (ler), `src/content/items/index.ts` (`itemMetaOf`), `src/content/taxonomy/index.ts`, `src/lib/features.ts`.
- Contratos: `SkillModelEntry`; `recordLearningAttempt(attempt)` mantém assinatura; `skillEvidenceState` inalterado.
- Não pode mudar: critérios do selo "consistente"; XP; UI.
- Arquivos quentes: `store.ts`, `features.ts` (acrescentar `masteryModel`).

### Prompt para o executor
> Você vai executar a Fase 5 do SDD do Foca (`docs/31` §9). Leia o Context Pack e o `docs/30` §9, §10, §24.2, §24.3 e §26.3. Objetivo: implementar Mastery (θ/σ, 3PL com escorregão, atualização estilo Elo com ganho proporcional à incerteza) e Confidence (derivada de quantidade, diversidade, retenção, recência, estabilidade e independência) como funções puras em `src/lib/adaptive/`, ligar ao `recordLearningAttempt` em modo sombra (flag `masteryModel: "shadow"`), com bootstrap/replay por `ALGO_VERSION` e prior por matéria. TDD: os valores de referência do `30` §9.5 e §10.3 são os testes. Crie o simulador de aluno e os cenários C, D, E, F. Nada muda na UI. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`. Critérios AC-5.1 a AC-5.5. Sem commit.

---

## 10. Fase 6 — Captura de sinais e botão "Não sei"

**Tipo:** BLOQUEANTE · **Depende de:** F5 · **Modelo:** SONNET · **Skills:** `superpowers:test-driven-development`, `frontend-design` (só F6.5/F6.6); revisão `web-design-guidelines` + `humanizer:humanizer` na copy

### Objetivo
Todas as superfícies de questão (`MicroLessonPlayer`, `/study`, `LessonPlayer`) gravam tentativas com habilidade por item, dificuldade, ajuda e duração; existe o botão "Não sei" com feedback neutro.

### Motivação
P2, P3, P5 e o pedido do "Não sei" (`30` §16.1). Sem sinais, o modelo só aprende com 6 microlições.

### Dependências
F5 (modelo ligado em sombra; `itemMetaOf`).

### Estado atual
Só `useLearningSession.ts:188` grava tentativa, com `lesson.skillIds`, `hintUsed/tutorUsed: false`, `durationMs: 0`. `/study` (`src/routes/study.tsx`) usa `useExerciseSession` e `registrarResposta`; tem "Pedir dica" (`showHint`) e "Perguntar à Foca" antes de responder. `LessonPlayer` usa `useExerciseSession` e `completeLesson`. `FeedbackSheet` tem só as variantes certo/errado.

### Alterações necessárias
Gravar tentativas nas três superfícies; ajuda antes de responder vira `assisted`; duração medida; "Não sei" nas três; variante neutra do feedback.

### Arquivos afetados
`src/hooks/useLearningSession.ts`, `src/components/learning/MicroLessonPlayer.tsx`, `src/components/learning/steps/QuestionStepView.tsx`, `src/components/lessons/FeedbackSheet.tsx`, `src/components/lessons/LessonPlayer.tsx`, `src/hooks/useExerciseSession.ts` (só se precisar de um caminho "não sei" no estado `answering→feedback`), `src/routes/study.tsx`, `src/lib/store.ts` (`registrarResposta` aceita "não sei"), `src/lib/feedback/create-feedback.ts` + `types.ts` (feedback neutro), `src/lib/feedback/dispatch-feedback.ts` (sem som/vibração de erro no neutro), `src/lib/voz.ts` (slot `naosei`), `src/lib/copy.ts`, `docs/21`, `src/lib/features.ts`.

### Novos arquivos
**NOVO** `src/components/learning/DontKnowButton.tsx`; **NOVO** `src/lib/learning/attempt-builder.ts` (monta `Attempt` a partir de exercício + meta + contexto, usado pelas 3 superfícies); **NOVOS** testes `tests/unit/attempt-builder.test.ts`, `tests/e2e/dont-know.spec.ts`.

### Dados
Campos de `Attempt` da F4. `source` = `"microlicao" | "estudo" | "legado"`.

### Backend
Não se aplica.

### Frontend
"Não sei": botão de texto abaixo das alternativas (antes de "Verificar"), `min-h-11`, cor `nevoa`/`abismo`, nunca `mar` (não compete com o CTA). Feedback neutro: mesma `FeedbackSheet`, fundo `cards` sem mistura de `success`/`error`, ícone neutro (lucide `HelpCircle`), título via `fala("naosei")`, alternativa correta destacada no próprio exercício (estado `checked` já mostra a correta).

### Algoritmo

```text
buildAttempt({ exerciseId, exercise, lessonSkillIds, role, answer, correct, response, assisted, startedAt, source, sessionId }):
  meta = itemMetaOf(exerciseId)
  skillIds = meta.skillIds.length ? meta.skillIds : lessonSkillIds
  return { id, sessionId, exerciseId, exerciseVersion: stableExerciseId(id)?.version ?? 1,
           subjectId, topicId, skillIds, role, answer, correct: response == "dont-know" ? false : correct,
           response, assisted, hintUsed: assisted.hint, tutorUsed: assisted.tutor, helpLevel: 0,
           itemDifficulty: meta.difficulty, firstSubmission, submittedAt, localDate, durationMs: now − startedAt, source }
duração: marcada quando o passo-questão aparece (useLearningSession: ao entrar no stepIndex; study: ao mostrar a questão)
         limitada a 10 min (acima disso, gravar 600000 — aluno saiu e voltou)
assisted.tutor: true se openTutorWithContext foi chamado com o foco desta questão ANTES da resposta
assisted.hint: true se "Pedir dica" (study) foi aberto ANTES da resposta
```

`/study` com `sinaisAmpliados`: `registrarResposta` continua cuidando de XP/`bySubject`; **além disso** chama `recordLearningAttempt(buildAttempt(...))` com `role: "pratica"`, `source: "estudo"`. `LessonPlayer` idem com `source: "legado"`, `role: "pratica"`, habilidade do meta da F3.5.

"Não sei" em `useLearningSession`: nova função `dontKnow()` análoga a `submit()`: cria feedback neutro, grava tentativa `response: "dont-know"`, `answer: null`, avança para o estado de feedback do passo. Em `scoreOf`, não sei conta como não acerto (nenhuma mudança: `correct: false`).

### Edge cases
- Retomada de sessão: `dontKnow` já registrado não repete (mesma guarda de `submittingRef`).
- `ordenar`/`parear` com resposta parcial: "Não sei" disponível mesmo com resposta incompleta.
- Tutor aberto **depois** da resposta não marca `assisted` (é camada 3; a F7 grava em `helpLevel`).
- `/study` com a flag desligada: comportamento idêntico ao atual (E2E existentes).
- XP de "não sei" no banco geral: mesmo de errada (5, teto pelo ledger).

### Performance
Uma escrita extra por resposta (já existe `setState` por resposta). Sem render extra.

### Segurança
L1.

### Tarefas

**F6.1 — Construtor de tentativa** · SONNET · TDD
- Arquivos: **NOVO** `src/lib/learning/attempt-builder.ts`, `tests/unit/attempt-builder.test.ts`.
- Faz: `buildAttempt` conforme o algoritmo.
- Critério: testes para as 3 fontes, "não sei", assistida, duração limitada.

**F6.2 — Microlições com habilidade por item, ajuda e duração** · SONNET
- Arquivos: `src/hooks/useLearningSession.ts`, `src/components/learning/MicroLessonPlayer.tsx`.
- Faz: usar `buildAttempt`; guardar `questionShownAt` por passo; `MicroLessonPlayer.askTutor` antes de responder marca `assisted.tutor` para o passo atual (estado local no hook, passado ao `submit`).
- Critério: `record-learning-attempt.test.ts` + teste novo: tentativa de `mc:porcentagem-aumento-desconto:checkpoint` grava `skillIds: ["mat:porcentagem-fator-multiplicativo"]`.

**F6.3 — `/study` grava tentativas** · SONNET
- Arquivos: `src/routes/study.tsx`, `src/lib/features.ts` (flag `sinaisAmpliados: false` → ligada ao fim da fase depois dos E2E).
- Faz: com a flag, `recordLearningAttempt` junto de `registrarResposta`; `showHint` antes da resposta → `assisted.hint`.
- Critério: teste de integração; E2E `feedback.spec.ts` verde com flag ligada e desligada.

**F6.4 — `LessonPlayer` grava tentativas** · SONNET
- Arquivos: `src/components/lessons/LessonPlayer.tsx`.
- Faz: igual, com `source: "legado"`; id do exercício por `trilhaExerciseId(lesson.id, index)`.
- Critério: E2E `lessons.spec.ts` verde; teste confirma tentativa com habilidade do meta.

**F6.5 — Botão "Não sei"** · SONNET · `frontend-design`
- Arquivos: **NOVO** `DontKnowButton.tsx`, `QuestionStepView.tsx`, `useLearningSession.ts` (`dontKnow()`), `src/lib/features.ts` (`botaoNaoSei`).
- Faz: botão visível quando `botaoNaoSei` e `itemMetaOf(id).dontKnowAllowed !== false` e ainda sem feedback.
- Critério: E2E: tocar "Não sei" mostra feedback neutro e "Continuar".

**F6.6 — Feedback neutro** · SONNET
- Arquivos: `FeedbackSheet.tsx`, `create-feedback.ts`, `feedback/types.ts`, `dispatch-feedback.ts`, `voz.ts`.
- Faz: `AnswerFeedback.kind: "correct" | "incorrect" | "dont-know"` (aditivo; `correct` continua existindo); `dispatchAnswerFeedback` sem som e sem vibração para `dont-know`; slot `naosei` em `voz.ts` com 2–3 falas curtas (ex.: "Tudo bem. Veja como resolve:", "Sem problema. Olha o caminho:"), passadas pelo Humanizer.
- Critério: teste de `create-feedback` e de `dispatch-feedback` (não chama som); `brand-voice.test.ts` estendido ao slot novo (sem cobrança).

**F6.7 — "Não sei" em `/study` e `LessonPlayer`** · SONNET
- Arquivos: `study.tsx`, `LessonPlayer.tsx`, `store.ts` (`registrarResposta(q, correct, { dontKnow })`).
- Faz: mesmo botão e mesmo feedback neutro; XP como errada.
- Critério: E2E **NOVO** `dont-know.spec.ts` cobre as 3 superfícies.

**F6.8 — Copy e inventário** · SONNET · `humanizer:humanizer`
- Arquivos: `copy.ts` (`COPY.questao.naoSei = "Não sei"`, `COPY.questao.naoSeiAria = "Não sei responder esta questão"`), `docs/21`.
- Critério: inventário atualizado com evidência (E2E).

### Testes
Unitários novos + `record-learning-attempt`, `session-logic`, `brand-voice`; E2E `dont-know.spec.ts`, `feedback.spec.ts`, `lessons.spec.ts`, `lesson-v2.spec.ts` (também no `narrow`).

### Critérios de aceite
- **AC-6.1** As 3 superfícies gravam `Attempt` com habilidade por item, dificuldade, `assisted`, `durationMs > 0`, `source`.
- **AC-6.2** "Não sei" grava `response: "dont-know"`, mostra feedback neutro sem som/vibração de erro, e o modelo (sombra) cai menos que num erro com chute (teste).
- **AC-6.3** Flags desligadas → comportamento idêntico ao atual.
- **AC-6.4** Botão com alvo ≥ 44 px e rótulo acessível; visível em 320 px sem rolagem horizontal.
- **AC-6.5** Copy no `copy.ts`/`voz.ts` e no inventário `21`.

### Definition of Done
AC-6.1…6.5; flags `sinaisAmpliados` e `botaoNaoSei` ligadas ao fim com suíte verde.

### Instruções para a IA executora
Não mude a economia de XP. Não abra o tutor automaticamente em nenhum caso. Não troque a cor do CTA. O botão "Não sei" nunca é primário.

### Context Pack
- Objetivo: sinais completos + "Não sei".
- Ler do `30`: §7.3, §16.1, §21.1 (campos de `Attempt`).
- Arquivos: listados em "Arquivos afetados".
- Contratos: `recordLearningAttempt(attempt)`; `registrarResposta(q, correct, opts?)` devolve XP; `AnswerFeedback` ganha `kind` sem remover `correct`; `useLearningSession` retorna também `dontKnow`.
- Não pode mudar: regra "errar nunca abre tutor"; ledger/XP; `scoreOf` (checagem de aula fora da pontuação).
- Arquivos quentes: `store.ts`, `copy.ts`, `voz.ts`, `features.ts`.

### Prompt para o executor
> Você vai executar a Fase 6 do SDD do Foca (`docs/31` §10). Leia o Context Pack e o `docs/30` §7.3, §16.1 e §21.1. Objetivo: fazer `/study`, as lições legadas (`LessonPlayer`) e as microlições gravarem tentativas completas (habilidade por item via `itemMetaOf`, dificuldade, ajuda antes de responder, duração, origem) usando um construtor único `src/lib/learning/attempt-builder.ts`, e criar o botão "Não sei" com feedback neutro (sem som nem vibração de erro) nas três superfícies. Tudo atrás das flags `sinaisAmpliados` e `botaoNaoSei`; com elas desligadas o app se comporta exatamente como hoje. Copy nova em `copy.ts`/`voz.ts`, passada pelo Humanizer e registrada no `docs/21`. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test` (inclua o novo `dont-know.spec.ts`). Critérios AC-6.1 a AC-6.5. Sem commit.

---

## 11. Fase 7 — Explicação em camadas e Foca IA contextual

**Tipo:** PARALELIZÁVEL (com F8 e F9) · **Depende de:** F6 · **Modelo:** SONNET; FORTE para revisar o prompt · **Skills:** `frontend-design` (F7.1), `agent-skills:security-and-hardening` (F7.5, L2); revisão `web-design-guidelines` + `humanizer:humanizer` (copy)

### Objetivo
Depois de responder, o aluno sobe uma escada de três níveis de explicação; o nível 3 abre a Foca IA já sabendo a situação pedagógica, sem o aluno repetir a questão.

### Motivação
`30` §16.2 e §17; P10.

### Dependências
F6 (feedback com `kind`, tentativa com `helpLevel`); F5 (Mastery/Confidence para o contexto).

### Estado atual
`FeedbackSheet` mostra `explanation` e, se houver `children`, um "Ver resolução" recolhido (em `/study`, o passo a passo); "Explicar melhor" só no erro chama `onAskTutor`. `TutorBubble` monta `TutorContext` (nome, alvo, nível, lacunas, `performanceFacts`, foco). `validateTutorRequest` valida mensagens, imagem e presença de contexto.

### Alterações necessárias
Componente de escada; fontes do nível 2; contexto pedagógico puro; prompt; validação de tamanho no servidor; ação do nível 3; troca do rótulo da checagem de aula.

### Arquivos afetados
`src/components/lessons/FeedbackSheet.tsx`, `src/components/learning/steps/QuestionStepView.tsx`, `src/routes/study.tsx`, `src/components/lessons/LessonPlayer.tsx`, `src/components/learning/MicroLessonPlayer.tsx`, `src/components/TutorBubble.tsx`, `src/lib/store.ts` (`openTutorWithContext` aceita `pedagogy` e `autoSend`; `setAttemptHelpLevel`), `src/lib/tutor-prompt.ts`, `src/lib/tutor-core.ts`, `src/lib/copy.ts`, `docs/21`, `src/lib/features.ts`.

### Novos arquivos
**NOVOS** `src/components/learning/ExplanationLadder.tsx`, `src/lib/tutor-context.ts`, `tests/unit/tutor-context.test.ts`, `tests/unit/tutor-pedagogy-validation.test.ts`, `tests/e2e/explanation-ladder.spec.ts`.

### Dados
`Attempt.helpLevel` atualizado pela ação `setAttemptHelpLevel(attemptId, level)` (só sobe); evento `explanation-expanded` e `ai-help-opened`; `skillModel.helpHeavyRecent` incrementado no nível 3.

### Backend
`validateTutorRequest`: `context.pedagogy` opcional; se presente, tipos checados, strings ≤ 240, `recentErrors.length ≤ 2`, `weakPrerequisites.length ≤ 3`, `JSON.stringify(pedagogy).length ≤ 2000`; senão `TutorRequestInvalido`. `buildSystemPrompt` com a seção nova.

### Frontend
Escada dentro da `FeedbackSheet`: nível 1 aberto no erro/"não sei" e recolhido no acerto ("Por que essa resposta?"); botão "Ainda não entendi" mostra o nível 2 inline; botão "Me ensina do começo" (ícone `Sparkles`, estilo `btn-outline`) aciona o nível 3. O CTA primário continua sendo "Continuar".

### Algoritmo

```text
buildPedagogicalContext(state, focus, now):
  meta = itemMetaOf(focus.questionId normalizado) ; skill = SKILL_MAP[meta.skillIds[0]]
  entry = state.learning.skillModel[skill.id] ; conf = confidence(...)
  recentErrors = últimas tentativas erradas da MESMA habilidade, exceto a atual, ≤ 2, enunciado cortado em 240
  weakPrerequisites = pré-requisitos de skill com Mastery < 60 ou Confidence < 30, ≤ 3, por nome
  explanationSeen = helpLevel da tentativa atual ≥ 2 ? "detalhada" : ≥ 1 ? "curta" : "nenhuma"
  mastery = conf ≥ 25 ? round(mastery(entry)) : null
  return { skillName, subjectName, topicName, mastery, confidenceLabel, recentErrors,
           dontKnowRecent: entry?.dontKnowRecent ?? 0, explanationSeen, weakPrerequisites,
           examName: EXAM_MAP[prefs.examTargets[0]?.examId]?.name ?? null, mode }
nível 3: openTutorWithContext({ ...focus, pedagogy: buildPedagogicalContext(..., mode: "ensinar-do-zero") }, { autoSend: COPY.explicacao.ensinarDoComeco })
         → TutorBubble, ao abrir com autoSend, envia UMA vez (guarda por interactionId)
```

Nota de id: `TutorFocus.questionId` hoje tem formatos diferentes (`redacao:<lessonId>:<i>` no legado, `q<n>` no geral). `buildPedagogicalContext` recebe o `exerciseId` estável explicitamente (novo campo opcional `TutorFocus.exerciseId`), em vez de reinterpretar `questionId`.

### Edge cases
- Item sem habilidade na taxonomia → `pedagogy` sem campos de modelo (`mastery: null`, listas vazias).
- Sem chave OpenAI / erro → `localFallback` com `mode: "ensinar-do-zero"` devolve: explicação detalhada (se houver) + "Um ponto de partida: <pré-requisito mais fraco>." (sem inventar conteúdo).
- Aluno toca nível 3 duas vezes → uma mensagem só (guarda).
- Checkpoint/nivelamento: escada não aparece (sem feedback).

### Performance
Contexto montado só no toque do nível 3. +~500 tokens de entrada por chamada.

### Segurança
**L2**: muda prompt e payload da server function. Rodar `agent-skills:security-and-hardening` e `/repo-security-review . --pr origin/main` sobre o diff (conforme `ai/SDD-WORKFLOW.md` §6). Enunciado e respostas são dados; o prompt diz isso explicitamente.

### Tarefas

**F7.1 — Escada de explicação** · SONNET · `frontend-design`
- Arquivos: **NOVO** `ExplanationLadder.tsx`, `FeedbackSheet.tsx`, `src/lib/features.ts` (`explicacaoEmCamadas`).
- Faz: níveis 1–3 conforme "Frontend"; `onLevel(level)` notifica o chamador. Com a flag desligada, a folha atual.
- Critério: E2E: erro → nível 1 visível → "Ainda não entendi" mostra nível 2 → "Me ensina do começo" abre o balão.

**F7.2 — Fontes do nível 2** · SONNET
- Arquivos: `QuestionStepView.tsx`, `study.tsx`, `LessonPlayer.tsx`.
- Faz: nível 2 = `itemMetaOf(id).explanationLayers.detalhada` → `passos` → (`/study`) `q.stepByStep`. Sem conteúdo de nível 2 → só nível 1 e 3.
- Critério: teste de seleção de fonte.

**F7.3 — Contexto pedagógico** · SONNET · TDD
- Arquivos: **NOVO** `src/lib/tutor-context.ts`, `tests/unit/tutor-context.test.ts`.
- Faz: `buildPedagogicalContext` conforme algoritmo; função pura com relógio injetado.
- Critério: testes de limites (cortes, contagens), Confidence < 25 → `mastery: null`, habilidade desconhecida.

**F7.4 — Prompt** · SONNET, revisão FORTE
- Arquivos: `src/lib/tutor-prompt.ts`, `tests/unit/tutor-prompt.test.ts`.
- Faz: `TutorContext.pedagogy?`; seção "SITUAÇÃO PEDAGÓGICA" e regras do modo `ensinar-do-zero` (`30` §17.2); `localFallback` do modo.
- Critério: snapshot do prompt com e sem `pedagogy`; regras anti-LaTeX e "números só do contexto" continuam presentes (teste existente).

**F7.5 — Validação no servidor** · SONNET · L2
- Arquivos: `src/lib/tutor-core.ts`, **NOVO** `tests/unit/tutor-pedagogy-validation.test.ts`.
- Faz: limites da seção "Backend".
- Critério: payload acima do limite → `TutorRequestInvalido`; payload válido passa; testes existentes `tutor-validation.test.ts` verdes. Revisão de segurança registrada no `32`.

**F7.6 — Ação do nível 3** · SONNET
- Arquivos: `src/lib/store.ts` (`openTutorWithContext(focus, opts?)`, `setAttemptHelpLevel`), `TutorBubble.tsx`, `MicroLessonPlayer.tsx`, `study.tsx`, `LessonPlayer.tsx`, `src/lib/features.ts` (`contextoPedagogicoIA`).
- Faz: abrir + enviar uma vez; gravar `helpLevel` e eventos; incrementar `helpHeavyRecent`.
- Critério: E2E `tutor.spec.ts` estendido (com a rota do tutor interceptada): uma única requisição com `pedagogy`; erro de questão continua sem abrir o balão.

**F7.7 — Copy, rótulos e inventário** · SONNET · `humanizer:humanizer`
- Arquivos: `copy.ts`, `docs/21`.
- Faz: `COPY.explicacao.porQue = "Por que essa resposta?"`, `.aindaNao = "Ainda não entendi"`, `.ensinarDoComeco = "Me ensina do começo"`; troca `COPY.licao.roles.checkpoint` de "Checkpoint" para "Checagem rápida" (`30` §13.6) e ajusta E2E que dependam do texto.
- Critério: inventário atualizado; E2E verdes.

### Testes
Novos + `tutor-prompt`, `tutor-validation`, `tutor-focus`, E2E `tutor.spec.ts`, `explanation-ladder.spec.ts`, `feedback.spec.ts`.

### Critérios de aceite
- **AC-7.1** Três níveis funcionando nas três superfícies; nível 1 aberto no erro/"não sei", recolhido no acerto.
- **AC-7.2** Nível 3 envia uma mensagem com `pedagogy` válida (≤ 2.000 caracteres) sem o aluno digitar.
- **AC-7.3** Errar não abre o tutor (regressão do `20` A2).
- **AC-7.4** Servidor rejeita `pedagogy` fora dos limites; revisão L2 registrada.
- **AC-7.5** Sem chave de API, nível 3 mostra fallback útil.
- **AC-7.6** "Checagem rápida" substitui "Checkpoint" dentro da aula.

### Definition of Done
AC-7.1…7.6; flags `explicacaoEmCamadas` e `contextoPedagogicoIA` ligadas ao fim com suíte verde.

### Instruções para a IA executora
Não troque o provedor nem o modelo do tutor. Não envie ao servidor histórico além do definido. Não coloque número no prompt que não venha do app.

### Context Pack
- Objetivo: escada + IA com contexto.
- Ler do `30`: §16.2–16.4, §17. Do `20`: §4.2 (tutor manual).
- Arquivos: listados.
- Contratos: `TutorContext` ganha `pedagogy?`; `TutorFocus` ganha `exerciseId?`; `openTutorWithContext(focus, opts?)`.
- Não pode mudar: `generateTutorReply` (transporte, timeout, modelo), regras de voz do prompt.
- Arquivos quentes: `store.ts`, `copy.ts`, `features.ts`.

### Prompt para o executor
> Você vai executar a Fase 7 do SDD do Foca (`docs/31` §11). Leia o Context Pack, o `docs/30` §16.2–16.4 e §17, e o `docs/20` §4.2. Objetivo: escada de explicação em três níveis dentro da `FeedbackSheet` ("Por que essa resposta?", "Ainda não entendi", "Me ensina do começo") e contexto pedagógico enxuto para a Foca IA (`src/lib/tutor-context.ts`), com a server function validando limites de tamanho (segurança L2: rode a revisão de segurança sobre o diff). O nível 3 abre o balão e envia um único pedido; errar continua sem abrir nada. Troque o rótulo "Checkpoint" da checagem dentro da aula por "Checagem rápida". Tudo atrás das flags `explicacaoEmCamadas` e `contextoPedagogicoIA`. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`. Critérios AC-7.1 a AC-7.6. Sem commit.

---

## 12. Fase 8 — Motor adaptativo e observabilidade

**Tipo:** BLOQUEANTE · **Depende de:** F5, F6 · **Modelo:** FORTE para F8.2, F8.4, F8.5, F8.10; SONNET no resto · **Skills:** `superpowers:test-driven-development`; revisão `agent-skills:code-review-and-quality` + `agent-skills:performance-optimization` (só na F8.10)

### Objetivo
Motor puro e determinístico que produz o plano da jornada com motivos, proporção 70/20/10, restrições curriculares, seleção de itens por dificuldade e fallback; painel `/debug` que mostra por que cada atividade foi escolhida.

### Motivação
`30` §11 e §27; P7.

### Dependências
F5 (modelo), F6 (sinais), F3 (índice de itens), F2 (grafo).

### Estado atual
`recommendNext` (`src/lib/learning/recommend.ts`) e `buildTrail` (`trail.ts:385`) — ficam intactos; o motor novo convive e usa `buildTrail` no fallback.

### Alterações necessárias
Módulos `src/lib/adaptive/*` (lógica), rota de debug, flag `jornadaAdaptativa` (desligada até a F12).

### Arquivos afetados
`src/lib/adaptive/types.ts` (tipos já criados na F4), `src/lib/features.ts` (override local de flags para debug), `src/routes/__root.tsx` (remover o botão de áudio provisório da F1.2 quando `/debug` existir).

### Novos arquivos
**NOVOS** `src/lib/adaptive/classify.ts`, `candidates.ts`, `scoring.ts`, `planner.ts`, `select-items.ts`, `fallback.ts`, `trace.ts`, `index.ts` (`planWithFallback`, `selectItemsForActivity`); `src/routes/debug.tsx`; testes `tests/unit/adaptive-classify.test.ts`, `adaptive-scoring.test.ts`, `adaptive-planner.test.ts`, `adaptive-select-items.test.ts`, `adaptive-fallback.test.ts`, `sim-engine.test.ts`, `adaptive-perf.test.ts`; `tests/e2e/debug.spec.ts`.

### Dados
Lê `AppState`; não grava (quem grava o plano é a F12). Trace em memória (anel de 20).

### Backend
Não se aplica.

### Frontend
`/debug` (arquivo de rota novo; só renderiza conteúdo com `?debug=1` ou `import.meta.env.DEV`; caso contrário redireciona para `HOME_ROUTE`). Abas: Plano, Habilidades, Tentativas, Áudio, Flags. Visual simples com componentes `ds/`; sem requisito de polimento.

### Algoritmo
`30` §11.2–11.8 (classificação, candidatos, pontuação, proporção, restrições, seleção de itens, fallback). Detalhes que o executor não deve decidir:

```text
constantes do motor (src/lib/adaptive/constants.ts, seção MOTOR):
  PESOS = { necessidade: .30, objetivo: .20, urgencia: .15, ordem: .15, equilibrio: .10, variedade: .10 }
  MIX = { atual: .70, revisao: .20, desafio: .10 }  BONUS_DEFICIT = .25  REVISAO_MAX_ATRASO = .35
  JANELA_MIX = 10  JANELA_EQUILIBRIO = 20  PLANO_N = 8  COMPROMETIDAS = 3
  ITENS = { pratica: 5, revisao: 4, desafio: 3, reforco: 4, introducao: 4 }  P_ALVO = { pratica: .70, revisao: .80, desafio: .50, reforco: .85, introducao: .80 }
  MINUTOS_ESTIMADOS: aula = soma de estimatedTeachingSeconds+Practice ; item = meta.estimatedSeconds (padrão 60)
bucket(kind): aula|pratica|reforco|legado → "atual" ; revisao → "revisao" ; desafio → "desafio" ; checkpoint → fora do mix
matériasPermitidas(state, today): focusSession válida ? focusSession.subjectIds : studyFocus.mode == "todas" ? todas : studyFocus.subjectIds ∪ matérias das áreas
determinismo: seed = localDate ; hash = FNV-1a 32 bits de `${seed}:${skillId}` ; empate por skillId lexical, depois hash
aula opcional: habilidade NOVA com Mastery ≥ 80 E Confidence ≥ 60 E source ∈ {evidencia} com evidência diagnóstica → vira "pratica" de confirmação (3 itens) em vez de aula; se core, sempre confirmação
```

Checkpoint: nesta fase, `deveInserirCheckpoint` já existe mas só é chamado se `FEATURES.checkpointsTrilha` (desligada até a F14).

### Edge cases
- Nenhuma habilidade elegível (conteúdo esgotado) → plano só com revisões/desafios; se nem isso, plano vazio com `reason` que a F12 transforma na mensagem do `30` §14.5.
- Pool de itens curto → reduz n (mínimo 2), trace `pool-curto`.
- Matéria no foco sem conteúdo ativo → trace `foco-sem-conteudo`; o plano usa as outras matérias do foco; se nenhuma, cai no fallback com motivo.
- Estado sem `skillModel` (flag `off`) → `planWithFallback` usa o fallback.
- Relógio: "hoje" sempre `hojeISO()` local, nunca UTC.

### Performance
`adaptive-perf.test.ts`: 500 habilidades sintéticas, 6.000 itens no índice, `planNext` < 20 ms (média de 50 execuções, máx < 60 ms) no runner do CI local; registrar números no `32`.

### Segurança
L1.

### Tarefas

**F8.1 — Índice de módulos e tipos** · SONNET
- Arquivos: `src/lib/adaptive/types.ts` (completar se preciso), **NOVO** `index.ts`, seção MOTOR em `constants.ts`.
- Critério: `tsc`.

**F8.2 — Classificação de habilidades** · FORTE · TDD
- Arquivos: **NOVO** `classify.ts`, `tests/unit/adaptive-classify.test.ts`.
- Faz: `classifySkill(skill, state, today) → { state: "IGNORAR"|"BLOQUEADA"|"NOVA"|"EM_APRENDIZADO"|"FIRME"|"REFORCO"; due: boolean; reasons }` e `prerequisiteSatisfied`.
- Critério: um teste por estado e por regra de pré-requisito (inclusive planejada, aula concluída, Mastery/Confidence nos limiares).

**F8.3 — Candidatos** · SONNET · TDD
- Arquivos: **NOVO** `candidates.ts`, testes.
- Faz: tabela do `30` §11.3, incluindo legado (lição da trilha mapeada, respeitando `isLessonUnlocked`) e aula existente (`phaseById`) para a habilidade.
- Critério: testes por estado; nunca candidato de habilidade BLOQUEADA ou fora do foco.

**F8.4 — Pontuação** · FORTE · TDD
- Arquivos: **NOVO** `scoring.ts`, `tests/unit/adaptive-scoring.test.ts`.
- Faz: fatores do `30` §11.4 com `scoreBreakdown`.
- Critério: testes de cada fator isolado e de monotonicidade (mais necessidade → mais score).

**F8.5 — Planejador** · FORTE · TDD
- Arquivos: **NOVO** `planner.ts`, `tests/unit/adaptive-planner.test.ts`.
- Faz: `planNext(state, catalog, today, n)`: restrições duras, bônus de déficit, sequência aula→prática, máx. 2 seguidas por matéria, desafio ≤ 2/10, comprometidas preservadas se válidas.
- Critério: testes das restrições; determinismo (mesmo input → mesmo output); comprometidas não mudam entre dois planejamentos sem evento.

**F8.6 — Seleção de itens** · SONNET · TDD
- Arquivos: **NOVO** `select-items.ts`, `tests/unit/adaptive-select-items.test.ts`.
- Faz: `30` §11.7 (b-alvo, exclusões, randomesque com semente, ordem crescente, completar com vizinha, mínimo 2).
- Critério: para θ = 0, p-alvo 0,7 e item de 5 alternativas, `b-alvo` ≈ −0,85 ± 0,1; nunca item visto hoje.

**F8.7 — Fallback** · SONNET · TDD
- Arquivos: **NOVO** `fallback.ts`, `index.ts` (`planWithFallback`), `tests/unit/adaptive-fallback.test.ts`.
- Faz: `30` §11.8; evento `plan-fallback` via `recordEvent` (a chamada é feita por quem persiste — a F12; aqui só devolve `fallback: true`).
- Critério: exceção injetada em `planNext` → plano de fallback com `reasons: ["fallback"]` baseado em `buildTrail().continueTarget`.

**F8.8 — Trace** · SONNET
- Arquivos: **NOVO** `trace.ts`.
- Faz: `DecisionTrace` (candidatos, estados, pontuação, restrições, motivo) em anel de 20; `formatTrace()` no formato do `30` §27.
- Critério: teste de formatação.

**F8.9 — Painel de debug** · SONNET
- Arquivos: **NOVOS** `src/routes/debug.tsx`, `tests/e2e/debug.spec.ts`; `src/lib/features.ts` (override `localStorage["foca.flags"]` só com `?debug=1`/dev); `src/routes/__root.tsx` (remover botão provisório F1.2).
- Faz: abas (Plano via `planWithFallback` + trace; Habilidades com Mastery/Confidence/partes/σ/nEff/agenda; Tentativas recentes; Áudio `getAudioDiagnostics`; Flags com override; "Exportar JSON").
- Critério: E2E abre `/debug?debug=1` e vê as abas; sem `?debug=1` em produção redireciona.

**F8.10 — Simulação e desempenho** · FORTE
- Arquivos: **NOVOS** `tests/unit/sim-engine.test.ts`, `adaptive-perf.test.ts`.
- Faz: cenários A, B, C, E, F, H do `30` §26.3 (motor + modelo com o aluno simulado da F5.8), proporção 70/20/10 em janela de 20 (60–80 / 15–30 / ≤15), nenhuma sequência de 3 da mesma matéria em 30 atividades; desempenho.
- Critério: asserções verdes com 3 sementes; tempos registrados no `32`.

### Testes
Todos os novos; suíte existente intocada (o motor ainda não é usado por nenhuma tela).

### Critérios de aceite
- **AC-8.1** Motor puro: sem import de React, store (exceto tipos) ou rede; determinístico.
- **AC-8.2** Cenários A, B, C, E, F, H e proporção 70/20/10 verdes com 3 sementes.
- **AC-8.3** Nenhuma habilidade introduzida com pré-requisito não satisfeito; `core` nunca pulada sem confirmação (teste).
- **AC-8.4** Fallback cobre exceção, flag desligada e conteúdo ausente.
- **AC-8.5** `planNext` < 20 ms médio no cenário grande.
- **AC-8.6** `/debug` mostra plano com motivo e decomposição de score.

### Definition of Done
AC-8.1…8.6; constantes documentadas; `32` com números de desempenho e das simulações.

### Instruções para a IA executora
Não ligue `jornadaAdaptativa` nesta fase. Não substitua `recommendNext`/`buildTrail`. Constantes num lugar só. Nenhuma chamada de IA no motor.

### Context Pack
- Objetivo: motor + debug.
- Ler do `30`: §7.2, §7.4, §10.5, §11, §15 (regras de foco), §26.3, §27.
- Arquivos: `src/lib/adaptive/*` (model/confidence da F5), `src/content/taxonomy/index.ts`, `src/content/items/index.ts`, `src/content/microlicoes/index.ts` (`phaseById`), `src/content/trilhas/index.ts`, `src/lib/learning/trail.ts` (`buildTrail`, só leitura), `src/lib/store.ts` (`isLessonUnlocked`, tipos).
- Contratos: `PlannedActivity`, `JourneyPlan`, `planWithFallback(state, today) → JourneyPlan`, `selectItemsForActivity(activity, state, today) → string[]`.
- Não pode mudar: `recommendNext`, `buildTrail`, qualquer tela.
- Arquivos quentes: `features.ts` (override), `__root.tsx` (remover botão provisório).

### Prompt para o executor
> Você vai executar a Fase 8 do SDD do Foca (`docs/31` §12). Leia o Context Pack e o `docs/30` §7.2, §7.4, §10.5, §11, §15, §26.3 e §27. Objetivo: motor adaptativo puro e determinístico em `src/lib/adaptive/` (classificação por habilidade, candidatos, pontuação com decomposição, planejador com proporção 70/20/10 e restrições curriculares, seleção de itens por dificuldade-alvo, fallback para `buildTrail`) e o painel `/debug` (só com `?debug=1` ou em dev). Use as constantes exatamente como estão no Context Pack. Não ligue a flag `jornadaAdaptativa` e não mude nenhuma tela. TDD, simulações A, B, C, E, F, H com 3 sementes e teste de desempenho (< 20 ms). Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`. Critérios AC-8.1 a AC-8.6. Registre números no `docs/32`. Sem commit.

---

## 13. Fase 9 — Pipeline de conteúdo com IA

**Tipo:** PARALELIZÁVEL (com F4–F8) · **Depende de:** F2, F3 · **Modelo:** SONNET; FORTE para desenhar prompts de crítica/escalonamento · **Skills:** `superpowers:test-driven-development`; revisão `agent-skills:code-review-and-quality` + `agent-skills:security-and-hardening` (segredos do pipeline)

### Objetivo
Pipeline offline, com contratos de arquivo, que transforma um plano de lote em conteúdo publicado em `src/content/banco/`, com gerador, crítico, solucionador independente, verificador, escalonamento, Humanizer com guarda, validação, amostra humana e relatório.

### Motivação
`30` §19; O10; ordem obrigatória do pedido: pipeline e validação antes do conteúdo em escala.

### Dependências
F2 (habilidades), F3 (schema de item/pacote).

### Estado atual
Não existe. `scripts/` tem `gerar-logos-foca.ps1` e `validate-skills.mjs`.

### Alterações necessárias
Pasta de pipeline, prompts, scripts de estágio, guarda do Humanizer, validação, publicação, relatório.

### Arquivos afetados
`.gitignore` (já coberto na F0.3), `.env.example` (variáveis `CONTENT_LLM_*` comentadas, sem valor).

### Novos arquivos
**NOVA PASTA** `content-pipeline/` (`README.md`, `prompts/*.md`, `schemas/`, `relatorios/`), **NOVOS** `scripts/content/coverage.ts`, `plan-batch.ts`, `run-stage.ts`, `verify.ts`, `humanize-guard.ts`, `validate.ts`, `publish.ts`, `schema-export.ts`; testes `tests/unit/pipeline-verify.test.ts`, `pipeline-humanize-guard.test.ts`, `pipeline-validate.test.ts`, `pipeline-publish.test.ts`.

### Dados
Formato do lote (JSONL, uma linha por candidato):

```ts
interface Candidate {
  candidateId: string;            // "<loteId>-<n>"
  skillId: string; difficulty: 1|2|3|4|5; role: "pratica"|"revisao"|"desafio"|"diagnostico";
  kind: "item" | "aula";
  exercise?: Exercise;            // formato do motor, 7 tipos
  lesson?: MicroLessonV2;         // para aulas
  meta: Partial<ItemMeta>;
  stages: {
    generated?: { model: string; at: string };
    critique?: { model: string; verdict: "aprova"|"corrige"|"rejeita"; issues: string[]; fixed?: Exercise };
    solution?: { model: string; answerIndex: number | number[]; confidence: number; reasoning: string };
    verification?: { agree: boolean; escalated: boolean; finalAnswer?: number | number[]; judge?: string; note?: string };
    humanized?: { model: string; accepted: boolean; rejectedBecause?: string[] };
    validation?: { ok: boolean; issues: string[] };
    humanReview?: { reviewer: string; verdict: "aprova"|"reprova"; note?: string };
  };
}
```

### Backend
Nenhum no app. `run-stage.ts` (Modo B) chama um endpoint compatível com a API de chat da OpenAI: `POST ${CONTENT_LLM_BASE_URL}/chat/completions` com `model = CONTENT_LLM_MODEL_<ESTAGIO>`, `response_format: json_object` quando suportado; lê chave de `CONTENT_LLM_API_KEY`. Pode ser OmniRoute local (`npx omniroute`), Anthropic via camada compatível, ou OpenAI.

### Frontend
Não se aplica.

### Algoritmo
`30` §19.2 (estágios), §19.4 (guarda), §19.5 (regras), §19.6 (métricas).

```text
verify(candidate):
  gen = índice correto do gerador (após crítica) ; sol = solution.answerIndex ; conf = solution.confidence
  agree = igual(gen, sol) && conf ≥ 0,8
  !agree → escalated = true (estágio 4b) → juiz SONNET recebe item + as duas respostas + raciocínios
           juiz confirma um dos dois com justificativa → finalAnswer ; se "ambíguo" → rejeita
  4b ainda discordante do gerador e do solucionador → modelo FORTE ou rejeição (configurável; padrão: rejeitar)
humanizeGuard(before, after):
  invariantes = números (/-?\d+([.,]\d+)?/), frações, %, unidades (km, m/s, mol, g, L, °C, R$), fórmulas (/[=+\-×÷*/^√]/ entre tokens),
                nomes próprios (palavras capitalizadas fora do início de frase), datas, negações (não, nunca, exceto, jamais, nenhum)
  multiset(invariantes(before)) != multiset(invariantes(after)) → rejeita humanização (mantém before), registra o que mudou
  só aplica a: exercise.explicacao, meta.explanationLayers.*, lesson teach/intro/recap/tip bodies
publish(lote): só candidatos com validation.ok && (humanReview aprovada || lote aprovado por amostra e item não escalado)
               grava src/content/banco/<materia>/<skillId>.json (merge por id, ordem estável), status "verificada-ia" ou "revisada-humano"
               ids: "gen:<skillId>:<hash8 do enunciado normalizado>" (estável, sem colisão com q<n> ou <lesson>:<i>)
```

### Edge cases
Modelo devolve JSON inválido → 1 retentativa com a mensagem de erro; depois rejeita. Lote interrompido → `run-stage.ts` retoma do último JSONL completo (idempotente por `candidateId`). Item duplicado entre lotes → validação por Jaccard (§19.5). Custo acima do orçamento do lote (`--budget-tokens`) → para e reporta.

### Performance
Estágios em paralelo por candidato com limite de concorrência (`--concurrency`, padrão 4).

### Segurança
Chaves só em `.env` local; `run-stage.ts` nunca loga a chave nem o corpo inteiro de resposta com erro; `scripts/content/**` nunca importado por `src/` (teste de import: `grep` em CI). Prompts tratam o conteúdo como dado.

### Tarefas

**F9.1 — Estrutura e README do pipeline** · SONNET
- Arquivos: **NOVOS** `content-pipeline/README.md` (os dois modos, estágios, contratos, como rodar), `.env.example`.
- Critério: README descreve Modo A (subagentes com `model: haiku|sonnet`) e Modo B (endpoint compatível), com exemplo de comando.

**F9.2 — Schemas exportados** · SONNET
- Arquivos: **NOVO** `scripts/content/schema-export.ts` → `content-pipeline/schemas/*.json` a partir de `src/content/items/schema.ts`.
- Critério: script roda sem diff quando nada muda.

**F9.3 — Prompts** · FORTE (desenho) → SONNET (escrita)
- Arquivos: **NOVOS** `content-pipeline/prompts/gerar-item.md`, `gerar-aula.md`, `criticar.md`, `resolver.md`, `escalar.md`, `classificar.md`, `humanizar.md`.
- Faz: cada prompt com papel, entrada, saída JSON estrita (schema), checklist; `gerar-aula.md` impõe as regras v2 do `25` §6.5; `resolver.md` nunca recebe gabarito; `humanizar.md` lista o que não pode mudar e a voz do `20` §7.1 com amostra da copy aprovada do `21` §2; `criticar.md` inclui ambiguidade, distrator implausível, "pegadinha" de leitura, viés, dado inventado, alinhamento à habilidade e ao nível.
- Critério: revisão do usuário ou de modelo FORTE registrada no `32`.

**F9.4 — Cobertura e plano de lote** · SONNET · TDD
- Arquivos: **NOVOS** `coverage.ts`, `plan-batch.ts`.
- Faz: `coverage` por habilidade ativa: aula? itens por dificuldade e papel? itens diagnósticos revisados? → relatório markdown; `plan-batch` gera `01-plano.json` com o que falta até a meta da onda (`30` §18.1), limitado por `--max`.
- Critério: teste com catálogo de fixture.

**F9.5 — Executor de estágio (Modo B) e roteiro do Modo A** · SONNET
- Arquivos: **NOVO** `run-stage.ts`; seção "Modo A" no README com o prompt do orquestrador.
- Faz: `bun scripts/content/run-stage.ts --lote <id> --estagio gerar|criticar|resolver|escalar|humanizar [--concurrency 4] [--budget-tokens N]`; retomada idempotente; contagem de tokens (campo `usage` da resposta) no relatório.
- Critério: teste com servidor HTTP falso (bun) cobrindo sucesso, JSON inválido + retentativa, retomada.

**F9.6 — Verificador** · SONNET · TDD
- Arquivos: **NOVO** `verify.ts`, `tests/unit/pipeline-verify.test.ts`.
- Critério: casos concorda/discorda/confiança baixa/ordenar/parear.

**F9.7 — Guarda do Humanizer** · SONNET · TDD
- Arquivos: **NOVO** `humanize-guard.ts`, `tests/unit/pipeline-humanize-guard.test.ts`.
- Critério: rejeita mudança de número, unidade, fórmula, negação e nome próprio; aceita troca de estrutura de frase sem mudar invariantes (casos reais das explicações de porcentagem e crase).

**F9.8 — Validação de item** · SONNET · TDD
- Arquivos: **NOVO** `validate.ts`, `tests/unit/pipeline-validate.test.ts`.
- Faz: `30` §19.5 + `validateMicroLessons`/`validateLessonSteps` existentes para aulas.
- Critério: um teste por regra.

**F9.9 — Publicação e relatório** · SONNET · TDD
- Arquivos: **NOVO** `publish.ts`, `tests/unit/pipeline-publish.test.ts`; `content-pipeline/relatorios/`.
- Faz: publicação idempotente, geração de `08-amostra.md` (itens sorteados para humano com checkbox) e relatório do lote (métricas do `30` §19.6); bloqueio se conflito > 15% ou reprovação humana > 5%.
- Critério: publicar 2× não duplica; `build-packs` (F3.7) empacota o resultado.

### Testes
Unitários do pipeline; teste de fronteira "nenhum arquivo de `src/` importa `scripts/content`".

### Critérios de aceite
- **AC-9.1** Pipeline roda ponta a ponta num lote de fixture de 5 itens com servidor falso (Modo B).
- **AC-9.2** Solucionador nunca recebe gabarito (teste do payload montado).
- **AC-9.3** Humanizer rejeitado quando muda invariante (teste).
- **AC-9.4** Validação cobre todas as regras do `30` §19.5.
- **AC-9.5** Publicação idempotente e bloqueio por métrica.
- **AC-9.6** Nenhum segredo em código/log; `scripts/content` isolado de `src/`.

### Definition of Done
AC-9.1…9.6; README do pipeline revisado.

### Instruções para a IA executora
Não gere conteúdo real nesta fase (isso é a F11). Não use o OmniRoute como integração do app. Não coloque chave em arquivo versionado.

### Context Pack
- Objetivo: pipeline com portões.
- Ler do `30`: §18.3, §19 inteiro, §29. Do `25`: §6.5 (regras de aula v2). Do `20`: §7.1 (voz).
- Arquivos: `src/content/items/schema.ts`, `src/lib/learning/validate.ts`, `src/lib/lessons/types.ts`, `src/content/taxonomy/index.ts`, `scripts/content/build-packs.ts`.
- Contratos: `Candidate`; ids `gen:<skillId>:<hash8>`; saída em `src/content/banco/<materia>/<skillId>.json`.
- Não pode mudar: formato `Exercise`; validadores existentes (só reutilizar).
- Arquivos quentes: nenhum de `src/lib`.

### Prompt para o executor
> Você vai executar a Fase 9 do SDD do Foca (`docs/31` §13). Leia o Context Pack, o `docs/30` §18.3, §19 e §29, o `docs/25` §6.5 e o `docs/20` §7.1. Objetivo: construir o pipeline offline de conteúdo (`content-pipeline/` + `scripts/content/`): plano de lote a partir da cobertura, estágios gerar → criticar → resolver sem gabarito → verificar/escalar → humanizar com guarda de invariantes → validar → amostra humana → publicar, com relatório de métricas. Dois modos de execução com os mesmos arquivos: subagentes do Claude Code ou script contra endpoint compatível com a API da OpenAI (pode ser o OmniRoute). Não gere conteúdo real ainda, não coloque chaves no repositório, e garanta que `src/` nunca importa `scripts/content`. TDD. Testes: `bunx tsc --noEmit`, `bun test tests/unit`. Critérios AC-9.1 a AC-9.6. Sem commit.

---

## 14. Fase 10 — Fontes oficiais, parâmetros do Inep e questões oficiais do ENEM

**Tipo:** PARALELIZÁVEL (não bloqueia F11–F14, mas alimenta o pool delas) · **Depende de:** F3 (schema de item) · **Modelo:** SONNET; HAIKU para extração/transcrição em lote, com conferência humana/SONNET de 100% do gabarito · **Skills:** nenhuma primária específica; revisão `agent-skills:code-review-and-quality`

### Objetivo
Usar dados abertos do Inep (parâmetros TRI, habilidade da Matriz, gabarito por item) para priorizar a Onda 1 e calibrar a distribuição de dificuldade estimada; **importar questões oficiais de provas antigas do ENEM** (fáceis e difíceis, várias edições), com atribuição de ano e vestibular em cada uma.

### Motivação
`30` §12.4 e §18.4. Decisão do usuário em 23/09/2026: reproduzir texto de questões do ENEM de anos anteriores é aceitável, com o ano e o vestibular sempre citados junto ao enunciado — sem parecer jurídico formal, risco assumido pelo dono do produto. Itens oficiais dão ao nivelamento e ao checkpoint (que hoje dependem 100% de itens gerados por IA revisados por amostra) uma base com gabarito garantido desde a fonte.

### Dependências
F3 (schema `ItemMeta`/`Exercise` para receber os itens importados).

### Estado atual
Nada importado. Os microdados do ENEM trazem `ITENS_PROVA_<ano>.csv` com `CO_POSICAO`, `SG_AREA`, `CO_ITEM`, `TX_GABARITO`, `CO_HABILIDADE`, `NU_PARAM_A`, `NU_PARAM_B`, `NU_PARAM_C` (confirmar nomes exatos no dicionário de dados do ano baixado; variam entre edições).

### Alterações necessárias
Registrar a decisão; script de importação de parâmetros; tabela de incidência; calibração de `b` por habilidade da Matriz; importador de questões oficiais (texto, alternativas, gabarito) a partir das provas e gabaritos publicados pelo Inep.

### Arquivos afetados
`src/content/items/irt.ts` (ajuste de `b` por `enemSkills` quando houver tabela), `src/content/items/types.ts` (`source.kind: "oficial"` já previsto na F3), `docs/32`.

### Novos arquivos
**NOVOS** `scripts/content/import-inep-params.ts`, `src/content/oficial/inep-parametros.json` (só números e códigos, com atribuição), `src/content/oficial/README.md` (fonte, licença, data do download), `scripts/content/incidence.ts`, `scripts/content/import-official-items.ts`, `src/content/banco/oficial/<ano>.json` (itens oficiais transcritos, um arquivo por ano/edição); **NOVO** `docs/34-decisao-questoes-oficiais.md` (registro da decisão); testes `tests/unit/inep-params.test.ts`, `tests/unit/official-items.test.ts`.

### Dados

```ts
interface InepItemParams { ano: number; area: "LC"|"MT"|"CN"|"CH"; coItem: number; habilidade: number /* 1..30 */;
                           gabarito: string; a: number; b: number; c: number; adaptado: boolean; abandonado: boolean }
// incidência: por área+habilidade, nº de itens nos últimos N anos → peso 1..3
// calibração: por área+habilidade, mediana e IQR de b entre itens não abandonados
```

### Backend / Frontend
Não se aplica.

### Algoritmo

```text
calibrarB(meta):
  se meta.irt.source == "estimado" e meta.skillIds[0] tem enemSkills e existe tabela para (área, H):
     b_ajustado = mediana_H + (b_editorial / 1,6) · (IQR_H / 1,35)   // mantém a ordem editorial, centra na distribuição real
     guardar em meta.irt como { ...irt, b: b_ajustado, source: "estimado" } e registrar calibratedFrom: "inep-distribuicao"
     (campo opcional novo `ItemIrt.calibratedFrom?`)
```

Isso não reproduz item, só usa distribuição estatística de dados abertos.

### Edge cases
CSV com separador `;` e codificação latin-1 (tratar); itens abandonados (`IN_ITEM_ABAN = 1`) fora; itens de língua estrangeira separados por `TP_LINGUA`; anos sem parâmetro publicado → pular e registrar.

### Performance
Importação offline; `inep-parametros.json` fica fora do bundle (usado só por scripts; a tabela de calibração resultante é pequena e entra em `irt.ts`).

### Segurança
Dados públicos, sem dado pessoal (o arquivo de itens não tem participantes; **não** baixar/versionar os microdados de participantes).

### Tarefas

**F10.1 — Registro da decisão** · SONNET
- Arquivos: **NOVO** `docs/34-decisao-questoes-oficiais.md`.
- Faz: transcrever o `30` §18.4 já atualizado e a decisão do usuário de 23/09/2026 ("reproduzir questões antigas do ENEM, fáceis e difíceis, sempre com ano e vestibular atribuídos; sem parecer jurídico formal, risco aceito pelo usuário"); registrar que a regra continua sendo **só ENEM** (outros vestibulares — Fuvest, Unicamp, Cebraspe/PAS — continuam sem reprodução) e **sem imagem/charge de terceiros**.
- Critério: documento existe e o `32` aponta para ele.

**F10.2 — Importar parâmetros** · HAIKU (mapeamento de colunas) → SONNET (script)
- Arquivos: **NOVOS** `import-inep-params.ts`, `src/content/oficial/inep-parametros.json`, `src/content/oficial/README.md`, `tests/unit/inep-params.test.ts`.
- Faz: `bun scripts/content/import-inep-params.ts --csv <caminho> --ano <aaaa>`; o CSV não é versionado.
- Critério: teste com CSV de fixture (5 linhas, latin-1, `;`).

**F10.3 — Incidência** · SONNET
- Arquivos: **NOVO** `incidence.ts`.
- Faz: peso 1–3 por (área, H) → sugere `incidence` para `SkillDef` via `enemSkills`; relatório para revisão (não altera a taxonomia sozinho).
- Critério: relatório gerado; mudanças na taxonomia só com aprovação registrada.

**F10.4 — Calibração de `b`** · SONNET · TDD
- Arquivos: `src/content/items/irt.ts`, `types.ts` (`calibratedFrom?`), testes.
- Critério: ordem editorial preservada; itens sem `enemSkills` intactos.

**F10.5 — Importador de questões oficiais do ENEM** · HAIKU (transcrição em lote) → SONNET (conferência e integração)
- Arquivos: **NOVOS** `import-official-items.ts`, `src/content/banco/oficial/<ano>.json`, `tests/unit/official-items.test.ts`.
- Faz: para cada edição-alvo (ver fonte abaixo), extrair enunciado, alternativas (A–E) e gabarito oficial de `download.inep.gov.br/enem/provas_e_gabaritos/<ano>_PV_impresso_*.pdf` (prova) + o gabarito oficial publicado junto; classificar habilidade (Matriz/`enemSkills`) e dificuldade estimada (1–5, a partir do desempenho relatado nos microdados quando disponível, senão dificuldade editorial revisada); **descartar** todo item cuja resolução dependa de imagem, charge, mapa, gráfico ou texto extenso de terceiro reproduzido visualmente (registrar como "requer imagem — não importado"); manter só itens 100% texto (comuns em Matemática, boa parte de Linguagens/Humanas/Ciências da Natureza sem gráfico). Cada item grava `source: { kind: "oficial", exam: "ENEM", year: <ano>, ref: "caderno <cor> · questão <n>" }`, `validation.status: "oficial-conferida"` só depois da conferência de gabarito (SONNET resolve sem ver o gabarito oficial e compara — mesmo mecanismo do verificador da F9 — divergência vai para revisão humana antes de publicar), e `irt.source: "inep"` quando a tabela de parâmetros da F10.2 cobrir o item. O **enunciado e as alternativas na UI sempre mostram a atribuição** ("ENEM 2019") — `ExerciseImage.credito` já existe para imagem; para item sem imagem, novo campo `Exercise` opcional (`fonte?: string`, seguindo o padrão de `InterpretExercise.fonte` que já existe) exibido abaixo do enunciado.
- Meta inicial: cobrir pelo menos 3 edições diferentes do ENEM (ex.: as mais recentes com PDF disponível), com itens espalhados por dificuldade fácil/média/difícil e pelas 4 áreas onde não exigirem imagem.
- Critério: cada item importado tem gabarito conferido por duas fontes independentes (Inep + solucionador SONNET) e mostra ano+"ENEM" na UI (teste de snapshot do componente de exercício com um item oficial).

### Testes
`inep-params.test.ts`, `official-items.test.ts`, testes de `irt.ts`.

### Critérios de aceite
- **AC-10.1** Decisão registrada em `docs/34`, incluindo o limite (só ENEM, sem imagem de terceiro).
- **AC-10.2** Parâmetros importados de ≥ 3 anos, com fonte e data no README.
- **AC-10.3** Tabela de incidência usada na priorização da Onda 1 (relatório anexado ao `32`).
- **AC-10.4** Calibração preserva a ordem editorial (teste).
- **AC-10.5** Todo item oficial importado exibe ano e "ENEM" junto ao enunciado na UI; nenhum item com imagem de terceiro foi importado; gabarito conferido por duas fontes.

### Definition of Done
AC-10.1…10.5.

### Instruções para a IA executora
Não baixe nem versione microdados de participantes (só o arquivo de itens/parâmetros e os PDFs de prova/gabarito, que são públicos). Não importe item que precise de imagem de terceiro para ser resolvido. Confirme os nomes de coluna no dicionário do ano. Todo item oficial precisa da atribuição visível na tela — não é opcional.

### Context Pack
- Objetivo: dado oficial aberto a serviço da calibração + banco de questões oficiais do ENEM com atribuição.
- Ler do `30`: §12.4, §18.4 (já atualizado com a decisão de 23/09/2026).
- Arquivos: `src/content/items/irt.ts`, `types.ts`, `src/content/taxonomy/*` (`enemSkills`), `src/lib/lessons/types.ts` (`Exercise`, `ExerciseImage.credito`, `InterpretExercise.fonte`).
- Não pode mudar: itens existentes; a regra de não importar imagem/charge de terceiro; a exigência de atribuição visível.

### Prompt para o executor
> Você vai executar a Fase 10 do SDD do Foca (`docs/31` §14). Leia o Context Pack e o `docs/30` §12.4 e §18.4. Objetivo: (1) registrar em `docs/34` a decisão do usuário de 23/09/2026 sobre questões oficiais; (2) importar parâmetros TRI/habilidade/gabarito dos microdados abertos do ENEM (CSV que eu vou fornecer) e gerar a tabela de incidência por habilidade e a calibração de `b`, preservando a ordem editorial; (3) importar questões oficiais de pelo menos 3 edições do ENEM — só itens 100% texto (sem imagem/charge/gráfico de terceiro), com o gabarito conferido por duas fontes independentes (o gabarito oficial do Inep e um solucionador que resolve sem ver o gabarito) e com o ano e "ENEM" sempre visíveis junto ao enunciado na tela. Não importe nada de outro vestibular. Não versione microdados de participantes. Testes: `bunx tsc --noEmit`, `bun test tests/unit`. Critérios AC-10.1 a AC-10.5. Sem commit.

---

## 15. Fase 11 — Conteúdo em escala (Ondas 0 e 1)

**Tipo:** BLOQUEANTE para ligar as flags das F12–F14 · **Depende de:** F9 (e F10.3 se disponível) · **Modelo:** HAIKU (gerar, criticar, resolver, humanizar), SONNET (escalar), FORTE (conflito persistente, aulas de habilidades difíceis) · **Skills:** `humanizer:humanizer` (dentro do estágio 5); revisão humana por amostra

### Objetivo
Onda 0: validar o pipeline com 24 itens de porcentagem. Onda 1: ~60 habilidades ativas com 1 aula v2 + ≥ 12 itens + 4 de revisão cada, e pool diagnóstico revisado por humano suficiente para nivelamento e checkpoint.

### Motivação
P1 e R4: sem conteúdo, a jornada e o nivelamento não têm o que escolher.

### Dependências
F9 pronta; taxonomia aprovada (AC-2.4); orçamento de tokens aprovado pelo usuário (`30` §29).

### Estado atual
`30` §2.2 (conteúdo mínimo). Depois da F3, os itens existentes já estão classificados.

### Alterações necessárias
Rodar lotes, revisar amostras, publicar, promover itens a `revisada-humano`, medir cobertura.

### Arquivos afetados
`src/content/banco/**` (dados gerados), `src/content/curriculum-tree.ts` (capítulos novos para as aulas geradas, um capítulo por tema), `content-pipeline/relatorios/*`, `docs/32`.

### Novos arquivos
Dados em `src/content/banco/<materia>/<skillId>.json`; relatórios de lote.

### Dados
Conteúdo com `ItemMeta` completo. Aulas geradas vão no mesmo JSON da habilidade (`lessons: MicroLessonV2[]`), com `chapterId` do capítulo novo.

### Backend / Frontend
Não se aplica (conteúdo entra via pacotes; flag `pacotesConteudo` ligada ao fim da Onda 0).

### Algoritmo
Pipeline do `30` §19. Ordem de geração na Onda 1: por área, habilidades em ordem topológica (pré-requisitos primeiro), `incidence` 3 antes de 2.

### Edge cases
Habilidade cujo lote bloqueia por métrica → não publicar, revisar prompt, registrar. Aula gerada que falha `validateLessonSteps` → rejeitada, nunca "ajustada à mão para passar" sem revisão. Item com imagem necessária (gráfico) → só com diagrama do catálogo controlado (`LearningDiagram` kinds existentes) ou SVG autoral revisado; na dúvida, item sem imagem.

### Performance
Pacote por matéria: alvo < 400 KB bruto (~80 KB gzip) na Onda 1; se passar, dividir por tema.

### Segurança
Revisar que nenhum item cita dado pessoal, marca comercial desnecessária ou conteúdo impróprio para menores (checklist do crítico + amostra humana).

### Tarefas

**F11.1 — Onda 0 (piloto)** · HAIKU/SONNET
- Faz: lote de 24 itens (`mat:porcentagem-valor`, `mat:porcentagem-fator-multiplicativo`: 4 fáceis, 4 médios, 4 difíceis cada); todos os estágios; amostra humana de 100% (é piloto).
- Critério: relatório com taxa de rejeição por estágio, conflito, reprovação humana e tokens.

**F11.2 — Ajuste de prompts** · SONNET (FORTE se conflito > 15%)
- Faz: ajustar prompts a partir dos defeitos da Onda 0; repetir um mini-lote de 8 itens até reprovação humana ≤ 5%.
- Critério: métricas do mini-lote registradas; `flag pacotesConteudo` ligada e E2E verdes com o pacote da Onda 0.

**F11.3 — Aulas da Onda 1** · HAIKU (gerar) → SONNET (escalar) → FORTE (habilidades marcadas "difíceis" no relatório)
- Faz: 1 aula v2 por habilidade ativa sem aula (≈ 52); capítulos novos em `curriculum-tree.ts` com `skillIds`.
- Critério: todas passam em `validateMicroLessons`/`validateLessonSteps`; amostra humana de 20% das aulas aprovada.

**F11.4 — Itens da Onda 1** · HAIKU → SONNET
- Faz: até a meta por habilidade (4/4/4 + 4 revisão), descontando itens já existentes da F3.
- Critério: `coverage.ts` sem lacuna nas habilidades ativas; lotes dentro das métricas.

**F11.5 — Sessões de revisão humana** · usuário/educador
- Faz: revisar as amostras (`08-amostra.md`) de cada lote; reprovação > 5% volta o lote.
- Critério: registro por lote no `32` (quem, quando, taxa).

**F11.6 — Pool diagnóstico** · SONNET + humano
- Faz: promover a `revisada-humano` com papel `diagnostico` pelo menos 12 itens por área LC/MT/CN/CH, espalhados em dificuldade (≥ 3 por faixa 1–2, 3, 4–5) e em ≥ 5 habilidades por área.
- Critério: `coverage.ts --diagnostico` mostra os mínimos atingidos.

**F11.7 — Relatório de cobertura** · SONNET
- Faz: anexar ao `32` o relatório final da Onda 1 (habilidades, aulas, itens por dificuldade, pool diagnóstico, tokens/custo, taxas).
- Critério: relatório anexado.

### Testes
`bun test tests/unit` (validações de conteúdo), `bun run build` (pacotes), E2E com `pacotesConteudo` ligada.

### Critérios de aceite
- **AC-11.1** Onda 0 com métricas registradas e prompts ajustados.
- **AC-11.2** Onda 1: ≥ 55 habilidades ativas com aula + ≥ 12 itens + 4 de revisão.
- **AC-11.3** Nenhum item publicado sem passar pelos estágios 3/4 e validação; nenhum item de IA com papel diagnóstico sem revisão humana.
- **AC-11.4** Pool diagnóstico mínimo por área atingido.
- **AC-11.5** Pacotes dentro do tamanho-alvo; build ok.

### Definition of Done
AC-11.1…11.5; `pacotesConteudo` ligada.

### Instruções para a IA executora
Não publique item reprovado. Não corrija gabarito manualmente sem registrar. Não ultrapasse o orçamento de tokens aprovado sem avisar.

### Context Pack
- Objetivo: conteúdo com qualidade verificada.
- Ler do `30`: §18, §19, §29. Do `content-pipeline/README.md`: tudo.
- Arquivos: `src/content/banco/**`, `src/content/curriculum-tree.ts`, relatórios.
- Não pode mudar: prompts sem registrar; schema.

### Prompt para o executor
> Você vai executar a Fase 11 do SDD do Foca (`docs/31` §15), usando o pipeline da Fase 9 (`content-pipeline/README.md`). Leia o Context Pack e o `docs/30` §18, §19 e §29. Primeiro a Onda 0 (24 itens de porcentagem, revisão humana de 100%) para medir o pipeline e ajustar prompts; depois a Onda 1 (≈60 habilidades ativas: 1 aula v2 + ≥12 itens + 4 de revisão cada, e pool diagnóstico revisado por humano com ≥12 itens por área). Use modelos baratos para gerar/criticar/resolver/humanizar e só escale para Sonnet (ou mais forte) em conflito. Preciso aprovar o orçamento de tokens antes da Onda 1 e revisar as amostras de cada lote. Critérios AC-11.1 a AC-11.5. Registre métricas e custo no `docs/32`. Sem commit.

---

## 16. Fase 12 — Jornada única e modo foco

**Tipo:** BLOQUEANTE · **Depende de:** F8 (código); F11 para ligar a flag · **Modelo:** SONNET · **Skills:** `frontend-design`, `vercel-react-best-practices`; revisão `web-design-guidelines` (+ `humanizer:humanizer` na copy)

### Objetivo
Home com "Sessão de hoje" e caminho único misturado, execução das atividades dinâmicas pelo player existente, foco permanente e temporário, e "Praticar"/"Progresso" alimentados pelo modelo — tudo atrás de `jornadaAdaptativa`, com a trilha atual intacta como mapa por matéria.

> **Nota (28/09/2026):** os contratos de início, conclusão e reposição da fila desta fase foram revistos pelo `36` (RF-1…RF-9, Fase 2): a rota `/atividade/$activityId` é a dona da seleção de itens, a conclusão é idempotente e a reposição preserva as comprometidas. Registro no `37`.

### Motivação
`30` §14–15; P6; O1, O2.

### Dependências
F8 (planner), F6 (sinais), F5 (display). Flag só liga com F11 cobrindo ≥ 3 áreas.

### Estado atual
`/trilha` (`src/routes/trilha.tsx`) renderiza `TrailHeader` → `SubjectChips` → `RecommendationHint` → `LearningPath`(`SubjectPath`). `useLearningSession(lesson)` conclui com `completeMicroLesson` e grava em `completedLessons`. `/progress` usa `progress.bySubject`.

### Alterações necessárias
Operações de jornada no store; rota `/atividade/$activityId`; estratégia de conclusão no hook; componentes da home; folha de foco; `/study` e `/progress` sob flag.

### Arquivos afetados
`src/lib/store.ts`, `src/hooks/useLearningSession.ts`, `src/components/learning/MicroLessonPlayer.tsx`, `src/routes/trilha.tsx`, `src/routes/learn.$lessonId.tsx`, `src/routes/study.tsx`, `src/routes/progress.tsx`, `src/routes/profile.tsx`, `src/components/learning/path/PathNode.tsx` (aceitar `kind` checkpoint/desafio e rótulo de matéria — sem quebrar o uso atual), `src/lib/learning/path-layout.ts` (se precisar de nó "planejado"), `src/lib/copy.ts`, `docs/21`, `src/lib/features.ts`.

### Novos arquivos
**NOVOS** `src/routes/atividade.$activityId.tsx`, `src/lib/adaptive/activity-lesson.ts`, `src/lib/adaptive/journey.ts` (orquestração: planejar, comprometer, iniciar, concluir — funções puras sobre `AppState` + ações do store), `src/components/learning/journey/SessionCard.tsx`, `JourneyPath.tsx`, `FocusLine.tsx`, `FocusSheet.tsx`, `src/components/progress/SkillRow.tsx`; testes `tests/unit/journey.test.ts`, `activity-lesson.test.ts`, `tests/e2e/journey.spec.ts`, `tests/e2e/focus.spec.ts`.

### Dados
`learning.journey`, `learning.focusSession`, `prefs.studyFocus`; ledger `atividade:<id>`, `checkpoint:<id>`; eventos `activity-started`, `activity-completed`, `focus-changed`, `plan-fallback`.

### Backend
Não se aplica.

### Frontend
Hierarquia do `30` §14.1. Regras: um CTA primário (o do `SessionCard`); matéria em texto, nunca cor; nós "a seguir" com traço tracejado (`border-dashed`, token `gelo`/`nevoa`); checkpoint reaproveita o carimbo do `ChapterMilestone`; `FocusSheet` usa `BottomSheet` existente; tudo cabe em 320 px; `prefers-reduced-motion`.

### Algoritmo

```text
ensurePlan(state, today):
  se !jornadaAdaptativa → null
  se journey.committed vazio ou alguma inválida ou planVersion != ALGO_VERSION → planWithFallback → commit(3) + upcoming(5)
startActivity(activityId):
  a = committed[0] (só a primeira comprometida pode começar; as outras mostram "a seguir")
  se kind ∈ {pratica, revisao, desafio, checkpoint, reforco sem aula}: await repository.ensureSubjects([a.subjectId])
     a.itemIds = selectItemsForActivity(a, state, today) ; activeActivity = a ; evento activity-started
  navegar: aula/reforço com aula → /learn/$lessonId ; legado → /redacao/$licaoId ; resto → /atividade/$activityId
buildActivityLesson(a): MicroLessonV2 sintética
  id = "atividade--" + a.id ; format 2 ; subjectId/topicId/chapterId da habilidade principal ; skillIds = a.skillIds
  steps = [intro (título por kind + motivo), question(itemId, role por kind, difficulty ordenada)…, recap curto]
  (não passa por validateLessonSteps: é sessão, não conteúdo autoral; checagem leve: ≥ 2 questões, ids resolvem)
useLearningSession(lesson, { onComplete?, mode?: "licao" | "atividade" | "checkpoint" }):
  padrão (sem onComplete) = comportamento atual (completeMicroLesson)
  atividade: onComplete = completeJourneyActivity(activityId, correct, total)
completeJourneyActivity(id, correct, total) [store, 1 setState]:
  XP por ledger "atividade:<id>": pratica/desafio/reforco 10/20/30 por faixa (starsForPct) ; revisao 5 ; checkpoint 20
  registrarAtividade(s, "lesson", true) ; history.push ; sinceCheckpoint++ (0 se checkpoint) ; lastCheckpointDate
  committed.shift() ; replanejar (ensurePlan) ; evento activity-completed
Aula/legado iniciados pela jornada: ao concluir pela rota existente, `completeMicroLesson`/`completeLesson` continuam; a jornada
  detecta a conclusão (activeActivity.lessonId concluída) no retorno à home e move para history (sem pagar XP de novo)
foco:
  setStudyFocus(p) → evento focus-changed → replanejar (comprometidas fora do novo foco são descartadas)
  startFocusSession(ids) expira no fim do dia local ; clearFocusSession()
```

### Edge cases
- Aluno abre `/atividade/<id>` antigo ou de outro dia → se não for `activeActivity`, redireciona à home com a próxima.
- Recarregar no meio de uma atividade → `activeSession` retoma (mesmo mecanismo do `useLearningSession`); `activeActivity` guarda `itemIds`, então os itens não mudam.
- Pacote não carrega → atividade vira fallback (próxima lição embarcada) com aviso curto.
- Aluno conclui uma aula pelo mapa das matérias (fora da jornada) → o plano reflete no próximo `ensurePlan` (a aula conta como concluída para o currículo).
- Flag desligada com `journey` já preenchida → home antiga; dados preservados.
- Foco com matéria sem conteúdo → `FocusSheet` mostra a matéria desabilitada com "Em breve".

### Performance
`ensurePlan` só na montagem da home e após conclusão/mudança de foco; `useMemo` por `(journey, today)`. Home continua renderizando < 16 ms por frame em 390×844 (mesma medida do `26`). Nenhum `fetch` no caminho de render; `ensureSubjects` só ao tocar "Continuar".

### Segurança
L1.

### Tarefas

**F12.1 — Orquestração da jornada** · SONNET · TDD
- Arquivos: **NOVO** `src/lib/adaptive/journey.ts`, `src/lib/store.ts` (ações `commitPlan`, `setActiveActivity`, `completeJourneyActivity`, `syncJourneyWithCompletions`), `tests/unit/journey.test.ts`.
- Critério: testes de comprometer/iniciar/concluir, idempotência do XP, replanejamento, detecção de aula concluída.

**F12.2 — Atividade dinâmica no player existente** · SONNET · TDD
- Arquivos: **NOVOS** `src/lib/adaptive/activity-lesson.ts`, `src/routes/atividade.$activityId.tsx`, `tests/unit/activity-lesson.test.ts`; `useLearningSession.ts` (`opts.onComplete`, `opts.mode`), `MicroLessonPlayer.tsx` (repassa `mode`; tela de conclusão com CTA "Continuar" para `/trilha`).
- Critério: E2E: atividade de prática com 5 itens do começo ao fim; `completedLessons` não recebe `atividade--*`; `learning.journey.history` recebe.

**F12.3 — Card "Sessão de hoje"** · SONNET · `frontend-design`
- Arquivos: **NOVO** `SessionCard.tsx`.
- Faz: título da atividade, matéria, frase do motivo (mapa `ReasonCode → COPY.jornada.motivos.*`), minutos somados até `dailyMinutes`, CTA "Continuar"/"Começar".
- Critério: E2E: CTA único; motivo visível; minutos exibidos.

**F12.4 — Caminho da jornada** · SONNET · `frontend-design`
- Arquivos: **NOVO** `JourneyPath.tsx`; `PathNode.tsx` (props opcionais `subjectLabel`, `planned`, kinds novos com ícone).
- Faz: histórico (últimos 6) → atual → comprometidas → a seguir; "Ver mapa das matérias" no fim.
- Critério: E2E `narrow` sem rolagem horizontal; leitores de tela anunciam "Atual", "Concluída", "A seguir" (texto, não só ícone).

**F12.5 — Foco** · SONNET
- Arquivos: **NOVOS** `FocusLine.tsx`, `FocusSheet.tsx`; `store.ts` (ações da F4 já existem), `profile.tsx` (seção "Foco e ritmo": foco permanente + minutos por dia).
- Critério: E2E `focus.spec.ts`: "Só hoje" com Física → plano só Física; no dia seguinte (relógio simulado) volta; "Daqui pra frente" persiste; "Voltar a todas".

**F12.6 — Home com flag** · SONNET
- Arquivos: `src/routes/trilha.tsx`, `src/lib/features.ts` (`jornadaAdaptativa: false` até F15).
- Faz: flag ligada → `TrailHeader` + `SessionCard` + `FocusLine` + `JourneyPath`; mapa das matérias = a trilha atual (mesmos componentes, acessível por `?vista=mapa` ou botão). Flag desligada → idêntico a hoje. O mapa chama `ensureSubjects([matéria selecionada])` ao montar, para que aulas geradas (em pacote) apareçam; `/learn/$lessonId` faz o mesmo antes de renderizar uma aula listada em `aulas-geradas.ts` (estado "carregando" com o `TrailSkeleton` existente; falha → `TrailError` existente).
- Critério: E2E existentes (`trail-home`, `trail-path`, `trilha`) verdes com flag desligada; `journey.spec.ts` verde com ligada.

**F12.7 — "Praticar" pelo motor** · SONNET
- Arquivos: `src/routes/study.tsx`.
- Faz: com a flag, `pickQuestions` usa `selectItems` na habilidade de maior score entre EM_APRENDIZADO/DEVIDA que tenha itens do banco geral ou de pacote; `LESSON_SIZE = 2` mantido; sem candidata → comportamento atual.
- Critério: teste da escolha; E2E `feedback.spec.ts` verde nas duas posições da flag.

**F12.8 — Progresso por habilidade** · SONNET
- Arquivos: `src/routes/progress.tsx`, **NOVO** `SkillRow.tsx`.
- Faz: com `masteryModel: "on"`, por matéria: agregado (`30` §9, média ponderada por incidência×confiança) + lista de habilidades com `skillDisplay` (rótulo de evidência; número só se Confidence ≥ 25; selo "Consistente"). Com flag `shadow`/`off`, tela atual.
- Critério: E2E com estado fixture; nenhum "Dominado" com Confidence < 75.

**F12.9 — Copy e inventário** · SONNET · `humanizer:humanizer`
- Arquivos: `copy.ts` (`COPY.jornada.*` com os motivos do `30` §14.2, `COPY.foco.*`), `docs/21`.
- Critério: inventário atualizado; `brand-voice` estendido (sem "domina", sem cobrança).

### Testes
Novos + todos os de trilha/home existentes (com flag desligada e ligada), `narrow`.

### Critérios de aceite
- **AC-12.1** Home com flag ligada mostra sessão recomendada, motivo e minutos, com um CTA.
- **AC-12.2** Jornada mistura matérias respeitando restrições (E2E com fixture + testes do motor).
- **AC-12.3** Atividades dinâmicas usam o player existente e pagam XP uma vez.
- **AC-12.4** Foco permanente e temporário funcionam e não apagam progresso.
- **AC-12.5** Flag desligada = app de hoje (E2E existentes).
- **AC-12.6** 320 px sem rolagem horizontal; alvos ≥ 44 px; rótulos textuais de estado.

### Definition of Done
AC-12.1…12.6; flag permanece desligada até a F15 (ligada só em teste e com override).

### Instruções para a IA executora
Não apague nem reescreva `buildTrail`, `SubjectPath`, `LearningPath`. Não crie cores por matéria. Não coloque Foca durante a questão. Não chame `planWithFallback` no render.

### Context Pack
- Objetivo: jornada + foco atrás de flag.
- Ler do `30`: §6, §14, §15, §11.8, §22. Do `27`: §4 (proibições) e §6 (hierarquia). `docs/DESIGN.md`.
- Arquivos: listados.
- Contratos: `planWithFallback`, `selectItemsForActivity`, `repository.ensureSubjects`, `useLearningSession(lesson, opts?)`, `completeJourneyActivity`.
- Não pode mudar: rotas existentes, comportamento com flag desligada, economia de XP existente.
- Arquivos quentes: `store.ts`, `copy.ts`, `features.ts`, `useLearningSession.ts`.

### Prompt para o executor
> Você vai executar a Fase 12 do SDD do Foca (`docs/31` §16). Leia o Context Pack, o `docs/30` §6, §11.8, §14, §15 e §22, o `docs/27` §4 e §6 e o `docs/DESIGN.md`. Objetivo: a home `/trilha` ganha, atrás da flag `jornadaAdaptativa`, o card "Sessão de hoje" (motivo + minutos + um CTA), a linha/folha de foco (permanente e só hoje) e o caminho único misturado; práticas, revisões e desafios rodam numa rota nova `/atividade/$activityId` com o mesmo `MicroLessonPlayer`, via lição sintética e estratégia de conclusão própria (XP por ledger, sem gravar em `completedLessons`). `/study` e `/progress` passam a usar o modelo quando as flags estiverem ligadas. Com a flag desligada, nada muda — os E2E atuais provam isso. Copy nova passada pelo Humanizer e registrada no `docs/21`. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test` (inclua `narrow`), `bun run build`. Critérios AC-12.1 a AC-12.6. Sem commit.

---

## 17. Fase 13 — Onboarding progressivo e nivelamento adaptativo

**Tipo:** PARALELIZÁVEL (com F14) · **Depende de:** F5, F8, F11 (pool diagnóstico) · **Modelo:** FORTE para F13.3; SONNET no resto · **Skills:** `frontend-design`, `superpowers:test-driven-development`; revisão `web-design-guidelines` + `humanizer:humanizer`

### Objetivo
Onboarding com prova, data, tempo por dia, foco e matérias fáceis, sem ficar cansativo; oferta de nivelamento opcional; teste adaptativo por área que gera estimativas por habilidade.

> **Nota (28/09/2026):** o contrato de finalização, retomada e resultado do nivelamento desta fase foi revisto pelo `36` (RF-10…RF-13 e §F.5, Fases 3 e 6): aplicação única dos priors, retomada igual à execução contínua e resultado por faixa de área. Registro no `37`.

### Motivação
`30` §12; P8; O6.

### Dependências
F11.6 (≥ 12 itens diagnósticos revisados por área); F5 (`updateSkill`); F8 (motor usa os priors).

### Estado atual
`src/routes/quiz.tsx`: `STEPS = ["name","level","state","target","course","subjects"]`; `completeQuiz([], gaps)` → `/aha`. `prefs.examTargets` existe (sem UI no onboarding; está no Perfil).

### Alterações necessárias
3 telas novas + seção de matérias fáceis; indicador por blocos; oferta; motor de nivelamento; rota; aplicação dos resultados; resultado; pontos de entrada posteriores.

### Arquivos afetados
`src/routes/quiz.tsx`, `src/routes/aha.tsx` (mostrar resultado do nivelamento quando existir), `src/lib/store.ts` (`completeQuiz` mantém bônus único; ações de placement), `src/routes/profile.tsx`, `src/routes/trilha.tsx` (card "Quer ajustar a trilha ao seu nível?" para `onboardingVersion === 1`), `src/lib/copy.ts`, `docs/21`, `src/lib/features.ts` (`nivelamento`).

### Novos arquivos
**NOVOS** `src/components/onboarding/ExamStep.tsx`, `TimeStep.tsx`, `FocusStep.tsx`, `PlacementOffer.tsx`, `PlacementResult.tsx`; `src/lib/adaptive/placement.ts`; `src/routes/nivelamento.tsx`; testes `tests/unit/placement.test.ts`, `tests/unit/sim-placement.test.ts`, `tests/e2e/placement.spec.ts`, `tests/e2e/onboarding.spec.ts`.

### Dados
`learning.placement` (F4); `skillModel` com `source: "prior-nivelamento"`; `prefs.examTargets[0]` (com `examDate`), `easySubjects`, `dailyMinutes`, `studyFocus`, `onboardingVersion = 2`.

### Backend
Não se aplica.

### Frontend
Passos novos no mesmo padrão visual do quiz (`Wrap`, `Choice`). Indicador por blocos: "Você" · "Sua prova" · "Seu ritmo". Tela de nivelamento reaproveita `QuestionStepView` em modo `diagnostico` (sem feedback, sem dica, sem tutor, sem Foca, "Não sei" visível, barra de progresso por área, botão "Pausar e continuar depois").

Copy candidata (passou pelo Humanizer; registrar no `21`):
- Oferta — título: "Quer começar no seu nível?" · corpo: "São umas 20 questões, cerca de 10 minutos. Com isso a trilha já começa mais perto do que você precisa." · CTA primário: "Fazer o nivelamento" · secundário: "Começar sem nivelamento" · rodapé: "Dá pra fazer depois, pelo Perfil."
- Durante: "Sem dica nesta parte. Se não souber, toque em Não sei. Isso também ajuda a ajustar a trilha."
- Resultado: "Pronto. Isso é um ponto de partida, e ele fica mais preciso conforme você estuda."

### Algoritmo
`30` §12.3. Detalhes fechados:

```text
EAP em grade: pontos θ_k = −4 + 0,2k (k = 0..40); prior N(−0,3; 1,0)
posterior_k ∝ prior_k · Π_i P_i(θ_k)^{u_i} (1 − P_i(θ_k))^{1 − u_i}   // "não sei" → u = 0 com P sem chute
θ̂ = Σ θ_k post_k ; SE = sqrt(Σ (θ_k − θ̂)² post_k)
informação 3PL: I(θ) = a² · ((P − c)² / (1 − c)²) · ((1 − P) / P)
seleção: elegíveis da área, não usados, habilidade ainda não usada na área (se houver), alternando matéria; top 3 por I(θ̂); escolhe por hash(seed, itemId)
parada por área: SE ≤ 0,45 OU itens da área = MAX_AREA (prioritária 6, outras 4) OU orçamento total 24 itens
ordem das áreas: prioritárias (matérias difíceis/foco) primeiro
aplicação (applyPlacement): para cada resposta → updateSkill(role "diagnostico") partindo do prior θ̂_área ;
  habilidades ativas da área sem resposta → prior (θ̂_área ou θ̂_matéria se ≥ 2 itens da matéria), σ = max(0,9; SE + 0,3), nEff 0
faixa da área em palavras: θ̂ < −0,5 "Base em construção" ; −0,5 ≤ θ̂ < 0,7 "No caminho" ; ≥ 0,7 "Base firme"
```

### Edge cases
- Pool da área abaixo de 4 itens elegíveis → área não é medida; aviso no resultado ("Ainda não temos questões suficientes de X para medir").
- Abandono no meio → `placement.status = "abandonado"` com respostas; "Continuar nivelamento" retoma do próximo item; respostas já dadas já atualizaram o modelo.
- Refazer nivelamento → novo `placement` (o antigo vira histórico nos eventos); priors só substituem entradas com `source` prior (nunca apagam evidência).
- Aluno antigo (`onboardingVersion === 1`) → card dispensável na home; dispensar grava evento e some por 30 dias.
- Onboarding interrompido → os passos já preenchidos ficam salvos (comportamento atual do quiz).

### Performance
EAP com 41 pontos × até 24 itens: trivial (< 1 ms por passo).

### Segurança
Nenhum dado novo sensível. Data da prova é opcional.

### Tarefas

**F13.1 — Passos novos do quiz** · SONNET · `frontend-design`
- Arquivos: `quiz.tsx`, **NOVOS** `ExamStep.tsx`, `TimeStep.tsx`, `FocusStep.tsx`.
- Faz: `STEPS` passa a `["name","level","exam","state","target","course","subjects","time","focus"]`; seção recolhida "Alguma você já manda bem?" dentro de `subjects`; indicador por blocos; `canAdvance` para os novos passos.
- Critério: E2E `onboarding.spec.ts` percorre tudo em 320 px e em 390 px.

**F13.2 — Oferta e roteamento** · SONNET
- Arquivos: **NOVO** `PlacementOffer.tsx`, `quiz.tsx` (último passo → oferta), `aha.tsx`.
- Faz: com `nivelamento` ligado: oferta → `/nivelamento` ou `/aha`; desligado: fluxo atual.
- Critério: E2E dos dois caminhos.

**F13.3 — Motor do nivelamento** · FORTE · TDD
- Arquivos: **NOVOS** `src/lib/adaptive/placement.ts`, `tests/unit/placement.test.ts`, `tests/unit/sim-placement.test.ts`.
- Faz: `startPlacement`, `nextPlacementItem`, `recordPlacementResponse`, `estimate` (EAP), `shouldStopArea`, `applyPlacement`.
- Critério: EAP bate com cálculo de referência em 3 casos fixos (± 0,02); simulação G (`30` §26.3): θ verdadeiro por área em {−1,5; 0; 1,5}, 50 execuções por valor → |θ̂ − θ| médio ≤ 0,6 e ≤ 24 itens.

**F13.4 — Rota de nivelamento** · SONNET
- Arquivos: **NOVO** `src/routes/nivelamento.tsx`, `QuestionStepView.tsx`/`MicroLessonPlayer.tsx` (modo `diagnostico` sem feedback).
- Critério: E2E: responder 3, sair, voltar e continuar do 4º; nenhum feedback certo/errado aparece; "Não sei" funciona.

**F13.5 — Aplicar resultados** · SONNET
- Arquivos: `store.ts` (`finishPlacement`), `placement.ts` (`applyPlacement`).
- Critério: teste: habilidades medidas com Confidence > 0; não medidas com `source: "prior-nivelamento"` e Confidence 0.

**F13.6 — Tela de resultado** · SONNET
- Arquivos: **NOVO** `PlacementResult.tsx`.
- Faz: por área, faixa em palavras; até 3 habilidades medidas com `skillDisplay`; áreas não medidas com aviso; CTA "Ir para a trilha".
- Critério: E2E; nenhum número de nota; nenhum "Nível N".

**F13.7 — Entradas posteriores** · SONNET
- Arquivos: `profile.tsx` ("Fazer nivelamento"/"Refazer nivelamento"), `trilha.tsx` (card para `onboardingVersion === 1`).
- Critério: E2E: usuário antigo vê o card e pode dispensar.

**F13.8 — Copy e inventário** · SONNET · `humanizer:humanizer`
- Arquivos: `copy.ts` (`COPY.onboarding.*`, `COPY.nivelamento.*`), `docs/21`.
- Critério: inventário com evidência.

### Testes
Novos + `nav.spec.ts`, E2E do quiz existente (ajustar para os passos novos).

### Critérios de aceite
- **AC-13.1** Onboarding com 3 telas novas, cabendo em 320 px, com no máximo 9 passos antes da oferta.
- **AC-13.2** Nivelamento opcional, pausável, retomável; ≤ 24 itens; sem feedback por item.
- **AC-13.3** Simulação G dentro da tolerância.
- **AC-13.4** Resultado sem nota nem "nível N"; estimativas por habilidade medida com Confidence > 0.
- **AC-13.5** Flag `nivelamento` desligada = onboarding atual.

### Definition of Done
AC-13.1…13.5; flag ligada só na F15.

### Instruções para a IA executora
Não chame de TRI oficial. Não mostre nota. Não force o nivelamento. Não tire passos existentes do quiz sem registrar.

### Context Pack
- Objetivo: onboarding + nivelamento.
- Ler do `30`: §12 inteiro, §9.4 (prior), §26.3 (G). Do `15`: §4 (onde a Foca aparece).
- Arquivos: listados.
- Contratos: `updateSkill`, `itemIndex` (papel `diagnostico`, status revisado), `PlacementState`.
- Não pode mudar: bônus único de onboarding (ledger), `/aha` para quem não faz nivelamento.
- Arquivos quentes: `store.ts`, `copy.ts`, `features.ts`, `quiz.tsx`.

### Prompt para o executor
> Você vai executar a Fase 13 do SDD do Foca (`docs/31` §17). Leia o Context Pack, o `docs/30` §9.4, §12 e §26.3 (aluno G) e o `docs/15` §4. Objetivo: acrescentar ao `/quiz` as telas de prova+data, tempo por dia e foco (e a seção opcional de matérias fáceis), agrupadas em blocos; oferecer um nivelamento opcional; implementar o teste adaptativo por área (EAP em grade, seleção por informação com balanceamento de habilidade, parada por SE ≤ 0,45 ou limite de itens, ≤ 24 no total) em `src/lib/adaptive/placement.ts`, a rota `/nivelamento` sem feedback por item e a tela de resultado em palavras (sem nota, sem "nível N"). Tudo atrás da flag `nivelamento`. Copy passada pelo Humanizer e registrada no `docs/21`. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`. Critérios AC-13.1 a AC-13.5. Sem commit.

---

## 18. Fase 14 — Checkpoints da trilha

**Tipo:** PARALELIZÁVEL (com F13) · **Depende de:** F8, F12 · **Modelo:** SONNET · **Skills:** `superpowers:test-driven-development`, `frontend-design` (telas); revisão `web-design-guidelines` + `humanizer:humanizer`

### Objetivo
Inserir um checkpoint a cada 15–25 atividades, sem ajuda nem feedback por item, que recalibra Mastery/Confidence e antecipa revisão ou desafio.

### Motivação
`30` §13; O7.

### Dependências
F8 (`deveInserirCheckpoint`), F12 (execução de atividades), F11 (pool revisado).

### Estado atual
Planner já sabe inserir (F8), mas a flag `checkpointsTrilha` está desligada.

### Alterações necessárias
Composição, modo checkpoint no player, recalibração, telas, XP, testes.

### Arquivos afetados
`src/lib/adaptive/planner.ts` (composição), `src/lib/adaptive/activity-lesson.ts` (modo), `src/hooks/useLearningSession.ts` (modo `checkpoint`: sem feedback, sem sons de resposta, "Resposta registrada"), `src/components/learning/MicroLessonPlayer.tsx`, `src/components/learning/steps/QuestionStepView.tsx`, `src/lib/store.ts` (`completeJourneyActivity` checkpoint), `src/lib/copy.ts`, `docs/21`, `src/lib/features.ts`.

### Novos arquivos
**NOVOS** `src/lib/adaptive/checkpoint.ts`, `src/components/learning/CheckpointIntro.tsx`, `CheckpointResult.tsx`; testes `tests/unit/checkpoint.test.ts`, `tests/unit/sim-checkpoint.test.ts`, `tests/e2e/checkpoint.spec.ts`.

### Dados
`journey.sinceCheckpoint`, `journey.lastCheckpointDate`; ledger `checkpoint:<id>`; evento `checkpoint-completed` com meta `{ items, correct, dontKnow }`.

### Backend
Não se aplica.

### Frontend
Intro: título "Checkpoint", corpo "8 questões misturadas, sem dica. Serve pra ajustar o que vem a seguir na sua trilha.", CTA "Começar", link "Agora não" (adia para o próximo plano). Durante: sem Foca, sem escada, sem tutor. Resultado: linhas por habilidade com "Subiu" / "Firme" / "Vale revisar" e uma frase do que muda; XP; CTA "Continuar".

### Algoritmo
`30` §13.1–13.4.

```text
composeCheckpoint(state, today, seed):
  praticadas = habilidades de history desde o último checkpoint
  antigas = habilidades DEVIDAS ou com lapses > 0 fora de "praticadas"
  firmes = FIRME
  n = clamp(round(|praticadas| · 1,2), 6, 8)
  cota: 60% praticadas, 30% antigas, 10% (1 item) firmes com p≈0,5 ; faltou num grupo → completa com o próximo
  item por habilidade: selectItems(p-alvo 0,65, papéis ["diagnostico"], status revisado; fallback "verificada-ia" não visto em 14 dias → trace)
recalibrar(attempt):
  predicted = attempt.predictedP
  se predicted ≥ 0,8 e errou → reviewSchedule[skill] = hoje+1, lapses++ (já feito pelo modelo), trace "superestimado"
  se predicted ≤ 0,4 e acertou → marca skill "elegível a desafio" no próximo plano (flag efêmera em journey), trace "subestimado"
resultado por habilidade: Δmastery ≥ +5 → "Subiu" ; |Δ| < 5 → "Firme" ; ≤ −5 ou erro com predicted ≥ 0,8 → "Vale revisar"
```

### Edge cases
Checkpoint adiado ("Agora não") → volta no próximo plano, no máximo 2 adiamentos seguidos; depois vira a atividade comprometida. Sair no meio → respostas contam; checkpoint volta. Pool insuficiente (< 6) → não insere; trace. Aluno em foco temporário → checkpoint usa só matérias do foco.

### Performance
Sem impacto além do planner.

### Segurança
L1.

### Tarefas

**F14.1 — Composição** · SONNET · TDD
- Arquivos: **NOVO** `checkpoint.ts`, `planner.ts`, `tests/unit/checkpoint.test.ts`.
- Critério: testes de cotas, limites 6–8, fallback de pool, respeito ao foco, 1 por dia, adiamentos.

**F14.2 — Modo checkpoint no player** · SONNET
- Arquivos: `useLearningSession.ts`, `MicroLessonPlayer.tsx`, `QuestionStepView.tsx`, `activity-lesson.ts`.
- Faz: `mode: "checkpoint"` → após "Verificar"/"Não sei", mostra "Resposta registrada" e "Próxima"; `dispatchAnswerFeedback` não é chamado; som só no fechamento.
- Critério: E2E: nenhuma cor de certo/errado durante o checkpoint.

**F14.3 — Recalibração** · SONNET · TDD
- Arquivos: `checkpoint.ts`, `journey.ts`.
- Critério: `sim-checkpoint.test.ts`: aluno com Mastery superestimada (prior alto, θ verdadeiro baixo) → depois do checkpoint Mastery cai e a revisão vai para amanhã; aluno subestimado → desafio no próximo plano.

**F14.4 — Telas, XP e bloco** · SONNET · `frontend-design`
- Arquivos: **NOVOS** `CheckpointIntro.tsx`, `CheckpointResult.tsx`; `store.ts` (XP 20 fixo por ledger, bloco do dia).
- Critério: E2E: XP pago uma vez mesmo recarregando o resultado.

**F14.5 — Copy** · SONNET · `humanizer:humanizer`
- Arquivos: `copy.ts` (`COPY.checkpoint.*`), `docs/21`.
- Critério: inventário.

**F14.6 — E2E completo** · SONNET
- Arquivos: **NOVO** `tests/e2e/checkpoint.spec.ts` (estado fixture com 20 atividades no histórico).
- Critério: checkpoint aparece, roda, mostra resultado, replaneja.

### Testes
Novos + suíte da F12.

### Critérios de aceite
- **AC-14.1** Checkpoint inserido conforme `30` §13.1 (testes).
- **AC-14.2** Sem ajuda e sem feedback por item; "Não sei" disponível.
- **AC-14.3** Superestimação/subestimação alteram agenda/plano (simulação).
- **AC-14.4** XP fixo, idempotente; conta como bloco.
- **AC-14.5** Flag `checkpointsTrilha` desligada = nenhum checkpoint.

### Definition of Done
AC-14.1…14.5.

### Instruções para a IA executora
Não mostre percentual quando Confidence < 25. Não transforme checkpoint em punição (sem perder XP, sem mensagem de fracasso).

### Context Pack
- Objetivo: checkpoints.
- Ler do `30`: §13, §11.5, §16.1.
- Arquivos: listados.
- Contratos: `deveInserirCheckpoint`, `composeCheckpoint`, `useLearningSession(lesson, { mode: "checkpoint" })`.
- Não pode mudar: papel `"checkpoint"` da checagem de aula (só o rótulo mudou na F7).
- Arquivos quentes: `useLearningSession.ts`, `store.ts`, `copy.ts`, `features.ts`.

### Prompt para o executor
> Você vai executar a Fase 14 do SDD do Foca (`docs/31` §18). Leia o Context Pack e o `docs/30` §11.5, §13 e §16.1. Objetivo: checkpoints periódicos na jornada (a cada 15–25 atividades, 6–8 itens misturados, sem dica, sem tutor, sem feedback por item, "Não sei" disponível), com recalibração do modelo (superestimação antecipa revisão; subestimação libera desafio), telas de intro e resultado ("Subiu", "Firme", "Vale revisar"), XP fixo de 20 por ledger. Atrás da flag `checkpointsTrilha`. Copy passada pelo Humanizer e registrada no `docs/21`. Testes: `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`. Critérios AC-14.1 a AC-14.5. Sem commit.

---

## 19. Fase 15 — Rollout, regressão e registro

**Tipo:** BLOQUEANTE (final) · **Depende de:** todas · **Modelo:** SONNET; FORTE para a revisão final de segurança se for L3 · **Skills:** `superpowers:verification-before-completion`, agente `spec-verifier`; revisão `repo-security-review` (L2 no diff; L3 se for expor a usuários reais)

### Objetivo
Ligar as flags em sequência com evidência, rodar a regressão completa, testar em aparelho, verificar todos os critérios e registrar.

### Motivação
Nenhuma entrega grande deste repo foi declarada pronta sem registro com números (`22`, `26`, `29`).

### Dependências
F0–F14 concluídas (F10 incluída — recomendado rodar antes de F11, para o pool diagnóstico poder usar itens oficiais; Ondas 2–3 de conteúdo não entram).

### Estado atual
Flags desligadas ou em `shadow`.

### Alterações necessárias
Ordem de ligação; regressão; aparelho; segurança; verificação; registro.

### Arquivos afetados
`src/lib/features.ts`, `docs/32`, `docs/00-README.md`, `CLAUDE.md`, `docs/PRODUCT.md`/`docs/DESIGN.md` (se o resumo para agentes ficou desatualizado).

### Novos arquivos
Nenhum (o `32` já existe).

### Dados / Backend / Frontend / Algoritmo
Não se aplica (só flags).

### Edge cases
Alguma flag causa regressão → desliga só ela, registra, segue com as outras (cada flag é independente por desenho).

### Performance
Medir e registrar: tempo de carga da home (Lighthouse mobile ou medida do `26`), tamanho de bundle vs. linha de base, planner em aparelho (via `/debug`).

### Segurança
L2 sobre o diff completo; L3 (`/repo-security-review .` completo) antes de expor a usuários reais.

### Tarefas

**F15.1 — Sequência de flags** · SONNET
- Ordem, cada passo com a suíte verde antes do próximo: `sinaisAmpliados` → `botaoNaoSei` → `explicacaoEmCamadas` → `contextoPedagogicoIA` → `pacotesConteudo` → `masteryModel: "on"` → `jornadaAdaptativa` → `checkpointsTrilha` → `nivelamento`.
- Critério: tabela no `32` com data e resultado de cada passo.

**F15.2 — Regressão completa** · SONNET
- Faz: os 4 comandos; E2E nos dois projetos; comparar com a linha de base F0.2.
- Critério: números no `32`; nenhum teste antigo removido sem justificativa.

**F15.3 — Aparelho físico** · usuário
- Faz: checklist em Chrome Android e Safari iOS: onboarding com nivelamento, jornada (3 atividades), "Não sei", escada até a IA, checkpoint forçado via `/debug`, foco "só hoje", som (primeira resposta), háptico (Android), refresh no meio de atividade, 320 px (zoom), modo escuro.
- Critério: checklist no `32` com resultado por item.

**F15.4 — Revisão de segurança** · SONNET/FORTE
- Faz: L2 sobre o diff (`agent-skills:security-and-hardening` + `/repo-security-review . --pr origin/main`); L3 se o usuário for abrir para alunos reais.
- Critério: achados corrigidos ou registrados com justificativa.

**F15.5 — Verificação contra a spec** · SONNET
- Faz: agente `spec-verifier` com `docs/31` e todos os `AC-*` + `G1–G16`.
- Critério: tabela critério → evidência no `32`; critério sem evidência = não cumprido (explícito).

**F15.6 — Registro e índices** · SONNET
- Faz: fechar o `32` (o que existe, decisões, números, limitações, o que fica para depois); atualizar `00-README` (status "implementado, ver `32`"), topo do `CLAUDE.md`, `PRODUCT.md`/`DESIGN.md` se preciso.
- Critério: documentos atualizados.

### Testes
Tudo.

### Critérios de aceite
- **AC-15.1** Flags ligadas na ordem com evidência.
- **AC-15.2** Suíte completa verde, com números.
- **AC-15.3** Checklist de aparelho registrado (ou pendência explícita).
- **AC-15.4** Segurança L2 registrada.
- **AC-15.5** `spec-verifier` sem critério sem evidência (ou lista explícita dos não cumpridos).
- **AC-15.6** `32`, `00-README`, `CLAUDE.md` atualizados.

### Definition of Done
AC-15.1…15.6.

### Instruções para a IA executora
Não declare "pronto" com pendência escondida. Não ligue flag com teste vermelho. Sem push/merge sem pedido.

### Context Pack
- Objetivo: fechar com evidência.
- Ler: `docs/31` §20 (critérios globais), `docs/32` inteiro, `ai/SDD-WORKFLOW.md` §6 e §3 (etapas 6–9).
- Arquivos: `src/lib/features.ts`, docs.

### Prompt para o executor
> Você vai executar a Fase 15 do SDD do Foca (`docs/31` §19). Leia o Context Pack, o `docs/31` §20 e o `docs/32` inteiro. Objetivo: ligar as flags na ordem definida (uma por vez, suíte verde entre cada), rodar a regressão completa e comparar com a linha de base, conduzir comigo o checklist em Android e iPhone físicos, fazer a revisão de segurança L2 sobre o diff, rodar o agente `spec-verifier` contra todos os AC-* e G1–G16, e fechar o `docs/32`, o `docs/00-README.md` e o topo do `CLAUDE.md`. Critério sem evidência é não cumprido — escreva isso. Critérios AC-15.1 a AC-15.6. Sem push nem merge sem eu pedir.

---

## 20. Critérios de aceite globais

| ID | Critério | Como verificar | Fase |
|---|---|---|---|
| G1 | Home responde "o que estudar agora" com motivo, tempo e um CTA | E2E `journey.spec.ts` | F12 |
| G2 | Jornada mistura matérias sem 3 seguidas da mesma e com toda atividade explicada | `sim-engine.test.ts` + E2E | F8, F12 |
| G3 | Mastery e Confidence separados, dentro das tabelas de referência | `mastery-model`, `confidence` | F5 |
| G4 | Proporção 70/20/10 respeitada em janela de 20 *(nota 28/09/2026, `36` K12: medir duas janelas consecutivas de 10; a regra operacional é a janela móvel de 10, com teto de 3 revisões por janela)* | `sim-engine.test.ts` | F8 |
| G5 | Nenhum pré-requisito violado; `core` nunca pulada sem confirmação | `adaptive-planner`, `sim-engine` | F8 |
| G6 | Nivelamento opcional, adaptativo, ≤ 24 itens, sem nota | `placement`, E2E | F13 |
| G7 | Checkpoints recalibram e antecipam revisão | `sim-checkpoint` | F14 |
| G8 | "Não sei" é sinal distinto e não punitivo | `attempt-builder`, `mastery-model`, E2E | F6 |
| G9 | Explicação em 3 camadas; IA com contexto limitado; tutor nunca automático | E2E `explanation-ladder`, `tutor-pedagogy-validation` | F7 |
| G10 | Conteúdo publicado passou pelos portões; itens de IA fora do diagnóstico sem revisão humana | relatórios de lote + `pipeline-*` | F9, F11 |
| G11 | Som funciona em aparelho físico; diagnóstico explica falhas | matriz F1.3/F1.10 | F1 |
| G12 | Háptico honesto sobre suporte | `haptics.test.ts` + Perfil | F1 |
| G13 | Motor e app funcionam sem IA, sem pacote e com exceção no motor | `adaptive-fallback`, E2E com rede do tutor bloqueada | F8, F12 |
| G14 | Migração v5→v6 preserva tudo, idempotente, com backup | `state-migrations`, E2E `state-migration` | F4 |
| G15 | Toda flag desligável sem perda de dado e sem regressão | F15.1 + E2E com flags off | F15 |
| G16 | 320 px, alvos ≥ 44 px, rótulos textuais, reduced motion nas telas novas | E2E `narrow` + revisão `web-design-guidelines` | F6, F12–F14 |

---

## 21. Checklist final

- [ ] Todas as tarefas F0.1…F15.6 com evidência no `32`
- [ ] Todos os `AC-*` e `G1–G16` com evidência (ou marcados "não cumprido" com motivo)
- [ ] `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build` com números no `32`
- [ ] Copy nova no `copy.ts`/`voz.ts` e no inventário `21`, com passada do Humanizer
- [ ] Decisões do usuário registradas (`32`, `34`)
- [ ] `00-README`, `CLAUDE.md` e resumos para agentes atualizados
