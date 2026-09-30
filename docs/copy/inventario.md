---
estado: aprovado
atualizado: 2026-09-29
id: 21
canonico-de: [inventário de copy]
substitui: []
substituido-por: null
---

> **Canônico (ID 21).** Inventário vivo das strings do app. As regras de escrita estão em [../COPY.md](../COPY.md).

# 21 — Brand voice: inventário de copy e registro da Fase 3

> **Regras de escrita:** [COPY.md](../COPY.md). Este arquivo continua sendo o **inventário** (o que está revisado, com evidência). Estados de "revisado" só mudam junto com a mudança da string.

Execução: 21/09/2026. Fase 3 de [20-plano-evolucao-aprendizagem.md](../historico/iniciativas/20-22-aprendizagem/20-plano-evolucao-aprendizagem.md) — não confundir com revisão pedagógica de conteúdo (enunciados/explicações dos 1.204 exercícios e 59 questões seguem **fora** desta passada; ver seção 4).

## 1. O que este documento é (e o que não é)

É o inventário de superfícies com texto voltado ao usuário, com status por linha: **revisado** (aplicado nesta Fase 3, com evidência abaixo), **pendente** (existe, ainda não passou pela seção 7 do `20`) ou **n/a** (não é copy funcional/de marca — ex.: nome de variável, conteúdo pedagógico versionado à parte).

Não é uma declaração de que todo o app já fala a nova voz. Onde este documento diz "pendente", o texto atual pode ainda carregar tom de documentação antiga (sarcasmo, "cobrança", entusiasmo genérico) — tratar como **não verificado**, não como aprovado por omissão.

## 2. Revisado nesta Fase 3 — com evidência

| ID | Arquivo/componente | Estado/gatilho | Texto antes | Texto depois | Revisão |
|---|---|---|---|---|---|
| tutor.persona | `src/lib/tutor-prompt.ts` (`buildSystemPrompt`) | Todo turno do tutor de IA | "seca, sarcástica, cômica (...) cobra disciplina do aluno" | "colega de estudo atento e direto (...) humor, no máximo uma vez, nunca sobre a capacidade do aluno" | Teste `tests/unit/brand-voice.test.ts` |
| tutor.ausencia | `src/lib/tutor-prompt.ts` | Regra dura do prompt | "Você só implica com ausência, nunca com erro" (cobrança permitida por ausência) | "Ausência também não gera cobrança: se o aluno sumiu e voltou, receba sem puxar o assunto" | Mesmo teste |
| voz.errou[3] | `src/lib/voz.ts` (slot `errou`) | 4ª variação ao errar uma questão | "Anotado. Vou te cobrar essa de novo semana que vem." | "Marquei aqui. Bora ver onde travou." | Teste `tests/unit/brand-voice.test.ts` — nenhuma fala de `errou` contém "cobrar" |
| feedback.* | `src/components/lessons/FeedbackSheet.tsx` | Botões "Ver/Ocultar resolução", "Explicar melhor", "Continuar"/"Ver resultado" | Strings soltas no componente | Centralizadas em `src/lib/copy.ts` → `COPY.feedback.*` | Revisão manual — mesmo texto, só a fonte mudou; nenhuma mudança de significado |
| tutor.ui.* | `src/components/TutorBubble.tsx` | Header, aria-labels, placeholder, saudação, sugestões, erro de rede | Strings soltas no componente | Centralizadas em `COPY.tutor.*`; erro de rede alinhado ao exemplo literal do `20 §7.1` ("Não consegui responder agora. Tente de novo.") | Revisão manual + `tests/e2e/tutor.spec.ts` (fluxo continua funcionando) |
| tutor.contexto | `src/components/TutorBubble.tsx` (seleção de sugestões) | Decidir se mostra sugestões de "erro" ou "ajuda" | Inferia por `focus.chosen && focus.chosen !== focus.correct` (frágil pra resposta composta) | Usa `focus.answered`/`focus.wasCorrect`, a mesma correção já aplicada em `tutor-prompt.ts` na Fase 1 | Revisão manual, consistente com `tests/unit/tutor-focus.test.ts` |

`src/lib/copy.ts` documentava no topo, até a Fase 3 do `20`, que cobria só estas duas superfícies. O `25` (T-10/T-16) estendeu `COPY` com mais dois blocos — registrados abaixo, mesma granularidade e mesmo padrão de evidência desta seção. Não adicionar string nova em `copy.ts` sem atualizar este inventário.

