> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 38 — Sistema de copy do Foca e roteamento das skills de escrita: plano de execução

**Status:** **EXECUTADO e FECHADO em 28/09/2026.** Aprovado pelo usuário no mesmo dia ("aprovo, pode começar"); fases C0 a C9 concluídas, critérios CS-1…CS-20 verificados pelo agente `spec-verifier`. O que ficou fora (migração das strings, aplicação das decisões no código) é de um plano à parte. Registro: `docs/historico/iniciativas/38-39-copy/39-registro-execucao-copy.md`. Rascunho original de 28/09/2026. Registro de execução previsto: `docs/historico/iniciativas/38-39-copy/39-registro-execucao-copy.md`, criado na T-C0.1.
**Autor:** Claude Code (Opus 5.5), a partir do prompt de planejamento do usuário (28/09/2026). **Executor previsto:** Sonnet, em outra sessão, depois da aprovação.
**Linha de base:** `main` em `76a7b70`, com o plano técnico [36](../35-36-37-qualidade/36-plano-qualidade-pedagogica-ux-confiabilidade.md) em execução (registro [37](../35-36-37-qualidade/37-registro-execucao-qualidade.md): Fases 0–1 concluídas, próxima T-02.1).
**Natureza:** plano **só de documentação e de instalação de skills**. Não altera nenhum arquivo em `src/`, `tests/`, `content-pipeline/`, `public/` nem `scripts/`. A migração das strings atuais é outro plano, escrito depois (§U).

**Prevalece sobre (quando aprovado):**
- Linhas `copy do app`, `marketing / growth` e `docs` de [ai/SKILL-ROUTING.md](../../../ai/SKILL-ROUTING.md) §2, a linha `Copy` do §4 e as rotas `app-copy`/`marketing`/`docs` de `.claude/skills-registry.json`.
- [15-mascote-e-voz.md](../../fundacao/15-mascote-e-voz.md) como guia de escrita (o `15` já estava subordinado ao `20` §7.1; passa a ser só registro histórico do arquétipo e da biblioteca de expressões visuais).
- `09` §6 (slogans) e `docs/design/brand/foca-rabisco-branding.md` §Persona/§Posicionamento naquilo que descrevem voz e público.
- **Não** prevalece sobre o `20` §7.1: o sistema de copy **incorpora** as regras dele, sem contradizê-las. Se algum ponto deste plano parecer contradizer o `20` §7.1, o `20` vence e a divergência vai para o `39`.
- **Não** prevalece sobre o `36` em nada. Todo ponto de contato está marcado `DEPENDÊNCIA DO PLANO PRINCIPAL` (§V).

---

## Como a IA executora deve usar este documento

1. Ler este documento inteiro. Depois `../CLAUDE.md`, [ai/SDD-WORKFLOW.md](../../../ai/SDD-WORKFLOW.md) e o registro `docs/historico/iniciativas/38-39-copy/39-registro-execucao-copy.md` (a partir da T-C0.1). **Não assumir que uma tarefa está pendente sem conferir o `39`.**
2. Ler também o topo do `docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md`: ele diz em que fase o plano técnico está. Isso decide quando as tarefas marcadas `DEPENDÊNCIA` podem rodar (§V.3).
3. Executar as fases **na ordem de §W**. Cada tarefa termina com a verificação dela; cada fase termina com o gate da fase.
4. Não tomar decisão de produto. As decisões abertas estão em §W.0 (D-1…D-5). Quando uma tarefa depende de uma delas, escrever a **recomendação** marcada como `PROPOSTA — aguarda D-n` e seguir. Nunca apresentar proposta como decidida.
5. Não mexer em código. Não adicionar dependência. Sem commit, push, merge, branch ou worktree sem pedido explícito. Nunca reescrever histórico publicado (Lovable).
6. **Arquivos compartilhados** (`CLAUDE.md`, `docs/README.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/21`, `docs/ai/*`, `.claude/skills-registry.json`): reler imediatamente antes de editar, editar com `Edit` sobre um trecho âncora pequeno, **nunca** `Write` por cima, e conferir `git diff -- <arquivo>` depois. Protocolo completo em §V.
7. Tudo o que for texto de documento para agentes e humanos: português, frases diretas, sem os padrões de §I.6. A tarefa que escreve o guia de voz não pode, ela mesma, falar como o texto que o guia proíbe.

---

## A. Repository Audit

O que foi lido nesta sessão (28/09/2026) e o que existe.

### A.1 Documentos de produto, persona, voz e marca

| Arquivo | O que tem de copy/voz/persona | Estado |
|---|---|---|
| `CLAUDE.md` (101 linhas) | "O produto em uma frase" (aulas de 60 s, 1–2 questões), stack, design system, "Falas do personagem vêm de `src/lib/voz.ts`". Nenhuma regra de copy própria além disso | Vigente; frase de produto desatualizada (o `36` §I já prevê corrigir) |
| `AGENTS.md` (10 linhas) | Nada de copy | Vigente |
| `docs/README.md` | Índice. `15` descrito como "abra antes de escrever qualquer texto do app" | Desatualizado nesse ponto (o `15` está subordinado ao `20` §7.1 desde 21/09). Não lista `35`–`37` ainda (o `36` T-10.3 corrige) |
| `docs/ai/SDD-WORKFLOW.md` | Etapa 2 (ler `PRODUCT.md`/`DESIGN.md` se tocar copy), etapa 9 ("Copy nova → inventário") | Vigente |
| `docs/ai/SKILLS.md` | Catálogo A–P. `K` Marketing Skills (Corey Haines, 50 skills, **desativado**), `L` Humanizer (ativo) com a regra do Foca já calibrada | Vigente — é o registro canônico |
| `docs/ai/SKILL-ROUTING.md` | Classe `copy do app` sem skill primária (só "`20` §7.1 + `copy.ts` + `21`") e `humanizer` como revisão; `marketing` com o pacote do Corey | Vigente — é o roteador canônico |
| `.claude/skills-registry.json` | Versão máquina: `skills[]`, `declined[]`, `routes[]` (classes `app-copy`, `marketing`, `docs`) | Vigente; validado por `scripts/validate-skills.mjs` |
| `.claude/skills/foca-sdd/SKILL.md` | §3: "Copy: voz de `docs/20` §7.1; strings em `src/lib/copy.ts` + inventário `docs/21`" | Vigente, skill própria do projeto (não vendorizada) |
| `docs/20` §7.1–7.2 | **A norma de voz.** Personalidade (colega de estudo atento, direto), tabela vocabulário/informalidade/humor/emoji/exclamação/correção/acerto/retorno/tutor, tamanhos-alvo, exemplos e anti-exemplos. Afirma que não existe lista de palavras que prove autoria por IA | Vigente, curto (≈ 25 linhas) |
| `docs/21` | Inventário de copy: §2 revisado com evidência (blocos `feedback`, `tutor`, `licao`, `trilha`, `questao`, `jornada`, `foco`, `onboarding`, `nivelamento`, `checkpoint`), §3 pendente por arquivo, §4 conteúdo pedagógico fora | Vigente; o `36` T-10.3 acrescenta linhas |
| `docs/14` | Persona única João: retrato, cena, o que a dor não é, anamnese, **JTBD** (§5), gatilho emocional (alívio), objeções (§7), implicações (§8) | Vigente; §7 cita "60 segundos" e ranking como resposta a objeções |
| `docs/15` | Arquétipo "cobradora afetuosa", 3 princípios (curta, seca, sobre o agora), regra dura (cobra comportamento, nunca pessoa; retorno sem cobrança), onde a Foca aparece (§4), expressões (§5), tutor (§6: "sarcasmo na moldura, clareza no conteúdo"), biblioteca (§7), teste da Foca (§8) | **Parcialmente superado** pelo `20` §7.1 (sarcasmo e cobrança saíram). §4, §5 e a regra "piada fora da explicação" continuam úteis |
| `docs/16` | Streak com congelamento, meta diária, "linhas que não se cruzam" (§9) | Vigente nas regras de produto |
| `docs/08` §1, §10 | Posicionamento "Não é mais aula. É o hábito que te aprova. 60 segundos por dia."; defesa contra MEC Enem/ChatGPT | Vigente como estratégia; a frase tem problemas (§C) |
| `docs/13` | Prompt da landing do Instagram na voz do João (Flash Test) | Histórico de marketing |
| `docs/09` §6 | Slogans (paleta Ártica, histórica) | Histórico |
| `docs/design/brand/foca-rabisco-branding.md` | Arquétipo "Bobo da Corte + Criador/Rebelde", posicionamento visual, persona "estuda sozinho, tarde da noite, sem vontade" | Vigente para identidade visual; a descrição de arquétipo diverge do `20` §7.1 |
| `docs/PRODUCT.md` | Resumo para agentes: Users (João + JTBD), Positioning (frase do `08`), Brand Commitments (voz do `20` §7.1, tamanhos, onde a copy vive), Evidence on Hand (o que **não** pode ser inventado) | Vigente; o `36` T-10.3 atualiza "capacidades atuais" |
| `docs/DESIGN.md` L148–149 | Mascote via `FocaMark`, falas via `voz.ts`, strings em `copy.ts` + `21` | Vigente |
| `.agents/product-marketing.md` | Contexto das skills do Corey, aponta para `PRODUCT.md` | Vigente |
| `docs/36` §F.4 | Copy nova do plano técnico (RU-1…RU-6, RU-10…RU-12, RU-20 — tagline "Estudo curto, todo dia.") | **Em execução** — pertence ao `36` |

### A.2 Onde a copy mora no código (só leitura; este plano não edita)

| Arquivo | Papel | Observação |
|---|---|---|
| `src/lib/copy.ts` (242 linhas) | Strings funcionais por ID: `feedback`, `tutor`, `licao`, `questao`, `trilha`, `jornada` (14 motivos), `foco`, `onboarding`, `nivelamento`, `checkpoint` | Fonte única de string funcional (`20` §7.2). O `36` acrescenta chaves |
| `src/lib/voz.ts` (117 linhas) | 13 slots de fala da Foca, seleção no evento (`fala(slot)`) | Vários slots com resíduo do arquétipo antigo (§C.3) |
| `src/lib/tutor-prompt.ts` | `buildSystemPrompt()`: persona do tutor (L75–77), regras, anti-LaTeX; `localFallback()` | Fonte de verdade da personalidade conversacional hoje. Mexer nele é revisão de segurança L2 (`SDD-WORKFLOW` §6) |
| `src/lib/brand.ts` L28–33 | `BRAND.tagline`/`description` (usados em `<title>`/OG) | **Do `36` (T-08.7, RU-20).** Intocável aqui |
| `src/routes/welcome.tsx`, `index.tsx` | Telas públicas de entrada ("Foca 60 segundos.", "Aulas de 60 segundos, não maratonas") | Pendentes no `21` §3 |
| `tests/unit/brand-voice.test.ts` | Regressão de tom (termos proibidos em `voz.ts`, `tutor-prompt.ts`, `COPY.onboarding/nivelamento`) | Estender é trabalho de código, fora deste plano |

### A.3 Skills instaladas (todas as que tocam escrita estão marcadas)

Fonte: `docs/ai/SKILLS.md` §1 e `.claude/skills-registry.json`, conferidos no disco nesta sessão.

| Skill | Tipo / estado | Escrita? |
|---|---|---|
| **Humanizer** (`blader/humanizer` 3.0.0, `9862685`) | Plugin de projeto, **ativo**, ~150 tok fixos | **Sim** — revisão anti-escrita-artificial |
| **Marketing Skills** (`coreyhaines31/marketingskills` 2.11.1, `5b2c000`) — inclui `copywriting` **2.0.2**, `copy-editing` **2.0.0**, `product-marketing`, `cro`, `onboarding`, `signup`, `content-strategy`, `seo-audit`, `programmatic-seo`, `schema`, `analytics`, `competitors`… | Plugin de projeto, **desativado por padrão** (~13,6k tok fixos) | **Sim** — marketing |
| Taste (`design-taste-frontend`, `redesign-existing-projects`) | Local, ativo | Não (visual de LP) |
| Frontend Design, Impeccable, UI UX Pro Max, Web Design Guidelines, React Best Practices, Motion Design, GSAP, Superpowers, Addy Agent Skills, SecondSky, Repo Security Review, claude-mem, OmniRoute MCP, `foca-sdd` | Diversos | Não (o Impeccable tem um modo de UX copy, sem uso definido no Foca) |
| Plugins de **usuário** desta máquina: `design:ux-copy`, `marketing:brand-review`, `marketing:content-creation`… | Escopo de usuário, fora do repo | Sim, mas **não reproduzíveis** para outro dev — não entram no roteamento do projeto |

**Humanizer: existe, instalado pelo método oficial, origem registrada.** Nada a reinstalar.

### A.4 Repositório `boraoztunc/skills`

Clonado em pasta temporária (fora do repo), commit `645553ca7622570479e330cc089c65fcf34e0ba8` (15/08/2026), 72 pastas de skill. Não há `LICENSE` na raiz; o README declara MIT e as pastas vendorizadas trazem `LICENSE-*`/`NOTICE-*` próprios. Leitura integral das cinco candidatas prioritárias e dos originais upstream de duas delas (`jakubkrehel/skills` `267330e`, `hardikpandya/stop-slop` `8da1f03`). Resultado em §N–§P.

---

## B. Existing Copy Architecture

```text
NORMA DE VOZ ........ docs/20 §7.1  (25 linhas, vigente)
   ├─ histórico ..... docs/15 (arquétipo antigo, superado em tom; §4/§5/§6-moldura ainda úteis)
   ├─ histórico ..... docs/09 §6, docs/13, docs/design/brand/foca-rabisco-branding.md §Persona
   └─ resumo ........ docs/PRODUCT.md → Brand Commitments (repete o 20 §7.1)
PERSONA ............. docs/14 (+ resumo em PRODUCT.md → Users; + .agents/product-marketing.md)
POSICIONAMENTO ...... docs/08 §1/§10 (+ PRODUCT.md → Positioning)
INVENTÁRIO .......... docs/21 (status por string/arquivo)
STRINGS ............. src/lib/copy.ts (funcional) · src/lib/voz.ts (Foca) · src/lib/tutor-prompt.ts (IA) · src/lib/brand.ts (OG)
SKILLS .............. docs/ai/SKILLS.md (catálogo) · docs/ai/SKILL-ROUTING.md (roteador) · .claude/skills-registry.json (máquina)
```

Não existe hoje: guia de tom por contexto, padrões de microcopy por componente, glossário de produto, regras da Foca IA separadas da voz do produto, regras de marketing, proteção explícita do conteúdo pedagógico contra skills de copy, nem um "contexto rápido" para mudança pequena. Quem precisa mudar um botão hoje junta `20` §7.1 + `21` + `15` + `PRODUCT.md` sozinho.

---

## C. Problems Found

### C.1 Duplicação e fontes concorrentes

