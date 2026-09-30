# Índice de referências da marca

> **Por que este arquivo existe.** A automação **não guarda uma cópia do design system** — cópia envelhece e passa a mentir. Ela guarda este índice (onde está cada fonte, e qual ganha quando divergem) e o `snapshot.json`, que é **gerado** das fontes reais e carrega o hash de cada uma.
>
> Antes de produzir qualquer conteúdo: `bun run marca:sync`. Se um hash mudou desde o último conteúdo, releia a fonte que mudou antes de desenhar.

## Ordem de autoridade

Quando duas fontes divergirem, vence a de cima.

| # | Fonte | Caminho (no repo do Foca) | O que manda |
|---|---|---|---|
| 1 | Pedido do usuário nesta sessão | — | Tudo |
| 2 | Tokens reais | `src/styles.css` (bloco `:root` e `.dark`) | Cor, raio, layout. **Se `docs/DESIGN.md` divergir, este vence** |
| 3 | Guia de copy | `docs/COPY.md` → `docs/copy/01…06` | Voz, tom, glossário, o que nunca prometer |
| 4 | Resumo de produto | `docs/PRODUCT.md` (seção *Evidence on Hand*) | O que existe e o que não pode ser inventado |
| 5 | Resumo de design | `docs/DESIGN.md` | Princípios, elevação, don'ts |
| 6 | Design system completo | `docs/18-plano-reestilizacao-rabisco.md` | Componente a componente |
| 7 | Direção de marca | `docs/brand/foca-rabisco-branding.md` | Paleta, arquétipo, tipografia |
| 8 | Mascote e voz | `docs/15-mascote-e-voz.md` §4 e §5 | Onde a Foca aparece; as 8 expressões |
| 9 | Referência visual | `docs/brand/foca-design-system-2026-09-28.html` | Conferência visual (logos de 29/09/2026) |
| 10 | Persona | `docs/14-persona-joao.md` | Para quem é cada post |
| 11 | Marca no código | `src/lib/brand.ts` (`BRAND.tagline`, `BRAND.description`) | Tagline vigente |

## Assets — arquivos reais, conferidos

| O que | Caminho | Uso nesta automação |
|---|---|---|
| **Logo oficial** (Foca de frente, colorida) | `public/branding/foca/foca-color-320.png` · original `src/assets/branding/foca/Logo Oficial.png` | Assinatura, fechamento, ícone |
| **Ícone isolado** | composto aqui: logo oficial sobre `--mar` (#2E6BFF), raio de card | Sempre que a marca aparece **só como ícone** (`docs/44` I-4). Nunca a expressão no lugar do ícone |
| Contorno claro / escuro (pose de lado) | `public/branding/foca/foca-line-light-720.png` · `foca-line-dark-720.png` | Marca d'água |
| **8 expressões** | `public/branding/foca/expressoes/<expressao>-320.png` (e `-96`) | Escolhidas pelo significado do momento (tabela abaixo) |
| Fontes | `public/fonts/*.woff2` | Carregadas por `file://` no render — sem requisição de rede |
| **Telas reais do app** | `assets-src/marketing/shots/*.png` (1170 px, 3×) | A única fonte de "print do produto". **Nunca inventar uma interface** |

### As 8 expressões e quando usar (`docs/15` §4/§5)

| Expressão | Quando |
|---|---|
| `neutra` | Padrão, capa, assinatura |
| `cobrando` | Sequência em risco — **em marketing, praticamente nunca**: cobrança afasta o João (`14` §4) |
| `orgulhosa` | Acerto, meta batida |
| `empolgada` | Começo, boas-vindas, sequência nova |
| `desapontada` | Algo largado no meio |
| `surpresa` | Descoberta, acerto difícil |
| `entediada` | Estado vazio, tédio de estudar |
| `acolhedora` | Retorno depois de sumir — **nunca** com traço de cobrança |

**Conferido em 29/09/2026:** as 8 artes existem e são distintas entre si (hash por arquivo em `snapshot.json`). Registro oficial da entrega: `src/assets/branding/foca/README.md` e `docs/45-registro-execucao-integracao.md` §5. O gerador dos derivados é `bun scripts/gerar-marca.ts` (na raiz; não é desta automação).

### Regras duras sobre a mascote

- Nunca esticar, rotacionar, recolorir ou redesenhar. Sempre quadrada, `object-fit: contain`.
- Nunca inventar uma expressão nova nem alterar a anatomia.
- A Foca aparece em momento emocional; **não** como decoração de canto em todo post.

## O que o `snapshot.json` guarda

Gerado por `ferramentas/marca/sincronizar.ts`:

- `cores` — todas as variáveis base do `:root` de `src/styles.css` (não os alias `--color-*`)
- `marca.tagline` / `marca.descricao` — lidos de `src/lib/brand.ts`
- `logos`, `expressoes`, `telasReais`, `fontesArquivos` — caminho + hash sha256 (16 chars)
- `fontesDocumentais` — hash de `styles.css`, `DESIGN.md`, `brand.ts`, `COPY.md`, `PRODUCT.md`

Cada conteúdo renderizado grava em `export/ordem.json` → `referenciasMarca` o `snapshotEm`, o hash do `styles.css` e o hash do logo oficial usados. É assim que se sabe, depois, contra qual versão da marca aquele post foi feito.

## Ausências registradas

Nada de marca está faltando hoje para post estático, carrossel e motion. Registrado por honestidade:

- Não existe arte de mascote de **corpo inteiro** nem em pose de ação — só a cabeça (de frente e de lado). Conteúdo que precisaria de corpo inteiro deve ser redesenhado, não improvisado.
- Não existe trilha sonora licenciada no repositório. Ver `estrategia/ESTRATEGIA-EDITORIAL.md` → *Áudio*.
- Não existem telas reais do app em modo escuro para todas as telas (há para 7 das 17).
