---
name: Foca — Rabisco na Margem
description: Grafite de lápis, papel pautado e uma caneta azul única — o caderno de quem rabisca na margem.
colors:
  grafite: "#3a3a3c"
  caneta: "#2e6bff"
  caneta-fundo: "#1e4fcc"
  caneta-clara: "#8fb0ff"
  papel: "#f6f5f1"
  borda-papel: "#e1dfda"
  papel-pautado: "#d6d6d4"
  nevoa: "#6E6B71"
  cards: "#ffffff"
  texto: "#26262a"
  marca-texto: "#d9a017"
  sucesso: "#2e9e5b"
  sucesso-texto: "#1f7a45"
  erro: "#c23b3b"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "28px"
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "22px"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  label:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.1em"
  data:
    fontFamily: "Space Mono, ui-monospace, SFMono-Regular, monospace"
    fontWeight: 700
rounded:
  marcador: "6px"
  sm: "10px"
  botao: "16px"
  card: "20px"
  folha: "28px"
  pilula: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  gutter: "20px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.caneta}"
    textColor: "{colors.cards}"
    rounded: "{rounded.botao}"
    height: "52px"
    padding: "0 20px"
  card:
    backgroundColor: "{colors.cards}"
    textColor: "{colors.texto}"
    rounded: "{rounded.card}"
    padding: "16px"
  chip:
    rounded: "{rounded.pilula}"
    height: "36px"
---

# Design — Foca

> **Autoridade.** Este arquivo é um **resumo para agentes** do design system. Não é a fonte normativa:
> 1. `src/styles.css` — tokens reais (claro e `.dark`) e as `@utility` (`btn-*`, `card-*`, `chip*`, `anim-*`). **Se um valor aqui divergir de `styles.css`, `styles.css` vence** e este arquivo precisa ser atualizado.
> 2. [18-plano-reestilizacao-rabisco.md](design/sistema-rabisco.md) — o design system completo, componente a componente (executado; registro em [19](historico/iniciativas/17-18-19-rabisco/19-registro-execucao-rabisco.md)).
> 3. [brand/foca-rabisco-branding.md](design/brand/foca-rabisco-branding.md) — a direção de marca. Referência visual atualizada: [brand/foca-design-system-2026-09-28.html](design/brand/foca-design-system-2026-09-28.html) — logos trocados em 29/09/2026; a logo oficial é a Foca de frente colorida (originais e uso em `src/assets/branding/foca/README.md`).
>
> O frontmatter lista **só a paleta clara**. O modo escuro existe (`.dark` em `styles.css`) e é obrigatório: todo token novo nasce como variável base em `:root` **e** `.dark`, referenciada por `--color-*` em `@theme inline` — nunca hex literal no `@theme inline` (o Tailwind v4 grava o literal e a classe ignora `.dark`). `docs/historico/fundacao/09-branding.md` (paleta Ártica) é **histórico**.
>
> Refinamento preserva; redesign substitui — e **redesign da identidade não está autorizado** sem spec aprovada (ver [docs/ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md)).

## Overview

"O caderno rabiscado." Um app de ENEM que se recusa a parecer material escolar: fundo de papel, tinta de grafite, e uma caneta azul que só aparece quando há ação ou conquista de verdade. A sensação-alvo é *tédio produtivo* — nem euforia de startup, nem seriedade de plataforma de curso (`brand/foca-rabisco-branding.md`).

Modo dominante: **Operate** (o aluno completa uma tarefa curta). A landing (`/`, `src/marketing/`) é **Persuade** e faz parte do mesmo produto desde 29/09/2026 (`44`/`45`): usa **os mesmos tokens** (base, via `var(--mar)`, `var(--gelo)`…) mais os **Marketing Design Tokens** (`--lp-*`, escala tipográfica de marketing, `docs/40` §12.8) em `src/marketing/styles/marketing.css`, carregado só pela rota `/`. Marketing pode ser cinematográfico (GSAP, scroll); o produto não.

Os dez princípios do `18` §3 são a régua de qualquer decisão visual; os que mais pegam agentes desprevenidos: *papel, não painel* · *um azul, com regras de reserva* · *recompensa é marca-texto* · *borda antes de sombra* · *cor nunca é o único sinal* · *um CTA primário por tela* · *nenhum contador que o store não sustente*.

