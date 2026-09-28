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
  nevoa: "#737075"
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
> 2. [18-plano-reestilizacao-rabisco.md](18-plano-reestilizacao-rabisco.md) — o design system completo, componente a componente (executado; registro em [19](19-registro-execucao-rabisco.md)).
> 3. [brand/foca-rabisco-branding.md](brand/foca-rabisco-branding.md) — a direção de marca.
>
> O frontmatter lista **só a paleta clara**. O modo escuro existe (`.dark` em `styles.css`) e é obrigatório: todo token novo nasce como variável base em `:root` **e** `.dark`, referenciada por `--color-*` em `@theme inline` — nunca hex literal no `@theme inline` (o Tailwind v4 grava o literal e a classe ignora `.dark`). `docs/09-branding.md` (paleta Ártica) é **histórico**.
>
> Refinamento preserva; redesign substitui — e **redesign da identidade não está autorizado** sem spec aprovada (ver [docs/ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md)).

## Overview

"O caderno rabiscado." Um app de ENEM que se recusa a parecer material escolar: fundo de papel, tinta de grafite, e uma caneta azul que só aparece quando há ação ou conquista de verdade. A sensação-alvo é *tédio produtivo* — nem euforia de startup, nem seriedade de plataforma de curso (`brand/foca-rabisco-branding.md`).

Modo dominante: **Operate** (o aluno completa uma tarefa curta). Landing e LP do link da bio são **Persuade** e ficam fora do app.

Os dez princípios do `18` §3 são a régua de qualquer decisão visual; os que mais pegam agentes desprevenidos: *papel, não painel* · *um azul, com regras de reserva* · *recompensa é marca-texto* · *borda antes de sombra* · *cor nunca é o único sinal* · *um CTA primário por tela* · *nenhum contador que o store não sustente*.

## Colors

| Papel | Token CSS | Regra |
|---|---|---|
| Grafite (primária) | `--color-abismo` | Texto forte, contorno, botão secundário. **Nunca fundo grande.** |
| Caneta (único accent) | `--color-mar` | Só ação, seleção, foco e progresso real. Nunca decorativa, nunca em ícone ilustrativo, nunca em texto corrido. |
| Caneta escurecida | `--color-mar-fundo` | Aresta do botão primário; texto/link azul sobre fundo claro. |
| Marca-texto (recompensa) | `--color-recompensa` | **Só** XP, streak, marco. É fundo com texto grafite — **nunca texto amarelo**. Aparece depois do feedback, nunca dentro dele. |
| Papel / cartões / borda | `--color-neve` / `--color-cards` / `--color-gelo` | Neutros. Use `bg-cards`, não `bg-white` (dark mode). |
| Texto secundário | `--color-nevoa` | Nunca abaixo de 12px. |
| Sucesso / Erro | `--color-success` / `--color-error` | **Só** feedback de resposta certa/errada. Título "Acertou" usa `--color-success-texto` (o verde base reprova contraste em texto). |

## Typography

- **Títulos:** Space Grotesk 700. **Corpo e UI:** Plus Jakarta Sans. **Dados** (XP, streak, cronômetro, "2/3", ranking): Space Mono 700 com `tabular-nums` (`font-mono`).
- Enunciado de questão é Plus Jakarta 500 17/26 — **não** Space Grotesk (geométrica cansa em três linhas).
- Mínimo em UI: 12px. Nenhuma fonte manuscrita em UI.
- Escala completa (Display → Dado) em `18` §6.2.

## Layout

- Mobile-first; `PhoneFrame` com largura máxima de 440px. QA em 320 (projeto Playwright `narrow`), 360, 390 e 440.
- Base 4px; gutter de página 20px (`px-5`); 16px entre cartões; 12px entre alternativas.
- Rodapé fixo com `env(safe-area-inset-bottom)`; CTA principal na zona do polegar, no rodapé.
- Bottom nav de 64px + safe area, 4 itens (Aprender, Praticar, Progresso, Perfil).
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

## Shapes

Raio único por papel: marcador 6px (`rounded-md`) · botão/input/alternativa 16px (`rounded-lg`, `--radius`) · cartão 20px (`rounded-xl`, `--radius-card`) · folha de baixo e modal 28px (`rounded-3xl`) · chip, barra, avatar, FAB, nó de trilha em pílula (`rounded-full`). `rounded-[Npx]` é proibido. "Redondo, não fofo."

## Components

- **Use o que existe antes de criar:** utilities em `styles.css` (`btn-primary`, `btn-abismo`, `btn-outline`, `btn-ghost`, `card-soft`, `card-press`, `chip`, `chip-on`, `ds-label`, `input-ds`, `sheet`, `skeleton`, `mark-texto`, `surface-pauta`, e o bloco `path-*`/`anim-halo` da trilha visual — docs/27/28), componentes em `src/components/ds/`, `src/components/learning/` (inclusive `src/components/learning/path/`, o caminho visual da home — `PathNode`, `PathConnector`, `ChapterBanner`, `ChapterSegment`, `SubjectPath`, `ChapterMilestone`, `FocusCallout`, `MarginDoodle`), `src/components/lessons/`, e o shadcn/ui completo em `src/components/ui/`.
- **Mascote:** sempre `<FocaMark expression=… />` (`src/components/brand/FocaMark.tsx`); falas via `src/lib/voz.ts`, nunca hardcoded.
- **Copy:** strings funcionais em `src/lib/copy.ts`; toda string nova entra também no inventário do `21`.
- Especificação por componente (atual → problema → novo → motivo): `18` §7.

## Do's and Don'ts

**Movimento (sistema, não decoração)** — tokens e keyframes em `styles.css`; racional em `16` §5 e `18` §6.6:
- Curvas: `--ease-out` (entradas), `--ease-bounce` (recompensa), `ease` 80ms (botão).
- Utilities existentes: `anim-slide-up` 280ms · `anim-pop-in` 320ms · `anim-xp` 600ms · `anim-shake` 180ms/4px · `anim-bump` 220ms · `anim-breathe` 2.4s loop · `anim-float-in` 400ms.
- Nada acima de 300ms em transição de tela; feedback em ~100ms, celebração em até ~900ms, depois o app deixa o aluno ir.
- `prefers-reduced-motion` zera tudo (bloco no fim de `styles.css`); a recompensa (cor, som, número) continua sem movimento.
- Motion hoje é **CSS puro + `tw-animate-css`**. Não existe biblioteca JS de animação no projeto; adicionar uma (GSAP, Motion) é decisão de spec.

**Do**
- Certo/errado sempre com ícone + palavra + cor.
- Seleção com borda 2px + peso 600, não só fundo.
- Alvo de toque ≥ 44×44 (botões 52, nav 64).
- Foco visível (`outline` 3px `mar`, offset 2).

**Don't**
- Azul-caneta como decoração, ícone ilustrativo ou texto corrido.
- Amarelo como cor de texto.
- Verde/vermelho fora de feedback de resposta.
- Grafite como fundo de área grande.
- Foca no header ou durante a questão.
- Sombra difusa em cartão ou botão.
- Hex literal em componente; token novo sem par em `.dark`.
- Rolagem infinita, recompensa aleatória, esconder o botão de sair (`16` §9).
