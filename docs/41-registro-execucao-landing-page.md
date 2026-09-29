# 41 — Registro de execução da landing page de marketing

> **Integração (29/09/2026):** a landing saiu de `landing/` e virou a rota `/` do app (`src/marketing/`); o isolamento descrito aqui foi revogado pelo proprietário. Estado atual: [`45`](45-registro-execucao-integracao.md).
>
> **Atualização 29/09/2026:** a página passou pela segunda direção criativa ([42](42-plano-landing-v2-direcao-criativa.md), registro [43](43-registro-execucao-landing-v2.md)). Seções, copy, movimento e números do topo deste registro descrevem a **v1**; o estado atual está no 43. A base técnica (isolamento, pré-render, CSP, eventos locais, deploy) continua a daqui.

**Spec:** [40-plano-landing-page-marketing.md](40-plano-landing-page-marketing.md) (aprovado pelo usuário em 28/09/2026). **Executor:** Sonnet 5.5. **Status da feature:** `LANDING PAGE: IMPLEMENTED / ISOLATED / NOT PUBLISHED` (F0 a F17 concluídas em 28 e 29/09/2026) · `INTEGRAÇÃO COM O APP: BLOCKED UNTIL EXPLICIT USER REQUEST`.

Este registro diz o que de fato aconteceu por fase. Regra de leitura: código e testes vencem este texto.

---

## 1. Estado inicial (F0, 28/09/2026)

- Branch `main`, HEAD `76a7b70`, ≈334 entradas não commitadas no `git status` **fora** de `landing/` (trabalho paralelo de outras sessões: `src/styles.css`, `brand.ts`, `FocaMark`, PNGs da marca, docs). Snapshot salvo no scratchpad (`git-snapshot-F0.txt`) para comparar a cada fase.
- `landing/` não existia. `docs/41` não existia.
- Conferência da §2 do `40`:
  - A-1 (`vite.config.ts` usa `@lovable.dev/vite-tanstack-config`): confere → a landing usa Vite puro.
  - A-2 (não é monorepo): confere; `bunfig.toml` tem `minimumReleaseAge = 86400` com exceções só para `@lovable.dev/*`.
  - A-3 (arquivos da marca em mudança paralela): confere → snapshot + cópia, sem import.
  - A-7 (8 expressões da Foca sem arte final): `public/branding/foca/expressoes/` tem os 8 pares 96/320.
  - Versões do app (referência para a landing): react/react-dom `^19.2.0`, vite `^8.0.16`, tailwindcss e `@tailwindcss/vite` `^4.2.1`, `@vitejs/plugin-react` `^5.2.0`, lucide-react `^0.575.0`, typescript `^5.8.3`, `@playwright/test` `^1.63.0`. bun 1.4.2 e node 24.11.1 na máquina.
- Nenhuma diferença relevante em relação à §2 do `40`.

## 2. Restrições que vou seguir (F1)

_Lidos na F1 (28/09/2026): `40` inteiro, `COPY.md`, `copy/06`, `copy/02` §4–§5, e o restante do Context Pack pelo que o `40` já destila (`copy/01`, `PRODUCT`, `DESIGN`, `14`, `16`, `18`, guia de marca). Restrições, nas minhas palavras:_

1. Só afirmo o que está na lista fechada F-1…F-18 (`40` §9.4); cada string em `copy.ts` mapeia para um F-x.
2. Nada de número de alunos, depoimento, nota, aprovação, %, preço, plano pago, duração em segundos/minutos, "grátis para sempre". O único número permitido é "4 a 8" questões (e o congelamento "a cada 7 dias, até 2").
3. Nada de "Não é X. É Y.", motivação genérica, "jornada", "domina", "Mastery", emoji em título/CTA, exclamação em série, travessão (— e –) em qualquer texto visível, alt e aria da landing.
4. Voz: colega de estudo atento e direto; imperativo informal no corpo, infinitivo em botão; glossário (trilha, lição, atividade, revisão, checagem, nivelamento, faixa, sequência, Foca). Humor só uma vez, na Foca da pedra, no fechamento.
5. Sem concorrentes citados por nome, sem comparação humilhante, sem ranking (é mock).
6. Cor: só tokens do app. Azul-caneta só em CTA, foco, seleção e progresso real; marca-texto só na palavra-chave do H1/H2 de fechamento e no chip de sequência; verde/vermelho só no feedback da demo; grafite nunca como fundo grande.
7. Foca só em cor neutra e contorno (sem expressões, sem arte final); nunca no cabeçalho como mascote falante nem esticada/rotacionada.
8. Produto só por retratos reais e pela demo real; telas proibidas: welcome, splash, qualquer "Checkpoint"/"60 segundos", ranking, premium, offline.
9. Conteúdo pedagógico (item da demo) é copiado literal; nenhuma skill de copy toca nele.
10. Movimento: só o que está no mapa M-1…M-13; sem pin/snap/parallax/loop/scroll listener; conteúdo visível sem JS e com reduced motion.
11. Sem terceiros: sem Google Fonts, analytics, cookies; eventos só locais.
12. Escopo de escrita: só `landing/**`, `docs/41` e os ponteiros da F17. Nada em `src/`, `public/`, `tests/`, `scripts/`, config da raiz. Sem `bun install`/`bun run build` na raiz. Sem git.
13. `better-writing` e `frontend-design` não rodam; marketing/GSAP lidos do cache, sem ligar plugins.
14. Publicar/integrar/commitar: não. Integração só com o pedido explícito do usuário.

## 3. Fases

### F0 e F1: concluídas (28/09/2026)

Registro criado, snapshot salvo, baseline conferida (§1), restrições listadas (§2). Um incidente sem efeito: um comando de shell com crases no texto rodou substituições vazias (nenhum arquivo criado ou alterado; `git status` fora de `landing/` idêntico ao snapshot). O texto foi refeito com a ferramenta Edit.

### F2: contexto de marketing (concluída)

Skill `product-marketing` lida do cache (`marketingskills/marketing-skills/2.11.1`). O contexto **já existe** em `.agents/product-marketing.md` (v1, 22/09/2026) e lá diz para ler `docs/PRODUCT.md` primeiro; **não foi reescrito** (fora do escopo de escrita).

- **Existe e vale para a landing:** categoria (app de estudo para ENEM, mobile-first), B2C freemium/low ticket, persona João, JTBD, concorrência (MEC Enem grátis, cursinho/videoaula, banco de questões, ChatGPT; Duolingo só referência interna), objeções do `14` §7, anti-persona (quem quer mais conteúdo).
- **Não existe (a skill pediria; o Foca não tem):** prova social, métricas de cliente, depoimentos, falas verbatim de aluno (nenhuma foi coletada), preço, comprador secundário (pais/escola), meta numérica de conversão. Ficam como "não aplicável: regra do Foca".
- **Sugestões da skill descartadas por regra do projeto:** depoimentos, garantia, urgência, contador, "resultados" numéricos, comparação nominal com concorrentes.
- Nenhuma afirmação deste contexto contradiz a lista F-1…F-18 (`40` §9.4).

### F3: plataforma de copy e H1 (concluída)

Skill `ogilvy-copywriting` aplicada com os overrides do `SKILLS.md` (sem depoimento, sem texto longo; "quanto mais você conta, mais vende" vale só para fatos verificáveis do produto).

**Perguntas da skill sobre a §9.1 do `40`:**

| # | Pergunta | Resposta (mantém a §9.1) |
|---|---|---|
| 1 | Posicionamento (o que faz, para quem) | App de preparação para o ENEM que escolhe a ordem do estudo, para quem estuda no intervalo. Segmentação psicológica: quem já tem material e trava em decidir por onde começar e em recomeçar |
| 2 | Promessa única | "O próximo passo já está escolhido." Benefício (não recurso), competitivo (material qualquer app tem; a decisão tomada com o motivo à vista, não), e o produto entrega (`COPY.jornada.motivos`, `32` F12) |
| 3 | Grande ideia | Recomeçar custa quase nada porque a decisão já vem tomada. Simples, sustenta hero, cena, recomeço e fechamento |
| 4 | Leitor | João, 16 a 19, celular, tempo picado, cético com apps, sem dinheiro sobrando (`14`) |
| 6 | Prova | O próprio produto: retratos reais, demo jogável, fatos F-x. **Sem** depoimento, número ou "antes e depois" (não existem) |

Sobre o H1 (marca + promessa + novidade + público): a marca está no logo, no subtítulo ("O Foca") e no título da aba; o público e a categoria estão no eyebrow "Preparação para o ENEM" logo acima; a novidade é "você não precisa decidir". Nenhuma negação no H1 (a skill alerta contra).

**Teste "poderia ser qualquer SaaS?" (§26.4 do `40`)**

| Candidato | Só o H1 | H1 + eyebrow + subtítulo | Decisão |
|---|---|---|---|
| A: "Você abre. O próximo passo já está escolhido." | Fraco isolado: um app de tarefas poderia dizer. | Passa: o eyebrow ancora em ENEM e o subtítulo cita acerto e erro, atividade e motivo | **Mantido** (não falhou em teste objetivo quando lido como bloco, que é como o hero é lido) |
| B: "Para quem estuda no intervalo: o Foca escolhe a próxima atividade e mostra por quê." | Passa sozinho (público, marca, mecanismo) | Passa | Reserva. Tem 14 palavras e quebraria em 5 linhas no mobile a 40px |
| C: "Chega de decidir por onde começar. O Foca escolhe o próximo passo." | Passa | Passa | Reserva. Abre com negação ("chega de"), que a skill desaconselha |

