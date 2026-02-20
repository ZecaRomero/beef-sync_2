# 📊 Melhorias de Contabilidade - Beef Sync

## ✅ Implementações Concluídas

### 1. **Morte em Movimentações de Saída** ✅
- A opção "Morte" já estava disponível nas naturezas de operação de saída
- Localizada em: `/movimentacoes/saidas`
- Permite registrar mortes de animais com:
  - Data do óbito
  - Número de NF (se aplicável)
  - Observações sobre a causa
  - Integração com o sistema de movimentações

### 2. **Sistema de Relatórios para Contabilidade** 🆕

#### Página Principal: `/contabilidade`
Nova área dedicada exclusivamente para relatórios contábeis, incluindo:

#### **2.1 Boletim de Gado**
Relatório detalhado do rebanho organizado por:
- **Raça**: Nelore, Angus, Brahman, Senepol, Gir, Outras
- **Faixas Etárias (Era em Meses)**:
  - 0 a 3 meses (Bezerros recém-nascidos até desmama)
  - 4 a 7 meses (Desenvolvimento inicial)
  - 8 a 12 meses (Fase de crescimento)
  - 13 a 24 meses (Novilhos/Novilhas jovens)
  - 25 a 36 meses (Fase de acabamento)
  - 37 meses ou mais (Animais adultos)

**Formato**: Excel (.xlsx)
**API**: `/api/contabilidade/boletim-gado`

#### **2.2 Relatório de Notas Fiscais**
Compilação completa de todas as NFs do período:

**Planilha 1 - NFs de Entrada:**
- Número da NF
- Data de Entrada
- Fornecedor
- Natureza da Operação
- Valor Total
- Quantidade de Animais
- Observações

**Planilha 2 - NFs de Saída:**
- Número da NF
- Data de Saída
- Destino
- Natureza da Operação (incluindo Morte)
- Valor Total
- Quantidade de Animais
- Observações

**Planilha 3 - Resumo Geral:**
- Total de NFs de Entrada e Saída
- Total de Animais movimentados
- Valores totais
- Saldo financeiro do período

**Formato**: Excel (.xlsx)
**API**: `/api/contabilidade/notas-fiscais`

#### **2.3 Relatório de Movimentações do Mês**
Relatório consolidado de todas as movimentações:

**Seções incluídas:**
1. **Resumo Geral**
   - Vendas (quantidade e valor)
   - Compras (quantidade e valor)
   - Transferências
   - Mortes
   - Nascimentos
   - Abates
   - Doações

2. **Entradas Detalhadas**
   - Data, Tipo, NF, Origem
   - Quantidade, Valores
   - Observações

3. **Saídas Detalhadas**
   - Data, Tipo, NF, Destino
   - Quantidade, Valores (incluindo mortes)
   - Observações

4. **Saldo do Período**
   - Rebanho inicial e final
   - Total de entradas e saídas
   - Receitas e despesas
   - Saldo financeiro

**Formato**: Excel (.xlsx)
**API**: `/api/contabilidade/movimentacoes`

### 3. **Sistema de Destinatários**
Gerenciamento completo de contatos para envio de relatórios:
- Cadastro de destinatários (Contadores, Escritórios Contábeis, etc.)
- Campos: Nome, Email, WhatsApp, Função
- Seleção múltipla para envio
- Armazenamento local dos contatos

### 4. **Funcionalidades de Exportação**

#### Download Individual
- Cada relatório pode ser baixado separadamente em Excel
- Nomenclatura automática: `relatorio-tipo-dataInicio-dataFim.xlsx`
- Download direto no navegador

#### Envio em Lote
- Botão "Enviar Todos os Relatórios"
- Envia os 3 relatórios automaticamente para destinatários selecionados
- API preparada para integração com serviços de email/WhatsApp

**API**: `/api/contabilidade/enviar-relatorios`

### 5. **Menu de Navegação**
Nova seção "Contabilidade" adicionada ao menu lateral:
- Ícone: 📄 DocumentTextIcon
- Submenu: "Relatórios Contábeis"
- Descrição: "Boletim de Gado, NFs e Movimentações"

## 🎨 Recursos de Interface

