# 21 — Especificação do Protótipo Abroad (build-ready)

Status: 🟢 **v1 (23/07, tarde)** — a especificação tela-a-tela do protótipo, pronta pra construir. Enquanto o `18` é "como o app tem que ser" (arquitetura/módulos/motor) e o `20` é "o plano de execução em fases" (o que já foi feito no código), **este `21` é o roteiro definitivo da EXPERIÊNCIA do protótipo do pitch**: o que aparece em cada tela, a ordem de navegação, o fluxo completo, as interações, o que é essencial vs. mock vs. fora-do-MVP, como a IA e o counselor entram, como a copy aparece, o **momento wow** e como o protótipo prova a solução da dor.

> Pais: `18` (arquitetura + 4+1 leis), `08` (estratégia + counselor + negócio), `14` (Liz), `15`/`17` (voz), `20` (estado real do código). Base de código: `Prototipo teste/Seu Futuro Internacional (1)/` (TanStack Start + React + Supabase, modo demo). Design: `Abroad Design System.html`.

> **A régua de tudo:** o protótipo tem que traduzir a estratégia e a copy numa experiência **real, simples, intuitiva e convincente**, priorizando o que precisa ser demonstrado no pitch de 3 min. Cada decisão abaixo se testa contra as leis do `18`: **um ambiente só · o próximo passo sempre · confiabilidade no crítico · a IA decide, não enfeita · a IA amplia o counselor.**

---

## 0. A ideia do protótipo em uma frase

**Em 3 minutos, a Liz sai de "não sei por onde começar" para "tenho um counselor, um diagnóstico do meu perfil e o meu próximo passo" — e o público vê, do outro lado, um counselor atendendo 30 alunos porque a IA fez o diagnóstico pesado.** O protótipo tem que provar as duas coisas: o **valor pro aluno** (o mapa em 3 min) e a **mágica do negócio** (a IA que multiplica o counselor).

---

## 1. Os dois lados do protótipo (e o que cada um prova)

| Lado | Quem usa | O que prova no pitch | Peso na demo |
|---|---|---|---|
| **App do aluno** (Liz) | a persona | A dor resolvida: anamnese → score/ranking → mapa → próximo passo → counselor + co-piloto | 🔴 núcleo (≈75s) |
| **Counselor cockpit** | o orientador | O negócio: 1 counselor vê 30 alunos já pré-diagnosticados pela IA e triagem em minutos (≈30/dia) | 🟡 clímax de negócio (≈15s) |

**Regra de prioridade:** o **app do aluno já está construído** (`20`) e é o coração — nunca sacrificá-lo. O **counselor cockpit** é a novidade da afinação 23/07; para o pitch de sexta ele pode ser **uma tela real leve OU um mock convincente** (Seção 7). Ele é curto, mas é o que faz a banca entender por que isso é um negócio e não um chatGPT com casca.

---

## 2. Momento wow (há dois — nesta ordem)

1. **Wow do aluno (o principal):** ao fim da anamnese de 3 min, a tela do **aha** — o **readiness ring animando de 0 até o score**, as **3 maiores lacunas nomeadas** pela IA em linguagem humana, e **um** próximo passo claro. *Fala do apresentador:* "em 3 minutos, 14 abas viraram um diagnóstico do perfil dela e um primeiro passo."
2. **Wow do negócio (o que faz investidor se inclinar):** o corte pro **counselor cockpit** — uma fila de ~30 alunos, cada um já com score, lacuna e próximo passo prontos pela IA; o counselor abre um, aprova o plano em segundos. *Fala:* "isso é um counselor atendendo 30 alunos num dia — o que só a elite tinha, por uma fração, porque a IA faz o diagnóstico."

> Se só sobrar tempo para um, é o **wow do aluno**. O do negócio pode virar uma única tela mostrada por 10s + fala.

---

## 3. O fluxo completo do usuário (Golden Path — a ordem exata das telas)

