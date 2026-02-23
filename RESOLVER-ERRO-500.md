# 🔧 Resolver Erro 500 - Vercel

## ❌ Erro Atual
```
Serviço temporariamente indisponível. Verifique sua conexão e tente novamente.
```

Esse erro acontece porque o **DATABASE_URL** não está configurado no Vercel.

---

## ✅ Solução - Passo a Passo com Prints

### 1️⃣ Criar Banco de Dados no Neon

#### Passo 1.1 - Acessar Neon
1. Abra: **https://neon.tech**
2. Clique em **Sign Up** (ou **Sign In** se já tem conta)
3. Pode usar sua conta do GitHub para login rápido

#### Passo 1.2 - Criar Projeto
1. Após login, clique em **Create a project** (botão verde)
2. Preencha:
   - **Project name**: `beef-sync`
   - **Region**: Escolha **São Paulo (aws-sa-east-1)** ← IMPORTANTE para Brasil
   - **Postgres version**: Deixe o padrão (16)
3. Clique em **Create project**

#### Passo 1.3 - Copiar Connection String
1. Após criar, você verá uma tela com **Connection Details**
2. Procure por **Connection string**
3. Clique no botão **Copy** ao lado
4. A string será algo como:
   ```
   postgresql://neondb_owner:npg_xxx@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. **GUARDE ESSA STRING!** Cole em um bloco de notas temporariamente

---

### 2️⃣ Configurar no Vercel

#### Passo 2.1 - Acessar Settings
1. No painel do Vercel (onde você está)
2. Clique em **Settings** (menu superior)

#### Passo 2.2 - Ir para Environment Variables
1. No menu lateral esquerdo, clique em **Environment Variables**

#### Passo 2.3 - Adicionar DATABASE_URL
1. Você verá um formulário com 3 campos:
   - **Name (Key)**: Digite `DATABASE_URL`
   - **Value**: Cole a connection string que você copiou do Neon
   - **Environments**: Marque TODAS as opções:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

2. Clique em **Save**

#### Passo 2.4 - Verificar se foi salvo
1. Você deve ver a variável `DATABASE_URL` na lista
2. O valor estará oculto (mostra apenas `***`)

---

### 3️⃣ Fazer Redeploy

#### Passo 3.1 - Voltar para Deployments
1. Clique em **Deployments** (menu superior)

#### Passo 3.2 - Redeploy
1. Encontre o último deployment (o primeiro da lista)
2. Clique nos **3 pontinhos (...)** no canto direito
3. Clique em **Redeploy**
4. Confirme clicando em **Redeploy** novamente

#### Passo 3.3 - Aguardar Build
1. Aguarde o build finalizar (1-2 minutos)
2. Quando aparecer **Ready**, está pronto!

#### Passo 3.4 - Testar Conexão (IMPORTANTE!)
1. Após o deploy, abra no navegador:
   ```
   https://beef-sync-2.vercel.app/api/test-connection
   ```
2. Você deve ver:
   ```json
   {
     "success": true,
     "message": "✅ Banco de dados conectado com sucesso!"
   }
   ```
3. ✅ Se aparecer isso, está tudo certo! Prossiga para o passo 4
4. ❌ Se aparecer erro, volte ao passo 2 e verifique a DATABASE_URL

---

### 4️⃣ Inicializar o Banco de Dados

#### Passo 4.1 - Voltar ao Neon
1. Acesse: **https://console.neon.tech**
2. Clique no seu projeto **beef-sync**

#### Passo 4.2 - Abrir SQL Editor
1. No menu lateral, clique em **SQL Editor**

#### Passo 4.3 - Executar Script
1. Abra o arquivo **init-neon-database.sql** (que criei para você)
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Neon (Ctrl+V)
4. Clique em **Run** (ou pressione Ctrl+Enter)

#### Passo 4.4 - Verificar Sucesso
1. Você deve ver mensagens de sucesso:
   ```
   CREATE TABLE
   CREATE TABLE
   CREATE INDEX
   INSERT 0 1
   ```
2. E no final:
   ```
   Banco inicializado com sucesso!
   total_animais: 1
   ```

---

### 5️⃣ Testar no Celular

#### Passo 5.1 - Abrir no Celular
1. Pegue seu celular
2. Abra o navegador (Chrome, Safari, etc.)
3. Digite: `https://beef-sync-2.vercel.app/a`

#### Passo 5.2 - Fazer Consulta
1. Digite:
   - **Série**: `CJCJ`
   - **RG**: `15563`
2. Clique em **Buscar**

#### Passo 5.3 - Ver Resultado
1. ✅ Deve aparecer a ficha do animal!
2. Se aparecer erro, volte ao passo 2 e verifique se configurou corretamente

---

## 🎯 Checklist Rápido

- [ ] Criar conta no Neon
- [ ] Criar projeto "beef-sync" (região São Paulo)
- [ ] Copiar Connection String
- [ ] Adicionar DATABASE_URL no Vercel
- [ ] Fazer Redeploy
- [ ] Executar script SQL no Neon
- [ ] Testar no celular

---

## 🆘 Ainda com Erro?

### Erro: "Animal não encontrado"
✅ Execute o script SQL novamente no Neon

### Erro: "Serviço indisponível"
✅ Verifique se a variável DATABASE_URL está salva no Vercel
✅ Verifique se fez o Redeploy após adicionar a variável

### Erro: "Connection refused"
✅ Verifique se copiou a Connection String correta do Neon
✅ Verifique se a string termina com `?sslmode=require`

---

## 💡 Dica Importante

A Connection String do Neon tem este formato:
```
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Certifique-se de copiar TODA a string, incluindo:
- `postgresql://` no início
- `?sslmode=require` no final

---

## 📞 Precisa de Ajuda?

Me avise em qual passo você está tendo dificuldade!
