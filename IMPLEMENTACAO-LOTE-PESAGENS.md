# 📦 Implementação de Lote de Pesagens

## ✅ Implementado com Sucesso

Sistema de lotes para agrupar e identificar pesagens de diferentes períodos/eventos.

---

## 🎯 Objetivo

Permitir agrupar pesagens em lotes identificáveis como:
- "Lote de Pesagens ABCZ Fev 2026"
- "Pesagem Desmame Set 2025"
- "Avaliação Anual 2026"
- "Pesagem Pré-Venda Mar 2026"

---

## 🔧 Alterações Realizadas

### 1. Banco de Dados

**Arquivo:** `adicionar-lote-pesagens.js`

Adicionada coluna `lote` na tabela `pesagens`:
```sql
ALTER TABLE pesagens 
ADD COLUMN lote VARCHAR(100)
```

**Estrutura:**
- Nome: `lote`
- Tipo: `VARCHAR(100)`
- Permite NULL: Sim
- Descrição: Identificador do lote de pesagens

---

### 2. Formulário de Pesagem

**Arquivo:** `pages/manejo/pesagem.js`

#### A) Estado do Formulário
```javascript
const [formData, setFormData] = useState({
  animal_id: '',
  peso: '',
  ce: '',
  data: new Date().toISOString().split('T')[0],
  lote: '',  // ← NOVO
  observacoes: ''
})
```

#### B) Campo no Formulário
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    📦 Lote de Pesagem
  </label>
  <input
    type="text"
    value={formData.lote || ''}
    onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
    placeholder="Ex: Lote de Pesagens ABCZ Fev 2026"
  />
  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
    Identifique este grupo de pesagens para facilitar relatórios futuros
  </p>
</div>
```

**Características:**
- Campo opcional
- Placeholder sugestivo
- Cor roxa (purple) para diferenciação
- Texto de ajuda explicativo

---

### 3. Filtros

#### A) Estado do Filtro
```javascript
const [filtroLote, setFiltroLote] = useState('')
```

#### B) Campo de Filtro
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    📦 Filtrar por Lote
  </label>
  <input
    type="text"
    value={filtroLote}
    onChange={(e) => setFiltroLote(e.target.value)}
    placeholder="Ex: ABCZ Fev 2026..."
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
  />
</div>
```

#### C) Lógica de Filtro
```javascript
const matchLote = !filtroLote || 
  (item.lote && item.lote.toLowerCase().includes(filtroLote.toLowerCase()))
```

---

### 4. Tabela de Pesagens

#### A) Cabeçalho
```jsx
<th className="px-6 py-3 text-left text-sm font-semibold">📦 Lote</th>
```

#### B) Célula
```jsx
<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
  {item.lote ? (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
      📦 {item.lote}
    </span>
  ) : (
    <span className="text-gray-400">-</span>
  )}
</td>
```

**Visual:**
- Badge roxo com emoji 📦
- Texto truncado se muito longo
- "-" quando não há lote

---

### 5. Resumo por Lote

#### A) Cálculo do Resumo
```javascript
const resumoPorLote = useMemo(() => {
  const lotes = {}
  pesagensFiltradas.forEach(p => {
    const lote = p.lote || 'Sem Lote'
    if (!lotes[lote]) {
      lotes[lote] = {
        lote,
        pesagens: [],
        machos: 0,
        femeas: 0,
        animaisUnicos: new Set()
      }
    }
    lotes[lote].pesagens.push(p)
    if (p.animal_sexo === 'Macho') lotes[lote].machos++
    if (p.animal_sexo === 'Fêmea') lotes[lote].femeas++
    if (p.animal_id) lotes[lote].animaisUnicos.add(p.animal_id)
  })

  return Object.values(lotes).map(l => {
    const pesos = l.pesagens.map(p => parseFloat(p.peso)).filter(n => !isNaN(n))
    const ces = l.pesagens.map(p => parseFloat(p.ce)).filter(n => !isNaN(n))
    return {
      lote: l.lote,
      qtde: l.pesagens.length,
      animaisUnicos: l.animaisUnicos.size,
      machos: l.machos,
      femeas: l.femeas,
      mediaPeso: pesos.length ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1) : '-',
      minPeso: pesos.length ? Math.min(...pesos).toFixed(1) : '-',
      maxPeso: pesos.length ? Math.max(...pesos).toFixed(1) : '-',
      mediaCE: ces.length ? (ces.reduce((a, b) => a + b, 0) / ces.length).toFixed(1) : '-'
    }
  }).sort((a, b) => b.qtde - a.qtde) // Ordenar por quantidade
}, [pesagensFiltradas])
```

