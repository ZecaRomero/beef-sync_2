import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function LotesWidget() {
  const [stats, setStats] = useState({
    total_lotes: 0,
    lotes_concluidos: 0,
    lotes_erro: 0,
    lotes_pendentes: 0,
    total_registros: 0
  });
  const [recentLotes, setRecentLotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosLotes();
  }, []);

  const carregarDadosLotes = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas e lotes recentes
      const response = await fetch('/api/lotes?limit=5');
      
      // Verificar se a resposta é JSON antes de fazer parse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API de lotes retornou resposta não-JSON, usando dados padrão');
        return;
      }
      
      const data = await response.json();

      if (response.ok && data && data.success !== false) {
        // Garantir que stats tenha as propriedades necessárias
        const responseData = data.data || data;
        const safeStats = {
          total_lotes: responseData.stats?.total_lotes || 0,
          lotes_concluidos: responseData.stats?.lotes_concluidos || 0,
          lotes_erro: responseData.stats?.lotes_erro || 0,
          lotes_pendentes: responseData.stats?.lotes_pendentes || 0,
          total_registros: responseData.stats?.total_registros || 0
        };
        
        setStats(safeStats);
        setRecentLotes(Array.isArray(responseData.lotes) ? responseData.lotes : []);
      } else {
        console.warn('API de lotes não disponível, usando dados padrão');
        // Manter valores padrão se API não estiver disponível
      }
    } catch (error) {
      console.error('Erro ao carregar dados de lotes:', error);
      // Manter valores padrão em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido': return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'erro': return <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />;
      case 'pendente': return <ClockIcon className="h-4 w-4 text-yellow-400" />;
      default: return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluido': return 'text-green-300 bg-green-900/50 border border-green-700';
      case 'erro': return 'text-red-300 bg-red-900/50 border border-red-700';
      case 'pendente': return 'text-yellow-300 bg-yellow-900/50 border border-yellow-700';
      default: return 'text-gray-300 bg-gray-700/50 border border-gray-600';
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-600 rounded"></div>
            <div className="h-3 bg-gray-600 rounded w-5/6"></div>
            <div className="h-3 bg-gray-600 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Sistema de Lotes</h3>
        </div>
        <a 
          href="/relatorios-lotes" 
          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
        >
          Ver todos
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-900/30 rounded-lg border border-blue-800/50">
          <div className="text-2xl font-bold text-blue-400">{stats.total_lotes}</div>
          <div className="text-sm text-blue-300">Total de Lotes</div>
        </div>
        <div className="text-center p-3 bg-green-900/30 rounded-lg border border-green-800/50">
          <div className="text-2xl font-bold text-green-400">{stats.total_registros}</div>
          <div className="text-sm text-green-300">Registros</div>
        </div>
      </div>

      {/* Status dos Lotes */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-400" />
            <span className="text-gray-300">Concluídos</span>
          </div>
          <span className="font-semibold text-green-400">{stats.lotes_concluidos}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
            <span className="text-gray-300">Com Erro</span>
          </div>
          <span className="font-semibold text-red-400">{stats.lotes_erro}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300">Pendentes</span>
          </div>
          <span className="font-semibold text-yellow-400">{stats.lotes_pendentes}</span>
        </div>
      </div>

      {/* Lotes Recentes */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Lotes Recentes</h4>
        <div className="space-y-2">
          {recentLotes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">Nenhum lote encontrado</p>
          ) : (
            recentLotes.map((lote) => (
              <div key={lote.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(lote.status)}
                  <div>
                    <div className="text-sm font-medium text-white">
                      Lote {lote.numero_lote}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-32">
                      {lote.descricao}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lote.status)}`}>
                    {lote.status}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatarData(lote.data_criacao)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Link para teste */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <a 
          href="/teste-lotes" 
          className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
        >
          <PlayIcon className="h-4 w-4" />
          Testar Sistema de Lotes
        </a>
      </div>
    </div>
  );
}
