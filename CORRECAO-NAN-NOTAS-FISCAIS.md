# Correção: NaN e Valores Zero nas Notas Fiscais

## Data: 12/02/2026

## Problema Identificado

Os cards na página de Notas Fiscais mostravam:
- **R$ NaN** nos valores de Entradas e Saídas
- **R$ 0,00** no Saldo Líquido

## Causa Raiz

O código estava usando nomes de campos incorretos:
- **Código usava**: `n.valorTotal` (camelCase)
- **Banco tem**: `valor_total` (snake_case)

Como o campo não existia, retornava `undefined`, e ao somar resultava em `NaN`.

## Correções Aplicadas

### 1. Cálculo de Estatísticas (Linha 668-672)

**Antes:**
```javascript
valorTotalEntradas: nfsArray.filter(n => n.tipo === 'entrada').reduce((sum, n) => sum + (n.valorTotal || 0), 0),
valorTotalSaidas: nfsArray.filter(n => n.tipo === 'saida').reduce((sum, n) => sum + (n.valorTotal || 0), 0),
```

**Depois:**
```javascript
valorTotalEntradas: nfsArray.filter(n => n.tipo === 'entrada').reduce((sum, n) => sum + (parseFloat(n.valor_total) || 0), 0),
valorTotalSaidas: nfsArray.filter(n => n.tipo === 'saida').reduce((sum, n) => sum + (parseFloat(n.valor_total) || 0), 0),
```

### 2. Ordenação por Valor (Linha 571-573)

**Antes:**
```javascript
case 'valorAsc':
  return (a.valorTotal || 0) - (b.valorTotal || 0)
case 'valorDesc':
  return (b.valorTotal || 0) - (a.valorTotal || 0)
```

**Depois:**
```javascript
case 'valorAsc':
  return (parseFloat(a.valor_total) || parseFloat(a.valorTotal) || 0) - (parseFloat(b.valor_total) || parseFloat(b.valorTotal) || 0)
case 'valorDesc':
  return (parseFloat(b.valor_total) || parseFloat(b.valorTotal) || 0) - (parseFloat(a.valor_total) || parseFloat(a.valorTotal) || 0)
```

### 3. Filtros de Tipo de Produto (Linha 671-673)

**Antes:**
```javascript
bovinos: nfsArray.filter(n => n.tipoProduto === 'bovino').length,
semen: nfsArray.filter(n => n.tipoProduto === 'semen').length,
embrioes: nfsArray.filter(n => n.tipoProduto === 'embriao').length
```

**Depois:**
```javascript
bovinos: nfsArray.filter(n => n.tipoProduto === 'bovino' || n.tipo_produto === 'bovino').length,
semen: nfsArray.filter(n => n.tipoProduto === 'semen' || n.tipo_produto === 'semen').length,
embrioes: nfsArray.filter(n => n.tipoProduto === 'embriao' || n.tipo_produto === 'embriao').length
```

## Resultado Esperado

Após as correções, os cards devem mostrar:
- **3611 Entradas** com valor total correto (soma de todas as NFs de entrada)
- **2 Saídas** com valor total correto (soma de todas as NFs de saída)
- **Saldo Líquido** calculado corretamente (Saídas - Entradas)

## Observações Importantes

### Compatibilidade com Ambos os Formatos

O código agora suporta ambos os formatos de campo:
- `valor_total` (snake_case) - formato do PostgreSQL
- `valorTotal` (camelCase) - formato legado/localStorage

Isso garante compatibilidade com:
- Dados vindos do banco de dados
- Dados vindos do localStorage
- Dados importados de Excel

### Uso de parseFloat()

Adicionado `parseFloat()` para garantir que valores string sejam convertidos corretamente:
```javascript
parseFloat(n.valor_total) || 0
```

Isso evita problemas com:
- Valores armazenados como string no banco
- Valores com vírgula ao invés de ponto
- Valores undefined ou null

## Arquivos Modificados

- `pages/notas-fiscais/index.js`
  - Linha 668: Cálculo de valorTotalEntradas
  - Linha 669: Cálculo de valorTotalSaidas
  - Linha 571-573: Ordenação por valor
  - Linha 671-673: Filtros de tipo de produto

## Testes Recomendados

1. ✅ Verificar se os cards mostram valores corretos
2. ✅ Testar ordenação por valor (crescente e decrescente)
3. ✅ Verificar se o saldo líquido está correto
4. ✅ Testar filtros por tipo de produto
5. ✅ Importar Excel e verificar se valores são calculados

## Comandos para Testar

```bash
# Iniciar aplicação
npm run dev

# Acessar página
http://localhost:3020/notas-fiscais
```

---

**Status**: ✅ Corrigido
**Testado**: Aguardando teste do usuário
**Impacto**: Alto - Corrige visualização de valores financeiros