### 2.1 `COPY.licao.*` — player de lição passo a passo (docs/25 T-10, T-28)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `comecar` | "Começar" | Botão que inicia a lição, primeiro passo (`intro`) | `tests/e2e/lesson-v2.spec.ts` (`getByRole("button", { name: "Começar" })`) |
| `continuar` | "Continuar" | Botão de avanço entre passos de ensino (`teach`/`tip`/`recap`) | Mesmo spec |
| `verificar` | "Verificar" | Botão que confirma resposta de uma questão | Mesmo spec |
| `concluir` | "Concluir lição" | Botão do último passo | `tests/e2e/chapter-complete.spec.ts` (percorre até concluir) |
| `dica` | "Dica" | Rótulo do passo `tip` | n/a — não tem asserção de texto própria; conferido por leitura de `TipStepView.tsx` |
| `sair` | "Sair da lição" | CTA de saída no header do player | `tests/e2e/lesson-v2.spec.ts` (fluxo completo passa pelo header) |
| `sairTitulo` | "Sair da lição?" | Título do modal de confirmação de saída | Revisão manual — nenhum E2E clica em "Sair" no meio da lição ainda; **pendente de teste**, não de revisão de tom |
| `sairCorpo` | "Seu progresso nesta lição fica salvo — você retoma de onde parou na próxima vez." | Corpo do modal de saída | Mesma ressalva — revisão de tom feita, sem E2E dedicado |
| `sairFicar` | "Continuar estudando" | Botão que cancela a saída | Mesma ressalva |
| `sairMesmo` | "Sair mesmo assim" | Botão que confirma a saída | Mesma ressalva |
| `voceAprendeu` | "Você aprendeu" | Título da tela de conclusão (resume o que a lição ensinou, G8/`25` §20) | `tests/e2e/chapter-complete.spec.ts` percorre a tela de conclusão; não asserta esse texto literal — **verificação parcial** |
| `refazer` | "Refazer lição" | Botão pós-conclusão | Revisão manual |
| `roles.checkpoint`/`.pratica`/`.desafio`/`.revisao` | "Checagem rápida"/"Prática"/"Desafio"/"Revisão" | Rótulo do tipo de questão dentro do passo `question` — `checkpoint` renomeado na Fase 7 (docs/30 §17, docs/32): "Checkpoint" era jargão de produto | Revisão manual + `tests/unit/validate-v2.test.ts` (valida os `role` em si, não o rótulo em português) |

Tom conferido contra as mesmas regras da seção 7 do `20` que já valiam pro resto de `copy.ts`: sem emoji, sem exclamação dupla, sem cobrança ("Seu progresso... fica salvo" é factual, não ameaça perder nada). Nenhuma string aqui foi testada por `brand-voice.test.ts` especificamente — esse teste cobre `voz.ts`/`tutor-prompt.ts`, não `copy.ts` ainda (mesma lacuna que já existia pro bloco `feedback`/`tutor` antes desta atualização).

### 2.2 `COPY.trilha.*` — home/trilha, nó/capítulo/seção (docs/25 T-16, T-28)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `continuar` | "Continuar" | CTA único do card de continuar (G2) | `tests/e2e/trail-home.spec.ts` (`getByRole("link", { name: "Continuar", exact: true })`) |
| `comecarAqui` | "Começar por aqui" | Rótulo pequeno do card quando é a 1ª lição do aluno | Mesmo spec |
| `secao(n)` | "Seção N" | Cabeçalho de seção | `tests/e2e/trilha.spec.ts` (percorre seções) |
| `estados.completed` | "Concluída" | Rótulo textual de nó concluído (G3 — trilha nunca depende só de cor) | `tests/e2e/trilha.spec.ts` ("mostra nós com rótulo textual de estado") |
| `estados["completed-review"]` | "Concluída · revisão sugerida" | Nó concluído com revisão de capítulo disponível | `tests/e2e/chapter-complete.spec.ts` (nó "Revisão" fica `Disponível` após concluir capítulo) — cobre o estado da revisão em si, não necessariamente esta string composta |
| `estados["in-progress"]` | "Em andamento" | Nó com sessão ativa não concluída | Revisão manual |
| `estados.current` | "Continuar daqui" | Nó recomendado agora | `tests/e2e/trail-home.spec.ts`/`trilha.spec.ts` |
| `estados.available` | "Disponível" | Nó desbloqueado, não iniciado | `tests/e2e/trilha.spec.ts`, `chapter-complete.spec.ts` |
| `estados.locked` | "Bloqueada" | Nó bloqueado | `tests/e2e/trilha.spec.ts` ("URL direta pra uma lição bloqueada respeita a mesma regra do nó") |
| `kinds.aula`/`.pratica`/`.revisao` | "Aula"/"Prática"/"Revisão do capítulo" | Tipo de nó | Revisão manual |
| `capituloBloqueado` | "Conclua o capítulo anterior" | Mensagem quando um capítulo inteiro está bloqueado | Revisão manual — sem E2E dedicado (nenhum capítulo publicado tem pré-requisito de capítulo hoje, ver `docs/26` §3.4) |
| `questoes(n)` | "N questões" | Contagem no card/nó | Revisão manual |
| `tudoConcluido` | "Você concluiu tudo o que está publicado. Que tal praticar?" | Estado vazio quando não há recomendação (`efetiva === "none"`) | Revisão manual — factual, não cobra do aluno |
| `praticar` | "Praticar" | CTA do estado `tudoConcluido` | Revisão manual |
| `capituloConcluido` | "Capítulo concluído" | Título da folha (`ChapterCompleteSheet`) | `tests/e2e/chapter-complete.spec.ts` |
| `secaoConcluida` | "Seção concluída" | Título quando a seção inteira fecha | Revisão manual — sem E2E dedicado (specs cobrem fechamento de capítulo, não de seção completa) |
| `fechouLicoes(n)` | "Você fechou N lições." | Corpo da folha | `tests/e2e/chapter-complete.spec.ts` percorre a folha; não asserta esse texto literal |
| `revisaoAberta` | "A revisão do capítulo está aberta." | Aviso na folha quando há revisão disponível | Mesmo spec — cobre o comportamento (nó de revisão fica disponível), não necessariamente esta string exata |
| `fazerRevisao` | "Fazer a revisão" | CTA da folha pra revisão (via `reviewTarget`, ver `docs/26` §3.3) | Mesmo spec |

