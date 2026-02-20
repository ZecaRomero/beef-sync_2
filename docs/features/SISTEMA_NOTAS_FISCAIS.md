# 📋 Sistema de Notas Fiscais - Beef Sync

## 🎯 Visão Geral

Sistema completo de gerenciamento de Notas Fiscais com suporte para **Entradas** e **Saídas** de três tipos de produtos:
- 🐄 **Bovinos** (Animais)
- 🧬 **Sêmen** (Doses de touros)
- 🧫 **Embriões** (Unidades FIV/TE)

---

## ✨ Principais Funcionalidades

### 📊 Dashboard Completo
- Estatísticas em tempo real de entradas e saídas
- Valores totais por tipo de operação
- Contadores por tipo de produto (bovinos, sêmen, embriões)
- Cálculo automático de saldo (saídas - entradas)

### 🔍 Filtros Avançados
- **Busca** por número de NF, fornecedor ou destino
- **Filtro por tipo**: Entradas, Saídas ou Todas
- **Filtro por produto**: Bovinos, Sêmen, Embriões ou Todos
- **Filtro por período**: 7 dias, 30 dias, 90 dias, ano ou todos

### 📝 Cadastro Inteligente
- Modal único para entrada e saída
- Seleção de tipo de produto com interface visual
- Campos específicos para cada tipo de produto
- Cálculo automático de valores totais
- Validação de dados em tempo real

---

## 🏗️ Estrutura do Sistema

### Componentes Criados

#### 1. **NotaFiscalModal.js**
Modal universal para cadastro de notas fiscais com:
- Suporte para entrada e saída
- Três tipos de produtos (bovino, sêmen, embrião)
- Formulários específicos para cada tipo
- Lista dinâmica de itens adicionados
- Cálculos automáticos

#### 2. **pages/notas-fiscais/index.js**
Página principal com:
- Dashboard com estatísticas
- Listagem completa de NFs
- Filtros e busca
- Ações de edição e exclusão

#### 3. **APIs**
- `pages/api/notas-fiscais/index.js` - Listar, criar e atualizar
- `pages/api/notas-fiscais/[id].js` - Buscar e deletar

#### 4. **Banco de Dados**
- Tabela `notas_fiscais` - Dados principais
- Tabela `notas_fiscais_itens` - Itens em JSONB
- Índices para performance
- Integração automática com estoque de sêmen e animais

---

## 📋 Tipos de Produtos

### 🐄 Bovinos

**Campos de Entrada:**
- Tatuagem/Identificação *
- Sexo * (Macho/Fêmea)
- Era * (Novilha, Vaca, Touro, etc.)
- Raça
- Peso (kg)
- Valor Unitário * (R$)

**Integração:**
- Entradas são automaticamente adicionadas à tabela de animais
- Vinculação com número da NF
- Registro de origem (fornecedor)

---

### 🧬 Sêmen

**Campos de Entrada:**
- Nome do Touro *
- RG do Touro
- Raça
- Quantidade de Doses *
- Valor Unitário/Dose * (R$)
- Valor Total (calculado)
- Botijão
- Caneca
- Certificado
- Data de Validade

**Integração:**
- Entradas são automaticamente adicionadas ao estoque de sêmen
- Controle de doses disponíveis
- Rastreabilidade por NF
- Localização no botijão/caneca

**Cálculos:**
- Valor Total = Quantidade de Doses × Valor Unitário
- Doses Disponíveis = Quantidade inicial
- Custo por dose registrado

---

### 🧫 Embriões

**Campos de Entrada:**
- Doadora *
- Touro *
- Raça
- Quantidade de Embriões *
- Valor Unitário * (R$)
- Valor Total (calculado)
- Tipo de Embrião (In Vitro, In Vivo, Fresco, Congelado)
- Qualidade (A, B, C)
- Data de Coleta

**Controle:**
- Rastreamento de origem genética (doadora × touro)
- Classificação por qualidade
- Tipo de produção (FIV/TE)
- Histórico de compra/venda

**Cálculos:**
- Valor Total = Quantidade de Embriões × Valor Unitário

---

## 🚀 Como Usar

### Acessar o Sistema

```
Menu → Notas Fiscais → Gerenciar NFs
OU
URL direta: /notas-fiscais
```

### Cadastrar Nota Fiscal de Entrada

1. **Clique em "Nova Entrada"** (botão verde)
2. **Preencha dados da NF:**
   - Número da NF
   - Data
   - Fornecedor
   - Natureza da Operação

