# 08 — Produto & Estratégia (Flash Test)

> **Atualização de precedência — 21/09/2026:** a evolução do Foca para aprender → praticar → revisar está especificada em [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md), ainda não implementada. Nos assuntos cobertos, o `20` prevalece sobre este registro, especialmente tutor somente manual, microlições, evidência de aprendizado e escopo de personalização. Preservamos abaixo a estratégia anterior como contexto, não como ordem para restaurar comportamentos substituídos.

Status: ✅ **fonte de verdade do produto** — reconstruído em 20/09/2026 ao restaurar a linha Flash Test.

> **Como este arquivo foi reconstruído (leia antes de confiar nele).** A versão original deste documento foi **sobrescrita em 23/07/2026** pelo pivô para o Abroad e não sobreviveu. O que você lê aqui foi reconstruído a partir das fontes Flash Test que **não** foram tocadas pelo pivô: `10-prompt-prototipo-app.md` (spec tela-a-tela do MVP), `11-estado-prototipo-handoff-claude-code.md` (auditoria do código), `12-plano-development.md` (plano de dev + registro de decisões), `13-prompt-landing-instagram.md` (copy e posicionamento), `09-branding.md` (marca) e do **próprio código do protótipo**, que nunca foi convertido para o Abroad. As decisões e os números aqui têm lastro nessas fontes. Onde algo se perdeu de vez, está marcado como **[lacuna]** em vez de inventado. A versão Abroad está preservada em `_arquivo-abroad/08-produto-e-estrategia-abroad.md`.

---

## 0. Aviso de sócio (leia antes de tudo)

Quatro coisas que eu, como sócio, coloco na mesa **antes** de qualquer discussão de feature:

1. **O concorrente é de graça, é do governo e tem mais conteúdo que você.** O **MEC Enem** é gratuito, oficial, cobre o conteúdo inteiro e ainda corrige redação. Somem-se a ele YouTube, cursinho, apostila e um feed inteiro de dica de estudo. **Conteúdo não é escasso — é abundante e gratuito.** Qualquer feature que compita em "mais conteúdo" está competindo no único terreno onde o Flash Test perde de lavada. Se uma proposta começa com "e se a gente adicionasse mais matérias/videoaulas/simulados", a resposta padrão é **não** — a menos que ela sirva à constância ou à personalização.

2. **O produto não vende conteúdo. Vende constância e direção.** A dor do João não é "não tenho o que estudar", é "não consigo manter o ritmo e não sei onde estou fraco". Isso muda tudo: a unidade de valor é a **aula de 60 segundos** (custo de começar quase zero) e o **mapa de lacunas** (saber o que fazer agora). Toda tela tem que deixar óbvio que o app **sabe quem é aquele aluno** — não entregar mais um menu de conteúdo.

3. **"Isso não é só um app de questões com um chatbot?" vai ser a primeira pergunta.** Tenha a resposta no centro do pitch, não no rodapé: a IA **decide a próxima questão** e **explica o erro daquele aluno específico** ao vivo. Não é chatbot decorativo colado num banco de questões. Ver Seção 10.

4. **Escopo é o inimigo, e o risco aqui é o oposto do de sempre.** O erro típico de app de estudo é construir uma biblioteca enorme e rasa. Aqui a regra é **amplitude aparente, profundidade real pequena**: 59 questões reais bem escolhidas *parecem* infinitas para quem faz 2 por dia. Não construa mil questões medíocres — construa o loop que faz o aluno voltar amanhã.

---

## 1. Definição do produto

**Flash Test é um app mobile-first de preparação para o ENEM/vestibular baseado em aulas de 60 segundos:** 1–2 questões por vez, feedback imediato, e uma IA que aprende o que cada aluno erra para decidir a próxima questão.

- **Frase de posicionamento:** *"Não é mais aula. É o hábito que te aprova. 60 segundos por dia."*
- **Persona única:** **João** — 16–19 anos, ensino médio/pré-vestibular, nativo de TikTok/Reels. Retrato completo em `14-persona-joao.md`.
- **Dor tratada:** falta de **constância** (o hábito não gruda) + falta de **direção** (não sabe onde está fraco).
- **Não é:** um cursinho online, uma biblioteca de videoaulas, nem um banco de questões. O app tem vídeo e tem questões, mas nenhum dos dois é o produto — são insumos do loop.

