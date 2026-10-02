---
estado: em-execucao
atualizado: 2026-10-02
iniciativa: 50
---

# 50 — Gamificação, prática, Foca animada e social 18+: registro de execução

> O que de fato aconteceu. Cada tarefa registra o que foi feito, a **evidência real** (comando e saída) e as divergências entre spec e código (`DV50-x`). Nenhuma afirmação sem evidência. Estados de validação: **implementado** · **validado localmente** · **validado em ambiente integrado** · **publicado** · **habilitado em produção**.

## Linha de base

Ainda não medida: nenhum código mudou nesta etapa. A linha de base é a T-50.0.5, depois da aprovação.

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `bunx tsc --noEmit` | a medir (T-50.0.5) |
| Unitários | `bun test tests/unit` | a medir. Último registrado: 1471 pass / 0 fail (49, 02/10, antes da publicação) |
| Lint | `bun run lint` | a medir. Último registrado: 0 erros / 17 avisos (49) |
| E2E | `bunx playwright test` | a medir. Último registrado: 561 passed / 0 failed / 82 skipped (49) |
| Build | `bun run build`, `VERCEL=1 bun run build` | a medir. Últimos registrados: verdes (49) |
| Documentação | `bun run docs:check` | rodado nesta etapa (abaixo) |

## Divergências encontradas no planejamento

| ID | Onde | O que um diz | O que o outro mostra | Decisão |
|---|---|---|---|---|
| DV50-01 | `docs/ESTADO.md` × `git log` | Trechos de momentos diferentes: "nada disso está na `main`", "`main` = `9c96afa`" | E1–E3 publicadas; `HEAD` da `spec-49` e da `main` publicada = `ac9bf85` (o último commit é só documentação; o código publicado é o de `9c96afa`) | Painel corrigido nesta etapa só no que reflete o planejamento e o hash; nenhuma afirmação de implementação nova |
| DV50-02 | `docs/specs/README.md` | 49 "aprovado (02/10/2026)", sem registro | 49 executada e publicada (E1–E3), funções desligadas em produção | Índice atualizado para `em-execucao` com link do registro |
| DV50-03 | 49 `spec.md` D49-06 × §5.6 × `src/lib/ranking.ts:43-45` | D49-06: "grupos semanais de até 30 por XP da semana" | §5.6 e o código: dias × 100 + blocos × 10 | A 50 mantém a pontuação do §5.6 e do código (sem XP bruto, sem tempo) |
| DV50-04 | 49 `registro.md` DV49-09 × banco | "Itens com revisão humana: MT 25, CN 31, CH 15" | `reviewKind: "humano"` = 0 no banco; 737 `ia-delegada` + 18 oficiais | Base da contagem incerta; a 50 não depende dela (simulado com oficiais importados, §5.9.1) |
| DV50-05 | `docs/arquitetura/conteudo.md:17` × `src/data/questions.ts` | Banco legado com 59 questões | 60 ocorrências de `statement:` | Conferir na T-50.9.1 |
| DV50-06 | `docs/design/mascote.md` e `docs/design/gamificacao-e-som.md` | Citam `styles.css:1008-1027` e `:695-703` | Regras hoje em `styles.css:1034-1049` e `:721-728` | Corrigir as referências na T-50.3.6 e na T-50.1.5 |
| DV50-07 | Arte de corpo inteiro | O dono anexou na conversa de 02/10 | Não está no repositório (só cabeça de frente, de lado e 8 expressões) | T-50.0.4 salva o original |
| DV50-08 | C-SOM-6 ("primeiro uso com aviso de como desligar") | Contrato | Não conferido no código nesta etapa | Conferir na T-50.1.4 |
| DV50-09 | R-GAM-4 × `store.ts` (DV-1 conhecida) | Meta inicial de 1 bloco | Padrão `dailyLessons: 3` | Missão "fazer" usa a meta configurada do aluno (§5.4.1); a divergência continua no backlog |
| DV50-10 | `git status` | — | Alterações locais de outros trabalhos em `.agents/skills/foca-social/`, `.claude/agents/foca-social.md`, `.claude/skills/foca-social/` e `automacao-instagram/` | Preservadas; nada desta etapa as toca |
| DV50-11 | §5.1.2 (Foca do combo) | Foca cabeça 48 px "no canto da folha" nos marcos 5 e 10 | A folha de feedback já mostrava a Foca (40 px) depois de toda resposta | Nos marcos 5 e 10 a mesma Foca fica `empolgada` e com 48 px; nada de segunda Foca na folha |
| DV50-12 | §9 / T-50.2.2 (store) | Schema 6 → 7 | `today.combo` e `prefs.somNoSilencioso` são opcionais e entram pela fusão aditiva de `montarEstado` (o balde do dia já zera na virada) | Sem subir `CURRENT_SCHEMA_VERSION`; nada a migrar |
| DV50-13 | §13.2 (flags) | `PEROLAS_HABILITADO`, `MISSOES_HABILITADO` desligados até o dono ligar | O dono pediu para ver tudo publicado ("quero ver como ficou") | Recursos para todos (Pérolas, missões, mini-simulado, escrita, retrospectiva, pular) **ligados por padrão** e desligáveis sem deploy por `FUNCOES_DESLIGADAS` (`recursoLigado`); ligas, amigos, lembretes e corretor continuam atrás de variável própria, desligados até a revisão jurídica, VAPID e chave da OpenAI |
| DV50-14 | T-50.3.2, T-50.4.5 (aprovação visual) | Aprovação do dono antes de publicar a Foca de corpo e o ícone | O dono está fora e autorizou publicar ao terminar | Publicados atrás de chave (`focaCorpo`) e registrados como **aguardando avaliação do dono**; ajuste depois, sem bloquear as entregas |

