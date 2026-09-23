# Foca — Specs (Spec Driven Development)

**Plano vigente — Jornada de Aprendizado V2 (21/09/2026, IMPLEMENTADO em 22/09/2026):** [25 — Jornada de Aprendizado V2: plano de implementação](25-plano-jornada-aprendizado-v2.md). Reestrutura a experiência principal: `/trilha` é a home, hierarquia matéria → seção → capítulo → lição, lição como sequência de passos intercalados (4–8 questões com dificuldade progressiva), revisão de capítulo, nav com 4 itens, schema v5. As 28 tarefas (T-01…T-28) foram executadas — **ver [26 — Registro de execução](26-registro-execucao-jornada-v2.md) primeiro** pro registro real (comandos e números de `bunx tsc --noEmit`/`bun test tests/unit`/`bunx playwright test`/`bun run build`, a tabela de critérios G1–G13, as decisões editoriais tomadas ao longo da execução e as limitações explícitas — sem dispositivo físico, sem revisão pedagógica externa do conteúdo novo, sem observação de participante real). Não é "tudo pronto para sempre": o `26` §8 lista o que continua futuro. Ler antes de mexer em trilha, microlições, home ou navegação — não assumir que um trecho do `25` ainda está "não implementado" sem checar o `26`.

**Plano vigente — Home como trilha visual + deploy público (23/09/2026, IMPLEMENTADO em 23/09/2026, publicação pendente):** [27 — Especificação](27-plano-home-trilha-visual.md) redesenha a apresentação de `/trilha` como caminho vertical em zigue-zague (nó foco com halo e callout, carimbo de capítulo, rabiscos de margem, rolagem até o foco) sem mudar nenhuma regra de domínio do `25`, e diagnostica o deploy (o Vercel publicava `dist/` sem `index.html` porque o `vite.config.ts` forçava o preset Netlify; o domínio está atrás de SSO; o site Netlify antigo serve o Abroad). [28 — Plano de execução](28-plano-execucao-home-trilha.md) tem as 29 tarefas atômicas — **ver [29 — Registro de execução](29-registro-execucao-home-trilha.md) primeiro** pro registro real: todos os RF-1…16/HG1…13/DG1/DG5 cumpridos com evidência (290 unitários + 55 E2E, todos passando), 2 regressões reais encontradas e corrigidas numa revisão de 8 sub-agentes (a saudação "acolhedora" não vencia quando a matéria selecionada já estava concluída; telemetria de erro faltando na rota) e 13 achados menores registrados sem correção com o porquê. **O que falta:** T-27 (push, PR, merge e configuração manual no painel do Vercel — DG2/DG3/DG4) depende de autorização explícita do usuário e não foi executado nesta sessão; a branch `feat/home-trilha-visual` está pronta mas não publicada.

**Identidade sonora aprovada e integrada (21/09/2026):** [24 — Integração dos WAVs v2](24-integracao-identidade-sonora.md). Atualiza o estado das propostas sonoras 20/23; os 12 arquivos aprovados estão em `public/sfx/v2/`.

**Agentes e skills (22/09/2026):** o fluxo SDD para agentes de IA, o catálogo das skills/plugins instalados e o roteamento entre eles estão em [`ai/`](ai/) — comece por [ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md). Specs novas usam [ai/SPEC-TEMPLATE.md](ai/SPEC-TEMPLATE.md). [PRODUCT.md](PRODUCT.md) e [DESIGN.md](DESIGN.md) são resumos para agentes, derivados destes documentos — se divergirem, os documentos numerados vencem. Skills são ferramentas: nunca prevalecem sobre uma spec daqui.

Esta pasta é a **fonte de verdade de produto, negócio e pitch** do Foca. O código do protótipo vive na raiz deste mesmo repo; as convenções técnicas ficam no `CLAUDE.md` da raiz. Regra: **toda decisão relevante é escrita aqui, com data — não fica só no chat.**

## Plano vigente de evolução (21/09/2026) — Fases 0–12 implementadas

**Leia primeiro: [20 — Plano de evolução do aprendizado](20-plano-evolucao-aprendizagem.md).** Especificação completa em 23 seções, com diagnóstico do código, correção dos quatro bugs, contratos de feedback/tutor, identidade sonora, Brand Voice, microlições, questões, dicas, trilha, adaptação, dados, fases executáveis, dependências, testes, critérios de aceite e checklist.

