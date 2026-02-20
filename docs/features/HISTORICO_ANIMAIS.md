# 📋 Sistema de Histórico de Ocorrências - Beef Sync

## 🎯 Visão Geral

O Sistema de Histórico de Ocorrências permite registrar, acompanhar e gerar relatórios de todos os eventos importantes que acontecem com os animais do rebanho.

---

## ✨ Funcionalidades Principais

### 📝 **Registro de Ocorrências**
- ✅ **12 tipos diferentes** de ocorrências pré-definidas
- ✅ **Campos específicos** para cada tipo de evento
- ✅ **Data e responsável** por cada registro
- ✅ **Observações detalhadas** para cada ocorrência

### 📊 **Relatórios Especializados**
- ✅ **6 tipos de relatórios** específicos
- ✅ **Filtros por período** (data, mês, ano)
- ✅ **Exportação para Excel** com formatação
- ✅ **Estatísticas automáticas** por relatório

### 🔍 **Busca e Filtros Avançados**
- ✅ **Filtros por animal** específico
- ✅ **Filtros por tipo** de ocorrência
- ✅ **Busca por texto** em descrições
- ✅ **Filtros de período** flexíveis

---

## 🏷️ Tipos de Ocorrências Disponíveis

### **1. 🐣 Parto**
- Registro de nascimentos
- Data do parto
- Observações sobre o processo

### **2. ⚖️ Pesagem**
- Controle de peso dos animais
- Peso em quilogramas
- Local da pesagem
- Acompanhamento de crescimento

### **3. 🏆 Separação para Leilão**
- Animais selecionados para leilão
- Peso no momento da separação
- Valor estimado/realizado
- Local do evento

### **4. 💰 Venda**
- Registro de vendas realizadas
- Valor da venda
- Comprador (se aplicável)
- Data da transação

### **5. 💊 Medicação/Tratamento**
- Aplicação de medicamentos
- Nome do medicamento
- Dosagem aplicada
- Veterinário responsável
- Próxima aplicação (se necessário)

### **6. 💉 Vacinação**
- Aplicação de vacinas
- Tipo de vacina
- Dosagem
- Próxima dose
- Veterinário responsável

### **7. 🧬 Inseminação**
- Procedimentos reprodutivos
- Touro utilizado
- Veterinário responsável
- Data prevista para diagnóstico

### **8. 🍼 Desmame**
- Separação de bezerros
- Idade no desmame
- Peso no desmame
- Observações do processo

### **9. 🌱 Transferência de Pasto**
- Mudança entre pastos
- Pasto de origem
- Pasto de destino
- Motivo da transferência

### **10. 🔬 Exame Veterinário**
- Exames de rotina ou específicos
- Veterinário responsável
- Resultados (em observações)
- Recomendações

### **11. 💀 Morte/Descarte**
- Registro de mortes ou descartes
- Causa (em observações)
- Data do evento
- Procedimentos tomados

### **12. 📝 Outros**
- Eventos não categorizados
- Descrição livre
- Observações detalhadas

---

## 📈 Tipos de Relatórios Disponíveis

### **1. 🏆 Relatório de Leilão**
- **Objetivo**: Animais separados para leilão
- **Dados**: Peso, valor estimado, data de separação
- **Uso**: Preparação para eventos de venda

### **2. 🐣 Relatório de Partos**
- **Objetivo**: Controle de nascimentos
- **Dados**: Datas, observações, problemas
- **Uso**: Acompanhamento reprodutivo

### **3. ⚖️ Relatório de Pesagens**
- **Objetivo**: Controle de peso e crescimento
- **Dados**: Pesos, datas, locais
- **Uso**: Análise de desenvolvimento

### **4. 💊 Relatório de Medicações**
- **Objetivo**: Controle sanitário
- **Dados**: Medicamentos, dosagens, veterinários
- **Uso**: Histórico médico dos animais

### **5. 💰 Relatório de Vendas**
- **Objetivo**: Controle comercial
- **Dados**: Valores, datas, compradores
- **Uso**: Análise financeira

### **6. 📊 Relatório Geral**
- **Objetivo**: Visão completa do período
- **Dados**: Todas as ocorrências
- **Uso**: Análise abrangente

---

## 🎮 Como Usar o Sistema

### **Acessar o Histórico**
```
Dashboard → Manejo do Rebanho → Histórico de Ocorrências
OU
Menu Lateral → Manejo → Histórico de Ocorrências
OU
Busca Global (Ctrl+K) → "histórico"
```

### **Registrar Nova Ocorrência**
1. **Clique em "Nova Ocorrência"**
2. **Selecione o animal** da lista
3. **Escolha o tipo** de ocorrência
4. **Defina a data** do evento
5. **Preencha campos específicos** (peso, valor, medicamento, etc.)
6. **Adicione descrição** e observações
7. **Clique em "Registrar Ocorrência"**

### **Filtrar e Buscar**
1. **Use os filtros** por animal, tipo, período
2. **Digite na busca** para encontrar por descrição
3. **Combine filtros** para resultados específicos
4. **Limpe filtros** para ver todos os registros

### **Visualizar Detalhes**
1. **Clique no ícone de olho** (👁️) na linha
2. **Veja todos os detalhes** da ocorrência
3. **Informações completas** em modal

