# Correção: Erro ao Inativar Animal + Botão de Reativar

## ✅ PROBLEMA RESOLVIDO

O botão "Marcar como Inativo" estava retornando erro 500 ao tentar inativar um animal.

## ✨ NOVA FUNCIONALIDADE ADICIONADA

Adicionado botão "Reativar Animal" que aparece quando o animal está inativo, permitindo reativá-lo facilmente.

## 🔍 Causa do Problema

O banco de dados PostgreSQL tinha uma constraint (restrição) na coluna `situacao` da tabela `animais` que só permitia os seguintes valores:
- Ativo
- Vendido
- Morto
- Transferido

O valor **"Inativo"** não estava na lista de valores permitidos, causando o erro:
```
a nova linha da relação "animais" viola a restrição de verificação "animais_situacao_check"
```

## 🔧 Solução Aplicada

Adicionado o valor "Inativo" à constraint do banco de dados:

```sql
ALTER TABLE animais DROP CONSTRAINT IF EXISTS animais_situacao_check;

ALTER TABLE animais 
ADD CONSTRAINT animais_situacao_check 
CHECK (situacao IN ('Ativo', 'Vendido', 'Morto', 'Transferido', 'Inativo'));
```

## ✅ Valores Permitidos Agora

A coluna `situacao` agora aceita os seguintes valores:
1. **Ativo** - Animal ativo no rebanho
2. **Vendido** - Animal vendido
3. **Morto** - Animal morto
4. **Transferido** - Animal transferido
5. **Inativo** - Animal inativo (novo)

## 🎯 Como Usar

### Inativar Animal:
1. Acesse a tela de detalhes de qualquer animal ATIVO
2. Clique no botão laranja "Marcar como Inativo"
3. Confirme a ação
4. O animal será marcado como Inativo

### Reativar Animal:
1. Acesse a tela de detalhes de um animal INATIVO
2. Clique no botão verde "Reativar Animal" (com ícone de seta circular)
3. Confirme a ação
4. O animal será marcado como Ativo novamente

## 💡 Comportamento dos Botões

- **Botão "Marcar como Inativo"** (laranja): Aparece apenas quando o animal NÃO está inativo
- **Botão "Reativar Animal"** (verde): Aparece apenas quando o animal está inativo
- Os botões são mutuamente exclusivos (apenas um aparece por vez)

## 📊 Teste Realizado

Testado com sucesso no animal M290 (ID: 1631):

### Teste 1 - Inativação:
- Status antes: Ativo
- Status depois: Inativo
- Resposta da API: 200 OK
- Atualização no banco: Confirmada

### Teste 2 - Reativação:
- Status antes: Inativo
- Status depois: Ativo
- Resposta da API: 200 OK
- Atualização no banco: Confirmada

✅ Ambos os testes passaram com sucesso!

## 🔄 Impacto

- ✅ Botão "Marcar como Inativo" agora funciona
- ✅ Botão "Reativar Animal" adicionado
- ✅ Animais podem ser marcados como inativos
- ✅ Animais inativos podem ser reativados
- ✅ Interface intuitiva com botões contextuais
- ✅ Não afeta animais existentes
- ✅ Compatível com todas as funcionalidades existentes

## 📝 Arquivos Criados/Modificados

### Criados:
- `verificar-constraint-situacao.js` - Script para verificar constraint
- `adicionar-inativo-constraint.js` - Script que corrigiu o problema
- `testar-inativar-animal.js` - Script de teste de inativação
- `testar-reativar-animal.js` - Script de teste completo (inativar + reativar)

### Modificados:
- `pages/animals/[id].js` - Adicionado botão "Reativar Animal"

## ⚠️ Nota Importante

Se você restaurar um backup antigo do banco de dados, será necessário executar novamente o script `adicionar-inativo-constraint.js` para adicionar o valor "Inativo" à constraint.
