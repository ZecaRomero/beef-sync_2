# 💡 Exemplos Práticos - Refatoração Beef Sync

## 🎯 Exemplos de Uso Real

### 1. 📝 Formulário de Cadastro de Animal

```typescript
// pages/animals/novo.tsx
import React from 'react';
import { useForm } from '@/hooks/useForm';
import { validateAnimal } from '@/lib/validator';
import { useOptimizedApp } from '@/contexts/OptimizedAppContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/OptimizedCard';
import { Button } from '@/components/ui/OptimizedButton';
import type { Animal } from '@/types';

export default function NovoAnimal() {
  const { addAnimal } = useOptimizedApp();
  const toast = useToast();

  const form = useForm<Partial<Animal>>({
    initialValues: {
      serie: '',
      rg: '',
      sexo: 'Macho',
      raca: '',
      situacao: 'Ativo',
    },
    validate: validateAnimal,
    onSubmit: async (values) => {
      try {
        await addAnimal(values);
        toast.success('Animal cadastrado com sucesso!');
        form.reset();
      } catch (error) {
        toast.error('Erro ao cadastrar animal');
      }
    },
  });

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Cadastrar Novo Animal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label>Série *</label>
              <input
                type="text"
                name="serie"
                value={form.values.serie}
                onChange={form.handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              {form.errors.find(e => e.field === 'serie') && (
                <p className="text-red-600 text-sm mt-1">
                  {form.errors.find(e => e.field === 'serie')?.message}
                </p>
              )}
            </div>

            <div>
              <label>RG *</label>
              <input
                type="text"
                name="rg"
                value={form.values.rg}
                onChange={form.handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label>Sexo *</label>
              <select
                name="sexo"
                value={form.values.sexo}
                onChange={form.handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>

            <div>
              <label>Raça *</label>
              <input
                type="text"
                name="raca"
                value={form.values.raca}
                onChange={form.handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={form.isSubmitting}
                disabled={!form.isValid}
              >
                Cadastrar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={form.reset}
              >
                Limpar
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 2. 📊 Lista de Animais com Busca e Paginação

```typescript
// components/animals/AnimalListOptimized.tsx
import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useOptimizedApp } from '@/contexts/OptimizedAppContext';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { Button } from '@/components/ui/OptimizedButton';
import { Card } from '@/components/ui/OptimizedCard';
import type { Animal } from '@/types';

export function AnimalListOptimized() {
  const { animals, loading, loadAnimals } = useOptimizedApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Filtrar animais
  const filteredAnimals = animals.filter(animal => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      animal.serie.toLowerCase().includes(searchLower) ||
      animal.rg.toLowerCase().includes(searchLower) ||
      animal.raca?.toLowerCase().includes(searchLower)
    );
  });

  // Paginação
  const {
    currentItems,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination({
    items: filteredAnimals,
    itemsPerPage: 20,
  });

  useEffect(() => {
    loadAnimals();
  }, []);

  const columns = [
    { key: 'serie', header: 'Série', width: '100px' },
    { key: 'rg', header: 'RG', width: '120px' },
    { key: 'raca', header: 'Raça' },
    { key: 'sexo', header: 'Sexo', width: '80px' },
    {
      key: 'situacao',
      header: 'Situação',
      width: '120px',
      render: (animal: Animal) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          animal.situacao === 'Ativo' ? 'bg-green-100 text-green-800' :
          animal.situacao === 'Vendido' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {animal.situacao}
        </span>
      ),
    },
  ];

  return (
    <Card padding="lg">
      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por série, RG ou raça..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Tabela */}
      <OptimizedTable
        data={currentItems}
        columns={columns}
        keyExtractor={(animal) => animal.id!}
        loading={loading}
        striped
        hoverable
        emptyMessage="Nenhum animal encontrado"
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="secondary"
            onClick={prevPage}
            disabled={!hasPrevPage}
          >
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={nextPage}
            disabled={!hasNextPage}
          >
            Próxima
          </Button>
        </div>
      )}
    </Card>
  );
}
```

### 3. 📈 Dashboard com Estatísticas

```typescript
// components/dashboard/OptimizedDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useOptimizedApp } from '@/contexts/OptimizedAppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/OptimizedCard';
import { Button } from '@/components/ui/OptimizedButton';
import type { DashboardStats } from '@/types';

export function OptimizedDashboard() {
  const { loadDashboardStats } = useOptimizedApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await loadDashboardStats(forceRefresh);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <div>Carregando estatísticas...</div>;
  }

  if (!stats) {
    return <div>Erro ao carregar estatísticas</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadStats(true)}
        >
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Animais"
          value={stats.totalAnimals}
          color="blue"
        />
        <StatCard
          title="Animais Ativos"
          value={stats.activeAnimals}
          color="green"
        />
        <StatCard
          title="Custos Totais"
          value={`R$ ${stats.totalCosts.toLocaleString('pt-BR')}`}
          color="red"
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`}
          color="green"
        />
      </div>

      {/* ROI */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Retorno sobre Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center">
            {stats.roi.toFixed(2)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente auxiliar para cards de estatística
interface StatCardProps {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const StatCard = React.memo<StatCardProps>(({ title, value, color }) => {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    red: 'border-red-500 text-red-600',
    yellow: 'border-yellow-500 text-yellow-600',
  };

  return (
    <Card padding="lg" className={`border-l-4 ${colorClasses[color]}`}>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
```

### 4. 🔍 API Route Otimizada

