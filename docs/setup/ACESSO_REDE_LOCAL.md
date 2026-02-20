# 🌐 Acesso em Rede Local - Beef Sync

## 🎯 Permitir Acesso de Outros Computadores

### **Método 1: Comando de Desenvolvimento (Recomendado)**

#### **Parar o servidor atual** (se estiver rodando)
```bash
Ctrl + C
```

#### **Iniciar com acesso em rede**
```bash
npm run dev:network
```

**OU**

```bash
next dev -H 0.0.0.0
```

#### **Resultado esperado:**
```
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000
```

---

## 🔍 **Descobrir seu IP Local**

### **Windows**
```cmd
ipconfig
```
Procure por "Endereço IPv4" na seção da sua rede WiFi.

### **macOS/Linux**
```bash
ifconfig
```
OU
```bash
ip addr show
```

### **Alternativa Simples**
1. Abra **Configurações de Rede**
2. Clique na sua conexão WiFi
3. Veja o **Endereço IP**

---

## 📱 **Como Outros Computadores Acessam**

### **URL de Acesso**
Se seu IP for `192.168.1.100`, os outros computadores devem acessar:
```
http://192.168.1.100:3000
```

### **Exemplo Prático**
- **Seu computador**: `http://localhost:3000`
- **Outros computadores**: `http://192.168.1.100:3000`
- **Celulares na mesma WiFi**: `http://192.168.1.100:3000`

---

## 🛡️ **Configurações de Firewall**

### **Windows Defender**
1. Abra **Windows Defender Firewall**
2. Clique em **Permitir um aplicativo**
3. Adicione **Node.js** se não estiver listado
4. Marque **Privado** e **Público**

### **Alternativa Rápida**
```cmd
# Executar como Administrador
netsh advfirewall firewall add rule name="Next.js Dev Server" dir=in action=allow protocol=TCP localport=3000
```

---

## 🔧 **Configuração Avançada**

### **Arquivo next.config.js** (Opcional)
Crie ou modifique o arquivo `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acesso externo
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Configurações de rede
  async rewrites() {
    return []
  }
}

module.exports = nextConfig
```

### **Porta Personalizada**
Se a porta 3000 estiver ocupada:
```bash
npm run dev:network -- -p 3001
```

---

## 📋 **Checklist de Configuração**

### **✅ Pré-requisitos**
- [ ] Computadores na mesma rede WiFi
- [ ] Firewall configurado
- [ ] Servidor rodando com `-H 0.0.0.0`
- [ ] IP local identificado

### **✅ Teste de Conectividade**
1. **No seu computador**: Acesse `http://localhost:3000`
2. **No outro computador**: Acesse `http://SEU_IP:3000`
3. **Teste funcionalidades**: Cadastro, navegação, etc.

---

## 🚀 **Comandos Rápidos**

### **Iniciar Servidor para Rede**
```bash
# Desenvolvimento
npm run dev:network

# Produção (após build)
npm run build
npm run start:network
```

### **Verificar IP Rapidamente**
```bash
# Windows
ipconfig | findstr "IPv4"

# macOS/Linux
ifconfig | grep "inet "
```

---

## 👥 **Colaboração em Equipe**

### **Cenário: 2 Desenvolvedores**
- **Desenvolvedor 1** (você): Roda o servidor
- **Desenvolvedor 2**: Acessa via rede para testar/inserir dados

### **Fluxo de Trabalho**
1. **Dev 1**: Inicia servidor com `npm run dev:network`
2. **Dev 1**: Compartilha IP (ex: `192.168.1.100:3000`)
3. **Dev 2**: Acessa URL e trabalha normalmente
4. **Ambos**: Podem inserir dados simultaneamente

### **Sincronização de Dados**
⚠️ **Importante**: O localStorage é **local por dispositivo**
- Cada computador terá seus próprios dados
- Para sincronizar, use as funções de **Export/Import**

---

## 📊 **Sincronização de Dados Entre Dispositivos**

### **Método 1: Export/Import Manual**
1. **Computador A**: Exporta dados via Excel
2. **Compartilha arquivo** (email, drive, etc.)
3. **Computador B**: Importa dados

### **Método 2: Backup/Restore via Console**
```javascript
// Computador A - Exportar dados
const backup = {
  animals: localStorage.getItem('animals'),
  births: localStorage.getItem('birthData'),
  costs: localStorage.getItem('animalCosts')
}
console.log('BACKUP:', JSON.stringify(backup))

// Computador B - Importar dados
const backup = { /* colar dados aqui */ }
localStorage.setItem('animals', backup.animals)
localStorage.setItem('birthData', backup.births)
localStorage.setItem('animalCosts', backup.costs)
location.reload()
```

---

## 🔒 **Segurança em Rede Local**

### **Boas Práticas**
- ✅ Use apenas em **redes confiáveis** (sua WiFi)
- ✅ **Não exponha** para internet pública
- ✅ **Firewall ativo** apenas para rede local
- ✅ **Backup regular** dos dados

### **Não Recomendado**
- ❌ Abrir para internet sem HTTPS
- ❌ Usar em redes públicas
- ❌ Compartilhar IP publicamente

---

## 🎮 **Teste Prático**

### **Passo a Passo**
1. **Execute**: `npm run dev:network`
2. **Anote o IP**: Ex: `192.168.1.100`
3. **No outro PC**: Abra `http://192.168.1.100:3000`
4. **Teste**: Cadastre um animal
5. **Verifique**: Se a interface funciona normalmente

### **Solução de Problemas**
- **Não conecta**: Verifique firewall
- **Página não carrega**: Confirme IP e porta
- **Lento**: Normal em desenvolvimento
- **Dados não aparecem**: localStorage é separado por dispositivo

---

## 📱 **Acesso via Celular/Tablet**

### **Mesmo Processo**
1. Conecte dispositivo na **mesma WiFi**
2. Abra navegador
3. Digite: `http://SEU_IP:3000`
4. Use normalmente (interface responsiva)

### **Vantagens**
- ✅ **Interface responsiva** funciona bem no mobile
- ✅ **Cadastro rápido** de dados em campo
- ✅ **Consultas rápidas** de informações
- ✅ **Backup móvel** dos dados

---

## 🎯 **Resultado Final**

### **Configuração Completa**
- ✅ **Servidor acessível** na rede local
- ✅ **Múltiplos dispositivos** podem acessar
- ✅ **Interface funcional** em todos os dispositivos
- ✅ **Colaboração eficiente** entre desenvolvedores

### **Próximos Passos**
1. **Configure o servidor** com `npm run dev:network`
2. **Compartilhe o IP** com o outro desenvolvedor
3. **Testem juntos** as funcionalidades
4. **Definam fluxo** de sincronização de dados

---

**🌐 Agora vocês podem trabalhar juntos no mesmo sistema, cada um em seu computador!**