## Por tarefa

### 02/10/2026 — Planejamento (sem código de produto)

- **Pedido do dono:** transformar a proposta de 02/10 (30 itens) + ofensiva com amigos num plano SDD completo, com as decisões 1–6 da conversa; sem implementar, sem commit, sem publicar.
- **Feito:** `spec.md` (decisões D50-01…16, regras revistas com referência exata, premissas verificadas, requisitos, arquitetura, dados, rollout em E1–E9, matriz de cobertura dos 31 itens), `tarefas.md` (F0–F16) e este registro. Índice das specs e `ESTADO.md` atualizados só para refletir o planejamento.
- **Auditoria do código (só leitura, 3 subagentes Explore):** lição e recompensas, vidas, sincronização, som e háptico; ofensiva, missões, navegação, mascote, ranking, notificações e trilha; banco de questões, imagens, simulado, redação, planos e custos da IA. Fatos usados na spec com `arquivo:linha` (§1).
- **Verificação externa (1 subagente, fontes oficiais baixadas):** Lei 15.211/2025 e Decreto 12.880/2026 (planalto.gov.br), FAQ ANPD/MJSP/Secom de 30/07/2026, orientações preliminares da ANPD sobre aferição de idade, LGPD art. 14, Lei 9.610/98, página "Provas e gabaritos" do INEP (CC BY-ND 3.0), caderno do ENEM 2023 (59 créditos de terceiros no 1º dia), WebKit (push no iOS) e Chrome for Developers (Notification Triggers encerrada). Matéria do Estadão de 01/08/2026 sobre o Duolingo confirmada por republicação (original atrás de paywall). Guia definitivo da ANPD sobre aferição de idade não localizado.
- **Skills:** `foca-sdd` (carregada). `superpowers:brainstorming` não usada: a direção já estava decidida pelo dono. `superpowers:writing-plans` e `agent-skills:planning-and-task-breakdown` não carregadas: plano escrito direto no modelo do repositório (`docs/ai/templates/`).
- **Evidência:** `bun run docs:check` → "nenhum link ou caminho quebrado". Toda tarefa citada na spec existe em `tarefas.md` (conferência por script). Nenhum teste de código rodado: nada de código mudou.
- **Estado de validação:** documento; nenhuma implementação.

## Critérios globais

| ID | Critério | Evidência | Status |
|---|---|---|---|
| G1–G11 | §16 da spec | — | pendente (nada implementado) |

## O que não foi feito e por quê