### 2.3 `COPY.trilha.*` — trilha visual (docs/27 §6.6, docs/28 T-02/T-28)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `capituloRotulo(secao, cap)` | "Seção N · Capítulo M" | Rótulo do banner do capítulo | Revisão manual |
| `proximaNestaMateria` | "Próxima nesta matéria" | Rótulo do callout quando o foco é local (não a recomendação global) | `tests/e2e/trail-path.spec.ts` (HG5) |
| `recomenda(titulo, materia)` | "A Foca recomenda: {titulo} · {materia}" | Dica de recomendação em outra matéria | `tests/e2e/trail-path.spec.ts` (HG5, RF-12/RF-6) |
| `irParaAtual` | "Voltar para a lição atual" | `aria-label` do botão flutuante | `tests/e2e/trail-path.spec.ts` (HG6) |
| `carimboPendente(feitas, total)` | "Carimbo do capítulo · N/M" | Carimbo de capítulo não concluído | Revisão manual |
| `carimboConcluido` | "Capítulo concluído" | Carimbo de capítulo concluído | `tests/e2e/trail-path.spec.ts` (RF-12/RF-6, `role="img"`) |
| `estrelas(n, max)` | "N de M estrelas" | Só no `aria-label` do carimbo concluído | Revisão manual |
| `metaHoje(feitas, meta)` | "N/M hoje" | Texto ao lado do `GoalRing` na barra de métricas | Revisão manual — some abaixo de 360px |
| `fimDaMateria(materia)` | "Você fechou tudo o que está publicado em {materia}." | Fim de trilha da matéria (RF-12) | `tests/e2e/trail-path.spec.ts` (RF-12/RF-6, "acolhedora vence...") |
| `erroTitulo` / `erroCorpo` / `tentarDeNovo` | "A trilha não carregou." / "Tenta de novo. Seu progresso está salvo neste aparelho." / "Tentar de novo" | `errorComponent` da rota `/trilha` (`TrailError`) | Verificado manualmente (`throw` temporário + screenshot, docs/29 §2); a variante com gravação falhando (`erroCorpoSemSalvo`, §2.9) e o texto com gravação ok têm E2E em `state-migration.spec.ts` (28/09/2026) |
| `abrirCapitulo(titulo)` / `recolherCapitulo(titulo)` | "Abrir {titulo}" / "Recolher {titulo}" | **Criadas e não usadas** — o nome acessível do banner do capítulo vem do próprio texto visível + `aria-expanded`, decisão da auditoria de acessibilidade de T-19 (docs/29 §5c) | — |

Tom conferido manualmente contra a seção 7 do `20` — nenhuma string cobra o aluno; `fimDaMateria`/`erroCorpo` descrevem estado sem culpa. Sem regressão automatizada de tom em `brand-voice.test.ts` ainda, mesma ressalva da seção 2.2.

Igual ao bloco `licao`: tom conferido manualmente contra a seção 7 do `20` (sem cobrança — `tudoConcluido` e `capituloBloqueado` descrevem estado, não repreendem o aluno), sem regressão automatizada de tom em `brand-voice.test.ts` ainda. Marcar como **revisado com evidência de comportamento** (os E2E citados percorrem os fluxos que usam essas strings), não como **revisado com evidência de tom testada automaticamente** — essa distinção já valia pros blocos `feedback`/`tutor` na seção 2 original e continua valendo aqui.

### 2.4 `COPY.questao.*` e `VOZ.naosei` — botão "Não sei" (docs/30 §16.1, Fase 6 do docs/31)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `COPY.questao.naoSei` | "Não sei" | Rótulo do botão, nas 3 superfícies (microlição, `/study`, lição de redação) | `tests/e2e/dont-know.spec.ts` |
| `COPY.questao.naoSeiAria` | "Não sei a resposta desta questão" | `aria-label` do botão (`DontKnowButton.tsx`) | Corrigido depois de um achado real: a versão original ("Não sei **responder** esta questão") continha a substring "responder", que colidia com `getByRole("button", { name: "Responder" })` nos testes existentes (Playwright casa por substring, case-insensitive, por padrão) — quebrava `tutor.spec.ts`/`feedback.spec.ts` ao ligar a flag. `tests/e2e/dont-know.spec.ts` + regressão completa |
| `VOZ.naosei[0..2]` | "Tudo bem. Veja como resolve:" / "Sem problema. Olha o caminho:" / "Beleza. Vamos por partes:" | Título da `FeedbackSheet` quando `feedback.kind === "dont-know"` (sorteado por `fala("naosei")`) | `tests/unit/brand-voice.test.ts` (nenhuma fala cobra/julga: sem "cobrar", "errou", "errado") + `tests/e2e/dont-know.spec.ts` (feedback visível, sem cor de acerto/erro) |

