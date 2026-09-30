> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 42 — Landing page v2: segunda direção criativa (plano de execução)

> **Status:** plano de trabalho escrito e executado na mesma rodada, por pedido explícito do usuário (29/09/2026: "Crie o plano de melhoria, registre o que for necessário no SDD e execute-o integralmente agora"). Registro do que foi feito: [43-registro-execucao-landing-v2.md](43-registro-execucao-landing-v2.md).
>
> **Integrada ao app em 29/09/2026** ([`44`](../44-45-integracao-web/44-plano-integracao-produto-web.md)); o texto abaixo descreve a v2 ainda isolada.
>
> **Escopo (na época):** só `landing/` e documentos. **A landing continua isolada e não integrada ao app** (regra permanente do `CLAUDE.md` e do `40` §22). Nada em `src/`, rotas, `__root.tsx`, `styles.css`, `package.json` ou `vite.config.ts` da raiz.
>
> **Relação com o `40`:** o `40` continua valendo para arquitetura isolada, performance, SEO, segurança, acessibilidade e as regras de copy da §9.2. Este plano **prevalece** sobre o `40` nos pontos marcados "muda o `40`" abaixo (arquitetura de seções §11, mapa de animações §13.3, "sem pin" da §13.1, CTA "Começar agora", retratos em imagem §14, afirmações F-4, F-15 e bloco "O que o Foca não faz").

## 1. Decisões do usuário nesta rodada (29/09/2026)

| ID | Decisão | Efeito |
|---|---|---|
| U-1 | Remover a seção "O que o Foca não faz" e qualquer equivalente | Sai o bloco `naoFaz` e as frases negativas ("Não corrige", "O Foca não substitui a aula") de toda a página |
| U-2 | A landing representa o **produto final** (navegador, loja de apps): **não dizer que não precisa de conta** | Saem "Sem e-mail e sem senha", a FAQ "Preciso criar conta?" e a FAQ "Onde fica meu progresso?" (F-4 e F-15 deixam de ser usadas) |
| U-3 | Reduzir atrito pelo freemium: **"Comece grátis"** como direção | Resolve a D-LP-1 do `40`: a página pode dizer que começar é grátis. Continua proibido: preço, "grátis para sempre", "100% grátis", plano pago, Premium (`copy/06` §4) |
| U-4 | Página cinematográfica, com 2 a 3 momentos fortes de movimento, scrollytelling ligado ao scroll e adaptação própria no celular | Muda o `40` §13.1 ("sem pin"): passa a haver **uma** cena presa por `position: sticky` nativo, com scrub |
| U-5 | Usar as skills da pasta `edição Videos` para decidir o movimento | §6 |

## 2. Auditoria da v1 (resumo; detalhe no `43` §1)

| Item | Veredito | Por quê |
|---|---|---|
| H1 "Você abre. O próximo passo já está escolhido." | **IMPROVE** | Promessa certa (`copy/01` §5.3), mas começa pelo produto, não pelo João. A dor dele é a pergunta "por onde eu começo?" (`14` §3, §7) |
| Microcopy "Sem e-mail e sem senha. Começar não custa nada." | **REPLACE** | U-2 e U-3 |
| Hero com retrato estático (AVIF) | **REPLACE** | Tela real refeita em HTML: nítida em qualquer tela, sem imagem no caminho do LCP, e animável (o balão do motivo aparece) |
| S-2 A cena (a semana) | **KEEP + IMPROVE** | É a melhor copy da página (`14` §2 literal). Falta movimento que conte a semana e a sexta do feed (`14` §2) |
| S-3 Como funciona (5 passos + retratos) | **REPLACE** | Galeria de screenshots com texto do lado. Vira a cena principal: da pilha de material ao próximo passo, presa na tela e ligada ao scroll |
| S-4 Tenta uma | **KEEP + IMPROVE** | Única interação real; boa para CRO. Ganha moldura de celular e ponte narrativa para a seção seguinte |
| S-5 Parou uns dias? | **KEEP + IMPROVE** | Fala da culpa, que é o centro da persona (`14` §4, §6). Calendário passa a ser desenhado pelo scroll |
| S-6 O que você já tem | **REMOVE** | Duas listas estáticas; a mensagem ("continua usando o que já usa") vira a primeira cena da história e uma FAQ |
| S-7 A Foca + "O que o Foca não faz" | **REPLACE** | U-1. Vira "Errou? Entende antes de seguir.": sequência animada do "Explicar melhor" até a resposta da Foca, na tela real |
| S-8 Dúvidas | **IMPROVE** | Sai conta, aparelho e MEC (MEC fica no rodapé); entra "É grátis?" e "Já uso videoaula e apostila" |
| S-9 Fechamento | **KEEP + IMPROVE** | Rima com o hero; CTA "Começar grátis" |
| Movimento v1 | **IMPROVE** | Correto e leve, mas quase tudo é "sobe 16 px e aparece". Nenhum momento conta a história do produto |
| Performance/a11y v1 | **KEEP** | Lighthouse 98/100/100, ilhas de hidratação, CSP. A v2 não pode piorar isso |

