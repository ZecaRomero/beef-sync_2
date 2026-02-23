# Corrigir "Serviço temporariamente indisponível" – DATABASE_URL na Vercel

O erro **ECONNREFUSED 127.0.0.1:5432** significa que o app na Vercel está tentando conectar ao PostgreSQL em **localhost**, em vez de usar o banco no Neon. Isso ocorre quando `DATABASE_URL` não está configurada para o projeto correto.

---

## ✅ Checklist

### 1. Conferir o projeto na Vercel

- A URL `beef-sync-2.vercel.app` indica o projeto **beef-sync_2**
- A variável `DATABASE_URL` precisa estar configurada **nesse projeto**

### 2. Conferir a variável DATABASE_URL

1. Acesse: **https://vercel.com** → projeto **beef-sync_2**
2. Vá em **Settings** → **Environment Variables**
3. Verifique se existe **`DATABASE_URL`**
4. Se não existir, clique em **Add** e adicione:
   - **Key:** `DATABASE_URL`
   - **Value:** sua connection string do Neon (veja o passo 3)
   - **Environments:** marque **Production**, **Preview** e **Development**

### 3. Obter a connection string no Neon

1. Acesse **https://console.neon.tech**
2. Abra o projeto **beef-sync**
3. No **Dashboard**, clique em **Connection details**
4. Copie a **Connection string** (formato: `postgresql://usuario:senha@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require`)
5. Não use placeholders como `user:pass` – use o valor real copiado do Neon

### 4. Fazer um novo deploy

Depois de adicionar ou alterar a variável:

1. Em **beef-sync_2** na Vercel, vá na aba **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy terminar

---

## 🔍 Diagnosticar

Após o deploy, acesse:

```
https://beef-sync-2.vercel.app/api/db-check
```

- **`databaseUrlConfigured: true` e `databaseConnected: true`** → configuração ok  
- **`databaseUrlConfigured: false`** → `DATABASE_URL` não está configurada ou não foi aplicada no deploy  
- **`databaseUrlConfigured: true` e `databaseConnected: false`** → connection string incorreta ou Neon indisponível

---

## ⚠️ Atenção

| Situação | O que fazer |
|----------|-------------|
| Projetos diferentes | Se você tem **beef-sync** e **beef-sync_2**, cada um tem suas variáveis. Configure `DATABASE_URL` no **beef-sync_2**. |
| Valor incorreto | A connection string deve começar com `postgresql://` e terminar com `?sslmode=require`. |
| Variável vazia | Se `DATABASE_URL` estiver vazia, o app usa localhost:5432 (que não existe na Vercel). |
