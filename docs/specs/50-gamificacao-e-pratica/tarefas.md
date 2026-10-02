---
estado: em-execucao
atualizado: 2026-10-02
iniciativa: 50
---

# 50 — Gamificação, prática, Foca animada e social 18+: tarefas

> IDs estáveis `T-50.F.n` (F = fase), nunca reaproveitados. Estados: `pendente` · `em-andamento` · `bloqueada` · `concluida` · `cancelada` · `adiada` (vira backlog). Regras: [SDD-WORKFLOW.md](../../ai/SDD-WORKFLOW.md) §3. Tamanho: P (≤ meio dia) · M (≤ 2 dias) · G (> 2 dias, pode ser dividida ao começar). **Nenhuma tarefa começa antes da T-50.0.1.** Seções citadas (§) são da [spec](spec.md).

**Gate de toda fase que muda código:** `bunx tsc --noEmit` · `bun test tests/unit` · `bun run lint` · `bun run build` · `bunx playwright test <área>` (se tocou UI ou fluxo) · `bun run docs:check` (se tocou documentação) · `bun run test:neon` (se houver migração). **Gate de fechamento de entrega:** os anteriores + `VERCEL=1 bun run build` + E2E completo sem edição durante a rodada + `spec-verifier` + registro + `ESTADO.md`.

Skills (pela [matriz](../../ai/SKILL-ROUTING.md) §2): backend → `foca-backend`; UI nova → `frontend-design` [C-plug] + `vercel-react-best-practices`, revisão `web-design-guidelines`; motion → `motion-design`; copy de interface → `better-writing` (+ `humanizer` em corpo de 2+ frases); testes → `superpowers:test-driven-development`; depuração → `superpowers:systematic-debugging`; L2 → `agent-skills:security-and-hardening` ou checklist L2; verificação → `spec-verifier`. Skill indisponível: usar a coluna "Sem a skill" e anotar no registro.

---

## Fase 0 — Aprovação e preparação (sem código de produto)

### T-50.0.1 — Aprovação da spec (P)
- **Estado:** concluida (02/10/2026: "Aprovo a Spec"; §21 respondido; ver registro)
- **Resultado:** spec e tarefas aprovadas por escrito pelo dono, com as respostas de §21; `estado: aprovado` em `spec.md` e `tarefas.md`; `docs/specs/README.md` e `docs/ESTADO.md` atualizados.
- **Depende:** —
- **Arquivos:** `docs/specs/50-gamificacao-e-pratica/{spec,tarefas,registro}.md`, `docs/specs/README.md`, `docs/ESTADO.md`
- **Skills:** `foca-sdd`
- **Aceite:** data e escopo aprovados registrados; decisões de §21 respondidas ou recomendação aceita.
- **Verificação:** `bun run docs:check`
- **Externo:** proprietário

### T-50.0.2 — Notas nas regras revistas (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** cada item de §0.2 ganha a nota "Revista pela 50 (aprovada em …): vale quando a entrega que a implementa for publicada; ver 50 §0.2" no documento de origem.
- **Depende:** T-50.0.1
- **Arquivos:** `docs/produto/regras.md`, `docs/arquitetura/contratos.md`, `docs/design/mascote.md`, `docs/design/gamificacao-e-som.md`, `docs/decisoes/0002-questoes-oficiais-enem.md`, `docs/specs/49-planos-e-monetizacao/spec.md` (§5.6, §5.9: nota de revisão, sem reescrever), `docs/produto/backlog.md` (B-169)
- **Skills:** —
- **Aceite:** todos os itens de §0.2 com nota; nenhum texto vigente apagado.
- **Verificação:** `bun run docs:check`

### T-50.0.3 — Decisão 0008: questões com imagem e fontes ampliadas (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `docs/decisoes/0008-questoes-com-imagem-e-fontes.md` (modelo `adr.md`) com D50-02, D50-03, a licença CC BY-ND do INEP, o risco de terceiros aceito pelo dono, o processo de licença por banca e o modelo do e-mail de pedido; 0002 aponta `substituido-por` parcial.
- **Depende:** T-50.0.1
- **Arquivos:** `docs/decisoes/0008-…md` (**NOVO**), `docs/decisoes/README.md`, `docs/decisoes/0002-…md`
- **Skills:** `agent-skills:documentation-and-adrs` [C-plug] (formato)
- **Aceite:** decisão com contexto, opções, decisão, consequências, fontes de §0.3 D.
- **Verificação:** `bun run docs:check`

### T-50.0.4 — Arte da Foca de corpo inteiro como original (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** a imagem anexada pelo dono em 02/10 salva sem alteração em `src/assets/branding/foca/corpo/foca-corpo-original.png` (extraída do anexo da conversa ou reenviada pelo dono), com linha no `README.md` da pasta.
- **Depende:** T-50.0.1
- **Arquivos:** `src/assets/branding/foca/corpo/` (**NOVO**), `src/assets/branding/foca/README.md`
- **Skills:** —
- **Aceite:** arquivo com hash registrado; nenhum derivado gerado ainda.
- **Verificação:** `bun run docs:check`
- **Externo:** reenvio pelo dono se a extração do anexo não for possível

### T-50.0.5 — Linha de base (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** gates completos rodados no `HEAD` antes da primeira mudança, saída no registro.
- **Depende:** T-50.0.1
- **Arquivos:** `registro.md`
- **Verificação:** `bunx tsc --noEmit; bun test tests/unit; bun run lint; bun run build; bunx playwright test`

---

## Fase 1 — Som no celular (E1)

### T-50.1.1 — Diagnóstico de áudio (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `getAudioDiagnostics()` no motor e painel carregado só com `?diagnostico-audio=1` (módulo à parte, como o da rolagem da 49): estado do contexto, eventos de destravamento recebidos, `resume` com resultado, sons carregados, sons descartados por prazo (com o tempo), preferências, `navigator.audioSession` se existir; botão "Copiar diagnóstico".
- **Depende:** T-50.0.5
- **Arquivos:** `src/lib/audio/engine.ts`, `src/lib/audio/diagnostico.ts` (**NOVO**), `src/routes/__root.tsx`
- **Skills:** `superpowers:systematic-debugging`
- **Aceite:** sem o parâmetro, nada é baixado (teste de bundle); com ele, o painel aparece numa lição.
- **Verificação:** `bun test tests/unit/audio*; bunx playwright test audio`
- **Risco/reversão:** módulo isolado; remover o parâmetro desliga.

