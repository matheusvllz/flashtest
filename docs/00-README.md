# Foca — Specs (Spec Driven Development)

Esta pasta é a **fonte de verdade de produto, negócio e pitch** do Foca. O código do protótipo vive na raiz deste mesmo repo; as convenções técnicas ficam no `CLAUDE.md` da raiz. Regra: **toda decisão relevante é escrita aqui, com data — não fica só no chat.**

## Plano vigente de evolução (21/09/2026)

**Leia primeiro: [20 — Plano de evolução do aprendizado](20-plano-evolucao-aprendizagem.md).** Especificação completa em 23 seções, com diagnóstico do código, correção dos quatro bugs, contratos de feedback/tutor, identidade sonora, Brand Voice, microlições, questões, dicas, trilha, adaptação, dados, fases executáveis, dependências, testes, critérios de aceite e checklist para a próxima IA.

**Status: planejado, não implementado.** Nesta etapa, o usuário autorizou somente registrar o plano no SDD. A execução do código depende de autorização posterior. Arquivos indicados como **NOVO ARQUIVO** no plano ainda são propostas de implementação, não entregas existentes.

Nos assuntos cobertos, o `20` prevalece sobre orientações incompatíveis dos documentos anteriores e sobre descrições históricas no `CLAUDE.md`. Em especial: erro não deve abrir/enviar chat automaticamente; texto não é sorteado no render; voz não constrange o aluno; explicação curta precede prática; conclusão, evidência e revisão são separadas. A identidade visual continua Rabisco na Margem.

Para executar: ler o `20` inteiro, seguir a ordem da fase autorizada e comprovar seus critérios antes de marcá-la como pronta. A auditoria estática de 20/09 está na seção 2; não confundir com testes de navegador/áudio já realizados. Os registros abaixo preservam a trajetória do projeto e não substituem esse diagnóstico mais recente.

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
| `brand/` | Assets | `Flash Test - design System.html` (marca anterior) + a LP do link da bio |
| `_arquivo-abroad/` | 🗄️ Arquivo morto | Toda a fase Abroad, preservada. Ver o `LEIA-ME.md` de lá |

⭐ = reconstruído em 20/09/2026 (o original foi perdido no pivô). 🆕 = escrito no rebranding para Foca. 🗄️ = registro histórico.

> **Sobre a numeração:** a fase Abroad também usou os números 15–21. Aqueles arquivos vivem em `_arquivo-abroad/` e carregam `-abroad` no nome, então não há ambiguidade real — mas ao citar um documento, vale dizer de qual linha ele é.

## Por onde começar

- **Vai executar correções ou a evolução para aprendizado?** → [20](20-plano-evolucao-aprendizagem.md), inteiro, antes dos planos históricos. A seção 16 define cada fase; a 20 define aceite; a 23 define o checklist. Não implementar sem autorização.
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
