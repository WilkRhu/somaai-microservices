# Script para testar notificações passando pelo orquestrador
# Testa envio de notificações via Kafka através do orquestrador

$ErrorActionPreference = "Stop"

$ORCHESTRATOR_URL = "http://localhost:3000"
$NOTIFICATIONS_URL = "http://localhost:3005"

# Função para fazer requisições
function Make-Request {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Data,
        [string]$Description
    )

    Write-Host "→ $Description" -ForegroundColor Yellow
    Write-Host "  $Method $Url" -ForegroundColor Blue
    
    try {
        if ([string]::IsNullOrEmpty($Data)) {
            $response = Invoke-WebRequest -Uri $Url `
                -Method $Method `
                -Headers @{"Content-Type" = "application/json"} `
                -UseBasicParsing
        }
        else {
            Write-Host "  Payload: $Data" -ForegroundColor Blue
            $response = Invoke-WebRequest -Uri $Url `
                -Method $Method `
                -Headers @{"Content-Type" = "application/json"} `
                -Body $Data `
                -UseBasicParsing
        }
        
        $content = $response.Content | ConvertFrom-Json
        Write-Host "  Response: $($content | ConvertTo-Json -Depth 10)" -ForegroundColor Green
        Write-Host ""
        return $content
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Teste de Notificações via Orquestrador" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 1. Testar envio de notificação por email
Write-Host "1. Testando envio de notificação por EMAIL" -ForegroundColor Blue
Write-Host ""

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$emailPayload = @{
    userId = "user-123"
    type = "EMAIL"
    title = "Bem-vindo"
    message = "Sua conta foi criada com sucesso"
    recipient = "user@example.com"
    metadata = @{
        source = "orchestrator-test"
        timestamp = $timestamp
    }
} | ConvertTo-Json

Make-Request -Method "POST" `
    -Url "$NOTIFICATIONS_URL/notifications/send" `
    -Data $emailPayload `
    -Description "Enviando notificação de email"

# 2. Testar envio de notificação em lote
Write-Host "2. Testando envio de notificações em LOTE" -ForegroundColor Blue
Write-Host ""

$bulkPayload = @{
    notifications = @(
        @{
            userId = "user-123"
            type = "EMAIL"
            title = "Promoção"
            message = "Aproveite 20% de desconto"
            recipient = "user@example.com"
        },
        @{
            userId = "user-456"
            type = "EMAIL"
            title = "Promoção"
            message = "Aproveite 20% de desconto"
            recipient = "another@example.com"
        }
    )
} | ConvertTo-Json

Make-Request -Method "POST" `
    -Url "$NOTIFICATIONS_URL/notifications/send-bulk" `
    -Data $bulkPayload `
    -Description "Enviando notificações em lote"

# 3. Testar preferências de notificação
Write-Host "3. Testando PREFERÊNCIAS de notificação" -ForegroundColor Blue
Write-Host ""

$prefsPayload = @{
    emailNotifications = $true
    smsNotifications = $false
    pushNotifications = $true
    marketingEmails = $true
} | ConvertTo-Json

Make-Request -Method "PUT" `
    -Url "$NOTIFICATIONS_URL/notifications/preferences/user-123" `
    -Data $prefsPayload `
    -Description "Atualizando preferências de notificação"

# 4. Obter preferências
Write-Host "4. Obtendo PREFERÊNCIAS de notificação" -ForegroundColor Blue
Write-Host ""

Make-Request -Method "GET" `
    -Url "$NOTIFICATIONS_URL/notifications/preferences/user-123" `
    -Data "" `
    -Description "Recuperando preferências de notificação"

# 5. Registrar device token
Write-Host "5. Registrando DEVICE TOKEN" -ForegroundColor Blue
Write-Host ""

$devicePayload = @{
    userId = "user-123"
    deviceToken = @{
        token = "device-token-abc123xyz"
        platform = "ios"
        deviceName = "iPhone 14"
    }
} | ConvertTo-Json

Make-Request -Method "POST" `
    -Url "$NOTIFICATIONS_URL/notifications/device-tokens" `
    -Data $devicePayload `
    -Description "Registrando device token para push notifications"

# 6. Testar envio de email direto
Write-Host "6. Testando envio de EMAIL direto" -ForegroundColor Blue
Write-Host ""

$directEmailPayload = @{
    recipient = "test@example.com"
    subject = "Teste de Email"
    template = "welcome"
    variables = @{
        userName = "João Silva"
        activationLink = "https://example.com/activate/123"
    }
} | ConvertTo-Json

Make-Request -Method "POST" `
    -Url "$NOTIFICATIONS_URL/notifications/email/send" `
    -Data $directEmailPayload `
    -Description "Enviando email direto"

# 7. Testar envio de emails em lote
Write-Host "7. Testando envio de EMAILS em LOTE" -ForegroundColor Blue
Write-Host ""

$bulkEmailPayload = @{
    emails = @(
        @{
            recipient = "user1@example.com"
            subject = "Promoção Especial"
            template = "promotion"
            variables = @{
                discount = "20%"
                expiryDate = "2026-03-31"
            }
        },
        @{
            recipient = "user2@example.com"
            subject = "Promoção Especial"
            template = "promotion"
            variables = @{
                discount = "20%"
                expiryDate = "2026-03-31"
            }
        }
    )
} | ConvertTo-Json

Make-Request -Method "POST" `
    -Url "$NOTIFICATIONS_URL/notifications/email/send-bulk" `
    -Data $bulkEmailPayload `
    -Description "Enviando emails em lote"

# 8. Obter notificações do usuário
Write-Host "8. Obtendo NOTIFICAÇÕES do usuário" -ForegroundColor Blue
Write-Host ""

Make-Request -Method "GET" `
    -Url "$NOTIFICATIONS_URL/notifications/user-123?limit=10&offset=0" `
    -Data "" `
    -Description "Recuperando notificações do usuário"

# 9. Marcar notificação como lida
Write-Host "9. Marcando notificação como LIDA" -ForegroundColor Blue
Write-Host ""

Make-Request -Method "PUT" `
    -Url "$NOTIFICATIONS_URL/notifications/notification-id-123/read" `
    -Data "" `
    -Description "Marcando notificação como lida"

# 10. Verificar status de email
Write-Host "10. Verificando STATUS de email" -ForegroundColor Blue
Write-Host ""

Make-Request -Method "GET" `
    -Url "$NOTIFICATIONS_URL/notifications/email/status/email-id-123" `
    -Data "" `
    -Description "Recuperando status de email"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Testes de notificações concluídos!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Verificar logs do serviço de notificações"
Write-Host "2. Verificar se os eventos foram processados pelo Kafka"
Write-Host "3. Validar emails enviados no serviço de email"
Write-Host "4. Testar integração com o orquestrador"
