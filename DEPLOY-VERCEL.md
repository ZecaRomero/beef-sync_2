# Deploy Beef-Sync na Vercel + Neon

## Pré-requisitos
- ✅ Git instalado
- ✅ Conta Neon
- ✅ Conta Vercel
- ✅ Conta GitHub

---

## Passo 1: Neon - Obter Connection String

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Connection Details** ou **Dashboard**
4. Copie a **Connection string** (formato: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

---

## Passo 2: Migrar dados para o Neon (se já tem dados locais)

Se você tem dados no PostgreSQL local que quer manter:

```bash
# Exportar do banco local
pg_dump -h localhost -U postgres beef_sync > backup.sql

# No Neon: vá em SQL Editor e execute o backup, ou use:
psql "sua-connection-string-neon" < backup.sql
```

Ou use o **Neon SQL Editor** para criar as tabelas e importar.

---

## Passo 3: GitHub - Enviar o código

```bash
cd "c:\Users\zeca8\OneDrive\Documentos\Sistemas\Beef-Sync_TOP _X"

# Configurar Git (só na primeira vez - use seu email e nome do GitHub)
git config --global user.email "seu-email@exemplo.com"
git config --global user.name "Seu Nome"

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Preparar para deploy Vercel"

# Criar repositório no GitHub: github.com → New repository → "beef-sync"
# Depois conectar (substitua SEU_USUARIO pelo seu usuário do GitHub):

git remote add origin https://github.com/SEU_USUARIO/beef-sync.git
git branch -M main
git push -u origin main
```

---

## Passo 4: Vercel - Deploy

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New** → **Project**
3. Importe o repositório **beef-sync** do GitHub
4. Em **Environment Variables**, adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | Cole a connection string do Neon |
| `NEXTAUTH_URL` | `https://seu-projeto.vercel.app` (ajuste após o 1º deploy) |

5. Clique em **Deploy**

---

## Passo 5: Ajustar NEXTAUTH_URL (se usar autenticação)

Após o primeiro deploy, a Vercel dará uma URL como `beef-sync-xxx.vercel.app`.  
Vá em **Settings** → **Environment Variables** e atualize:
- `NEXTAUTH_URL` = `https://beef-sync-xxx.vercel.app`

---

## Acesso no celular

Depois do deploy, acesse de qualquer lugar:
- **Consulta rápida:** `https://seu-projeto.vercel.app/a`
- **Ficha do animal:** `https://seu-projeto.vercel.app/animals/1173`
