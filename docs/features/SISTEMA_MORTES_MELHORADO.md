# 🐄 Sistema de Mortes Melhorado - Beef Sync

## 📋 Visão Geral

O sistema de mortes foi completamente refatorado para oferecer uma experiência mais robusta e integrada, com seleção de animais cadastrados, gestão de causas de morte e integração completa com o PostgreSQL e boletim contábil.

## ✨ Funcionalidades Implementadas

### 🎯 **Seleção de Animais Cadastrados**
- ✅ **Busca dinâmica** de animais ativos no PostgreSQL
- ✅ **Dropdown inteligente** com informações completas (série, RG, sexo, raça)
- ✅ **Atualização automática** da situação do animal para "Morto"
- ✅ **Integração com banco** de dados em tempo real

### 🏷️ **Sistema de Causas de Morte**
- ✅ **Causas pré-definidas** (10 tipos padrão)
- ✅ **Gestão dinâmica** de novas causas
- ✅ **Prevenção de duplicatas** automática
- ✅ **Interface intuitiva** para adicionar/visualizar causas

### 💰 **Integração com Boletim Contábil**
- ✅ **Registro automático** no boletim contábil
- ✅ **Cálculo de perdas** baseado no custo do animal
- ✅ **Sincronização** com PostgreSQL
- ✅ **Histórico completo** de baixas

### 🔍 **Busca e Filtros Avançados**
- ✅ **Busca em tempo real** por série, RG, causa ou observações
- ✅ **Filtros por período** de datas
- ✅ **Interface responsiva** e moderna
- ✅ **Contadores dinâmicos** de registros

## 🗄️ Estrutura do Banco de Dados

