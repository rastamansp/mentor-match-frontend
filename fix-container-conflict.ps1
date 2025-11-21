# Script PowerShell para resolver conflito de container no Docker

Write-Host "🔍 Verificando containers existentes..." -ForegroundColor Cyan

# Lista todos os containers (rodando e parados)
Write-Host ""
Write-Host "📋 Containers existentes:" -ForegroundColor Yellow
docker ps -a | Select-String -Pattern "gwan-events|gwan-mentor"

Write-Host ""
Write-Host "🛑 Parando container conflitante (se estiver rodando)..." -ForegroundColor Yellow
docker stop gwan-events-backend 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Container não estava rodando ou não existe" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗑️  Removendo container conflitante..." -ForegroundColor Yellow
docker rm gwan-events-backend 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Container não existe ou já foi removido" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Conflito resolvido! Agora você pode fazer o deploy novamente no Portainer." -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dica: Se o erro persistir, verifique se há outros containers com nomes similares:" -ForegroundColor Cyan
docker ps -a | Select-String -Pattern "gwan"

