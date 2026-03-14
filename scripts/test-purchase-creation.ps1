# Script para testar criação de compra via Orquestrador

$USER_ID = "e4bcb9a3-f93a-429e-87c7-88c2fcb4afcc"
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNGJjYjlhMy1mOTNhLTQyOWUtODdjNy04OGMyZmNiNGFmY2MiLCJlbWFpbCI6IndpbGsuY2FldGFub0BnbWFpbC5jb20iLCJpYXQiOjE3NzM0NTYwMzUsImV4cCI6MTc3MzQ1NjAzOH0.1Iq4YL8L1EPkV7gE7iERWwRAKZ6f9tTNog_GGM6oOIo"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Teste de Criação de Compra" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Criar compra via Orquestrador
Write-Host "1. Criando compra via Orquestrador..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:3009/api/monolith/purchases" -ForegroundColor Gray
Write-Host ""

$payload = @{
    type = "market"
    amount = 2.5
    merchant = "Teste"
    paymentMethod = "cash"
    purchasedAt = "2026-03-14T02:40:00.000Z"
    items = @(
        @{
            name = "Arroz"
            quantity = 1
            unit = "un"
            unitPrice = 2.5
        }
    )
    products = @(
        @{
            name = "Arroz"
            quantity = 1
            unit = "un"
            unitPrice = 2.5
        }
    )
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/purchases" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body $payload `
        -ErrorAction Stop

    Write-Host "✓ Sucesso! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "✗ Erro! Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host $reader.ReadToEnd() -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ""
Write-Host "2. Listando compras do usuário..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:3009/api/monolith/users/$USER_ID/purchases" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/users/$USER_ID/purchases" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        } `
        -ErrorAction Stop

    Write-Host "✓ Sucesso! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "✗ Erro! Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host $reader.ReadToEnd() -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Teste concluído" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
