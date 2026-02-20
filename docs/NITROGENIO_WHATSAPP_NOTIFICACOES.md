# Notificações Automáticas de Nitrogênio via WhatsApp

## 📋 Visão Geral

Sistema de notificações automáticas que envia mensagens via WhatsApp quando faltam **2 dias** para o próximo abastecimento de nitrogênio.

## 🚀 Funcionalidades

- ✅ Cadastro de contatos WhatsApp para receber notificações
- ✅ Envio automático de notificações quando faltam 2 dias
- ✅ Interface amigável para gerenciar contatos
- ✅ Integração com serviço de WhatsApp existente (Twilio ou Evolution API)

## 📱 Como Usar

### 1. Cadastrar Contatos WhatsApp

1. Acesse a página **Nitrogênio** (`/nitrogenio`)
2. Clique no botão **"Contatos WhatsApp"** (verde)
3. Preencha:
   - **Nome**: Nome do contato
   - **WhatsApp**: Número com DDD (apenas números, ex: 11987654321)
4. Clique em **"Adicionar Contato"**

### 2. Como Funciona

- O sistema verifica diariamente os abastecimentos que precisam de notificação
- Quando faltam **exatamente 2 dias** para o próximo abastecimento, uma notificação é enviada automaticamente
- Todos os contatos cadastrados recebem a mensagem
- A notificação só é enviada uma vez por abastecimento

### 3. Mensagem Enviada

A mensagem inclui:
- ⚠️ Alerta de que faltam 2 dias
- 📅 Data do último abastecimento
- 📊 Quantidade do último abastecimento
- 👤 Motorista responsável
- 📅 Data do próximo abastecimento

## ⚙️ Configuração Técnica

### Estrutura do Banco de Dados

#### Tabela: `nitrogenio_whatsapp_contatos`
```sql
CREATE TABLE nitrogenio_whatsapp_contatos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Coluna Adicionada: `notificacao_enviada_2dias`
Na tabela `abastecimento_nitrogenio`:
```sql
ALTER TABLE abastecimento_nitrogenio 
ADD COLUMN notificacao_enviada_2dias BOOLEAN DEFAULT false;
```

### APIs Criadas

#### 1. Gerenciar Contatos WhatsApp
- **GET** `/api/nitrogenio/whatsapp-contatos` - Listar contatos
- **POST** `/api/nitrogenio/whatsapp-contatos` - Adicionar contato
- **DELETE** `/api/nitrogenio/whatsapp-contatos?id={id}` - Remover contato

#### 2. Enviar Notificações
- **POST** `/api/nitrogenio/enviar-notificacoes` - Enviar notificações automaticamente

### Configuração do Cron Job

Para executar automaticamente, configure um cron job que execute diariamente:

#### Linux/Mac (crontab)
```bash
# Executar todos os dias às 8h da manhã
0 8 * * * cd /caminho/do/projeto && node scripts/cron-nitrogenio-notificacoes.js
```

#### Windows (Task Scheduler)
1. Abra o Agendador de Tarefas
2. Crie uma nova tarefa básica
3. Configure para executar diariamente
4. Ação: Iniciar um programa
5. Programa: `node`
6. Argumentos: `scripts/cron-nitrogenio-notificacoes.js`
7. Iniciar em: `C:\caminho\do\projeto`

#### Usando PM2 (Recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nitrogenio-notificacoes',
    script: 'scripts/cron-nitrogenio-notificacoes.js',
    cron_restart: '0 8 * * *', // Todos os dias às 8h
    autorestart: false,
    watch: false
  }]
}

# Iniciar
pm2 start ecosystem.config.js
pm2 save
```

### Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no `.env`:

```env
# Para Twilio
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# OU para Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_INSTANCE_NAME=default

# URL base da API (para o cron job)
API_BASE_URL=http://localhost:3020
```

## 🔧 Manutenção

### Executar Manualmente

Para testar ou executar manualmente:

```bash
node scripts/cron-nitrogenio-notificacoes.js
```

### Verificar Logs

Os logs são exibidos no console:
- ✅ Sucesso: Mensagens enviadas com sucesso
- ❌ Erro: Erros ao enviar mensagens
- ⚠️ Aviso: Nenhuma notificação necessária

### Resetar Notificação

Se precisar reenviar uma notificação:

```sql
UPDATE abastecimento_nitrogenio 
SET notificacao_enviada_2dias = false 
WHERE id = {id_do_abastecimento};
```

## 📝 Notas Importantes

1. **Horário de Execução**: Configure o cron para executar uma vez por dia, preferencialmente pela manhã
2. **Duplicação**: O sistema evita envio duplicado marcando `notificacao_enviada_2dias = true`
3. **Contatos Ativos**: Apenas contatos com `ativo = true` recebem notificações
4. **Formato WhatsApp**: Os números são armazenados apenas com dígitos (sem formatação)

## 🐛 Troubleshooting

### Notificações não estão sendo enviadas

1. Verifique se o cron job está configurado corretamente
2. Verifique as variáveis de ambiente (Twilio ou Evolution API)
3. Execute manualmente para ver erros: `node scripts/cron-nitrogenio-notificacoes.js`
4. Verifique os logs do servidor

### Erro ao cadastrar contato

- Verifique se o número já está cadastrado (deve ser único)
- Certifique-se de que o número tem pelo menos 10 dígitos
- Verifique a conexão com o banco de dados

### WhatsApp não está configurado

- Configure Twilio OU Evolution API no `.env`
- Certifique-se de que as credenciais estão corretas
- Teste o envio manualmente usando a API de notificações

