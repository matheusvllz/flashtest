# 20 — Plano do protótipo Abroad em 3 fases (para o pitch)

Status: 🟢 **v2 (23/07) · 🎯 v2.1 counselor (23/07, tarde)** — reescrito sobre a base real. A v1 assumia reskin do repo Flash Test; a base mudou: existe um **protótipo Lovable muito mais completo** — `Prototipo teste/Seu Futuro Internacional (1)/` (TanStack Start + React + Supabase) — que já tem os 13 módulos scaffoldados, motor de scoring real, mentor IA real e auth. Já foi **re-skinado para a marca Abroad** (design system aplicado, build ok). Este arquivo é o plano de execução (o **estado real do código**); a **experiência tela-a-tela build-ready** agora vive em `21-especificacao-prototipo-abroad.md`.

> **🎯 Afinação v2.1 (23/07, tarde) — o counselor entra no protótipo.** F1–F3 (app do aluno) seguem válidas e executadas. A afinação do `08`/`18` (a IA amplia um counselor humano) adiciona **uma Fase 4**: tornar o counselor visível no app do aluno (3 toques baratos) + a tela do **counselor cockpit** (o wow de negócio). Ver Seção 3.2 e o `21`. Também: apresentar o score do diagnóstico como **ranking por frente** (portfólio, documentação, provas TOEFL/SAT), que é como a transcrição descreve, e ajustar a copy da landing pro "counselor".

> Pais: `18` (o app — 4+1 leis, 13 módulos, motor de IA), `21` (experiência tela-a-tela), `08` §9/§11 (timing, negócio, counselor). Base de código: `Prototipo teste/Seu Futuro Internacional (1)/`. Voz: `15`/`17`.

---

## 0. Estado real do protótipo (auditado no código, 23/07)

O que separa este protótipo do Flash Test: ele **já nasceu no domínio certo** (candidatura internacional). Auditoria direta do código:

**✅ Já é REAL (não reconstruir):**
- **Auth** Supabase + Google OAuth (`auth.tsx`, `integrations/supabase/`).
- **Onboarding** que capta perfil e grava em `students` (`onboarding.tsx`, 239 linhas).
- **Motor de diagnóstico REAL** — `lib/scoring.ts` computa um *Global Readiness* de **13 dimensões** (acadêmico, inglês, provas, extracurriculares, liderança, projetos, impacto, currículo, redações, docs, finanças, bolsas, maturidade), com classificação, prioridade e plano semana/mês/trimestre/semestre. Determinístico e honesto.
- **Recomendação de universidades REAL** — `computeMatch()` faz match multivariável (país × orçamento × inglês × prova × bolsa × competitividade) e rotula sonho/alvo/segurança (`universidades.tsx`).
- **Mentor IA REAL** — `lib/mentor.functions.ts` é uma server function que chama o **gateway Lovable** (`google/gemini-2.5-flash`) com system prompt já afinado (franco, PT-BR, não inventa dado). Chave no servidor.
- **Redações** com CRUD real em `essays` + feedback via mentor (`redacoes.tsx`).
- **Jornada** com 8 etapas e missões, lendo `tasks` do Supabase (`jornada.tsx`) — a espinha já existe.
- **Documentos, currículo, bolsas, candidaturas, comparar, tarefas** scaffoldados com CRUD.
- **Mapa-múndi** de universidades (Leaflet, `world-map.tsx`).

**❌ / 🟡 Os buracos que separam "scaffold" de "protótipo perfeito":**

| Buraco | Onde | Lei ferida | Fase |
|---|---|---|---|
| **Tabelas `universities` e `scholarships` nascem VAZIAS** — nenhum seed nas migrations | `supabase/migrations/` | dado não existe | **F1** |
| **Sem camada de confiabilidade** — schema tem `website`/`deadline`/`official_link` mas **não tem `fonte` + `verificado_em`** | schema de `universities`/`scholarships` | **#3** confiabilidade | **F1** |
| **13 módulos = 13 itens de navegação soltos** — a Jornada é só mais uma aba | `app-shell.tsx` (nav), `dashboard.tsx` | **#1** um ambiente só | **F1** |
| **"Próximo passo" não é destacado** — o plano existe no scoring mas nenhuma tela grita "faça ISTO agora" | `jornada.tsx`, `dashboard.tsx` | **#2** próximo passo | **F1** |
| **Co-piloto vive só na rota `/mentor`** — não é transversal nem lê o perfil vivo como contexto | `mentor.tsx`, `mentor.functions.ts` | **#4** IA sobre perfil vivo | **F2** |
| **Diagnóstico não termina num "aha" nomeado** pela IA (3 lacunas em linguagem humana) | `diagnostico.tsx` | **#2/#4** | **F2** |
| **Redação é feedback genérico**, não micro-drills por competência (o ativo Vitor) | `redacoes.tsx` | módulo-herói raso | **F2** |
| **Sem multimodal** (foto de edital/documento → IA extrai requisitos) | — | recurso "wow" | **F2** |
| **Sem polimento**: estados vazios, skeletons, microanimações, ring de readiness | transversal | acabamento | **F3** |
| **Golden Path não cronometrado / sem vídeo backup** | — | risco de pitch | **F3** |

