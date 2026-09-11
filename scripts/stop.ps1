$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exePath = [IO.Path]::GetFullPath((Join-Path $projectPath 'release\win-unpacked\UniX.exe'))
$processes = @(Get-Process -Name UniX -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $exePath })
if ($processes.Count -eq 0) {
  Write-Host 'UniX ist bereits beendet.'
  exit 0
}
$request = Start-Process -FilePath $exePath -ArgumentList '--unix-quit' -WindowStyle Hidden -PassThru
if (-not $request.WaitForExit(10000)) { throw 'Die Beenden-Anfrage wurde nicht abgeschlossen.' }
foreach ($process in $processes) {
  if (-not $process.WaitForExit(10000)) { throw 'UniX wartet noch auf einen Dialog oder Speichervorgang. Bitte das UniX-Fenster pruefen.' }
}
Write-Host 'UniX wurde regulaer beendet.'
