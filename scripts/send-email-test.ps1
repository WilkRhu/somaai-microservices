# Script para enviar um email de teste
# Uso: .\scripts\send-email-test.ps1

$NOTIFICATIONS_URL = "http://localhost:3005"

Write-Host ""
Write-Host "📧 Enviando email de teste..." -ForegroundColor Cyan
Write-Host ""

$emailData = @{
    recipient = "wilk.caetano@gmail.com"
    subject = "Teste de Email - Sistema de Notificações"
    template = "welcome"
    variables = @{
        userName = "Wilk Caetano"
        activationLink = "https://example.com/activate/test-123"
        timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
} | ConvertTo-Json

try {
    Write-Host "📤 Enviando para: wilk.caetano@gmail.com" -ForegroundColor Yellow
    Write-Host "📝 Assunto: Teste de Email - Sistema de Notificações" -ForegroundColor Yellow
    Write-Host "🎨 Template: welcome" -ForegroundColor Yellow
    Write-Host ""

    $response = Invoke-WebRequest -Uri "$NOTIFICATIONS_URL/notifications/email/send" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $emailData `
        -UseBasicParsing

    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
        Write-Host "✅ Email enviado com sucesso!" -ForegroundColor Green
        Write-Host "📊 Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "📋 Resposta:" -ForegroundColor Green
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
    }
    else {
        Write-Host "❌ Erro ao enviar email" -ForegroundColor Red
        Write-Host "📊 Status: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "📋 Resposta:" -ForegroundColor Red
        $response.Content | Write-Host
        exit 1
    }
}
catch {
    Write-Host "❌ Erro na requisição: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Dica: Certifique-se de que o serviço de notificações está rodando na porta 3005" -ForegroundColor Yellow
    Write-Host "   Execute: docker ps | grep notifications" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
