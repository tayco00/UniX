$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$ideasPath = Split-Path -Parent $projectPath
$dart = Join-Path $ideasPath '.tooling\flutter\bin\dart.bat'
if (-not (Test-Path -LiteralPath $dart -PathType Leaf)) {
  throw 'Dart fehlt unter Ideen\.tooling\flutter. Siehe README.'
}
& $dart @args
exit $LASTEXITCODE
