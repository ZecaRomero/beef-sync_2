# 🧬 Sistema de Estoque de Sêmen - Beef Sync

## 🎯 Visão Geral

O Sistema de Estoque de Sêmen permite controlar completamente o material genético do rebanho, desde a compra até o uso nas inseminações, com rastreabilidade total e integração com o histórico de ocorrências.

---

## ✨ Funcionalidades Principais

### 📦 **Controle de Estoque**
- ✅ **Cadastro completo** de sêmen por touro
- ✅ **Localização precisa** (botijão e caneca)
- ✅ **Controle de doses** (total, disponíveis, usadas)
- ✅ **Status automático** (disponível, esgotado, vencido)

### 💰 **Gestão Financeira**
- ✅ **Valor de compra** por lote
- ✅ **Custo por dose** calculado automaticamente
- ✅ **Fornecedor e NF** para rastreabilidade
- ✅ **Investimento total** em material genético

### 🔗 **Integração Completa**
- ✅ **Vinculação com inseminações** automática
- ✅ **Histórico de uso** detalhado
- ✅ **Registro em ocorrências** quando usado
- ✅ **Rastreabilidade total** do material

---

## 📋 Campos de Cadastro

### **🐂 Informações do Touro**
- **Nome do Touro** * - Digite aqui... 
- **RG do Touro** - Digite aqui... 
- **Raça** - Ex: Nelore, Angus, Brahman

### **📍 Localização no Estoque**
- **Localização Geral** - Ex: Galpão A, Sala 1
- **Botijão** - Ex: B001, Botijão 1
- **Caneca** - Ex: C001, Caneca A

### **🛒 Informações de Compra**
- **Fornecedor** - Nome da empresa/pessoa
- **Número da NF** * - Para rastreabilidade fiscal
- **Valor da Compra** * - Valor total pago
- **Data da Compra** - Data de aquisição

### **💉 Controle de Doses**
- **Quantidade de Doses** * - Total de doses no lote
- **Doses Disponíveis** - Preenchido automaticamente
- **Doses Usadas** - Calculado automaticamente

### **📄 Informações Adicionais**
- **Certificado** - Número do certificado genético
- **Data de Validade** - Para controle de vencimento
- **Origem** - Central de sêmen de origem
- **Linhagem** - Informações da linhagem genética
- **Observações** - Notas adicionais

---

## 🎮 Como Usar o Sistema

### **Acessar Estoque de Sêmen**
```
Dashboard → Manejo → Estoque de Sêmen
OU
Menu Lateral → Manejo → Estoque de Sêmen
OU
Busca Global (Ctrl+K) → "estoque semen"
OU
URL direta: /estoque-semen
```

### **Cadastrar Novo Sêmen**
1. **Clique em "Adicionar Sêmen"**
2. **Preencha informações do touro** (nome, RG, raça)
3. **Defina localização** (botijão, caneca)
4. **Registre compra** (fornecedor, NF, valor, data)
5. **Informe quantidade** de doses
6. **Adicione observações** se necessário
7. **Clique em "Adicionar ao Estoque"**

### **Usar Dose para Inseminação**
1. **Localize o touro** na lista
2. **Clique no ícone 💉** (usar dose)
3. **Confirme o uso** da dose
4. **Sistema atualiza** automaticamente:
   - Reduz doses disponíveis
   - Aumenta doses usadas
   - Registra no histórico
   - Atualiza status se necessário

### **Filtrar e Buscar**
1. **Use filtros** por touro, fornecedor, localização, status
2. **Digite na busca** para encontrar rapidamente
3. **Combine filtros** para resultados específicos
4. **Limpe filtros** para ver todo o estoque

---

## 📊 Estatísticas em Tempo Real

### **Métricas Principais**
- 🐂 **Total Touros** - Quantidade de touros no estoque
- ✅ **Disponíveis** - Touros com doses disponíveis
- ❌ **Esgotados** - Touros sem doses restantes
- 💉 **Total Doses** - Soma de todas as doses
- 🟢 **Disponíveis** - Doses prontas para uso
- 🔴 **Usadas** - Doses já utilizadas
- 💰 **Investido** - Valor total investido
- 🏢 **Fornecedores** - Quantidade de fornecedores diferentes

### **Status Automático**
- 🟢 **Disponível** - Tem doses para usar
- 🔴 **Esgotado** - Sem doses restantes
- 🟡 **Vencido** - Data de validade expirada

---

## 🔗 Integração com Inseminações

### **Processo Automático**
1. **Técnico usa dose** no estoque
2. **Sistema registra** automaticamente:
   - Reduz estoque
   - Registra no histórico de uso
   - Cria ocorrência no animal
   - Calcula custo da dose

### **Dados Registrados na Inseminação**
- Nome e RG do touro
- Fornecedor do sêmen
- Localização (botijão/caneca)
- Valor da dose
- Data e hora do uso
- Observações técnicas

### **Rastreabilidade Completa**
- **De onde veio**: Fornecedor, NF, data de compra
- **Onde estava**: Localização no estoque
- **Quando foi usado**: Data e hora exatas
- **Em qual animal**: Vinculação direta
- **Quem aplicou**: Responsável técnico
- **Quanto custou**: Valor da dose

---

## 📈 Relatórios e Análises

