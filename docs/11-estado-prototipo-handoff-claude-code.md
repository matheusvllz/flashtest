# 11 — Estado do Protótipo & Handoff para Claude Code

Status: 🟡 **auditoria feita (22/07, tarde)** — protótipo existe e roda, mas diverge em vários pontos do que `08-produto-e-estrategia.md` e `10-prompt-prototipo-app.md` pediram. Este arquivo é a ponte entre o que foi pedido (specs) e o que foi de fato construído (código), pra quando o projeto for aberto no Claude Code programar as partes específicas que faltam.
Data: 22/07/2026 · autor: sócio (Claude), a partir de leitura direta do código em `Aplicativo Flash Test/`.

> Como usar este arquivo: é o primeiro que o Claude Code deve ler ao abrir o repo do protótipo. Ele resume a stack real, mapeia toda tela existente contra o Golden Path do `08` (Seção 7), e prioriza o que falta programar. Não repete o que já está em `08`/`09`/`10` — só aponta onde a realidade do código diverge deles.

---

## 0. Onde está o quê

- **Specs (fonte de verdade do produto/negócio):** `docs/` — dentro do próprio repo do app desde 20/09/2026. Até então viviam numa pasta irmã, fora do repo.
- **Código do protótipo (Lovable):** a raiz deste repo (`github.com/matheusvllz/flashtest`), conectado ao editor Lovable via git.
- **Atenção ao abrir no Claude Code:** o `AGENTS.md` do repo do app avisa que commits que reescrevem histórico já publicado (force-push, rebase/amend/squash de commits enviados) quebram a sincronia com o Lovable. Se o Claude Code tiver acesso a git nesse repo, commitar normal (push simples) é seguro; evitar reescrever histórico.

---

## 1. Stack técnica real (o que o Claude Code vai encontrar)

| Camada | O que é |
|---|---|
| Framework | **TanStack Start** (React 19) + **TanStack Router** com rotas *file-based* (cada arquivo em `src/routes/` vira uma rota; `src/routeTree.gen.ts` é **autogerado** — nunca editar à mão) + TanStack Query (client já montado, mas sem uso real hoje — não há chamadas de API). |
| Build/pacotes | Vite 8. Gerenciador de pacotes é **bun** (`bun.lock`, `bunfig.toml`) — usar `bun install` / `bun run dev`, não npm/yarn, pra não gerar lockfile conflitante. |
| Estilo | Tailwind CSS v4 (via `@tailwindcss/vite`) com tokens custom em `src/styles.css` + **shadcn/ui já instalado por completo** em `src/components/ui/` (Radix por baixo) — dá pra usar esses componentes prontos em vez de construir do zero. |
| Ícones | `lucide-react`. |
| Formulários | `react-hook-form` + `zod` estão nas dependências mas **não são usados hoje** — onboarding e login/signup são state manual com `useState`. |
| Persistência | **Não há backend nem banco.** Tudo vive em `src/lib/store.ts`: um store artesanal (`useSyncExternalStore` + `localStorage`, chave `flashtest.state.v1`). `login()`/`logout()`/`reset()` só ligam/desligam uma flag local — coerente com a decisão do `08` de cadastro fake, mas **hoje não existe nenhuma calibração real do quiz alimentando um "aha moment"** (ver Seção 3). |
| IA | **Nenhuma chamada real de LLM existe no código hoje.** As respostas da "IA" em `study.tsx` (`aiHints()`) são strings condicionais escolhidas por palavra-chave no que o usuário digitou — 100% hardcoded. Não há `.env`, client de API, nem SDK de IA no projeto. |

---

## 2. Rotas existentes hoje (16)

