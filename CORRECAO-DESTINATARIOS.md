# Correção: Erro ao Criar Destinatário

## Problema Identificado

Dois erros foram identificados:

1. **Erro ao criar destinatário**: A tabela `destinatarios_relatorios` não existia no banco de dados PostgreSQL
2. **destinatarios.map is not a function**: O código não estava tratando corretamente o formato de resposta da API

## Solução Implementada

### 1. Criação da Tabela

Foi criado o script `scripts/create-destinatarios-table.js` que cria a tabela com a seguinte estrutura:

```sql
CREATE TABLE IF NOT EXISTS destinatarios_relatorios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20),
  cargo VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  recebe_email BOOLEAN DEFAULT true,
  recebe_whatsapp BOOLEAN DEFAULT false,
  tipos_relatorios JSONB DEFAULT '[]',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
)
```

### 2. Execução do Script

O script foi executado com sucesso:

```bash
node scripts/create-destinatarios-table.js
```

Resultado:
- ✅ Tabela criada com sucesso
- ✅ Banco de dados configurado corretamente

### 3. Correção do Frontend

O arquivo `pages/relatorios-envio.js` foi corrigido para tratar corretamente a resposta da API:

**Antes:**
```javascript
const data = await res.json()
setDestinatarios(data)
```

**Depois:**
```javascript
const data = await res.json()
// A API retorna { success: true, data: [...] }
const destinatariosArray = Array.isArray(data) ? data : (data.data || [])
setDestinatarios(Array.isArray(destinatariosArray) ? destinatariosArray : [])
```

### 4. APIs Verificadas

As seguintes APIs estão funcionando corretamente:

- **GET** `/api/relatorios-envio/destinatarios` - Lista todos os destinatários
  - Retorna: `{ success: true, data: [...], message: "...", timestamp: "..." }`
- **POST** `/api/relatorios-envio/destinatarios` - Cria novo destinatário
- **GET** `/api/relatorios-envio/destinatarios/[id]` - Busca destinatário por ID
- **PUT** `/api/relatorios-envio/destinatarios/[id]` - Atualiza destinatário
- **DELETE** `/api/relatorios-envio/destinatarios/[id]` - Desativa destinatário

## Como Testar

### 1. Verificar se o Servidor Está Rodando

O servidor já está rodando em `http://localhost:3020`

### 2. Recarregar a Página

Acesse: `http://localhost:3020/relatorios-envio` e recarregue (F5 ou Ctrl+R)

### 3. Adicionar Destinatário

1. Clique em "Adicionar Destinatário"
2. Preencha os campos:
   - Nome: ZECA
   - Email: zeca@fazendasantanna.com.br
   - WhatsApp: 17996003821
   - Cargo: Área Adm
3. Marque as opções de recebimento
4. Clique em "Salvar"

### 4. Testar via Script (Opcional)

Execute o script de teste:

```bash
node scripts/test-destinatarios-api.js
```

Este script testa todas as operações da API automaticamente.

## Funcionalidades da Página

A página `/relatorios-envio` permite:

1. **Gerenciar Destinatários**
   - Adicionar novos destinatários
   - Editar destinatários existentes
   - Excluir destinatários
   - Configurar preferências de recebimento (Email/WhatsApp)

2. **Selecionar Relatórios**
   - Relatório de NF de Entrada e Saída
   - Nascimentos
   - Mortes
   - Receptoras que Chegaram
   - Receptoras que Faltam Parir
   - Receptoras que Faltam Diagnóstico
   - Resumo de Nascimentos
   - Resumo por Sexo
   - Resumo por Pai

3. **Enviar Relatórios**
   - Selecionar período (data inicial e final)
   - Escolher destinatários
   - Escolher relatórios
   - Enviar por Email e/ou WhatsApp

## Status Atual

✅ **Tabela criada no banco de dados**
✅ **API funcionando corretamente** (testado via curl)
✅ **Frontend corrigido para tratar resposta da API**
✅ **Já existe 1 destinatário cadastrado** (Zeca)

## Próximos Passos

1. Recarregue a página no navegador (F5)
2. O erro "destinatarios.map is not a function" não deve mais aparecer
3. Você poderá adicionar, editar e excluir destinatários normalmente

## Observações

- A tabela usa soft delete (campo `ativo`)
- O email é único (não pode haver duplicatas)
- Os tipos de relatórios são armazenados em formato JSONB
- Timestamps são atualizados automaticamente
- A API retorna respostas padronizadas com `{ success, data, message, timestamp }`
