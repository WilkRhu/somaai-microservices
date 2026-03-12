# Script para inicializar todos os bancos de dados
# Uso: .\scripts\init-databases.ps1

Write-Host "Inicializando bancos de dados SomaAI..." -ForegroundColor Green
Write-Host ""

# Verificar se Docker esta instalado
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Host "[!] Docker nao encontrado. Por favor, instale Docker primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se MySQL esta rodando
Write-Host "[*] Verificando MySQL..." -ForegroundColor Cyan
$mysqlContainer = docker ps -q -f "ancestor=mysql:8.0"

if (-not $mysqlContainer) {
    Write-Host "[!] MySQL nao esta rodando. Iniciando..." -ForegroundColor Yellow
    docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql:8.0
    Start-Sleep -Seconds 10
    $mysqlContainer = docker ps -q -f "ancestor=mysql:8.0"
}

Write-Host "[OK] MySQL esta rodando" -ForegroundColor Green
Write-Host ""

# Executar script SQL
Write-Host "[*] Criando bancos de dados e tabelas..." -ForegroundColor Cyan
$sqlFile = Get-Content "scripts/init-databases.sql" -Raw
docker exec $mysqlContainer mysql -u root -e $sqlFile

Write-Host "[OK] Bancos de dados inicializados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Bancos criados:" -ForegroundColor Cyan
Write-Host "  * somaai_auth" -ForegroundColor Cyan
Write-Host "  * somaai_monolith" -ForegroundColor Cyan
Write-Host "  * somaai_sales" -ForegroundColor Cyan
Write-Host "  * somaai_inventory" -ForegroundColor Cyan
Write-Host "  * somaai_delivery" -ForegroundColor Cyan
Write-Host "  * somaai_suppliers" -ForegroundColor Cyan
Write-Host "  * somaai_offers" -ForegroundColor Cyan
Write-Host "  * somaai_fiscal" -ForegroundColor Cyan
Write-Host "  * somaai_ocr" -ForegroundColor Cyan
Write-Host "  * somaai_payments" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Pronto para iniciar os microservicos!" -ForegroundColor Green
