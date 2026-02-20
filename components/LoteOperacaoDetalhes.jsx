import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  UserIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HashtagIcon,
  ViewColumnsIcon,
  BoltIcon,
  ClipboardDocumentListIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import FormatadorDetalhesLote from './relatorios/FormatadorDetalhesLote';

export default function LoteOperacaoDetalhes({ lote, onClose }) {
  const [showHistory, setShowHistory] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'erro':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pendente':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'erro': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (startDate, endDate) => {
    if (!endDate) return 'Em andamento';
    const diffMs = new Date(endDate) - new Date(startDate);
    if (diffMs < 1000) return `${diffMs}ms`;
    if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
    if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}min`;
    return `${Math.round(diffMs / 3600000)}h`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Compacto */}
        <div className="bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${getStatusColor(lote.status)} bg-opacity-20`}>
              {getStatusIcon(lote.status)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Lote {lote.numero_lote}
                <span className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(lote.status)}`}>
                  {lote.status}
                </span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                <BoltIcon className="w-3.5 h-3.5" />
                {lote.tipo_operacao}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8 bg-gray-50/50 dark:bg-gray-950/50">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Registros" 
              value={lote.quantidade_registros} 
              icon={DocumentTextIcon}
              color="blue"
            />
            <StatCard 
              label="Módulo" 
              value={lote.modulo} 
              icon={ViewColumnsIcon}
              color="purple"
            />
            <StatCard 
              label="Criado em" 
              value={formatDateTime(lote.data_criacao)} 
              icon={CalendarIcon}
              color="gray"
              subtext={lote.usuario}
            />
            <StatCard 
              label="Duração" 
              value={formatDuration(lote.data_criacao, lote.data_conclusao)} 
              icon={ClockIcon}
              color="green"
            />
          </div>

          {/* Description */}
          {lote.descricao && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                Descrição
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {lote.descricao}
              </p>
            </div>
          )}

          {/* Main Payload / Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />
              Detalhes do Lançamento
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-1">
                <FormatadorDetalhesLote detalhes={lote.detalhes} />
              </div>
            </div>
          </div>

          {/* History Section (Collapsible) */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors w-full"
            >
              {showHistory ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
              Ver Histórico de Execução
            </button>
            
            {showHistory && (
              <div className="mt-4">
                <HistoricoExecucao loteId={lote.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, subtext }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg ${colors[color] || colors.gray}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="font-bold text-gray-900 dark:text-white truncate" title={value?.toString()}>
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
}

function HistoricoExecucao({ loteId }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await fetch(`/api/lotes/${loteId}/historico`);
        if (response.ok) {
          const data = await response.json();
          setHistorico(data.historico || []);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [loteId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Nenhum histórico disponível
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {historico.map((item, index) => (
        <div key={index} className="flex gap-3 text-sm bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="mt-0.5">
            {item.status === 'concluido' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
            {item.status === 'erro' && <XCircleIcon className="w-5 h-5 text-red-500" />}
            {item.status === 'pendente' && <ClockIcon className="w-5 h-5 text-yellow-500" />}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-900 dark:text-gray-100">{item.acao}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {new Date(item.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>
            {item.detalhes && <p className="text-gray-600 dark:text-gray-400 mt-1">{item.detalhes}</p>}
            {item.erro && <p className="text-red-600 mt-1 font-medium">{item.erro}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}