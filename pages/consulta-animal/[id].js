/**
 * Ficha do Animal - Modo Consulta (somente leitura)
 * Usado quando o usuário acessa via /a - sem edição, sem sidebar
 */
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CurrencyDollarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

function formatDate(d) {
  if (!d) return '-'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('pt-BR')
}

function formatCurrency(v) {
  if (v == null || v === '') return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v))
}

export default function ConsultaAnimalView() {
  const router = useRouter()
  const { id } = router.query
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetch(`/api/animals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const a = data.data || data.animal || data
        if (a && (a.id || a.serie)) {
          setAnimal(a)
        } else {
          setError('Animal não encontrado')
        }
      })
      .catch(() => setError('Erro ao carregar. Verifique sua conexão.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <Head>
          <title>Carregando... | Beef-Sync</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-gray-50 dark:bg-gray-900">
          <span className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </>
    )
  }

  if (error || !animal) {
    return (
      <>
        <Head>
          <title>Erro | Beef-Sync</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-gray-50 dark:bg-gray-900">
          <p className="text-red-600 dark:text-red-400 text-center mb-6">{error || 'Animal não encontrado'}</p>
          <Link
            href="/a"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Nova Consulta
          </Link>
        </div>
      </>
    )
  }

  const nome = animal.nome || `${animal.serie || ''} ${animal.rg || ''}`.trim() || '-'
  const custos = animal.custos || {}
  const custoTotal = custos.total ?? (Array.isArray(custos) ? custos.reduce((s, c) => s + parseFloat(c.valor || 0), 0) : 0)

  return (
    <>
      <Head>
        <title>{nome} | Consulta Beef-Sync</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <Link
              href="/a"
              className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-semibold"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Voltar
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">Modo consulta</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Card principal */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <UserIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{nome}</h1>
                  <p className="text-amber-600 dark:text-amber-400 font-semibold">
                    {animal.serie || '-'} {animal.rg || ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <InfoRow label="Sexo" value={animal.sexo} />
              <InfoRow label="Raça" value={animal.raca} />
              <InfoRow label="Situação" value={animal.situacao} />
              <InfoRow label="Data nascimento" value={formatDate(animal.data_nascimento)} />
              <InfoRow label="Peso" value={animal.peso ? `${animal.peso} kg` : null} />
            </div>
          </div>

          {/* Custos */}
          {custoTotal > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Custos</h2>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(custoTotal)}</p>
            </div>
          )}

          {/* DNA */}
          {(animal.laboratorio_dna || animal.dna?.laboratorio) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">DNA</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {animal.laboratorio_dna || animal.dna?.laboratorio}
              </p>
            </div>
          )}
        </div>

        {/* Botão fixo inferior */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/a"
            className="flex items-center justify-center gap-2 w-full max-w-lg mx-auto py-4 rounded-xl bg-amber-600 text-white font-semibold text-lg hover:bg-amber-700"
          >
            <ArrowLeftIcon className="h-6 w-6" />
            Nova Consulta
          </Link>
        </div>
      </div>
    </>
  )
}

function InfoRow({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="px-6 py-3 flex justify-between items-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}
