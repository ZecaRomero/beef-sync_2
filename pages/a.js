/**
 * Consulta Rápida de Animal - Otimizada para celular
 * Acesse pelo celular: /a - sem sidebar, somente Série e RG em inputs separados
 */
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function ConsultaRapida() {
  const router = useRouter()
  const [serie, setSerie] = useState('')
  const [rg, setRg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const serieRef = useRef(null)
  const autoSearchDone = useRef(false)

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
            setError(
              res.status === 500
                ? 'Serviço temporariamente indisponível. Verifique sua conexão e tente novamente.'
                : (data.message || 'Animal não encontrado')
            )
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
    const s = serie.trim()
    const r = rg.trim()
    if (!s || !r) {
      setError('Preencha Série e RG')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ serie: s, rg: r })
      const res = await fetch(`/api/animals/verificar?${params}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        const msg = res.status === 500
          ? 'Serviço temporariamente indisponível. Verifique sua conexão e tente novamente.'
          : (data.message || 'Animal não encontrado')
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

  const inputCls = 'w-full px-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent'

  return (
    <>
      <Head>
        <title>Consulta Animal | Beef-Sync</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-500 mb-2">
              Beef-Sync
            </h1>
            <p className="text-base text-gray-700 dark:text-gray-300">
              Bem-vindo! Use os campos abaixo para consultar a ficha de um animal.
            </p>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Consulta Animal
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
            Digite a Série e o RG do animal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Série</label>
              <input
                ref={serieRef}
                type="text"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                placeholder="Digite aqui a Série"
                className={inputCls}
                autoComplete="off"
                autoCapitalize="characters"
                inputMode="text"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG</label>
              <input
                type="text"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Digite aqui o RG"
                className={inputCls}
                autoComplete="off"
                inputMode="numeric"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold text-lg flex items-center justify-center gap-2"
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

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">
            Ex: Série CJCJ e RG 15563
          </p>
        </div>
      </div>
    </>
  )
}