- Nenhum código, migração, variável, commit, push ou deploy: o pedido desta etapa é só o planejamento.
- Linha de base de testes não medida: nenhum código mudou; fica para a T-50.0.5.
- Decisão 0008 não escrita: depende da aprovação (T-50.0.3).
- Arte de corpo inteiro não salva: depende da aprovação (T-50.0.4).

### 02/10/2026 — Aprovação, preparação (F0) e E1 (som no celular e lição viva)

- **T-50.0.1 (aprovação):** "Aprovo a Spec" e "Pode fazer todas as entregas" (02/10). §21: imagens de terceiros — risco aceito; rótulo "Foca IA"; vestibulares — o dono autorizou aceitar o risco ou seguir só com o INEP, e o agente escolheu **só INEP por enquanto** (T-50.9.9 adiada). Depois, o dono autorizou **commit e publicação na `main` ao terminar** ("não vou estar em casa e quero ver como ficou"). Trabalho na branch local `spec-50`.
- **T-50.0.2:** notas "Revista pela 50" em `regras.md` (R-ESC-6, R-ESC-7, R-ESC-9, R-GAM-2, R-GAM-5, R-PED-2, R-CONT-3, R-CONT-4, R-MASC-1, R-MASC-3), `contratos.md` (C-SOM-1, C-SOM-2, C-SOM-6, C-XP-3, C-XP-4), `mascote.md`, `gamificacao-e-som.md` §8, decisão 0002, backlog B-169 e spec 49 §5.6/§5.9. Nenhum texto vigente apagado.
- **T-50.0.3:** decisão [0008](../../decisoes/0008-questoes-com-imagem-e-fontes.md) escrita e indexada; 0002 marcada como revista em parte.
- **T-50.0.4:** a arte anexada na conversa foi extraída da transcrição da sessão e salva sem alteração em `src/assets/branding/foca/corpo/foca-corpo-original.jpg` (1254×1254, SHA-256 `5a3c337b…323a`); README da pasta atualizado.
- **T-50.0.5 (linha de base no `HEAD` `d84e330`, código igual ao publicado):** tipos ✅ · unitários **1471 pass / 0 fail** · `bun run lint` falha em 41 mil linhas só por CRLF do Windows (condição antiga da máquina); o gate usado é `bun run lint:ci` (como na 49) → **0 erros** · build ✅. O E2E completo foi interrompido em 111/643 (lento por dois subagentes compilando em paralelo); a referência é a última suíte completa verde da 49 no mesmo código (561 passed / 0 failed). Commit local `d84e330` com a spec aprovada e os documentos da F0.
- **Execução em paralelo:** dois subagentes em git worktrees isolados (`.claude/worktrees/`): (1) Foca de corpo inteiro e ícone das Pérolas (E2, T-50.3.1/3.3/3.5, T-50.4.5); (2) modelo de imagem/tabela, componentes de questão com imagem, `/creditos` e importador do INEP (E5, T-50.9.1–9.6). O orquestrador integra os commits deles.

#### E1 — som no celular (F1)

- **T-50.1.1:** `getAudioDiagnostics()` e registro interno (200 eventos) no motor; painel `src/lib/audio/diagnostico.ts` só com `?diagnostico-audio=1` (import dinâmico na raiz; sem rede; "Testar som", "Copiar diagnóstico").
- **T-50.1.3:** destravamento em `pointerdown`, `pointerup`, `touchend`, `click`, `keydown`; `resume()` para `suspended` e `interrupted`; retomada em `visibilitychange`/`focus`; prazo de 900 ms só para o primeiro som; `preaquecerAudio()`. Testes `tests/unit/audio-engine.test.ts` (5, com `AudioContext` falso): `interrupted` → toca; primeiro som de ~600 ms toca e o segundo lento é descartado com o motivo; destravar no gesto aquece os 12 sons sem tocar; voltar ao app retoma.
- **T-50.1.4:** `Cache-Control: public, max-age=31536000, immutable` para `/sfx/v2/(.*)`; preferência "Tocar no modo silencioso" no Perfil, só no iPhone (`src/lib/plataforma.ts#ehIOS`), desligada por padrão (D50-15). O aviso de primeiro uso de C-SOM-6 não foi conferido (DV50-08 segue aberta).
- **T-50.1.2 (teste em aparelho): bloqueada** — o dono está fora; o painel vai junto na publicação (`https://www.focaedu.com/trilha?diagnostico-audio=1`).
- **T-50.1.5:** C-SOM-8 em `contratos.md`.
- **Prioridade dos sons (C-SOM-2, §5.12.3):** `PRIORIDADE_FECHAMENTO` com o marco de ofensiva logo abaixo do especial; `tests/unit/audio.test.ts` atualizado; `tests/e2e/audio-assets.spec.ts` "carregamento atrasado" passa a atrasar 1,2 s (acima do prazo novo do primeiro som).

