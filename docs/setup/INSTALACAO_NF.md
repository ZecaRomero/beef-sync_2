# 🚀 Guia Rápido de Instalação - Sistema de Notas Fiscais

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Migrar o Banco de Dados

Abra o terminal na pasta do projeto e execute:

```bash
node scripts/migrate-nf-system.js
```

**Resultado esperado:**
```
🚀 Iniciando migração do sistema de Notas Fiscais...
✅ Tabelas criadas com sucesso!
📦 Verificando dados existentes...
✨ Migração concluída com sucesso!

📋 Resumo:
   - Total de notas fiscais: 0
   - Total de itens: 0

✅ Processo concluído!
```

### 2️⃣ Iniciar o Servidor

```bash
npm run dev
```

### 3️⃣ Acessar o Sistema

Abra o navegador em:
```
http://localhost:3000/notas-fiscais
```

## ✅ Pronto!

O sistema está funcionando! 🎉

---

## 📋 Passo a Passo Detalhado

### Pré-requisitos

Certifique-se de que você tem:
- ✅ PostgreSQL instalado e rodando
- ✅ Banco de dados `beefsync` criado
- ✅ Node.js instalado
- ✅ Projeto Beef Sync configurado

### Verificar Conexão com Banco

Execute:
```bash
node teste-conexao.bat
```

Se der erro, verifique suas credenciais em `lib/database.js`.

---

## 🔧 Configuração Manual (Se Necessário)

### Opção 1: Executar SQL Diretamente

Se o script de migração não funcionar, execute o SQL manualmente:

```bash
psql -U postgres -d beefsync -f scripts/create-nf-tables.sql
```

### Opção 2: Via pgAdmin

1. Abra o pgAdmin
2. Conecte ao banco `beefsync`
3. Abra o Query Tool
4. Copie e cole o conteúdo de `scripts/create-nf-tables.sql`
5. Execute

---

## 🧪 Testar o Sistema

### Teste 1: Acessar a Página

```
http://localhost:3000/notas-fiscais
```

✅ **Esperado:** Dashboard vazio com botões "Nova Entrada" e "Nova Saída"

### Teste 2: Criar NF de Entrada (Bovino)

1. Clique em "Nova Entrada"
2. Preencha:
   - Número NF: `12345`
   - Data: Hoje
   - Fornecedor: `Fazenda Teste`
   - Natureza: `Compra`
3. Selecione tipo: **Bovino** 🐄
4. Adicione um animal:
   - Tatuagem: `001`
   - Sexo: `Fêmea`
   - Era: `Novilha`
   - Valor: `4500`
5. Clique "Adicionar Bovino"
6. Clique "Salvar NF"

✅ **Esperado:** Mensagem de sucesso e NF aparece na listagem

### Teste 3: Criar NF de Entrada (Sêmen)

1. Clique em "Nova Entrada"
2. Preencha dados da NF
3. Selecione tipo: **Sêmen** 🧬
4. Adicione:
   - Touro: `GUADALUPE IDEAL`
   - Doses: `100`
   - Valor/dose: `45`
5. Clique "Adicionar Sêmen"
6. Clique "Salvar NF"

✅ **Esperado:** 
- NF criada
- Sêmen adicionado ao estoque (`/estoque-semen`)

### Teste 4: Verificar Integração

Acesse:
```
http://localhost:3000/estoque-semen
```

✅ **Esperado:** Lote de sêmen "GUADALUPE IDEAL" com 100 doses disponíveis

---

## 🔍 Verificação do Banco de Dados

### Ver Notas Fiscais

```sql
SELECT * FROM notas_fiscais ORDER BY data DESC;
```

### Ver Itens

```sql
SELECT 
  nf.numero_nf,
  nf.tipo,
  nfi.tipo_produto,
  nfi.dados_item
FROM notas_fiscais nf
JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id;
```

### Ver Estatísticas