## Colors

| Papel | Token CSS | Regra |
|---|---|---|
| Grafite (primária) | `--color-abismo` | Texto forte, contorno, botão secundário. **Nunca fundo grande.** |
| Caneta (único accent) | `--color-mar` | Só ação, seleção, foco e progresso real. Nunca decorativa, nunca em ícone ilustrativo, nunca em texto corrido. |
| Caneta escurecida | `--color-mar-fundo` | Aresta do botão primário; texto/link azul sobre fundo claro. |
| Marca-texto (recompensa) | `--color-recompensa` | **Só** XP, streak, marco. É fundo com texto grafite — **nunca texto amarelo**. Aparece depois do feedback, nunca dentro dele. |
| Papel / cartões / borda | `--color-neve` / `--color-cards` / `--color-gelo` | Neutros. Use `bg-cards`, não `bg-white` (dark mode). |
| Texto secundário | `--color-nevoa` | Nunca abaixo de 12px. `#6E6B71` no claro (4,8:1 sobre o papel) e `#A6A29A` no escuro; o `#737075` antigo reprovava AA (4,47:1, `36` T-08.9). |
| Sucesso / Erro | `--color-success` / `--color-error` | **Só** feedback de resposta certa/errada. Título "Acertou" usa `--color-success-texto` (o verde base reprova contraste em texto). |
| Texto sobre preenchimento | `--on-mar`, `--on-success`, `--on-error`, `--on-alert` (`text-on-*`) | Use no lugar de `text-white`/`text-abismo` sobre `bg-mar`, `bg-success-texto`, `bg-error` e `bg-recompensa`. Claro: branco (exceto `--on-alert` = grafite); escuro: tinta escura `#1C1B18`. Razão ≥ 4,5:1 medida em `tests/unit/contrast.test.ts` (`36` T-08.9). |
| Fundo de folha/modal | `--scrim` (`@utility scrim`) | `rgb(0 0 0 / 0.4)` no claro, `0.55` no escuro (o preto é fixo de propósito: scrim não inverte). Nunca `bg-black/40` nem `bg-abismo/40` (`36` T-08.4). |

## Typography

- **Títulos:** Space Grotesk 700. **Corpo e UI:** Plus Jakarta Sans. **Dados** (XP, streak, cronômetro, "2/3", ranking): Space Mono 700 com `tabular-nums` (`font-mono`).
- Enunciado de questão é Plus Jakarta 500 17/26 — **não** Space Grotesk (geométrica cansa em três linhas).
- Mínimo em UI: 12px. Nenhuma fonte manuscrita em UI.
- Escala completa (Display → Dado) em `18` §6.2.

## Layout

