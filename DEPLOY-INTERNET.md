# 🌐 Acessar Beef Sync pela Internet

## ✅ Seu Deploy no Vercel

Vejo que você já fez o deploy! Agora vamos configurar para funcionar.

### 📋 URLs do seu projeto:

```
https://beef-sync-2.vercel.app
https://beef-sync-2-git-master-beef-sync.vercel.app
https://beef-sync-2-gbty9fkxe-beef-sync.vercel.app
```

### 🔧 Passo a Passo para Funcionar

#### 1️⃣ Criar Banco de Dados Grátis (Neon)

O Vercel precisa de um banco PostgreSQL na nuvem:

1. Acesse: **https://neon.tech**
2. Clique em **Sign Up** (pode usar conta do GitHub)
3. Clique em **Create Project**
4. Dê um nome: `beef-sync`
5. Escolha região: **São Paulo (aws-sa-east-1)** (mais rápido para Brasil)
6. Clique em **Create Project**

#### 2️⃣ Copiar Connection String

Após criar o projeto no Neon:

1. Na tela principal, você verá **Connection String**
2. Clique em **Copy** (algo como):
   ```
   postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```

#### 3️⃣ Configurar no Vercel

No painel do Vercel (onde você está agora):

1. Clique em **Settings** (menu superior)
2. Clique em **Environment Variables** (menu lateral)
3. Adicione esta variável:

```
Name: DATABASE_URL
Value: postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

4. Marque: **Production**, **Preview**, **Development**
5. Clique em **Save**

#### 4️⃣ Fazer Redeploy

1. Volte para **Deployments** (menu superior)
2. Clique nos 3 pontinhos (...) do último deploy
3. Clique em **Redeploy**
4. Aguarde o build (vai funcionar agora!)

#### 5️⃣ Inicializar o Banco de Dados

Após o deploy funcionar, você precisa criar as tabelas:

**Método Recomendado - Via Neon SQL Editor:**

1. Acesse o painel do **Neon** (https://neon.tech)
2. Clique no seu projeto `beef-sync`
3. Clique em **SQL Editor** (menu lateral)
4. Abra o arquivo `init-neon-database.sql` que criei
5. Copie TODO o conteúdo
6. Cole no SQL Editor do Neon
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde a mensagem: "Banco inicializado com sucesso!"

**Alternativa - Via Script Local:**
```bash
# No seu computador, adicione no .env:
DATABASE_URL=postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require

# Execute:
npm run db:init
```

---

## 📱 Acessar no Celular

Depois de configurar, acesse no celular:

```
https://beef-sync-2.vercel.app/a
```

### Tela de Consulta:
- Digite a **Série**: `CJCJ`
- Digite o **RG**: `15563`
- Clique em **Buscar**
- Veja a ficha completa do animal!

### 💡 Criar Atalho no Celular:

**Android (Chrome):**
1. Acesse `https://beef-sync-2.vercel.app/a`
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Pronto! Ícone do Beef Sync no celular

**iPhone (Safari):**
1. Acesse `https://beef-sync-2.vercel.app/a`
2. Toque no botão de compartilhar (□↑)
3. Selecione "Adicionar à Tela de Início"
4. Pronto! Ícone do Beef Sync no iPhone

### 🔗 Link Direto para Animal:

Você pode criar links diretos para animais específicos:

```
https://beef-sync-2.vercel.app/a?serie=CJCJ&rg=15563
```

Isso abre direto a ficha do animal sem precisar digitar!

---

## 🔐 Segurança (Opcional)

Se quiser proteger a consulta com senha:

1. Posso criar uma tela de login simples
2. Ou usar autenticação do Vercel
3. Ou deixar público (somente consulta, sem edição)

---

## 🎯 Próximos Passos

1. ✅ Deploy feito (já está no Vercel)
2. ⏳ Configurar DATABASE_URL
3. ⏳ Fazer Redeploy
4. ⏳ Inicializar banco de dados
5. ✅ Acessar pelo celular!

---

## 💡 Dica: Domínio Personalizado

Depois que funcionar, você pode configurar um domínio próprio:

- `beefsync.com.br`
- `fazenda.com.br/animais`
- Etc.

No Vercel: **Settings** → **Domains** → **Add Domain**

---

## 🆘 Precisa de Ajuda?

Me avise se:
- Tiver dúvida em algum passo
- Quiser que eu crie o script SQL para inicializar o banco
- Quiser adicionar autenticação/senha