## 3. Narrativa (a sequência que o João sente, sem que a página a diga)

1. **"É exatamente o meu problema."** Hero com a pergunta dele e a semana que desmancha.
2. **"Esse app entende como eu estudo."** A pilha de material que ele já tem vai para o canto; o Foca pede só a prova.
3. **"Melhor que organizar tudo sozinho."** Nivelamento em faixas, o próximo passo com o motivo, a revisão que volta sozinha.
4. **"Parece gostoso de usar."** Ele responde uma questão de verdade; depois vê a Foca explicando dentro da lição.
5. **"Posso voltar sem peso."** O congelamento cobre o dia parado.
6. **"Vou testar."** Começar grátis, o primeiro passo já escolhido.

## 4. Arquitetura da página v2 (muda o `40` §11)

| # | Seção | Layout | Momento de movimento |
|---|---|---|---|
| S-0 | Navbar | igual | — |
| S-1 | **Hero**: "Por onde eu começo? / O Foca já escolheu." | split; celular com a tela real em HTML e bilhetes de material em volta | **HM-1** abertura (CSS) |
| S-2 | **A semana** | faixa de 6 dias (Dom→Sex); vertical no celular | semana desenhada pelo scroll (scrub curto, sem prender) |
| S-3 | **A história** (`#como-funciona`) | cena presa (sticky) em fundo de "mesa"; legenda à esquerda, celular à direita; no celular, celular em cima e legenda embaixo | **HM-2** scrollytelling principal |
| S-4 | **Tenta uma** | cartão de questão em moldura de celular | microinterações |
| S-5 | **Errou? Entende antes de seguir.** | celular + texto | **HM-3** sequência do "Explicar melhor" |
| S-6 | **Parou uns dias?** | texto + calendário | calendário desenhado pelo scroll |
| S-7 | Dúvidas | acordeão | — |
| S-8 | Fechamento | folha centrada com a Foca | marca-texto + Foca |
| S-9 | Rodapé | igual | — |

CTA: um rótulo só, **"Começar grátis"**, em navbar, hero, depois da demo e fechamento, mais a barra fixa do celular (que some durante a história, a demo e o fechamento).

## 5. Copy (pipeline `copy/06` §6: ogilvy → copywriting → copy-editing → humanizer)

Plataforma mantida (`40` §9.1): promessa única "o próximo passo já está escolhido"; big idea "recomeçar custa quase nada porque a decisão já vem tomada". O que muda é **a porta de entrada**: a pergunta do João antes da promessa do Foca (Ogilvy: título com a marca e a promessa, público nomeado pela dor, sem negativa).

Afirmações permitidas continuam sendo a lista F-1…F-21 do `40`/`41`, **menos F-4 (sem e-mail e senha), F-15 (progresso no aparelho), F-19/F-20/F-21 (negativas)**, **mais**:

| # | Afirmação | Fonte |
|---|---|---|
| F-22 | Começar é grátis | Decisão U-3; `14` §9 ("freemium obrigatório"); não há cobrança no produto |
| F-23 | A Foca sabe de qual questão você está falando quando você pede ajuda | `COPY.tutor.falandoSobre`; `32` Fase 7 (contexto da questão no tutor) |
| F-24 | As telas mostradas são as do app (texto literal) | `landing/src/content/app-screens.ts`, testado contra `src/` |

Textos da interface do app que aparecem nas telas animadas ficam **fora** de `copy.ts`, em `app-screens.ts`, copiados literalmente do app (incluindo conteúdo pedagógico, que nenhuma skill de copy altera, `copy/05`). Um teste confere cada string contra o código do app.

## 6. Movimento

### 6.1 Skills usadas e o que cada uma decidiu

| Skill | Origem | Decisão que ela tomou aqui |
|---|---|---|
| `motion-design` | `.claude/skills` | Três pilares, personalidade (papel + UI calma), durações, 1/3 de elementos em movimento, camadas primária/secundária/ambiente |
| `remotion-best-practices` → `remotion-markup` (`timing.md`, `transitions.md`, `text-highlights.md`, `multi-scene-video.md`) | `edição Videos` | Modelo da cena: **quadro = progresso do scroll**, animação por intervalos com `clamp` (como `interpolate()`), easing `bezier(0.16,1,0.3,1)` para entradas, cenas que se sobrepõem na troca (como `TransitionSeries`), marca-texto como anotação desenhada, escala perceptual |
| `remotion-render`, `remotion-saas` (player) | `edição Videos` | **Avaliadas e descartadas para a página**: vídeo pré-renderizado ou `<Player>` pesariam mais, não voltam com o scroll e não se adaptam ao tema escuro nem à largura. Nenhuma cena da landing é linear o bastante para justificar vídeo |
| `watch` (método de quadros com ffmpeg) | `edição Videos` | Revisão do movimento: gravar a rolagem com Playwright e extrair quadros com ffmpeg para inspecionar tempo e continuidade |
| `faster-whisper`, `remotion-captions`, `remotion-maps` | `edição Videos` | Não se aplicam (sem áudio, sem mapa) |
| `gsap-scrolltrigger`, `gsap-performance` | cache `gsap-skills` | Timeline única no trigger da seção, `scrub` numérico, criação em ordem de página, só `transform`/`opacity`, limpeza por `matchMedia` |
| `design-taste-frontend`, `web-design-guidelines` | `.claude/skills` | Direção visual e revisão de acessibilidade/reduced motion |
| `ogilvy-copywriting` (+ `copywriting`, `copy-editing`, `humanizer` do cache) | local + cache | Copy |