### T-50.1.2 — Teste em aparelho (P)
- **Estado:** bloqueada (teste em iPhone e Android pelo dono, com `?diagnostico-audio=1`)
- **Resultado:** diagnósticos do iPhone (Safari e app instalado) e de um Android (Chrome), com e sem a chave de silencioso, colados no registro.
- **Depende:** T-50.1.1 publicada no preview
- **Externo:** proprietário (link do preview com o parâmetro)

### T-50.1.3 — Correção do destravamento e do estado `interrupted` (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** destrava em `pointerdown`, `pointerup`, `touchend`, `click` e `keydown`; retoma `interrupted` e `suspended` no próximo gesto, em `visibilitychange` e em `focus`; pré-aquece contexto e sons ao abrir lição; prazo do primeiro som da sessão 900 ms. Ajuste final guiado pelos diagnósticos da T-50.1.2 (sem presumir a causa).
- **Depende:** T-50.1.1 (código), T-50.1.2 (validação)
- **Arquivos:** `src/lib/audio/engine.ts`, `src/routes/__root.tsx`, `tests/unit/audio-engine.test.ts`
- **Skills:** `superpowers:systematic-debugging`, `superpowers:test-driven-development`
- **Aceite:** unitários de `interrupted` → `running` e do prazo do primeiro som; C-SOM-4 continua (nunca dois sons, cancelamento em 30 ms); RF-26 com o teste do dono.
- **Verificação:** `bun test tests/unit; bunx playwright test`

### T-50.1.4 — Cache dos sons e aviso do silencioso (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `Cache-Control: public, max-age=31536000, immutable` para `/sfx/v2/(.*)` no `vercel.json`; aviso no Perfil "No iPhone, o som segue a chave de silencioso"; aviso de primeiro uso (C-SOM-6) conferido.
- **Depende:** T-50.1.3
- **Arquivos:** `vercel.json`, `src/routes/profile.tsx`, `src/lib/copy.ts`, `docs/copy/inventario.md`
- **Skills:** —
- **Aceite:** `VERCEL=1 bun run build` com o cabeçalho; string no inventário.
- **Verificação:** `VERCEL=1 bun run build; bunx playwright test perfil`

### T-50.1.5 — Contratos de som atualizados (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** C-SOM-6 e C-SOM-7 em `contratos.md` e `gamificacao-e-som.md` §6.5–6.7 refletem o que foi feito.
- **Depende:** T-50.1.3
- **Verificação:** `bun run docs:check`

---

## Fase 2 — Lição viva (E1)

### T-50.2.1 — Primeira tentativa real e contrato aditivo (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** os players param de fixar `firstSubmission: true`; a resposta carrega `tentativa: "primeira" | "revisao"` e `assistida` (Foca IA aberta antes de responder); `licao-concluida` carrega `attemptKey`; o servidor aceita os campos (opcionais, padrão "primeira") e grava; revisão não baixa vida, não paga XP, não entra no caderno, não atualiza domínio.
- **Depende:** T-50.0.5
- **Arquivos:** `src/lib/sync/contrato.ts`, `src/hooks/useLearningSession.ts`, `src/components/lessons/LessonPlayer.tsx`, `src/routes/study.tsx`, `src/lib/learning/attempt-builder.ts`, `src/server/estudo/sincronizar.ts`, `src/lib/adaptive/model.ts`, testes
- **Skills:** `foca-backend`, `superpowers:test-driven-development`
- **Aceite:** RF-4 no servidor; cliente antigo (sem os campos) continua aceito; L2 (contrato de sincronização).
- **Verificação:** `bun test tests/unit; bunx playwright test sync licao`

### T-50.2.2 — Combo puro e barra por questão (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `src/lib/combo.ts` (§5.1.1) com testes; `today.combo` no store (migração 6 → 7 aditiva, testada); `LessonHeader` conta questões pontuadas e mostra a borda do combo.
- **Depende:** T-50.2.1
- **Arquivos:** `src/lib/combo.ts` (**NOVO**), `src/lib/store.ts`, `src/lib/state-migrations.ts`, `src/components/learning/LessonHeader.tsx`, `tests/unit/combo.test.ts` (**NOVO**), `tests/unit/state-migrations.test.ts`
- **Skills:** `superpowers:test-driven-development`
- **Aceite:** RF-1 (unitário completo); migração preserva tudo.
- **Verificação:** `bun test tests/unit`
- **Risco/reversão:** flag `comboNaLicao`.

### T-50.2.3 — Raio, selo, som e Foca no combo (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §5.1.2: traço SVG do raio sobre a barra, selos "3/5/10 seguidas", `acerto-consecutivo` no lugar de `resposta-correta` nos marcos, háptico, Foca cabeça `empolgada`/`orgulhosa` 48 px nos marcos 5 e 10, `aria-live`, reduced motion, nada no erro.
- **Depende:** T-50.2.2
- **Arquivos:** `src/components/lessons/FeedbackSheet.tsx`, `src/components/learning/LessonHeader.tsx`, `src/components/learning/RaioDoCombo.tsx` (**NOVO**), `src/lib/feedback/dispatch-feedback.ts`, `src/lib/haptics.ts`, `src/styles.css`, `src/lib/voz.ts`, `src/lib/copy.ts`
- **Skills:** `motion-design`, `frontend-design`, revisão `web-design-guidelines`
- **Aceite:** E2E: 3 seguidas → raio + selo; 5 → Foca; erro → nada novo; Continuar clicável no primeiro quadro; reduced motion parado; G5.
- **Verificação:** `bunx playwright test combo`

### T-50.2.4 — Revisão de erros no fim (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §5.1.4 no `useLearningSession` (passo novo depois da última questão), com até 3 itens, sem vida, `tentativa: "revisao"`; resultado separado no fim.
- **Depende:** T-50.2.1
- **Arquivos:** `src/hooks/useLearningSession.ts`, `src/lib/learning/steps.ts`, `src/components/learning/MicroLessonPlayer.tsx`, `src/lib/copy.ts`
- **Skills:** `frontend-design`, `better-writing`
- **Aceite:** RF-4 (E2E com 0 vidas); sem o passo em checagem, nivelamento, `/study`, simulado.
- **Verificação:** `bunx playwright test licao vidas`
- **Risco/reversão:** flag `revisaoDeErros`.

### T-50.2.5 — Lição perfeita e precisão de primeira (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** regra no servidor pela `attemptKey` (sem Pérolas até a E3) e no cliente para mostrar; "De primeira: x de y".
- **Depende:** T-50.2.1
- **Arquivos:** `src/lib/recompensas.ts`, `src/server/estudo/sincronizar.ts`, `src/components/lessons/CelebracaoAula.tsx`
- **Aceite:** RF-5.
- **Verificação:** `bun test tests/unit`