Regra de tom aplicada (docs/20 §7.1): sem cobrança, sem "tudo bem" performático isolado (as 3 variações sempre emendam com "veja/olha/vamos" — a frase inteira encaminha pra frente, não fica só consolando). Nenhuma das 3 falas usa "errou"/"errado": "não sei" é um sinal próprio, não um erro (`30` §16.1).

### 2.5 `COPY.jornada.*` e `COPY.foco.*` — jornada única e modo foco (docs/30 §14/§15, Fase 12 do docs/31 F12.9)

| Chave | Texto/forma | Uso | Revisão |
|---|---|---|---|
| `COPY.jornada.motivos.*` | 14 frases, uma por `ReasonCode` (`30` §14.2) | Card "Sessão de hoje" (`SessionCard.tsx`) e lição sintética de atividade (`activity-lesson.ts`) | Autorrevisão direta contra `20` §7.1 (mesmo padrão que a Fase 7 registrou em F7.5 — não o pipeline completo do Humanizer): 9 das 14 são cópia verbatim do `30` §14.2 (já aprovadas); as 5 novas (`revisao-atrasada`, `reforco-ajuda`, `prioridade-aluno`, `checkpoint`, `confirmar-fundamento`) seguem o mesmo tom. `tests/unit/brand-voice.test.ts` cobre as 14: sem "domina", sem "cobrar"/"você precisa"/"você deveria", sem "!!" |
| `COPY.jornada.kinds.*` | Aula/Prática/Revisão/Desafio/Checkpoint/Reforço | Título de nó (`PathNode`/`JourneyPath`) e de atividade sem lição própria | Rótulos neutros de tipo, sem avaliação — baixo risco, não testado à parte |
| `COPY.jornada.atual`/`aSeguir` | "Atual" / "A seguir" | Estado do nó no caminho da jornada, leitor de tela (docs/31 F12.4, critério de acessibilidade) | Texto funcional puro |
| `COPY.jornada.semNada` | "Você passou por tudo que está disponível agora. Revisões voltam conforme as datas." | Card quando a jornada "infinita" esgota o conteúdo (`30` §14.5, citação verbatim do plano) | Copiado do próprio `30`, já aprovado |
| `COPY.foco.*` | Rótulos de folha de foco ("Só hoje", "Daqui pra frente", "Voltar a todas"…) | `FocusSheet.tsx`/`FocusLine.tsx`, seção "Foco e ritmo" do Perfil | Texto funcional, sem tom de cobrança (nenhuma variação de "você precisa focar") |

### 2.6 `COPY.onboarding.*`, `COPY.nivelamento.*` e `COPY.checkpoint.*` — nivelamento e checkpoints (docs/30 §12/§13, Fase 13/14 do docs/31 F13.8/F14.5)

| Chave | Texto/forma | Uso | Revisão |
|---|---|---|---|
| `COPY.onboarding.ofertaTitulo`/`ofertaCorpo`/`ofertaCtaPrimario`/`ofertaCtaSecundario`/`ofertaRodape` | "Quer começar no seu nível?" / "São umas 20 questões..." / "Fazer o nivelamento" / "Começar sem nivelamento" / "Dá pra fazer depois, pelo Perfil." | `PlacementOffer.tsx`, último passo do `/quiz` | Cópia verbatim do `30` §12.2 (já registrada como "passou pelo Humanizer" no próprio plano) |
| `COPY.onboarding.blocoVoce`/`blocoSuaProva`/`blocoSeuRitmo` | "Você" / "Sua prova" / "Seu ritmo" | Kicker dos passos novos do quiz (`ExamStep`/`TimeStep`/`FocusStep`) | Rótulo de agrupamento neutro, do próprio `30` §12.2 |
| `COPY.onboarding.dataProva`/`euSeiAData`/`aindaNaoSeiData` | "Data da prova" / "Eu sei a data" / "Ainda não sei" | `ExamStep.tsx` | Texto funcional, opção "ainda não sei" nunca obrigatória (`30` §12.2) |
| `COPY.nivelamento.duranteHint` | "Sem dica nesta parte. Se não souber, toque em Não sei. Isso também ajuda a ajustar a trilha." | Cabeçalho da rota `/nivelamento` durante o CAT | Cópia verbatim do `30` §12.2 |
| `COPY.nivelamento.resultadoTitulo`/`resultadoCorpo` | "Pronto." / "Isso é um ponto de partida, e ele fica mais preciso conforme você estuda." | Tela de resultado do nivelamento | Cópia verbatim do `30` §12.5 — sem nota, sem "Nível N" (`brand-voice.test.ts` cobre). **Superado em 28/09/2026 pelo `36` RU-10:** título e corpo atuais na §2.9 |
| `COPY.nivelamento.faixaBaseConstrucao`/`faixaNoCaminho`/`faixaBaseFirme` | "Base em construção" / "No caminho" / "Base firme" | Uma linha por área na tela de resultado | Cópia verbatim do `30` §12.5 |
| `COPY.nivelamento.areaNaoMedida(area)` | "Ainda não temos questões suficientes de {área} para medir." | Área sem pool suficiente (caso de borda `30` §12.3 — hoje só a área sem pool suficiente, fora do escopo por foco ou abandonada; o pool existe desde a F11.6) | Cópia verbatim do `30` §12.3 |
| `COPY.checkpoint.introTitulo`/`introCorpo`/`comecar`/`agoraNao` | "Checkpoint" / "Questões misturadas, sem dica..." / "Começar" / "Agora não" | `CheckpointIntro.tsx` | Adaptado do `30` §13.3 (corpo simplificado — não cita "8 questões" porque a contagem real varia 6-8, `composeCheckpoint`) |
| `COPY.licao.respostaRegistrada` | "Resposta registrada." | Modo `silent` do `QuestionStepView` (nivelamento e checkpoint — sem cor de certo/errado) | Texto neutro, nenhuma avaliação de desempenho |

