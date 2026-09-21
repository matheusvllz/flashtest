# 18 — Plano de reestilização: Foca "Rabisco na Margem"

Status: ✅ **executado em 20/09/2026** (escrito e aplicado na branch `rebrand/foca`, com o `17` já aplicado e ainda não commitado). As 13 fases (§15) foram implementadas; ver `docs/19-registro-execucao-rabisco.md` para o relatório de execução, desvios do plano original e bugs reais encontrados durante a auditoria da Fase 12.

Substitui a paleta Ártica (`09` §3) pela direção **Rabisco na Margem** (`brand/foca-rabisco-branding.md` + `brand/foca-rabisco-tokens.css`) e usa a troca como pretexto para uma reestilização geral: mais redonda, mais viva, mais recompensadora, com a Foca participando da experiência em vez de morar só no logo. Referência de UX/gamificação: Duolingo — **princípios**, não cópia.

Público deste arquivo: (1) o time, para aprovar a direção (Partes I–III); (2) **o modelo de IA que vai executar** (Parte IV). O executor não toma decisão de design — todas estão tomadas aqui. Se algo não estiver coberto, **pare e pergunte**, não invente.

Docs que este plano assume como lidos: `14` (persona), `15` (voz e mascote), `16` (gamificação), `17` (migração anterior — a estrutura de fases daqui é a mesma).

---

## Sumário

**Parte I — Diagnóstico e princípios**
0. Regras globais para o executor
1. Diagnóstico da interface atual
2. Interpretação da nova identidade
3. Princípios de design do Foca
4. O que aprender (e o que recusar) do Duolingo

**Parte II — Sistema**
5. Direção visual: "o caderno rabiscado"
6. Design System (cores, tipografia, raio, espaçamento, elevação, movimento)
7. Componentes: atual → problema → novo → motivo
8. Mascote: onde, como, quais expressões
9. Gamificação: o que entra, o que não entra
10. Microinterações, som e háptico
11. UX emocional da jornada
12. Hierarquia, mobile-first e acessibilidade (inclui dark mode)

**Parte III — Telas**
13. Auditoria tela por tela (21 rotas + componentes globais)

**Parte IV — Execução**
14. Decisões que precisam do time (com o default assumido)
15. Plano técnico em fases (0–12)
16. Ordem, dependências e estimativa
17. Checklist final de validação

---

# PARTE I — DIAGNÓSTICO E PRINCÍPIOS

## 0. Regras globais para o executor (ler antes de tudo)

Herdadas do `17` §0 e ainda válidas. Resumo do que muda:

1. **Fases na ordem.** Cada fase termina com `bun run lint`, `bunx tsc --noEmit` e `bun run build` passando e o app rodando. Não pule nem junte fases.
2. **Só tocar nos arquivos listados na fase.**
3. **Nunca editar** `src/routeTree.gen.ts`, `node_modules/`, `bun.lock`, `package-lock.json`, nada em `src/components/ui/` (shadcn — não é usado por nenhuma tela; deixar quieto), nada em `src/content/` ou `src/data/` (conteúdo), `src/lib/tutor-core.ts`, `src/lib/tutor.ts`.
4. **Não instalar dependências.** Nenhuma. Som é WebAudio puro, animação é CSS, ícones já são `lucide-react`.
5. **Não mudar regra de negócio.** Os valores de XP (+50 quiz, +15/+5 aula, 10/20/30 lição), o desbloqueio sequencial, o critério de estrelas, a heurística de lacunas e o prompt do tutor ficam como estão. O que a Fase 6 adiciona ao store é **registro** (dia de atividade, atividade de hoje, recorde, congelamento) para que a interface pare de mostrar números inventados — não é nova regra.
6. **Gerenciador é `bun`.** Nunca `npm`/`yarn`.
7. **Git:** continuar na branch `rebrand/foca`. Commit ao fim de cada fase **só com autorização do usuário**. Nunca `push --force`, `rebase`, `amend`, `squash` (Lovable).
8. **Cores:** a partir da Fase 1, **nenhum hex** em `.tsx`/`.ts` fora de `src/lib/brand.ts` e `src/lib/error-page.ts`. Ou classe de token (`bg-mar`), ou `var(--color-…)`, ou `PALETTE.x`. Nenhuma cor da paleta padrão do Tailwind (`amber-50`, `red-500`, `emerald-700`…) — as 15 ocorrências existentes são removidas nas fases das telas.
9. **Superfícies:** `bg-white` some do código de tela. Superfície elevada é `bg-cards`; fundo de página é `bg-neve`. (Isso é o que faz o dark mode funcionar sem uma segunda passada.)
10. **Logo/mascote:** sempre via `<FocaMark />`. Nunca esticar, rotacionar ou recolorir (`09` §2). Expressões mudam olhos/boca, nunca a proporção.
11. **Texto novo que o usuário lê** passa pelo teste da `15` §8 (duas linhas, comportamento não pessoa, sem cobrança no retorno, piada fora da explicação, "dito por um bicho numa pedra"). Todas as frases novas deste plano estão no Apêndice B — **usar essas, não inventar**.
12. **Movimento:** toda animação nova respeita o bloco `prefers-reduced-motion` já existente em `styles.css` (ele zera durações globalmente — não criar exceção).

---

## 1. Diagnóstico da interface atual

Levantado no código em 20/09/2026, após o `17`. Números são contagens reais (`grep`).

### 1.1 O que está sólido (reaproveitar)

- **Tokens centralizados** em `src/styles.css` (`@theme inline` + `:root`) e 10 utilities (`btn-primary`, `btn-abismo`, `btn-outline`, `btn-ghost`, `card-soft`, `chip`, `ds-label`, `input-ds`, `skeleton`, `caret-tutor`) + 4 animações (`anim-pop-in`, `anim-slide-up`, `anim-xp`, `anim-shake`). Uso: `btn-primary` 18×, `btn-outline` 14×, `card-soft` 34×, `ds-label` 23×. **Trocar a utility troca o app** — é a alavanca principal deste plano.
- `FocaMark` é o único ponto que renderiza a logo (`17` §3). Vira a base do sistema de expressões.
- `TutorBubble` global, com revelação palavra a palavra e `prefers-reduced-motion` respeitado. Persona já é a Foca (`tutor-prompt.ts:52`).
- `LessonPlayer` + `FeedbackBar` + `choiceClasses()` em `exercises/shared.ts`: um contrato único para os 7 tipos de exercício. Estilizar `shared.ts` estiliza os 7.
- `prefers-reduced-motion` global, `aria-*` nos exercícios, `role="status"` na barra de feedback.
- Store único (`store.ts`) com XP, streak, estrelas, `nextReview` de flashcards.

### 1.2 O que diverge da nova identidade

| Sintoma | Evidência | Efeito |
|---|---|---|
| **Cor primária domina fundos grandes.** Heros `bg-abismo` (navy) em dashboard, progress, ranking, redação, quiz, welcome, aha, splash, tela final da lição, balão do tutor | `bg-abismo` como fundo de bloco em 10 arquivos | A nova direção diz: "a primária é grafite, não tinta de parede; o fundo é papel". Manter os heros escuros com `#3A3A3C` daria um app cinza-chumbo, o oposto de "leve" |
| **Geometria dura.** `--radius` 10px em botões/inputs, `rounded-[10px]` 10×, `rounded-md` 7×, quadradinho de missão `rounded-md`, nós da trilha e avatares em `rounded-xl` | contagem de raios: `full` 39, `2xl` 27, `xl` 16, `[10px]` 10, `lg` 9, `md` 7 | Mistura de 6 raios sem escala; botão 10px lê "formulário corporativo" |
| **Elevação por sombra.** `shadow-sm/md/lg` (29× no total, quase tudo em `components/ui/`, mas o `PhoneFrame`, o FAB e o balão usam sombras navy escuras) | `shadow-[0_8px_24px_-6px_rgba(11,37,69,0.5)]` | Sombra pesada + fundo escuro = peso. A referência (Duolingo) eleva com **borda 2px + aresta inferior**, quase sem sombra |
| **Botão sem estado de pressionar.** `btn-primary` só tem `transition: transform, filter`; nenhum `:active` | `styles.css` | Zero feedback tátil visual no elemento mais tocado do app |
| **Feedback de resposta é uma caixa, não um evento.** `ResultBlock` em `study.tsx` é um bloco estático; a `FeedbackBar` da redação sobe do rodapé mas sem som, sem mascote | `study.tsx:283`, `FeedbackBar.tsx` | O momento de maior densidade emocional do produto tem a mesma energia de um card informativo |
| **Cores fora do token.** `amber-50/700`, `blue-50/700`, `red-50/600`, `emerald-50/700` (flashcards), `red-500`, gradiente `red/yellow/blue` (login), `green-600/700`, `red-500` (offline) | 15 ocorrências em 3 arquivos | Quebram a paleta e o dark mode; verde/vermelho fora de feedback de resposta viola `09` §3 |
| **`bg-white` hardcoded** em superfícies | `PhoneFrame`, header do `AppShell`, `BottomNav`, cards, `LessonPlayer`, login, forgot, `study.tsx` | Impede dark mode; o tokens file novo já avisa disso |
| **Emoji na UI.** `🔥` no aha, `📷` no balão | `aha.tsx:118`, `TutorBubble.tsx:246` | `15` §2: sem emoji. E emoji renderiza diferente por SO |
| **Mascote só como ícone.** `FocaMark` aparece 22× mas sempre a mesma arte neutra, tamanhos 14–36px na maioria — inclusive como *bullet* de XP (`size={14}`) | `dashboard`, `ranking`, `progress`, `aha` | Vira papel de parede em dois dias (`15` §4). Como ícone de 14px a cabeça não se lê |
| **Foca no header de toda tela com título** | `AppShell` renderiza `BrandMark size={28}` quando há `title` | Contradiz `15` §4 ("Header de tela comum: ausente") |
| **Sem som, sem háptico** | nenhum `Audio`/`AudioContext`/`vibrate` no repo | `16` §1: "o que falta é quase todo sensorial" |
| **Números de gamificação inventados na tela** | `dashboard.tsx:12` `doneToday = s.progress.lessonsCompleted` (é o total da vida, não de hoje); `plan.tsx` pinta `i < streak` no calendário semanal (não são os dias reais); missão "Revisar 1 flashcard" fica ✓ para sempre depois do primeiro salvamento | store não guarda dia de atividade nem atividade de hoje | A meta diária "3/3" aparece cumprida no primeiro dia com 3 aulas na vida — e depois nunca mais volta a 0. Meta que nunca reseta não é meta |
| **Empty states genéricos** | "Nenhum flashcard nessa seleção.", "Seu mapa se preenche sozinho…" | Oportunidade de personagem desperdiçada |
| **404 e erro em inglês, estilo shadcn** | `__root.tsx` `NotFoundComponent`/`ErrorComponent`, `error-page.ts` | Fora da marca e do idioma |
| **Sem nível de jogo, sem meta diária com estado, sem congelamento de streak, sem recorde** | `store.ts` | `16` §1 marca como parcial/inexistente |
| **Quiz de entrada sem questão de conteúdo** | `quiz.tsx:44` `completeQuiz([], …)`, `gaps.ts` | Divergência de produto (o `08` e o `CLAUDE.md` afirmam "3 questões de conteúdo real"). **Fora do escopo deste plano** — registrar no `11`/`08`. Não corrigir aqui |

### 1.3 Fora de escopo (não construir)

Autenticação real, pagamento, perfil/conquistas separado, versão web, mais conteúdo, refino de lacunas por IA (`CLAUDE.md` "Regras de escopo"). Badges/conquistas ficam como "depois" (`16` §7) — este plano prepara o lugar (nível + recorde), não cria coleção de badges.

---

## 2. Interpretação da nova identidade

Lido de `brand/foca-rabisco-branding.md`, cruzado com `14`, `15` e `16`.

| Dimensão | O que o material diz | O que isso exige da interface |
|---|---|---|
| **Arquétipo** | Bobo da Corte com traços de Criador/Rebelde: "olha o que eu fiz enquanto todo mundo copiava" | Humor no timing (microcopy curta), irreverência **com produto** — o rabisco é útil. Nada de piada gratuita em lugar de informação |
| **Personalidade da Foca** (`15`) | Cobradora afetuosa, seca, par do usuário (não professora). Cobra presença, nunca resultado; acolhe quem volta | O mascote aparece em **transições emocionais**, com expressão coerente; nunca no header; nunca durante a questão |
| **Público** (`14`) | João, 16–19, nativo de TikTok, baixo ticket, gatilho é **alívio** (não ambição), culpa o faz evitar | Recomeço barato, CTA único, celebrar presença, jamais punir ausência com drama. Tom adulto-jovem — arredondado, não infantil |
| **Posicionamento** | Prep pro ENEM que se recusa a parecer material escolar | O app parece o **caderno do aluno**, não a apostila: papel, grafite, caneta |
| **Emoção-alvo** | "Tédio produtivo, contentamento discreto, quase clandestino" | Recompensa **previsível e proporcional**, não fanfarra de cassino. Um "pequeno prazer", não euforia |
| **Paleta** | Grafite (primária, texto/estrutura), Papel (fundo), **Caneta azul** (único accent: ação + recompensa), Sucesso/Alerta/Erro só como feedback | Fundos claros, primária como tinta (texto, contorno, botão secundário), azul reservado a CTA/XP/streak/seleção/foco |
| **Tipografia** | Opção A recomendada: Space Grotesk + Plus Jakarta Sans + **Space Mono** para dados | Mono nos números de XP, streak, cronômetro, contadores — "anotação na margem" |
| **Logo/mascote** | Grafite = cor literal do lápis; a cabeça não muda de proporção, só de expressão | Sistema de expressões (olhos/boca), sem rotação |
| **Metáfora** | Lápis, papel pautado, rabisco de caneta | Texturas discretas de pauta, sublinhado de marca-texto, bordas tracejadas nos vazios ("ainda não rabiscado") |
| **Limitação declarada** | Azul único compete com links/foco; papel escolar pode datar | Regras de reserva do azul (§6.1) e um plano B isolado num único token (§14 D1) |

### Uma tensão que precisa ser dita

O material unifica Mar e Coral num só accent (azul-caneta) e o próprio documento admite o risco: **um accent só que faz ação, seleção, foco, progresso E recompensa deixa a recompensa sem cor própria.** No app atual, o momento de XP é coral e é o único calor da tela — o `16` §5 chama a animação de XP de "a mais importante do app". Se o "+15 XP" ficar da mesma cor do botão "Responder", da barra de progresso e da alternativa selecionada, ele vira mais um azul.

A saída que **não** quebra a direção (azul continua o único accent *de marca*): usar o **marca-texto**. O tokens file já traz `--color-alert #D9A017` como "atenção/severidade baixa". Um marca-texto amarelo é literalmente parte do caderno rabiscado, é funcional (destaque), e é visualmente distinto da caneta sem virar segunda cor de marca. Proposta: XP, streak e "momento de recompensa" usam **fundo marca-texto com texto grafite** (nunca amarelo como texto sobre branco — contraste 2.3:1 reprova). Isso está registrado como **Decisão D1** (§14) com o default assumido e o plano B isolado num único token (`--color-recompensa`), de modo que reverter é uma linha.

---

## 3. Princípios de design do Foca

Cada decisão visual das Partes II e III cita um destes. Se uma proposta não se encaixa em nenhum, não entra.

