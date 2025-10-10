# 🚀 Deploy do Gwan Events Frontend

Este projeto contém apenas o frontend da aplicação Gwan Events, configurado para deploy com Docker.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Portainer configurado (opcional)
- Traefik configurado (para produção)
- Domínio configurado no DNS:
  - `events.gwan.com.br` → Frontend

## 🔗 Repositórios

- **Frontend**: [gwan-events](https://github.com/rastamansp/gwan-events) (este repositório)
- **Backend**: [gwan-events-backend](https://github.com/rastamansp/gwan-events-backend)

## 🔧 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Configure as variáveis:
```env
VITE_API_URL=https://api-events.gwan.com.br/api
VITE_APP_NAME=Gwan Events
VITE_APP_VERSION=1.0.0
```

### 2. Deploy Local

```bash
docker-compose up -d
```

### 3. Deploy no Portainer

1. **Acesse o Portainer**
2. **Vá para Stacks**
3. **Clique em "Add stack"**
4. **Cole o conteúdo do `docker-compose.yml`**
5. **Configure as variáveis de ambiente**
6. **Deploy a stack**

## 🌐 URLs de Acesso

Após o deploy, o frontend estará disponível em:

- **Frontend**: https://events.gwan.com.br
- **Local**: http://localhost:80

> **Nota**: O backend deve ser deployado separadamente no repositório [gwan-events-backend](https://github.com/rastamansp/gwan-events-backend)

## 🔍 Monitoramento

### Health Checks

O frontend possui health check configurado:

- **Frontend**: Verifica endpoint `/health`

### Logs

Para visualizar os logs no Portainer:

1. Vá para **Containers**
2. Selecione o container `gwan-events-frontend`
3. Clique em **Logs**

## 🛠️ Comandos Úteis

### Rebuild dos Containers

```bash
# No Portainer, vá para a stack e clique em "Editor"
# Faça as alterações necessárias e clique em "Update the stack"
```

### Verificar Status dos Serviços

```bash
# No servidor, execute:
docker ps --filter "name=gwan-events"
```

### Acessar Logs via Terminal

```bash
# Frontend
docker logs gwan-events-frontend -f
```

## 🔐 Segurança

### Configurações Aplicadas

- **Headers de Segurança**: X-Frame-Options, X-XSS-Protection, etc.
- **HTTPS**: Certificados SSL automáticos via Let's Encrypt
- **Usuários não-root**: Containers rodam com usuários específicos
- **Health Checks**: Monitoramento automático dos serviços

### Recomendações Adicionais

1. **Configure backup** dos dados (quando implementar banco)
2. **Monitore logs** regularmente
3. **Atualize dependências** periodicamente
4. **Configure CDN** para assets estáticos
5. **Configure SSL** adequadamente

## 🐛 Troubleshooting

### Problemas Comuns

1. **Container não inicia**:
   - Verifique logs: `docker logs gwan-events-frontend`
   - Verifique variáveis de ambiente

2. **Erro 502 Bad Gateway**:
   - Verifique se o Traefik está funcionando
   - Verifique se a rede `gwan` existe

3. **Certificado SSL não funciona**:
   - Verifique configuração do DNS
   - Verifique logs do Traefik

4. **Erro de build Docker**:
   - **Limpe o cache do Docker** no Portainer:
     - Vá para **Images**
     - Remova imagens antigas do projeto
     - Ou execute no servidor: `docker system prune -a`
   - **Force rebuild** da stack no Portainer

5. **Frontend não carrega**:
   - Verifique se o backend está rodando
   - Verifique a variável `VITE_API_URL`
   - Verifique logs do container

### Comandos de Debug

```bash
# Verificar rede
docker network ls | grep gwan

# Verificar containers
docker ps -a | grep gwan-events

# Verificar logs do Traefik
docker logs traefik -f

# Limpar cache do Docker (CUIDADO: remove todas as imagens não utilizadas)
docker system prune -a
```

## 📞 Suporte

Para suporte e dúvidas:
- Verifique os logs primeiro
- Consulte a documentação da API em `/api` (quando backend estiver rodando)
- Teste os health checks
- Verifique se o backend está rodando

---

**🎉 Deploy realizado com sucesso!**
