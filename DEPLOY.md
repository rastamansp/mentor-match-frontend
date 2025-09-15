# 🚀 Deploy do Gwan Shop no Portainer

Este projeto está configurado para ser deployado no Portainer usando Docker Compose com Traefik.

## 📋 Pré-requisitos

- Portainer configurado e funcionando
- Traefik já configurado no servidor
- Rede Docker `gwan` existente
- Domínios configurados no DNS:
  - `events.gwan.com.br` → Frontend
  - `api-events.gwan.com.br` → Backend API

## 🔧 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `env.production.example` para `.env` e configure:

```bash
cp env.production.example .env
```

**IMPORTANTE**: Altere o `JWT_SECRET` para um valor seguro em produção!

### 2. Deploy no Portainer

1. **Acesse o Portainer**
2. **Vá para Stacks**
3. **Clique em "Add stack"**
4. **Cole o conteúdo do `docker-compose.yml`**
5. **Configure as variáveis de ambiente**
6. **Deploy a stack**

## 🌐 URLs de Acesso

Após o deploy, as aplicações estarão disponíveis em:

- **Frontend**: https://events.gwan.com.br
- **Backend API**: https://api-events.gwan.com.br/api
- **Documentação Swagger**: https://api-events.gwan.com.br/api

## 🔍 Monitoramento

### Health Checks

Ambos os serviços possuem health checks configurados:

- **Backend**: Verifica endpoint `/api/events`
- **Frontend**: Verifica endpoint `/health`

### Logs

Para visualizar os logs no Portainer:

1. Vá para **Containers**
2. Selecione o container desejado
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
docker ps --filter "name=gwan-shop"
```

### Acessar Logs via Terminal

```bash
# Backend
docker logs gwan-shop-backend -f

# Frontend
docker logs gwan-shop-frontend -f
```

## 🔐 Segurança

### Configurações Aplicadas

- **Headers de Segurança**: X-Frame-Options, X-XSS-Protection, etc.
- **HTTPS**: Certificados SSL automáticos via Let's Encrypt
- **Usuários não-root**: Containers rodam com usuários específicos
- **Health Checks**: Monitoramento automático dos serviços

### Recomendações Adicionais

1. **Altere o JWT_SECRET** para um valor único e seguro
2. **Configure backup** dos dados (quando implementar banco)
3. **Monitore logs** regularmente
4. **Atualize dependências** periodicamente

## 🐛 Troubleshooting

### Problemas Comuns

1. **Container não inicia**:
   - Verifique logs: `docker logs gwan-shop-backend`
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

### Comandos de Debug

```bash
# Verificar rede
docker network ls | grep gwan

# Verificar containers
docker ps -a | grep gwan-shop

# Verificar logs do Traefik
docker logs traefik -f

# Limpar cache do Docker (CUIDADO: remove todas as imagens não utilizadas)
docker system prune -a
```

## 📞 Suporte

Para suporte e dúvidas:
- Verifique os logs primeiro
- Consulte a documentação da API em `/api`
- Teste os health checks

---

**🎉 Deploy realizado com sucesso!**
