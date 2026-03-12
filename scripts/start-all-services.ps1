# Script para iniciar todos os microservicos localmente em paralelo
# Uso: .\scripts\start-all-services.ps1

Write-Host "Iniciando todos os microservicos SomaAI (LOCAL)..." -ForegroundColor Green
Write-Host ""

# Lista de servicos
$services = @(
    "auth",
    "monolith",
    "sales",
    "inventory",
    "delivery",
    "suppliers",
    "offers",
    "fiscal",
    "ocr",
    "payments"
)

# Cores para cada servico
$colors = @{
    "auth" = "Cyan"
    "monolith" = "Magenta"
    "sales" = "Yellow"
    "inventory" = "Green"
    "delivery" = "Blue"
    "suppliers" = "Red"
    "offers" = "DarkCyan"
    "fiscal" = "DarkMagenta"
    "ocr" = "DarkYellow"
    "payments" = "DarkGreen"
}

# Array para armazenar os processos
$processes = @()

# Instalar dependencias e iniciar cada servico em uma nova janela
foreach ($service in $services) {
    $servicePath = "services/$service"
    
    if (Test-Path $servicePath) {
        Write-Host "[*] Preparando $service..." -ForegroundColor $colors[$service]
        
        # Comando: instalar deps e rodar
        $command = "cd $servicePath; npm install --legacy-peer-deps 2>&1 | Out-Null; npm run start:dev"
        
        # Iniciar em nova janela PowerShell
        $process = Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -PassThru
        $processes += @{
            Name = $service
            Process = $process
            PID = $process.Id
        }
        
        Start-Sleep -Milliseconds 300
    } else {
        Write-Host "[!] Servico $service nao encontrado em $servicePath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[OK] Todos os servicos foram iniciados em janelas separadas!" -ForegroundColor Green
Write-Host ""
Write-Host "Processos em execucao:" -ForegroundColor Cyan
foreach ($proc in $processes) {
    Write-Host "  * $($proc.Name) (PID: $($proc.PID))" -ForegroundColor $colors[$proc.Name]
}

Write-Host ""
Write-Host "URLs dos Servicos:" -ForegroundColor Cyan
Write-Host "  * Auth Service: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  * Monolith: http://localhost:3000" -ForegroundColor Magenta
Write-Host "  * Sales: http://localhost:3001" -ForegroundColor Yellow
Write-Host "  * Inventory: http://localhost:3002" -ForegroundColor Green
Write-Host "  * Delivery: http://localhost:3003" -ForegroundColor Blue
Write-Host "  * Suppliers: http://localhost:3004" -ForegroundColor Red
Write-Host "  * Offers: http://localhost:3005" -ForegroundColor DarkCyan
Write-Host "  * Fiscal: http://localhost:3006" -ForegroundColor DarkMagenta
Write-Host "  * OCR: http://localhost:3007" -ForegroundColor DarkYellow
Write-Host "  * Payments: http://localhost:3008" -ForegroundColor DarkGreen

Write-Host ""
Write-Host "[*] Cada servico esta em uma janela separada para facil debug" -ForegroundColor Yellow
Write-Host "[*] Para parar um servico, feche a janela ou pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione Ctrl+C para sair deste script (os servicos continuarao rodando)" -ForegroundColor Gray
