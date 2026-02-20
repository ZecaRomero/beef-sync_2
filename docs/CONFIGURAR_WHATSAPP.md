# 📱 Como Configurar WhatsApp para Notificações Automáticas

## Opções Disponíveis

O sistema suporta duas opções para envio de WhatsApp:

### 1. **Evolution API** (Recomendado para desenvolvimento/testes)
- ✅ Gratuito
- ✅ Usa seu próprio WhatsApp
- ✅ Fácil de configurar
- ⚠️ Requer servidor local rodando

### 2. **Twilio** (Recomendado para produção)
- ✅ Serviço profissional
- ✅ Confiável e escalável
- ⚠️ Requer conta paga (mas tem trial gratuito)

---

## 🚀 Opção 1: Evolution API (Mais Fácil)

### Passo 1: Instalar Evolution API

```bash
# Via Docker (Recomendado)
docker run --name evolution-api -d -p 8080:8080 atendai/evolution-api:latest

# Ou via NPM
npm install -g @evolution-api/api
```

### Passo 2: Configurar no .env

Adicione estas linhas no seu arquivo `.env`:

```env
# Evolution API Configuration
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_aqui
EVOLUTION_INSTANCE_NAME=default
```

### Passo 3: Obter a API Key

1. Acesse `http://localhost:8080` no navegador
2. Crie uma instância
3. Escaneie o QR Code com seu WhatsApp
4. Copie a API Key gerada
5. Cole no `.env` como `EVOLUTION_API_KEY`

### Passo 4: Testar

```bash
node scripts/test-notificacao-simulado.js
```

---

## 💼 Opção 2: Twilio (Produção)

### Passo 1: Criar Conta Twilio

1. Acesse https://www.twilio.com
2. Crie uma conta gratuita (trial de $15)
3. Vá em **Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
4. Siga o tutorial para ativar WhatsApp

### Passo 2: Obter Credenciais

No painel do Twilio, você encontrará:
- **Account SID**: Começa com `AC...`
- **Auth Token**: Token de autenticação
- **WhatsApp Number**: `whatsapp:+14155238886` (número de teste)

### Passo 3: Configurar no .env

Adicione estas linhas no seu arquivo `.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Passo 4: Instalar Dependência (se necessário)

```bash
npm install twilio
```

### Passo 5: Testar

```bash
node scripts/test-notificacao-simulado.js
```

---

## 🔧 Configuração Rápida (Escolha uma opção)

### Para usar Evolution API (Recomendado para começar):

1. **Instale Docker** (se não tiver): https://www.docker.com/products/docker-desktop

2. **Inicie o Evolution API**:
```bash
docker run --name evolution-api -d -p 8080:8080 atendai/evolution-api:latest
```

3. **Acesse** http://localhost:8080 e configure sua instância

4. **Adicione no .env**:
```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=cole_aqui_a_chave_gerada
EVOLUTION_INSTANCE_NAME=default
```

5. **Reinicie o servidor**:
```bash
npm run dev
```

6. **Teste**:
```bash
node scripts/test-notificacao-simulado.js
```

---

## ✅ Verificar Configuração

Execute este comando para verificar se está tudo configurado:

```bash
node scripts/test-notificacao-simulado.js
```

Se aparecer "✅ Enviado com sucesso!", está funcionando!

---

## 🐛 Problemas Comuns

### Erro: "Nenhum serviço de WhatsApp configurado"
- Verifique se adicionou as variáveis no `.env`
- Reinicie o servidor após modificar o `.env`

### Erro: "Evolution API não configurada"
- Verifique se o Evolution API está rodando: `docker ps`
- Verifique se a URL está correta: `http://localhost:8080`

### Erro: "Twilio não configurado"
- Verifique se as credenciais estão corretas
- Verifique se instalou: `npm install twilio`

### Mensagem não chega
- Verifique se o número está no formato correto (apenas dígitos, com DDD)
- Para Twilio trial: só funciona com números verificados
- Para Evolution API: verifique se escaneou o QR Code

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs do servidor
2. Logs do Evolution API (se usando)
3. Console do Twilio (se usando)

