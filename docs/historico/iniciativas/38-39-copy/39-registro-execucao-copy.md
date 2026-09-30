> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 39 — Registro de execução: sistema de copy e roteamento de skills de escrita

**Plano normativo:** [38-plano-sistema-copy-e-skills.md](38-plano-sistema-copy-e-skills.md) (aprovado em 28/09/2026 pelo usuário: "aprovo, pode começar").
**Início da execução:** 28/09/2026 · **Commit base:** `76a7b70f33f173e293061611d4e0cd5f8a1d5dad` (main) · **Executor:** Claude Code (Sonnet 5.5).
**Estado deste registro:** **PLANO FECHADO em 28/09/2026.** Fases C0 a C9 concluídas, T-C7.5 e a nota no `09` feitas no fechamento, decisões D-1…D-5, P-1 e P-2 tomadas (seção 4). O que sobra é de outro plano: a migração das strings (seção 5). Nenhum commit/push/branch foi feito (o plano manda só com pedido explícito).

Retomada: a última tarefa com "✅" na seção 3 é o ponto de partida.

## 1. Linha de base (T-C0.2)

Rodada em 28/09/2026, sobre `76a7b70`, com o plano técnico `36` **em execução paralela** (a árvore já tinha alterações dele em `src/` e `tests/`).

| Verificação | Comando | Resultado real |
|---|---|---|
| Commit | `git rev-parse HEAD` | `76a7b70f33f173e293061611d4e0cd5f8a1d5dad` |
| Skills | `node scripts/validate-skills.mjs` | `OK — 0 FAIL, 3 warn` (avisos de colisão de nome entre plugins, preexistentes) |
| Estado do `36` | topo de `docs/37` | Fases 0–1 concluídas segundo o cabeçalho; a árvore já mostra alterações em `src/lib/store.ts`, `src/lib/copy.ts`, `src/lib/adaptive/*`, `trilha.tsx`, `SessionCard.tsx`, `JourneyPath.tsx` — o `36` está na Fase 2 ou depois. **T-10.3 (SDD) não rodou.** |

Arquivos modificados/não rastreados **antes** de qualquer edição deste plano (não tocar; donos: `36` ou usuário):

- Do `36` (código e testes): todo `src/**` e `tests/**` listados em `git status`, incluindo `src/lib/copy.ts`.
- Fora dos dois planos: `docs/historico/fundacao/09-branding.md` (modificado), `Claude outputs/` (não rastreado) — ver `37` D-6.
- Documentos `35`, `36`, `37` (do `36`) e `38` (deste plano) não rastreados.

`src/lib/copy.ts` **está sendo alterado pelo `36`**. Este plano só o lê; qualquer citação de chave dele nos guias deve ser conferida contra o arquivo na hora da escrita e pode mudar depois.

## 2. Divergências plano × realidade

