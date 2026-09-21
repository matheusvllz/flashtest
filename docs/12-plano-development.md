# 12 — Plano de Development (3 fases → protótipo final do pitch)

> **Plano histórico. Atualização em 21/09/2026:** o plano executável vigente é [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md), ainda não implementado. O requisito abaixo de abrir o tutor automaticamente após erro foi explicitamente substituído por abertura e envio manuais. Não executar novamente as fases de julho como se fossem o backlog atual; consultar o diagnóstico e os critérios do `20`.

Status: 🟢 **as 3 fases foram executadas (22/07)**. Resta a Seção 5 (congelamento do build, cronometragem do Golden Path e vídeo backup), que é fechamento, não feature. Sequência de 3 fases de Development no repo `Aplicativo Flash Test/` para fechar o gap entre o que o `08`/`10` pediram e o que o protótipo tem hoje (auditado em `11`), terminando no protótipo congelado do pitch de sexta.
Data: 22/07/2026 · autor: sócio (Claude), a partir de leitura direta do código (`store.ts`, `styles.css`, `AppShell.tsx`, rotas `index/welcome/signup/onboarding/study/dashboard/progress/plan`, `data/questions.ts`, `data/subjects.ts`).

> Como usar: este arquivo é o plano de execução do dev. Ele NÃO repete as specs de produto (`08`) nem a auditoria (`11`) — ele as transforma em 3 blocos de trabalho com objetivo, entregáveis, arquivos afetados, critério de "pronto" e risco. Cada fase é um marco demonstrável. Ler junto com `11-estado-prototipo-handoff-claude-code.md` (o mapa do que existe) e `CLAUDE.md` do repo do app (convenções técnicas).

---

## 0. Decisões que destravam este plano (batidas em 22/07)

Quatro perguntas em aberto do `11` (Seção 7) foram resolvidas antes de planejar, para o dev não trabalhar no escuro:

