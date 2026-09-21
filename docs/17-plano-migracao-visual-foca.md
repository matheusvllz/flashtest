# 17 — Plano de execução: identidade visual Foca no código

Status: 🟢 **pronto para executar** (escrito em 20/09/2026, a partir de auditoria real do código).
Executa o que `09-branding.md` §8 levantou. Público deste arquivo: **o modelo de IA que vai fazer as alterações**. Ele não deve tomar decisões de design — todas já estão tomadas aqui. Se algo não estiver coberto, **pare e pergunte**, não invente.

---

## 0. Regras globais para o executor (ler antes de tudo)

1. **Executar as fases na ordem.** Cada fase termina com o app compilando e rodando. Não pule nem junte fases.
2. **Só tocar nos arquivos listados em cada fase.** Se um arquivo não está na lista da fase, não abra para editar.
3. **Nunca editar** `src/routeTree.gen.ts` (autogerado), nada em `node_modules/`, `bun.lock`, `package-lock.json`.
4. **Não instalar dependências.** Nenhuma. As imagens são geradas com PowerShell + System.Drawing (já testado nesta máquina); os renames com um script Node sem pacotes.
5. **Não mudar lógica:** nenhuma alteração em `if/else`, estado, rotas, dados (`src/data/`, `src/content/`), fetch, prompts — exceto o que a Fase 7 (texto do tutor) e a Fase 8 (chave do storage) mandam explicitamente.
6. **Gerenciador é `bun`.** Comandos: `bun install`, `bun run dev`, `bun run build`, `bun run lint`, `bunx tsc --noEmit`. Nunca `npm`/`yarn`.
7. **Git:** trabalhar numa branch `rebrand/foca` criada a partir de `main`. Commit ao fim de cada fase **só se o usuário tiver autorizado commits**. **Nunca** `push --force`, `rebase`, `amend` ou `squash` (repo sincronizado com Lovable — reescrever histórico quebra a sincronia).
8. **Cores:** a partir da Fase 2, **nenhum hex novo** pode ser digitado em `.tsx`/`.ts`. Ou é classe Tailwind de token (`bg-abismo`), ou `var(--color-…)` em `style=`, ou `PALETTE.x` de `src/lib/brand.ts`. As únicas exceções permitidas estão na Fase 10 (auditoria).
9. **Logos:** nunca usar `<img>` com `width` ≠ `height`, nunca `object-fit: cover`, nunca `transform: scale(x, y)` com x ≠ y, nunca rotacionar. Todo uso de logo passa pelo componente `FocaMark` (Fase 3).
10. **Verificação mínima ao fim de cada fase:** `bun run lint` sem erros novos, `bunx tsc --noEmit` sem erros novos, `bun run dev` sobe, e as rotas listadas na fase abrem sem erro no console do navegador. O "baseline" de erros pré-existentes é registrado na Fase 0.

---

## 1. Diagnóstico do projeto (o que foi analisado)

| Item | Resultado |
|---|---|
| Framework | TanStack Start (React 19) + TanStack Router file-based. Rotas em `src/routes/*.tsx` (21 arquivos). |
| Estilo | Tailwind CSS v4 via `@tailwindcss/vite`. **Todos os tokens vivem em `src/styles.css`** no bloco `@theme inline` (tokens de marca) + `:root` (variáveis shadcn). Não há `tailwind.config`. |
| UI | shadcn/ui em `src/components/ui/` (consome só as variáveis shadcn `--primary`, `--border` etc.; **não usa** os tokens de marca `navy/yellow`). |
| Componentes de marca | `src/components/AppShell.tsx`: `BrandMark` (img `/flashtest-logo.png`), `Bolt` (SVG do raio, usado em 26 lugares de 11 arquivos), `PhoneFrame`, `AppShell` (header + `BottomNav`). `src/components/TutorBubble.tsx` (balão do tutor, usa `Bolt` e o nome "Tutor Flash Test"). |
| Assets | `public/flashtest-logo.png` (988 KB, logo antiga) e `public/favicon.ico` (antigo). Não existia `src/assets/` nem pasta de branding. |
| Cores hardcoded fora do `styles.css` | 63 ocorrências em 19 arquivos (lista exata na Fase 5). Predominam `#FEB803` (gold, 26×), `#02104E` (navy, 15×), `#8B91A8` (10×), `#FFD466` (8×), `#C0392B` (6×). |
| Classes de token em uso | ~560 ocorrências: `text-navy` 108, `text-navy-2` 63, `text-navy-mist` 38, `bg-navy` 29, `border-mist` 27, `text-slate` 20, `bg-mist` 17, `bg-yellow` 13, `border-yellow` 11, `text-yellow` 10, `border-navy` 10, e variantes com opacidade (`bg-navy/10`, `bg-yellow/15`…). |
| Strings de marca | "Flash Test"/"FlashTest" em `__root.tsx`, `index.tsx`, `welcome.tsx`, `quiz.tsx`, `premium.tsx` (2×), `topics.tsx` (2×), `TutorBubble.tsx`, `tutor-prompt.ts`; chave `flashtest.state.v2` em `store.ts:88`. |
| Scripts | `dev`, `build`, `lint` (eslint). **Não há** script de test nem de typecheck — usar `bunx tsc --noEmit`. Não há testes automatizados no repo. |
| Dark mode | `@custom-variant dark` declarado mas **não usado** em rotas. Não implementar dark mode — fora de escopo. |
| Fonte da paleta | `docs/09-branding.md` §3 (paleta Ártica). Nenhuma cor foi inventada; ver §2 abaixo. |

---

## 2. Paleta — tokens definitivos

### 2.1 Os tokens (valores do SDD `09` §3, nomes em kebab-case sem acento)

| Token Tailwind | Var CSS | Hex | Papel no app |
|---|---|---|---|
| `abismo` | `--color-abismo` | `#0B2545` | Fundo de marca (splash, welcome, quiz, aha, heros), texto forte, botão escuro |
| `mar` | `--color-mar` | `#0EA5E9` | Barras de progresso, labels sobre fundo escuro, seleção de alternativa, bullets |
| `mar-fundo` | `--color-mar-fundo` | `#0369A1` | Labels (`ds-label`) sobre fundo claro, nav ativo, links, hover de Mar |
| `gelo` | `--color-gelo` | `#E8F4FB` | Bordas suaves, skeleton, chips, caixa de dica, trilho de progresso claro |
| `neve` | `--color-neve` | `#F1F5F9` | Fundo de página (`body`) |
| `coral` | `--color-coral` | `#FF6B4A` | **Só** CTA primário, XP, streak, missão concluída, badge de recompensa |
| `coral-claro` | `--color-coral-claro` | `#FF9E85` | Segunda cor dos gradientes de recompensa/premium |
| `pelo` | `--color-pelo` | `#CBD5E1` | Texto secundário **sobre fundo escuro**; borda de input |
| `pelo-sombra` | `--color-pelo-sombra` | `#94A3B8` | Severidade "baixa" no aha; sombra do mascote |
| `nevoa` | `--color-nevoa` | `#64748B` | Texto secundário **sobre fundo claro**, placeholders, nav inativo |
| `success` | `--color-success` | `#0AA35A` | **Só** feedback de resposta certa (inalterado) |
| `error` | `--color-error` | `#A02540` | **Só** feedback de resposta errada (era `#C0392B`) |
| `white` | (Tailwind) | `#FFFFFF` | Texto sobre escuro, cards |

### 2.2 Mapa antigo → novo (decisão fechada; é o que o rename da Fase 6 aplica)

| Token antigo | Hex antigo | Vira | Observação |
|---|---|---|---|
| `navy` | `#02104E` | `abismo` | |
| `ink` | `#02104E` | `abismo` | só existia no CSS |
| `royal` | `#17297A` | `abismo` | os 2 usos são cards escuros sobre página branca |
| `slate` | `#3A4066` | `abismo` | corpo de texto sobre branco passa a Abismo (SDD só tem um "texto forte") |
| `navy-2` | `#8B91A8` | `nevoa` | |
| `navy-mist` | `#AEB8E8` | `pelo` | |
| `yellow` | `#FEB803` | `coral` | |
| `glow` | `#FFD466` | `coral-claro` | |
| `gold-dark` | `#B57F00` | `mar-fundo` | label de acento sobre branco vira azul legível (coral em texto pequeno sobre branco tem contraste 2.8:1 — reprovado) |
| `cloud` | `#F7F6F9` | `neve` | |
| `mist` | `#ECECF3` | `gelo` | |
| `error` | `#C0392B` | `error` = `#A02540` | mesmo nome, valor novo |
| `success` | `#0AA35A` | `success` | inalterado |
| `btn-navy` (utility) | — | `btn-abismo` | |

### 2.3 Regras de aplicação por elemento (o executor aplica isto nas Fases 5 e 6 — não improvisar)

