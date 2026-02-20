# Diagnóstico: DG Não Está Salvando

## 🔍 Problema Relatado
Ao lançar o DG da receptora 8251:
- ❌ Não atualiza a situação reprodutiva
- ❌ Card continua mostrando "Aguardando DG"
- ❌ Dados não aparecem salvos no banco

## ✅ Verificações Realizadas

### 1. Banco de Dados
```sql
SELECT data_dg, veterinario_dg, resultado_dg 
FROM animais 
WHERE rg = '8251'
```
**Resultado**: Todos os campos estão NULL (não foi salvo)

### 2. Teste Manual de UPDATE
```javascript
// Teste direto no banco funcionou perfeitamente
UPDATE animais 
SET data_dg = '2026-02-19', 
    veterinario_dg = 'Dr. Teste', 
    resultado_dg = 'Prenha'
WHERE id = 1658
```
**Resultado**: ✅ Funcionou - O banco está OK

### 3. API lancar-dg-batch.js
- ✅ Código está correto
- ✅ Lógica de UPDATE está correta
- ❓ Precisa verificar se está recebendo os dados corretos

## 🐛 Possíveis Causas

### Causa 1: Payload Incorreto
O frontend pode estar enviando dados vazios ou incorretos:
```javascript
{
  animalId: 1658,
  letra: '',  // ← Pode estar vazio
  numero: '', // ← Pode estar vazio
  resultadoDG: 'Prenha',
  observacoes: ''
}
```

### Causa 2: animalId Não Está Sendo Enviado
Se `animalId` for null e `letra/numero` estiverem vazios, a API não consegue identificar o animal.

### Causa 3: Erro Silencioso
A API pode estar retornando erro mas o frontend não está mostrando.

## 🔧 Soluções Implementadas

### 1. Logs Adicionados na API
```javascript
console.log('📥 Dados recebidos na API lancar-dg-batch:');
console.log('Data DG:', dataDG);
console.log('Veterinário:', veterinario);
console.log('Receptoras:', JSON.stringify(receptoras, null, 2));
```

### 2. Logs Adicionados no Frontend
```javascript
console.log('📤 Payload da receptora:', receptoraPayload);
console.log('📤 Payload completo:', { dataDG, veterinario, receptoras: payload });
```

### 3. Fallback para RG/Série
```javascript
letra: r.letra || r.serie,
numero: r.numero || r.rg,
```

## 📋 Como Testar

### Passo 1: Abrir Console do Navegador
1. Pressione F12
2. Vá na aba "Console"

### Passo 2: Lançar DG Novamente
1. Busque a receptora 8251
2. Selecione ela
3. Preencha data e veterinário
4. Clique em "Salvar Lote"

### Passo 3: Verificar Logs
No console do navegador, procure por:
```
📤 Payload da receptora: {...}
📤 Payload completo: {...}
```

No terminal do servidor (onde o Next.js está rodando), procure por:
```
📥 Dados recebidos na API lancar-dg-batch:
🔄 Processando receptora M8251:
✅ DG atualizado com sucesso!
```

### Passo 4: Verificar no Banco
```bash
node verificar-dg-8251.js
```

## 🎯 Próximos Passos

1. ✅ Verificar logs do console do navegador
2. ✅ Verificar logs do terminal do servidor
3. ✅ Identificar se o payload está correto
4. ✅ Corrigir o problema identificado
5. ✅ Testar novamente

## 📊 Estrutura de Dados Esperada

### Frontend → API
```json
{
  "dataDG": "2026-02-19",
  "veterinario": "Dr. João",
  "receptoras": [
    {
      "animalId": 1658,
      "letra": "M8251",
      "numero": "8251",
      "resultadoDG": "Prenha",
      "observacoes": "",
      "lote": 1
    }
  ]
}
```

### API → Banco
```sql
UPDATE animais 
SET 
  data_dg = '2026-02-19',
  veterinario_dg = 'Dr. João',
  resultado_dg = 'Prenha',
  observacoes_dg = '',
  updated_at = NOW()
WHERE id = 1658
```

## 🔍 Arquivos Modificados

- `pages/api/receptoras/lancar-dg-batch.js` - Adicionados logs
- `pages/reproducao/receptoras-dg.js` - Adicionados logs e fallback

## 🧪 Scripts de Teste Criados

- `verificar-dg-8251.js` - Verifica se DG foi salvo
- `testar-lancar-dg-8251.js` - Testa UPDATE direto no banco
- `verificar-estrutura-inseminacoes.js` - Verifica estrutura da tabela

---

**Data**: 19/02/2026  
**Status**: 🔍 Em Diagnóstico - Aguardando logs do próximo teste
