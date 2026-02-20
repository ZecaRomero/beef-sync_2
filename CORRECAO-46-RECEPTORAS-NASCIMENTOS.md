# Correção: 46 Receptoras GESTANTES Registradas em Nascimentos

## Problema Identificado

As 46 receptoras com DG positivo (PRENHAS/GESTANTES) não estavam aparecendo no menu **Reprodução > Nascimentos**, apesar de terem o diagnóstico de gestação registrado corretamente.

⚠️ **IMPORTANTE**: Estas receptoras estão GESTANTES - ainda vão parir. Não são nascimentos que já ocorreram!

## Causa Raiz

Foram identificados 3 problemas principais:

### 1. Schema Incompatível no Batch DG
O código em `pages/api/receptoras/lancar-dg-batch.js` estava tentando inserir registros usando um schema antigo da tabela `nascimentos` (com campos como `receptora`, `doador`, `prev_parto`, `status`, etc.), mas a tabela foi atualizada para um novo schema (com campos `serie`, `rg`, `sexo`, `data_nascimento`).

### 2. Falta de data_te
As 46 receptoras não tinham `data_te` (data da Transferência de Embrião) cadastrada nas notas fiscais, que é necessária para calcular a data prevista de parto (9 meses após a TE).

### 3. Bug na Função buscarNascimentos
A função `buscarNascimentos` em `services/databaseService.js` não estava aplicando os filtros corretamente, sempre retornando todos os registros independente dos parâmetros passados.

## Soluções Implementadas

### 1. Atualização do Batch DG (`lancar-dg-batch.js`)
```javascript
// ANTES (schema antigo - ERRADO)
INSERT INTO nascimentos (
  receptora, doador, rg, prev_parto, nascimento, tatuagem,
  cc, ps1, ps2, sexo, status, touro, data, observacao,
  tipo_cobertura, custo_dna, descarte, morte
) VALUES (...)

// DEPOIS (schema correto)
INSERT INTO nascimentos (
  serie, rg, sexo, data_nascimento, observacoes
) VALUES (
  $1, $2, 'Fêmea', $3, $4
)
```

### 2. Fallback para data_chegada
Quando `data_te` não está disponível, o sistema agora usa `data_chegada` (data de chegada da receptora) como fallback para calcular a data prevista de parto.

### 3. Correção da Função buscarNascimentos
```javascript
// ANTES (não aplicava filtros)
async buscarNascimentos(filtros = {}) {
  let queryText = 'SELECT * FROM nascimentos';
  const params = [];
  queryText += ' ORDER BY data_nascimento DESC';
  const result = await query(queryText, params);
  return result.rows;
}

// DEPOIS (aplica filtros corretamente)
async buscarNascimentos(filtros = {}) {
  let queryText = 'SELECT * FROM nascimentos';
  const params = [];
  const conditions = [];

  if (filtros.serie) {
    conditions.push(`serie = $${params.length + 1}`);
    params.push(filtros.serie);
  }
  if (filtros.rg) {
    conditions.push(`rg = $${params.length + 1}`);
    params.push(filtros.rg);
  }
  // ... outros filtros

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }
  
  queryText += ' ORDER BY data_nascimento DESC';
  const result = await query(queryText, params);
  return result.rows;
}
```

### 4. Script de Registro Manual
Criado script `registrar-46-prenhas-nascimentos.js` que:
- Busca todas as receptoras com DG positivo
- Usa `data_te` ou `data_chegada` como fallback
- Calcula data prevista de parto (9 meses após TE/chegada)
- Registra no menu Nascimentos usando o schema correto

## Resultado

✅ **46 receptoras GESTANTES registradas com sucesso em Nascimentos**

⚠️ **ATENÇÃO**: Estas receptoras estão PRENHAS - ainda NÃO PARIRAM!

Todas as receptoras agora aparecem no menu **Reprodução > Nascimentos** como GESTANTES com:
- Serie: G
- RG: número da receptora
- Sexo: Fêmea
- Data de Nascimento: **DATA PREVISTA** do parto (9 meses após TE/chegada)
- Observações: informações sobre DG positivo, touro e doadora

## Datas PREVISTAS de Parto (ainda não ocorreram)

- **11 receptoras**: Parto previsto para 07/10/2026
- **17 receptoras**: Parto previsto para 08/10/2026
- **18 receptoras**: Parto previsto para 06/10/2026

📅 **Total: 46 receptoras gestantes aguardando parto**

## Arquivos Modificados

1. `pages/api/receptoras/lancar-dg-batch.js` - Corrigido schema de inserção
2. `services/databaseService.js` - Corrigida função buscarNascimentos
3. `verificar-receptoras-prenhas-nascimentos.js` - Script de verificação
4. `registrar-46-prenhas-nascimentos.js` - Script de registro manual

## Próximos Passos

Para evitar este problema no futuro:

1. **Sempre cadastrar data_te** nas notas fiscais de receptoras
2. **Testar o fluxo completo** de DG após qualquer alteração no schema
3. **Validar** que receptoras prenhas aparecem automaticamente em Nascimentos após o DG

## Verificação

Para verificar que tudo está funcionando:

```bash
node verificar-receptoras-prenhas-nascimentos.js
```

Deve mostrar:
```
✅ Encontradas em Nascimentos: 46
❌ NÃO encontradas em Nascimentos: 0
```

## Observações Importantes

⚠️ **CRÍTICO**: As 46 receptoras estão GESTANTES - ainda vão parir!
- A data mostrada é a **data PREVISTA** de parto (não é nascimento que já ocorreu)
- O sistema calcula automaticamente: data da TE/chegada + 9 meses
- Quando o parto ocorrer, você deve atualizar o registro com os dados reais do bezerro
- O sistema agora usa `data_chegada` como fallback quando `data_te` não está disponível
- Receptoras são sempre registradas como "Fêmea" no menu Nascimentos