Revisão feita por autorrevisão direta contra `20` §7.1 (mesmo padrão do item 2.5, não o pipeline completo do Humanizer) — `tests/unit/brand-voice.test.ts` cobre `COPY.onboarding.*`/`COPY.nivelamento.*` com um teste genérico (sem "você precisa/deveria" + verbo, sem "!!", sem "nota"/"nível N").

### 2.7 `BRAND.*` — título, descrição e compartilhamento do site (docs/36 RU-20, T-08.7)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `BRAND.tagline` | "Estudo curto, todo dia." | `<title>` (`Foca — {tagline}`) e `og:description` em `src/routes/__root.tsx` | Texto literal do `36` §F.4 RU-20. Antes: "Foca 60 segundos." (duração que o produto não mede). `tests/unit/brand-voice.test.ts` fixa o texto e proíbe "60 segundos", "60s" e "cobra" |
| `BRAND.description` | "Preparação para o ENEM em aulas curtas. A Foca acompanha o que você já sabe e escolhe o próximo passo." | `<meta name="description">` e `og:description` em `src/routes/__root.tsx` | Texto literal do `36` §F.4 RU-20. Antes: "…aulas de 60 segundos. Uma foca que aprende suas lacunas e te cobra todo dia." (duração sem lastro e tom de cobrança, `20` §7.1). Mesmo teste |

A frase de posicionamento de `PRODUCT.md` (D-1 do `COPY.md`) **não** foi tocada; `welcome.tsx` e `index.tsx` ainda exibem "Foca 60 segundos." — fora do `36`, pendentes no plano de copy (`39`).

### 2.8 `COPY.cursos.*` — seleção de curso (docs/36 §F.7, T-09.2/T-09.3, RU-40, RA-5)

| Chave | Texto/forma | Uso | Revisão |
|---|---|---|---|
| `COPY.cursos.rotuloBusca` / `placeholderBusca` | "Curso" / "Buscar pelo nome" | `<label>` visível e placeholder do campo de busca (`CourseStep.tsx`) | "Curso" é o rótulo literal do `36` §F.7 (RA-5). O placeholder é texto funcional novo, sem tom |
| `COPY.cursos.areasAriaLabel` | "Áreas" | `aria-label` do grupo dos 13 chips de área | Texto funcional (leitor de tela) |
| `COPY.cursos.escolhaUmaArea` | "Escolha uma área ou busque pelo nome." | Estado inicial, sem área marcada e sem busca | Literal do `36` §F.7 |
| `COPY.cursos.naoAchei` / `usarTexto(texto)` | "Não achei esse curso." / "Usar “{texto}”" | Busca sem resultado; o botão grava o texto (≤ 60 caracteres) como curso | Literais do `36` §F.7. Sem culpar o aluno |
| `COPY.cursos.aindaNaoDecidi` | "Ainda não decidi" | Botão que grava o valor literal lido por `tutor-prompt.ts:72` e `aha.tsx:59` | Texto já existente no `/quiz`; o valor gravado não mudou |
| `COPY.cursos.escolhido(curso)` | "Escolhido: {curso}" | Linha com o valor salvo (do catálogo, texto livre ou legado desconhecido), mostrado como está | Texto funcional novo |
| `COPY.cursos.contagem(n)` | "1 curso" / "{n} cursos" | Região `aria-live="polite"`: anuncia a contagem de resultados ou da área | Texto funcional novo; sem promessa nenhuma |
| `COPY.cursos.perfilRotulo` / `perfilMudar` / `perfilSheetTitulo` | "Curso pretendido" / "Mudar" / "Curso pretendido" | Linha "Curso pretendido: {valor}" no `/profile`, botão e título da `BottomSheet` | Rótulo e botão literais do `36` §F.7 |

