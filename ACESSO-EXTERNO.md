# Acesso Externo à Consulta de Animais

O Beef-Sync permite que usuários externos (via celular ou internet) consultem animais por **Série** e **RG**. A página `/a` foi feita para isso: sem sidebar, somente consulta, sem permissão de edição.

## O desafio: banco local vs. internet

**Se o banco PostgreSQL está na sua máquina local**, usuários fora da sua rede **não conseguem** acessar a consulta pela internet. Motivos:

1. **localhost** só existe no seu computador
2. Seu roteador não expõe seu PC para a internet
3. O PostgreSQL não está configurado para conexões externas

## Opções para permitir acesso externo

### Opção 1: Banco na nuvem (recomendado)

Use um PostgreSQL em nuvem e aponte a aplicação para ele.

| Serviço  | Free tier      | Site          |
|----------|----------------|---------------|
| Neon     | Sim            | neon.tech     |
| Supabase | Sim            | supabase.com  |
| Railway  | Trial          | railway.app   |

**Passos:**

1. Criar um projeto no **Neon** (ou outro)
2. Copiar a **connection string** (ex: `postgresql://user:pass@host/db?sslmode=require`)
3. Configurar no **Vercel** (ou onde o app roda):
   - Vercel → Projeto → Settings → Environment Variables
   - Criar `DATABASE_URL` = connection string
4. Rodar o script de criação de tabelas (`npm run db:init` ou SQL no painel do Neon)
5. Exportar/migrar os dados do seu PostgreSQL local para o banco na nuvem

Depois disso, o app na Vercel usa o banco na nuvem e **qualquer pessoa com internet** pode acessar a consulta.

---

### Opção 2: Túnel (ngrok / Cloudflare Tunnel)

Se quiser manter o banco local e o app rodando no seu PC:

1. **ngrok**
   ```bash
   ngrok http 3000
   ```
   - Você recebe uma URL pública (ex: `https://xxxx.ngrok.io`)
   - Essa URL acessa o Next.js rodando em `localhost:3000`
   - **Desvantagens:** URL muda a cada reinício do ngrok (no plano grátis) e seu PC precisa ficar ligado

2. **Cloudflare Tunnel**
   - Permite domínio fixo
   - PC precisa continuar ligado

**Limitação:** O app e o banco precisam estar no mesmo ambiente (por exemplo, ambos no seu PC). O Vercel **não** consegue conectar em `localhost` na sua máquina.

---

### Opção 3: Servidor próprio (VPS)

Rodar o app e o banco em um servidor (DigitalOcean, AWS, etc.):

1. Contratar uma VPS
2. Instalar Node.js e PostgreSQL
3. Subir o app e apontar `DATABASE_URL` para o Postgres local da VPS
4. Usar domínio próprio (ex: `consulta.seudominio.com.br`)

---

## Resumo

| Cenário                         | Acesso externo? |
|---------------------------------|-----------------|
| App no Vercel + banco local     | Não             |
| App no Vercel + banco na nuvem  | Sim             |
| App local + ngrok + banco local | Sim (PC ligado) |
| App em VPS + banco na VPS       | Sim             |

**Recomendação:** use **Neon** (ou similar) e configure `DATABASE_URL` no Vercel. É rápido, gratuito no início e evita manter seu PC ligado para acesso externo.
