# 43 — Registro de execução da landing v2 (segunda direção criativa)

> Norma: [42-plano-landing-v2-direcao-criativa.md](42-plano-landing-v2-direcao-criativa.md). Base anterior: [40](40-plano-landing-page-marketing.md) (plano) e [41](41-registro-execucao-landing-page.md) (registro da v1).
>
> **Estado:** `LANDING PAGE: INTEGRATED` desde 29/09/2026 ([`45`](45-registro-execucao-integracao.md)); os caminhos `landing/...` deste registro agora são `src/marketing/...`. Na época deste registro: `V2 IMPLEMENTED / ISOLATED / NOT PUBLISHED`. Executado em 29/09/2026 (Opus 5.5), no mesmo turno do pedido, sem commit. Nada fora de `landing/` e `docs/` foi alterado.

## 1. Auditoria da v1 (o que motivou a v2)

- **Copy:** promessa certa ("o próximo passo já está escolhido"), mas a página abria pelo produto e não pela dúvida do João. Três lugares falavam de limitação ("O que o Foca não faz", "O Foca não substitui a aula", "O Foca não corrige a redação que você escreve") e dois prometiam o protótipo, não o produto ("Sem e-mail e sem senha", "Neste aparelho, no navegador").
- **UX:** "Como funciona" era uma pilha de 5 passos com 5 retratos; "O que você já tem" repetia a cena em duas listas; a Foca aparecia em três seções sem uma história entre elas.
- **Visual:** limpo e fiel ao design system, mas quase toda seção era título + parágrafo + retrato estático. Nenhum momento marcante.
- **Movimento:** só entrada de bloco (sobe 16 px) e um celular fixo que trocava de imagem. Nada contava o produto.
- **CRO:** CTA "Começar agora" sem redução de risco além de "sem e-mail e sem senha" (que a v2 não pode mais dizer).
- **Técnica:** sólida (Lighthouse 98/100/100, ilhas, CSP). O React entrava no JS inicial (74,2 kB gz) só para hidratar o "Como funciona".

Classificação por seção: `42` §2.

## 2. O que mudou

### Estratégia e copy (skills: `ogilvy-copywriting` carregada; `copywriting`, `copy-editing` e `humanizer` lidas do cache, como manda `copy/06` §6)

| Antes | Depois | Por quê |
|---|---|---|
| H1 "Você abre. O próximo passo já está escolhido." | **"Por onde eu começo? O Foca já escolheu."** | A pergunta é a do João (`14` §3 e §7, "Nem sei por onde começar"); a resposta traz a marca e a promessa (Ogilvy: título com marca + promessa, sem negativa) |
| Eyebrow "Preparação para o ENEM" | "App de estudo para o ENEM" | Em 5 segundos diz o tipo de produto |
| CTA "Começar agora" + "Sem e-mail e sem senha. Começar não custa nada." | **"Começar grátis"** + "Você conta qual é a sua prova e o primeiro passo já aparece." | Decisões U-2 e U-3; a linha de apoio diz o que acontece depois do clique (passada "Zero Risk") |
| Semana de 5 dias | 6 dias, com a sexta "no feed, a rotina perfeita de outra pessoa" | `14` §2 literal: a sexta é a comparação com o feed |
| "O que o Foca não faz" (3 negativas) | **Removida** (U-1) | — |
| "A Foca explica quando você pede." | **"Errou? Entende antes de seguir."** | Benefício: entender sem sair do fluxo |
| FAQ com conta, aparelho, MEC | FAQ com "É grátis?" e "Já uso videoaula e apostila. Pra que o Foca?" | Só respostas afirmativas; MEC fica no rodapé ("projeto independente") |
| Fechamento "O próximo passo já está escolhido." | "Seu próximo passo já está escolhido." | Rima com o hero |

Passadas do `copy-editing` feitas na página renderizada (não no arquivo): clareza, voz, "so what", prova (só o produto em ação: as telas reais), especificidade ("4 a 8 questões", "7 dias", "até 2"), emoção (culpa → alívio, `14` §6), risco zero (grátis + o que acontece depois). `humanizer`: sem "não X, é Y", sem travessão, sem fechamento de efeito; tríades só onde há três mecanismos reais (os três tipos de motivo do planner).