### T-50.2.6 — Cartões do fim (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §5.1.7 em `CelebracaoAula`: XP (com bônus separado quando existir), de primeira, tempo sem pausa, maior combo; entrada escalonada e pulável.
- **Depende:** T-50.2.2, T-50.2.5
- **Arquivos:** `src/components/lessons/CelebracaoAula.tsx`, `src/hooks/useLearningSession.ts` (tempo ativo), `src/lib/copy.ts`
- **Skills:** `motion-design`, `frontend-design`, `better-writing`
- **Aceite:** RF-6 (parte cartões); tempo exclui pausa (unitário).
- **Verificação:** `bunx playwright test licao`

### T-50.2.7 — Momento principal e nível animado (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `src/lib/celebracao.ts` (prioridade §5.12.3) usado por `CelebracaoAula` e pelos sons (`PRIORIDADE_FECHAMENTO` reordenada: marco acima de nível); momento "subiu de nível" com contagem de 400 ms e Foca cabeça (corpo quando a E2 publicar).
- **Depende:** T-50.2.6
- **Arquivos:** `src/lib/celebracao.ts` (**NOVO**), `src/lib/audio/identity.ts`, `src/lib/feedback/dispatch-feedback.ts`, `src/components/lessons/CelebracaoAula.tsx`, `ChapterCompleteSheet`
- **Skills:** `motion-design`, `superpowers:test-driven-development`
- **Aceite:** RF-6 (um momento, selos, um som); contratos C-SOM-2 atualizados.
- **Verificação:** `bun test tests/unit; bunx playwright test licao capitulo`

### T-50.2.8 — Fechamento da E1 (P)
- **Estado:** em andamento (falta o fechamento da iniciativa: gates completos e `spec-verifier`)
- **Resultado:** gates de fechamento, `spec-verifier` para T-50.1.* e T-50.2.*, registro, `ESTADO.md`, inventário de copy, glossário.
- **Depende:** T-50.1.4, T-50.2.7
- **Verificação:** gate de fechamento de entrega

---

## Fase 3 — Foca de corpo inteiro (E2, em paralelo)

### T-50.3.1 — SVG estático em camadas (G)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `FocaCorpo` vetorial (corpo, barriga, cabeça, olhos, boca, nadadeiras, cauda) a partir do original da T-50.0.4, cores por tokens, rostos das 5 expressões + dormindo; prancha de comparação (original × SVG, 64/120/200 px, claro/escuro).
- **Depende:** T-50.0.4
- **Arquivos:** `src/components/brand/FocaCorpo.tsx` (**NOVO**), `src/lib/brand/foca-corpo.ts` (**NOVO**), `docs/design/brand/foca-corpo-prancha.html` (**NOVO**)
- **Skills:** `frontend-design`, `motion-design` (preparar articulações)
- **Aceite:** prancha pronta para aprovação.
- **Verificação:** `bun test tests/unit; bun run build`

### T-50.3.2 — Aprovação da pose (P)
- **Estado:** bloqueada (avaliação do dono; publicado atrás de `focaCorpo`, DV50-14)
- **Resultado:** aprovação registrada; até 2 rodadas de ajuste; sem aprovação, a E2 fica bloqueada e a alternativa (ilustrador) é registrada como pendência do dono.
- **Depende:** T-50.3.1
- **Externo:** proprietário

### T-50.3.3 — Poses e movimento (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §5.8.3 em CSS (`styles.css`), pausa fora da tela e com aba oculta, aparelho fraco, reduced motion; `FocaMark` com `forma`, `pose`, `roupa` e `import()` do corpo.
- **Depende:** T-50.3.2
- **Arquivos:** `src/components/brand/FocaMark.tsx`, `FocaCorpo.tsx`, `src/styles.css`, `tests/unit/foca-corpo.test.ts` (**NOVO**)
- **Skills:** `motion-design`, `vercel-react-best-practices`, revisão `web-design-guidelines`
- **Aceite:** RF-20; nenhuma regra de CSS gira o corpo inteiro (teste lê o CSS); chunk ≤ 20 KB gzip.
- **Verificação:** `bun test tests/unit; bun run build; bunx playwright test mascote`

### T-50.3.4 — Momentos com o corpo (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §5.8.4 aplicado (fim de lição, perfeita, nível, retorno, vazio; marcos e loja quando existirem).
- **Depende:** T-50.3.3, T-50.2.7
- **Arquivos:** `CelebracaoAula.tsx`, estados vazios, `src/lib/voz.ts`
- **Skills:** `motion-design`, `frontend-design`
- **Aceite:** E2E dos momentos; G5; G7.
- **Verificação:** `bunx playwright test`

### T-50.3.5 — Roupas em camadas (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** 6 roupas SVG ancoradas na cabeça/pescoço, nunca no logo nem na cabeça de `FocaMark`.
- **Depende:** T-50.3.3
- **Arquivos:** `src/components/brand/roupas/` (**NOVO**), `src/lib/brand/foca-corpo.ts`
- **Skills:** `frontend-design`
- **Aceite:** prancha das roupas aprovada pelo dono junto com a loja (T-50.4.7).
- **Verificação:** `bun run build`

### T-50.3.6 — Regras do mascote e fechamento da E2 (P)
- **Estado:** em andamento (falta o fechamento da iniciativa: gates completos e `spec-verifier`)
- **Resultado:** `mascote.md` (forma corpo, partes articuladas, momentos, estado dormindo) e `regras.md` R-MASC-1/3; gates; `spec-verifier`; registro.
- **Depende:** T-50.3.4
- **Verificação:** gate de fechamento de entrega

---

## Fase 4 — Pérolas e loja (E3)

### T-50.4.1 — Migração 0004 (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §12.1 (`0004_economia.sql`) gerada, SQL revisado (só criação e ampliação), aplicada local e no Neon `dev`.
- **Depende:** T-50.2.8
- **Arquivos:** `src/server/db/schema/economia.ts` (**NOVO**), `src/server/db/schema/recompensas.ts`, `drizzle/0004_*.sql`
- **Skills:** `foca-backend`
- **Aceite:** `test:neon` verde; tabela de privacidade com as linhas novas.
- **Verificação:** `bun run db:generate; bun test tests/unit/servidor; bun run test:neon`

### T-50.4.2 — Regras puras da economia (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `src/lib/perolas.ts` com §5.3.2, §5.3.3, §5.3.5 (valores, limites, catálogo) e testes.
- **Depende:** T-50.4.1
- **Arquivos:** `src/lib/perolas.ts` (**NOVO**), `tests/unit/perolas.test.ts` (**NOVO**)
- **Skills:** `superpowers:test-driven-development`
- **Aceite:** nenhuma regra lê duração (RF-9).
- **Verificação:** `bun test tests/unit`