Teste do João: A passa (é o alívio, sem ambição). Reforço de especificidade compensado no subtítulo, não no H1.

**Subtítulo (limite 22 palavras): duas versões, escolhida a B.**

- A (do `40`, 21 palavras): "O Foca acompanha o que você acerta e erra e escolhe o que estudar agora. Atividades curtas, que cabem no intervalo." Repete a ideia do H1 ("escolhe").
- **B (escolhida, 21 palavras):** "O Foca acompanha o que você acerta e erra, escolhe a atividade de agora e mostra o motivo. Cabe no intervalo." Acrescenta o fato novo que o retrato prova ("mostra o motivo"), que é o que a Ogilvy pede (fato, não repetição).

**Copy v1** (base do `landing/src/content/copy.ts`; texto igual ao `40` §9.3 salvo a linha do subtítulo acima). Cada string mapeia para pelo menos um F-x da §9.4:

| Seção | Strings | F-x |
|---|---|---|
| Nav | Como funciona · Dúvidas · Entrar · Começar agora | F-4 (CTA leva ao `/quiz` sem conta) |
| S-1 Hero | Eyebrow "Preparação para o ENEM"; H1 A; subtítulo B; "Começar agora"; "Sem e-mail e sem senha. Começar não custa nada."; anotação "o motivo vem junto" | F-1, F-2, F-4, F-5 (D-LP-1) |
| S-2 A cena | H2, dias (Dom…Qui) e anotações, corpo, ponte "O Foca tira essas duas decisões da sua frente." | F-1 (a ponte é a promessa); o resto é narrativa sem afirmação de produto |
| S-3 Como funciona | 5 passos (títulos e corpos) | 1: F-4 · 2: F-6, F-7, F-12 · 3: F-1, F-3 · 4: F-7, F-8 · 5: F-11, F-12 |
| S-4 Tenta uma | "Tenta uma."; "Uma questão de verdade, do jeito que ela aparece no app."; rótulos Não sei / Verificar / Ver resolução; "No app, essa resposta já entra na conta do que você sabe e muda o que vem depois." | F-7, F-8, F-1 (a última precisa ser verdadeira: o app registra a resposta no ledger; conferir na F9) |
| S-5 Recomeço | H2 "Parou uns dias? Continua de onde estava."; corpo do congelamento | F-13, F-14 |
| S-6 O que você já tem | H2 e duas colunas | F-1, F-11 |
| S-7 A Foca | H2; corpo (foto: F-10 sujeito a V-1); 3 linhas "não faz" | F-9, F-10, F-16 |
| S-8 Dúvidas | 8 perguntas e respostas | F-4, F-5, F-15, F-3, F-6/F-12, F-17, F-18 |
| S-9 Fechamento | H2, "Falta só você abrir.", CTA, microcopy, fala da Foca da pedra | F-1, F-5; a fala é humor decorativo (única) |
| Rodapé | "O Foca não tem vínculo com o INEP nem com o MEC." · © 2026 Foca | F-18 |

Pontos para checar depois (não bloqueiam): (a) frase pós-resposta da S-4 ("entra na conta do que você sabe e muda o que vem depois") só fica se a F9 confirmar no código que a resposta alimenta o motor; caso contrário reduzir para "No app, essa resposta entra na conta do que você sabe"; (b) `copy/06` §3 diz "dá para fazer uma atividade no intervalo" e proíbe duração; nenhuma string da landing traz minutos.

### F4: scaffold isolado (concluída)

`landing/` criado com `package.json` próprio (`foca-landing`), `bun.lock`, `bunfig.toml` (cópia sem as exceções do Lovable), `tsconfig.json`, `vite.config.ts` (Vite puro, portas 4321/4322, `assetsDir: "lp-assets"`), `index.html` (marcadores de head e corpo, script inline só do `lp-motion`), `src/{main,entry-server,Landing,config}`, `src/lib/app-url.ts`, `scripts/{prerender,check-isolation}.ts`, testes `isolation` e `app-url`, `.gitignore`, `.env.example`, `README.md` (regra de isolamento no topo).

- Versões instaladas: react/react-dom 19.3.0, vite 8.3.1, tailwindcss e @tailwindcss/vite 4.3.3, @vitejs/plugin-react 5.2.0, typescript 5.9.3, gsap 3.15.0, @gsap/react 2.1.2, lucide-react 0.575.0, fontsource (space-grotesk-variable 5.3.0, plus-jakarta-sans-variable 5.3.0, space-mono 5.3.0, caveat 5.3.0), @playwright/test 1.63.0, @axe-core/playwright 4.13.0, sharp 0.35.5, @types/react e react-dom 19.3.0, @types/node 26.6.3, @types/bun 1.4.2.
- `bun install` só rodou dentro de `landing/`. A raiz não foi tocada.
- Evidência: `bun run typecheck` sem erro; `bun test tests/unit` 7 pass / 0 fail; `bun run check:isolation` OK; `bun run build` gera `dist/index.html` com o `<h1>` já no HTML (pré-render) e `<meta name="robots" content="noindex, nofollow">`. `git status` fora de `landing/` idêntico ao snapshot da F0.
- **Alerta de orçamento:** o JS inicial só com React + hidratação já mede **68,9 kB gz** (220 kB min) e o limite da §16 é 75 kB para a página inteira. Reavalio na F14; se a página não couber, registro a divergência com o número real em vez de trocar de framework.

### F5: tokens, utilities, fontes e base (concluída)

- `scripts/sync-tokens.ts` lê `../src/styles.css` (só leitura) e gera `src/styles/tokens.css` (`@theme inline`, `:root` sem as variáveis de layout do app, `.dark`, e o espelho `@media (prefers-color-scheme: dark)`) e `src/styles/utilities.css` (14 `@utility` + 5 `@keyframes` + o bloco `prefers-reduced-motion`). Cabeçalho com data e sha1 do app (`19ed804bb4`). `bun run check:tokens` compara e só avisa.
- `marketing-tokens.css` (escala tipográfica `lp-display-xl … lp-hand`, container, `lp-pauta`, `--lp-*`), `motion.css` (tokens de movimento, `[data-reveal]` só sob `html.lp-motion`), `fonts.css` (4 `@font-face` locais em `/lp/fonts/*.woff2`, copiados de fontsource por `sync:fonts`), `base.css`.
- Verificação visual (página temporária `?tokens`, em dev): cores idênticas ao app em claro e escuro; Space Grotesk 300–700, Plus Jakarta Sans 200–800, Space Mono 700 e Caveat 600 carregadas; **zero requisições fora de localhost**.
- **Achado para a F8:** no escuro o `--abismo` vira claro; o texto sobre o marca-texto (fundo âmbar) herdaria essa cor e reprovaria contraste. O `HighlightStroke` e o chip de sequência precisam usar `color: var(--on-alert)` (tinta escura no escuro), como o app faz nos preenchimentos.
- Testes: `token-drift.test.ts` (sem hex no `@theme`, par `.dark` para toda cor, espelho de mídia presente, deriva só avisa). Total 11 testes passando; typecheck, `check:isolation` e build OK.

### F6: assets (concluída)

- `sync:brand` copiou 9 PNGs da Foca para `public/lp/brand/` com hashes em `HASHES.json`. Conferido a olho: `foca-color-320.png` é a cabeça da Foca (foca cinza, língua vermelha), a mesma do app. `line-light` é traço branco (para fundo escuro); `line-dark` é para o papel. As expressões continuam sem arte final (todas iguais à neutra).
- **App usado para captura:** `bunx vite dev` na raiz (sem o `predev`, que regeneraria `public/content`), porta 8080, sem `.env` na raiz, ou seja, **sem `OPENAI_API_KEY`: o tutor respondeu pelo `localFallback`**. Nada no repo foi alterado por isso. O dev server recarregava a página quando outra sessão editava `src/`, então cada retrato tem até 3 tentativas.
- **Estado semeado** só com o que o app grava (usuário onboarded + atividades planejadas com o formato do motor); as respostas certas/erradas vêm dos pacotes de conteúdo servidos pelo app (`/content/v1/*`). O nivelamento foi executado de verdade pela interface (47 passos, respostas pseudo-aleatórias com semente 7000); repetido até o resultado mostrar variedade de faixas.
- **Retratos gerados (7 × claro/escuro × 360/720 px × AVIF/WebP = 56 arquivos, 1,2 MB no total):**

