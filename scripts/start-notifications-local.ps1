# Script para iniciar o serviço de notificações localmente (sem Docker)

Set-Location services/notifications

Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🚀 Iniciando serviço de notificações..." -ForegroundColor Green
npm run start:dev
