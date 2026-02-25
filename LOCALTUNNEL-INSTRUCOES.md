# 🚀 LocalTunnel - Instruções de Uso

## O que é?
LocalTunnel é a solução mais simples para acessar seu sistema local pelo celular.

## ✅ Vantagens:
- ✅ **Gratuito para sempre**
- ✅ **SEM limite de banda**
- ✅ **SEM limite de conexões**
- ✅ **Instalação via npm (muito simples)**
- ✅ **URL fixa opcional** (se disponível)
- ✅ **Código aberto**

## 🎯 Como usar:

### Opção 1: Setup Automático (RECOMENDADO)
```bash
SETUP-LOCALTUNNEL-COMPLETO.bat
```
- Instala automaticamente se necessário
- Inicia o túnel
- Mostra a URL para usar no celular

### Opção 2: Tudo junto (Beef-Sync + Túnel)
```bash
ABRIR-BEEF-COM-LOCALTUNNEL.bat
```
- Inicia o Beef-Sync
- Aguarda 30 segundos
- Inicia o LocalTunnel
- Mostra a URL

### Opção 3: Manual
1. Instalar (apenas primeira vez):
   ```bash
   npm install -g localtunnel
   ```

2. Iniciar Beef-Sync:
   ```bash
   npm run dev
   ```

3. Em outra janela, iniciar túnel:
   ```bash
   lt --port 3020
   ```

4. Copiar a URL gerada

## 🌐 URLs geradas:

### Com subdomínio fixo (se disponível):
```
https://beefsync2026.loca.lt
```

### Sem subdomínio (aleatório):
```
https://random-name-123.loca.lt
```

## 📱 Acessar no celular:

1. Copie a URL gerada (exemplo: https://beefsync2026.loca.lt)
2. Acesse no navegador do celular
3. **IMPORTANTE**: Na primeira vez, você verá uma tela de aviso
4. Clique em "Click to Continue" ou "Continuar"
5. Pronto! Você verá o Beef-Sync

### URLs úteis:
- Buscar animal: `https://sua-url.loca.lt/a`
- Relatórios: `https://sua-url.loca.lt/mobile-relatorios`
- Dashboard: `https://sua-url.loca.lt/dashboard`

## 🔧 Solução de Problemas

### "lt não é reconhecido"
- Execute: `npm install -g localtunnel`
- Ou use: `INSTALAR-LOCALTUNNEL.bat`

### "Erro ao conectar"
- Verifique se o Beef-Sync está rodando (localhost:3020)
- Tente fechar e abrir o túnel novamente

### "Subdomínio já em uso"
- O script tentará automaticamente sem subdomínio fixo
- Você receberá uma URL aleatória (funciona igual)

### Tela de aviso no celular
- É normal na primeira vez
- Clique em "Click to Continue"
- É uma proteção do LocalTunnel

## 💡 Dicas

- Mantenha a janela do túnel aberta enquanto usar
- Se a URL mudar, atualize no celular
- Para URL fixa, tente usar sempre o mesmo subdomínio
- Funciona em qualquer rede (WiFi, 4G, 5G)

## 🆚 Comparação com outras soluções:

| Recurso | ngrok | Cloudflare | LocalTunnel |
|---------|-------|------------|-------------|
| Banda | Limitada | Ilimitada | ✅ Ilimitada |
| Conexões | 40/min | Ilimitadas | ✅ Ilimitadas |
| Instalação | Download | Download | ✅ npm install |
| Configuração | Média | Complexa | ✅ Simples |
| Estabilidade | Ótima | Boa | ✅ Boa |
| Preço | Grátis (limitado) | Grátis | ✅ Grátis |

## 📞 Suporte

Problemas? Verifique:
1. Beef-Sync rodando em localhost:3020
2. Node.js/npm instalado
3. Firewall não está bloqueando
4. Internet funcionando

---

**Criado para Beef-Sync** 🐂
