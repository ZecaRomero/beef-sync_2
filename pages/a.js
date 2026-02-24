/**
 * Consulta Rápida de Animal - Otimizada para celular
 * Acesse pelo celular: /a - sem sidebar, somente Série e RG em inputs separados
 */
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function ConsultaRapida() {
  const router = useRouter()
  const [serie, setSerie] = useState('')
  const [rg, setRg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({ serie: false, rg: false })
  const [showSplash, setShowSplash] = useState(false)
  const [splashProgress, setSplashProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const serieRef = useRef(null)
  const autoSearchDone = useRef(false)

  // Detectar se é mobile e mostrar splash apenas em mobile (não mostrar quando vier de Nova Consulta)
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
      // Pular splash quando ?buscar=1 (vindo de Nova Consulta) - ir direto para pesquisar
      const skipSplash = typeof window !== 'undefined' && window.location.search.includes('buscar=1')
      setShowSplash(mobile && !skipSplash)
    }
    checkMobile()
  }, [])

  // Splash screen com animação de progresso (apenas mobile)
  useEffect(() => {
    if (!showSplash) return
    
    const duration = 5000 // 5 segundos
    const interval = 50 // atualizar a cada 50ms
    const steps = duration / interval
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      setSplashProgress((currentStep / steps) * 100)
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setTimeout(() => setShowSplash(false), 300)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [showSplash])

  // Auto-buscar se vier pela URL: /a?serie=CJCJ&rg=15563
  useEffect(() => {
    if (!router.isReady || autoSearchDone.current) return
    const { serie: qSerie, rg: qRg } = router.query
    if (qSerie && qRg) {
      autoSearchDone.current = true
      setSerie(String(qSerie).trim())
      setRg(String(qRg).trim())
      setLoading(true)
      const params = new URLSearchParams({ serie: qSerie, rg: qRg })
      fetch(`/api/animals/verificar?${params}`)
        .then((r) => r.json().then((data) => ({ res: r, data })))
        .then(({ res, data }) => {
          if (data.success && data.data?.id) {
            router.replace(`/consulta-animal/${data.data.id}`)
          } else {
            setError(data.message || (res.status === 500 ? 'Serviço indisponível.' : 'Animal não encontrado'))
            setLoading(false)
          }
        })
        .catch(() => {
          setError('Erro ao buscar. Verifique sua conexão.')
          setLoading(false)
        })
    }
  }, [router.isReady, router.query])

  useEffect(() => {
    serieRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const s = serie.trim().toUpperCase()
    const r = rg.trim()
    
    if (!s || !r) {
      setError('Preencha Série e RG')
      setTouched({ serie: true, rg: true })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ serie: s, rg: r })
      const res = await fetch(`/api/animals/verificar?${params}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        const msg = data.message || (res.status === 500 ? 'Serviço indisponível. Tente novamente.' : 'Animal não encontrado')
        throw new Error(msg)
      }

      const animalId = data.data?.id
      if (animalId) {
        router.push(`/consulta-animal/${animalId}`)
      } else {
        throw new Error('Animal não encontrado')
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar.')
      setLoading(false)
    }
  }

  const isSerieValid = serie.trim().length > 0
  const isRgValid = rg.trim().length > 0
  const canSubmit = isSerieValid && isRgValid && !loading

  const getInputClass = (isValid, isTouched) => {
    const baseClass = 'w-full px-4 py-4 text-lg rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    if (isTouched && !isValid) {
      return `${baseClass} border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500`
    }
    if (isTouched && isValid) {
      return `${baseClass} border-green-400 dark:border-green-500 focus:border-green-500 focus:ring-green-500`
    }
    return `${baseClass} border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500`
  }

  return (
    <>
      <Head>
        <title>Consulta Animal | Beef-Sync</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      {/* Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900 flex items-center justify-center z-[9999] transition-opacity duration-300">
          <div className="text-center space-y-8 px-4">
            {/* Logo da Fazenda com Prancheta */}
            <div className="relative">
              <div className="animate-bounce">
                <div className="w-45 h-40 mx-auto relative rounded-2xl shadow-2xl overflow-hidden bg-white">
                  <div className="relative w-full h-full">
                    <Image 
                      src="/logo-santanna.png.jpg" 
                      alt="Logo Fazenda Sant'Anna"
                      fill
                      className="object-"
                      style={{ objectPosition: 'center center' }}
                      priority
                    />
                  </div>
                </div>
              </div>
              
              {/* Prancheta/Clipboard animado */}
              <div 
                className="absolute -right-14 top-10 text-blue-300"
                style={{ 
                  animation: 'float 2s ease-in-out infinite',
                  transformOrigin: 'center'
                }}
              >
                <svg className="w-20 h-35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  <path d="M9 12h6m-6 4h6"/>
                </svg>
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Beef-Sync
              </h1>
              <p className="text-amber-200 text-lg animate-pulse">
                Iniciando o sistema...
              </p>
            </div>

            {/* Barra de progresso */}
            <div className="w-64 mx-auto">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300 ease-out"
                  style={{ width: `${splashProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {Math.round(splashProgress)}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="">
          {/* Logo e Header */}
          <div className="mb-8 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 overflow-hidden p-2">
              <Image 
                src="/Host_ico_rede.ico" 
                alt="Ícone Nelore"
                width={100}
                height={58}
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-500 dark:to-amber-400 bg-clip-text text-transparent mb-2">
              Beef-Sync
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Bem-vindo! Use os campos abaixo para consultar a ficha de um animal.
            </p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-4 animate-slide-up">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <MagnifyingGlassIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              Consulta Animal
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Digite os números no celular (Série e RG)
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Série */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Série
                </label>
                <div className="relative">
                  <input
                    ref={serieRef}
                    type="text"
                    value={serie}
                    onChange={(e) => {
                      setSerie(e.target.value.toUpperCase())
                      setError('')
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, serie: true }))}
                    placeholder="Série (Ex: CJCJ)"
                    className={getInputClass(isSerieValid, touched.serie)}
                    autoComplete="on"
                    autoCapitalize="characters"
                    inputMode="text"
                    disabled={loading}
                  />
                  {touched.serie && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isSerieValid ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {touched.serie && !isSerieValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    A série é obrigatória
                  </p>
                )}
              </div>

              {/* Campo RG */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RG
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={rg}
                    onChange={(e) => {
                      setRg(e.target.value)
                      setError('')
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, rg: true }))}
                    placeholder="RG (digite os números no celular)"
                    className={getInputClass(isRgValid, touched.rg)}
                    autoComplete="off"
                    inputMode="numeric"
                    disabled={loading}
                  />
                  {touched.rg && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isRgValid ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {touched.rg && !isRgValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    O RG é obrigatório
                  </p>
                )}
              </div>

              {/* Botão de Busca */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:shadow-amber-600/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-6 h-6" />
                    Buscar
                  </>
                )}
              </button>
            </form>

            {/* Mensagem de Erro */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start gap-2 animate-shake">
                <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Dica de Exemplo */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 inline-block">
              💡 Exemplo: Série <span className="font-semibold text-amber-600 dark:text-amber-500">CJCJ</span> e RG <span className="font-semibold text-amber-600 dark:text-amber-500">15563</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </>
  )
}
