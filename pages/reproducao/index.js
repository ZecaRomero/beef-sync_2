import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  HeartIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowRightIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

export default function ReproducaoIndex() {
  const modules = [
    {
      title: 'Controle Reprodutivo',
      description: 'Gerencie o programa reprodutivo do rebanho',
      href: '/reproducao/controle',
      icon: HeartIcon,
      color: 'bg-red-500',
      stats: 'Gestantes, Inseminações, Coberturas'
    },
    {
      title: 'Coleta de Oócitos (FIV)',
      description: 'Gestão de coletas para FIV',
      href: '/reproducao/coleta-fiv',
      icon: BeakerIcon,
      color: 'bg-pink-500',
      stats: 'Coletas, Oócitos'
    },
    {
      title: 'Calendário Reprodutivo',
      description: 'Visualize datas importantes e previsões',
      href: '/reproducao/calendario',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      stats: 'Previsões de Parto, Cios'
    },
    {
      title: 'Relatórios Reprodutivos',
      description: 'Análises e estatísticas reprodutivas',
      href: '/reproducao/relatorios',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      stats: 'Taxa de Prenhez, Performance'
    },
    {
      title: 'Genealogia',
      description: 'Controle de linhagens e genealogia',
      href: '/reproducao/genealogia',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      stats: 'Pedigree, Linhagens'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Módulo de Reprodução - Beef Sync</title>
        <meta name="description" content="Sistema completo de gestão reprodutiva" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HeartIcon className="h-12 w-12 text-red-500 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Módulo de Reprodução
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Sistema completo para gestão reprodutiva do seu rebanho. 
            Controle inseminações, acompanhe gestações e otimize a performance reprodutiva.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">--</h3>
            <p className="text-gray-600 dark:text-gray-400">Gestantes</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">--</h3>
            <p className="text-gray-600 dark:text-gray-400">Inseminações</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">--%</h3>
            <p className="text-gray-600 dark:text-gray-400">Taxa Prenhez</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">--</h3>
            <p className="text-gray-600 dark:text-gray-400">Próximos Partos</p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.href} href={module.href}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mr-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {module.description}
                        </p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Funcionalidades:</strong> {module.stats}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mr-4">
              <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-1">
                Módulos em Desenvolvimento
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                Alguns módulos ainda estão sendo desenvolvidos. O Controle Reprodutivo já está disponível para uso.
                Novos recursos serão adicionados em breve.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Ações Rápidas
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/reproducao/controle">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                <HeartIcon className="h-5 w-5" />
                <span>Acessar Controle</span>
              </button>
            </Link>
            <Link href="/animals">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                <UserGroupIcon className="h-5 w-5" />
                <span>Ver Animais</span>
              </button>
            </Link>
            <Link href="/reports">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Relatórios</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}