### Seções

| Seção | Status |
|---|---|
| S-1 Hero | **Refeita**: pergunta + resposta, tela real em HTML com a Foca e o motivo, bilhetes do material do João em volta |
| S-2 A semana | **Melhorada**: 6 dias, notas à mão, escrita pelo scroll |
| S-3 Como funciona | **Substituída** pela história presa (5 cenas) |
| S-4 Tenta uma | **Mantida** (única interação; CTA "Começar grátis") |
| S-5 Errou? | **Nova** (substitui "A Foca" + "O que o Foca não faz") |
| S-6 Parou uns dias? | **Melhorada**: frase de alívio + calendário escrito pelo scroll |
| O que você já tem | **Removida** (virou a cena 1 da história e uma FAQ) |
| Dúvidas, Fechamento, Rodapé | **Revistos** |

## 3. Movimento

Linguagem (`42` §6.2): papel (bilhetes pousam com 3 a 5 % de passagem), caneta (traços por `stroke-dashoffset`), marca-texto (varre da esquerda), interface (easing do próprio app, botão afunda 3 px), a Foca (pop, nunca girada). Entradas `power3.out`, saídas `power2.in` e mais curtas, scrub 0,4 a 0,5 s, sem snap.

| Momento | O que o João entende | Implementação |
|---|---|---|
| **HM-1 Abertura** | O material dele em volta; na tela, a escolha aparece com o motivo | CSS no load: H1 sobe (sem esconder, LCP), marca-texto varre, bilhetes pousam, a Foca e o balão do motivo aparecem, título e botão chegam, anotação "o motivo vem junto" desenha a seta |
| M-Semana | A semana vai esvaziando | GSAP scrub: dias entram, checks desenham, notas à mão "se escrevem" (clip-path); o scroll para cima desfaz |
| **HM-2 História** (scrollytelling) | Material vai pro canto → prova → nivelamento em faixas → próximo passo com motivo → revisão e faixa que anda | Seção presa por `position: sticky` nativo (sem pin do GSAP), timeline única com scrub: 5 cenas em unidades de cena, trocas sobrepostas (legenda e tela saem e entram juntas), pontos de progresso, traço azul da pilha ao celular, anotações à mão, faixa de "Base em construção" para "No caminho" (variável CSS `--f`) |
| **HM-3 Errou?** | Errou, entende ali mesmo e continua | GSAP por tempo ao entrar (reinicia ao voltar): folha de feedback sobe, "Explicar melhor" afunda, balão da Foca sobe, pedido do aluno, "digitando", resposta, sugestões, anotação "sem sair da lição" |
| M-Recomeço | O dia parado fica coberto | GSAP scrub: três checks, o dia fica vazio, o floco cai e cobre, a volta, "sequência mantida" |
| M-Fechamento | Rima com o hero | CSS quando a folha aparece: marca-texto, a Foca e o balão |

**Celular (< 1024 px):** a história tem layout próprio: título pequeno e pontos em cima, celular largo que "sobe" da borda de baixo, legenda como folha por cima da parte de baixo do celular, 3 bilhetes em vez de 6, trecho por cena menor (60 svh contra 70), sem traço azul nem anotação da faixa. Sem cena presa se a tela estiver deitada ou muito baixa. A barra fixa de CTA some durante a história (cobriria a legenda).

**Reduzido / sem JS / GSAP bloqueado / leitor chegando pela âncora:** a história não prende; cada cena é legenda + tela final, empilhadas. A sequência do erro mostra a conversa já aberta. Nada fica escondido (teste estático e E2E).

**Skills de movimento usadas:** `motion-design` (carregada: pilares, personalidade, durações, 1/3 dos elementos em movimento); da pasta `edição Videos`: `remotion-best-practices` → `remotion-markup` (`timing.md`: intervalos com clamp e `bezier(0.16,1,0.3,1)`/spring sem quique; `transitions.md`: cenas sobrepostas como `TransitionSeries`; `multi-scene-video.md`: uma timeline por cena; `text-highlights.md`: marca-texto como anotação desenhada), `remotion-interactivity` (propriedades separadas de transform), `remotion-render` e `remotion-saas/player` (avaliadas e **descartadas** para a página: vídeo pré-renderizado ou `<Player>` não recuam com o scroll, não seguem o tema escuro e pesariam mais que o DOM), `watch` (método usado na revisão: rolagem gravada em vídeo pelo Playwright e quadros extraídos com ffmpeg, `assets-src/gravar.ts`); `faster-whisper`, `remotion-captions`, `remotion-maps` não se aplicam. GSAP: `gsap-scrolltrigger` e `gsap-performance` (lidas do cache).