1. **Papel, não painel.** Fundo é papel (`neve`); superfícies são cartões brancos com borda visível; a primária (grafite) é tinta — texto, contorno, botão secundário — nunca área grande. *Porque* a marca "se recusa a parecer material escolar" e o material escolar de app é o hero azul-marinho.
2. **Um azul, com regras de reserva.** A caneta aparece só onde há ação, seleção, foco ou progresso real. Nunca decorativa, nunca em ícone ilustrativo, nunca em texto corrido. *Porque* é o único accent e perde valor a cada uso gratuito.
3. **Recompensa é marca-texto.** XP, streak e marcos usam o destaque amarelo com texto grafite; aparecem **depois** do feedback, nunca dentro dele. *Porque* o `16` exige recompensa proporcional e a `09` §3 exige superfície de feedback livre de cor de marca.
4. **Redondo, não fofo.** Raio de botão 16px, card 20px, folha 28px, chips pílula. Sem bolinha de pelúcia, sem fonte manuscrita em UI. *Porque* o público tem 16–19 anos e precisa levar o app a sério.
5. **Borda antes de sombra.** Elevação por borda 2px + aresta inferior (efeito "apertável"); sombra só em elementos flutuantes (FAB, folha de baixo). *Porque* sombra difusa pesa e envelhece; borda lê como traço de caneta.
6. **Feedback em 100ms, celebração em 900ms, saída limpa.** Toque → resposta visual+sonora+háptica imediata; fim de aula → uma sequência curta; depois o app te deixa ir. *Porque* `16` §0 e §2: frequência, não duração.
7. **A Foca aparece quando algo muda.** Transições emocionais (aha, erro, fim, streak, retorno, vazio) com expressão coerente; nunca no header, nunca durante a questão. *Porque* `15` §4.
8. **Cor nunca é o único sinal.** Certo/errado sempre com ícone + palavra; estado selecionado sempre com borda + peso, não só cor. *Porque* daltonismo e porque o azul-caneta e o azul de foco se parecem.
9. **A tela responde quatro perguntas em um relance:** onde estou, o que está acontecendo, qual é a ação principal, qual o próximo passo. Um CTA primário por tela. *Porque* `14` §7: escolher é o que paralisa.
10. **Honestidade dos números.** Nenhum contador na tela que o store não sustente (meta de hoje, dias da semana, missões). *Porque* recompensa falsa é a coisa que o João já viu em três apps.

---

## 4. O que aprender (e o que recusar) do Duolingo

Levantamento por conhecimento do produto (design system "Feather", app 2023–2026). Não é para copiar traço — é para extrair o mecanismo.

| Mecanismo do Duolingo | Por que funciona | Adaptação Foca | Decisão |
|---|---|---|---|
| **Botão "apertável"** (face plana + aresta inferior 4px mais escura; ao pressionar, o botão desce e a aresta some) | Feedback tátil visual sem JS; torna o toque satisfatório | `btn-primary` = caneta com aresta `mar-fundo`; `btn-outline` = branco com borda `gelo` 2px e aresta `gelo`. Ver §7.1 | ✅ adotar |
| **Elevação por borda, não por sombra** | Interface leve e "de papel" | Princípio 5 | ✅ adotar |
| **Folha de feedback que sobe do rodapé** (verde/vermelho, ícone + título + explicação + botão Continuar), o resto da tela escurece levemente | O feedback é um **evento**, ocupa a zona do polegar, não obriga rolar | `FeedbackBar` já faz isso na redação; a aula de 60s passa a usar a mesma folha (§13, `/study`) | ✅ adotar |
| **Tela de conclusão com estatísticas reveladas em sequência** (XP, tempo, acertos) e o personagem grande comemorando | Fecha o loop com recompensa proporcional e legível | `LessonDone` e resultado da lição viram uma tela só (`CelebracaoAula`) com Foca em expressão por desempenho, 3 tiles em cascata, som de fanfarra | ✅ adotar |
| **Barra de progresso da lição que "pula" a cada acerto e tem brilho** | Percepção de avanço a cada passo | `ProgressBar` com `anim-bump` no incremento | ✅ adotar |
| **Personagem reage** (feliz no acerto, triste no erro, entediado no vazio) | Relação emocional | Sistema de 8 expressões da `15` §5 via `FocaMark expression=` | ✅ adotar |
| **Streak com chama, calendário da semana, congelamento** | Motor de retorno | Streak com ícone da Foca (não chama — a chama é do Duo), calendário real de 7 dias, 1 freeze automático (`16` §6) | ✅ adotar, sem chama |
| **Meta diária como anel** | Meta baixa que se fecha | Anel de 1–5 aulas no topo do dashboard | ✅ adotar |
| **Ligas com zona de promoção/rebaixamento** | Comparação com pares | `/ranking` já tem; melhorar a leitura das zonas | ✅ manter |
| **Caminho com nós circulares** (path) | Sensação de trilha | Trilhas de redação: nós circulares maiores, "nó atual" pulsando; **não** virar mapa serpenteante (custo alto, ganho baixo em 15 trilhas curtas) | 🟡 adaptar |
| **Bottom nav com ícones preenchidos e pílula de fundo no ativo** | Localização instantânea | `BottomNav` com pílula `mar/12` atrás do ícone ativo | ✅ adotar |
| **Empty states com personagem e uma linha** | Vazio vira momento de marca | `EmptyState` com Foca entediada + fala da `15` §7 | ✅ adotar |
| **Sons curtos e musicais na mesma tonalidade** | Sistema, não efeitos | `16` §3 — 9 eventos, dó maior, WebAudio | ✅ adotar |
| **Corações / vidas** | Vende assinatura | Bloqueia estudar após errar — contradiz `15` §3.3 | ❌ recusar (`16` §7) |
| **Baús / recompensa aleatória** | Dopamina variável | É a linha cassino (`16` §9) | ❌ recusar |
| **Gemas / loja** | Economia interna | Sem loja não é nada; com loja é monetização (fora de escopo) | ❌ recusar |
| **Notificação com culpa pesada ("Duo está triste")** | Retenção por vergonha | Para o João, é o gatilho de evitar (`14` §6, `15` §3.2) | ❌ recusar |
| **Fonte display arredondada (DIN Round / Feather Bold)** | Lúdico | Infantiliza para 16–19; `09` §4 já discutiu. Mantemos Space Grotesk e ganhamos "brincadeira" pelo mono e pelos rabiscos | ❌ recusar |
| **Verde como cor de marca** | — | Verde no Foca é **só** acerto | ❌ n/a |

---

# PARTE II — SISTEMA

## 5. Direção visual: "o caderno rabiscado"

A tela é uma página de caderno. Os elementos:

- **Papel** (`neve #F6F5F1`) é o fundo de todas as páginas — inclusive splash, welcome, quiz e aha, que hoje são navy. A "transição para o produto" que a `09` §5 descrevia como *Abismo → Neve* passa a ser **papel em branco → papel com rabiscos** (o app vai ganhando marcas conforme o aluno estuda: barras, marca-texto, checks).
- **Cartão** (`cards #FFFFFF`, borda `gelo` 2px, raio 20px) é a folha solta sobre o papel. Sem sombra.
- **Grafite** (`abismo #3A3A3C`) é tudo que é escrito: texto forte, ícones, contorno de botão secundário, botão "escuro" (raro).
- **Caneta** (`mar #2E6BFF`) é o que o aluno *faz*: o CTA primário, a alternativa selecionada, a barra de progresso, o item ativo do nav, o anel de foco, o balão do usuário no chat.
- **Marca-texto** (`alert #D9A017` a 100% como fundo, texto grafite) é o que o aluno *ganhou*: chip de XP, contador de streak, marco. Também o sublinhado de destaque em títulos de celebração (`mark-texto`, um `background: linear-gradient` inclinado atrás da palavra).
- **Pauta**: um padrão de linhas horizontais muito claras (`repeating-linear-gradient` a cada 28px, cor `gelo` a 60%) usado **só** em três lugares — fundo do hero do dashboard, da tela de celebração e do balão da Foca. É a assinatura visual; em todo lugar ela vira ruído.
- **Tracejado** (`border-dashed gelo`) marca o que ainda não foi feito: missão pendente, matéria não medida, empty state — "ainda não rabiscado".
- **Sucesso/Erro** (`#2E9E5B` / `#C23B3B`) só na folha de feedback e nas alternativas depois de verificar. Texto sobre branco em sucesso usa `success-texto` (`#1F7A45`), porque `#2E9E5B` sobre branco dá 3.4:1 e reprova para texto.

O que **não** entra: fonte manuscrita (Caveat) em UI; ilustrações de fundo além da Foca; rotação de elementos "para parecer rabisco"; papel amarelado demais (o `neve` já é quente).

---

## 6. Design System

### 6.1 Cores — papéis funcionais

Nomes de variável mantidos do projeto (`--color-abismo`, `--color-mar`…), valores do tokens file. Quatro tokens novos, todos justificados por acessibilidade ou hierarquia.

| Papel funcional | Token | Claro | Escuro | Regras de uso |
|---|---|---|---|---|
| **Primary** (tinta) | `--color-abismo` | `#3A3A3C` | `#F3F1EC` | Texto forte, ícones, `btn-abismo` (raro), contorno |
| **Primary hover / pressed** | — | `filter: brightness(1.08)` / `translateY(3px)` | idem | Não existe hex separado: hover é filtro, pressed é geometria (aresta) |
| **Accent / ação** | `--color-mar` | `#2E6BFF` | `#5C8CFF` | CTA, seleção, progresso, nav ativo, `--ring`, balão do usuário |
| **Accent forte** | `--color-mar-fundo` | `#1E4FCC` | `#9FC0FF` | Aresta do botão primário, link em texto, `ds-label` sobre claro |
| **Accent claro** | `--color-coral-claro` | `#8FB0FF` | `#B9CEFF` | Trilho de barra em fundo escuro, badge leve |
| **Recompensa** ⚑ | `--color-recompensa` (novo, alias → `--color-alert`) | `#D9A017` | `#E8B23D` | **Só como fundo** de chip/anel/marca-texto com texto `abismo`; nunca texto amarelo sobre branco |
| **Alerta / severidade baixa** | `--color-alert` | `#D9A017` | `#E8B23D` | Badge "a confirmar" do aha, ícone de atenção |
| **Background** (papel) | `--color-neve` | `#F6F5F1` | `#1C1B18` | `html, body`, `PhoneFrame`, telas de entrada |
| **Surface** (cartão) | `--color-cards` (novo) | `#FFFFFF` | `#262523` | `card-soft`, header, nav, inputs, folhas |
| **Surface secondary** | `--color-gelo` | `#E1DFDA` | `#38352F` | Chip inativo, trilho de barra, skeleton, borda de cartão, pauta |
| **Text primary** | `--foreground` | `#26262A` | `#F3F1EC` | Corpo |
| **Text secondary** | `--color-nevoa` | `#737075` | `#A6A29A` | Legendas, placeholders, nav inativo. 4.5:1 sobre papel — **não** usar em tamanho < 12px |
| **Text on dark / border input** | `--color-pelo` | `#D6D6D4` | `#55534E` | Borda de input, texto sobre `abismo` |
| **Border** | `--border` = `gelo` | `#E1DFDA` | `#38352F` | 2px em cartões, 1px em divisores |
| **Success** (fill/borda/ícone) | `--color-success` | `#2E9E5B` | `#45B876` | Folha de acerto, alternativa certa |
| **Success (texto)** (novo) | `--color-success-texto` | `#1F7A45` | `#45B876` | Título "Acertou" sobre `cards` (5.4:1) |
| **Error** | `--color-error` | `#C23B3B` | `#D65B5B` | Folha de erro, alternativa errada (5.3:1 sobre branco — serve para texto) |
| **Disabled** | — | `opacity: .4` + `cursor: not-allowed` + aresta removida | idem | Nunca cinza próprio: opacidade preserva a forma |
| **Focus ring** | `--ring` = `mar` | `#2E6BFF` | `#5C8CFF` | `outline: 3px solid` + `outline-offset: 2px`, sempre visível com teclado |

⚑ **D1** (§14): se o time recusar o marca-texto, `--color-recompensa: var(--color-mar)` e nada mais muda.

**Contrastes verificados (WCAG, calculados):** `#26262A`/papel ≈ 14:1 ✓ · `#737075`/branco 4.9:1 ✓ · `#737075`/papel 4.5:1 ✓ (limite) · `#2E6BFF`/branco 4.5:1 ✓ (limite; por isso texto em azul usa `mar-fundo`) · branco/`#2E6BFF` 4.5:1 ✓ · `#1E4FCC`/branco 6.9:1 ✓ · `#3A3A3C`/branco 11.3:1 ✓ · `#2E9E5B`/branco 3.4:1 ✗ texto (só ≥18px bold ou ícone) · `#1F7A45`/branco 5.4:1 ✓ · `#C23B3B`/branco 5.3:1 ✓ · `#D9A017`/branco 2.3:1 ✗ texto (só fundo) · `#3A3A3C`/`#D9A017` 4.9:1 ✓ · escuro: `#5C8CFF`/`#1C1B18` 5.5:1 ✓ · `#A6A29A`/`#1C1B18` 6.8:1 ✓.

**Proporção-alvo por tela:** papel + cartões 70% · grafite (texto/ícones) 20% · caneta 7% · marca-texto ≤ 3%. Sucesso/erro não contam — são eventos.

**Regras de reserva do azul** (a limitação que o brief declara):
- Link em texto corrido: `mar-fundo` + sublinhado. Não `mar`.
- Ícone ilustrativo (ex.: `Trophy`, `Layers` no dashboard): `abismo`, nunca `mar`.
- Só **um** elemento em `mar` sólido por viewport: o CTA. Barra de progresso e seleção usam `mar` em traço fino/borda, não em área.
- Foco de teclado usa `outline` (fora do elemento), seleção usa `border` (no elemento) — não se confundem.

### 6.2 Tipografia

Opção A do brief ("Grafite & Jakarta"). Uma fonte nova (Space Mono 700), carregada no `<link>` de fontes do `__root.tsx`.

| Estilo | Fonte / peso | Tamanho / altura | Uso | Classe |
|---|---|---|---|---|
| **Display** | Space Grotesk 700 | 32 / 36, `-0.02em` | Título do aha, "Aula concluída", nome no dashboard | `font-display text-[32px] leading-9 font-bold tracking-tight` |
| **H1** | Space Grotesk 700 | 24 / 28 | Título de tela | `font-display text-2xl font-bold` |
| **H2** | Space Grotesk 700 | 20 / 26 | Título de seção/cartão principal | `font-display text-xl font-bold` |
| **H3** | Space Grotesk 700 | 17 / 22 | Título de cartão | `font-display text-[17px] font-bold` |
| **Enunciado** | Plus Jakarta 500 | 17 / 26 | Pergunta/enunciado de questão e exercício (**não** Space Grotesk, que hoje é usada — geométrica cansa em texto de 3 linhas) | `text-[17px] leading-relaxed font-medium` |
| **Body** | Plus Jakarta 400 | 15 / 22 | Corpo, explicações | `text-[15px] leading-relaxed` |
| **Body small** | Plus Jakarta 500 | 13 / 18 | Legendas de cartão, descrição | `text-[13px]` |
| **Caption** | Plus Jakarta 600 | 12 / 16 | Rótulos, meta | `text-xs font-semibold text-nevoa` |
| **Label (ds-label)** | Space Grotesk 700 | 12 / 16, `0.1em`, caixa alta | Kicker de seção. Cor `mar-fundo` sobre claro | `ds-label` (tracking reduzido de `.14em` → `.1em`) |
| **Button** | Space Grotesk 700 | 16 / 20 | Todos os botões | dentro das utilities `btn-*` |
| **Dado** | **Space Mono 700** | 20–32 / 1, `tabular-nums` | XP, streak, cronômetro, "2/3", posição no ranking, contadores | `font-mono font-bold tabular-nums` |

Mínimo em UI: 12px. `text-[10px]`/`text-[11px]` atuais (dashboard `Stat`, `HeroStat`, plano) sobem para 12px.

### 6.3 Raio

Escala única. Substitui a mistura atual.

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 6px | Checkbox de missão, marcador de alternativa (A/B/C) |
| `--radius-sm` | 10px | Input pequeno, thumbnail, tag quadrada |
| `--radius` (md) | **16px** | Botões, inputs, chips quadrados, alternativas |
| `--radius-card` (lg) | **20px** | Cartões |
| `--radius-xl` | 28px | Folhas de baixo (feedback, balão, modal), hero |
| `--radius-pill` | 999px | Chips, barras de progresso, avatar, FAB, nó de trilha |

