Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
New-Item -ItemType Directory -Force -Path $assets | Out-Null

function New-SwarmIconPng {
  param(
    [int]$Size,
    [string]$Path
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle 0, 0, $Size, $Size),
    [System.Drawing.Color]::FromArgb(255, 232, 234, 230),
    [System.Drawing.Color]::FromArgb(255, 35, 42, 46),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $graphics.FillRectangle($background, 0, 0, $Size, $Size)

  $mark = New-Object System.Drawing.Drawing2D.GraphicsPath
  $scale = $Size / 1080.0
  $leftX = 221 * $scale
  $leftY = 540 * $scale
  $rightX = 545 * $scale
  $rightY = 220 * $scale
  $bar = 36 * $scale
  $rightOuter = 858 * $scale
  $bottomOuter = 858 * $scale

  $mark.StartFigure()
  $mark.AddLine($rightX, $rightY, ($rightX + $bar), $rightY)
  $mark.AddBezier(
    ($rightX + $bar), $rightY,
    ($rightX + $bar), (383 * $scale),
    (706 * $scale), (504 * $scale),
    $rightOuter, (504 * $scale)
  )
  $mark.AddLine($rightOuter, (504 * $scale), $rightOuter, (540 * $scale))
  $mark.AddLine($rightOuter, (540 * $scale), $rightX, (540 * $scale))
  $mark.AddLine($rightX, (540 * $scale), $rightX, $rightY)
  $mark.CloseFigure()

  $mark.StartFigure()
  $mark.AddLine($leftX, $leftY, (534 * $scale), $leftY)
  $mark.AddLine((534 * $scale), $leftY, (534 * $scale), $bottomOuter)
  $mark.AddLine((534 * $scale), $bottomOuter, (498 * $scale), $bottomOuter)
  $mark.AddBezier(
    (498 * $scale), $bottomOuter,
    (498 * $scale), (696 * $scale),
    (376 * $scale), (576 * $scale),
    $leftX, (576 * $scale)
  )
  $mark.AddLine($leftX, (576 * $scale), $leftX, $leftY)
  $mark.CloseFigure()

  $graphics.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 9, 10, 14))), $mark)

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$pngPath = Join-Path $assets 'app-icon.png'
$icoPath = Join-Path $assets 'app-icon.ico'
New-SwarmIconPng 512 $pngPath

[System.Drawing.Bitmap]$iconBitmap = [System.Drawing.Image]::FromFile($pngPath)
$iconHandle = $iconBitmap.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$stream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
$icon.Save($stream)
$stream.Close()
$icon.Dispose()
$iconBitmap.Dispose()

Write-Host "created $pngPath"
Write-Host "created $icoPath"