## 4. Técnica

- **Telas do app em HTML** (`landing/src/components/app/screens.tsx`, `styles/app-screens.css`): atividade, pergunta de perfil, resultado do nivelamento, questão com folha de feedback, balão da Foca. Medidas em `em` sobre `cqw` (container query na moldura). Texto literal do app em `src/content/app-screens.ts`, testado contra `../src` (`tests/unit/app-screens.test.ts`: cada string existe no app; a questão, as alternativas, o gabarito e a explicação batem com `mat-porcentagem-conceito.json`; a resposta da Foca segue o template do `localFallback`). A resposta mostrada é a do app **sem** chave de IA (a mesma do retrato capturado); com a chave, a resposta real varia.
- **Retratos em imagem aposentados:** `ProductShot`, `content/shots.ts` e `public/lp/shots/` saíram. `bun run shots` continua capturando o app, agora para `assets-src/` (referência visual das telas em HTML).
- **React fora do JS inicial:** o "Como funciona" não é mais ilha; o React e o React DOM chegam num chunk junto com a primeira ilha (demo ou dúvidas), depois do `load`.
- **Modo história:** classe `html.lp-story-on`, posta por `motion/scroll.ts` só se o GSAP carregou antes de o leitor alcançar a seção e sem âncora apontando para ela ou depois dela (senão a página pularia). (Primeira versão usou `lp-story`, que colidia com a classe da própria seção; corrigido.)
- **Logos (pedido do usuário no meio da execução, 29/09/2026):** `bun run sync:brand` recopiou os derivados novos do app. Navbar e rodapé passaram do contorno (que agora é a pose de lado) para a **logo oficial, Foca de frente colorida** (`src/assets/branding/foca/README.md`). A imagem de compartilhamento (`bun run og`) foi refeita com a logo oficial no lugar do retrato do app.

## 5. Divergências e decisões

1. **Pin:** o `40` §13.1 proibia pin. A v2 prende **uma** seção com `position: sticky` nativo (sem `pin` do GSAP, sem snap, sem `normalizeScroll`); o teste de design só aceita `sticky` na navbar e na história.
2. **Orçamento de JS:** o chunk de movimento foi a **45,2 kB gz** (teto antigo 45). Aceito: o JS inicial caiu de 74,2 para **2,8 kB gz**, e o total transferido ficou igual (≈119 kB, todo depois do `load` exceto os 2,8).
3. **H1 fora da lista de candidatos do `40` §9.3:** troca pedida pelo usuário (revisão completa do hero); a promessa única continua no fechamento.
4. **D-LP-1 resolvida pelo usuário (U-3):** "Começar grátis" liberado. Preço, plano, "grátis para sempre" continuam proibidos (teste).
5. **F-4 e F-15 deixam de ser usadas** (U-2). A flag `LP_FALA_DE_PRECO` em `config.ts` ficou sem efeito na copy (mantida só para não quebrar importações antigas; pode sair).
6. **Uma frase nova da página que é da interface do app** ("Pronto. Sua trilha foi ajustada. Isso é um ponto de partida, não uma nota.") aparece dentro da tela refeita, literal do app; as regras de copy de marketing (sem "nota") valem para `copy.ts`, não para `app-screens.ts`.

## 6. Arquivos

