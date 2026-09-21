# 18 — Especificação completa do aplicativo Abroad

Status: 🟢 **v1 (23/07) · 🎯 v1.1 afinado pelo counselor (23/07, tarde)** — blueprint completo do app. Enquanto o `08` é a **estratégia** (por quê / pra quem / negócio), este arquivo é o **como o app tem que ser**: arquitetura de informação, os 13 módulos detalhados, o motor de IA compartilhado, o modelo de dados, a stack técnica, o **reaproveitamento do app antigo (Flash Test)** e o roadmap de construção em fases.

> Pais deste arquivo: `14-persona-liz.md` (a pessoa), `08-produto-e-estrategia.md` (a estratégia). Voz: `15`/`17`. A **experiência tela-a-tela build-ready do protótipo** está em `21-especificacao-prototipo-abroad.md` (novo). Este `18` substitui, para o produto novo, o papel que os arquivos `10`–`12` tinham para o app antigo.

> **🎯 Afinação v1.1 (23/07, tarde) — o counselor entra na arquitetura.** O produto tem **dois lados** servidos pela mesma IA e pelo mesmo perfil vivo: **(1) o lado do aluno** (Liz) — o app já detalhado abaixo — e **(2) o lado do counselor** — um **counselor cockpit** onde o orientador vê a fila de alunos já pontuados/ranqueados pela IA e triagem em minutos (é o que sustenta os ~30 alunos/dia da `08` §11). A IA **amplia o counselor**, não o substitui. Mudanças: a lei #3 ("humano no circuito") agora tem nome — é o counselor; o motor de IA (Seção 4) ganha o componente de cockpit; e a experiência do aluno mostra a presença do counselor. Detalhe de como isso aparece no protótipo do pitch: `21`.

---

## 1. Princípios de produto (as 4 leis inegociáveis)

Tudo abaixo se subordina a estas quatro leis. Qualquer decisão de design que as fira está errada, por mais bonita que seja.