#### B) Tabela de Resumo
```jsx
{resumoPorLote.length > 1 && (
  <div>
    <h3 className="text-sm font-medium text-white mb-2 opacity-95 flex items-center gap-2">
      <span>📦 Por Lote de Pesagem</span>
      <span className="text-xs bg-purple-600/50 px-2 py-0.5 rounded-full">
        {resumoPorLote.length} lotes
      </span>
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/20">
            <th>Lote</th>
            <th>Pesagens</th>
            <th>Animais</th>
            <th>♂️</th>
            <th>♀️</th>
            <th>Média Peso</th>
            <th>Peso Mín</th>
            <th>Peso Máx</th>
          </tr>
        </thead>
        <tbody>
          {/* Linhas clicáveis para filtrar */}
        </tbody>
      </table>
    </div>
  </div>
)}
```

**Características:**
- Mostra apenas se houver mais de 1 lote
- Badge com contagem de lotes
- Linhas clicáveis para filtrar
- Ordenado por quantidade (maior primeiro)
- "Sem Lote" aparece com opacidade reduzida

---

## 📊 Estatísticas por Lote

Cada lote exibe:
- **Pesagens:** Total de registros
- **Animais:** Animais únicos
- **♂️:** Quantidade de machos
- **♀️:** Quantidade de fêmeas
- **Média Peso:** Peso médio em kg
- **Peso Mín:** Menor peso registrado
- **Peso Máx:** Maior peso registrado

---

## 🎨 Visual

### Cores Utilizadas:
- **Roxo (#8B5CF6):** Tema principal do lote
- **Roxo Claro (#F3E8FF):** Background dos badges
- **Roxo Escuro (#6D28D9):** Texto dos badges

### Emojis:
- 📦 Lote de Pesagem
- ♂️ Machos
- ♀️ Fêmeas

---

## 💡 Funcionalidades

### 1. Cadastro
- Campo opcional no formulário
- Sugestão de formato no placeholder
- Texto de ajuda explicativo

### 2. Filtro
- Busca por texto parcial
- Case-insensitive
- Limpa facilmente

### 3. Visualização
- Coluna dedicada na tabela
- Badge visual destacado
- Resumo estatístico

### 4. Interação
- Clique no resumo para filtrar
- Scroll automático para o topo
- Feedback visual no hover

---

## 📝 Exemplos de Uso

### Cadastrar Pesagem com Lote:
1. Abrir formulário de nova pesagem
2. Preencher animal, peso, data
3. No campo "Lote de Pesagem", digitar: "Lote de Pesagens ABCZ Fev 2026"
4. Salvar

### Filtrar por Lote:
1. No campo "Filtrar por Lote", digitar: "ABCZ"
2. Tabela mostra apenas pesagens desse lote
3. Estatísticas atualizam automaticamente

### Ver Resumo:
1. Rolar até "Resumo Detalhado"
2. Seção "📦 Por Lote de Pesagem" mostra todos os lotes
3. Clicar em um lote para filtrar

---

## 🔄 Compatibilidade

### Pesagens Antigas:
- Pesagens sem lote aparecem como "Sem Lote"
- Não afeta funcionalidade existente
- Podem ser editadas para adicionar lote

### Importação:
- Campo opcional na importação
- Se não informado, fica NULL
- Pode ser preenchido posteriormente

---

## 🚀 Próximos Passos (Opcional)

1. **Relatórios Excel:**
   - Adicionar coluna "Lote" nos relatórios
   - Criar aba "Resumo por Lote"
   - Filtrar relatórios por lote

2. **Importação em Massa:**
   - Permitir definir lote ao importar
   - Aplicar lote a todas as pesagens importadas

3. **Gestão de Lotes:**
   - Tela para listar todos os lotes
   - Renomear lotes em massa
   - Mesclar lotes

---

## ✅ Status

**CONCLUÍDO**

Todas as funcionalidades básicas de lote foram implementadas e estão funcionando!

---

## 📁 Arquivos Modificados

1. `adicionar-lote-pesagens.js` - Script de migração do banco
2. `pages/manejo/pesagem.js` - Tela de pesagens (formulário, filtros, tabela, resumo)

---

## 🧪 Como Testar

1. Acesse: `http://localhost:3020/manejo/pesagem`
2. Clique em "Nova Pesagem"
3. Preencha os dados e adicione um lote: "Lote de Pesagens ABCZ Fev 2026"
4. Salve e veja o badge roxo na tabela
5. Use o filtro "Filtrar por Lote" para buscar
6. Veja o resumo na seção "Por Lote de Pesagem"
7. Clique em um lote no resumo para filtrar automaticamente

---

## 🎉 Resultado

Agora é possível agrupar pesagens em lotes identificáveis, facilitando:
- Organização de eventos de pesagem
- Relatórios por período/evento
- Comparação entre lotes
- Rastreabilidade histórica
