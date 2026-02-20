# 🚀 Como Acessar as Novas Funcionalidades de Contabilidade

## 📍 **PORTA DO SISTEMA: 3020**

### 🔗 **Links Diretos:**
- **Sistema Principal:** http://localhost:3020
- **Configurações:** http://localhost:3020/settings
- **Notas Fiscais:** http://localhost:3020/settings (aba "Notas Fiscais")

## 🎯 **Como Iniciar o Sistema:**

### Opção 1: Script Automático
```bash
# Execute o arquivo criado:
start-beef-sync-contabilidade.bat
```

### Opção 2: Comando Manual
```bash
# No terminal, dentro da pasta do projeto:
npm run dev
```

### Opção 3: Comando de Rede (para acessar de outros dispositivos)
```bash
npm run dev:network
```

## 📋 **Passo a Passo para Ver Suas NFs:**

### 1. **Iniciar o Servidor**
- Execute `start-beef-sync-contabilidade.bat` OU
- Execute `npm run dev` no terminal

### 2. **Acessar o Sistema**
- Abra: http://localhost:3020

### 3. **Ir para Configurações**
- Clique no menu "⚙️ Configurações" (canto superior direito)

### 4. **Acessar Notas Fiscais**
- Clique na aba "📄 Notas Fiscais"

### 5. **Ver sua NF de R$ 46,50**
- Aparecerá no resumo fiscal
- Detalhes completos na lista
- Explicação do saldo negativo

## 🎯 **Novas Abas Disponíveis:**

### 📊 **Aba "Contabilidade"**
- Configurações de email do contador
- Envio automático de relatórios
- Ações rápidas para contabilidade

### 📄 **Aba "Notas Fiscais"** ⭐ **PRINCIPAL**
- **Resumo Fiscal** com sua NF de R$ 46,50
- **Explicação do saldo negativo**
- **Botão "Enviar Boletim p/ Contador"**
- **Geração de novas NFs**

### 🏛️ **Aba "Relatórios Fiscais"**
- Cálculos tributários automáticos
- Geração de DARF, DIMOB, DIRPF
- Envio para contador

### ✉️ **Aba "Templates Email"**
- Editor de templates personalizáveis
- Preview e teste de emails
- Variáveis dinâmicas

## 🔍 **Verificar se Está Funcionando:**

### ✅ **Checklist:**
1. **Servidor rodando?** → Deve aparecer "Ready" no terminal
2. **Porta correta?** → http://localhost:3020 deve abrir
3. **Aba visível?** → "Notas Fiscais" deve aparecer nas configurações
4. **NF aparece?** → Resumo deve mostrar "1 NF de Entrada - R$ 46,50"

### 🚨 **Se não aparecer:**
1. **Pare o servidor** (Ctrl+C no terminal)
2. **Execute:** `npm install` (instalar dependências)
3. **Execute:** `npm run dev` (reiniciar)
4. **Aguarde** aparecer "Ready - started server on 0.0.0.0:3020"
5. **Acesse:** http://localhost:3020/settings

## 📧 **Testar Envio para Contador:**

### 1. **Configure o Email**
- Vá em "Contabilidade" → Digite email do contador

### 2. **Envie o Boletim**
- Vá em "Notas Fiscais" → Clique "Enviar Boletim p/ Contador"

### 3. **Resultado Esperado**
- Outlook abre automaticamente
- Email pré-formatado com sua NF de R$ 46,50
- Arquivo JSON baixa automaticamente

## 🎯 **Funcionalidades Principais:**

### ✅ **Sua NF de R$ 46,50:**
- ✅ Aparece no resumo fiscal
- ✅ Saldo negativo explicado como "investimento normal"
- ✅ Incluída automaticamente no boletim para contador
- ✅ Pode ser associada ao macho 24/36 meses

### ✅ **Automações:**
- ✅ Email para contador com um clique
- ✅ Download automático de dados estruturados
- ✅ Cálculos fiscais automáticos (ICMS, NCM, CFOP)
- ✅ Templates profissionais personalizáveis

## 🆘 **Suporte:**

### Se ainda não aparecer:
1. **Verifique a porta:** Deve ser 3020, não 3000
2. **Limpe o cache:** Ctrl+F5 no navegador
3. **Verifique o terminal:** Deve mostrar "Ready" sem erros
4. **Teste outro navegador:** Chrome, Firefox, Edge

### **URL Completa para Testar:**
```
http://localhost:3020/settings
```

**🎉 Suas funcionalidades de contabilidade estão prontas na porta 3020!**