> **🔄 Rebranding em curso (20/09/2026).** O produto passa a se chamar **Foca**, com mascote e um sistema de recompensa (som/háptico/streak) tratado como pilar, não como acabamento — a tese ganhou um terceiro elemento explícito: **vencer a latência de recompensa do feed**. A dor, a persona e a mecânica descritas neste documento **não mudam**. Ver `09-branding.md`, `15-mascote-e-voz.md` e `16-gamificacao-e-dopamina.md` (este último, §0, é onde o paradoxo de "usar dopamina para curar dopamina" é respondido). O nome "Flash Test" ao longo deste arquivo ainda não foi trocado porque o código também não foi.

**Os dois pilares do produto** (e só dois, de propósito):

| Pilar | O que é | Onde vive no app |
|---|---|---|
| **Aula de 60s** | 1–2 questões de vestibular real, feedback imediato, XP, streak | `/study` |
| **Micro-treino de redação** | A redação do ENEM decomposta em habilidades treináveis em 2 minutos | `/redacao` |

Tudo o mais (plano de estudos, flashcards, ranking, vídeos) é **satélite**: existe para dar sensação de produto completo e para sustentar o hábito, não para carregar a tese.

---

## 2. Experiência do usuário (jornada completa)

A jornada foi desenhada para provar valor **antes** de pedir esforço — o inverso do app de estudo tradicional, que pede cadastro, plano e disciplina antes de entregar qualquer coisa.

1. **Primeiro acesso — o quiz disfarçado de "criar conta".** 5 perguntas em formato Stories: estado onde mora, faculdade/curso-alvo, e **3 questões de conteúdo real** (calibração de nível). Não pede e-mail nem senha. O aluno acha que está se cadastrando; na verdade está sendo diagnosticado.
2. **Aha moment.** *"Já entendi você. Pra [faculdade], suas 3 maiores lacunas agora são…"* + XP inicial + streak dia 1. **Este é o momento mais importante do produto inteiro:** em menos de 90 segundos de uso, o app provou que sabe algo sobre aquele aluno que ele mesmo não sabia articular.
3. **Primeira aula de 60s.** 1–2 questões, feedback verde/vermelho imediato, micro-explicação. Ao errar, o **balão do tutor abre sozinho** com a explicação gerada por IA.
4. **Volta no dia seguinte.** Home com streak, meta diária e um CTA único: "próxima aula de 60s". Sem menu, sem escolha paralisante — o app já decidiu o que ele estuda hoje.
5. **O segundo pilar entra.** Micro-treino de redação, mesma mecânica de micro-dose, trilhas com desbloqueio sequencial.
6. **A lacuna encolhe.** `/progress` mostra domínio por matéria, o que atacar primeiro, e amarra tudo à faculdade-alvo escolhida no passo 1 — fechando o ciclo aberto no aha.

**O loop central, em uma linha:** *entrou → 60s → errou → entendeu na hora → ganhou XP → manteve streak → volta amanhã.*

---

## 3. Arquitetura do produto (telas) — avaliada criticamente

As 8 telas do MVP, especificadas em detalhe em `10`. Avaliação de sócio sobre o peso real de cada uma:

| # | Tela | Rota | Peso na tese | Nota crítica |
|---|---|---|---|---|
| 1 | Quiz de primeiro acesso | `/quiz` | 🔴 Crítica | É o diagnóstico. Sem as 3 questões de conteúdo, o aha vira adivinhação. |
| 2 | Aha moment | `/aha` | 🔴 Crítica | O momento que vende o produto. Não cortar, nunca. |
| 3 | Aula de 60s | `/study` | 🔴 Crítica | O produto. Tudo o mais orbita aqui. |
| 4 | Micro-treino de redação | `/redacao` | 🟡 Alta | 2º pilar. Deixou de ser "extra" em 21/07 — é núcleo. |
| 5 | Home / meta diária | `/dashboard` | 🟡 Alta | Onde o hábito se sustenta. CTA único, sem menu. |
| 6 | Progresso / mapa de lacunas | `/progress` | 🟡 Alta | Fecha o ciclo do aha. Precisa comunicar "suas fraquezas estão diminuindo". |
| 7 | Ranking / turma | `/ranking` | 🟢 Mock | Sensação de produto e pressão social. Mock é suficiente e honesto. |
| 8 | Plano de estudos | `/plan` | 🟢 Mock | Saída de IA simulada. Mock é suficiente. |