| # | Onde | Divergência | Decisão |
|---|---|---|---|
| D-A | §V.3 DEP-1 | T-10.3 do `36` ainda não rodou | `PRODUCT.md`/`DESIGN.md` ficam pendentes (T-C7.5) |
| D-B | §S, nota de precedência em `docs/historico/fundacao/09-branding.md` | O arquivo já estava modificado por outra frente (a árvore mostra `09`, `public/branding/**`, `scripts/gerar-logos-foca.ps1`, `docs/design/brand/foca-design-system-2026-09-28.html` e `playwright.config.ts` alterados, nenhum por este plano). O §V.1/READY do `38` manda não tocar arquivo sujo por outra sessão | **Nota não adicionada.** O `09` já é histórico segundo o `CLAUDE.md`. Pendente para depois que o dono das alterações concluir |
| D-C | §V.1 e §X.1, "`git diff --stat -- src tests …` vazio" | Impossível literalmente: o `36` está alterando `src/**` e `tests/**` (38 arquivos na última conferência). O critério existe para provar que **este plano** não tocou código | Substituído por conferência por arquivo: `voz.ts`, `tutor-prompt.ts`, `brand.ts`, `welcome.tsx`, `index.tsx`, `offline.tsx`, `__root.tsx`, `src/content/**`, `src/data/**` sem modificação (`git status --short` vazio para eles). `src/lib/copy.ts` aparece modificado, **pelo `36`** (`comum`, RU-1…RU-3), e foi só lido |
| D-D | §X.1 "Links" | O verificador achou 3 "links quebrados" só em `docs/38`: dois são links relativos à raiz dentro de blocos de código (o texto que vai para o `CLAUDE.md`) e um é um placeholder de exemplo de sintaxe de link | Não são links reais; 204 de 207 resolvem, sem quebra nos arquivos publicados |
| D-E | §T, "≤ 10 linhas" no `CLAUDE.md` | A seção "Copy e escrita" tem 9 linhas mais a frase acrescentada ao workflow (10 linhas alteradas no total, 1 removida por ser a mesma linha estendida) | Dentro do espírito |
| D-G | C2, §7 de `SKILL-ROUTING.md` | O verificador achou 3 casos antigos (landing, onboarding, revisão de copy) divergindo do §2.1 | Alinhados ao §2.1: rota de marketing com Ogilvy e `copy-editing`; "onboarding" separado em dentro do app × de conversão; auditoria como UX writing em modo auditoria |
| D-H | Pedido do usuário na sessão ("esse é o design system atualizado, com as novas logos, coloque lá") | Fora do escopo do `38`. O arquivo `docs/design/brand/foca-design-system-2026-09-28.html` e os logos novos em `public/branding/foca/` já estavam no disco | Interpretado como **registrar** o design system atualizado na documentação: `docs/README.md` (linha `brand/`), `docs/design/brand/foca-rabisco-branding.md` (arquivos da entrega), `CLAUDE.md` (seção Design system), `docs/DESIGN.md` (fontes). Nenhum arquivo do HTML ou de `public/` foi editado; `docs/historico/fundacao/09-branding.md` segue intocado. **Interpretação a confirmar com o usuário** |
| D-F | §U.2 passo 3, "uma chamada de `better-writing` por área" | A skill já estava carregada na sessão; apliquei a skill área por área sem 12 chamadas separadas | Registrado no cabeçalho da auditoria |

## 3. Por fase

| Fase | Estado |
|---|---|
| C0 | ✅ T-C0.1, T-C0.2 (seção 1) |
| C1 | ✅ T-C1.1…T-C1.5 (detalhe abaixo) |
| C2 | ✅ T-C2.1, T-C2.2, T-C2.3 — com 1 FAIL esperado do validador, ver abaixo |
| C3 | ✅ T-C3.1…T-C3.4 |
| C4 | ✅ `docs/copy/02-voz-e-tom.md` |
| C5 | ✅ `docs/copy/03-ux-writing.md` |
| C6 | ✅ `copy/04`, `05`, `06` |
| C7 | ✅ T-C7.1…T-C7.5 (T-C7.5 no fechamento, ver "Fechamento") |
| C8 | ✅ `copy/auditoria-2026-09-28.md` |
| C9 | ✅ verificação pelo agente `spec-verifier` + comandos do §X.1 (abaixo) |

### C1 — instalação (28/09/2026)

