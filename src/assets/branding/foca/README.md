# Logos e expressões da Foca — originais

Arte final da cabeça da Foca. Logos **atualizados em 29/09/2026** (registro em `docs/37-registro-execucao-qualidade.md`, "Troca do logo da Foca") e **as 8 expressões oficiais entregues no mesmo dia** (registro em `docs/45-registro-execucao-integracao.md` §5; sistema em `docs/44-plano-integracao-produto-web.md` §6). Referência visual em `docs/brand/foca-design-system-2026-09-28.html`.

**A logo oficial é a `Logo Oficial.png`: a Foca de frente, colorida.** As outras são variações de apoio e nunca a substituem como marca.

Estes arquivos são a FONTE; o app serve os derivados de `public/branding/foca/`, gerados por **`bun scripts/gerar-marca.ts`** (bun + sharp; substituiu o antigo `gerar-logos-foca.ps1`). Nunca importar estes arquivos diretamente no código.

## Logos

| Arquivo | Conteúdo | Tamanho | No app (derivado) |
|---|---|---|---|
| `Logo Oficial.png` | **oficial** — frente, colorida | 1254×1254 | `foca-color-96/320` (PNG + WebP), ícones (sobre `--mar`), `og-image` |
| `Logo Oficial Contorno preto.png` | frente, contorno preto | 1254×1254 | — (material impresso) |
| `Logo Oficial De lado.png` | lado, colorida | 2000×2000 | — |
| `Logo de lado Contorno Preto.png` | lado, contorno preto | 2000×2000 | `foca-line-dark-720` (marca d'água do claro) |
| `Logo de lado Contorno Branco.png` | lado, contorno branco | 2000×2000 | `foca-line-light-720` (marca d'água do escuro) |
| `Logo Oficial De Lado Vetorizada.svg` | lado, colorida, vetor | viewBox 2000 | — (impressão) |
| `Logo Contorno Preto Vetorizada.svg` | lado, contorno preto, vetor | viewBox 2000 | — (impressão) |

## Ícone institucional (regra de marca permanente, 29/09/2026)

Quando a marca aparece **só como ícone** (favicon, ícone de app, PWA, atalho, apple-touch, og do produto): **logo oficial sobre o azul oficial `--mar`**, lido do `src/styles.css` pelo gerador (nunca um azul digitado à mão). Derivados: `favicon.ico` (16/32/48), `favicon-16/32/48.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (cabeça dentro da zona segura), `og-image.png`, e o `public/site.webmanifest`. **Expressões da mascote nunca viram ícone.**

## Expressões (`expressoes/`)

Os 8 PNGs oficiais (1254×1254, fundo transparente), com os nomes oficiais: `acolhedora`, `entediada`, `surpresa`, `desapontada`, `empolgada`, `orgulhosa`, `cobrando`, `neutra`. Registro tipado em `src/lib/brand/foca-expressions.ts` (fallback `neutra`); quando usar cada uma: `docs/15-mascote-e-voz.md` §5. Derivados: `public/branding/foca/expressoes/<nome>-{96,320}.{webp,png}`.

Recorte quadrado: calculado pelo gerador **por arquivo**, a partir da caixa de alfa. Regras: nunca esticar, rotacionar ou recolorir (`docs/18-plano-reestilizacao-rabisco.md` §8.2).
