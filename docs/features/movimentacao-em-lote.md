# 🚀 Movimentação em Lote de Animais

## 📋 Visão Geral

A funcionalidade de **Movimentação em Lote** permite que você mova vários animais de uma vez para uma localização específica, tornando o gerenciamento de grandes rebanhos muito mais eficiente.

## 🎯 Funcionalidades

### ✅ Seleção Múltipla de Animais
- **Seleção Individual**: Clique em cada animal para selecioná-lo
- **Seleção em Lote**: Use "Selecionar Todos" para escolher todos os animais filtrados
- **Filtros Avançados**: Filtre por série, RG, raça, sexo e status
- **Contador Visual**: Veja quantos animais estão selecionados

### 🗺️ Configuração de Movimentação
- **Localização de Destino**: Escolha entre 22+ piquetes e campos pré-configurados
- **Data da Movimentação**: Defina quando a movimentação ocorreu
- **Observações**: Adicione notas sobre a movimentação
- **Resumo Visual**: Veja um resumo antes de confirmar

### 🔄 Processamento Inteligente
- **Finalização Automática**: Finaliza automaticamente a localização atual
- **Criação de Nova Localização**: Cria nova entrada na tabela de localizações
- **Tratamento de Erros**: Processa cada animal individualmente
- **Relatório de Resultados**: Mostra sucessos e falhas

## 🚀 Como Usar

### 1. Acessar a Funcionalidade
1. Vá para a página **"Localização de Animais"**
2. Clique no botão **"Movimentação em Lote"** no cabeçalho
3. O modal será aberto com todos os animais disponíveis

### 2. Selecionar Animais
1. **Filtrar Animais** (opcional):
   - Use a busca por série, RG ou raça
   - Filtre por sexo (Macho/Fêmea)
   - Filtre por status (Ativo/Morto/Vendido)

2. **Selecionar Animais**:
   - Clique individualmente em cada animal
   - Ou use "Selecionar Todos" para escolher todos os filtrados
   - Use "Limpar Seleção" para desmarcar todos

### 3. Configurar Movimentação
1. **Escolher Destino**: Selecione a localização de destino
2. **Definir Data**: Escolha a data da movimentação
3. **Adicionar Observações** (opcional): Inclua notas sobre a movimentação

### 4. Executar Movimentação
1. Verifique o **resumo da movimentação**
2. Clique em **"Mover X Animais"**
3. Aguarde o processamento
4. Veja o resultado da operação

## 📊 Localizações Disponíveis

### Piquetes
- Piquete A, B, C, D, E, F, G, H, I, J

### Campos
- Campo 1, 2, 3, 4, 5

### Pastagens
- Pastagem Norte, Sul, Leste, Oeste

### Instalações
- Curral Principal
- Curral Secundário
- Quarentena
- Reprodução

## 🔧 Funcionalidades Técnicas

### API Endpoint
```
POST /api/batch-move-animals
```

### Estrutura de Dados
```json
{
  "animals": [
    {
      "id": 1,
      "serie": "001",
      "rg": "12345"
    }
  ],
  "targetLocation": "Piquete A",
  "moveDate": "2024-01-15",
  "notes": "Movimentação para reprodução",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Resposta da API
```json
{
  "success": true,
  "data": {
    "message": "Movimentação em lote processada",
    "summary": {
      "total": 10,
      "successful": 9,
      "failed": 1
    },
    "results": [...],
    "errors": [...]
  }
}
```

## 🛡️ Validações e Segurança

### Validações do Frontend
- ✅ Pelo menos um animal deve ser selecionado
- ✅ Localização de destino é obrigatória
- ✅ Data da movimentação é obrigatória
- ✅ Confirmação antes de executar

### Validações do Backend
- ✅ Verificação de existência dos animais
- ✅ Validação de dados obrigatórios
- ✅ Tratamento de erros individuais
- ✅ Transações seguras no banco

## 📈 Benefícios

### ⏱️ Eficiência
- **Movimentação Rápida**: Mova centenas de animais em segundos
- **Menos Cliques**: Interface otimizada para operações em massa
- **Filtros Inteligentes**: Encontre animais rapidamente

### 🎯 Precisão
- **Validação Automática**: Verifica dados antes de processar
- **Relatório Detalhado**: Mostra exatamente o que foi feito
- **Tratamento de Erros**: Processa cada animal individualmente

### 📊 Controle
- **Histórico Completo**: Todas as movimentações são registradas
- **Observações**: Adicione contexto às movimentações
- **Auditoria**: Rastreie quem moveu o quê e quando

## 🔄 Integração com Sistema

### Atualizações Automáticas
- ✅ Recarrega lista de animais
- ✅ Atualiza resumo por piquetes
- ✅ Atualiza localizações atuais
- ✅ Atualiza estatísticas do dashboard

### Compatibilidade
- ✅ Funciona com sistema existente
- ✅ Não interfere com movimentações individuais
- ✅ Mantém histórico completo
- ✅ Suporte a dark mode

## 🚨 Limitações e Considerações

### Limitações Técnicas
- Máximo recomendado: 500 animais por operação
- Requer conexão estável com banco de dados
- Processamento sequencial para evitar sobrecarga

### Boas Práticas
- Use filtros para selecionar grupos específicos
- Adicione observações para contexto
- Verifique o resumo antes de confirmar
- Execute em horários de menor uso do sistema

## 🆘 Solução de Problemas

### Erro: "Alguns animais não foram encontrados"
- Verifique se os animais ainda existem no sistema
- Recarregue a página e tente novamente

### Erro: "Erro interno do servidor"
- Verifique a conexão com o banco de dados
- Tente com um grupo menor de animais
- Contate o suporte técnico

### Movimentação Parcial
- O sistema processa cada animal individualmente
- Verifique o relatório de resultados
- Reexecute apenas os animais que falharam

## 📞 Suporte

Para dúvidas ou problemas com a movimentação em lote:
1. Verifique este documento
2. Consulte os logs do sistema
3. Entre em contato com o suporte técnico

---

**Versão**: 1.0  
**Última Atualização**: Janeiro 2024  
**Autor**: Sistema Beef-Sync
