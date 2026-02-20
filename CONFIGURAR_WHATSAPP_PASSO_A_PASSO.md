# 📱 Guia Passo a Passo: Configurar WhatsApp Automático

## 🎯 Objetivo
Configurar o envio automático de relatórios e gráficos pelo WhatsApp instalado na sua máquina, sem precisar abrir o WhatsApp Web.

---

## ✅ Opção Recomendada: Evolution API

### Passo 1: Instalar Docker Desktop
1. Baixe em: https://www.docker.com/products/docker-desktop
2. Instale e inicie o Docker Desktop
3. Aguarde até aparecer "Docker Desktop is running" na bandeja do sistema

### Passo 2: Iniciar Evolution API
Abra o PowerShell ou Terminal e execute:

```bash
docker run --name evolution-api -d -p 8080:8080 atendai/evolution-api:latest
```

**Verificar se está rodando:**
```bash
docker ps
```
Você deve ver um container chamado "evolution-api" na lista.

### Passo 3: Acessar Interface Web
1. Abra seu navegador
2. Acesse: **http://localhost:8080**
3. Você verá a interface do Evolution API

### Passo 4: Criar Instância
1. Na interface web, clique em **"Criar Instância"** ou **"Create Instance"**
2. Escolha um nome (ex: "beef-sync")
3. Clique em **"Criar"**

### Passo 5: Conectar seu WhatsApp
1. Após criar a instância, aparecerá um **QR Code**
2. Abra o **WhatsApp** no seu celular
3. Vá em **Configurações** → **Aparelhos conectados** → **Conectar um aparelho**
4. Escaneie o QR Code que aparece na tela
5. Aguarde a conexão ser estabelecida

### Passo 6: Obter API Key
1. Após conectar, você verá informações da instância
2. Procure por **"API Key"** ou **"Chave API"**
3. **Copie essa chave** (ela será algo como: `abc123def456...`)

### Passo 7: Configurar no .env
1. Abra o arquivo `.env` no projeto
2. Encontre a seção **"Configurações de WhatsApp"**
3. Cole a API Key que você copiou:
   ```env
   EVOLUTION_API_URL=http://localhost:8080
   EVOLUTION_API_KEY=cole_aqui_a_chave_que_voce_copiou
   EVOLUTION_INSTANCE_NAME=beef-sync
   ```
   ⚠️ **IMPORTANTE:** Substitua `cole_aqui_a_chave_que_voce_copiou` pela chave real que você copiou!

### Passo 8: Reiniciar o Servidor
1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

### Passo 9: Testar
1. Acesse a página de **"Envio de Relatórios"**
2. Selecione um relatório e um destinatário
3. Clique em **"Enviar Relatórios"**
4. O WhatsApp deve ser enviado automaticamente para o número configurado!

---

## 🔍 Verificar se Está Funcionando

### Verificar Docker:
```bash
docker ps
```
Deve mostrar o container "evolution-api" rodando.

### Verificar Logs do Evolution API:
```bash
docker logs evolution-api
```

### Verificar Configuração no .env:
Certifique-se de que as linhas estão **descomentadas** (sem `#` no início):
```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_real_aqui
EVOLUTION_INSTANCE_NAME=default
```

---

## ❌ Problemas Comuns

### "Evolution API não configurada"
- Verifique se o Docker está rodando
- Verifique se o container está ativo: `docker ps`
- Verifique se a URL está correta: `http://localhost:8080`

### "Erro ao enviar WhatsApp"
- Verifique se você escaneou o QR Code corretamente
- Verifique se o WhatsApp está conectado na interface web
- Verifique se a API Key está correta no `.env`
- Reinicie o servidor após modificar o `.env`

### "Container não inicia"
- Verifique se a porta 8080 não está sendo usada por outro programa
- Tente usar outra porta: `docker run --name evolution-api -d -p 8081:8080 atendai/evolution-api:latest`
- Se usar outra porta, atualize no `.env`: `EVOLUTION_API_URL=http://localhost:8081`

### "QR Code não aparece"
- Recrie a instância na interface web
- Verifique os logs: `docker logs evolution-api`

---

## 📞 Próximos Passos

Após configurar:
1. ✅ O sistema enviará automaticamente relatórios e gráficos pelo WhatsApp
2. ✅ Você não precisará mais abrir o WhatsApp Web manualmente
3. ✅ Os gráficos serão enviados como imagens junto com o resumo

---

## 💡 Dica

Se você já tem o Evolution API rodando em outro projeto, pode usar a mesma instância! Basta usar a mesma API Key e Instance Name.
