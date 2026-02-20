import React, { useEffect, useState } from 'react'
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export default function RelatoriosOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    animalId: '',
    startDate: '',
    endDate: '',
    servico: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0
  });

  useEffect(() => {
    fetchAnimals();
    fetchOcorrencias();
  }, []);

  useEffect(() => {
    fetchOcorrencias();
  }, [filters, pagination.offset]);

  const fetchAnimals = async () => {
    try {
      const response = await fetch('/api/animals');
      if (response.ok) {
        const result = await response.json();
        // A API retorna { status: 'success', data: animais }
        const animalsData = result.data || result;
        setAnimals(Array.isArray(animalsData) ? animalsData : []);
      } else {
        console.error('Erro na resposta da API:', response.status);
        setAnimals([]);
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      setAnimals([]);
    }
  };

  const fetchOcorrencias = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: pagination.offset,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/animals/ocorrencias?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOcorrencias(data.ocorrencias);
        setPagination(prev => ({
          ...prev,
          total: data.total
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      animalId: '',
      startDate: '',
      endDate: '',
      servico: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const exportToExcel = () => {
    const exportData = ocorrencias.map(ocorrencia => ({
      'Data Registro': format(new Date(ocorrencia.data_registro), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      'Animal': ocorrencia.animal_serie || ocorrencia.nome,
      'RG': ocorrencia.rg,
      'Série': ocorrencia.serie,
      'Sexo': ocorrencia.sexo,
      'Nascimento': ocorrencia.nascimento ? format(new Date(ocorrencia.nascimento), 'dd/MM/yyyy', { locale: ptBR }) : '',
      'Idade (meses)': ocorrencia.meses,
      'Peso (kg)': ocorrencia.peso,
      'Data Serviço': ocorrencia.data_servico ? format(new Date(ocorrencia.data_servico), 'dd/MM/yyyy', { locale: ptBR }) : '',
      'Serviços': ocorrencia.servicos_aplicados ? ocorrencia.servicos_aplicados.join(', ') : '',
      'IABCZ': ocorrencia.iabcz,
      'DECA': ocorrencia.deca,
      'MGQ': ocorrencia.mgq,
      'TOP': ocorrencia.top,
      'MGTA': ocorrencia.mgta,
      'TOP Programa': ocorrencia.top_programa,
      'Pai': ocorrencia.pai_nome_rg,
      'Avô Materno': ocorrencia.avo_materno,
      'Mãe': ocorrencia.mae_biologia_rg,
      'Receptora': ocorrencia.receptora,
      'Ativos': ocorrencia.ativos ? 'Sim' : 'Não',
      'Vendidos': ocorrencia.vendidos ? 'Sim' : 'Não',
      'Baixados': ocorrencia.baixados ? 'Sim' : 'Não',
      'Observações': ocorrencia.observacoes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ocorrências');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 15 }, // Data Registro
      { wch: 20 }, // Animal
      { wch: 10 }, // RG
      { wch: 10 }, // Série
      { wch: 8 },  // Sexo
      { wch: 12 }, // Nascimento
      { wch: 12 }, // Idade
      { wch: 10 }, // Peso
      { wch: 12 }, // Data Serviço
      { wch: 20 }, // Serviços
      { wch: 10 }, // IABCZ
      { wch: 10 }, // DECA
      { wch: 10 }, // MGQ
      { wch: 10 }, // TOP
      { wch: 10 }, // MGTA
      { wch: 15 }, // TOP Programa
      { wch: 20 }, // Pai
      { wch: 20 }, // Avô Materno
      { wch: 20 }, // Mãe
      { wch: 20 }, // Receptora
      { wch: 8 },  // Ativos
      { wch: 8 },  // Vendidos
      { wch: 8 },  // Baixados
      { wch: 30 }  // Observações
    ];
    ws['!cols'] = colWidths;

    const fileName = `ocorrencias_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getStatusBadge = (ocorrencia) => {
    if (ocorrencia.baixados) {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">Baixado</span>;
    }
    if (ocorrencia.vendidos) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">Vendido</span>;
    }
    if (ocorrencia.ativos) {
      return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Ativo</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">Sem Status</span>;
  };

  const nextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  const prevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios de Ocorrências</h1>
                <p className="text-gray-600 dark:text-gray-300">Visualize e exporte os registros de ocorrências dos animais</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.href = '/ocorrencias'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Nova Ocorrência
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={ocorrencias.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Exportar Excel
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Animal</label>
                <select
                  name="animalId"
                  value={filters.animalId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os animais</option>
                  {Array.isArray(animals) && animals.map(animal => (
                    <option key={animal.id} value={animal.id}>
                      {animal.serie} - RG: {animal.rg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os status</option>
                  <option value="ativos">Ativos</option>
                  <option value="vendidos">Vendidos</option>
                  <option value="baixados">Baixados</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Carregando...</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Animal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      RG/Série
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Idade/Peso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Serviços
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ocorrencias.map((ocorrencia) => (
                    <tr key={ocorrencia.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(ocorrencia.data_registro), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ocorrencia.animal_serie || ocorrencia.nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ocorrencia.sexo === 'M' ? 'Macho' : 'Fêmea'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>RG: {ocorrencia.rg}</div>
                        <div className="text-gray-500 dark:text-gray-400">Série: {ocorrencia.serie}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>{ocorrencia.meses} meses</div>
                        <div className="text-gray-500 dark:text-gray-400">{ocorrencia.peso} kg</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {ocorrencia.data_servico && (
                          <div className="mb-1">
                            {format(new Date(ocorrencia.data_servico), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ocorrencia.servicos_aplicados?.join(', ') || 'Nenhum'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ocorrencia)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {ocorrencia.observacoes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginação */}
          {!loading && ocorrencias.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} registros
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevPage}
                  disabled={pagination.offset === 0}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}

          {!loading && ocorrencias.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg">Nenhuma ocorrência encontrada</div>
              <p className="text-gray-400 dark:text-gray-500 mt-2">Tente ajustar os filtros ou registre uma nova ocorrência</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}