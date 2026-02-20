# 🔍 Guia de Verificação de APIs - Beef-Sync

## 📋 Visão Geral

Este guia mostra como verificar se todas as APIs do sistema Beef-Sync estão conectadas e funcionando corretamente.

---

## 🚀 Como Executar a Verificação

### Opção 1: Usando o Arquivo Batch (Windows)

Clique duas vezes no arquivo:
```
VERIFICAR-APIS.bat
```

### Opção 2: Usando NPM

```bash
npm run verificar:apis
```
ou
```bash
npm run check:apis
```

### Opção 3: Executando Diretamente

```bash
node scripts/verificar-apis.js
```

---

## ✅ O Que é Verificado

O script verifica automaticamente:

### 1. 🔌 Conexão PostgreSQL
- Status da conexão
- Informações do banco de dados
- Pool de conexões (total, ociosas, aguardando)
- Versão do PostgreSQL
- Usuário conectado

### 2. 📋 Tabelas do Banco de Dados
Verifica a existência e registros de todas as tabelas:
- ✅ `animais` - Registro de animais
- ✅ `custos` - Custos por animal
- ✅ `gestacoes` - Gestações
- ✅ `nascimentos` - Nascimentos registrados
- ✅ `estoque_semen` - Estoque de sêmen
- ✅ `transferencias_embrioes` - Transferências de embriões
- ✅ `servicos` - Serviços aplicados
- ✅ `notificacoes` - Sistema de notificações
- ✅ `protocolos_reprodutivos` - Protocolos reprodutivos
- ✅ `protocolos_aplicados` - Protocolos aplicados
- ✅ `ciclos_reprodutivos` - Ciclos reprodutivos
- ✅ `relatorios_personalizados` - Relatórios personalizados
- ✅ `notas_fiscais` - Notas fiscais
- ✅ `naturezas_operacao` - Naturezas de operação
- ✅ `origens_receptoras` - Origens e receptoras

### 3. 📊 Estatísticas do Sistema
- Total de animais (ativos e inativos)
- Total de nascimentos
- Estoque de sêmen (touros e doses)
- Custos registrados (quantidade e valor total)

### 4. 🔍 Índices do Banco
- Lista todos os índices criados
- Organizado por tabela

### 5. ⚠️ Alertas do Sistema
Verifica automaticamente:
- Estoque baixo de sêmen (< 5 doses)
- Sêmen esgotado (0 doses)
- Sêmen vencendo nos próximos 30 dias

### 6. 📈 Market API
- Testa a API de preços de mercado
- Exibe preços atuais de gado
- Mostra índices econômicos (Dólar, Milho, etc.)
- Status do mercado (Aberto/Fechado)

---

## 📖 Exemplo de Saída

```
╔══════════════════════════════════════════════════════════╗
║         BEEF-SYNC - VERIFICAÇÃO DE APIS                 ║
║         Sistema de Gestão Pecuária                      ║
╚══════════════════════════════════════════════════════════╝

============================================================
🔌 Verificando Conexão PostgreSQL
============================================================

✅ PostgreSQL Conectado com Sucesso!
   Database: estoque_semen
   Usuário: postgres
   Versão: PostgreSQL 16.0
   Timestamp: 10/10/2025 15:30:45

📊 Pool de Conexões:
   Status: Conectado
   Total: 1
   Ociosas: 1
   Aguardando: 0

============================================================
📋 Verificando Tabelas do Banco de Dados
============================================================

Verificando existência das tabelas...

✅ animais                      - 25 registro(s)
✅ custos                       - 45 registro(s)
✅ gestacoes                    - 10 registro(s)
✅ nascimentos                  - 18 registro(s)
✅ estoque_semen               - 12 registro(s)
...

============================================================
📊 Verificando Estatísticas do Sistema
============================================================

🐄 Animais:
   Total: 25
   Ativos: 22
   Inativos: 3

👶 Nascimentos:
   Total: 18

💉 Estoque de Sêmen:
   Touros: 12
   Doses Disponíveis: 45

💰 Custos:
   Total de Registros: 45
   Valor Total: R$ 125.450,00

============================================================
📈 Verificando Market API (Simulação)
============================================================

Testando obtenção de preços...
✅ Market API Funcional!

💰 Preços Atuais:
   Boi Gordo: R$ 278.50/arroba
   Vaca Gorda: R$ 249.20/arroba
   Bezerro: R$ 1875.00/cabeça

📊 Índices:
   Dólar: R$ 5.62
   Milho: R$ 61.50/saca

🕐 Status do Mercado:
   Mercado Aberto

============================================================
📝 Resumo da Verificação
============================================================

Total de Verificações: 6
✅ Sucesso: 6

============================================================

🎉 TODAS AS APIS ESTÃO CONECTADAS E FUNCIONAIS! 🎉

Data/Hora: 10/10/2025 15:31:02
```

