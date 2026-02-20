

// Ícones temáticos para pecuária
import React, { memo } from 'react'

const CattleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21c0-1.66 1.34-3 3-3s3 1.34 3 3" />
  </svg>
)

const TrendingUpIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const CurrencyDollarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const StatCard = memo(({ title, value, change, changeType, icon: Icon, color = 'blue', gradient = false }) => {
  const colorConfigs = {
    blue: {
      bg: gradient ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-blue-100 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: gradient ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-700'
    },
    green: {
      bg: gradient ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-green-100 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      iconBg: gradient ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-700'
    },
    yellow: {
      bg: gradient ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      iconBg: gradient ? 'bg-white/20' : 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-700'
    },
    purple: {
      bg: gradient ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-purple-100 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      iconBg: gradient ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-700'
    }
  }

  const config = colorConfigs[color]

  return (
    <div className="group transform transition-all duration-300 hover:scale-105 animate-fade-in-up">
      <div className={`card hover:shadow-2xl transition-all duration-300 overflow-hidden relative ${gradient ? 'border-0' : ''} ${config.border}`}>
        {/* Efeito de brilho decorativo */}
        {gradient && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
          </div>
        )}
        
        <div className={`card-body ${gradient ? config.bg : ''} p-6 relative z-10`}>
          <div className="flex items-center justify-between">
            <div className={gradient ? 'text-white' : ''}>
              <p className={`text-sm font-medium ${gradient ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'} mb-1`}>
                {title}
              </p>
              <p className={`text-3xl font-bold mt-2 ${gradient ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {value}
              </p>
              {change && (
                <div className="flex items-center mt-3 animate-fade-in">
                  <TrendingUpIcon className={`h-4 w-4 mr-1 ${gradient ? 'text-green-300' : 'text-green-500'} animate-bounce-subtle`} />
                  <span className={`text-sm font-medium ${
                    gradient ? 'text-green-300' : 'text-green-600'
                  }`}>
                    {change}
                  </span>
                  <span className={`text-sm ml-1 ${gradient ? 'text-white/70' : 'text-gray-500'}`}>
                    vs mês anterior
                  </span>
                </div>
              )}
            </div>
            {Icon && (
              <div className={`p-4 rounded-xl ${config.iconBg} ${gradient ? 'bg-white/20 backdrop-blur-sm' : ''} transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className={`h-8 w-8 ${gradient ? 'text-white' : config.icon}`} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

StatCard.displayName = 'StatCard'

const StatsCards = memo(({ stats }) => {
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Animais"
        value={stats.totalAnimals || 0}
        change={stats.totalAnimals > 0 ? `${stats.activeAnimals} ativos` : null}
        icon={CattleIcon}
        color="blue"
        gradient={true}
      />
      <StatCard
        title="Nascimentos (30 dias)"
        value={stats.birthsThisMonth || 0}
        change={stats.birthsChange ? `${stats.birthsChange > 0 ? '+' : ''}${stats.birthsChange}%` : null}
        changeType={stats.birthsChange >= 0 ? 'increase' : 'decrease'}
        color="green"
        gradient={true}
      />
      <StatCard
        title="Doses de Sêmen"
        value={stats.availableDoses || 0}
        change={stats.totalSemen ? `${stats.totalSemen} touros` : null}
        color="purple"
        gradient={true}
      />
      <StatCard
        title="Receita Total"
        value={`R$ ${(stats.totalRevenue || 0).toLocaleString('pt-BR')}`}
        change="Dados reais"
        icon={CurrencyDollarIcon}
        color="yellow"
        gradient={true}
      />
    </div>
  )
})

StatsCards.displayName = 'StatsCards'

export default StatsCards
