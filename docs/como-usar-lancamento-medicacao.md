# 💉 Como usar o Lançamento de Medicação

## 🎯 O que é?

O componente `MedicationOccurrence` permite registrar quando a medicação foi realmente aplicada nos animais, diferente do `ProtocolEditor` que apenas configura os protocolos.

## 🚀 Como integrar no seu sistema:

### 1. Adicionar no menu de navegação

No seu arquivo de navegação (provavelmente `App.js` ou similar), adicione:

```javascript
import MedicationOccurrence from './components/MedicationOccurrence'

// No seu menu/roteamento:
{
  path: '/medicacao',
  name: 'Lançar Medicação',
  icon: '💉',
  component: MedicationOccurrence
}
```

### 2. Funcionalidades principais:

#### 📋 **Registrar Nova Medicação:**
- Selecionar medicamento (usa os dados do ProtocolEditor)
- Escolher tipo: Individual ou Lote
- Definir data e hora da aplicação
- Selecionar animais (para individual) ou definir lote
- Adicionar observações e responsável

#### 📊 **Tipos de aplicação:**

**🐄 Individual:**
- Seleciona animais específicos da lista
- Calcula custo por animal selecionado
- Ideal para: injeções, medicamentos específicos

**📦 Em Lote:**
- Define nome do lote e quantidade de animais
- Usa custo por lote configurado no medicamento
- Ideal para: medicação na água, ração medicada

#### 📈 **Histórico de ocorrências:**
- Lista todas as medicações aplicadas
- Mostra custos totais e por animal
- Filtra por data, medicamento, responsável

## 🔧 Funcionalidades técnicas:

### Armazenamento:
- Salva no `localStorage` como `medicationOccurrences`
- Integra com dados do `ProtocolEditor`
- Mantém histórico completo

### Cálculos automáticos:
- **Individual**: `quantidade_animais × custo_por_animal`
- **Lote**: `custo_do_lote ÷ animais_no_lote`

### Validações:
- Medicamento obrigatório
- Animais selecionados (para individual)
- Nome do lote (para aplicação em lote)
- Data e hora válidas

## 📱 Interface:

### Tela principal:
- Lista de ocorrências registradas
- Botão "Nova Medicação"
- Filtros e busca (pode ser adicionado)

### Modal de registro:
- Formulário completo de medicação
- Seleção de animais (individual)
- Resumo de custos em tempo real
- Validações visuais

## 🎨 Indicadores visuais:

- 🟢 **Verde**: Medicação individual
- 🟣 **Roxo**: Medicação em lote  
- 💰 **Custo**: Destacado em verde
- 📅 **Data/Hora**: Com ícones intuitivos
- 🐄 **Animais**: Tags com brincos

## 💡 Próximos passos sugeridos:

1. **Relatórios**: Adicionar relatórios de custos por período
2. **Filtros**: Filtrar por medicamento, data, responsável
3. **Exportação**: Exportar dados para Excel/PDF
4. **Notificações**: Lembrar de medicações periódicas
5. **Integração**: Conectar com API de animais real

## 🔗 Integração com outros componentes:

- **ProtocolEditor**: Usa medicamentos e protocolos configurados
- **Dashboard**: Pode mostrar estatísticas de medicação
- **Relatórios**: Fonte de dados para relatórios de custos
- **Animais**: Lista de animais disponíveis para medicação