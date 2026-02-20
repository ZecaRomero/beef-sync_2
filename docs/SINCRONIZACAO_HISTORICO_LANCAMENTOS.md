# 🔄 Sincronização do Histórico de Lançamentos

## Problema Identificado

O sistema tinha **duas tabelas diferentes** para armazenar ocorrências:
1. `ocorrencias_animais` - usada pela página de Ocorrências
2. `historia_ocorrencias` - usada pelo componente HistoryReports (Histórico de Lançamentos)

**Resultado**: Quando você lançava uma ocorrência na página de Ocorrências, ela **NÃO aparecia** no Histórico de Lançamentos!

## Solução Implementada

Foi implementada a **sincronização automática** entre as tabelas. Agora, quando você lança algo no aplicativo, a ocorrência é automaticamente salva em ambas as tabelas.

### APIs Atualizadas

#### 1. **API de Ocorrências** (`/api/animals/ocorrencias`)
- ✅ Ao criar uma ocorrência, agora também salva na tabela `historia_ocorrencias`
- ✅ Identifica automaticamente o tipo de ocorrência baseado no serviço aplicado:
  - Pesagem → tipo 'pesagem'
  - Parto → tipo 'parto'
  - Vacinação → tipo 'vacinacao'
  - Medicação/Tratamento → tipo 'medicacao'
  - Venda → tipo 'venda'
  - Leilão → tipo 'leilao'
  - Inseminação → tipo 'inseminacao'
  - Exame → tipo 'exame'
  - Outros → tipo 'outros'

#### 2. **API de Mortes** (`/api/mortes`)
- ✅ Ao registrar uma morte, agora também salva na tabela `historia_ocorrencias`
- ✅ Tipo: 'morte'
- ✅ Inclui causa da morte e valor da perda

## Como Verificar

### Teste 1: Lançar uma Ocorrência
1. Vá até a página **Ocorrências**
2. Selecione um animal
3. Escolha um serviço (ex: Pesagem)
4. Preencha os dados e salve
5. Vá até **Relatórios > Histórico de Lançamentos**
6. ✅ A ocorrência deve aparecer na lista!

### Teste 2: Registrar uma Morte
1. Vá até a página de **Mortes**
2. Selecione um animal
3. Preencha a causa da morte e salve
4. Vá até **Relatórios > Histórico de Lançamentos**
5. Selecione o tipo "Geral" ou filtre por "Morte"
6. ✅ A morte deve aparecer na lista!

### Teste 3: Gerar Relatório
1. Vá até **Relatórios > Histórico de Lançamentos**
2. Selecione um tipo de relatório específico (ex: Pesagem)
3. Clique em **Exportar Relatório**
4. ✅ O Excel deve conter todas as ocorrências sincronizadas!

## Estrutura das Tabelas

### Tabela: `ocorrencias_animais`
- Guarda os dados detalhados da ocorrência
- Relaciona com serviços aplicados na tabela `ocorrencias_servicos`
- Usada pela página de Ocorrências

### Tabela: `historia_ocorrencias`
- Guarda um resumo da ocorrência para o histórico
- Campos principais:
  - `animal_id` - ID do animal
  - `tipo` - Tipo da ocorrência (parto, pesagem, leilao, venda, etc.)
  - `data` - Data da ocorrência
  - `descricao` - Descrição da ocorrência
  - `observacoes` - Observações adicionais
  - `peso` - Peso do animal (se aplicável)
  - `valor` - Valor envolvido (se aplicável)
  - `medicamento` - Medicamento aplicado (se aplicável)
  - `responsavel` - Responsável pela ocorrência

## Tipos de Ocorrência Suportados

O sistema agora suporta os seguintes tipos de ocorrência no histórico:

| Tipo | Descrição | Quando é usado |
|------|-----------|----------------|
| `parto` | Partos registrados | Ao registrar parto |
| `pesagem` | Controle de peso | Ao registrar pesagem |
| `leilao` | Separação para leilão | Ao separar para leilão |
| `venda` | Venda de animais | Ao vender animal |
| `medicacao` | Medicação/Tratamento | Ao aplicar medicação |
| `vacinacao` | Vacinação | Ao aplicar vacina |
| `inseminacao` | Inseminação artificial | Ao inseminar |
| `desmame` | Desmame | Ao desmamar |
| `transferencia` | Transferência de pasto | Ao transferir pasto |
| `exame` | Exame veterinário | Ao realizar exame |
| `morte` | Morte/Descarte | Ao registrar morte |
| `outros` | Outras ocorrências | Quando não se encaixa em nenhuma outra |

## Notas Importantes

### ✅ Sincronização Não-Bloqueante
- Se houver erro na sincronização com `historia_ocorrencias`, a ocorrência **AINDA É SALVA** na tabela `ocorrencias_animais`
- Isso garante que os dados não sejam perdidos mesmo se houver problemas
- Os erros de sincronização são registrados no log para diagnóstico

### 🔍 Verificação da Tabela
- O sistema verifica automaticamente se a tabela `historia_ocorrencias` existe
- Se não existir, a sincronização é pulada silenciosamente
- Para criar a tabela, execute: `scripts/create-historia-ocorrencias-table.sql`

### 📊 Relatórios
- O componente `HistoryReports` busca dados da tabela `historia_ocorrencias`
- Todos os relatórios exportados incluem as ocorrências sincronizadas
- Os filtros funcionam corretamente (por tipo, período, mês, ano)

## Arquivos Modificados

1. `pages/api/animals/ocorrencias.js` - Adicionada sincronização com historia_ocorrencias
2. `pages/api/mortes.js` - Adicionada sincronização com historia_ocorrencias

## Próximos Passos (Sugestões)

Para manter a consistência, seria interessante sincronizar também:
- ✅ Vendas de animais (se já existe API de vendas)
- ✅ Cadastro de novos animais (para registrar nascimentos)
- ✅ Partos registrados (se existe API específica)
- ✅ Vacinações em lote (se existe API)

---

**Data da Implementação**: Janeiro 2025  
**Status**: ✅ Implementado e Testado

