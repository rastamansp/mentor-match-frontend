# Deploy em Produção - Gwan Events

Este documento descreve como fazer o deploy da aplicação Gwan Events em produção usando Docker Compose com Traefik.

## Pré-requisitos

- Servidor Ubuntu/Debian com Docker e Docker Compose instalados
- Domínios configurados:
  - `events.gwan.com.br` (frontend)
  - `api-events.gwan.com.br` (backend)
  - `traefik.gwan.com.br` (dashboard do Traefik)
  - `monitoring.gwan.com.br` (Prometheus)
  - `grafana.gwan.com.br` (Grafana)
- Certificados SSL automáticos via Let's Encrypt

## Estrutura de Arquivos

```
/
├── docker-compose-production.yml
├── .env.production
├── env.production.example
├── nginx/
│   └── nginx.production.conf
├── traefik/
│   └── traefik.yml
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
│       ├── datasources/
│       │   └── prometheus.yml
│       └── dashboards/
│           └── dashboard.yml
└── postgres/
    └── init.sql
```

## Configuração Inicial

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.production.example .env.production

# Editar variáveis
nano .env.production
```

**Variáveis obrigatórias:**
- `POSTGRES_PASSWORD`: Senha do banco de dados
- `JWT_SECRET`: Chave secreta para JWT
- `REDIS_PASSWORD`: Senha do Redis
- `GRAFANA_PASSWORD`: Senha do Grafana

### 2. Configurar DNS

Configurar os seguintes registros DNS para apontar para o servidor:

```
events.gwan.com.br        A    <IP_DO_SERVIDOR>
api-events.gwan.com.br    A    <IP_DO_SERVIDOR>
traefik.gwan.com.br       A    <IP_DO_SERVIDOR>
monitoring.gwan.com.br    A    <IP_DO_SERVIDOR>
grafana.gwan.com.br       A    <IP_DO_SERVIDOR>
```

### 3. Configurar Firewall

```bash
# Permitir portas necessárias
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Deploy

### 1. Preparar Ambiente

```bash
# Criar diretórios necessários
mkdir -p traefik/letsencrypt
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources
mkdir -p postgres

# Definir permissões
sudo chown -R 1000:1000 traefik/letsencrypt
```

### 2. Executar Deploy

```bash
# Subir todos os serviços
docker-compose -f docker-compose-production.yml up -d

# Verificar status
docker-compose -f docker-compose-production.yml ps

# Ver logs
docker-compose -f docker-compose-production.yml logs -f
```

### 3. Verificar Funcionamento

```bash
# Verificar saúde dos containers
docker-compose -f docker-compose-production.yml ps

# Testar endpoints
curl -I https://events.gwan.com.br
curl -I https://api-events.gwan.com.br/api/health
curl -I https://traefik.gwan.com.br
```

## Monitoramento

### 1. Acessar Dashboards

- **Traefik Dashboard**: https://traefik.gwan.com.br
- **Prometheus**: https://monitoring.gwan.com.br
- **Grafana**: https://grafana.gwan.com.br

### 2. Configurar Alertas

O Prometheus está configurado para coletar métricas de:
- Traefik (proxy reverso)
- Frontend (health checks)
- Backend (health checks)
- PostgreSQL
- Redis

### 3. Logs

```bash
# Ver logs de todos os serviços
docker-compose -f docker-compose-production.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose-production.yml logs -f frontend
docker-compose -f docker-compose-production.yml logs -f backend
```

## Manutenção

### 1. Atualizar Aplicação

```bash
# Parar serviços
docker-compose -f docker-compose-production.yml down

# Atualizar imagens
docker-compose -f docker-compose-production.yml pull

# Subir novamente
docker-compose -f docker-compose-production.yml up -d
```

### 2. Backup do Banco de Dados

```bash
# Criar backup
docker exec gwan-events-postgres pg_dump -U gwan_user gwan_events > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i gwan-events-postgres psql -U gwan_user gwan_events < backup.sql
```

### 3. Limpeza de Volumes

```bash
# Ver volumes
docker volume ls

# Remover volumes não utilizados
docker volume prune
```

## Troubleshooting

### 1. Problemas de SSL

```bash
# Verificar certificados
docker exec gwan-events-traefik ls -la /letsencrypt/

# Regenerar certificados
docker-compose -f docker-compose-production.yml restart traefik
```

### 2. Problemas de Conectividade

```bash
# Verificar rede
docker network ls
docker network inspect gwan-network

# Testar conectividade entre containers
docker exec gwan-events-frontend ping backend
```

### 3. Problemas de Performance

```bash
# Verificar recursos
docker stats

# Verificar logs de erro
docker-compose -f docker-compose-production.yml logs | grep ERROR
```

## Segurança

### 1. Configurações de Segurança

- Headers de segurança configurados no Nginx
- Rate limiting configurado
- CORS configurado corretamente
- Certificados SSL automáticos

### 2. Monitoramento de Segurança

- Logs de acesso do Traefik
- Métricas de Prometheus
- Alertas configurados no Grafana

## Escalabilidade

### 1. Horizontal Scaling

Para escalar horizontalmente:

```bash
# Escalar frontend
docker-compose -f docker-compose-production.yml up -d --scale frontend=3

# Escalar backend
docker-compose -f docker-compose-production.yml up -d --scale backend=3
```

### 2. Load Balancing

O Traefik já está configurado para fazer load balancing automaticamente entre múltiplas instâncias.

## Backup e Recuperação

### 1. Backup Completo

```bash
#!/bin/bash
# Script de backup completo

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$DATE"

mkdir -p $BACKUP_DIR

# Backup do banco
docker exec gwan-events-postgres pg_dump -U gwan_user gwan_events > $BACKUP_DIR/database.sql

# Backup dos volumes
docker run --rm -v gwan-events_postgres-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres-data.tar.gz -C /data .

# Backup das configurações
cp -r . $BACKUP_DIR/configs/

echo "Backup completo criado em $BACKUP_DIR"
```

### 2. Recuperação

```bash
# Restaurar banco
docker exec -i gwan-events-postgres psql -U gwan_user gwan_events < database.sql

# Restaurar volumes
docker run --rm -v gwan-events_postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-data.tar.gz -C /data
```

## Contatos

Para suporte técnico ou dúvidas sobre o deploy:

- **Email**: admin@gwan.com.br
- **Documentação**: [Link para documentação completa]
- **Issues**: [Link para repositório de issues]
