# ✅ Garantia: Criação Automática de Animais para Receptoras

## 🎯 Objetivo
SEMPRE criar animais na tabela `animais` quando cadastrar NF de entrada com receptoras, para que apareçam na tela de Animais (igual à M 9775).

## ✅ Implementação Concluída

### 1. Criados os 46 Animais do Marcelo
Script executado: `criar-animais-receptoras-marcelo.js`

Resultado:
- ✅ 46 animais criados com sucesso
- ✅ Todos com série G
- ✅ Números: 355, 338, 354, 342, 353, 368, 334, 366, 339, 363, 11, 3029, 3022, 3007, 2966, 2899, 17, 3008, 2996, 2831, 2978, 2925, 2979, 3016, 2974, 2973, 2908, 2881, 2924, 3036, 3003, 3028, 3032, 2977, 2965, 3040, 3012, 2879, 3027, 2909, 3045, 2915, 2999, 2920, 2934, 2947
- ✅ Fornecedor: MARCELO FORNAZARO MUNOZ GAETA
- ✅ Aparecem na tela de Animais

### 2. Modificada a API para Criar Animais SEMPRE

Arquivo modificado: `pages/api/notas-fiscais/index.js`

#### Mudanças Realizadas:

**ANTES:**
```javascript
if (tipo === 'entrada' && ehReceptoras && receptoraLetra && receptoraNumero && dataTEFormatada && itens && Array.isArray(itens) && itens.length > 0) {
```

**DEPOIS:**
```javascript
if (tipo === 'entrada' && ehReceptoras && itens && Array.isArray(itens) && itens.length > 0) {
```

**Resultado:** Agora cria animais SEMPRE que for NF de entrada com receptoras, mesmo sem preencher `receptoraLetra`, `receptoraNumero` ou `dataTE`.

#### Comportamento Atualizado:

1. **Criação de Animais**: SEMPRE (obrigatório)
   - Extrai letra e número da tatuagem
   - Cria animal na tabela `animais`
   - Define sexo como "Fêmea"
   - Define raça (da NF ou "Receptora")
   - Define situação como "Ativo"
   - Salva fornecedor, data de compra, data de chegada

2. **Criação de TE**: OPCIONAL (só se tiver dataTE)
   - Cria registro em `transferencias_embrioes`
   - Vincula ao animal criado

3. **Agendamento de DG**: OPCIONAL (só se tiver dataTE)
   - Cria registro em `inseminacoes`
   - Agenda DG para 15 dias após chegada

4. **Relatório Excel**: OPCIONAL (só se tiver dataTE, letra e número)
   - Gera relatório DG em Excel

## 📋 Fluxo Completo de Cadastro

### Quando Cadastrar NF de Entrada com Receptoras:

1. **Marcar "É Receptoras"**: ✅ Obrigatório
2. **Adicionar Itens com Tatuagens**: ✅ Obrigatório
3. **Preencher Letra/Número/Data TE**: ⚠️ Opcional (mas recomendado)

### O que Acontece Automaticamente:

#### SEMPRE (com ou sem letra/número/dataTE):
- ✅ Salva NF na tabela `notas_fiscais`
- ✅ Salva itens na tabela `notas_fiscais_itens`
- ✅ **CRIA ANIMAIS na tabela `animais`** ← NOVO!
- ✅ Animais aparecem na tela de Animais
- ✅ Animais aparecem na tela de Receptoras DG

#### SOMENTE SE PREENCHER dataTE:
- ✅ Cria TE em `transferencias_embrioes`
- ✅ Agenda DG em `inseminacoes`
- ✅ Gera relatório Excel

## 🔍 Como Verificar

### Na Tela de Animais:
1. Vá em "Animais" no menu
2. Use o filtro de fornecedor
3. Digite "MARCELO"
4. Deve aparecer 46 animais
5. Todos com série G

### Na Tela de Receptoras DG:
1. Vá em "Reprodução" > "Receptoras para DG"
2. Procure pelos lotes do Marcelo
3. Deve aparecer 3 lotes:
   - Lote 1 (NF 229): 18 cabeças
   - Lote 2 (NF 230): 17 cabeças
   - Lote 3 (NF 231): 11 cabeças

## 📊 Dados Salvos no Animal

Quando criar NF de receptoras, cada animal terá:

```javascript
{
  serie: 'G',              // Extraído da tatuagem
  rg: '3032',              // Extraído da tatuagem
  nome: 'G 3032',          // Série + RG
  tatuagem: 'G 3032',      // Tatuagem completa
  sexo: 'Fêmea',           // Sempre fêmea para receptoras
  raca: 'Mestiça',         // Da NF ou "Receptora"
  situacao: 'Ativo',       // Sempre ativo
  data_compra: '2026-01-06', // Data da NF
  fornecedor: 'MARCELO FORNAZARO MUNOZ GAETA',
  data_chegada: '2026-01-08', // Data de chegada (se informada)
  data_dg_prevista: '2026-01-23', // 15 dias após chegada
  numero_nf_entrada: '230' // Número da NF
}
```

## ✅ Garantias

1. **Persistência**: Tudo salvo no PostgreSQL
2. **Duplicidade**: Não cria animal duplicado (verifica por série+RG)
3. **Integridade**: Transações garantem consistência
4. **Visibilidade**: Animais aparecem em todas as telas
5. **Rastreabilidade**: Vínculo com NF mantido

## 🎉 Resultado Final

Agora, SEMPRE que você cadastrar uma NF de entrada com receptoras:
- ✅ Itens salvos em `notas_fiscais_itens`
- ✅ Animais criados em `animais`
- ✅ Aparecem na tela de Animais
- ✅ Aparecem na tela de Receptoras DG
- ✅ Tudo no PostgreSQL

Não precisa mais se preocupar! O sistema faz tudo automaticamente.
