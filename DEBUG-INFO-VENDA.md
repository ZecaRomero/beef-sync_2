# Debug - Informações de Venda do Animal

## Status Atual

Adicionei logs de debug extensivos na função `carregarInfoVenda()` no arquivo `pages/animals/[id].js`.

## O que foi descoberto

Testei o banco de dados e confirmei que:

1. ✅ O animal CJCJ-16406 (ID: 467) existe e está com situação "Vendido"
2. ✅ Existe uma NF de saída (NF 4396) com este animal
3. ✅ A NF contém os dados:
   - Número: 4396
   - Data: 06/02/2026
   - Destino: REINALDO TREVISAN
   - Valor: R$ 12.000,00
   - Tatuagem do item: "CJCJ16406" (sem espaço ou traço)

## Problema Identificado

A tabela `animais` NÃO possui as colunas:
- `valor_venda`
- `nf_saida`
- `destino`
- `data_venda`

Portanto, a função `carregarInfoVenda()` deve buscar os dados nas Notas Fiscais.

## Logs Adicionados

Adicionei console.log em todos os pontos críticos da função:
- 🔍 Início da busca
- ✅ Quando encontra dados no animal
- ⚠️ Quando não encontra e vai buscar nas NFs
- 📡 Resposta da API de NFs
- 📋 Total de NFs encontradas
- 🔍 Verificação de cada NF e seus itens
- ✅ Quando encontra match
- ❌ Quando não encontra nenhuma NF

## Próximos Passos

Para descobrir por que os dados não estão aparecendo:

1. **Abra o navegador** e acesse a página do animal: `http://localhost:3000/animals/467`

2. **Abra o Console do Navegador** (F12 → Console)

3. **Procure pelos logs** que começam com os emojis:
   - 🔍 carregarInfoVenda - Iniciando busca
   - ✅ ou ⚠️ indicando o caminho seguido
   - 📋 Total de NFs encontradas
   - 🔍 Verificando cada NF
   - ✅ MATCH ENCONTRADO (se encontrar)
   - ❌ Nenhuma NF encontrada (se não encontrar)

4. **Copie todos os logs** e me envie para análise

## Possíveis Causas

Se os logs mostrarem que:

### A) "Nenhuma NF de saída encontrada"
- A API `/api/notas-fiscais?tipo=saida` não está retornando dados
- Verificar se o servidor está rodando
- Verificar se a API está funcionando

### B) "NF encontrada mas nenhum item corresponde"
- O formato da tatuagem pode estar diferente
- O animalId pode não estar sendo salvo corretamente
- A lógica de matching precisa ser ajustada

### C) "Erro ao buscar NF"
- Problema de conexão com a API
- Erro no formato da resposta

## Teste Manual da API

Você também pode testar a API diretamente:

```bash
# Testar lista de NFs de saída
node test-nf-animal-467.js

# Ou via navegador
http://localhost:3000/api/notas-fiscais?tipo=saida
http://localhost:3000/api/notas-fiscais/2
```

## Arquivos Modificados

- `pages/animals/[id].js` - Adicionados logs de debug na função `carregarInfoVenda()`
- `test-nf-animal-467.js` - Script de teste para verificar dados no banco

## Solução Temporária

Se quiser ver os dados imediatamente enquanto debugamos, posso:

1. Adicionar as colunas `valor_venda`, `nf_saida`, `destino`, `data_venda` na tabela `animais`
2. Criar um script para popular esses campos a partir das NFs existentes
3. Assim os dados aparecerão imediatamente

Mas a solução ideal é fazer a busca nas NFs funcionar corretamente.
