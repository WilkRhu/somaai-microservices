# Script para iniciar MySQL + todos os microservicos na ordem correta
# Uso: .\scripts\start-complete.ps1

Write-Host "Iniciando stack completa SomaAI..." -ForegroundColor Green
Write-Host ""

# 1. Verificar se Docker esta instalado
Write-Host "[1/2] Verificando Docker..." -ForegroundColor Cyan
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Host "[!] Docker nao encontrado. Por favor, instale Docker primeiro." -ForegroundColor Red
    exit 1
}

# 2. Iniciar MySQL
Write-Host "[2/2] Iniciando MySQL..." -ForegroundColor Cyan
$mysqlContainer = docker ps -a --filter "name=somaai-mysql" --format "{{.Names}}"

if ($mysqlContainer -eq "somaai-mysql") {
    Write-Host "  [*] Container MySQL ja existe, iniciando..." -ForegroundColor Yellow
    docker start somaai-mysql
} else {
    Write-Host "  [*] Criando novo container MySQL..." -ForegroundColor Yellow
    docker run -d `
      --name somaai-mysql `
      -p 3306:3306 `
      -e MYSQL_ROOT_PASSWORD= `
      -e MYSQL_ALLOW_EMPTY_PASSWORD=yes `
      mysql:8.0
}

Write-Host "  [OK] MySQL iniciado na porta 3306" -ForegroundColor Green
Write-Host ""

# Aguardar MySQL ficar pronto
Write-Host "[3/2] Aguardando MySQL ficar pronto..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    try {
        $connection = New-Object System.Data.SqlClient.SqlConnection
        $connection.ConnectionString = "Server=localhost;User Id=root;Password=;"
        $connection.Open()
        $connection.Close()
        Write-Host "  [OK] MySQL esta pronto!" -ForegroundColor Green
        break
    } catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "  [*] Tentativa $attempt/$maxAttempts..." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "  [!] Timeout aguardando MySQL" -ForegroundColor Red
}

Write-Host ""
Write-Host "[OK] Stack pronta! Iniciando microservicos..." -ForegroundColor Green
Write-Host ""

# 3. Iniciar todos os microservicos
.\scripts\start-all-services.ps1
