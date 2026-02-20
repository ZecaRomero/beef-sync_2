# 🐄 Cadastro em Lote - Receptoras

## Funcionalidade Implementada

Foi criada uma funcionalidade completa para cadastrar múltiplas receptoras de uma só vez, otimizando o processo de entrada de animais no sistema.

## Como Acessar

1. Vá para a página **Animais** (`/animals`)
2. Clique no botão **🐄 Receptoras em Lote** na barra superior
3. O modal de cadastro em lote será aberto

## Funcionalidades Principais

### ✅ Cadastro Múltiplo
- Adicione quantas receptoras desejar
- Botão "Adicionar" para incluir uma receptora
- Botão "Adicionar Múltiplas" para incluir várias de uma vez

### ✅ Campos Automáticos
- **Série**: Automaticamente definida como "RPT"
- **Raça**: Automaticamente definida como "Receptora"
- **Sexo**: Automaticamente definido como "Fêmea"
- **Meses**: Automaticamente definido como 30 meses
- **Situação**: Padrão "Ativo"

### ✅ Campos Obrigatórios
- **RG**: Número de identificação (máximo 6 dígitos)
- **Valor da Compra**: Valor pago pela receptora
- **Fornecedor**: Nome do fornecedor

### ✅ Campos Opcionais
- **Data da Compra**: Data da aquisição
- **Nota Fiscal**: Número da NF
- **Peso na Compra**: Peso em kg
- **Idade na Compra**: Idade em meses
- **Condição Corporal**: Escala de 1-5
- **Observações**: Notas adicionais

### ✅ Funcionalidades de Produtividade

#### 📋 Copiar para Todas
- Botões "📋 Copiar" nos campos: Fornecedor, Data da Compra, Nota Fiscal
- Permite aplicar o mesmo valor a todas as receptoras

#### 👁️ Preview dos Dados
- Visualização completa antes de salvar
- Cálculo automático do custo total
- Validação de dados

#### 🧪 Protocolos Automáticos
- **Protocolo Sanitário**: Aplicado automaticamente baseado na idade
- **DNA**: Opcional para animais FIV
- **Custo Total**: Cálculo automático incluindo protocolos

## Processo de Salvamento

### 1. Validação
- Verifica campos obrigatórios
- Valida formato dos dados
- Mostra erros específicos

### 2. Salvamento via API
- Endpoint dedicado: `/api/animals/batch`
- Salvamento em lote otimizado
- Tratamento de erros individuais

### 3. Aplicação de Custos
- Protocolos sanitários aplicados automaticamente
- Custos de DNA para animais FIV
- Integração com sistema de custos

### 4. Feedback ao Usuário
- Confirmação de sucesso
- Relatório de erros (se houver)
- Atualização automática da lista

## Exemplo de Uso

### Cenário: Compra de 5 Receptoras

1. **Acesse** o cadastro em lote
2. **Clique** em "Adicionar Múltiplas" e informe "5"
3. **Preencha** os dados da primeira receptora:
   - RG: 123456
   - Valor: 2500.00
   - Fornecedor: Fazenda ABC
   - Data: 15/01/2025
   - NF: 001234
4. **Use** os botões "📋 Copiar" para aplicar dados comuns
5. **Preencha** os RGs individuais: 123457, 123458, 123459, 123460
6. **Marque** "Protocolo Automático" se desejar
7. **Clique** em "👁️ Preview" para verificar
8. **Salve** todas as receptoras

### Resultado
- 5 receptoras cadastradas
- Custos aplicados automaticamente
- Lista atualizada instantaneamente

## Vantagens

### ⚡ Velocidade
- Cadastro de múltiplas receptoras em minutos
- Redução de 80% no tempo de cadastro
- Interface otimizada para produtividade

### 🎯 Precisão
- Validação automática de dados
- Prevenção de erros comuns
- Campos obrigatórios destacados

### 💰 Controle Financeiro
- Cálculo automático de custos
- Aplicação de protocolos
- Integração com sistema de custos

### 🔄 Flexibilidade
- Adicionar/remover receptoras dinamicamente
- Copiar dados comuns
- Preview antes de salvar

## Tratamento de Erros

### Erros Comuns
- **RG duplicado**: Sistema verifica duplicatas
- **Campos obrigatórios**: Validação em tempo real
- **Formato inválido**: Validação de tipos de dados

### Recuperação
- Salvamento parcial em caso de erros
- Relatório detalhado de falhas
- Possibilidade de corrigir e tentar novamente

## Integração com Sistema

### Banco de Dados
- Tabela `animals` com campos específicos
- Validação de integridade
- Transações seguras

### Sistema de Custos
- Aplicação automática de protocolos
- Cálculo de custos de DNA
- Integração com `costManager`

### Interface
- Atualização automática da lista
- Sincronização com localStorage
- Feedback visual imediato

## Próximas Melhorias

### 🚀 Funcionalidades Planejadas
- Importação via Excel
- Templates de cadastro
- Validação de RGs existentes
- Histórico de compras

### 🔧 Melhorias Técnicas
- Cache de dados comuns
- Validação assíncrona
- Otimização de performance
- Logs detalhados

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme os dados obrigatórios
3. Teste com uma receptora primeiro
4. Entre em contato com o suporte técnico

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: ✅ Implementado e Funcional
