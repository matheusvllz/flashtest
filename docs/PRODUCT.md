# Product

<!-- impeccable:product-schema 1 -->

> **O que é este arquivo.** Um resumo durável do produto, lido por agentes e skills (Impeccable lê `docs/PRODUCT.md` direto; as skills de marketing chegam aqui via `.agents/product-marketing.md`). Nada aqui é novo: cada linha vem de um documento do SDD, citado entre parênteses. **Se este resumo divergir da fonte, a fonte vence**, e este arquivo é que está desatualizado. Lacunas reais estão marcadas **TODO/UNKNOWN**, nunca preenchidas por inferência. Criado em 22/09/2026 ([docs/ai/SKILLS.md](ai/SKILLS.md)).

## Platform

web

## Users

- **Persona única: João.** 16–19 anos, ensino médio ou pré-vestibular, nativo de TikTok/Reels. Estuda em tempo fragmentado (intervalo, ônibus, fila, antes de dormir); a atenção é curta e disputada. Tem conteúdo de sobra (YouTube, apostila, o app gratuito do MEC) e pouco dinheiro (`14` §1, §4).
- **Objetivo declarado:** passar no vestibular/ENEM para um curso e uma faculdade específicos. **Objetivo real, não declarado:** parar de se sentir atrasado (`14` §1).
- **Job to be done:** "Quando eu tenho 2 minutos livres e bate a sensação de que estou ficando pra trás, eu quero fazer alguma coisa que conte de verdade pro meu vestibular, pra eu sentir que hoje eu não perdi o dia." Tem que caber em 2 minutos, contar de verdade e dar prova visível de progresso (`14` §5).
- **Gatilho emocional:** alívio, não ambição. A culpa não faz o João voltar; ela o faz evitar o app (`14` §4, §6).
- Toda feature se testa contra ele: *isso resolve o João, ou um estudante genérico?* (`14` §0).
- Público é menor de idade na maior parte: coleta adicional de dados de menores **não está autorizada** (`20` §22).

## Product Purpose

- App mobile-first de preparação para o ENEM em **aulas de 60 segundos** (1–2 questões por vez), feedback imediato, e uma trilha que decide o próximo passo (`08` §1; `CLAUDE.md`).
- A dor tratada é falta de **constância** (o hábito não gruda) + falta de **direção** (não sabe onde está fraco) — não falta de conteúdo (`08` §0, §1; `14` §3).
- Sucesso, na visão de produto: o aluno fecha o app pensando "pelo menos hoje eu fiz alguma coisa" e volta amanhã (`14` §6; `08` §2, loop central).
- Estado atual: protótipo funcional, sem backend; login e cadastro são mock intencional (`CLAUDE.md`, "Stack real").

## Positioning

- Frase de posicionamento: *"Não é mais aula. É o hábito que te aprova. 60 segundos por dia."* (`08` §1).
- Linha de defesa: *conteúdo todo mundo já tem de graça, inclusive do governo — o que ninguém resolve é constância e saber exatamente onde você está fraco* (`08` §10).
- O concorrente real é o **MEC Enem** (grátis, oficial, conteúdo completo + correção de redação). Qualquer proposta que compita em "mais conteúdo" perde por padrão (`08` §0, §10).
- Diferença vs. ChatGPT direto: currículo, estado do aluno, decisão do que estudar amanhã, hábito (`08` §10).

## Operating Context

- Uso em celular, em blocos de segundos a poucos minutos, frequentemente no meio de outra coisa (`14` §4). O app compete com o feed, não com o caderno.
- Estrutura atual (Jornada V2, implementada em 22/09/2026): home é `/trilha`; hierarquia matéria → seção → capítulo → lição; lição = sequência de passos (intro/teach/tip/question/recap, 4–8 questões com dificuldade progressiva); revisão de capítulo; bottom nav com 4 itens — Aprender, Praticar, Progresso, Perfil (`25`, `26`).
- Segundo pilar: micro-treino de redação — 15 trilhas, 134 lições, 1.204 exercícios, hoje integrados à trilha como capítulos legados (`08` §5; `26` §2).
- Tutor de IA (a Foca) num balão global, **somente sob demanda**: errar nunca abre nem envia mensagem ao tutor automaticamente (`20`, precedência; `25` "Como usar", item 7).

## Capabilities and Constraints

**Existe (ver `22` e `26` para evidência):** trilha como home, lições por passos, revisão de capítulo, feedback imutável, tutor manual com IA (OpenAI `gpt-5.4-mini` via server function, fallback local em erro/timeout de 12s), identidade sonora por evento, flashcards com repetição espaçada, progresso/mapa de lacunas, ranking **mock** (a tela diz isso), dark mode.

**Restrições técnicas duras** (`CLAUDE.md`; `25` "Como usar", item 4):
- Um só store (`src/lib/store.ts`, `useSyncExternalStore` + `localStorage`); nunca um segundo mecanismo de estado.
- Sem backend, sem banco, sem autenticação real, sem pagamento.
- Sem nova biblioteca de UI, nova dependência de IA ou nova biblioteca de áudio sem decisão registrada em spec.
- Chave da IA só no servidor; nunca `VITE_*`.
- `src/routeTree.gen.ts` é gerado; nunca editar à mão.
- Repo conectado ao Lovable: nunca reescrever histórico publicado.