1. **Unidade de estudo:** migrar de "sessão de N min" para **aula de 60s** (1–2 questões fixas), como o `08` decidiu em 21/07. A nomenclatura e a mecânica do app passam a bater com o pitch.
2. **IA real do balão:** usar a **Claude API através de uma server function do TanStack Start** — a chave fica no servidor (não exposta no client), o que é mais robusto para uma demo ao vivo. O projeto já tem `src/server.ts` e `src/start.ts`, então há onde plugar.
3. **Mascote (a foca):** **cortar a foca.** A marca entregue (`09`) é o raio/Flash Test; o app não carrega mais o mascote foca. Onde specs antigas citam "a foca" (ex.: notificação de streak), usar a identidade do raio/gold, sem personagem animal.
4. **Vitor (app de redação, atualizado 22/07 à noite):** **existe e já resolve o Cenário A do `08` Seção 5** — é um protótipo "Duolingo da redação" com centenas de fases/questões, só que com outro branding. **Não construir o micro-treino de redação do zero.** O trabalho da Development 3 vira **reskin** para o design system do Flash Test (não engine nova) — ver Seção 4 (D3) e Seção 0.1 abaixo para onde está o design system. **Ação pendente:** Vellozo trazer o repositório/pasta do Vitor para dentro do projeto (hoje só existe fora de `D:\Matheus Vellozo\`) — sem o código em mãos, o reskin não começa.

**Pendência que ainda não é do dev, mas bloqueia a Development 3:** a curadoria de conteúdo (30–50 questões da aula de 60s reais) segue sem dono claro (flag da Seção 8 do `08`) — a redação deixou de depender disso porque o Vitor já tem conteúdo pronto. Sem as questões da aula de 60s, a Development 3 ainda fica capenga nesse outro pilar — resolver em paralelo às fases 1 e 2.

### 0.1 Onde está o design system oficial (referência única)

O design system do Flash Test — cores, tipografia, tokens, telas de referência — está em **`docs/brand/Flash Test - design System.html`**. É a fonte visual definitiva para qualquer reskin ou tela nova: `09-branding.md` é o resumo em texto; o `.html` é o artefato completo entregue pela Liz. **Qualquer trabalho de rebranding (Vitor incluso) parte deste arquivo, não de memória dos tokens.**

---

## 1. Estado atual resumido (o ponto de partida)

Verificado no código, não só na auditoria. O que já é sólido e o que falta:

**✅ Reaproveitar (não reconstruir):** casca mobile (`PhoneFrame` + bottom nav), design system centralizado em `styles.css` (fácil de corrigir num lugar só), flashcards com repetição espaçada real, progresso por matéria/tópico com barras, player de vídeo do YouTube, premium/trial mock, store client-side único (`store.ts`).

**❌ / 🟡 Gap a fechar (o núcleo do pitch):**

| Gap | Onde está hoje | Fase |
|---|---|---|
| Cores fora da marca (`#10284E`/`#FEC641` vs. `#02104E`/`#FEB803`) | `src/styles.css` | D1 |
| "Sessão de N min" em vez de "aula de 60s" | `study.tsx` (`pickQuestions`), `dashboard.tsx` (seletor 3/5/10) | D1 |
| Onboarding é preferência, não quiz-disfarçado-de-conta com conteúdo | `signup.tsx` + `onboarding.tsx` | D1 |
| Sem tela de "aha moment" (3 lacunas) | — | D1 |
| Bug de dados: `subject:"port"` (q12) vs. `"por"` (q3); "Interdisciplinar" (q10) | `data/questions.ts` | D1 |
| Balão do tutor não é global/persistente | botão só em `study.tsx` | D2 |
| Nenhuma IA real (só `aiHints()` por palavra-chave) | `study.tsx` | D2 |
| Sem foto de questão (multimodal) | — | D2 |
| Redação é o app "Vitor" (funcional, com centenas de fases), mas branding errado | fora deste repo — a integrar | D3 |
| Sem ranking/turma | — | D3 |
| Progresso não é "mapa de lacunas" visual | `progress.tsx` | D3 |
| Só 20 questões (meta 30–50) | `data/questions.ts` | D3 |

---

## 2. 🔵 Development 1 — Fundação da marca + loop central certo

**Objetivo:** o esqueleto do produto passa a bater com o `08`; tudo que vier depois nasce na marca e na mecânica certas.

**Entregáveis:**
1. Tokens de cor corrigidos para os hex oficiais do `09`: Flash Navy `#02104E`, Flash Gold `#FEB803`, + variantes `#B57F00` (gold escuro), `#FFD466` (gold claro), `#0AA35A` (sucesso), `#C0392B` (erro). Substituir os literais espalhados (`#10284E`, `#FEC641`, `#22c55e`, `#ef4444`, `#e11d48`) por variáveis do tema.
2. Migração "sessão" → **aula de 60s**: reescrever `pickQuestions()` para 1–2 questões fixas; renomear "Sessão concluída" → "Aula concluída"; trocar o card "Quanto tempo você tem?" (3/5/10/escolher) do dashboard por um CTA único "Próxima aula de 60s"; ajustar `plan.tsx` para falar em aulas, não minutos.
3. **Quiz unificado disfarçado de "criar conta":** fundir `/signup` + `/onboarding` num fluxo único, tela navy estilo Stories, sem pedir e-mail/senha reais. Inclui 2–3 perguntas de **conteúdo real** (calibração de nível), além de estado + faculdade-alvo. Reaproveitar os 27 estados e o `InstitutionPicker` que já existem.
4. **Tela de aha moment:** ao fim do quiz, tela "Já entendi você. Pra [faculdade], suas 3 maiores lacunas: […]" + XP inicial + streak dia 1. As 3 lacunas saem das respostas de conteúdo (heurística simples nesta fase; a IA refina na D2).
5. Corrigir bugs de dados em `data/questions.ts` (`port`→`por`; revisar "Interdisciplinar").

**Arquivos afetados:** `src/styles.css`, `src/routes/study.tsx`, `src/routes/dashboard.tsx`, `src/routes/plan.tsx`, `src/routes/onboarding.tsx`, `src/routes/signup.tsx`, `src/routes/index.tsx` (roteamento do splash), `src/lib/store.ts` (campos do quiz/lacunas), `src/data/questions.ts`. Possível nova rota/tela de aha.

**Pronto quando:** primeiro acesso → quiz (com conteúdo) → aha com 3 lacunas → aula de 60s roda de ponta a ponta, coeso e na paleta oficial. Nenhuma tela ainda mostra "sessão" ou minutos.

**Risco:** mexer no fluxo de entrada pode quebrar o roteamento por estado (`authed`/`onboarded`) do `index.tsx`. Mitigação: manter as flags do store, só reencenar as telas por cima delas.

---

## 3. 🟡 Development 2 — Camada de IA (o "wow" do pitch)

**Objetivo:** o diferencial de IA visível funciona ao vivo — é o momento que o apresentador destaca na demo.

**Entregáveis:**
1. **Balão do tutor global e persistente:** componente flutuante fixo no canto inferior direito, presente em **todas** as telas pós-onboarding (dashboard, study, progress, plan, etc.). Bolha navy com detalhe gold e ícone do raio. Estado no `store.ts` (aberto/fechado, histórico) — sem mecanismo de estado paralelo.
2. **1 chamada de IA real** via **server function do TanStack Start** chamando a Claude API: gera a micro-explicação personalizada do erro ao vivo e responde as perguntas do balão. Prompt estruturado em PACE (`07`). Fallback: se a chamada falhar, cai numa explicação genérica (nunca tela quebrada na banca).
3. **Balão mostra desempenho atual** puxando do store ("7/10 em Funções essa semana") — o número é regra, a frase é IA (ser honesto com a banca sobre isso, `08` Seção 6).
4. **Foto de questão** dentro do balão: botão de anexo → resposta da IA. Real (multimodal) se o provedor permitir na server function; senão, resposta mockada convincente. É "1 toque de wow", não o herói (`08` Seção 2).

**Arquivos afetados:** novo componente de balão (`src/components/`), `src/lib/store.ts`, `src/server.ts` (ou nova server function), `src/routes/study.tsx` (integrar o balão no lugar do chat de tela cheia), `AppShell.tsx` (montar o balão global). Config de chave (`.env` no servidor).

**Pronto quando:** dá pra errar uma questão de propósito na aula e o balão aparece com uma explicação gerada por IA de verdade, e o balão existe em todas as telas.

**Risco:** dependência de rede/API na hora do pitch. Mitigação: fallback local + o vídeo backup do Golden Path (gravado na D3/congelamento). Decidir chave/custo antes de começar.

---

## 4. 🟢 Development 3 — 2º pilar (redação) + acabamento de produto

**Objetivo:** o MVP fica "completo" para a demo e para gravar o vídeo backup.

**Entregáveis:**

1. **Reskin do Vitor para o design system do Flash Test** (não é engine nova — ver Seção 0.1 para o `.html` do design system): trocar cores/tipografia/logo do app de redação existente pelos tokens oficiais (`#02104E`/`#FEB803` + tipografia Space Grotesk/Plus Jakarta Sans), e adaptar a casca (bottom nav, botões, cards) ao padrão do `AppShell.tsx` deste repo, na medida do possível dado como o Vitor foi construído. Integrar como rota/módulo dentro do app principal (ou, se a stack for incompatível para integrar em poucos dias, linkar como um flow separado que abre a partir do mesmo dashboard — decidir isso ao ver o código do Vitor, ver Cenário C do `08` Seção 5).
2. **Não expor as centenas de fases reais** — o protótipo só precisa **PARECER** ter muito conteúdo. **~5 fases navegáveis e polidas já são mais que suficientes** para a demo e para a sensação de produto completo; o resto do banco do Vitor fica lá "por trás" (não precisa deletar, só não é o que a demo percorre). Aplicar a mesma lógica de "amplitude aparente, profundidade real pequena" que já vale para o banco de questões da aula de 60s (20 reais > parecem infinitas).
3. **Ranking/turma** mockado convincente (Tela 7 do `10`): colegas fictícios por XP semanal, aluno destacado em gold. Dados mock bem-feitos, sem backend.
4. **Progresso como mapa de lacunas** mais visual: reformular `progress.tsx` para comunicar "suas fraquezas estão diminuindo" (barras/heatmap), amarrando à faculdade-alvo do quiz.
5. **Ampliar questões 20 → 30–50** (depende da curadoria de conteúdo — ver Seção 0).
6. **Polimento de produto:** estados vazios desenhados, skeleton/loading, microanimações de XP subindo e brilho no acerto — o "aplicativo mais top" do `10`.

**Arquivos afetados:** código do Vitor (fora deste repo hoje — precisa ser trazido para dentro do projeto antes de começar, ver Seção 0), `src/data/*` (ranking, mais questões), nova rota `src/routes/ranking.tsx` (ou similar), `src/routes/progress.tsx`, ajustes de polish transversais.

**Pronto quando:** as 8 telas do `10` navegam com acabamento de produto, o módulo de redação (Vitor reskinado, ~5 fases visíveis) usa a marca certa, e o Golden Path completo (quiz→aha→aula→redação→progresso, com balão global) roda limpo.

**Risco:** escopo estourar no polish, e a stack do Vitor ser incompatível para um reskin rápido. Mitigação: ranking/plano são mock — não construir lógica real; se o reskin do Vitor emperrar, cair no Cenário C do `08` (reaproveitar só os prompts/rubrica de correção, construir a tela nova no padrão deste repo com poucas fases mockadas).

---

## 5. 🏁 Protótipo final do pitch (congelamento — Dia 4, quinta 23/07)

Não é uma fase de features nova — é o fechamento (alinhado ao `03`/`08` Seção 9):
- Cronometrar o Golden Path em **≤ 90s de demo** dentro dos 3 min de pitch. Cortar passos (foto, redação) se estourar.
- **Congelar o build às 20h** — nenhuma feature nova depois.
- **Gravar o vídeo backup** do Golden Path (plano contra queda de wi-fi/API).
- Cópia offline (LP + protótipo rodando sem rede).
- Garantir que a landing page (`04`) e o protótipo usam exatamente os mesmos tokens da marca.

---

## 6. Sequência e paralelismo

- **D1 → D2 → D3** é a ordem natural (D2 depende do loop certo da D1; D3 preenche em cima). Mas duas coisas correm **em paralelo desde já**: (a) Vellozo trazer o repositório do Vitor para dentro do projeto (sem isso o reskin da D3 não começa) e (b) a **curadoria de conteúdo** das questões da aula de 60s (ainda sem dono, `08` Seção 8) — senão a D3 fica sem insumo nesse pilar.
- Cada fase termina num estado **demonstrável e commitável** (push simples — repo conectado ao Lovable, nunca reescrever histórico, ver `CLAUDE.md`/`AGENTS.md`).
- Se o tempo apertar, a ordem de sacrifício é: primeiro o polish/ranking da D3, depois a foto multimodal da D2 — **nunca** o balão global + IA real (D2) nem o quiz→aha (D1), que são o coração do pitch.

## 7. Registro de decisões

```
22/07 — unidade de estudo: migrar "sessão de N min" → "aula de 60s" (1–2 questões fixas).
22/07 — IA do balão: Claude API via server function do TanStack Start (chave no servidor).
22/07 — mascote: cortar a foca; usar só a identidade do raio/Flash Test.
22/07 (tarde) — Vitor: não era caminho crítico; redação construída do zero por default.
22/07 (noite) — atualização: Vitor existe, funciona, tem centenas de fases — vira reskin (D3), não construção do zero. Design system oficial confirmado em `docs/brand/Flash Test - design System.html`.
22/07 (noite) — escopo aparente: protótipo final só precisa PARECER ter muitas questões/fases — ~5 fases de redação (do Vitor reskinado) já são suficientes para a demo.
22/07 — formato deste plano: doc SDD escrito e parado para revisão antes de codar.
22/07 (D3 executada) — o app do Vitor é Next.js + Supabase + checkout/admin; o Flash Test
   é TanStack Start + Vite. Reskin in loco era inviável no prazo, então adotou-se um
   caminho intermediário entre os Cenários A e C do `08` §5: portou-se o MOTOR de lições
   (declarativo, sem acoplamento de framework) e TODO o conteúdo — 15 trilhas, 134 lições,
   1.204 exercícios — reconstruindo as 7 views de exercício no design system Flash Test.
   Ganhou-se o conteúdo real do Vitor sem herdar a stack dele.
22/07 (D3) — escopo aparente revisto: como o QR code do pitch deixa o público testar o app,
   as 134 lições ficam TODAS navegáveis (não as ~5 previstas). O que limita a profundidade é
   o desbloqueio sequencial, não o esconder conteúdo — e a trilha se ordena com os 3 blocos
   de redação primeiro e a base de português depois.
22/07 (D3) — mascotes do app de origem (Dona Vírgula / Seu Parágrafo) removidos das 134
   lições, coerente com o corte da foca: a identidade é o raio, sem personagem.
22/07 (D3) — banco de questões 20 → 59, cobrindo as 11 matérias. O gabarito foi
   redistribuído entre A–E (estava 52/59 em B ou C): com o app aberto ao público no QR code,
   viés de gabarito é falha percebível.
22/07 (D3) — bottom nav passa a carregar os DOIS pilares (Estudar + Redação) e o Progresso;
   plano, flashcards e ranking migraram para cards do dashboard.
22/07 (tarde) — PROVEDOR DE IA TROCADO: a decisão de 22/07 pela Claude API foi revertida
   porque o crédito comprado (R$ 270) é da OpenAI. O balão agora usa `gpt-5.4-mini`, escolhido
   por medição contra gpt-4o-mini / gpt-4.1-mini / gpt-5-mini com o prompt real: foi o mais
   rápido (~1,4-2,6s) E o único que resolveu a questão em vez de só citar a fórmula.
   gpt-5-mini foi descartado por gastar ~5,8s com reasoning — inviável ao vivo.
   Chamada via `fetch` puro (sem SDK): o alvo do build é worker, não Node. O SDK da Anthropic
   foi desinstalado (eram 419 KB de peso morto no bundle do servidor).
22/07 — regra anti-LaTeX no prompt: o modelo devolvia `\(x_v = -b/2a\)` por padrão, o que
   apareceria cru no balão. O prompt agora exige matemática escrita como se falada.
```
