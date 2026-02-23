import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export default function MobileAnimal() {
  const router = useRouter()
  const [serie, setSerie] = useState('')
  const [rg, setRg] = useState('')
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allAnimals, setAllAnimals] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // Carregar todos os animais para navegação
  useEffect(() => {
    fetch('/api/animals?orderBy=created_at')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setAllAnimals(data.data)
        }
      })
      .catch(err => console.error('Erro ao carregar animais:', err))
  }, [])

  const buscarAnimal = async (e) => {
    if (e) e.preventDefault()
    
    if (!serie || !rg) {
      setError('Digite a Série e o RG')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/animals?serie=${serie}&rg=${rg}`)
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        const animalEncontrado = data.data[0]
        setAnimal(animalEncontrado)
        
        // Encontrar índice do animal na lista completa
        const idx = allAnimals.findIndex(a => a.id === animalEncontrado.id)
        setCurrentIndex(idx)
      } else {
        setError('Animal não encontrado')
        setAnimal(null)
      }
    } catch (err) {
      setError('Erro ao buscar animal')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const navegarAnimal = (direcao) => {
    if (allAnimals.length === 0) return
    
    let novoIndex = currentIndex
    
    if (direcao === 'primeiro') novoIndex = 0
    else if (direcao === 'anterior') novoIndex = Math.max(0, currentIndex - 1)
    else if (direcao === 'proximo') novoIndex = Math.min(allAnimals.length - 1, currentIndex + 1)
    else if (direcao === 'ultimo') novoIndex = allAnimals.length - 1
    
    if (novoIndex !== currentIndex && allAnimals[novoIndex]) {
      const novoAnimal = allAnimals[novoIndex]
      setAnimal(novoAnimal)
      setSerie(novoAnimal.serie)
      setRg(novoAnimal.rg)
      setCurrentIndex(novoIndex)
    }
  }

  const limparBusca = () => {
    setSerie('')
    setRg('')
    setAnimal(null)
    setError('')
    setCurrentIndex(-1)
  }

  return (
    <>
      <Head>
        <title>Beef-Sync Mobile | Buscar Animal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Beef-Sync Mobile</h1>
          <div className="w-9" />
        </div>

        {/* Busca */}
        {!animal && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
              🔍 Buscar Animal
            </h2>
            
            <form onSubmit={buscarAnimal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Série
                </label>
                <input
                  type="text"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value.toUpperCase())}
                  placeholder="Ex: CJ"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RG
                </label>
                <input
                  type="text"
                  value={rg}
                  onChange={(e) => setRg(e.target.value)}
                  placeholder="Ex: 15543"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !serie || !rg}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    Buscar Animal
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Resultado */}
        {animal && (
          <div className="space-y-4">
            {/* Card Principal */}
            <div className={`rounded-2xl shadow-2xl p-5 ${
              animal.sexo?.toLowerCase().includes('macho') 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
                : 'bg-gradient-to-br from-pink-600 to-purple-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={limparBusca}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium"
                >
                  ← Voltar
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  animal.situacao === 'Ativo' ? 'bg-green-500 text-white' :
                  animal.situacao === 'Vendido' ? 'bg-blue-500 text-white' :
                  animal.situacao === 'Morto' ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {animal.situacao || 'Ativo'}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {animal.serie} {animal.rg}
              </h2>
              <p className="text-white/80 text-sm mb-1">
                ID: {animal.id} • {animal.raca}
              </p>
              <p className="text-white/90 text-sm font-medium">
                {animal.sexo} • {animal.meses || 0} meses
              </p>

              {/* Navegação */}
              {allAnimals.length > 0 && currentIndex >= 0 && (
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/20">
                  <span className="text-white font-bold">
                    {currentIndex + 1} de {allAnimals.length}
                  </span>
                  <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => navegarAnimal('primeiro')}
                      disabled={currentIndex === 0}
                      className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navegarAnimal('anterior')}
                      disabled={currentIndex === 0}
                      className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navegarAnimal('proximo')}
                      disabled={currentIndex === allAnimals.length - 1}
                      className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navegarAnimal('ultimo')}
                      disabled={currentIndex === allAnimals.length - 1}
                      className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Custos Totais</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  R$ 0,00
                </p>
              </div>
            </div>

            {/* Botões de Ação - Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push(`/animals/${animal.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <PlusCircleIcon className="h-6 w-6" />
                <span className="text-sm">Lançar</span>
              </button>

              <button
                onClick={() => alert('Função em desenvolvimento')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <PlusCircleIcon className="h-6 w-6" />
                <span className="text-sm">Lote</span>
              </button>

              <button
                onClick={() => alert('Função em desenvolvimento')}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <DocumentArrowDownIcon className="h-6 w-6" />
                <span className="text-sm">PDF</span>
              </button>

              <button
                onClick={() => router.push(`/animals/${animal.id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <PencilIcon className="h-6 w-6" />
                <span className="text-sm">Editar</span>
              </button>
            </div>

            {/* Informações Detalhadas - Colapsáveis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3">
                  📋 Informações
                </h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Nome</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {animal.nome || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Raça</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {animal.raca || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Sexo</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {animal.sexo || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Idade</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {animal.meses || 0} meses
                    </p>
                  </div>

                  {animal.peso && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Peso</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {animal.peso} kg
                      </p>
                    </div>
                  )}

                  {animal.data_nascimento && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Nascimento</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(animal.data_nascimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {animal.pai && (
                    <div className="col-span-2">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Pai</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {animal.pai}
                      </p>
                    </div>
                  )}

                  {animal.mae && (
                    <div className="col-span-2">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Mãe</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {animal.mae}
                      </p>
                    </div>
                  )}
                </div>

                {animal.observacoes && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Observações</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {animal.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botão Ver Detalhes Completos */}
            <button
              onClick={() => router.push(`/animals/${animal.id}`)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              Ver Detalhes Completos
            </button>
          </div>
        )}
      </div>
    </>
  )
}
