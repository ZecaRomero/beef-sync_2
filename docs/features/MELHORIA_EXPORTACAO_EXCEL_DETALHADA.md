# 📊 Melhoria: Exportação Excel Detalhada - Beef Sync

## ✅ Funcionalidades Implementadas

### **1. Detalhes Completos de Animais Mortos**
- ✅ **Data da Morte**: Data específica do óbito
- ✅ **Causa da Morte**: Causa registrada no sistema
- ✅ **Valor da Perda**: Valor calculado automaticamente
- ✅ **Observações da Morte**: Detalhes adicionais

### **2. Formatação Profissional Excel**
- ✅ **Bordas**: Todas as células com bordas pretas
- ✅ **Centralização**: Texto centralizado em todas as células
- ✅ **Cores**: Cabeçalho roxo com texto branco, dados cinza claro
- ✅ **Formatação Automática**: Números, datas e valores monetários

### **3. Nova API de Exportação**
- ✅ **Endpoint**: `/api/export/animals-detailed`
- ✅ **Dados Completos**: Inclui informações de morte
- ✅ **Formatação**: Aplicada automaticamente
- ✅ **Download**: Arquivo Excel pronto para uso

## 🔧 Modificações Realizadas

### **1. Atualização do `exportUtils.js`**

#### **Função `formatAnimalDataForExport`**
```javascript
export const formatAnimalDataForExport = async (animals) => {
  // Buscar dados de mortes para animais mortos
  const databaseService = (await import('./databaseService.js')).default
  
  const animalsWithDeathData = await Promise.all(
    animals.map(async (animal) => {
      let deathData = null
      
      if (animal.situacao === 'Morto') {
        try {
          const mortes = await databaseService.buscarMortes({ animalId: animal.id })
          if (mortes.length > 0) {
            deathData = mortes[0]
          }
        } catch (error) {
          console.warn('Erro ao buscar dados de morte:', error)
        }
      }
      
      return {
        // ... dados básicos do animal
        // Dados específicos de morte
        'Data da Morte': deathData ? new Date(deathData.data_morte).toLocaleDateString('pt-BR') : 'N/A',
        'Causa da Morte': deathData ? deathData.causa_morte : 'N/A',
        'Valor da Perda (R$)': deathData ? parseFloat(deathData.valor_perda) : 'N/A',
        'Observações da Morte': deathData ? deathData.observacoes || 'N/A' : 'N/A'
      }
    })
  )
  
  return animalsWithDeathData
}
```

#### **Função `exportToExcel`**
```javascript
// Colunas atualizadas incluindo dados de morte
worksheet.columns = [
  { header: 'Série', key: 'Série', width: 10 },
  { header: 'RG', key: 'RG', width: 12 },
  { header: 'Raça', key: 'Raça', width: 15 },
  { header: 'Sexo', key: 'Sexo', width: 10 },
  { header: 'Idade (meses)', key: 'Idade (meses)', width: 12 },
  { header: 'Situação', key: 'Situação', width: 12 },
  { header: 'Custo Total', key: 'Custo Total (R$)', width: 15 },
  { header: 'Data Nascimento', key: 'Data Nascimento', width: 15 },
  { header: 'Peso', key: 'Peso', width: 10 },
  { header: 'Observações', key: 'Observações', width: 20 },
  { header: 'Data Cadastro', key: 'Data Cadastro', width: 15 },
  // Dados específicos de morte
  { header: 'Data da Morte', key: 'Data da Morte', width: 15 },
  { header: 'Causa da Morte', key: 'Causa da Morte', width: 15 },
  { header: 'Valor da Perda (R$)', key: 'Valor da Perda (R$)', width: 15 },
  { header: 'Observações da Morte', key: 'Observações da Morte', width: 20 }
]
```

### **2. Formatação Profissional**

#### **Cabeçalho (Fundo Roxo)**
```javascript
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF7030A0' } // Roxo
}
cell.font = {
  color: { argb: 'FFFFFFFF' }, // Branco
  bold: true
}
cell.alignment = {
  horizontal: 'center',
  vertical: 'middle'
}
cell.border = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
}
```

#### **Dados (Fundo Cinza Claro)**
```javascript
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF2F2F2' } // Cinza claro
}
cell.alignment = {
  horizontal: 'center',
  vertical: 'middle'
}
cell.border = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
}
```

### **3. Formatação Automática de Dados**

#### **Números Monetários**
```javascript
if (columnKey === 'Custo Total (R$)' || columnKey === 'Valor da Perda (R$)') {
  if (cell.value && cell.value !== 'N/A' && typeof cell.value === 'number') {
    cell.numFmt = '#,##0.00'
  }
}
```

#### **Datas**
```javascript
if (columnKey === 'Data Nascimento' || columnKey === 'Data Cadastro' || columnKey === 'Data da Morte') {
  if (cell.value && cell.value !== 'N/A') {
    if (cell.value instanceof Date) {
      cell.numFmt = 'dd/mm/yyyy'
    }
  }
}
```

#### **Números Inteiros**
```javascript
if (columnKey === 'Idade (meses)' || columnKey === 'Peso') {
  if (cell.value && cell.value !== 'N/A' && typeof cell.value === 'number') {
    cell.numFmt = '0'
  }
}
```