A navegação segue a espinha da **Jornada** (lei #1). Ordem de apresentação = ordem da fala.

```
LANDING (Abroad) 
  └─(clica "Entrar no protótipo" / "Montar meu mapa")→ MODO DEMO (sem cadastro)
       │
       ▼
[1] ANAMNESE / DIAGNÓSTICO (onboarding conversacional, ~6-8 perguntas, 1 por tela)
       │  objetivo(país/área) · ano/notas · inglês · provas · orçamento · bolsa · extras
       ▼
[2] TELA DO AHA  ← MOMENTO WOW #1
       │  readiness ring 0→score · 3 lacunas nomeadas · próximo passo · "seu counselor: [nome]"
       ▼
[3] JORNADA (home)  ← o "um ambiente só" (lei #1) + "um próximo passo" (lei #2)
       │  hero "Seu próximo passo" · etapas da jornada · 4 espaços (Descobrir/Construir/Organizar)
       ▼
[4] UNIVERSIDADE (real, com fonte)  ← confiabilidade (lei #3)
       │  match sonho/alvo/segurança · custo/requisito/prazo · "verificado em [data] + fonte oficial"
       ▼
[5] CO-PILOTO DE IA (transversal, abre em qualquer tela)  ← IA sobre perfil vivo (lei #4)
       │  "pra Stanford, sua lacuna de inglês é o gargalo" · (opcional: foto de edital→extrai req.)
       ▼
[6] REDAÇÃO POR COMPETÊNCIA (módulo-herói)  ← IA orienta, nunca escreve
       │  1 drill de competência (narrativa pessoal/especificidade/estrutura/voz/encaixe)
       ▼
[7] COUNSELOR COCKPIT  ← MOMENTO WOW #2 (o negócio)
          fila de ~30 alunos ranqueados pela IA · abre 1 · aprova plano · "30 alunos/dia"
```

**Corte se estourar 90s:** cai primeiro [6] redação, depois o opcional multimodal de [5], depois [7] vira só fala + 1 print. **Nunca cortar:** [1]→[2] (aha) nem [5] (co-piloto sabendo o perfil). São o coração e a prova de que a IA não é enfeite.

---

## 4. O que aparece em cada tela (detalhamento)

Formato: **objetivo · o que aparece · interações · IA · copy · essencial/mock**.

### LANDING (rota `/` → entra no modo demo)
- **Objetivo:** transição marca → produto; abrir o protótipo sem atrito.
- **Aparece:** logo Abroad (o "A" + avião), a frase-mãe ("Estudar fora não é pra quem tem contato. É pra quem tem um **counselor**."), 1 botão grande **"Montar meu mapa"** / "Entrar no protótipo". Fundo navy, CTA em destaque.
- **Interações:** 1 clique → anamnese. Sem cadastro (modo demo, `20` §5).
- **IA:** nenhuma aqui.
- **Copy:** hero curto na voz da Liz (`17`). Microcopy sob o botão: "3 minutos. Sem cadastro chato. Sem consultoria de R$ 50 mil."
- **Essencial.** (Já existe; ajustar o texto pro counselor.)

### [1] ANAMNESE / DIAGNÓSTICO (`onboarding.tsx` → `diagnostico.tsx`)
- **Objetivo:** captar o perfil disfarçado de conversa (não formulário) e alimentar o score. É a "anamnese" da transcrição.
- **Aparece:** uma pergunta por tela, formato conversa, barra de progresso sutil. Perguntas: objetivo (país/área/nível) · ano escolar + média · nível de inglês (+ prova se tiver: TOEFL/IELTS/Duolingo) · provas padronizadas (SAT/ACT/ENEM) · orçamento anual · precisa de bolsa? · extracurriculares/liderança/projetos (texto curto).
- **Interações:** seleção/toque, swipe/avançar; nada de senha/e-mail.
- **IA:** as respostas viram o `Student` que o `scoring.ts` pontua (13 dimensões, 0–100). Aqui a IA está "montando o caminho", não a Liz "preenchendo cadastro" — dizer isso na fala.
- **Copy:** tom cúmplice (`15` §11): "isso não é formulário nem venda — são 3 minutos pra gente (e seu counselor) entender onde você está." Pergunta de orçamento com a copy que desarma ("pra te mostrar o que é realista pro seu bolso, sem empurrar o impossível").
- **Essencial.** (Existe; garantir que capta provas e orçamento pro score.)

### [2] TELA DO AHA (`diagnostico.tsx`) — WOW #1
- **Objetivo:** o momento de valor. Abrir a caixa-preta em 3 min.
- **Aparece:**
  - **Readiness ring** animando de 0 até o score global (número contando). *(componente `readiness-ring.tsx` já existe.)*
  - **Score por dimensão** apresentado de forma legível — as frentes que a transcrição cita como "ranking": **portfólio/extracurriculares, documentação, prontidão de provas (TOEFL/SAT), inglês, redações** etc., cada uma com uma nota e um rótulo (inicial/em desenvolvimento/competitivo/destaque).
  - **As 3 maiores lacunas nomeadas** pela IA em linguagem humana (não "dimensão 7 baixa", e sim "falta uma prova de inglês oficial").
  - **Um próximo passo** priorizado (o `plan.top3[0]` do scoring).
  - **"Seu counselor: [nome/foto]"** — um cartão discreto que apresenta o orientador humano que vai acompanhar (a presença do counselor entra já aqui). CTA "falar com meu counselor" abre o co-piloto/mensagem.
- **Interações:** rolar pra ver as dimensões; CTA "ver minha jornada" → [3]; CTA "por que essas lacunas?" abre o co-piloto com o contexto.
- **IA:** refina o ranking do `scoring.ts` em 3 lacunas + o passo. **É o wow de IA mais barato e convincente.**
- **Copy:** nomear o aha (`15` §11): "Pronto. Pra [objetivo], seu caminho tem 5 etapas, você está na 1, e seu próximo passo é [X]. Não era pra quem tem contato — era pra quem tem o mapa e um counselor. Agora você tem os dois."
- **Essencial.** (Existe; adicionar o cartão do counselor e destacar o score por dimensão como "ranking".)

### [3] JORNADA (home) (`jornada.tsx` / `dashboard.tsx`)
- **Objetivo:** provar "um ambiente só" (vs. 14 abas) e "um próximo passo" (vs. 40 tarefas).
- **Aparece:** hero **"Seu próximo passo"** no topo (a tarefa mais urgente ou a maior lacuna) com a copy "um passo de cada vez, sem sobrecarga"; a **linha de etapas** da jornada se preenchendo; os **4 espaços** (Descobrir/Construir/Organizar) como entrada, não 13 abas soltas; selo "Marco concluído" quando uma etapa fecha (marcos, não streak).
- **Interações:** clicar no próximo passo leva ao módulo certo; explorar espaços é opcional.
- **IA:** o priorizador escolhe **um** próximo passo (impacto × prazo × pré-requisito).
- **Copy:** "não pensa nas 13 coisas. Hoje, só uma: [X]. O resto a gente (e seu counselor) segura e mostra na hora certa." (`15` §12)
- **Essencial.** (Existe pós-F1.)

### [4] UNIVERSIDADE com fonte (`universidades.tsx` / `universidades.$slug.tsx` / `comparar.tsx`)
- **Objetivo:** confiabilidade visível (lei #3) — a resposta a "e se a IA errar um prazo?".
- **Aparece:** recomendação em **sonho / alvo / segurança** com o "porquê" de cada; página da universidade com custo, requisito (TOEFL/SAT), **prazo em destaque**, e o selo **`<FonteVerificada>`**: "Verificado em [data] · Confirmar na fonte oficial ↗".
- **Interações:** salvar universidade (entra no perfil vivo e na comparação); abrir o link oficial.
- **IA:** `computeMatch()` cruza país × orçamento × inglês × prova × bolsa × competitividade.
- **Copy:** "esse prazo é da fonte oficial (atualizado em [data]) — a gente aponta, a fonte confirma. No que é sério, a gente não chuta." (`17` §9)
- **Essencial.** (Existe; dados reais já semeados — Stanford/MIT/Oxford etc.)

### [5] CO-PILOTO DE IA (`co-pilot.tsx`, montado no `__root.tsx`)
- **Objetivo:** provar "não é só ChatGPT" — a IA sabe quem é a Liz (perfil vivo) e o counselor está atrás.
- **Aparece:** balão flutuante em **qualquer** tela; ao abrir, já cumprimenta com contexto ("pra Stanford, sua lacuna de inglês é o gargalo"). Botão de **anexo** (foto de edital/documento → extrai requisitos/prazos, terminando em "confirme na fonte").
- **Interações:** perguntar algo real ("preciso de SAT pra essas 3?") → resposta puxando o perfil; (opcional) anexar foto.
- **IA:** `mentor.functions.ts` (Gemini via gateway Lovable) recebe o **perfil vivo** (`live-profile.ts`) como contexto. Guardrails: estimativas rotuladas, item crítico → fonte.
- **Copy:** "não vou te dar 40 tarefas. Hoje, só uma: [X]. E se for coisa séria, seu counselor entra." Diferencia do ChatGPT na fala.
- **Essencial.** (Existe pós-F2; depende da `LOVABLE_API_KEY` — ter fallback/vídeo backup.)

### [6] REDAÇÃO POR COMPETÊNCIA (`redacoes.tsx`) — módulo-herói
- **Objetivo:** mostrar profundidade de execução onde consultoria cobra caro (o essay).
- **Aparece:** 5 micro-drills por competência (narrativa pessoal · especificidade · estrutura · voz · encaixe com a universidade); a IA dá feedback competência a competência e **nunca reescreve** (guardrail visível).
- **Interações:** escrever/colar um trecho → receber feedback específico.
- **IA:** avalia autenticidade/alinhamento (semântico); re-tematização do "Vitor" (`18` §7).
- **Copy:** "a gente orienta; o texto é seu (universidade penaliza texto de IA). Seu counselor pode revisar a versão final."
- **🟡 Mostrar 1 drill na demo.** (Existe pós-F2.)

### [7] COUNSELOR COCKPIT (novo) — WOW #2
- **Objetivo:** provar o negócio — a IA multiplica o counselor (≈30 alunos/dia).
- **Aparece:** uma **lista/fila de ~30 alunos**, cada linha com: nome, readiness (score), **maior lacuna**, próximo passo sugerido pela IA, status (novo/aguardando/ok). Ordenável por urgência. Ao abrir um aluno: o diagnóstico pronto (o mesmo da tela do aha), um rascunho de plano gerado pela IA e botões **"Aprovar plano"** / "Ajustar" / "Enviar mensagem".
- **Interações:** abrir 1 aluno → aprovar o plano em 1 clique (mostra que leva segundos). Voltar pra fila.
- **IA:** o mesmo `scoring.ts` + perfil vivo, agora agregados para o counselor. A IA pré-mastiga; o humano decide.
- **Copy (fala do apresentador):** "cada um desses 30 já chega diagnosticado pela IA. O counselor não gasta 1 hora por aluno descobrindo o perfil — ele valida e orienta em minutos. É assim que um counselor atende 30 num dia, e é por isso que cabe no bolso da Liz."
- **🟡 Essencial-para-o-negócio, mas pode ser mock:** para o pitch, pode ser uma tela real simples (reusa dados de alunos-semente) **ou** um mock estático convincente com ~30 linhas geradas. Baixo custo, alto retorno de pitch. **Fora do MVP funcional:** roteamento real de mensagens, notificações ao aluno, agenda do counselor.

---

## 5. Como a IA entra na experiência (mapa rápido)

| Onde | O que a IA faz | Real no protótipo? |
|---|---|---|
| Anamnese → score | pontua 13 dimensões (0–100), classifica, prioriza | ✅ real (`scoring.ts`) |
| Tela do aha | nomeia 3 lacunas + próximo passo em linguagem humana | ✅ real (refina o scoring) |
| Recomendação de universidades | match multivariável sonho/alvo/segurança | ✅ real (`computeMatch`) |
| Co-piloto | responde puxando o perfil vivo | ✅ real (Gemini + `live-profile`) |
| Redação | feedback por competência, nunca reescreve | ✅ real |
| Multimodal | foto de edital → extrai requisitos | 🟡 real se o gateway permitir; senão mock |
| Counselor cockpit | pré-diagnostica a fila de alunos | 🟡 real leve ou mock |

**Princípio:** a IA **decide/gera/classifica** (não enfeita) e **amplia o counselor** (não o substitui). Toda demo de IA usa prompt PACE (`07`).

---

## 6. Como a copy aparece ao longo da jornada

A copy do `15`/`17` não é só pra LP — ela **é a UX**. Pontos onde a voz da Liz aparece na tela:

- **Landing/aha:** a frase-mãe com "counselor" ("não é pra quem tem contato, é pra quem tem um counselor").
- **Anamnese:** tom de conversa, não formulário ("isso não é cadastro; é a IA e seu counselor te conhecendo").
- **Aha:** nomear o alívio ("finalmente alguém explicando de um jeito que eu entendo") + apresentar o counselor.
- **Jornada:** sempre **um** próximo passo ("hoje, só isso"); creditar a ela nos marcos ("isso é você, com o mapa certo").
- **Item crítico:** microcopy de confiança ("segundo a fonte oficial, atualizado em [data] — confirma aqui").
- **Co-piloto:** anti-sobrecarga + diferenciação do ChatGPT.
- **Nunca:** promessa de admissão, jargão seco, FOMO fabricado, tom condescendente (`15` §13 / `17` §5).

---

## 7. Essencial vs. mock vs. fora-do-MVP (a régua de escopo)

**FUNCIONA DE VERDADE (essencial — já existe, só afinar):**
1. Anamnese → score/ranking (13 dimensões).
2. Tela do aha (ring + 3 lacunas + próximo passo + cartão do counselor).
3. Jornada com **um** próximo passo (4 espaços, não 13 abas).
4. Universidade real com **fonte + data**.
5. Co-piloto transversal lendo o perfil vivo (1 chamada de IA ao vivo).
6. 1 drill de redação por competência.

**SÓ PRECISA PARECER (mock convincente):**
- **Counselor cockpit** (fila de 30 + aprovar plano) — mock aceitável pro pitch.
- Multimodal (foto de edital) — real se der; senão resposta mockada.
- Documentos, currículo, bolsas, financeiro, visto, entrevista — telas ilustrativas / etapas da Jornada.
- Chat aluno↔counselor — visual, sem roteamento real.

**FORA DO MVP (não construir pro pitch — dizer no discurso "isso é a V1"):**
- Login/cadastro real, pagamento, agenda/CRM do counselor, notificações reais.
- Base completa de universidades/bolsas (bastam 5–8 reais e datadas).
- Multi-país completo, crawler de bolsas, entrevista por voz.
- Motor de recomendação que aprende com dados de admissões (é o moat de longo prazo, `08` §10).

---

## 8. Presença do counselor no app do aluno (como torná-lo visível sem construir tudo)

Para o counselor "existir" na experiência do aluno sem virar um chat operacional completo, bastam **3 toques** (baratos, alto impacto):
1. **Cartão "Seu counselor: [nome/foto]"** na tela do aha e um cantinho fixo na Jornada.
2. **Uma "nota do counselor"** no próximo passo em momentos-chave ("o [nome] revisou seu perfil e sugere focar no TOEFL primeiro") — pode ser semeada/mock.
3. **CTA "falar com meu counselor"** que abre o co-piloto num modo "mensagem" (ou o mesmo balão) — deixa claro que há um humano no circuito, mesmo que a resposta na demo seja roteirizada.

Isso concretiza a lei #5 (a IA amplia o counselor) na tela, e é a resposta viva a "isso é só ChatGPT?".

---

## 9. Roteiro do pitch com o counselor (≤90s, mapeado às telas)

1. **(10s)** "A Liz tem tudo pra estudar fora — menos um counselor. A escola dela não oferece um. A gente dá." Abre a landing.
2. **(20s)** Anamnese → **aha**: ring anima, score por frente, 3 lacunas, próximo passo, "e este é o counselor dela". *("Em 3 min, 14 abas viraram um diagnóstico e um primeiro passo.")*
3. **(15s)** Jornada: **um** próximo passo, etapas, "um ambiente só, não 13 abas".
4. **(15s)** Universidade real: "verificado em [data] + fonte oficial" — a resposta ao "e a precisão?".
5. **(20s)** Co-piloto ao vivo: já sabe o perfil da Liz. "Isso o ChatGPT não faz — e atrás dele tem um counselor de verdade." (opcional: foto de edital.)
6. **(10s)** **Counselor cockpit:** a fila de 30 alunos pré-diagnosticados. "Um counselor, 30 alunos por dia, porque a IA faz o diagnóstico. É o que só a elite tinha, por uma fração."

**Backup obrigatório:** vídeo screen-capture do Golden Path gravado na véspera (contra queda de wi-fi/API), embutido na própria LP.

---

## 10. Checklist de prontidão do protótipo (pré-congelamento)

> Status verificado em **23/07, noite** (build verde, `tsc` limpo, 19 rotas em 200).
> O checklist vivo também está dentro do próprio protótipo, na rota **`/demo`**.

- [x] Landing com a frase do **counselor** e botão que entra no modo demo sem atrito.
- [x] Anamnese capta provas (TOEFL/SAT) e orçamento → alimenta o score.
- [x] Aha: ring anima + score por dimensão legível ("ranking") + 3 lacunas + próximo passo + **cartão do counselor**.
- [x] Jornada mostra **um** próximo passo e os 4 espaços (não 13 abas).
- [x] ≥1 universidade real com **fonte + data** visível.
- [x] Co-piloto abre em qualquer tela e cita o perfil + **fallback local marcado** quando o gateway cai. ⚠️ *A chamada ao vivo depende de `LOVABLE_API_KEY`, que **não está no `.env`** — decidir antes do pitch: colocar a chave (demo de IA real) ou assumir o fallback local + vídeo.*
- [x] 1 drill de redação por competência funcionando. *(estava crashando ao criar redação nova — bug do `.single()` corrigido, ver `20`.)*
- [x] **Counselor cockpit** com fila de 30 + "aprovar plano" — **real, não mock**: roda o `computeReadiness()` do app sobre 30 perfis-semente.
- [x] Tokens Abroad idênticos entre LP e app.
- [ ] **Vídeo backup** do Golden Path gravado; cópia offline. → *depende de gente, não de código.*
- [ ] Golden Path cronometrado ≤90s, 3× em voz alta. → *cronômetro pronto em `/demo`.*

**Rotas novas para o pitch:** `/counselor` (cockpit, wow #2) e `/demo` (modo apresentador: cronômetro, roteiro beat a beat, "zerar a demo" entre ensaios, checklist).

---

## 11. Registro de decisões

```
23/07 (tarde) — criado o 21 (spec de experiência build-ready do protótipo), separando-o do
   20 (plano/estado de execução) e do 18 (arquitetura). Motivo: pedido do fundador de
   especificar o protótipo em nível de construção direta.
23/07 (tarde) — o protótipo passa a ter DOIS lados: app do aluno (já construído) + counselor
   cockpit (novo). Wow #1 = aha do aluno; wow #2 = cockpit do counselor (o negócio).
23/07 (tarde) — counselor cockpit definido como essencial-para-o-negócio mas MOCKÁVEL no
   pitch de sexta (tela real leve ou mock de ~30 alunos). Nunca sacrificar o app do aluno.
23/07 (tarde) — 3 toques baratos para tornar o counselor visível no app do aluno (cartão,
   nota do counselor, CTA "falar com meu counselor"). Concretiza a lei #5.
23/07 (tarde) — correção: provas = TOEFL (inglês) + SAT (padronizada). A transcrição dizia
   "SIT" — é SAT.
23/07 (noite) — PROTÓTIPO CONSTRUÍDO conforme este 21 (detalhe de execução no 20 §3.2).
   Duas decisões que mudam o que este documento previa, para MELHOR:
   (a) o counselor cockpit NÃO virou mock — é real, rodando o computeReadiness() do app
       sobre 30 perfis-semente. Custo parecido, e responde de pé a "esses números são
       chumbados?". A fila mostra 5 lacunas distintas e scores de 34 a 63.
   (b) "fallback amigável" do co-piloto virou entregável de primeira classe, não nota de
       rodapé: sem LOVABLE_API_KEY no .env, a demo morreria em cima do wow #5. Agora
       responde do perfil vivo local, sempre marcado como "resposta local".
23/07 (noite) — nova rota /demo (modo apresentador, uso interno): cronômetro do Golden Path
   com o beat atual destacado, as 6 falas com link pra tela, "zerar a demo" entre ensaios
   (o localStorage guardava tudo que foi clicado) e o checklist da Seção 10.
23/07 (noite) — princípio novo que saiu da construção: **o diagnóstico não chuta nota.**
   Frente sem dado aparece como "ainda não medido" e sai do score, em vez de receber um
   número fixo. É a lei #3 virada para dentro — e dá uma fala boa no pitch.
23/07 (noite) — 🔴 **RESTRIÇÃO NOVA DO FUNDADOR: o app tem 1 MINUTO no pitch, não 3.**
   Consequência arquitetural: a demo deixa de ser um passeio por 6 rotas e vira DUAS telas.
   Navegar é o jeito mais rápido de perder a banca em 60s.
23/07 (noite) — 🆕 **NOVA TRANSCRIÇÃO DE ÁUDIO** (a cena completa do produto). O fundador
   descreveu o fluxo: a pessoa entra → diz a faculdade que quer e o tempo que tem → manda o
   currículo → a IA aponta os pontos fracos → o sistema dá o veredito honesto ("6 meses pra
   Harvard não é um bom tempo") → recomenda as faculdades que encaixam melhor → o counselor
   identifica a deficiência (ex.: matemática) e monta uma ROTINA DE ESTUDO → e existe um
   lugar de TROCA DE MENSAGENS entre counselor e aluno. Nada disso existia no protótipo.
   Construído numa tela só (`/meta`), num scroll, com UM botão ("Analisar meu caso"):
     · `lib/viabilidade.ts` — veredito sobre requisito REAL da linha da universidade
       (min_toefl, requires_sat, application_deadline, acceptance_rate, custo). Alvo padrão
       = a mais seletiva da base, que é Harvard (3,2%) — a cena do fundador, literal.
     · `lib/analise-curriculo.ts` — pontos fracos determinísticos, cada um com a EVIDÊNCIA
       que o gerou (roda offline; a IA entra como camada extra, não como dependência).
     · `lib/rotina.ts` — a deficiência vira rotina semanal; a IA rascunha, o counselor assina.
     · `lib/mensagens.ts` + `components/conversa-counselor.tsx` — o canal aluno↔counselor de
       verdade, com sincronia entre abas via evento `storage`.
   O cockpit passou a incluir a própria Liz na fila: com duas janelas abertas, a mensagem
   escrita no cockpit aparece no app dela AO VIVO. É a prova visível do humano no circuito.
23/07 (noite) — bug pego no teste da cena: o seletor de prazo não mudava nada (prazo vencido
   e seletividade eram sempre críticos). Corrigido — prazo vencido rola pro ciclo seguinte e
   a seletividade vira plano quando há tempo. Agora 6 meses → inviável e 18/24 → apertado,
   que é justamente o contraste que a demonstração precisa mostrar.
```

---

## 12. Roteiro de 60 segundos (substitui o de 90s da Seção 9)

O app tem **1 minuto**. Duas telas, um clique, zero navegação no meio.

| s | Tela | Fala |
|---|---|---|
| 8 | `/` | "A Liz tem tudo pra estudar fora, menos um counselor. A escola dela não oferece. A gente dá." |
| 12 | `/meta` | "Ela diz a faculdade que quer e quanto tempo tem. Aperta um botão. Só isso." |
| 10 | `/meta` (rolando) | "A IA leu o currículo dela e apontou os pontos fracos — com a evidência de cada um." |
| 14 | `/meta` (rolando) | "Seis meses pra essa universidade não é um prazo bom — e a gente diz por quê, com o requisito oficial. E mostra três que encaixam com ela hoje." |
| 8 | `/meta` (rolando) | "A deficiência vira rotina de estudo. Quem assina é a counselor humana — e ela conversa com a Liz ali mesmo." |
| 8 | `/counselor` | "Um counselor, 30 alunos por dia, porque a IA faz o diagnóstico." |

**Nunca cortar:** o veredito (beat 4) — é a cena inteira do produto.
**Cronômetro e checklist vivos em `/demo`.**