### T-50.4.3 — Concessões no servidor (G)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** em `aplicarEventos`: combo do servidor (`combo_dia`), vida do combo, bônus de XP, lição perfeita (+5), Pérolas por bloco, nível (+20), simulado (+30, quando existir); livro idempotente (`src/server/economia/perolas.ts`); agregado com `perolas` e `combo`.
- **Depende:** T-50.4.2
- **Arquivos:** `src/server/estudo/sincronizar.ts`, `src/server/economia/perolas.ts` (**NOVO**), `src/server/vidas/vidas.ts`, `src/lib/sync/contrato.ts`, `tests/unit/servidor/economia.test.ts` (**NOVO**)
- **Skills:** `foca-backend`, `superpowers:test-driven-development`, revisão L2
- **Aceite:** RF-2, RF-3, RF-7 (concorrência com duas transações), RF-10 parte; p95 do envio ≤ +20 ms (§7).
- **Verificação:** `bun test tests/unit/servidor`

### T-50.4.4 — Loja no servidor (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `comprarNaLoja`, `equiparCosmetico`, `minhaEconomia`, `historicoDePerolas`, com trava, saldo, plano, estoque, limite diário, `pedidoId`, limite por hora; inventário de isolamento.
- **Depende:** T-50.4.3
- **Arquivos:** `src/server/economia/loja.ts` (**NOVO**), `src/lib/api/economia.ts` (**NOVO**), `tests/unit/servidor/loja.test.ts` (**NOVO**), `tests/unit/servidor/isolamento.test.ts`
- **Skills:** `foca-backend`, revisão L2
- **Aceite:** RF-7, RF-8, G1.
- **Verificação:** `bun test tests/unit/servidor`

### T-50.4.5 — Ícone das Pérolas (P)
- **Estado:** concluida (02/10/2026; aguardando avaliação do dono, DV50-14)
- **Resultado:** `IconePerola` e logotipo, tokens `--perola`/`--perola-brilho` em `:root` e `.dark`, prancha 16–48 px claro/escuro.
- **Depende:** T-50.0.1
- **Arquivos:** `src/components/economia/IconePerola.tsx` (**NOVO**), `src/styles.css`, `docs/design/brand/perolas-prancha.html` (**NOVO**)
- **Skills:** `frontend-design`
- **Aceite:** contraste ≥ 3:1 nos dois temas; aprovação do dono registrada.
- **Verificação:** `bun run build`
- **Externo:** aprovação do dono

### T-50.4.6 — Barra superior e folha de Pérolas (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `BarraSuperior` (ofensiva, Pérolas, vidas) nas telas-raiz atuais (trilha, praticar atual, progresso, perfil) até a E4; `FolhaPerolas` com saldo, histórico de 90 dias, "a confirmar" offline; `TrailHeader` sem chama e vidas duplicadas.
- **Depende:** T-50.4.4, T-50.4.5
- **Arquivos:** `src/components/economia/BarraSuperior.tsx`, `FolhaPerolas.tsx` (**NOVOS**), `src/components/AppShell.tsx`, `src/components/learning/TrailHeader.tsx`, `src/lib/store.ts`, `src/lib/copy.ts`
- **Skills:** `frontend-design`, `better-writing`, revisão `web-design-guidelines`
- **Aceite:** RF-27 (parte); 320/390/1280; alvos ≥ 44 px.
- **Verificação:** `bunx playwright test barra layout`

### T-50.4.7 — Tela da loja e folha de vidas (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `/loja` (protetor, recarga, temas; roupas quando a T-50.3.5 existir, com provador da Foca); folha "Suas vidas de hoje acabaram" com recarga por Pérolas e "Rever erros".
- **Depende:** T-50.4.6
- **Arquivos:** `src/routes/loja.tsx` (**NOVO**), `src/components/economia/TelaDaLoja.tsx` (**NOVO**), `src/components/vidas/Vidas.tsx`, `src/lib/copy.ts`
- **Skills:** `frontend-design`, `better-writing`
- **Aceite:** RF-8 por E2E; nenhuma oferta em momento de risco; nada pré-selecionado.
- **Verificação:** `bunx playwright test loja vidas`

---

## Fase 5 — Ofensiva (E3)

### T-50.5.1 — Acender a ofensiva (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §5.2.1 como momento de prioridade 7.
- **Depende:** T-50.2.7
- **Arquivos:** `CelebracaoAula.tsx`, `src/components/learning/ChamaSequencia.tsx`, `src/styles.css`
- **Skills:** `motion-design`
- **Aceite:** uma vez por dia; reduced motion.
- **Verificação:** `bunx playwright test sequencia`

### T-50.5.2 — Meta de ofensiva (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `definirMetaOfensiva`, `encerrarMetaOfensiva`, concessão em `aplicarEventos`, UI na folha da ofensiva.
- **Depende:** T-50.4.3
- **Arquivos:** `src/server/gamificacao/ofensiva.ts` (**NOVO**), `src/lib/api/gamificacao.ts` (**NOVO**), `src/components/ofensiva/MetaOfensiva.tsx` (**NOVO**), `IndicadorSequencia.tsx`
- **Skills:** `foca-backend`, `frontend-design`, `better-writing`
- **Aceite:** RF-10; sem texto de perda.
- **Verificação:** `bun test tests/unit/servidor; bunx playwright test sequencia`

### T-50.5.3 — Calendário (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `calendarioOfensiva(mes)` e `CalendarioOfensiva` na folha.
- **Depende:** T-50.5.2
- **Arquivos:** `src/server/gamificacao/ofensiva.ts`, `src/components/ofensiva/CalendarioOfensiva.tsx` (**NOVO**)
- **Skills:** `frontend-design`, revisão `web-design-guidelines`
- **Aceite:** RF-11.
- **Verificação:** `bunx playwright test sequencia`

### T-50.5.4 — Marcos, baú e cartão (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `marco_ofensiva`, baú de conteúdo conhecido, `MomentoMarco`, `CartaoCompartilhar` (canvas, Web Share, "Salvar imagem").
- **Depende:** T-50.5.2
- **Arquivos:** `src/components/ofensiva/MomentoMarco.tsx`, `CartaoCompartilhar.tsx` (**NOVOS**), `src/server/gamificacao/ofensiva.ts`
- **Skills:** `motion-design`, `frontend-design`
- **Aceite:** RF-10 (baú uma vez); cartão sem dado pessoal (teste do conteúdo do canvas).
- **Verificação:** `bunx playwright test sequencia`

