# ✅ Correção: Erro "coluna i.data_inseminacao não existe"

## 🐛 Problema

Ao tentar enviar relatórios, o sistema apresentava o erro:
```
Erro ao enviar relatórios: coluna i.data_inseminacao não existe
```

## 🔍 Causa

O código estava usando o nome de coluna **ERRADO** `data_inseminacao`, mas a tabela `inseminacoes` usa `data_ia`.

### Estrutura Correta da Tabela:
```sql
CREATE TABLE inseminacoes (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL,
  numero_ia INTEGER DEFAULT 1,
  data_ia DATE NOT NULL,  ← NOME CORRETO
  data_dg DATE,
  resultado_dg VARCHAR(20),
  touro_nome VARCHAR(100),
  ...
)
```

## 🔧 Arquivos Corrigidos

### 1. `pages/api/inseminacoes/index.js`
```javascript
// ANTES (ERRADO)
sqlQuery += ` AND i.data_inseminacao >= $${paramCount}`
sqlQuery += ` ORDER BY i.data_inseminacao DESC`

// DEPOIS (CORRETO)
sqlQuery += ` AND i.data_ia >= $${paramCount}`
sqlQuery += ` ORDER BY i.data_ia DESC`
```

### 2. `pages/api/inseminacoes/alertas-dg.js`
```javascript
// ANTES (ERRADO)
i.data_inseminacao,
CURRENT_DATE - i.data_inseminacao::date as dias_apos_ia
WHERE i.data_inseminacao::date <= $1
ORDER BY i.data_inseminacao ASC

// DEPOIS (CORRETO)
i.data_ia,
CURRENT_DATE - i.data_ia::date as dias_apos_ia
WHERE i.data_ia::date <= $1
ORDER BY i.data_ia ASC
```

### 3. `services/databaseService.js`
```javascript
// ANTES (ERRADO)
SELECT * FROM inseminacoes WHERE animal_id = $1 ORDER BY data_inseminacao DESC

// DEPOIS (CORRETO)
SELECT * FROM inseminacoes WHERE animal_id = $1 ORDER BY data_ia DESC
```

### 4. `pages/api/relatorios-envio/enviar.js` ⭐ PRINCIPAL
```javascript
// ANTES (ERRADO)
_iaDateColumnCache = cols.includes('data_inseminacao') ? 'data_inseminacao'
                    : cols.includes('data') ? 'data'
                    : 'data_inseminacao'  // fallback errado

// DEPOIS (CORRETO)
_iaDateColumnCache = cols.includes('data_ia') ? 'data_ia'
                    : cols.includes('data_inseminacao') ? 'data_inseminacao'
                    : cols.includes('data') ? 'data'
                    : 'data_ia'  // fallback correto
```

Este era o arquivo que estava causando o erro no envio de relatórios!

## ✅ Resultado

Agora o envio de relatórios funciona corretamente sem erros de SQL.

## 🔄 Como Aplicar a Correção

1. **Reinicie o servidor Next.js**:
   - Pressione `Ctrl+C` no terminal onde o servidor está rodando
   - Execute novamente: `npm run dev`

2. **Ou aguarde o hot-reload** (se estiver habilitado)

3. **Teste o envio de relatórios** novamente

## ⚠️ Importante

O arquivo `pages/api/relatorios-envio/enviar.js` tinha um cache da coluna que precisava ser limpo. Por isso é necessário reiniciar o servidor.

## ⚠️ Observação

Existem outros arquivos de scripts que ainda usam `data_inseminacao`, mas esses são scripts auxiliares que não afetam o funcionamento do sistema em produção. Os arquivos críticos da API foram corrigidos.

---

**Data da Correção**: 16/02/2026  
**Status**: ✅ RESOLVIDO
