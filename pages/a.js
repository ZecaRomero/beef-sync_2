/**
 * Consulta Rápida de Animal - Otimizada para celular
 * Acesse pelo celular: digite Série e RG (ex: 35 1173 ou 35-1173) e veja a ficha do animal
 * URL curta: /a
 */
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function parseInput(input) {
  if (!input || typeof input !== 'string') return null
  const s = input.trim()
  if (!s) return null

  // Só números? Pode ser ID do animal
  if (/^\d+$/.test(s)) {
    return { id: s }
  }

  // Formato "Série RG" ou "Série-RG" ou "Série  RG"
  const parts = s.split(/[\s\-]+/).filter(Boolean)
  if (parts.length >= 2) {
    const serie = parts[0].trim()
    const rg = parts.slice(1).join(' ').trim()
    if (serie && rg) return { serie, rg }
  }

  return null
}

export default function ConsultaRapida() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const autoSearchDone = useRef(false)

  // Auto-buscar se vier pela URL: /a?q=35+1173 ou /a?serie=35&rg=1173 (link salvo no celular)
  useEffect(() => {
    if (!router.isReady || autoSearchDone.current) return
    const { q, serie, rg, id } = router.query
    let searchInput = ''
    if (q) searchInput = String(q).replace(/\+/g, ' ')
    else if (serie && rg) searchInput = `${serie} ${rg}`
    else if (id) searchInput = String(id)

    if (searchInput) {
      autoSearchDone.current = true
      setInput(searchInput)
      const parsed = parseInput(searchInput)
      if (parsed) {
        setLoading(true)
        const params = new URLSearchParams()
        if (parsed.id) params.set('id', parsed.id)
        else { params.set('serie', parsed.serie); params.set('rg', parsed.rg) }
        fetch(`/api/animals/verificar?${params}`)
          .then((r) => r.json().then((data) => ({ res: r, data })))
          .then(({ res, data }) => {
            if (data.success && data.data?.id) {
              router.replace(`/animals/${data.data.id}`)
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
    }
  }, [router.isReady, router.query])

  // Foco no input ao carregar (mobile)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const parsed = parseInput(input)
    if (!parsed) {
      setError('Digite Série e RG (ex: 35 1173) ou o ID do animal')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (parsed.id) params.set('id', parsed.id)
      else {
        params.set('serie', parsed.serie)
        params.set('rg', parsed.rg)
      }
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
        router.push(`/animals/${animalId}`)
      } else {
        throw new Error('Animal não encontrado')
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar. Verifique Série e RG.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Consulta Animal | Beef-Sync</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Consulta Rápida
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
            Digite a Série e RG do animal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: 35 1173 ou 35-1173"
              className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              autoComplete="off"
              autoCapitalize="off"
              inputMode="text"
              disabled={loading}
            />
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
            Aceita: Série RG (35 1173), Série-RG (35-1173) ou ID (1173)
          </p>
        </div>
      </div>
    </>
  )
}
