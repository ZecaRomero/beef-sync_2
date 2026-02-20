# 🚀 GUIA RÁPIDO - Notas Fiscais

## ⚡ Acesso Rápido

### 🧭 Pelo Menu
```
Menu → 📋 Notas Fiscais → Gerenciar NFs
```

### 🌐 URL Direta
```
http://localhost:3000/notas-fiscais
```

---

## 📋 Exemplos Práticos

### 🐄 Exemplo 1: Comprar 5 Novilhas

```
1. Clique em [Nova Entrada] (verde)

2. Dados da NF:
   Número: 12345
   Data: Hoje
   Fornecedor: Fazenda São José
   Natureza: Compra

3. Selecione: 🐄 Bovino

4. Adicione cada novilha:
   
   Novilha 1:
   - Tatuagem: 001
   - Sexo: Fêmea
   - Era: Novilha
   - Raça: Nelore
   - Peso: 280 kg
   - Valor: R$ 4.200,00
   [Adicionar Bovino]
   
   Novilha 2:
   - Tatuagem: 002
   - Sexo: Fêmea
   - Era: Novilha
   - Raça: Nelore
   - Peso: 295 kg
   - Valor: R$ 4.400,00
   [Adicionar Bovino]
   
   ... (repita para 003, 004, 005)

5. [Salvar NF]

✅ Resultado:
   - NF criada
   - 5 novilhas cadastradas no sistema
   - Total: R$ 21.000,00
```

---

### 🧬 Exemplo 2: Comprar 200 Doses de Sêmen

```
1. Clique em [Nova Entrada] (verde)

2. Dados da NF:
   Número: 54321
   Data: Hoje
   Fornecedor: Central Genética Brasil
   Natureza: Compra

3. Selecione: 🧬 Sêmen

4. Adicione o lote:
   - Touro: GUADALUPE IDEAL
   - RG: A3139
   - Raça: Nelore
   - Doses: 200
   - Valor/dose: R$ 42,00
   - Total: R$ 8.400,00 (automático ✨)
   - Botijão: B001
   - Caneca: C001
   - Certificado: CERT-2024-001
   - Validade: 31/12/2026
   [Adicionar Sêmen]

5. Adicione mais touros se houver
   (Repita o processo)

6. [Salvar NF]

✅ Resultado:
   - NF criada
   - 200 doses adicionadas ao estoque
   - Localização: B001/C001
   - Acessível em /estoque-semen
```

---

### 🧫 Exemplo 3: Vender 15 Embriões

```
1. Clique em [Nova Saída] (azul)

2. Dados da NF:
   Número: 99999
   Data: Hoje
   Destino: Fazenda Santa Rita
   Natureza: Venda

3. Selecione: 🧫 Embrião

4. Adicione o lote:
   - Doadora: Vaca Elite 123
   - Touro: Champion Master
   - Raça: Angus
   - Quantidade: 15
   - Valor/unidade: R$ 850,00
   - Total: R$ 12.750,00 (automático ✨)
   - Tipo: In Vitro (FIV)
   - Qualidade: A
   - Data Coleta: 01/10/2024
   [Adicionar Embrião]

5. [Salvar NF]

✅ Resultado:
   - NF de saída criada
   - Venda de R$ 12.750,00 registrada
   - Rastreabilidade genética completa
```

---

### 🔄 Exemplo 4: Vender Doses de Sêmen

```
1. Clique em [Nova Saída] (azul)

2. Dados da NF:
   Número: 77777
   Data: Hoje
   Destino: Cliente Premium Ltda
   Natureza: Venda

3. Selecione: 🧬 Sêmen

4. Adicione:
   - Touro: GUADALUPE IDEAL
   - RG: A3139
   - Raça: Nelore
   - Doses: 50
   - Valor/dose: R$ 60,00
   - Total: R$ 3.000,00
   [Adicionar Sêmen]

5. [Salvar NF]

✅ Resultado:
   - NF de saída criada
   - Venda de R$ 3.000,00 registrada
```

---

## 🔍 Como Usar os Filtros

### Buscar NF Específica
```
🔍 Digite "12345" → Mostra NF 12345
```

### Ver Apenas Entradas
```
Filtro: [Entradas ▼]
```

### Ver Apenas Sêmen
```
Filtro: [🧬 Sêmen ▼]
```

### Últimos 7 Dias
```
Filtro: [Últimos 7 dias ▼]
```

### Combinar Filtros
```
[Saídas ▼] + [🧫 Embrião ▼] + [Últimos 30 dias ▼]
= Todas as vendas de embriões do último mês
```

---

## ✏️ Editar uma NF

```
1. Localize a NF na listagem
2. Clique no ícone ✏️ (lápis azul)
3. Modifique o que precisar
4. [Atualizar NF]
```

---

## 🗑️ Excluir uma NF

```
1. Localize a NF na listagem
2. Clique no ícone 🗑️ (lixeira vermelha)
3. Confirme a exclusão
4. ✅ NF removida
```

---

## 📊 Entender o Dashboard

