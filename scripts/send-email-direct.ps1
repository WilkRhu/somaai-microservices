# Script para enviar email direto usando SMTP
# Não precisa do serviço de notificações rodando

$EmailTo = "wilk.caetano@gmail.com"
$EmailFrom = "somaai@wilkcaetano.com.br"
$SMTPServer = "smtp.hostinger.com"
$SMTPPort = 465
$SMTPUser = "somaai@wilkcaetano.com.br"
$SMTPPassword = $env:SMTP_PASSWORD

if ([string]::IsNullOrEmpty($SMTPPassword)) {
    Write-Host "❌ Erro: Variável de ambiente SMTP_PASSWORD não definida" -ForegroundColor Red
    Write-Host ""
    Write-Host "Configure a senha SMTP:" -ForegroundColor Yellow
    Write-Host '  $env:SMTP_PASSWORD = "sua-senha-aqui"' -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "📧 Enviando email direto via SMTP..." -ForegroundColor Cyan
Write-Host ""

try {
    $SMTPClient = New-Object Net.Mail.SmtpClient($SMTPServer, $SMTPPort)
    $SMTPClient.EnableSsl = $true
    $SMTPClient.Credentials = New-Object System.Net.NetworkCredential("$SMTPUser", "$SMTPPassword")

    $MailMessage = New-Object System.Net.Mail.MailMessage
    $MailMessage.From = $EmailFrom
    $MailMessage.To.Add($EmailTo)
    $MailMessage.Subject = "Teste de Email - Sistema de Notificações"
    $MailMessage.Body = @"
Olá Wilk Caetano,

Este é um email de teste do sistema de notificações SomaAI.

Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Link de ativação: https://example.com/activate/test-123

---
SomaAI - Sistema de Notificações
"@
    $MailMessage.IsBodyHtml = $false

    Write-Host "📤 Enviando para: $EmailTo" -ForegroundColor Yellow
    Write-Host "📝 Assunto: Teste de Email - Sistema de Notificações" -ForegroundColor Yellow
    Write-Host "📧 De: $EmailFrom" -ForegroundColor Yellow
    Write-Host ""

    $SMTPClient.Send($MailMessage)

    Write-Host "✅ Email enviado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifique sua caixa de entrada em: $EmailTo" -ForegroundColor Cyan

    $MailMessage.Dispose()
    $SMTPClient.Dispose()
}
catch {
    Write-Host "❌ Erro ao enviar email: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "1. Senha SMTP incorreta"
    Write-Host "2. Servidor SMTP indisponível"
    Write-Host "3. Firewall bloqueando a porta 465"
    Write-Host "4. Credenciais inválidas"
    exit 1
}

Write-Host ""