### **Tabela `mortes`**
```sql
CREATE TABLE mortes (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animais(id) ON DELETE CASCADE,
  data_morte DATE NOT NULL,
  causa_morte VARCHAR(100) NOT NULL,
  observacoes TEXT,
  valor_perda DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabela `causas_morte`**
```sql
CREATE TABLE causas_morte (
  id SERIAL PRIMARY KEY,
  causa VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Como Usar

### **1. Acessar o Sistema**
- Menu: **Animais → Mortes**
- URL: `/movimentacoes/mortes`

### **2. Registrar Nova Morte**
1. Clique em **"Registrar Óbito"**
2. **Selecione o animal** da lista de animais ativos
3. **Defina a data** do óbito
4. **Escolha a causa** da morte
5. **Informe o valor** da perda (opcional)
6. **Adicione observações** detalhadas
7. Clique em **"Registrar Óbito"**

### **3. Gerenciar Causas**
1. Clique em **"Gerenciar Causas"**
2. **Adicione novas causas** conforme necessário
3. **Visualize causas existentes** com datas de criação
4. O sistema **previne duplicatas** automaticamente

### **4. Buscar Registros**
- Use a **barra de busca** para filtrar por:
  - Série do animal
  - RG do animal
  - Causa da morte
  - Observações

## 📊 Causas de Morte Padrão

O sistema vem com 10 causas pré-definidas:

1. **Doença** - Problemas de saúde
2. **Acidente** - Lesões acidentais
3. **Parto** - Complicações no parto
4. **Predação** - Ataques de predadores
5. **Intoxicação** - Envenenamento
6. **Desnutrição** - Problemas alimentares
7. **Idade avançada** - Morte natural
8. **Problemas cardíacos** - Doenças do coração
9. **Problemas respiratórios** - Doenças pulmonares
10. **Outros** - Causas não especificadas

## 🔧 APIs Disponíveis

### **POST `/api/deaths`**
Registra nova morte
```json
{
  "animalId": 123,
  "dataMorte": "2024-01-15",
  "causaMorte": "Doença",
  "observacoes": "Sintomas observados...",
  "valorPerda": 1500.00
}
```

### **GET `/api/deaths`**
Lista mortes com filtros
```
?startDate=2024-01-01&endDate=2024-12-31&causa=Doença
```

### **POST `/api/death-causes`**
Adiciona nova causa de morte
```json
{
  "causa": "Nova Causa"
}
```

### **GET `/api/death-causes`**
Lista todas as causas de morte

## 🎨 Interface Melhorada

### **Características Visuais**
- ✅ **Design moderno** com tema escuro/claro
- ✅ **Cards informativos** com contadores
- ✅ **Badges coloridos** para causas de morte
- ✅ **Formatação de moeda** brasileira
- ✅ **Ícones intuitivos** para ações
- ✅ **Estados de loading** durante operações

### **Responsividade**
- ✅ **Mobile-first** design
- ✅ **Grid responsivo** para formulários
- ✅ **Tabelas scrolláveis** em telas pequenas
- ✅ **Modais adaptáveis** ao tamanho da tela

## 🔄 Fluxo de Dados

### **Registro de Morte**
1. **Seleção do animal** → Validação de existência
2. **Preenchimento dos dados** → Validação de campos
3. **Registro no PostgreSQL** → Tabela `mortes`
4. **Atualização do animal** → Situação = "Morto"
5. **Registro no boletim** → Contabilidade
6. **Atualização da interface** → Lista atualizada

### **Gestão de Causas**
1. **Adição de causa** → Validação de duplicata
2. **Inserção no banco** → Tabela `causas_morte`
3. **Atualização da lista** → Interface atualizada
4. **Disponibilização** → Para novos registros

## 🛠️ Instalação e Configuração

### **1. Inicializar Tabelas**
```bash
node scripts/init-death-tables.js
```

### **2. Verificar Conexão**
- PostgreSQL deve estar rodando
- Banco `estoque_semen` deve existir
- Tabela `animais` deve estar criada

### **3. Testar Funcionalidades**
- Acesse `/movimentacoes/mortes`
- Verifique se animais aparecem na lista
- Teste registro de nova morte
- Confirme atualização no boletim

## 📈 Benefícios da Melhoria

### **Para o Usuário**
- ✅ **Interface mais intuitiva** e moderna
- ✅ **Busca rápida** e eficiente
- ✅ **Prevenção de erros** com validações
- ✅ **Gestão centralizada** de causas
- ✅ **Relatórios detalhados** de perdas

### **Para o Sistema**
- ✅ **Integração completa** com PostgreSQL
- ✅ **Sincronização automática** com boletim
- ✅ **Performance otimizada** com índices
- ✅ **Escalabilidade** para grandes volumes
- ✅ **Manutenibilidade** do código

### **Para a Contabilidade**
- ✅ **Registro automático** de baixas
- ✅ **Cálculo preciso** de perdas
- ✅ **Histórico completo** de óbitos
- ✅ **Integração com** sistema contábil
- ✅ **Relatórios fiscais** atualizados

## 🔍 Monitoramento e Logs

### **Logs Automáticos**
- ✅ **Registro de mortes** com timestamp
- ✅ **Erros de validação** detalhados
- ✅ **Operações de banco** logadas
- ✅ **Integração com boletim** monitorada

### **Métricas Disponíveis**
- Total de mortes registradas
- Mortes por causa
- Valor total de perdas
- Mortes por período
- Taxa de mortalidade

## 🆘 Suporte e Troubleshooting

### **Problemas Comuns**

#### **Animais não aparecem na lista**
- Verificar se animais estão com situação "Ativo"
- Confirmar conexão com PostgreSQL
- Checar API `/api/animals`

#### **Causa não é adicionada**
- Verificar se já existe (sistema previne duplicatas)
- Confirmar conexão com banco
- Checar API `/api/death-causes`

#### **Erro no boletim contábil**
- Sistema continua funcionando mesmo se boletim falhar
- Verificar logs para detalhes do erro
- Boletim é opcional, não bloqueia registro

### **Contato**
Para dúvidas ou problemas específicos, verifique:
1. Logs do console do navegador
2. Logs do servidor Node.js
3. Status da conexão PostgreSQL
4. Funcionamento das APIs

---

**Desenvolvido para Beef Sync** - Sistema completo de gestão pecuária com foco em controle de mortes e perdas.
