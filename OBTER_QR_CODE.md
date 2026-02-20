# 📱 Como Obter o QR Code para Conectar WhatsApp

## ✅ Instância Criada com Sucesso!

A instância `default` foi criada no Evolution API.

## 🔗 Acessar o Manager

A versão mais recente do Evolution API (v2.2.3) usa um Manager web para gerenciar instâncias.

### Opção 1: Acessar via Navegador (Mais Fácil)

1. Abra seu navegador
2. Acesse: **http://localhost:8080/manager**
3. Você verá a interface de gerenciamento
4. Clique na instância `default`
5. Escaneie o QR Code que aparecerá

### Opção 2: Usar API REST

Execute no PowerShell:
```powershell
$headers = @{
    'apikey' = 'beef-sync-api-key-2024'
    'Content-Type' = 'application/json'
}
$response = Invoke-RestMethod -Uri "http://localhost:8080/instance/connect/default" -Method GET -Headers $headers
$response | ConvertTo-Json
```

### Opção 3: Usar o Script

Execute:
```bash
node scripts/criar-instancia-evolution.js
```

---

## 📱 Conectar WhatsApp

1. **Acesse:** http://localhost:8080/manager
2. **Clique na instância** `default`
3. **Escaneie o QR Code** com seu WhatsApp:
   - Abra o WhatsApp no celular
   - Vá em **Configurações** → **Aparelhos conectados** → **Conectar um aparelho**
   - Escaneie o QR Code
4. **Aguarde a conexão** (pode levar alguns segundos)

---

## ✅ Verificar Status

Após conectar, você pode verificar o status:

```powershell
$headers = @{ 'apikey' = 'beef-sync-api-key-2024' }
Invoke-RestMethod -Uri "http://localhost:8080/instance/fetchInstances" -Method GET -Headers $headers | ConvertTo-Json
```

A instância deve aparecer com status `open` quando conectada.

---

## 🎯 Próximo Passo

Depois de conectar o WhatsApp:
1. Teste enviando um relatório pelo sistema
2. O WhatsApp será enviado automaticamente! 🚀
