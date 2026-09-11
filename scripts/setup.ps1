$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$ideasPath = Split-Path -Parent $projectPath
$toolingPath = Join-Path $ideasPath '.tooling'
$flutterPath = Join-Path $toolingPath 'flutter\bin\flutter.bat'
$archivePath = Join-Path $toolingPath 'flutter-3.47.3.zip'

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw 'Node.js 22 oder neuer fehlt. Bitte zuerst Node.js installieren.'
}
if (-not (Test-Path -LiteralPath $flutterPath -PathType Leaf)) {
  New-Item -ItemType Directory -Path $toolingPath -Force | Out-Null
  Invoke-WebRequest -Uri 'https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.47.3-stable.zip' -OutFile $archivePath
  try {
    Expand-Archive -LiteralPath $archivePath -DestinationPath $toolingPath
  } finally {
    if (Test-Path -LiteralPath $archivePath -PathType Leaf) {
      Remove-Item -LiteralPath $archivePath -Force
    }
  }
}

Push-Location $projectPath
try {
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'npm ci ist fehlgeschlagen.' }
  & $flutterPath pub get
  if ($LASTEXITCODE -ne 0) { throw 'flutter pub get ist fehlgeschlagen.' }
  & npm.cmd run icons
  if ($LASTEXITCODE -ne 0) { throw 'Die App-Icons konnten nicht erzeugt werden.' }
} finally {
  Pop-Location
}
Write-Host 'UniX ist für die Entwicklung eingerichtet.'