**Elemento transversal — o balão do tutor.** Não é uma tela: é um componente flutuante **presente em todas as telas pós-quiz**. Três entradas: pergunta sobre o próprio progresso, foto de questão, e a abertura automática quando o aluno erra. Ver Seção 6.

**Crítica honesta à arquitetura:** o app tem satélites demais para o tamanho da tese (flashcards, vídeos, plano, ranking). Eles ajudam a parecer produto pronto, mas cada um deles é uma superfície a manter. Se o produto for adiante de verdade, a pergunta é qual desses sobrevive ao primeiro corte — a resposta provável é: nenhum dos quatro é essencial.

---

## 4. O processo, concretamente (o que o app ordena)

O que o Flash Test faz que uma biblioteca de conteúdo não faz — **ele decide**:

1. **Diagnostica** no primeiro acesso (quiz com conteúdo real) e transforma isso em 3 lacunas nomeadas, não numa nota genérica.
2. **Prioriza** — "ataque primeiro X" em vez de listar 11 matérias e deixar o aluno escolher (escolha é exatamente o que paralisa o João).
3. **Roteia** a próxima questão pelo histórico de erros, não por ordem de apostila.
4. **Explica o erro na hora**, personalizado ao que aquele aluno errou, enquanto a dúvida ainda está quente.
5. **Marca a volta** — streak e meta diária desenhados como **recomeço sem culpa**, não como punição (ver Seção 6 e `14` Seção 8).
6. **Mostra a lacuna encolhendo**, amarrada à faculdade-alvo — o progresso precisa ser visível ou o hábito não tem recompensa.

---

## 5. Módulo-herói de execução — a Mentoria de Redação

A redação é o segundo pilar e o diferencial mais defensável depois da aula de 60s: **ninguém treina redação em micro-doses.** Todo mundo manda escrever um texto inteiro e esperar correção. O Flash Test decompõe a redação do ENEM em habilidades praticáveis em 2 minutos — tese por tese, argumento por argumento.

**Os três cenários avaliados em 22/07** (registro de como a decisão foi tomada):

- **Cenário A — reaproveitar o app do Vitor inteiro.** Existia um protótipo "Duolingo da redação" funcional, com centenas de fases, só que com outro branding. Plano inicial: reskin para o design system do Flash Test.
- **Cenário B — construir do zero.** Caro em tempo, e jogaria fora conteúdo pronto e validado.
- **Cenário C — reaproveitar só os prompts/rubrica** de correção e construir as telas novas no padrão deste repo.

**O que de fato aconteceu (Development 3, 22/07):** o app do Vitor era **Next.js + Supabase + checkout/admin**; o Flash Test é **TanStack Start + Vite**. Reskin in loco era inviável no prazo. Adotou-se um caminho **intermediário entre A e C**: portou-se o **motor de lições** (declarativo, sem acoplamento de framework) e **todo o conteúdo** — **15 trilhas, 134 lições, 1.204 exercícios** — reconstruindo as **7 views de exercício** no design system do Flash Test. Ganhou-se o conteúdo real sem herdar a stack.

Os mascotes do app de origem (Dona Vírgula / Seu Parágrafo) foram removidos das 134 lições, coerente com o corte da foca: **a identidade é o raio, sem personagem.** Quem explica é o tutor do Flash Test.

---

## 6. IA — estratégia em 3 horizontes

A regra da constituição é "IA no centro, não cosmética". Para cada uso de IA é preciso responder: **o que ela decide, com que dado, e o que acontece se errar.**

### Horizonte 1 — o que existe hoje no protótipo (real, rodando)

| Uso | O que decide/gera | Dado de entrada | Se errar |
|---|---|---|---|
| **Micro-explicação do erro** | Texto explicando por que *aquela* alternativa está errada | Enunciado, alternativa marcada, gabarito, matéria/tópico | Explicação fraca. Fallback local pré-escrito se a chamada falhar ou estourar 12s. |
| **Tutor no balão global** | Resposta em linguagem natural sobre dúvida ou progresso | Pergunta do aluno + desempenho do store | Resposta genérica. Nunca tela quebrada. |
| **Foto de questão (multimodal)** | Leitura e resolução da questão fotografada | Imagem enviada pelo aluno | Resposta imprecisa — o aluno refaz a foto. Risco baixo. |