- **T-C1.1** Clone completo fora do repo (scratchpad). `git rev-parse HEAD` = `645553ca7622570479e330cc089c65fcf34e0ba8`, idêntico ao commit auditado no `38`; `git diff --stat 645553c..HEAD -- better-writing ogilvy` vazio. Arquivos: `better-writing/SKILL.md`, `better-writing/review-output.md`, `ogilvy/SKILL.md`. Zero `.js/.sh/.json/.py`; `grep` por `curl|wget|eval|exec|http` só achou texto de prosa ("executed completely").
- **T-C1.2** `DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx --yes skills@1.7.0 add https://github.com/boraoztunc/skills --skill better-writing --skill ogilvy-copywriting -a claude-code --copy -y` → exit 0, "Installed 2 skills", destino `.claude/skills/better-writing` e `.claude/skills/ogilvy-copywriting`. O CLI casou o Ogilvy pelo `name` do frontmatter (`ogilvy-copywriting`), como previsto. `skills-lock.json` ganhou as duas entradas (hashes `26831ddf…` e `da1ff121…`). O resumo do CLI citou `.agents/skills/`, mas nada foi criado lá (`.agents/` continua só com `product-marketing.md`).
- **T-C1.3** `diff -r` clone × instalado: sem diferença nas duas pastas. Nenhum `SKILL.md` editado.
- **T-C1.4** Nenhuma pasta traz arquivo de licença; nada criado dentro da skill. Licença, autor e upstream registrados em `SKILLS.md` §Q/§R.
- **T-C1.5** Duas entradas em `skills[]` do registry. As duas skills apareceram na lista de skills da própria sessão logo após a instalação.

### C2 — registro e roteamento

- `docs/ai/SKILLS.md`: tabela §1 (linhas Q, R), tokens, §K (canônicas + leitura pelo cache), §L (papel novo + comparação com Stop Slop), seções Q, R, "Avaliadas e não instaladas", "Como atualizar".
- `docs/ai/SKILL-ROUTING.md`: nomes locais, 7 classes de escrita no §2, novo §2.1 (níveis, ordem, orçamento, pipelines), §3, §4 (3 linhas), §5, 9 casos no §7. O arquivo é CRLF; a edição preservou.
- `.claude/skills-registry.json`: `updated`, `contextFiles.copy`, 10 entradas em `declined[]`, `routes[]` passou de 15 para 20 classes (`app-copy` virou `microcopy`, `ux-writing`, `foca-voice`, `foca-ai`, `pedagogical-content`; `marketing` atualizada; `positioning` nova).
- **Validador:** `node scripts/validate-skills.mjs` → 1 FAIL: `contexto copy ausente: docs/COPY.md`. **Esperado**: o arquivo é criado na C7 (T-C7.1). Não é regressão; some ao fim da C7. As duas skills passam em frontmatter, links internos e `skills-lock`; 20 rotas resolvem.

### C3 — estratégia

- Criado `docs/copy/01-estrategia.md` (6 seções). Sinais de estado conferidos no código: `prefs.onboarded`, `prefs.examTargets[].examDate`, `progress.lastStudyDate`, `progress.streak`/`streakFreezes`, `learning.placement.status`, `learning.reviewSchedule`, `learning.recentAttempts`. "Frustrado" ficou como **[sem sinal no código — só vale para o tutor]**.
- **T-C3.3** `ogilvy-copywriting` carregada e usada só nas perguntas 1–4 e 6. Resumo: posicionamento = app que escolhe a próxima atividade e diz por quê, para quem estuda em tempo picado; promessa única = "o próximo passo já está escolhido"; big idea = recomeçar custa quase nada porque a decisão já vem tomada; prova = o próprio produto em ação (motivo no card, faixas), nunca depoimento/número. Gerou as 3 opções da D-1 (`01` §5.4), todas `PROPOSTA — aguarda D-1`; uma quarta ("Mais dias estudando") descartada por prometer retenção.
- **T-C3.4** `copy-editing` 2.0.0 lida do cache (sem ligar o pacote), passadas "Prove It" e "Especificidade" sobre §5.4. Achado aproveitado: a única medida específica que o produto comprova é "4 a 8 questões por lição" (`25`); duração em minutos segue proibida.
- **Achados de dependência confirmados no `36`:** o nivelamento não aplica priors nem muda a fila (C1/B3) e o CTA "Continuar" de prática/revisão volta à Home (C2/B2). O `01` proíbe prometer "o nivelamento muda a sua trilha" e marca a opção 2 como dependente (DEP-2, DEP-7).
- Validação: `rg` de termos de promessa em `01` só acha ocorrências na seção "nunca promete", em citação do problema P6 e na ressalva de uma opção.
- **Divergência do plano:** nenhuma.

