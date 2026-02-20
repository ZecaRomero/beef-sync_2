# Sistema de Ocorrências - Beef Sync

## 📋 Visão Geral

O Sistema de Ocorrências permite registrar eventos e situações importantes dos animais do rebanho, mantendo um histórico completo e detalhado de cada animal.

## 🚀 Funcionalidades

### ✅ Lançamento de Ocorrências
- **Seleção de Animal**: Escolha um animal existente ou registre dados de um novo
- **Dados Básicos**: Nome, RG, série, sexo, nascimento, peso
- **Genealogia**: Informações sobre pai, mãe, avô materno e receptora
- **Programa de Melhoramento**: Códigos IABCZ, DECA, MGQ, TOP, MGTA
- **Serviços**: Registro de até 5 tipos de serviços aplicados
- **Status**: Controle de animais ativos, vendidos ou baixados
- **Observações**: Campo livre para anotações detalhadas

### 📊 Relatórios Completos
- **Visualização**: Lista paginada com filtros avançados
- **Filtros**: Por animal, período, status e tipo de serviço
- **Exportação**: Geração de planilhas Excel com todos os dados
- **Histórico**: Acompanhamento cronológico das ocorrências

## 🛠️ Instalação

### 1. Inicializar Tabelas do Banco
```bash
npm run db:init-ocorrencias
```

### 2. Verificar Instalação
- Acesse `/ocorrencias` para lançar ocorrências
- Acesse `/relatorios-ocorrencias` para visualizar relatórios

## 📱 Como Usar

### Registrar Nova Ocorrência

1. **Acesse o Menu**: Animais → Ocorrências
2. **Selecione o Animal**: Escolha na lista ou deixe vazio para novo registro
3. **Preencha os Dados**:
   - Dados básicos são preenchidos automaticamente se animal existir
   - Idade em meses é calculada automaticamente
   - Adicione informações de genealogia se necessário
4. **Programa de Melhoramento**: Preencha os códigos conforme necessário
5. **Serviços**: Marque os serviços aplicados e defina a data
6. **Status**: Defina se o animal está ativo, vendido ou baixado
7. **Observações**: Adicione detalhes importantes
8. **Salvar**: Clique em "Registrar Ocorrência"

### Visualizar Relatórios

1. **Acesse o Menu**: Relatórios → Relatórios de Ocorrências
2. **Aplicar Filtros**:
   - **Animal**: Filtrar por animal específico
   - **Período**: Definir data de início e fim
   - **Status**: Filtrar por status do animal
3. **Exportar**: Clique em "Exportar Excel" para baixar planilha
4. **Navegar**: Use a paginação para ver mais registros

## 🗃️ Estrutura do Banco de Dados

### Tabela: `ocorrencias_animais`
- **Dados do Animal**: ID, nome, RG, série, sexo, nascimento
- **Físico**: Peso, data da última pesagem, idade em meses
- **Genealogia**: Pai, mãe, avô materno, receptora
- **Melhoramento**: Códigos IABCZ, DECA, MGQ, TOP, MGTA
- **Status**: Ativos, vendidos, baixados
- **Controle**: Data de registro, observações

### Tabela: `ocorrencias_servicos`
- **Relacionamento**: Ligação com a ocorrência
- **Serviços**: Tipos de serviços aplicados
- **Controle**: Data de criação

## 📈 Melhorias Implementadas

### Interface Moderna
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Cores Organizadas**: Seções com cores diferentes para facilitar navegação
- **Validação**: Campos obrigatórios e validação de dados
- **Feedback**: Mensagens de sucesso e erro claras

### Performance
- **Paginação**: Carregamento eficiente de grandes volumes
- **Índices**: Otimização de consultas no banco
- **Cache**: Reutilização de dados de animais

### Relatórios Avançados
- **Filtros Múltiplos**: Combinação de diferentes critérios
- **Exportação Rica**: Excel com formatação e larguras otimizadas
- **Visualização Clara**: Tabela organizada com badges de status

## 🔧 Configurações Técnicas

### APIs Disponíveis

#### POST `/api/animals/ocorrencias`
Registra nova ocorrência
```json
{
  "animalId": 123,
  "nome": "Animal Teste",
  "observacoes": "Observação importante",
  "servicos": {
    "servico1": true,
    "servico2": false
  }
}
```

#### GET `/api/animals/ocorrencias`
Lista ocorrências com filtros
```
?animalId=123&startDate=2024-01-01&endDate=2024-12-31&limit=50&offset=0
```

### Campos Calculados
- **Idade**: Calculada automaticamente baseada na data de nascimento
- **Status**: Determinado pelos checkboxes de ativo/vendido/baixado

## 🎯 Casos de Uso

### 1. Registro de Vacinação
- Selecionar animal
- Marcar serviço aplicado
- Definir data do serviço
- Adicionar observações sobre a vacina

### 2. Controle de Peso
- Atualizar peso do animal
- Definir data da pesagem
- Acompanhar evolução no histórico

### 3. Mudança de Status
- Marcar animal como vendido
- Registrar data da venda
- Adicionar observações sobre comprador

### 4. Programa de Melhoramento
- Registrar códigos de avaliação
- Acompanhar evolução genética
- Gerar relatórios para análise

## 📊 Relatórios Disponíveis

### Relatório Geral
- Todas as ocorrências com filtros
- Exportação completa em Excel
- Dados de genealogia e melhoramento

### Relatório por Animal
- Histórico completo de um animal
- Evolução temporal
- Todos os serviços aplicados

### Relatório por Período
- Ocorrências em data específica
- Análise de atividades do rebanho
- Controle de serviços aplicados

## 🔄 Integração

O sistema se integra automaticamente com:
- **Cadastro de Animais**: Busca dados existentes
- **Sistema de Relatórios**: Exportação padronizada
- **Interface Principal**: Menu integrado

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique se as tabelas foram criadas corretamente
2. Confirme se o animal existe no cadastro
3. Verifique as permissões do banco de dados
4. Consulte os logs do sistema para erros específicos

---

**Desenvolvido para Beef Sync** - Sistema completo de gestão pecuária