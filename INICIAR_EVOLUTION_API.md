# 🚀 Como Iniciar o Evolution API

## ⚠️ IMPORTANTE: Docker Desktop precisa estar rodando!

### Passo 1: Verificar Docker Desktop
1. Procure por **"Docker Desktop"** na bandeja do sistema (canto inferior direito)
2. Se não estiver lá, abra o **Docker Desktop** manualmente
3. Aguarde até aparecer **"Docker Desktop is running"** na bandeja

### Passo 2: Iniciar Evolution API

**Opção A: Usar o script PowerShell (mais fácil)**
```powershell
.\iniciar-evolution-api.ps1
```

**Opção B: Comando manual**
```powershell
docker run --name evolution-api -d -p 8080:8080 atendai/evolution-api:latest
```

### Passo 3: Verificar se está rodando
```powershell
docker ps
```
Você deve ver um container chamado "evolution-api" na lista.

### Passo 4: Acessar Interface Web
1. Abra seu navegador
2. Acesse: **http://localhost:8080**

### Passo 5: Configurar Instância
1. Na interface web, clique em **"Criar Instância"** ou **"Create Instance"**
2. Escolha um nome (ex: "beef-sync" ou "default")
3. Clique em **"Criar"**

### Passo 6: Conectar WhatsApp
1. Aparecerá um **QR Code** na tela
2. Abra o **WhatsApp** no seu celular
3. Vá em **Configurações** → **Aparelhos conectados** → **Conectar um aparelho**
4. Escaneie o QR Code
5. Aguarde a conexão

### Passo 7: Obter API Key
1. Após conectar, você verá informações da instância
2. Procure por **"API Key"** ou **"Chave API"**
3. **Copie essa chave** (será algo como: `abc123def456ghi789...`)

### Passo 8: Configurar no .env
1. Abra o arquivo `.env`
2. Encontre a linha:
   ```env
   EVOLUTION_API_KEY=cole_aqui_sua_chave_api
   ```
3. Substitua `cole_aqui_sua_chave_api` pela chave que você copiou
4. Salve o arquivo

### Passo 9: Reiniciar Servidor
1. Pare o servidor (Ctrl+C)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

---

## ✅ Verificar se Está Funcionando

Execute no PowerShell:
```powershell
docker ps
```

Deve mostrar algo como:
```
CONTAINER ID   IMAGE                        STATUS         PORTS                    NAMES
abc123def456   atendai/evolution-api:latest   Up 5 minutes   0.0.0.0:8080->8080/tcp   evolution-api
```

---

## 🐛 Problemas Comuns

### "Docker Desktop is unable to start"
- Verifique se o **WSL 2** está instalado e atualizado
- Reinicie o computador
- Abra o Docker Desktop manualmente e aguarde

### "Port 8080 is already in use"
- Altere a porta no comando:
  ```powershell
  docker run --name evolution-api -d -p 8081:8080 atendai/evolution-api:latest
  ```
- E atualize no `.env`:
  ```env
  EVOLUTION_API_URL=http://localhost:8081
  ```

### "Container não inicia"
- Verifique os logs:
  ```powershell
  docker logs evolution-api
  ```

---

## 📞 Próximo Passo

Depois de configurar, teste enviando um relatório pelo sistema!
