# Jeito mais fácil: ver animais no celular

## Comparação

| Opção | Dificuldade | O que precisa | PC ligado? |
|-------|------------|--------------|------------|
| **ngrok (recomendado)** | ⭐ Fácil | Conta ngrok + 1 comando | Sim |
| Neon + Vercel | ⭐⭐⭐ Difícil | Migrar banco, configurar env | Não |

---

## Jeito mais fácil: ngrok (5 minutos)

**Vantagem:** Usa seu PostgreSQL que já tem os animais. Sem migração, sem Neon, sem configurar Vercel.

### 1. Criar conta no ngrok (grátis)
- Acesse **https://ngrok.com** → Sign up (pode usar Google)
- No painel: **Your Authtoken** → Copy

### 2. Configurar (uma vez só)
Abra o **CMD** ou **PowerShell** e rode:
```
npm install -g ngrok
ngrok config add-authtoken COLE_SEU_TOKEN_AQUI
```

### 3. Usar
Dê duplo clique em **`CELULAR-FACIL.bat`** (ou `ACESSAR-INTERNET.bat`)

- Abre o servidor do app
- Abre o ngrok em outra janela
- **IMPORTANTE:** Na janela do ngrok, procure a linha "Forwarding" e copie a URL real (ex: `https://a1b2c3d4.ngrok-free.app`)
- **NÃO use** `abc123` – isso é só exemplo! A URL real aparece na janela do ngrok
- No celular: **URL copiada + /a** (ex: `https://a1b2c3d4.ngrok-free.app/a`)
- Digite Série e RG → Buscar

**Pronto.** Os animais do seu banco local aparecem no celular.

---

## Não está funcionando?

Use **`CORRIGIR-E-INICIAR.bat`** – ele:

1. Libera a porta 3020 (se estiver ocupada)
2. Pede para você colar o token do ngrok (pegue em https://dashboard.ngrok.com/get-started/your-authtoken)
3. Inicia o servidor e o ngrok

**Erros comuns:**
- **EADDRINUSE 3020** → Porta ocupada. O script libera automaticamente.
- **ERR_NGROK_105** → Token errado. Cole **só o token** (sem "SEU_TOKEN" na frente).

---

## Observação

- **PC precisa estar ligado** quando quiser acessar pelo celular
- **URL muda** cada vez que reinicia o ngrok (plano grátis)
- Na primeira visita, o ngrok pode pedir "Visit Site" – clique e continue

---

## Se quiser sem PC ligado

Aí precisa de Neon + Vercel (mais trabalhoso). O ngrok é o jeito mais rápido de funcionar agora.