| # | Problema | Evidência |
|---|---|---|
| P1 | Voz descrita em 5 lugares com três arquétipos diferentes: "colega de estudo atento" (`20`), "cobradora afetuosa" (`15`), "Bobo da Corte + Criador/Rebelde" (`brand/foca-rabisco-branding.md`) | `20` §7.1; `15` §0; `foca-rabisco-branding.md` L7–9 |
| P2 | `00-README` manda abrir o `15` antes de escrever copy, mas o `15` foi superado | `00-README.md` L68 |
| P3 | Persona em 4 lugares: `14`, `PRODUCT.md`, `.agents/product-marketing.md`, `foca-rabisco-branding.md` §Persona (esta descreve outra pessoa: "estuda sozinho, tarde da noite, sem vontade nenhuma") | — |
| P4 | Roteamento de copy em dois lugares com conteúdo diferente: `SKILL-ROUTING.md` e `36` §1 (inventário próprio) | Normal para um plano; o canônico é o `SKILL-ROUTING` |

### C.2 Posicionamento

| # | Problema |
|---|---|
| P5 | "60 segundos" é a promessa central (`08` §1, `CLAUDE.md`, `PRODUCT.md`, `brand.ts`, `welcome.tsx`, `index.tsx`, 5 falas de `voz.ts`, prompt do tutor). A unidade real hoje é uma lição de 4–8 questões ou uma atividade da jornada; o próprio `36` RU-20 já tira "60 segundos" da tagline. A copy promete uma duração que o produto não entrega |
| P6 | "É o hábito que te aprova" promete aprovação. `PRODUCT.md` → Evidence on Hand: nenhum dado de retenção, nenhum aluno aprovado. Promessa não demonstrada |
| P7 | A frase de posicionamento usa exatamente a construção "Não é X. É Y." que o Humanizer (§1) e este plano (§I.6) classificam como padrão de texto artificial |
| P8 | `PRODUCT.md` ainda diz "o discurso 'IA que aprende a lacuna' ainda não é verdade no código" (lacunas do `/aha` = heurística de `gaps.ts`). Depois do `30` existe modelo por habilidade real (θ, faixas, planner com `ReasonCode`). O que é verdade hoje precisa ser separado com cuidado (§G) |

### C.3 Resíduos do arquétipo antigo no código (achados para a auditoria, **não corrigir neste plano**)

| Onde | Texto | Problema |
|---|---|---|
| `voz.ts` `vazio[1]` | "Vazio. Que nem sua sequência de ontem." | Cobra ausência — viola `15` §3.2 e `20` §7.1 (retorno sem culpa) |
| `voz.ts` `errou[1]` | "Essa aí pega muita gente. Inclusive você, agora." | Ironia sobre o erro do aluno |
| `voz.ts` `acertou[1..3]` | "Tá vendo? Não era tão difícil." / "Boa. Não se acostuma." / "Uma. Faltam só todas as outras." | Diminui o acerto; sarcasmo |
| `voz.ts` `fimruim[1]`, `marco[1]` | "Placar feio. …" / "30 dias. Sinceramente, não esperava." | Julga desempenho; subestima o aluno |
| `voz.ts` `bomdia`, `retorno`, `fimbom`, `fimbom[1]` | "60 segundos…", "Pode voltar pro feed" | P5; tom de "cobradora" |
| `welcome.tsx` | "Aulas de 60 segundos, não maratonas" | P5 + contraste "não X" |

### C.4 Terminologia inconsistente

| Conceito | Termos em uso (strings visíveis) | Observação |
|---|---|---|
| Unidade de estudo | aula, lição, microlição, atividade, "Sessão de hoje", passo | `COPY.jornada.kinds` tem "Aula"; `COPY.licao` fala "lição"; `SessionCard` diz "Sessão de hoje" |
| Checagem mista | "Checkpoint" (`COPY.checkpoint.introTitulo`, `COPY.jornada.kinds`, `trace.ts`) × "Checagem rápida" (`COPY.licao.roles.checkpoint`) | O próprio `32` F7.7 chamou "Checkpoint" de jargão e trocou num lugar só |
| Sequência de dias | "streak" (docs, código), "Sequência" (`aha.tsx`), número + "dias" (`TrailHeader`) | Nenhuma palavra visível padronizada |
| Medida de habilidade | "Dominado", "Domínio por habilidade/matéria" (`progress.tsx`, `SkillRow`, `display.ts`) × "Base em construção / No caminho / Base firme" (nivelamento) | `20` §13: "evidência de consistência, não domínio certificado" |
| Medição inicial | "nivelamento" (UI), "diagnóstico" (`roles.diagnostico` = "Nivelamento"; `36` "diagnóstico visual"), "lacunas" (`/aha`) | Três nomes para coisas parecidas e diferentes |
| Repetir ação | "Tente de novo." (`COPY.tutor.falhaResposta`) × "Tenta de novo." (`COPY.trilha.erroCorpo`, `36` RU-3) × botão "Tentar de novo" | Registro do imperativo não decidido |
| Home | trilha, jornada, "Aprender" (nav) | "jornada" é termo interno que vazou para `COPY.jornada.semNada`? Conferir na auditoria |

### C.5 Skills e processo

| # | Problema |
|---|---|
| P9 | Copy do app não tem skill primária — só o Humanizer no fim, que foi escrito para prosa em inglês e não sabe nada de botão, erro, estado vazio ou confirmação |
| P10 | `copy-editing` é o revisor natural de marketing, mas está dentro de um pacote de 13,6k tokens desligado. Ninguém documentou como usá-lo sem ligar o pacote inteiro (o caminho do cache existe, mas não está no roteamento de copy) |
| P11 | Não há regra de "quanto processo por tamanho de tarefa" para escrita: nada impede rodar 4 skills sobre um rótulo de botão |
| P12 | Nada protege explicitamente o conteúdo pedagógico (enunciado, alternativa, gabarito, fórmula, citação) contra uma passada de Humanizer/copy-editing — só o `doNotUse` do Humanizer no registry |

---

## D. Target Documentation Architecture

### D.1 Decisão de estrutura

Um ponto de entrada curto ao lado de `PRODUCT.md`/`DESIGN.md` (onde agentes e o Impeccable já procuram contexto), e seções completas numa pasta, lidas sob demanda. O roteamento de skills **não** ganha uma cópia: continua em `docs/ai/SKILL-ROUTING.md`, e o sistema de copy aponta para lá.

```text
docs/
├── COPY.md                          ← NOVO. Entrada + "Quick Context for AI Agents" (alvo ≤ 130 linhas, ≤ ~3k tokens)
├── copy/                            ← NOVA pasta, referência (não é spec, não é plano)
│   ├── 01-estrategia.md             ← persona, estados do aluno, JTBD, problema→mecanismo→resultado, posicionamento, proposta de valor
│   ├── 02-voz-e-tom.md              ← atributos de voz, matriz de tom, humor/emoji/exclamação/tamanho, padrões de texto artificial (pt-BR)
│   ├── 03-ux-writing.md             ← prioridades, padrões de microcopy por componente, glossário
│   ├── 04-foca-ia.md                ← personalidade conversacional da Foca (tutor + falas de voz.ts)
│   ├── 05-conteudo-pedagogico.md    ← o que é protegido, o que uma skill de copy pode tocar
│   ├── 06-marketing.md              ← superfícies, promessas permitidas e proibidas, energia
│   └── auditoria-AAAA-MM-DD.md      ← gerado na Fase C8 (relatório, só leitura do código)
├── ai/SKILLS.md                     ← ATUALIZADO: 2 skills novas + seção "avaliadas e não instaladas" + Humanizer/Marketing ajustados
├── ai/SKILL-ROUTING.md              ← ATUALIZADO: classes de escrita, níveis REQUIRED/RECOMMENDED/OPTIONAL/DO NOT USE, ordem, casos de teste
├── 38-plano-sistema-copy-e-skills.md   ← este plano
└── 39-registro-execucao-copy.md        ← NOVO (T-C0.1)
```

Por que `docs/COPY.md` + `docs/copy/` e não `docs/NN-*.md`: o sistema de copy é referência permanente, como `PRODUCT.md`/`DESIGN.md`/`ai/`, não um plano com fases. Numeração `NN` fica para plano e registro (regra do `CLAUDE.md`).

### D.2 Hierarquia de autoridade da copy (entra no `COPY.md`)

1. Pedido explícito do usuário.
2. Spec/plano vigente que fixa um texto literal (ex.: `36` §F.4 RU-*). O texto do plano vale; o guia só orienta ajuste que não mude o sentido.
3. `docs/20` §7.1 (norma de voz de origem).
4. `docs/COPY.md` + `docs/copy/*` (sistema operacional; incorpora o `20` §7.1).
5. Inventário `docs/21` (o que está revisado; string "revisado" não muda sem atualizar o inventário).
6. Skills de escrita, na ordem do roteamento.

### D.3 O que vira histórico (nota de precedência de uma linha no topo, sem apagar nada)

`15` (voz e biblioteca → apontar `docs/copy/02` e `04`; §4 "onde a Foca aparece" e §5 expressões continuam válidos), `09` §6, `13`, `docs/design/brand/foca-rabisco-branding.md` §Arquétipo/§Persona (a parte visual continua vigente).

---

## E. Persona

### E.1 Recomendação: uma persona primária + estados do aluno

Manter **João** como persona única (decisão de 22/07, `14` §0, e continua certa: é critério de decisão). Não criar personas novas. Acrescentar **estados do aluno**, porque a copy muda com o estado e o produto já sabe detectar a maioria deles. Só entra estado que o app consegue identificar a partir de dado real, ou que o tutor identifica pela conversa.

### E.2 Conteúdo de `docs/copy/01-estrategia.md` §1 — Persona (resumo operacional, não reescrever o `14`)

Campos, cada um com fonte citada: idade/situação escolar (16–19, EM ou pré-vestibular — `14` §1); objetivo declarado e real (`14` §1); provas (ENEM; outros vestibulares — `COPY.onboarding` pergunta a prova; conferir `quiz.tsx` `STEPS`); dores (`14` §3–§4: custo de começar, não saber onde está fraco); comportamento (tempo fragmentado, celular, compete com o feed); procrastinação e culpa (`14` §2, §4: a culpa faz evitar); excesso de conteúdo (`14` §3); expectativa em relação ao app (`14` §5: caber em pouco tempo, contar de verdade, prova visível de progresso); barreiras de retenção e abandono (`14` §2, §7). **Cortar** do resumo: detalhes de pitch/banca (`14` §9–§10), que não orientam copy.

Regra de redação desta seção: nada de estereótipo inventado ("ama memes", "fala gírias"). Se não está no `14` ou num registro de execução, não entra. Lacunas ficam como **[lacuna]** — em especial: nenhuma entrevista com aluno real (`PRODUCT.md` → Evidence on Hand).

### E.3 Estados do aluno (rascunho para o executor completar e conferir no código)

| Estado | Como o app sabe (conferir o nome real no código antes de citar) | O que a copy faz | O que a copy nunca faz |
|---|---|---|---|
| Começando | onboarding/quiz incompleto; `prefs.onboardingVersion`; primeira atividade | Explica o mínimo, um CTA | Tutorial longo, promessa de resultado |
| Sem direção | sem nivelamento feito; modelo com `source` só de prior/bootstrap | Oferece nivelamento **opcional**; o app escolhe o próximo passo | Pressionar a fazer o nivelamento |
| Em ritmo | streak ≥ 2, meta do dia batida | Confirma curto, mostra o dado real | Festa a cada ação |
| Voltando depois de ausência | dias desde a última atividade (conferir o campo); congelamento de streak usado | Convida a retomar, sem mencionar a ausência | Culpa, contagem de dias perdidos, "sentimos sua falta" |
| Travado num tópico | erros repetidos na mesma habilidade (`recentAttempts`, `skillModel`) / `ReasonCode` de reforço | Nomeia o ponto concreto, oferece explicação/tutor como opção | "Você é ruim em X", abrir o tutor sozinho (proibido pelo `20`) |
| Perto da prova | data da prova do onboarding (`COPY.onboarding.dataProva`, conferir onde é gravada) | Foco e priorização, tom calmo | Contagem regressiva ansiosa, "corre que dá tempo" |
| Frustrado | **só o tutor** detecta, pela conversa | Direto e acolhedor, zero humor (`15` §6) | Piada, "calma", minimizar |
| Forte / fraco num conteúdo | faixas por área/habilidade (Base em construção · No caminho · Base firme) | Descreve evidência ("acertou 4 das 5 últimas") | "Você domina", nota, "nível N" (`36` RP-6) |

Se um estado não tiver sinal real no código, o executor marca **[sem sinal no código — só vale para o tutor]** em vez de inventar gatilho.

---

## F. Jobs To Be Done

Base: o JTBD do `14` §5 (manter literal, é aprovado). Acrescentar só os jobs que o produto de hoje realmente atende, derivados de funcionalidades existentes. Rascunho:

| Tipo | Job | Funcionalidade que atende (fonte) |
|---|---|---|
| Funcional (principal, `14` §5) | "Quando eu tenho 2 minutos livres e bate a sensação de que estou ficando pra trás, eu quero fazer alguma coisa que conte de verdade pro meu vestibular, pra eu sentir que hoje eu não perdi o dia." | Jornada/trilha com um CTA "Continuar" (`25`, `30` §14) |
| Funcional | Quando abro o app sem saber o que estudar, quero que ele me diga o próximo passo e por quê, para não gastar energia planejando. | Planner + `ReasonCode` → frase de motivo no card (`30` §14.2, `COPY.jornada.motivos`) |
| Funcional | Quando erro uma questão, quero entender onde errei sem me sentir burro, para não repetir o erro. | Feedback imutável, "Ver resolução", "Explicar melhor", tutor sob demanda (`20`, `21` §2) |
| Funcional | Quando não sei a resposta, quero dizer isso em vez de chutar, para o app ajustar o que me mostra. | Botão "Não sei" (`30` §16.1) |
| Emocional | Quando volto depois de dias parado, quero recomeçar sem ter que encarar o quanto atrasei. | Retorno sem cobrança (`15` §3.2), congelamento de streak (`16` §6) |
| Emocional | Quando termino, quero ver que avancei de verdade, não um número inventado. | Faixas por habilidade, progresso por matéria (`/progress`), meta do dia |
| Social | [lacuna] — o ranking é mock e declarado como tal; não há job social validado. Não inventar. | `ranking.tsx` (mock) |

---

## G. Problem → Mechanism → Outcome

Só entra mecanismo que **existe no código** (conferir no `32`/`37` antes de escrever) ou que está numa spec aprovada, marcado como tal. O executor preenche a coluna "Estado" com evidência (`arquivo` ou registro).

| Problema do João | Mecanismo do Foca | Resultado que a copy pode prometer | Estado a conferir |
|---|---|---|---|
| Não sabe por onde começar | Nivelamento adaptativo opcional + modelo por habilidade + planner que escolhe a próxima atividade e diz o motivo | "O próximo passo já está escolhido, e você vê por quê." | Implementado (`30`/`32` F12–F13); o `36` corrige a aplicação do nivelamento (C1/B3) — **DEPENDÊNCIA DO PLANO PRINCIPAL** para prometer "o nivelamento muda sua trilha" |
| Estudar parece grande demais para o tempo que ele tem | Atividades curtas (lição de 4–8 questões, atividade da jornada), meta diária pequena | "Dá para fazer uma atividade no intervalo." — **sem** número de segundos até D-1 | Implementado; duração real não medida — não prometer minutos |
| Não sabe onde está fraco | Faixas por área/habilidade a partir das respostas | "Você vê em que partes a base já está firme e em quais ainda não." | Implementado (faixas); o `/aha` ainda usa heurística de perfil (`gaps.ts`) — **não** prometer "a IA descobriu suas lacunas" no onboarding |
| Esquece o que estudou | Revisão espaçada por habilidade (`reviewSchedule`), revisão de capítulo | "O que você estudou volta na hora de revisar." | Implementado (conferir `reviewSchedule` no `32`) |
| Erra e desanima | Feedback que explica, "Não sei", explicação em camadas, tutor sob demanda | "Errar mostra o que revisar." | Implementado |
| Quebra a sequência e larga | Streak com congelamento automático (até 2), retorno sem cobrança | "Parou uns dias? Continua de onde estava." | Implementado (`store.ts` `streakFreezes`) |
| Tem conteúdo de sobra e nenhuma ordem | Currículo com matérias/capítulos + jornada misturada | "Uma ordem para estudar, em vez de mais material." | Implementado |