| ID | Tela real | Recorte (css px) | Onde entra |
|---|---|---|---|
| `hero-atividade` | Abertura de atividade `reforco`, motivo `reforco-erros` ("Essa travou duas vezes. Vamos por partes, com calma."), sem minutos | 390×380 | S-1 |
| `quiz-prova` | `/quiz` no passo "Qual prova você está estudando pra fazer?" com ENEM marcado | 390×432 | S-3 passo 1 |
| `nivelamento-resultado` | Resultado do nivelamento: "Pronto. Sua trilha foi ajustada.", 4 áreas com faixa (2 "No caminho", 2 "Base em construção"), "Poucas questões. Vamos confirmar estudando." | 390×868 | S-3 passo 2 |
| `atividade-consolidar` | Abertura de atividade `pratica`, motivo `consolidar` ("Você foi bem nesse assunto. Antes de avançar, mais umas questões pra firmar.") | 390×380 | S-3 passo 3 |
| `feedback-explicar` | Questão errada com feedback: "Marquei aqui. Bora ver onde travou.", explicação, "Explicar melhor" e "Continuar" | 390×745 | S-3 passo 4 |
| `atividade-motivo` | Abertura de atividade `revisao`, motivo `revisao-atrasada` ("Já faz um tempo que você não revisa isso. Vamos recuperar antes que esfrie.") | 390×380 | S-3 passo 5 |
| `tutor-balao` | Balão da Foca aberto por "Explicar melhor", resposta do fallback local, com botão de foto | 390×844 | S-7 |

- **Divergência do `40` §14.2 (registrada em §5):** `faixas-progresso` foi **descartado**. O `/progress` ainda mostra "Domínio por matéria", "Dominado", "Lacuna", "Quase lá" e `%`, fora do glossário e do tom (a migração é o `36` Fase 10), e nem depois do nivelamento ele mostra faixas por habilidade (só "ainda medindo"). Em troca entrou `atividade-consolidar` (passo 3). As faixas aparecem no passo 2, pelo retrato do resultado do nivelamento, que é a tela que de fato as mostra. O passo 5 passa a mostrar a revisão voltando (`atividade-motivo`), e o texto dele perde a frase das faixas (ver §5).
- **Telas evitadas:** `/welcome`, `/`, `/trilha` (mostra "Só 60 segundos", "~N min" e "Fazer nivelamento" fora de contexto), `/progress`, ranking, premium. Nenhum retrato contém "Checkpoint", "60 segundos", `%` de resultado, ranking ou nome real (o nome semeado, "Luan", nem aparece nas telas capturadas).
- **Recortes com propósito:** o quiz foi cortado acima do campo de data (o placeholder nativo do Chromium headless sai em inglês, "dd/mm/yyyy", e o aluno não vê isso).
- **Fallback do tutor (R-9/V-1):** o retrato `tutor-balao` mostra a resposta local ("Você marcou A, mas o certo é C. …"), que é o que o aluno recebe hoje em produção enquanto a `OPENAI_API_KEY` não estiver configurada. O texto de S-7 fala em "explica quando você pede" e não afirma que a resposta vem de IA; a frase da foto continua sujeita a V-1.
- Mudança externa observada: `tests/unit/persist-copy.test.ts` (não rastreado) apareceu na raiz durante a F6; não é meu.

### F7: esqueleto (concluída) e F8: seções (concluída)

**Design Read (skill `design-taste-frontend`, §0.B):** *Reading this as: landing de consumo para estudantes de 16 a 19 anos, com a linguagem "caderno rabiscado" do Rabisco na Margem, apoiada nos tokens próprios do Foca sobre Tailwind v4, com movimento contido e motivado.* **Dials:** `DESIGN_VARIANCE 6 · MOTION_INTENSITY 5 · VISUAL_DENSITY 3` (escolhidos no `40` §12.1: público jovem e marca com personalidade pedem assimetria acima do calmo; o `16`/`18` mandam recompensa proporcional, então movimento abaixo do padrão de landing; densidade baixa porque João lê no celular, com pressa).

- **Overrides do Foca sobre a skill (registrados por conflito real, `40` §12.2):** paleta creme `#f6f5f1` é a marca; `lucide-react` (família única do projeto); Space Grotesk/Plus Jakarta/Space Mono/Caveat no lugar de Geist; sem Motion lib; **linha de risco sob o CTA do hero** ("Sem e-mail e sem senha…") fica, apesar de a skill vetar "tagline abaixo do CTA": é parte do CTA (reduz risco, `40` §10), não uma faixa de confiança.
- **Composição:** `Landing.tsx` monta Navbar, Hero, TheScene, HowItWorks, TryOne, Comeback, WhatYouHave, FocaAndHonesty, Faq, Closing, Footer e StickyCta, na ordem da §11. Componentes: CtaButton, FocaMark (local), PhoneFrame, ProductShot, MarginNote, doodles (PencilArrow, PencilCheck, PencilHalfCheck, PencilStrike, HighlightStroke). Todo texto em `content/copy.ts` (incl. `LP.marca`, H1 em `linha1`/`linha2Antes`/`tituloDestaque`); `copy-rules.test.ts` reprova texto literal no JSX.
- **Famílias de layout distintas em seções vizinhas:** split assimétrico (hero), faixa de calendário (cena), texto + celular fixo (como funciona), cartão centrado (demo), calendário com legenda lateral (recomeço), folha de duas colunas (já tem), celular + conversa (Foca), acordeão estreito (dúvidas), folha centrada (fechamento). Eyebrows: 1 (hero) + 2 rótulos de coluna em S-6 = 3 usos de `lp-label` (limite do plano; teste).
- **Verificação visual** (screenshots por seção, 390 e 1280, claro e escuro): hero cabe na dobra com CTA visível (390×844 e 1280×800); H1 em 3 linhas no desktop e no mobile; marca-texto com tinta escura no escuro; sem rolagem horizontal; sticky CTA aparece e some corretamente.
- **Decisões do executor (todas dentro das permissões da §23):**
  1. **H1 em 3 linhas** (não 2, como a skill pede): a frase de promessa tem 45 caracteres; a 64 px (`--lp-display-xl` foi reduzido de 4,75 para 4 rem no teto para caber) quebra em "Você abre." / "O próximo passo" / "já está escolhido.". Reduzir mais tirava a força do H1.
  2. **Pauta como fundo das seções S-4 e S-9** (mesa pautada), com o cartão branco por cima, em vez de pauta *dentro* do cartão: as linhas de 28 px cortavam o texto como um risco. Continua "atrás do cartão da demo e da folha final" (`40` §12.4).
  3. **Notas manuscritas (Caveat): 1 na página** (hero, "o motivo vem junto"), não 5 na semana da cena: o teto do plano era ~3 e a semana ficou legível com o texto normal.
  4. **CTA da demo só aparece depois de responder**: dois botões azuis na mesma tela (Verificar e Começar agora) violariam "um CTA primário por tela"; o CTA entra no instante em que a intenção sobe. Efeito: 4 CTAs no carregamento (navbar, hero, fechamento, barra fixa) e 1 depois de responder.
  5. **`Ver resolução` não aparece na demo**: o item real só tem `explicacao` (sem camada de resolução); "Explicar melhor" não entra porque chamaria a IA. O evento `demo_resolution_open` não foi criado.
  6. **Chip da S-5 diz "sequência mantida"** (sem número): um número no chip seria dado inventado e a semântica do contador com dia congelado não está documentada.
  7. **Layout de S-3:** a base é empilhada (funciona sem JS e com movimento reduzido); só com `html.lp-motion` e ≥ 1024 px vira duas colunas com o celular `position: sticky`. O passo ativo vem de IntersectionObserver em React (faixa de 10% no meio da tela), não de ScrollTrigger: mais robusto e sem GSAP no caminho da leitura. O GSAP fica com o preenchimento contínuo da margem e os gatilhos "uma vez" (F10).
  8. **S-6:** cabeçalhos de coluna usam `lp-label` (contam no teto de 3).
- **Conteúdo da demo (F9):** item `gen:mat:equacao-primeiro-grau:0cd20f16` (matemática, múltipla escolha, não oficial, sem imagem, dificuldade 1, `revisada-humano`), copiado **literal** do pacote do app para `content/demo-item.json` (origem e hash em `demo-item.source.md`). As falas do feedback são as do app (`voz.ts`: "Marquei aqui. Bora ver onde travou." e "Tudo bem. Veja como resolve:"); o "Certa." é o mínimo, para não usar duas falas de humor da pedra. A frase pós-resposta ("entra na conta do que você sabe e ajuda a escolher o que vem depois") foi **conferida no código**: `store.ts` chama `updateSkill` sobre `skillModel` a cada resposta e invalida o plano para replanejar.
- **Testes:** unitários 37 passando (copy-rules 22, isolamento 2, app-url 5, token-drift 4 mais os 4 da F5); E2E `landing.spec.ts` 35 passando nos 5 projetos (estrutura, links, âncoras, sem requisição externa nem erro de console, FAQ por teclado, sem rolagem horizontal, sticky) e `demo.spec.ts` 12 passando (desktop e mobile: estado inicial, certa, errada, "Não sei" neutro, teclado, sem rede). Build: HTML pré-renderizado de 45 kB com 1 `h1`, 8 `h2`, 16 `h3`, 8 `details`, zero travessão.
- **R1 (revisão de arquitetura da informação):** lida só como texto, na ordem, a página conta a história da §8 (reconhece a cena, mostra o mecanismo, deixa tocar, tira o medo do recomeço, respeita o material, dá honestidade, responde as dúvidas, fecha). Nenhuma seção ficou sem pergunta do João.

### F10: movimento (concluída)

Skills: `motion-design` primeiro (validou o mapa M-1…M-13 contra o quadro de durações: 180/320/560 ms nas faixas de feedback, card e transição; stagger de 80 ms com teto de 400 ms; easing de desaceleração na entrada; linear só na barra de progresso da margem; nada excede 1/3 da tela; **sem camada ambiente de propósito**: o plano proíbe loop e a marca pede "tédio produtivo") e depois `gsap-react`, `gsap-scrolltrigger`, `gsap-core` (`matchMedia`) e `gsap-performance`, lidas do cache.