**Status: implementado e testado em 21/09/2026 — ver [22 — Validação do piloto](22-validacao-piloto-aprendizagem.md) pro registro de execução, evidência de teste (136 unitários + 20 E2E reais) e as limitações explícitas (sem dispositivo físico, sem escuta humana da identidade sonora, sem observação de participante real, sem revisão pedagógica externa do conteúdo).** Isto NÃO é "roadmap inteiro pronto" — o `22` §6 lista o que continua futuro (diagnóstico real, revisão espaçada com UI própria, simulado, backend). Arquivos que o `20` marcava **NOVO ARQUIVO** agora existem no código; confirmar no `22` antes de assumir que algo específico foi feito.

Nos assuntos cobertos, o `20` prevalece sobre orientações incompatíveis dos documentos anteriores e sobre descrições históricas no `CLAUDE.md`. Em especial: erro não deve abrir/enviar chat automaticamente; texto não é sorteado no render; voz não constrange o aluno; explicação curta precede prática; conclusão, evidência e revisão são separadas. A identidade visual continua Rabisco na Margem.

Pra alterar o que já foi implementado: ler o `20` (a norma) e o `22` (o que foi feito e como foi testado) antes de mexer. A auditoria estática de 20/09 na seção 2 do `20` é o diagnóstico PRÉ-implementação — não confundir com o estado atual do código.

## Estado atual (20/09/2026)

**O projeto voltou a ser o Flash Test.** Em 23–24/07/2026 o grupo pivotou para outro produto (o **Abroad** — plataforma de counselor para estudar no exterior, persona Liz) e reescreveu os documentos de fundação. Esse pivô foi **revertido**. O que isso significa na prática:

- **O código nunca foi convertido.** O app deste repo sempre foi o Flash Test, na íntegra, com as três fases de Development concluídas em 22/07. Nada precisou ser desfeito no protótipo.
- **Os documentos foram.** `00-README`, `01`, `02`, `04`, `08` e `14` haviam sido reescritos para o Abroad — foram restaurados para a linha Flash Test. O `08` e o `14` precisaram ser **reconstruídos**, porque os originais foram sobrescritos/deletados no pivô (cada um explica no topo de onde veio o que está escrito ali).
- **A fase Abroad está preservada, íntegra**, em `_arquivo-abroad/`. Nada foi destruído.
- **O contexto Link encerrou.** Os arquivos que descrevem o squad de 7 pessoas, o cronograma da semana e o Pitch Day (`00-constituicao`, `03`, `04`) foram mantidos sem reescrita, com um cabeçalho marcando que são registro histórico.

## Rebranding em curso (20/09/2026) — Flash Test → **Foca**

Decidido depois da restauração acima: o projeto volta ao nome **Foca**, com a foca como **mascote da marca** (estilo Duo) e posicionamento explícito de **plataforma gamificada contra a procrastinação por dopamina de feed**. A paleta passou por duas direções na mesma data: **Ártica** (azul-gelo + coral, `09`) foi a primeira, aplicada no código pelo `17`; horas depois foi substituída por **Rabisco na Margem** (grafite + papel + caneta azul única, `brand/foca-rabisco-branding.md`), aplicada pelo `18` — ver `18-plano-reestilizacao-rabisco.md` para o estado atual do design system.

**Specs e código migrados (ver `17`).** Os três documentos novos/reescritos:

- `09-branding.md` — nome, logo da cabeça da foca (com SVG de referência), paleta Ártica, opções de slogan, e o **checklist de migração no código** (levantado arquivo por arquivo, não executado)
- `15-mascote-e-voz.md` — o arquétipo da Foca, as regras duras da cobrança, as 8 expressões, a biblioteca de falas e a persona do tutor de IA
- `16-gamificacao-e-dopamina.md` — sistema de som, háptico, movimento, streak, e quais mecânicas do Duolingo adotar ou recusar

Duas tensões foram resolvidas por escrito em vez de ignoradas: o **coral vs. o vermelho de erro** (`09` §3) e a **cobrança do mascote vs. o gatilho de evitação da persona** (`15` §0 e §3).

## O produto em uma frase

App mobile-first de preparação para o ENEM em **aulas de 60 segundos** (1–2 questões por vez) com uma IA que aprende a lacuna de cada aluno e decide a próxima questão. Diferencial: **constância e personalização**, não conteúdo.

## Os arquivos

