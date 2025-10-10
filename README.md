# 🚀 Gwan Events - Frontend

Frontend da plataforma de eventos e venda de ingressos, desenvolvido com React + TypeScript e Vite.

> **Backend**: [gwan-events-backend](https://github.com/rastamansp/gwan-events-backend)

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

### Frontend
- **React 18**: Biblioteca para interfaces de usuário
- **TypeScript**: Tipagem estática
- **Vite**: Build tool moderno e rápido
- **React Router**: Roteamento de páginas
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Cliente HTTP para comunicação com a API
- **Lucide React**: Ícones modernos e consistentes

> **Nota**: O backend está em um repositório separado: [gwan-events-backend](https://github.com/rastamansp/gwan-events-backend)

## 📁 Estrutura do Projeto

```
gwan-events/
├── src/
│   ├── components/    # Componentes reutilizáveis
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/         # Páginas da aplicação
│   │   ├── Home.tsx
│   │   ├── Events.tsx
│   │   ├── EventDetail.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MyTickets.tsx
│   │   └── AdminDashboard.tsx
│   ├── services/      # Serviços de API
│   │   └── api.ts
│   ├── contexts/      # Contextos React
│   │   └── AuthContext.tsx
│   ├── types/         # Definições TypeScript
│   │   └── index.ts
│   ├── App.tsx        # Componente principal
│   ├── main.tsx       # Arquivo de entrada
│   └── index.css      # Estilos globais
├── public/            # Arquivos estáticos
├── package.json       # Dependências e scripts
├── vite.config.ts     # Configuração do Vite
├── tailwind.config.js # Configuração do Tailwind
├── tsconfig.json      # Configuração do TypeScript
├── Dockerfile         # Configuração Docker
└── nginx.conf         # Configuração Nginx
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/rastamansp/gwan-events.git
cd gwan-events
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Execute o projeto em modo desenvolvimento**
```bash
npm run dev
```

O frontend será iniciado na porta 3000 (http://localhost:3000)

### Executando com Backend

Para uma experiência completa, você também precisa do backend:

1. **Clone o repositório do backend**
```bash
git clone https://github.com/rastamansp/gwan-events-backend.git
cd gwan-events-backend
npm install
npm run start:dev
```

2. **Configure a URL da API no frontend**
```env
VITE_API_URL=http://localhost:3001/api
```

### Executando apenas o Frontend

Se você quiser executar apenas o frontend (modo standalone):

```bash
npm run dev
```

O frontend funcionará em modo de desenvolvimento, mas as funcionalidades que dependem da API não estarão disponíveis.

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

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Gwan Events
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
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

### Docker
```bash
docker build -t gwan-events-frontend .
docker run -p 80:80 gwan-events-frontend
```

### Deploy com Docker Compose
```bash
docker-compose up -d
```

### Variáveis de Ambiente de Produção
- Configure URLs de produção
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
- Documentação: http://localhost:3001/api (quando backend estiver rodando)

---

**Gwan Events** - Conectando pessoas através de experiências únicas! 🎉