1. **Um ambiente só.** A dor da Liz é fragmentação (14 abas). O app perde a razão de existir no minuto em que ele mesmo vira 13 ferramentas soltas. Os 13 módulos têm que **se falar** e viver sob uma jornada única — não 13 abas independentes.
2. **O próximo passo, sempre.** Em qualquer tela, a pergunta "e agora?" tem **uma** resposta priorizada. Nunca despejar 40 tarefas. Sobrecarregar a Liz reproduz a caixa-preta dentro do app (ver `17` Seção 9).
3. **Confiabilidade no que é crítico.** Prazo, requisito e visto vêm com **fonte oficial datada + "confirme aqui"**. A IA aponta; a fonte confirma. Um dado crítico errado custa um ano à pessoa (ver `14` Seção 10). Isto é arquitetura, não disclaimer. **O "humano no circuito" tem nome: o counselor** (lei #5).
4. **A IA decide, não enfeita.** A IA governa o mapa, a priorização e a personalização a partir de **um perfil vivo** do usuário. Se um recurso funcionaria igual sem IA, ou ele não usa IA (tudo bem) ou está usando IA de enfeite (não tudo bem — a banca fura).
5. **A IA amplia o counselor, não o substitui.** Todo o diagnóstico pesado (anamnese, score/ranking, lacunas, mapa) é feito pela IA **para que um counselor humano** valide, personalize e acompanhe rendendo por ~30 alunos/dia. O aluno sente que tem um orientador; o counselor sente que a IA fez 80% do trabalho. Se o design esconder o counselor ou fingir que a IA é infalível e sozinha, feriu esta lei (e enfraquece a resposta a "isso é só ChatGPT?").

---

## 2. Arquitetura de informação — como os 13 módulos viram UM app

O erro fatal seria uma navegação com 13 itens. Os 13 módulos se organizam em **4 espaços** + **1 camada transversal**, todos ancorados na **Jornada**:

```
┌─────────────────────────────────────────────────────────────┐
│  CO-PILOTO DE IA  (transversal — presente em toda tela)      │
├─────────────────────────────────────────────────────────────┤
│  🏠 JORNADA (home)   → orquestra tudo: etapas, próximo passo, │
│                        prazos, progresso. O centro de gravidade.│
│                        [módulos 5, 7-prazos, 13-prazos]        │
├───────────────┬───────────────┬─────────────────────────────┤
│ 🧭 DESCOBRIR   │ 🛠️ CONSTRUIR   │ 📁 ORGANIZAR                 │
│ (o mapa/saber)│ (a execução)  │ (ativos/rastreio)           │
│ diagnóstico(1)│ redação(9)    │ documentos(6)               │
│ lacunas(2)    │ currículo(8)  │ bolsas — acompanhamento(7)  │
│ universidades(3)│ extracurric(10)│ financeiro — controle(12) │
│ custos/reqs(4)│ entrevista(11)│                             │
│ financeiro(12)│               │                             │
│ visto(13)     │               │                             │
└───────────────┴───────────────┴─────────────────────────────┘
```

**Regra de ouro da navegação:** a Liz **nunca precisa saber que existem 13 módulos.** Ela abre na **Jornada**, vê onde está e o próximo passo, e o app a leva ao módulo certo na hora certa. Os espaços (Descobrir/Construir/Organizar) existem pra quem quer explorar por conta — mas o caminho padrão é guiado pela Jornada.

**A Jornada é a espinha dorsal.** É uma linha de etapas (ver `08` Seção 4) que a IA personaliza por perfil/país. Cada etapa "acende" os módulos relevantes no momento certo. Exemplo: na etapa "Provas", a Jornada destaca o diagnóstico de nível e a agenda de SAT/TOEFL; na etapa "Aplicação", destaca redação, currículo e documentos. **Isso é o que transforma 13 módulos numa história única.**

---

## 3. Os 13 módulos — detalhamento

Formato de cada módulo: **o que faz · papel da IA · entrada→saída · confiabilidade · estado (MVP/V1/Futuro) · reaproveita do legado**.

### Espaço DESCOBRIR (o mapa)

**Módulo 1 — Diagnóstico de perfil**
- **O que faz:** onboarding conversacional (não formulário) que capta objetivo (país/área/nível), momento escolar, notas, nível de inglês, orçamento e apetite de bolsa. É a porta de entrada e o gerador do aha.
- **IA:** interpreta as respostas e gera o retrato do candidato + a primeira versão da Jornada + o primeiro "próximo passo". *Por que IA:* transformar respostas soltas em um caminho nomeado é interpretação, não regra fixa.
- **Entrada→saída:** respostas do quiz → perfil estruturado + caminho de 5 etapas + próximo passo.
- **Confiabilidade:** baixo risco (é diagnóstico, revisável).
- **Estado:** ✅ **MVP (núcleo)**.
- **Reaproveita:** o **quiz de primeiro acesso do app antigo** (10 perguntas encenadas como "criar conta", swipe vertical, "isso não é cadastro"). Padrão de UI, fluxo e copy reaproveitáveis quase diretos — troca o conteúdo (cidade/faculdade ENEM → objetivo/país/orçamento).

**Módulo 2 — Pontos fortes e lacunas**
- **O que faz:** aponta o que já pesa a favor da Liz (notas, atividades) e o que falta construir pro alvo (ex.: "falta prova de inglês", "extracurricular fraco pra Ivy").
- **IA:** compara o perfil com os requisitos típicos do alvo e nomeia forças/lacunas em linguagem humana.
- **Entrada→saída:** perfil + alvo → lista priorizada de forças e lacunas, cada uma virando candidata a tarefa na Jornada.
- **Confiabilidade:** média (é orientação; ancorar em requisitos reais das universidades-alvo).
- **Estado:** ✅ **MVP** (versão simples).
- **Reaproveita:** o **"mapa de lacunas"** do app antigo — mesma mecânica (IA nomeia as 3 maiores lacunas), agora sobre o perfil de aplicação em vez de conteúdo de ENEM.

**Módulo 3 — Recomendação de universidades**
- **O que faz:** sugere universidades realistas em três faixas — **sonho / alvo / segurança** (reach/match/safety) — pro perfil e bolso.
- **IA:** match multivariável (perfil × requisito × custo × chance realista × disponibilidade de bolsa). Explica **por que** cada uma.
- **Entrada→saída:** perfil + preferências → lista de universidades com razão, requisito, custo e chance estimada.
- **Confiabilidade:** **alta** — requisitos e custos precisam ser reais e datados; "chance" é estimativa e deve ser rotulada como tal.
- **Estado:** ✅ **MVP** (banco curado de ~3–5 universidades pra demo; V1 amplia).
- **Reaproveita:** a lógica de **recomendação personalizada** do motor antigo (que roteava questão pela lacuna) — mesma ideia de "ranquear pelo perfil", agora ranqueando universidades.

**Módulo 4 — Comparação de custos e requisitos**
- **O que faz:** tabela lado a lado das universidades salvas — mensalidade, custo de vida, provas exigidas, prazos, bolsas.
- **IA:** normaliza e resume dados heterogêneos; responde perguntas comparativas ("qual é mais barata considerando bolsa?").
- **Entrada→saída:** universidades salvas → comparativo estruturado.
- **Confiabilidade:** **alta** — todo número com fonte + data.
- **Estado:** 🟡 **MVP simples** (comparar as poucas da demo) → V1 completo.
- **Reaproveita:** componentes de tabela/card do design system antigo (re-skin).

**Módulo 12 — Planejamento financeiro** *(vive em Descobrir + Organizar)*
- **O que faz:** estima o **custo total** da empreitada (mensalidade + vida + provas + viagem) e monta um plano de como cobrir (bolsa + família + eventual financiamento).
- **IA:** projeta cenários de custo por universidade e simula o impacto de bolsas.
- **Entrada→saída:** universidades + orçamento familiar + bolsas → custo total estimado + plano de financiamento.
- **Confiabilidade:** alta nos custos (fonte); as projeções são estimativas rotuladas.
- **Estado:** 🟡 V1 (no MVP entra como número no aha, não como engine).
- **Reaproveita:** nada específico do legado; usar o framework de DRE/cenários que o Nicolas já domina (`02`/`07`).

**Módulo 13 — Orientação para visto**
- **O que faz:** guia o processo de visto de estudante do país-alvo (tipo de visto, documentos, prazos, entrevista consular).
- **IA:** monta o checklist do visto certo pro caso dela e responde dúvidas — **sempre** com fonte oficial (consulado/embaixada) datada.
- **Entrada→saída:** país + universidade + situação → checklist de visto + prazos + link oficial.
- **Confiabilidade:** **máxima** — é o item onde errar é mais grave. Humano no circuito + fonte oficial obrigatória. A IA nunca "crava" regra de visto sozinha.
- **Estado:** 🟡 V1 (no MVP aparece como etapa da Jornada, com link oficial, sem engine).
- **Reaproveita:** o padrão de **"foto de questão"** do balão antigo, agora ressignificado: **foto de um documento/edital → IA lê e extrai requisitos** (visão multimodal reaproveitada).

### Espaço CONSTRUIR (a execução)

**Módulo 9 — Mentoria para redações** ⭐ *(o maior reaproveitamento do legado)*
- **O que faz:** orienta a redação de admissão (personal statement / essays) **por competência/parte** — encontrar o tema pessoal, estruturar, "mostrar em vez de contar", revisar tom — em micro-exercícios, não "escreve por ela".
- **IA:** dá feedback específico competência a competência; avalia autenticidade e alinhamento ao que a universidade valoriza. *Guardrail:* o texto é da Liz; a IA orienta e revisa (universidades penalizam texto de IA).
- **Estado:** ✅ **MVP** como **módulo-herói de execução** (mostrar 1 interação na demo).
- **Reaproveita:** o **"Vitor"** — o motor de redação do app antigo (micro-drills competência a competência, **134 lições / 1204 exercícios** já estruturados). É o ativo mais valioso a herdar: a **arquitetura de exercícios** de redação já existe; muda o conteúdo (as 5 competências do ENEM → as competências da redação de admissão: narrativa pessoal, especificidade, estrutura, voz, encaixe com a universidade). **Isto sozinho pode virar o diferencial da demo.** Ação: reavaliar o Vitor sob a ótica de admission essay (ver `08` Seção 5, cenários A/B/C — a lógica de decisão se mantém).

**Módulo 8 — Construção de currículo**
- **O que faz:** monta o currículo/CV no padrão que universidades estrangeiras esperam (diferente do modelo brasileiro).
- **IA:** sugere como descrever atividades com impacto, organiza por relevância pro alvo, aponta buracos.
- **Estado:** 🟡 V1 (MVP: mock/tela ilustrativa).
- **Reaproveita:** padrão de **feedback da IA** (o balão que explicava o erro) aplicado a "melhore esta linha do CV".

**Módulo 10 — Projetos extracurriculares**
- **O que faz:** ajuda a planejar/registrar atividades que fortalecem a aplicação (não inventar — potencializar o que ela faz e sugerir novas coerentes com o perfil).
- **IA:** sugere projetos alinhados ao objetivo e ajuda a articular o impacto deles.
- **Estado:** 🟡 V1.
- **Reaproveita:** lógica de **recomendação personalizada** + o padrão de tarefas/progresso.

**Módulo 11 — Preparação para entrevistas**
- **O que faz:** simula e treina a entrevista de admissão/visto (banco de perguntas + prática + feedback).
- **IA:** conduz simulação, dá feedback de conteúdo e (V1) de fala/áudio.
- **Estado:** 🟡 V1 (Futuro: simulação por voz).
- **Reaproveita:** o **feed vertical de "dose curta" + resposta imediata + repetição espaçada** do app antigo — perfeito pra drills de pergunta de entrevista (uma pergunta por tela, resposta, feedback, volta as difíceis).

### Espaço ORGANIZAR (ativos e rastreio) + JORNADA (orquestração)

**Módulo 5 — Planejamento de tarefas** *(coração da Jornada)*
- **O que faz:** transforma o processo inteiro num cronograma de tarefas com prazos, mostrando **sempre o próximo passo** priorizado.
- **IA:** gera e recalcula o plano por perfil/alvo/prazo; prioriza por prazo × impacto × pré-requisito.
- **Estado:** ✅ **MVP** (a Jornada é núcleo).
- **Reaproveita:** as mecânicas de **progresso/XP/marcos** do app antigo — **sem streak punitivo** (aposentado já na fase antiga; alinhado à lei #2). Vira "progresso da jornada" e "marcos concluídos".

**Módulo 6 — Controle de documentos**
- **O que faz:** checklist + cofre do que reunir (histórico, cartas de recomendação, passaporte, comprovantes) com status por universidade.
- **IA:** monta o checklist certo por universidade/país; (V1) valida se o documento enviado bate com o pedido.
- **Estado:** 🟡 V1 (MVP: tela mock).
- **Reaproveita:** **upload/visão multimodal** do balão antigo (foto de questão → foto de documento).

**Módulo 7 — Busca de bolsas** *(Descobrir + Organizar)*
- **O que faz:** encontra bolsas compatíveis com o perfil e **acompanha os prazos** delas na Jornada. Serve à Liz mesmo tendo dinheiro (mérito + abater custo alto — ver `14` Seção 3/9).
- **IA:** match perfil × critérios da bolsa; prioriza por chance e prazo.
- **Confiabilidade:** alta (critérios e prazos com fonte).
- **Estado:** 🟡 V1 (MVP: mock com 2–3 bolsas curadas). Candidato alternativo a módulo-herói da demo (ver `08` Seção 5).
- **Reaproveita:** motor de **match personalizado** + acompanhamento de prazo da Jornada.

---

## 4. O motor de IA (a inteligência compartilhada)

O que faz os 13 módulos serem **um app** e não 13 é uma camada de IA central sobre **um perfil vivo**. Componentes:

- **Perfil vivo (o estado central):** um objeto que guarda tudo que o app sabe da Liz (objetivo, notas, inglês, orçamento, universidades salvas, tarefas feitas, redações em andamento, documentos). **Todo módulo lê e escreve nele.** É o que o ChatGPT não tem (não guarda estado) e é o coração do produto.
- **Priorizador do "próximo passo":** função que, a cada momento, escolhe **um** próximo passo = maior (impacto na aplicação × urgência de prazo) sujeito a pré-requisitos. Alimenta a Jornada e cada módulo.
- **Camada de confiabilidade:** todo dado crítico (prazo, requisito, visto, custo) passa por uma base **curada e datada com fonte**; a IA **cita** essa base e nunca inventa. Onde a base não cobre, a IA responde "confirme na fonte oficial" com o link, em vez de chutar.
- **Co-piloto conversacional:** interface única de IA (o "balão" reaproveitado) que responde puxando o perfil, explica, mentora redação e aceita **upload de imagem/documento** (visão multimodal). Presente em toda tela.
- **Counselor cockpit (o lado do orientador — novo, afinação 23/07):** a mesma IA que serve a Liz gera, para o **counselor**, uma **fila de alunos já pontuados e ranqueados** (readiness, 3 maiores lacunas, próximo passo sugerido, universidades salvas). O counselor abre um aluno, vê o diagnóstico pronto, ajusta/aprova o plano e dispara a orientação — em minutos, não em uma reunião de 1h. **É o que materializa os ~30 alunos/dia** (`08` §11) e é a prova visível de que "a IA amplia o counselor". No perfil vivo, o counselor é mais um leitor/escritor do mesmo estado. (No pitch, pode ser uma tela real leve ou um mock convincente — ver `21`.)
- **Guardrails (regras de sócio):** (a) itens críticos sempre com fonte; (b) redação = orientar, nunca escrever; (c) "chance de admissão" e projeções sempre rotuladas como estimativa; (d) humano no circuito onde o erro é caro (visto, prazos) — **esse humano é o counselor**.

**Para a banca — o que a IA decide, com que dado, e o plano B se errar:** decide o mapa (perfil→caminho), a recomendação de universidades (perfil→match), a priorização (estado→próximo passo) e o feedback de redação (texto→crítica). Dado de entrada = o perfil vivo + a base curada. Plano B = tudo é revisável pela Liz + itens críticos atrelados à fonte oficial. (Responde direto o `02` "Papel da IA".)

---

## 5. Modelo de dados (entidades núcleo)

```
Usuário/Perfil ── objetivo, país-alvo, nível, notas, inglês, orçamento, apetite de bolsa
   │
   ├─< Etapa da Jornada ──< Tarefa (título, prazo, status, módulo, prioridade)
   ├─< UniversidadeSalva ── (ref Universidade) + status de aplicação + chance estimada
   ├─< BolsaSalva ─────── (ref Bolsa) + prazo + status
   ├─< Documento ──────── tipo, status, arquivo, universidade-alvo
   ├─< Redação ────────── universidade-alvo, versões, feedback por competência
   └─< PlanoFinanceiro ── custo total estimado, fontes de recurso

Universidade (curada) ── nome, país, custo, requisitos, provas, prazos, FONTE + DATA
Bolsa (curada) ──────── nome, critérios, valor, prazo, FONTE + DATA
FonteOficial ────────── url, data de verificação, tipo (universidade/consulado/prova)
```

**Regra de dados:** toda `Universidade`, `Bolsa` e regra de visto carrega **fonte + data de verificação**. Sem fonte, o dado não entra (lei #3). É o que separa a base do Abroad de um scrape genérico.

---

## 6. Arquitetura técnica (stack e reaproveitamento)

- **App shell / frontend:** reaproveitar a base do protótipo antigo — **TanStack Start + React (via Lovable)** já montada em `D:\Matheus Vellozo\Aplicativo Flash Test\`. Roteamento, componentes, estado, auth mockada e o padrão de telas são scaffolding reutilizável; muda-se o conteúdo e a marca. **Não recomeçar do zero.**
- **Camada de IA:** reaproveitar a integração já feita (o provider **gpt-5.4-mini / crédito OpenAI** já plugado no legado). Prompts seguem o método **PACE** (`07`) e as regras de voz (`17`).
- **Base de dados curada:** planilha/JSON versionado de universidades e bolsas **com fonte e data** (fonte de verdade Conteúdo→devs). Começa pequena (3–5 universidades reais pra demo) e cresce.
- **Persistência:** perfil vivo em store local/simples no MVP (sem auth real); V1 com backend real e login.
- **Multimodal:** endpoint de visão para upload de documento/edital (reaproveita o "foto de questão").
- **Landing page:** reaproveitar o padrão de LP do legado, re-skin Abroad, terminando em "ver demonstração".

---

## 7. Reaproveitamento do legado — mapa completo (a resposta direta à sua pergunta)

| Ativo do app antigo (Flash Test/ENEM) | Como vira recurso do Abroad | Esforço |
|---|---|---|
| **Quiz de primeiro acesso** (10 perguntas, "criar conta" mockado, swipe) | **Diagnóstico de perfil** (módulo 1) — troca o conteúdo, mantém fluxo/UI/copy | Baixo — quase direto |
| **Mapa de lacunas** (IA nomeia 3 lacunas) | **Pontos fortes e lacunas** (módulo 2) sobre o perfil de aplicação | Baixo |
| **Motor de recomendação** (roteava questão pela lacuna) | **Recomendação de universidades/bolsas** (match personalizado) | Médio — muda o objeto rankeado |
| **"Vitor" — motor de redação** (134 lições/1204 exercícios, micro-drills por competência) | **Mentoria de redação** (módulo 9) — re-tematizar competências ENEM → admission essay | Médio — **maior ganho**, engine pronta |
| **Balão de tutor IA** (widget, mostra desempenho, aceita foto) | **Co-piloto de IA** transversal (mostra status da jornada, aceita foto de documento) | Baixo — mesmo padrão |
| **Foto de questão → IA resolve** (visão multimodal) | **Foto de edital/documento → IA extrai requisitos** | Baixo — mesmo endpoint |
| **Feed vertical + dose curta + resposta imediata + repetição espaçada** | **Drills de entrevista** (módulo 11) e prep de provas (roadmap) | Médio |
| **Gamificação/progresso/XP** (streak já aposentado) | **Progresso da Jornada / marcos** — sem streak punitivo (lei #2) | Baixo |
| **App shell** (TanStack Start/React/Lovable) | **Scaffolding do Abroad** — re-skin + repurpose de telas | Baixo-médio |
| **Integração de IA** (gpt-5.4-mini/OpenAI) | **Camada de IA do Abroad** — mesma plumbing, novos prompts | Baixo |
| **Design system (componentes)** | Estrutura de componentes reaproveitada, **re-skin com a marca Abroad** (inicial A) | Baixo |
| **Padrão de landing page** | **LP do pitch** do Abroad | Baixo |

**Leitura de sócio:** a pivô **não joga fora o trabalho de código** — ela reaproveita quase toda a engenharia (shell, IA, quiz, motor de redação, balão, visão, progresso) e troca o **domínio** (ENEM → aplicação internacional) e a **marca**. O que muda de verdade é o **conteúdo curado** (universidades/bolsas com fonte) e a **arquitetura de informação** (a Jornada como espinha). Isso torna a pivô muito mais barata de executar do que parece.

---

## 8. Roadmap de construção em fases

### Fase 0 — MVP do pitch (o mínimo que prova a tese)
Núcleo funcional (lei #1 e #2 visíveis): **Diagnóstico (1) → Lacunas (2) → Recomendação de universidades (3) + comparação simples (4) → Jornada com próximo passo (5) → Co-piloto de IA ao vivo com fonte oficial** + **1 módulo-herói de execução** (Redação/Vitor ⭐ ou Bolsas). Resto = mock/etapa na Jornada. Dados: 3–5 universidades reais e datadas. (Detalhe do Golden Path no `08` Seção 7.)

### Fase 1 — Produto real (pós-pitch, se virar venture)
Backend + auth reais; ampliar base de universidades/bolsas; ativar Documentos (6), Bolsas (7) com match real, Currículo (8), Financeiro (12) como engine, Visto (13) com checklist. Confiabilidade em produção (base curada mantida).

### Fase 2 — Diferenciação e moat
Entrevista por voz (11); motor de recomendação que aprende com dados de aplicações reais (quais perfis entram onde — o moat do `08` Seção 10); alertas proativos de mudança de prazo/requisito; camada humana (mentores que já entraram).

**Mapeamento módulo × fase:** MVP = 1,2,3,5,9(ou7) + co-piloto · V1 = 4,6,7,8,12,13 · Futuro = 10,11 completos + moat de dados.

---

## 9. Engajamento e retenção (repensados para uma jornada longa)

A jornada dura 12–24 meses — retenção é diferente de um app de hábito diário. O engajamento vem de **progresso visível + prazos vivos + próximo passo**, não de streak:

- **Progresso da Jornada:** a barra de etapas se preenchendo é a prova de que o projeto anda (antídoto ao "depois eu vejo").
- **Marcos, não sequência:** celebrar conquistas reais ("prova agendada", "primeira redação revisada", "3 universidades na lista") — creditando **a ela**, nunca ao app.
- **Prazos como serviço:** notificação = alerta útil de prazo real (a urgência legítima do `17` Seção 12), nunca FOMO.
- **Retorno sem sobrecarga:** quem some e volta encontra **o próximo passo esperando**, não um muro de 40 tarefas atrasadas (lei #2).

---

## 10. Confiabilidade e segurança do dado crítico (a arquitetura de confiança)

Expansão da lei #3, porque é o diferencial e o maior risco:

- **Base curada com fonte + data** para todo prazo/requisito/custo/regra de visto.
- **Rótulo de frescor:** cada dado crítico mostra "verificado em [data]" + link oficial.
- **Fallback honesto:** onde a base não cobre ou pode ter mudado → "confirme na fonte oficial [link]", nunca um chute.
- **Humano no circuito** nos itens de custo de erro alto (visto, prazos de aplicação).
- **Separação clara IA vs. fonte:** a IA acelera, personaliza e explica; a **fonte oficial decide** no que mata a aplicação. Essa fronteira é dita ao usuário, não escondida.

---

## 11. Métricas de sucesso do produto

- **Ativação:** % que completa o diagnóstico e vê o mapa/aha (o momento de valor). Meta alta — é curto (3 min).
- **Engajamento da jornada:** nº de etapas avançadas / próximo passo concluído por semana.
- **Confiança:** % de itens críticos consultados via fonte oficial (uso do recurso de confiabilidade).
- **Retenção longa:** permanência ao longo dos meses até a aplicação (a jornada segura naturalmente).
- **Conversão:** free (diagnóstico + mapa) → pago (processo completo), ancorado no custo da consultoria.
- **Estrela do norte:** aplicações efetivamente enviadas dentro do prazo (e, no longo prazo, admissões/bolsas conquistadas) — é o resultado que prova o produto.

---

## 12. Riscos de produto e mitigação

- **Virar 13 abas soltas** → mitigação: a Jornada como espinha e a lei #1; navegação por 4 espaços, não por 13 módulos.
- **Dado crítico errado** → mitigação: base curada com fonte + fallback + humano no circuito (Seção 10).
- **Sobrecarregar a Liz** → mitigação: lei #2, "um próximo passo".
- **IA parecer enfeite** → mitigação: lei #4, IA sobre perfil vivo governando mapa/priorização/recomendação.
- **Escopo estourar** (13 módulos) → mitigação: roadmap em fases; MVP com núcleo + 1 herói.
- **Manutenção da base de dados** (universidades/bolsas mudam) → mitigação: tratar curadoria como processo contínuo com dono (não projeto único); é custo real, reconhecer no negócio (`08` Seção 11).

---

## 13. Registro de decisões

```
23/07 — criado o blueprint completo do app (este arquivo, 18). Estratégia fica no 08;
   o "como o app tem que ser" fica aqui.
23/07 — arquitetura de informação definida: 4 espaços (Descobrir/Construir/Organizar) +
   Co-piloto transversal, todos ancorados na JORNADA (home/orquestração). Os 13 módulos
   NÃO viram 13 abas — a Liz navega pela Jornada e o app a leva ao módulo certo.
23/07 — 4 leis de produto travadas: um ambiente só · o próximo passo sempre · confiabilidade
   no crítico · IA decide, não enfeita.
23/07 — motor de IA central sobre "perfil vivo" definido como o que une os 13 módulos e
   diferencia do ChatGPT (que não guarda estado).
23/07 — reaproveitamento do legado mapeado (Seção 7): quase toda a engenharia do Flash Test
   se reaproveita (shell, IA, quiz→diagnóstico, mapa de lacunas→forças/lacunas, Vitor→
   mentoria de redação, balão→co-piloto, foto de questão→foto de documento, progresso sem
   streak). Muda o DOMÍNIO e a MARCA, não a engenharia. Pivô mais barata do que parece.
23/07 — Vitor (motor de redação, 134 lições/1204 exercícios) eleito maior ativo herdado —
   candidato a diferencial da demo, re-tematizando competências ENEM → admission essay.
```
