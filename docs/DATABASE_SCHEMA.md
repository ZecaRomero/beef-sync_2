# Documentação do Schema do Banco de Dados PostgreSQL

## Beef Sync - Sistema de Gerenciamento Pecuário

**Versão:** 3.0.0  
**SGBD:** PostgreSQL 12+  
**Charset:** UTF-8

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Diagrama ER](#diagrama-er)
3. [Tabelas Principais](#tabelas-principais)
4. [Relacionamentos](#relacionamentos)
5. [Índices e Performance](#índices-e-performance)
6. [Constraints e Validações](#constraints-e-validações)
7. [Triggers e Funções](#triggers-e-funções)
8. [Migrations](#migrations)

---

## Visão Geral

O banco de dados do Beef Sync é organizado em módulos funcionais:

- **Animais**: Cadastro e gestão do rebanho
- **Reprodução**: Gestações, nascimentos, sêmen e embriões
- **Financeiro**: Custos, notas fiscais e contabilidade
- **Operacional**: Localizações, serviços e protocolos
- **Auditoria**: Sistema de lotes e rastreamento

---

## Tabelas Principais

### 1. ANIMAIS

Armazena informações completas sobre cada animal do rebanho.

```sql
CREATE TABLE animais (
  id SERIAL PRIMARY KEY,
  serie VARCHAR(10) NOT NULL,
  rg VARCHAR(20) NOT NULL,
  tatuagem VARCHAR(20),
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('Macho', 'Fêmea')),
  raca VARCHAR(50) NOT NULL,
  data_nascimento DATE,
  hora_nascimento TIME,
  peso DECIMAL(6,2),
  cor VARCHAR(30),
  tipo_nascimento VARCHAR(20),
  dificuldade_parto VARCHAR(20),
  meses INTEGER,
  situacao VARCHAR(20) DEFAULT 'Ativo' CHECK (situacao IN ('Ativo', 'Vendido', 'Morto', 'Transferido')),
  pai VARCHAR(50),
  mae VARCHAR(50),
  receptora VARCHAR(50),
  is_fiv BOOLEAN DEFAULT false,
  custo_total DECIMAL(12,2) DEFAULT 0,
  valor_venda DECIMAL(12,2),
  valor_real DECIMAL(12,2),
  veterinario VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(serie, rg)
);
```

**Índices:**
- `idx_animais_serie_rg` (serie, rg)
- `idx_animais_situacao` (situacao)
- `idx_animais_raca` (raca)

**Campos Principais:**
- `serie + rg`: Identificação única do animal (brinco)
- `sexo`: Macho ou Fêmea
- `situacao`: Status atual do animal
- `is_fiv`: Indica se é produto de FIV (Fertilização in Vitro)
- `custo_total`: Acumulado de todos os custos do animal

---

### 2. CUSTOS

Registra todos os custos associados aos animais.

```sql
CREATE TABLE custos (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  subtipo VARCHAR(50),
  valor DECIMAL(12,2) NOT NULL,
  data DATE NOT NULL,
  observacoes TEXT,
  detalhes JSONB,
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_custos_animal_id` (animal_id)

**Tipos de Custo Comuns:**
- Medicamento
- Vacina
- Alimentação
- Veterinário
- Reprodução
- Transporte

---

### 3. LOCALIZACOES_ANIMAIS

Rastreia a movimentação dos animais entre piquetes.

```sql
CREATE TABLE localizacoes_animais (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  piquete VARCHAR(50) NOT NULL,
  data_entrada DATE NOT NULL,
  data_saida DATE,
  motivo_movimentacao VARCHAR(100),
  observacoes TEXT,
  usuario_responsavel VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_localizacoes_animal_id` (animal_id)
- `idx_localizacoes_piquete` (piquete)
- `idx_localizacoes_data_entrada` (data_entrada)

**Regra de Negócio:**
- Um animal pode ter apenas uma localização ativa (data_saida IS NULL)
- Ao mover animal, finaliza localização atual e cria nova

---

### 4. GESTACOES

Controla gestações do rebanho.

```sql
CREATE TABLE gestacoes (
  id SERIAL PRIMARY KEY,
  pai_serie VARCHAR(10),
  pai_rg VARCHAR(20),
  mae_serie VARCHAR(10),
  mae_rg VARCHAR(20),
  receptora_nome VARCHAR(100),
  receptora_serie VARCHAR(10),
  receptora_rg VARCHAR(20),
  data_cobertura DATE NOT NULL,
  custo_acumulado DECIMAL(12,2) DEFAULT 0,
  situacao VARCHAR(20) DEFAULT 'Ativa' CHECK (situacao IN ('Ativa', 'Nasceu', 'Perdeu', 'Cancelada')),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_gestacoes_situacao` (situacao)

**Situações:**
- `Ativa`: Gestação em andamento
- `Nasceu`: Gestação finalizada com nascimento
- `Perdeu`: Aborto/perda
- `Cancelada`: Gestação cancelada

---

### 5. NASCIMENTOS

Registra nascimentos de animais.

```sql
CREATE TABLE nascimentos (
  id SERIAL PRIMARY KEY,
  gestacao_id INTEGER REFERENCES gestacoes(id) ON DELETE SET NULL,
  serie VARCHAR(10) NOT NULL,
  rg VARCHAR(20) NOT NULL,
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('Macho', 'Fêmea')),
  data_nascimento DATE NOT NULL,
  hora_nascimento TIME,
  peso DECIMAL(6,2),
  cor VARCHAR(30),
  tipo_nascimento VARCHAR(20),
  dificuldade_parto VARCHAR(20),
  custo_nascimento DECIMAL(12,2) DEFAULT 0,
  veterinario VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relacionamento:**
- Pode estar vinculado a uma gestação
- Ao registrar nascimento, pode criar automaticamente o animal

---

### 6. ESTOQUE_SEMEN

Gerencia o estoque de sêmen bovino.

```sql
CREATE TABLE estoque_semen (
  id SERIAL PRIMARY KEY,
  nome_touro VARCHAR(100) NOT NULL,
  rg_touro VARCHAR(20),
  raca VARCHAR(50),
  localizacao VARCHAR(100),
  rack_touro VARCHAR(20),
  botijao VARCHAR(20),
  caneca VARCHAR(20),
  tipo_operacao VARCHAR(20) DEFAULT 'entrada' CHECK (tipo_operacao IN ('entrada', 'saida', 'uso')),
  fornecedor VARCHAR(100),
  destino VARCHAR(100),
  numero_nf VARCHAR(50),
  valor_compra DECIMAL(12,2) DEFAULT 0,
  data_compra DATE,
  quantidade_doses INTEGER DEFAULT 0,
  doses_disponiveis INTEGER DEFAULT 0,
  doses_usadas INTEGER DEFAULT 0,
  certificado VARCHAR(100),
  data_validade DATE,
  origem VARCHAR(100),
  linhagem VARCHAR(100),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'esgotado', 'vencido')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_semen_status` (status)
- `idx_semen_nome_touro` (nome_touro)

**Controle de Doses:**
- `quantidade_doses`: Total de doses compradas
- `doses_disponiveis`: Doses ainda disponíveis
- `doses_usadas`: Doses já utilizadas

---

### 7. MORTES

Registra óbitos de animais.

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

**Processo:**
1. Registrar morte
2. Atualizar situação do animal para 'Morto'
3. Calcular valor_perda (custo_total do animal)
4. Registrar no boletim contábil

---

### 8. CAUSAS_MORTE

Tabela lookup para causas de morte padronizadas.

```sql
CREATE TABLE causas_morte (
  id SERIAL PRIMARY KEY,
  causa VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Causas Padrão:**
- Doença
- Acidente
- Parto
- Predação
- Intoxicação
- Desnutrição
- Idade avançada
- Problemas cardíacos
- Problemas respiratórios
- Outros

---

### 9. NOTAS_FISCAIS

Gerencia notas fiscais de entrada e saída.

```sql
CREATE TABLE notas_fiscais (
  id SERIAL PRIMARY KEY,
  numero_nf VARCHAR(50) NOT NULL,
  data_compra DATE NOT NULL,
  data DATE,
  origem VARCHAR(200),
  fornecedor VARCHAR(200),
  destino VARCHAR(200),
  valor_total DECIMAL(12,2) DEFAULT 0,
  quantidade_receptoras INTEGER,
  valor_por_receptora DECIMAL(12,2),
  observacoes TEXT,
  natureza_operacao VARCHAR(100),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  tipo_produto VARCHAR(20) DEFAULT 'bovino' CHECK (tipo_produto IN ('bovino', 'semen', 'embriao')),
  itens JSONB DEFAULT '[]',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_nf_numero` (numero_nf)
- `idx_nf_data` (data_compra)

**Campo JSONB 'itens':**
```json
[
  {
    "tatuagem": "A-123",
    "sexo": "Macho",
    "era": "13/24",
    "raca": "Nelore",
    "peso": 450.0,
    "valorUnitario": 5000.00,
    "tipoProduto": "bovino"
  }
]
```

---

### 10. BOLETIM_CONTABIL

Agrupa movimentações contábeis por período.

```sql
CREATE TABLE boletim_contabil (
  id SERIAL PRIMARY KEY,
  periodo VARCHAR(7) NOT NULL UNIQUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  data_fechamento TIMESTAMP,
  resumo JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_boletim_periodo` (periodo)

**Formato do Período:** `YYYY-MM` (ex: `2025-10`)

---

### 11. MOVIMENTACOES_CONTABEIS

Registra todas as movimentações financeiras.

```sql
CREATE TABLE movimentacoes_contabeis (
  id SERIAL PRIMARY KEY,
  boletim_id INTEGER REFERENCES boletim_contabil(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'custo', 'receita')),
  subtipo VARCHAR(50) NOT NULL,
  data_movimento DATE NOT NULL,
  animal_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
  valor DECIMAL(12,2) DEFAULT 0,
  descricao TEXT,
  observacoes TEXT,
  dados_extras JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_movimentacoes_boletim` (boletim_id)
- `idx_movimentacoes_tipo` (tipo)
- `idx_movimentacoes_data` (data_movimento)
- `idx_movimentacoes_animal` (animal_id)

---

### 12. SERVICOS

Gerencia serviços prestados aos animais.

```sql
CREATE TABLE servicos (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Vacinação', 'Nutrição', 'Reprodução', 'Tratamento', 'Manutenção', 'Outro')),
  descricao TEXT NOT NULL,
  data_aplicacao DATE NOT NULL,
  custo DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Ativo', 'Concluído', 'Pendente', 'Cancelado')),
  responsavel VARCHAR(100) DEFAULT 'Não informado',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_servicos_animal_id` (animal_id)
- `idx_servicos_tipo` (tipo)
- `idx_servicos_data` (data_aplicacao)

---

### 13. TRANSFERENCIAS_EMBRIOES

Registra transferências de embriões (TE).

```sql
CREATE TABLE transferencias_embrioes (
  id SERIAL PRIMARY KEY,
  numero_te VARCHAR(50) NOT NULL UNIQUE,
  data_te DATE NOT NULL,
  receptora_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
  doadora_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
  touro_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
  local_te VARCHAR(100),
  data_fiv DATE,
  raca VARCHAR(50),
  tecnico_responsavel VARCHAR(100),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'realizada' CHECK (status IN ('realizada', 'cancelada', 'pendente')),
  resultado VARCHAR(20) CHECK (resultado IN ('positivo', 'negativo', 'pendente')),
  data_diagnostico DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_te_numero` (numero_te)
- `idx_te_data` (data_te)
- `idx_te_status` (status)

---

### 14. LOTES_OPERACOES

Sistema de auditoria - rastreia todas as operações do sistema.

```sql
CREATE TABLE lotes_operacoes (
  id SERIAL PRIMARY KEY,
  numero_lote VARCHAR(20) UNIQUE NOT NULL,
  tipo_operacao VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  detalhes JSONB,
  usuario VARCHAR(100),
  quantidade_registros INTEGER DEFAULT 1,
  modulo VARCHAR(50) NOT NULL,
  ip_origem INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'concluido',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Módulos:**
- ANIMAIS
- CONTABILIDADE
- GESTACAO
- NASCIMENTOS
- MORTES
- SEMEN
- RECEPTORAS
- TRANSFERENCIAS
- SISTEMA

**Formato do número_lote:** `LOTE-20251024-1729779600000-XXXX`

---

### 15. NOTIFICACOES

Sistema de notificações do aplicativo.

```sql
CREATE TABLE notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('nascimento', 'estoque', 'gestacao', 'saude', 'financeiro', 'sistema')),
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  prioridade VARCHAR(10) DEFAULT 'medium' CHECK (prioridade IN ('low', 'medium', 'high')),
  lida BOOLEAN DEFAULT false,
  dados_extras JSONB,
  animal_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_notificacoes_lida` (lida)
- `idx_notificacoes_tipo` (tipo)

---

## Relacionamentos

### Diagrama de Relacionamentos Principais

```
animais (1) ----< (N) custos
animais (1) ----< (N) localizacoes_animais
animais (1) ----< (N) servicos
animais (1) ----< (N) mortes
animais (1) ----< (N) movimentacoes_contabeis

gestacoes (1) ----< (N) nascimentos

boletim_contabil (1) ----< (N) movimentacoes_contabeis

animais (1) ----< (N) transferencias_embrioes (receptora)
animais (1) ----< (N) transferencias_embrioes (doadora)
animais (1) ----< (N) transferencias_embrioes (touro)
```

### Foreign Keys com CASCADE

Ao deletar um animal:
- ✅ Custos são deletados (CASCADE)
- ✅ Localizações são deletadas (CASCADE)
- ✅ Mortes são deletadas (CASCADE)
- ⚠️  Serviços mantêm o registro, mas animal_id fica NULL (SET NULL)
- ⚠️  Movimentações contábeis mantêm o registro (SET NULL)

---

## Índices e Performance

### Estratégia de Indexação

1. **Chaves Primárias**: Índice automático (SERIAL PRIMARY KEY)
2. **Foreign Keys**: Índices explícitos para joins
3. **Campos de Busca**: Índices em campos filtrados frequentemente
4. **Campos de Ordenação**: Índices em data_criacao, data_nascimento

### Índices Principais

```sql
-- Animais
CREATE INDEX idx_animais_serie_rg ON animais(serie, rg);
CREATE INDEX idx_animais_situacao ON animais(situacao);
CREATE INDEX idx_animais_raca ON animais(raca);

-- Custos
CREATE INDEX idx_custos_animal_id ON custos(animal_id);

-- Localizações
CREATE INDEX idx_localizacoes_animal_id ON localizacoes_animais(animal_id);
CREATE INDEX idx_localizacoes_piquete ON localizacoes_animais(piquete);
CREATE INDEX idx_localizacoes_data_entrada ON localizacoes_animais(data_entrada);

-- Gestações
CREATE INDEX idx_gestacoes_situacao ON gestacoes(situacao);

-- Sêmen
CREATE INDEX idx_semen_status ON estoque_semen(status);
CREATE INDEX idx_semen_nome_touro ON estoque_semen(nome_touro);

-- Notas Fiscais
CREATE INDEX idx_nf_numero ON notas_fiscais(numero_nf);
CREATE INDEX idx_nf_data ON notas_fiscais(data_compra);

-- Transferências
CREATE INDEX idx_te_numero ON transferencias_embrioes(numero_te);
CREATE INDEX idx_te_data ON transferencias_embrioes(data_te);
CREATE INDEX idx_te_status ON transferencias_embrioes(status);

-- Serviços
CREATE INDEX idx_servicos_animal_id ON servicos(animal_id);
CREATE INDEX idx_servicos_tipo ON servicos(tipo);
CREATE INDEX idx_servicos_data ON servicos(data_aplicacao);

-- Notificações
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo);

-- Protocolos
CREATE INDEX idx_protocolos_aplicados_animal_id ON protocolos_aplicados(animal_id);
CREATE INDEX idx_ciclos_animal_id ON ciclos_reprodutivos(animal_id);

-- Boletim Contábil
CREATE INDEX idx_boletim_periodo ON boletim_contabil(periodo);
CREATE INDEX idx_movimentacoes_boletim ON movimentacoes_contabeis(boletim_id);
CREATE INDEX idx_movimentacoes_tipo ON movimentacoes_contabeis(tipo);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_contabeis(data_movimento);
CREATE INDEX idx_movimentacoes_animal ON movimentacoes_contabeis(animal_id);
```

---

## Constraints e Validações

### CHECK Constraints

```sql
-- Validação de Sexo
CHECK (sexo IN ('Macho', 'Fêmea'))

-- Validação de Situação
CHECK (situacao IN ('Ativo', 'Vendido', 'Morto', 'Transferido'))

-- Validação de Status de Serviço
CHECK (status IN ('Ativo', 'Concluído', 'Pendente', 'Cancelado'))

-- Validação de Tipo de NF
CHECK (tipo IN ('entrada', 'saida'))

-- Validação de Produto
CHECK (tipo_produto IN ('bovino', 'semen', 'embriao'))
```

### UNIQUE Constraints

```sql
-- Identificação única de animais
UNIQUE(serie, rg) -- em animais

-- Número de lote único
UNIQUE(numero_lote) -- em lotes_operacoes

-- Número de TE único
UNIQUE(numero_te) -- em transferencias_embrioes

-- Causas de morte únicas
UNIQUE(causa) -- em causas_morte
```

### NOT NULL Constraints

Campos obrigatórios principais:
- `animais`: serie, rg, sexo, raca
- `custos`: animal_id, tipo, valor, data
- `gestacoes`: data_cobertura
- `nascimentos`: serie, rg, sexo, data_nascimento
- `mortes`: data_morte, causa_morte
- `notas_fiscais`: numero_nf, data_compra, tipo

---

## Queries Comuns

### Buscar Animais Ativos

```sql
SELECT * FROM animais 
WHERE situacao = 'Ativo'
ORDER BY data_nascimento DESC;
```

### Custos Totais por Animal

```sql
SELECT 
  a.serie, a.rg,
  SUM(c.valor) as custo_total
FROM animais a
LEFT JOIN custos c ON a.id = c.animal_id
WHERE a.situacao = 'Ativo'
GROUP BY a.id, a.serie, a.rg
ORDER BY custo_total DESC;
```

### Gestações Ativas

```sql
SELECT * FROM gestacoes 
WHERE situacao = 'Ativa'
ORDER BY data_cobertura;
```

### Localização Atual dos Animais

```sql
SELECT 
  a.serie, a.rg, a.sexo, a.raca,
  l.piquete, l.data_entrada
FROM animais a
INNER JOIN localizacoes_animais l ON a.id = l.animal_id
WHERE l.data_saida IS NULL
  AND a.situacao = 'Ativo'
ORDER BY l.piquete, a.serie, a.rg;
```

### Sêmen Disponível

```sql
SELECT 
  nome_touro, raca, 
  doses_disponiveis,
  botijao, caneca
FROM estoque_semen
WHERE status = 'disponivel'
  AND doses_disponiveis > 0
ORDER BY nome_touro;
```

---

## Boas Práticas

### 1. Usar Prepared Statements

```javascript
// ✅ CORRETO
const result = await pool.query(
  'SELECT * FROM animais WHERE id = $1',
  [animalId]
);

// ❌ INCORRETO (SQL Injection)
const result = await pool.query(
  `SELECT * FROM animais WHERE id = ${animalId}`
);
```

### 2. Usar Transações para Operações Múltiplas

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Operação 1
  await client.query('INSERT INTO animais ...');
  
  // Operação 2
  await client.query('INSERT INTO localizacoes_animais ...');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### 3. Liberar Conexões

```javascript
const client = await pool.connect();
try {
  const result = await client.query('SELECT ...');
  return result.rows;
} finally {
  client.release(); // SEMPRE liberar
}
```

### 4. Usar JSONB para Dados Flexíveis

```sql
-- Busca em campo JSONB
SELECT * FROM notas_fiscais
WHERE itens @> '[{"sexo": "Macho"}]';

-- Extração de dados JSONB
SELECT 
  numero_nf,
  jsonb_array_elements(itens)->>'tatuagem' as tatuagem
FROM notas_fiscais;
```

---

## Manutenção

### Vacuum Regular

```sql
-- Vacuum completo
VACUUM FULL ANALYZE;

-- Vacuum por tabela
VACUUM ANALYZE animais;
```

### Backup

```bash
# Backup completo
pg_dump -h localhost -U postgres -d estoque_semen > backup.sql

# Backup somente schema
pg_dump -h localhost -U postgres -d estoque_semen --schema-only > schema.sql

# Backup somente dados
pg_dump -h localhost -U postgres -d estoque_semen --data-only > dados.sql
```

### Restore

```bash
# Restaurar backup
psql -h localhost -U postgres -d estoque_semen < backup.sql
```

---

## Contato e Suporte

Para dúvidas sobre o schema:
- Consulte o código em `lib/database.js`
- Verifique os scripts de migração em `scripts/`
- Execute `npm run db:validate` para validar o schema

---

**Última atualização:** 24/10/2025  
**Versão do Documento:** 1.0

