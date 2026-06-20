# Local Windows helper: publish IPNS to DHT via kubo name publish.
param(
  [string]$KuboExe = "$env:TEMP\kubo-win\kubo\ipfs.exe"
)

$ErrorActionPreference = "Stop"
function Invoke-Ipfs {
  param([string[]]$IpfsArgs)
  $out = cmd /c "`"$KuboExe`" $($IpfsArgs -join ' ') 2>&1"
  return @{ ExitCode = $LASTEXITCODE; Output = $out }
}
$ExpectedName = "k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp"

if (-not $env:IPNS_SIGNING_KEY_B64) {
  $secret = Join-Path $PSScriptRoot "..\IPNS_SIGNING_KEY.secret.txt"
  if (Test-Path $secret) {
    $env:IPNS_SIGNING_KEY_B64 = (Get-Content $secret -Raw).Trim()
  }
}
if (-not $env:IPNS_SIGNING_KEY_B64) { throw "missing IPNS_SIGNING_KEY_B64" }
if (-not (Test-Path $KuboExe)) { throw "kubo not found at $KuboExe" }

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $repoRoot

$resolve = node scripts/resolve-current-cid.mjs
$cid = ($resolve | Select-String '^CID=(.+)$').Matches.Groups[1].Value
$seq = ($resolve | Select-String '^SEQ=(.+)$').Matches.Groups[1].Value
if (-not $cid -or -not $seq) { throw "could not resolve w3name record" }

Write-Host "dht-publish: seq=$seq cid=$cid"

$work = Join-Path $env:TEMP ("ipfs-dht-" + [guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Force -Path $work | Out-Null
$env:IPFS_PATH = Join-Path $work "repo"
$keyFile = Join-Path $work "ipns-key.proto.bin"
$carFile = Join-Path $work "site.car"

node scripts/key-to-kubo.mjs $keyFile
& $KuboExe init --profile server | Out-Null
& $KuboExe config Routing.Type auto | Out-Null
node -e "const fs=require('fs');const p=process.env.IPFS_PATH+'/config';const c=JSON.parse(fs.readFileSync(p,'utf8'));c.Ipns.DelegatedPublishers=['https://delegated-ipfs.dev/routing/v1/ipns'];c.Ipns.UsePubsub=true;c.Ipns.UsePubsubRouter=true;fs.writeFileSync(p,JSON.stringify(c,null,2));"
& $KuboExe key import kpsite $keyFile --allow-any-key-type | Out-Null

$carUrl = "https://ipfs.io/ipfs/$cid`?format=car"
curl.exe -fsSL -H "Accept: application/vnd.ipld.car" --max-time 300 $carUrl -o $carFile
if (-not (Test-Path $carFile) -or (Get-Item $carFile).Length -lt 1000) {
  throw "CAR fetch failed"
}
Write-Host "dht-publish: CAR fetched"

$logFile = Join-Path $work "daemon.log"
$daemon = Start-Process -FilePath $KuboExe -ArgumentList "daemon" -PassThru -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError (Join-Path $work "daemon.err.log")
try {
  Start-Sleep -Seconds 5
  $daemonUp = $false
  for ($i = 0; $i -lt 90; $i++) {
    $id = Invoke-Ipfs -IpfsArgs @("swarm", "peers")
    if ($id.ExitCode -eq 0) { $daemonUp = $true; break }
    Start-Sleep -Seconds 2
  }
  if (-not $daemonUp) {
    if (Test-Path $logFile) { Get-Content $logFile -Tail 40 }
    throw "daemon never came up"
  }

  for ($i = 0; $i -lt 90; $i++) {
    $peerRes = Invoke-Ipfs -IpfsArgs @("swarm", "peers")
    if ($peerRes.ExitCode -eq 0) {
      $peers = @($peerRes.Output).Count
      Write-Host "dht-publish: swarm peers = $peers"
      if ($peers -gt 0) { break }
    }
    Start-Sleep -Seconds 2
  }

  $import = Invoke-Ipfs -IpfsArgs @("dag", "import", $carFile)
  if ($import.ExitCode -ne 0) { throw "dag import failed: $($import.Output)" }

  $pub = Invoke-Ipfs -IpfsArgs @(
    "name", "publish", "--key=kpsite", "--sequence=$seq",
    "--lifetime=8760h", "--ttl=1m", "/ipfs/$cid"
  )
  $published = ($pub.ExitCode -eq 0)
  if (-not $published) {
    Write-Host "dht-publish: DHT publish failed; trying delegated fallback"
    Write-Host $pub.Output
    $pub = Invoke-Ipfs -IpfsArgs @(
      "name", "publish", "--key=kpsite", "--allow-delegated",
      "--sequence=$seq", "--lifetime=8760h", "--ttl=1m", "/ipfs/$cid"
    )
    $published = ($pub.ExitCode -eq 0)
  }
  if (-not $published) { throw "name publish failed: $($pub.Output)" }
  Write-Host $pub.Output

  $resolved = Invoke-Ipfs -IpfsArgs @("name", "resolve", "/ipns/$ExpectedName")
  Write-Host "dht-publish: local resolve -> $($resolved.Output)"

  Write-Host "dht-publish: published; keeping daemon up for DHT reprovide (900s)"
  for ($m = 1; $m -le 6; $m++) {
    Start-Sleep -Seconds 150
    $limo = try {
      $h = curl.exe -sI "https://kp2kp.eth.limo" 2>$null
      if ($h -match 'x-ipfs-roots:\s*(\S+)') { $Matches[1] } else { "<none>" }
    } catch { "<error>" }
    Write-Host "dht-publish: eth.limo check $m -> $limo"
    if ($limo -match $cid) { break }
  }
} finally {
  if ($daemon -and -not $daemon.HasExited) { Stop-Process -Id $daemon.Id -Force }
  Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
}

Pop-Location