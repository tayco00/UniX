$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exePath = [IO.Path]::GetFullPath((Join-Path $projectPath 'release\win-unpacked\UniX.exe'))
$unixProcesses = @(Get-Process -Name UniX -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $exePath })
if ($unixProcesses.Count -eq 0) {
  Write-Host 'UniX ist bereits beendet.'
  exit 0
}
# Request a normal app quit through Electron's single-instance channel.
$quitRequest = Start-Process -FilePath $exePath -ArgumentList '--unix-quit' -WindowStyle Hidden -PassThru
if (-not $quitRequest.WaitForExit(10000)) { throw 'Die Beenden-Anfrage wurde nicht abgeschlossen.' }
foreach ($unixProcess in $unixProcesses) {
  if (-not $unixProcess.WaitForExit(10000)) {
    throw 'UniX wartet noch auf einen Dialog oder Speichervorgang. Bitte das UniX-Fenster pruefen.'
  }
}
Write-Host 'UniX wurde regulaer beendet.'
