param([string]$AssetDirectory = (Join-Path $env:TEMP 'parkfair-material-study'))
$ErrorActionPreference='Stop'
$assetDirectory = (Resolve-Path $AssetDirectory).Path
$stage=Join-Path $env:TEMP 'parkfair-5c-renderer'
New-Item -ItemType Directory -Path $stage -Force | Out-Null
foreach ($name in 'ToyCar.glb','viewer.js') { Copy-Item (Join-Path $assetDirectory $name) $stage }
foreach ($name in 'index.html','diagnostic.js') { Copy-Item (Join-Path $PSScriptRoot $name) $stage }
if (!(Test-Path (Join-Path $stage 'parking_garage_1k.hdr'))) {
    $file=(Invoke-RestMethod 'https://api.polyhaven.com/files/parking_garage').hdri.'1k'.hdr
    $dest=Join-Path $stage 'parking_garage_1k.hdr'
    Invoke-WebRequest $file.url -OutFile $dest
    if ((Get-FileHash $dest -Algorithm MD5).Hash -ne $file.md5) { throw 'HDRI checksum mismatch.' }
}
$adb="$env:LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
& $adb -e reverse tcp:8174 tcp:8174
if ($LASTEXITCODE) {throw 'Android transport unavailable.'}
if (Get-NetTCPConnection -State Listen -LocalPort 8174 -ErrorAction SilentlyContinue) {
    $page=Invoke-WebRequest 'http://127.0.0.1:8174/' -TimeoutSec 3
    if ($page.Content -notmatch 'ParkFair 3D diagnostics') {throw 'Port 8174 is occupied by another service.'}
    Write-Output 'ParkFair renderer diagnostics are ready on port 8174.'
    return
}
python -m http.server 8174 --bind 127.0.0.1 --directory $stage