**Como isso vira classe Tailwind.** O `@theme inline` atual deriva `--radius-sm/md/lg/xl/2xl/3xl` de `--radius` por `calc()`. A Fase 1 troca as derivações por valores fixos, de modo que as classes padrão passem a significar exatamente a tabela acima:

| Classe | Valor | Uso |
|---|---|---|
| `rounded-md` | 6px | marcador A–E, checkbox de missão |
| `rounded-sm` | 10px | thumbnail, tag pequena |
| `rounded-lg` | 16px | **botão, input, alternativa, chip quadrado** |
| `rounded-xl` | 20px | **cartão** |
| `rounded-2xl` | 24px | hero interno (raro) |
| `rounded-3xl` | 28px | **folha de baixo, modal** |
| `rounded-full` | pílula | chip, barra, avatar, FAB, nó |

Mapa de migração aplicado nas fases das telas: `rounded-[10px]` → `rounded-lg` · `rounded-2xl` (cartão) → `rounded-xl` · `rounded-t-2xl` (folha) → `rounded-t-3xl` · `rounded-md` em botão/input → `rounded-lg` · `rounded-md` em marcador → mantém. `rounded-[Npx]` fica proibido.

### 6.4 Espaçamento

Base 4px. Escala usada: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48.

- Gutter da página: **20px** (`px-5`, já é assim).
- Entre cartões: 16px (`space-y-4`).
- Padding interno de cartão: 16px (compacto) / 20px (principal).
- Entre alternativas: 12px (`gap-3`, hoje 8 — alternativas coladas dificultam toque).
- Rodapé fixo: `pb-[max(1.5rem,env(safe-area-inset-bottom))]`.
- Bottom nav: 64px de altura + safe-area; `main` com `pb-32`.

### 6.5 Elevação

| Nível | Tratamento | Onde |
|---|---|---|
| 0 — papel | nada | fundo |
| 1 — cartão | `border: 2px solid var(--color-gelo)` | `card-soft` |
| 1b — cartão tocável | nível 1 + `box-shadow: 0 3px 0 var(--color-gelo)`; `:active` desce 3px | cartões que são `Link` (`card-press`) |
| 2 — botão | aresta `0 4px 0 <cor escura>`; `:active` desce 4px e aresta 0 | `btn-*` |
| 3 — flutuante | `box-shadow: 0 8px 24px -8px rgb(38 38 42 / .25)` | FAB da Foca, folha de baixo, modal |

Nenhuma outra sombra. O `PhoneFrame` perde a sombra navy (vira `bg-neve` puro; no desktop, borda `gelo` 1px lateral).

### 6.6 Movimento

Curvas: `--ease-out: cubic-bezier(.2,.8,.2,1)` (entradas), `--ease-bounce: cubic-bezier(.34,1.56,.64,1)` (recompensa, já usada), `--ease-press: ease` 80ms (botão).

| Nome | Duração | Uso |
|---|---|---|
| `anim-slide-up` (existe) | 280ms | Folha de feedback, cartões entrando |
| `anim-pop-in` (existe) | 320ms bounce | Estrelas, chip de XP, Foca aparecendo |
| `anim-xp` (existe) | 600ms | "+15 XP" flutuando |
| `anim-shake` (existe) | **reduzir para 180ms, 4px** (hoje 400ms, 5px — `16` §5: "shake longo humilha") | Erro |
| `anim-bump` (novo) | 220ms | Barra de progresso e streak ao incrementar (`scaleX` 1→1.02→1 / `scale` 1→1.12→1) |
| `anim-breathe` (novo) | 2.4s loop | Nó atual da trilha, FAB da Foca quando há `autoPrompt` pendente |
| `anim-float-in` (novo) | 400ms | Foca entrando por baixo na celebração |
| Transição de rota | — | **Não implementar** (TanStack sem view transitions configuradas; ganho baixo, risco médio) |

Todas zeradas por `prefers-reduced-motion` (bloco existente).

---

## 7. Componentes: atual → problema → novo → motivo

Formato pedido. Componentes ordenados por alcance.

### 7.1 Botão primário (`btn-primary`)
- **Atual:** caneta/coral plano, raio 10, altura ~46px, texto `abismo`, sem `:active`.
- **Problema:** genérico, sem tato, raio duro; texto escuro sobre azul novo reprovaria (usa branco agora).
- **Novo:** fundo `mar`, texto branco, Space Grotesk 700 16px, altura 52px, raio 16, **aresta** `0 4px 0 var(--color-mar-fundo)`; `:active` → `translateY(4px)` e aresta 0; `:disabled` → opacidade .4 e aresta 0; `:focus-visible` → outline `mar` 3px offset 2. Ícone opcional 18px.
- **Motivo:** Princípios 4, 5, 6. É o gesto mais repetido do app; precisa ser gostoso de apertar.

### 7.2 Botão secundário (`btn-outline`) e terciário (`btn-ghost`)
- **Atual:** `btn-outline` branco com borda `abismo` 1.5px; `btn-ghost` branco com borda `pelo`, texto `nevoa`.
- **Problema:** `#fff` fixo (dark mode), borda fina lê "formulário", compete com o primário quando lado a lado ("Pedir dica" / "Perguntar à IA").
- **Novo:** `btn-outline` = `cards` com borda `gelo` 2px + aresta `gelo` 3px, texto `abismo`, mesma altura/raio do primário; `btn-ghost` = sem borda, sem aresta, texto `nevoa`, altura 44 (ação de escape: "Voltar ao início", "Sair mesmo assim").
- **Motivo:** hierarquia clara em três degraus (Princípio 9).

### 7.3 Botão escuro (`btn-abismo`)
- **Atual:** navy + branco, 4 usos (plano, perfil, premium, fim da aula).
- **Problema:** com grafite vira botão preto — pesado.
- **Novo:** manter a utility (nome preservado) só para **fundos escuros/marca-texto** (dentro do cartão de premium); nos outros 3 usos, trocar por `btn-outline`.
- **Motivo:** Princípio 1.

### 7.4 Cartão (`card-soft`) e cartão tocável (`card-press`, novo)
- **Atual:** branco, borda `gelo` 1px, raio 16; cartões que são links não se distinguem dos informativos.
- **Problema:** `#fff` fixo; borda 1px some no papel; affordance de toque ausente.
- **Novo:** `card-soft` = `cards`, borda 2px `gelo`, raio 20. `card-press` = `card-soft` + aresta 3px + `:active` desce; seta `→` vira ícone `ChevronRight` em `nevoa`.
- **Motivo:** Princípios 1, 5.

### 7.5 Chip (`chip`, `chip-on` novo)
- **Atual:** `gelo` + `abismo`, 12px, pílula; estado ativo improvisado inline (`style={{background: abismo}}` em flashcards, `bg-abismo text-white` em topics/redação).
- **Novo:** `chip` = `gelo`/`abismo` 13px altura 36 (toque); `chip-on` = `mar/12` de fundo, borda `mar` 2px, texto `mar-fundo`, `font-bold`. Nada de chip preto.
- **Motivo:** Princípios 2, 8 (seleção com borda, não só cor).

### 7.6 Input (`input-ds`)
- **Atual:** borda `pelo` 1.5px, raio 10, `#fff`; login/forgot usam classes próprias; quiz usa inputs brancos translúcidos sobre navy.
- **Novo:** `cards`, borda `gelo` 2px, raio 16, altura 52, `focus` → borda `mar` (sem ring adicional; o ring é para teclado). Um só estilo em login, forgot, quiz e chat.
- **Motivo:** consistência; toque de 52px.

### 7.7 Barra de progresso (`ProgressBar`, novo componente)
- **Atual:** 6 implementações inline (dashboard, study, quiz, redação ×2, progress, plano) com alturas 1.5–2.5 e cores variadas (mar, coral).
- **Novo:** `src/components/ds/ProgressBar.tsx` — props `value`, `max`, `tone: "caneta" | "recompensa" | "success" | "auto"`, `size: "sm" | "md"`, `label` (aria). Trilho `gelo`, preenchimento com `transition: width .5s var(--ease-out)`, `anim-bump` quando `value` aumenta. Altura 8 (sm) / 12 (md), pílula.
- **Motivo:** uma barra, um comportamento; Princípio 6.

### 7.8 Anel de meta diária (`GoalRing`, novo)
- **Atual:** não existe (barra linear "0/3 aulas de hoje").
- **Novo:** SVG circular 72px, traço `mar`, trilho `gelo`, número `Space Mono` no centro (`2/3`); ao fechar, traço vira `recompensa` e a Foca "orgulhosa" aparece ao lado com uma fala.
- **Motivo:** §9 meta diária; Princípio 3.

### 7.9 Folha de feedback (`FeedbackBar` → `FeedbackSheet`)
- **Atual:** existe na redação (`FeedbackBar`), raio-t 16, borda superior 2px; a aula de 60s usa `ResultBlock` estático.
- **Novo:** um componente para os dois fluxos: raio-t 28, fundo `success/10` ou `error/10` **sobre `cards`**, ícone 24 + título (voz da Foca: "Certa." / "Errou. Respira.") + explicação; botões: primário "Continuar" (largura total), e no erro "Explicar melhor" (`btn-outline`) à esquerda. No `/study`, o bloco de resolução passo a passo + flashcard + videoaula vão para **dentro da folha, colapsados** ("Ver resolução") — a folha nasce curta. Dentro da folha não há azul decorativo nem recompensa (Princípio 3): o único elemento azul é o botão "Continuar" (`btn-primary`), porque o CTA precisa continuar sendo o CTA; o `XpChip` só aparece **depois** do toque em Continuar.
- **Motivo:** §4 (folha), Princípio 6.

### 7.10 Alternativas / opções (`choiceClasses` + `/study`)
- **Atual:** `study.tsx` tem classes próprias; redação usa `choiceClasses()`. Seleção = borda `mar` + fundo `gelo` (study) ou borda `abismo` (redação). Marcador A/B/C quadrado `rounded-md`.
- **Novo:** `choiceClasses()` vira a única fonte (o `/study` importa dela). Base: `cards`, borda `gelo` 2px, aresta 3px `gelo`, raio 16, padding 14/16, texto 15/22. Selecionada: borda `mar` 2px, fundo `mar/8`, aresta `mar/40`, marcador preenchido `mar`. Certa: borda/fundo `success`, ícone `Check` à direita. Errada: `error`, ícone `X`. Não escolhidas após verificar: opacidade .45. Marcador (A–E) circular 28px.
- **Motivo:** Princípio 8; mesma linguagem nos dois pilares.

### 7.11 Bottom navigation (`BottomNav`)
- **Atual:** 5 itens, texto 11px, ícone 22, ativo = cor `mar-fundo`, fundo `white/95`.
- **Novo:** fundo `cards/95`, borda superior `gelo` 2px, altura 64 + safe-area; item ativo = pílula `mar/12` (40×28) atrás do ícone, ícone `mar-fundo` com `strokeWidth 2.4`, rótulo 12px `font-bold`; inativo `nevoa`. Ao ativar, pílula `anim-pop-in`.
- **Motivo:** localização instantânea (Princípio 9).

### 7.12 Header (`AppShell title`)
- **Atual:** logo 28 + título, branco, sticky.
- **Novo:** sem logo (Princípio 7 / `15` §4). Botão voltar (`ChevronLeft`, 44×44) quando a rota não é raiz do nav + título H1 20px. Fundo `neve/90` com blur, sem borda (o papel continua).
- **Motivo:** `15` §4.

### 7.13 FAB e balão da Foca (`TutorBubble`)
- **Atual:** FAB navy 56px com Foca 36; balão navy tela-cheia-baixa, mensagens brancas translúcidas, usuário em coral.
- **Novo:** FAB `cards` 56px, borda `gelo` 2px, aresta 3, Foca 40 (arte neutra; quando há `autoPrompt` pendente, `anim-breathe`). Balão = folha `cards` raio-t 28, sombra nível 3, header com Foca 28 + "Foca" + botão fechar 44×44; **fundo do corpo com pauta** (única superfície com pauta além de hero/celebração); mensagens da Foca em `neve` com borda `gelo`; mensagens do usuário em `mar` texto branco; sugestões = `chip`; input `input-ds`; botão enviar = `btn-primary` circular 44. Caret `mar`. Indicador "digitando" com 3 pontos `nevoa`. `📷` → ícone `Image` 14.
- **Motivo:** a Foca fala **no caderno**, não numa caixa preta; Princípio 1.

### 7.14 Empty state (`EmptyState`, novo)
- **Atual:** frases soltas em `card-soft`.
- **Novo:** `src/components/ds/EmptyState.tsx` — cartão tracejado, Foca `entediada` 72px, fala de 1 linha (Apêndice B), CTA opcional `btn-outline`.
- **Motivo:** `15` §4 e §7.

### 7.15 Modal de confirmação (`LessonPlayer` "Sair da lição?")
- **Atual:** caixa branca centrada sobre navy/60.
- **Novo:** `src/components/ds/BottomSheet.tsx` — folha de baixo raio-t 28, `cards`, fundo escurecido `abismo/40`, fecha com botão e com toque fora; título H2, texto body, botões empilhados (primário em cima). Foca `desapontada` 56px à esquerda do título.
- **Motivo:** zona do polegar; personagem em transição emocional.

### 7.16 Tile de estatística (`StatTile`, novo) e chip de XP (`XpChip`, novo)
- **Atual:** `Stat`, `HeroStat`, `Tile` — três implementações.
- **Novo:** `StatTile` — `card-soft` compacto, ícone 20 `abismo` em círculo `gelo`, valor `Space Mono` 20, rótulo 12. `XpChip` — pílula `recompensa`, texto `abismo` Space Mono 700, sem ícone (o raio foi banido no `17`; a Foca não vira ícone de 14px): só o texto "+15 XP".
- **Motivo:** Princípio 3, 10.

### 7.17 Skeleton, toast
- `skeleton` → `gelo` com raio 16 (mantém).
- Toast: **não introduzir** `sonner` na UI (fica sem uso). Mensagens efêmeras usam o balão da Foca (`FocaSays`, §8.3).

---

## 8. Mascote

### 8.1 A arte que existe

Um PNG colorido (cinza `#909098`, olhos com branco, boca aberta, língua vermelha) em 3/4, mais versões de contorno. É uma expressão só, entre "neutra" e "empolgada". **As 8 expressões da `15` §5 não existem em arte.** Este plano não pode depender delas para compilar.

### 8.2 O sistema (código pronto, arte plugável)

- `FocaMark` ganha `expression?: "neutra" | "cobrando" | "orgulhosa" | "empolgada" | "desapontada" | "surpresa" | "entediada" | "acolhedora"` (default `neutra`).
- Arquivos esperados: `public/branding/foca/expressoes/<expressao>-320.png` e `-96.png`, **mesmo recorte** `(320, 287, 1410, 1410)` dos originais.
- Enquanto a arte não chega, `scripts/gerar-logos-foca.ps1` copia a arte neutra para os 16 nomes (interino explícito — nada 404, a expressão só "não muda"). Quando o designer entregar `src/assets/branding/foca/expressoes/*.png`, rodar o script de novo.
- Além da imagem, cada expressão tem um **movimento de entrada** que já comunica sem a arte: `orgulhosa`/`empolgada` → `anim-pop-in`; `surpresa` → `anim-pop-in` com escala 1.1; `acolhedora` → `anim-float-in` lento; `desapontada`/`entediada` → sem animação (parada); `cobrando` → `anim-breathe`. Nunca rotação (`09` §2).

### 8.3 Onde ela aparece (com expressão, tamanho, fala)

