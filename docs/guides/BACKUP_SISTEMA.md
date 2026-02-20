# 💾 Sistema de Backup - Beef Sync

## 📋 Visão Geral

O sistema de backup do Beef Sync permite salvar todos os dados do PostgreSQL em arquivos JSON ou SQL para restauração futura.

## 🎯 Funcionalidades

### 1. **Interface Web** (Página de Backup)
Acesse pelo menu: `Backup > Sistema de Backup`

**Recursos:**
- ✅ Seleção de tipo de backup (completo, animais, reprodutivo, comercial, financeiro)
- ✅ Escolha de formato (JSON ou SQL)
- ✅ Opção de salvar arquivo no servidor
- ✅ Download direto do backup
- ✅ Histórico de backups realizados
- ✅ Visualização de metadados (registros, tabelas, tamanho)

### 2. **API REST**
Endpoints disponíveis:

```bash
# GET - Gerar backup (retorna JSON)
GET /api/backup?tipo=completo&formato=json

# POST - Criar e salvar backup
POST /api/backup
Body: {
  "tipo": "completo",
  "formato": "json",
  "salvarArquivo": true
}
```

### 3. **Script de Linha de Comando**
Execute via terminal:

```bash
# Backup completo em JSON
npm run backup

# Backup completo em JSON (explícito)
npm run backup:completo

# Backup completo em SQL
npm run backup:sql

# Backup customizado
node scripts/backup-database.js [tipo] [formato]
```

## 📊 Tipos de Backup

### 1. **Completo** (Recomendado)
Inclui todas as tabelas do sistema:
- Animais
- Custos
- Gestações
- Nascimentos
- Estoque de Sêmen
- Protocolos Aplicados
- Transferências de Embriões
- Protocolos Reprodutivos
- Ciclos Reprodutivos
- Relatórios Personalizados
- Notificações
- Notas Fiscais
- Serviços
- Naturezas de Operação
- Origens de Receptoras

**Quando usar:** Backup semanal ou antes de atualizações importantes

### 2. **Animais**
Inclui apenas dados relacionados aos animais:
- Animais
- Custos
- Gestações
- Nascimentos

**Quando usar:** Backup diário dos dados principais

### 3. **Reprodutivo**
Foco em dados reprodutivos:
- Transferências de Embriões
- Protocolos Reprodutivos
- Ciclos Reprodutivos
- Gestações
- Nascimentos
- Estoque de Sêmen
- Protocolos Aplicados

**Quando usar:** Antes de sincronizações ou importações

### 4. **Comercial**
Dados comerciais e fiscais:
- Notas Fiscais
- Serviços
- Naturezas de Operação
- Origens de Receptoras

**Quando usar:** Final do mês ou antes de envios contábeis

### 5. **Financeiro**
Dados financeiros resumidos:
- Animais (apenas campos financeiros)
- Custos
- Notas Fiscais
- Serviços

**Quando usar:** Para análises financeiras ou auditorias

## 📄 Formatos de Backup

### JSON
```json
{
  "metadata": {
    "tipo": "completo",
    "dataCriacao": "2024-10-08T12:00:00.000Z",
    "versao": "1.0",
    "totalRegistros": 1250,
    "tabelas": ["animais", "custos", "gestacoes", ...],
    "arquivoSalvo": "backup_completo_2024-10-08.json",
    "tamanhoArquivo": 2621440
  },
  "data": {
    "animais": [...],
    "custos": [...],
    ...
  }
}
```

**Vantagens:**
- Fácil de ler e editar
- Compatível com JavaScript/Node.js
- Permite inspeção manual dos dados

**Quando usar:** Backup padrão, análise de dados, importações

### SQL
```sql
-- Backup do Sistema Beef-Sync
-- Gerado em: 2024-10-08T12:00:00.000Z

-- Tabela: animais
DELETE FROM animais;
INSERT INTO animais (id, serie, rg, ...) VALUES
(1, 'RPT', '12345', ...),
(2, 'CJCJ', '67890', ...);

-- Tabela: custos
DELETE FROM custos;
...
```

**Vantagens:**
- Restauração direta no PostgreSQL
- Formato padrão de banco de dados
- Compatível com ferramentas SQL

**Quando usar:** Migração de banco, restauração completa

## 🚀 Como Usar

### Via Interface Web

1. **Acessar página de backup:**
   - Menu lateral → Backup
   - Ou navegue para `/backup`

2. **Selecionar opções:**
   - Escolha o tipo de backup
   - Escolha o formato (JSON ou SQL)
   - Marque "Salvar arquivo no servidor" se desejar

3. **Criar backup:**
   - Clique em "Criar Backup"
   - Aguarde processamento
   - Download automático ou visualize metadados

4. **Baixar backup anterior:**
   - Veja o histórico de backups
   - Clique no ícone de download

### Via Linha de Comando