**Proibido prometer** (nada disso existe): aprovação, nota prevista, "estude X% mais rápido", "IA que te conhece melhor que você", resultado garantido, número de alunos, depoimentos.

---

## H. Positioning

### H.1 Estrutura da proposta de valor (conteúdo de `01-estrategia.md` §5)

| Campo | Rascunho | Fonte |
|---|---|---|
| Público | Aluno do ensino médio/pré-vestibular que se prepara para o ENEM e estuda no celular, em tempo picado | `14` §1 |
| Problema | Não é falta de conteúdo: é o custo de começar e não saber onde está fraco | `14` §3, `08` §0 |
| Promessa | Um próximo passo claro, que cabe no intervalo, e que conta | `14` §5 |
| Mecanismo | §G (só o que existe) | `30`, `32` |
| Benefício | Estudar um pouco todo dia sem planejar e ver o que avançou | `14` §6 |
| Diferença | MEC Enem tem conteúdo e correção; o Foca decide a ordem, acompanha o que você acerta e erra e torna o recomeço barato. Duolingo é referência de mecânica, não de identidade | `08` §10, `.agents/product-marketing.md` |

### H.2 Frase de posicionamento — **decisão D-1 do usuário**

Não trocar a frase do `08` §1 sem aprovação. O executor escreve em `01-estrategia.md` §5 a frase atual, os problemas P5–P7, e **três** opções, sem escolher. Rascunhos de partida (o executor pode melhorar, respeitando §G):

1. "Estudo curto, todo dia, na ordem certa para você." (alinhada à tagline RU-20 do `36`)
2. "O Foca escolhe o próximo passo. Você só precisa de alguns minutos."
3. "Menos tempo decidindo o que estudar. Mais dias estudando."

"Duolingo para o ENEM" pode aparecer só como explicação interna, marcada como **não usar em copy**.

---

## I. Brand Voice

Conteúdo de `docs/copy/02-voz-e-tom.md` §1. Base obrigatória: `20` §7.1 (copiar a tabela e os tamanhos-alvo **literalmente**, com citação) + `15` §2 (curta, seca, sobre o agora — sem a "cobradora") + `15` §3.1/§3.2 (comportamento, nunca pessoa; retorno sem cobrança).

### I.1 Atributos (cada um com significado, SIM, NÃO e limite)

| Atributo | Significado | SIM | NÃO | Limite |
|---|---|---|---|---|
| **Direta** | Diz o que é, em palavra comum | "Resposta certa." · "O detalhe está no sinal." | "Parabéns pela excelente resposta!" | Direta não é seca a ponto de soar ríspida num erro |
| **Próxima** | Fala como colega de estudo, "você", sem hierarquia | "Vamos de onde você parou?" | "Prezado estudante" · "MANDOU DEMAISSS 🔥🔥🔥" | Sem gíria forçada; sem imitar adolescente |
| **Calma** | Entende a dificuldade sem dramatizar | "Essa pega bastante gente. Olha o passo 2." | "Não desista dos seus sonhos!" | Não minimiza ("é fácil") nem aumenta ("isso é crucial para sua aprovação") |
| **Honesta** | Só afirma o que o dado mostra | "Você acertou 4 das últimas 5 de porcentagem." | "Você domina porcentagem!" com uma resposta | Número só quando vem do estado (`COPY.jornada` já segue isso) |
| **Leve** | Humor raro, sobre a Foca ou a situação | "Feito. Eu volto pra minha pedra." (no fim, não no meio) | Piada sobre o erro, sobre a capacidade ou sobre a ausência | No máximo uma vez por sessão (`20` §7.1); nunca em erro técnico, explicação ou retorno |

### I.2 Humor, emoji, exclamação, tamanho

Copiar do `20` §7.1 e acrescentar só o que falta: humor **nunca** em estado de erro técnico, confirmação destrutiva, explicação de conteúdo, frustração; emoji nunca em controle, erro, explicação ou alerta, e excepcional em celebração editorial (definir no guia o que é "celebração editorial": fim de capítulo, marco de streak; nada mais).

### I.3 Registro gramatical

`você` sempre. Botões no infinitivo, começando pelo verbo ("Tentar de novo", "Fazer a revisão"), primeira letra maiúscula só na primeira palavra. O imperativo em frase de corpo ("Tente"/"Tenta") é **decisão D-2** (§W.0); até lá o guia registra as duas formas em uso e a recomendação.

### I.4 Teste de voz (substitui o teste da Foca do `15` §8 para copy do produto)

Seis perguntas, na ordem: (1) Está claro sem contexto? (2) Diz o que fazer, ou o que aconteceu? (3) Cabe no tamanho-alvo? (4) Afirma algo que o dado não mostra? (5) Julga a pessoa, cobra ausência ou minimiza o erro? (6) Soaria natural dito por um colega de turma atento? O `15` §8 continua valendo **só** para falas da Foca (§L).

### I.5 Glossário de voz (não é o glossário de produto)

Palavras que o Foca usa e evita, com substituto: "domina" → "acertou N de M"/faixa; "jornada" (em copy) → evitar, usar "trilha"/"hoje"; "incrível", "sensacional" → cortar; "desbloqueie seu potencial" → cortar; "estamos aqui por você" → cortar.

### I.6 Padrões de texto artificial (pt-BR) — checklist editorial, **não detector**

Abrir com a ressalva do `20` §7.1 (nenhuma lista prova autoria). Lista para `02-voz-e-tom.md` §4, com exemplo de antes/depois do Foca em cada um:
- "Não é X. É Y." / "Mais do que X, Y." (inclusive na frase de posicionamento atual)
- Motivação genérica repetida: "Você está no caminho certo", "Cada passo conta", "Continue assim!", "Acredite em você"
- "Jornada", "potencial", "transformar", "desbloquear", "mergulhar" em copy de produto
- Trincas por reflexo ("rápido, fácil e eficiente") e paralelismo em toda frase
- Frase de efeito no fim de cada bloco ("E isso muda tudo.")
- Adjetivo de elogio sem fato ("excelente", "incrível")
- Anúncio antes do conteúdo ("Vamos lá:", "Olha só que interessante:")
- Travessão como conector de toda frase — **observação:** o travessão é aceito na copy aprovada do `21` (amostra do autor, regra já registrada no `SKILLS.md` §L). O problema é o uso em série, não o sinal
- Negrito decorativo e título que repete a primeira frase (docs e marketing)
- CTA "perfeito demais" ("Comece sua transformação hoje mesmo!")

---

## J. Tone Matrix

Conteúdo de `docs/copy/02-voz-e-tom.md` §2. Uma linha por contexto. A voz é a mesma; o tom muda. Rascunho (o executor confere cada exemplo contra a string real de `copy.ts`/`voz.ts` e cita a chave quando existir):

| Contexto | Tom | Pode | Não pode | Exemplo de direção | String atual a citar |
|---|---|---|---|---|---|
| Acerto | Curto, confirma | 2–7 palavras; dado específico se houver | Exagero, "não se acostuma" | "Isso. Resposta certa." | `voz.acertou` (auditar §C.3) |
| Erro | Calmo, aponta o ponto | Dizer o que muda na resposta | Julgar, ironizar | "O detalhe está aqui." | `voz.errou` |
| Erro repetido na mesma habilidade | Concreto, oferece ajuda | Nomear o passo; oferecer "Explicar melhor" | Abrir o tutor sozinho; "de novo?" | "Essa parte ainda está pegando. Quer ver outro exemplo?" | `COPY.jornada.motivos` (reforço) |
| Questão difícil / desafio | Honesto, sem susto | Avisar que é mais difícil | "Só os melhores acertam" | "Esta é mais difícil que as anteriores." | `COPY.licao.roles.desafio` |
| "Não sei" | Neutro, segue | Mostrar o caminho | "Tudo bem" sozinho, consolar demais | "Sem problema. Olha o caminho:" | `voz.naosei` |
| Conclusão de lição | Resumo do que aprendeu | Um fato do que foi feito | Festa genérica | "Você aprendeu: …" | `COPY.licao.voceAprendeu` |
| Streak (dia novo / marco) | Discreto; marco pode ter uma linha editorial | Número real | Culpa, perda iminente | "7 dias seguidos." | `voz.marco` (auditar) |
| Retorno após ausência | Acolhedor, sem mencionar a ausência | Ir direto ao próximo passo | Contar dias perdidos, "sentimos sua falta" | "Vamos de onde você parou?" | `voz.retorno` |
| Nivelamento (durante) | Neutro, instrução | Explicar "Não sei" | Dar dica, pressionar | literal de `COPY.nivelamento.duranteHint` | — |
| Resultado do nivelamento / diagnóstico | Descritivo, provisório | Faixa por área, "ponto de partida" | Nota, %, "nível N", ranking (`36` RP-6) | literal de `COPY.nivelamento.resultado*` | **DEPENDÊNCIA DO PLANO PRINCIPAL** (`36` T-06.1 refaz a tela) |
| Carregando | Informativo, curto | Dizer o que está acontecendo | "Aguarde…" sem contexto; humor | "Separando suas questões…" | `36` RU-2 |
| Falha de rede | Calmo, ação | Causa provável + "Tentar de novo" | "Ops!", culpar o aluno | "Não deu pra carregar agora." | `36` RU-3, `COPY.tutor.falhaResposta` |
| Erro técnico / dados | Sério, explícito | Dizer o que se perde e o que fazer | Humor, eufemismo | literal de `36` RU-4…RU-6 | `36` |
| Confirmação (sair, apagar) | Neutro, repete a consequência | Botão com a ação ("Sair da lição") | "Sim/Não", "OK" | "Sair da lição?" → "Sair mesmo assim" / "Continuar estudando" | `COPY.licao.sair*` |
| Bloqueado | Informativo, sem punição | Dizer o que libera | "Você ainda não pode" | "Conclua o capítulo anterior" | `COPY.trilha.capituloBloqueado` |
| Desbloqueado | Discreto | Uma linha | Fogos em tudo | "A revisão do capítulo está aberta." | `COPY.trilha.revisaoAberta` |
| Onboarding | Direto, pouco texto | Explicar por que pede cada dado | Promessa de resultado | "Quer começar no seu nível?" | `COPY.onboarding.*` |
| Revisão | Neutro, útil | Dizer por que voltou | "Você esqueceu" | frase de `COPY.jornada.motivos` (revisão) | — |
| Foca IA | §L | — | — | — | `tutor-prompt.ts` |
| Marketing | Mais energia, mesma honestidade | Benefício concreto, verbo de ação | Promessa não demonstrada, prova inventada | §M | `brand.ts` (**do `36`**) |

---

## K. UX Writing System

Conteúdo de `docs/copy/03-ux-writing.md`.

### K.1 Ordem de prioridade

1. Clareza · 2. Ação · 3. Contexto · 4. Brevidade · 5. Personalidade. Personalidade que prejudica 1–4 sai.

### K.2 Regras que o Foca adota da skill Better Writing (citar a skill, adaptar ao pt-BR)

Verbo primeiro em botão; confirmação repete a consequência; vocabulário de fluxo único (escolher um de "Continuar"/"Próximo" — o Foca já usa "Continuar"); erro diz como resolver, perto de onde quebrou, sem "ops" e sem exclamação; estado vazio orienta e aponta um próximo passo; placeholder é exemplo, nunca rótulo; nunca concatenar frase em volta de variável (usar função de template com plural, como `COPY.trilha.questoes(n)` já faz); um padrão de capitalização por tipo de elemento; toggle descreve o estado ligado; link diz para onde vai.

### K.3 Padrões por componente (tabela; coluna "canônico" cita a chave de `copy.ts` quando existir)

Linhas obrigatórias: CTA principal · CTA secundário · voltar · continuar · confirmar · cancelar · tentar de novo · erro de campo · erro de rede · erro de dados · aviso (warning) · carregando · estado vazio · bloqueado · sucesso · lição concluída · capítulo concluído · streak · nivelamento (oferta, durante, resultado) · diagnóstico/progresso · aria-label de ícone. Colunas: padrão · limite de palavras · canônico hoje (`COPY.x.y` ou "não existe") · anti-padrão · observação/DEPENDÊNCIA.

### K.4 Glossário de produto (`03-ux-writing.md` §3)

Para cada termo: termo visível canônico · proibidos/sinônimos · definição de uma linha · id no código (**nunca renomear id**; só rótulo visível) · status (consistente / inconsistente / decisão pendente). Termos obrigatórios: matéria, trilha, seção, capítulo, lição, aula, atividade, passo, questão, prática, revisão, desafio, checkpoint/checagem, nivelamento, diagnóstico, lacuna, faixa, domínio, sequência/streak, meta do dia, XP, Foca, tutor. Recomendações do plano (o executor registra como `PROPOSTA — aguarda D-3/D-4` quando depender de decisão):

| Conceito | Recomendação | Motivo |
|---|---|---|
| Unidade autoral | **lição** | É o termo do `25` e do `COPY.licao` |
| Item da jornada | **atividade** (tipo visível: Lição, Prática, Revisão, Desafio, Checagem, Reforço) | "Aula" some da UI (conflito com "60 s") — **D-4** |
| Checagem mista | **Checagem** (não "Checkpoint") | O `32` F7.7 já julgou "Checkpoint" jargão; hoje convivem os dois |
| Sequência de dias | **sequência** na UI; "streak" só em código/doc | Palavra em português comum; `aha.tsx` já usa — **D-3** |
| Medida por habilidade | **faixa** (Base em construção · No caminho · Base firme); "domínio/Dominado" sai da UI | `20` §13 e `36` RP-6. `progress.tsx`/`SkillRow.tsx` não estão no plano de arquivos do `36`, mas `lib/adaptive/display.ts` (onde "Dominado" também vive) é tocado pelo `36` T-06.1 — **DEPENDÊNCIA DO PLANO PRINCIPAL** na migração |
| Medição inicial | **nivelamento** (ação); "diagnóstico" só interno; "lacunas" só no `/aha` enquanto for heurística | Um nome por coisa |
| Home | **trilha** (nav: "Aprender"); "jornada" só interno | — |

### K.5 Regra de manutenção

String nova: `copy.ts` + linha no `21` + checagem contra `03-ux-writing.md` §2. Termo novo: glossário primeiro, string depois.

---

## L. AI Foca Personality

Conteúdo de `docs/copy/04-foca-ia.md`. Separar três camadas:

