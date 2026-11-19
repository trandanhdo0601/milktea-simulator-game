$ErrorActionPreference = "Stop"

try {
    Write-Host "=== 1. TEST REGISTER ==="
    $regBody = @{
        username = "bartender1"
        email = "bartender1@example.com"
        password = "password123"
    } | ConvertTo-Json
    try {
        $regRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
        Write-Host ($regRes | ConvertTo-Json -Depth 4)
    } catch {
        Write-Host "User already exists or registered, continuing to login..."
    }

    Write-Host "`n=== 2. TEST LOGIN ==="
    $loginBody = @{
        username = "bartender1"
        password = "password123"
    } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    Write-Host ($loginRes | ConvertTo-Json -Depth 4)
    $token = $loginRes.data.accessToken
    Write-Host "Token obtained: $token"

    Write-Host "`n=== 3. TEST GET RANDOM ORDER ==="
    $headers = @{
        Authorization = "Bearer $token"
    }
    $orderRes = Invoke-RestMethod -Uri "http://localhost:8080/api/game/orders/random" -Method Get -Headers $headers
    Write-Host ($orderRes | ConvertTo-Json -Depth 4)

    $orderId = $orderRes.data.id
    $teaType = $orderRes.data.teaType
    $milkType = $orderRes.data.milkType
    $sugarLevel = $orderRes.data.sugarLevel
    $iceLevel = $orderRes.data.iceLevel
    $topping = $orderRes.data.topping

    Write-Host "`n=== 4. TEST SUBMIT PERFECT RECIPE ==="
    $submitBody = @{
        orderId = $orderId
        teaType = $teaType
        milkType = $milkType
        sugarLevel = $sugarLevel
        iceLevel = $iceLevel
        topping = $topping
    } | ConvertTo-Json
    $submitRes = Invoke-RestMethod -Uri "http://localhost:8080/api/game/submit" -Method Post -Headers $headers -ContentType "application/json" -Body $submitBody
    Write-Host ($submitRes | ConvertTo-Json -Depth 4)

    Write-Host "`n=== 5. TEST GET HISTORY ==="
    $histRes = Invoke-RestMethod -Uri "http://localhost:8080/api/game/history" -Method Get -Headers $headers
    Write-Host ($histRes | ConvertTo-Json -Depth 4)

    Write-Host "`n=== 6. TEST GET STATISTICS ==="
    $statRes = Invoke-RestMethod -Uri "http://localhost:8080/api/game/statistics" -Method Get -Headers $headers
    Write-Host ($statRes | ConvertTo-Json -Depth 4)

    Write-Host "`n>>> ALL 6 API ENDPOINTS RETURNED 200 OK AND PASSED TESTS! <<<"
}
catch {
    Write-Error $_
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "HTTP Response Error: " $reader.ReadToEnd()
    }
}
