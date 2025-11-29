$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and ($_.CommandLine -like '*\\OneDrive\\Desktop\\ari\\*') }
foreach ($p in $procs) {
  Write-Output "Killing PID=$($p.ProcessId) CMD=$($p.CommandLine)"
  try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue } catch { }
}