| Camada | Onde vive | Quem manda |
|---|---|---|
| Voz do produto (botões, estados, feedback) | `copy.ts` | `02-voz-e-tom.md` |
| Falas da mascote (momentos emocionais curtos) | `voz.ts` | este documento §2 + `15` §4 (onde aparece) |
| Personalidade conversacional do tutor | `tutor-prompt.ts` (`buildSystemPrompt`) | este documento §3; o **texto do prompt** é a fonte de verdade executável |

Seções obrigatórias: saudação (hoje `COPY.tutor.saudacaoComFoco`/`SemFoco`); tamanho (≤ 4 frases na primeira resposta, detalha se pedido — `20` §7.1); humor (≤ 1 por conversa, só sobre a própria Foca/pedra, nunca sobre o aluno — atual `tutor-prompt.ts` L77; decisão **D-5** se o humor da pedra continua); explicações (moldura fora, conteúdo claro — `15` §6, "a piada nunca entra na explicação"); comportamento diante do erro do aluno (dizer o que muda, oferecer próximo passo); frustração (humor zero, acolhedor e direto); formalidade (você, frases completas, sem gíria forçada); anti-infantilização (não elogiar o óbvio, não usar diminutivo, não explicar o que o aluno já mostrou saber); anti-professor-robô (sem "Ótima pergunta!", sem lista numerada para resposta de duas frases, sem "Espero ter ajudado"); emoções (a Foca é personagem: pode reagir como personagem — "Essa eu gostei de explicar" é limite; **não** afirmar sentimentos humanos, cansaço, saudade, preocupação com o aluno, nem fingir memória que não tem); honestidade (não inventar fonte, ano de prova, gabarito; se o contexto não tem a questão, dizer isso); regras técnicas que continuam (anti-LaTeX, timeout 12 s, `localFallback`).

Falas de `voz.ts` (§2 do documento): limite de 14 palavras; seleção no evento; teste do `15` §8 **atualizado** (sem "cobra" e sem "funcionaria dito por um bicho numa pedra" como único critério). Lista dos slots com o tom de cada um.

**Não editar** `tutor-prompt.ts` nem `voz.ts` neste plano. Mudança no prompt = revisão L2 (`SDD-WORKFLOW` §6) e possivelmente **DEPENDÊNCIA DO PLANO PRINCIPAL** (o `30` §15 "Foca IA com contexto pedagógico" é do plano técnico).

---

## M. Skill Audit (skills existentes que tocam escrita)

| Skill | Função real (lida) | Força | Fraqueza no Foca | Papel no novo sistema |
|---|---|---|---|---|
| **Humanizer** 3.0.0 | 25 padrões de texto artificial por força; tells "fracos sozinhos" só contam acompanhados; amostra do autor manda (inclusive travessão); passo explícito de checar fato adicionado/perdido; modo arquivo/embutido; "quando não agir" | Calibrado, preserva fatos, respeita voz | Escrito para inglês; pensado para prosa, não para rótulo | **Revisor anti-artificialidade único** para texto de 2+ frases (§R) |
| **copywriting** (Corey 2.0.2) | Copy de página: clareza > criatividade, benefício > função, CTA, estrutura de hero/seções, referências de frameworks; lê `.agents/product-marketing.md` | Honestidade ("não fabricar estatística"), estrutura de LP | Viés de conversão SaaS; cita estatística de conversão externa | Rascunho de marketing |
| **copy-editing** (Corey 2.0.0) | Sete passadas (clareza, voz, "e daí?", prove, especificidade, emoção, risco zero) + painel de especialistas + checagens de palavra/frase | "Prove It" e "Especificidade" pegam promessa sem lastro | Marketing, não microcopy; painel de especialistas é caro | Revisão obrigatória de marketing |
| `product-marketing`, `cro`, `onboarding`, `signup` (Corey) | Contexto, conversão, onboarding de ativação | — | `analytics`/`ab-testing` conflitam com `20` §14/§22 | Marketing sob demanda (sem mudança) |
| `design:ux-copy`, `marketing:brand-review` (usuário) | UX copy genérica; revisão de marca contra guia | — | Não reproduzível para outro dev; fora do repo | **Não rotear.** Quem tiver pode usar como opinião extra, nunca como etapa |
| Impeccable (modo copy) | Crítica de UI inclui copy | — | Sobreposição com Better Writing | Não usar para copy |

---

## N. boraoztunc/skills Audit

Commit `645553ca7622570479e330cc089c65fcf34e0ba8`. Candidatas prioritárias lidas integralmente; demais triadas pelo README + frontmatter.

### N.1 As cinco prioritárias

| Skill (nome real no frontmatter) | Origem real | O que faz | Comparação com o que o Foca tem | Veredito |
|---|---|---|---|---|
| `copywriting` | Fork do `coreyhaines31/marketingskills`, versão **1.0.0** | Igual à do Corey, versão antiga (diff lido: falta hero como transformação, "Now you can", referências renomeadas) | O Foca já tem a **2.0.2** do upstream original | **Não instalar** — duplicata mais velha |
| `copy-editing` | Fork do mesmo, **1.0.0** | Sete passadas, sem o painel de especialistas nem o "content refresh" | O Foca já tem a **2.0.0** | **Não instalar** — duplicata mais velha |
| `stop-slop` | Vendorizada de `hardikpandya/stop-slop` 2.0.0 (o upstream já moveu listas para `references/`) | Regras absolutas: cortar **todo** advérbio, **toda** voz passiva, **todo** travessão, listas de três, frases começando com pronome interrogativo; nota 1–10 em 5 dimensões | Mesmo objetivo do Humanizer (instalado), com método mais bruto: sem calibração "fraco sozinho", sem amostra do autor, sem checagem de fato. Em pt-BR e em microcopy, as regras absolutas quebram texto correto ("Resposta registrada." é passiva; "Só falta uma." tem advérbio) e contradizem o `20` §7.1 (travessão não é detector) | **Não instalar** (§R) |
| `better-writing` | Vendorizada de `jakubkrehel/skills` (MIT); o upstream reescreveu depois, a versão do bora é mais completa na estrutura e traz `review-output.md` | Escrita de interface: recon da voz existente, uma voz/tom por gravidade, verbo primeiro, confirmação que repete a consequência, vocabulário de fluxo, erro que diz como resolver, estado vazio, placeholder, capitalização, formato de revisão com severidade e veredito | **Nada equivalente no projeto.** Preenche a lacuna P9. Respeita voz de marca existente ("brand character is not a defect") | **Instalar** |
| `ogilvy-copywriting` (pasta `ogilvy/`) | Compilação própria do bora (MIT declarado no frontmatter) | Hierarquia de Ogilvy: posicionamento → promessa → imagem de marca; big idea; regras de título e corpo; perguntas diagnósticas | Sobrepõe parcialmente o `copywriting` (Corey), mas atua **antes** dele: decide posicionamento e promessa. Útil para D-1 e para qualquer landing | **Instalar**, restrita a marketing/posicionamento |

### N.2 Demais skills do repositório (triagem)

| Grupo | Skills | Veredito e motivo |
|---|---|---|
| Forks antigos do Corey Haines | `page-cro`, `content-strategy`, `seo-audit`, `programmatic-seo`, `schema-markup`, `competitor-alternatives`, `analytics-tracking` | Não instalar: versões antigas de skills já instaladas no pacote Marketing; `analytics-tracking` ainda conflita com `20` §14/§22 |
| Páginas de marketing | `landing-page`, `pricing-page`, `product-proof-saas` | Não instalar agora. `landing-page` (arquitetura de LP) sobrepõe `cro` + `design-taste-frontend`; `pricing-page` exige preço (inexistente, `08` §11); `product-proof-saas` (demo honesta de IA) é candidata a reavaliar **se** uma landing com demo da IA for especificada |
| Interface `better-*` e revisão | `better-accessibility`, `better-colors`, `better-layout`, `better-typography`, `better-ui`, `better-interface`, `interface-review` | Fora do escopo de copy. Sobrepõem `web-design-guidelines`/Impeccable. Registrar como "não avaliadas para instalação neste plano; candidatas a um plano de design" |
| Já instaladas a partir do upstream original | `frontend-design`, `impeccable`, `web-design-guidelines`, `vercel-react-best-practices` | Não instalar: o Foca usa as originais |
| Estilo visual / efeitos | `visual-style-presets`, `glass-dark-ui`, `skeuomorphic-ui`, `mesh-gradient-*`, `liquid-metal-border`, `beam-glow-states`, `webgl-laser`, `thinking-orbs`, `shaders-cursor-ripples` (dependência paga), `progressive-blur`, `reveal-hover-effect`, `staggered-word-reveal`, `container-lines`, `framed-grid-layout`, `corner-diagonals`, `css-border-gradient`, `beautiful-shadows`, `apple-design`, `emil-design-eng`, `documentary-brutalist-agency`, `editorial-portfolio-chapters`, `minimal-zine-poster` | Não instalar: presets estéticos brigam com a identidade Rabisco fixa (mesmo motivo da recusa das 11 skills do Taste) |
| Vídeo | `hyperframes*`, `remotion-to-hyperframes`, `website-to-hyperframes`, `contribute-catalog`, `gsap`, `animejs`, `waapi`, `css-animations`, `lottie`, `three`, `typegpu`, `tailwind` | Não instalar no projeto: HyperFrames já existe no escopo de usuário desta máquina; sem uso no app |
| Outros | `tailwind-v4` (SecondSky cobre), `app-store-screenshots` (Next.js; sem App Store), `service-booking-flow`, `operational-enterprise-ai`, `conductor-rewrite-performance`, `linear-local-first-architecture`, `adversarial-review` | Não instalar: fora do produto ou duplicam ferramentas de engenharia existentes |

---

## O. Skills To Install

Duas. Nenhuma outra.

### O.1 `better-writing`

| Campo | Valor |
|---|---|
| Nome | `better-writing` |
| Origem | `https://github.com/boraoztunc/skills` pasta `better-writing/`, commit `645553ca7622570479e330cc089c65fcf34e0ba8`. Upstream original: `https://github.com/jakubkrehel/skills` (`skills/better-writing/`, MIT, Jakub Krehel). A versão do bora **diverge** do upstream atual (`267330e`): o upstream foi reescrito depois da vendorização. Fica a do bora (mais completa, com `review-output.md`) |
| Local | `.claude/skills/better-writing/` com `SKILL.md` e `review-output.md` (nada mais) |
| Licença | MIT (`LICENSE-jakubkrehel` do bora) — copiar o texto da licença para `.claude/skills/better-writing/LICENSE` **só se** o método de instalação não trouxer; registrar |
| Função | Escrever e revisar texto de interface: botão, erro, estado vazio, confirmação, placeholder, onboarding, notificação |
| Prioridade | **REQUIRED** para string nova ou alterada em `copy.ts` com mais de um rótulo, ou qualquer mensagem de erro/confirmação/estado vazio; **RECOMMENDED** na auditoria (§U) |
| Inputs | `docs/COPY.md` (Quick Context), `docs/copy/03-ux-writing.md` §2–§3, a(s) string(s) com `arquivo:linha`/chave, o estado/gatilho, o limite de palavras |
| Outputs | Tabela de achados no formato de `review-output.md` (Severity/Location/Before/After/Why) + verificação + veredito (Block / Needs changes / Approve) |
| Dependências | Nenhuma skill antes. Cita `better-typography`/`better-accessibility`/`better-layout`, que **não** serão instaladas — ignorar essas remissões (registrar como adaptação de uso, sem editar o arquivo) |
| Relação | Substitui o Humanizer como primeira escolha para microcopy; o Humanizer entra depois só se houver 2+ frases; `copy-editing` só para marketing; `web-design-guidelines` continua dono de a11y/semântica |
| Não usar | Conteúdo pedagógico; prompt do tutor; falas curtas da Foca (`voz.ts`) como se fossem mensagens de sistema (a regra "sem humor" dela vale para erro, não para a mascote); marketing de persuasão |
| Adaptação ao Foca (no `SKILLS.md`, não no arquivo da skill) | Exemplos em inglês → aplicar ao pt-BR; "tap/click" → "toque"/"clique"; "sentence case" = primeira letra maiúscula; a voz de marca do Foca (`20` §7.1) é o "established voice" que a skill manda preservar |
| Exemplos Foca | (1) "Não deu pra carregar agora." + botão "Tentar de novo" (RU-3 do `36`) → checar que o corpo diz o que fazer; (2) modal "Sair da lição?" → confirmar que os botões repetem a consequência ("Sair mesmo assim"/"Continuar estudando" — já cumpre); (3) `COPY.trilha.tudoConcluido` → estado vazio com próximo passo ("Praticar") — já cumpre; (4) padronizar "Tente/Tenta/Tentar de novo" (vocabulário de fluxo) |

### O.2 `ogilvy-copywriting`

| Campo | Valor |
|---|---|
| Nome | `ogilvy-copywriting` (é o `name` do frontmatter; a pasta upstream se chama `ogilvy/`. Instalar com a pasta **igual ao nome** — `.claude/skills/ogilvy-copywriting/` — e invocar como `ogilvy-copywriting`) |
| Origem | `https://github.com/boraoztunc/skills` pasta `ogilvy/`, commit `645553ca7622570479e330cc089c65fcf34e0ba8`. Compilação do mantenedor a partir de livros de David Ogilvy; `license: MIT` no frontmatter; sem upstream anterior |
| Local | `.claude/skills/ogilvy-copywriting/SKILL.md` (arquivo único) |
| Função | Estratégia de mensagem: posicionamento (o que faz e para quem), promessa única, big idea, regras de título, fatos acima de adjetivos, perguntas diagnósticas |
| Prioridade | **RECOMMENDED** em posicionamento, proposta de valor, hero/título de landing, descrição de loja/OG. **OPTIONAL** em campanha e post. **DO NOT USE** em tudo que é interface do app, feedback, tutor, conteúdo pedagógico |
| Inputs | `docs/copy/01-estrategia.md` (persona, §G, §H), `docs/copy/06-marketing.md` (promessas permitidas/proibidas), `PRODUCT.md` → Evidence on Hand |
| Outputs | Respostas às 10 perguntas diagnósticas + uma promessa + 3–5 opções de título com a promessa; nunca a página inteira (isso é do `copywriting`) |
| Dependências | Ler antes: persona e Evidence on Hand. Depois dela: `copywriting` (rascunho) |
| Relação | Estratégia antes do `copywriting` (Corey); não substitui `product-marketing` (contexto) nem `copy-editing` (revisão) |
| Regras de conflito (no `SKILLS.md`) | "Testimonials work" e "long copy sells" **não autorizam** depoimento inventado nem texto longo na UI (`PRODUCT.md` → Evidence on Hand); "brand name in headline" é opcional; "avoid animation for adults" e as regras de TV/foto não se aplicam ao app; "big idea" nunca vira promessa que o produto não cumpre (§G) |
| Exemplos Foca | (1) D-1: gerar as 3 opções de frase de posicionamento (§H.2); (2) título da futura landing: promessa "próximo passo claro" com fato verificável; (3) revisar `BRAND.description` **depois** que o `36` T-08.7 terminar — **DEPENDÊNCIA** |

---

## P. Skills Not Installed

A registrar no `SKILLS.md` (nova seção) e em `declined[]` do registry, cada uma com motivo de uma linha:

