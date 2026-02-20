# 🔍 Problema: Marcelo com 17 Cabeças ao Invés de 46

## 📋 Diagnóstico

### Situação Encontrada
- 3 Notas Fiscais do Marcelo cadastradas (229, 230, 231)
- Apenas 17 cabeças aparecem na tela de Receptoras DG
- Usuário reporta que deveriam ser 46 cabeças

### Análise Detalhada

#### NFs Cadastradas:
1. **NF 229** (ID: 6)
   - Fornecedor: MARCELO FORNAZARO MUNOZ GAETA
   - Data: 06/01/2026
   - É Receptoras: SIM
   - **Itens cadastrados: 0** ❌

2. **NF 230** (ID: 4845)
   - Fornecedor: MARCELO FORNAZARO MUNOZ GAETA
   - Data: 06/01/2026
   - É Receptoras: SIM
   - **Itens cadastrados: 17** ✅
   - Exemplos: G 2996, G 2831, G 2978, G 2925, etc.

3. **NF 231** (ID: 3)
   - Fornecedor: MARCELO FORNAZARO MUNOZ GAETA
   - Data: 07/01/2026
   - É Receptoras: NÃO ⚠️
   - **Itens cadastrados: 0** ❌

### Por Que Aparece Apenas 17?

A tela de Receptoras DG busca dados da tabela `notas_fiscais_itens`:

```sql
SELECT * FROM notas_fiscais_itens
WHERE nota_fiscal_id IN (6, 4845, 3)
```

Resultado:
- NF 229: 0 itens
- NF 230: 17 itens ✅
- NF 231: 0 itens
- **Total: 17 itens**

## 🎯 Causa Raiz

As NFs 229 e 231 foram cadastradas, mas os itens (animais/receptoras) NÃO foram cadastrados na tabela `notas_fiscais_itens`.

## ✅ Soluções

### Opção 1: Cadastrar Itens Manualmente (Recomendado)
1. Abrir a tela de Notas Fiscais
2. Editar NF 229
3. Adicionar os animais/receptoras um por um
4. Repetir para NF 231

### Opção 2: Importação em Lote
Se você tiver uma planilha Excel com os dados:
1. Usar a funcionalidade de importação em lote
2. Selecionar a NF correspondente
3. Importar todos os animais de uma vez

### Opção 3: Script de Migração
Se os dados estão em outro lugar (localStorage, backup, etc.):
1. Criar script para migrar os dados
2. Inserir na tabela `notas_fiscais_itens`

## 📊 Dados Esperados

Se são 46 cabeças no total:
- NF 229: ? cabeças (faltam cadastrar)
- NF 230: 17 cabeças ✅
- NF 231: ? cabeças (faltam cadastrar)
- **Total esperado: 46 cabeças**

Cálculo: 46 - 17 = 29 cabeças faltando

Possível distribuição:
- NF 229: ~15 cabeças
- NF 230: 17 cabeças ✅
- NF 231: ~14 cabeças

## ⚠️ Observações Importantes

1. **NF 231 não está marcada como receptoras**
   - Campo `eh_receptoras = false`
   - Precisa ser alterado para `true` se for receptoras

2. **Quantidade nos itens está zerada**
   - Todos os itens da NF 230 têm `quantidade = 0`
   - Isso não afeta a contagem na tela (conta 1 item = 1 cabeça)
   - Mas pode causar problemas em relatórios

3. **Valores zerados**
   - `valor_unitario = 0`
   - `valor_total = 0`
   - Pode ser intencional ou precisar correção

## 🔧 Próximos Passos

1. **Verificar documentação física das NFs 229 e 231**
   - Quantos animais constam em cada uma?
   - Quais são as tatuagens/brincos?

2. **Cadastrar os itens faltantes**
   - Usar a interface do sistema
   - Ou criar script de importação

3. **Corrigir flag da NF 231**
   - Se for receptoras, marcar `eh_receptoras = true`

4. **Validar total**
   - Após cadastrar, verificar se soma 46 cabeças

## 📝 Comandos Úteis

### Verificar total de itens por NF:
```sql
SELECT 
  nf.numero_nf,
  nf.fornecedor,
  COUNT(i.id) as total_itens
FROM notas_fiscais nf
LEFT JOIN notas_fiscais_itens i ON i.nota_fiscal_id = nf.id
WHERE LOWER(nf.fornecedor) LIKE '%marcelo%'
GROUP BY nf.id, nf.numero_nf, nf.fornecedor
ORDER BY nf.numero_nf
```

### Marcar NF 231 como receptoras:
```sql
UPDATE notas_fiscais
SET eh_receptoras = true
WHERE numero_nf = '231'
```
