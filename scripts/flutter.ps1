$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$ideasPath = Split-Path -Parent $projectPath
$flutter = Join-Path $ideasPath '.tooling\flutter\bin\flutter.bat'
if (-not (Test-Path -LiteralPath $flutter -PathType Leaf)) {
  throw 'Flutter fehlt unter Ideen\.tooling\flutter. Siehe README.'
}
& $flutter @args
exit $LASTEXITCODE
