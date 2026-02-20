# ✅ Evolution API Configurado com Sucesso!

## 🎉 Status Atual
- ✅ Docker Desktop rodando
- ✅ Evolution API rodando na porta 8080
- ✅ PostgreSQL configurado
- ✅ Redis configurado
- ✅ API Key configurada no `.env`

---

## 📋 Próximos Passos

### 1️⃣ Acessar Interface Web
Abra seu navegador e acesse:
```
http://localhost:8080
```

### 2️⃣ Criar Instância
1. Na interface web do Evolution API, clique em **"Criar Instância"** ou **"Create Instance"**
2. Escolha um nome (ex: "beef-sync" ou "default")
3. Clique em **"Criar"**

### 3️⃣ Conectar seu WhatsApp
1. Após criar a instância, aparecerá um **QR Code** na tela
2. Abra o **WhatsApp** no seu celular
3. Vá em **Configurações** → **Aparelhos conectados** → **Conectar um aparelho**
4. Escaneie o QR Code que aparece na tela
5. Aguarde a conexão ser estabelecida (pode levar alguns segundos)

### 4️⃣ Obter API Key da Instância
1. Após conectar o WhatsApp, você verá informações da instância
2. Procure por **"API Key"** ou **"Chave API"** ou **"Instance Key"**
3. **Copie essa chave** (será diferente da que está no `.env` agora)
4. ⚠️ **IMPORTANTE:** Esta é a chave específica da sua instância, não a chave de autenticação geral

### 5️⃣ Atualizar .env (Opcional)
Se você quiser usar a API Key específica da instância (recomendado):
1. Abra o arquivo `.env`
2. Encontre: `EVOLUTION_API_KEY=beef-sync-api-key-2024`
3. Substitua pela API Key da sua instância (se diferente)
4. Salve o arquivo

**Nota:** A chave atual (`beef-sync-api-key-2024`) é a chave de autenticação geral da API. Você pode usar essa mesma chave para todas as instâncias, OU usar a chave específica de cada instância.

### 6️⃣ Reiniciar Servidor (se necessário)
Se você modificou o `.env`:
```bash
npm run dev
```

---

## ✅ Testar Envio Automático

1. Acesse a página **"Envio de Relatórios"** no sistema
2. Selecione um relatório e um destinatário
3. Clique em **"Enviar Relatórios"**
4. O WhatsApp deve ser enviado automaticamente! 🎉

---

## 🔍 Verificar Status

### Ver containers rodando:
```powershell
docker ps
```

### Ver logs do Evolution API:
```powershell
docker logs evolution-api --tail 20
```

### Parar tudo:
```powershell
docker-compose down
```

### Iniciar novamente:
```powershell
docker-compose up -d
```

---

## 🆘 Problemas?

### QR Code não aparece:
- Recrie a instância na interface web
- Verifique os logs: `docker logs evolution-api`

### Mensagem não chega:
- Verifique se o WhatsApp está conectado na interface web
- Verifique se o número do destinatário está correto (formato: apenas dígitos com DDD)
- Verifique os logs do servidor

### Evolution API não responde:
- Verifique se está rodando: `docker ps`
- Reinicie: `docker-compose restart evolution-api`

---

## 📝 Notas Importantes

- A API Key atual no `.env` (`beef-sync-api-key-2024`) é a chave de autenticação geral
- Você pode criar múltiplas instâncias na interface web
- Cada instância pode ter sua própria API Key (opcional)
- Os dados são salvos em volumes Docker (persistem mesmo após reiniciar)

---

## 🎯 Pronto para Usar!

Agora você pode enviar relatórios e gráficos automaticamente pelo WhatsApp! 🚀