### T-50.5.5 — Fechamento da E3 (P)
- **Estado:** em andamento (falta o fechamento da iniciativa: gates completos e `spec-verifier`)
- **Resultado:** exportação e retenção das tabelas da 0004; `privacidade.md`; contratos C-XP; regras R-ESC-7/R-GAM-5; gates; `spec-verifier`; registro.
- **Depende:** T-50.4.7, T-50.5.4
- **Verificação:** gate de fechamento de entrega

---

## Fase 6 — Missões, desafio e conquistas (E4)

### T-50.6.1 — Migração 0005 (P)
- **Depende:** T-50.5.5 · **Arquivos:** `src/server/db/schema/gamificacao.ts` (**NOVO**), `drizzle/0005_*.sql` · **Skills:** `foca-backend` · **Aceite:** §12.1; `test:neon` · **Verificação:** `bun run test:neon` · **Estado:** concluida (02/10/2026; evidência no registro)

### T-50.6.2 — Catálogo e sorteio de missões (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `src/lib/missoes.ts` (§5.4.1) com elegibilidade por plano e conteúdo e garantia de 1 missão sem vida.
- **Depende:** T-50.6.1
- **Skills:** `superpowers:test-driven-development`
- **Aceite:** RF-13 (unitário).
- **Verificação:** `bun test tests/unit`

### T-50.6.3 — Missões no servidor e na tela (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** progresso em `aplicarEventos`, `minhasMissoes`, Pérolas, troca de missão que deixou de ser elegível (edge 8), seção em `/missoes` (provisória até a T-50.7.4).
- **Depende:** T-50.6.2
- **Arquivos:** `src/server/gamificacao/missoes.ts` (**NOVO**), `src/components/missoes/` (**NOVO**)
- **Skills:** `foca-backend`, `frontend-design`, `better-writing`
- **Aceite:** RF-13 (servidor e E2E); sem contagem regressiva.
- **Verificação:** `bun test tests/unit/servidor; bunx playwright test missoes`

### T-50.6.4 — Desafio do mês e medalha (P)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.6.3 · **Aceite:** RF-14 · **Verificação:** `bun test tests/unit/servidor`

### T-50.6.5 — Conquistas (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `src/lib/conquistas.ts`, concessão no servidor, tela de conquistas, `progress.achievements` como cópia.
- **Depende:** T-50.6.3
- **Skills:** `foca-backend`, `frontend-design`
- **Aceite:** RF-14; critério visível nas não conquistadas.
- **Verificação:** `bun test tests/unit; bunx playwright test missoes`

---

## Fase 7 — Navegação (E4)

### T-50.7.1 — Mapa de rotas e teste de alcance (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** teste E2E que percorre §5.11.2 (cada rota em ≤ 2 toques a partir da aba) e confere que as rotas antigas respondem como antes.
- **Depende:** T-50.0.5
- **Arquivos:** `tests/e2e/navegacao.spec.ts` (**NOVO**)
- **Aceite:** falha hoje nos destinos novos (teste primeiro).
- **Verificação:** `bunx playwright test navegacao`

### T-50.7.2 — 5 abas e barra superior em todas (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `NAV_ITEMS_V3` em `AppShell` e `NavRail` atrás de `navegacaoV3`.
- **Depende:** T-50.7.1, T-50.4.6
- **Skills:** `frontend-design`, `vercel-react-best-practices`, revisão `web-design-guidelines`
- **Aceite:** RF-27; 320/390/1280.
- **Verificação:** `bunx playwright test navegacao layout`

### T-50.7.3 — Praticar (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `/praticar` com os cartões de §5.7.2 e "Rever erros recentes" (sessão sem vida/XP/domínio).
- **Depende:** T-50.7.2, T-50.2.4
- **Arquivos:** `src/routes/praticar.tsx` (**NOVO**), `src/components/praticar/` (**NOVO**)
- **Skills:** `frontend-design`, `better-writing`
- **Aceite:** RF-18 parte.
- **Verificação:** `bunx playwright test navegacao praticar`

### T-50.7.4 — Missões (aba) (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `/missoes` com missões, desafio, conquistas; Liga e Amigos só 18+ (entram com a E8).
- **Depende:** T-50.6.5, T-50.7.2
- **Arquivos:** `src/routes/missoes.tsx` (**NOVO**)
- **Aceite:** conta de 17 não vê seções sociais.
- **Verificação:** `bunx playwright test missoes`

### T-50.7.5 — Perfil absorve Progresso; Redação vira aba (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** Perfil reorganizado (§5.11.2); hub de Redação com Treino livre e Corretor.
- **Depende:** T-50.7.2
- **Arquivos:** `src/routes/profile.tsx`, `src/routes/redacao.index.tsx`
- **Skills:** `frontend-design`, `better-writing`
- **Aceite:** RF-18 completo; G10.
- **Verificação:** `bunx playwright test navegacao perfil redacao`

### T-50.7.6 — Fechamento da E4 (com a F8) (P)
- **Estado:** em andamento (falta o fechamento da iniciativa: gates completos e `spec-verifier`) · **Depende:** T-50.7.5, T-50.8.2 · **Resultado:** gates, `spec-verifier`, registro, flag `navegacaoV3` ligada por padrão · **Verificação:** gate de fechamento de entrega

---

## Fase 8 — Retrospectiva (E4, com prazo)

### T-50.8.1 — Agregado anual (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `minhaRetrospectiva` com cache; `RETROSPECTIVA_INICIO` com a data oficial do 2º dia do ENEM 2026 (consultada no INEP).
- **Depende:** T-50.0.5 (independente das missões)
- **Arquivos:** `src/server/retrospectiva.ts` (**NOVO**), `src/server/env.ts`
- **Skills:** `foca-backend`
- **Aceite:** RF-19 (servidor); isolamento.
- **Verificação:** `bun test tests/unit/servidor`

### T-50.8.2 — Tela e cartão (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `/retrospectiva` e cartão de compartilhar (reusa T-50.5.4; antes dela, versão própria simples).
- **Depende:** T-50.8.1
- **Skills:** `frontend-design`, `better-writing`, `motion-design`
- **Aceite:** RF-19; publicada antes do 2º dia do ENEM 2026 (se a E4 atrasar, publicar sozinha).
- **Verificação:** `bunx playwright test retrospectiva`

---

## Fase 9 — Questões com imagem e fontes (E5)