Os nomes dos 82 cursos e os sinônimos ficam em `src/data/courses.ts` (dado, não copy); os 59 nomes anteriores não mudaram. Revisão por autorrevisão contra `20` §7.1 (sem emoji, sem exclamação, sem cobrança); nenhuma string prevê nota de corte nem "área da prova". `tests/unit/brand-voice.test.ts` **não** cobre `COPY.cursos` (mesma lacuna dos outros blocos de UI).

### 2.9 Avisos e estados novos do `36` — jornada, persistência, nivelamento e folha de feedback (docs/36 RU-1…RU-6, RU-10…RU-12, RP-10; T-02…T-07)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `COPY.comum.tentarDeNovo` / `fecharAviso` / `ok` | "Tentar de novo" / "Fechar aviso" / "Ok" | Botões reutilizados pelos avisos de erro, pela faixa de persistência e pela recuperação de storage | `brand-voice.test.ts`; `journey-start.spec.ts` e `state-migration.spec.ts` clicam em "Tentar de novo" |
| `COPY.jornada.puladaSemItens` | "Essa atividade ficou sem questões agora. Segui com a próxima." | RU-1: aviso de uma linha na Home quando uma atividade dinâmica é descartada por falta de questões | Literal do `36` §F.4. `journey-start.spec.ts` (pool vazio: 1 aviso, próxima atividade diferente) e `brand-voice.test.ts` |
| `COPY.jornada.carregando` | "Separando suas questões…" | RU-2: texto de `/atividade/$activityId` depois de 400 ms de espera | Literal do `36`; só `brand-voice.test.ts` (aparece só em rede lenta, sem E2E do texto) |
| `COPY.jornada.erroPacoteTitulo` / `erroPacoteCorpo` / `voltarTrilha` | "Não deu pra carregar agora." / "Confere a internet e tenta de novo." / "Voltar à trilha" | RU-3: pacote de conteúdo indisponível, com "Tentar de novo" como ação primária | Literais do `36`. `journey-start.spec.ts` e `brand-voice.test.ts` |
| `COPY.jornada.depois(titulo)` | "Depois: {título}" | RU-12: próxima atividade da fila no card da Home (`text-xs text-nevoa`) e no resultado do nivelamento | Literal do `36`. `journey-start.spec.ts` e `placement.spec.ts` |
| `COPY.persistencia.falhaAoSalvar` | "Não consegui salvar neste aparelho. O que você fez agora pode se perder se fechar o app." | RU-4: faixa fixa (`PersistenceBanner`) com "Tentar de novo"; nunca some enquanto a gravação falha | Literal do `36`. `state-migration.spec.ts` (gravação sabotada; a tela de questão não diz "salvo") e `brand-voice.test.ts` |
| `COPY.persistencia.storageRecuperado` | "Não consegui ler seu progresso salvo. Guardei uma cópia e comecei do zero neste aparelho." | RU-5: uma vez, com "Ok", depois de copiar o JSON ilegível para `foca.state.corrupt.<ISO>` | Literal do `36`. `state-migration.spec.ts` e `brand-voice.test.ts` |
| `COPY.persistencia.versaoFutura` | "Seus dados são de uma versão mais nova do app. Recarregue a página para atualizar. Até lá, nada do que você fizer aqui fica salvo." | RU-6: storage de versão futura; as gravações desta aba ficam travadas | Literal do `36`. `state-migration.spec.ts` e `brand-voice.test.ts` |
| `COPY.nivelamento.aplicando` | "Montando sua trilha…" | RU-11: entre o fim do nivelamento e `placement.appliedAt` | Literal do `36`. `placement.spec.ts` |
| `COPY.nivelamento.resultadoTitulo` / `resultadoCorpo` / `resultadoSemDados` | "Pronto. Sua trilha foi ajustada." / "Isso é um ponto de partida, não uma nota. Muda conforme você estuda." / "Não tivemos questões suficientes para medir agora. Sua trilha começa pelo básico e se ajusta enquanto você estuda." | RU-10 (`36` §F.5): substitui o título e o corpo da §2.6. O "Pronto." inicial é o que os E2E esperam | Literais do `36`. `brand-voice.test.ts` (textos exatos) e `placement.spec.ts`. A busca por `nota` ignora só a frase de negação "não uma nota" (D-38 do `37`); fora dela, nenhum `\d+ ?%`, "nível N" ou "nota" |
| `COPY.nivelamento.precisaoFirme` / `precisaoInicial` / `precisaoPoucas` / `questoesRespondidas(n)` | "Estimativa firme" / "Estimativa inicial" / "Poucas questões. Vamos confirmar estudando." / "{n} questão(ões)" | Linha de precisão por área, pela SE da área (nunca o número) | Literais do `36` §F.5. `placement.spec.ts` e `brand-voice.test.ts` |
| `COPY.nivelamento.faixaAriaLabel(área, faixa, precisão)` | "{Área}: {faixa}. {precisão}." | `aria-label` do indicador de 3 segmentos (a cor nunca é o único sinal) | Formato do `36` §F.5. `placement.spec.ts` (`aria-label` exato) e `brand-voice.test.ts` |
| `COPY.nivelamento.porOndeComecamos` / `primeiraAtividade(titulo)` / `ctaIrParaTrilha` | "Por onde começamos" / "Sua primeira atividade: {título}" / "Ir para a trilha" | Fecho do resultado; o CTA "Ir para a trilha" só aparece com a jornada desligada (senão o CTA é "Começar") | Literais do `36`. `placement.spec.ts` e `brand-voice.test.ts` |
| `COPY.feedback.fonteOficial(fonte)` | "Questão do {fonte}" (ex.: "Questão do ENEM 2023") | RP-10: linha de atribuição na `FeedbackSheet` (`text-[11px] text-nevoa`), para item oficial | Formato do `34`. `feedback.spec.ts` (atribuição visível em item oficial; item não oficial não ganha linha) |
| `COPY.jornada.recapSemSalvo` | "Por agora é isso." | Recap da atividade quando a gravação local NÃO está ok (`persist !== "ok"`); com gravação ok segue `COPY.jornada.recap` ("Por agora é isso — seu progresso já está salvo.", inalterada). Escolha por `textoSePersistiu` em `RecapStepView` | RF-14/G-15 (achado A1, `37`). `persist-copy.test.ts` (variante, ordem e guarda estática) e `state-migration.spec.ts` ("nenhuma tela promete 'salvo'…") |
| `COPY.licao.sairCorpoSemSalvo` | "Não consegui guardar seu avanço. Se sair agora, talvez você precise recomeçar esta lição." | Corpo de "Sair da lição?" da aula/atividade (`MicroLessonPlayer`) com a gravação falhando; com gravação ok segue `COPY.licao.sairCorpo` (inalterada) | Mesmo teste. Diz o que aconteceu (não guardou) e o que muda para o aluno, sem culpa |
| `COPY.licao.sairCorpoLegado` / `sairCorpoLegadoSemSalvo` | "O progresso desta lição não fica salvo pela metade — você recomeça do zero na próxima vez." / "Se sair agora, você recomeça esta lição do zero na próxima vez." | Corpo de "Sair da lição?" da lição legada de redação (`LessonPlayer`); o texto antigo estava fixo no componente e foi para `copy.ts` | Mesmo teste (E2E com gravação sabotada na lição de redação) |
| `COPY.trilha.erroCorpoSemSalvo` | "Tenta de novo." | Corpo do erro da trilha (`TrailError`) com a gravação falhando; com gravação ok segue `COPY.trilha.erroCorpo` ("Tenta de novo. Seu progresso está salvo neste aparelho.", inalterada) | Mesmo teste (E2E força o erro com `progress.lessons: null` e a gravação sabotada; e o controle com gravação ok) |