- **Onde cada coisa acontece:** hero em **CSS puro** (M-1…M-5, funciona antes da hidratação e sem GSAP); troca de retrato do "Como funciona" em CSS (`clip-path` 420 ms) com o passo ativo vindo de IntersectionObserver em React; traços de lápis, floco e chip em CSS quando o bloco ganha `.is-in`; **GSAP** só para o que precisa dele: `ScrollTrigger.batch` (M-12, reveal com stagger de 80 ms e no máximo 3 por vez) e o `scrub: 0.3` linear da margem azul (M-7, só ≥ 768 px), tudo dentro de `gsap.matchMedia()` (`prefers-reduced-motion: no-preference`), que reverte sozinho.
- **Carregamento:** `boot.ts` liga o fallback por IntersectionObserver na hora e só depois do `load` e de idle importa o chunk `scroll` (gsap + ScrollTrigger, **44,75 kB gz**, no limite de 45). Se o chunk for bloqueado, o fallback continua revelando (testado). `html.lp-motion` é posto pelo script inline antes da pintura e só sem movimento reduzido; uma rede de segurança de 4 s remove a classe se o JS não assumir.
- **Divergências/decisões:** (1) **`@gsap/react` removido** (foi instalado na F4): o movimento é um módulo imperativo carregado depois da hidratação e `gsap.matchMedia()` já faz a limpeza; o hook seria dependência sem uso. (2) **Sem SplitText**, sem pin, sem snap, sem loop, sem parallax, sem listener de scroll próprio (garantido por teste estático; o React registra os seus próprios listeners delegados, então o teste de runtime não separa um do outro). (3) O nó do passo passou para dentro do corpo do texto, para alinhar com o título quando o passo é centralizado na tela; só o texto esmaece nos passos inativos.
- **Verificação visual:** celular fixo com o retrato do passo ativo, margem azul preenchida até o passo atual, nós com check.
- **Testes:** `motion.spec.ts` 45 passando em 5 projetos (movimento reduzido: nada escondido, layout empilhado, chunk do GSAP nem é pedido; sem JS: tudo visível e FAQ nativa abre; com movimento: blocos entram no scroll, GSAP chega depois do `load` e depois do JS inicial, fallback com o chunk bloqueado, celular fixo e retrato acompanha o passo, margem azul cresce, abaixo de 1024 px empilhado) e `motion-rules.test.ts` 5 (sem listener de scroll/wheel/touchmove, sem `scrollY`/loop de rAF/`setInterval`, sem parallax/pin/snap/marquee/infinite/cursor, transições só em transform/opacity/clip-path/stroke, todo estado escondido sob `html.lp-motion`).

### F11: responsividade (concluída)

Screenshots em 320, 390, 768, 1024 e 1280 (claro e escuro): hero em 3 linhas no desktop e 4 em 320 (CTA continua na primeira tela); tablet empilhado (texto, CTA, folha com celular); 1024 já em duas colunas; "Como funciona" empilhado abaixo de 1024 px com o retrato recortado em 420 px; sticky CTA e alvos de 44 px conferidos. `responsive.spec.ts` (9 testes): 7 tamanhos (320×700, 360×740, 390×844, 768×1024, 1024×768, 1280×800, 1440×900) sem rolagem horizontal, CTA do hero inteiro na primeira tela, navbar de uma linha e ≤ 80 px, H1 dentro da largura; todo controle visível ≥ 44 px de altura no mobile; toda `<img>` com `width`, `height` e `alt`.

### F12: SEO e compartilhamento (concluída)

Skills `seo-audit` e `schema` (cache). `content/seo.ts` gera título (50 caracteres), descrição (≤ 160), `robots` (**noindex por padrão**), canonical só com `VITE_SITE_URL`, Open Graph completo (`og:locale pt_BR`, imagem 1200×630 com alt), Twitter `summary_large_image`, ícones (favicon do app copiado, `icon-192`, `apple-touch-icon`), `theme-color` claro/escuro, preloads (duas fontes e o retrato do hero em AVIF claro e escuro) e JSON-LD `WebSite` + `Organization` + `WebApplication` **sem `offers`, sem nota, sem `FAQPage`** (a skill pede `offers` só para rich results de app, que não são o objetivo; e não há preço). `robots.txt` (fechado por padrão) e `sitemap.xml` (só com domínio e indexável) saem do prerender. `scripts/make-og-image.ts` gera `public/lp/og/og-landing.png` (35 kB) com o H1, a Foca em contorno e o retrato real do hero. Testes: `seo.test.ts` (14).

### F13: copy, nove passadas (concluída)

Skills: `ogilvy-copywriting` (F3) → `copywriting` lida do cache (rascunho = a copy v1 já escrita sobre a §9.3) → `copy-editing` (sete varreduras: clareza, voz, e daí, prova, especificidade, emoção, risco zero) → `humanizer` (lido de `humanizer/3.0.0/SKILL.md`; a chamada `humanizer:humanizer` não existe como skill invocável neste ambiente). Aplicações dos padrões do humanizer: §1 "não X mas Y" (removido de S-7: "não abre sozinha… você chama" virou "ela só responde quando você chama"), §2 fecho de uma linha (removido "Quem escolhe é o Foca."), §6 tríades (as três listas de S-6 e S-7 ficaram: cada item é um fato distinto, não enchimento).

| Onde | Antes | Depois | Por quê (passada) |
|---|---|---|---|
| Hero, subtítulo | "…escolhe a atividade de agora e mostra o motivo…" | "…escolhe o que estudar agora e mostra o motivo…" | Clareza: fala como o João fala |
| S-3 passo 3 | "um assunto que foi bem, uma revisão que está na hora" | "um assunto em que você foi bem, uma revisão na hora certa" | Clareza/voz |
| S-3 passo 5 | "…aparece de novo, com o motivo escrito. Quem escolhe é o Foca." | "…o assunto que você estudou aparece de novo. Você não precisa lembrar qual era." | Fecho de uma linha; passo 3 já fala do motivo; "e daí?" (alívio) |
| S-5 | congelamento primeiro | "Quando você volta, o app vai direto pro próximo passo." primeiro, congelamento depois | Emoção: abre pelo alívio, não pela regra |
| S-7 corpo | "Ela não abre sozinha quando você erra. Você chama…" | "Ela só responde quando você chama. Pergunta do seu jeito e, se quiser, manda a foto…" | Humanizer §1; "Errou?" já abre o passo 4 |
| S-7 lista | "Não te compara com outros alunos." | "Não corrige a redação que você escreve." | **Prove It / correção factual:** o app tem uma tela de ranking de turma (fictícia); a frase original seria falsa. Tira a dependência de F-16 |
| FAQ 4 | "Quanto cabe numa lição?" | "De quantas questões é uma lição?" | Clareza: pergunta que existe e que se responde com fato |

- **Teste "poderia ser qualquer SaaS?" (§26.4)** nos títulos: "Como o Foca escolhe o que vem agora", "A Foca explica quando você pede.", "Parou uns dias? Continua de onde estava." e "Domingo você monta o cronograma…" só valem para o Foca ou para hábito de estudo; "Tenta uma." e "Continua usando o que você já usa." são genéricos sozinhos e ficam porque o subtítulo/corpo logo abaixo os ancora (questão real; videoaula, apostila, app oficial).
- **Prove It sem prova social:** a prova é o produto (retratos e demo reais) e os fatos F-x. Nenhuma sugestão de depoimento, número ou garantia da skill foi aplicada.
- **Leitura corrida (passada 9):** página inteira lida como texto no celular; sem travessão, sem "60 segundos", sem duração, sem preço. `copy-rules.test.ts` (22) e `seo.test.ts` seguem verdes. Total unitário: 56.

### F14: performance (concluída, com um alvo não cumprido)

Skill `agent-skills:performance-optimization` (lida do cache; o agente `web-performance-auditor` **não existe** neste ambiente, então a auditoria foi feita por mim com o Lighthouse). Método da skill: medir → achar o gargalo → corrigir → medir de novo, mesmas condições. Ferramenta: `bun run lighthouse` (`scripts/lighthouse-run.ts`, 3 rodadas mobile + 1 desktop, mediana, Chromium do Playwright, contra `vite preview`).

| Tentativa | Mobile perf | FCP | LCP | Resultado |
|---|---|---|---|---|
| Linha de base | 90 | 2,0 s | 3,4 s | LCP era o botão da navbar; logo de 30 px baixava PNG de 720 px (178 kB) |
| Derivados leves da marca (logo 2 kB, Foca 9 kB WebP) + **CSS inline** | 92 | 1,96 s | 3,17 s | mantido |
| Contraste do passo inativo (opacidade .45 → .7), imagens fora da dobra com `fetchpriority=low`, **Space Mono e Caveat só depois do load** | 95 | 1,81 s | 2,80 s | mantido; a11y desktop 96 → 100 (o passo esmaecido reprovava contraste no axe) |
| H1 sobe só por `transform` (sem fade), para ser o elemento medido | 95 | 1,81 s | 2,81 s | mantido: o LCP passa a ser o H1 real |
| Tirar o preload das fontes | 90 | 2,26 s | 3,25 s | **revertido** (piorou) |
| Script do app no fim do `<body>` | 95 | 1,81 s | 2,79 s | neutro (mantido dentro do próximo) |
| **JS do app só depois do `load`** (loader inline; a página inteira já está no HTML) | **96** | **1,63 s** | **2,72 s** | mantido |
| Desligar todas as animações do hero (teste) | 95 | 2,0 s | 3,18 s | revertido: sem a animação o LCP passa a ser o retrato do hero, mais tarde |

