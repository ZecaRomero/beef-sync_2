# 📱 Consulta Mobile - Beef Sync

## Como Usar no Celular

### 1️⃣ Acesse a página de consulta

No navegador do celular, digite:

```
http://localhost:3020/a
```

Ou se estiver na rede local:

```
http://192.168.3.3:3020/a
```

### 2️⃣ Digite os dados do animal

Você verá uma tela simples com dois campos:

- **Série**: Ex: `CJCJ`
- **RG**: Ex: `15563`

### 3️⃣ Clique em "Buscar"

O sistema vai buscar o animal e mostrar a ficha completa com:

- Nome e identificação
- Sexo, raça, situação
- Data de nascimento
- Peso
- Custos totais
- Informações de DNA (se houver)

### 4️⃣ Voltar para nova consulta

Clique no botão "Nova Consulta" no rodapé para buscar outro animal.

---

## 🔗 Atalho Direto (URL com parâmetros)

Você também pode criar um link direto para um animal específico:

```
http://localhost:3020/a?serie=CJCJ&rg=15563
```

Isso vai buscar automaticamente o animal sem precisar digitar!

---

## ✨ Características

- ✅ Interface otimizada para celular
- ✅ Sem menu lateral (tela limpa)
- ✅ Campos separados para Série e RG
- ✅ Modo somente leitura (não permite edição)
- ✅ Botão fixo no rodapé para nova consulta
- ✅ Funciona offline após primeiro acesso (PWA)
- ✅ Dark mode automático

---

## 🎯 Exemplo de Uso

1. Abra o celular
2. Acesse: `http://192.168.3.3:3020/a`
3. Digite:
   - Série: `CJCJ`
   - RG: `15563`
4. Clique em "Buscar"
5. Veja a ficha completa do animal CJ SANT ANNA 15563

---

## 📲 Instalar como App (PWA)

No Chrome/Edge do celular:

1. Acesse a página `/a`
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Pronto! Agora você tem um ícone do Beef Sync no celular

---

## 🔧 Configuração de Rede

Para acessar de outros dispositivos na mesma rede:

1. O servidor já está configurado para aceitar conexões de rede
2. Use o IP: `192.168.3.3:3020/a`
3. Certifique-se de que o firewall permite conexões na porta 3020

---

## 🚀 Já está funcionando!

O sistema já está pronto e funcionando. Basta acessar `/a` no celular!
