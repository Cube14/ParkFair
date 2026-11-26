$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$state = Join-Path $env:LOCALAPPDATA 'ParkFair/phase4b'
$sdk = Join-Path $env:LOCALAPPDATA 'Android/Sdk'
$adb = "$sdk/platform-tools/adb.exe"
function Listening($port) {
    [bool](Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
}
function Wait-Port($port) {
    foreach ($attempt in 1..45) {
        if (Listening $port) { return }
        Start-Sleep -Seconds 1
    }
    throw "Port $port did not open."
}
$env:PARKFAIR_MONGO_PORT = '27149'
if (!(Listening 27149)) {
    docker compose -p parkfair-phase4b -f infrastructure/compose.dev.yml up -d --no-recreate --wait
    if ($LASTEXITCODE) { throw 'Replica set unavailable.' }
}
if (!(Listening 5443)) {
    $env:PARKFAIR_MOBILE_FIXTURE = (Get-Content "$state/database.txt" -Raw).Trim()
    Start-Process node -ArgumentList @('backend/scripts/mobile-dev.js','127.0.0.1',('"' + "$state/emulator.key" + '"'),('"' + "$state/emulator.pem" + '"')) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardError "$state/backend-errors.log"
    Wait-Port 5443
}
$env:NODE_EXTRA_CA_CERTS = "$state/root.pem"
foreach ($attempt in 1..10) {
    node -e "fetch('https://127.0.0.1:5443/api/health/ready').then(async r=>{if(!r.ok || !(await r.json()).success) process.exitCode=1}).catch(e=>{console.error(e.cause?.message || e.message);process.exitCode=1})"
    if (!$LASTEXITCODE) { break }
    Start-Sleep -Seconds 1
}
if ($LASTEXITCODE) { throw 'Trusted HTTPS readiness failed. Check the development certificate and database.' }
$env:EXPO_PUBLIC_API_URL = 'https://10.0.2.2:5443/api'
if (!(Listening 8082)) {
    Start-Process node -ArgumentList 'node_modules/expo/bin/cli start --dev-client --localhost --port 8082' -WorkingDirectory "$PSScriptRoot/mobile" -WindowStyle Hidden -RedirectStandardError "$state/metro-errors.log"
    Wait-Port 8082
}
if ((Invoke-RestMethod http://127.0.0.1:8082/status) -notmatch 'packager-status:running') { throw 'Metro readiness failed.' }
if (!((& $adb devices) -match '^emulator-\d+\s+')) {
    Start-Process "$sdk/emulator/emulator.exe" -ArgumentList '-avd ParkFair_QA_API_36 -cores 2 -memory 2048 -gpu host -no-snapshot'
}
$ready = $false
foreach ($attempt in 1..90) {
    if ((& $adb -e shell getprop sys.boot_completed 2>$null) -eq '1') { $ready = $true; break }
    Start-Sleep -Seconds 2
}
if (!$ready) { throw 'Android boot did not complete.' }
& $adb -e reverse tcp:8082 tcp:8082
if ($LASTEXITCODE) { throw 'Metro reverse failed.' }
& $adb -e shell am start -a android.intent.action.VIEW -d 'parkfair://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082' com.cube14.parkfair
if ($LASTEXITCODE) { throw 'ParkFair launch failed.' }
