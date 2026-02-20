# 🔄 Guia de Migração de Dados - Beef Sync

## 📋 O que é a Migração de Dados?

A migração de dados move suas informações do **localStorage** do navegador para o **banco de dados PostgreSQL**. Isso garante que seus dados sejam:

✅ **Permanentes** - Não se perdem ao limpar cache  
✅ **Seguros** - Armazenados no servidor  
✅ **Compartilhados** - Acessíveis de qualquer dispositivo  
✅ **Backupeados** - Protegidos contra perda  

---

## 🚀 Como Migrar Seus Dados

### Opção 1: Migração Automática (Recomendado)

1. **Acesse o Sistema**
   - Ao abrir o Beef Sync, você verá um alerta se houver dados para migrar

2. **Clique em "Sim"**
   - Você será redirecionado para a página de migração

3. **Clique em "Migrar e Limpar"**
   - Isso fará todo o processo automaticamente

4. **Pronto!**
   - Seus dados agora estão no PostgreSQL

### Opção 2: Migração Manual

1. **Acesse o Menu "Sistema"**
   - Na barra lateral esquerda
   - Clique em "Migrar Dados"
   - Se houver dados, verá um badge amarelo "!" piscando

2. **Verifique os Dados**
   - Você verá quantos itens serão migrados:
     - Notas Fiscais
     - Naturezas de Operação  
     - Origens de Receptoras

3. **Escolha uma Ação**

   **A) Migrar Dados**
   - Copia para o PostgreSQL
   - Mantém no localStorage (para conferir)
   
   **B) Migrar e Limpar** (Recomendado)
   - Copia para o PostgreSQL
   - Remove do localStorage automaticamente
   
   **C) Apenas Limpar**
   - Remove do localStorage
   - ⚠️ Use apenas DEPOIS de confirmar que a migração foi bem-sucedida

---

## 🔍 Verificando se a Migração Funcionou

### Método 1: Verificar na Interface

1. Vá para "Cadastrar Animal"
2. Tente criar uma nova nota fiscal
3. Se funcionar sem erros, está tudo certo!

### Método 2: Verificar no Banco de Dados

```sql
-- Conecte ao PostgreSQL
psql -U postgres -d estoque_semen

-- Verifique as notas fiscais
SELECT * FROM notas_fiscais ORDER BY created_at DESC LIMIT 5;

-- Verifique as naturezas de operação
SELECT * FROM naturezas_operacao;

-- Verifique as origens
SELECT * FROM origens_receptoras;
```

### Método 3: Verificar via API

```javascript
// No console do navegador (F12)
fetch('/api/notas-fiscais')
  .then(res => res.json())
  .then(data => console.log('Notas Fiscais:', data))
```

---

## ⚠️ Problemas Comuns

### Erro: "Erro na migração"

**Causa**: Banco de dados não está rodando ou não tem as tabelas

**Solução**:
```bash
# Execute o script de criação de tabelas
node scripts/init-comercial-database.js

# Tente migrar novamente
```

### Erro: "Item já existe"

**Causa**: Dados já foram migrados anteriormente

**Solução**:
- Isso é normal!
- O sistema previne duplicatas
- Você pode limpar o localStorage com segurança

### Badge "!" não aparece

**Causa**: Não há dados no localStorage OU dados já foram migrados

**Solução**:
- Verifique no console do navegador:
```javascript
checkLocalStorageData()
```

---

## 📊 O Que Acontece Durante a Migração?

### Passo 1: Preparação (0.5s)
- Sistema lê dados do localStorage
- Valida formato dos dados

### Passo 2: Envio (1-3s)
- Envia dados para API `/api/migrate-localstorage`
- API valida e insere no PostgreSQL

### Passo 3: Confirmação (0.5s)
- Mostra resultado da migração
- Informa se houve erros

### Passo 4: Limpeza (Opcional)
- Remove dados do localStorage
- Libera espaço no navegador

**Tempo Total**: 2-5 segundos

---

## 🎯 Quando Migrar?

### Migre AGORA se:
- ✅ Você usava o sistema antes da refatoração
- ✅ Há um badge "!" no menu Sistema
- ✅ Recebeu alerta ao abrir o sistema
- ✅ Tem dados importantes no localStorage

### NÃO precisa migrar se:
- ❌ Acabou de instalar o sistema
- ❌ Já migrou os dados antes
- ❌ Nunca usou notas fiscais antes

---

## 🧹 Limpando o localStorage

### Por que limpar?

- Libera espaço no navegador
- Evita confusão com dados duplicados
- Sistema fica mais rápido
- Força uso do PostgreSQL (correto)

### Como limpar?

**Opção 1: Após migração**
```
Clique em "Migrar e Limpar" - faz tudo automaticamente
```

**Opção 2: Manual**
```
Página de migração > Botão "Apenas Limpar"
```

**Opção 3: Console do navegador**
```javascript
localStorage.removeItem('nfsReceptoras')
localStorage.removeItem('naturezasOperacao')
localStorage.removeItem('origensReceptoras')
```

---

## 📝 Dados Migrados

### Notas Fiscais
- Número da NF
- Origem
- Data da compra
- Valor total
- Quantidade de receptoras
- Valor por receptora
- Fornecedor
- Observações

### Naturezas de Operação
- Nome (Compra, Venda, etc.)
- Tipo (entrada/saída)
- Descrição
- Status (ativo/inativo)

### Origens de Receptoras
- Nome da origem
- Descrição
- Status (ativo/inativo)

---

## 🔐 Segurança

### Seus dados estão seguros:

✅ Migração usa transações do PostgreSQL  
✅ Duplicatas são prevenidas automaticamente  
✅ Erros não afetam dados existentes  
✅ Backup pode ser feito no PostgreSQL  

---

## 💡 Dicas Importantes

1. **Faça a migração em horário tranquilo**
   - Evite fazer durante cadastro de animais

2. **Confira os resultados**
   - Veja se a quantidade de itens migrados está correta

3. **Só limpe após confirmar**
   - Certifique-se que a migração foi bem-sucedida

4. **Anote erros**
   - Se houver erros, anote quais itens falharam

5. **Faça backup antes**
   - Opcional: Exporte dados antes de limpar

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs**
   - Console do navegador (F12)
   - Terminal do servidor

2. **Tente novamente**
   - Às vezes uma segunda tentativa funciona

3. **Verifique o banco**
   - Confirme que PostgreSQL está rodando
   - Verifique se as tabelas existem

4. **Restaure se necessário**
   - Os dados no localStorage não são apagados até você confirmar

---

## ✅ Checklist de Migração

- [ ] Abri a página de migração
- [ ] Verifiquei quantos itens serão migrados
- [ ] Cliquei em "Migrar e Limpar"
- [ ] Vi mensagem de sucesso
- [ ] Testei criar nova nota fiscal
- [ ] Funcionou sem erros
- [ ] Dados foram salvos no PostgreSQL
- [ ] localStorage foi limpo
- [ ] Sistema funcionando 100%

---

**Parabéns! Seus dados agora estão seguros no PostgreSQL! 🎉**

---

**Última atualização**: 07/10/2025  
**Versão**: 2.0.0  

