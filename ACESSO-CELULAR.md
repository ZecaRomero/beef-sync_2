# Acesso pelo Celular (mesma rede Wi-Fi)

Para acessar a consulta de animais pelo celular, com o banco PostgreSQL rodando no seu PC:

## Passo a passo

### 1. Iniciar o servidor para rede

**Opção A – Script automático (recomendado):**
```bash
ACESSAR-CELULAR.bat
```
(Dê duplo clique ou execute no terminal.)

**Opção B – Manualmente:**
```bash
npm run dev:network
```

### 2. Descobrir o IP do PC

Abra um novo terminal (PowerShell ou CMD) e digite:
```bash
ipconfig
```

Procure por **"IPv4"** ou **"Endereço IPv4"** na adaptadora de rede Wi-Fi.  
Exemplo: `192.168.1.100`

### 3. Acessar no celular

1. Conecte o celular na **mesma rede Wi-Fi** do PC.
2. Abra o navegador e digite:
   ```
   http://192.168.1.100:3020/a
   ```
   (troque `192.168.1.100` pelo IP do seu PC.)
3. Informe **Série** e **RG** do animal e clique em Buscar.

---

## Solução de problemas

### "Não conecta" ou "tempo esgotado"

- **Firewall do Windows:** permita a porta 3020.
  1. Painel de Controle → Firewall do Windows → Configurações avançadas
  2. Regras de entrada → Nova regra → Porta → TCP 3020 → Permitir

- **Mesma rede:** celular e PC precisam estar na mesma rede Wi-Fi.

### PostgreSQL não conecta

- Confirme que o PostgreSQL está rodando.
- Verifique o `.env` com os dados do banco:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=beef_sync
  DB_USER=postgres
  DB_PASSWORD=sua_senha
  ```