### T-50.9.1 — Modelo de dados das imagens e da tabela (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `ExerciseImage` (largura, altura, descrição, crédito), `imagens[]`, alternativa-imagem, `tabela`; validador (`sem-imagem-externa` mantida; alt obrigatório; dimensões); `build-packs` copia imagens com hash; cabeçalho de cache.
- **Depende:** T-50.0.3
- **Arquivos:** `src/lib/lessons/types.ts`, `src/content/items/types.ts`, `scripts/content/validate.ts`, `scripts/content/build-packs.ts`, `vercel.json`
- **Skills:** `superpowers:test-driven-development`
- **Aceite:** itens atuais validam igual; item de teste com imagem passa.
- **Verificação:** `bun test tests/unit; bun run build`

### T-50.9.2 — Figura, tabela e visualizador acessíveis (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `FiguraDaQuestao`, `TabelaDaQuestao`, `VisualizadorDeImagem` (§5.9.3) nos players e no feedback.
- **Depende:** T-50.9.1
- **Arquivos:** `src/components/questao/` (**NOVO**), `QuestionStepView.tsx`, `LessonPlayer.tsx`
- **Skills:** `frontend-design`, revisão `web-design-guidelines`
- **Aceite:** RF-21 (axe, teclado, toque); tema escuro com fundo próprio.
- **Verificação:** `bunx playwright test questao-imagem`

### T-50.9.3 — Importador do INEP (G)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `content-pipeline/oficial/importar-inep.ts` (§5.9.2 passos 1–7), escolha documentada da ferramenta de PDF (devDependency do pipeline, versão fixada), lista de URLs com hash.
- **Depende:** T-50.9.1
- **Arquivos:** `content-pipeline/oficial/` , `content-pipeline/package.json` (se o pipeline tiver o próprio) ou `devDependencies` da raiz com justificativa
- **Skills:** `superpowers:test-driven-development`
- **Aceite:** importa ENEM 2023 e confere com as 18 já transcritas (mesmo texto e gabarito); teste `pipeline-boundary` continua verde.
- **Verificação:** `bun test tests/unit; bun run content:importar-inep -- --ano 2023 --seco`
- **Risco/reversão:** pipeline fora do bundle.

### T-50.9.4 — Validação automática, amostra e relatório (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** checagens por questão, amostra de 10% por prova com recorte ao lado, relatório em `content-pipeline/oficial/relatorios/`.
- **Depende:** T-50.9.3
- **Aceite:** RF-21 (parte pipeline); questão com falha vai para "não importado" com motivo.
- **Verificação:** `bun run content:importar-inep -- --ano 2023 --relatorio`

### T-50.9.5 — Alt, descrição longa e explicações (M)
- **Estado:** em andamento (alt automático marcado como tal; explicações das 906 importadas pendentes: `explicacaoPendente`)
- **Resultado:** no pipeline, alt e descrição (marcados automáticos, sem entregar a resposta) e explicação `ia-delegada` separada do original.
- **Depende:** T-50.9.4
- **Skills:** nenhuma de copy (conteúdo pedagógico, `docs/copy/05`)
- **Aceite:** teste do pipeline: descrição não contém o texto da alternativa correta nem a letra; regra dura 8.
- **Verificação:** `bun test tests/unit`

### T-50.9.6 — Lote 2019–2025 (G)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** ~1.260 questões importadas, validadas e com relatório; pacotes gerados.
- **Depende:** T-50.9.5
- **Aceite:** relatório por prova; ≥ 90% importadas por prova ou motivo registrado.
- **Verificação:** `bun run build` (pacotes) + relatórios

### T-50.9.7 — Créditos e reportar problema (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `/creditos`; `reportarQuestao` + migração do reporte (na 0006) + retirada com 2 denúncias iguais.
- **Depende:** T-50.9.2
- **Arquivos:** `src/routes/creditos.tsx` (**NOVO**), `src/server/conteudo/reportes.ts` (**NOVO**)
- **Skills:** `foca-backend`, `better-writing`
- **Aceite:** RF-28.
- **Verificação:** `bun test tests/unit/servidor; bunx playwright test creditos`

### T-50.9.8 — Lote 2009–2018, PPL e ENCCEJA (G)
- **Estado:** pendente (adiável sem bloquear o simulado)
- **Depende:** T-50.9.6
- **Aceite:** igual à T-50.9.6.

### T-50.9.9 — Vestibulares com licença (M)
- **Estado:** adiada (02/10/2026: o dono autorizou aceitar o risco ou seguir só com o INEP; o agente escolheu só INEP por enquanto, spec §21 item 2) → backlog na T-50.16.1
- **Resultado:** e-mail-modelo por banca; com licença registrada em `content-pipeline/licencas/`, adaptador do importador para a prova da banca.
- **Externo:** proprietário (envio e resposta)

---

## Fase 10 — Simulado (E5)

### T-50.10.1 — Migração 0006 (P)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.9.1 · **Aceite:** §12.1 · **Verificação:** `bun run test:neon`

### T-50.10.2 — Composição (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** prova oficial por área/dia, nível ENEM (habilidades e dificuldade), mini da semana (determinístico por semana); limiar que liga `funcaoLigada("simulado")`.
- **Depende:** T-50.10.1, T-50.9.6
- **Arquivos:** `src/server/simulado/composicao.ts` (**NOVO**), `src/server/planos/funcoes.ts`
- **Skills:** `superpowers:test-driven-development`
- **Aceite:** unitário de composição (sem repetição, cobertura por habilidade, ordem original na prova oficial); rótulos de §5.9.4.
- **Verificação:** `bun test tests/unit`

### T-50.10.3 — Servidor do simulado (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** iniciar, responder (salva na hora), pausar, concluir, retomar, encerrar abandonado; tentativas `fonte: "simulado"`; recompensas.
- **Depende:** T-50.10.2
- **Arquivos:** `src/server/simulado/simulado.ts` (**NOVO**), `src/lib/api/simulado.ts` (**NOVO**)
- **Skills:** `foca-backend`, revisão L2
- **Aceite:** RF-22 servidor; isolamento; limite por hora.
- **Verificação:** `bun test tests/unit/servidor`

### T-50.10.4 — Tela do simulado (G)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `/simulado` (lista, convites) e `/simulado/$id` (mapa, marcar para rever, cronômetro opcional, pausa, imagens pré-carregadas).
- **Depende:** T-50.10.3, T-50.9.2
- **Skills:** `frontend-design`, `vercel-react-best-practices`, `better-writing`, revisão `web-design-guidelines`
- **Aceite:** RF-22 (E2E de retomada; tempo esgotado não encerra), RF-23.
- **Verificação:** `bunx playwright test simulado`

