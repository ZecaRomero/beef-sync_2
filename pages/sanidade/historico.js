import { useState, useMemo } from 'react';
import { 
  ClockIcon, 
  MagnifyingGlassIcon, 
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../../hooks/useApi';

export default function HistoricoSanitario() {
  const [filtroAnimal, setFiltroAnimal] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Usar hook padronizado para buscar dados
  const { data: historicoData, loading, error } = useApi('/api/sanidade/historico');

  // Extrair array de histórico da resposta - tratamento robusto
  // A API retorna: { success: true, data: { data: [...], total, limit, offset } }
  // O useApi normaliza para: { data: [...], total, limit, offset }
  const historico = useMemo(() => {
    if (!historicoData) return [];
    
    // Se já é um array, retornar direto (fallback)
    if (Array.isArray(historicoData)) {
      return historicoData;
    }
    
    // A estrutura esperada é historicoData.data (array dentro do objeto data)
    if (historicoData?.data && Array.isArray(historicoData.data)) {
      return historicoData.data;
    }
    
    // Fallback: se tem propriedade historico que é array
    if (historicoData?.historico && Array.isArray(historicoData.historico)) {
      return historicoData.historico;
    }
    
    // Caso contrário, retornar array vazio
    return [];
  }, [historicoData]);

  const historicoFiltrado = historico.filter(item => {
    if (!item) return false;
    
    const animalStr = item.animal ? String(item.animal).toLowerCase() : '';
    const matchAnimal = filtroAnimal === '' || animalStr.includes(filtroAnimal.toLowerCase());
    
    const tipoStr = item.tipo ? String(item.tipo) : '';
    const matchTipo = filtroTipo === '' || tipoStr === filtroTipo;
    
    return matchAnimal && matchTipo;
  });

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Vacinação':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Exame':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Tratamento':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Cirurgia':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getResultadoColor = (resultado) => {
    switch (resultado) {
      case 'Sucesso':
      case 'Recuperado':
      case 'Negativo':
        return 'text-green-400';
      case 'Positivo':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando histórico sanitário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Erro ao carregar histórico sanitário</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Histórico Sanitário</h1>
                <p className="text-sm text-gray-400">Histórico completo de procedimentos sanitários</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar Animal
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Digite o nome do animal..."
                  value={filtroAnimal}
                  onChange={(e) => setFiltroAnimal(e.target.value)}
                  className="pl-10 w-full border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Procedimento
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Todos os tipos</option>
                <option value="Vacinação">Vacinação</option>
                <option value="Exame">Exame</option>
                <option value="Tratamento">Tratamento</option>
                <option value="Cirurgia">Cirurgia</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltroAnimal('');
                  setFiltroTipo('');
                }}
                className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Total de Registros
                    </dt>
                    <dd className="text-lg font-medium text-white">
                      {historicoFiltrado.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {['Vacinação', 'Exame', 'Tratamento', 'Cirurgia'].map((tipo) => (
            <div key={tipo} className="bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        {tipo}
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        {historicoFiltrado.filter(h => h.tipo === tipo).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela do Histórico */}
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white">
              Registros do Histórico
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              {historicoFiltrado.length} registro(s) encontrado(s)
            </p>
          </div>
          {historicoFiltrado.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-2 text-sm font-medium text-white">Nenhum registro encontrado</h3>
              <p className="mt-1 text-sm text-gray-400">Nenhum registro sanitário foi encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      SERIE
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      RGN
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      SEXO
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      NASC
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      ¡ABCZg
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      DECA
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      AVO MATERNO
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Procedimento
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Resultado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {historicoFiltrado.map((item, index) => (
                    <tr key={item.id || `historico-${index}`} className="hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {item.serie || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {item.rgn || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {item.sexo || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {item.nasc ? new Date(item.nasc).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {item.abczg || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {item.deca || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {item.avoMaterno || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.tipo && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(item.tipo)}`}>
                            {item.tipo}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="max-w-xs truncate" title={item.procedimento || 'Sem descrição'}>
                          {item.procedimento || 'Sem descrição'}
                        </div>
                        {item.observacoes && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs" title={item.observacoes}>
                            {item.observacoes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {item.data ? new Date(item.data).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.resultado && (
                          <span className={`text-sm font-medium ${getResultadoColor(item.resultado)}`}>
                            {item.resultado}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}