- Mobile-first. A largura da coluna vem de tokens em `styles.css` (`:root`): `--app-col` (telas com `AppShell`), `--reading-col` (players imersivos: aula, legado, atividade, nivelamento, `/quiz`, `/aha`), `--path-col` (caminho zigue-zague, fixo em 440 — a geometria de `path-layout.ts` é calibrada para 440) e `--nav-rail`. Abaixo de 768 px tudo é 440 (o mobile é idêntico ao histórico, e é aí que valem o `27` D-7 e o `18` de 440 px); 768–1023 px: 560/560; ≥ 1024 px: 600 (app) e 640 (leitura), `--nav-rail` 96. Regra do `36` §F.6, só em ≥ 768 px.
- **Desktop de primeira classe (`44` §5):** em ≥ 1280 px `--app-col` 680, `--reading-col` 720 e `--nav-rail` 232 (barra lateral com logo e rótulos); `--wide-col` (880 / 1000 / 1120 em ≥ 1600) para telas com painel de contexto ou grade; `--side-col` (painel de contexto); `--tutor-painel` (Foca IA como painel lateral direito; a coluna abre espaço via `html[data-tutor]`). `AppShell layout="wide"` + `desk-split`/`desk-main`/`desk-aside` (trilha: caminho no centro, "Seu dia" à direita, mesmo DOM do celular), `desk-colunas` (progresso, perfil), `EntryShell` (onboarding, login: painel da marca à esquerda). Folhas e rodapés numa tela larga ficam na largura do app (`--sheet-col`). Abaixo de 1024 px nada muda.
- `PhoneFrame variant="app" | "reading" | "wide"` declara `--frame-col`; o wrapper do `AppShell` declara `--frame-rail`. Elementos fixos (FAB do tutor, folhas, rodapés de `/quiz`/`/aha`, botão de voltar ao foco) se ancoram à coluna em que moram pelos utilitários `anchor-col-left/right/center` e `col-max-w` — nunca `13.75rem`, `left-1/2` com `440px` solto nem `max-w-[440px]` (`css-tokens.test.ts` falha). Borda lateral do frame: `@utility frame-border` (só ≥ 768 px; some no layout `wide`).
- QA em 320 (projeto Playwright `narrow`), 360, 390 e 440 (mobile), 640, 768, 1024 e 1440 (`layout.spec.ts`; projeto `desktop` 1280×800).
- Base 4px; gutter de página 20px (`px-5`); 16px entre cartões; 12px entre alternativas.
- Rodapé fixo com `env(safe-area-inset-bottom)`; CTA principal na zona do polegar, no rodapé.
- Bottom nav de 64px + safe area, 4 itens (Aprender, Praticar, Progresso, Perfil). A altura (`min-h-16` + borda de 2px) é o token `--bottom-nav-h`. A partir de 1024 px ela some e o `NavRail` (`src/components/NavRail.tsx`, 96px, lateral, mesmos 4 itens e `aria-label="Principal"`) a substitui: só um `nav` principal visível por vez.
- `min-h-[100dvh]`, não `100vh`. Inputs com fonte ≥ 16px (evita zoom no iOS). Nada de scroll horizontal fora das sugestões do chat.

## Elevation & Depth

Elevação por **aresta**, não por sombra difusa:

| Nível | Tratamento | Onde |
|---|---|---|
| 0 — papel | nada | fundo |
| 1 — cartão | borda 2px `gelo` | `card-soft` |
| 1b — cartão tocável | + `0 3px 0 gelo`; `:active` desce 3px | `card-press` |
| 2 — botão | aresta `0 4px 0 <cor escura>`; `:active` desce 4px | `btn-*` |
| 3 — flutuante | `0 8px 24px -8px rgb(38 38 42 / .25)` | FAB da Foca, folha de baixo, modal |

Nenhuma outra sombra.

O fundo escurecido que cobre a página atrás de folhas e modais é o token `--scrim`, não uma sombra (ver Colors).

## Shapes

Raio único por papel: marcador 6px (`rounded-md`) · botão/input/alternativa 16px (`rounded-lg`, `--radius`) · cartão 20px (`rounded-xl`, `--radius-card`) · folha de baixo e modal 28px (`rounded-3xl`) · chip, barra, avatar, FAB, nó de trilha em pílula (`rounded-full`). `rounded-[Npx]` é proibido. "Redondo, não fofo."

## Components