```bash
# 1. Backup completo rápido
npm run backup

# 2. Backup completo em SQL
npm run backup:sql

# 3. Backup de animais em JSON
node scripts/backup-database.js animais json

# 4. Backup reprodutivo em SQL
node scripts/backup-database.js reprodutivo sql

# 5. Backup comercial em JSON
node scripts/backup-database.js comercial json
```

**Saída exemplo:**
```
🔄 Iniciando backup do banco de dados...
📋 Tipo: completo
📄 Formato: json

🔌 Testando conexão com banco de dados...
✅ Conexão estabelecida!

📦 Gerando backup...
   ✓ animais: 450 registros
   ✓ custos: 320 registros
   ✓ gestacoes: 85 registros
   ...

✅ Backup concluído com sucesso!

📊 Estatísticas:
   • Total de registros: 1250
   • Tabelas: 15
   • Tamanho: 2.50 MB

💾 Arquivo salvo:
   C:\Beef-Sync\backups\backup_completo_2024-10-08_120000.json
```

### Via API (Programaticamente)

```javascript
// Exemplo usando fetch
async function criarBackup() {
  const response = await fetch('/api/backup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'completo',
      formato: 'json',
      salvarArquivo: true
    })
  });

  const backup = await response.json();
  console.log('Backup criado:', backup.metadata);
}
```

## 📁 Localização dos Backups

Todos os backups são salvos em:
```
Beef-Sync/
└── backups/
    ├── backup_completo_2024-10-08_120000.json
    ├── backup_animais_2024-10-08_130000.json
    ├── backup_completo_2024-10-08_140000.sql
    └── ...
```

## ⚙️ Configuração

### Diretório de Backup
Configurável em `.env`:
```bash
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
```

### Retenção Automática
Por padrão, backups são mantidos por **30 dias**.

Para limpar backups antigos manualmente:
```bash
# Windows
cd backups
del /Q backup_*.json

# Linux/Mac
rm backups/backup_*.json
```

## 🔄 Restauração de Backup

### Restaurar JSON
```javascript
// Carregar dados do backup
const backup = require('./backups/backup_completo_2024-10-08.json');
const dados = backup.data;

// Inserir no banco (usar suas funções de insert)
for (const animal of dados.animais) {
  await insertAnimal(animal);
}
```

### Restaurar SQL
```bash
# PostgreSQL
psql -U postgres -d beefsync < backups/backup_completo_2024-10-08.sql
```

## 📅 Agenda Recomendada de Backups

| Frequência | Tipo | Formato | Quando |
|------------|------|---------|--------|
| **Diário** | Animais | JSON | Todo dia às 23h |
| **Semanal** | Completo | JSON + SQL | Domingos às 22h |
| **Mensal** | Completo | SQL | Último dia do mês |
| **Antes de Atualizações** | Completo | SQL | Antes de updates |
| **Antes de Importações** | Reprodutivo | JSON | Antes de sincronizar |

## 🛡️ Boas Práticas

1. **Faça backups regulares**
   - Mínimo: backup semanal completo
   - Recomendado: backup diário

2. **Mantenha múltiplas cópias**
   - Servidor local
   - Cloud storage (Google Drive, Dropbox)
   - Disco externo

3. **Teste restaurações**
   - Teste mensalmente se consegue restaurar
   - Valide integridade dos dados

4. **Monitore tamanho dos backups**
   - Se crescer muito, considere backups incrementais
   - Limpe backups antigos regularmente

5. **Documente recuperações**
   - Mantenha log de quando fez backup
   - Documente procedimento de restauração

## 🚨 Troubleshooting

### Erro: "Falha na conexão com banco"
```bash
# Verificar se PostgreSQL está rodando
npm run db:test

# Verificar variáveis de ambiente
cat .env
```

### Erro: "Permissão negada ao salvar arquivo"
```bash
# Criar diretório de backup manualmente
mkdir backups

# Dar permissões (Linux/Mac)
chmod 755 backups
```

### Backup muito grande
- Use backup parcial (animais, comercial, etc)
- Comprima arquivo após gerar
- Configure limpeza automática de dados antigos

### Backup corrompido
- Sempre gere em JSON E SQL
- Mantenha múltiplas versões
- Valide JSON antes de confiar:
```bash
node -e "require('./backups/backup.json')"
```

## 📞 Suporte

Para problemas com backup:
1. Verifique logs do sistema
2. Execute teste de conexão: `npm run db:test`
3. Verifique espaço em disco
4. Consulte documentação do PostgreSQL

## 🎯 Exemplo Completo

```bash
# 1. Criar backup completo
npm run backup

# 2. Verificar arquivo criado
ls -lh backups/

# 3. Copiar para local seguro
cp backups/backup_*.json /caminho/seguro/

# 4. Testar restauração (ambiente de teste)
# ... código de restauração ...

# 5. Agendar backup automático (cron/task scheduler)
# Diário às 23h:
# 0 23 * * * cd /caminho/beef-sync && npm run backup
```

---

**Versão**: 3.0.0  
**Última atualização**: Outubro 2024  
**Mantido por**: Equipe Beef Sync
