import React, { useState, useEffect } from 'react'
import { 
  HeartIcon, 
  CalendarDaysIcon, 
  BeakerIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const ReproductiveControl = () => {
  const [reproductiveData, setReproductiveData] = useState({
    pregnantAnimals: 0,
    inseminationsThisMonth: 0,
    expectedBirths: 0,
    reproductiveEfficiency: 0,
    pendingExams: 0
  })

  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadReproductiveData()
    loadAlerts()
  }, [])

  const loadReproductiveData = async () => {
    try {
      // Simular carregamento de dados reprodutivos
      setReproductiveData({
        pregnantAnimals: 45,
        inseminationsThisMonth: 12,
        expectedBirths: 8,
        reproductiveEfficiency: 78.5,
        pendingExams: 3
      })
    } catch (error) {
      console.error('Erro ao carregar dados reprodutivos:', error)
    }
  }

  const loadAlerts = () => {
    setAlerts([
      {
        id: 1,
        type: 'warning',
        message: 'Exame andrológico pendente para Touro 001',
        date: '2025-01-15'
      },
      {
        id: 2,
        type: 'info',
        message: 'Previsão de parto para Vaca 234 em 5 dias',
        date: '2025-01-20'
      },
      {
        id: 3,
        type: 'success',
        message: 'Taxa de prenhez acima da meta este mês',
        date: '2025-01-14'
      }
    ])
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')} dark:${color.replace('text-', 'bg-').replace('600', '900/20')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  const AlertItem = ({ alert }) => {
    const getAlertColor = (type) => {
      switch (type) {
        case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
        case 'info': return 'border-blue-200 bg-blue-50 text-blue-800'
        case 'success': return 'border-green-200 bg-green-50 text-green-800'
        default: return 'border-gray-200 bg-gray-50 text-gray-800'
      }
    }

    return (
      <div className={`p-4 rounded-lg border ${getAlertColor(alert.type)} dark:bg-gray-800 dark:border-gray-600`}>
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.message}</p>
            <p className="text-xs mt-1 opacity-75">{alert.date}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <HeartIcon className="h-8 w-8 text-pink-600 mr-3" />
            Controle Reprodutivo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestão completa do programa reprodutivo do rebanho
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Animais Gestantes"
          value={reproductiveData.pregnantAnimals}
          icon={HeartIcon}
          color="text-pink-600"
          subtitle="Em acompanhamento"
        />
        <StatCard
          title="IAs Este Mês"
          value={reproductiveData.inseminationsThisMonth}
          icon={BeakerIcon}
          color="text-blue-600"
          subtitle="Inseminações realizadas"
        />
        <StatCard
          title="Partos Previstos"
          value={reproductiveData.expectedBirths}
          icon={CalendarDaysIcon}
          color="text-green-600"
          subtitle="Próximos 30 dias"
        />
        <StatCard
          title="Eficiência Reprodutiva"
          value={`${reproductiveData.reproductiveEfficiency}%`}
          icon={ChartBarIcon}
          color="text-purple-600"
          subtitle="Taxa de prenhez"
        />
        <StatCard
          title="Exames Pendentes"
          value={reproductiveData.pendingExams}
          icon={DocumentTextIcon}
          color="text-orange-600"
          subtitle="Andrológicos"
        />
      </div>

      {/* Alertas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alertas Reprodutivos
        </h2>
        <div className="space-y-3">
          {alerts.map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-pink-600 hover:bg-pink-700 text-white p-6 rounded-xl shadow-lg transition-colors">
          <HeartIcon className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-semibold">Nova Inseminação</h3>
          <p className="text-sm opacity-90 mt-1">Registrar IA</p>
        </button>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-lg transition-colors">
          <CalendarDaysIcon className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-semibold">Agendar Exame</h3>
          <p className="text-sm opacity-90 mt-1">Exame andrológico</p>
        </button>
        
        <button className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-lg transition-colors">
          <DocumentTextIcon className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-semibold">Relatório</h3>
          <p className="text-sm opacity-90 mt-1">Performance reprodutiva</p>
        </button>
      </div>
    </div>
  )
}

export default ReproductiveControl