| Skill | Motivo |
|---|---|
| `copywriting` (bora) | Fork 1.0.0 do `coreyhaines31/marketingskills`; o Foca já tem a 2.0.2 do upstream original (pacote Marketing) |
| `copy-editing` (bora) | Fork 1.0.0; o Foca já tem a 2.0.0 do upstream original |
| `stop-slop` | Mesma função do Humanizer (instalado), com regras absolutas que em pt-BR e em microcopy removem texto correto e contradizem o `20` §7.1. Detalhe em `SKILLS.md` §L |
| `page-cro`, `content-strategy`, `seo-audit`, `programmatic-seo`, `schema-markup`, `competitor-alternatives`, `analytics-tracking` | Forks antigos de skills do pacote Marketing já instalado; `analytics-tracking` também conflita com `20` §14/§22 |
| `landing-page`, `pricing-page` | Sobrepõem `cro`/`design-taste-frontend`; não há preço definido (`08` §11) |
| `product-proof-saas` | Reavaliar se uma landing com demo da IA for especificada |
| `better-*` (exceto `better-writing`), `interface-review` | Fora do escopo de copy; candidatas a um plano de design; sobrepõem `web-design-guidelines`/Impeccable |
| `frontend-design`, `impeccable`, `web-design-guidelines`, `vercel-react-best-practices` | Já instaladas a partir do upstream original |
| Presets visuais e efeitos (lista em §N.2) | Brigam com a identidade Rabisco fixa |
| HyperFrames e adaptadores de vídeo | Sem uso no app; já disponíveis no escopo de usuário desta máquina |
| Demais (§N.2 "Outros") | Fora do produto ou duplicam engenharia existente |

---

## Q. Skill Routing

Conteúdo para `docs/ai/SKILL-ROUTING.md`: **substitui** as linhas `copy do app` e `marketing / growth` do §2 e a linha `Copy` do §4; acrescenta uma seção nova "§2.1 Escrita: roteamento detalhado" logo depois do §2. Não criar arquivo novo de roteamento.

### Q.1 Classes de escrita (entram na tabela do §2)

| Classe | Sinais | Ler antes | Primária | Humanização | Revisão | Nunca |
|---|---|---|---|---|---|---|
| **microcopy** — rótulo, botão, aria-label, 1 frase | "muda esse botão", "texto do toast" | `COPY.md` (Quick Context) + linha do padrão em `copy/03` §2 | nenhuma (aplicar o padrão) — `better-writing` se forem 2+ strings ou erro/confirmação/vazio | não | autorrevisão com o teste de voz (§I.4) | Humanizer em rótulo; mais de 1 skill |
| **UX writing** — tela nova, fluxo, erro, estado vazio, onboarding de uso | "tela nova", "mensagem de erro", "onboarding" | `COPY.md` + `copy/01` §1–2 (persona, estados) + `copy/02` + `copy/03` | `better-writing` | Humanizer só em corpo de 2+ frases | `better-writing` (formato de revisão) sobre o diff | skills do pacote Marketing em tela do app |
| **fala da Foca** (`voz.ts`) | "fala da mascote", "mensagem de marco" | `COPY.md` + `copy/04` §2 + `15` §4 | nenhuma (guia) | não | teste de voz + teste da Foca atualizado | Humanizer (achata humor), Ogilvy |
| **Foca IA** (`tutor-prompt.ts`) | "o tutor responde…", "persona do tutor" | `COPY.md` + `copy/04` + `20` §7.1 (linha Tutor) | nenhuma de escrita; é engenharia de prompt + L2 | não | L2 (`SDD-WORKFLOW` §6) + `brand-voice.test.ts` | Humanizer no prompt; tirar anti-LaTeX |
| **conteúdo pedagógico** | enunciado, alternativa, explicação, lição | `copy/05` + rubrica do `36` §G.6 | **nenhuma skill de copy** | **proibido** em enunciado/alternativa/gabarito/fórmula/citação | revisão factual (`36` Fase 7) | "melhorar o texto" de questão oficial (`34`) |
| **marketing** — landing, hero, OG, loja, post, campanha | "landing", "headline", "descrição", "post" | `COPY.md` + `copy/01` + `copy/06` + `PRODUCT.md` → Evidence on Hand | `ogilvy-copywriting` (estratégia) → `marketing-skills:copywriting` (rascunho) · `design-taste-frontend` se houver página | Humanizer (**RECOMMENDED**) | `marketing-skills:copy-editing` (**REQUIRED**) | prova social, número, preço inventados; analytics sem spec |
| **posicionamento** | "proposta de valor", "tagline", "como explicar o Foca" | `copy/01` inteiro | `ogilvy-copywriting` | Humanizer | `copy-editing` (passadas "Prove It" e "Especificidade") + aprovação do usuário | trocar a frase sem aprovação (D-1) |
| **docs** para humanos | registro, README | — | `agent-skills:documentation-and-adrs` (formato) | Humanizer só em doc para humanos | — | Humanizer em spec (inalterado) |

### Q.2 Níveis por skill (tabela para `SKILL-ROUTING.md` §2.1)

| Skill | REQUIRED | RECOMMENDED | OPTIONAL | DO NOT USE |
|---|---|---|---|---|
| `better-writing` | erro, confirmação, estado vazio, fluxo novo; 2+ strings de interface | auditoria de copy (§U) | microcopy de 1 rótulo | pedagógico, prompt do tutor, marketing, falas da Foca |
| `ogilvy-copywriting` | — | posicionamento, proposta de valor, hero/título, descrição OG/loja | campanha, post | UI do app, feedback, tutor, pedagógico, microcopy |
| `marketing-skills:copywriting` | rascunho de página de marketing | onboarding **de conversão** (fora do app) | e-mail/post | microcopy, UI do app, tutor, pedagógico |
| `marketing-skills:copy-editing` | revisão de todo texto de marketing antes de publicar | revisão do `copy/01` (posicionamento) | — | microcopy, UI do app (usar `better-writing`), pedagógico |
| `humanizer` | — | marketing, corpo de onboarding com 2+ frases, doc para humanos, texto de estado vazio com 2+ frases | falas longas do tutor em exemplos do guia | rótulo/botão, `voz.ts`, prompt do tutor, pedagógico, spec, código |
| `marketing-skills:product-marketing` | antes de qualquer skill do pacote (contexto) | — | — | — |

### Q.3 Ordem e orçamento por tamanho de tarefa (para `COPY.md` e `SKILL-ROUTING.md` §2.1)

| Tamanho | Ler | Skills | Teto |
|---|---|---|---|
| **Mudança mínima** (1 rótulo/tooltip/aria) | `COPY.md` (Quick Context) + linha do padrão | nenhuma | ~3k tokens de leitura |
| **Mensagem de erro / estado** | Quick Context → padrão em `copy/03` §2 | `better-writing` → (se 2+ frases) Humanizer | 1 skill + 1 revisão |
| **Tela ou fluxo novo** | Quick Context → `copy/01` §1–2 → `copy/02` → `copy/03` → roteamento | `better-writing` (escrever) → Humanizer (corpo) → `better-writing` (revisão sobre o diff) | 2 skills |
| **Landing / página de marketing** | `copy/01` → `copy/06` → `copy/02` → `PRODUCT.md` Evidence → roteamento | ligar pacote → `product-marketing` → `ogilvy-copywriting` (estratégia) → `copywriting` (rascunho) → `copy-editing` (7 passadas; painel de especialistas só em lançamento) → Humanizer → teste de voz → checagem de UI/comprimento | 4 skills; é o teto do sistema |
| **Foca IA** | `copy/01` §1 → `copy/02` → `copy/04` | nenhuma de escrita | L2 obrigatório |
| **Conteúdo pedagógico** | `copy/05` | nenhuma de copy | revisão factual |

Regra geral (vai para o `CLAUDE.md`): **usar skill só quando ela traz algo que o guia não traz.** Botão de duas palavras não passa por skill.

### Q.4 Como usar o `copywriting`/`copy-editing` sem ligar as 50 skills

Duas opções já previstas no `SKILL-ROUTING` §6, agora explícitas para escrita: (a) `claude plugin enable marketing-skills@marketingskills --scope local` + `/reload-plugins`, desligar ao fim; (b) ler o `SKILL.md` direto do cache: `~/.claude/plugins/cache/marketingskills/marketing-skills/2.11.1/skills/copy-editing/SKILL.md` (caminho no registry → `cachePath`). Para uma revisão isolada, (b) é o padrão.

### Q.5 Casos de teste do roteamento (acrescentar ao §7 do `SKILL-ROUTING.md`)

| Pedido | Rota esperada | Não deve carregar |
|---|---|---|
| "Troque o texto do botão Continuar da lição" | microcopy → Quick Context → padrão "continuar" | qualquer skill |
| "Reescreva a mensagem de erro do pacote que não carrega" | UX writing → `better-writing` | Humanizer, marketing |
| "Crie a copy da tela de resultado do nivelamento" | **DEPENDÊNCIA** (`36` T-06.1 define) → se liberado: UX writing → `better-writing` → Humanizer no corpo | Ogilvy, copywriting |
| "Escreva uma fala nova da Foca para marco de 50 dias" | fala da Foca → `copy/04` §2 | Humanizer, better-writing |
| "Escreva a headline da landing" | marketing → `ogilvy-copywriting` → `copywriting` → `copy-editing` → Humanizer | better-writing |
| "Melhore a explicação da questão 12" | conteúdo pedagógico → `copy/05` → revisão factual | toda skill de copy |
| "O tutor está muito formal" | Foca IA → `copy/04` → L2 | Humanizer no prompt |
| "Revise toda a copy do app" | auditoria (§U) → `better-writing` (formato de revisão) | reescrever sem plano aprovado |
| "Qual a nossa proposta de valor?" | posicionamento → `copy/01` §5 (ler, sem skill) | — |

---

## R. Humanizer / Stop Slop Strategy

| Critério | Humanizer 3.0.0 (instalado) | Stop Slop 2.0.0 (bora) |
|---|---|---|
| Objetivo | Reescrever texto com cara de IA sem mudar o que ele diz | Eliminar padrões de escrita de IA da prosa |
| Método | 25 padrões ordenados por força; §1–§5 agem numa ocorrência, os "fracos sozinhos" só em conjunto; seção "quando não agir" | Regras absolutas + listas de frases + nota 1–10 em 5 dimensões (< 35/50 = revisar) |
| Voz do autor | A amostra do autor sobrepõe as regras, inclusive a de travessão | Não considera amostra; "no em dashes at all" |
| Fatos | Passo explícito: checar fato, número, citação adicionados ou perdidos | Não tem |
| Riscos no Foca | Listas de palavras em inglês (regra do Foca: em pt-BR só padrões estruturais) | Corta todo advérbio ("só", "já", "ainda"), toda passiva ("Resposta registrada."), toda lista de três, frase que começa com "Como/Quando/Por que" — quebra microcopy correta e contradiz o `20` §7.1 |
| Melhor contexto | Prosa de marketing, onboarding, doc para humanos | Ensaio/post em inglês de um autor que quer estilo seco |

**Decisão:** o Foca mantém **um** revisor anti-artificialidade: o Humanizer. O Stop Slop não é instalado. Nada dele entra como regra; os dois padrões que ele nomeia bem ("agência falsa" — objeto fazendo ação de pessoa; "narrador de longe") entram no checklist pt-BR de `02-voz-e-tom.md` §4 com exemplo do Foca, sem citar a skill como dependência.

**Pipeline de escrita resultante:**

```text
Marketing ........ ogilvy-copywriting → copywriting → copy-editing → Humanizer → teste de voz → checagem de UI/comprimento
UX writing ....... better-writing (escreve) → Humanizer (só corpo de 2+ frases) → better-writing (revisão sobre o diff)
Microcopy ........ padrão do guia → teste de voz
Foca (voz.ts) .... copy/04 → teste da Foca
Tutor ............ copy/04 → L2
Pedagógico ....... sem skill de copy → revisão factual
```

Regra do Humanizer que continua (já no `SKILLS.md` §L): amostra do autor = copy aprovada do `21` §2; o `20` §7.1 prevalece; é checklist editorial, não detector.

---

## S. SDD Updates

| Arquivo | Mudança | Fase | Tipo de edição |
|---|---|---|---|
| `docs/ai/SKILLS.md` | §1 tabela: linhas `Q Better Writing` e `R Ogilvy Copywriting`; total de tokens; novas seções `## Q.`/`## R.` no formato existente (Source · Installation method · Installed location · Version/commit · Purpose · Use when · Do not use · Related · Overlap · Priority) **mais** os campos que o formato não tem: Inputs · Outputs · Dependencies · Local modifications · Update · Examples (Foca); `## K.` acrescentar: "`copywriting`/`copy-editing` são as versões canônicas; as do boraoztunc foram recusadas (ver 'Avaliadas e não instaladas')"; `## L.` acrescentar: comparação com Stop Slop (resumo de §R) e o novo papel (só 2+ frases); nova seção `## Avaliadas e não instaladas — boraoztunc/skills (AAAA-MM-DD)` com a tabela de §P; "Como atualizar": linha para as skills do bora | C1/C2 | Edit por âncora |
| `docs/ai/SKILL-ROUTING.md` | §1 nomes (acrescentar `better-writing`, `ogilvy-copywriting` às locais sem prefixo); §2 substituir `copy do app` e `marketing / growth` pelas classes de §Q.1 (manter `docs`); novo §2.1 (níveis §Q.2, orçamento §Q.3, §Q.4); §3 matriz: linhas Better Writing e Ogilvy; §4 substituir a linha "Copy"; §5 tabela de tokens (locais: 6→8); §7 casos de §Q.5 | C2 | Edit por âncora |
| `.claude/skills-registry.json` | `updated`; 2 entradas em `skills[]` (tipo `local-skill`, campos como `web-design-guidelines`: `source`, `installMethod`, `commit`, `location`, `skills`, `category: "writing"`, `role`, `alwaysOnTokens`, `triggers`, `doNotUse`, `overlaps`, mais `upstream` e `license`); `declined[]` com as recusas de §P (agrupadas como no padrão existente); `routes[]`: substituir `app-copy` por `microcopy`/`ux-writing`/`foca-voice`/`foca-ai`/`pedagogical`, atualizar `marketing`, acrescentar `positioning`; `contextFiles`: acrescentar `copy: "docs/COPY.md"` | C1/C2 | Edit com JSON válido; conferir com `node -e "require('./.claude/skills-registry.json')"` |
| `skills-lock.json` | Entradas das 2 skills, se o CLI `skills` as gravar; se a instalação for manual (fallback), **não** inventar hash — registrar no `39` | C1 | automático |
| `docs/ai/SDD-WORKFLOW.md` | §3 etapa 2: "Produto/design só se…" → acrescentar "copy: `docs/COPY.md` (nível de leitura pelo tamanho da tarefa)"; etapa 9: "Copy nova → inventário `21` e, se criar termo, glossário `copy/03` §3"; §8 regra rápida sobre skills de escrita | C7 | Edit |
| `.claude/skills/foca-sdd/SKILL.md` | §3 linha "Copy:" → "Copy: `docs/COPY.md` (Quick Context + roteamento de escrita); norma `20` §7.1; strings em `copy.ts` + inventário `21`"; §2: citar `SKILL-ROUTING.md` §2.1 para escrita | C7 | Edit (skill própria, não vendorizada) |
| `docs/README.md` | Linhas da tabela "Os arquivos" para `38`, `39`, `COPY.md`, `copy/`; linha do `15` passa a dizer "histórico de arquétipo; para escrever, ver `COPY.md`"; bloco curto "Sistema de copy (AAAA-MM-DD)" abaixo de "Agentes e skills" | C7 | Edit — **arquivo também editado pelo `36` T-10.3** (§V) |
| `docs/PRODUCT.md` | Brand Commitments: uma linha no topo da seção apontando `docs/COPY.md` como guia operacional (sem apagar o resumo); Positioning: nota "frase em revisão — ver `copy/01` §5 (D-1)" | C7 | Edit — **DEPENDÊNCIA DO PLANO PRINCIPAL** (`36` T-10.3 edita o mesmo arquivo) |
| `docs/DESIGN.md` L148–149 | Acrescentar "guia: `docs/COPY.md`" na linha "Copy" | C7 | Edit — idem |
| `.agents/product-marketing.md` | Uma linha no aviso inicial: voz, promessas e marketing em `docs/COPY.md` e `docs/copy/06-marketing.md` | C7 | Edit |
| `docs/21` | Uma linha no topo: "Regras de escrita: `docs/COPY.md`. Este arquivo continua sendo o inventário." | C7 | Edit — **só o topo**; linhas de inventário são do `36` |
| `docs/15`, `docs/09`, `docs/13`, `docs/design/brand/foca-rabisco-branding.md` | Nota de precedência de uma linha no topo (§D.3) | C7 | Edit |
| `docs/20` §7.1 | Uma linha ao fim do §7.1: "Operacionalizado em `docs/COPY.md` (`38`). Esta seção continua sendo a norma de origem." | C7 | Edit |

