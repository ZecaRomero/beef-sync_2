import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import HistoricoLancamentos from '../components/HistoricoLancamentos';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function RelatoriosLotes() {
  const [activeTab, setActiveTab] = useState('historico');

  const tabs = [
    {
      id: 'historico',
      name: 'Histórico de Lançamentos',
      icon: DocumentTextIcon,
      description: 'Visualize todos os lotes de operações realizados no sistema'
    },
    {
      id: 'analytics',
      name: 'Análise de Performance',
      icon: ChartBarIcon,
      description: 'Métricas e análises de performance dos lotes'
    },
    {
      id: 'monitoring',
      name: 'Monitoramento em Tempo Real',
      icon: ClockIcon,
      description: 'Acompanhe lotes em execução e pendentes'
    }
  ];

  return (
    <>
      <Head>
        <title>Relatórios de Lotes - Beef-Sync</title>
        <meta name="description" content="Sistema de relatórios e monitoramento de lotes de operações" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
              <h1 className="text-2xl font-bold text-white">
                Sistema de Lotes - Relatórios
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Controle e rastreamento de todas as operações em lote do sistema
              </p>
            </div>

            {/* Tabs */}
            <div className="px-6 bg-white dark:bg-gray-900">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon
                        className={`-ml-0.5 mr-2 h-5 w-5 transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'text-blue-500 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                        }`}
                      />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-screen">
            {activeTab === 'historico' && <HistoricoLancamentos />}
            
            {activeTab === 'analytics' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Análise de Performance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Funcionalidade em desenvolvimento
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Esta seção incluirá gráficos de performance, tempo médio de execução,
                      taxa de sucesso e outras métricas importantes.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'monitoring' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Monitoramento em Tempo Real
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Funcionalidade em desenvolvimento
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 max-w-md mx-auto border border-yellow-100 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Esta seção mostrará lotes em execução, fila de processamento
                      e alertas em tempo real.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}