| Momento | Tela | Expressão | Tamanho | Fala (Apêndice B) | Componente |
|---|---|---|---|---|---|
| Splash | `/` | neutra | 144 | — | `FocaMark` |
| Boas-vindas | `/welcome` | empolgada | 132 | — | `FocaMark` |
| Quiz | `/quiz` | ❌ | — | — | só wordmark 18px no header |
| Aha | `/aha` | surpresa | 96 | B-aha | `FocaSays` |
| Dashboard, primeira vez do dia | `/dashboard` | neutra | 48 | B-bomdia | `FocaSays` compacto no hero |
| Dashboard, voltou após ≥2 dias sem atividade | `/dashboard` | **acolhedora** | 64 | B-retorno (**sem cobrança**) | `FocaSays` |
| Dashboard, meta fechada | `/dashboard` | orgulhosa | 48 | B-meta | ao lado do `GoalRing` |
| Durante a questão | `/study`, lição | ❌ | — | — | — |
| Folha de feedback (acerto) | ambos | orgulhosa | 40 | B-acertou (título da folha) | `FeedbackSheet` |
| Folha de feedback (erro) | ambos | neutra | 40 | B-errou | `FeedbackSheet`; a explicação vem do balão |
| Balão do tutor | global | neutra | 28 | — | `TutorBubble` |
| Celebração (≥ 70% acerto) | ambos | orgulhosa / empolgada (100%) | 120 | B-fimbom | `CelebracaoAula` |
| Celebração (< 70%) | ambos | neutra | 120 | B-fimruim | `CelebracaoAula` |
| Streak marco (7, 30, 100) | celebração | empolgada | 120 | B-marco | `CelebracaoAula` |
| Sair da lição | `LessonPlayer` | desapontada | 56 | — | `BottomSheet` |
| Empty states | flashcards, progress, ranking… | entediada | 72 | B-vazio | `EmptyState` |
| 404 / erro | `__root` | entediada | 96 | B-404 | — |
| Header comum | — | ❌ | — | — | removida do `AppShell` |
| Ícone de XP/streak (14–16px) | dashboard, ranking, progress, aha | ❌ | — | — | removido; XP vira `XpChip` e streak vira número em mono com sufixo "dias" (sem chama — a chama é do Duo) |

### 8.4 `FocaSays` (novo)

`src/components/brand/FocaSays.tsx`: Foca (expressão, tamanho) + balão de fala (`cards`, borda `gelo` 2px, raio 16, rabicho à esquerda) com **uma** linha da biblioteca. Props: `slot` (chave do Apêndice B), `expression`, `size`, `compact`. Escolhe a variação via `src/lib/voz.ts`, que sorteia sem repetir a última do mesmo slot (guardado em `sessionStorage` — estado efêmero, não vai para o store).

### 8.5 O que a Foca nunca faz na interface

Cobrar quem volta (a variação de retorno é fixa e acolhedora, sem sorteio entre tons); aparecer durante a questão; emoji; rotação; vermelho/verde no corpo; virar bullet de 14px.

---

## 9. Gamificação

Critério (`16` §0, §9): otimizar **frequência**, não duração; recompensa previsível e proporcional; nada bloqueia estudo.

| Mecânica | Estado hoje | Proposta | Função | Store (Fase 6) |
|---|---|---|---|---|
| **XP** | real | mantido; toda concessão passa por `awardXp(n, motivo)` que dispara som/háptico/animação | recompensa imediata | sem campo novo |
| **Nível** | ausente | derivado de XP (`nivelDeXp`), tabela fixa de 10 patamares (0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200). Mostrado no perfil e no dashboard como barra "Nível 3 · 120/200". Sem título fofo — só número | percepção de progresso longo | derivado |
| **Streak** | real, incrementa por dia | mantido; ganha **recorde** (`bestStreak`) e **1 congelamento** automático (acumula até 2, +1 a cada 7 dias de atividade) consumido ao perder um dia; ao quebrar de verdade, volta a 0 sem drama e a tela mostra "recorde: N" | retorno | `bestStreak`, `streakFreezes`, `activityDays` |
| **Meta diária** | só na tela | anel de N aulas (N = `prefs.dailyLessons`, 1–5; o `10` do plano some — `16` §8); reseta por dia; fechar = som de streak + Foca orgulhosa. Passar da meta não dá bônus | hábito | `today` |
| **Missões de hoje** | falsas | 3 missões com estado real: aulas de 60s (N), 1 flashcard **revisado hoje**, 1 lição de redação **hoje**. Check em `mar`, pendente tracejado | direcionar o dia | `today` |
| **Calendário semanal** | falso | 7 dias reais (`activityDays`), hoje destacado, dias com atividade em `mar`, congelamento usado em `gelo` com ícone | visualizar constância | `activityDays` |
| **Estrelas 1–3** | real | mantido; nós da trilha mostram estrelas maiores (16px) | qualidade | — |
| **Ranking** | mock com XP real | mantido; zonas de subida/queda com faixa de fundo (`success/8`, `error/8`) e legenda | comparação com pares | — |
| **Celebração** | fraca | tela única `CelebracaoAula` para aula e lição: Foca + título + 3 tiles em cascata (acertos, tempo, XP) + streak/meta se mudou + CTA "Fechar por hoje" (primário) e "Mais uma" (ghost). O primário é **sair** (`16` §2: saída limpa) | fechamento | — |
| **Level up** | — | quando `nivelDeXp` sobe, a celebração ganha um 4º passo: "Nível 4" com marca-texto e som de marco | marco | — |
| **Badges** | — | **não agora** (`16` §7) | — | — |
| **Vidas, baús, gemas, notificação culposa** | — | ❌ | — | — |

**Voz nos números:** a Foca comenta o comportamento (presença), nunca o resultado como cobrança. "Placar feio. Amanhã a gente arruma." é o máximo de dureza permitido no fim de aula ruim.

---

## 10. Microinterações, som e háptico

### 10.1 Mapa de eventos

| Evento | Visual | Som (`16` §3) | Háptico (`16` §4) | Onde agrega | Onde seria distração |
|---|---|---|---|---|---|
| Toque em botão | desce 4px (CSS) | — | — | todo botão | som em botão comum = ruído (não) |
| Selecionar alternativa | borda `mar` + fundo, 120ms | — | — | — | — |
| Acerto | alternativa fica `success`, folha sobe (280ms), Foca orgulhosa `pop-in` | C5→E5 marimba 180ms | 30ms | sempre | — |
| Acerto após 3+ seguidos | idem + 3 notas | C5→E5→G5 | 30ms | recompensa proporcional | — |
| Erro | shake 180ms/4px na alternativa, folha `error` sobe | A3 pluck 150ms | 25-40-25 | sempre | shake na tela inteira (não) |
| XP concedido | `XpChip` `anim-xp` a partir do botão Continuar, contador sobe | tick ×≤6 | — | folha/celebração | XP animado dentro da folha de feedback (não — vem depois) |
| Barra de progresso avança | `anim-bump` | — | — | aula, lição, quiz | — |
| Meta fechada | anel completa e vira `recompensa`, Foca orgulhosa | sino 300ms | 60ms | dashboard (primeira vez no dia) | repetir a cada visita ao dashboard (não — 1× por dia, flag em `today.celebrouMeta`) |
| Fim de aula | Foca entra por baixo, tiles em cascata (130ms entre) | fanfarra 4 notas 900ms | 60ms | celebração | — |
| Streak mantido | número `anim-bump` | sino, **depois** da fanfarra | — | celebração | — |
| Marco 7/30/100 | marca-texto no número, Foca empolgada | sino oitava acima | 30-50-40-50-60 | celebração | — |
| Level up | passo extra | (mesmo do marco) | — | celebração | — |
| Balão da Foca abre | folha sobe 280ms | pop 80ms | — | — | — |
| Lição desbloqueada | nó da trilha `pop-in` ao voltar | clique 200ms | — | `/redacao` ao voltar da lição | — |
| Cartão tocável | desce 3px | — | — | — | hover-lift em mobile (não existe hover) |
| Loading do tutor | 3 pontos pulsando | — | — | — | — |

Regras: nunca dois sons juntos (fila); 1 som de recompensa por resposta (o mais alto da hierarquia: marco > level > meta > streak > fim > acerto); mudo persiste (`prefs.sound`), háptico tem toggle próprio (`prefs.haptics`); nada toca antes do primeiro gesto do usuário; toggles em `/profile` e um ícone de mudo no header da aula.

### 10.2 Implementação do som — desvio declarado do `16` §10

O `16` previa 9 arquivos em `public/sfx/`. **Proposta: sintetizar com WebAudio** (`OscillatorNode` senoidal/triangular + envelope curto, notas em dó maior), sem arquivo e sem biblioteca. Vantagens: zero licenciamento/produção, latência < 10ms, ~120 linhas, "mesma escala" garantida por construção. Desvantagem: timbre mais simples que marimba gravada — aceitável para o protótipo; se um dia houver assets, `sfx.ts` troca a implementação sem mudar a API (`play("acerto")`). Registrado como **D3** (§14).

---

## 11. UX emocional da jornada

| Momento | O que o João sente | O que queremos | Como a interface ajuda |
|---|---|---|---|
| **Primeiro acesso** (`/welcome`) | Ceticismo ("mais um app"), leve culpa por estar aqui de novo | Curiosidade, leveza | Papel claro (não um splash escuro "de startup"), Foca empolgada grande, headline que nomeia a dor sem pesar, CTA único "Começar em 60 segundos", zero cadastro |
| **Quiz** | Impaciência | "Isso está me conhecendo" | Uma pergunta por tela, progresso tipo stories no topo, opções como alternativas apertáveis, sem logo grande, sem mascote (foco) |
| **Aha** | Surpresa, um pouco de exposição ("ele viu minhas fraquezas") | Alívio: "alguém decidiu por mim por onde começar" | Foca surpresa com fala curta, 3 lacunas reveladas em cascata, barra por severidade, XP inicial em marca-texto, CTA "Entrar no meu plano" |
| **Início da aula** | Pequena resistência | "É só 60 segundos" | Cronômetro discreto em mono, 1/2 no topo, enunciado em Jakarta 17px legível, alternativas grandes, botão "Responder" só habilita com seleção |
| **Exercício difícil** | Insegurança | Segurança de que há saída | "Pedir dica" e "Perguntar à Foca" como `btn-outline` lado a lado abaixo do primário; dica em cartão `gelo` com ícone |
| **Erro** | Frustração, vergonha | "Errar é o app funcionando" | Shake curto, folha `error` com título seco e não punitivo ("Errou. Respira."), o balão abre sozinho explicando **o erro dele**; nenhum XP negativo, nenhum som de derrota |
| **Acerto** | Pequeno prazer | Prazer proporcional | Som de 2 notas, Foca orgulhosa, folha verde, "+15 XP" **depois** de continuar |
| **Fim da aula** | Alívio ("fiz alguma coisa hoje") | Fechamento + permissão de sair | Celebração curta, tiles em cascata, meta/streak se mudaram, CTA primário **"Fechar por hoje"** — o app te manda embora |
| **Volta no dia seguinte** | Neutro | Continuidade sem esforço | Dashboard com anel de meta em 0/N, "Aula de hoje" como único CTA, Foca neutra com bom-dia seco |
| **Volta depois de sumir** | Culpa (o momento mais frágil, `15` §3.2) | Acolhimento | Foca **acolhedora**, fala fixa sem cobrança, streak mostra "recorde: 12" como alvo, nada vermelho, nenhum "você perdeu" |
| **Evolução** (`/progress`) | Curiosidade/ansiedade | "Estou andando" | Barras por matéria em faixas com rótulo, "Ataque primeiro" com CTA, redação no mesmo painel, matérias não medidas tracejadas (não "vazias") |
| **Ranking** | Comparação | "Minha turma, não o Brasil" | Linha do aluno em `mar/8` com borda `mar`, zonas de subida/queda claras, rodapé honesto sobre a turma de demonstração |

---

## 12. Hierarquia, mobile-first e acessibilidade

### 12.1 Hierarquia por tela (regra das 4 perguntas)
- **Onde estou:** título H1 no topo ou item do nav ativo — nunca os dois competindo com um hero.
- **O que está acontecendo:** um bloco de estado (anel de meta, barra da lição, folha de feedback).
- **Ação principal:** um `btn-primary` por viewport, na zona do polegar (rodapé fixo em fluxos; fim do bloco principal no dashboard).
- **Próximo passo:** o cartão seguinte ou o texto do CTA já diz ("Fechar por hoje").
- Reduzir competição: o dashboard perde 2 cartões (Ranking e Flashcards viram uma linha dupla de atalhos compactos), a grade de 4 stats vira 2 (Sequência, Nível) — Acertos e Aulas moram no `/progress`.

### 12.2 Mobile
- Alvo de toque mínimo **44×44**; botões 52; nav 64; chips 36 (com margem 8 entre eles = 44 efetivos); botão fechar/voltar 44.
- Zona do polegar: CTA e "Continuar" sempre no rodapé fixo; ações secundárias acima.
- Teclado: em `/quiz` (nome, busca) e no chat, o rodapé fixo usa `position: sticky` dentro de um container com `min-h-[100dvh]` (não `100vh`) para não ficar atrás do teclado no iOS. Inputs com `font-size ≥ 16px` (evita zoom automático no iOS) — o atual `text-sm` do chat sobe para 16.
- Densidade: máx. 3 cartões acima da dobra no dashboard; listas longas (trilhas, mapa) com cabeçalho sticky.
- Scroll: nada horizontal além das sugestões do chat (com `scroll-snap`).
- Safe area: `viewport-fit=cover` já está; rodapés com `env(safe-area-inset-bottom)`.
- Viewports de QA: 360×780 (Android comum), 390×844 (iPhone), 440 (máximo do `PhoneFrame`).

### 12.3 Acessibilidade
- Contrastes da §6.1; texto mínimo 12px; `nevoa` nunca abaixo de 12px.
- Certo/errado: ícone + palavra + cor (já parcialmente; padronizar na folha).
- Seleção: borda 2px + peso 600, não só fundo.
- Foco visível: `outline` 3px `mar` offset 2 em tudo que é focável (adicionar em `@layer base`).
- `role="progressbar"` com `aria-valuenow/max` no `ProgressBar` e no `GoalRing`; `role="status"` na folha; `aria-live="polite"` no `XpChip` ("+15 XP").
- Som/háptico com toggles persistentes; nada depende de som para ser entendido.
- `prefers-reduced-motion`: tudo zera (bloco existente); a Foca aparece sem animação, o XP aparece pronto.
- `lang="pt-BR"` no `<html>` (hoje `en`).

### 12.4 Dark mode — faz sentido?
Sim: a persona estuda "tarde da noite, sem vontade" (brief §Persona). O tokens file já traz `.dark`. Decisão: **tokens e infraestrutura na Fase 1** (custo baixo, porque tudo passa por `var()`), ativação por `prefers-color-scheme` + toggle em `/profile` (`prefs.theme: "auto" | "light" | "dark"`), **QA visual do escuro só na Fase 12**. A regra 9 do §0 (`bg-cards` em vez de `bg-white`) é o que torna isso viável sem segunda passada. A `FocaMark` colorida funciona nos dois fundos (`17` §3.1); a variante `line-dark` é para claro, `line-light` para escuro — o componente escolhe pela classe `.dark`.

---

# PARTE III — TELAS

## 13. Auditoria tela por tela

Legenda de prioridade: **P0** Golden Path da demo (`08` §7) · **P1** hábito diário · **P2** acabamento. Componentes citados são os da §7.

### 13.1 `/` — Splash (`src/routes/index.tsx`) — P2
- **Problemas:** fundo navy, `animate-pulse` genérico, 1,1s parado.
- **Mudanças:** fundo `neve`; Foca neutra 144 com `anim-float-in`; wordmark "Foca" H1 grafite; tagline `ds-label` `mar-fundo`; pauta discreta atrás.
- **Componentes:** `PhoneFrame`, `FocaMark`.
- **Visual:** página de caderno em branco com a Foca subindo do rodapé.
- **Objetivo:** primeiro frame já diz "papel, não painel".

