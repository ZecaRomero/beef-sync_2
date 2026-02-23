# Checklist: Consulta pelo Celular Funcionando

Siga na ordem. Após cada passo, teste em **beef-sync-2.vercel.app/a**.

---

## 1. DATABASE_URL na Vercel

- [ ] Vercel → **beef-sync_2** → Settings → Environment Variables
- [ ] Existe **DATABASE_URL** com a connection string do Neon?
- [ ] Se não: adicione. Copie do Neon Console → Connection details
- [ ] Fez **Redeploy** depois de adicionar?

**Testar:** https://beef-sync-2.vercel.app/api/db-check  
Deve mostrar `databaseUrlConfigured: true` e `databaseConnected: true`

---

## 2. Estrutura no Neon

- [ ] Neon Console → beef-sync → SQL Editor
- [ ] Executou o script **scripts/neon-migracao-minima.sql**?
- [ ] Tabelas `animais` e `custos` existem?

**Testar no Neon SQL Editor:**
```sql
SELECT COUNT(*) FROM animais;
```

---

## 3. Dados no Neon

- [ ] O animal CJCJ 15563 existe no Neon?
- [ ] Se não: inserir ou migrar do PostgreSQL local

**Inserir teste no Neon:**
```sql
INSERT INTO animais (nome, serie, rg, situacao) 
VALUES ('CJ SANT ANNA 15563', 'CJCJ', '15563', 'Ativo');
```

---

## 4. Mensagens de erro na tela

Após o deploy, a página `/a` pode mostrar:

| Mensagem | O que fazer |
|----------|-------------|
| "Configure DATABASE_URL no Vercel..." | Passo 1 |
| "Execute o script scripts/neon-migracao-minima.sql no Neon" | Passo 2 |
| "Animal não encontrado" | Passo 3 (adicionar dados) |
