# Script para verificar dados no monolith

Write-Host "🔍 Verificando dados no monolith..." -ForegroundColor Green
Write-Host ""

# Configuração do banco de dados (lê do .env se disponível)
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { 3306 }
$dbUser = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "somaai" }
$dbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { Read-Host "DB Password" -AsSecureString | ConvertFrom-SecureString -AsPlainText }
$dbName = "somaai_monolith"

# Criar conexão
$connectionString = "Server=$dbHost;Port=$dbPort;Database=$dbName;Uid=$dbUser;Pwd=$dbPassword;"

try {
    # Usar mysql.exe se disponível
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    
    if (Test-Path $mysqlPath) {
        Write-Host "📊 Executando queries no MySQL..." -ForegroundColor Cyan
        Write-Host ""
        
        # Executar queries
        & $mysqlPath -h $dbHost -u $dbUser -p$dbPassword $dbName < scripts/check-monolith-users.sql
    } else {
        Write-Host "❌ MySQL não encontrado em: $mysqlPath" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Alternativas:" -ForegroundColor Yellow
        Write-Host "1. Instale MySQL Community Server"
        Write-Host "2. Ou use um cliente MySQL GUI (MySQL Workbench, DBeaver, etc)"
        Write-Host "3. Ou execute manualmente o arquivo: scripts/check-monolith-users.sql"
    }
} catch {
    Write-Host "❌ Erro ao executar queries: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Verificação concluída" -ForegroundColor Green
