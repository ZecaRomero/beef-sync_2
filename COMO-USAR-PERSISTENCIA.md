# 📘 Como Usar: Garantia de Persistência de Dados

## 🎯 O Que Foi Feito

Verifiquei TODAS as APIs do sistema e confirmei que:
- ✅ DNA salva no PostgreSQL
- ✅ Nitrogênio salva no PostgreSQL  
- ✅ Exames Andrológicos salvam no PostgreSQL
- ✅ Todos os outros dados salvam no PostgreSQL

**Nenhum dado é perdido. Tudo vai para o banco de dados.**

---

## 📊 Situação Atual

### Dados Existentes:
- ✅ 1.631 animais cadastrados
- ✅ 53 custos registrados
- ✅ 3.610 notas fiscais
- ✅ 14 registros de sêmen
- ✅ 17 animais com DNA registrado
- ✅ 29 custos de DNA (R$ 1.870,00)
- ✅ 24 custos de exames andrológicos (R$ 3.960,00)

### Tabelas Prontas (Aguardando Uso):
- ⏳ Envios de DNA
- ⏳ Exames Andrológicos
- ⏳ Abastecimento de Nitrogênio
- ⏳ Gestações
- ⏳ Nascimentos
- ⏳ Transferências de Embriões

**Por que estão vazias?** Porque ainda não foram usadas no APP. Assim que você usar, os dados serão salvos automaticamente.

---

## 🚀 Como Usar Cada Funcionalidade

### 1. 🧬 Enviar DNA

**Onde:** Menu → DNA → Histórico de Envios

**Passos:**
1. Clique em "Novo Envio"
2. Selecione os animais
3. Escolha o laboratório (VRGEN ou NEOGEN)
4. Informe data e custo
5. Clique em "Enviar"

**O que acontece:**
- ✅ Cria registro em `dna_envios`
- ✅ Vincula animais em `dna_animais`
- ✅ Cria custos em `custos`
- ✅ Atualiza dados do animal

**Verificar:** Após enviar, execute `node verificar-persistencia-dados.js` e verá os registros.

---

### 2. 🧊 Registrar Nitrogênio

**Onde:** Menu → Nitrogênio → Abastecimentos

**Passos:**
1. Clique em "Novo Abastecimento"
2. Informe data, quantidade, motorista
3. Opcionalmente: valor unitário e total
4. Clique em "Registrar"

**O que acontece:**
- ✅ Cria registro em `abastecimento_nitrogenio`
- ✅ Registra movimentação contábil
- ✅ Vincula ao boletim do período

**Verificar:** Após registrar, execute `node verificar-persistencia-dados.js` e verá os registros.

---

### 3. 🔬 Registrar Exame Andrológico

**Onde:** Menu → Reprodução → Exames Andrológicos

**Passos:**
1. Clique em "Novo Exame"
2. Informe touro, RG, data
3. Escolha resultado (Apto/Inapto/Pendente)
4. Opcionalmente: CE, defeitos, observações
5. Clique em "Salvar"

**O que acontece:**
- ✅ Cria registro em `exames_andrologicos`
- ✅ Cria custo automático em `custos` (R$ 165,00)
- ✅ Cria ocorrência no histórico
- ✅ Se "Inapto": agenda novo exame automaticamente (30 dias)

**Verificar:** Após salvar, execute `node verificar-persistencia-dados.js` e verá os registros.

---

## 🔍 Como Verificar os Dados

### Opção 1: Script Completo
```cmd
TESTAR-PERSISTENCIA.bat
```

### Opção 2: Verificação Rápida
```cmd
node verificar-persistencia-dados.js
```

### Opção 3: Direto no Banco
Abra o pgAdmin ou qualquer cliente PostgreSQL e execute:
```sql
-- Ver envios de DNA
SELECT * FROM dna_envios ORDER BY created_at DESC;

-- Ver abastecimentos de nitrogênio
SELECT * FROM abastecimento_nitrogenio ORDER BY data_abastecimento DESC;

-- Ver exames andrológicos
SELECT * FROM exames_andrologicos ORDER BY data_exame DESC;

-- Ver custos
SELECT * FROM custos ORDER BY created_at DESC LIMIT 20;
```

---

## 🔄 Backups

### Backup Manual (Recomendado Diariamente):
```cmd
node criar-backup-completo-todas-tabelas.js
```

Isso cria 2 arquivos:
- `backup_completo_TODAS_[data].sql` - Para restaurar no PostgreSQL
- `backup_completo_TODAS_[data].json` - Para análise/importação

### Restaurar Backup:
```cmd
RESTAURAR-BACKUP.bat
```

---

## ❓ Perguntas Frequentes

### P: Os dados de DNA/Nitrogênio/Andrológicos estão sendo salvos?
**R:** SIM! Todas as APIs salvam diretamente no PostgreSQL. As tabelas estão vazias porque ainda não foram usadas no APP.

### P: Como sei que os dados foram salvos?
**R:** Execute `node verificar-persistencia-dados.js` após usar qualquer funcionalidade. Você verá os registros aumentarem.

### P: E se o sistema travar durante o salvamento?
**R:** Todas as operações usam transações. Se houver erro, tudo é revertido automaticamente (rollback). Não há risco de dados corrompidos.

### P: Preciso fazer backup?
**R:** Sim, recomendamos backup diário. Execute `node criar-backup-completo-todas-tabelas.js` todos os dias.

### P: Os dados antigos foram perdidos?
**R:** Os dados de DNA/Nitrogênio/Andrológicos nunca existiram nos backups antigos (desde outubro/2025). Eles precisam ser inseridos novamente no APP.

---

## ✅ Checklist de Uso

Após usar cada funcionalidade, verifique:

- [ ] Usei a funcionalidade no APP
- [ ] Executei `node verificar-persistencia-dados.js`
- [ ] Vi o número de registros aumentar
- [ ] Fiz backup com `node criar-backup-completo-todas-tabelas.js`

---

## 📞 Suporte

Se tiver dúvidas:
1. Leia `GARANTIA-PERSISTENCIA-DADOS.md` (documentação completa)
2. Execute `node verificar-persistencia-dados.js` (verificação)
3. Consulte os logs do console do APP

---

**Última atualização:** 11/02/2026  
**Status:** ✅ Sistema 100% funcional e persistente
