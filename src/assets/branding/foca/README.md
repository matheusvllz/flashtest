# Logos da Foca — originais

Arte final da cabeça da Foca. **Atualizada em 28/09/2026** (design system `docs/brand/foca-design-system-2026-09-28.html`): a cabeça foi redesenhada e os 6 arquivos agora têm **480×480 px** (antes 2000×2000). Os derivados maiores que ~340 px (`foca-line-*-720`, `icon-512`, `og-image`) são ampliados a partir dessa fonte e ficam levemente macios — trocar pelos originais de alta resolução quando existirem e rodar o script de novo. Estes arquivos são a FONTE; o app
serve os derivados de `public/branding/foca/`, gerados por `scripts/gerar-logos-foca.ps1`.
Nunca importar estes PNGs diretamente no código.

| Arquivo | Conteúdo | Fundo | Use sobre |
|---|---|---|---|
| foca-color-transparent.png | colorida (principal) | transparente | claro e escuro |
| foca-color-on-white.png | colorida | branco opaco | redes sociais / impressão |
| foca-line-light-transparent.png | contorno branco | transparente | escuro (marca d'água) |
| foca-line-light-on-black.png | contorno branco | preto opaco | referência / impressão |
| foca-line-dark-transparent.png | contorno preto | transparente | claro (marca d'água) |
| foca-line-dark-on-white.png | contorno preto | branco opaco | referência / impressão |

Recorte quadrado que centraliza a cabeça (igual nas 6): calculado pelo script a partir da caixa de alfa da arte colorida transparente (hoje x=76 y=70 w=338 h=338; o recorte fixo 320,287,1410 era da arte antiga de 2000×2000).
Regras: nunca esticar, rotacionar ou recolorir. Ver docs/09-branding.md §2.

## Expressões (docs/15-mascote-e-voz.md §5, docs/18-plano-reestilizacao-rabisco.md §8)

O `FocaMark` (`src/components/brand/FocaMark.tsx`) aceita uma prop `expression`
com 8 valores. A arte final de cada uma ainda não foi entregue — enquanto
`expressoes/<expressao>.png` não existir aqui, `scripts/gerar-logos-foca.ps1`
usa `foca-color-transparent.png` (a arte neutra) como fallback pra todas, então
nada quebra: a expressão simplesmente ainda não muda visualmente.

Para adicionar a arte de uma expressão, colocar o PNG (mesmo tamanho e enquadramento, mesmo recorte
das 6 artes acima, mesmo enquadramento) em `expressoes/<expressao>.png` e rodar
o script de novo — ele passa a usar o arquivo novo automaticamente.

| Expressão | Quando (`docs/15` §4/§5) |
|---|---|
| `neutra` | Padrão, splash, header do balão |
| `cobrando` | Streak em risco, ausência |
| `orgulhosa` | Acerto, fim de aula bom, meta batida |
| `empolgada` | Streak novo, level up, boas-vindas |
| `desapontada` | Aula/lição abandonada no meio |
| `surpresa` | Aha moment, acerto difícil |
| `entediada` | Estados vazios, 404 |
| `acolhedora` | Retorno depois de sumir — **nunca** com traço de cobrança |