| Elemento | Antes | Agora |
|---|---|---|
| Fundo de página (`body`) | `#f7f6f9` | `neve` |
| `PhoneFrame` | `bg-white` | `bg-white` (mantém) |
| Header do `AppShell` | branco, título `text-navy` | branco, título `text-abismo` |
| Bottom nav ativo / inativo | `text-navy` / `text-navy-2` | `text-mar-fundo` / `text-nevoa` |
| Heros escuros (dashboard, progress, ranking, redação, aha, quiz, welcome, splash) | `bg-navy` | `bg-abismo` |
| Texto secundário sobre escuro | `text-navy-mist` | `text-pelo` |
| `ds-label` sobre **claro** | `#B57F00` | `mar-fundo` (default da utility) |
| `ds-label` sobre **escuro** | inline `#FEB803` | inline `var(--color-mar)` |
| Botão primário (`btn-primary`) | gold + texto navy | `coral` + texto `abismo` (contraste 5.5:1; branco sobre coral reprovaria) |
| Botão escuro (`btn-navy`→`btn-abismo`) | navy + branco | `abismo` + branco |
| `btn-outline` | borda navy | borda `abismo` |
| `btn-ghost` | borda `#d8d6e0`, texto slate | borda `pelo`, texto `nevoa` |
| Inputs (`input-ds`, shadcn `--input`) | borda `#e0dfe9`/`#e6e5ee` | borda `pelo` |
| Foco (`--ring`) | gold | `mar` |
| Cards (`card-soft`) | branco, borda mist | branco, borda `gelo` |
| Chips | `#f0eff5` | `gelo` |
| Barra de progresso (aula, dashboard, quiz) | gold | `mar` |
| Trilho da barra sobre claro | `bg-mist` | `bg-gelo` |
| Alternativa selecionada (antes de verificar) | borda gold + fundo `#FFFAF0` | borda `mar` + fundo `gelo` |
| Alternativa certa / errada | success / error | success / error (valor do error muda) |
| Caixa de dica | `#FFD466`/`#FFFAF0` | borda `mar/40`, fundo `gelo`, ícone em `mar/20` |
| Bloco de resultado (`ResultBlock`) | inline verde/vermelho | `bg-success/10 text-success` / `bg-error/10 text-error` + ícone |
| XP, streak, dots de streak, missão concluída | gold | `coral` |
| Gradiente premium/plano | gold→glow | `coral`→`coral-claro`, texto `abismo` |
| Badges de severidade (aha) | vermelho/gold/cinza | `coral` / `mar` / `pelo-sombra` |
| Faixas de domínio (progress) | success/gold/gold-dark/error | success / `mar` / `coral-claro` / `coral` |
| Skeleton / caret do tutor | mist / gold | `gelo` / `coral` |
| Botão "Sair da conta" | vermelho | `nevoa` com borda `pelo` (vermelho é só de resposta errada) |
| Sombras `rgba(2,16,78,…)` | navy | `rgba(11,37,69,…)` (Abismo) |
| Balão do tutor | `bg-navy` | `bg-abismo` |
| `theme-color` (meta) | `#02104E` | `PALETTE.abismo` |
| Página de erro estática (`error-page.ts`) | cinzas genéricos | Neve / Abismo / Névoa / Pelo |

---

## 3. Logos — análise e organização

### 3.1 As 6 versões recebidas (todas 2000×2000 px, mesma arte: cabeça da foca em 3/4, boca aberta)

Medições feitas por script (canal alfa e cores dominantes):

| Arquivo final (**já copiado** em `src/assets/branding/foca/`) | Origem | Conteúdo | Alfa | Melhor sobre | Uso no app |
|---|---|---|---|---|---|
| `foca-color-transparent.png` | 5.png | Colorida (cinza `#909098`, olhos brancos, nariz preto, língua `#E04040`), fundo transparente (67% transparente) | ✅ | claro **e** escuro | **Logo principal.** Header, splash, welcome, login, forgot, ícone do tutor, XP/streak, fim de aula, ícone do app, favicon |
| `foca-color-on-white.png` | 6.png | Mesma arte, fundo branco opaco | ❌ | claro | Redes sociais / material impresso (não usar no app: o quadrado branco aparece) |
| `foca-line-light-transparent.png` | 1.png | Só contorno branco, fundo transparente (88% transparente) | ✅ | escuro | Marca d'água decorativa nas telas Abismo (welcome, aha) |
| `foca-line-light-on-black.png` | 2.png | Contorno branco sobre preto opaco | ❌ | — | Referência/impressão. Não usar no app |
| `foca-line-dark-transparent.png` | 4.png | Só contorno preto, fundo transparente | ✅ | claro | Marca d'água/empty state sobre fundo claro (variante disponível no `FocaMark`, sem uso obrigatório hoje) |
| `foca-line-dark-on-white.png` | 3.png | Contorno preto sobre branco opaco | ❌ | — | Referência/impressão. Não usar no app |

**Fatos técnicos que o executor usa:**
- A arte ocupa a bounding box **x 320–1730, y 287–1697** em todas as 6 (mesma posição). O recorte quadrado `(320, 287, 1410, 1410)` é o que centraliza a cabeça. Recortar sempre com este retângulo.
- As versões de contorno têm traço fino (~35 px em 2000). **Abaixo de 120 px de exibição o contorno some** — por isso ícones pequenos usam sempre a colorida.
- A colorida funciona sobre Abismo (testado: contraste do cinza + olhos brancos é bom) e sobre branco (tem contorno preto).

> **Nota de SDD:** o `09` §2 descrevia uma foca de frente, sem branco nos olhos. A arte entregue é a **arte final** e substitui aquele SVG de referência. A Fase 9 atualiza o `09` para registrar isso. Não tentar "corrigir" a arte.

### 3.2 Estrutura de pastas (decisão fechada)

```
src/assets/branding/foca/          ← ORIGINAIS 2000px (fonte; Vite só empacota o que é importado — nada importa daqui)
  README.md                        ← criado na Fase 1
  foca-color-transparent.png
  foca-color-on-white.png
  foca-line-light-transparent.png
  foca-line-light-on-black.png
  foca-line-dark-transparent.png
  foca-line-dark-on-white.png

public/branding/foca/              ← DERIVADOS otimizados, servidos em /branding/foca/… (gerados na Fase 1)
  foca-color-96.png                ← ícones ≤ 48px (2× DPR)
  foca-color-320.png               ← 49–160px (splash 144, welcome 132)
  foca-line-light-720.png          ← marcas d'água 280–340px
  foca-line-dark-720.png           ← idem sobre claro
  icon-192.png                     ← PWA/Android (colorida sobre Abismo, 12% de margem)
  icon-512.png                     ← PWA/Android
  apple-touch-icon.png             ← 180px, colorida sobre Abismo
  og-image.png                     ← 1200×630, colorida centralizada sobre Abismo

public/favicon.ico                 ← REGERADO (64px, colorida sobre Abismo). Substitui o antigo.
public/flashtest-logo.png          ← REMOVIDO na Fase 3 (depois que nenhuma referência sobrar)
scripts/gerar-logos-foca.ps1       ← gera os derivados (Fase 1)
```

### 3.3 Qual arquivo em qual contexto (tabela que o `FocaMark` implementa)

| Contexto | Componente | Tamanho | Variante | Arquivo servido |
|---|---|---|---|---|
| Header `AppShell` | `<BrandMark size={28} />` | 28 | color | `foca-color-96.png` |
| Login / Forgot | `<BrandMark size={40} />` | 40 | color | `foca-color-96.png` |
| Splash `/` | `<BrandMark size={144} />` | 144 | color | `foca-color-320.png` |
| Welcome | `<BrandMark size={132} />` | 132 | color | `foca-color-320.png` |
| Marca d'água welcome/aha | `<FocaMark variant="line-light" size={340} decorative />` | 280–340 | line-light | `foca-line-light-720.png` |
| FAB do tutor | `<FocaMark size={36} />` | 36 | color | `foca-color-96.png` |
| Header do balão | `<FocaMark size={22} />` | 22 | color | `foca-color-96.png` |
| XP / streak / bullets (ex-`Bolt`) | `<FocaMark size={n} />` | 14–22 | color | `foca-color-96.png` |
| Fim de aula | `<FocaMark size={64} />` | 64 | color | `foca-color-320.png` |
| Favicon / ícone | links em `__root.tsx` | — | color sobre Abismo | `favicon.ico`, `icon-*.png` |

Regra de responsividade: o `FocaMark` sempre renderiza **quadrado** (`width === height`) com `object-fit: contain`. O tamanho é em px fixo (o app é mobile-first com largura máxima 440 px — não há breakpoints a considerar). Nunca usar `w-full` numa logo.

---

## 4. Fase 0 — Baseline

**Objetivo:** saber o estado do projeto antes de mexer, para distinguir erro novo de erro antigo.

**Arquivos:** nenhum editado.