- **Números finais** (mediana de 3 rodadas, perfil mobile padrão do Lighthouse = Slow 4G + CPU 4× mais lenta): Performance **96**, Acessibilidade **100**, Boas práticas **100**, CLS **0,000**, TBT **0 ms**, FCP 1,63 s, **LCP 2,72 s**. Desktop: 100 / 100 / 100, LCP 0,51 s. SEO 66 no build padrão **por causa do `noindex`** (auditoria "página bloqueada para indexação"); com o build indexável ver F17.
- **(Superado pelo bloco "Pós-F17": LCP 2,27 s e JS 74,2 kB gz.)** Alvo não cumprido na época: LCP < 2,5 s **no perfil Slow 4G + CPU 4×** (2,72 s; oscila entre 2,7 e 3,2 s de uma rodada para outra). Localmente, sem estrangulamento, o LCP é ≈ 150 ms (TTFB 6 ms + render 148 ms). O que sobra no perfil simulado é a banda: fontes (49 kB, preload) + JS (79 kB) + retrato do hero (14 kB) disputam 1,6 Mbps. Não há ferramenta aqui para subsetar as fontes (sem Python/fontTools) e a alternativa (dependência de subset só para isso) não foi aprovada.
- **Orçamento de bytes:** JS inicial **81,1 kB gz** contra os 75 kB do plano: React 19.3 + hidratação sozinhos medem 68,9 kB gz (F4), e a página soma ~12 kB (copy, demo, ícones). Mantido, não trocado por outro framework. Chunk do movimento **44,75 kB gz** (limite 45). CSS **7,9 kB gz**, agora **inline** no HTML (o arquivo `.css` ainda é emitido e não é usado). HTML 17 kB gz.
- **Efeitos colaterais conferidos:** JS depois do `load` (a página não é interativa antes disso, mas nem os links nem a FAQ nativa dependem de JS; a demo e o CTA fixo precisam do JS, que chega assim que o `load` dispara; a rede de segurança do movimento subiu de 4 para 8 s); a suíte E2E inteira continua verde (119 passando, 36 puladas por desenho).
- Imagens: 7 retratos × 2 temas × 360/720 px em AVIF e WebP (1,2 MB no total, cada visitante baixa 1 tema e 1 formato); todas com `width`/`height` (CLS 0); só o retrato do hero é `eager` e `fetchpriority=high`, com `preload` AVIF claro e escuro por `media`.

### F15: acessibilidade (concluída)

Skill `web-design-guidelines` (regras buscadas em `vercel-labs/web-interface-guidelines`, no dia) aplicada a todo `landing/src`; consulta opcional `design:accessibility-review` não usada. **Auditoria por arquivo (`arquivo:linha` só para o que mudou):**

- `src/styles/motion.css:8` sem `scroll-padding-bottom`: a barra fixa do mobile podia cobrir o elemento focado → adicionado (96 px).
- `src/styles/components.css` (`.lp-choice`) sem estado `:hover` → adicionado (borda mais escura).
- `src/content/copy.ts` sem espaço não separável entre número e unidade ("4 a 8 questões", "7 dias", "© 2026 Foca") → NBSP.
- Fora isso ✓: ícones decorativos com `aria-hidden`, `alt` em toda imagem, `aria-live="polite"` na demo, `:focus-visible` (contorno de 3 px) sem `outline: none`, nenhuma `transition: all`, `touch-action: manipulation`, `text-wrap: balance/pretty`, `color-scheme` claro/escuro e `theme-color`, `width`/`height` e `loading` nas imagens, sem `user-scalable=no`, sem `<div onClick>`, sem leitura de layout em render.
- **Regra do guia não adotada:** "Title Case em títulos e botões" é convenção do inglês; a landing segue o guia de copy do Foca (pt-BR, caixa de frase).

Correções que os testes forçaram: (1) o passo inativo do "Como funciona" com opacidade .45 **reprovava contraste no axe** → .7 (≥ 4,5:1 nos dois temas); (2) a barra fixa estava fora de qualquer landmark (`region`) → agora dentro do `<main>`; (3) com texto do sistema em 200% a navbar e as linhas da semana estouravam a largura → navbar com `min-height` e quebra de linha, linhas da semana com `flex-wrap`, títulos com teto em `vw` (`min(clamp(…), 11,5vw)` e `9vw`); (4) o axe media o feedback da demo no meio da animação → o teste espera os 280 ms.

`a11y.spec.ts` (60 execuções em 5 projetos): axe (`wcag2a/aa`, `wcag21a/aa`, `wcag22aa`, `best-practice`) em claro e escuro na página, com a demo em três estados (certa, errada, "Não sei"), com a FAQ inteira aberta, no desktop com o celular fixo e no mobile com a barra fixa visível: **zero violações**. Teclado: 15+ paradas em Tab, o primeiro foco é "Pular para o conteúdo" (e ele leva a `#conteudo`), todo foco com contorno ≥ 2 px e nenhum coberto por navbar ou barra fixa. Zoom de 200% (viewport de 640 px) e texto do sistema em 200%: sem rolagem horizontal nem texto cortado. Estrutura: um landmark de cada, `lang="pt-BR"`, toda seção nomeada por título, todo link e botão com nome. Contraste: verificado pelo axe em cada estado; combinações usadas do design system (texto `nevoa` 13 px sobre papel 4,81:1 no claro).

**Não feito (declarado):** leitor de tela real (NVDA/VoiceOver) e aparelho físico; o axe cobre o que é automatizável, não a experiência de uso.

### F16: revisão de CRO (concluída, sem mudança estrutural)

Skill `cro` (cache) aplicada como Revisão 7. Página: landing de consumo; meta única: abrir `/quiz`; tráfego esperado: link da bio, indicação e busca (sem dado real). Regra do Foca: nenhuma recomendação de prova social, urgência ou preço entra.

| Dimensão da skill | Estado | Nota |
|---|---|---|
| Clareza da proposta (5 segundos) | ✓ | Categoria (eyebrow "Preparação para o ENEM"), promessa (H1), mecanismo (subtítulo), ação (botão) na primeira tela em 320, 360, 390, 1280 e 1440 (teste `responsive.spec.ts`) |
| Título | ✓ | Específico quando lido com o eyebrow e o subtítulo (F3). Reserva: H1-B e H1-C |
| CTA | ✓ | Uma ação, um rótulo, sem duplicar intenção; navbar, hero, demo (só depois de responder), fechamento e barra fixa no mobile. Sempre `/quiz`, sem passar pela welcome desatualizada |
| Hierarquia visual | ✓ | Um marca-texto por seção-chave, azul só em ação/seleção/progresso, muito espaço |
| Sinais de confiança | Limitado por regra | Sem depoimento, número, logo ou nota (não existem). A confiança vem do produto real (retratos e demo), do bloco "O que o Foca não faz" e da FAQ honesta |
| Objeções | ✓ | Todas as da matriz do `40` §7 têm seção; a de pagamento vem primeiro na FAQ |
| Atrito | ⚠ fora da landing | Depois do clique, o app pede **9 passos** de perfil antes da primeira atividade (`/quiz`). A landing prepara isso (passo 1 do "Como funciona" e FAQ "Preciso criar conta?"), mas é o maior atrito da jornada e é decisão do produto (`36`/`30`), não da página |

**Candidatos a corte (Revisão 7, sem cortar; decisão do usuário):** nenhuma seção deixou a página mais confusa. As de menor impacto esperado, se for preciso encurtar: S-6 "O que você já tem" (só responde a uma objeção, "já tenho material") e S-2 "A cena" (gancho emocional). Sem dado, mantidas.

**Ideias de teste (A/B com medição local, DEP-7 antes):** (1) H1-B "Para quem estuda no intervalo: o Foca escolhe a próxima atividade e mostra por quê." contra o H1 atual; (2) linha de risco do hero com a expectativa do app ("Sem e-mail e sem senha. Umas perguntas sobre a sua prova e você já começa."); (3) demo antes do "Como funciona" (experiência antes da explicação); (4) rótulo do botão: "Começar agora" contra "Ver meu próximo passo" (mais ligado à promessa, mas o clique leva ao perfil, não ao passo).

**Aplicado:** nada novo além do que as F7 a F15 já trouxeram (a skill não achou problema que não estivesse coberto).

### F17: polimento, segurança, QA final e documentação (concluída)

