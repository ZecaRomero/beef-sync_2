# Correção do Erro "Erro ao atualizar sêmen"

## Problema Identificado
O sistema estava apresentando o erro "Erro ao atualizar sêmen: Erro ao atualizar sêmen" ao tentar salvar alterações no estoque de sêmen.

## Causa do Problema
1. **Erro de sintaxe SQL**: A função `atualizarSemen` estava gerando queries SQL malformadas com placeholders incorretos
2. **Falta de mapeamento de campos**: Não havia mapeamento adequado entre os campos do frontend (camelCase) e do banco (snake_case)
3. **Tratamento inadequado de valores**: Campos numéricos e datas não estavam sendo tratados corretamente
4. **Falta de tratamento de erros**: Não havia fallback para estruturas de banco antigas

## Correções Aplicadas

### 1. Correção da Sintaxe SQL
**Antes:**
```javascript
campos.push(`${campoBanco} = ${++paramCount}`);
```

**Depois:**
```javascript
campos.push(`${campoBanco} = $${++paramCount}`);
```

### 2. Mapeamento de Campos
Adicionado mapeamento completo entre frontend e banco:
```javascript
const mapeamentoCampos = {
  'nomeTouro': 'nome_touro',
  'rgTouro': 'rg_touro',
  'raca': 'raca',
  'localizacao': 'localizacao',
  'rackTouro': 'rack_touro',
  'botijao': 'botijao',
  'caneca': 'caneca',
  'tipoOperacao': 'tipo_operacao',
  'fornecedor': 'fornecedor',
  'destino': 'destino',
  'numeroNF': 'numero_nf',
  'valorCompra': 'valor_compra',
  'dataCompra': 'data_compra',
  'quantidadeDoses': 'quantidade_doses',
  'dosesDisponiveis': 'doses_disponiveis',
  'dosesUsadas': 'doses_usadas',
  'certificado': 'certificado',
  'dataValidade': 'data_validade',
  'origem': 'origem',
  'linhagem': 'linhagem',
  'observacoes': 'observacoes',
  'status': 'status'
};
```

### 3. Tratamento de Valores
Adicionado tratamento específico para diferentes tipos de dados:
```javascript
// Tratar valores especiais
if (campo === 'dataValidade' && (!valor || valor.trim() === '')) {
  valores.push(null);
} else if (['valorCompra', 'quantidadeDoses', 'dosesDisponiveis', 'dosesUsadas'].includes(campo)) {
  valores.push(parseFloat(valor) || 0);
} else {
  valores.push(valor);
}
```

### 4. Tratamento de Erros e Compatibilidade
Adicionado try/catch com fallback para estruturas antigas:
```javascript
try {
  // Tentar com estrutura nova
  const result = await query(/* ... */);
  return result.rows[0];
} catch (error) {
  // Se falhar com estrutura nova, tentar com estrutura antiga
  if (error.code === '42703') {
    console.log('🔄 Tentando atualizar com estrutura antiga...');
    // Lógica de fallback
  } else {
    throw error;
  }
}
```

### 5. Validações Adicionais
- Verificação se há campos para atualizar
- Verificação se o registro foi encontrado
- Mensagens de erro mais específicas

## Resultado
✅ O erro "Erro ao atualizar sêmen" foi corrigido
✅ Sistema agora suporta tanto estruturas de banco novas quanto antigas
✅ Melhor tratamento de tipos de dados
✅ Mensagens de erro mais informativas
✅ Compatibilidade com diferentes formatos de campo

## Teste Realizado
Foi criado um teste que simula a atualização de um registro de sêmen, confirmando que:
- Os campos são mapeados corretamente
- A query SQL é gerada corretamente
- Os valores são tratados adequadamente
- Os placeholders SQL estão corretos

O sistema agora deve funcionar corretamente ao salvar alterações no estoque de sêmen.