- **Use o que existe antes de criar:** utilities em `styles.css` (`btn-primary`, `btn-abismo`, `btn-outline`, `btn-ghost`, `card-soft`, `card-press`, `chip`, `chip-on`, `ds-label`, `input-ds`, `sheet`, `skeleton`, `mark-texto`, `surface-pauta`, e o bloco `path-*`/`anim-halo` da trilha visual — docs/27/28), componentes em `src/components/ds/`, `src/components/learning/` (inclusive `src/components/learning/path/`, o caminho visual da home — `PathNode`, `PathConnector`, `ChapterBanner`, `ChapterSegment`, `SubjectPath`, `ChapterMilestone`, `FocusCallout`, `MarginDoodle`), `src/components/lessons/`, e o shadcn/ui completo em `src/components/ui/`.
- **Casca, avisos e acessibilidade (`36`, `37`):** `NavRail`; `PersistenceBanner` (faixa fixa no topo do frame — nunca verde/vermelho de feedback); `useDialogA11y` em `src/hooks/` (foco inicial no título, trap de Tab, Escape, `inert` nos irmãos, `overflow` do `body` travado, foco volta ao disparador) usado por `BottomSheet` e pelo painel do tutor; `FeedbackSheet` com `acimaDaNav` (só `/study`, que tem `BottomNav` fixa); `CourseStep` (seleção de curso do `/quiz` e do Perfil).
- **Mascote:** sempre `<FocaMark expression=… />` (`src/components/brand/FocaMark.tsx`); sem `expression` é a logo oficial. As 8 expressões oficiais e onde cada uma entra: registro `src/lib/brand/foca-expressions.ts` e tabela do `15` §5 (erro → `acolhedora`, nunca `desapontada`/`cobrando`; fallback `neutra`). Troca com a Foca na tela = "piscar" (`.foca-piscar`), nunca crossfade. Na landing, `FocaTroca` faz o mesmo guiado pelo scroll. Falas via `src/lib/voz.ts`, nunca hardcoded.
- **Ícone da marca (regra permanente):** favicon, ícones de app/PWA, apple-touch e og do produto = **logo oficial sobre `--mar`**, gerados por `scripts/gerar-marca.ts` a partir do token; nunca uma expressão. Se a imagem falhar, o `FocaMark` fica oculto mantendo a caixa (sem ícone quebrado nem texto alternativo). Em fundo escuro use a variante de contorno claro (`/aha` troca a marca d'água por tema, com wrappers `dark:hidden`/`hidden dark:block` — o `display` inline do `FocaMark` vence qualquer classe).
- **Copy:** strings funcionais em `src/lib/copy.ts`; toda string nova entra também no inventário do `21`. Guia de escrita: [COPY.md](COPY.md).
- Especificação por componente (atual → problema → novo → motivo): `18` §7.

## Do's and Don'ts

**Movimento (sistema, não decoração)** — tokens e keyframes em `styles.css`; racional em `16` §5 e `18` §6.6:
- Curvas: `--ease-out` (entradas), `--ease-bounce` (recompensa), `ease` 80ms (botão).
- Utilities existentes: `anim-slide-up` 280ms · `anim-pop-in` 320ms · `anim-xp` 600ms · `anim-shake` 180ms/4px · `anim-bump` 220ms · `anim-breathe` 2.4s loop · `anim-float-in` 400ms.
- Nada acima de 300ms em transição de tela; feedback em ~100ms, celebração em até ~900ms, depois o app deixa o aluno ir.
- `prefers-reduced-motion` zera tudo (bloco no fim de `styles.css`); a recompensa (cor, som, número) continua sem movimento.
- Motion do produto é **CSS puro + `tw-animate-css`**. GSAP existe só na landing (`src/marketing/motion/`, aprovado pelo `40`/`42`, carregado depois do `load`); nunca em tela do produto. O que é comum às duas: easing, durações, botão que afunda pela aresta e o "piscar" da Foca.
- Desktop: hover só em `@media (hover: hover)` (`btn-outline`, `btn-ghost`, `card-press`, alternativas); atalhos de questão (`1`–`5`/`A`–`E`, `Enter`) por `useAtalhosDeQuestao`.

**Do**
- Certo/errado sempre com ícone + palavra + cor.
- Seleção com borda 2px + peso 600, não só fundo.
- Alvo de toque ≥ 44×44 (botões 52, nav 64). Controle visualmente menor (chip de 36px, link de texto) usa o `chip` ou `@utility tap-area` (área expandida por `::after`, sem mexer no layout); `layout.spec.ts` mede todos.
- Foco visível (`outline` 3px `mar`, offset 2).
- Diálogo com `useDialogA11y` (`role="dialog"`, `aria-modal`, `aria-labelledby`); `<button>` sempre com `type` explícito; campo sem rótulo visível com `aria-label`.

**Don't**
- Azul-caneta como decoração, ícone ilustrativo ou texto corrido.
- Amarelo como cor de texto.
- Verde/vermelho fora de feedback de resposta.
- Grafite como fundo de área grande.
- Foca no header ou durante a questão.
- Sombra difusa em cartão ou botão.
- Hex literal em componente; token novo sem par em `.dark`.
- `var(--color-*)` em `style` inline ou atributo SVG (use a variável base: `var(--mar)`, `var(--gelo)`; `tests/unit/css-tokens.test.ts` falha).
- `text-white` sobre preenchimento colorido (use `text-on-*`).
- Largura de coluna ou offset de elemento fixo com `440px`/`13.75rem` escrito à mão.
- Rolagem infinita, recompensa aleatória, esconder o botão de sair (`16` §9).