## 📋 Estrutura da Planilha

### **Colunas da Planilha "Detalhes dos Animais"**

| Coluna | Descrição | Formato |
|--------|-----------|---------|
| Série | Identificação do animal | Texto centralizado |
| RG | Registro do animal | Texto centralizado |
| Raça | Raça do animal | Texto centralizado |
| Sexo | Sexo do animal | Texto centralizado |
| Idade (meses) | Idade em meses | Número inteiro |
| Situação | Situação atual | Texto centralizado |
| Custo Total | Custo total do animal | Moeda (R$ 1.500,00) |
| Data Nascimento | Data de nascimento | Data (dd/mm/aaaa) |
| Peso | Peso do animal | Número inteiro |
| Observações | Observações gerais | Texto centralizado |
| Data Cadastro | Data de cadastro | Data (dd/mm/aaaa) |
| **Data da Morte** | **Data do óbito** | **Data (dd/mm/aaaa)** |
| **Causa da Morte** | **Causa do óbito** | **Texto centralizado** |
| **Valor da Perda (R$)** | **Valor da perda** | **Moeda (R$ 1.500,00)** |
| **Observações da Morte** | **Detalhes da morte** | **Texto centralizado** |

## 🎨 Visual da Planilha

### **Cabeçalho**
- **Fundo**: Roxo (#7030A0)
- **Texto**: Branco, negrito
- **Alinhamento**: Centralizado
- **Bordas**: Pretas, finas

### **Dados**
- **Fundo**: Cinza claro (#F2F2F2)
- **Texto**: Preto
- **Alinhamento**: Centralizado
- **Bordas**: Pretas, finas

### **Formatação Automática**
- **Números monetários**: R$ 1.500,00
- **Datas**: 15/10/2025
- **Números inteiros**: 6
- **Texto**: Centralizado

## 🚀 Como Usar

### **1. Via API**
```javascript
// Fazer requisição para exportação
fetch('/api/export/animals-detailed')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Detalhes_dos_Animais.xlsx'
    link.click()
  })
```

### **2. Via Interface**
- Acessar página de relatórios
- Selecionar "Detalhes dos Animais"
- Clicar em "Exportar para Excel"
- Download automático do arquivo formatado

## 📊 Exemplo de Dados Exportados

### **Animais Ativos**
```
Série: RPT
RG: S 1020
Raça: Receptora
Sexo: Fêmea
Idade (meses): 30
Situação: Ativo
Custo Total: R$ 1.200,00
Data da Morte: N/A
Causa da Morte: N/A
Valor da Perda (R$): N/A
```

### **Animais Mortos**
```
Série: BENT
RG: 666
Raça: Brahman
Sexo: Macho
Idade (meses): 6
Situação: Morto
Custo Total: R$ 1.500,00
Data da Morte: 15/10/2025
Causa da Morte: Idade avançada
Valor da Perda (R$): R$ 1.500,00
Observações da Morte: N/A
```

## ✅ Benefícios Alcançados

### **Para o Usuário**
- ✅ **Dados completos** de animais mortos
- ✅ **Formatação profissional** da planilha
- ✅ **Fácil visualização** com bordas e cores
- ✅ **Formatação automática** de números e datas

### **Para o Sistema**
- ✅ **Integração completa** com dados de morte
- ✅ **Formatação consistente** em todas as exportações
- ✅ **API dedicada** para exportação detalhada
- ✅ **Performance otimizada** com formatação automática

### **Para Relatórios**
- ✅ **Informações completas** sobre óbitos
- ✅ **Formatação profissional** para apresentação
- ✅ **Dados estruturados** para análise
- ✅ **Compatibilidade** com Excel e outras ferramentas

## 🎯 Status Final

### **Funcionalidade Completa**
- ✅ **Dados de morte** incluídos na exportação
- ✅ **Formatação profissional** aplicada
- ✅ **Bordas e centralização** implementadas
- ✅ **Formatação automática** de números e datas
- ✅ **API de exportação** criada
- ✅ **Compatibilidade** com Excel mantida

### **Testes Realizados**
- ✅ **Exportação de animais ativos** → Dados básicos
- ✅ **Exportação de animais mortos** → Dados completos incluindo morte
- ✅ **Formatação visual** → Bordas, cores e centralização
- ✅ **Formatação de dados** → Números, datas e valores monetários
- ✅ **Download automático** → Arquivo Excel gerado

## 🎉 Resultado

A exportação para Excel agora inclui **todos os detalhes dos animais mortos** com **formatação profissional**:

- **Dados completos** de óbitos (data, causa, valor, observações)
- **Formatação visual** com bordas pretas e texto centralizado
- **Cores profissionais** (cabeçalho roxo, dados cinza claro)
- **Formatação automática** de números, datas e valores monetários
- **API dedicada** para exportação detalhada
- **Compatibilidade total** com Excel

**A funcionalidade está 100% implementada e funcionando!**

---

**Melhoria aplicada em**: 15/10/2025  
**Status**: ✅ **COMPLETA E FUNCIONAL**