**Implementação:** OpenAI `gpt-5.4-mini` via `fetch` direto (sem SDK), chamado por uma **server function** — a chave vive no servidor e **nunca** chega ao client. Prompt estruturado em PACE (`07`), com regra dura **anti-LaTeX** (o modelo devolvia `\(x_v = -b/2a\)` por padrão, e o balão renderiza texto puro).

> **Honestidade com a banca, decidida em 22/07:** o **número** de desempenho ("7/10 em Funções essa semana") é **regra de negócio**, lido do store. Só a **frase** é IA. Não vender cálculo determinístico como inteligência — a banca pergunta, e mentir custa mais que a feature vale.

### Horizonte 2 — o próximo passo (a lacuna real de hoje)

**As lacunas ainda são heurística local** (`src/lib/gaps.ts`), não refinadas por IA. Isso é a divergência mais séria entre o discurso e o código: o pitch diz "uma IA que aprende a lacuna de cada aluno", e hoje quem calcula a lacuna é uma regra simples. O horizonte 2 é fechar esse gap — a IA refinando o mapa de lacunas e **de fato** escolhendo a próxima questão.

### Horizonte 3 — visão (não construir agora)

Ajuste do ritmo de revisão por aluno (a repetição espaçada dos flashcards já existe, mas é fixa); geração de questões novas no estilo da banca-alvo; previsão de nota. Tudo isso é roadmap de discurso — **precisa estar claramente separado do que já existe** quando se apresenta.

---

## 7. MVP para o pitch — o Golden Path da demo

O que precisa rodar liso, em ≤ 90 segundos, sem depender de wi-fi:

1. **`/quiz`** — 5 perguntas, estado + faculdade + 3 questões reais. *"Isso não é cadastro, é a IA te conhecendo."* (~20s)
2. **`/aha`** — 3 lacunas nomeadas + XP + streak dia 1. (~15s)
3. **`/study`** — aula de 60s, **errar uma de propósito**, o balão abre sozinho com explicação gerada ao vivo. **É o wow.** (~30s)
4. **`/redacao`** — o 2º pilar, uma lição curta. (~15s)
5. **`/progress`** — a lacuna encolhendo, amarrada à faculdade-alvo. (~10s)

**Ordem de sacrifício se estourar o tempo:** corta-se a redação (4), depois o progresso (5). **Nunca** o aha (2) nem o erro que abre o balão (3).

**Regras de congelamento** (`12` Seção 5): build congelado, vídeo backup do Golden Path gravado, cópia offline, e a LP usando exatamente os mesmos tokens da marca.

---

## 8. Divisão do time (registro histórico — Pre College 26.2)

> ⚠️ Esta seção descreve o time de 7 pessoas da semana do Pre College da Link, que **se encerrou**. Fica como registro de quem decidiu o quê. Os *papéis* continuam úteis como checklist do que um projeto destes exige.

| Papel | Quem era | Status |
|---|---|---|
| Líder / pitch | Matheus Mister | — |
| Vibe Coding (DEV) + Design + LP | Vellozo | — |
| Vibe Coding (camada de IA) | Leonardo | — |
| Finanças | Nicolas | — |
| Marketing | Duda | — |
| Branding | Liz | ✅ design system entregue (`09` + `brand/`) |
| A confirmar | Mateus Cenoura | candidato a Conteúdo ou Pesquisa |

**Os dois buracos que nunca foram preenchidos — e que continuam abertos hoje:**

1. **Conteúdo / curadoria de questões.** Era o caminho crítico e nunca teve dono. O banco chegou a 59 questões cobrindo as 11 matérias, com gabarito redistribuído entre A–E (estava 52/59 em B ou C — viés percebível assim que alguém de fora testa o app). Para o produto existir de verdade, isso precisa de um processo, não de um mutirão.
2. **Pesquisa / validação.** Nenhuma entrevista estruturada com aluno de pré-vestibular foi transcrita. Tudo que o pitch afirma sobre o João vem do guia e de observação informal. **[lacuna]** — é a fragilidade mais fácil de atacar numa banca.

---

## 9. Plano de execução — leitura de timing do sócio

**Como estava em 22/07:** três fases de Development planejadas em `12`, todas executadas no mesmo dia. D1 (marca + loop central), D2 (camada de IA), D3 (2º pilar + acabamento). O protótipo foi ao ar em 24/07.

