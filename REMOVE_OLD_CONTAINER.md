# Como resolver o erro de container conflitante

O erro indica que existe um container antigo com o nome "gwan-events-backend" que está em conflito.

## Opção 1: Remover o container antigo via Portainer

1. Acesse o Portainer
2. Vá em **Containers**
3. Procure pelo container `gwan-events-backend`
4. Pare e remova o container

## Opção 2: Remover via linha de comando (SSH no servidor)

```bash
# Parar o container
docker stop gwan-events-backend

# Remover o container
docker rm gwan-events-backend
```

## Opção 3: Remover via Portainer Stack

1. Acesse o Portainer
2. Vá em **Stacks**
3. Procure pela stack que contém o container `gwan-events-backend`
4. Remova a stack ou edite para remover o serviço conflitante

## Após remover o container antigo

1. Certifique-se de que o arquivo `docker-compose-production.yml` está correto
2. Faça o deploy novamente no Portainer