### 13.2 `/welcome` (`welcome.tsx`) — P0
- **Problemas:** hero navy, marca d'água, checks coral, link "Já tenho conta" pouco visível.
- **Mudanças:** fundo `neve`; Foca **empolgada** 132; H1 display; a palavra "todo dia" com `mark-texto`; 3 bullets em cartões finos (`card-soft` p-3) com ícone `Check` em círculo `mar/12`; CTA `btn-primary` fixo no rodapé; "Já tenho uma conta" `btn-ghost`.
- **Componentes:** `FocaMark`, `btn-primary`, `btn-ghost`, `card-soft`.
- **Objetivo:** leveza e um único caminho.

### 13.3 `/quiz` (`quiz.tsx`) — P0
- **Problemas:** navy; inputs translúcidos; `Choice` com borda coral; chips de matérias sem estado de seleção claro; rodapé fixo sobre navy.
- **Mudanças:** fundo `neve`; barra stories em `mar` sobre trilho `gelo`; header com "← Voltar" (44px) e wordmark 18 (sem Foca grande); `Wrap` com kicker `ds-label` + H1 grafite; `Choice` = alternativa da §7.10 (apertável, selecionada em `mar`); inputs `input-ds` 52px, `text-base`; listas de faculdade/curso em cartões `card-press`; matérias como `chip`/`chip-on` de 36px; rodapé fixo `neve/95` com blur + `btn-primary`.
- **Componentes:** `input-ds`, `chip`, `choiceClasses`, `ProgressBar` (stories permanece custom, 6 segmentos).
- **Objetivo:** cadastro que parece jogo, não formulário.

### 13.4 `/aha` (`aha.tsx`) — P0
- **Problemas:** navy; `🔥`; badges de severidade com hex via `PALETTE`; XP com Foca 16px.
- **Mudanças:** fundo `neve`; topo com `FocaSays slot="aha" expression="surpresa" size={96}`; H1 display "Já entendi você, {nome}."; cada lacuna em `card-soft` revelado em cascata (manter a lógica de `revealed`), número em mono `mar-fundo`, badge de severidade sem vermelho (erro é só resposta): alta = `mar/12` texto `mar-fundo`, média = `gelo` texto `abismo`, baixa = `alert/15` texto `abismo`; barra por `ProgressBar tone="caneta"`; XP inicial e streak em 2 `StatTile` com `XpChip`; CTA fixo "Entrar no meu plano".
- **Componentes:** `FocaSays`, `card-soft`, `ProgressBar`, `StatTile`, `XpChip`.
- **Objetivo:** o pico emocional com a Foca presente e recompensa em marca-texto.

### 13.5 `/dashboard` (`dashboard.tsx`) — P0
- **Problemas:** hero navy com cartão navy dentro; `doneToday` errado; 9 cartões competindo; stats 11px; 4 atalhos iguais; missões falsas; cartão premium gradiente coral.
- **Mudanças:**
  1. Hero em `neve` com **pauta**: saudação (Caption) + nome (Display); à direita `GoalRing` (anel N aulas) com número mono; abaixo, linha com streak (`Space Mono` "12 dias") e nível ("Nível 3", `ProgressBar sm`).
  2. `FocaSays` compacto: bom-dia seco (1×/dia) ou **acolhedora** se `diasSemAtividade ≥ 2` ou orgulhosa se meta fechada.
  3. Cartão "Aula de hoje" = `card-soft` p-5 com borda `mar` 2px (o único cartão com borda azul): kicker, tópico H2, matéria, `btn-primary` "Começar · 60s".
  4. Missões de hoje: 3 linhas com check circular (`mar` quando feito, tracejado quando não) e estados reais.
  5. Redação: `card-press` com ícone `PenLine` em círculo `gelo`, próxima lição, `ProgressBar sm`.
  6. Atalhos: **uma** linha com dois `card-press` compactos (Ranking, Flashcards) — Plano e Assuntos vão para o perfil (já estão lá).
  7. Stats: removidos (moram em `/progress`).
  8. Premium: `card-soft` com fundo `recompensa/20` e borda `recompensa`, texto grafite, `btn-outline` "Conhecer".
- **Componentes:** `GoalRing`, `FocaSays`, `ProgressBar`, `card-press`, `XpChip`.
- **Objetivo:** 4 perguntas em um relance; números honestos.

### 13.6 `/study` — aula de 60s (`study.tsx`) — P0
- **Problemas:** enunciado em Space Grotesk; alternativas próprias; `ResultBlock` estático abaixo (obriga rolar); "Sair" texto pequeno; `LessonDone` fraco; sem som.
- **Mudanças:**
  - Header: botão fechar `X` 44px à esquerda, `ProgressBar md tone="caneta"` no centro (bump a cada resposta), cronômetro mono à direita + ícone de mudo 44px.
  - Chips de contexto (tópico, nível, ~s) → uma linha `Caption` "Funções · Nível 2 · ~40s".
  - Enunciado: Jakarta 17/26 500.
  - Alternativas: `choiceClasses()` com marcador circular A–E; `gap-3`.
  - Rodapé fixo: `btn-primary` "Responder" (desabilitado sem seleção); abaixo, "Pedir dica" e "Perguntar à Foca" como `btn-outline` em grid-2 (mantém as funções).
  - Após responder: **`FeedbackSheet`** sobe (acerto/erro), com título da Foca, explicação curta, "Ver resolução" (colapsável com passo a passo + salvar flashcard + videoaula), "Explicar melhor" só no erro (abre o balão — o `askTutorAutomatically` continua disparando sozinho como hoje), "Continuar" primário. Ao continuar, `XpChip` "+15 XP" anima a partir do botão.
  - Fim: `CelebracaoAula` (§9) substitui `LessonDone`, com Foca por desempenho, tiles (acertos, tempo, XP), streak/meta se mudou, "Fechar por hoje" primário → `/dashboard`, "Ver meu progresso" ghost.
  - Sons/háptico nos eventos da §10.
- **Componentes:** `ProgressBar`, `choiceClasses`, `FeedbackSheet`, `XpChip`, `CelebracaoAula`, `sfx`, `haptics`.
- **Objetivo:** o loop central com feedback em 100ms e saída limpa.

### 13.7 `/redacao` — mapa (`redacao.index.tsx`) — P1
- **Problemas:** hero navy com cartão navy; nós pequenos (36px) e quadrados de estrela; abas `EixoTab` preto/cinza.
- **Mudanças:** hero `neve`: kicker + H1 + `ProgressBar md tone="caneta"` + cartão "Continuar de onde parou" (`card-soft` borda `mar`, `btn-primary` "Praticar"); abas como `chip`/`chip-on` sticky; `TrilhaCard`: nó circular 44px — concluído `mar` com `Check`, atual borda `mar` 2px com `anim-breathe`, bloqueado `gelo` com `Lock`; estrelas 16px `recompensa` (preenchidas) / `gelo`; barra da trilha `ProgressBar sm`. Lição recém-desbloqueada entra com `pop-in` (compara `progress.lessons` com o estado anterior via `sessionStorage` `ultimaLicaoConcluida`).
- **Componentes:** `ProgressBar`, `chip-on`, `card-soft`.
- **Objetivo:** trilha que parece caminho, sem virar mapa.

### 13.8 `/redacao/$licaoId` — player (`LessonPlayer.tsx`, `FeedbackBar.tsx`, `exercises/*`) — P1
- **Problemas:** fundo branco fixo; barra coral; modal centrado; resultado navy; estrelas coral; sem som.
- **Mudanças:** fundo `neve`; header igual ao `/study` (X, `ProgressBar`, contador mono); `View` dos exercícios estilizados via `shared.ts` (§7.10) + ajustes locais: `FillBlank` lacuna com sublinhado `mar` tracejado, chips 36px; `MatchPairs` cartões 2 colunas com aresta; `Reorder` blocos como chips com aresta, área de montagem tracejada; `TrueFalse` dois botões grandes 50/50 com ícone; `FindError` palavras como chips; `Interpret` texto em cartão `cards` com pauta discreta. `FeedbackBar` → `FeedbackSheet`. Resultado → `CelebracaoAula` (estrelas 44px `recompensa` em cascata, "Anota pra melhorar" em `card-soft`, "Voltar à trilha" primário, "Refazer" ghost). Confirmação de saída → `BottomSheet` com Foca desapontada.
- **Componentes:** todos os da §7.9–7.16.
- **Objetivo:** mesma linguagem do pilar 1.

### 13.9 `/progress` (`progress.tsx`) — P0 (fecha o Golden Path)
- **Problemas:** hero navy; faixas com `PALETTE` inline; "Cinza = não medido" depende de cor.
- **Mudanças:** topo `neve`: kicker + H1 + 3 `StatTile` (acertos, aulas, nível); "Ataque primeiro" em `card-soft` com barra fina por item e `btn-primary`; mapa: **duas cores + rótulo** — `ProgressBar sm tone="caneta"` para toda matéria medida, `tone="success"` só na faixa "Dominado" (≥ 80%); o rótulo textual da faixa ("Lacuna" < 40 · "Em construção" 40–59 · "Quase lá" 60–79 · "Dominado" ≥ 80) fica ao lado do número; matérias não medidas = trilho **tracejado** (`border-2 border-dashed border-gelo bg-transparent`) + "não medido". Rótulo faz o trabalho, cor reforça. As quatro cores das `FAIXAS` atuais (`PALETTE.*`) somem.
- Redação no mesmo painel com `ProgressBar sm`.
- Empty state → `EmptyState` com Foca entediada + CTA "Fazer a primeira aula".
- **Objetivo:** ler a lacuna sem interpretar cor.

### 13.10 `/ranking` (`ranking.tsx`) — P2
- **Problemas:** hero navy; posição em `success`/`error` como texto (verde/vermelho fora de feedback).
- **Mudanças:** topo `neve`: kicker, H1 "Você está em 7º" (número em mono), frase; lista em `card-soft` única com divisores; zonas: as 5 primeiras linhas com faixa lateral `mar` e legenda "sobe de liga"; as últimas com faixa `gelo` e legenda "cai"; setas somem (texto faz o papel); linha do aluno `mar/8` com borda `mar`; XP em mono; streak "12 dias" sem chama; avatar círculo `gelo` com iniciais. Rodapé honesto mantido.
- **Objetivo:** comparação com a turma, sem verde/vermelho.

### 13.11 `/plan` (`plan.tsx`) — P1
- **Problemas:** cartão gradiente coral; calendário falso; opções 1/3/5/10.
- **Mudanças:** cartão de hoje `card-soft` borda `mar` com `btn-primary`; atividades como lista com ícones em círculo `gelo`; "Ajustar ritmo" com **1 / 3 / 5** (some o 10, `16` §8) como `chip`/`chip-on` grandes; calendário semanal **real** (`activityDays`), hoje com borda `mar`, dia feito `mar` sólido com `Check`, congelamento `gelo` com ícone `Snowflake`; `details` de matérias vira `card-soft` simples.
- **Objetivo:** honestidade dos números.

### 13.12 `/flashcards` (`flashcards.tsx`) — P1
- **Problemas:** 4 botões de nota em `amber/blue/red/emerald` (fora do token, verde/vermelho fora de feedback); chips com `style` inline; cartão sem "virada".
- **Mudanças:** filtros como `chip`/`chip-on`; select como `input-ds` compacto; cartão `card-soft` p-6 min-h 260 com `ds-label` da matéria e "Toque para virar"; virada por `transform: rotateY` com `perspective` (200ms; reduzido para fade em reduced-motion); notas em **4 `btn-outline`** com rótulo e ícone (`X` Não lembrei, `Minus` Difícil, `Check` Lembrei, `CheckCheck` Fácil) — sem cor semântica; avaliar um cartão **não** concede XP (flashcard não dá XP hoje — regra de negócio preservada), só marca a missão do dia (`today.flashcards`). Empty → `EmptyState`.
- **Objetivo:** sair da paleta Tailwind; revisão como gesto leve.

### 13.13 `/profile` (`profile.tsx`) — P1
- **Problemas:** header com logo; avatar quadrado navy; cartão premium gradiente; "Sair da conta" ok.
- **Mudanças:** header sem logo; cartão de identidade: avatar círculo `gelo` com iniciais grafite, nome H2, **nível + barra** (`ProgressBar sm`) e recorde de streak em mono; **novo bloco "Som e vibração"**: dois botões `chip`/`chip-on` "Som" / "Vibração" com `aria-pressed` (não usar o `Switch` do shadcn — a pasta `ui/` fica intocada); **tema**: 3 chips Auto/Claro/Escuro; premium em `card-soft` `recompensa/20`; listas em `card-soft` com `Row` de 52px e `ChevronRight`; reset e sair como `btn-ghost`.
- **Objetivo:** controles sensoriais acessíveis em 1 toque (`16` §3).

### 13.14 `/premium` (`premium.tsx`) — P2
- **Mudanças:** cartão-título `card-soft` `recompensa/20` com `Sparkles` grafite; benefícios com `Check` em círculo `mar/12`; CTA `btn-primary`; "Voltar" ghost; textos mantidos.

### 13.15 `/topics` (`topics.tsx`) — P2
- **Problemas:** botão "Editar preferências" leva a `/onboarding` (redirect para `/quiz`, funciona); opções pretas.
- **Mudanças:** chips → `chip`/`chip-on`; opções de modo → alternativas `choiceClasses`; "Selecionar todos" → `btn-ghost` pequeno. Link para `/quiz` direto.

### 13.16 `/video/$id` (`video.$id.tsx`) — P2
- **Mudanças:** player mantém; card de texto em `card-soft`; CTAs: "Assistir no YouTube" primário, os outros dois ghost (três `btn-outline` empilhados competem).

### 13.17 `/login`, `/forgot` (`login.tsx`, `forgot.tsx`) — P2
- **Problemas:** `text-red-500` no erro; bolinha gradiente red/yellow/blue como "logo Google"; inputs próprios.
- **Mudanças:** fundo `neve`; Foca neutra 40 ao lado do H1 (é tela de entrada — permitido); `input-ds`; erro em `error` com ícone `AlertCircle` (erro de formulário é exceção legítima — é feedback de erro); botão Google `btn-outline` com ícone `LogIn` de lucide (sem gradiente falso); links `mar-fundo` sublinhados.

### 13.18 `/offline` (`offline.tsx`) — P2
- **Mudanças:** `text-green-600`/`red-500` → estado online com ícone `Wifi` em `abismo` + chip "online"/"offline" (`chip`); "Pronto para estudar offline" com `Check` `success-texto` (é confirmação de conclusão — aceitável) ou simplesmente `abismo` (**preferir `abismo`**: não é resposta certa).

### 13.19 `/onboarding`, `/signup` — redirects, sem UI. Nada a fazer.

### 13.20 404 e erro (`__root.tsx` `NotFoundComponent`/`ErrorComponent`, `error-page.ts`) — P2
- **Mudanças:** pt-BR; `neve`; Foca entediada 96; título H1 ("Essa página não existe." / "Isso aqui não carregou."); fala B-404; `btn-primary` "Voltar ao início" + `btn-ghost` "Tentar de novo". `error-page.ts` (HTML estático) recebe os hex novos e a mesma copy (sem imagem — é fallback sem app).

### 13.21 Globais
- `AppShell`/`PhoneFrame`/`BottomNav` (§7.11–7.12); `TutorBubble` (§7.13); `<html lang="pt-BR">`; `theme-color` → `PALETTE.neve` (claro) e `PALETTE.neveDark` (escuro) via duas metas com `media`.

---

# PARTE IV — EXECUÇÃO

## 14. Decisões que precisam do time (default assumido pelo plano)

O executor **não** resolve estas; ele aplica o default. Se o time decidir diferente antes da fase indicada, a mudança é a descrita.