**Como está hoje (20/09/2026):** o contexto do Pre College acabou, o prazo de sexta não existe mais, e o projeto passou a ser tocado fora da Link. Isso **muda o plano, não o produto**:

- O que era "escopo mínimo para um Golden Path de 90s" pode virar escopo de produto de verdade — mas só se as duas lacunas da Seção 8 (conteúdo e validação) ganharem dono.
- A pergunta que destrava tudo continua sendo a mesma de 23/07, só que agora sem prazo: **isto é um artefato de pitch ou um produto?** Se for produto, a primeira coisa a fazer não é feature — é falar com 10 alunos de pré-vestibular.
- A dívida técnica conhecida está mapeada e é pequena: lacunas por heurística (Seção 6, horizonte 2), login mock intencional, ranking mock assumido na própria tela.

---

## 10. Estratégia de diferenciação (o teste ácido)

O teste: **para cada concorrente, qual é a frase que explica por que o aluno usaria o Flash Test e não ele?**

| Concorrente | O que ele resolve | Por que não mata o Flash Test |
|---|---|---|
| **MEC Enem** (grátis, oficial) | Conteúdo completo + correção de redação | Resolve escassez de conteúdo, que **não é a dor**. Não sabe quem é o João nem o que ele errou ontem. Não tem loop de hábito. |
| **Cursinho / videoaula** | Explicação profunda, professor | Pede 1 hora e disciplina — exatamente os dois recursos que o João não tem. |
| **Banco de questões** | Volume | Entrega volume, não direção. Escolher o que resolver é o problema, não a solução. |
| **ChatGPT direto** | Tira dúvida | Não tem currículo, não guarda estado, não decide o que estudar amanhã, não cria hábito. |
| **Duolingo (referência, não concorrente)** | Hábito em micro-dose | É a prova de que a mecânica funciona — e de que ninguém aplicou isso ao ENEM com personalização real. |

**A linha de defesa, em uma frase:** *conteúdo todo mundo já tem de graça, inclusive do governo — o que ninguém resolve é constância e saber exatamente onde você está fraco.*

**O risco real da tese:** se ficar provado que o aluno não volta nem com aula de 60s, o produto inteiro cai. Nenhum dado próprio sustenta a retenção hoje — **[lacuna]**, e é a coisa mais importante a medir se o projeto andar.

---

## 11. Modelo de negócio

**B2C, freemium / low ticket.** É o oposto de um negócio premium, e isso é consequência direta da persona: **o João não tem dinheiro — tem tempo e conteúdo sobrando.**

- **Tensão central:** o incumbente é **grátis e do governo**. Um free ruim não compete com o MEC Enem. Logo o free precisa entregar o loop inteiro (aula de 60s + aha + progresso), e o pago precisa ser algo que o gratuito não dá — não "mais questões", mas provavelmente **mais IA por aluno** (tutor ilimitado, plano adaptativo real, correção de redação).
- **Ancoragem de preço:** o concorrente pago é o cursinho, que custa na casa dos milhares por ano. O Flash Test cobra uma fração — mas o número nunca foi fechado. **[lacuna]**
- **Alavanca econômica:** o custo marginal é o custo de IA por aluno ativo. Hoje se conhece o custo por chamada do `gpt-5.4-mini`, não o custo por aluno/mês no uso real. **[lacuna]**

A DRE, os 3 cenários, o payback e o preço **nunca foram preenchidos** na fase Flash Test — a semana acabou antes. Os templates estão em `02`, Seção "Modelo financeiro". Preencher isso é pré-requisito para qualquer conversa séria com investidor ou banca.

---

## 12. Conclusão executiva

O Flash Test aposta que o gargalo do estudante brasileiro **não é acesso a conteúdo — é constância e direção.** Se essa premissa estiver certa, o produto tem um espaço que nem o app gratuito do governo nem o cursinho ocupam, e a IA tem um papel estrutural (decidir o que o aluno treina agora e explicar o erro na hora), não decorativo.

O protótipo existe, roda e prova a experiência de ponta a ponta. O que falta não é código — é **evidência**: ninguém entrevistou o João de verdade, ninguém mediu se ele volta no dia seguinte, e nenhum número de negócio foi fechado. Enquanto isso não existir, o Flash Test é uma tese bem construída e bem executada, não um negócio validado. Essa distinção precisa ser dita em voz alta em qualquer apresentação — é o tipo de honestidade que ganha banca em vez de perder.