| Rota | O que faz hoje |
|---|---|
| `/` | Splash de 1.1s, redireciona por estado (`authed`/`onboarded`) para `/welcome`, `/onboarding` ou `/dashboard`. |
| `/welcome` | Tela de entrada com CTA "Criar minha conta" / "Já tenho conta". |
| `/signup` | Formulário de cadastro (nome, e-mail, senha, confirmação, termos) — **valida de verdade** (senha ≥6 chars, confirmação bate, termos marcados), mas não persiste em nenhum backend; só seta `authed=true` local. |
| `/login` | Formulário de login — mesma lógica, sem checar senha contra nada real. |
| `/forgot` | Fluxo decorativo de "esqueci a senha" (não envia e-mail nenhum). |
| `/onboarding` | 7 passos sequenciais: estados de interesse → estado de residência → nível de ensino → objetivos → matérias com dificuldade → instituições de interesse → resumo. Sem perguntas de conteúdo/calibração de nível. |
| `/dashboard` | Home com meta diária, streak, atalhos de tempo (3/5/10 min → `/study`), stats, recomendação do dia, atalhos pra plano/tópicos/premium. |
| `/study` | Núcleo: sessão de N questões (não fixo em 1-2), feedback verde/vermelho, dica, botão "Perguntar à IA" (abre tela cheia de chat, não balão), salvar como flashcard, link pra videoaula. |
| `/topics` | Escolher matérias prioritárias + assuntos específicos por matéria (ou deixar o app recomendar). |
| `/flashcards` | Revisão com repetição espaçada (grades again/hard/good/easy, `nextReview` calculado). |
| `/plan` | "Plano de hoje" mockado (lista de atividades) + progresso semanal em grade de 7 dias + matérias prioritárias. |
| `/progress` | Desempenho por matéria e por tópico (barras de %), recomendação textual. |
| `/premium` | Trial mockado de 1 dia + lista de benefícios + preço "a definir". |
| `/profile` | Dados do usuário, plano atual, atalhos de preferências, reset/logout da demo. |
| `/offline` | Estado online/offline real (via `navigator.onLine`), "baixar conteúdo" e "sincronizar" mockados. |
| `/video/$id` | Player de vídeo real do YouTube (thumbnail + embed) por questão, com link de busca de mais aulas. |

---

## 3. Divergência crítica: o que foi pedido (`08`/`10`) vs. o que foi construído

Isto é o mais importante deste arquivo — é a lista do que precisa de decisão + trabalho de dev, não só polish.

