import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  StarIcon,
  CheckCircleIcon,
  PlusIcon,
  TrendingUpIcon
} from '../../components/ui/Icons'

export default function GoalsObjectives() {
  const [mounted, setMounted] = useState(false)
  const [goals, setGoals] = useState([])
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    current: '',
    deadline: '',
    category: 'rebanho'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    loadGoals()
  }, [mounted])

  const loadGoals = async () => {
    try {
      if (typeof window === 'undefined') return

      const savedGoals = localStorage.getItem('goals')
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals))
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    }
  }

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return
    
    const currentVal = parseFloat(newGoal.current) || 0
    const targetVal = parseFloat(newGoal.target) || 1
    const progress = Math.min((currentVal / targetVal) * 100, 100)

    const goal = {
      id: Date.now(),
      ...newGoal,
      target: parseFloat(newGoal.target),
      current: currentVal,
      progress
    }
    
    const updatedGoals = [...goals, goal]
    setGoals(updatedGoals)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('goals', JSON.stringify(updatedGoals))
    }
    
    setNewGoal({
      title: '',
      description: '',
      target: '',
      current: '',
      deadline: '',
      category: 'rebanho'
    })
    setShowNewGoal(false)
  }

  const categories = {
    rebanho: { label: 'Rebanho', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
    reproducao: { label: 'Reprodução', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200' },
    financeiro: { label: 'Financeiro', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
    saude: { label: 'Saúde', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando metas...</p>
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
            <StarIcon className="h-8 w-8 text-blue-600" />
            Metas e Objetivos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Defina e acompanhe seus objetivos
          </p>
        </div>
        <Button onClick={() => setShowNewGoal(true)} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Meta
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <Card key={goal.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {goal.title}
                </h3>
                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${categories[goal.category]?.color || ''}`}>
                {categories[goal.category]?.label || goal.category}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Progresso
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {goal.progress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    goal.progress >= 75 ? 'bg-green-500' :
                    goal.progress >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Atual</p>
                <p className="font-semibold text-gray-900 dark:text-white">{goal.current}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Meta</p>
                <p className="font-semibold text-gray-900 dark:text-white">{goal.target}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Faltam</p>
                <p className="font-semibold text-gray-900 dark:text-white">{Math.max(0, goal.target - goal.current).toFixed(0)}</p>
              </div>
            </div>

            {/* Deadline */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
            </div>
          </Card>
        ))}
      </div>

      {/* New Goal Modal */}
      {showNewGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Nova Meta
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ex: Aumentar rebanho"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Detalhes da meta..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta
                  </label>
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Atual
                  </label>
                  <input
                    type="number"
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="rebanho">Rebanho</option>
                  <option value="reproducao">Reprodução</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="saude">Saúde</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prazo
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowNewGoal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddGoal}
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