### T-50.10.5 — Resultado e integrações (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** por área e habilidade, "O que revisar", gabarito e explicação, caderno (Basic/Pro), domínio, missão do mini.
- **Depende:** T-50.10.4
- **Aceite:** sem nota/TRI (busca de texto); erros no caderno para Basic/Pro.
- **Verificação:** `bunx playwright test simulado funcoes-pagas`

### T-50.10.6 — Fechamento da E5 (P)
- **Estado:** em andamento (falta o fechamento da iniciativa: gates completos e `spec-verifier`) · **Depende:** T-50.9.7, T-50.10.5 · **Resultado:** planos sem "em breve" no simulado (`ENTREGAS_PUBLICADAS`), `conteudo.md`, `privacidade.md`, gates, `spec-verifier` · **Verificação:** gate de fechamento de entrega

---

## Fase 11 — Redação por tarefas e corretor (E6)

### T-50.11.1 — Tipo `escrita` e nós "Escreva" (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** tipo novo (R-ESC-9), validador, nós nas três trilhas, rota `/redacao/escreva/$tarefaId`, rascunho no store, envio.
- **Depende:** T-50.2.8
- **Arquivos:** `src/lib/lessons/types.ts`, `src/content/trilhas/`, `src/routes/redacao.escreva.$tarefaId.tsx` (**NOVO**), `src/components/redacao/TelaDaTarefa.tsx` (**NOVO**), `src/server/redacao/redacao.ts`, `drizzle/0007_*.sql`
- **Skills:** `foca-backend`, `frontend-design`, `better-writing`
- **Aceite:** RF-24 (Free envia); bloco, XP 10 na primeira, Pérolas.
- **Verificação:** `bun test tests/unit; bunx playwright test redacao`

### T-50.11.2 — Trechos e temas autorais (M)
- **Estado:** concluida (02/10/2026; revisão factual e pedagógica do dono pendente, DV50-31)
- **Resultado:** 12 tarefas com trechos dados e 20 temas de treino pelo `content-pipeline/`, rotulados.
- **Depende:** T-50.11.1
- **Skills:** nenhuma de copy (conteúdo pedagógico)
- **Aceite:** revisão factual; rótulo "não é tema oficial".

### T-50.11.3 — Checagem automática ampliada e texto-modelo (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `comentarioLocal` para trecho e completo (§5.10.2), texto-modelo comentado por tarefa.
- **Depende:** T-50.11.2
- **Arquivos:** `src/lib/redacao-ia.ts`, `src/lib/copy.ts`
- **Skills:** `superpowers:test-driven-development`, `better-writing`
- **Aceite:** unitários; "checagem automática: olha a estrutura, não dá nota".
- **Verificação:** `bun test tests/unit`

### T-50.11.4 — Comentário IA no trecho (Pro) (P)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** reusa o treino (1 mensagem da cota), para os nós "Escreva".
- **Depende:** T-50.11.3
- **Skills:** revisão L2 (prompt)
- **Aceite:** RF-24 (nenhuma chamada à IA para Free/Basic).
- **Verificação:** `bun test tests/unit/servidor`

### T-50.11.5 — Rubrica v2 e "sem estimativa" (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `SISTEMA_CORRETOR` v2 com níveis, saída com "o que fazer para subir" e `situacao`; checagem local de 7 linhas antes da IA; teste de injeção.
- **Depende:** T-50.11.3
- **Arquivos:** `src/lib/redacao-ia.ts`, `src/server/redacao/redacao.ts`, `src/components/redacao/TelaDoCorretor.tsx`
- **Skills:** revisão L2 (`docs/copy/04`; sem `humanizer` no prompt)
- **Aceite:** unitários de leitura da saída; cota não gasta em "sem estimativa".
- **Verificação:** `bun test tests/unit`

### T-50.11.6 — Avaliação técnica do corretor (M)
- **Estado:** bloqueada (ferramenta pronta; falta a chave da OpenAI e os conjuntos A/B/C)
- **Resultado:** `scripts/redacao/avaliar-corretor.ts` e os conjuntos A/B/C; relatório com as metas de §5.10.5 no registro.
- **Depende:** T-50.11.5
- **Externo:** chave da OpenAI; textos do conjunto C pelo dono
- **Aceite:** RF-25 (parte técnica).
- **Verificação:** `bun scripts/redacao/avaliar-corretor.ts --rodadas 3`

### T-50.11.7 — Revisão do dono, botões e liberação (P)
- **Estado:** bloqueada (botões prontos; falta a revisão do dono das 10 estimativas e o pedido para ligar)
- **Resultado:** checklist das 10 estimativas registrada; "Ajudou"/"Achei estranha"; rótulo final (§21 item 1); corretor sai de "em breve" quando ligado.
- **Depende:** T-50.11.6
- **Externo:** proprietário; ligar em produção só com pedido
- **Aceite:** RF-25 completo.
- **Verificação:** gate de fechamento de entrega

---

## Fase 12 — Pular para cá (E7)

### T-50.12.1 — Regra e composição do teste (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.2.8 · **Arquivos:** `src/server/trilha/pulo.ts` (**NOVO**), `src/lib/learning/selectors.ts` · **Skills:** `foca-backend`, `superpowers:test-driven-development` · **Aceite:** 1 item por habilidade, inéditos, 6–10 · **Verificação:** `bun test tests/unit`

### T-50.12.2 — Efeitos ao passar e ao não passar (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.12.1 · **Resultado:** conclusão `pulo`, domínio só por evidência, checagem agendada, XP 20 uma vez, bloco; migração 0008 · **Aceite:** RF-17 · **Verificação:** `bun test tests/unit/servidor; bun run test:neon`

### T-50.12.3 — UI no nó e resultado (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.12.2 · **Skills:** `frontend-design`, `better-writing` · **Aceite:** sem texto de fracasso; limites de 1/capítulo/dia e 3/dia · **Verificação:** `bunx playwright test trilha`

### T-50.12.4 — Fechamento da E7 (P)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.12.3 · **Resultado:** contrato novo em `contratos.md` (C-XP e trilha), gates, `spec-verifier` · **Verificação:** gate de fechamento de entrega

---

## Fase 13 — Ligas 18+ (E8)

### T-50.13.1 — Migração 0009 (parte ligas) (P)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.7.6 · **Verificação:** `bun run test:neon`

### T-50.13.2 — Regras puras das ligas (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Resultado:** `src/lib/ligas.ts` (divisões, corte, empate, inativo, grupos com mínimo de 5) · **Skills:** `superpowers:test-driven-development` · **Aceite:** RF-15 (unitário; edge 9 e 10) · **Verificação:** `bun test tests/unit`

