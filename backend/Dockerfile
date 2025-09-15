# Dockerfile Ultra Simples
FROM node:18-alpine

WORKDIR /app

# Copiar tudo de uma vez
COPY . .

# Instalar dependências e fazer build
RUN npm install && npm run build

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Mudar propriedade dos arquivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/events', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
CMD ["node", "dist/main.js"]
