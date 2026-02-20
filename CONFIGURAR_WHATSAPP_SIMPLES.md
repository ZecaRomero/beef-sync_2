# 📱 Configuração Rápida do WhatsApp - Opções Disponíveis

## ⚠️ IMPORTANTE: Escolha uma das opções abaixo

---

## 🚀 OPÇÃO 1: Evolution API (Recomendado - Requer Docker)

### Pré-requisito: Instalar Docker Desktop
1. Baixe: https://www.docker.com/products/docker-desktop
2. Instale e reinicie o computador
3. Inicie o Docker Desktop

### Depois de instalar o Docker:

1. **Inicie o Evolution API:**
   ```bash
   docker run --name evolution-api -d -p 8080:8080 atendai/evolution-api:latest
   ```

2. **Acesse:** http://localhost:8080

3. **Crie uma instância** e escaneie o QR Code com seu WhatsApp

4. **Copie a API Key** gerada

5. **Cole no arquivo `.env`:**
   ```env
   EVOLUTION_API_URL=http://localhost:8080
   EVOLUTION_API_KEY=cole_aqui_a_chave_copiada
   EVOLUTION_INSTANCE_NAME=default
   ```

6. **Reinicie o servidor** (`npm run dev`)

---

## 💼 OPÇÃO 2: Twilio (Não Requer Docker - Requer Conta)

### Vantagens:
- ✅ Não precisa instalar nada localmente
- ✅ Serviço profissional
- ⚠️ Requer criar conta (tem trial gratuito de $15)

### Passos:

1. **Criar conta Twilio:**
   - Acesse: https://www.twilio.com
   - Crie conta gratuita (trial)

2. **Ativar WhatsApp:**
   - No painel Twilio: **Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Siga o tutorial

3. **Obter credenciais:**
   - **Account SID**: Começa com `AC...`
   - **Auth Token**: Token de autenticação
   - **WhatsApp Number**: `whatsapp:+14155238886` (número de teste)

4. **Configurar no `.env`:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=seu_auth_token_aqui
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

5. **Instalar dependência:**
   ```bash
   npm install twilio
   ```

6. **Reinicie o servidor**

---

## 🔧 OPÇÃO 3: Usar Manualmente (Sem Configuração)

Se você não quiser configurar nenhuma API agora:

1. O sistema continuará funcionando normalmente
2. Quando você enviar relatórios, aparecerá um **modal** com o resumo e gráfico
3. Você pode **copiar o texto** e enviar manualmente pelo WhatsApp instalado
4. O gráfico aparecerá no modal para você visualizar

---

## ✅ Qual Opção Escolher?

- **Quer automatizar completamente?** → Use **Opção 1** (Evolution API) ou **Opção 2** (Twilio)
- **Quer testar primeiro?** → Use **Opção 3** (Manual) por enquanto
- **Não quer instalar Docker?** → Use **Opção 2** (Twilio)

---

## 📝 Status Atual do seu `.env`

O arquivo `.env` já está preparado para a **Opção 1 (Evolution API)**.

**Você precisa:**
1. Instalar Docker Desktop
2. Iniciar o Evolution API
3. Obter a API Key
4. Colar a API Key no lugar de `cole_aqui_sua_chave_api`

---

## 🆘 Precisa de Ajuda?

Se tiver dúvidas sobre qual opção escolher ou como configurar, me avise!
