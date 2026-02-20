# Sistema de ROI e Análise de Vendas - Beef Sync

## 🎯 Visão Geral

O sistema de ROI (Return on Investment) e análise de vendas foi desenvolvido para ajudar produtores a tomar decisões inteligentes sobre quando vender seus animais, maximizando o retorno sobre o investimento e otimizando a rentabilidade do rebanho.

## 🚀 Funcionalidades Principais

### 1. **Análise de ROI Individual**
- Cálculo automático do ROI baseado em custos reais
- Estimativa de peso atual baseada em curvas de crescimento
- Preço de venda sugerido baseado no mercado
- Análise de lucro/prejuízo projetado

### 2. **Recomendações Inteligentes de Venda**
- **Venda Imediata**: ROI excelente (>30%) e idade ideal (18-36 meses)
- **Venda em Breve**: Bom ROI (>15%) e condições favoráveis
- **Aguardar**: ROI razoável (>5%) mas pode melhorar
- **Manter**: Animais reprodutores ou em desenvolvimento

### 3. **Lista de Animais Aptos para Venda**
- Visualização completa de todos os animais analisados
- Filtros por recomendação, ROI, idade, sexo e raça
- Ordenação por diferentes critérios
- Score de rentabilidade (0-100)

### 4. **Dashboard Integrado**
- Widget no dashboard principal
- Resumo das melhores oportunidades
- Estatísticas de lucro potencial
- Acesso rápido às análises

## 📊 Como Funciona o Cálculo

### **1. Custos Totais**
```
Custos Reais (do banco de dados) + Custos Estimados (se necessário)
```

**Custos Estimados por Mês:**
- Machos: R$ 150/mês
- Fêmeas: R$ 120/mês
- Custo inicial: R$ 200 (nascimento, vacinação, etc.)

### **2. Peso Atual Estimado**
Baseado em curvas de crescimento por raça e sexo:

```javascript
peso_atual = peso_maduro * (1 - e^(-taxa_crescimento * idade_meses / 24))
```

**Pesos Maduros por Raça:**
- Nelore: Macho 450kg, Fêmea 350kg
- Brahman: Macho 500kg, Fêmea 380kg
- Gir: Macho 420kg, Fêmea 320kg
- Receptora: Fêmea 400kg

### **3. Preço de Venda Sugerido**
```
preço_sugerido = peso_atual * preço_por_kg * ajuste_mercado
```

**Preços por Kg (Base):**
- Nelore: Macho R$ 18, Fêmea R$ 16
- Brahman: Macho R$ 20, Fêmea R$ 18
- Gir: Macho R$ 17, Fêmea R$ 15
- Receptora: Fêmea R$ 14

### **4. ROI Calculation**
```
ROI = ((preço_venda - custos_totais) / custos_totais) * 100
```

### **5. Score de Rentabilidade**
Combinação ponderada de:
- **ROI (50%)**: Retorno sobre investimento
- **Idade (30%)**: Idade ideal para venda
- **Peso (20%)**: Relação peso atual vs esperado

## 🎯 Critérios de Recomendação

### **Venda Imediata** 🟢
- ROI ≥ 25%
- Idade: 18-36 meses
- Lucro > R$ 1.000
- Urgência: Alta

### **Venda em Breve** 🔵
- ROI ≥ 15%
- Idade ≥ 15 meses
- Lucro > R$ 500
- Urgência: Média

### **Aguardar** 🟡
- ROI ≥ 5%
- Idade ≥ 12 meses
- Potencial de melhoria
- Urgência: Baixa

### **Manter** ⚪
- Fêmeas reprodutoras (18-60 meses)
- Animais muito jovens
- ROI insuficiente
- Urgência: Nenhuma

## 📈 Análise de Mercado

### **Tendências**
- **Alta**: Preços em crescimento (+10% no preço)
- **Estável**: Preços mantidos
- **Baixa**: Preços em queda (-10% no preço)

### **Demanda**
- **Alta**: >10 vendas recentes da raça
- **Média**: 3-10 vendas recentes
- **Baixa**: <3 vendas recentes

## 🔧 Configuração e Uso

### **1. Acesso ao Sistema**
- **Dashboard**: Widget "Animais Aptos para Venda"
- **Menu**: Animais > Aptos para Venda
- **Menu**: Comercial > Análise ROI

### **2. Análise Individual**
1. Acesse a lista de animais aptos para venda
2. Clique em "Analisar" no animal desejado
3. Visualize o breakdown completo de custos
4. Simule diferentes preços de venda
5. Veja recomendações personalizadas

### **3. Filtros Disponíveis**
- **Recomendação**: Todas, Vender Agora, Em Breve, Aguardar, Manter
- **ROI**: Todos, Excelente (>30%), Bom (15-30%), Razoável (5-15%), Baixo (<5%)
- **Sexo**: Todos, Macho, Fêmea
- **Idade**: Mínima e máxima em meses
- **Ordenação**: ROI, Rentabilidade, Idade, Recomendação

### **4. Ações Disponíveis**
- **Recomendar para Venda**: Marca animal como recomendado
- **Agendar Venda**: Para recomendações "em breve"
- **Download PDF**: Relatório detalhado da análise
- **Exportar Excel**: Dados para análise externa

## 📊 Relatórios e Integração

### **Relatórios Gerenciais**
O sistema de ROI está integrado ao gerador de relatórios:
- Resumo financeiro com projeções de venda
- Análise de rentabilidade por animal
- Recomendações de venda por período
- Comparativo de ROI por raça/sexo

### **Integração com Custos**
- Custos reais são automaticamente considerados
- Protocolos sanitários são incluídos no cálculo
- Custos de DNA e reprodução são contabilizados
- Histórico completo de gastos por animal

## 🎯 Benefícios do Sistema

### **Para o Produtor**
- **Decisões baseadas em dados** reais, não intuição
- **Maximização do ROI** através de timing otimizado
- **Identificação de oportunidades** de venda imediata
- **Redução de prejuízos** evitando vendas prematuras

### **Para o Negócio**
- **Aumento da rentabilidade** do rebanho
- **Otimização do fluxo de caixa** com vendas planejadas
- **Melhor gestão de estoque** de animais
- **Planejamento estratégico** baseado em projeções

### **Para a Operação**
- **Automatização** da análise de vendas
- **Padronização** de critérios de decisão
- **Rastreabilidade** de recomendações
- **Histórico** de performance das vendas

## 🔮 Funcionalidades Futuras

### **Versão 2.0**
- **Machine Learning** para previsão de preços
- **Integração com mercados** para preços em tempo real
- **Análise de sazonalidade** para timing otimizado
- **Alertas automáticos** por WhatsApp/Email

### **Versão 3.0**
- **Análise genética** para valor reprodutivo
- **Simulação de cenários** econômicos
- **Benchmarking** com outras fazendas
- **API para integração** com outros sistemas

## 📞 Suporte e Treinamento

### **Documentação**
- Manual do usuário completo
- Vídeos tutoriais
- FAQ com casos comuns
- Glossário de termos técnicos

### **Treinamento**
- Sessões de onboarding
- Workshops sobre ROI
- Consultoria em decisões de venda
- Suporte técnico especializado

---

**💡 Dica**: O sistema aprende com suas vendas! Quanto mais você usar e registrar as vendas reais, mais precisas ficam as recomendações e projeções.

**🎯 Objetivo**: Transformar a venda de animais de uma decisão intuitiva em uma estratégia baseada em dados, maximizando a rentabilidade do seu rebanho.