---

## ❌ Resolução de Problemas

### Erro: "Conexão PostgreSQL Falhou"

**Problema**: Banco de dados não está rodando ou configuração incorreta

**Solução**:
1. Verifique se o PostgreSQL está rodando:
   ```bash
   # Windows - Services
   services.msc
   # Procure por "PostgreSQL"
   ```

2. Verifique o arquivo `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=estoque_semen
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   ```

3. Teste a conexão manualmente:
   ```bash
   npm run db:test
   ```

### Erro: "Tabela não existe"

**Problema**: Estrutura do banco não foi criada

**Solução**:
```bash
npm run db:init
```

### Erro: "Market API não retornou dados"

**Problema**: Arquivo do Market API não encontrado ou erro no código

**Solução**:
1. Verifique se o arquivo existe: `services/marketAPI.js`
2. Reinstale as dependências:
   ```bash
   npm install
   ```

---

## 🔧 Comandos Úteis Relacionados

### Testar apenas a conexão do banco:
```bash
npm run db:test
```

### Inicializar o banco de dados:
```bash
npm run db:init
```

### Verificação completa do sistema:
```bash
npm run system:check
```

### Criar backup do banco:
```bash
npm run backup:completo
```

---

## 📊 Interpretando os Resultados

### ✅ Sucesso (Verde)
- A verificação passou com sucesso
- A API está conectada e funcional
- Os dados estão sendo retornados corretamente

### ⚠️ Aviso (Amarelo)
- A verificação detectou algo que precisa de atenção
- Exemplos: estoque baixo, dados vencendo
- O sistema continua funcional

### ❌ Erro (Vermelho)
- A verificação falhou
- A API não está conectada ou há um problema
- Precisa de correção imediata

---

## 🛠️ Manutenção Preventiva

Recomendamos executar a verificação de APIs:

1. **Diariamente**: Antes de começar a usar o sistema
2. **Após atualizações**: Depois de atualizar o código
3. **Após mudanças no banco**: Quando alterar a estrutura do banco
4. **Em caso de problemas**: Quando notar comportamento estranho

---

## 📞 Suporte

Se os problemas persistirem após seguir este guia:

1. Verifique o arquivo de log: `logs/` (se configurado)
2. Execute a verificação completa: `npm run system:check`
3. Revise a documentação: `README.md`
4. Consulte: `ESTADO_APIS_E_CORRECOES.md`

---

## 🎯 Checklist Rápido

Antes de reportar um problema, verifique:

- [ ] PostgreSQL está rodando?
- [ ] Arquivo `.env` está configurado corretamente?
- [ ] As dependências foram instaladas? (`npm install`)
- [ ] O banco foi inicializado? (`npm run db:init`)
- [ ] A verificação de APIs foi executada? (`npm run verificar:apis`)
- [ ] Os logs foram consultados?

---

## 📝 Notas Importantes

1. **Market API**: É uma simulação local, não requer conexão externa
2. **PostgreSQL**: Precisa estar rodando e acessível
3. **Alertas**: São informativos, não bloqueiam o sistema
4. **Performance**: A verificação leva cerca de 2-5 segundos

---

## 🔄 Atualização Automática

O script de verificação é executado automaticamente quando você:

- Inicia o sistema pela primeira vez no dia
- Executa `VERIFICAR-APIS.bat`
- Usa os comandos npm: `npm run verificar:apis` ou `npm run check:apis`

---

**Data da última atualização**: 10/10/2025
**Versão do Beef-Sync**: 0.1.0