### 6.2 Linguagem de movimento do Foca

- **Materiais:** papel (bilhetes, cartões: overshoot 3 a 5 %), caneta (traços desenhados por `stroke-dashoffset`), marca-texto (varre da esquerda), interface do app (o próprio easing do app, `--ease-out`, sem overshoot), a Foca (pop com `--ease-bounce`, **nunca girada nem esticada**).
- **Easing assinatura:** `--ease-out` (0.2, 0.8, 0.2, 1) em 80 % dos casos; entradas de cena `power3.out`; saídas `power2.in`, 30 % mais curtas.
- **Durações:** 180 / 320 / 560 ms; traço 420 a 700 ms; stagger 60 a 80 ms, total < 500 ms.
- **Scroll:** `scrub: 0.5` (segue o dedo com meio segundo de inércia), sem snap, sem normalizar o scroll, sem listener de scroll.
- **Botão:** afunda 3 px como no app (aresta), nunca pulsa em loop.

### 6.3 Mapa de animações (muda o `40` §13.3)

| ID | O que o João entende | Formato | Scroll? | Celular | Reduced motion / sem JS |
|---|---|---|---|---|---|
| HM-1 Abertura | A bagunça em volta, e a escolha aparece na tela | CSS keyframes no load (DOM) | não | 2 bilhetes em vez de 4 | tudo pronto, parado |
| M-Semana | A semana vai esvaziando | GSAP scrub curto (SVG + DOM) | sim, sem prender | lista vertical | semana completa, parada |
| HM-2 História | Material vai pro canto; prova → nivelamento → próximo passo com motivo → revisão e faixa | GSAP timeline com scrub numa seção `sticky` (DOM) | sim, presa | layout vertical, 3 bilhetes, trecho mais curto | passos empilhados com as telas finais |
| M-Demo | Responder é igual ao app | CSS + estado React | não | igual | igual, sem transição |
| HM-3 Explicar melhor | Errou, entende ali mesmo e continua | GSAP timeline por tempo, dispara ao entrar e reinicia ao voltar | gatilho | igual, menor | estado final da conversa |
| M-Recomeço | O dia parado fica coberto | GSAP scrub curto | sim, sem prender | igual | calendário pronto |
| M-Fechamento | Rima com o hero | CSS ao entrar | gatilho | igual | pronto |

Formatos avaliados e descartados: vídeo WebM/AV1, sequência de quadros, Lottie, Canvas (sem ganho sobre DOM para telas de interface; peso e tema escuro contra).

## 7. Técnica

- Telas do app refeitas em HTML (`src/components/app/`): tela de atividade, pergunta de perfil, resultado do nivelamento, questão com folha de feedback, balão da Foca. Medidas em `em` sobre `cqw` (container query) para escalar com a moldura.
- História: um DOM só. Sem `html.lp-story` (sem JS, JS falhou, movimento reduzido, ou a seção já passou quando o GSAP chegou), cada cena é bloco de texto + tela emoldurada. Com `html.lp-story` (posto pelo `scroll.ts` só depois de o GSAP carregar e antes de o leitor chegar à seção), a seção ganha altura e a área presa sobrepõe cenas e telas.
- React só hidrata a demo e as dúvidas (a ilha "como-funciona" sai: a história é HTML + GSAP).
- Testes atualizados: regras de copy (CTA, H1, grátis), telas literais do app, cores de feedback nas telas do app, `sticky` permitido só na história, e E2E de estrutura, demo, movimento e acessibilidade.

## 8. Ordem de execução

1. Copy (`copy.ts`, `app-screens.ts`) · 2. Kit de telas · 3. Hero · 4. Semana · 5. História (estático) · 6. Demo · 7. Seção Foca · 8. Recomeço, FAQ, fechamento · 9. Movimento (CSS do hero, `scroll.ts` com as cenas) · 10. Celular · 11. Testes unitários e E2E · 12. Build, Lighthouse, axe · 13. Revisão visual por capturas e quadros de vídeo · 14. Revisão de copy na página · 15. Registro (`43`), `00-README`, `41`, `CLAUDE.md`, memória.

## 9. Critérios de aceite

Os 37 itens do pedido do usuário (29/09/2026, §52), verificados um a um no `43` §9, mais: Lighthouse mobile Performance ≥ 90, Acessibilidade 100, CLS < 0,05; JS de entrada ≤ 75 kB gz; axe sem violações nos dois temas; `check:isolation` passando; nenhum arquivo fora de `landing/` e `docs/` alterado.