```sql
-- Total por tipo
SELECT 
  tipo,
  COUNT(*) as quantidade,
  SUM(valor_total) as valor_total
FROM notas_fiscais
GROUP BY tipo;

-- Total por tipo de produto
SELECT 
  tipo_produto,
  COUNT(*) as quantidade
FROM notas_fiscais
GROUP BY tipo_produto;
```

---

## 🐛 Resolução de Problemas

### Erro: "Tabela não existe"

**Solução:**
```bash
node scripts/migrate-nf-system.js
```

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Verifique credenciais em `lib/database.js`
3. Teste conexão: `node teste-conexao.bat`

### Erro: "Module not found"

**Solução:**
```bash
npm install
```

### Página não carrega

**Solução:**
1. Verifique se o servidor está rodando (`npm run dev`)
2. Limpe o cache do navegador (Ctrl + Shift + R)
3. Verifique o console do navegador (F12)

### Modal não abre

**Solução:**
1. Verifique o console do navegador (F12)
2. Limpe o cache
3. Reinicie o servidor

---

## 📚 Próximos Passos

### 1. Explore o Sistema

- ✅ Cadastre algumas NFs de teste
- ✅ Teste os filtros
- ✅ Teste a busca
- ✅ Edite uma NF
- ✅ Exclua uma NF

### 2. Configure Naturezas de Operação

Edite naturezas padrão conforme sua necessidade:
- Compra
- Venda
- Transferência
- Doação
- etc.

### 3. Cadastre Dados Reais

Comece cadastrando:
1. NFs de entrada mais recentes
2. NFs de saída de vendas
3. Organize por período

### 4. Integre com o Fluxo de Trabalho

- Use NFs ao comprar animais
- Use NFs ao comprar sêmen
- Use NFs ao vender produtos
- Mantenha atualizado

---

## 📊 Acompanhamento

### Métricas para Monitorar

**Dashboard:**
- Total de entradas vs saídas
- Distribuição por tipo de produto
- Saldo financeiro

**Por Período:**
- Últimos 7 dias
- Últimos 30 dias
- Mensal
- Anual

---

## 🎯 Dicas de Uso

### Para Bovinos
- Use tatuagens consistentes
- Registre peso quando possível
- Especifique bem a era

### Para Sêmen
- Sempre registre botijão e caneca
- Anote certificado
- Defina data de validade

### Para Embriões
- Registre doadora e touro
- Classifique qualidade
- Defina tipo (FIV/TE)

---

## 🆘 Suporte

### Em Caso de Dúvidas

1. Consulte: `SISTEMA_NOTAS_FISCAIS.md` (documentação completa)
2. Consulte: `MELHORIAS_NOTAS_FISCAIS.md` (resumo das melhorias)
3. Verifique o console do navegador (F12)
4. Verifique logs do servidor

### Logs Úteis

**No navegador (F12):**
```
Console → Ver erros JavaScript
Network → Ver requisições à API
```

**No servidor:**
```
Terminal → Ver logs do Next.js
```

---

## ✅ Checklist de Instalação

Marque conforme completa:

- [ ] PostgreSQL rodando
- [ ] Banco `beefsync` criado
- [ ] Script de migração executado
- [ ] Tabelas criadas
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Página acessível
- [ ] Teste: NF de bovino criada
- [ ] Teste: NF de sêmen criada
- [ ] Integração verificada
- [ ] Menu atualizado visível

---

## 🎉 Instalação Completa!

Se todos os itens do checklist estão marcados, **parabéns!** 🎊

O Sistema de Notas Fiscais está 100% operacional!

### O que você pode fazer agora:

✅ Cadastrar notas fiscais de entrada e saída
✅ Gerenciar bovinos, sêmen e embriões
✅ Ver estatísticas em tempo real
✅ Filtrar e buscar NFs
✅ Integração automática com estoque
✅ Rastreabilidade completa

---

**Bom trabalho! 🚀**

*Sistema de Notas Fiscais - Beef Sync*
*Outubro 2024*