**Passos:**
1. `git status` — anotar arquivos já modificados (esperado: `CLAUDE.md` modificado, `docs/` e `src/assets/` novos; **não** reverter nem commitar isso por conta própria).
2. `git checkout -b rebrand/foca`.
3. `bun install`.
4. `bun run lint` → salvar a saída em `docs/_tmp-baseline-lint.txt` (o arquivo é apagado na Fase 10).
5. `bunx tsc --noEmit` → salvar em `docs/_tmp-baseline-tsc.txt`.
6. `bun run build` → deve terminar com sucesso. Se falhar, **parar e reportar** — não continuar.
7. `bun run dev` → abrir `http://localhost:8080/` (porta configurada no `vite.config.ts`), navegar `/`, `/welcome`, `/quiz`, `/dashboard`, `/study`, `/redacao`, `/progress`, `/ranking`, `/profile`, `/plan`, `/flashcards`, `/premium`, `/login`, `/forgot`, `/topics`, `/offline`, `/aha`. Anotar erros do console (esperado: nenhum além de avisos do Vite).
8. Tirar screenshot de `/welcome`, `/dashboard`, `/study` para comparação visual ao final (guardar fora do repo).

**Como verificar:** os dois arquivos `_tmp-baseline-*.txt` existem e o build passou.

---

## 5. Fase 1 — Assets da marca

**Objetivo:** ter todos os arquivos de logo no lugar, com nomes finais, e os derivados otimizados gerados.

**Arquivos:**
- Criar `src/assets/branding/foca/README.md`
- Criar `scripts/gerar-logos-foca.ps1`
- Criar (gerados) `public/branding/foca/*.png`
- Substituir `public/favicon.ico`

**Passos:**

1. Confirmar que os 6 originais existem em `src/assets/branding/foca/` com os nomes da §3.1 (`ls src/assets/branding/foca`). Se algum faltar, parar e pedir ao usuário.

2. Criar `src/assets/branding/foca/README.md` com este conteúdo exato:

```markdown
# Logos da Foca — originais

Arte final da cabeça da Foca (2000×2000 px). Estes arquivos são a FONTE; o app
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

Recorte quadrado que centraliza a cabeça (igual nas 6): x=320 y=287 w=1410 h=1410.
Regras: nunca esticar, rotacionar ou recolorir. Ver docs/09-branding.md §2.
```

3. Criar `scripts/gerar-logos-foca.ps1` com este conteúdo exato (as funções foram testadas nesta máquina em 20/09/2026):

```powershell
# Gera os derivados de public/branding/foca/ a partir dos originais em src/assets/branding/foca/.
# Requer Windows PowerShell 5.1 (System.Drawing). Rodar da raiz do repo:
#   powershell -ExecutionPolicy Bypass -File scripts/gerar-logos-foca.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root "src\assets\branding\foca"
$out  = Join-Path $root "public\branding\foca"
New-Item -ItemType Directory -Force $out | Out-Null
$crop = New-Object System.Drawing.Rectangle 320, 287, 1410, 1410   # bounding box da cabeca, igual nas 6 artes
$ABISMO = "#0B2545"

function Export-Foca($srcFile, $dstFile, $w, $h, $bgHex, $padPct) {
  $bmp = [System.Drawing.Bitmap]::FromFile($srcFile)
  $o = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($o)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  if ($bgHex) { $g.Clear([System.Drawing.ColorTranslator]::FromHtml($bgHex)) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  $side = [Math]::Min($w, $h); $pad = [int]($side * $padPct); $inner = $side - 2 * $pad
  $x = [int](($w - $inner) / 2); $y = [int](($h - $inner) / 2)
  $dest = New-Object System.Drawing.Rectangle $x, $y, $inner, $inner       # sempre quadrado: nunca deforma
  $g.DrawImage($bmp, $dest, $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $bmp.Dispose()
  $o.Save($dstFile, [System.Drawing.Imaging.ImageFormat]::Png); $o.Dispose()
  Write-Host "ok  $dstFile"
}

function New-Ico($pngFile, $dstFile) {
  $bmp = [System.Drawing.Bitmap]::FromFile($pngFile)
  $ico = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
  $fs = [System.IO.File]::Create($dstFile); $ico.Save($fs); $fs.Close()
  $ico.Dispose(); $bmp.Dispose()
  Write-Host "ok  $dstFile"
}

$color = Join-Path $src "foca-color-transparent.png"
$lineL = Join-Path $src "foca-line-light-transparent.png"
$lineD = Join-Path $src "foca-line-dark-transparent.png"

Export-Foca $color (Join-Path $out "foca-color-96.png")        96   96  $null   0.04
Export-Foca $color (Join-Path $out "foca-color-320.png")       320  320 $null   0.04
Export-Foca $lineL (Join-Path $out "foca-line-light-720.png")  720  720 $null   0.04
Export-Foca $lineD (Join-Path $out "foca-line-dark-720.png")   720  720 $null   0.04
Export-Foca $color (Join-Path $out "icon-192.png")             192  192 $ABISMO 0.12
Export-Foca $color (Join-Path $out "icon-512.png")             512  512 $ABISMO 0.12
Export-Foca $color (Join-Path $out "apple-touch-icon.png")     180  180 $ABISMO 0.12
Export-Foca $color (Join-Path $out "og-image.png")             1200 630 $ABISMO 0.10
Export-Foca $color (Join-Path $out "_favicon-64.png")          64   64  $ABISMO 0.10
New-Ico (Join-Path $out "_favicon-64.png") (Join-Path $root "public\favicon.ico")
Remove-Item (Join-Path $out "_favicon-64.png")
```

4. Rodar: `powershell -ExecutionPolicy Bypass -File scripts/gerar-logos-foca.ps1` (na raiz do repo). Se não estiver no Windows: parar e reportar (alternativa aceitável, **somente com autorização do usuário**: `bunx sharp-cli`, sem adicionar ao `package.json`).

**Regras:** não editar os originais; não mudar o retângulo de recorte; não gerar tamanhos além dos listados.

**Como verificar:**
- `ls public/branding/foca` mostra exatamente 8 arquivos: `foca-color-96.png`, `foca-color-320.png`, `foca-line-light-720.png`, `foca-line-dark-720.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `og-image.png`.
- `public/favicon.ico` tem data de modificação de hoje e tamanho entre 2 KB e 20 KB.
- Abrir `icon-512.png` e `foca-color-320.png` num visualizador: cabeça centralizada, não cortada, não achatada (largura da cabeça ≈ altura), fundo Abismo no ícone e transparente na 320.
- Com `bun run dev` rodando, `http://localhost:8080/branding/foca/foca-color-96.png` responde 200.

---

## 6. Fase 2 — Tokens centralizados (`styles.css` + `brand.ts`)

**Objetivo:** a paleta inteira passa a existir num só lugar e **o app inteiro muda de cor nesta fase** sem tocar em nenhum `.tsx`, graças a aliases temporários dos nomes antigos.

**Arquivos:**
- Modificar `src/styles.css`
- Criar `src/lib/brand.ts`

**Alterações em `src/styles.css`:**

1. Substituir o comentário das linhas 7–8 por:

```css
/* Tokens oficiais da marca Foca — paleta Ártica (docs/09-branding.md §3).
   Mar/Abismo 65% · Coral 10% · Neutros frios 25%. Coral é recompensa/CTA, nunca fundo grande.
   Sucesso e Erro: SÓ feedback de resposta certa/errada, nunca decorativos. */
```

2. Dentro de `@theme inline`, substituir **todo** o bloco de cores (linhas 13–24, de `--color-navy: #02104e;` até `--color-mist: #ececf3;`) por:

```css
  --color-abismo: #0b2545; /* primária escura — fundos de marca, texto forte */
  --color-mar: #0ea5e9; /* primária — progresso, labels sobre escuro, seleção */
  --color-mar-fundo: #0369a1; /* Mar legível sobre claro — labels, nav ativo, links */
  --color-gelo: #e8f4fb; /* bordas suaves, chips, skeleton, superfícies frias */
  --color-neve: #f1f5f9; /* fundo de página */
  --color-coral: #ff6b4a; /* acento — CTA, XP, streak, recompensa */
  --color-coral-claro: #ff9e85; /* gradientes de recompensa, badges leves */
  --color-pelo: #cbd5e1; /* texto secundário sobre escuro; borda de input */
  --color-pelo-sombra: #94a3b8; /* severidade baixa, sombra do mascote */
  --color-nevoa: #64748b; /* texto secundário sobre claro, placeholders */
  --color-success: #0aa35a;
  --color-error: #a02540;

  /* ALIASES TEMPORÁRIOS dos nomes antigos (Flash Test). Existem só para a
     migração ser incremental; são REMOVIDOS na Fase 6 do docs/17. */
  --color-navy: var(--color-abismo);
  --color-ink: var(--color-abismo);
  --color-royal: var(--color-abismo);
  --color-slate: var(--color-abismo);
  --color-navy-2: var(--color-nevoa);
  --color-navy-mist: var(--color-pelo);
  --color-yellow: var(--color-coral);
  --color-glow: var(--color-coral-claro);
  --color-gold-dark: var(--color-mar-fundo);
  --color-cloud: var(--color-neve);
  --color-mist: var(--color-gelo);
```

   As linhas `--font-sans`, `--font-display`, os `--radius-*` e as linhas `--color-background: var(--background)` … `--color-ring: var(--ring)` ficam **exatamente como estão**. (O padrão `var()` dentro de `@theme inline` já é usado nessas linhas — é comprovadamente suportado neste projeto.)