#### E1 — lição viva (F2)

- **T-50.2.1:** contrato aditivo: `resposta.tentativa` ("primeira"|"revisao"), `resposta.assistida`, `licao-concluida.attemptKey`. Servidor: revisão não liga à tentativa da atividade, não custa vida, não paga XP de questão geral e não entra no caderno. Cliente: `firstSubmission` real (revisão = `false`), `tutorUsed` quando a Foca IA abriu antes de responder (`marcarAjuda`, observando `tutor.open`), `attemptKey` = id da sessão nas respostas e na conclusão da microlição. `tests/unit/servidor/licao-viva.test.ts` **4 pass**.
- **T-50.2.2:** `src/lib/combo.ts` (regra pura, usada no aparelho e no servidor) + `tests/unit/combo.test.ts` **9 pass**; `today.combo` no store (opcional, zera com o balde do dia — sem subir a versão do schema, DV50-12); barra das microlições conta questões pontuadas.
- **T-50.2.3:** raio (`RaioDoCombo`, SVG com stroke-dash; some com movimento reduzido), borda da barra com combo ≥ 3, selo "N seguidas" na folha de feedback (dentro do `role="status"`), som `acerto-consecutivo` no lugar do de acerto e háptico `combo` nos marcos 5/10. A Foca **já** aparecia na folha depois de toda resposta: nos marcos 5 e 10 ela fica `empolgada` e maior (48 px) em vez de entrar uma segunda Foca (DV50-11). Combo também na aula rápida (`/study`) e na trilha de redação (`LessonPlayer`).
- **T-50.2.4:** "Rever o que errou (n)" (até 3, as últimas erradas ou "Não sei") antes do resumo; sem vida (sem `comVida`), sem XP, sem domínio (`registrarRevisaoDeErro` só envia o evento), Foca IA disponível; "Ver resultado" pula.
- **T-50.2.5/2.6/2.7:** lição perfeita (≥ 4 pontuadas certas de primeira, sem "Não sei", sem ajuda antes); cartões XP · de primeira · tempo ativo (pausa > 2 min fora não conta) · maior combo; `src/lib/celebracao.ts` escolhe UM momento principal e o som dele, o resto vira selo; marcos de ofensiva passam a 7, 14, 30, 50, 100, 150, 200, 365 e a cada 100 (`isStreakMilestone` usa `ehMarcoDeOfensiva`). `tests/unit/celebracao-perolas.test.ts` (inclui a ordem dos sons).
- **Flags de cliente:** `comboNaLicao`, `revisaoDeErros`, `focaCorpo`, `navegacaoV3` (ligadas).
- **E2E:** `tests/e2e/licao-viva.spec.ts` **3 passed** (selo e raio no 3º acerto; sem revisão quando não há erro; cartões "4 de 4"; um momento principal; revisão com "Revisão 1 de 1" e "Na revisão: 1 de 1"; "Ver resultado" pula). Regressão de lição, trilha, jornada, vidas, sincronização, layout, áudio e funções pagas (chromium + narrow): **174 passed / 3 failed / 15 skipped**; as 3 falhas eram o helper de "Não sei" sem saber da oferta de revisão — `tests/e2e/helpers/jornada.ts` atualizado e `journey.spec.ts` passou a usar o helper compartilhado → `journey-start` + `journey` + `state-migration` **48 passed**, `journey` **8 passed**.
- **Unitários:** **1495 pass / 0 fail** (antes da E3). Uma falha intermediária: o teste do motor de áudio trocava o `fetch` global sem devolver e quebrava os testes do pipeline; corrigido.
- **Estado de validação:** implementado e validado localmente. Não publicado.
