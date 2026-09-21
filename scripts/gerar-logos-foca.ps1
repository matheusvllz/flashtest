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
# Grafite de Lápis — paleta Rabisco na Margem (docs/18-plano-reestilizacao-rabisco.md §6.1).
# Era #0B2545 (Abismo, paleta Ártica) até o rebrand de 20/09/2026.
$ABISMO = "#3A3A3C"

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

# --- Expressões da Foca (docs/18-plano-reestilizacao-rabisco.md §8.2, D5) ---
# 8 expressões de docs/15-mascote-e-voz.md §5. Arte final ainda não existe —
# enquanto `src/assets/branding/foca/expressoes/<expr>.png` não for entregue
# pelo designer, cada expressão usa a arte neutra (foca-color-transparent.png)
# como fallback interino: nada quebra, a expressão só "não muda" ainda.
$expressoesDir = Join-Path $src "expressoes"
$outExpressoes = Join-Path $out "expressoes"
New-Item -ItemType Directory -Force $outExpressoes | Out-Null
$expressoes = @("neutra", "cobrando", "orgulhosa", "empolgada", "desapontada", "surpresa", "entediada", "acolhedora")
foreach ($expr in $expressoes) {
  $candidato = Join-Path $expressoesDir "$expr.png"
  $fonte = if (Test-Path $candidato) { $candidato } else { $color }
  Export-Foca $fonte (Join-Path $outExpressoes "$expr-96.png")  96  96  $null 0.04
  Export-Foca $fonte (Join-Path $outExpressoes "$expr-320.png") 320 320 $null 0.04
}