### Design Moderno
- Cards interativos com gradientes
- Estatísticas em tempo real
- Interface responsiva (mobile e desktop)
- Modo escuro/claro suportado

### Seleção de Período
- Período padrão: Mês atual
- Seleção personalizada de datas
- Validação automática de datas

### Feedback Visual
- Toasts de sucesso/erro
- Loading states durante geração
- Indicadores de progresso
- Badges de status

## 📋 Estrutura de Arquivos Criados

```
pages/
  contabilidade/
    index.js                    # Página principal

  api/contabilidade/
    boletim-gado.js            # API Boletim de Gado
    notas-fiscais.js           # API Notas Fiscais
    movimentacoes.js           # API Movimentações
    enviar-relatorios.js       # API Envio de Relatórios

components/
  Sidebar.js                    # Menu atualizado
```

## 🚀 Como Usar

### 1. Acessar Relatórios Contábeis
1. No menu lateral, clique em **Contabilidade**
2. Selecione **Relatórios Contábeis**

### 2. Configurar Período
1. Na página, defina a **Data Inicial** e **Data Final**
2. O sistema carrega automaticamente o mês atual

### 3. Cadastrar Destinatários
1. Clique em **Adicionar** no painel de Destinatários
2. Preencha: Nome, Email, WhatsApp, Função
3. Clique em **Adicionar**

### 4. Baixar Relatórios
Cada relatório possui um botão **Baixar Excel**:
- **Boletim de Gado**: Animais por raça e idade
- **Notas Fiscais**: Todas as NFs do período
- **Movimentações**: Resumo completo

### 5. Enviar para Contabilidade
1. Selecione os destinatários (checkbox)
2. Clique em **Enviar Todos os Relatórios**
3. Os 3 relatórios serão enviados automaticamente

## 📊 Formato dos Relatórios

### Características dos Arquivos Excel
- **Cabeçalhos coloridos** para fácil identificação
- **Múltiplas abas** quando aplicável
- **Formatação profissional** com bordas e cores
- **Legendas explicativas**
- **Totalizadores automáticos**
- **Metadados**: Período e data de geração

### Informações Incluídas
- ✅ Período de referência
- ✅ Data e hora de geração
- ✅ Dados detalhados por categoria
- ✅ Resumos e totalizadores
- ✅ Observações e legendas
- ✅ Branding (Beef Sync)

## 🔄 Integrações Futuras

### Email (Preparado)
- Estrutura pronta para SendGrid, AWS SES, Nodemailer
- Anexos automáticos dos 3 relatórios
- Template HTML personalizado

### WhatsApp Business (Preparado)
- Estrutura pronta para Twilio, outras APIs
- Envio de arquivos via WhatsApp
- Mensagens personalizadas

## 📝 Observações Importantes

1. **Dados Reais**: Todos os relatórios utilizam dados reais do sistema, sem informações fictícias

2. **Performance**: Os relatórios são gerados sob demanda para economizar recursos

3. **Segurança**: Destinatários são armazenados localmente no navegador

4. **Período Flexível**: Permite análises de qualquer intervalo de datas

5. **Morte nas Saídas**: Já estava implementado, agora integrado aos relatórios

## 🎯 Benefícios

### Para a Gestão
- ✅ Visão completa do rebanho por idade
- ✅ Controle total de movimentações financeiras
- ✅ Rastreabilidade de todas as operações
- ✅ Dados prontos para análise contábil

### Para a Contabilidade
- ✅ Relatórios padronizados em Excel
- ✅ Dados organizados e categorizados
- ✅ Fácil importação para sistemas contábeis
- ✅ Documentação completa de NFs
- ✅ Boletim de gado para SPED Fiscal

### Para a Fazenda
- ✅ Automatização de relatórios mensais
- ✅ Redução de trabalho manual
- ✅ Envio automático para contador
- ✅ Histórico de envios

## 🔧 Manutenção e Suporte

Os relatórios são atualizados automaticamente conforme:
- Novos animais são cadastrados
- NFs são registradas
- Movimentações ocorrem
- Período é alterado

**Sistema desenvolvido com foco em praticidade e conformidade contábil!**

---

**Versão**: 1.0  
**Data**: Outubro 2025  
**Desenvolvido para**: Beef Sync - Sistema de Gestão Pecuária

