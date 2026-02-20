# 🔇 Como Ocultar as Janelas do CMD

## 🎯 Problema

Quando você abre o Beef Sync, aparecem 2 janelas do CMD (prompt de comando) que ficam abertas em segundo plano.

## ✅ Solução

Criei scripts VBS que iniciam o sistema SEM mostrar as janelas do CMD.

---

## 🚀 Opção 1: Criar Atalho (Recomendado) ⭐la

### Passo 1: Criar o Atalho
Clique duas vezes em:
```
criar-atalho-definitivo.vbs
```

### Passo 2: Usar o Atalho
Agora você tem um atalho chamado **"🐄 Beef Sync.lnk"** na pasta do projeto.

**Clique duas vezes nele para abrir o sistema!**

✅ As janelas do CMD ficarão COMPLETAMENTE ocultas  
✅ Mata processos antigos do Node.js  
✅ Inicia servidor totalmente oculto  
✅ O navegador abrirá automaticamente  
✅ Se o servidor já estiver rodando, apenas abre o navegador

**Esta é a solução DEFINITIVA que realmente oculta tudo!**

---

## 🚀 Opção 2: Usar Script Direto (Mais Poderoso)

Clique duas vezes em:
```
Iniciar-Limpo.vbs
```

Este script:
- ✅ Mata processos antigos do Node.js
- ✅ Inicia servidor COMPLETAMENTE oculto
- ✅ Usa PowerShell para garantir que nada apareça
- ✅ Abre navegador automaticamente

**Use este se o Opção 1 não funcionar!**

---

## 🚀 Opção 3: Iniciar Simples (Sem Verificação)

Clique duas vezes em:
```
Iniciar-BeefSync-Oculto.vbs
```

Inicia o servidor sempre (mesmo que já esteja rodando) e abre o navegador.

---

## 📋 Comparação das Opções

| Opção | Verifica se está rodando | Cria atalho | Recomendado |
|-------|-------------------------|-------------|-------------|
| **Opção 1** | ✅ Sim | ✅ Sim | ⭐ Sim |
| **Opção 2** | ✅ Sim | ❌ Não | ✅ Sim |
| **Opção 3** | ❌ Não | ❌ Não | ⚠️ Não |

---

## 🔧 Como Funciona

### Script VBS (Visual Basic Script)
Os arquivos `.vbs` são scripts do Windows que podem:
- Executar comandos sem mostrar janelas
- Verificar se o servidor está rodando
- Abrir o navegador automaticamente

### Parâmetro `0` no Run
```vbscript
WshShell.Run "cmd /c npm run dev", 0, False
```

O `0` significa: **janela oculta**
- `0` = Oculta
- `1` = Normal
- `2` = Minimizada
- `3` = Maximizada

---

## 📍 Criar Atalho na Área de Trabalho

### Opção A: Arrastar
1. Clique com botão direito em **"Beef Sync.lnk"**
2. Arraste para a Área de Trabalho
3. Solte e escolha "Criar atalhos aqui"

### Opção B: Copiar
1. Clique com botão direito em **"Beef Sync.lnk"**
2. Escolha "Copiar"
3. Vá para Área de Trabalho
4. Clique com botão direito e escolha "Colar"

---

## 🎨 Personalizar Ícone do Atalho

1. Clique com botão direito no atalho
2. Escolha "Propriedades"
3. Clique em "Alterar Ícone"
4. Escolha um ícone do sistema ou navegue até um arquivo .ico

---

## ❓ Perguntas Frequentes

### P: As janelas do CMD vão sumir completamente?
**R:** Sim! Elas não aparecerão mais.

### P: Como sei se o servidor está rodando?
**R:** Abra o Gerenciador de Tarefas (Ctrl+Shift+Esc) e procure por "node.exe"

### P: Como parar o servidor?
**R:** 
1. Abra o Gerenciador de Tarefas (Ctrl+Shift+Esc)
2. Procure por "Node.js: Server-side JavaScript"
3. Clique com botão direito e escolha "Finalizar tarefa"

### P: Posso usar os arquivos .bat antigos?
**R:** Sim, mas eles mostrarão as janelas do CMD. Use os .vbs para ocultar.

### P: O que acontece se eu clicar no atalho várias vezes?
**R:** O script verifica se o servidor já está rodando. Se estiver, apenas abre o navegador.

---

## 🔍 Verificar se Está Funcionando

1. Clique duas vezes em **"Beef Sync.lnk"** (ou no .vbs)
2. Aguarde alguns segundos
3. O navegador deve abrir automaticamente
4. Verifique se NÃO aparecem janelas do CMD

✅ Se o navegador abriu e não há janelas do CMD = Funcionou!

---

## 🛠️ Solução de Problemas

### Problema: "Não é possível encontrar o script"
**Solução:** Certifique-se de que os arquivos .vbs estão na mesma pasta do projeto

### Problema: "Acesso negado"
**Solução:** Clique com botão direito no .vbs e escolha "Executar como administrador"

### Problema: Navegador não abre
**Solução:** Aguarde mais tempo (até 30 segundos) ou verifique se o Node.js está instalado

### Problema: Servidor não inicia
**Solução:** 
1. Abra o CMD manualmente
2. Execute `npm run dev`
3. Veja se há erros

---

## 📄 Arquivos Criados

1. **Abrir-BeefSync.vbs** ⭐
   - Script principal
   - Verifica se servidor está rodando
   - Oculta janelas do CMD

2. **Iniciar-BeefSync-Oculto.vbs**
   - Versão simples
   - Sempre inicia o servidor
   - Oculta janelas do CMD

3. **criar-atalho-beef-sync.vbs**
   - Cria o atalho "Beef Sync.lnk"
   - Execute uma vez apenas

4. **Beef Sync.lnk** (após executar o script 3)
   - Atalho para abrir o sistema
   - Use este no dia a dia

---

## ✅ Recomendação Final

**Use o atalho "Beef Sync.lnk"!**

1. Execute `criar-atalho-beef-sync.vbs` uma vez
2. Use o atalho criado sempre que quiser abrir o sistema
3. Copie o atalho para a Área de Trabalho se desejar

**Pronto! Sem mais janelas do CMD aparecendo!**

---

**Última atualização:** 11/02/2026