| # | Decisão | Default do plano | Alternativa | Onde muda | Fase |
|---|---|---|---|---|---|
| **D1** | Cor da recompensa (XP/streak/marco) | **Marca-texto** `--color-recompensa: var(--color-alert)` (fundo, texto grafite) | Accent único: `--color-recompensa: var(--color-mar)` | 1 linha em `styles.css` (claro e escuro) | 1 |
| **D2** | Fonte de dados | **Space Mono 700** (Opção A) | Não carregar mono; usar Space Grotesk `tabular-nums` | `__root.tsx` link + `--font-mono` | 1 |
| **D3** | Som | **WebAudio sintetizado**, sem assets | Assets `.webm/.mp3` em `public/sfx/` (precisa produção/licença) | só `src/lib/sfx.ts` | 5 |
| **D4** | Dark mode | Tokens + auto por sistema + toggle; **QA na Fase 12** | Só tokens, sem toggle, sem QA | `profile.tsx`, `__root.tsx` | 1/12 |
| **D5** | Expressões da Foca | Código pronto; arte **interina = neutra copiada** | Aguardar arte antes da Fase 3 | `scripts/gerar-logos-foca.ps1` | 3 |
| **D6** | Heros escuros | **Todos viram papel** (inclusive welcome/quiz/aha) | Manter welcome/quiz/aha em grafite como "capa do caderno" | Fase 7 (3 arquivos) | 7 |
| **D7** | Opção 10 aulas/dia no plano | **Remover** (1/3/5) | Manter | `plan.tsx` | 11 |

Padrões de copy (Apêndice B) não são decisão de executor: se o time quiser outras frases, edita o Apêndice B **antes** da Fase 3.

---

## 15. Plano técnico em fases

Cada fase: objetivo · arquivos · passos · critérios de aceite · riscos · testes. Arquivos marcados **(novo)** não existem hoje. Todo o resto existe.

### Fase 0 — Baseline
**Objetivo:** distinguir erro novo de erro antigo.
**Arquivos:** nenhum editado.
**Passos:** `git status` (esperado: as ~47 mudanças do `17`, não commitadas — **não reverter, não commitar sem autorização**) · `bun install` · `bun run lint` → `docs/_tmp-baseline-lint.txt` · `bunx tsc --noEmit` → `docs/_tmp-baseline-tsc.txt` · `bun run build` deve passar · `bun run dev` e percorrer as 17 rotas com UI (`/`, `/welcome`, `/quiz`, `/aha`, `/dashboard`, `/study`, `/redacao`, `/redacao/<id da primeira lição>`, `/progress`, `/ranking`, `/plan`, `/flashcards`, `/profile`, `/premium`, `/topics`, `/video/v1`, `/login`, `/forgot`, `/offline`) anotando erros de console · screenshots de `/dashboard`, `/study` (pergunta + feedback), `/redacao`, `/aha` (fora do repo).
**Aceite:** dois arquivos `_tmp-baseline-*` existem; build passou.
**Risco:** se o build já falhar, **parar e reportar**.

### Fase 1 — Tokens "Rabisco", escalas, fontes, dark, superfícies
**Objetivo:** o app inteiro muda de cor/raio nesta fase sem tocar em lógica; `bg-white` deixa de existir nas telas.
**Arquivos:** `src/styles.css` · `src/lib/brand.ts` · `src/lib/error-page.ts` · `src/routes/__root.tsx` · `scripts/rename-superficies-rabisco.mjs` **(novo, apagado ao fim da fase)** · todos os `.tsx` em `src/routes/`, `src/components/*.tsx`, `src/components/lessons/**` (só via o script de rename).

**Passos:**
1. `styles.css`: substituir o bloco `@theme inline` e o `:root` pelos de `docs/brand/foca-rabisco-tokens.css` e acrescentar o `.dark`, **com estes ajustes** sobre o arquivo do brief:
   - Adicionar em `@theme inline`: `--color-recompensa: var(--color-alert);` (**D1**), `--color-success-texto: #1f7a45;`, e manter `--color-cards`.
   - No `.dark`: `--color-recompensa: var(--color-alert); --color-success-texto: #45b876;`.
   - Raios: `--radius: 1rem` (16px) e `--radius-card: 1.25rem` (20px) no `:root`; em `@theme inline` **substituir** as seis linhas `--radius-*: calc(…)` por valores fixos: `--radius-sm: 10px; --radius-md: 6px; --radius-lg: 16px; --radius-xl: 20px; --radius-2xl: 24px; --radius-3xl: 28px;` (tabela da §6.3: `md` = marcador, `lg` = botão/input, `xl` = cartão, `3xl` = folha).
   - Easing: `--ease-out: cubic-bezier(.2,.8,.2,1); --ease-bounce: cubic-bezier(.34,1.56,.64,1);` no `:root`.
   - Comentário de cabeçalho: trocar "paleta Ártica (docs/09-branding.md §3)" por "paleta Rabisco na Margem (docs/brand/foca-rabisco-branding.md, docs/18)".
2. `styles.css` `@layer base`: `html, body { background: var(--color-neve); color: var(--color-foreground); }` (já é); adicionar `:focus-visible { outline: 3px solid var(--color-ring); outline-offset: 2px; }` e `button, [role="button"] { -webkit-tap-highlight-color: transparent; }`.
3. `styles.css` utilities: trocar todo `#fff` por `var(--color-cards)` (`btn-outline`, `btn-ghost`, `card-soft`, `input-ds`). **Não** mexer ainda no formato dos botões (Fase 2) — só cor e raio herdam automaticamente.
4. Alias temporário para não quebrar nada: manter `--color-coral` e `--color-coral-claro` como estão no tokens file (= caneta). Serão removidos na Fase 12.
5. `brand.ts`: `PALETTE` passa a `{ abismo:"#3A3A3C", mar:"#2E6BFF", marFundo:"#1E4FCC", gelo:"#E1DFDA", neve:"#F6F5F1", neveDark:"#1C1B18", cards:"#FFFFFF", coralClaro:"#8FB0FF", pelo:"#D6D6D4", peloSombra:"#737075", nevoa:"#737075", white:"#FFFFFF", success:"#2E9E5B", successTexto:"#1F7A45", alert:"#D9A017", recompensa:"#D9A017", error:"#C23B3B" }`; remover `coral`. Comentário aponta para `docs/18`. `BRAND` inalterado.
6. `error-page.ts`: hex → `#F6F5F1` fundo, `#26262A` texto, `#737075` secundário, primário `#2E6BFF`/branco, secundário borda `#E1DFDA`; `lang="pt-BR"`; textos: título "Isso aqui não carregou.", parágrafo "Deu ruim do nosso lado. Tenta de novo ou volta pro início.", botões "Tentar de novo" / "Voltar ao início"; raio `1rem`.
7. `__root.tsx`: `lang="pt-BR"`; link de fontes ganha `&family=Space+Mono:wght@700`; `theme-color`: duas metas `{ name:"theme-color", media:"(prefers-color-scheme: light)", content: PALETTE.neve }` e `{ …dark…, content: PALETTE.neveDark }`; adicionar em `head.scripts` (ou como `<script>` inline no `RootShell` antes de `{children}`) o snippet que aplica `.dark`: lê `localStorage["foca.state.v3"]` → `prefs.theme` (`"auto"|"light"|"dark"`, default `"auto"`) e, se `dark` ou (`auto` e `matchMedia("(prefers-color-scheme: dark)").matches`), faz `document.documentElement.classList.add("dark")`. Envolver em `try/catch`. (`prefs.theme` só existe no store a partir da Fase 6; até lá o snippet só respeita o sistema.)
8. Criar `scripts/rename-superficies-rabisco.mjs` (Node puro): em `src/routes/**/*.tsx`, `src/components/*.tsx`, `src/components/brand/*.tsx`, `src/components/lessons/**/*.tsx`, substituir por regex de classe inteira: `bg-white/95`→`bg-cards/95`, `bg-white`→`bg-cards`, `border-white/…` e `bg-white/[0.07]` etc. (usados só sobre navy) → **deixar** (as telas navy são refeitas nas fases 7–11); `text-red-500`→`text-error`; `text-green-600`/`text-green-700`→`text-abismo`. Rodar, revisar o diff, apagar o script.
9. Verificar `bun run lint`, `bunx tsc --noEmit`, `bun run build`.

**Aceite:** `/dashboard` com fundo `rgb(246,245,241)`, cartões brancos com borda `#E1DFDA`, botão "Começar" azul `rgb(46,107,255)`; nenhum `bg-white` em `src/routes`/`src/components` fora de `ui/` (`grep -rn "bg-white" src --include=*.tsx | grep -v components/ui` vazio); com o SO em dark, o app fica escuro (mesmo que feio — QA é Fase 12); build ok.
**Riscos:** os heros navy passam a ser **grafite `#3A3A3C`** até as fases 7–11 — feio de propósito, temporário; `--radius` maior muda todos os `rounded-*` de uma vez — checar que nada ficou oval (inputs pequenos com `rounded-full` já eram pílula).
**Testar:** as 17 rotas abrem; contraste do texto `nevoa` sobre papel ≥ 4.5 (DevTools).

### Fase 2 — Componentes globais (utilities + `ds/`)
**Objetivo:** botões apertáveis, cartões com borda, chips com estado, barra de progresso única, folha de baixo, empty state, tiles.
**Arquivos:** `src/styles.css` · `src/components/ds/ProgressBar.tsx` **(novo)** · `src/components/ds/GoalRing.tsx` **(novo)** · `src/components/ds/BottomSheet.tsx` **(novo)** · `src/components/ds/EmptyState.tsx` **(novo)** · `src/components/ds/StatTile.tsx` **(novo)** · `src/components/ds/XpChip.tsx` **(novo)** · `src/components/lessons/exercises/shared.ts`.

**Passos:**
1. `styles.css` — reescrever utilities (Tailwind v4 aceita `&:active` aninhado em `@utility`):
   - `btn-primary`: `min-height: 52px; padding: 0 1.25rem; border-radius: var(--radius); background: var(--color-mar); color: #fff; font: 700 1rem/1.25 var(--font-display); box-shadow: 0 4px 0 var(--color-mar-fundo); transform: translateY(0); transition: transform .08s ease, box-shadow .08s ease, filter .15s; &:hover { filter: brightness(1.06) } &:active { transform: translateY(4px); box-shadow: 0 0 0 var(--color-mar-fundo) } &:disabled { opacity:.4; box-shadow:none; transform:none; cursor:not-allowed }`. Remover `btn-primary-hover`.
   - `btn-outline`: `cards`, `border: 2px solid var(--color-gelo)`, `box-shadow: 0 3px 0 var(--color-gelo)`, texto `abismo`, mesma altura/raio/fonte; `:active` desce 3.
   - `btn-ghost`: sem borda/sombra, `min-height: 44px`, texto `nevoa`, fonte display 700 15px.
   - `btn-abismo`: grafite + branco, aresta `0 4px 0 rgb(0 0 0 / .35)`; mesma mecânica.
   - `card-soft`: `background: var(--color-cards); border: 2px solid var(--color-gelo); border-radius: var(--radius-card);`.
   - `card-press` **(nova)**: `card-soft` + `box-shadow: 0 3px 0 var(--color-gelo); transition: transform .08s, box-shadow .08s; &:active { transform: translateY(3px); box-shadow: none }`.
   - `chip`: `min-height: 36px; padding: 0 .875rem; border-radius: 999px; background: var(--color-gelo); color: var(--color-abismo); font-size: .8125rem; font-weight: 600; border: 2px solid transparent;`. `chip-on` **(nova)**: `background: color-mix(in srgb, var(--color-mar) 12%, transparent); border-color: var(--color-mar); color: var(--color-mar-fundo); font-weight: 700;`.
   - `ds-label`: `letter-spacing: .1em`.
   - `input-ds`: `min-height: 52px; border: 2px solid var(--color-gelo); border-radius: var(--radius); background: var(--color-cards); color: var(--color-foreground); font-size: 1rem; &:focus { border-color: var(--color-mar) }`.
   - `surface-pauta` **(nova)**: `background-image: repeating-linear-gradient(to bottom, transparent 0 27px, color-mix(in srgb, var(--color-gelo) 60%, transparent) 27px 28px);`.
   - `mark-texto` **(nova)**: `background: linear-gradient(104deg, transparent 4%, var(--color-recompensa) 4% 96%, transparent 96%); padding: 0 .15em; border-radius: 4px; -webkit-box-decoration-break: clone; box-decoration-break: clone;`.
   - `sheet` **(nova)**: `background: var(--color-cards); border-radius: var(--radius-3xl) var(--radius-3xl) 0 0; box-shadow: 0 -8px 24px -8px rgb(38 38 42 / .25);`.
   - Animações novas: `@keyframes ft-bump { 0%{transform:scale(1)} 40%{transform:scale(1.12)} 100%{transform:scale(1)} }` → `anim-bump` 220ms; `ft-breathe` (scale 1→1.04→1, 2.4s infinite) → `anim-breathe`; `ft-float-in` (translateY 24px→0 + opacity) → `anim-float-in` 400ms `var(--ease-out)`; `ft-shake` → `translateX ±4px`, `anim-shake` 180ms.
2. `ProgressBar.tsx`: `({ value, max = 100, tone = "caneta", size = "sm", label })` → `<div role="progressbar" aria-valuenow aria-valuemax aria-label className="h-2|h-3 w-full overflow-hidden rounded-full bg-gelo"><div style={{ width: pct }} className="h-full rounded-full transition-[width] duration-500 bg-mar|bg-recompensa|bg-success"/></div>`; `useEffect` que adiciona `anim-bump` por 220ms quando `value` aumenta (guardar `prev` em `useRef`).
3. `GoalRing.tsx`: SVG 72×72, `stroke-dasharray`, trilho `var(--color-gelo)` 8px, traço `var(--color-mar)` (ou `recompensa` quando `value >= max`), `stroke-linecap: round`, transição de `stroke-dashoffset` 600ms; centro com `<span className="font-mono font-bold">{value}/{max}</span>`; `role="progressbar"`.
4. `BottomSheet.tsx`: `({ open, onClose, title, children, foca?: { expression, size } })` → overlay `fixed inset-0 bg-abismo/40` (fecha no clique) + `sheet` `fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] anim-slide-up`; `role="dialog" aria-modal aria-labelledby`; fecha com `Escape`; foco inicial no título.
5. `EmptyState.tsx`: `({ slot, cta?: { label, to } })` → `card-soft border-dashed p-6 text-center` com `FocaMark expression="entediada" size={72}` e a fala de `voz.ts` (Fase 3 — até lá, aceitar `text` direto).
6. `StatTile.tsx`: `({ icon, label, value })` conforme §7.16.
7. `XpChip.tsx`: `({ amount, animate })` → `inline-flex rounded-full bg-recompensa px-3 py-1 font-mono font-bold text-abismo` com `anim-xp` quando `animate`, `aria-live="polite"`.
8. `shared.ts` `choiceClasses()`: base `rounded-lg border-2 border-gelo bg-cards shadow-[0_3px_0_var(--color-gelo)] px-4 py-3.5 text-[15px] leading-snug active:translate-y-[3px] active:shadow-none transition-all duration-100`; selecionada `border-mar bg-mar/8 shadow-[0_3px_0_color-mix(in_srgb,var(--color-mar)_40%,transparent)] font-semibold`; certa `border-success bg-success/10 font-semibold shadow-none`; errada `border-error bg-error/10 shadow-none`; não escolhidas após checar `opacity-45 shadow-none`. Adicionar `export function marcadorClasses(state)` para o círculo A–E (28px, `rounded-full`, `bg-gelo text-abismo` / selecionado `bg-mar text-white` / certo `bg-success text-white` / errado `bg-error text-white`).

**Aceite:** botões descem ao pressionar (DevTools: `:active` → `transform: translateY(4px)`); `card-soft` sem sombra e com borda 2px; storybook manual: uma rota temporária **não** — testar in loco em `/dashboard` e `/redacao/<id>`.
**Riscos:** `color-mix` exige navegadores 2023+ (ok para o alvo); `box-decoration-break` no Safari precisa do prefixo (incluído).
**Testar:** lint/tsc/build; foco por teclado visível em botões e chips.