**Não autorizado automaticamente** (`20` §14, §22): analytics externo, coleta adicional de dados de menores, pagamento real, ranking real, notas previstas, geração livre de aulas em tempo real.

**Terminologia** (`25`, vocabulário): Matéria, Seção, Capítulo, **Lição** (tipo `MicroLesson` no código), passos (`LessonStep`), Questão.

**TODO/UNKNOWN:** lacunas ainda são heurística local (`src/lib/gaps.ts`), não refinadas por IA (`08` §6, horizonte 2) — o discurso "IA que aprende a lacuna" ainda não é verdade no código.

## Brand Commitments

- **Nome e mascote:** Foca. A mascote é a marca (estilo Duo); sempre via `<FocaMark />`, nunca esticada nem rotacionada; aparece em transições emocionais, nunca como decoração de header nem durante a questão (`15` §1, §4; `CLAUDE.md`).
- **Voz vigente** (`20` §7.1 — prevalece sobre o arquétipo "cobradora" do `15`): colega de estudo atento e direto, que entende a dificuldade sem dramatizar. Não é professor dando sermão, coach, nem adolescente performático. Humor no máximo uma vez por sessão, sobre a mascote ou a situação, nunca sobre a capacidade do aluno. Sem emoji em controles, erros, explicações ou alertas. Sem sequência de exclamações. Retorno sem culpa, ameaça ou cobrança pela ausência.
- **Tamanhos-alvo de copy** (`20` §7.1): botão 1–4 palavras; feedback 2–7; fala decorativa até 14; explicação curta 25–55; card de ensino 15–35.
- **Onde a copy vive:** strings funcionais em `src/lib/copy.ts` (inventariadas no `21`); falas da mascote em `src/lib/voz.ts`, escolhidas no evento e armazenadas, nunca sorteadas no render (`20`; `21`).
- **Identidade visual:** Rabisco na Margem — ver [DESIGN.md](DESIGN.md). Recompensa não usa "dopamina" como justificativa (`20`, precedência).
- **Linhas que não se cruzam** (`16` §9): sem rolagem infinita; sem recompensa aleatória; sem bloquear estudo como punição; sem vender recuperação de streak; sem comparação humilhante; notificação só 08h–21h, no máximo 1 por dia; nunca esconder o botão de sair.

## Evidence on Hand

- Conteúdo real: 59 questões cobrindo 11 matérias (`08` §8); 134 lições / 1.204 exercícios de redação (`08` §5); conteúdo novo da Jornada V2 (`26`).
- Testes: 257 unitários + 33 E2E passando em 22/09/2026, incluindo projeto Playwright `narrow` 320×700 (`26`).
- Copy de landing escrita na voz do João (`13`); LP do link da bio em `docs/brand/`.
- **Ausências que ninguém pode preencher por inferência:**
  - Nenhuma entrevista estruturada com aluno foi feita (`08` §8; `14` §10) — **não inventar depoimento, citação ou persona validada**.
  - Nenhum dado de retenção próprio (`08` §10) — **não afirmar que o aluno volta**.
  - Preço, DRE e custo de IA por aluno nunca foram fechados (`08` §11) — **não inventar preço nem plano pago**.
  - Nenhuma revisão pedagógica externa do conteúdo novo; nenhum teste em dispositivo físico; nenhuma observação de participante real (`26` §8).

## Product Principles

1. **Constância e direção, não conteúdo.** Se a feature não serve ao hábito ou à personalização, a resposta padrão é não (`08` §0).
2. **Custo de começar quase zero.** Uma unidade curta, um CTA, o app decide o próximo passo — escolher é o que paralisa (`14` §8).
3. **Recomeço sem culpa.** Streak e retorno nunca punem; errar é o app funcionando (`14` §6; `15` §3.3; `20` §7.1).
4. **IA no centro, não cosmética — e honesta.** Toda IA responde o que decide, com que dado e o que acontece se errar; números são regra de negócio, só a frase é IA; nunca vender heurística como inteligência (`00-constituicao`; `08` §6).
5. **Aula tem fim.** Recompensa informa progresso e competência; nada de loop infinito nem ansiedade monetizada (`16` §9; `20`, precedência).

## Accessibility & Inclusion

- `prefers-reduced-motion` obrigatório: a recompensa (cor, som, número) continua sem movimento (`16` §5; `src/styles.css`).
- Foco visível em todo elemento interativo (`:focus-visible`, 3px na cor de foco — `src/styles.css`).
- Contraste AA em texto: o verde de sucesso ganhou variante de texto (`--success-texto`) porque o original reprovava (3.4:1) (`src/styles.css`).
- Mobile a partir de 320px de largura (projeto Playwright `narrow` 320×700, `26`).
- Público 16–19 anos: linguagem simples, termos técnicos explicados (`20` §7.1).
- **TODO/UNKNOWN:** padrão formal (ex.: WCAG 2.2 AA) não foi declarado como requisito em nenhuma spec; teste com leitor de tela real não foi registrado.

## Métricas

- **A métrica que decide a tese:** o aluno volta no dia seguinte? Hoje **não é medida** (`08` §10) — **TODO/UNKNOWN**.
- Medição local ou em pesquisa consentida; analytics externo exige escopo e autorização específicos (`20` §14, §16 fase de piloto, §22).
- **TODO/UNKNOWN:** não há métricas de funil, conversão ou North Star formalizadas em spec.
