# Sistema de Localização nos Relatórios de Lotes

## 📋 Visão Geral

Implementação da funcionalidade de exibição da **localização mais recente** dos animais nos relatórios de lotes. Quando um animal possui histórico de localizações (movimentações entre piquetes), o sistema agora exibe automaticamente qual é a localização atual/mais recente.

## 🎯 Objetivo

Permitir que o usuário visualize rapidamente onde cada animal está localizado atualmente, considerando o histórico de movimentações. Por exemplo:
- Se um animal passou pelo Piquete 1 no dia 01/10
- E depois passou pelo Piquete 2 no dia 10/10
- O sistema exibe o **Piquete 2** como localização mais recente

## 🔧 Implementações Realizadas

### 1. Modificações no Backend

#### `services/databaseService.js`
- **Adicionado filtros de `serie` e `rg`** na função `buscarAnimais()`
- Permite buscar animais específicos por série e RG para recuperar o ID necessário

```javascript
if (filtros.serie) {
  conditions.push(`a.serie = $${params.length + 1}`);
  params.push(filtros.serie);
}

if (filtros.rg) {
  conditions.push(`a.rg = $${params.length + 1}`);
  params.push(filtros.rg);
}
```

#### `pages/api/animals.js`
- **Aceita os novos parâmetros** `serie` e `rg` na query string
- Permite filtrar animais pela combinação série + RG

```javascript
const { situacao, raca, sexo, serie, rg } = req.query
const filtros = {}

if (serie) filtros.serie = serie
if (rg) filtros.rg = rg
```

#### API Existente: `pages/api/animais/[id]/localizacoes.js`
- **Já existente** - Retorna o histórico completo de localizações
- Retorna também a `localizacao_atual` (mais recente onde `data_saida` é NULL)
- Endpoint: `GET /api/animais/:id/localizacoes`

### 2. Modificações no Frontend

#### `components/relatorios/DetalhesAnimal.js`

**Novas funcionalidades:**

1. **Hook de Estado para Localização**
```javascript
const [localizacaoAtual, setLocalizacaoAtual] = useState(null);
const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
```

2. **useEffect para Buscar Localização**
   - Busca o ID do animal pela série e RG
   - Consulta a API de localizações com o ID obtido
   - Armazena a localização mais recente no estado

3. **Novo Componente: `SecaoLocalizacao`**
   - Exibe a localização mais recente do animal
   - Mostra informações:
     - **Piquete** (destacado em negrito)
     - **Data de Entrada**
     - **Motivo da Movimentação** (se disponível)
     - **Observações** (se disponível)
     - **Usuário Responsável** (se disponível)
   - Badge "Mais Recente" para destacar que é a localização atual
   - Estados de carregamento

## 📊 Estrutura do Banco de Dados

### Tabela: `localizacoes_animais`

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

**Lógica de Localização Mais Recente:**
- Busca por `animal_id`
- Ordena por `data_entrada DESC`
- Filtra onde `data_saida IS NULL` (animal ainda está naquele piquete)
- Se não houver com `data_saida` NULL, pega a última entrada registrada

## 🎨 Interface do Usuário

### Antes
- Detalhes do animal sem informação de localização

### Depois
- Seção destacada com fundo laranja/amarelo
- Badge verde "Mais Recente"
- Informações organizadas em grid responsivo
- Estados de carregamento para melhor UX

### Exemplo Visual

```
┌─────────────────────────────────────────────────────┐
│ 📍 Localização Atual [Mais Recente]                 │
├─────────────────────────────────────────────────────┤
│ Piquete: Piquete 2                                  │
│ Data de Entrada: 10/10/2024                         │
│ Motivo: Rotação de pastagem                         │
├─────────────────────────────────────────────────────┤
│ Obs: Animal em ótimo estado de saúde               │
│ Responsável: João Silva                             │
└─────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Funcionamento

1. **Usuário acessa** página de Relatórios de Lotes (`/relatorios-lotes`)
2. **Expande os detalhes** de um lote que contém animais
3. **Sistema busca automaticamente:**
   - ID do animal pela série + RG
   - Histórico de localizações do animal
   - Localização mais recente (atual)
4. **Exibe a localização** em uma seção destacada

## 📝 Exemplo de Uso

### Cenário Real:
Um animal `NEL-0123` teve as seguintes movimentações:
- 01/10/2024 - Piquete 1 (entrada)
- 05/10/2024 - Piquete 1 (saída)
- 05/10/2024 - Piquete 2 (entrada)
- 10/10/2024 - Piquete 2 (saída)
- 10/10/2024 - Piquete 3 (entrada)
- *Sem data de saída* - Ainda está no Piquete 3

**Sistema exibe:** Piquete 3 (data de entrada: 10/10/2024)

## 🚀 Benefícios

1. ✅ **Rastreabilidade:** Saber onde cada animal está localizado
2. ✅ **Histórico:** Manter registro de todas as movimentações
3. ✅ **Automatização:** Busca automática sem intervenção manual
4. ✅ **Usabilidade:** Informação clara e destacada
5. ✅ **Responsabilidade:** Registra quem movimentou o animal

## 🔒 Segurança e Performance

- **Tratamento de Erros:** Warnings no console em caso de falha
- **Estados de Carregamento:** Feedback visual durante busca
- **Graceful Degradation:** Não exibe seção se não houver localização
- **Queries Otimizadas:** Uso de índices no banco de dados

## 📌 Observações Técnicas

1. A busca é feita **assincronamente** usando `useEffect`
2. O componente é **reutilizável** em outros contextos
3. A API já existente foi **aproveitada** sem necessidade de criar nova
4. **Compatibilidade** mantida com o sistema de lotes existente

## 🔮 Melhorias Futuras

- [ ] Cache de localizações para reduzir chamadas à API
- [ ] Visualização de histórico completo de movimentações
- [ ] Mapa visual dos piquetes
- [ ] Alertas de animais sem localização definida
- [ ] Relatórios de ocupação por piquete

## 📞 Suporte

Para dúvidas ou problemas, verificar:
1. Console do navegador para erros de API
2. Logs do servidor para problemas de banco de dados
3. Estrutura da tabela `localizacoes_animais`

---

**Data de Implementação:** 24 de Outubro de 2025  
**Versão:** 1.0