### Fase 3 — Mascote: expressões e voz
**Objetivo:** `FocaMark` com expressões, `FocaSays`, biblioteca de falas.
**Arquivos:** `src/components/brand/FocaMark.tsx` · `src/components/brand/FocaSays.tsx` **(novo)** · `src/lib/voz.ts` **(novo)** · `scripts/gerar-logos-foca.ps1` · `src/assets/branding/foca/README.md` · `public/branding/foca/expressoes/*` **(gerados)** · `src/components/ds/EmptyState.tsx`.

**Passos:**
1. `gerar-logos-foca.ps1`: ao final, para cada expressão em `neutra, cobrando, orgulhosa, empolgada, desapontada, surpresa, entediada, acolhedora`: se existir `src/assets/branding/foca/expressoes/<expr>.png`, usa; senão usa `foca-color-transparent.png` (interino, **D5**). Exporta `public/branding/foca/expressoes/<expr>-96.png` e `-320.png` com o mesmo recorte e `pad 0.04`. Rodar o script.
2. `README.md` dos assets: seção "Expressões" com a tabela da `15` §5 e a regra do fallback.
3. `FocaMark.tsx`: prop `expression?: FocaExpression` (default `"neutra"`); quando `variant === "color"` e `expression` informada, `src = /branding/foca/expressoes/${expression}-${size<=48?96:320}.png`; `alt` = `"Foca"` (expressão não vai para o alt — é decorativa); prop `motion?: "pop" | "float" | "breathe" | "none"` que aplica `anim-pop-in`/`anim-float-in`/`anim-breathe`. Nunca `rotate`.
4. `voz.ts`: `export const VOZ: Record<Slot, string[]>` com **exatamente** as frases do Apêndice B; `export function fala(slot: Slot): string` sorteia evitando a última do slot (`sessionStorage["foca.voz.<slot>"]`); o slot `retorno` **não sorteia entre tons** — todas as variações são acolhedoras por construção.
5. `FocaSays.tsx`: conforme §8.4; `compact` = Foca 40 + texto 13px numa linha.
6. `EmptyState.tsx` passa a usar `fala("vazio")`.

**Aceite:** `/branding/foca/expressoes/orgulhosa-320.png` responde 200; `<FocaMark expression="surpresa" motion="pop" size={96} />` renderiza quadrado, animado, sem rotação; `fala("retorno")` nunca devolve frase com cobrança (as 3 do Apêndice B).
**Riscos:** enquanto a arte não existe, todas as expressões são iguais — **dizer isso no relatório**, não é bug.

### Fase 4 — Shell e navegação
**Objetivo:** header sem logo, nav com pílula, moldura de papel, FAB novo.
**Arquivos:** `src/components/AppShell.tsx` · `src/components/TutorBubble.tsx`.

**Passos:**
1. `PhoneFrame`: `bg-neve`, sem sombra; `md:border-x md:border-gelo`.
2. `AppShell`: header só com `title`: `sticky top-0 z-20 flex items-center gap-2 bg-neve/90 px-3 py-3 backdrop-blur`; botão voltar (`ChevronLeft`, 44×44, `router.history.back()`) quando `title` existe e a rota não é uma das 5 do nav; H1 `font-display text-xl font-bold text-abismo`. **Remover** `BrandMark` do header (manter o export `BrandMark` para splash/welcome/login).
3. `main`: `pb-32`.
4. `BottomNav`: `fixed bottom-0 … bg-cards/95 border-t-2 border-gelo pb-[env(safe-area-inset-bottom)]`; item = `flex flex-col items-center gap-0.5 py-2 min-h-[64px] text-xs font-bold`; ícone dentro de `span` 40×28 `rounded-full` que recebe `bg-mar/12 anim-pop-in` quando ativo; ativo `text-mar-fundo strokeWidth 2.4`, inativo `text-nevoa`; `aria-current="page"` no ativo.
5. `TutorBubble`: FAB conforme §7.13 (`bg-cards border-2 border-gelo shadow-[0_3px_0_var(--color-gelo)]`, Foca 40, `anim-breathe` quando `s.tutor.autoPrompt` não é null); balão: `sheet` + `surface-pauta` no corpo; header `cards`; mensagens da Foca `bg-neve border-2 border-gelo text-foreground rounded-2xl rounded-bl-md`; do usuário `bg-mar text-white rounded-2xl rounded-br-md`; "Falando sobre" como `chip`; sugestões `chip`; input `input-ds` com `text-base`; botão enviar `btn-primary h-11 w-11 rounded-full p-0`; anexar = `btn-outline h-11 w-11 p-0`; `📷` → `<Image size={14} aria-hidden />`; caret `--color-mar`; pontos de loading `bg-nevoa`. Tudo o que é `text-white`/`bg-white/…` some.

**Aceite:** nenhuma tela com título mostra a Foca no header; nav ativa com pílula; balão claro com pauta; `grep -n "bg-abismo" src/components/AppShell.tsx src/components/TutorBubble.tsx` vazio.
**Riscos:** `router.history.back()` numa aba aberta direto em `/profile` não tem histórico — fallback `navigate({ to: "/dashboard" })` quando `history.length <= 1`.

### Fase 5 — Sensorial: som e háptico
**Objetivo:** módulos prontos e testáveis, ainda sem ligar às telas (a ligação é nas fases 9–10).
**Arquivos:** `src/lib/sfx.ts` **(novo)** · `src/lib/haptics.ts` **(novo)**.

**Passos:**
1. `sfx.ts` (**D3**): `type Evento = "acerto" | "acerto3" | "erro" | "xp" | "fim" | "streak" | "marco" | "desbloqueio" | "pop"`; tabela `{ notas: number[] (Hz), dur: ms, tipo: OscillatorType, ganho }` com C5=523.25, E5=659.25, G5=783.99, C6=1046.5, A3=220 conforme `16` §3; `AudioContext` criado **lazy no primeiro `play()`** (que só acontece após gesto); envelope ADSR curto (attack 5ms, decay até 0 em `dur`); fila: se um som está tocando, o próximo espera `dur` (nunca mistura); hierarquia `prioridade(evento)` e `playRecompensa(eventos[])` que toca só o mais alto; `setEnabled(bool)` lido de `getState().prefs.sound` a cada `play` (import de `store` **só do getter** para não criar ciclo); tudo em `try/catch` silencioso; `if (typeof window === "undefined") return`.
2. `haptics.ts`: `vibrar(padrao: "acerto" | "erro" | "fim" | "marco")` → `navigator.vibrate?.(…)` conforme `16` §4; respeita `prefs.haptics`; sem log.
3. Teste manual: no console do navegador, `import("/src/lib/sfx.ts").then(m => m.play("acerto"))` após um clique na página.

**Aceite:** os 9 eventos tocam no desktop após um gesto; nenhum erro sem gesto; com `prefs.sound=false` (setar via console no `localStorage` até a Fase 6) nada toca.
**Riscos:** iOS silencioso não toca (esperado, `16` §3 regra 2); `vibrate` inexistente no iOS (degrada).

### Fase 6 — Store: registro honesto + preferências
**Objetivo:** dados para meta diária, calendário, recorde, congelamento, nível e toggles. **Sem mudar regras de XP.**
**Arquivos:** `src/lib/store.ts`.

**Passos:**
1. `Prefs` += `sound: boolean` (true), `haptics: boolean` (true), `theme: "auto" | "light" | "dark"` ("auto"). `dailyLessons` default continua 3.
2. `Progress` += `activityDays: string[]` (ISO `YYYY-MM-DD`, máx. 60 entradas), `bestStreak: number` (0), `streakFreezes: number` (1), `today: { date: string; lessons: number; flashcards: number; redacao: number; celebrouMeta: boolean }`.
3. `defaultState` e `load()` com os defaults (merge raso já cobre — `today` precisa de merge próprio: se `parsed.progress.today?.date !== hoje`, zera).
4. Helper interno `registrarAtividade(s, tipo: "lesson" | "flashcard" | "redacao")`: garante `today` do dia; incrementa o contador; adiciona `activityDays` (único); **streak**: se `lastStudyDate !== hoje` → se `lastStudyDate` foi ontem, `streak += 1`; se foi anteontem e `streakFreezes > 0`, `streakFreezes -= 1` e `streak += 1` (congelamento consumiu o dia perdido); senão `streak = 1`; atualiza `lastStudyDate` e `bestStreak = max`. A cada 7 dias de atividade acumulados (`activityDays.length % 7 === 0`), `streakFreezes = min(2, +1)`.
   **Atenção — comportamento atual:** hoje `streak += 1` em qualquer dia diferente do último, mesmo após 30 dias parado. A regra nova (zerar quando o intervalo > 1 dia sem freeze) é a que o `16` §6 especifica e a que a tela precisa para ser honesta. **Isso é a única mudança de comportamento do plano** e está aprovada pelo `16`; registrar no relatório.
5. Substituir os três blocos duplicados de streak (em `completeQuiz`, `completeLesson`, e o inline de `study.tsx submit()` — este último via novo `export function registrarResposta(q, correct)` que move o bloco de `study.tsx` para o store, **mesmos incrementos e mesmo XP**) por chamadas a `registrarAtividade`. `lessonsCompleted += 1` continua onde está (fim da aula), mas passa a chamar `registrarAtividade(s, "lesson")` também — o dia conta pela aula concluída.
6. `awardXp(n: number)`: helper interno usado pelos três pontos que somam XP (não muda valores). Exporta `export function nivelDeXp(xp): { nivel, atual, proximo, pct }` com a tabela da §9.
7. Flashcards: `grade()` em `flashcards.tsx` passa a chamar `export function registrarRevisaoFlashcard()` (chama `registrarAtividade(s, "flashcard")`, que **também conta para o streak** — a `16` §6 diz "qualquer atividade completada", e flashcard revisado é atividade).
8. Exports novos: `setPrefs(partial)`, `marcarMetaCelebrada()`, `diasSemAtividade(s): number` (para o slot de retorno), `atividadeHoje(s)`.
9. **Chave do storage não muda** (`foca.state.v3`) — campos são aditivos com defaults.

**Aceite:** ao concluir uma aula, `progress.today.lessons` = 1 e `activityDays` contém hoje; recarregar no dia seguinte (simular mudando a data do sistema) zera `today` e mantém `activityDays`; XP idêntico ao de antes para a mesma sequência de ações; `tsc` passa.
**Riscos:** `structuredClone` de `today` ok; datas em UTC vs local — usar sempre `new Date().toDateString()` para `lastStudyDate` (compat com o existente) e `toISOString().slice(0,10)` só para `activityDays`… **não misturar**: criar `hojeISO()` local (`YYYY-MM-DD` a partir de `getFullYear/getMonth/getDate`) e usar em `activityDays` e `today.date`; `lastStudyDate` continua `toDateString()`.

### Fase 7 — Telas de entrada
**Objetivo:** splash, welcome, quiz, aha, login, forgot na nova direção (**D6**).
**Arquivos:** `src/routes/index.tsx` · `welcome.tsx` · `quiz.tsx` · `aha.tsx` · `login.tsx` · `forgot.tsx`.
**Passos:** aplicar §13.1–13.4 e §13.17 literalmente. Em `quiz.tsx`: `Choice` passa a usar `choiceClasses`; inputs `input-ds`; remover `bg-abismo`, `text-white`, `text-pelo` (→ `text-nevoa`), `border-white/…`; `Wrap` kicker `ds-label` sem `style`. Em `aha.tsx`: remover `PALETTE` import e o `🔥`; `SEVERITY` vira classes (§13.4). Em `login.tsx`: `text-red-500` → `text-error`; bolinha gradiente → `<LogIn size={16} />`.
**Aceite:** nenhuma das 6 telas tem `bg-abismo` como fundo de bloco (`grep -n "bg-abismo" <6 arquivos>` vazio); fluxo `/welcome → /quiz → /aha → /dashboard` completo; `/aha` mostra a Foca surpresa com fala; contraste ok.
**Riscos:** rodapé fixo do quiz com teclado aberto no iOS — usar `min-h-[100dvh]`.

### Fase 8 — Dashboard
**Arquivos:** `src/routes/dashboard.tsx`.
**Passos:** §13.5 literal, usando `atividadeHoje`, `nivelDeXp`, `diasSemAtividade`, `GoalRing`, `FocaSays`, `ProgressBar`, `card-press`, `StatTile` (nenhum aqui), `XpChip` (não aqui — XP fica no nível). Quando `today.lessons >= dailyLessons && !today.celebrouMeta`: `GoalRing` completa em `recompensa`, `FocaSays slot="meta" expression="orgulhosa"`, `sfx.play("streak")`, `haptics.vibrar("fim")`, `marcarMetaCelebrada()`. Remover imports não usados (`Flame`, `Target`, `TrendingUp`, `Layers`, `Trophy` se sobrarem).
**Aceite:** 4 perguntas respondidas em um relance (screenshot 390×844 sem rolar mostra: nome, anel, Foca, cartão "Aula de hoje" com CTA); "0/3" no início do dia; missões só marcam com atividade de hoje; nenhum `bg-abismo`.

### Fase 9 — Aula de 60s
**Arquivos:** `src/routes/study.tsx` · `src/components/lessons/FeedbackBar.tsx` → **renomear** para `src/components/lessons/FeedbackSheet.tsx` (e atualizar o import em `LessonPlayer.tsx` já nesta fase — única mudança nele aqui) · `src/components/lessons/CelebracaoAula.tsx` **(novo)**.
**Passos:**
1. `FeedbackSheet.tsx`: props `{ correct, title, explanation, children? (conteúdo colapsável "Ver resolução"), isLast, onContinue, onAskTutor?, xp? }`; layout §7.9; `sheet` + `sticky bottom-0 -mx-5`; título vem de `fala(correct ? "acertou" : "errou")`; Foca 40 (`orgulhosa` / `neutra`) à esquerda do título; no `onContinue`, se `xp`, renderiza `XpChip animate` por 700ms antes de chamar `onContinue` (guardar timeout; reduced-motion → imediato).
2. `CelebracaoAula.tsx`: props `{ acertos, total, segundos?, xpGanho, estrelas?, streakMudou, metaFechada, nivelSubiu, notas?: string[], primario: { label, to }, secundario?: { label, onClick | to } }`; Foca 120 por desempenho (`empolgada` se 100% ou marco, `orgulhosa` ≥ 70%, `neutra` abaixo) `anim-float-in`; H1 `fala("fimbom" | "fimruim")`; tiles em cascata (`StatTile` com `animationDelay` 0/130/260ms); `XpChip`; linha de streak (mono) com `anim-bump` se mudou; passo "Nível N" com `mark-texto` se subiu; `notas` em `card-soft`; botões. Sons: `sfx.playRecompensa([...])` (fim + streak/marco/nível conforme flags) e `haptics.vibrar("fim" | "marco")` no `useEffect` de montagem.
3. `study.tsx`: §13.6 literal. `submit()` passa a chamar `registrarResposta(q, correct)` (Fase 6) e `sfx.play(correct ? (sequência ≥ 3 ? "acerto3" : "acerto") : "erro")` + `haptics.vibrar(correct ? "acerto" : "erro")`; manter `askTutorAutomatically` no erro exatamente como está; `ResultBlock` some — conteúdo vai para `children` da `FeedbackSheet`; `LessonDone` some — `CelebracaoAula` com `primario: { label: "Fechar por hoje", to: "/dashboard" }`, `secundario: { label: "Ver meu progresso", to: "/progress" }`; `Tile` some; botão de mudo no header alterna `prefs.sound` via `setPrefs`.
**Aceite:** Golden Path passo 3 (`08` §7): errar de propósito → shake curto, folha vermelha, balão abre sozinho; acertar → som + folha verde; "+15 XP" aparece ao continuar; celebração com Foca e tiles; CTA primário leva ao dashboard; sem azul decorativo dentro da folha; `study.tsx` sem hex e sem `bg-abismo`.
**Riscos:** `askTutorAutomatically` abre o balão **sobre** a folha de feedback — z-index: balão `z-50`, folha `z-30`; ok, mas testar que fechar o balão devolve a folha.