| Arquivo | Papel no SDD | Pergunta que responde |
|---|---|---|
| [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md) | **Specify + Plan + Tasks — vigente, ainda não implementado** | Como corrigir bugs e evoluir para aprendizado: arquivos reais, contratos, fases, riscos, testes e critérios verificáveis para execução por outra IA |
| `00-constituicao.md` | Constitution | 🗄️ Como o grupo trabalhava e quais regras eram inegociáveis. **A regra "IA no centro, não cosmética" continua valendo.** |
| `01-especificacao-problema.md` | Specify | Qual problema, qual persona, qual dor, com que dado |
| `02-plano-solucao.md` | Plan | Proposta de valor, papel da IA, modelo de negócio, templates de DRE |
| `03-tarefas-semana.md` | Tasks | 🗄️ Como a semana do Pre College foi organizada |
| `04-especificacao-pitch.md` | Implement/Ship | Como isso vira um pitch em **landing page** (não slides) + o Golden Path da demo |
| `07-insumos-aulas.md` | Reference | Frameworks (PACE, Vibe Coding, DRE/cenários, storytelling/DISC) como ferramenta de trabalho — product-agnostic |
| `08-produto-e-estrategia.md` | Specify+Plan | ⭐ **Fonte de verdade do produto.** Definição, jornada, telas, estratégia de IA (§6), Golden Path (§7), diferenciação (§10), negócio (§11) |
| `09-branding.md` | Reference | 🆕 **Marca Foca** — nome, logo, paleta Ártica, slogan, checklist de migração. O design system Flash Test segue em `brand/` enquanto o código não migra |
| `10-prompt-prototipo-app.md` | Implement | Especificação tela-a-tela das 8 telas do MVP |
| `11-estado-prototipo-handoff-claude-code.md` | Implement (auditoria) | Auditoria linha-a-linha do código vs. o que foi pedido, com prioridades P0/P1/P2 |
| `12-plano-development.md` | Implement (plano) | As 3 fases de Development executadas + o registro de decisões técnicas |
| `13-prompt-landing-instagram.md` | Implement | Copy da landing do Instagram — a voz do João, palavra por palavra |
| `14-persona-joao.md` | Specify (persona) | ⭐ **Persona única — João.** Retrato, anamnese, cena, gatilho emocional, implicações de produto |
| `15-mascote-e-voz.md` | Reference (voz) | 🆕 **Abra antes de escrever qualquer texto do app.** Arquétipo da Foca, regras de cobrança, expressões, biblioteca de falas, persona do tutor de IA |
| `16-gamificacao-e-dopamina.md` | Specify+Plan | 🆕 Sistema de som (9 eventos), háptico, movimento, streak com congelamento, e as linhas que não se cruzam |
| `17-plano-migracao-visual-foca.md` | Implement (plano) | 🆕 Plano executável da migração visual para a Foca — tokens, logos, fases e auditoria |
| `18-plano-reestilizacao-rabisco.md` | Implement (plano) | 🆕 **Executado (ver `19`).** Plano da reestilização "Rabisco na Margem" (paleta em `brand/foca-rabisco-*`): diagnóstico, design system, componentes, mascote, gamificação, tela a tela e 13 fases |
| `19-registro-execucao-rabisco.md` | Implement (registro) | 🆕 O que de fato aconteceu ao rodar o `18` — decisões tomadas, e dois bugs reais de dark mode encontrados e corrigidos na Fase 12 |
| `21-brand-voice-e-inventario-copy.md` | Implement (registro) | 🆕 Inventário de copy da Fase 3 do `20` — o que foi revisado com evidência vs. o que só foi catalogado |
| `22-validacao-piloto-aprendizagem.md` | Implement (registro) | 🆕 **Ler antes de mexer no código do `20`.** O que foi implementado, testes reais executados, limitações explícitas, status dos critérios A1–A15 |
| [25-plano-jornada-aprendizado-v2.md](25-plano-jornada-aprendizado-v2.md) | **Specify + Plan + Tasks — vigente, implementado (ver `26`)** | 🆕 Como a trilha vira o coração do app: contexto, problemas, arquitetura (passos, árvore de currículo, revisão de capítulo, trilha por matéria, home/nav), modelo de dados, compatibilidade com legado, 28 tarefas com critérios de aceite, testes, edge cases e riscos |
| [26-registro-execucao-jornada-v2.md](26-registro-execucao-jornada-v2.md) | Implement (registro) | 🆕 **Ler antes de mexer no código do `25`.** O que existe por fase (T-02…T-27), decisões editoriais (o desvio do desafio de `porcentagem-valor`, a correção de conteúdo em `crase-quando-usar:revisao-1`, o gap de wiring do `reviewTarget`), números reais de teste (257 unitários + 33 E2E), a tabela de critérios G1–G13 e as limitações explícitas |
| [27-plano-home-trilha-visual.md](27-plano-home-trilha-visual.md) | **Specify + Plan — vigente, implementado (ver `29`)** | Como a home vira uma trilha visual própria do Foca (sem clonar o Duolingo, sem baú/moeda/vidas) e por que o deploy público falhava, com a plataforma escolhida (Vercel) e os critérios RF/HG/DG |
| [28-plano-execucao-home-trilha.md](28-plano-execucao-home-trilha.md) | **Tasks — executado (ver `29`)** | A sequência T-01…T-29 em 6 checkpoints, com arquivos, contratos, skills, testes e o prompt de handoff para a IA executora |
| [29-registro-execucao-home-trilha.md](29-registro-execucao-home-trilha.md) | Implement (registro) | 🆕 **Ler antes de mexer no código do `27`/`28`.** O que existe por checkpoint, as 2 regressões reais encontradas e corrigidas na revisão, a tabela de critérios RF/HG/DG com evidência, e o que ainda depende do usuário (push/PR/merge/Vercel) |
| [23-identidade-sonora-linguagem-musical.md](23-identidade-sonora-linguagem-musical.md) | Proposal (não implementado) | 🆕 Estende `20` §6.3/§6.4: por que o som atual soa genérico, a linguagem musical proposta (motivo = tríade de Ré maior + camada de textura de grafite/lápis), e um prompt de geração por IA pra cada um dos 12 eventos sonoros — aguardando escuta e decisão registrada antes de virar implementação |
| `brand/` | Assets | `Flash Test - design System.html` (marca anterior) + a LP do link da bio |
| `_arquivo-abroad/` | 🗄️ Arquivo morto | Toda a fase Abroad, preservada. Ver o `LEIA-ME.md` de lá |