Novos: `landing/src/sections/{Story,Errou}.tsx`, `landing/src/components/app/screens.tsx`, `landing/src/content/app-screens.ts`, `landing/src/styles/app-screens.css`, `landing/tests/unit/app-screens.test.ts`, `docs/42`, `docs/43`. Removidos: `sections/{HowItWorks,WhatYouHave,FocaAndHonesty}.tsx`, `components/ProductShot.tsx`, `content/shots.ts`, `public/lp/shots/`. Alterados: `copy.ts`, `Hero`, `TheScene`, `Comeback`, `Closing`, `Navbar`, `Footer`, `Landing`, `main.tsx`, `islands.tsx`, `Island.tsx`, `MarginNote`, `doodles`, `chrome-dom.ts`, `motion/scroll.ts`, `seo.ts`, `components.css`, `marketing-tokens.css`, `index.css`, `scripts/{make-og-image,sync-brand-assets,capture-product-shots}.ts`, testes unitários e E2E. Rascunhos (gitignorados): `landing/assets-src/{revisao.ts,gravar.ts,montar.ts,colunas.ts,revisao/,video/}`.

## 7. Números

| Verificação | Resultado |
|---|---|
| `bun run typecheck` | 0 erros |
| `bun test tests/unit` | **86 passando**, 0 falhando (10 arquivos; novo: `app-screens`) |
| `bunx playwright test` (5 projetos: 320, 390, 768, 1280, 1440) | **202 passando**, 43 puladas por desenho, 0 falhando |
| `bun run check:isolation` | OK |
| Lighthouse mobile (mediana de 3, Slow 4G + CPU 4×) | Performance **97** (97, 93, 98), Acessibilidade **100**, Boas práticas **100**, SEO 66 (`noindex`), FCP 1,62 s, **LCP 1,67 s** (era 2,27), CLS 0,000, TBT 167 ms |
| Lighthouse desktop | 100 / 100 / 100 / 66, LCP 0,37 s, CLS 0,001 |
| Tamanhos gz | JS inicial **2,8 kB**; React (depois do `load`, com as ilhas) 63,6 + 2,9 + 1,6; demo 2,6; dúvidas 0,6; movimento 45,2; CSS 10,4 (inline); HTML 19,7 |
| Console | 0 erros (desktop e celular, claro e escuro) |
| Revisão visual | capturas por ponto do scroll em 1440×900 e 390×844, claro e escuro; página inteira com movimento reduzido; vídeo da rolagem com a roda do mouse (avança e recua) |

O `lighthouse` via `bunx` estava com o cache quebrado (`debug` ausente); limpo o cache temporário, rodou a 13.5.0.

## 8. Critérios de aceite do pedido (29/09/2026)

| Critério | Estado |
|---|---|
| "O que o Foca não faz" e negativas equivalentes removidas | ✅ (teste de copy e E2E) |
| "Sem conta / sem e-mail / sem senha" removido | ✅ |
| CTA freemium ("Começar grátis") | ✅ |
| Copy baseada no João, guia de copy e design system respeitados | ✅ (persona `14` citada linha a linha; tokens só por variável, teste) |
| Skills do SDD e da pasta `edição Videos` usadas | ✅ (§3) |
| 2 a 3 momentos fortes + uma narrativa visual + scroll-driven | ✅ HM-1, HM-2, HM-3 |
| Movimento desktop e celular adaptados | ✅ (§3) |
| Produto demonstrado, menos screenshot estático | ✅ (nenhuma imagem de tela na página) |
| Hero e narrativa refinadas, CTA claro | ✅ |
| Nada inventado (números, depoimentos, features, claims) | ✅ (telas testadas contra o app) |
| Performance, acessibilidade, reduced motion, build | ✅ (§7) |
| Desktop e celular revisados | ✅ |
| Sem integração e sem alteração no app | ✅ |
| Não parece template nem "AI SaaS" | Julgamento: papel pautado, bilhetes à mão, marca-texto, caneta azul como caminho e a tela real do app são específicos do Foca; sem gradiente, glow, glass ou bento |

## 9. Pendências

- **Usuário:** publicar (projeto Vercel com Root Directory `landing`, variáveis `VITE_*`), domínio, `VITE_LP_INDEXABLE=true`; `OPENAI_API_KEY` no app (sem ela, tirar a frase da foto em `Errou.tsx`, `TEXTO_COM_FOTO`).
- **Manual:** celular físico de gama média (FPS da história presa), leitor de tela de verdade.
- **Arte:** as 8 expressões da Foca ainda não existem; quando chegarem, a Foca da história pode reagir por cena (hoje só a expressão neutra).
- `LP_FALA_DE_PRECO` pode sair de `config.ts` numa limpeza.
