import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '../../components/ui/Icons'

export default function ActivityAgenda() {
  const [mounted, setMounted] = useState(false)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    priority: 'medium',
    status: 'pending'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    loadActivities()
  }, [mounted])

  const loadActivities = async () => {
    try {
      setLoading(true)
      
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }

      const savedActivities = localStorage.getItem('activities')
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities))
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = () => {
    if (!newActivity.title.trim()) return
    
    const activity = {
      id: Date.now(),
      ...newActivity
    }
    
    const updatedActivities = [...activities, activity]
    setActivities(updatedActivities)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('activities', JSON.stringify(updatedActivities))
    }
    
    setNewActivity({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      priority: 'medium',
      status: 'pending'
    })
    setShowNewActivity(false)
  }

  const handleToggleActivity = (id) => {
    const updatedActivities = activities.map(a => 
      a.id === id ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' } : a
    )
    setActivities(updatedActivities)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('activities', JSON.stringify(updatedActivities))
    }
  }

  const filteredActivities = activities.filter(a => a.date === selectedDate)

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando agenda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            Agenda de Atividades
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Cronograma de atividades e tarefas
          </p>
        </div>
        <Button onClick={() => setShowNewActivity(true)} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Atividade
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Calendário</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </Card>

        {/* Activities List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredActivities.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma atividade agendada para {new Date(selectedDate).toLocaleDateString('pt-BR')}
              </p>
            </Card>
          ) : (
            filteredActivities.map(activity => (
              <Card
                key={activity.id}
                className={`p-4 cursor-pointer transition-all ${
                  activity.status === 'completed'
                    ? 'bg-gray-50 dark:bg-gray-800 opacity-60'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleToggleActivity(activity.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={activity.status === 'completed'}
                      onChange={() => handleToggleActivity(activity.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${
                          activity.status === 'completed'
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {activity.title}
                        </h3>
                        {activity.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        activity.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                          : activity.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      }`}>
                        {activity.priority === 'high' ? 'Alta' : activity.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showNewActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Nova Atividade
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="Ex: Vacinação do rebanho"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Detalhes da atividade..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={newActivity.priority}
                  onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowNewActivity(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddActivity}
                className="flex-1"
              >
                Adicionar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