3. No bloco `:root`, substituir **somente os valores** destas variáveis (manter `--radius` e `--radius-card`):

```css
  --background: #ffffff;
  --foreground: #0b2545;
  --card: #ffffff;
  --card-foreground: #0b2545;
  --primary: #0b2545;
  --primary-foreground: #ffffff;
  --secondary: #e8f4fb;
  --secondary-foreground: #0b2545;
  --muted: #e8f4fb;
  --muted-foreground: #64748b;
  --accent: #ff6b4a;
  --accent-foreground: #0b2545;
  --destructive: #a02540;
  --destructive-foreground: #ffffff;
  --border: #e8f4fb;
  --input: #cbd5e1;
  --ring: #0ea5e9;
```

4. Em `@layer base`, `html, body`: `background: #f7f6f9;` → `background: var(--color-neve);`.

5. Utilities — trocar **só** as linhas indicadas:
   - `btn-primary`: `background: var(--color-yellow);` → `background: var(--color-coral);` · `color: var(--color-navy);` → `color: var(--color-abismo);`
   - `btn-navy`: (a) trocar `background: var(--color-navy);` → `background: var(--color-abismo);`; (b) renomear para `@utility btn-abismo`; (c) **duplicar** o bloco inteiro logo abaixo com o nome antigo `@utility btn-navy` e o mesmo conteúdo novo, com o comentário `/* alias temporário — removido na Fase 6 do docs/17 */`. (Não usar `@apply` de utility customizada.)
   - `btn-outline`: `color: var(--color-navy);` → `color: var(--color-abismo);` · `border: 1.5px solid var(--color-navy);` → `border: 1.5px solid var(--color-abismo);`
   - `btn-ghost`: `color: var(--color-slate);` → `color: var(--color-nevoa);` · `border: 1.5px solid #d8d6e0;` → `border: 1.5px solid var(--color-pelo);`
   - `card-soft`: `border: 1px solid var(--color-mist);` → `border: 1px solid var(--color-gelo);`
   - `chip`: `background: #f0eff5;` → `background: var(--color-gelo);` · `color: var(--color-slate);` → `color: var(--color-abismo);`
   - `ds-label`: `color: var(--color-gold-dark);` → `color: var(--color-mar-fundo);` e o comentário acima vira `/* Label do design system: Space Grotesk 12/700, tracking largo. Mar Fundo sobre claro; sobre escuro usar style={{ color: "var(--color-mar)" }}. */`
   - `caret-tutor`: `background: var(--color-yellow);` → `background: var(--color-coral);`
   - `skeleton`: `background: var(--color-mist);` → `background: var(--color-gelo);`
   - `input-ds`: `border: 1.5px solid #e0dfe9;` → `border: 1.5px solid var(--color-pelo);` · `color: var(--color-navy);` → `color: var(--color-abismo);`
   - Os comentários `/* Microanimações (SDD 12, D3 §6)… */` e o nome dos keyframes `ft-*` **não mudam** (prefixo técnico, não marca).

**Criar `src/lib/brand.ts`** com este conteúdo exato:

```ts
/**
 * Paleta Ártica da Foca (docs/09-branding.md §3) para os poucos lugares que
 * precisam do hex em JavaScript (meta theme-color, cores calculadas com alpha).
 * Em JSX use as classes Tailwind (`bg-abismo`) ou `var(--color-…)` — este
 * objeto NÃO é para estilizar componentes. Fonte única de verdade: styles.css.
 */
export const PALETTE = {
  abismo: "#0B2545",
  mar: "#0EA5E9",
  marFundo: "#0369A1",
  gelo: "#E8F4FB",
  neve: "#F1F5F9",
  coral: "#FF6B4A",
  coralClaro: "#FF9E85",
  pelo: "#CBD5E1",
  peloSombra: "#94A3B8",
  nevoa: "#64748B",
  white: "#FFFFFF",
  success: "#0AA35A",
  error: "#A02540",
} as const;

export const BRAND = {
  name: "Foca",
  tagline: "Foca 60 segundos.",
  description:
    "Preparação para o ENEM em aulas de 60 segundos. Uma foca que aprende suas lacunas e te cobra todo dia.",
} as const;
```

**Regras:** não renomear classes em nenhum `.tsx` nesta fase. Não remover nenhuma variável antiga (elas viraram aliases). Não mexer nos keyframes.

**Como verificar:**
- `bun run dev` → `/welcome` tem fundo `#0B2545` (DevTools: `background-color: rgb(11, 37, 69)`), o botão "Começar em 60 segundos" é coral `rgb(255, 107, 74)` com texto escuro.
- `/dashboard`: fundo da página `rgb(241, 245, 249)`; nada mais está amarelo (`#FEB803`) **exceto** os elementos com hex inline (barra de progresso, labels) — esses caem na Fase 5.
- `bun run lint` e `bunx tsc --noEmit` iguais ao baseline.

---

## 7. Fase 3 — Componente `FocaMark`, `BrandMark`, fim do `Bolt`, `<head>`

**Objetivo:** toda logo do app vem de um único componente; o raio deixa de existir; favicon/meta refletem a Foca.

**Arquivos:**
- Criar `src/components/brand/FocaMark.tsx`
- Modificar `src/components/AppShell.tsx`
- Modificar `src/components/TutorBubble.tsx`, `src/components/lessons/LessonPlayer.tsx`
- Modificar `src/routes/aha.tsx`, `dashboard.tsx`, `progress.tsx`, `quiz.tsx`, `ranking.tsx`, `redacao.index.tsx`, `study.tsx`, `welcome.tsx`, `index.tsx`
- Modificar `src/routes/__root.tsx`
- Remover `public/flashtest-logo.png`

### 3.1 Criar `src/components/brand/FocaMark.tsx` (conteúdo exato)

```tsx
/**
 * A cabeça da Foca — logo e mascote da marca (docs/09-branding.md §2, docs/17 §3).
 * Único ponto do app que renderiza a logo. Sempre quadrada, nunca esticada.
 *
 * - `color`      → arte colorida, funciona sobre claro e escuro. Padrão.
 * - `line-light` → contorno branco, só para marca d'água sobre fundo Abismo (≥ 120px).
 * - `line-dark`  → contorno preto, só para marca d'água sobre fundo claro (≥ 120px).
 */
export type FocaVariant = "color" | "line-light" | "line-dark";

const SRC: Record<FocaVariant, { small: string; large: string }> = {
  color: {
    small: "/branding/foca/foca-color-96.png",
    large: "/branding/foca/foca-color-320.png",
  },
  "line-light": {
    small: "/branding/foca/foca-line-light-720.png",
    large: "/branding/foca/foca-line-light-720.png",
  },
  "line-dark": {
    small: "/branding/foca/foca-line-dark-720.png",
    large: "/branding/foca/foca-line-dark-720.png",
  },
};

export function FocaMark({
  size = 32,
  variant = "color",
  decorative = false,
  className,
}: {
  size?: number;
  variant?: FocaVariant;
  /** true = puramente visual (marca d'água, ícone ao lado de texto): sai da árvore de acessibilidade. */
  decorative?: boolean;
  className?: string;
}) {
  const src = size <= 48 ? SRC[variant].small : SRC[variant].large;
  return (
    <img
      src={src}
      alt={decorative ? "" : "Foca"}
      aria-hidden={decorative ? true : undefined}
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{ width: size, height: size, objectFit: "contain", display: "block", flexShrink: 0 }}
    />
  );
}
```

### 3.2 `src/components/AppShell.tsx`

1. Adicionar no topo: `import { FocaMark } from "@/components/brand/FocaMark";`
2. Substituir o comentário das linhas 5–8 e a função `BrandMark` inteira (linhas 9–19) por:

```tsx
/** Logo da marca nos headers e telas de entrada. Delegada ao FocaMark para haver um único ponto de verdade. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return <FocaMark size={size} />;
}
```

3. **Ainda não apagar `Bolt`** — apagar só no passo 3.5, depois que todos os usos forem trocados.
4. Linha 35 (`PhoneFrame`): `shadow-[0_0_60px_-20px_rgba(2,16,78,0.18)]` → `shadow-[0_0_60px_-20px_rgba(11,37,69,0.18)]`.
5. Linha 46: manter `<BrandMark size={28} />`.

### 3.3 Trocar cada uso de `Bolt` (tabela fechada — aplicar linha a linha)

