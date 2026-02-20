# 🚀 Como Executar a Refatoração

## ⚡ Guia Rápido (3 Passos)

### Passo 1: Atualizar o Banco de Dados
```bash
node scripts/init-comercial-database.js
```

### Passo 2: Reiniciar o Servidor
```bash
npm run dev
```

### Passo 3: Testar
Acesse: http://localhost:3000/comercial

---

## 📋 Checklist de Verificação

Marque conforme for executando:

- [ ] Banco de dados PostgreSQL está rodando
- [ ] Executou `node scripts/init-comercial-database.js`
- [ ] Viu mensagem "✅ Todas as tabelas comerciais foram criadas com sucesso!"
- [ ] Reiniciou o servidor (`npm run dev`)
- [ ] Acessou a área comercial sem erros
- [ ] Testou criar uma nota fiscal
- [ ] Dados foram salvos no banco (não no localStorage)

---

## 🔍 Verificação das Tabelas

Execute no PostgreSQL para confirmar:

```sql
-- Conectar ao banco
psql -U postgres -d estoque_semen

-- Verificar tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('notas_fiscais', 'servicos', 'naturezas_operacao', 'origens_receptoras');

-- Deve mostrar 4 tabelas
```

---

## 🧪 Testes Rápidos

### Teste 1: Criar Nota Fiscal
1. Vá em "Animais" > "Cadastrar Animal"
2. Na seção de receptoras, clique em "+ Nova NF"
3. Preencha os dados e salve
4. **Não deve dar erro!** ✅

### Teste 2: Verificar no Banco
```sql
SELECT * FROM notas_fiscais ORDER BY created_at DESC LIMIT 5;
```

### Teste 3: API de Serviços
```bash
# No terminal ou Postman
curl http://localhost:3000/api/servicos
```

Deve retornar um array (mesmo que vazio).

---

## 🔄 Migrar Dados Antigos (Opcional)

Se você tinha dados no localStorage do navegador:

### Opção 1: Console do Navegador
1. Abra o sistema no navegador
2. Pressione F12 (Console)
3. Execute:
```javascript
migrateLocalStorageToDatabase()
```

### Opção 2: Manualmente
```javascript
// Verificar se há dados
checkLocalStorageData()

// Se houver, migrar
migrateLocalStorageToDatabase()
```

---

## ❌ Solução de Problemas Comuns

### Erro: "Pool de conexões não disponível"
**Causa**: PostgreSQL não está rodando

**Solução**:
```bash
# Windows (verificar se está rodando)
pg_ctl status -D "C:\Program Files\PostgreSQL\XX\data"

# Iniciar se necessário
pg_ctl start -D "C:\Program Files\PostgreSQL\XX\data"
```

### Erro: "relation 'notas_fiscais' does not exist"
**Causa**: Script de criação de tabelas não foi executado

**Solução**:
```bash
node scripts/init-comercial-database.js
```

### Erro: "Cannot find module"
**Causa**: Dependências não instaladas

**Solução**:
```bash
npm install
```

### Erro ao lançar nota fiscal ainda persiste
**Causa**: Cache do navegador

**Solução**:
1. Pressione Ctrl+Shift+R (hard refresh)
2. Ou limpe o cache do navegador
3. Ou abra em aba anônima

---

## 📞 Precisa de Ajuda?

### Ver logs do servidor
Veja o terminal onde está rodando `npm run dev`

### Ver logs do banco
```bash
# Ver últimas queries
tail -f /var/log/postgresql/postgresql-XX-main.log
```

### Resetar tudo (último recurso)
```bash
# Deletar tabelas
psql -U postgres -d estoque_semen -c "DROP TABLE IF EXISTS servicos, notas_fiscais, naturezas_operacao, origens_receptoras CASCADE;"

# Recriar
node scripts/init-comercial-database.js
```

---

## ✅ Tudo Funcionando!

Se você conseguiu:
- ✅ Criar uma nota fiscal sem erro
- ✅ Ver serviços na área comercial
- ✅ APIs respondendo corretamente

**Parabéns! A refatoração foi aplicada com sucesso! 🎉**

Agora o sistema está:
- 💾 Salvando tudo no PostgreSQL
- 🔄 Sincronizado entre dispositivos
- 🚀 Pronto para produção
- 🎯 Sem erros conhecidos

---

## 📊 Comandos Úteis

```bash
# Ver todas as tabelas do banco
psql -U postgres -d estoque_semen -c "\dt"

# Ver estrutura de uma tabela
psql -U postgres -d estoque_semen -c "\d notas_fiscais"

# Contar registros
psql -U postgres -d estoque_semen -c "SELECT COUNT(*) FROM notas_fiscais;"

# Ver últimos registros
psql -U postgres -d estoque_semen -c "SELECT * FROM notas_fiscais ORDER BY created_at DESC LIMIT 10;"
```

---

**Tempo estimado de execução**: 2-5 minutos  
**Complexidade**: Fácil  
**Reversível**: Sim  

Se tiver dúvidas, consulte `RESUMO_REFATORACAO.md` ou `REFATORACAO_COMPLETA_V2.md`