### **Excluir Ocorrência**
1. **Clique no ícone de lixeira** (🗑️)
2. **Confirme a exclusão**
3. **Registro removido** permanentemente

---

## 📊 Gerar Relatórios Específicos

### **Acessar Relatórios**
```
Dashboard → Comercial → Relatórios de Histórico
OU
Menu Lateral → Comercial → Relatórios de Histórico
OU
URL direta: /relatorios-historico
```

### **Configurar Relatório**
1. **Escolha o tipo** de relatório desejado
2. **Defina o período**:
   - Data específica (início e fim)
   - Mês e ano
   - Apenas ano
3. **Visualize o resumo** na tela
4. **Exporte para Excel** se necessário

### **Exemplos de Uso**

#### **Relatório de Leilão do Mês**
1. Selecione "Relatório de Leilão"
2. Escolha mês atual
3. Veja animais separados
4. Exporte lista para o leiloeiro

#### **Relatório de Partos do Ano**
1. Selecione "Relatório de Partos"
2. Escolha ano atual
3. Analise performance reprodutiva
4. Identifique padrões sazonais

#### **Controle de Medicações**
1. Selecione "Relatório de Medicações"
2. Defina período desejado
3. Veja histórico médico
4. Controle custos veterinários

---

## 📁 Estrutura dos Dados Exportados

### **Planilha Principal**
- Data da ocorrência
- Animal (série e RG)
- Raça e sexo
- Tipo de ocorrência
- Descrição detalhada
- Observações
- Peso (se aplicável)
- Valor (se aplicável)
- Medicamento/dosagem
- Veterinário responsável
- Local do evento
- Responsável pelo registro
- Data de criação do registro

### **Planilha de Resumo**
- Período do relatório
- Total de ocorrências
- Animais envolvidos
- Valores totais
- Pesos totais
- Médias calculadas
- Medicamentos utilizados

### **Planilha por Mês** (quando aplicável)
- Distribuição mensal
- Quantidade por mês
- Análise temporal

---

## 🔄 Fluxo de Trabalho Recomendado

### **Uso Diário**
1. **Registre eventos** conforme acontecem
2. **Use campos específicos** para cada tipo
3. **Adicione observações** detalhadas
4. **Mantenha dados atualizados**

### **Uso Semanal**
1. **Revise registros** da semana
2. **Corrija informações** se necessário
3. **Analise padrões** emergentes
4. **Planeje ações** futuras

### **Uso Mensal**
1. **Gere relatórios** do mês
2. **Analise performance** geral
3. **Identifique tendências**
4. **Tome decisões** baseadas em dados

### **Uso Anual**
1. **Relatório anual** completo
2. **Análise de crescimento**
3. **Planejamento** do próximo ano
4. **Backup** dos dados importantes

---

## 💡 Dicas e Boas Práticas

### **Registro Eficiente**
- ✅ **Registre imediatamente** após o evento
- ✅ **Use descrições claras** e objetivas
- ✅ **Preencha todos os campos** relevantes
- ✅ **Mantenha padrão** nas descrições

### **Organização**
- ✅ **Use filtros** para encontrar rapidamente
- ✅ **Exporte regularmente** para backup
- ✅ **Revise dados** periodicamente
- ✅ **Corrija erros** imediatamente

### **Análise**
- ✅ **Compare períodos** diferentes
- ✅ **Identifique padrões** sazonais
- ✅ **Monitore custos** veterinários
- ✅ **Acompanhe crescimento** dos animais

### **Relatórios**
- ✅ **Gere relatórios** específicos por necessidade
- ✅ **Use filtros** para dados precisos
- ✅ **Exporte para Excel** para análises avançadas
- ✅ **Compartilhe dados** com veterinários/consultores

---

## 🎯 Benefícios do Sistema

### **Controle Total**
- 📋 **Histórico completo** de cada animal
- 📊 **Dados organizados** e acessíveis
- 🔍 **Busca rápida** por qualquer informação
- 📈 **Relatórios específicos** por necessidade

### **Tomada de Decisão**
- 📊 **Dados confiáveis** para análises
- 📈 **Tendências identificadas** facilmente
- 💰 **Custos controlados** e monitorados
- 🎯 **Ações baseadas** em informações reais

### **Eficiência Operacional**
- ⚡ **Registro rápido** de eventos
- 🔄 **Sincronização** entre dispositivos
- 📱 **Acesso móvel** para campo
- 💾 **Backup automático** dos dados

### **Conformidade**
- 📋 **Rastreabilidade** completa
- 🏥 **Histórico médico** detalhado
- 📊 **Relatórios** para auditoria
- 📈 **Dados** para certificações

---

## 🚀 Próximos Passos

### **Implementação**
1. **Comece registrando** eventos atuais
2. **Configure tipos** mais usados
3. **Treine equipe** no uso do sistema
4. **Estabeleça rotina** de registros

### **Otimização**
1. **Analise relatórios** gerados
2. **Ajuste processos** conforme necessário
3. **Expanda uso** para toda a operação
4. **Integre** com outros sistemas

---

**📋 O Sistema de Histórico de Ocorrências transforma a gestão do seu rebanho em um processo organizado, eficiente e baseado em dados confiáveis!**