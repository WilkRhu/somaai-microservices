# Script para testar o proxy do monolith no orchestrador

$ErrorActionPreference = "SilentlyContinue"

Write-Host "=== Testando Proxy do Monolith ===" -ForegroundColor Yellow
Write-Host ""

# 1. Login
Write-Host "1. Fazendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3010/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody `
        -ErrorAction Stop
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.accessToken
    $userId = $loginData.user.id
    
    Write-Host "Login bem-sucedido!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Green
    Write-Host "User ID: $userId" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao fazer login: $_" -ForegroundColor Red
    Write-Host "Certifique-se de que o Auth Service está rodando na porta 3010" -ForegroundColor Yellow
    exit 1
}

# 2. Listar compras do usuário
Write-Host "2. Listando compras do usuário..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/users/$userId/purchases" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -ErrorAction Stop
    
    $listData = $listResponse.Content | ConvertFrom-Json
    Write-Host "Compras listadas com sucesso!" -ForegroundColor Green
    Write-Host "Total de compras: $($listData.Count)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao listar compras: $_" -ForegroundColor Red
}

# 3. Criar compra
Write-Host "3. Criando nova compra..." -ForegroundColor Yellow
$createBody = @{
    total = 150.00
    status = "pending"
    items = @(
        @{
            productId = "prod-1"
            quantity = 2
            price = 75.00
        }
    )
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/users/$userId/purchases" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -Body $createBody `
        -ErrorAction Stop
    
    $createData = $createResponse.Content | ConvertFrom-Json
    $purchaseId = $createData.id
    
    Write-Host "Compra criada com sucesso!" -ForegroundColor Green
    Write-Host "Purchase ID: $purchaseId" -ForegroundColor Green
    Write-Host "Total: $($createData.total)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao criar compra: $_" -ForegroundColor Red
}

# 4. Obter compra específica
if ($purchaseId) {
    Write-Host "4. Obtendo compra específica..." -ForegroundColor Yellow
    try {
        $getResponse = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/users/$userId/purchases/$purchaseId" `
            -Method GET `
            -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
            -ErrorAction Stop
        
        $getData = $getResponse.Content | ConvertFrom-Json
        Write-Host "Compra obtida com sucesso!" -ForegroundColor Green
        Write-Host "ID: $($getData.id)" -ForegroundColor Green
        Write-Host "Status: $($getData.status)" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "Erro ao obter compra: $_" -ForegroundColor Red
    }
}

# 5. Atualizar compra
if ($purchaseId) {
    Write-Host "5. Atualizando compra..." -ForegroundColor Yellow
    $updateBody = @{
        status = "shipped"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/users/$userId/purchases/$purchaseId" `
            -Method PUT `
            -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
            -Body $updateBody `
            -ErrorAction Stop
        
        $updateData = $updateResponse.Content | ConvertFrom-Json
        Write-Host "Compra atualizada com sucesso!" -ForegroundColor Green
        Write-Host "Novo status: $($updateData.status)" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "Erro ao atualizar compra: $_" -ForegroundColor Red
    }
}

# 6. Listar todas as compras
Write-Host "6. Listando todas as compras..." -ForegroundColor Yellow
try {
    $allResponse = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/purchases" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -ErrorAction Stop
    
    $allData = $allResponse.Content | ConvertFrom-Json
    Write-Host "Todas as compras listadas com sucesso!" -ForegroundColor Green
    Write-Host "Total de compras: $($allData.Count)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao listar todas as compras: $_" -ForegroundColor Red
}

Write-Host "=== Teste Completo ===" -ForegroundColor Green
