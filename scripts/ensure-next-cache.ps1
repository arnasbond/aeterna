# Valo Next.js cache (sugadintas .next ant OneDrive)
param([string]$WebDir)

function Clear-NextCache {
  param([string]$WebRoot)
  $localCache = Join-Path $env:LOCALAPPDATA "aeterna-next"
  $nextLink = Join-Path $WebRoot ".next"

  if (Test-Path $nextLink) {
    $item = Get-Item $nextLink -Force -ErrorAction SilentlyContinue
    if ($item -and ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
      cmd /c rmdir "`"$nextLink`"" 2>$null
    } else {
      Remove-Item -LiteralPath $nextLink -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
  if (Test-Path $localCache) {
    Remove-Item -LiteralPath $localCache -Recurse -Force -ErrorAction SilentlyContinue
  }
  $webpackCache = Join-Path $WebRoot "node_modules\.cache"
  if (Test-Path $webpackCache) {
    Remove-Item -LiteralPath $webpackCache -Recurse -Force -ErrorAction SilentlyContinue
  }
}
