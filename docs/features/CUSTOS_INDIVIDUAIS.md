# 💰 Sistema de Custos Individuais por Animal

## 📋 Visão Geral

O Sistema de Custos Individuais permite controlar detalhadamente todos os gastos de cada animal do rebanho, aplicando protocolos automáticos baseados na era e sexo, com regras específicas para DNA.

## 🎯 Funcionalidades Principais

### 1. **Protocolos Automáticos por Era**
- **Machos**: 7 protocolos diferentes (0/7, 7/15, 15/18, 18/22, 22+, 25/36, 36+)
- **Fêmeas**: 7 protocolos diferentes (0/7, 7/12, 12/18, 18/24, 24+, 25/36, 36+)
- **Aplicação automática** baseada na idade em meses

### 2. **Sistema de DNA Inteligente**
- **DNA Virgem (R$ 50,00)**: Apenas para animais nascidos de FIV
- **DNA Genômica (R$ 80,00)**: Para todos os bezerros de 0 a 7 meses
- **Aplicação automática** conforme regras específicas

### 3. **Medicamentos com Preços Reais**
- Base de dados completa com 20+ medicamentos
- Preços atualizados conforme planilha fornecida
- Cálculo automático por animal

## 🚀 Como Usar

### Acesso Rápido
1. **Dashboard**: Widget de resumo de custos
2. **Menu Lateral**: "Custos Individuais"
3. **URL Direta**: `/custos`

### Fluxo de Trabalho
1. **Selecionar Animal**: Clique em um animal da lista
2. **Aplicar Protocolo**: Botão "Aplicar Protocolo" (automático por era)
3. **Aplicar DNA**: Botão "Aplicar DNA" (automático por regras)
4. **Custos Manuais**: Botão "+" para adicionar custos extras

## 📊 Protocolos por Era

### 🐂 MACHOS

#### ERA 0/7 MESES
- PANACOXX: 7 ML
- BOVILIS: 5 ML  
- SUPLENUT: 1 ML
- IODO 10%: 10 ML
- DNA VIRGEM: Se FIV
- DNA GENOMICA: Todos 0-7 meses

#### ERA 7/15 MESES
- RGN_ABCZ: 1 Un
- BOVILUS: 10 ML
- IVOMEC GOLD: 4 ML
- RAIVACEL: 4 ML

#### ERA 15/18 MESES
- CONTROLE ABCZ: 1 DOSE
- RGN_ABCZ: 1 Un
- BOVILUS: 5 ML
- MTREO: 5 ML

#### ERA 18/22 MESES
- CASQUEAR: 1 APLICACAO

#### 22+ MESES
- RACAO: 1 KG/DIA

### 🐄 FÊMEAS

#### ERA 0/7 MESES
- PANACOXX: 7 ML
- BOVILIS: 5 ML
- SUPLENUT: 1 ML
- IODO 10%: 10 ML
- VACINA BRUCELOSE: 1 DOSE
- DNA VIRGEM: Se FIV
- DNA GENOMICA: Todos 0-7 meses

#### ERA 7/12 MESES
- CONTROLE ABCZ: 1 DOSE
- RGN_ABCZ: 1 Un
- BOVILUS: 10 ML
- IVOMEC GOLD: 4 ML
- RAIVACEL: 4 ML

#### ERA 12/18 MESES
- CONTROLE ABCZ: 1 DOSE
- RGN_ABCZ: 1 Un
- BOVILUS: 5 ML
- TREO:M 5 ML

#### ERA 18/24 MESES
- CASQUEAR: 1 APLICACAO
- INSEMINACAO: 1 PROCEDIMENTO

#### 24+ MESES
- RACAO: 1 KG/DIA

## 💊 Tabela de Medicamentos e Preços

| Medicamento | Preço | Unidade | Por Animal |
|-------------|-------|---------|------------|
| TREO ACE | R$ 470,00 | 500ML | R$ 5,64 |
| PANACOXX | R$ 1.300,00 | FRASCO | R$ 9,10 |
| VACINA BOVILIS | R$ 99,30 | 50 DOSES | R$ 0,61 |
| SUPLENUT | R$ 305,00 | FRASCO | R$ 1,67 |
| TINTURA IODO | R$ 166,94 | LITRO | R$ 2,39 |
| IVOMEC GOLD | R$ 597,00 | LITRO | R$ 0,96 |
| VACINA RAIVACEL | R$ 12,00 | 250 DOSES | R$ 2,70 |
| DNA VIRGEM | R$ 50,00 | EXAME | R$ 50,00 |
| DNA GENOMICA | R$ 80,00 | EXAME | R$ 80,00 |
| CONTROLE ABCZ | R$ 15,00 | PROCEDIMENTO | R$ 15,00 |
| CASQUEAR | R$ 10,00 | PROCEDIMENTO | R$ 10,00 |
| INSEMINACAO | R$ 50,00 | PROCEDIMENTO | R$ 50,00 |
| RACAO | R$ 2,50 | KG | R$ 2,50 |

