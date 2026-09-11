$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$ideasPath = Split-Path -Parent $projectPath
$flutter = Join-Path $ideasPath '.tooling\flutter\bin\flutter.bat'
if (-not (Test-Path -LiteralPath $flutter -PathType Leaf)) {
  throw 'Flutter fehlt unter Ideen\.tooling\flutter. Siehe README.'
}

$driveName = @('U', 'V', 'W') | Where-Object {
  -not (Test-Path -LiteralPath "${_}:\")
} | Select-Object -First 1
if (-not $driveName) { throw 'Kein freier Laufwerksbuchstabe für den Flutter-Test verfügbar.' }

$driveRoot = "${driveName}:\"
& subst "${driveName}:" $projectPath
if ($LASTEXITCODE -ne 0) { throw 'Der temporäre Testpfad konnte nicht erstellt werden.' }
try {
  Push-Location $driveRoot
  & $flutter test @args
  $testExitCode = $LASTEXITCODE
  Pop-Location
} finally {
  if ((Get-Location).Path -eq $driveRoot) { Pop-Location }
  & subst "${driveName}:" /d
}
exit $testExitCode
