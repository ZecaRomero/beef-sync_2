import { useState, useEffect } from 'react'
import Head from 'next/head'
import { DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function BoletimDefesaMobile() {
  const [fazendas, setFazendas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const response = await fetch('/api/boletim-defesa')
      const data = await response.json()
      setFazendas(data.fazendas || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularSubtotais = (quantidades) => {
    const faixas = ['0a3', '3a8', '8a12', '12a24', '25a36', 'acima36']
    let totalM = 0
    let totalF = 0

    faixas.forEach(faixa => {
      totalM += quantidades[faixa]?.M || 0
      totalF += quantidades[faixa]?.F || 0
    })

    return { M: totalM, F: totalF, total: totalM + totalF }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Boletim Defesa Mobile - Beef-Sync</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Boletim Defesa</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quantidades de gado</p>
              </div>
            </div>
            <button
              onClick={carregarDados}
              className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>

        {/* Fazendas */}
        <div className="space-y-4">
          {fazendas.map(fazenda => {
            const subtotais = calcularSubtotais(fazenda.quantidades)
            
            return (
              <div key={fazenda.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Header da fazenda */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                  <h2 className="text-base font-bold text-white">{fazenda.nome}</h2>
                  <p className="text-xs text-blue-100">{fazenda.cnpj}</p>
                </div>

                {/* Total em destaque */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-5 border-b-2 border-red-300 dark:border-red-700">
                  <div className="text-center">
                    <p className="text-xs text-red-700 dark:text-red-300 mb-2 font-semibold uppercase tracking-wider">Total Geral</p>
                    <p className="text-5xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">{subtotais.total}</p>
                    <div className="flex justify-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">♂ Machos</p>
                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{subtotais.M}</span>
                      </div>
                      <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                      <div className="text-center">
                        <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">♀ Fêmeas</p>
                        <span className="text-2xl font-bold text-pink-700 dark:text-pink-300">{subtotais.F}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Faixas etárias */}
                <div className="p-4 space-y-3">
                  {[
                    { key: '0a3', label: '0 a 3 meses', colorClass: 'from-blue-600 to-blue-700' },
                    { key: '3a8', label: '3 a 8 meses', colorClass: 'from-indigo-600 to-indigo-700' },
                    { key: '8a12', label: '8 a 12 meses', colorClass: 'from-purple-600 to-purple-700' },
                    { key: '12a24', label: '12 a 24 meses', colorClass: 'from-violet-600 to-violet-700' },
                    { key: '25a36', label: '25 a 36 meses', colorClass: 'from-fuchsia-600 to-fuchsia-700' },
                    { key: 'acima36', label: 'Acima de 36 meses', colorClass: 'from-pink-600 to-pink-700' }
                  ].map(faixa => {
                    const m = fazenda.quantidades[faixa.key]?.M || 0
                    const f = fazenda.quantidades[faixa.key]?.F || 0
                    const total = m + f

                    return (
                      <div key={faixa.key} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {faixa.label}
                          </span>
                          <span className={`text-2xl font-bold bg-gradient-to-r ${faixa.colorClass} bg-clip-text text-transparent`}>
                            {total}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl p-3 border border-blue-300 dark:border-blue-700">
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-semibold">♂ Machos</p>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{m}</p>
                          </div>
                          <div className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40 rounded-xl p-3 border border-pink-300 dark:border-pink-700">
                            <p className="text-xs text-pink-700 dark:text-pink-300 mb-1 font-semibold">♀ Fêmeas</p>
                            <p className="text-2xl font-bold text-pink-800 dark:text-pink-200">{f}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {fazendas.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma fazenda cadastrada
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acesse o sistema desktop para cadastrar fazendas
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
