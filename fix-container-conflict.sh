#!/bin/bash
# Script para resolver conflito de container no Docker

echo "🔍 Verificando containers existentes..."

# Lista todos os containers (rodando e parados)
echo ""
echo "📋 Containers existentes:"
docker ps -a | grep -E "gwan-events|gwan-mentor"

echo ""
echo "🛑 Parando container conflitante (se estiver rodando)..."
docker stop gwan-events-backend 2>/dev/null || echo "Container não estava rodando"

echo ""
echo "🗑️  Removendo container conflitante..."
docker rm gwan-events-backend 2>/dev/null || echo "Container não existe ou já foi removido"

echo ""
echo "✅ Conflito resolvido! Agora você pode fazer o deploy novamente no Portainer."
echo ""
echo "💡 Dica: Se o erro persistir, verifique se há outros containers com nomes similares:"
docker ps -a | grep gwan