### C4 — voz e tom

- Criado `docs/copy/02-voz-e-tom.md`. A tabela e os tamanhos-alvo do `20` §7.1 estão como **citação literal** (§3.1). Sem skill (o guia é a régua). Autoverificação: `rg` de "Não é X. É Y", "jornada", "incrível", "cada passo" só acha exemplos "NÃO", chaves `COPY.jornada.*` e a linha do glossário de voz.
- **Regras que ESTENDEM o `20` §7.1 (5):** (1) humor nunca em erro técnico, confirmação destrutiva, explicação, frustração nem retorno; (2) "celebração editorial" (o único lugar do emoji excepcional) definida como fim de capítulo e marco de streak, no máximo um emoji; (3) o humor tem um assunto só, a Foca ser um bicho de pedra; (4) número só de estado, por template; (5) um único registro por flow. Nenhuma contradiz o `20`.
- **Achados na copy atual** (só registrados, para a auditoria): resíduos do arquétipo antigo em `voz.ts` (acertou, errou, fimbom, fimruim, marco, vazio, retorno); `motivos.revisao-devida` cita "Porcentagem" fixo.
- **Correção durante a execução:** as chaves RU-1…RU-3 do `36` moram em `COPY.jornada`, não em `COPY.trilha`; corrigido em `02` e `03`.

### C5 — UX writing e glossário

- Criado `docs/copy/03-ux-writing.md`: prioridades, 30 padrões por componente (cada um com chave real ou "não existe"), glossário de 26 termos com status, manutenção.
- **T-C5.3** `better-writing` carregada e aplicada aos exemplos "canônico" e "anti-padrão" (§2.1 do `03`, formato do `review-output.md`). Voz de marca preservada. Achados: 0 HIGH, 4 MEDIUM (`publicado` × `disponível`; `voltarJornada` × `voltarTrilha`; aria-label "tutor de IA" × "Foca"; imperativo em 3 registros; plural de "1 questões"/"1 lições"), 2 LOW (`Fazer o nivelamento` × `Fazer nivelamento`; placeholder com três pontos). Veredito: Needs changes, para a migração. Nada foi alterado em `copy.ts`.
- **Achado de honestidade fora do escopo da skill:** `COPY.onboarding.ofertaCorpo` afirma "cerca de 10 minutos" para o nivelamento (texto do `30` §12.2). Duração nunca medida; contradiz a regra de `01` §6. Vai para a auditoria (C8).
- Decisões: D-2 (imperativo) documentada em `02` §3.3 com o custo de cada alternativa. O código atual favorece o informal ("Tenta", "Confere"), inclusive nos textos do `36` RU-3, e o plano recomendou "Tente". **A recomendação do `38` foi mantida como PROPOSTA, mas o custo está explícito para o usuário decidir.**
- **Divergências do plano:** nenhuma.

### C6 — Foca IA, pedagógico, marketing

- Criados `docs/copy/04-foca-ia.md` (três camadas, 12 regras do tutor, slots de `voz.ts`, 7 ajustes sugeridos ao prompt **não aplicados**), `05-conteudo-pedagogico.md` (58 linhas; caminhos reais conferidos com `ls`) e `06-marketing.md` (superfícies reais, promessas, achados da copy pública).
- Sem skill de escrita nesta fase, como previsto. `tutor-prompt.ts`, `voz.ts` e `brand.ts` **não modificados**.
- Achados na copy pública (registrados, não corrigidos): `welcome.tsx` repete "60 segundos" 4 vezes e usa "Não é X. É Y."; `brand.ts` ainda cobra (coberto pelo `36` RU-20).

### C7 — entrada e regras globais