1. **O onboarding não é o "quiz disfarçado de criar conta".** O `10` pedia 5 perguntas em tela navy estilo Stories, sendo a própria "criação de conta" (sem pedir e-mail/senha de verdade). O código faz o oposto: `/signup` primeiro (com validação de senha e termos "de verdade") e só depois `/onboarding` (7 passos, fundo branco, formulário). Duas telas separadas onde o spec pedia uma coisa só disfarçada.
2. **Sem perguntas de conteúdo no onboarding.** Nenhum dos 7 passos calibra nível a partir de questões reais — é só preferência declarada (matérias com dificuldade, não desempenho medido). Sem isso, não há como gerar as "3 lacunas" citadas no aha moment do `08`.
3. **"Aha moment" não existe como tela.** O `08`/`10` pedem uma tela explícita "Já entendi você. Pra [faculdade], suas 3 maiores lacunas são..." — hoje o onboarding termina num resumo neutro das preferências e vai direto pro dashboard.
4. **Unidade de estudo é "sessão" (3/5/10 min, 2–7 questões), não "aula de 60 segundos" (1–2 questões, fixo).** `pickQuestions()` em `study.tsx` calcula a quantidade pelo tempo escolhido — a lógica e a nomenclatura da tela ainda não foram atualizadas para o corte de escopo travado em 21/07 (Seção 1 do `08`).
5. **Não existe balão do tutor de IA flutuante e persistente.** É o gap mais visível: o `10` pede um elemento fixo no canto inferior direito, presente em **todas** as telas pós-onboarding. Hoje existe um botão "Perguntar à IA" só dentro de `/study`, que troca a tela inteira para um chat — não aparece em `/dashboard`, `/progress`, `/plan`, etc.
6. **Sem envio de foto de questão.** Nenhuma tela tem upload/captura de imagem. É o "1 toque de wow" citado no Golden Path (Seção 7 do `08`) e não existe ainda.
7. **Sem micro-treino de redação.** `SUBJECTS` já tem "Redação" com 9 tópicos cadastrados, mas nenhuma das 20 `QUESTIONS` é de redação — não há mecânica de "escolha a melhor tese" nem nenhuma das outras 5 variantes descritas na Seção 5 do `08`. Este é o 2º pilar do produto e hoje é 0% construído.
8. **Integração com o "Vitor" ainda não avaliada.** Consistente com a pendência já registrada no `08` — Vellozo ainda não trouxe o app do amigo pra eu avaliar contra os 6 tipos de exercício.
9. **Sem ranking/turma.** Tela 7 do prompt `10` (mock, mas convincente) não existe no código hoje.
10. **Mascote ("a foca") não aparece em nenhuma tela** — coerente com a pendência aberta no `09` (decisão de manter/trocar/cortar ainda não foi tomada), mas registrar aqui pra não ser esquecido se decidirem incluir.
11. **Cores não batem 100% com os tokens oficiais do `09`.** `src/styles.css` usa navy `#10284E` (spec pede `#02104E`) e gold `#FEC641` (spec pede Flash Gold `#FEB803`, com variantes `#B57F00`/`#FFD466` não presentes). É próximo, mas o `10` pedia fidelidade "à risca" — vale um ajuste centralizado (é uma mudança de poucas linhas em `styles.css`, baixo custo, alto retorno de consistência marca↔protótipo↔LP).
12. **Só 20 questões carregadas** (meta do `08`/`10` é 30–50), cobrindo 9 matérias — nenhuma de Redação. Curadoria de conteúdo (papel sem dono, Seção 8 do `08`) segue sendo o gargalo real.
13. **Nenhuma chamada de IA de verdade.** Todo o "wow de IA" da demo (explicação personalizada ao vivo, balão mostrando desempenho, respostas do chat) hoje é texto condicional por palavra-chave (`aiHints()`), não uma API de LLM. Isso é citado no `08` (Seção 6) como "o wow de IA mais barato e mais convincente da demo" — hoje está no nível mais barato mesmo (sem IA real), falta plugar a API de verdade.

---

## 4. O que já está sólido e reaproveitável (não reconstruir do zero)

- **Design system aplicado de forma centralizada** — cores/fontes/utilities (`btn-primary`, `card-soft`, `chip`) em `styles.css`, fácil de corrigir os tokens (item 11 acima) num só lugar.
- **Onboarding funcional com 27 estados + busca de instituições por estado de interesse** — cobre boa parte da exigência do `10` de "todos os estados como seleção real"; falta ampliar a lista de faculdades privadas de peso (hoje só tem públicas/IFs por estado + 12 universidades estrangeiras — faltam PUCs, Mackenzie, FGV, Insper etc. citadas no `10`).
- **Flashcards com repetição espaçada de verdade** (grading again/hard/good/easy calculando `nextReview`) — mais sofisticado do que o pedido, é uma boa peça pra "prova de evolução" no pitch.
- **Progresso por matéria e por tópico com barras** — já é a base visual do "mapa de lacunas"; falta só reformular como radar/heatmap se quiserem o visual mais impactante citado no `10`.
- **Player de videoaula linkando pra YouTube real por tópico** — detalhe extra que nem o `08` pedia, bom pra "acabamento de produto real".
- **Premium com trial mockado de 1 dia** — dá pra usar direto no discurso de monetização (Seção 11 do `08`) sem trabalho adicional.
- **AppShell com bottom nav + PhoneFrame mobile-first** — a casca do "aplicativo mais top" já existe e é consistente em todas as telas.

---

## 5. O que falta programar — priorizado pro Golden Path (3 min de pitch, Seção 7 do `08`)

O `08` define 5 coisas que precisam **funcionar de verdade** na demo. Priorização pra levar ao Claude Code:

