# Boletim Defesa - Sistema de Quantidades de Gado

## 📋 Descrição

Sistema para controle de quantidades de gado na defesa, organizado por faixas etárias e separado por sexo (Machos e Fêmeas).

## 🚀 Funcionalidades

### Desktop (Completo)
- ✅ Cadastro de múltiplas fazendas
- ✅ Edição em tempo real das quantidades
- ✅ Cálculo automático de subtotais e totais
- ✅ Exportação para Excel (individual e consolidado)
- ✅ Interface responsiva com dark mode

### Mobile (Visualização)
- ✅ Visualização otimizada para celular
- ✅ Cards por faixa etária
- ✅ Totais em destaque
- ✅ Atualização em tempo real

## 📊 Faixas Etárias

- **0 a 3 meses**
- **3 a 8 meses**
- **8 a 12 meses**
- **12 a 24 meses**
- **25 a 36 meses**
- **Acima de 36 meses**

Cada faixa possui contadores separados para:
- **M** (Machos)
- **F** (Fêmeas)

## 🔧 Instalação

### 1. Criar a tabela no banco de dados

```bash
node criar-tabela-boletim-defesa.js
```

Este script irá:
- Criar a tabela `boletim_defesa_fazendas`
- Criar índices para otimização
- Inserir dados de exemplo (2 fazendas)

### 2. Acessar o sistema

**Desktop:**
- Menu lateral: `Boletim Defesa > Dashboard`
- URL: `/boletim-defesa`

**Mobile:**
- Acessar "Relatórios Mobile"
- Clicar no card "Boletim Defesa" (destaque em verde-azulado)
- URL: `/boletim-defesa/mobile`

## 📱 Como Usar

### Adicionar Nova Fazenda

1. Acesse `/boletim-defesa`
2. Clique em "Nova Fazenda"
3. Preencha:
   - Nome da Fazenda
   - CNPJ
4. Clique em "Cadastrar"

### Editar Quantidades

1. Na tela principal, localize a fazenda
2. Clique nos campos numéricos para editar
3. As alterações são salvas automaticamente
4. Os subtotais e totais são recalculados em tempo real

### Exportar para Excel

1. Clique no botão "Exportar Excel"
2. O arquivo será baixado com:
   - Uma aba para cada fazenda
   - Uma aba "CONSOLIDADO" com todas as fazendas
   - Formatação similar à planilha original

## 🗄️ Estrutura do Banco de Dados

```sql
CREATE TABLE boletim_defesa_fazendas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(50) NOT NULL UNIQUE,
  quantidades JSONB DEFAULT '{...}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Estrutura do JSONB `quantidades`:

```json
{
  "0a3": { "M": 0, "F": 0 },
  "3a8": { "M": 0, "F": 0 },
  "8a12": { "M": 0, "F": 0 },
  "12a24": { "M": 0, "F": 0 },
  "25a36": { "M": 0, "F": 0 },
  "acima36": { "M": 0, "F": 0 }
}
```

## 🎨 Interface

### Desktop
- Tabela editável com células de input
- Cores diferenciadas:
  - Azul para Machos
  - Rosa para Fêmeas
  - Amarelo para Subtotais
  - Vermelho para Total Geral
- Cabeçalho com nome e CNPJ da fazenda

### Mobile
- Cards por faixa etária
- Total geral em destaque no topo
- Cores vibrantes para melhor visualização
- Layout otimizado para toque

## 📂 Arquivos Criados

```
pages/
  boletim-defesa/
    index.js              # Página principal (desktop)
    nova-fazenda.js       # Formulário de cadastro
    mobile.js             # Versão mobile
  api/
    boletim-defesa/
      index.js            # API principal (GET, PUT)
      fazendas.js         # API de fazendas (POST, DELETE)
  mobile-relatorios.js    # Adicionado card do Boletim Defesa

components/
  layout/
    ModernSidebar.tsx     # Adicionado menu "Boletim Defesa"

criar-tabela-boletim-defesa.js  # Script de migração
```

## 🔐 Permissões

O sistema está acessível para todos os usuários autenticados. Não há restrições especiais de permissão.

## 📊 Exemplo de Dados

### Fazenda Sant Anna - Rancharia
- CNPJ: 44.017.440/0010-18
- Total: 1295 animais
  - Machos: 490
  - Fêmeas: 805

### Agropecuária Pardinho LTDA
- CNPJ: 18.978.214/0004-45
- Total: 1403 animais
  - Machos: 244
  - Fêmeas: 1159

## 🚀 Próximas Melhorias (Sugestões)

- [ ] Histórico de alterações
- [ ] Gráficos de evolução temporal
- [ ] Comparação entre fazendas
- [ ] Alertas de quantidades críticas
- [ ] Exportação em PDF
- [ ] Importação de dados via Excel
- [ ] Relatórios consolidados por período

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