Os blocos `COPY.cursos.*` e `BRAND.*` (RU-40, RU-20) estão nas §2.8 e §2.7. Revisão por autorrevisão contra `20` §7.1 (sem emoji, sem exclamação, sem cobrança); todas as strings acima são literais do plano, sem passar por skill de escrita.

### 2.10 Produto web integrado — entrada, painel da trilha e login (docs/44 §5/§7, 29/09/2026)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `COPY.entrada.painelTitulo` / `painelCorpo` | "O próximo passo já vem escolhido." / "Você conta qual é a sua prova e o Foca monta o ponto de partida. Depois, é abrir e seguir." | Painel da marca à esquerda do `EntryShell` (onboarding, login, recuperação) em ≥ 1024 px; abaixo disso não aparece | Promessa da linha "próximo passo já vem escolhido" de `docs/copy/01` §4. Sem duração, sem nota. Autorrevisão contra `20` §7.1 |
| `COPY.trilha.painelContexto` | "Seu dia" | `aria-label` do painel de contexto da trilha no desktop (`desk-aside`) | Rótulo funcional; sem skill |
| `login.tsx` (texto no componente, como antes) | "Bem-vindo de volta. Seu próximo passo está guardado." · CTA secundário "Começar grátis" | Substituem "Continue sua jornada" e "Começar em 60s" | Tira a duração em segundos (`06` §4); "Começar grátis" segue a decisão U-3 do `42`. O arquivo continua na lista da §3 (strings no componente) |
| `NAV.ctaComConta` (`src/marketing/content/copy.ts`) | "Continuar estudando" | CTA da landing quando o aparelho já tem conta e onboarding (`useContaNoAparelho`) | Não afirma progresso salvo; só leva a `/app` |