3. **Selecione o tipo de produto:**
   - 🐄 Bovino
   - 🧬 Sêmen
   - 🧫 Embrião

4. **Adicione os itens:**
   - Preencha os campos específicos do tipo
   - Clique em "Adicionar [Tipo]"
   - Repita para mais itens

5. **Revise a lista de itens adicionados**
6. **Adicione observações** (opcional)
7. **Clique em "Salvar NF"**

### Cadastrar Nota Fiscal de Saída

1. **Clique em "Nova Saída"** (botão azul)
2. **Preencha dados da NF:**
   - Número da NF
   - Data
   - Destino
   - Natureza da Operação

3. **Selecione o tipo e adicione itens** (mesmo processo)
4. **Salvar**

### Editar Nota Fiscal

1. **Localize a NF na listagem**
2. **Clique no ícone de edição** (lápis)
3. **Modifique os dados necessários**
4. **Clique em "Atualizar NF"**

### Excluir Nota Fiscal

1. **Localize a NF na listagem**
2. **Clique no ícone de exclusão** (lixeira)
3. **Confirme a exclusão**

---

## 💾 Banco de Dados

### Criar Tabelas

Execute o script de migração:

```bash
node scripts/migrate-nf-system.js
```

Ou execute manualmente o SQL:

```bash
psql -U postgres -d beefsync -f scripts/create-nf-tables.sql
```

### Estrutura das Tabelas

#### notas_fiscais
```sql
- id (SERIAL PRIMARY KEY)
- numero_nf (VARCHAR 50)
- data (DATE)
- fornecedor (VARCHAR 200)
- destino (VARCHAR 200)
- natureza_operacao (VARCHAR 100)
- observacoes (TEXT)
- tipo (entrada/saida)
- tipo_produto (bovino/semen/embriao)
- valor_total (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### notas_fiscais_itens
```sql
- id (SERIAL PRIMARY KEY)
- nota_fiscal_id (FK → notas_fiscais)
- tipo_produto (bovino/semen/embriao)
- dados_item (JSONB) - Flexível para cada tipo
- created_at (TIMESTAMP)
```

### Exemplos de JSONB (dados_item)

**Bovino:**
```json
{
  "tatuagem": "001",
  "sexo": "femea",
  "era": "novilha",
  "raca": "Nelore",
  "peso": "320.5",
  "valorUnitario": "4500.00"
}
```

**Sêmen:**
```json
{
  "nomeTouro": "GUADALUPE IDEAL",
  "rgTouro": "A3139",
  "raca": "Nelore",
  "quantidadeDoses": "100",
  "valorUnitario": "45.00",
  "botijao": "B001",
  "caneca": "C001",
  "certificado": "CERT123",
  "dataValidade": "2025-12-31"
}
```

**Embrião:**
```json
{
  "doadora": "Vaca 123",
  "touro": "Touro Elite",
  "raca": "Angus",
  "quantidadeEmbrioes": "10",
  "valorUnitario": "800.00",
  "tipoEmbriao": "in_vitro",
  "qualidade": "A",
  "dataColeta": "2024-10-01"
}
```

---

## 🔗 Integrações Automáticas

### Entrada de Sêmen → Estoque de Sêmen
Quando uma NF de entrada de sêmen é cadastrada:
- ✅ Itens são automaticamente adicionados ao estoque
- ✅ Doses disponíveis = Quantidade cadastrada
- ✅ Rastreabilidade por número da NF
- ✅ Localização salva (botijão/caneca)

### Entrada de Bovinos → Animais
Quando uma NF de entrada de bovinos é cadastrada:
- ✅ Animais são adicionados ao sistema
- ✅ Valor de compra registrado
- ✅ Origem = Fornecedor da NF
- ✅ Data de entrada = Data da NF
- ✅ Número da NF vinculado

---

## 📊 Estatísticas e Relatórios

### Dashboard Principal
- **Total de Entradas** - Quantidade e valor
- **Total de Saídas** - Quantidade e valor
- **Por Tipo de Produto** - Distribuição (bovinos, sêmen, embriões)
- **Saldo** - Diferença entre saídas e entradas

### Filtros Disponíveis
- Tipo de operação (entrada/saída)
- Tipo de produto
- Período (últimos 7, 30, 90 dias, ano, todos)
- Busca por texto (NF, fornecedor, destino)

---

## 🎨 Interface

### Cores por Tipo
- 🟢 **Entrada** - Verde
- 🔵 **Saída** - Azul
- 🟣 **Bovino** - Verde claro
- 🟣 **Sêmen** - Roxo
- 🔵 **Embrião** - Índigo

### Ícones
- 📥 Entrada
- 📤 Saída
- 🐄 Bovino
- 🧬 Sêmen
- 🧫 Embrião

---

## 🔐 Validações

### Campos Obrigatórios

**Dados da NF:**
- Número da NF
- Data
- Fornecedor (entrada) ou Destino (saída)
- Natureza da Operação

**Bovino:**
- Tatuagem
- Sexo
- Era
- Valor Unitário

**Sêmen:**
- Nome do Touro
- Quantidade de Doses
- Valor Unitário/Dose

**Embrião:**
- Doadora
- Touro
- Quantidade de Embriões
- Valor Unitário

### Validações Automáticas
- ✅ Deve ter pelo menos 1 item
- ✅ Valores numéricos devem ser válidos
- ✅ Datas devem ser válidas
- ✅ Cálculos automáticos de totais

---

## 📱 Menu de Navegação

### Localização
```
Menu Principal
  └─ 📋 Notas Fiscais
      └─ Gerenciar NFs