### Fase 10 — Redação
**Arquivos:** `src/routes/redacao.index.tsx` · `src/routes/redacao.$licaoId.tsx` · `src/components/lessons/LessonPlayer.tsx` · `src/components/lessons/exercises/{FillBlank,FindError,Interpret,MatchPairs,MultipleChoice,Reorder,TrueFalse}.tsx`.
**Passos:** §13.7–13.8. `LessonPlayer`: resultado → `CelebracaoAula` (`estrelas`, `notas: wrongNotes`, primário "Voltar à trilha", secundário "Refazer lição"); confirmação → `BottomSheet` com `foca={{ expression: "desapontada", size: 56 }}`; sons/háptico em `verify()`; `bg-white` → `bg-neve`. Exercícios: só classes (nenhuma mudança de props/lógica); todos os `rounded-xl` de cartão de texto → `rounded-xl` (20 — já é o card) e `border-2`; `TrueFalse` botões `min-h-[64px]`; `Reorder` área tracejada `border-dashed border-gelo` e blocos `chip`. `redacao.$licaoId.tsx` "não encontrada" → `EmptyState` + `btn-primary`. `redacao.index.tsx` "Lição desbloqueada": ao montar, comparar `Object.keys(progress.lessons).length` com `sessionStorage["foca.licoes.n"]`; se cresceu, o primeiro nó não concluído recebe `anim-pop-in` e `sfx.play("desbloqueio")`.
**Aceite:** uma lição completa de ponta a ponta com os 7 tipos (usar lições diferentes); estrelas em `recompensa`; nada coral/navy; `grep -n "bg-abismo\|text-white" <arquivos>` vazio.

### Fase 11 — Demais telas
**Arquivos:** `src/routes/progress.tsx` · `ranking.tsx` · `plan.tsx` · `flashcards.tsx` · `profile.tsx` · `premium.tsx` · `topics.tsx` · `video.$id.tsx` · `offline.tsx` · `src/routes/__root.tsx` (404/erro).
**Passos:** §13.9–13.16, §13.18, §13.20 literais. `flashcards.tsx`: `grade()` chama `registrarRevisaoFlashcard()` além do que já faz; cores Tailwind removidas. `plan.tsx`: `[1,3,5]` (**D7**); calendário via `activityDays` (segunda a domingo da semana corrente, `hojeISO`). `profile.tsx`: toggles Som/Vibração/Tema (`setPrefs`); ao mudar tema, aplicar/remover `.dark` em `document.documentElement` na hora. `progress.tsx`: remover `PALETTE`/`FAIXAS` com cor; faixas por rótulo (§13.9). `__root.tsx`: `NotFoundComponent`/`ErrorComponent` em pt-BR com Foca entediada e utilities.
**Aceite:** `grep -rnE "\b(bg|text|border|from|via|to)-(red|green|blue|amber|emerald|yellow)-[0-9]+" src --include=*.tsx | grep -v components/ui` vazio; `grep -rn "PALETTE" src/routes` vazio; toggles persistem após reload; calendário reflete `activityDays`.

### Fase 12 — Dark mode, acessibilidade, auditoria e docs
**Arquivos:** `src/styles.css` (remoção de aliases) · `CLAUDE.md` · `docs/09-branding.md` · `docs/00-README.md` · `docs/16-gamificacao-e-dopamina.md` (status) · este arquivo (status).
**Passos:**
1. Remover `--color-coral` e `--color-coral-claro`? `coral-claro` fica (papel "accent claro", §6.1). Remover **só** `--color-coral` e substituir os usos restantes (`grep -rn "coral\b" src`) por `mar` (ação) ou `recompensa` (XP/streak) conforme o contexto. Esperado: zero após as fases 7–11.
2. Dark mode (**D4**): percorrer as 17 rotas com `.dark`; corrigir só via tokens/classes (nunca hex); conferir a `FocaMark` line variants (`line-light` em dark, `line-dark` em claro — onde ainda usadas como marca d'água; se nenhuma sobrou, ok).
3. Acessibilidade: tab por `/study` e `/quiz` inteiros com foco visível; leitor de tela (VoiceOver/NVDA) anuncia "Acertou"/"Errou" (`role="status"`) e "+15 XP" (`aria-live`); todos os `<img>` de conteúdo com `alt`; zoom 200% sem quebra horizontal; `prefers-reduced-motion` ativo → app funcional sem animações e com XP visível.
4. Auditoria (todas devem retornar vazio, salvo exceções):
   - `grep -rnE "#[0-9a-fA-F]{3,8}\b" src --include=*.tsx --include=*.ts | grep -v routeTree.gen | grep -v components/ui` → só `brand.ts`, `error-page.ts`.
   - `grep -rn "bg-white\|text-white" src --include=*.tsx | grep -v components/ui` → só `text-white` sobre `bg-mar`/`bg-abismo`/`bg-success`/`bg-error` (botões, marcadores, balão do usuário).
   - `grep -rn "bg-abismo" src --include=*.tsx | grep -v components/ui` → só `btn-abismo` interno e marcadores pequenos.
   - `grep -rnE "rounded-\[" src --include=*.tsx | grep -v components/ui` → vazio.
   - `grep -rn "coral\b" src` → vazio.
   - `grep -rnE "🔥|📷|rs\b" src --include=*.tsx` → vazio.
   - `grep -rn "text-\[1[01]px\]\|text-\[10px\]" src --include=*.tsx | grep -v components/ui` → vazio.
   - `grep -rn "FocaMark" src --include=*.tsx | grep -E "size=\{1[0-9]\}"` → vazio (nada abaixo de 28).
   - `grep -rn "sonner\|toast(" src/routes src/components/*.tsx` → vazio.
5. Técnico: lint/tsc/build sem erros novos vs. baseline; `bun run dev` 17 rotas sem erro de console; apagar `docs/_tmp-baseline-*.txt`.
6. Docs: `CLAUDE.md` seção "Design system" → paleta Rabisco (grafite/papel/caneta/marca-texto), raio 16/20/28, "elevação por borda", ponteiro para `docs/18`; `docs/09-branding.md` topo → aviso "Paleta Ártica substituída pela Rabisco na Margem em <data> — ver `brand/foca-rabisco-branding.md` e `18`"; `docs/00-README.md` tabela += linha do `18` e nota na seção de rebranding; `docs/16` status → "implementado (som, háptico, streak freeze, meta, nível) em <data>"; este arquivo status → 🟢 executado.

**Aceite:** checklist da §17 inteira marcada com evidência.

---

## 16. Ordem, dependências e estimativa

```
F0 baseline
 └─ F1 tokens ──────────────┐
     ├─ F2 componentes ─────┼─ F4 shell/nav
     │    └─ F3 mascote/voz ┤
     ├─ F5 sensorial (independente de F2–F4)
     └─ F6 store (independente de F2–F5)
          └─ F7 entrada ─ F8 dashboard ─ F9 aula ─ F10 redação ─ F11 demais ─ F12 QA/docs
```

- F1 é a única fase que muda "tudo de uma vez" — o app fica visualmente inconsistente entre F1 e F7 (heros grafite). Aceitável na branch; **não fazer deploy entre F1 e F11**.
- F5 e F6 podem ser feitas em paralelo a F2–F4 por outro executor, desde que ninguém toque em `styles.css` fora de F1/F2/F12.
- Golden Path (`08` §7) fica completo ao fim de **F9** (quiz → aha → aula com erro → celebração); F10 fecha o pilar 2; F11/F12 acabamento.
- Ordem de sacrifício se faltar tempo: F11 parcial (progress e profile primeiro; premium/video/offline por último) → dark mode QA (D4) → som (F5, pode virar toggle desligado por padrão).

Estimativa grosseira para um executor de IA supervisionado: F0–F2 meio dia · F3–F6 um dia · F7–F9 um dia · F10–F11 um dia · F12 meio dia.

---

## 17. Checklist final de validação (marcar só com evidência)

**Identidade**
- [ ] Tokens de `docs/brand/foca-rabisco-tokens.css` em `styles.css` (claro e `.dark`), mais `recompensa`, `cards`, `success-texto`; nenhum hex fora de `brand.ts`/`error-page.ts`.
- [ ] Nenhuma tela com fundo de bloco em grafite; papel em todas as páginas; cartões com borda 2px e sem sombra.
- [ ] Azul só em CTA, seleção, progresso, nav ativo, foco, balão do usuário. Nenhum ícone ilustrativo azul.
- [ ] XP/streak/marco em marca-texto com texto grafite (ou no plano B da D1, azul) — nunca amarelo como texto sobre branco.
- [ ] Verde/vermelho só em feedback de resposta (e erro de formulário). Ranking, flashcards, offline sem eles.
- [ ] Raios: botão 16, card 20, folha 28, pílulas; nenhum `rounded-[Npx]`.
- [ ] Space Mono nos números; enunciados em Plus Jakarta 17/26; nada abaixo de 12px.
- [ ] Sem emoji na UI; sem "rs".

**Mascote**
- [ ] `FocaMark` com 8 expressões (arte interina documentada) e movimentos sem rotação.
- [ ] Foca ausente do header e durante a questão; presente em aha, feedback, celebração, retorno, vazios, 404.
- [ ] Slot de retorno só com falas acolhedoras.

**Gamificação e honestidade**
- [ ] Meta diária reseta por dia; missões refletem hoje; calendário reflete `activityDays`; recorde e congelamento funcionam; nível derivado de XP; valores de XP inalterados.
- [ ] Celebração termina com CTA de sair; sem "mais uma" como primário.

**Sensorial e acessibilidade**
- [ ] 9 eventos sonoros, fila, hierarquia, mudo persistente; háptico com toggle próprio; nada antes do primeiro gesto.
- [ ] Botões descem ao pressionar; folha de feedback em ≤ 300ms; shake 180ms.
- [ ] Foco visível; `role`/`aria` em barras, anel, folha, XP; contraste ≥ 4.5 em texto; `prefers-reduced-motion` respeitado; `lang="pt-BR"`.
- [ ] Toques ≥ 44px; CTA na zona do polegar; teclado não cobre o rodapé em `/quiz` e no chat.
- [ ] Dark mode percorrido nas 17 rotas sem texto ilegível.

**Preservação**
- [ ] Quiz → aha → dashboard → aula → balão abre no erro → celebração → redação → progresso: tudo funciona; estado antigo (`foca.state.v3`) carrega sem perder XP/streak; `shadcn/ui`, `src/data`, `src/content`, `tutor-core.ts`, `tutor.ts` intocados.
- [ ] `bun run lint`, `bunx tsc --noEmit`, `bun run build` sem erros novos; 17 rotas sem erro de console.
- [ ] `CLAUDE.md`, `docs/00`, `docs/09`, `docs/16`, `docs/18` atualizados.

---

## Apêndice A — Inventário de arquivos por fase

| Fase | Existentes (editar) | Novos (criar) | Remover |
|---|---|---|---|
| 1 | `styles.css`, `lib/brand.ts`, `lib/error-page.ts`, `routes/__root.tsx`, (todas as telas via script) | `scripts/rename-superficies-rabisco.mjs` (temporário) | o script ao fim |
| 2 | `styles.css`, `lessons/exercises/shared.ts` | `components/ds/{ProgressBar,GoalRing,BottomSheet,EmptyState,StatTile,XpChip}.tsx` | — |
| 3 | `brand/FocaMark.tsx`, `scripts/gerar-logos-foca.ps1`, `assets/branding/foca/README.md`, `ds/EmptyState.tsx` | `brand/FocaSays.tsx`, `lib/voz.ts`, `public/branding/foca/expressoes/*.png` | — |
| 4 | `AppShell.tsx`, `TutorBubble.tsx` | — | — |
| 5 | — | `lib/sfx.ts`, `lib/haptics.ts` | — |
| 6 | `lib/store.ts` | — | — |
| 7 | `routes/{index,welcome,quiz,aha,login,forgot}.tsx` | — | — |
| 8 | `routes/dashboard.tsx` | — | — |
| 9 | `routes/study.tsx`, `lessons/LessonPlayer.tsx` (import) | `lessons/FeedbackSheet.tsx` (rename de `FeedbackBar.tsx`), `lessons/CelebracaoAula.tsx` | `lessons/FeedbackBar.tsx` |
| 10 | `routes/redacao.index.tsx`, `routes/redacao.$licaoId.tsx`, `lessons/LessonPlayer.tsx`, `lessons/exercises/*.tsx` | — | — |
| 11 | `routes/{progress,ranking,plan,flashcards,profile,premium,topics,video.$id,offline,__root}.tsx` | — | — |
| 12 | `styles.css`, `CLAUDE.md`, `docs/{00,09,16,18}` | — | `docs/_tmp-baseline-*.txt` |

## Apêndice B — Biblioteca de falas por slot (`src/lib/voz.ts`)

Todas passaram pelo teste da `15` §8. Origem: `15` §7, mais as novas marcadas ★. **O executor usa estas; não inventa.**

| Slot | Expressão | Frases |
|---|---|---|
| `bomdia` | neutra | "Acordei antes de você. De novo." ★ · "60 segundos. Depois você volta pro feed." ★ · "Tô na pedra. Bora." ★ |
| `retorno` | acolhedora | "Desfocou uns dias. Acontece comigo direto. Bora de 60 segundos." · "Voltou. Não vou perguntar onde você tava." · "Sem sermão. Só 60 segundos." |
| `meta` | orgulhosa | "Meta fechada. Pode ir." ★ · "Feito. Eu volto pra minha pedra." ★ · "Hoje tá pago." ★ |
| `aha` | surpresa | "Já te entendi. Assustadoramente rápido." · "Três lacunas. Achei em 40 segundos. Imagina em um mês." |
| `acertou` | orgulhosa | "Certa. Anotei aqui na pedra." · "Tá vendo? Não era tão difícil." · "Boa. Não se acostuma." · "Uma. Faltam só todas as outras." |
| `errou` | neutra | "Errou. Respira, é pra isso que eu tô aqui." · "Essa aí pega muita gente. Inclusive você, agora." · "Errar é o app funcionando. Sério." · "Anotado. Vou te cobrar essa de novo semana que vem." |
| `fimbom` | orgulhosa/empolgada | "60 segundos. Foi isso que você achava que não tinha." · "Aula fechada. Pode voltar pro feed, eu fico aqui." |
| `fimruim` | neutra | "Foi mal hoje. Mas você apareceu, que é o que conta." · "Placar feio. Amanhã a gente arruma." |
| `marco` | empolgada | "7 dias. Eu não focaria 7 dias seguidos nem por peixe." · "30 dias. Sinceramente, não esperava." · "100 dias. Vou precisar de uma pedra maior." ★ |
| `nivel` | empolgada | "Subiu de nível. Eu continuo no mesmo, deitada." ★ |
| `vazio` | entediada | "Nada aqui ainda. Igual à minha agenda." · "Vazio. Que nem sua sequência de ontem." · "Ainda não rabiscaram esta página." ★ |
| `404` | entediada | "Essa página não existe. Eu também quase não existo, tô só deitada." ★ · "Aqui não tem nada. Volta pro caderno." ★ |
| `sair` | desapontada | (sem fala — o título do `BottomSheet` "Sair da lição?" basta) |

Títulos fixos de UI (não sorteados): folha de acerto usa `acertou`; folha de erro usa `errou`; celebração usa `fimbom` (≥ 70%) / `fimruim`; a linha de streak na celebração é factual em mono ("12 dias seguidos"), sem fala.

## Apêndice C — Registro de decisões desta versão

- 20/09/2026 — Plano escrito sobre o código pós-`17`. Recomendações que **divergem do brief** e estão isoladas para reversão barata: D1 (marca-texto para recompensa, em vez de accent único), D3 (som sintetizado em vez de assets), D6 (nenhum hero escuro). Divergência de produto encontrada e **não corrigida** (fora de escopo): quiz sem questões de conteúdo (`quiz.tsx:44`).