### Card 1: Entradas (Verde)
```
📥 Entradas
45 notas fiscais
R$ 450.000,00
```
= Total de notas de ENTRADA e valor investido

### Card 2: Saídas (Azul)
```
📤 Saídas
32 notas fiscais
R$ 580.000,00
```
= Total de notas de SAÍDA e valor recebido

### Card 3: Por Tipo (Roxo)
```
Por Tipo
🐄 28  🧬 15  🧫 4
```
= Distribuição: 28 NFs de bovinos, 15 de sêmen, 4 de embriões

### Card 4: Saldo (Laranja)
```
Saldo
R$ 130.000,00
```
= Saídas - Entradas = Lucro/Resultado

---

## 💡 Dicas Práticas

### ✅ Ao Comprar Sêmen
- Sempre preencha Botijão e Caneca
- Registre o Certificado
- Defina Data de Validade
- Use nomenclatura padrão do touro

### ✅ Ao Comprar Bovinos
- Use tatuagens únicas
- Registre o peso quando possível
- Especifique bem a era
- Informe a raça

### ✅ Ao Vender Embriões
- Registre doadora e touro
- Classifique a qualidade (A, B, C)
- Defina o tipo (FIV/TE)
- Data de coleta é importante

### ✅ Organização Geral
- Cadastre NFs logo após a operação
- Use numeração sequencial
- Preencha observações quando relevante
- Mantenha atualizado

---

## 🎯 Atalhos Visuais

### Cores
- 🟢 Verde = Entrada
- 🔵 Azul = Saída
- 🟢 Verde claro = Bovino
- 🟣 Roxo = Sêmen
- 🔵 Índigo = Embrião

### Ícones
- 📥 = Entrada
- 📤 = Saída
- 🐄 = Bovino
- 🧬 = Sêmen
- 🧫 = Embrião
- ✏️ = Editar
- 🗑️ = Excluir
- ➕ = Adicionar

---

## 🚀 Fluxo Completo

### Do Início ao Fim

```
1. Acessar /notas-fiscais
        ↓
2. Clicar "Nova Entrada" ou "Nova Saída"
        ↓
3. Preencher dados da NF
        ↓
4. Selecionar tipo de produto
        ↓
5. Adicionar itens (pode ser múltiplos)
        ↓
6. Revisar lista de itens
        ↓
7. Adicionar observações (opcional)
        ↓
8. Salvar NF
        ↓
9. ✅ Sucesso! NF aparece na listagem
```

---

## 📱 Tela Resumida

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Notas Fiscais                                           │
│ Gerenciamento completo de entradas e saídas                │
│                                       [Nova Entrada] [Nova Saída] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │📥 Entradas│ │📤 Saídas │ │ Por Tipo │ │  Saldo   │      │
│ │   45      │ │   32     │ │🐄🧬🧫    │ │130.000,00│      │
│ │450.000,00 │ │580.000,00│ │28 15 4   │ │          │      │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔍 Buscar...  [Todas▼] [Todos▼] [30 dias▼]               │
│                                                             │
│ ✅ 47 notas fiscais encontradas                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Tipo │ NF    │ Data   │ Fornec/Dest  │ Prod │ ... │ Ações │
│ ─────┼───────┼────────┼──────────────┼──────┼─────┼────── │
│ 📥   │ 12345 │ Hoje   │ Fazenda XYZ  │  🐄  │ ... │ ✏️🗑️  │
│ 📤   │ 54321 │ Ontem  │ Cliente ABC  │  🧬  │ ... │ ✏️🗑️  │
│ 📥   │ 11111 │ 2 dias │ Central Gen  │  🧬  │ ... │ ✏️🗑️  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Teclas de Atalho Sugeridas

- `Ctrl + K` → Busca global
- `Enter` → Salvar (quando em formulário)
- `Esc` → Fechar modal

---

## 🎓 Tutoriais em Vídeo (Sugestão)

1. **Básico (5 min)**
   - Acessar sistema
   - Criar primeira NF
   - Entender dashboard

2. **Intermediário (10 min)**
   - Cadastrar múltiplos tipos
   - Usar filtros
   - Editar/Excluir

3. **Avançado (15 min)**
   - Integração com estoque
   - Relatórios
   - Melhores práticas

---

## 🆘 Problemas Comuns

### "Não consigo salvar"
✅ Verifique se adicionou pelo menos 1 item

### "Modal não abre"
✅ Limpe o cache (Ctrl + Shift + R)

### "Campos não aparecem"
✅ Certifique-se de ter selecionado o tipo de produto

### "Cálculo está errado"
✅ Valores totais são automáticos: Quantidade × Valor Unitário

---

## 🎉 Pronto para Usar!

O sistema está **100% funcional**. Comece cadastrando suas primeiras notas fiscais!

### Sugestão de Primeira NF
```
✅ Cadastre uma entrada de sêmen de teste
✅ Veja aparecer no estoque
✅ Explore os filtros
✅ Edite e exclua para praticar
```

---

**Boa gestão! 🚀**

*Sistema de Notas Fiscais - Beef Sync*

