# Melhorias na NF de Saída

## Mudanças Implementadas

### 1. Novos Campos no Modal de NF de Saída

Quando você clicar no botão "Nova Saída", o modal abre automaticamente com:

- **Tipo de Operação**: Fixado em "Saída (Venda)" (não pode ser alterado)
- **Data de Saída**: Campo para informar quando os animais saíram da propriedade
- **Nome do Motorista**: Campo opcional para registrar o motorista responsável pelo transporte

### 2. Diferenciação Automática por Tipo

- **Botão "Nova Entrada"**: Abre com tipo "Entrada" e mostra "Data de Chegada dos Animais"
- **Botão "Nova Saída"**: Abre com tipo "Saída" e mostra "Data de Saída" + "Nome do Motorista"

### 3. Campos Adicionados no Banco de Dados

Foram adicionadas duas novas colunas na tabela `notas_fiscais`:

- `data_saida` (DATE): Data de saída dos animais
- `motorista` (VARCHAR(255)): Nome do motorista

### 4. Salvamento Automático

Os dados são salvos automaticamente no PostgreSQL quando você:
1. Clica em "Nova Saída"
2. Preenche o formulário (Data de Saída e opcionalmente Nome do Motorista)
3. Adiciona os animais/itens
4. Clica em "Salvar Nota Fiscal"

## Como Usar

1. Acesse a página de Notas Fiscais
2. Clique em "Nova Saída" (botão azul)
3. O modal abre automaticamente com tipo "Saída (Venda)"
4. Preencha os campos:
   - Número da NF
   - Data de Emissão
   - **Data de Saída** (quando os animais saíram)
   - **Nome do Motorista** (opcional)
   - Destinatário (comprador)
5. Adicione os animais/itens da nota
6. Clique em "Salvar Nota Fiscal"

## Observações

- O campo "Nome do Motorista" é opcional, você pode deixar em branco
- A "Data de Saída" ajuda a controlar quando os animais deixaram a propriedade
- O tipo de operação fica fixo (não pode ser alterado) quando você clica em "Nova Saída"
- Todos os dados são salvos no PostgreSQL automaticamente
- As colunas no banco são criadas automaticamente na primeira vez que você salvar uma NF

## Arquivos Modificados

1. `components/nota-fiscal-modal/index.js` - Adicionados campos no formulário e lógica de tipo fixo
2. `pages/api/notas-fiscais/index.js` - Adicionado salvamento dos novos campos no banco
3. `adicionar-campos-nf-saida.js` - Script para adicionar colunas (opcional, pois a API já faz isso)

## Teste

Recarregue a página (F5) e clique em "Nova Saída". O modal deve abrir com:
- Tipo de Operação: "Saída (Venda)" (desabilitado)
- Campos "Data de Saída" e "Nome do Motorista" visíveis