```

### Acesso Rápido
- Dashboard principal → Card "Notas Fiscais"
- Busca global (Ctrl+K) → "notas fiscais"
- URL direta: `/notas-fiscais`

---

## 💡 Dicas e Boas Práticas

### Para Entrada de Sêmen
1. ✅ Sempre preencha o botijão e caneca para facilitar localização
2. ✅ Registre o certificado para rastreabilidade
3. ✅ Defina data de validade para controle de vencimento
4. ✅ Use o padrão de nomenclatura dos touros (ex: NOME RGTOURO)

### Para Entrada de Bovinos
1. ✅ Use tatuagens únicas e consistentes
2. ✅ Registre o peso de entrada quando possível
3. ✅ Especifique bem a era (facilita análises futuras)
4. ✅ Informe a raça para relatórios

### Para Embriões
1. ✅ Registre sempre doadora e touro (rastreabilidade genética)
2. ✅ Classifique a qualidade (A, B, C)
3. ✅ Defina o tipo (FIV/TE, fresco/congelado)
4. ✅ Data de coleta importante para controle

### Organização
- 📝 Use observações para informações adicionais
- 🔢 Mantenha numeração sequencial de NFs
- 📅 Cadastre NFs logo após a operação
- 🔍 Use filtros para análises específicas

---

## 🚀 Melhorias Futuras

### Em Desenvolvimento
- [ ] Impressão de NFs
- [ ] Exportação para Excel/PDF
- [ ] Gráficos de evolução mensal
- [ ] Alertas de vencimento (sêmen/embriões)
- [ ] Integração com SEFAZ
- [ ] Importação de XML de NF-e

### Sugestões
- [ ] Relatórios fiscais automatizados
- [ ] Dashboard de custos por tipo
- [ ] Comparativo mensal/anual
- [ ] Tags personalizadas para NFs
- [ ] Anexos de documentos

---

## 📞 Suporte

### Em Caso de Problemas

1. **Verifique o banco de dados:**
   ```bash
   node scripts/migrate-nf-system.js
   ```

2. **Verifique as tabelas:**
   ```sql
   SELECT * FROM notas_fiscais LIMIT 5;
   SELECT * FROM notas_fiscais_itens LIMIT 5;
   ```

3. **Limpe o cache do navegador**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

---

## 📝 Changelog

### Versão 1.0.0 (Outubro 2024)
- ✅ Sistema completo de Notas Fiscais
- ✅ Suporte para Bovinos, Sêmen e Embriões
- ✅ Entrada e Saída
- ✅ Dashboard com estatísticas
- ✅ Filtros avançados
- ✅ Integração automática com estoque de sêmen
- ✅ Integração automática com cadastro de animais
- ✅ Menu de navegação atualizado
- ✅ APIs completas (CRUD)
- ✅ Banco de dados otimizado

---

## 🎯 Conclusão

O Sistema de Notas Fiscais do Beef Sync oferece controle completo e profissional de todas as movimentações da fazenda, com:

✨ **Interface Intuitiva** - Fácil de usar
🔄 **Integração Automática** - Com estoque e animais
📊 **Relatórios em Tempo Real** - Estatísticas atualizadas
🎨 **Design Moderno** - Visual limpo e organizado
💾 **Banco Robusto** - PostgreSQL com JSONB
🔍 **Filtros Poderosos** - Encontre qualquer NF rapidamente

---

**Desenvolvido com ❤️ para o Beef Sync**

