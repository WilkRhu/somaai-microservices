# Script para testar o fluxo de autenticação

$ErrorActionPreference = "SilentlyContinue"

Write-Host "=== Testando Fluxo de Autenticação ===" -ForegroundColor Yellow
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
    
    Write-Host "Login bem-sucedido!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao fazer login: $_" -ForegroundColor Red
    Write-Host "Certifique-se de que o Auth Service está rodando na porta 3010" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar token no auth service
Write-Host "2. Verificando token no auth service..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-WebRequest -Uri "http://localhost:3010/api/auth/verify-token" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -Body "{}" `
        -ErrorAction Stop
    
    $verifyData = $verifyResponse.Content | ConvertFrom-Json
    Write-Host "Token válido no auth service!" -ForegroundColor Green
    Write-Host "Usuário: $($verifyData.user.email)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao verificar token: $_" -ForegroundColor Red
}

# 3. Tentar acessar o monolith
Write-Host "3. Tentando acessar monolith com o token..." -ForegroundColor Yellow
try {
    $monolithResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/users/profile" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -ErrorAction Stop
    
    $monolithData = $monolithResponse.Content | ConvertFrom-Json
    Write-Host "Acesso ao monolith bem-sucedido!" -ForegroundColor Green
    Write-Host "Usuário: $($monolithData.email)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao acessar monolith: $_" -ForegroundColor Red
    Write-Host "Certifique-se de que o Monolith está rodando na porta 3000" -ForegroundColor Yellow
}

# 4. Tentar acessar o orchestrador
Write-Host "4. Tentando acessar orchestrador com o token..." -ForegroundColor Yellow
try {
    $orchestratorResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/business/establishments" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -ErrorAction Stop
    
    $orchestratorData = $orchestratorResponse.Content | ConvertFrom-Json
    Write-Host "Acesso ao orchestrador bem-sucedido!" -ForegroundColor Green
    Write-Host "Estabelecimentos: $($orchestratorData.Count)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Erro ao acessar orchestrador: $_" -ForegroundColor Red
    Write-Host "Certifique-se de que o Orchestrador está rodando na porta 3002" -ForegroundColor Yellow
}

Write-Host "=== Teste Completo ===" -ForegroundColor Green
