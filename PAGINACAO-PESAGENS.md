# 📄 Paginação na Tabela de Pesagens

## ✅ Implementado com Sucesso

Sistema de paginação completo para a tabela de pesagens, mostrando 15 itens por página por padrão.

---

## 🎯 Objetivo

Melhorar a performance e usabilidade da tabela de pesagens, evitando carregar centenas de linhas de uma vez.

---

## 🔧 Implementação

### 1. Estados Adicionados

```javascript
const [paginaAtual, setPaginaAtual] = useState(1)
const [itensPorPagina, setItensPorPagina] = useState(15)
```

**Valores:**
- `paginaAtual`: Página atual sendo exibida (inicia em 1)
- `itensPorPagina`: Quantidade de itens por página (padrão: 15)

---

### 2. Lógica de Paginação

```javascript
// Cálculos
const totalPaginas = Math.ceil(pesagensFiltradas.length / itensPorPagina)
const indiceInicio = (paginaAtual - 1) * itensPorPagina
const indiceFim = indiceInicio + itensPorPagina
const pesagensPaginadas = pesagensFiltradas.slice(indiceInicio, indiceFim)

// Resetar para página 1 quando filtros mudarem
useEffect(() => {
  setPaginaAtual(1)
}, [filtroAnimal, filtroData, filtroLote, filtroSexo, filtroLocal, 
    filtroPesoMin, filtroPesoMax, filtroDataInicio, filtroDataFim])
```

**Funcionamento:**
- Calcula total de páginas baseado nos itens filtrados
- Fatia o array para mostrar apenas os itens da página atual
- Reseta para página 1 quando qualquer filtro muda

---

### 3. Controles de Paginação

#### A) Informações
```
Mostrando 1 a 15 de 150 pesagens
```

**Exibe:**
- Índice inicial
- Índice final
- Total de itens filtrados

#### B) Seletor de Itens por Página
```
Por página: [10] [15] [25] [50] [100]
```

**Opções:**
- 10 itens
- 15 itens (padrão)
- 25 itens
- 50 itens
- 100 itens

**Comportamento:**
- Ao mudar, reseta para página 1
- Recalcula total de páginas

#### C) Botões de Navegação

**Primeira Página (««):**
- Vai para página 1
- Desabilitado se já estiver na página 1

**Página Anterior («):**
- Volta uma página
- Desabilitado se estiver na página 1

**Números de Página:**
- Mostra até 5 páginas
- Página atual destacada em âmbar
- Páginas adjacentes visíveis
- Lógica inteligente:
  - Se total ≤ 5: mostra todas
  - Se página ≤ 3: mostra 1-5
  - Se página ≥ total-2: mostra últimas 5
  - Caso contrário: mostra página atual ± 2

**Próxima Página (»):**
- Avança uma página
- Desabilitado se estiver na última página

**Última Página (»»):**
- Vai para última página
- Desabilitado se já estiver na última

---

## 🎨 Visual

### Layout dos Controles:
```
┌─────────────────────────────────────────────────────────────┐
│ Mostrando 1 a 15 de 150 pesagens  Por página: [15 ▼]       │
│                                                              │
│                    [««] [«] [1] [2] [3] [4] [5] [»] [»»]   │
└─────────────────────────────────────────────────────────────┘
```

### Cores:
- **Página Atual:** Âmbar (#F59E0B) com texto branco
- **Outras Páginas:** Cinza com hover
- **Desabilitado:** Opacidade 50%
- **Borda:** Cinza claro/escuro (modo claro/escuro)

---

## 📊 Exemplos de Uso

### Cenário 1: 150 Pesagens
- **Itens por página:** 15
- **Total de páginas:** 10
- **Página 1:** Mostra pesagens 1-15
- **Página 2:** Mostra pesagens 16-30
- **Página 10:** Mostra pesagens 136-150

### Cenário 2: 8 Pesagens
- **Itens por página:** 15
- **Total de páginas:** 1
- **Página 1:** Mostra todas as 8 pesagens
- **Navegação:** Botões desabilitados

### Cenário 3: Filtro Aplicado
- **Total:** 150 pesagens
- **Filtradas:** 23 pesagens
- **Itens por página:** 15
- **Total de páginas:** 2
- **Página 1:** Mostra 1-15
- **Página 2:** Mostra 16-23

---

## 🔄 Comportamento com Filtros

### Quando um filtro é aplicado:
1. Recalcula `pesagensFiltradas`
2. Reseta `paginaAtual` para 1
3. Recalcula `totalPaginas`
4. Atualiza `pesagensPaginadas`
5. Renderiza primeira página dos resultados

### Exemplo:
```
Estado inicial: 150 pesagens, página 5
↓
Aplica filtro "PROJETO 28"
↓
Resultado: 30 pesagens, página 1 (resetada)
↓
Mostra pesagens 1-15 do filtro
```

---

## 💡 Funcionalidades

### 1. Navegação Rápida
- Primeira/Última página com um clique
- Anterior/Próxima para navegação sequencial
- Números de página para saltos diretos

### 2. Flexibilidade
- Escolha quantos itens ver por página
- Adapta-se ao total de resultados
- Funciona com qualquer filtro

### 3. Feedback Visual
- Página atual destacada
- Botões desabilitados quando não aplicáveis
- Contador de itens sempre visível

### 4. Performance
- Renderiza apenas itens da página atual
- Não sobrecarrega o DOM
- Scroll mais leve

---

## 🎯 Benefícios

### Para o Usuário:
- ✅ Carregamento mais rápido
- ✅ Navegação mais fluida
- ✅ Fácil encontrar pesagens específicas
- ✅ Controle sobre quantidade exibida

### Para o Sistema:
- ✅ Menos elementos no DOM
- ✅ Melhor performance de renderização
- ✅ Scroll mais responsivo
- ✅ Menor uso de memória

---

## 📱 Responsividade

### Desktop:
- Controles lado a lado
- Todos os botões visíveis
- Espaçamento confortável

### Tablet:
- Layout mantido
- Botões menores
- Texto reduzido

### Mobile:
- Controles empilhados (se necessário)
- Botões touch-friendly
- Números de página reduzidos

---

## 🔧 Customização

### Alterar Padrão de Itens:
```javascript
const [itensPorPagina, setItensPorPagina] = useState(20) // Era 15
```

### Adicionar Mais Opções:
```jsx
<option value={200}>200</option>
<option value={500}>500</option>
```

### Alterar Cor da Página Atual:
```javascript
className="bg-blue-500 text-white border-blue-500" // Era amber
```

---

## 📁 Arquivo Modificado

- `pages/manejo/pesagem.js`
  - Estados de paginação (linhas ~23-24)
  - Lógica de paginação (linhas ~660-670)
  - Controles de paginação (linhas ~1880-1970)

---

## ✅ Status

**CONCLUÍDO**

Sistema de paginação completo e funcional!

---

## 🧪 Como Testar

1. Acesse: `http://localhost:3020/manejo/pesagem`
2. Veja que mostra apenas 15 pesagens
3. Use os botões de navegação:
   - Clique em "»" para próxima página
   - Clique em "2" para ir direto à página 2
   - Clique em "««" para voltar à primeira
4. Mude "Por página" para 25
5. Veja que agora mostra 25 itens
6. Aplique um filtro
7. Veja que volta para página 1
8. Navegue pelas páginas filtradas

---

## 🎉 Resultado

Tabela de pesagens agora com paginação profissional, mostrando 15 itens por página com controles completos de navegação!