- `docs/COPY.md` com **101 linhas** (limite 130): Quick Context (persona, voz, 10 proibições, tamanhos, glossário mínimo, onde a string mora, roteador), níveis de leitura por tamanho de tarefa, mapa "pergunta → onde" (as 17 perguntas de §X.3), índice, decisões abertas, checklist.
- Edições por âncora, com `git diff` conferido em cada arquivo (só linhas deste plano): `CLAUDE.md` (+9/−1; topo e blocos "Plano vigente" intactos), `AGENTS.md` (+2), `SDD-WORKFLOW.md`, `.claude/skills/foca-sdd/SKILL.md`, `.agents/product-marketing.md`, `docs/README.md` (+6/−1), notas de uma linha em `15`, `13`, `20` §7.1, `21` (só o topo), `brand/foca-rabisco-branding.md`.
- **Não feitos:** `docs/historico/fundacao/09-branding.md` (D-B) e `PRODUCT.md`/`DESIGN.md` (DEP-1, T-C7.5). Com o `37` mostrando o `36` na Fase 2, T-10.3 está longe.
- Validador: 0 FAIL depois que `docs/COPY.md` passou a existir (o FAIL esperado da C2 sumiu).

### C8 — auditoria

- `docs/copy/auditoria-2026-09-28.md`: 12 áreas, 106 linhas de tabela (o arquivo tem mais linhas, por causa dos textos em volta). Contagem conferida por script: excelente 13, manter 22, ajustar 38, reescrever 25, consolidar 6, remover 1. Dos 70 itens de ação: 20 alta, 28 média, 22 baixa.
- Achados mais graves: `offline.tsx` afirma sincronização automática que não existe; `voz.vazio[1]` cobra ausência; "60 segundos" e "lacunas" como medição na boas-vindas, no `/aha` e nas falas; falas de acerto/erro/fim/marco que julgam; `motivos.revisao-devida` com habilidade digitada.
- **Nenhuma string alterada.** `21` sem linhas novas. Áreas fora das 12 listadas na seção 4 do relatório.
- **Nota para quem migrar:** as decisões D-1…D-4 e a decisão de produto sobre `offline`/`premium` e sobre o limiar `bom = pct >= 70` bloqueiam parte da migração.

### Terceira frente em paralelo

Além do `36`, existe uma frente de logo/mascote em andamento (assets em `public/branding/foca/`, `scripts/gerar-logos-foca.ps1`, `docs/historico/fundacao/09-branding.md`, um HTML de design system datado de 28/09). Não conflita com o copy, exceto o `09`, que ficou sem a nota (D-B).

### C9 — verificação (28/09/2026)

**Comandos do §X.1** (saída real):

| Checagem | Comando | Resultado |
|---|---|---|
| Skills | `node scripts/validate-skills.mjs` | `OK — 0 FAIL, 3 warn` (os 3 avisos de colisão de nome entre plugins são anteriores) |
| Registry | `JSON.parse` de `.claude/skills-registry.json` | ok; 20 classes de rota resolvem |
| Skills novas | `git status --short .claude/skills` | `?? better-writing/`, `?? ogilvy-copywriting/` e `M foca-sdd/SKILL.md` (esta é skill própria do projeto, editada de propósito) |
| `settings.json` | `git status --short .claude/settings.json` | vazio: nenhum plugin ligado ou desligado |
| Código não tocado por este plano | `git status --short` para `voz.ts`, `tutor-prompt.ts`, `brand.ts`, `welcome.tsx`, `index.tsx`, `offline.tsx`, `__root.tsx`, `src/content`, `src/data` | vazio (o `git diff -- src` inteiro não serve: o `36` altera `src/**`, ver D-C) |
| Tamanho do Quick Context | `wc -l docs/COPY.md` | 101 (limite 130) |
| Links | script descartável sobre os `.md` novos e alterados | 209 checados; o único "quebrado" era o exemplo de sintaxe descrito em D-D e foi reescrito |
| Promessa sem lastro | `rg` de "garantida", "você vai passar", "% mais", "milhares" em `COPY.md` e `copy/` | só em listas "nunca promete" e em uma ressalva |
| Sanidade | `bun test tests/unit/brand-voice.test.ts` | 10 pass, 0 fail |

