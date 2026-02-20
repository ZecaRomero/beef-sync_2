# Remoção de Genealogia para Receptoras (Raça Mestiça)

## ✅ MODIFICAÇÃO CONCLUÍDA

A seção de genealogia (Pai, Mãe, Avô Materno) e genética (iABCZg, DECA) foi removida da tela de detalhes de animais com raça "Mestiça" ou "Receptora".

## 📋 O que foi alterado

### Arquivo modificado:
- `pages/animals/[id].js`

### Mudanças realizadas:

1. **Adicionada função auxiliar `extrairSerieRG`**
   - Extrai série e RG de strings formatadas
   - Usada para formatar nomes de mães

2. **Reorganizada estrutura condicional**
   - Agora a verificação de raça acontece ANTES de mostrar genealogia
   - Se raça = "Mestiça" ou "Receptora": mostra informações de receptora
   - Se raça = outra: mostra genealogia e genética

3. **Para Receptoras (Raça Mestiça), agora mostra:**
   - ✅ NF de Origem
   - ✅ Data de Chegada (com contador de dias)
   - ✅ Data da TE (com contador de dias)
   - ✅ Data do DG (com badge Prenha/Vazia)
   - ✅ Previsão de Parto (9 meses após TE, formatado por extenso)
   - ✅ Veterinário do DG
   - ❌ NÃO mostra: Pai, Mãe, Avô Materno, iABCZg, DECA

4. **Para outros animais, mostra:**
   - ✅ Pai
   - ✅ Mãe
   - ✅ Mãe (Série/RG)
   - ✅ Avô Materno
   - ✅ Receptora
   - ✅ iABCZg
   - ✅ DECA

## 🎯 Como funciona

A tela detecta automaticamente se o animal é uma receptora verificando se a raça contém:
- "mestiça" (case insensitive)
- "mestica" (case insensitive)
- "receptora" (case insensitive)

Se for receptora, exibe informações específicas de reprodução.
Se não for, exibe genealogia e genética tradicionais.

## 📊 Exemplo de Receptora

Para a M 1815 (e as outras 18 receptoras da NF #2141), a tela agora mostra:

```
Informações de Receptora
├── NF de Origem: 2141
├── Data de Chegada: 11/02/2026 (há X dias)
├── Data da TE: 27/11/2025 (há X dias)
├── Data do DG: [Pendente ou data] [Badge: Prenha/Vazia]
├── Previsão de Parto: 27 de agosto de 2026
└── Veterinário DG: [nome do veterinário]
```

## ✨ Benefícios

1. Interface mais limpa e relevante para receptoras
2. Informações específicas de reprodução em destaque
3. Cálculos automáticos de dias e previsões
4. Visual diferenciado com cores e ícones
5. Mantém genealogia completa para animais de produção

## 🔄 Compatibilidade

- ✅ Funciona com dados existentes
- ✅ Não quebra animais sem raça definida
- ✅ Suporta variações de escrita (mestiça, mestica, receptora)
- ✅ Sem erros de sintaxe ou diagnóstico
