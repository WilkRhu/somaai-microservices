# Script para parar todos os microserviços
# Uso: .\scripts\stop-all-services.ps1

Write-Host "🛑 Parando todos os microserviços SomaAI..." -ForegroundColor Red
Write-Host ""

# Lista de serviços
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
    "payments",
    "gateway"
)

# Parar processos npm
Write-Host "Procurando processos npm em execução..." -ForegroundColor Yellow

$npmProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" }

if ($npmProcesses) {
    Write-Host "Encontrados $($npmProcesses.Count) processo(s) node" -ForegroundColor Yellow
    
    foreach ($proc in $npmProcesses) {
        Write-Host "  ⏹️  Parando processo PID: $($proc.Id)" -ForegroundColor Red
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host ""
    Write-Host "✅ Todos os processos foram parados!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Nenhum processo node encontrado em execução" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 Para iniciar novamente, execute: .\scripts\start-all-services.ps1" -ForegroundColor Yellow
