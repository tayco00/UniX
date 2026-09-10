$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $projectPath 'release\win-unpacked\UniX.exe'
if (-not (Test-Path -LiteralPath $exePath -PathType Leaf)) {
  throw 'UniX.exe fehlt. Bitte zuerst npm ci und npm run pack ausführen oder den Windows-Installer verwenden.'
}
# The native application enforces a single instance and focuses an existing window.
Start-Process -FilePath $exePath -WorkingDirectory (Split-Path -Parent $exePath) -WindowStyle Normal | Out-Null
Write-Host 'UniX wurde geöffnet. Zum Beenden das Fenster schließen oder Stop UniX.cmd verwenden.'