**Fechada em 28/09/2026 (D-34 do `37`, achado A1): frases estáticas de "salvo".** As quatro frases que afirmam persistência (`COPY.jornada.recap`, `COPY.licao.sairCorpo`, `COPY.licao.sairCorpoLegado`, `COPY.trilha.erroCorpo`) ganharam uma variante neutra, sem promessa, e o componente escolhe por `textoSePersistiu(usePersistStatus(), salvo, neutro)` (`src/lib/copy.ts`): só `persist === "ok"` mantém o texto original. Continuam com a palavra "salvo" só os avisos da faixa RU-4/RU-5/RU-6 (que descrevem a falha) e, fora do RF-14, os rótulos de favorito "Salvo!"/"Salvo" de flashcards (`study.tsx`, `flashcards.tsx`), que dizem que o flashcard está marcado, não que o progresso foi gravado.

## 3. Pendente — inventariado, não revisado

Levantamento por arquivo (não por string individual — a granularidade da seção 2 é o padrão a aplicar quando cada um destes for revisado). Nenhum destes foi confirmado livre de tom incompatível; tratar como não verificado.

| Área | Arquivos | Observação |
|---|---|---|
| Rotas de entrada | `welcome.tsx`, `quiz.tsx`, `aha.tsx`, `onboarding.tsx`/`signup.tsx` (redirects) | `aha.tsx` usa o slot `voz.aha`, não revisado nesta passada |
| Casca/navegação | `src/components/AppShell.tsx`, bottom nav | Rótulos curtos (Início/Estudar/Redação/Progresso/Perfil) — baixo risco de tom, mas não conferidos |
| Dashboard e progresso | `dashboard.tsx`, `progress.tsx`, `plan.tsx`, `topics.tsx` | Usa `atividadeHoje`, metas e lacunas — textos de estado (vazio/meta) não conferidos |
| Flashcards | `flashcards.tsx` | Tem bug de fila conhecido (docs/20 §2.5), fora do escopo desta fase; copy não revisada |
| Ranking | `ranking.tsx` | Precisa deixar claro que a turma é fictícia (já documentado como requisito em `CLAUDE.md`) — não conferido se o texto atual cumpre isso |
| Redação (mapa) | `redacao.index.tsx` | Mapa da trilha, 15 trilhas — copy de card/estado não conferida |
| Perfil/config | `profile.tsx`, `premium.tsx`, `login.tsx`, `forgot.tsx`, `offline.tsx` | `premium.tsx`/`offline.tsx` são demonstrativos — checar se o texto já avisa isso (regra de escopo do `CLAUDE.md`) |
| Vídeo | `video.$id.tsx` | Baixo volume de copy |
| Estados globais | `src/routes/__root.tsx` (`ErrorComponent`), `src/components/ds/EmptyState.tsx`, slots `voz.vazio`/`voz.404`/`voz.bomdia`/`voz.retorno`/`voz.meta`/`voz.nivel`/`voz.marco`/`voz.fimbom`/`voz.fimruim` | `errou`/`acertou` (os dois slots usados no loop de resposta corrigido na Fase 1/3) foram conferidos; os outros 8 slots de `voz.ts` não passaram pelo teste de tom desta fase — `retorno` já é o slot mais vigiado historicamente (`docs/15` §3.2) e não tem indício de cobrança numa leitura rápida, mas não tem teste de regressão ainda |
| Notificações locais | Não localizadas nesta busca — se existirem (push/local), não foram inventariadas |
| Acessibilidade | `aria-label`s espalhados pelo app fora de `FeedbackSheet`/`TutorBubble` | Não auditados nesta fase |
| Landing (`docs/design/brand/`) | Fora de `src/` | Não tocado — é conteúdo de marketing, não copy do app rodando |

## 4. Conteúdo pedagógico — explicitamente fora desta fase

`src/data/questions.ts` (59 questões) e `src/content/trilhas/` (134 lições, 1.204 exercícios) **não foram revisados nesta passada**, exceto a correção pontual de gabarito ambíguo em `q2` feita na Fase 1 (`docs/20` §2.5) — que é correção factual, não copy. O `20` §7.2 é explícito: revisão pedagógica é lote separado, com teste de gabarito, não substituição em massa. Nenhum enunciado/explicação foi reescrito aqui.

## 5. `docs/15`/`docs/16` — já apontavam pro `20`

Ambos os documentos já tinham nota de precedência para `docs/20` (adicionada na autoria do plano, 21/09/2026) — não precisaram de edição nesta Fase 3. `docs/15` §3.3 já previa "nunca cobra sobre o resultado" antes mesmo do `20`; a linha de `voz.errou` corrigida na seção 2 deste documento violava a própria regra antiga, não só a nova.

## 6. Próximos passos (não executados aqui)

- Revisar por lote as áreas da seção 3, começando por dashboard/progresso (maior tráfego pós-onboarding) e pelos 8 slots de `voz.ts` ainda não testados.
- Expandir `tests/unit/brand-voice.test.ts` conforme cada área for revisada, no mesmo padrão (grep de termos proibidos + leitura manual).
- Auditoria de acessibilidade dos `aria-label`s fora de `FeedbackSheet`/`TutorBubble`.
- Confirmar com o time se `ranking.tsx`/`premium.tsx`/`offline.tsx` deixam claro que são demonstrativos (regra de escopo do `CLAUDE.md`).