**Agente `spec-verifier`** (leitura e comandos, sem editar): **CS-1…CS-20 cumpridos**, 17 perguntas do §X.3 com resposta e link em `COPY.md`, 9 casos do §Q.5 com rota única em `SKILL-ROUTING.md` §7. Problemas que ele apontou e o que foi feito:

| # | Achado | Ação |
|---|---|---|
| 1 | `39` sem o fechamento da C9 | Esta seção |
| 2 | "106 linhas" da auditoria confundível com o tamanho do arquivo | Texto esclarecido na seção C8 |
| 3 | Três casos antigos do §7 do roteamento divergiam do §2.1 | Alinhados (D-G) |
| 4 | Nota no `09` não adicionada | D-B, sem ação; depende do dono das alterações no arquivo |
| 5 | `ofertaCorpo` promete "cerca de 10 minutos" | Já registrado (A1-25) para a migração |

**Não verificado:** carregamento das duas skills novas numa **sessão nova** (elas aparecem na lista da própria sessão que as instalou; o validador só checa frontmatter, links e lock); leitura de qualidade frase a frase de `copy/04` a `06`.

**Critérios CS × evidência**

| CS | Status | Evidência |
|---|---|---|
| CS-1 fonte central | ✅ | `docs/COPY.md` + `docs/copy/01…06` |
| CS-2 persona e estados | ✅ | `copy/01` §1–§2, cada estado com sinal de código ou `[sem sinal]` |
| CS-3 problema e solução | ✅ | `copy/01` §4, coluna Estado preenchida |
| CS-4 posicionamento | ✅ | `copy/01` §5, D-1 como PROPOSTA |
| CS-5 voz | ✅ | `copy/02` §1; 5 extensões do `20` listadas na seção C4 |
| CS-6 matriz de tom | ✅ | `copy/02` §2 |
| CS-7 UX writing e microcopy | ✅ | `copy/03` §1–§2 (chaves conferidas) |
| CS-8 glossário | ✅ | `copy/03` §3, 26 termos com status |
| CS-9 Foca IA | ✅ | `copy/04` |
| CS-10 pedagógico protegido | ✅ | `copy/05` + `SKILL-ROUTING` §2 e §2.1 |
| CS-11 marketing | ✅ | `copy/06` |
| CS-12 Humanizer integrado | ✅ | `SKILLS.md` §L, `SKILL-ROUTING` §2.1 |
| CS-13 skills instaladas e auditadas | ✅ | `.claude/skills/{better-writing,ogilvy-copywriting}`, `SKILLS.md` §Q/§R, `validate-skills` |
| CS-14 nenhuma skill a mais | ✅ | só as duas pastas novas; `settings.json` intocado |
| CS-15 registro e recusadas | ✅ | `SKILLS.md` "Avaliadas e não instaladas", `declined[]` |
| CS-16 quando usar cada skill | ✅ | `SKILL-ROUTING` §2.1 |
| CS-17 `CLAUDE.md` | ✅ | `git diff -- CLAUDE.md`: frase no workflow + seção "Copy e escrita" (mais uma menção ao design system, D-H) |
| CS-18 contexto enxuto | ✅ | `COPY.md` com 101 linhas e níveis de leitura |
| CS-19 nenhum código alterado por este plano | ✅ | conferência por arquivo (D-C) |
| CS-20 auditoria sem aplicar | ✅ | `copy/auditoria-2026-09-28.md`; `21` só com nota de topo |

**Mapa pedido → rota (§X.4)**, lido contra `SKILL-ROUTING.md` §7: botão "Continuar" → nenhuma skill · erro de pacote → `better-writing` · resultado do nivelamento → `better-writing` (dependência do `36` T-06.1) · fala nova da Foca → `copy/04`, sem skill · headline da landing → Ogilvy → `copywriting` → `copy-editing` → Humanizer · explicação de questão → `copy/05`, sem skill de copy · tutor formal → `copy/04` + L2 · revisão de toda a copy → `better-writing` por área · proposta de valor → ler `copy/01` §5.

