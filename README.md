# Gwan Shop - Plataforma de Eventos

Uma plataforma completa para criação, gestão e venda de ingressos para eventos, desenvolvida com React no frontend e NestJS no backend.

## 🚀 Funcionalidades

### Para Participantes
- **Exploração de Eventos**: Navegue por eventos por categoria, cidade e data
- **Compra de Ingressos**: Sistema completo de compra com diferentes categorias de ingressos
- **Pagamentos**: Suporte a PIX, cartão de crédito e outras formas de pagamento
- **Ingressos Digitais**: QR Code único para cada ingresso
- **Área do Cliente**: Dashboard pessoal com histórico de compras e ingressos
- **Transferência de Ingressos**: Possibilidade de transferir ingressos para outros usuários

### Para Organizadores
- **Gestão de Eventos**: Criação e edição de eventos com informações detalhadas
- **Categorias de Ingressos**: Diferentes tipos de ingressos (pista, VIP, estudante, etc.)
- **Relatórios**: Analytics detalhados sobre vendas e participação
- **Painel Administrativo**: Interface completa para gerenciamento

### Para Administradores
- **Dashboard Completo**: Visão geral de toda a plataforma
- **Estatísticas**: Métricas de usuários, eventos, ingressos e pagamentos
- **Gestão de Usuários**: Controle completo sobre usuários e organizadores
- **Analytics Avançados**: Relatórios detalhados e insights

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS**: Framework Node.js para APIs escaláveis
- **TypeScript**: Tipagem estática para maior segurança
- **JWT**: Autenticação baseada em tokens
- **Swagger**: Documentação automática da API
- **bcryptjs**: Criptografia de senhas
- **QRCode**: Geração de códigos QR para ingressos

### Frontend
- **React 18**: Biblioteca para interfaces de usuário
- **TypeScript**: Tipagem estática
- **Vite**: Build tool moderno e rápido
- **React Router**: Roteamento de páginas
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Cliente HTTP para comunicação com a API
- **Lucide React**: Ícones modernos e consistentes

## 📁 Estrutura do Projeto

```
gwan-shop/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticação
│   │   ├── events/         # Módulo de eventos
│   │   ├── tickets/        # Módulo de ingressos
│   │   ├── payments/       # Módulo de pagamentos
│   │   ├── users/          # Módulo de usuários
│   │   ├── admin/          # Módulo administrativo
│   │   └── main.ts         # Arquivo principal
│   └── package.json
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços de API
│   │   ├── contexts/      # Contextos React
│   │   ├── types/         # Definições TypeScript
│   │   └── hooks/         # Hooks customizados
│   └── package.json
└── package.json           # Configuração do workspace
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd gwan-shop
```

2. **Instale as dependências**
```bash
npm run install:all
```

3. **Execute o projeto em modo desenvolvimento**
```bash
npm run dev
```

Isso irá iniciar:
- Backend na porta 3001 (http://localhost:3001)
- Frontend na porta 3000 (http://localhost:3000)
- Documentação da API em http://localhost:3001/api

### Executando Separadamente

**Backend:**
```bash
cd backend
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📚 Documentação da API

A documentação completa da API está disponível em `/api` quando o backend estiver rodando. Ela inclui:

- Endpoints de autenticação
- CRUD de eventos
- Gestão de ingressos
- Sistema de pagamentos
- Funcionalidades administrativas

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação. Os usuários podem:

- **Registrar-se** com nome, email e senha
- **Fazer login** com email e senha
- **Acessar áreas protegidas** com token válido
- **Diferentes níveis de acesso**: USER, ORGANIZER, ADMIN

## 🎫 Sistema de Ingressos

### Funcionalidades
- **QR Code único** para cada ingresso
- **Validação em tempo real** na entrada do evento
- **Transferência de ingressos** entre usuários
- **Histórico completo** de compras e uso
- **Status tracking**: Ativo, Usado, Cancelado, Transferido

### Categorias de Ingressos
- Diferentes tipos (Pista, VIP, Estudante, etc.)
- Preços personalizados
- Benefícios específicos por categoria
- Controle de lotes e disponibilidade

## 💳 Sistema de Pagamentos

### Métodos Suportados
- **PIX**: Pagamento instantâneo com QR Code
- **Cartão de Crédito**: Com opção de parcelamento
- **Cartão de Débito**: Pagamento à vista
- **Carteiras Digitais**: Integração com sistemas de pagamento

### Status de Pagamento
- **PENDING**: Aguardando aprovação
- **APPROVED**: Pagamento aprovado
- **REJECTED**: Pagamento rejeitado
- **REFUNDED**: Pagamento reembolsado

## 📊 Analytics e Relatórios

### Dashboard Administrativo
- **Métricas de usuários**: Total, organizadores, clientes
- **Estatísticas de eventos**: Ativos, esgotados, cancelados
- **Análise de ingressos**: Vendidos, usados, cancelados
- **Receita**: Total, mensal, crescimento

### Relatórios por Evento
- Vendas por categoria de ingresso
- Taxa de comparecimento
- Receita por método de pagamento
- Análise temporal de vendas

## 🎨 Design e UX

### Características
- **Design Responsivo**: Mobile-first approach
- **Interface Moderna**: Inspirada em plataformas de streaming
- **Experiência Intuitiva**: Navegação simples e clara
- **Acessibilidade**: Componentes acessíveis e inclusivos

### Componentes Principais
- **Layout Responsivo**: Header, conteúdo principal, footer
- **Cards de Eventos**: Apresentação visual atrativa
- **Formulários**: Validação em tempo real
- **Modais e Notificações**: Feedback visual para ações

## 🔧 Configuração e Personalização

### Variáveis de Ambiente

**Backend (.env):**
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001/api
```

### Customização
- **Temas**: Cores e estilos personalizáveis via Tailwind
- **Configurações**: Parâmetros ajustáveis para diferentes ambientes
- **Integrações**: APIs externas facilmente integradas

## 🧪 Dados Mock

O projeto inclui dados simulados para demonstração:

- **Usuários**: Admin, organizadores e clientes de exemplo
- **Eventos**: Festival de música, workshop de programação
- **Ingressos**: Diferentes categorias e status
- **Pagamentos**: Transações simuladas com diferentes métodos

## 🚀 Deploy e Produção

### Build para Produção
```bash
npm run build
```

### Variáveis de Ambiente de Produção
- Configure URLs de produção
- Configure secrets seguros
- Configure CORS adequadamente
- Configure logs e monitoramento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Email: contato@gwanshop.com
- Documentação: http://localhost:3001/api (quando rodando)

---

**Gwan Shop** - Conectando pessoas através de experiências únicas! 🎉