```typescript
// pages/api/animals/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/services/optimizedDatabaseService';
import { validateAnimal } from '@/lib/validator';
import { 
  handleAPIError, 
  ValidationError,
  NotFoundError 
} from '@/lib/errorHandler';
import type { Animal, ApiResponse, PaginatedResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Animal> | PaginatedResponse<Animal>>
) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetAnimals(req, res);
      case 'POST':
        return await handleCreateAnimal(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Método não permitido',
        });
    }
  } catch (error) {
    const errorResponse = handleAPIError(error);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
}

async function handleGetAnimals(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<Animal>>
) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const situacao = req.query.situacao as string;
  const raca = req.query.raca as string;
  const search = req.query.search as string;

  const result = await dbService.getAnimals(
    { situacao, raca, search },
    page,
    limit
  );

  return res.status(200).json(result);
}

async function handleCreateAnimal(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Animal>>
) {
  // Validar dados
  const errors = validateAnimal(req.body);
  if (errors.length > 0) {
    throw new ValidationError('Dados inválidos', errors);
  }

  // Criar animal
  const animal = await dbService.createAnimal(req.body);

  return res.status(201).json({
    success: true,
    data: animal,
    message: 'Animal criado com sucesso',
  });
}
```

### 5. 🧪 Teste de Componente

```typescript
// __tests__/components/AnimalListOptimized.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimalListOptimized } from '@/components/animals/AnimalListOptimized';
import { OptimizedAppProvider } from '@/contexts/OptimizedAppContext';
import { ToastProvider } from '@/contexts/ToastContext';

const mockAnimals = [
  { id: 1, serie: 'A1', rg: '001', raca: 'Angus', sexo: 'Macho', situacao: 'Ativo' },
  { id: 2, serie: 'A2', rg: '002', raca: 'Nelore', sexo: 'Fêmea', situacao: 'Ativo' },
];

jest.mock('@/contexts/OptimizedAppContext', () => ({
  useOptimizedApp: () => ({
    animals: mockAnimals,
    loading: false,
    loadAnimals: jest.fn(),
  }),
}));

describe('AnimalListOptimized', () => {
  const renderComponent = () => {
    return render(
      <ToastProvider>
        <OptimizedAppProvider>
          <AnimalListOptimized />
        </OptimizedAppProvider>
      </ToastProvider>
    );
  };

  it('deve renderizar lista de animais', () => {
    renderComponent();
    
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
  });

  it('deve filtrar animais pela busca', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Angus' } });

    await waitFor(() => {
      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.queryByText('A2')).not.toBeInTheDocument();
    }, { timeout: 600 }); // Aguardar debounce
  });

  it('deve mostrar paginação quando houver muitos itens', () => {
    // Mock com mais de 20 itens
    const manyAnimals = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      serie: `A${i + 1}`,
      rg: `00${i + 1}`,
      raca: 'Angus',
      sexo: 'Macho',
      situacao: 'Ativo',
    }));

    jest.spyOn(require('@/contexts/OptimizedAppContext'), 'useOptimizedApp')
      .mockReturnValue({
        animals: manyAnimals,
        loading: false,
        loadAnimals: jest.fn(),
      });

    renderComponent();

    expect(screen.getByText('Próxima')).toBeInTheDocument();
    expect(screen.getByText('Anterior')).toBeInTheDocument();
  });
});
```

---

## 🎨 Padrões de Estilo

### Componente com Tailwind + cn utility
```typescript
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'success',
  size = 'md',
  className 
}) => {
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full',
      // Variants
      variant === 'success' && 'bg-green-100 text-green-800',
      variant === 'warning' && 'bg-yellow-100 text-yellow-800',
      variant === 'danger' && 'bg-red-100 text-red-800',
      // Sizes
      size === 'sm' && 'px-2 py-0.5 text-xs',
      size === 'md' && 'px-3 py-1 text-sm',
      size === 'lg' && 'px-4 py-2 text-base',
      // Custom classes
      className
    )}>
      {children}
    </span>
  );
};
```

---

## ✅ Checklist de Implementação

Ao criar novo componente/feature:

### Planejamento
- [ ] Definir tipos TypeScript necessários
- [ ] Identificar hooks que podem ser reutilizados
- [ ] Planejar estratégia de cache se aplicável
- [ ] Definir validações necessárias

### Implementação
- [ ] Criar tipos em `types/index.ts` ou arquivo específico
- [ ] Implementar validação se necessário
- [ ] Usar hooks customizados apropriados
- [ ] Implementar componente com memoização
- [ ] Adicionar tratamento de erros
- [ ] Usar componentes UI otimizados

### Testes
- [ ] Escrever testes unitários
- [ ] Testar casos de erro
- [ ] Testar estados de loading
- [ ] Verificar cobertura

### Qualidade
- [ ] Executar `npm run type-check`
- [ ] Executar `npm run lint`
- [ ] Executar `npm test`
- [ ] Verificar performance no DevTools

---

## 🎓 Dicas Finais

1. **Use TypeScript sempre que possível** - Ajuda a prevenir bugs
2. **Memoize componentes pesados** - Melhora performance
3. **Use cache estrategicamente** - Reduz chamadas ao banco
4. **Valide dados cedo** - Previne erros downstream
5. **Escreva testes para lógica crítica** - Aumenta confiança
6. **Use hooks customizados** - Reduz duplicação
7. **Trate erros apropriadamente** - Melhora UX

---

**Happy Coding! 🚀**