⭐ = reconstruído em 20/09/2026 (o original foi perdido no pivô). 🆕 = escrito no rebranding para Foca. 🗄️ = registro histórico.

> **Sobre a numeração:** a fase Abroad também usou os números 15–21. Aqueles arquivos vivem em `_arquivo-abroad/` e carregam `-abroad` no nome, então não há ambiguidade real — mas ao citar um documento, vale dizer de qual linha ele é.

## Por onde começar

- **Vai mexer na apresentação visual de `/trilha` (caminho em zigue-zague, nó foco, carimbo de capítulo)?** → [29](29-registro-execucao-home-trilha.md) primeiro (o que existe e como foi testado), depois [27](27-plano-home-trilha-visual.md) (a norma) antes de alterar comportamento. Não mexe em nenhuma regra de domínio do `25` — só na apresentação.
- **Vai mexer no que o `25` já entregou (trilha como home, lições por passos, seções/capítulos)?** → [26](26-registro-execucao-jornada-v2.md) primeiro (o que existe e como foi testado), depois [25](25-plano-jornada-aprendizado-v2.md) (a norma) antes de alterar comportamento. Ele prevalece sobre o `20` nos assuntos que cobre (ver `25` §6.7).
- **Vai mexer no que o `20` já entregou (aprendizado/microlições/trilha)?** → [22](22-validacao-piloto-aprendizagem.md) primeiro (o que existe e como foi testado), depois [20](20-plano-evolucao-aprendizagem.md) (a norma) antes de alterar comportamento.
- **Vai decidir *o quê* construir?** → `08` (produto) + `14` (persona). Leia o **Aviso de sócio** do `08` §0 antes de propor qualquer feature que compita em "mais conteúdo".
- **Vai mexer no código?** → `11` (o que existe vs. o que foi pedido) + `12` (decisões técnicas) + o `CLAUDE.md` da raiz.
- **Vai fazer uma tela nova?** → `09` (marca) + `16` (recompensa). Tokens não se tiram da memória.
- **Vai escrever qualquer texto que o usuário lê?** → `15`. Toda frase passa pelo teste da §8.
- **Vai apresentar isso pra alguém?** → `04` (estrutura do argumento + Golden Path).

## O que está em aberto

As três lacunas reais do projeto, todas registradas no `08`:

1. **Validação** — nenhuma entrevista estruturada com aluno de pré-vestibular foi feita (`08` §8).
2. **Curadoria de conteúdo** — o banco chegou a 59 questões, mas nunca virou processo (`08` §8).
3. **Números de negócio** — DRE, preço e custo de IA por aluno nunca foram fechados (`08` §11).

No código, a divergência conhecida é uma só: **as lacunas ainda são heurística local** (`src/lib/gaps.ts`), não refinadas por IA (`08` §6, horizonte 2).
