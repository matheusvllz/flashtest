# Logos e expressões da Foca — originais

Arte final da cabeça da Foca. Logos **atualizados em 29/09/2026** (registro em `docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md`, "Troca do logo da Foca") e **as 8 expressões oficiais entregues no mesmo dia** (registro em `docs/historico/iniciativas/44-45-integracao-web/45-registro-execucao-integracao.md` §5; sistema em `docs/historico/iniciativas/44-45-integracao-web/44-plano-integracao-produto-web.md` §6). Referência visual em `docs/design/brand/foca-design-system-2026-09-28.html`.

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

Os 8 PNGs oficiais (1254×1254, fundo transparente), com os nomes oficiais: `acolhedora`, `entediada`, `surpresa`, `desapontada`, `empolgada`, `orgulhosa`, `cobrando`, `neutra`. Registro tipado em `src/lib/brand/foca-expressions.ts` (fallback `neutra`); quando usar cada uma: `docs/historico/fundacao/15-mascote-e-voz.md` §5. Derivados: `public/branding/foca/expressoes/<nome>-{96,320}.{webp,png}`.

Recorte quadrado: calculado pelo gerador **por arquivo**, a partir da caixa de alfa. Regras: nunca esticar, rotacionar ou recolorir (`docs/design/sistema-rabisco.md` §8.2).

## Corpo inteiro (`corpo/`)

`foca-corpo-original.jpg` — Foca de corpo inteiro, de frente, colorida (1254×1254, JPEG sem transparência, fundo preto). Anexada pelo proprietário na conversa de 02/10/2026 e salva sem alteração (SHA-256 `5a3c337b5a5412fc619339cb4ade3cf2583bc80a54bf9497301b35c8ca29323a`). É a **referência** para a versão vetorial em camadas usada pelo `FocaMark` com `forma="corpo"` (spec 50 §5.8, T-50.3.1); nunca é servida diretamente. A cabeça, o logo e o ícone institucional continuam vindo dos arquivos acima.
