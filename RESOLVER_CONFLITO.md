# 🔧 Como Resolver o Conflito de Container

O erro indica que existe um container antigo `gwan-events-backend` que está em conflito com o deploy.

## ⚠️ Importante

O container `gwan-events-backend` parece ser de outro projeto (Gwan Events). Você precisa removê-lo antes de fazer o deploy do MentorMatch.

## 🚀 Soluções

### Opção 1: Via Portainer (Recomendado)

1. Acesse o **Portainer**
2. Vá em **Containers** (menu lateral)
3. Procure pelo container `gwan-events-backend`
4. Clique nos **3 pontos** (⋮) ao lado do container
5. Selecione **Stop** (se estiver rodando)
6. Depois selecione **Remove**
7. Confirme a remoção
8. Tente fazer o deploy novamente

### Opção 2: Via SSH/Console do Servidor

#### Linux/Mac:
```bash
# Parar o container
docker stop gwan-events-backend

# Remover o container
docker rm gwan-events-backend
```

#### Windows PowerShell:
```powershell
# Parar o container
docker stop gwan-events-backend

# Remover o container
docker rm gwan-events-backend
```

### Opção 3: Usar o Script Automatizado

#### Linux/Mac:
```bash
chmod +x fix-container-conflict.sh
./fix-container-conflict.sh
```

#### Windows PowerShell:
```powershell
.\fix-container-conflict.ps1
```

### Opção 4: Remover Todos os Containers Gwan (Cuidado!)

⚠️ **ATENÇÃO**: Isso remove TODOS os containers que começam com "gwan". Use apenas se tiver certeza!

```bash
# Listar primeiro para ver o que será removido
docker ps -a | grep gwan

# Remover todos (cuidado!)
docker ps -a | grep gwan | awk '{print $1}' | xargs docker rm -f
```

## ✅ Após Remover o Container

1. Verifique que o container foi removido:
   ```bash
   docker ps -a | grep gwan-events-backend
   ```
   (Não deve retornar nada)

2. Faça o deploy novamente no Portainer usando o arquivo `docker-compose-production.yml`

3. O novo container será criado com o nome `gwan-mentor-match-frontend`

## 🔍 Verificar Containers Existentes

Para ver todos os containers relacionados ao Gwan:
```bash
docker ps -a | grep gwan
```

## 📝 Nota

O container `gwan-events-backend` é de outro projeto. Se você ainda precisa dele, você pode:
- Renomeá-lo antes de remover
- Ou usar um nome diferente no docker-compose do projeto Events

Mas para o MentorMatch, você só precisa remover o container antigo que está causando conflito.

