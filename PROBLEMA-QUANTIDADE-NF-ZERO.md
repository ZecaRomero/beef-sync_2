# Problema: Quantidade Zero nas Notas Fiscais

## Data: 12/02/2026

## Problema Identificado

A exportação Excel de Notas Fiscais mostra quantidade 0 para a maioria das NFs, mesmo quando há animais cadastrados.

## Diagnóstico

### Situação Atual no Banco de Dados

De 3613 notas fiscais no banco:
- ✅ **3 NFs** têm itens na tabela `notas_fiscais_itens` (2141, 050.558.282, 2076)
- ⚠️  **3610 NFs** NÃO têm itens em lugar nenhum

### NFs com Itens (Funcionando Corretamente)

1. **NF 2141** - 19 fêmeas (R$ 31.730,00)
2. **NF 050.558.282** - 20 fêmeas (R$ 140.290,20)
3. **NF 2076** - 43 fêmeas (R$ 71.810,00)

### NFs sem Itens (Problema)

Exemplos de NFs que aparecem no Excel mas com quantidade 0:
- NF 4397 (Saída) - R$ 12.000,00
- NF 4396 (Saída) - R$ 12.000,00
- NF 050529639 (Entrada) - R$ 134.441,91
- NF 231 (Entrada) - R$ 77.771,54
- NF 229 (Entrada) - R$ 127.262,52
- NF 26650993 (Entrada) - R$ 73.250,00
- NF 243 (Entrada) - R$ 16.565,00

## Causa Raiz

O sistema tem dois lugares para armazenar itens de NF:
1. **Tabela separada**: `notas_fiscais_itens` (recomendado)
2. **Campo JSONB**: `notas_fiscais.itens` (legado)

A API de exportação tenta buscar de ambos, mas a maioria das NFs antigas não tem itens em nenhum dos dois lugares.

## Possíveis Causas

### 1. NFs Antigas (Antes da Implementação da Tabela Separada)
- Foram cadastradas quando o sistema usava apenas localStorage
- Nunca foram migradas para o PostgreSQL

### 2. NFs de Saída sem Itens Detalhados
- Algumas NFs de saída podem ter sido cadastradas apenas com valor total
- Sem detalhar os animais vendidos

### 3. Animais Cadastrados Diretamente
- Animais podem ter sido cadastrados diretamente na tabela `animais`
- Sem passar pela NF (entrada manual)

## Soluções Propostas

### Solução 1: Buscar Animais pela NF (Recomendado)

Modificar a API para buscar animais que têm a NF vinculada:

```sql
SELECT COUNT(*) as quantidade
FROM animais
WHERE nota_fiscal_entrada = '2141'
  OR nota_fiscal_saida = '2141'
```

Isso funcionaria se os animais tiverem o campo `nota_fiscal_entrada` ou `nota_fiscal_saida` preenchido.

### Solução 2: Recadastrar Itens das NFs

Para NFs importantes, recadastrar os itens manualmente através da interface.

### Solução 3: Migração do localStorage

Se os dados ainda estiverem no localStorage do navegador, usar o script `sincronizar-localStorage.js` para migrar.

## Próximos Passos

1. ✅ Verificar se animais têm campo `nota_fiscal_entrada`/`nota_fiscal_saida`
2. ✅ Modificar API para buscar quantidade de animais pela NF
3. ✅ Testar exportação novamente
4. ⚠️  Decidir se vale a pena recadastrar NFs antigas

## Arquivos Relacionados

- `pages/api/contabilidade/notas-fiscais.js` - API de exportação
- `verificar-nf-quantidade.js` - Script de diagnóstico
- `migrar-itens-nf.js` - Script de migração (não funcionou pois campo está vazio)

## Comandos Úteis

```bash
# Verificar quantidades
node verificar-nf-quantidade.js

# Tentar migrar itens (não funciona se campo está vazio)
node migrar-itens-nf.js
```

---

**Status**: 🔍 Diagnosticado - Aguardando decisão sobre solução
**Impacto**: Alto - Afeta relatórios de entrada/saída
**Prioridade**: Alta