---

## T. CLAUDE.md Updates

Duas edições pequenas, por âncora, **sem tocar no topo** (o `36` T-10.3 reescreve os blocos de plano vigente).

1. No parágrafo "Workflow de agente — SDD primeiro, skills depois", acrescentar uma frase ao fim: "Tarefa com texto que o usuário lê (copy, microcopy, fala da Foca, tutor, marketing): ler `docs/COPY.md` no nível de leitura do tamanho da tarefa e rotear as skills de escrita por `docs/ai/SKILL-ROUTING.md` §2.1."
2. Nova seção curta, logo depois de "## Design system — aplicar com fidelidade":

```markdown
## Copy e escrita

Fonte: [docs/COPY.md](docs/COPY.md) (contexto rápido + índice de `docs/copy/`); norma de origem `docs/20` §7.1. Antes de mudar qualquer string que o aluno lê, ler o `COPY.md`; strings funcionais continuam em `src/lib/copy.ts` com linha no inventário `docs/21`, falas da Foca em `src/lib/voz.ts`, persona do tutor em `src/lib/tutor-prompt.ts` (mudança ali é revisão L2).

- Skills de escrita só pelo roteamento de `docs/ai/SKILL-ROUTING.md` §2.1. Skill que não traz nada além do guia não roda: rótulo de botão não passa por skill.
- Nenhuma skill de copy altera conteúdo pedagógico (enunciado, alternativa, gabarito, fórmula, dado, citação, texto de questão oficial) — `docs/copy/05-conteudo-pedagogico.md`.
- Nenhuma copy promete o que o produto não demonstra (aprovação, nota, retenção, número de alunos) — `docs/PRODUCT.md` → Evidence on Hand.
```

Tamanho-alvo: ≤ 10 linhas no total. O `CLAUDE.md` não duplica regras do guia.

`AGENTS.md`: uma linha "Copy e escrita: `docs/COPY.md`." (para Codex e outros agentes).

---

## U. Copy Audit Strategy

A auditoria é **só leitura** do código e gera um relatório. Aplicar as mudanças é outro plano (`docs/40-plano-migracao-copy.md` ou o número livre na época), escrito depois do `36` Fase 10 e aprovado pelo usuário.

### U.1 Ordem (prioridade do usuário, mapeada para arquivos reais)

| # | Área | Arquivos | Observação |
|---|---|---|---|
| 1 | Onboarding | `src/routes/welcome.tsx`, `index.tsx`, `quiz.tsx` (+ passos em `src/components/onboarding/*` — conferir), `aha.tsx`, `COPY.onboarding` | `quiz.tsx`/seleção de curso: **DEPENDÊNCIA** (`36` T-09.*) |
| 2 | Nivelamento | `nivelamento.tsx`, `PlacementOffer.tsx`, `COPY.nivelamento` | Tela de resultado: **DEPENDÊNCIA** (`36` T-06.1) |
| 3 | Diagnóstico | `progress.tsx`, `SkillRow.tsx`, `lib/adaptive/display.ts` | "Dominado"/"Domínio" |
| 4 | Home | `trilha.tsx`, `SessionCard.tsx`, `TrailHeader.tsx`, `COPY.jornada`, `COPY.trilha` | Card: **DEPENDÊNCIA** (`36` T-06.2) |
| 5 | Trilha | `JourneyPath`, `PathNode`, capítulo/carimbo | — |
| 6 | Lições | `LessonPlayer.tsx`, passos, `COPY.licao` | — |
| 7 | Feedback certo/errado | `FeedbackSheet.tsx`, `voz.acertou/errou/naosei` | §C.3 |
| 8 | Conclusão | `ChapterCompleteSheet`, `voz.fimbom/fimruim` | §C.3 |
| 9 | Streak | `voz.marco`, `TrailHeader`, `aha.tsx` | D-3 |
| 10 | Foca IA | `COPY.tutor`, `tutor-prompt.ts` (só leitura), `localFallback` | — |
| 11 | Erros | `__root.tsx` ErrorComponent, `TrailError`, `offline.tsx`, `EmptyState.tsx`, `voz.vazio/404` | Faixas de persistência: **DEPENDÊNCIA** (`36` Fase 5) |
| 12 | Marketing | `brand.ts` (**do `36`**), `docs/design/brand/*.html` (histórico Flash Test), `docs/13` | Só registrar |

Fora: `src/content/**`, `src/data/questions.ts`, `docs/_arquivo-abroad/`.

### U.2 Método

1. Extrair as strings visíveis por área (`copy.ts`, `voz.ts`, JSX literal, `aria-label`, `title`, `placeholder`). Comando de partida: `rg -n --type-add 'tsx:*.tsx' -t tsx -t ts '"[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^"]{2,}"' src/routes src/components src/lib/copy.ts src/lib/voz.ts` e leitura manual (o grep não pega tudo).
2. Para cada string: aplicar o teste de voz (§I.4), o padrão do componente (`copy/03` §2), o glossário (`copy/03` §3) e a matriz de tom (`copy/02` §2).
3. `better-writing` no modo revisão por área (uma chamada por área, não por string). Humanizer **só** nas strings com 2+ frases que ficarem com classificação "artificial".
4. Classificar com **um** rótulo principal: `excelente` · `manter` · `ajustar` · `reescrever` · `consolidar` · `remover`; e **zero ou mais** marcadores de problema: `inconsistente` · `artificial` · `longa` · `confusa` · `infantil` · `cobrança` · `promessa-sem-lastro` · `termo-fora-do-glossário`.
5. Registrar em `docs/copy/auditoria-AAAA-MM-DD.md`, tabela por área: ID · `arquivo:linha` · chave (`COPY.x.y`/`VOZ.slot[i]`/literal) · texto atual · rótulo · marcadores · regra violada (seção do guia) · proposta (**opcional**, marcada "proposta") · risco · dono (`livre` / `DEPENDÊNCIA 36 T-xx`) · status no `21`.
6. Fechar com: contagem por rótulo, lista de decisões de glossário que a migração exige, e a lista de testes de `brand-voice.test.ts` a acrescentar (nomes só, sem código).

### U.3 Critério de "string revisada"

Só vira "revisado" no `21` quando a migração aplicar a mudança e houver evidência (teste ou leitura registrada). A auditoria **não** muda status no `21`.

---

## V. Parallel Execution Safety

### V.1 Quem é dono de quê

| Área | Dono | Este plano pode |
|---|---|---|
| `src/**`, `tests/**`, `content-pipeline/**`, `scripts/**`, `public/**` | `36` | **nada** (só leitura) |
| `docs/21` linhas de inventário | `36` T-10.3 | só a linha de topo (§S) |
| `CLAUDE.md` blocos "Plano vigente" e "O produto em uma frase" | `36` T-10.3 | nada nesses blocos; §T só acrescenta |
| `docs/README.md` bloco de plano vigente e linhas L48/L54/L79/L109 | `36` T-10.3 | só acrescentar linhas/bloco próprios |
| `docs/PRODUCT.md`, `docs/DESIGN.md` | `36` T-10.3 | uma linha cada, **depois** do `36` T-10.3 ou com merge semântico |
| `docs/18`, `27`, `30`, `31`, `32`, `33`, `34` | `36` | nada |
| `docs/ai/*`, `.claude/skills-registry.json`, `skills-lock.json`, `.claude/skills/*` | este plano (o `36` não os edita — conferido no `36` §I) | editar |
| `docs/COPY.md`, `docs/copy/*`, `docs/38`, `docs/39` | este plano | criar/editar |
| `docs/14`, `15`, `09`, `13`, `20`, `brand/foca-rabisco-branding.md`, `.agents/product-marketing.md`, `AGENTS.md`, `.claude/skills/foca-sdd/SKILL.md` | este plano | nota de uma linha / edição curta |

### V.2 Protocolo de edição de arquivo compartilhado

1. `git diff --stat` e `git status --short` antes de começar a fase; anotar no `39` o que já estava modificado por outra sessão (hoje: `docs/historico/fundacao/09-branding.md` modificado fora desta sessão, `Claude outputs/` não rastreado — **não tocar**, ver `37` D-6).
2. Reler o arquivo inteiro (ou a seção) imediatamente antes do `Edit`.
3. `Edit` com âncora curta e única; nunca `Write` sobre arquivo existente.
4. `git diff -- <arquivo>` depois: o diff só pode conter as linhas deste plano. Se aparecer mudança alheia no mesmo trecho, parar e registrar no `39`.
5. Se o `Edit` falhar por âncora inexistente, o arquivo mudou: reler, reaplicar a **intenção**, registrar.

### V.3 Dependências do plano principal (lista consolidada)

| ID | O que depende | De qual tarefa do `36` | Regra |
|---|---|---|---|
| DEP-1 | Nota em `PRODUCT.md`/`DESIGN.md` | T-10.3 | Fazer depois de T-10.3 ✅ no `37`; antes disso, deixar pendente no `39` |
| DEP-2 | Tagline/description (`brand.ts`) e qualquer frase de posicionamento pública | T-08.7 (RU-20) | Não propor troca de `brand.ts`; a D-1 pode reaproveitar RU-20 |
| DEP-3 | Copy da tela de resultado do nivelamento | T-06.1 (RU-10, §F.5) | O guia cita o contrato do `36`, não cria outro |
| DEP-4 | Card da Home ("Depois:", motivo) | T-06.2 (RU-12) | idem |
| DEP-5 | Mensagens de carregamento/erro/persistência | T-02.2, T-05.1, T-05.3, T-05.4 (RU-1…RU-6) | O guia usa esses textos como exemplo canônico; não altera |
| DEP-6 | Seleção de curso e onboarding | T-09.* | Auditoria dessa área só depois |
| DEP-7 | Promessa "o nivelamento muda sua trilha" | T-03.* (C1/B3) | Não prometer em marketing antes de T-03 ✅ |
| DEP-8 | Rubrica de revisão pedagógica | T-07.1…T-07.5 (`36` §G.6) | `copy/05` aponta para ela |
| DEP-9 | Linhas de inventário do `21` | T-10.3 | Não editar linhas |
| DEP-10 | Migração de strings (plano futuro) | `36` Fase 10 ✅ | Só escrever o plano de migração depois |

---

## W. Implementation Phases

### W.0 Decisões abertas (do usuário; o executor não decide)

| ID | Decisão | Recomendação do plano | Onde entra |
|---|---|---|---|
| D-1 | Frase de posicionamento | Escolher entre as 3 opções de §H.2 (produzidas com `ogilvy-copywriting`) ou manter a atual | `copy/01` §5, `PRODUCT.md` (DEP-1) |
| D-2 | Imperativo no corpo: "Tente"/"Confira" ou "Tenta"/"Confere" | "Tente" (é o exemplo literal do `20` §7.1 e soa correto sem ficar formal); botões continuam no infinitivo | `copy/02` §1, `copy/03` §2 |
| D-3 | Palavra visível para streak | "sequência" | glossário |
| D-4 | "Aula" some da UI em favor de "lição"/"atividade"? | Sim | glossário |
| D-5 | O humor da "foca na pedra" continua no tutor e em `voz.ts`? | Sim, com as regras de §L (uma vez por sessão, nunca sobre o aluno) | `copy/04` |

**Decisões tomadas em 28/09/2026:** D-1 **frase atual mantida por enquanto** (usuário) · D-2 **informal** ("Tenta", "Confere"; a recomendação deste plano era "Tente", trocada porque o código e o texto do `36` RU-3 já são informais) · D-3 **"sequência"** · D-4 **"aula" e "checkpoint" saem da interface** · D-5 **o humor da pedra continua**. D-2 a D-5 foram delegadas pelo usuário à IA. Decisões novas surgidas na auditoria, do usuário: P-1 **telas `offline` e `premium` marcadas como demonstração**; P-2 **fim de aula com duas famílias de fala, ambas sem julgamento**. Registro em `docs/COPY.md` e `docs/39` §4.

### Fase C0 — Linha de base e registro

- **Objetivo:** registrar o estado antes de mexer; criar o `39`.
- **Ler:** este plano; topo do `37`; `git status --short`; `docs/ai/SKILLS.md` §1.
- **Criar:** `docs/historico/iniciativas/38-39-copy/39-registro-execucao-copy.md` (cabeçalho: plano normativo `38`, data, commit base, executor; seções: 1 Linha de base · 2 Divergências · 3 Por fase · 4 Decisões D-1…D-5 · 5 Pendências DEP).
- **T-C0.1** Criar o `39`. **T-C0.2** Rodar e colar a saída real: `git rev-parse HEAD`, `git status --short`, `node scripts/validate-skills.mjs` (esperado: sem `FAIL`), estado do `36` (última tarefa ✅ do `37`).
- **Skills:** nenhuma.
- **Risco:** baixo. **Validação:** `39` existe com saídas reais. **Concluída quando:** linha de base colada.
- **Não alterar:** nada além do `39`.

### Fase C1 — Instalar `better-writing` e `ogilvy-copywriting`

