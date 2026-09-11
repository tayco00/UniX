$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exe = [IO.Path]::GetFullPath((Join-Path $projectPath 'release\win-unpacked\UniX.exe'))
$processes = @(Get-Process -Name UniX -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $exe })
if ($processes.Count -eq 0) {
  Write-Host 'UniX ist bereits beendet.'
  exit 0
}
$request = Start-Process -FilePath $exe -ArgumentList '--unix-quit' -WindowStyle Hidden -PassThru
if (-not $request.WaitForExit(10000)) { throw 'Die Beenden-Anfrage wurde nicht abgeschlossen.' }
foreach ($process in $processes) {
  if (-not $process.WaitForExit(10000)) { throw 'UniX wartet auf eine Bestätigung. Bitte das UniX-Fenster prüfen.' }
}
Write-Host 'UniX wurde beendet.'