**Segurança (L2, skill `agent-skills:security-and-hardening`).** Modelo de ameaça: a página não recebe texto do usuário (a demo só tem cliques), não usa cookie, `localStorage` nem rede, não coleta dado de ninguém e só tem links de saída para o app; o único valor de configuração são as três variáveis `VITE_*`, públicas. Controles: `landing/vercel.json` com `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` restritiva, `Cross-Origin-Opener-Policy` e `Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`; **CSP por `<meta>` gerada no build com o hash SHA-256 exato de cada script inline** (`default-src 'self'`, `script-src 'self'` + hashes, sem `unsafe-inline` nem `unsafe-eval` em script, `connect-src 'self'`; estilo inline liberado porque o React emite atributos `style` e não há entrada de usuário); cache imutável só em `/lp-assets/`; `bun audit` **sem vulnerabilidades (164 pacotes)**; `bun pm untrusted` sem scripts de dependência; `bun install --frozen-lockfile` limpo; `minimumReleaseAge` de 24 h herdado; nenhuma chave no HTML (teste). `deploy.test.ts` cobre cabeçalhos, hashes da CSP, ausência de recurso de terceiros e de segredo. `repo-security-review --pr` completo não se aplica (sem superfície de dados), como o `40` §20 já dizia.

**Revisão 8, `impeccable critique` (skill `impeccable`, lida do cache; a chamada `impeccable:impeccable` não existe neste ambiente).** Método: dual-agent, dois subagentes isolados (A: revisão de design; B: detector e evidência de navegador), conforme o protocolo. Não gravei o snapshot em `.impeccable/critique/` (fica fora da whitelist de escrita) e pulei a pergunta final (execução autônoma): `Questions skipped: execução sem interação, achados registrados aqui`.

- **B (detector):** 24 achados, **todos falsos positivos** (20 `cramped-padding` em cartões e linhas que medem 16 a 28 px de recuo; `overused-font` = fontes da marca; `repeating-stripes-gradient` = a pauta; `clipped-overflow-container` = `overflow-x: clip` sem nada cortado). Navegador em 390 e 1280, claro e escuro: 0 erro de console, 0 requisição falha, 0 overflow horizontal, 0 violação no axe (82 a 87 nós passando em contraste), 0 `img` sem `alt`. Achado real: **alvos de toque** dos links da navbar (18 px de altura no desktop) e do "Entrar" do rodapé (41 px de largura) → corrigidos (`min-h-11`, `min-w-11`) e o teste de alvos agora roda em 390 e 1280 com 44 × 44.
- **A (design):** especificidade **7/10** (forte na abertura, na cena e no fecho; o miolo é o que qualquer produto teria no chrome, salvo pelo texto e pelos retratos); heurísticas de Nielsen **23/32** com as 7 e 10 `n/a` (superfície de persuasão), ou **29/40** normalizado; carga cognitiva com 6 de 8 itens; pico na cena e na demo; vale de cinco seções de objeção sem segundo pico.
- **Aplicado (todos dentro das regras da marca e do plano):** (P1) a barra fixa do mobile some durante a demo, para não competir com "Verificar"; (P2) o hover deixava a alternativa selecionada sem o azul → `:not([aria-checked="true"])`; (P2) a frase-tese da demo ("entra na conta do que você sabe…") subiu de 14 px cinza para corpo semibold em cor de texto; (P2) o retrato do último passo (repete a tela do hero e do passo 3) só aparece a partir de 768 px, o mobile ficou mais curto; (P3) navbar opaca (o título vazava pela barra) e, abaixo de 360 px, sem o "Entrar" (fica no rodapé), o que fez a navbar voltar a uma linha em 320 px (**o `overflow-x: clip` do `body` escondia esse estouro nas rodadas da F11**; o teste de navbar de uma linha o pegou depois que a navbar passou a poder quebrar); a margem azul do "Como funciona" passou a nascer no primeiro nó e chegar ao último, medida no DOM; o congelamento da S-5 (célula e chip) passou para **grafite**: o azul é ação, seleção e progresso, e o plano dizia floco em grafite.
- **Não aplicado (com o porquê):** (a) mais rabiscos de lápis no miolo (`ja-tem`, `Comeback`) para sustentar o "caderno" além do hero e do fecho: os pontos de uso da pauta e do lápis estão fixados no `40` §12.4 e §12.5; fica como sugestão para a próxima iteração de arte, sem inventar mais doodles no escuro. (b) Reduzir "Como funciona" a 3 passos no mobile: estrutura da §11, decisão do usuário. (c) Explicar ao João por que ele "provavelmente marcou 750" no erro da demo: a landing não tem modelo de erro; seria inventar. (d) Item da demo mais difícil ou oficial: escolha de conteúdo (`34` restringe questões oficiais). (e) Padronizar "o Foca / a Foca": a distinção é intencional (o app é "o Foca"; a personagem e o tutor são "a Foca", como no app). (f) Eyebrow em azul: é o `ds-label` do design system do app (`mar-fundo` sobre claro), não decoração.

**Pré-voo da `design-taste-frontend` (§14):** design read e dials declarados (F7); zero travessão (teste); tema único por sistema; um acento; uma escala de raios; contraste de botão pelo axe; CTA sem quebra (`whitespace-nowrap`, um rótulo); sem formulário; sem serifa; sem `Fraunces`; hero cabe na tela (H1 em 3 linhas e 21 palavras de subtítulo contra 2 linhas e 20 da skill, e uma linha de risco sob o CTA: divergências deliberadas do `40`, registradas na F7); eyebrows dentro do teto (3 de 3); sem cabeçalho dividido; sem zigue-zague de 3 seções; sem tríade de cartões iguais (a semana é uma faixa de dados); FAQ em acordeão (lista longa com componente certo); motivo declarado para cada animação (mapa M-1…M-13); um só marquee (nenhum); nav de uma linha ≤ 80 px; camadas de z documentadas; imagens reais (nenhuma UI falsa em `<div>`); nenhum selo, crédito de foto, versão, faixa de decoração, dica de rolagem, ponto decorativo; sem `addEventListener('scroll')`; `prefers-reduced-motion` respeitado; dois temas testados; `min-h-[100dvh]`, nunca `h-screen`; `useEffect` com limpeza; vitais dentro (CLS 0, TBT 0; LCP 2,27 s no perfil simulado depois das ilhas e do preload, ver Pós-F17). Onde o Foca vence a skill: paleta creme (é a marca), `lucide-react` (família do projeto), fontes da marca.

**Teste de 5 segundos (§26.3):** primeira tela em 390×844 e 1280×800, só o que está visível: eyebrow "Preparação para o ENEM" (categoria), H1 "Você abre. O próximo passo já está escolhido." (benefício), subtítulo com "estudar", "acerta e erra", "motivo" (o que o produto faz), o celular real com "Essa travou duas vezes. Vamos por partes, com calma." (prova) e o botão "Começar agora" com "Sem e-mail e sem senha" (ação e risco). Público: "estudar" e "ENEM" no eyebrow e no subtítulo; "Cabe no intervalo" fala com quem estuda em tempo picado. As quatro respostas (categoria, benefício, público, ação) estão explícitas no texto visível.

**Documentação atualizada:** `docs/00-README.md` (status e tabela), `CLAUDE.md` (bloco da landing), `docs/DESIGN.md` (ponteiro dos Marketing Design Tokens), `docs/copy/06-marketing.md` (linha de superfície), `docs/40` (status), `landing/README.md`. Nada mais.

### Pós-F17: ilhas de hidratação e preload só da fonte de título (fecha G-18 e G-19)

Pedido "pode continuar": os dois critérios que o verificador marcou como parciais eram os únicos itens técnicos que não dependiam de decisão do usuário. Feito dentro de `landing/`, sem dependência nova.

- **Ilhas de hidratação (G-19).** O React deixou de hidratar a página inteira. `src/components/Island.tsx` marca três ilhas com estado (`como-funciona`, `tenta-uma`, `duvidas`); o resto é HTML estático. `src/main.tsx` hidrata o "Como funciona" na hora e a demo e as dúvidas **em chunks próprios**, em ociosidade logo depois do `load`, ou antes disso se a ilha chegar a 1500 px da tela ou receber toque, tecla ou foco (o React só reencena cliques que chegam depois de `hydrateRoot`, então o caminho normal é hidratar cedo; o primeiro teste mostrou o clique se perdendo quando a hidratação esperava o toque). A **navbar** (fundo ao rolar) e a **barra fixa** (aparecer, sumir na demo, no fechamento, no rodapé e com o foco nas Dúvidas) viraram markup estático com o comportamento em `src/lib/chrome-dom.ts` (IntersectionObserver e focusin/focusout, sem React). Os eventos locais saíram do React: cliques por atributo `data-track` e `section_view` em `src/lib/track-dom.ts`. `src/content/copy.ts` foi dividido em constantes por seção (`NAV`, `COMO_FUNCIONA`, `TENTA_UMA`, `FAQ`, `STICKY`…); `LP` continua existindo para SSR, SEO e testes.
- **Resultado do JS:** entrada **74,2 kB gz** pela conta do Vite (71,7 kB por `gzip -6`), contra 81,1 antes e o teto de 75; mais 2,4 kB da demo e 0,5 kB das dúvidas, carregados depois do `load`. O total transferido também caiu (~3,5 kB) e a hidratação é bem menor (a maior parte do DOM nunca é hidratada). `islands.test.ts` garante as três ilhas no HTML, que o cliente não importa a página inteira em produção, que o texto das seções estáticas não está no JS e que o código da demo e das dúvidas está nos chunks certos.
- **Preload (G-18).** Com o JS fora do caminho crítico, a experiência de tirar o preload das fontes deu o resultado oposto ao da F14: manter **só o preload da Space Grotesk** (fonte do título, elemento do LCP) e deixar a Plus Jakarta Sans (corpo, 27 kB) carregar normalmente **derrubou o LCP de 2,64 para 2,27 s** (FCP 1,14 s, Performance 98), repetido duas vezes com a mesma mediana. O corpo troca de fonte um pouco depois; CLS mobile 0,000 e desktop 0,003.
- **Números finais (mediana de 3, Slow 4G + CPU 4×):** Performance **98**, Acessibilidade **100**, Boas práticas **100**, SEO 66 (100 indexável), CLS 0,000, TBT 0 a 12 ms, FCP **1,14 s**, **LCP 2,27 s**. Desktop 100/100/100, LCP 0,38 a 0,45 s.
- **Testes depois da refatoração:** unitários **75 passando** (mais `islands.test.ts`, 4); E2E **187 passando**, 43 puladas por desenho (o novo teste de eventos locais confere `landing_view`, `section_view`, `hero_cta_click`, `faq_open` e `demo_answer` e que nenhum valor de evento é texto livre); axe sem violações nos dois temas e nos 3 estados da demo.

