import React, { useState, useEffect } from 'react'
import { 
  BeakerIcon, 
  ScaleIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const NutritionManagement = () => {
  const [nutritionData, setNutritionData] = useState({
    totalFeedings: 0,
    supplementsActive: 0,
    nutritionAlerts: 0,
    monthlyCost: 0,
    averageWeight: 0
  })

  const [feedingSchedule, setFeedingSchedule] = useState([])
  const [supplements, setSupplements] = useState([])
  const [nutritionAlerts, setNutritionAlerts] = useState([])

  useEffect(() => {
    loadNutritionData()
    loadFeedingSchedule()
    loadSupplements()
    loadNutritionAlerts()
  }, [])

  const loadNutritionData = async () => {
    try {
      setNutritionData({
        totalFeedings: 3,
        supplementsActive: 5,
        nutritionAlerts: 2,
        monthlyCost: 15420.50,
        averageWeight: 485.2
      })
    } catch (error) {
      console.error('Erro ao carregar dados nutricionais:', error)
    }
  }

  const loadFeedingSchedule = () => {
    setFeedingSchedule([
      {
        id: 1,
        time: '06:00',
        type: 'Ração Concentrada',
        location: 'Curral de Alimentação',
        quantity: '150 kg',
        animals: 45,
        status: 'completed'
      },
      {
        id: 2,
        time: '12:00',
        type: 'Sal Mineral',
        location: 'Cochos dos Pastos',
        quantity: '25 kg',
        animals: 180,
        status: 'pending'
      },
      {
        id: 3,
        time: '18:00',
        type: 'Silagem de Milho',
        location: 'Área de Confinamento',
        quantity: '800 kg',
        animals: 65,
        status: 'scheduled'
      }
    ])
  }

  const loadSupplements = () => {
    setSupplements([
      {
        id: 1,
        name: 'Sal Mineral Premium',
        type: 'Mineral',
        stock: 850,
        unit: 'kg',
        dailyConsumption: 12,
        daysRemaining: 70,
        cost: 4.50,
        status: 'adequate'
      },
      {
        id: 2,
        name: 'Proteinado 20%',
        type: 'Proteico',
        stock: 120,
        unit: 'kg',
        dailyConsumption: 8,
        daysRemaining: 15,
        cost: 2.80,
        status: 'low'
      },
      {
        id: 3,
        name: 'Ureia Pecuária',
        type: 'Nitrogenado',
        stock: 200,
        unit: 'kg',
        dailyConsumption: 3,
        daysRemaining: 66,
        cost: 1.20,
        status: 'adequate'
      },
      {
        id: 4,
        name: 'Núcleo Vitamínico',
        type: 'Vitamínico',
        stock: 45,
        unit: 'kg',
        dailyConsumption: 2,
        daysRemaining: 22,
        cost: 8.90,
        status: 'medium'
      },
      {
        id: 5,
        name: 'Calcário Calcítico',
        type: 'Mineral',
        stock: 500,
        unit: 'kg',
        dailyConsumption: 5,
        daysRemaining: 100,
        cost: 0.85,
        status: 'adequate'
      }
    ])
  }

  const loadNutritionAlerts = () => {
    setNutritionAlerts([
      {
        id: 1,
        type: 'low_stock',
        supplement: 'Proteinado 20%',
        message: 'Estoque baixo - apenas 15 dias restantes',
        severity: 'high',
        action: 'Solicitar reposição urgente'
      },
      {
        id: 2,
        type: 'weight_loss',
        animal: 'Lote 15',
        message: 'Perda de peso detectada no lote',
        severity: 'medium',
        action: 'Revisar dieta e suplementação'
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

  const FeedingCard = ({ feeding }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200'
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return 'Concluído'
        case 'pending': return 'Pendente'
        case 'scheduled': return 'Agendado'
        default: return 'Desconhecido'
      }
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{feeding.type}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{feeding.location}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(feeding.status)}`}>
            {getStatusText(feeding.status)}
          </span>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              <span>{feeding.time}</span>
            </div>
            <span>{feeding.quantity}</span>
          </div>
          <div className="flex items-center">
            <ScaleIcon className="h-4 w-4 mr-2" />
            <span>{feeding.animals} animais</span>
          </div>
        </div>
      </div>
    )
  }

  const SupplementCard = ({ supplement }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'adequate': return 'bg-green-100 text-green-800 border-green-200'
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'low': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'adequate': return 'Adequado'
        case 'medium': return 'Médio'
        case 'low': return 'Baixo'
        default: return 'Desconhecido'
      }
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{supplement.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{supplement.type}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(supplement.status)}`}>
            {getStatusText(supplement.status)}
          </span>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>Estoque: {supplement.stock} {supplement.unit}</span>
            <span>R$ {supplement.cost.toFixed(2)}/{supplement.unit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Consumo diário: {supplement.dailyConsumption} {supplement.unit}</span>
            <span className={supplement.daysRemaining < 30 ? 'text-red-600 font-medium' : ''}>
              {supplement.daysRemaining} dias
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                supplement.daysRemaining < 15 ? 'bg-red-500' : 
                supplement.daysRemaining < 30 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((supplement.daysRemaining / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  const AlertCard = ({ alert }) => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'high': return 'border-red-200 bg-red-50 text-red-800'
        case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
        case 'low': return 'border-blue-200 bg-blue-50 text-blue-800'
        default: return 'border-gray-200 bg-gray-50 text-gray-800'
      }
    }

    return (
      <div className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} dark:bg-gray-800 dark:border-gray-600`}>
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.supplement || alert.animal}</p>
            <p className="text-sm mt-1">{alert.message}</p>
            <p className="text-xs mt-2 font-medium">Ação: {alert.action}</p>
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
            <BeakerIcon className="h-8 w-8 text-green-600 mr-3" />
            Gestão Nutricional
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Controle da alimentação e suplementação do rebanho
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Alimentações Diárias"
          value={nutritionData.totalFeedings}
          icon={CalendarDaysIcon}
          color="text-blue-600"
          subtitle="Programadas hoje"
        />
        <StatCard
          title="Suplementos Ativos"
          value={nutritionData.supplementsActive}
          icon={BeakerIcon}
          color="text-green-600"
          subtitle="Em uso"
        />
        <StatCard
          title="Alertas Nutricionais"
          value={nutritionData.nutritionAlerts}
          icon={ExclamationTriangleIcon}
          color="text-red-600"
          subtitle="Requer atenção"
        />
        <StatCard
          title="Custo Mensal"
          value={`R$ ${nutritionData.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={CurrencyDollarIcon}
          color="text-purple-600"
          subtitle="Alimentação"
        />
        <StatCard
          title="Peso Médio"
          value={`${nutritionData.averageWeight} kg`}
          icon={ScaleIcon}
          color="text-indigo-600"
          subtitle="Do rebanho"
        />
      </div>

      {/* Cronograma de Alimentação */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cronograma de Alimentação - Hoje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedingSchedule.map(feeding => (
            <FeedingCard key={feeding.id} feeding={feeding} />
          ))}
        </div>
      </div>

      {/* Controle de Suplementos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Controle de Suplementos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supplements.map(supplement => (
            <SupplementCard key={supplement.id} supplement={supplement} />
          ))}
        </div>
      </div>

      {/* Alertas Nutricionais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alertas Nutricionais
        </h2>
        <div className="space-y-3">
          {nutritionAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-lg transition-colors">
          <CalendarDaysIcon className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-semibold">Nova Alimentação</h3>
          <p className="text-sm opacity-90 mt-1">Agendar fornecimento</p>
        </button>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-lg transition-colors">
          <BeakerIcon className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-semibold">Controlar Suplemento</h3>
          <p className="text-sm opacity-90 mt-1">Gerenciar estoque</p>
        </button>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-lg transition-colors">
          <ScaleIcon className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-semibold">Análise Nutricional</h3>
          <p className="text-sm opacity-90 mt-1">Avaliar dieta</p>
        </button>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl shadow-lg transition-colors">
          <ChartBarIcon className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-semibold">Relatório</h3>
          <p className="text-sm opacity-90 mt-1">Relatório nutricional</p>
        </button>
      </div>
    </div>
  )
}

export default NutritionManagement