- **Objetivo:** duas skills locais instaladas, auditadas e validadas.
- **Ler:** `SKILLS.md` §F/§G (formato), "Segurança das próprias skills", "Como atualizar"; `skills-registry.json` entrada `web-design-guidelines` (modelo); `scripts/validate-skills.mjs` (o que ele exige de skill local).
- **T-C1.1 Auditoria pré-instalação.** Clonar `https://github.com/boraoztunc/skills` **fora do repo** (scratchpad), `git -C <clone> rev-parse HEAD`. Se diferente de `645553c…`, fazer `git diff 645553c..HEAD -- better-writing ogilvy` (exige clone não raso) e ler; se houver mudança, registrar no `39` e decidir pela versão lida. Listar os arquivos das duas pastas: esperado `better-writing/{SKILL.md,review-output.md}` e `ogilvy/SKILL.md`; nenhum script, nenhum `package.json`, nenhum hook. Qualquer arquivo executável → parar e registrar.
- **T-C1.2 Instalar.** Método preferido (mesmo das outras skills locais):
  `DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@1.7.0 add https://github.com/boraoztunc/skills --skill better-writing --skill ogilvy-copywriting -a claude-code --copy -y`
  (o CLI casa pelo `name` do frontmatter; a skill Ogilvy se chama `ogilvy-copywriting`). Conferir que as pastas ficaram em `.claude/skills/better-writing/` e `.claude/skills/ogilvy-copywriting/` e que `skills-lock.json` ganhou as duas entradas. **Fallback** se o CLI falhar ou gravar em outro lugar: cópia literal do clone no commit fixado (método do `repo-security-review`), pasta `ogilvy-copywriting/` para o Ogilvy, **sem** entrada inventada em `skills-lock.json`; registrar no `39`.
- **T-C1.3 Verificar integridade.** `diff -r` entre o clone e as pastas instaladas: nenhuma diferença de conteúdo (o CLI pode acrescentar metadados — registrar quais). Não editar os `SKILL.md` (§V — skills vendorizadas).
- **T-C1.4 Licença e origem.** Se a pasta não tiver licença, **não** criar arquivo dentro da skill: registrar no `SKILLS.md` (C2) licença, autor e upstream (`jakubkrehel/skills` para `better-writing`; compilação do bora para Ogilvy).
- **T-C1.5 Registry.** Acrescentar as 2 entradas em `skills[]` (campos de §S) e rodar `node scripts/validate-skills.mjs` — esperado: `ok` para as duas, sem `FAIL`. Estimar `alwaysOnTokens` pelo tamanho da `description` ÷ 4 (≈ 140 e ≈ 110) e registrar como estimativa.
- **Skills usadas:** nenhuma (instalação é processo, não escrita).
- **Dependências:** C0.
- **Risco:** médio-baixo (CLI de terceiros; telemetria desligada; sem hooks).
- **Validação:** `validate-skills.mjs` sem FAIL; `git status` mostra só `.claude/skills/better-writing/`, `.claude/skills/ogilvy-copywriting/`, `skills-lock.json`, `.claude/skills-registry.json`.
- **Concluída quando:** as duas skills aparecem na lista de skills de uma sessão nova (conferir; se não aparecerem nesta sessão, registrar — não é falha).
- **Não alterar:** outras pastas de `.claude/skills/`, `.claude/settings.json` (skills locais não precisam de `enabledPlugins`), nenhum plugin.

### Fase C2 — Registro e roteamento no SDD

- **Objetivo:** uma fonte confiável de skills, com as novas, as recusadas e o roteamento de escrita.
- **Ler:** `SKILLS.md` inteiro; `SKILL-ROUTING.md` inteiro; §M–§R deste plano.
- **T-C2.1** `SKILLS.md`: tudo de §S linha 1. As seções novas seguem o formato existente e acrescentam Inputs/Outputs/Dependencies/Local modifications/Update/Examples (§O). Método de atualização das skills do bora: repetir T-C1.1–T-C1.3 com o novo commit (o CLI `skills update -p` também serve se tiver gravado o lock). "Local modifications": nenhuma — adaptações ao Foca ficam no `SKILLS.md`, nunca no arquivo da skill.
- **T-C2.2** `SKILL-ROUTING.md`: tudo de §S linha 2 (§Q inteiro).
- **T-C2.3** `skills-registry.json`: `declined[]` e `routes[]` (§S linha 3). JSON válido.
- **Skills usadas:** nenhuma. (Não usar Humanizer em doc de roteamento: é especificação.)
- **Risco:** médio — `SKILL-ROUTING.md` é lido por toda sessão; erro de rota propaga.
- **Validação:** `node scripts/validate-skills.mjs` sem FAIL; `node -e "JSON.parse(require('fs').readFileSync('.claude/skills-registry.json','utf8'))"`; links relativos novos existem (`rg -o '\]\(([^)]+)\)' docs/ai/*.md` e conferir); os 9 casos de §Q.5 resolvem para uma única rota ao ler a tabela.
- **Concluída quando:** cada skill de escrita (Humanizer, better-writing, ogilvy-copywriting, copywriting, copy-editing) tem Use when / Do not use / nível / ordem; cada skill recusada de §P está listada com motivo.
- **Não alterar:** seções de outras skills além de K e L; as classes não relacionadas a escrita.

### Fase C3 — Estratégia (`docs/copy/01-estrategia.md`)

- **Objetivo:** persona operacional, estados, JTBD, problema→mecanismo→resultado, proposta de valor e opções de posicionamento.
- **Ler:** `14` inteiro; `08` §0, §1, §10; `PRODUCT.md`; `.agents/product-marketing.md`; `30` §14 (motivos), §12 (nivelamento), §16.1 ("Não sei"); `32` e `37` (o que existe); `36` §F.4 (RU-20); §E–§H deste plano.
- **Criar:** `docs/copy/01-estrategia.md` com seções: 1 Persona (resumo com fonte) · 2 Estados do aluno (tabela §E.3, com o sinal real do código ou `[sem sinal]`) · 3 JTBD (§F) · 4 Problema → Mecanismo → Resultado (§G, coluna Estado preenchida com evidência) · 5 Proposta de valor e posicionamento (§H; D-1 como `PROPOSTA`) · 6 O que não prometer.
- **T-C3.1** Conferir cada mecanismo de §G no código/registros e preencher "Estado" (ex.: `store.ts: streakFreezes`, `32` F13). **T-C3.2** Escrever §1–§4 e §6. **T-C3.3** Rodar `ogilvy-copywriting` **só** nas perguntas diagnósticas 1–4 e 6 para gerar as 3 opções da D-1; colar as respostas resumidas no `39`. **T-C3.4** `marketing-skills:copy-editing` (leitura pelo cache, §Q.4) só nas passadas "Prove It" e "Especificidade" sobre §5.
- **Skills:** `ogilvy-copywriting` (estratégia de posicionamento — é exatamente a função dela); `copy-editing` (checar lastro da promessa). Humanizer: não (documento de referência lido por agentes; frases já seguem §I.6).
- **Dependências:** C2 (para as skills estarem registradas). DEP-2, DEP-7.
- **Risco:** alto de "inventar" — mitigação: toda linha com fonte; `[lacuna]` onde não houver.
- **Validação:** `rg -n "aprova|garant|nota|%|alunos" docs/copy/01-estrategia.md` só acha ocorrências na seção "O que não prometer" ou em citação marcada; cada linha de §4 tem evidência.
- **Concluída quando:** as 6 seções existem, D-1 está como `PROPOSTA — aguarda D-1`, e nenhum mecanismo sem evidência.
- **Não alterar:** `14`, `08`, `PRODUCT.md` (ainda).

### Fase C4 — Voz e tom (`docs/copy/02-voz-e-tom.md`)

- **Objetivo:** voz com atributos, matriz de tom, regras de humor/emoji/exclamação/tamanho/registro, padrões de texto artificial em pt-BR.
- **Ler:** `20` §7.1 (copiar a tabela e os tamanhos literalmente, com citação); `15` §2, §3, §8; `21` §2 (amostra aprovada); `copy.ts` e `voz.ts` inteiros; §I–§J deste plano; §R.
- **Criar:** `docs/copy/02-voz-e-tom.md`: 1 Voz (atributos §I.1, com SIM/NÃO/limite tirados de strings reais do `21` §2 sempre que possível) · 2 Matriz de tom (§J, coluna "string atual" preenchida) · 3 Humor, emoji, exclamação, tamanho, registro (§I.2–I.3, D-2 como `PROPOSTA`) · 4 Padrões de texto artificial (§I.6 + "agência falsa" e "narrador de longe", com a ressalva do `20` §7.1) · 5 Teste de voz (§I.4).
- **Skills:** nenhuma para escrever o guia (o guia é a régua; passar a régua por uma skill genérica em inglês arrisca trocar a voz do Foca pela voz da skill). Autorrevisão: o próprio documento não pode conter nenhum padrão do §4 dele — conferir com `rg -n "Não é .*\. É |jornada|incrível|cada passo" docs/copy/02-voz-e-tom.md` (só dentro de exemplos "NÃO").
- **Dependências:** C3 (persona e estados).
- **Risco:** médio — contradizer o `20` §7.1. Mitigação: tabela do `20` copiada literalmente e marcada como citação.
- **Validação:** todas as linhas de contexto de §J presentes; cada atributo tem SIM, NÃO e limite; exemplos citam chave de `copy.ts`/`voz.ts` quando existem.
- **Concluída quando:** acima + nenhuma regra contradiz o `20` §7.1 (listar no `39` as 3–5 regras novas que **estendem** o `20`).
- **Não alterar:** `20`, `15` (nota de precedência só na C7).

### Fase C5 — UX writing, microcopy e glossário (`docs/copy/03-ux-writing.md`)

- **Objetivo:** padrões por componente e glossário de produto.
- **Ler:** `copy.ts` inteiro; `21` §2; `better-writing/SKILL.md` e `review-output.md` (agora instalados); §K deste plano; §C.4 (inconsistências).
- **Criar:** `docs/copy/03-ux-writing.md`: 1 Prioridades (§K.1) · 2 Padrões por componente (§K.2–K.3; tabela com chave canônica real) · 3 Glossário (§K.4; D-3/D-4 como `PROPOSTA`; id no código nunca renomeado) · 4 Manutenção (§K.5).
- **T-C5.1** Montar a tabela de padrões a partir de `copy.ts` (cada linha cita a chave real ou "não existe"). **T-C5.2** Glossário: para cada termo, contar ocorrências visíveis (`rg`) e marcar status. **T-C5.3** Rodar `better-writing` sobre o **próprio** documento de padrões (os exemplos "canônico" e "anti-padrão") para pegar exemplo ruim de erro/confirmação; aplicar só o que não conflita com o `20` §7.1; registrar no `39`.
- **Skills:** `better-writing` (REQUIRED aqui: é a especialista em padrões de interface).
- **Dependências:** C1 (skill instalada), C4. DEP-3…DEP-5 (exemplos citam RU-* do `36` como canônicos).
- **Risco:** médio — virar lista genérica traduzida. Mitigação: toda linha ancorada numa string ou num estado real do Foca.
- **Validação:** cada padrão obrigatório de §K.3 presente; cada termo obrigatório de §K.4 no glossário com status.
- **Concluída quando:** acima.
- **Não alterar:** `copy.ts` (nenhuma string muda aqui).

### Fase C6 — Foca IA, conteúdo pedagógico e marketing

- **Objetivo:** `docs/copy/04-foca-ia.md`, `05-conteudo-pedagogico.md`, `06-marketing.md`.
- **Ler:** `tutor-prompt.ts` (só leitura, persona L75+ e regras), `voz.ts`, `15` §4–§6, `20` §7.1 (linha Tutor); `34` (questões oficiais), `36` §G.6 (rubrica), `21` §4; `PRODUCT.md` → Evidence on Hand e Métricas, `.agents/product-marketing.md`, `08` §10–§11, `13` (só como histórico); §L, §M deste plano.
- **T-C6.1 `04-foca-ia.md`:** as três camadas e todas as seções de §L; D-5 como `PROPOSTA`. Citar trechos do prompt atual em vez de reescrevê-lo; divergência prompt × guia → listar em "Ajustes sugeridos ao prompt (não aplicados — revisão L2)".
- **T-C6.2 `05-conteudo-pedagogico.md`** (curto, ≤ 60 linhas): o que é conteúdo pedagógico (lista de caminhos: `src/content/**`, `src/data/questions.ts`, trilhas de redação, `explicacao`/`teach`/`recap` de lição); o que nenhuma skill de copy pode alterar (enunciado, alternativa, gabarito, fórmula, dado, conceito, definição, citação, texto histórico, texto de questão oficial e sua atribuição — `34`); o que pode ser ajustado por texto de interface em volta (rótulos do player, títulos de passo) — com `better-writing`; revisão de conteúdo = rubrica do `36` §G.6 (DEP-8); "humanizar nunca troca precisão".
- **T-C6.3 `06-marketing.md`:** superfícies reais (telas públicas `welcome`/`index`, `<title>`/OG via `brand.ts` — DEP-2 —, LP do link da bio em `docs/design/brand/` como histórico) e futuras (landing, loja de apps — não existe, TODO —, redes, campanha); energia permitida (mais verbo e benefício que a UI, mesma honestidade); promessas permitidas (§G coluna 3) e proibidas (§G "Proibido prometer" + Evidence on Hand); preço: não existe, não escrever; pipeline de skills (§Q.3 linha landing); checklist de publicação.
- **Skills:** nenhuma para escrever os três (são regras). `ogilvy-copywriting` **não** roda aqui. Humanizer: não.
- **Dependências:** C4, C5. DEP-2, DEP-8.
- **Risco:** `04` virar reescrita do prompt → proibido nesta fase.
- **Validação:** `git diff --stat -- src/` vazio; `05` lista os caminhos reais (conferir com `ls`); `06` não contém nenhum número/depoimento/preço como fato.
- **Concluída quando:** os três arquivos existem e passam na validação.
- **Não alterar:** `tutor-prompt.ts`, `voz.ts`, `brand.ts`, conteúdo.

### Fase C7 — Entrada, Quick Context e regras globais

- **Objetivo:** `docs/COPY.md` e todas as edições de §S/§T.
- **Ler:** os seis `docs/copy/*` prontos; `CLAUDE.md`, `AGENTS.md`, `00-README.md`, `SDD-WORKFLOW.md`, `foca-sdd/SKILL.md`, `21` (topo), `15`/`09`/`13`/`20` §7.1/`foca-rabisco-branding.md` (topos); `37` (T-10.3 já rodou?).
- **T-C7.1 `docs/COPY.md`** (≤ 130 linhas), nesta ordem:
  1. Para quem é / o que é / hierarquia (§D.2)
  2. **Quick Context for AI Agents**: persona em 3 linhas; voz em 5 bullets (atributos); 10 proibições mais importantes (cobrança, julgamento da pessoa, promessa sem lastro, "Não é X. É Y.", emoji em controle/erro, exclamação em série, "domina" com pouca evidência, humor em erro/explicação, termo fora do glossário, skill de copy em conteúdo pedagógico); tamanhos-alvo (`20` §7.1); glossário mínimo (10 termos); roteador de skills em 6 linhas (§Q.3, com link para o `SKILL-ROUTING` §2.1); onde a string mora (`copy.ts`/`voz.ts`/`tutor-prompt.ts`/`brand.ts`) e o inventário `21`
  3. Níveis de leitura por tamanho de tarefa (§Q.3 colunas "Tamanho" e "Ler")
  4. Índice de `docs/copy/*` com uma linha cada
  5. Checklist de validação antes de concluir (§X.2)