### Fechamento (28/09/2026, depois do relatório do verificador)

- **Decisões.** O usuário pediu que a IA respondesse as tranquilas e perguntasse o resto. Resultado na seção 4.
- **T-C7.5 concluída.** `docs/PRODUCT.md` (ponteiro para `COPY.md` em Brand Commitments e nota da D-1 em Positioning) e `docs/DESIGN.md` (guia de escrita na linha Copy). O `36` T-10.3 ainda não rodou (DEP-1); as duas edições são de uma linha cada, em trechos que a T-10.3 não reescreve, e o executor do `36` relê os arquivos antes de editar.
- **D-B concluída.** Nota de precedência no topo do `docs/historico/fundacao/09-branding.md`, que agora também aponta o design system atualizado. O arquivo já tinha uma alteração de outra frente (a troca "de frente" por "meio de lado"); a nota é aditiva e essa alteração não foi tocada.
- **Design system atualizado (D-H).** Registrado em `00-README`, `brand/foca-rabisco-branding.md`, `CLAUDE.md`, `DESIGN.md` e `09`.
- **Auditoria** atualizada pelas decisões (A5-05 sem achado; A7-07 e A10-01 passam a "ajustar" por causa da D-2). Contagem recalculada por script: 106 linhas, excelente 12, manter 21, ajustar 40, reescrever 25, consolidar 6, remover 1; dos 72 itens de ação, A 20, M 28, B 24.
- **Nada foi aplicado em `src/`.** A aplicação das decisões no código é o plano de migração.

## 4. Decisões (28/09/2026)

| ID | Decisão | Quem | Resultado |
|---|---|---|---|
| D-1 | Frase de posicionamento | usuário | **Mantida a atual por enquanto.** Opções em `copy/01` §5.4; problemas P5–P7 seguem abertos |
| D-2 | Imperativo no corpo | IA, por delegação | **Informal** ("Tenta", "Confere", "Olha"). Muda a recomendação original do `38` ("Tente"): o código e o texto do `36` RU-3 já são informais, e "Tente" soa como caixa de erro para o público. Afeta na migração `tutor.falhaResposta` e `voz.naosei` |
| D-3 | Palavra visível para streak | IA | **"sequência"** |
| D-4 | "Aula" e "Checkpoint" na interface | IA | **Saem**: "lição" e "checagem" ("Videoaula" fica) |
| D-5 | Humor da foca na pedra | IA | **Continua**, com as regras de `copy/04` §3.3 |
| P-1 | Telas `offline` e `premium` (afirmam o que não existe) | usuário | **Marcar como demonstração** |
| P-2 | Fim de aula (`fimbom`/`fimruim`, limiar de 70%) | usuário | **Duas famílias de fala, ambas sem julgamento**; limiar mantido, slot `fimruim` renomeado |

As decisões da IA (D-2 a D-5) podem ser revistas pelo usuário a qualquer momento; basta pedir.

## 5. O que sobra, e de quem é

| Item | Estado |
|---|---|
| Migração das strings da auditoria (aplicar D-1…D-5, P-1, P-2 e as demais propostas) | **Plano à parte**, a escrever e aprovar depois da Fase 10 do `36` (DEP-10). Este registro e `copy/auditoria-2026-09-28.md` são a entrada dele |
| Reauditoria das áreas com dependência (`T-05.*`, `T-06.*`, `T-08.7`, `T-09.*`) | Depois do `36` |
| `brand-voice.test.ts`: testes novos listados na auditoria §3 | Parte do plano de migração (é código) |
| Carregamento das skills novas numa sessão nova | Conferir na próxima sessão; o validador só checa frontmatter, links e lock |
| DEP-2…DEP-9 | Viram itens do plano de migração; ver `38` §V.3 |