## 4. Decisões do executor (dentro do que a §23 permite)

- **`@types/bun` como devDependency** (não estava na §15.2): necessário para o `tsc` da landing aceitar `bun:test` e `import.meta.dir`. Só tipos, sem código em runtime.
- **Tema por CSS, não por script:** em vez do script inline que aplica `.dark` (§12.7), o `sync:tokens` gera um bloco `@media (prefers-color-scheme: dark)` com as mesmas variáveis do `.dark` do app. Efeito: dark mode certo sem JS e sem flash, e um script inline a menos. O `<picture>` já troca por `media`. Mesma intenção da §12.7, implementação mais simples.
- **`index.html` com marcadores de head** (`<!--app-head-start/end-->`) em vez de só `<!--head-->`, para o pré-render substituir o `<title>` do dev.

## 5. Divergências em relação ao `40`

Todas já explicadas na fase em que surgiram; aqui, a lista única.

1. **Retratos:** `faixas-progresso` descartado (o `/progress` usa "Dominado", "Lacuna", `%`); `atividade-consolidar` acrescentado (F6). O passo 5 de S-3 perdeu a frase das faixas (ficam no passo 2) e o retrato dele só aparece a partir de 768 px (crítica R8).
2. **Dependências:** `@gsap/react` removido depois de instalado (o movimento é um módulo imperativo, `gsap.matchMedia()` limpa); `@types/bun` acrescentado (só tipos).
3. **Tema** por `@media (prefers-color-scheme: dark)` gerado dos tokens, sem script inline (F5).
4. **Hero:** H1 em 3 linhas (a skill pede 2) com `--lp-display-xl` reduzido para caber; subtítulo de 21 palavras (a skill pede 20; o `40` permite 22); linha de risco sob o CTA (a skill veta "tagline abaixo do CTA"; aqui é parte do CTA). O H1 sobe só por `transform`, sem fade (F14).
5. **Demo:** CTA só depois de responder; sem "Ver resolução" (o item não tem essa camada); sem o evento `demo_resolution_open`. O `<noscript>` mostra o aviso e o CTA.
6. **S-5:** chip "sequência mantida" sem número; congelamento em grafite (não azul); o texto diz que **cada congelamento cobre um dia parado** (regra do `store.ts`).
7. **S-7:** "Não te compara com outros alunos" descartado (o app tem um ranking de turma fictício) por "Não corrige a redação que você escreve"; **a lista de afirmações da §9.4 ganha três linhas**: F-19 "não promete nota nem aprovação" (`copy/06` §3 e §4), F-20 "não corrige a redação que você escreve" (o app não tem correção de texto escrito; conferido no código) e F-21 "não cobra quando você some" (`15` §8; sem notificação em `src/`). F-16 fica sem uso.
8. **Notas manuscritas (Caveat):** 1 na página (o teto era ~3), e a semana da cena tem texto normal.
9. **Barra fixa:** some no fechamento, no rodapé, durante a demo e com o foco do teclado nas Dúvidas; abaixo de 360 px o "Entrar" da navbar sai (fica no rodapé). Não há tratamento de teclado virtual porque a página não tem campo de texto.
10. **Movimento:** o passo ativo do "Como funciona" vem de IntersectionObserver em React, não de ScrollTrigger; o GSAP fica com o reveal em lote e a margem azul.
11. **Performance:** JS do app carregado só depois do `load`; CSS inline no HTML; **React hidrata só três ilhas** (a demo e as dúvidas em chunks próprios) e a navbar e a barra fixa são HTML com comportamento em JS puro (§ Pós-F17). JS de entrada **74,2 kB gz** (teto 75) e **LCP 2,27 s** (meta 2,5 s) no perfil Slow 4G + CPU 4×; preload só da fonte do título.
12. **Head:** `theme-color` com o `--neve` literal (o `<meta>` não aceita `var()`), e um teste garante que é o token.
13. **CSP** por `<meta>` com hash calculado no build (além dos cabeçalhos do `vercel.json`).
14. **Ferramentas ausentes neste ambiente:** o agente `web-performance-auditor` e as skills `humanizer:humanizer` e `impeccable:impeccable` como invocáveis; usei os `SKILL.md` do cache e o Lighthouse.
15. **Skill de React (`vercel-react-best-practices`)**, primária das F8 e F9 no plano, só foi carregada na F17 (não na F8/F9, como o plano mandava): a revisão dela achou um único problema real (um `setState` dentro do atualizador de outro, no passo ativo do "Como funciona"), já corrigido.

## 6. Mudanças externas observadas (trabalho paralelo, não meu)

- 28/09/2026 F0: ≈334 entradas em `git status` fora de `landing/` já existiam antes da execução.
- Durante a execução, **outra sessão** (`foca-86`, interativa) alterou o app: `src/hooks/useLearningSession.ts` (modificado, idempotência do plano `36`) e dois testes novos não rastreados (`tests/unit/persist-copy.test.ts` e `tests/unit/store-complete-idempotent.test.ts`). **Nenhum é meu**; a comparação de `git status` fora de `landing/` com o snapshot da F0 mostra exatamente essas três entradas.
- Artefatos de **build na raiz** (`dist/`, `.netlify/`) e `.security-review/` com data de 28/09 23:49 e 23:19: **não foram gerados por mim**. Nunca rodei `build` nem `install` na raiz; o app foi lido só por um `bunx vite dev` (sem o `predev`) que subi às 23:29 para capturar os retratos e parei ao fim. O `public/content/v1/` (gitignorado) é regenerado pelo `predev`/`prebuild` da outra sessão.
- O `src/styles.css` do app não mudou nesse intervalo (sha1 do snapshot de tokens, `19ed804bb4`, continua igual; `bun run check:tokens` sem aviso).

## 7. Números de teste (final, 29/09/2026)

| Gate | Resultado |
|---|---|
| `bun run typecheck` | sem erro |
| `bun run check:isolation` | OK: nenhum import sai de `landing/` |
| `bun test tests/unit` | **75 passando**, 0 falhando (9 arquivos: app-url 5, isolation 2, token-drift 4, copy-rules 26, seo 14, motion-rules 5, deploy 6, design-rules 9, islands 4) |
| `bunx playwright test` (5 projetos: 320, 390, 768, 1280, 1440) | **187 passando**, 43 puladas por desenho (o teste de 7 tamanhos roda só no projeto `desktop`; os de barra fixa só no mobile). Execuções por arquivo: `landing` 45, `demo` 30, `motion` 45, `a11y` 60, `responsive` 50 (10 testes × 5 projetos, dos quais só os 10 do projeto `desktop` rodam) |
| `bun run build` | OK; HTML de 80,9 kB (16,7 kB gz) |
| `bun audit` | sem vulnerabilidades (164 pacotes); 0 scripts de dependência não confiáveis |
| Lighthouse mobile (mediana de 3, Slow 4G + CPU 4×) | Performance **98**, Acessibilidade **100**, Boas práticas **100**, SEO **66** (só pelo `noindex`; **100** com o build indexável), CLS **0,000**, TBT **0 a 12 ms**, FCP **1,14 s**, **LCP 2,27 s** (repetido duas vezes) |
| Lighthouse desktop | 100 / 100 / 100 / 66 (100 indexável), LCP 0,38 a 0,45 s, CLS 0,003 |
| Tamanhos gz | JS de entrada **74,2 kB** (Vite; 71,7 por `gzip -6`), demo 2,4 kB e dúvidas 0,5 kB (chunks depois do `load`), movimento 43,4 kB, CSS 7,9 kB (inline), HTML 16,9 kB |
| Verificação independente (agente `spec-verifier`) | **20 cumpridos, 4 parciais, 0 não cumpridos** na rodada dele (antes das correções e das ilhas); depois disso G-5, G-18 e G-19 foram fechados (§8) |

Não medido: celular físico, leitor de tela real, Safari/WebKit real.

## 8. Critérios G-1…G-24 com evidência

Verdade de cada critério conferida por um agente independente (`spec-verifier`, 29/09/2026) e por mim. "Parcial" tem o motivo.