## 🧬 Regras de DNA

### DNA Virgem (Paternidade)
- **Quando**: Apenas animais nascidos de FIV
- **Custo**: R$ 50,00
- **Finalidade**: Confirmação de paternidade
- **Aplicação**: Automática no nascimento

### DNA Genômica
- **Quando**: Todos os bezerros de 0 a 7 meses
- **Custo**: R$ 80,00
- **Finalidade**: Análise genética completa
- **Aplicação**: Automática até 7 meses

## 📈 Relatórios e Análises

### Dashboard Principal
- **Custo Total**: Soma de todos os custos
- **Média por Animal**: Custo total ÷ número de animais
- **Animais com Custos**: Quantos têm custos registrados
- **Status dos Protocolos**: Completo, Parcial ou Pendente

### Relatório Individual
- **Custos por Tipo**: Protocolo, DNA, Medicamento, etc.
- **Histórico Completo**: Todos os custos com datas
- **Simulação Futura**: Custos estimados próximos meses

### Alertas Inteligentes
- **Protocolos Pendentes**: Animais sem protocolo aplicado
- **DNA em Atraso**: Bezerros sem DNA genômica
- **Custos Elevados**: Animais com custos acima da média

## 🔧 Integração com Sistema

### Nascimentos Automáticos
Quando um animal nasce via BirthManager:
1. **Custos iniciais** são aplicados automaticamente
2. **DNA apropriado** é adicionado conforme regras
3. **Protocolo inicial** é aplicado se aplicável

### Atualização de Idade
- Sistema recalcula protocolos quando idade muda
- Sugere novos protocolos conforme era
- Alerta sobre protocolos pendentes

## 🎮 Demonstração

Execute no console do navegador:
```javascript
// Carregar script de demonstração
const script = document.createElement('script')
script.src = '/scripts/demonstracaoCustos.js'
document.head.appendChild(script)

// Ou execute diretamente
window.demonstrarCustos()
```

## 📱 Interface do Usuário

### Tela Principal (/custos)
- **Lista de Animais**: Com status de custos
- **Detalhes do Animal**: Custos individuais
- **Ações Rápidas**: Aplicar protocolos e DNA
- **Resumo Geral**: Estatísticas consolidadas

### Cards de Status
- 🟢 **Completo**: Protocolo e DNA aplicados
- 🟡 **Parcial**: Apenas protocolo OU DNA
- 🔴 **Pendente**: Nenhum custo aplicado

### Botões de Ação
- **Aplicar Protocolo**: Automático por era
- **Aplicar DNA**: Automático por regras
- **Adicionar Custo**: Manual personalizado
- **Ver Protocolos**: Tabela completa

## 🔄 Fluxo de Dados

```
Animal Criado → Idade Calculada → Era Determinada → Protocolo Selecionado → Custos Aplicados
                     ↓
              Regras DNA → DNA Virgem (se FIV) + DNA Genômica (se 0-7 meses)
                     ↓
              Custos Salvos → Relatórios Atualizados → Dashboard Atualizado
```

## 🎯 Benefícios

1. **Controle Total**: Cada animal tem seus custos individuais
2. **Automação**: Protocolos aplicados automaticamente
3. **Precisão**: Baseado em dados reais de medicamentos
4. **Flexibilidade**: Custos manuais quando necessário
5. **Relatórios**: Análises detalhadas e projeções
6. **Integração**: Funciona com todo o sistema existente

## 🚀 Próximos Passos

1. **Acesse** `/custos` para começar
2. **Selecione** um animal da lista
3. **Aplique** os protocolos automáticos
4. **Monitore** os custos no dashboard
5. **Analise** os relatórios gerados

---

**💡 Dica**: O sistema é totalmente automático, mas permite personalização total quando necessário!