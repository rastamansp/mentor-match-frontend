# MentorMatch – Roteiro de Demo (Jornadas do Produto)

Este documento organiza as jornadas do produto MentorMatch para uso em **demos** e apresentações. O fluxo principal da demo cobre: **cadastro → confirmação → intenção de agendar → oferta de horários → escolha do cliente → confirmação**.

---

## Visão Geral do Fluxo da Demo

| Etapa | Jornada | Ação do Cliente | Resposta da Plataforma |
|-------|---------|-----------------|------------------------|
| **1** | 0 - Confirmação de Cadastro | Cadastra no site | Série de mensagens de confirmação e funcionamento |
| **2** | 3 - Agendamento | Manda "quero agendar uma sessao" | Retorna agendamentos (dias e horários disponíveis) |
| **3** | 3 - Agendamento | Escolhe dia e horário (ex.: "Quarta 28/01 09:00–10:00") | Confirma sessão + dados + link Zoom |

---

## 1. Cliente cadastrado pelo site e mensagens de confirmação

**O que ocorre na demo**

- O usuário se cadastra pelo **frontend** (site MentorMatch).
- O produto envia uma **série de mensagens** (ex.: WhatsApp) de confirmação de cadastro e explicação do funcionamento da plataforma.

**Jornada:** `0 - Confirmação de Cadastro`

**Mensagens exibidas (em ordem)**

| # | Remetente | Conteúdo |
|---|-----------|----------|
| 1 | Concierge | Olá! 👋 Seja muito bem-vindo ao MentorMatch! |
| 2 | Concierge | Você acaba de ser cadastrado na nossa plataforma e estamos muito felizes em tê-lo conosco. |
| 3 | Concierge | O MentorMatch é uma plataforma que conecta profissionais em busca de mentoria com mentores experientes de diversas áreas. |
| 4 | Concierge | Como posso ajudá-lo hoje? Você pode: 1) Buscar mentores 2) Agendar sessão 3) Explorar áreas 4) Recomendações |
| 5 | Concierge | Estou aqui para ajudar você em cada etapa da sua jornada de desenvolvimento profissional. 😊 Pode me fazer qualquer pergunta! |

**Ponto para a demo:** *"O cliente cadastra no site e recebe essa sequência automática de boas-vindas e explicação da plataforma."*

---

## 2. Cliente manifesta intenção de agendar → plataforma retorna agendamentos

**O que ocorre na demo**

- O cliente manda mensagem expressando que quer **agendar uma mentoria**.
- A **plataforma retorna** os **agendamentos/horários disponíveis** (por mentor e data).

**Jornada:** `3 - Agendamento`

**Mensagens exibidas (em ordem)**

| # | Remetente | Conteúdo |
|---|-----------|----------|
| 1 | Concierge | Como posso ajudar você hoje? Se precisar de informações sobre suas sessões, mentores ou agendar uma nova sessão, estou à disposição! |
| 2 | **User** | quero agendar uma sessao |
| 3 | Concierge | Perfeito 😊 Aqui estão os horários disponíveis para agendar uma sessão com **Naiara Bertholim**: lista de dias (ex.: 22, 26, 27, 28 de janeiro de 2026) e, para cada dia, faixas de horário. "Quando preferir, é só me dizer o dia e horário 😊" |

**Ponto para a demo:** *"O cliente declara a intenção de agendar; o chatbot devolve os agendamentos disponíveis, organizados por data e horário."*

---

## 3. Cliente escolhe uma alternativa (dia/horário)

**O que ocorre na demo**

- O cliente **escolhe** uma das alternativas (dia + horário) e envia na conversa.
- A plataforma **confirma o agendamento** e envia dados da sessão + link da reunião (Zoom).

**Jornada:** `3 - Agendamento` (continuação)

**Mensagens exibidas (em ordem)**

| # | Remetente | Conteúdo |
|---|-----------|----------|
| 4 | **User** | Quarta–feira – 28 de janeiro de 2026 — 09:00h às 10:00h |
| 5 | Concierge | ✅ Agendamento confirmado! Sua sessão foi criada com sucesso: Mentor, Data, Horário, Duração, ID da Sessão, **Link do Zoom** (clicável). "Você pode usar este link para acessar a reunião no horário agendado. Se precisar de mais alguma coisa, é só avisar! 😊" |

**Ponto para a demo:** *"O cliente escolhe uma alternativa de dia e horário; o sistema confirma e já devolve o link da reunião."*

---

## Onde testar na interface

- **Página:** [Teste Chatbot](/testar-chatbot) (`/testar-chatbot`)
- **Botão:** "Ver Jornadas de Conversação"
- **Confirmação de cadastro:** selecione a jornada **"0 - Confirmação de Cadastro"**
- **Intenção → oferta → escolha → confirmação:** selecione a jornada **"3 - Agendamento"** e deixe as mensagens rodarem até o fim (incluindo a mensagem do cliente com dia/horário e a confirmação com link)

---

## Jornadas adicionais (contexto completo do produto)

Para contexto na demo, o produto cobre também:

| Jornada | Descrição |
|---------|-----------|
| **1 - Descoberta** | Primeiro contato, nome, objetivos (ex.: crescimento profissional) |
| **2 - Recomendação de Plano** | Apresentação do plano e mentor recomendados |
| **4 - Pós-Sessão** | Feedback após a primeira sessão de mentoria |
| **5 - Resumo IA** | Entrega do resumo, tarefas e metas geradas pela IA |
| **6 - Continuidade** | Agradecimento e agendamento da próxima sessão |

O **núcleo da demo** (cadastro → confirmação → intenção de agendar → oferta → escolha) está nas jornadas **0** e **3**, conforme descrito acima.

---

## Dados técnicos

- As jornadas são definidas em `src/shared/data/journeys.json`.
- A página de teste usa o hook `useInteractions` e o componente `InteractionsSelector` para listar e reproduzir as conversas no mock de celular (`PhoneMockup` + `ChatInterface`).