**Leitura de sócio:** este protótipo está a **3 fases** de "perfeito" — não porque falta engenharia (ela existe e é boa), mas porque faltam (a) **dados reais com fonte**, (b) as **4 leis visíveis na experiência**, e (c) **acabamento**. É muito mais barato do que parece.

---

## 1. 🔵 FASE 1 — A verdade dos dados + as 4 leis visíveis (a fundação) ✅ EXECUTADA (23/07)

**Objetivo:** o protótipo deixa de ser "13 telas com dado vazio" e passa a encarnar as 4 leis, com dado real e confiável. É a fase que prova a TESE (não só a tecnologia).

> **Status de execução (23/07):** feita e com build verde. Achado que mudou o plano: o banco remoto **já vinha semeado pelo Lovable** com universidades reais (Stanford, MIT, Harvard, Oxford, Cambridge, Toronto, UBC, ETH, TU Delft, Melbourne…) e bolsas reais (Rhodes, Chevening, Fulbright, Gates Cambridge, Knight-Hennessy, Erasmus, DAAD, Eiffel…) — então F1.1/F1.3 (seed) já estavam prontos. O trabalho real da fase foi a **confiabilidade** e as **4 leis na experiência**. Entregue:
> - **Migration `20260723120000_abroad_confiabilidade.sql`**: colunas `source_url` + `verified_at` em `universities` e `scholarships`, com backfill (website/official_link → source_url; updated_at → verified_at). Tipos atualizados em `types.ts`.
> - **Componente `<FonteVerificada>`** (`components/fonte-verificada.tsx`): "Verificado em [data] · Confirmar na fonte oficial ↗", com fallback honesto quando não há fonte. Usa as colunas novas com fallback para as antigas — funciona ao vivo agora e fica mais preciso após o sync do Lovable.
> - Aplicado em **página da universidade** (com o prazo de inscrição agora em destaque, que antes nem aparecia), **bolsas** (selo por card) e **comparar** (rodapé de confiabilidade).
> - **Navegação nos 4 espaços** (`app-shell.tsx`): as 13 rotas soltas viraram **Jornada (home) + Descobrir + Construir + Organizar + Co-piloto** — no rail desktop, no drawer mobile e na bottom nav. Lei #1 visível.
> - **Próximo passo priorizado (lei #2)**: hero "Seu próximo passo" no topo do dashboard e da Jornada — escolhe a tarefa mais urgente (ou a maior lacuna do diagnóstico), com a mensagem "um passo de cada vez, sem sobrecarga".
> - **Marca Abroad** já aplicada antes (design system, build ok).
>
> **Pendências herdadas p/ quando sincronizar no Lovable:** rodar a migration no remoto (aplica as colunas de verdade); e, idealmente, dar valores reais de `verified_at`/`source_url` por linha na curadoria (o backfill usa updated_at/website como ponto de partida).

**Entregáveis:**

1. **Seed real de universidades com fonte + data** — migration nova que popula **5–8 universidades reais** cobrindo sonho/alvo/segurança, cada uma com custo, requisitos (TOEFL/SAT), prazo, bolsa. Fonte: os próprios sites oficiais das universidades. *Começar pequeno e verdadeiro.*
2. **Camada de confiabilidade no schema (lei #3)** — adicionar colunas `source_url` + `verified_at` (data de verificação) em `universities` e `scholarships`. Toda linha do seed carrega as duas. Sem fonte, o dado não entra.
3. **Seed de 3–5 bolsas reais** com `official_link` + `verified_at` (o campo `official_link` já existe; falta a data e o dado).
4. **UI de confiabilidade** — todo dado crítico (prazo, requisito, custo) exibe **"verificado em [data]"** + link "confirme na fonte oficial". Onde não há dado: fallback honesto "confirme na fonte", nunca um chute. (Componente pequeno reutilizável, usado em `universidades.$slug.tsx`, `comparar.tsx`, `bolsas.tsx`.)
5. **A Jornada vira a espinha (lei #1)** — reorganizar a navegação: a home passa a ser a **Jornada** (não um dashboard genérico), e os 13 módulos se agrupam nos **4 espaços** do `18` (Descobrir / Construir / Organizar + Co-piloto), não em 13 itens planos. A Liz nunca vê "13 módulos".
6. **O próximo passo, sempre (lei #2)** — a Jornada e o dashboard destacam **UM** próximo passo priorizado (vem do `plan.top3` que o `scoring.ts` já calcula). Nunca despejar 40 tarefas.

**Arquivos afetados:** nova migration de seed + colunas; `app-shell.tsx` (nav → 4 espaços + Jornada como home); `dashboard.tsx`/`jornada.tsx` (próximo passo em destaque); novo componente `<FonteVerificada>`; `universidades.$slug.tsx`, `comparar.tsx`, `bolsas.tsx` (exibir fonte+data); `integrations/supabase/types.ts` (regenerar tipos após colunas novas).

**Pronto quando:** a Liz entra, cai na Jornada, vê onde está + **um** próximo passo, abre uma universidade real e vê o prazo com **"verificado em [data]" + link oficial**. As 4 leis são visíveis sem ninguém explicar.

**Risco:** curadoria dos dados reais precisa de dono e tempo. Mitigação: 5–8 universidades bastam para a demo; usar dados públicos dos sites oficiais (verificáveis), sempre com link + data.

---

## 2. 🟡 FASE 2 — A IA sobre o perfil vivo (o "wow" e o diferencial) ✅ EXECUTADA (23/07)

**Objetivo:** o que a banca vai apertar — *"por que isso não é só ChatGPT?"* — fica respondido **na tela**: a IA governa o mapa, prioriza e mentora, tudo puxando o **perfil vivo** que o ChatGPT não tem.

> **Status de execução (23/07):** feita e com build verde. Entregue:
> - **Co-piloto transversal** (`components/co-pilot.tsx`) montado no **root** (`__root.tsx`) → persiste em todas as telas autenticadas, histórico não se perde na navegação. Botão flutuante acima da bottom nav; some em telas públicas. Responde a um evento global `abroad:copilot` para outras telas dispararem prompts.
> - **Perfil vivo** (`lib/live-profile.ts`): resume readiness, 3 lacunas, inglês/provas/orçamento/bolsa, universidades salvas e o próximo passo num texto que a IA recebe. A server function (`mentor.functions.ts`) agora aceita `context` e injeta no system prompt — é a resposta concreta ao "não é só ChatGPT" (ele não guarda o estado da candidatura).
> - **Aha no diagnóstico** (`diagnostico.tsx`): hero "Já entendi você" com as **3 maiores lacunas nomeadas** + o primeiro passo + CTA "Por que essas lacunas?" que abre o co-piloto com o contexto.
> - **Redação por competência** (`redacoes.tsx`): 5 micro-drills (narrativa pessoal, especificidade, estrutura, voz, encaixe com a universidade) — a IA orienta competência a competência e **nunca reescreve** (guardrail visível).
> - **Multimodal** (`mentor.functions.ts` → `analyzeDocumentImage` + anexo no co-piloto): foto de edital/documento → Gemini 2.5 Flash extrai requisitos/prazos, sempre terminando em "confirme na fonte oficial".
> - **Guardrails** no prompt: estimativas rotuladas; prazo/requisito/visto sempre remetem à fonte.
>
> **Pendência:** a chamada real depende de `LOVABLE_API_KEY` no servidor (já era assim no legado). Sem a chave, o co-piloto mostra erro amigável — combinar chave/custo antes do pitch (mesma mitigação da F3: fallback + vídeo backup).

**Entregáveis:**

1. **Co-piloto transversal (lei #4)** — tirar a IA da rota isolada `/mentor` e montá-la como **balão flutuante presente em todas as telas** pós-onboarding (montado no `AppShell`). Estado no client (aberto/fechado + histórico).
2. **A IA lê o perfil vivo** — a server function passa a receber (além das mensagens) um resumo do perfil: readiness, 3 lacunas, universidades salvas, etapa atual da Jornada. Assim o co-piloto responde *"pra Stanford, sua lacuna de inglês é o gargalo"*, não genérico. É o coração do produto (o estado que o ChatGPT não guarda).
3. **Diagnóstico termina num "aha" nomeado (lei #2/#4)** — ao fim do diagnóstico, tela que nomeia as **3 maiores lacunas** em linguagem humana (a IA refina o que o `scoring.ts` ranqueou) + o primeiro próximo passo. É o momento de valor em ~3 min.
4. **Redação por competência (módulo-herói)** — transformar o feedback genérico em **micro-drills por competência da admission essay**: narrativa pessoal, especificidade, estrutura, voz, encaixe com a universidade. A IA dá feedback competência a competência, **nunca reescreve** (guardrail — universidades penalizam texto de IA). Re-tematização do conteúdo do Vitor (`18` Seção 7).
5. **Multimodal (1 toque de wow)** — botão de anexo no co-piloto: **foto de um edital/documento → IA extrai requisitos/prazos**. Real se o gateway permitir visão; senão, resposta mockada convincente. Não é o herói, é o tempero.
6. **Guardrails visíveis** — "chance de admissão" e projeções sempre rotuladas como estimativa; itens críticos sempre com fonte (herda da F1).

**Arquivos afetados:** novo componente de balão global (`components/`), montado no `app-shell.tsx`; `mentor.functions.ts` (aceitar contexto de perfil no payload); `diagnostico.tsx` (tela de aha); `redacoes.tsx` (feedback por competência + rubrica); server function de visão (ou mock).

**Pronto quando:** dá pra abrir o co-piloto em qualquer tela, ele sabe quem é a Liz e onde ela está; o diagnóstico entrega 3 lacunas nomeadas; e uma redação recebe feedback competência a competência. O "não é só ChatGPT" fica óbvio.

**Risco:** dependência de rede/API ao vivo. Mitigação: fallback local + o vídeo backup da F3. O provedor (gateway Lovable/Gemini) já está plugado e funcionando.

---

## 3. 🟢 FASE 3 — Acabamento de produto + Golden Path + congelamento ✅ EXECUTADA (parte de código, 23/07)

**Objetivo:** o protótipo fica com cara de produto acabado e o pitch fica à prova de falha.

> **Status de execução (23/07):** a parte de **código/polish** está feita e com build verde. Entregue:
> - **Readiness ring anima de 0 → score** na montagem (anel preenchendo + número contando) — o "wow" visual do diagnóstico (`readiness-ring.tsx`).
> - **Skeletons de loading** (`components/loading.tsx`) no lugar dos "Carregando..." nus: dashboard, lista de universidades, página da universidade, favoritas. Nada de tela em branco.
> - **Animações de entrada** (`animate-rise`) nos heroes de próximo passo e do aha.
> - **Marcos, não streak** (lei #9): selo "Marco concluído" quando uma etapa da Jornada fecha (`jornada.tsx`).
> - **Golden Path conectado**: onboarding finaliza em `/diagnostico` (aha) → Jornada (próximo passo) → universidades (fonte) → co-piloto (transversal) → redação (competências). Cada passo já leva ao próximo por CTA.
>
> **O que resta da F3 é operação/humano (não código)** — ver Seção 3.1 abaixo (roteiro cronometrado, vídeo backup, cópia offline, congelamento). Estes dependem de decisão de time e do dia do pitch.

### 3.1 Golden Path do pitch (roteiro para cronometrar ≤90s)

Sequência a ensaiar, na voz do apresentador (mapeia direto ao que foi construído):

1. **Abertura (10s):** "A Liz tem tudo pra estudar fora — menos um **counselor**. A escola dela não oferece um. A gente dá." Abre a landing Abroad.
2. **Diagnóstico → aha (20s):** completa/mostra o diagnóstico; o ring anima até o score, aparece o **ranking por frente** (portfólio, documentação, provas TOEFL/SAT), as **3 lacunas nomeadas** + o primeiro passo + **"seu counselor: [nome]"**. *("Em 3 minutos ela sai do 'não sei por onde começar' pra 'tenho um counselor e sei o próximo passo'.")*
3. **Jornada (15s):** a home mostra **um** próximo passo priorizado (lei #2) e as etapas — "não são 13 abas soltas, é uma jornada só" (lei #1).
4. **Universidade com fonte (15s):** abre uma universidade real; destaca **"verificado em [data] + confirme na fonte oficial"** (lei #3 — a resposta ao "e a precisão?").
5. **Co-piloto ao vivo (20s):** abre o balão em qualquer tela; ele **já sabe o perfil da Liz** e diz o próximo passo — "isto o ChatGPT não faz, ele não guarda seu estado" (lei #4). *(Opcional: anexar foto de um edital → extrai requisitos.)*
6. **Redação por competência (10s):** mostra 1 drill de competência — "orienta, não escreve por você".

**Regra de corte se estourar 90s:** cai primeiro a foto multimodal (5), depois a redação (6). **Nunca** cortar diagnóstico→aha nem o co-piloto sabendo o perfil — é o coração.

**Entregáveis:**

1. **Golden Path desenhado e cronometrado (≤90s dentro dos 3 min):** diagnóstico → aha (3 lacunas) → Jornada com próximo passo → universidade real com fonte → co-piloto ao vivo → 1 interação de redação. Ensaiar 3× cronometrado.
2. **Polimento de produto:** estados vazios desenhados (não telas em branco), skeletons/loading, microanimações (readiness ring preenchendo, XP/marcos), o "grain" editorial que o design system pede. Usar o `readiness-ring.tsx` que já existe.
3. **Módulos secundários como mock convincente / etapa da Jornada** — Documentos, Financeiro, Visto, Entrevistas, Extracurriculares aparecem como **etapas citadas na Jornada** com tela ilustrativa, não construídos por completo. O discurso cobre o resto (honesto: "isto é o mock, o motor entra na V1").
4. **Retenção sem sobrecarga (lei #2):** quem volta encontra **o próximo passo esperando**, não um muro de tarefas. Marcos, não streak punitivo.
5. **Congelamento e backup:** congelar o build num horário fixo; **gravar vídeo backup** do Golden Path completo (contra queda de wi-fi/API); cópia offline; garantir que a LP (`04`/`19`) e o protótipo usam exatamente os mesmos tokens Abroad.

**Arquivos afetados:** `progress.tsx`/`readiness-ring.tsx` (polish visual), estados vazios transversais, telas mock dos módulos secundários, ajustes finais de token.

**Pronto quando:** o Golden Path roda limpo em ≤90s, o app parece completo em qualquer tela que o público tocar (o QR code do pitch deixa testar), e existe vídeo backup gravado.

**Risco:** escopo estourar no polish. Mitigação: a ordem de sacrifício é polish/módulos secundários primeiro; **nunca** o Golden Path (diagnóstico→aha→Jornada→co-piloto) nem a confiabilidade da F1.

---

## 3.2 🟣 FASE 4 — O counselor no protótipo (afinação 23/07, tarde) ✅ EXECUTADA (23/07, noite)

> **Status de execução (23/07, noite):** executada em 3 blocos, build verde, 19 rotas em 200. Entregue:
>
> **Bloco 1 — o counselor existe na tela do aluno:**
> - `lib/counselor.ts` (novo): o counselor como dado (Marina Duarte), o **ranking por frente** (`frentesDoPerfil`) que traduz as 13 dimensões nas **6 frentes de 0 a 10** que a transcrição descreve (portfólio & liderança · provas & inglês · acadêmico · redações · documentação · bolsas & financeiro), e a **nota do counselor** gerada do diagnóstico real.
> - `components/ranking-frentes.tsx` + `components/counselor-card.tsx` (novos).
> - **Tela do aha reescrita** (`diagnostico.tsx`): ring animado dentro do hero, 3 lacunas nomeadas, o próximo passo, a frase-mãe, o ranking por frente e o cartão do counselor com a nota humana. As 13 dimensões viraram detalhe recolhido (rastreabilidade, não parede de métrica).
> - **Os 3 toques do `21` §8**: cartão no aha, nota do counselor sobre o próximo passo (dashboard), cartão discreto fixo (dashboard + jornada, mobile e desktop), CTA "Falar com a Marina" que abre o co-piloto com contexto.
> - **Landing reescrita** (`index.tsx`) na frase-mãe do counselor, com o termo traduzido na 1ª aparição, a cena das 14 abas, a seção "Isso não é só ChatGPT?" e o preço ancorado em R$ 20–100 mil.
>
> **Bloco 2 — o counselor cockpit (wow #2):**
> - `lib/counselor-fila.ts` + rota **`/counselor`** (novos): fila de **30 alunos-semente rodando o `computeReadiness()` real** — score, maior lacuna e plano sugerido saem do mesmo motor do app da Liz (se a banca perguntar "isso é chumbado?", não é). Superfície visual própria (navy) pro corte no pitch ser evidente. Ordenação por urgência/score/espera, abrir aluno → diagnóstico pronto + plano da IA + **"Aprovar plano" em 1 clique**, com **cronômetro de triagem medido** (não alegado) e a aritmética do modelo no topo (~4h com IA vs ~30h no manual, rotulada como estimativa).
>
> **Bloco 3 — protótipo pronto pro pitch:**
> - **Co-piloto à prova de falha** (`lib/copilot-fallback.ts`, novo): o `.env` **não tem `LOVABLE_API_KEY`** — hoje o co-piloto morreria com um toast vermelho no palco. Agora, se a chave faltar / a rede cair / o gateway devolver 429-402, ele responde **localmente a partir do perfil vivo estruturado** (readiness, frentes, lacunas, provas, orçamento, universidades salvas), com guardrail de fonte oficial intacto — e a resposta vem **marcada como "resposta local"**: a gente não finge que foi a IA.
> - **Modo apresentador** (rota **`/demo`**, nova): cronômetro do Golden Path (alvo 90s) com destaque do beat atual, as 6 falas do roteiro com link pra tela, **"Zerar a demo"** (limpa o localStorage pra ensaiar do zero) e o checklist do `21` §10.
> - **Passada de copy**: "Mentor IA" → "Co-piloto" em toda a navegação; heroes e microcopy do Golden Path passados pelo Teste da Liz.
>
> **Dois defeitos reais corrigidos no caminho (achados por auditoria, não estavam em nenhuma lista):**
> 1. **`demo-client.ts` quebrava `.single()`** — o campo de classe `private single` sobrescrevia o método `single()` na instância (target ES2022, class fields com `[[Define]]`). `redacoes.tsx:56` chama `.single()` ao criar redação: **criar uma redação nova na demo crashava**, e redação é o passo 6 do Golden Path. Campo renomeado para `singleMode`.
> 2. **`scoring.ts` mostrava número igual pra todo mundo.** `essays = 25` e `docs = 30` eram **constantes** (a tabela `students` não capta esses dados): no cockpit, os 30 alunos exibiam exatamente 2,5 e 3,0 nessas frentes, e as duas dimensões congeladas puxavam o score de todos pra baixo (teto ~53/100). Além disso, `textScore` tinha uma base diferente por campo (15 pra projetos, 20 pros outros), o que fazia "Projetos" ser estruturalmente a menor dimensão de qualquer perfil — **30 de 30 alunos apareciam com a mesma "maior lacuna"**. Corrigido: dimensão sem dado ganha `measured: false`, sai do cálculo do overall e aparece como **"ainda não medido"** em vez de nota chutada (é a lei #3 aplicada ao próprio diagnóstico); `textScore` passou a ter base única e a pontuar substância. Resultado medido: fila com **5 lacunas distintas** (11/7/7/3/2) e scores de **34 a 63 com 20 valores distintos**.
> 3. **Incoerência do aha:** as 3 lacunas e o próximo passo saem das *dimensões*, o ranking mostra *frentes* — a tela dizia "comece por SAT" enquanto o counselor dizia "o que trava é portfólio". Novo helper `frenteDaLacuna()` alinha nota do counselor, CTA e fallback à frente da lacuna nº 1.

### Entregáveis originais da F4 (todos cumpridos)

**Objetivo:** materializar a tese afinada (a IA amplia um counselor humano) na tela — no lado do aluno e no lado do orientador. Detalhe de experiência completo no `21` (Seções 4, 7, 8).

**Entregáveis (ordenados por custo/retorno):**

1. **Copy da landing → counselor (trivial):** trocar a frase-mãe pra "Estudar fora não é pra quem tem contato. É pra quem tem um **counselor**." (Baixíssimo custo, alinha a narrativa toda.)
2. **Score como ranking por frente na tela do aha (baixo):** apresentar as dimensões do `scoring.ts` de forma legível — portfólio/extracurriculares, documentação, prontidão de provas (TOEFL/SAT), inglês, redações — cada uma com nota e rótulo. É como a transcrição descreve ("ranquear se o portfólio está bom, a documentação de 0 a 10, a preparação pra prova").
3. **Presença do counselor no app do aluno (baixo) — os 3 toques do `21` §8:** cartão "Seu counselor: [nome]" no aha e na Jornada; uma "nota do counselor" semeada no próximo passo; CTA "falar com meu counselor" abrindo o co-piloto/mensagem.
4. **Counselor cockpit (médio, mas MOCKÁVEL) — o wow de negócio:** tela com fila de ~30 alunos, cada um com score, maior lacuna e próximo passo pré-gerados pela IA; abrir 1 aluno → "Aprovar plano" em 1 clique. Pode ser rota real leve reusando dados-semente **ou** mock estático convincente. É o que prova os ~30 alunos/dia (`08` §11).

**Arquivos prováveis:** `index.tsx`/landing (copy); `diagnostico.tsx` (ranking por frente + cartão counselor); `jornada.tsx` (cartão + nota do counselor); nova rota `counselor.tsx` (cockpit, real leve ou mock); dados-semente de alunos pro cockpit.

**Pronto quando:** a landing fala em counselor; o aha mostra o ranking por frente + o cartão do counselor; e existe uma tela de cockpit (real ou mock) que roda 10s no pitch provando "1 counselor, 30 alunos, porque a IA diagnostica".

**Risco / corte:** se o tempo apertar, o cockpit vira **fala + 1 print** e os 3 toques do aluno são o mínimo. **Nunca** deixar de mencionar o counselor na narrativa — é a resposta a "isso é só ChatGPT?" e a base da DRE.

---

## 4. Sequência, paralelismo e owners

- **F1 → F2 → F3** é a ordem natural (F2 depende do dado real e das leis da F1; F3 pole por cima). Duas coisas correm **em paralelo desde já**:
  - **Conteúdo/curadoria** (o maior risco): dono para as 5–8 universidades + 3–5 bolsas reais **com fonte e data**. Bloqueia a F1.
  - **Marca:** ✅ já resolvida (design system Abroad aplicado no protótipo, build ok).
- **Se o tempo apertar**, cortar da F3 para trás: primeiro o polish e os módulos secundários, depois o multimodal da F2 — **nunca** o co-piloto sobre perfil vivo (F2) nem a confiabilidade + próximo passo (F1), que são o coração do pitch e a resposta ao "é só ChatGPT?".
- Cada fase termina num estado **demonstrável** e commitável (repo Lovable; seguir `AGENTS.md` do projeto).

## 5. Registro de decisões

```
23/07 — base do protótipo trocada no plano: sai o reskin do repo Flash Test (v1 deste arquivo),
   entra o protótipo Lovable "Seu Futuro Internacional" (TanStack+Supabase), que já nasceu no
   domínio de candidatura internacional e é base muito melhor. Já re-skinado p/ Abroad (build ok).
23/07 — auditoria do protótipo: scoring de 13 dimensões, match de universidades e mentor IA
   (gateway Lovable/Gemini 2.5 Flash) são REAIS. Buracos = dado vazio, confiabilidade ausente
   no schema, 13 abas soltas, próximo passo não destacado, co-piloto não transversal, redação rasa.
23/07 — plano fechado em 3 fases: F1 (dados reais + 4 leis visíveis + confiabilidade), F2 (IA
   sobre perfil vivo: co-piloto transversal + aha + redação por competência + multimodal),
   F3 (polish + Golden Path ≤90s + congelamento + vídeo backup).
23/07 — achado crítico p/ lei #3: schema tem website/deadline/official_link mas NÃO tem
   source_url + verified_at. Adicionar essas colunas é entregável central da F1.
23/07 — módulo-herói mantido: Redação (menor risco, engine e CRUD já existem; re-tematizar Vitor).
23/07 — FASE 1 executada: confiabilidade (source_url/verified_at + <FonteVerificada>), nav em
   4 espaços (fim das 13 abas), próximo passo em destaque. Seeds já vinham do Lovable. Build ok.
23/07 — FASE 2 executada: co-piloto transversal no root lendo o perfil vivo, aha de 3 lacunas,
   redação por competência (IA nunca reescreve), multimodal (foto de edital). Build ok.
23/07 — FASE 3 (código) executada: ring animado, skeletons, animações de entrada, marcos na
   Jornada, Golden Path conectado. Resta operação (roteiro cronometrado, vídeo backup,
   congelamento) — depende do time/dia do pitch, não de código.
23/07 — MODO DEMO (sem conta) adotado, alinhado ao blueprint 18 §6 ("perfil vivo em store
   local/simples no MVP, sem auth real"). Motivo: login anônimo desabilitado e confirmação de
   e-mail obrigatória no projeto Supabase (não mudáveis por código, sem service key). Solução:
   adaptador `src/lib/demo-client.ts` roteado no `client.ts` — tabelas por usuário vão para o
   localStorage (com uma semente "Liz" pronta), tabelas públicas (universidades/bolsas) seguem
   no Supabase real, e a auth vira sessão demo fixa. Landing entra direto ("Entrar no protótipo"),
   sem tela de cadastro. `requireSupabaseAuth` removido das server functions do mentor (não há
   sessão real no servidor; elas não usam o id do usuário). Para voltar a exigir conta: por
   DEMO_MODE=false no demo-client e restaurar o middleware.
23/07 (tarde) — AFINAÇÃO COUNSELOR: adicionada a FASE 4 (Seção 3.2) — counselor visível no
   app do aluno (3 toques) + counselor cockpit (fila de ~30, mockável) + score como ranking
   por frente + copy da landing pro "counselor". Experiência tela-a-tela movida pro novo 21.
   Golden Path atualizado (abertura e aha citam o counselor). Nada disso invalida F1–F3.
23/07 (noite) — FASE 4 EXECUTADA em 3 blocos (ver Seção 3.2): (1) counselor visível no app do
   aluno — lib/counselor.ts, ranking por 6 frentes 0–10, cartão + nota + CTA, aha reescrito,
   landing na frase-mãe do counselor; (2) counselor cockpit em /counselor com fila de 30 rodando
   o computeReadiness REAL, aprovar plano em 1 clique e cronômetro de triagem medido;
   (3) prontidão de pitch — fallback local do co-piloto, modo apresentador em /demo, passada de
   copy. Build verde, 19 rotas em 200, tsc limpo.
23/07 (noite) — BUG CRÍTICO corrigido no demo-client: o campo de classe `private single`
   sobrescrevia o método `.single()` na instância (ES2022 class fields = [[Define]]).
   redacoes.tsx:56 usa `.single()` ao criar redação → criar redação nova na demo CRASHAVA.
   Campo renomeado para `singleMode`. Passo 6 do Golden Path estava quebrado e ninguém sabia.
23/07 (noite) — DECISÃO DE HONESTIDADE NO SCORING: `essays` e `docs` eram constantes (25 e 30)
   porque a tabela `students` não capta esses dados — resultado: os 30 alunos do cockpit exibiam
   notas idênticas nessas frentes e o teto de score era ~53/100. Em vez de inventar número,
   dimensão sem dado agora tem `measured: false`, sai do overall e aparece como "ainda não
   medido". É a lei #3 (confiabilidade) aplicada ao próprio diagnóstico — e vira argumento:
   "a gente prefere dizer que não mediu a chutar".
23/07 (noite) — `textScore` tinha base diferente por campo (15 projetos / 20 os outros), o que
   fazia "Projetos" ser a menor dimensão de QUALQUER perfil: 30 de 30 alunos com a mesma maior
   lacuna. Base unificada + pontuação por substância (itens × profundidade) + sementes da fila
   enriquecidas. Medido depois: 5 lacunas distintas (11/7/7/3/2), scores 34–63, 20 distintos.
23/07 (noite) — coerência do aha: lacunas/próximo passo vêm das DIMENSÕES, o ranking mostra
   FRENTES; a tela se contradizia ("comece por SAT" vs. "o que trava é portfólio"). Helper
   `frenteDaLacuna()` alinha nota do counselor, CTA e fallback à frente da lacuna nº 1.
23/07 (noite) — RISCO #1 DO PITCH ENDEREÇADO: o `.env` não tem LOVABLE_API_KEY. O co-piloto
   agora responde localmente a partir do perfil vivo quando o gateway falha, sempre MARCADO
   como "resposta local" (não fingir que é a IA). O vídeo backup continua obrigatório.
24/07 — 🧪 **ESTADO INICIAL EM BRANCO** (pedido do fundador: "quero que as pessoas testem e
   coloquem os seus dados"). A semente do perfil "Liz" saiu do `demo-client.ts` — ela era ótima
   pra demonstrar e péssima pra testar, porque o quiz abria pré-preenchido. Agora cada visitante
   começa do zero. Detalhes: (a) a troca do FLAG de semente (v2→v3) **limpa** quem já tinha a Liz
   salva no navegador, senão o localStorage dele a manteria pra sempre; (b) todos os `"Liz"`
   hardcoded viraram o nome que a pessoa dá no quiz (ou neutro) — o chat, o cockpit e o /meta
   inventariam um nome alheio; (c) estados vazios reescritos em `/meta` (CTA pro quiz em vez de
   tela morta) e no dashboard; (d) o fallback do co-piloto ganhou resposta específica para perfil
   vazio — antes dizia "readiness 0/100" e listava "estas três" lacunas com a lista vazia;
   (e) "sua aluna" no cockpit virou neutro. A fila de 30 alunos-semente do cockpit **continua** —
   é dado do outro lado do produto (o counselor), não do visitante. Republicado.
24/07 — 🌐 **PROTÓTIPO HOSPEDADO: https://flashtest-enem.netlify.app** (produção, 20/20 rotas
   em 200, SSR ativo). O que foi preciso: o preset do Nitro no projeto era `cloudflare-module`
   (padrão do `@lovable.dev/vite-tanstack-config` via `defaultPreset`), que gera worker +
   wrangler.json e NÃO roda na Netlify. Passamos `nitro: { preset: "netlify" }` no
   `vite.config.ts` — sobrescreve o fallback e emite `dist/` (estático) +
   `.netlify/functions-internal/server/` (função SSR). Sem `_redirects` de fallback porque o
   `server.mjs` já declara `path:"/*"` + `preferStatic:true` (Functions v2 in-code config).
   Novo `netlify.toml` com publish=dist e functions=.netlify/functions-internal.
   Env do Supabase não precisou ser configurada no painel: os `VITE_*` ficam embutidos nos dois
   bundles (cliente e SSR) em build time — verificado. Fluxo usado: deploy draft → validação
   das 20 rotas → `--prod`.
24/07 — ⚠️ **ESCOLHA DO SITE (importante):** a conta tem 3 sites e **nenhum era o protótipo**
   (ele nunca tinha sido hospedado). `abroad-link` é a **LP do Instagram da marca viva**
   (592 KB) — NÃO foi tocado. `flashtest-enem` e `papaya-muffin-3d5c6f` eram a LP da marca
   **antiga** (Flash Test/ENEM, arquivada nos docs). Publicamos em `flashtest-enem` porque é
   marca antiga e **não tem repo GitHub ligado** (deploy manual não conflita com build
   automático). O `papaya-muffin-3d5c6f` está ligado a `github.com/matheusvllz/flashtest` e
   por isso foi deixado de fora. Se o time quiser um domínio com o nome certo, renomear o site
   no painel (Site settings → Change site name) é instantâneo e não requer novo deploy.
23/07 — passada de responsividade (mobile) + caça a bugs: app já era mobile-first (Lovable);
   reforços = overflow-x-clip no shell/landing, bottom nav à prova de tela estreita (truncate),
   linha de documentos reorganizada. Bugs corrigidos: (1) rascunho de redação vazava entre
   redações ao trocar de aba; (2) currículo salvo não carregava no editor (estado inicial preso).
   Adaptador demo validado com teste isolado (8/8). Build verde, 16 rotas 200, log limpo.
```
