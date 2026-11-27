param(
    [string]$AssetDirectory = (Join-Path $env:TEMP 'parkfair-material-study'),
    [string]$PorscheGlb,
    [switch]$CompactTextures
)
$ErrorActionPreference='Stop'
$assetDirectory = (Resolve-Path $AssetDirectory).Path
$stage=Join-Path $env:TEMP 'parkfair-5c-renderer'
New-Item -ItemType Directory -Path $stage -Force | Out-Null
if ($CompactTextures -and !(Test-Path -LiteralPath (Join-Path $stage 'garage-brutalist-compact.glb'))) {
    throw 'Generate garage-brutalist-compact.glb with compact_garage.py before opting in.'
}
foreach ($name in 'ToyCar.glb','viewer.js') { Copy-Item (Join-Path $assetDirectory $name) $stage }
foreach ($name in 'index.html','diagnostic.js','garage.html','garage.js','parking-study.html','parking-study.js','parking-study-model.js') { Copy-Item (Join-Path $PSScriptRoot $name) $stage }
Copy-Item (Join-Path $PSScriptRoot '../src/data/parkingStudy.json') $stage
if ($CompactTextures) {
    $script = Get-Content -LiteralPath (Join-Path $stage 'garage.js') -Raw
    $script.Replace("'garage-brutalist.glb'", "'garage-brutalist-compact.glb'") |
        Set-Content -LiteralPath (Join-Path $stage 'garage-compact-study.js') -Encoding utf8
    $page = Get-Content -LiteralPath (Join-Path $stage 'garage.html') -Raw
    $page.Replace('garage.js?', 'garage-compact-study.js?') |
        Set-Content -LiteralPath (Join-Path $stage 'garage.html') -Encoding utf8
}
if ($PorscheGlb) {
    # Supply the authorized Lionsharp Studios Porsche download as a self-contained GLB.
    $file = (Resolve-Path -LiteralPath $PorscheGlb).Path
    $stream = [IO.File]::OpenRead($file)
    try {
        $header = [byte[]]::new(4)
        if ($stream.Read($header,0,4) -ne 4 -or [Text.Encoding]::ASCII.GetString($header) -cne 'glTF') {
            throw 'Expected the authorized Porsche as a GLB file.'
        }
    } finally { $stream.Dispose() }
    Copy-Item -LiteralPath $file -Destination (Join-Path $stage 'porsche.glb')
}
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