- **T-C7.2** `CLAUDE.md` e `AGENTS.md` (§T). **T-C7.3** `SDD-WORKFLOW.md`, `foca-sdd/SKILL.md`, `.agents/product-marketing.md`, notas de precedência em `15`, `09`, `13`, `20` §7.1, `foca-rabisco-branding.md`, topo do `21` (§S). **T-C7.4** `00-README.md` (§S; protocolo §V.2). **T-C7.5** `PRODUCT.md`/`DESIGN.md` **só se** o `37` mostrar T-10.3 ✅; senão, deixar como DEP-1 pendente no `39`.
- **Skills:** nenhuma. (Humanizer opcional no parágrafo "Para quem é" do `COPY.md` — é texto para humanos; nunca nas tabelas.)
- **Dependências:** C2–C6; DEP-1, DEP-9.
- **Risco:** alto de conflito com o `36` em `CLAUDE.md`/`00-README.md`/`PRODUCT.md`. Mitigação: §V.2 à risca.
- **Validação:** `wc -l docs/COPY.md` ≤ 130; `git diff -- CLAUDE.md` ≤ ~12 linhas adicionadas e 0 removidas fora da frase acrescentada; todos os links novos resolvem.
- **Concluída quando:** acima + o `COPY.md` responde às 17 perguntas de §X.3 com link.
- **Não alterar:** blocos de plano vigente do `CLAUDE.md`/`00-README.md`; linhas de inventário do `21`.

### Fase C8 — Auditoria de copy (relatório, sem aplicar)

- **Objetivo:** `docs/copy/auditoria-AAAA-MM-DD.md` conforme §U.
- **Ler:** `COPY.md` + `copy/02`, `copy/03`; arquivos da área em §U.1, um por vez.
- **T-C8.1…T-C8.12** Uma tarefa por área de §U.1, na ordem. Áreas com DEP ainda aberta: auditar o estado atual e marcar a linha como `DEPENDÊNCIA 36 T-xx — reauditar depois`.
- **T-C8.13** Consolidação (§U.2 passo 6) e lista de itens para o futuro plano de migração.
- **Skills:** `better-writing` em modo revisão, **uma chamada por área** (RECOMMENDED); Humanizer só em strings de 2+ frases marcadas `artificial` (OPTIONAL).
- **Dependências:** C7. Pode rodar com o `36` em andamento (só leitura), mas as áreas DEP ficam provisórias.
- **Risco:** o executor "consertar" strings durante a auditoria → proibido; `git diff --stat -- src/` precisa continuar vazio.
- **Validação:** cada área de §U.1 tem tabela ou "sem strings"; os achados de §C.3/§C.4 aparecem classificados.
- **Concluída quando:** relatório completo + consolidação.
- **Não alterar:** `src/**`, `docs/21`.

### Fase C9 — Verificação e fechamento

- **Objetivo:** provar cada critério de §Y com evidência.
- **T-C9.1** Rodar §X.1. **T-C9.2** Agente `spec-verifier` com `docs/historico/iniciativas/38-39-copy/38-plano-sistema-copy-e-skills.md` e os critérios CS-1…CS-20. **T-C9.3** Atualizar o `39` (tabela critério × evidência, o que ficou pendente por DEP, decisões D-1…D-5 ainda abertas) e a linha do `38`/`39` no `00-README.md`.
- **Skills:** `spec-verifier` (agente do repo).
- **Concluída quando:** todos os CS com evidência ou explicitamente pendentes por DEP/D-n.

---

## X. Validation

### X.1 Comandos (saída real colada no `39`)

| Checagem | Comando | Esperado |
|---|---|---|
| Skills | `node scripts/validate-skills.mjs` | sem `FAIL` |
| Registry | `node -e "JSON.parse(require('fs').readFileSync('.claude/skills-registry.json','utf8'))"` | sem erro |
| Nenhum código tocado | `git diff --stat -- src tests content-pipeline scripts public` | vazio |
| Escopo de arquivos | `git status --short` | só os arquivos listados em §S/§T, `docs/COPY.md`, `docs/copy/`, `docs/38`, `docs/39`, `.claude/skills/{better-writing,ogilvy-copywriting}/`, `skills-lock.json` (+ o que já estava sujo na linha de base) |
| Links | para cada `.md` novo/alterado: extrair `](caminho)` relativos e testar existência (script descartável no scratchpad) | nenhum link quebrado |
| Tamanho do Quick Context | `wc -l docs/COPY.md` | ≤ 130 |
| Nada de promessa sem lastro | `rg -n -i "aprovação garantida|você vai passar|garant|\d+ ?% (mais|de alunos)|milhares de alunos" docs/COPY.md docs/copy/` | só em seções "não prometer"/exemplos "NÃO" |
| Testes existentes intactos (sanidade) | `bun test tests/unit/brand-voice.test.ts` | verde (nenhum código mudou; confirma que nada quebrou por acidente) |

### X.2 Checklist de validação de copy (entra no `COPY.md`, para toda tarefa futura de copy)

1. Li o nível certo do `COPY.md` para o tamanho da tarefa. 2. O texto passa no teste de voz (§I.4). 3. Usa o termo do glossário. 4. Cabe no tamanho-alvo e na largura de 320 px (`narrow`). 5. Não promete o que o produto não demonstra. 6. Não toca conteúdo pedagógico. 7. Usei só as skills do roteamento, na ordem. 8. String nova está em `copy.ts` e no `21`.

### X.3 Teste de cobertura do sistema (o `COPY.md` precisa apontar resposta para cada uma)

Para quem o Foca fala? · Qual problema resolve? · Qual transformação oferece? · Como se diferencia? · Como deve falar? · Como não deve falar? · Como escrever erros? · CTAs? · Feedback? · Onboarding? · Marketing? · A Foca IA? · Quando usar humor? · Quando evitar humor? · Quando usar emoji? · Quanto texto? · Qual skill usar?

### X.4 Teste de roteamento

Os 9 casos de §Q.5, lidos contra a tabela final do `SKILL-ROUTING.md`, dão uma rota única e sem skill proibida. Registrar no `39` pedido → rota encontrada.

---

## Y. Definition of Done

| ID | Critério | Evidência exigida |
|---|---|---|
| CS-1 | Existe uma fonte central de copy | `docs/COPY.md` + `docs/copy/01…06` |
| CS-2 | Persona organizada, com estados do aluno ligados a sinais reais | `copy/01` §1–§2, cada estado com sinal ou `[sem sinal]` |
| CS-3 | Problema e solução claros, só com mecanismos existentes | `copy/01` §4 com coluna Estado preenchida |
| CS-4 | Posicionamento e proposta de valor documentados; frase pendente de D-1 marcada | `copy/01` §5 |
| CS-5 | Voz documentada com atributos, SIM/NÃO/limite, coerente com o `20` §7.1 | `copy/02` §1; lista de extensões no `39` |
| CS-6 | Matriz de tom com todos os contextos de §J | `copy/02` §2 |
| CS-7 | UX writing e padrões de microcopy com chaves reais | `copy/03` §1–§2 |
| CS-8 | Glossário com status e decisões pendentes | `copy/03` §3 |
| CS-9 | Foca IA com regras próprias, separada da voz do produto | `copy/04` |
| CS-10 | Conteúdo pedagógico protegido por regra explícita + roteamento `DO NOT USE` | `copy/05` + `SKILL-ROUTING` §2.1 |
| CS-11 | Marketing com promessas permitidas/proibidas | `copy/06` |
| CS-12 | Humanizer integrado com papel definido e comparação com Stop Slop | `SKILLS.md` §L + `SKILL-ROUTING` §2.1 |
| CS-13 | `better-writing` e `ogilvy-copywriting` instalados, auditados, com origem/commit/licença | `.claude/skills/*`, `SKILLS.md` §Q/§R, `validate-skills` ok |
| CS-14 | Nenhuma skill desnecessária instalada | `git status` de `.claude/skills/` mostra só as duas; `.claude/settings.json` inalterado |
| CS-15 | Registro com todas as skills de escrita e todas as recusadas do bora | `SKILLS.md` "Avaliadas e não instaladas" + `declined[]` |
| CS-16 | O SDD diz quando usar cada skill (níveis REQUIRED/RECOMMENDED/OPTIONAL/DO NOT USE e ordem) | `SKILL-ROUTING` §2.1 |
| CS-17 | `CLAUDE.md` obriga consultar o sistema de copy e aponta o roteamento | diff do `CLAUDE.md` |
| CS-18 | Mudança pequena não exige contexto excessivo | `COPY.md` ≤ 130 linhas com Quick Context e níveis de leitura |
| CS-19 | Nenhum arquivo de código, teste ou conteúdo alterado | `git diff --stat -- src tests content-pipeline scripts public` vazio |
| CS-20 | Auditoria de copy entregue sem aplicar mudanças | `docs/copy/auditoria-*.md`; `21` sem linhas novas deste plano |

---

# READY FOR SONNET — COPY SYSTEM + SKILLS

**Antes de tudo:** este plano está em rascunho. Só executar depois que o usuário aprovar (registrar a aprovação no topo do `38` e no `39`).

**Ordem exata das fases:** C0 → C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8 → C9. C8 pode ser adiada sem bloquear o resto; C7 pode fechar com DEP-1 pendente.

**Skills a instalar (2):**
- `better-writing` — de `boraoztunc/skills@645553c` (upstream original `jakubkrehel/skills`, MIT) → `.claude/skills/better-writing/`. Usar: erro, confirmação, estado vazio, fluxo/tela nova, 2+ strings de interface, auditoria. Não usar: conteúdo pedagógico, prompt do tutor, falas da Foca, marketing.
- `ogilvy-copywriting` — de `boraoztunc/skills@645553c` pasta `ogilvy/` (MIT no frontmatter) → `.claude/skills/ogilvy-copywriting/`. Usar: posicionamento, proposta de valor, título/hero, descrição OG/loja. Não usar: qualquer tela do app, feedback, tutor, pedagógico, microcopy.

**Skills que continuam, com papel novo:** Humanizer (revisor anti-artificialidade único; só texto de 2+ frases; nunca rótulo, `voz.ts`, prompt, pedagógico, spec) · `marketing-skills:copywriting` (rascunho de marketing) · `marketing-skills:copy-editing` (revisão obrigatória de marketing; ler pelo cache sem ligar o pacote).

**Skills rejeitadas:** `copywriting` e `copy-editing` do bora (forks 1.0.0 do que já existe em 2.x), `stop-slop` (duplica o Humanizer com regras absolutas que quebram pt-BR e contradizem o `20` §7.1), forks antigos do Corey (`page-cro`, `content-strategy`, `seo-audit`, `programmatic-seo`, `schema-markup`, `competitor-alternatives`, `analytics-tracking`), `landing-page`, `pricing-page`, `product-proof-saas` (reavaliar com landing de demo), `better-*`/`interface-review` (plano de design), duplicatas de skills já instaladas, presets visuais, vídeo, demais. Motivos em §P.

**Arquivos de documentação:** criar `docs/COPY.md`, `docs/copy/01…06`, `docs/copy/auditoria-*.md`, `docs/39`; editar `docs/ai/SKILLS.md`, `docs/ai/SKILL-ROUTING.md`, `docs/ai/SDD-WORKFLOW.md`, `.claude/skills-registry.json`, `skills-lock.json`, `.claude/skills/foca-sdd/SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `docs/README.md`, `.agents/product-marketing.md`; nota de uma linha em `docs/15`, `09`, `13`, `20` §7.1, `21` (topo), `brand/foca-rabisco-branding.md`; `PRODUCT.md`/`DESIGN.md` só depois do `36` T-10.3.

**Mudanças do SDD:** §S. **Mudanças do `CLAUDE.md`:** §T (uma frase no workflow + seção "Copy e escrita" de ≤ 10 linhas; topo intocado).

**Dependências do plano principal:** DEP-1…DEP-10 (§V.3). Resumo: não tocar em `src/`, `brand.ts`, linhas do `21`, blocos de plano vigente; `PRODUCT.md`/`DESIGN.md` depois do T-10.3; telas de nivelamento/Home/erros/curso citam o `36` como canônico; migração de strings só depois do `36` Fase 10, em plano próprio.

**Riscos de conflito:** `CLAUDE.md`, `00-README.md`, `PRODUCT.md`, `DESIGN.md`, `21` — editados também pelo `36` T-10.3. Protocolo §V.2 (reler, `Edit` por âncora, `git diff` por arquivo, nunca `Write` sobre existente). Arquivos já sujos fora desta sessão (`docs/historico/fundacao/09-branding.md`, `Claude outputs/`): não tocar.

**Decisões do usuário pendentes:** D-1 posicionamento · D-2 imperativo "Tente/Tenta" · D-3 "sequência" · D-4 "aula" some da UI · D-5 humor da pedra. O executor escreve recomendação marcada `PROPOSTA`, nunca decide.

**Critérios de validação:** §X (comandos com saída real; cobertura das 17 perguntas; 9 casos de roteamento).

**Definition of Done:** CS-1…CS-20 (§Y), cada um com evidência no `39`.

**Checklist executável:**

- [ ] Aprovação do usuário registrada no `38` e no `39`
- [ ] C0 — `39` criado; `git status`, `HEAD`, `validate-skills`, estado do `37` colados
- [ ] C1 — clone fora do repo; commit conferido; arquivos das 2 pastas conferidos (sem executável)
- [ ] C1 — `npx skills@1.7.0 add … --skill better-writing --skill ogilvy-copywriting` com telemetria desligada (ou fallback de cópia literal registrado)
- [ ] C1 — `diff -r` clone × instalado sem diferença de conteúdo; nenhum `SKILL.md` editado
- [ ] C1 — 2 entradas no registry; `validate-skills` sem FAIL
- [ ] C2 — `SKILLS.md`: §Q/§R novas com todos os campos; §K e §L ajustadas; seção de recusadas; "Como atualizar"
- [ ] C2 — `SKILL-ROUTING.md`: §2 classes de escrita; §2.1 níveis/ordem/orçamento/cache; §3, §4, §5, §7 atualizados
- [ ] C2 — registry: `declined[]`, `routes[]`, `contextFiles`; JSON válido
- [ ] C3 — `copy/01-estrategia.md` com fontes; mecanismos conferidos; D-1 como PROPOSTA (3 opções via `ogilvy-copywriting`); `copy-editing` (Prove It/Especificidade) aplicado a §5
- [ ] C4 — `copy/02-voz-e-tom.md`; tabela do `20` §7.1 citada literal; matriz completa; o documento não usa os padrões que proíbe
- [ ] C5 — `copy/03-ux-writing.md`; padrões com chaves reais; glossário com status; `better-writing` sobre os exemplos
- [ ] C6 — `copy/04`, `05`, `06`; `git diff --stat -- src` vazio
- [ ] C7 — `docs/COPY.md` ≤ 130 linhas com Quick Context; `CLAUDE.md`/`AGENTS.md`/`SDD-WORKFLOW`/`foca-sdd`/`00-README`/notas de precedência; `PRODUCT.md`/`DESIGN.md` só se T-10.3 ✅
- [ ] C8 — auditoria por área, sem aplicar; consolidação e lista para o plano de migração
- [ ] C9 — §X.1 com saída real; `spec-verifier`; tabela CS-1…CS-20 no `39`; `00-README` atualizado
- [ ] Nada commitado sem pedido do usuário