### **Exportação para Excel**
- **Planilha Principal**: Todos os dados do estoque
- **Planilha de Resumo**: Estatísticas consolidadas
- **Formatação Profissional**: Colunas ajustadas e organizadas

### **Análises Disponíveis**
- **Investimento por fornecedor**
- **Uso por touro**
- **Eficiência de doses**
- **Custos por inseminação**
- **Estoque baixo** (alertas)
- **Sêmen vencido** (alertas)

---

## 🚨 Alertas Inteligentes

### **Estoque Baixo**
- **Automático**: Quando doses ≤ 5
- **Personalizado**: Definir limite por touro
- **Notificação**: Alerta visual no sistema

### **Sêmen Vencido**
- **Verificação**: Por data de validade
- **Status**: Automaticamente marcado como vencido
- **Bloqueio**: Impede uso de sêmen vencido

### **Touros Esgotados**
- **Status**: Automaticamente atualizado
- **Histórico**: Mantém registro completo
- **Reposição**: Facilita nova compra

---

## 💡 Utilitários Avançados

### **Console do Navegador (F12)**
```javascript
// Ver estoque completo
window.semenUtils.getSemenStock()

// Ver apenas sêmen disponível
window.semenUtils.getAvailableSemen()

// Estatísticas do estoque
window.semenUtils.getSemenStats()

// Verificar estoque baixo
window.semenUtils.checkLowStock()

// Verificar sêmen vencido
window.semenUtils.checkExpiredSemen()

// Histórico de uso
window.semenUtils.getSemenUsageHistory()
```

### **Integração com Histórico**
- **Registro automático** de inseminações
- **Vinculação** com ocorrências do animal
- **Rastreabilidade** completa do uso
- **Custos** integrados ao sistema

---

## 🎯 Fluxo de Trabalho Recomendado

### **Compra de Sêmen**
1. **Receber material** do fornecedor
2. **Cadastrar no estoque** com todos os dados
3. **Organizar fisicamente** conforme localização cadastrada
4. **Verificar** se dados estão corretos

### **Uso Diário**
1. **Consultar estoque** antes da inseminação
2. **Selecionar touro** apropriado
3. **Usar dose** pelo sistema
4. **Confirmar** registro automático

### **Controle Semanal**
1. **Verificar alertas** de estoque baixo
2. **Revisar** sêmen próximo ao vencimento
3. **Analisar** uso por touro
4. **Planejar** reposição se necessário

### **Análise Mensal**
1. **Gerar relatórios** de uso
2. **Calcular custos** por inseminação
3. **Avaliar eficiência** dos touros
4. **Planejar compras** futuras

---

## 🔄 Integração com Outros Módulos

### **Histórico de Ocorrências**
- ✅ **Registro automático** quando dose é usada
- ✅ **Detalhes completos** do sêmen utilizado
- ✅ **Custo da dose** incluído
- ✅ **Rastreabilidade** total

### **Custos Individuais**
- ✅ **Custo por dose** calculado automaticamente
- ✅ **Integração** com custos do animal
- ✅ **Relatórios** de custo por inseminação

### **Gestações**
- ✅ **Vinculação** com touro utilizado
- ✅ **Dados genéticos** disponíveis
- ✅ **Rastreabilidade** da origem

---

## 📱 Características da Interface

### **Design Responsivo**
- ✅ **Funciona** em desktop, tablet e mobile
- ✅ **Tabela adaptativa** com scroll horizontal
- ✅ **Filtros otimizados** para telas pequenas

### **Experiência do Usuário**
- ✅ **Busca rápida** em tempo real
- ✅ **Filtros intuitivos** e combinados
- ✅ **Ações diretas** na tabela
- ✅ **Feedback visual** para todas as ações

### **Acessibilidade**
- ✅ **Cores contrastantes** para status
- ✅ **Ícones intuitivos** para ações
- ✅ **Tooltips explicativos**
- ✅ **Navegação por teclado**

---

## 🎉 Benefícios do Sistema

### **Controle Total**
- 🎯 **Rastreabilidade** completa do material genético
- 📊 **Visibilidade** de todo o estoque
- 💰 **Controle financeiro** preciso
- 📈 **Análises** para tomada de decisão

### **Eficiência Operacional**
- ⚡ **Localização rápida** do sêmen
- 🔄 **Atualização automática** do estoque
- 📋 **Registro automático** de uso
- 🚨 **Alertas preventivos**

### **Gestão Financeira**
- 💵 **Custo real** por inseminação
- 📊 **ROI** por touro
- 📈 **Análise de investimento**
- 💰 **Controle de gastos**

### **Qualidade Genética**
- 🧬 **Histórico genético** completo
- 📋 **Certificados** organizados
- 🎯 **Seleção** baseada em dados
- 📊 **Performance** por linhagem

---

## 🚀 Próximos Passos

### **Implementação**
1. **Cadastre** o estoque atual
2. **Organize** fisicamente conforme sistema
3. **Treine equipe** no uso
4. **Estabeleça rotina** de controle

### **Otimização**
1. **Analise relatórios** gerados
2. **Ajuste processos** conforme necessário
3. **Expanda uso** para toda a operação
4. **Integre** com outros sistemas

---

**🧬 O Sistema de Estoque de Sêmen transforma o controle do material genético em um processo organizado, rastreável e integrado com toda a operação!**