**P0 — bloqueia o Golden Path, sem isso a demo não conta a história certa:**
1. Balão do tutor de IA **global e persistente** (canto inferior direito, em todas as telas pós-onboarding) — hoje é só um botão dentro de `/study`. É o item de maior visibilidade na demo.
2. Plugar **uma chamada de IA real** (API de LLM) pro balão gerar a micro-explicação do erro ao vivo — hoje é tudo texto condicional. Decidir provedor/chave antes de começar (ver Seção 7).
3. Unificar onboarding + "criar conta" numa única sequência com pelo menos 2–3 perguntas de conteúdo real, terminando numa tela de "aha moment" explícita com as lacunas.
4. Reduzir/renomear a unidade de estudo pra "aula de 60 segundos" (1–2 questões fixas) em vez de sessão de tempo variável — ou decidir conscientemente manter "sessão" e ajustar o discurso do pitch pra não contradizer o `08`.

**P1 — 2º pilar do produto, forte diferencial vs. MEC:**
5. Construir o micro-treino de redação ("escolha a melhor tese" no mínimo) com 3–4 exercícios reais, seguindo as 5 competências do ENEM — hoje é 0% construído.
6. Avaliar o "Vitor" assim que Vellozo trouxer (link/repo/vídeo) e decidir entre os 3 cenários já mapeados no `08` (Seção 5).

**P2 — reforça acabamento e amplitude, não bloqueia o core:**
7. Upload de foto de questão (mock de resposta da IA já resolve, não precisa ser real) dentro do balão.
8. Ranking/turma mockado (Tela 7 do `10`).
9. Ajustar tokens de cor pra bater exatamente com `09-branding.md`.
10. Ampliar de 20 para 30–50 questões reais (depende da Curadoria de Conteúdo, papel ainda sem dono no `08`).

---

## 6. Notas técnicas pro Claude Code (convenções deste repo)

- Rodar local: `bun install && bun run dev` (o lockfile é bun; se bun não estiver disponível, `npm install` funciona mas gera lockfile paralelo — evitar comitar os dois).
- Rotas são *file-based* via TanStack Router: criar uma tela nova = criar um arquivo em `src/routes/`. `src/routeTree.gen.ts` é gerado automaticamente pelo plugin do Vite — nunca editar esse arquivo à mão.
- Estado global fica todo em `src/lib/store.ts` (`AppState`). Qualquer feature nova (balão global, questões de redação, dados de ranking) deve **estender esse mesmo store**, não criar um segundo mecanismo de estado paralelo — hoje já é a única fonte de verdade client-side e todas as telas dependem dele.
- Dados mockados (questões, matérias, universidades) ficam em `src/data/*.ts` como arrays TypeScript tipados — seguir o mesmo padrão pra questões de redação novas.
- Design tokens centralizados em `src/styles.css` (`@theme inline` do Tailwind v4) — mudar cor da marca em um lugar só propaga pro app inteiro via as classes utilitárias já criadas (`btn-primary`, `card-soft`, etc.).
- Repo está conectado ao Lovable (ver `AGENTS.md`) — push simples é seguro, evitar reescrever histórico já publicado.

---

## 7. Perguntas em aberto que travam decisões técnicas

Levar ao time antes (ou durante) de programar no Claude Code:

- **Provedor de IA para o balão:** qual API usar (Claude, outro) e quem gerencia a chave/custo? Sem isso definido, o item P0 #2 não sai do lugar.
- **"Aula de 60s" vs. "sessão de N min":** manter a nomenclatura e mecânica atuais (sessão) e ajustar o discurso do pitch, ou reescrever `pickQuestions()`/UI pra forçar 1–2 questões fixas como o `08` decidiu em 21/07? Impacta o texto da demo inteira.
- **Mascote (a foca):** decisão ainda pendente no `09` — não construir em cima disso até o grupo bater o martelo, senão é retrabalho.
- **Vitor:** Vellozo ainda não trouxe o app do amigo pra avaliação — sem isso, o plano B (construir "escolha a melhor tese" do zero, P1 item 5) é o caminho, mas vale confirmar que ninguém está esperando o Vitor "aparecer pronto" antes de quinta.
- **Dono da Curadoria de Conteúdo:** segue sem dono (flag da Seção 8 do `08`) — sem as 30–50 questões + exercícios de redação prontos, o Claude Code fica sem matéria-prima pra P1/P2.
