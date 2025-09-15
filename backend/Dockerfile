# ========================================
# BUILD STAGE
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm run build

# ========================================
# PRODUCTION STAGE
# ========================================
FROM node:18-alpine AS production

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar código buildado
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Mudar para usuário não-root
USER nestjs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/events', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
CMD ["node", "dist/main.js"]
