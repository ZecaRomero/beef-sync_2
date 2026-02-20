# Guia de Aplicação das Melhorias na Ficha do Animal

## Passo 1: Adicionar o CSS ao Projeto

1. O arquivo `styles/animal-detail-enhanced.css` já foi criado
2. Importe-o no arquivo `pages/animals/[id].js`:

```javascript
import '../styles/animal-detail-enhanced.css'
```

OU adicione no `_app.js`:

```javascript
import '../styles/animal-detail-enhanced.css'
```

## Passo 2: Aplicar as Classes no Cabeçalho

Substitua o cabeçalho atual por:

```jsx
<div className="animal-header-enhanced">
  <div className="flex justify-between items-start">
    <div>
      <h1 className="animal-name">
        {animal.serie} {animal.rg}
      </h1>
      <p className="animal-id">
        ID: {animal.id} • {animal.sexo} • {animal.raca}
      </p>
    </div>
    <div className="flex gap-2">
      <span className={`status-badge-enhanced badge-${animal.situacao?.toLowerCase()}`}>
        {animal.situacao}
      </span>
    </div>
  </div>
</div>
```

## Passo 3: Melhorar os Botões de Ação

Substitua os botões atuais por:

```jsx
<div className="action-buttons-grid">
  <button 
    onClick={() => router.back()}
    className="action-btn-enhanced action-btn-info"
  >
    <ArrowLeftIcon />
    Voltar
  </button>
  
  <button 
    onClick={() => setShowForm(true)}
    className="action-btn-enhanced action-btn-primary"
  >
    <PencilIcon />
    Editar
  </button>
  
  <button 
    onClick={handleGeneratePDF}
    className="action-btn-enhanced action-btn-success"
  >
    <DocumentArrowDownIcon />
    Gerar PDF
  </button>
  
  <button 
    onClick={() => setShowNotaFiscalModal(true)}
    className="action-btn-enhanced action-btn-warning"
  >
    <DocumentArrowUpIcon />
    Lançar Ocorrência
  </button>
  
  <button 
    onClick={handleDelete}
    className="action-btn-enhanced action-btn-danger"
  >
    <TrashIcon />
    Excluir
  </button>
</div>
```

## Passo 4: Melhorar os Cards de Informação

Substitua os cards atuais por:

```jsx
<div className="info-card-enhanced">
  <h3 className="card-title">
    <UserIcon />
    Informações do Animal
  </h3>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-sm text-gray-500">Nome</p>
      <p className="font-semibold">{animal.nome || '-'}</p>
    </div>
    <div>
      <p className="text-sm text-gray-500">Raça</p>
      <p className="font-semibold">{animal.raca || '-'}</p>
    </div>
    {/* Adicione mais campos conforme necessário */}
  </div>
</div>
```

## Passo 5: Adicionar Estatísticas Visuais

```jsx
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-value">{custos.length}</div>
    <div className="stat-label">Custos</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-value">{examesAndrologicos.length}</div>
    <div className="stat-label">Exames</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-value">{transferenciasEmbrioes.length}</div>
    <div className="stat-label">Transferências</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-value">
      {animal.idade || calcularIdade(animal.dataNascimento)}
    </div>
    <div className="stat-label">Idade (meses)</div>
  </div>
</div>
```

## Passo 6: Melhorar Tabelas

```jsx
<table className="table-enhanced">
  <thead>
    <tr>
      <th>Data</th>
      <th>Descrição</th>
      <th>Valor</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    {custos.map((custo) => (
      <tr key={custo.id}>
        <td>{formatDateBR(custo.data)}</td>
        <td>{custo.descricao}</td>
        <td>R$ {custo.valor.toFixed(2)}</td>
        <td>
          <button className="text-blue-600 hover:text-blue-800">
            Ver Detalhes
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

## Passo 7: Adicionar Timeline (Opcional)

```jsx
<div className="timeline-container">
  {eventos.map((evento, index) => (
    <div key={index} className="timeline-item-enhanced">
      <div className="timeline-icon">
        {evento.icon}
      </div>
      <div className="timeline-content">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{evento.titulo}</h4>
            <p className="text-sm text-gray-600">{evento.descricao}</p>
          </div>
          <span className="text-xs text-gray-500">
            {formatDateBR(evento.data)}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>
```

## Passo 8: Adicionar Tooltips

```jsx
<span 
  className="tooltip-enhanced" 
  data-tooltip="Clique para editar as informações do animal"
>
  <PencilIcon className="w-5 h-5" />
</span>
```

## Passo 9: Loading States

```jsx
{loading ? (
  <div className="flex justify-center items-center py-12">
    <div className="loading-spinner"></div>
  </div>
) : (
  // Conteúdo normal
)}

{/* OU skeleton loader */}
{loading ? (
  <div className="space-y-4">
    <div className="skeleton-loader" style={{width: '100%', height: '60px'}}></div>
    <div className="skeleton-loader" style={{width: '80%', height: '40px'}}></div>
    <div className="skeleton-loader" style={{width: '60%', height: '40px'}}></div>
  </div>
) : (
  // Conteúdo normal
)}
```

## Resultado Esperado

Após aplicar todas as melhorias, você terá:

✅ Cabeçalho com gradiente animado e efeito shimmer
✅ Botões interativos com hover e animações
✅ Cards com elevação ao passar o mouse
✅ Estatísticas visuais com contadores animados
✅ Badges coloridos por status
✅ Tabelas interativas com hover
✅ Timeline visual (opcional)
✅ Tooltips informativos
✅ Loading states elegantes
✅ Totalmente responsivo
✅ Suporte a dark mode

## Dicas Adicionais

1. **Teste em diferentes dispositivos** para garantir responsividade
2. **Ajuste as cores** conforme a identidade visual do projeto
3. **Adicione mais animações** onde fizer sentido
4. **Use transições suaves** para melhor UX
5. **Mantenha a acessibilidade** (contraste, foco, etc.)

## Próximos Passos

1. Aplicar as classes CSS nos componentes existentes
2. Testar todas as interações
3. Ajustar cores e espaçamentos conforme necessário
4. Adicionar mais animações personalizadas
5. Implementar feedback visual para ações do usuário
6. Otimizar performance se necessário

## Suporte

Se precisar de ajuda para aplicar alguma melhoria específica, me avise!
