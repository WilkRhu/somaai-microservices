# Script para testar sincronização de usuários entre Auth e Monolith

$ErrorActionPreference = "Stop"

Write-Host "🧪 Iniciando testes de sincronização de usuários..." -ForegroundColor Green
Write-Host ""

# URLs dos serviços
$AUTH_URL = "http://localhost:3010"
$MONOLITH_URL = "http://localhost:3000"

# Função para testar
function Test-Sync {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [string]$Data,
        [int]$ExpectedStatus
    )
    
    Write-Host "📝 Teste: $TestName" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Endpoint
            Method = $Method
            Headers = @{
                "Content-Type" = "application/json"
                "X-Internal-Service" = "auth-service"
            }
        }
        
        if ($Data) {
            $params["Body"] = $Data
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $body = $response.Content
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ Status: $statusCode (esperado: $ExpectedStatus)" -ForegroundColor Green
            Write-Host "Response: $body"
        } else {
            Write-Host "❌ Status: $statusCode (esperado: $ExpectedStatus)" -ForegroundColor Red
            Write-Host "Response: $body"
        }
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Teste 1: Registrar novo usuário no Auth
Write-Host "=== TESTE 1: Registrar Usuário no Auth ===" -ForegroundColor Yellow
Write-Host ""

$timestamp = Get-Date -UFormat %s
$registerData = @{
    email = "testuser$timestamp@example.com"
    password = "TestPassword123!"
    firstName = "Test"
    lastName = "User"
    phone = "11999999999"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$AUTH_URL/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerData
    
    $registerJson = $registerResponse.Content | ConvertFrom-Json
    $userId = $registerJson.user.id
    $userEmail = $registerJson.user.email
    
    if ($userId) {
        Write-Host "✅ Usuário registrado com sucesso" -ForegroundColor Green
        Write-Host "User ID: $userId"
        Write-Host "Email: $userEmail"
    } else {
        Write-Host "❌ Falha ao registrar usuário" -ForegroundColor Red
        Write-Host "Response: $($registerResponse.Content)"
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao registrar: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Teste 2: Aguardar sincronização
Write-Host "=== TESTE 2: Aguardar Sincronização ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ Aguardando 2 segundos para sincronização..."
Start-Sleep -Seconds 2
Write-Host ""

# Teste 3: Verificar se usuário existe no Monolith
Write-Host "=== TESTE 3: Verificar Usuário no Monolith ===" -ForegroundColor Yellow
Write-Host ""

try {
    $checkResponse = Invoke-WebRequest -Uri "$MONOLITH_URL/api/users/internal/check/$userId" `
        -Method GET `
        -Headers @{"X-Internal-Service" = "auth-service"}
    
    Write-Host "✅ Usuário encontrado no Monolith" -ForegroundColor Green
    Write-Host "Response: $($checkResponse.Content)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "❌ Usuário NÃO encontrado no Monolith" -ForegroundColor Red
    } else {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Teste 4: Sincronização Manual (HTTP)
Write-Host "=== TESTE 4: Sincronização Manual (HTTP) ===" -ForegroundColor Yellow
Write-Host ""

$syncData = @{
    id = $userId
    email = $userEmail
    firstName = "Test"
    lastName = "User"
    phone = "11999999999"
    avatar = $null
    authProvider = "EMAIL"
    role = "USER"
    emailVerified = $false
} | ConvertTo-Json

try {
    $syncResponse = Invoke-WebRequest -Uri "$MONOLITH_URL/api/users/internal/sync-from-auth" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "X-Internal-Service" = "auth-service"
        } `
        -Body $syncData
    
    Write-Host "✅ Sincronização manual bem-sucedida" -ForegroundColor Green
    Write-Host "Status: $($syncResponse.StatusCode)"
    Write-Host "Response: $($syncResponse.Content)"
} catch {
    Write-Host "❌ Falha na sincronização manual" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🎉 Testes concluídos!" -ForegroundColor Green
