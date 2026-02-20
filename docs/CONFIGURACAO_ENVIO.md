# Configuração de Envio de Relatórios

Este documento explica como configurar o envio de relatórios por Email e WhatsApp.

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Configurações Básicas

```env
NEXTAUTH_URL=http://localhost:3020
PORT=3020
```

### Configuração de Email (SMTP)

Para habilitar o envio de email, configure as seguintes variáveis:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@beefsync.com
```

#### Provedores de Email Comuns

**Gmail:**
- Host: `smtp.gmail.com`
- Porta: `587`
- Secure: `false`
- **Importante:** Você precisa criar uma "Senha de App" em: https://myaccount.google.com/apppasswords

**Outlook/Hotmail:**
- Host: `smtp-mail.outlook.com`
- Porta: `587`
- Secure: `false`

**SendGrid:**
- Host: `smtp.sendgrid.net`
- Porta: `587`
- Secure: `false`
- User: `apikey`
- Pass: sua chave API do SendGrid

**AWS SES:**
- Host: `email-smtp.us-east-1.amazonaws.com` (ajuste a região)
- Porta: `587`
- Secure: `false`

### Configuração de WhatsApp

Escolha **UMA** das opções abaixo:

#### Opção 1: Twilio WhatsApp Business API

```env
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Notas:**
- Requer conta paga no Twilio
- Arquivos grandes precisam ser hospedados em URL pública
- Obtenha credenciais em: https://www.twilio.com/docs/whatsapp

#### Opção 2: Evolution API (Recomendado)

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-api
EVOLUTION_INSTANCE_NAME=default
```

**Notas:**
- Permite envio de arquivos diretamente
- Requer instalação local do servidor Evolution API
- Mais adequado para uso interno/privado
- Documentação: https://github.com/EvolutionAPI/evolution-api

## Como Funciona

1. **Geração de Relatórios:** O sistema gera automaticamente 3 relatórios em Excel:
   - Boletim de Gado
   - Notas Fiscais (Entradas e Saídas)
   - Movimentações do Mês

2. **Envio por Email:**
   - Os 3 arquivos são anexados ao email
   - Email formatado em HTML com informações do período

3. **Envio por WhatsApp:**
   - Mensagem de texto com resumo dos relatórios
   - Arquivos enviados como documentos (se Evolution API configurada)
   - Twilio envia apenas mensagem de texto (arquivos requerem URL pública)

## Testando a Configuração

Após configurar as variáveis de ambiente:

1. Reinicie o servidor Next.js
2. Acesse a página de Contabilidade
3. Selecione um período
4. Adicione destinatários com email e/ou WhatsApp
5. Clique em "Enviar Relatórios"

## Solução de Problemas

### Email não está sendo enviado
- Verifique se as variáveis SMTP estão configuradas
- Para Gmail, certifique-se de usar uma "Senha de App"
- Verifique os logs do servidor para mensagens de erro

### WhatsApp não está funcionando
- Verifique se pelo menos uma API (Twilio ou Evolution) está configurada
- Para Evolution API, certifique-se de que o servidor está rodando
- Verifique os logs do servidor para mensagens de erro

### Arquivos não estão sendo enviados via WhatsApp
- Twilio requer URL pública para arquivos (não suportado atualmente)
- Use Evolution API para envio de arquivos via WhatsApp