### T-50.13.3 — Grupos e fechamento semanal (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Resultado:** `src/server/ranking/ligas.ts`, cron `/api/cron/ligas` idempotente, `liga_resultado`, antifraude de §5.5 · **Skills:** `foca-backend`, revisão L2 · **Aceite:** RF-15 (servidor) · **Verificação:** `bun test tests/unit/servidor`

### T-50.13.4 — Tela da liga (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Resultado:** `/ranking` como "Liga da semana", em Missões, resultado neutro, selo no Perfil · **Skills:** `frontend-design`, `better-writing` · **Aceite:** nada marca a zona de descida; conta de 17 vê o aviso · **Verificação:** `bunx playwright test ranking`

### T-50.13.5 — Retenção, exportação e privacidade (P)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.13.3 · **Aceite:** G9 · **Verificação:** `bun test tests/unit/servidor`

---

## Fase 14 — Ofensiva com amigos 18+ (E8)

### T-50.14.1 — Migração 0009 (parte social) (P)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.13.1 · **Verificação:** `bun run test:neon`

### T-50.14.2 — Servidor: convites, pedidos, duplas (G)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** §5.6.2–5.6.4: código com hash, uso único, 72 h, limites; regra da dupla pelos `study_day`; filtro de idade em toda leitura.
- **Depende:** T-50.14.1
- **Arquivos:** `src/server/social/amigos.ts` (**NOVO**), `src/lib/api/amigos.ts` (**NOVO**)
- **Skills:** `foca-backend`, `agent-skills:security-and-hardening` (L2)
- **Aceite:** RF-16 (servidor; menor não vê o apelido de quem convidou).
- **Verificação:** `bun test tests/unit/servidor`

### T-50.14.3 — Saída, bloqueio, denúncia, suspensão e correção de idade (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.14.2 · **Arquivos:** `src/server/social/denuncias.ts` (**NOVO**), ponto único chamado pela correção de idade do suporte · **Skills:** `foca-backend`, revisão L2 · **Aceite:** §5.6.5; edge 12 · **Verificação:** `bun test tests/unit/servidor`

### T-50.14.4 — Telas de amigos e convite (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Depende:** T-50.14.3, T-50.7.4 · **Arquivos:** `src/components/amigos/` (**NOVO**), `src/routes/amigos.convite.$codigo.tsx` (**NOVO**) · **Skills:** `frontend-design`, `better-writing` · **Aceite:** RF-16 (E2E com contas de 17 e 18+) · **Verificação:** `bunx playwright test amigos`

### T-50.14.5 — Fechamento da E8 (P)
- **Estado:** em andamento (falta o fechamento da iniciativa: gates completos e `spec-verifier`) · **Depende:** T-50.13.5, T-50.14.4 · **Resultado:** `privacidade.md`, exportação, retenção, `regras.md` (R-GAM-2 item 5, R-ESC-4), gates, `spec-verifier`; produção só depois da revisão jurídica e de alguém para atender denúncias · **Verificação:** gate de fechamento de entrega

---

## Fase 15 — Lembretes (E9)

### T-50.15.1 — Dependência `web-push` (P)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Resultado:** versão fixada no `package.json` (só servidor), licença e tamanho conferidos, registro da decisão; nada no bundle do navegador · **Skills:** revisão L2 (dependência) · **Verificação:** `bun install; bun run build` (busca no bundle)

### T-50.15.2 — Worker único (M)
- **Estado:** concluida (02/10/2026; evidência no registro)
- **Resultado:** `public/sw.js` com push e offline por modo (IndexedDB); `sw-offline.js` vira desregistro; `service-worker.ts` migra registros antigos; regras de §5.2.5 e as da 49 (nunca `/api`, `/_serverFn`, não-GET; só páginas de estudo; limpa ao sair da conta).
- **Depende:** T-50.15.1
- **Skills:** `foca-backend`, revisão L2
- **Aceite:** E2E `funcoes-pagas` (offline) continua verde; Free com lembrete **não** ganha cache offline.
- **Verificação:** `bunx playwright test funcoes-pagas lembretes`

### T-50.15.3 — Assinatura e preferência (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Resultado:** migração 0010, `chavePublicaDoLembrete`, `salvarLembrete`, `removerLembrete`, tela no Perfil com detecção de suporte e guia do iPhone · **Skills:** `foca-backend`, `frontend-design`, `better-writing` · **Aceite:** padrão desligado; texto neutro · **Verificação:** `bun test tests/unit/servidor; bunx playwright test lembretes`

### T-50.15.4 — Crons e envio (M)
- **Estado:** concluida (02/10/2026; evidência no registro) · **Resultado:** 4 crons diários no `vercel.json`, `/api/cron/lembretes?janela=`, regras de §5.2.5, limpeza de 404/410, pausa em 7 · **Skills:** `foca-backend` · **Aceite:** RF-12 (relógio falso) · **Verificação:** `bun test tests/unit/servidor`

### T-50.15.5 — Teste em aparelho (P)
- **Estado:** bloqueada (teste em aparelho pelo dono; depende de `LEMBRETES_HABILITADO` e VAPID) · **Externo:** proprietário (Android; iPhone com o app na Tela de Início) · **Aceite:** notificação recebida na janela e toque abre o app

### T-50.15.6 — Fechamento da E9 (P)
- **Estado:** em andamento (falta o fechamento da iniciativa: gates completos e `spec-verifier`) · **Resultado:** `privacidade.md`, `mascote.md` (§2 notificações), R-ESC-6/R-GAM-2 item 6, gates, `spec-verifier` · **Verificação:** gate de fechamento de entrega

---

## Fase 16 — Fechamento da iniciativa

### T-50.16.1 — Backlog (P)
- **Estado:** pendente · **Resultado:** itens novos: "dar um toque" (§5.6.6), painel de responsável (ECA arts. 17–18), professor externo para o corretor (B-169 revisto), lote 2009–2018 se adiado, lembrete em horário livre (Vercel Pro) · **Verificação:** `bun run docs:check`

### T-50.16.2 — Revisão de 4 semanas da economia (P)
- **Estado:** pendente · **Depende:** E3 publicada e ligada há 4 semanas · **Resultado:** métricas de §9 no registro e ajuste de valores em `perolas.ts` se preciso (mudança de valor = nota no registro, sem nova spec)

### T-50.16.3 — Encerramento (P)
- **Estado:** pendente · **Resultado:** checklist de §20 e de [SDD-WORKFLOW.md](../../ai/SDD-WORKFLOW.md) §3 "Encerrar uma iniciativa"