| ID | Estado | Evidência |
|---|---|---|
| G-1 Só a whitelist foi alterada | ✅ | `git status` fora de `landing/` e dos docs 40 e 41 difere do snapshot da F0 só em 3 entradas da outra sessão (§6). Arquivos que editei fora de `landing/`: `CLAUDE.md`, `docs/00-README.md`, `docs/DESIGN.md`, `docs/copy/06-marketing.md` (uma linha na tabela e uma nota de estado), `docs/40` (status) e `docs/41` |
| G-2 Nenhum import de fora | ✅ | `bun run check:isolation`; `isolation.test.ts` |
| G-3 Roda isolada | ✅ | `typecheck`, `build`, `preview`, `dev` (:4321) e o E2E inteiro |
| G-4 HTML pré-renderizado | ✅ | `dist/index.html`: 1 `h1`, 8 `h2`, 16 `h3`, 8 `details`; E2E "sem JavaScript" |
| G-5 Toda afirmação mapeia para F-x | ✅ após correção | A tabela F3 ficou velha depois da F13; a lista final está na §5 item 7 (F-19, F-20, F-21 acrescentadas) e os comentários de `copy.ts` citam o F-x de cada bloco. "Sem no mesmo formato" trocado por "lições curtas" na FAQ de redação (o player é o legado) |
| G-6 Zero proibido e zero travessão | ✅ | `copy-rules.test.ts` (26); só "nota" e "aprovação" na lista "não faz" |
| G-7 Sem prova social, número de pessoas, preço, duração, aprovação | ✅ | Testes e leitura. "Começar não custa nada" depende da D-LP-1 |
| G-8 Cores só por tokens; reservas respeitadas | ✅ | `design-rules.test.ts` (hex só em `seo.ts` com teste contra o token, e nos snapshots) |
| G-9 Claro e escuro | ✅ | axe nos dois temas |
| G-10 Teste de 5 segundos | ✅ (sem avaliador humano) | F17: categoria, benefício, público e ação explícitos na primeira tela |
| G-11 CTA único, `/quiz` por `appUrl` | ✅ | 4 links no carregamento (5 depois de responder a demo), um rótulo, todos `…/quiz`; "Entrar" vai à raiz |
| G-12 Produto só por retratos reais e demo real | ✅ | 7 retratos de telas reais, demo com item literal do banco (`demo-item.json` idêntico ao do pacote, conferido campo a campo) |
| G-13 Demo acessível, texto idêntico | ✅ | `demo.spec.ts` (6 testes, 30 execuções); `radiogroup`, `aria-live`, foco no resultado |
| G-14 Visível sem JS e com movimento reduzido | ✅ | `motion.spec.ts` (9 testes, 45 execuções) |
| G-15 Sem scroll listener, pin, snap, parallax, loop | ✅ | `motion-rules.test.ts`; só `position: sticky` nativo |
| G-16 Sem rolagem horizontal | ✅ | `responsive.spec.ts` (7 tamanhos) e medição elemento a elemento (o `overflow-x: clip` do `body` poderia esconder estouro) |
| G-17 CTA do hero na primeira tela | ✅ | Base do CTA em y ≈ 412 em 390×844 e 360×740 |
| G-18 Lighthouse ≥ 90/100/100/100, CLS < 0,05, LCP < 2,5 s | ✅ | Perf **98**, A11y 100, BP 100, SEO 100 (indexável), CLS 0, **LCP 2,27 s** no perfil Slow 4G + CPU 4× (era 2,72 s na F14; caiu com o preload só da fonte do título). Desktop 0,38 a 0,45 s |
| G-19 JS ≤ 75 kB, movimento ≤ 45, CSS ≤ 20 | ✅ | JS de entrada **74,2 kB gz** (ilhas de hidratação; mais 2,9 kB em chunks depois do `load`); movimento 43,4 kB; CSS 7,9 kB |
| G-20 axe, teclado, foco, zoom | ✅ (parte automatizável) | `a11y.spec.ts` (12 testes, 60 execuções) sem violações; leitor de tela real não testado |
| G-21 `noindex` por padrão; SEO completo indexável | ✅ | `seo.test.ts` (14); Lighthouse SEO 100 com o build indexável |
| G-22 Nenhuma requisição a terceiros | ✅ | E2E de requisições e `deploy.test.ts`; fontes locais; CSP `default-src 'self'` |
| G-23 Skills usadas conforme a §21 | **Parcial** | Registradas por fase. Faltam por ausência no ambiente: agente `web-performance-auditor`; `humanizer` e `impeccable` lidos do cache; `vercel-react-best-practices` só na F17 (§5 item 15) |
| G-24 Status nos docs | ✅ | `CLAUDE.md`, `docs/00-README.md`, `docs/40` e `docs/copy/06`: "IMPLEMENTED / ISOLATED / NOT PUBLISHED" e "INTEGRAÇÃO: BLOCKED UNTIL EXPLICIT USER REQUEST" |

**Resumo:** 23 cumpridos, 1 parcial (G-23: ferramentas ausentes neste ambiente), 0 não cumpridos. Nada foi publicado, integrado ao app nem commitado.

**Achados da revisão visual R3 (F8) que geraram correção:** a pauta cortava o texto como um risco (passou para o fundo da seção); o texto sobre o marca-texto herdava tinta clara no escuro (passou a `--on-alert`); a seta do hero não apontava para o balão; o "meio check" parecia falha; os passos do "Como funciona" encostavam nos retratos; o nó do passo ficava fora do título; o passo inativo reprovava contraste; a navbar vazava o título por baixo. **Do verificador:** cinco correções de texto e código (F-x das novas afirmações, "mesmo formato" da redação, CTA no `<noscript>`, barra fixa fora das Dúvidas, nota de validação do item da demo) e a limpeza dos números do registro.

## 9. Pendências (dependem do usuário ou de outros planos)

| ID | O quê | Situação / padrão adotado |
|---|---|---|
| **D-LP-1** | Confirmar que a página pode dizer "Começar não custa nada" e "Hoje você usa o Foca sem pagar nada e sem cartão" | Hoje é verdade (não existe cobrança). Ligado por `LP_FALA_DE_PRECO = true` em `landing/src/config.ts`; `false` troca a linha de risco e tira a pergunta "Precisa pagar?" (uma linha). **Publicar exige a confirmação** |
| **D-LP-2** | H1 "Você abre. O próximo passo já está escolhido." (relaciona-se com a D-1 do `copy/`, que manteve a frase do `08` §1) | Em uso. A frase do `08` §1 não aparece na landing |
| **D-LP-4** | Git: onde e quando commitar `landing/` (branch, worktree, junto do resto) | Nada de git foi feito. `landing/` está não rastreado (148 arquivos, ~2 MB sem `node_modules`) |
| **DG-1** | Criar o projeto Vercel `foca-landing` (Root Directory `landing`) e definir `VITE_APP_URL`, `VITE_SITE_URL` e `VITE_LP_INDEXABLE` | Não publicado. O build falha de propósito se `VITE_APP_URL` for localhost dentro do Vercel |
| **DG-2** | Teste em celular físico e com leitor de tela real | Não feito |
| **D-LP-5** | Aprovar a publicação (só então `VITE_LP_INDEXABLE=true`) | `noindex` por padrão |
| **V-1** | `OPENAI_API_KEY` no Vercel do app (tutor e foto funcionam em produção) | **Pendente.** A frase da foto ("se quiser, manda a foto de uma questão") continua no texto porque o recurso existe no app; sem a chave o tutor responde pelo `localFallback` (o retrato de S-7 é dessa resposta). Se a chave não for configurada antes de publicar, trocar `TEXTO_COM_FOTO` para `false` em `FocaAndHonesty.tsx` |
| **V-2** | Lições de 4 a 8 questões | **Conferido** nos 48 pacotes gerados (4 ou 5 questões cada) e na documentação do `25` |
| **V-3** | Exercícios de redação acessíveis na trilha | **Conferido** pela documentação (`26` §2, 134 lições legadas na trilha); FAQ diz "lições curtas" e que o Foca **não corrige** redação escrita |
| **V-4** | Regra do congelamento | **Conferido** em `store.ts`: +1 a cada 7 dias de atividade, máximo 2, cada um cobre **um** dia parado. O texto da S-5 foi ajustado para dizer isso ("cada um cobre um dia parado") |
| DEP-1 | `36` Fase 10 (migração de strings do app) | Depois dela, `bun run shots` recaptura os retratos. Hoje nenhum retrato mostra "Checkpoint", "60 segundos" nem `%` |
| DEP-3 | `copy/01` §4/§6 e `copy/06` §4 ainda proíbem "o nivelamento muda a sua trilha" | Não afeta a landing (a formulação usada é a do resultado do nivelamento) |
| DEP-4 | Domínio definitivo | Sem canonical/sitemap até `VITE_SITE_URL` |
| DEP-5 | Termos de uso e política de privacidade | Sem links no rodapé até existirem |
| DEP-7 | Medição de conversão | Só o barramento local; provedor precisa de spec própria (público menor de idade) |
| Produto | O `/quiz` tem 9 passos antes da primeira atividade | Maior atrito depois do clique (F16); decisão do produto |
| Produto | `/progress` e a home `/trilha` ainda mostram "Domínio", "Dominado", "Lacuna", `%`, "Só 60 segundos", "~N min" | Por isso não viraram retrato. Migração é o `36` Fase 10 |
