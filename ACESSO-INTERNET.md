# Acessar pelo celular via Internet (ngrok)

Para acessar a consulta de animais pelo celular usando **internet** (4G, Wi-Fi de outro lugar), use o **ngrok** para expor seu app local.

> **Requisito:** O PC precisa estar ligado e o PostgreSQL rodando.

---

## Passo 1: Conta no ngrok (gratuita)

1. Acesse **https://ngrok.com**
2. Crie uma conta gratuita (com Google ou e-mail)
3. No painel, copie seu **Auth Token**

---

## Passo 2: Instalar e configurar o ngrok

Abra o **PowerShell** ou **CMD** e execute:

```bash
# Instalar ngrok globalmente
npm install -g ngrok

# Configurar seu token (substitua SEU_TOKEN pelo token copiado do painel ngrok.com)
ngrok config add-authtoken SEU_TOKEN
```

> **Alternativa:** Se não quiser instalar globalmente, use `npx ngrok http 3020` no Terminal 2. Na primeira vez o npx baixa o ngrok automaticamente.

---

## Passo 3: Rodar o app e o ngrok

**Terminal 1** – iniciar o Beef-Sync:
```bash
npm run dev
```

Aguarde aparecer "Ready" (alguns segundos).

**Terminal 2** – criar o túnel:
```bash
ngrok http 3020
```

O ngrok exibirá algo como:

```
Forwarding    https://abc123xyz.ngrok-free.app -> http://localhost:3020
```

---

## Passo 4: Acessar no celular

1. No celular (pode estar em **4G** ou qualquer Wi-Fi)
2. Abra o navegador
3. Digite a URL que o ngrok mostrou + `/a`:
   ```
   https://abc123xyz.ngrok-free.app/a
   ```
4. Informe **Série** e **RG** e clique em Buscar.

---

## Script automático

Execute **`ACESSAR-INTERNET.bat`** – ele abre os dois terminais para você.  
Antes, certifique-se de que o ngrok está instalado e configurado (Passos 1 e 2).

---

## Observações

| Item | Descrição |
|------|-----------|
| **URL muda** | No plano gratuito, a URL muda a cada vez que o ngrok é reiniciado |
| **PC ligado** | O PC precisa estar ligado com o app e o ngrok rodando |
| **Tela inicial ngrok** | Na primeira visita, o ngrok pode mostrar uma tela de aviso – clique em "Visit Site" |
| **Banco local** | O PostgreSQL continua no seu PC; o ngrok só expõe o app Next.js |

---

## Alternativa sem ngrok: banco na nuvem

Se preferir não depender do PC ligado, use um banco na nuvem (Neon, Supabase) e faça o deploy na Vercel. Veja **ACESSO-EXTERNO.md**.