Em cada arquivo abaixo: (a) adicionar `import { FocaMark } from "@/components/brand/FocaMark";` quando a tabela usar `FocaMark`; (b) fazer a troca; (c) remover `Bolt` do import de `@/components/AppShell` (deixar os outros nomes importados). Onde a tabela pede ícone `lucide-react`, adicioná-lo ao import de `lucide-react` já existente no arquivo (ou criar o import).

| Arquivo:linha | Antes | Depois |
|---|---|---|
| `LessonPlayer.tsx:139` | `<Bolt size={18} /> +{result.xpAwarded} XP` | `<FocaMark size={18} decorative /> +{result.xpAwarded} XP` |
| `TutorBubble.tsx:209` (FAB) | `<Bolt size={26} />` | `<FocaMark size={36} decorative />` |
| `TutorBubble.tsx:218` (header) | `<Bolt size={18} />` | `<FocaMark size={22} decorative />` |
| `TutorBubble.tsx:219` | `Tutor Flash Test` | `Foca` |
| `aha.tsx:39` (marca d'água) | `<Bolt size={280} />` | `<FocaMark variant="line-light" size={280} decorative />` — e na linha 38 trocar `opacity-[0.07]` por `opacity-[0.10]` |
| `aha.tsx:108` (XP) | `<Bolt size={15} />` | `<FocaMark size={16} decorative />` |
| `aha.tsx:128` (CTA) | `<Bolt size={18} color="#02104E" /> Entrar no meu plano` | `Entrar no meu plano` (ícone removido: CTA coral não leva a logo) |
| `dashboard.tsx:37` | `<Bolt size={16} />` | `<FocaMark size={16} decorative />` |
| `dashboard.tsx:57` | `<Bolt size={22} />` | `<FocaMark size={22} decorative />` |
| `progress.tsx:83` | `icon={<Bolt size={15} />}` | `icon={<FocaMark size={16} decorative />}` |
| `quiz.tsx:73` | `<Bolt size={14} />` | `<FocaMark size={18} decorative />` |
| `quiz.tsx:74` | `Flash Test` | `Foca` |
| `ranking.tsx:100` | `<Bolt size={13} />` | `<FocaMark size={14} decorative />` |
| `redacao.index.tsx:67` | `<Bolt size={22} />` | `<FocaMark size={22} decorative />` |
| `study.tsx:136` (header da questão) | `<Bolt size={13} /> Aula de 60s` | `<Timer size={13} /> Aula de 60s` (lucide `Timer`; a Foca **não** aparece durante a questão — `docs/15` §4) |
| `study.tsx:346-348` (fim de aula) | `style={{ background: "#FEB803" }}` … `<Bolt size={48} color="#02104E" />` | remover o `style`, adicionar a classe `bg-coral/15` ao `div`, e dentro `<FocaMark size={64} />` |
| `welcome.tsx:14` (marca d'água) | `<Bolt size={340} />` | `<FocaMark variant="line-light" size={340} decorative />` — linha 13: `opacity-[0.08]` → `opacity-[0.10]` |
| `welcome.tsx:41` (bullets) | `<Bolt size={18} />` | `<Check size={18} className="shrink-0 text-coral" />` (lucide `Check`) |

### 3.4 Textos de marca nas telas de entrada (mesmos arquivos, mesma fase)

| Arquivo:linha | Antes | Depois |
|---|---|---|
| `index.tsx:30` | `Flash Test` | `Foca` |
| `index.tsx:31-33` | `<p className="ds-label mt-2 block" style={{ color: "#FEB803" }}>Constância que aprova</p>` | `<p className="ds-label mt-2 block" style={{ color: "var(--color-mar)" }}>Foca 60 segundos.</p>` |
| `welcome.tsx:20` | `Flash Test` | `Foca` |
| `welcome.tsx:22-24` | idem `index.tsx:31` | idem: `var(--color-mar)` + `Foca 60 segundos.` |

### 3.5 Apagar o `Bolt`

Depois de 3.3: em `AppShell.tsx` remover o comentário (linhas 21–24) e a função `Bolt` (25–30). Rodar `grep -rn "Bolt" src` → deve retornar **zero** linhas.

### 3.6 `src/routes/__root.tsx`

1. Adicionar `import { BRAND, PALETTE } from "@/lib/brand";`
2. No array `meta`:
   - `{ name: "theme-color", content: "#02104E" }` → `{ name: "theme-color", content: PALETTE.abismo }`
   - `{ title: "Flash Test — Constância que aprova" }` → `{ title: \`${BRAND.name} — ${BRAND.tagline}\` }`
   - `description` → `content: BRAND.description`
   - `og:title` → `content: BRAND.name`
   - `og:description` → `content: BRAND.tagline`
   - adicionar após `og:type`: `{ property: "og:image", content: "/branding/foca/og-image.png" }`
3. No array `links`: manter `{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" }` e adicionar logo abaixo:
   - `{ rel: "icon", href: "/branding/foca/icon-192.png", type: "image/png", sizes: "192x192" }`
   - `{ rel: "apple-touch-icon", href: "/branding/foca/apple-touch-icon.png" }`
4. Não tocar em `NotFoundComponent`/`ErrorComponent` (já usam variáveis shadcn).

### 3.7 Remover a logo antiga

`git rm public/flashtest-logo.png`. Antes, `grep -rn "flashtest-logo" src public` deve retornar zero.

**Regras:** não alterar tamanhos além dos da tabela; não adicionar a Foca em nenhum lugar não listado; não mexer na lógica do `TutorBubble` (só o ícone e o nome).

**Como verificar:**
- `grep -rn "Bolt\|flashtest-logo" src` → vazio.
- `bunx tsc --noEmit` sem erros novos (imports removidos corretamente).
- `/` mostra a foca colorida 144 px sobre Abismo, "Foca" + "Foca 60 segundos."; `/welcome` idem 132 px com marca d'água branca discreta no canto; header do `/dashboard` com foca 28 px; FAB do tutor mostra a foca; abrir o balão → título "Foca".
- Aba do navegador mostra o favicon novo (forçar reload com cache limpo).
- Em `/study`, responder as 2 questões → tela final mostra a foca 64 px dentro de um círculo coral suave.
- DevTools → Elements → todo `<img src="/branding/…">` tem `width` igual a `height`.

---

## 8. Fase 4 — Strings de marca restantes

**Objetivo:** nenhuma menção a "Flash Test"/"FlashTest" visível ao usuário ou em comentários de código.

**Arquivos:** `src/routes/premium.tsx`, `src/routes/topics.tsx`, `src/lib/lessons/types.ts`, `src/components/lessons/exercises/shared.ts`, `src/components/TutorBubble.tsx`.

| Arquivo:linha | Antes | Depois |
|---|---|---|
| `premium.tsx:40` | `FlashTest Premium` | `Foca Premium` |
| `premium.tsx:87` | `Continue acompanhando o FlashTest para conhecer` | `Continue acompanhando a Foca para conhecer` |
| `topics.tsx:51` | `deixe o FlashTest recomendar` | `deixe a Foca recomendar` |
| `topics.tsx:56` | `Prefiro que o FlashTest recomende` | `Prefiro que a Foca recomende` |
| `lessons/types.ts:9-11` (comentário) | `Portado para o Flash Test com o design system oficial e SEM os mascotes do app de origem — quem explica é o tutor do Flash Test (identidade do raio), não um personagem (SDD 12, §0).` | `Portado para a Foca com o design system oficial e SEM os mascotes do app de origem — quem explica é a própria Foca, mascote e tutor do app (docs/15).` |
| `exercises/shared.ts:23` (comentário) | `nunca decorativos (design system Flash Test).` | `nunca decorativos (docs/09-branding.md §3).` |
| `TutorBubble.tsx` | qualquer outro "Flash Test" que sobrar (`grep`) | "Foca" |

**Como verificar:** `grep -rniE "flash ?test" src --include=*.ts --include=*.tsx` retorna **apenas** `src/lib/store.ts:88` (tratado na Fase 8) e `src/lib/tutor-prompt.ts:52` (Fase 7).

---

## 9. Fase 5 — Cores hardcoded fora do `styles.css`

**Objetivo:** zero hex/rgba de marca em `.tsx`/`.ts` (exceto exceções da Fase 10). Tabela fechada; aplicar exatamente.

**Arquivos:** os listados na tabela. Atenção: os números de linha são os do código em 20/09/2026 **antes** das Fases 3–4; use o texto "Antes" como âncora, não só o número.

| Arquivo:linha | Antes | Depois |
|---|---|---|
| `AppShell.tsx:35` | já feito na Fase 3 | — |
| `TutorBubble.tsx:207` | `shadow-[0_8px_24px_-6px_rgba(2,16,78,0.5)]` | `shadow-[0_8px_24px_-6px_rgba(11,37,69,0.5)]` |
| `TutorBubble.tsx:215` | `shadow-[0_-8px_40px_-8px_rgba(2,16,78,0.5)]` | `shadow-[0_-8px_40px_-8px_rgba(11,37,69,0.5)]` |
| `lessons/exercises/Reorder.tsx:44` | `"border-[#D8D6E0] bg-cloud"` | `"border-pelo bg-cloud"` |
| `lessons/LessonPlayer.tsx:147` | `style={{ color: "#FEB803" }}` | `style={{ color: "var(--color-mar)" }}` |
| `lib/error-page.ts:9` | `background: #fafafa; color: #111;` | `background: #F1F5F9; color: #0B2545;` |
| `lib/error-page.ts:12` | `color: #4b5563;` | `color: #64748B;` |
| `lib/error-page.ts:15` | `background: #111; color: #fff;` | `background: #0B2545; color: #fff;` |
| `lib/error-page.ts:16` | `background: #fff; color: #111; border-color: #d1d5db;` | `background: #fff; color: #0B2545; border-color: #CBD5E1;` |
| `aha.tsx:1-3` | — | adicionar `import { PALETTE } from "@/lib/brand";` |
| `aha.tsx:9` | `alta: { label: "Lacuna alta", color: "#C0392B", fill: 82 },` | `alta: { label: "Lacuna alta", color: PALETTE.coral, text: PALETTE.coral, fill: 82 },` |
| `aha.tsx:10` | `média: { label: "Lacuna média", color: "#FEB803", fill: 55 },` | `média: { label: "Lacuna média", color: PALETTE.mar, text: PALETTE.mar, fill: 55 },` |
| `aha.tsx:11` | `baixa: { label: "A confirmar", color: "#8B91A8", fill: 30 },` | `baixa: { label: "A confirmar", color: PALETTE.peloSombra, text: PALETTE.pelo, fill: 30 },` |
| `aha.tsx:43` | `style={{ color: "#FEB803" }}` | `style={{ color: "var(--color-mar)" }}` |
| `aha.tsx:87` | `color: sev.color === "#8B91A8" ? "#AEB8E8" : sev.color,` | `color: sev.text,` |
| `dashboard.tsx:46` | `background: "#FEB803"` | `background: "var(--color-mar)"` |
| `dashboard.tsx:59` | `style={{ color: "#FEB803" }}` | `style={{ color: "var(--color-mar)" }}` |
| `dashboard.tsx:72, 109, 122, 150, 160` | `style={{ color: "#8B91A8" }}` | **remover o `style` inteiro** (o `ds-label` já é Mar Fundo sobre claro) |
| `dashboard.tsx:173` | `linear-gradient(135deg,#FEB803,#FFD466)` | `linear-gradient(135deg, var(--color-coral), var(--color-coral-claro))` |
| `dashboard.tsx:176` | `style={{ color: "#02104E" }}` | `style={{ color: "var(--color-abismo)" }}` |
| `dashboard.tsx:192` | `border-2 border-[#D8D6E0]` | `border-2 border-pelo` |
| `flashcards.tsx:65` e `:72` | `{ background: "#02104E", color: "#fff" }` | `{ background: "var(--color-abismo)", color: "#fff" }` |
| `forgot.tsx:25` | `bg-[#FEF6E0]` | `bg-gelo` |
| `index.tsx:31` | já feito na Fase 3 | — |
| `plan.tsx:28` | gradiente igual ao dashboard | igual ao dashboard |
| `plan.tsx:30` | `style={{ color: "#02104E" }}` | `style={{ color: "var(--color-abismo)" }}` |
| `plan.tsx:98` | `i < s.progress.streak ? "#FEB803" : "#ECECF3"` | `i < s.progress.streak ? "var(--color-coral)" : "var(--color-gelo)"` |
| `plan.tsx:116` | `style={{ background: "#FEB803" }}` | `style={{ background: "var(--color-mar)" }}` |
| `premium.tsx:37` | gradiente | igual ao dashboard |
| `premium.tsx:49` | `className="mt-0.5 shrink-0" style={{ color: "#FEB803" }}` | `className="mt-0.5 shrink-0 text-mar-fundo"` (remover o `style`; a classe substitui) |
| `profile.tsx:34` | gradiente | igual ao dashboard |
| `profile.tsx:36` | `style={{ color: "#02104E" }}` | `style={{ color: "var(--color-abismo)" }}` |
| `profile.tsx:84` | `style={{ color: "#C0392B", borderColor: "#F3D2CE" }}` | **remover o `style` inteiro** (o `btn-ghost` já é Névoa com borda Pelo) |
| `progress.tsx:1-4` | — | adicionar `import { PALETTE } from "@/lib/brand";` |
| `progress.tsx:15` | `cor: "#0AA35A"` | `cor: PALETTE.success` |
| `progress.tsx:16` | `cor: "#FEB803"` | `cor: PALETTE.mar` |
| `progress.tsx:17` | `cor: "#B57F00"` | `cor: PALETTE.coralClaro` |
| `progress.tsx:18` | `cor: "#C0392B"` | `cor: PALETTE.coral` |
| `progress.tsx:66` | `style={{ color: "#FEB803" }}` | `style={{ color: "var(--color-mar)" }}` |
| `quiz.tsx:181` | `style={{ color: "#8B91A8" }}` | `style={{ color: "var(--color-nevoa)" }}` |
| `quiz.tsx:185` | `style={{ color: "#02104E" }}` | `style={{ color: "var(--color-abismo)" }}` |
| `quiz.tsx:423` | `style={{ color: "#FEB803" }}` | `style={{ color: "var(--color-mar)" }}` |
| `quiz.tsx:~59` (barra de progresso do quiz) | `bg-yellow transition-all` | `bg-mar transition-all` (progresso é Mar, não Coral — fazer aqui, antes do rename da Fase 6) |
| `ranking.tsx:38` | `style={{ color: "#FEB803" }}` | `style={{ color: "var(--color-mar)" }}` |
| `redacao.index.tsx:29` e `:57` | idem | `var(--color-mar)` |
| `study.tsx:144` (botão "Sair" do header da aula) | `className="text-sm font-bold text-error"` | `className="text-sm font-bold text-nevoa"` (vinho é só de resposta errada) |
| `study.tsx:155` | `background: "#FEB803",` | `background: "var(--color-mar)",` |
| `study.tsx:189` | `isSel ? "border-yellow bg-[#FFFAF0] border-2" : "border-[#E6E5EE] bg-white"` | `isSel ? "border-mar bg-gelo border-2" : "border-gelo bg-white"` |
| `study.tsx:205` | `border border-[#FFD466] bg-[#FFFAF0]` | `border border-mar/40 bg-gelo` |
| `study.tsx:206` | `border-l border-t border-[#FFD466] bg-[#FFFAF0]` | `border-l border-t border-mar/40 bg-gelo` |
| `study.tsx:208` | `rounded-lg bg-[#FFD466]` | `rounded-lg bg-mar/20` |
| `study.tsx:267-273` (`ResultBlock`) | `<div className="rounded-xl p-4" style={ correct ? {…} : {…} }>` | `<div className={\`rounded-xl p-4 ${correct ? "bg-success/10 text-success" : "bg-error/10 text-error"}\`}>` — e o `<p className="font-display font-bold">` logo abaixo vira `<p className="flex items-center gap-2 font-display font-bold">{correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}{correct ? "Acertou!" : "Resposta incorreta"}</p>` (importar `CheckCircle2, XCircle` de `lucide-react`; é a regra "ícone + palavra" do `09` §3) |
| `study.tsx:346-348` | já feito na Fase 3 | — |
| `welcome.tsx:22` | já feito na Fase 3 | — |
| `__root.tsx:80` | já feito na Fase 3 | — |

**Não tocar:** `src/components/ui/chart.tsx` (os `#ccc`/`#fff` são seletores de atributo do Recharts, não cores nossas).

**Regras:** não alterar textos, handlers ou estrutura JSX além do indicado; `#fff` em `flashcards.tsx` e `error-page.ts` é permitido (Branco é token da paleta).

**Como verificar:**
```
grep -rnE "#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(" src --include=*.tsx --include=*.ts | grep -v routeTree.gen | grep -v components/ui/chart.tsx
```
deve listar **somente**: `src/lib/brand.ts` (13 hex), `src/lib/error-page.ts` (hex da paleta + `#fff`), `flashcards.tsx` (`#fff` 2×), `AppShell.tsx`/`TutorBubble.tsx` (`rgba(11,37,69,…)` 3×). Qualquer outra linha é pendência.
- Visual: `/study` → barra de progresso azul; selecionar alternativa → borda azul Mar, fundo gelo; verificar → verde/vinho com ícone; `/aha` → badges coral/azul/cinza; `/dashboard` → card premium em gradiente coral; `/profile` → "Sair da conta" cinza.

---

## 10. Fase 6 — Rename das classes antigas e remoção dos aliases

**Objetivo:** o código passa a usar os nomes novos (`abismo`, `coral`…) e os aliases da Fase 2 são apagados. Depois desta fase, `text-navy` não compila mais para nada — por isso o script tem que rodar por inteiro.

**Arquivos:** todos os `.ts`/`.tsx` sob `src/` **exceto** `src/routeTree.gen.ts`; `src/styles.css`. Criar `scripts/rename-tokens-foca.mjs` (apagado ao final desta fase).

1. Criar `scripts/rename-tokens-foca.mjs` com este conteúdo exato:

```js
// Rename mecânico dos tokens Flash Test → Foca (docs/17 §2.2). Roda uma vez e é apagado.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const PREFIX =
  "(bg|text|border|from|to|via|ring|fill|stroke|outline|decoration|placeholder|divide|shadow|accent|caret)";
// ORDEM IMPORTA: compostos antes dos simples.
const RULES = [
  ["navy-mist", "pelo"],
  ["navy-2", "nevoa"],
  ["gold-dark", "mar-fundo"],
  ["navy", "abismo"],
  ["royal", "abismo"],
  ["slate", "abismo"],
  ["yellow", "coral"],
  ["glow", "coral-claro"],
  ["cloud", "neve"],
  ["mist", "gelo"],
].map(([from, to]) => [new RegExp(`\\b${PREFIX}-${from}(?![\\w-])`, "g"), `$1-${to}`]);
RULES.push([/\bbtn-navy\b/g, "btn-abismo"]);

let files = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(e.name) || e.name === "routeTree.gen.ts") continue;
    const before = fs.readFileSync(p, "utf8");
    let after = before;
    for (const [re, to] of RULES) after = after.replace(re, to);
    if (after !== before) {
      fs.writeFileSync(p, after);
      files++;
      console.log("editado:", path.relative(process.cwd(), p));
    }
  }
}
walk(ROOT);
console.log(`\n${files} arquivos editados.`);
```

2. Rodar `node scripts/rename-tokens-foca.mjs` na raiz. Esperado: ~30 arquivos editados.

3. Verificar que **nada** sobrou:
```
grep -rnE "\b(bg|text|border|from|to|via|ring|fill|stroke|outline|decoration|placeholder|divide|shadow)-(navy|navy-2|navy-mist|royal|yellow|gold-dark|glow|slate|cloud|mist|ink)(/|\b)" src --include=*.tsx --include=*.ts | grep -v routeTree.gen
grep -rn "btn-navy" src
```
Ambos vazios. Se sobrar algo (ex.: classe montada por template string), corrigir à mão com o mapa da §2.2.

4. Em `src/styles.css`: apagar o bloco inteiro de `/* ALIASES TEMPORÁRIOS …` até `--color-mist: var(--color-gelo);` e apagar a utility duplicada `btn-navy` (ficando só `btn-abismo`).

5. Apagar `scripts/rename-tokens-foca.mjs`.

6. Confirmar que não sobrou nome antigo no CSS: `grep -n "navy\|yellow\|mist\|slate\|cloud\|royal\|glow\|gold" src/styles.css` → vazio.

**Regras:** não editar manualmente arquivos que o script já editou, exceto para resolver sobras do passo 3. Não mexer em `src/components/ui/` (o script não encontra nada lá; se encontrar, reportar).

**Como verificar:**
- `bunx tsc --noEmit` e `bun run lint` sem erros novos.
- `bun run build` passa.
- `bun run dev`: percorrer **todas** as rotas da Fase 0. Nenhum elemento com cor "sumida" (texto preto default `#000`, fundo transparente onde antes havia cor). Sinal de classe não resolvida: texto preto puro em vez de Abismo — inspecionar e corrigir.
- Comparar com os screenshots da Fase 0: mesma estrutura, cores novas.

---

## 11. Fase 7 — Persona do tutor (voz da Foca)

**Objetivo:** o balão do tutor fala como a Foca (`docs/15-mascote-e-voz.md` §6). Só o bloco `persona` muda.

**Arquivo:** `src/lib/tutor-prompt.ts`.

1. Substituir **apenas** a linha 52 (`const persona = \`Você é o tutor de IA do Flash Test…\`;`) por:

```ts
  const persona = `Você é a Foca — o mascote do app Foca, de preparação para o ENEM em aulas de 60 segundos.

PERSONALIDADE: seca, sarcástica, cômica. Você é uma foca, ou seja, um animal que passa o dia deitado numa pedra, e mesmo assim cobra disciplina do aluno sem nenhuma autoconsciência disso. Essa contradição é a fonte do seu humor.

REGRAS DE VOZ (inegociáveis):
- Máximo 2 frases de moldura (1 antes da explicação, 1 depois). A explicação em si fica no meio e é 100% clara, direta e sem ironia.
- Nunca ataque o aluno ("você é ruim", "do jeito que vai não passa"). Comente o comportamento ou a questão, nunca a pessoa.
- Errar nunca é motivo de cobrança — errar é o app funcionando. Você só implica com ausência, nunca com erro.
- Sem emoji. Sem "rs". Sem exclamação dupla. O humor é no timing, não na pontuação.
- Se o aluno estiver claramente frustrado ou disser que vai desistir, o sarcasmo some por completo. Você vira direta e acolhedora.`;
```

2. **Não tocar** em nada mais do arquivo: a regra anti-LaTeX, o formato de resposta, o `localFallback()` e o timeout continuam iguais.
3. Em `localFallback()` (mesmo arquivo), se alguma string contiver "Flash Test", trocar por "Foca". Nada além disso.

**Como verificar:** `grep -n "Flash Test" src/lib/tutor-prompt.ts` vazio; `bunx tsc --noEmit` ok; com `.env` configurado, errar uma questão em `/study` abre o balão e a resposta vem no tom da Foca (sem LaTeX). Sem `.env`, o fallback local continua respondendo.

---

## 12. Fase 8 — Chave do `localStorage`

**Objetivo:** o estado persistido deixa de se chamar `flashtest.*` sem apagar o progresso de quem já usou (recomendação do `09` §8).

**Arquivo:** `src/lib/store.ts`.

1. Linhas 86–88: substituir por

```ts
// v3: rebranding para Foca (docs/17 Fase 8). O formato é o mesmo da v2; a chave
// antiga é lida uma vez e copiada, para não apagar o progresso de quem já usou.
const KEY = "foca.state.v3";
const LEGACY_KEY = "flashtest.state.v2";
```

2. Em `load()`, trocar a linha `const raw = localStorage.getItem(KEY);` por:

```ts
    let raw = localStorage.getItem(KEY);
    if (raw === null) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy !== null) {
        raw = legacy;
        localStorage.setItem(KEY, legacy);
      }
    }
```

3. Nada mais muda (`persist()` já usa `KEY`). Não apagar a chave antiga.

**Como verificar:** DevTools → Application → Local Storage: com um estado antigo em `flashtest.state.v2`, recarregar `/dashboard` → aparece `foca.state.v3` com o mesmo JSON e o XP/streak continuam iguais. Num navegador limpo, fazer o quiz → só `foca.state.v3` é criado.

---

## 13. Fase 9 — Sincronizar documentação do repo

**Objetivo:** `CLAUDE.md` e `docs/` param de descrever o app como Flash Test.

**Arquivos:** `CLAUDE.md`, `docs/09-branding.md`, `docs/00-README.md`. (`CLAUDE.md` já tem alterações locais não commitadas — editar **apenas** as linhas abaixo, sem reverter o resto.)

1. `CLAUDE.md`, seção "## Design system — aplicar com fidelidade": substituir os 4 bullets por:

```markdown
- Paleta **Ártica** (`docs/09-branding.md` §3), tokens em `src/styles.css`: Abismo `#0B2545` (fundo de marca/texto forte) · Mar `#0EA5E9` / Mar Fundo `#0369A1` (interativos, progresso, labels) · Coral `#FF6B4A` (**só** CTA/XP/streak/recompensa) · Gelo/Neve/Pelo/Névoa (neutros frios) · Sucesso `#0AA35A` / Erro `#A02540` (**só** feedback de resposta certa/errada).
- Títulos: Space Grotesk (bold) · Corpo: Plus Jakarta Sans.
- Geometria: botões/inputs raio 10px (`--radius`), cards 16px (`--radius-card`), chips pílula. Proporção: Mar/Abismo 65% · Coral 10% · neutros 25%.
- Logo e mascote: a **cabeça da Foca**, sempre via `<FocaMark />` (`src/components/brand/FocaMark.tsx`), nunca esticada. Originais em `src/assets/branding/foca/`, derivados em `public/branding/foca/`. O raio (`Bolt`) e as cores navy/gold **não existem mais** no código. Onde a Foca aparece e onde não aparece: `docs/15` §4.
```

   E na linha do "Micro-treino de redação": `quem explica é o tutor do Flash Test.` → `quem explica é a Foca.`

2. `docs/09-branding.md`: no topo, trocar o aviso `> **⚠️ Ainda não aplicado no código.** …` por `> **✅ Aplicado no código em <data> — ver \`17-plano-migracao-visual-foca.md\`.** A arte final da logo (cabeça em 3/4, 6 versões) substituiu o SVG de referência da §2; os originais estão em \`src/assets/branding/foca/\`.` Na §8, trocar o título para `## 8. Checklist de migração no código (executado — ver 17)`.

3. `docs/00-README.md`: na tabela "Os arquivos", adicionar a linha `| \`17-plano-migracao-visual-foca.md\` | Implement (plano) | 🆕 Plano executável da migração visual para a Foca — tokens, logos, fases e auditoria |` e, na seção "Rebranding em curso", trocar `**Só as specs foram escritas — o código ainda é Flash Test.**` por `**Specs e código migrados (ver \`17\`).**`.

**Como verificar:** `grep -rn "Flash Navy\|Bolt\|flashtest-logo" CLAUDE.md` vazio.

---

## 14. Fase 10 — Auditoria final

**Objetivo:** provar que não sobrou identidade antiga e que nada quebrou. Rodar **tudo** e anexar as saídas no relatório final ao usuário.

### 14.1 Buscas (todas devem retornar vazio, salvo as exceções listadas)

| # | Comando | Esperado |
|---|---|---|
| 1 | `grep -rniE "flash ?test" src CLAUDE.md` | vazio, **exceto** `src/lib/store.ts` (`LEGACY_KEY`) |
| 2 | `grep -rniE "#(02104e\|17297a\|feb803\|b57f00\|ffd466\|c0392b\|3a4066\|8b91a8\|aeb8e8\|f7f6f9\|ececf3\|fef6e0\|fffaf0\|d8d6e0\|e6e5ee\|e0dfe9\|f3d2ce\|eef6f0\|fbecea\|f0eff5)" src` | vazio |
| 3 | `grep -rnE "#[0-9a-fA-F]{3,8}\b\|rgba?\(" src --include=*.tsx --include=*.ts \| grep -v routeTree.gen \| grep -v components/ui/chart.tsx` | só `brand.ts`, `error-page.ts` (hex da paleta + `#fff`), `flashcards.tsx` (`#fff`), `AppShell.tsx`/`TutorBubble.tsx` (`rgba(11,37,69,…)`) |
| 4 | `grep -rnE "\b(bg\|text\|border\|from\|to\|via\|ring\|fill\|stroke)-(navy\|royal\|yellow\|gold-dark\|glow\|slate\|cloud\|mist\|ink)(/\|\b)" src` | vazio |
| 5 | `grep -rn "Bolt\|flashtest-logo\|btn-navy" src public` | vazio |
| 6 | `grep -rn "navy\|yellow\|gold\|mist\|slate\|cloud\|royal\|glow" src/styles.css` | vazio |
| 7 | `grep -rn "<img" src --include=*.tsx \| grep -v FocaMark.tsx` | nenhum `<img src="/branding/…">` fora do `FocaMark`; imagens de conteúdo (ex.: foto de questão no tutor) são permitidas |
| 8 | `ls public` | `favicon.ico`, `branding/` — e **não** `flashtest-logo.png` |
| 9 | `ls public/branding/foca` | os 8 arquivos da §3.2, sem `_favicon-64.png` |
| 10 | `ls scripts` | só `gerar-logos-foca.ps1` (o `rename-tokens-foca.mjs` foi apagado) |
| 11 | `ls docs \| grep _tmp` | comparar os baselines com o resultado atual e depois apagar `docs/_tmp-baseline-*.txt` |

### 14.2 Técnico

- `bun run lint` — sem erros novos em relação ao baseline.
- `bunx tsc --noEmit` — sem erros novos.
- `bun run build` — sucesso; `dist/` contém `branding/foca/`.
- `bun run dev` — abrir cada rota da Fase 0; console sem erros (404 de `/flashtest-logo.png` ou de `/branding/…` = pendência).

### 14.3 Visual (percorrer no viewport 390×844 do DevTools e também em 440 px)

| Tela | Conferir |
|---|---|
| `/` | Foca 144 px centralizada sobre Abismo, não deformada; "Foca" + "Foca 60 segundos." em Mar |
| `/welcome` | Foca 132 px; marca d'água branca discreta; bullets com check coral; CTA coral com texto Abismo; link "Já tenho uma conta" em Pelo |
| `/quiz` | header "Foca" com ícone 18 px; barra de progresso Mar |
| `/aha` | badges coral/Mar/cinza legíveis sobre Abismo; XP com ícone da Foca; CTA sem ícone |
| `/dashboard` | hero Abismo, barra Mar, labels sem amarelo, card premium gradiente coral, missões concluídas com quadrado coral, nav ativo azul |
| `/study` | header com ícone Timer (sem Foca); progresso Mar; seleção Mar/Gelo; dica Gelo; feedback verde/vinho **com ícone**; tela final com Foca 64 px |
| `/redacao` e `/redacao/<id>` | hero Abismo; resultado da lição com XP e Foca; feedback verde/vinho |
| `/progress` | faixas success/Mar/coral-claro/coral; hero stat com Foca |
| `/ranking`, `/plan`, `/flashcards`, `/premium`, `/profile`, `/topics`, `/login`, `/forgot`, `/offline`, `/video/<id>` | nenhum amarelo/dourado/navy antigo; textos legíveis; "Sair da conta" cinza; "Foca Premium" |
| Balão do tutor (qualquer tela pós-quiz) | FAB com Foca 36 px; header "Foca" com ícone 22 px; caret coral; fundo Abismo |
| Aba/favicon | ícone da Foca sobre Abismo |

### 14.4 Contraste (DevTools → cor → "contrast ratio"; mínimo 4.5:1 para texto normal, 3:1 para ≥ 18.66 px bold)

- Texto Pelo sobre Abismo (≈ 10:1) ✓ · Névoa sobre branco (≈ 4.7:1) ✓ · Mar Fundo sobre branco (≈ 6:1) ✓ · Mar sobre Abismo (≈ 5.6:1) ✓ · Abismo sobre Coral (≈ 5.5:1) ✓ · Coral sobre Abismo (≈ 5.5:1) ✓.
- **Proibido** encontrar: texto coral sobre branco, texto Mar sobre branco (2.7:1), texto branco sobre coral. Se encontrar, trocar por `mar-fundo`/`abismo` conforme §2.3 e reportar.

### 14.5 Logos

- Todo `<img>` de `/branding/` tem `width === height` e `object-fit: contain` (DevTools → Computed).
- Nenhuma logo dentro de container com `overflow-hidden` que a corte (exceto as marcas d'água, cortadas de propósito pela borda da tela).
- Não há PNG duplicado entre `public/branding/foca/` e `src/assets/branding/foca/` (são conjuntos diferentes: derivados vs. originais).

---

## 15. Checklist de conclusão (marcar só com evidência)

- [ ] **1. Paleta do SDD implementada** — os 13 hex da tabela §2.1 estão em `src/styles.css` (`@theme inline`) e em `src/lib/brand.ts`, byte a byte iguais a `docs/09-branding.md` §3. Nenhuma cor fora dessa lista foi criada.
- [ ] **2. Cores centralizadas** — busca §14.1 #3 retorna só as exceções; nenhum `.tsx` tem hex de marca; utilities do `styles.css` só usam `var(--color-…)`.
- [ ] **3. Todas as telas na nova identidade** — as 21 rotas de `src/routes/` + `TutorBubble` + `LessonPlayer`/exercícios conferidas na §14.3, sem amarelo/navy antigo.
- [ ] **4. Todas as 6 logos preservadas e organizadas** — `src/assets/branding/foca/` tem os 6 originais + `README.md`; `public/branding/foca/` tem os 8 derivados; `scripts/gerar-logos-foca.ps1` regenera tudo.
- [ ] **5. Logo certa em cada contexto** — tabela §3.3 conferida tela a tela; `grep Bolt` vazio; nenhuma `<img>` de logo fora do `FocaMark`.
- [ ] **6. Nenhuma funcionalidade quebrada** — quiz → aha → dashboard → aula de 60s → resultado → tutor funcionam; redação abre e corrige; flashcards, ranking, progresso, plano, perfil abrem; estado antigo do `localStorage` migrou sem perder XP/streak.
- [ ] **7. Sem resíduos da identidade antiga** — buscas §14.1 #1–#6 vazias; `public/flashtest-logo.png` removido; favicon novo; `CLAUDE.md` e `docs/09`/`00` atualizados.
- [ ] **8. Projeto compila e roda** — `bun run lint`, `bunx tsc --noEmit`, `bun run build` sem erros novos; `bun run dev` sem erros de console em nenhuma rota.

Relatório final ao usuário: colar as saídas dos comandos da §14.1 e §14.2, listar qualquer item da checklist não marcado com o motivo, e listar decisões que precisaram de correção manual na Fase 6.
