# 🚀 Gwan Shop - Instruções de Execução

## Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn instalado

## 🏃‍♂️ Execução Rápida

### 1. Instalar todas as dependências
```bash
npm run install:all
```

### 2. Executar em modo desenvolvimento
```bash
npm run dev
```

Isso irá iniciar:
- ✅ Backend na porta 3001 (http://localhost:3001)
- ✅ Frontend na porta 3000 (http://localhost:3000)
- ✅ Documentação da API em http://localhost:3001/api

## 🔧 Execução Separada

### Backend apenas
```bash
cd backend
npm install
npm run start:dev
```

### Frontend apenas
```bash
cd frontend
npm install
npm run dev
```

## 👤 Usuários de Teste

### Administrador
- **Email**: admin@gwanshop.com
- **Senha**: password

### Usuário Comum
- **Email**: joao@email.com
- **Senha**: password

## 🎫 Funcionalidades Disponíveis

### ✅ Implementadas
- [x] Sistema de autenticação completo
- [x] CRUD de eventos
- [x] Categorias de ingressos
- [x] Sistema de compra de ingressos
- [x] Geração de QR Code
- [x] Sistema de pagamentos mock
- [x] Dashboard do usuário
- [x] Painel administrativo
- [x] Design responsivo
- [x] Documentação da API

### 🎯 Principais Endpoints

#### Autenticação
- `POST /auth/login` - Fazer login
- `POST /auth/register` - Registrar usuário
- `GET /auth/profile` - Perfil do usuário

#### Eventos
- `GET /events` - Listar eventos
- `GET /events/:id` - Detalhes do evento
- `POST /events` - Criar evento (autenticado)
- `GET /events/:id/ticket-categories` - Categorias de ingressos

#### Ingressos
- `GET /tickets` - Listar ingressos
- `POST /tickets` - Criar ingresso
- `POST /tickets/:id/validate` - Validar ingresso
- `PUT /tickets/:id/use` - Marcar como usado

#### Pagamentos
- `GET /payments` - Listar pagamentos
- `POST /payments` - Criar pagamento
- `PUT /payments/:id/approve` - Aprovar pagamento

#### Admin
- `GET /admin/dashboard` - Estatísticas gerais
- `GET /admin/events/:id/analytics` - Analytics do evento

## 🎨 Interface

### Páginas Disponíveis
- **Home** (`/`) - Página inicial com eventos em destaque
- **Eventos** (`/events`) - Lista completa de eventos
- **Detalhes** (`/events/:id`) - Página do evento com compra
- **Login** (`/login`) - Página de login
- **Registro** (`/register`) - Página de cadastro
- **Dashboard** (`/dashboard`) - Área do usuário
- **Meus Ingressos** (`/my-tickets`) - Ingressos do usuário
- **Admin** (`/admin`) - Painel administrativo

## 🔍 Testando o Sistema

### 1. Acesse o frontend
Abra http://localhost:3000 no navegador

### 2. Faça login
Use as credenciais de teste fornecidas acima

### 3. Explore os eventos
Navegue pela página de eventos e veja os detalhes

### 4. Compre um ingresso
Selecione um evento, escolha a categoria e compre

### 5. Veja seus ingressos
Acesse "Meus Ingressos" para ver o QR Code

### 6. Teste o admin
Faça login como admin para ver o painel administrativo

## 🐛 Solução de Problemas

### Erro de CORS
Se houver problemas de CORS, verifique se o backend está rodando na porta 3001

### Erro de dependências
Execute `npm run install:all` para instalar todas as dependências

### Porta em uso
Se a porta estiver em uso, altere no arquivo de configuração

## 📱 Design Responsivo

O projeto foi desenvolvido com abordagem mobile-first:
- ✅ Responsivo para mobile
- ✅ Tablet otimizado
- ✅ Desktop completo
- ✅ Componentes adaptativos

## 🎯 Próximos Passos

Para expandir o projeto, considere:
- [ ] Integração com banco de dados real
- [ ] Sistema de email
- [ ] Gateway de pagamento real
- [ ] Upload de imagens
- [ ] Notificações push
- [ ] Chat em tempo real
- [ ] Sistema de avaliações
- [ ] Integração com redes sociais

---

**🎉 Projeto criado com sucesso! Divirta-se explorando a plataforma Gwan Shop!**
