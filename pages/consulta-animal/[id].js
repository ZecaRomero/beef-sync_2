/**
 * Ficha do Animal - Modo Consulta (somente leitura)
 * Usado quando o usuário acessa via /a - sem edição, sem sidebar
 * Inclui: machos = exames andrológicos | fêmeas = FIV, inseminações, gestações
 */
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  UserIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  HeartIcon,
  MapPinIcon,
  AcademicCapIcon,
  CubeTransparentIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
  TrophyIcon,
  SparklesIcon
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
  const [examesAndrologicos, setExamesAndrologicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [secoesExpandidas, setSecoesExpandidas] = useState({
    fiv: true, inseminacoes: true, gestacoes: true, exames: true,
    filhos: true, protocolos: false, pesagens: false, localizacoes: false, custos: false
  })
  const [rankingPosicao, setRankingPosicao] = useState(null) // 1 = primeiro do ranking
  const toggleSecao = useCallback((key) => {
    setSecoesExpandidas(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    setExamesAndrologicos([])
    fetch(`/api/animals/${id}?history=true`)
      .then((r) => r.json())
      .then((data) => {
        const a = data.data || data.animal || data
        if (a && (a.id || a.serie)) {
          setAnimal(a)
          const isMacho = a.sexo && (String(a.sexo).toLowerCase().includes('macho') || a.sexo === 'M')
          if (isMacho && a.rg) {
            return fetch(`/api/reproducao/exames-andrologicos?rg=${encodeURIComponent(a.rg)}`)
              .then(r2 => r2.json())
              .then(d2 => {
                const list = d2.data ?? d2 ?? []
                setExamesAndrologicos(Array.isArray(list) ? list : [])
              })
              .catch(() => {})
          }
        } else {
          setError('Animal não encontrado')
        }
      })
      .catch(() => setError('Erro ao carregar. Verifique sua conexão.'))
      .finally(() => setLoading(false))
  }, [id])

  // Buscar posição no ranking iABCZ quando o animal for carregado
  useEffect(() => {
    if (!animal?.id) return
    fetch('/api/animals/ranking-iabcz?limit=50')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length) {
          const idx = d.data.findIndex(r =>
            r.id === animal.id || (String(r.rg) === String(animal.rg) && String(r.serie || '').toUpperCase() === String(animal.serie || '').toUpperCase())
          )
          if (idx >= 0) setRankingPosicao(idx + 1)
        }
      })
      .catch(() => {})
  }, [animal?.id, animal?.rg, animal?.serie])

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
            href="/a?buscar=1"
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
  const custosArray = Array.isArray(animal.custos) ? animal.custos : []
  const custoTotal = custosArray.reduce((s, c) => s + parseFloat(c.valor || 0), 0)
  const custosPorTipo = custosArray.reduce((acc, c) => {
    const t = c.tipo || c.subtipo || 'Outros'
    acc[t] = (acc[t] || 0) + parseFloat(c.valor || 0)
    return acc
  }, {})

  // Idade em meses e anos
  const mesesIdade = animal.data_nascimento ? Math.floor((new Date() - new Date(animal.data_nascimento)) / (1000 * 60 * 60 * 24 * 30.44)) : null
  const anosIdade = mesesIdade != null ? (mesesIdade / 12).toFixed(1) : null

  // Dias na fazenda
  const dataChegada = animal.data_chegada || animal.dataChegada
  const diasNaFazenda = dataChegada ? Math.floor((new Date() - new Date(dataChegada)) / (1000 * 60 * 60 * 24)) : null

  // Gestação: dias de gestação e countdown
  const dataTE = animal.data_te || animal.dataTE
  const isPrenha = String(animal.resultado_dg || animal.resultadoDG || '').toLowerCase().includes('prenha')
  const diasGestacao = (isPrenha && dataTE) ? Math.floor((new Date() - new Date(dataTE)) / (1000 * 60 * 60 * 24)) : null
  const previsaoParto = (isPrenha && dataTE) ? new Date(new Date(dataTE).getTime() + 285 * 24 * 60 * 60 * 1000) : null
  const diasParaParto = previsaoParto ? Math.max(0, Math.floor((previsaoParto - new Date()) / (1000 * 60 * 60 * 24))) : null

  // Evolução de peso (última vs primeira)
  const pesagens = animal.pesagens || []
  const ultimaPesagem = pesagens[0]
  const primeiraPesagem = pesagens[pesagens.length - 1]
  const evolucaoPeso = (ultimaPesagem?.peso && primeiraPesagem?.peso && pesagens.length > 1)
    ? (parseFloat(ultimaPesagem.peso) - parseFloat(primeiraPesagem.peso)).toFixed(1)
    : null

  // Média de oócitos (doadoras)
  const totalOocitos = animal.fivs?.reduce((s, f) => s + (parseInt(f.quantidade_oocitos) || 0), 0) || 0
  const mediaOocitos = (animal.fivs?.length > 0 && totalOocitos > 0)
    ? (totalOocitos / animal.fivs.length).toFixed(1)
    : null

  // Fêmea apta? (15+ meses, não prenha)
  const isFemea = animal.sexo && (String(animal.sexo).toLowerCase().includes('fêmea') || String(animal.sexo).toLowerCase().includes('femea') || animal.sexo === 'F')
  const aptaReproducao = isFemea && mesesIdade >= 15 && !isPrenha && !(animal.data_te || animal.dataTE)

  // Taxa de sucesso reprodutivo (fêmeas)
  const totalIAs = animal.inseminacoes?.length || 0
  const prenhas = animal.inseminacoes?.filter(ia =>
    String(ia.resultado_dg || '').toLowerCase().includes('prenha')
  ).length || 0
  const taxaSucessoIA = totalIAs > 0 ? Math.round((prenhas / totalIAs) * 100) : null

  // Último exame andrológico há X dias (machos)
  const ultExame = examesAndrologicos[0]
  const diasDesdeExame = ultExame?.data_exame
    ? Math.floor((new Date() - new Date(ultExame.data_exame)) / (1000 * 60 * 60 * 24))
    : null

  // Próximo exame andrológico (30 dias após o último, quando Inapto)
  const isInapto = ultExame && String(ultExame.resultado || '').toUpperCase().includes('INAPTO')
  const dataProximoExame = (isInapto && ultExame?.data_exame)
    ? new Date(new Date(ultExame.data_exame).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null
  const diasParaProximoExame = dataProximoExame
    ? Math.floor((dataProximoExame - new Date()) / (1000 * 60 * 60 * 24))
    : null

  // Linha do tempo: eventos recentes
  const eventos = []
  animal.inseminacoes?.slice(0, 3).forEach(ia => eventos.push({ data: ia.data_ia || ia.data, tipo: 'IA', label: `Inseminação - ${ia.touro_nome || ia.touro}` }))
  animal.fivs?.slice(0, 2).forEach(f => eventos.push({ data: f.data_fiv, tipo: 'FIV', label: `Coleta - ${f.quantidade_oocitos} oócitos` }))
  animal.pesagens?.slice(0, 2).forEach(p => eventos.push({ data: p.data, tipo: 'Peso', label: `${p.peso} kg` }))
  examesAndrologicos.slice(0, 2).forEach(ex => eventos.push({ data: ex.data_exame, tipo: 'Andrológico', label: ex.resultado }))
  const timeline = eventos
    .filter(e => e.data)
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 8)

  // Localização atual: priorizar histórico (localizacoes_animais) onde data_saida IS NULL
  const locAtual = animal.localizacoes?.find(l => !l.data_saida)?.piquete
    || animal.piquete_atual
    || animal.piqueteAtual
    || (typeof animal.localizacao_atual === 'object' ? animal.localizacao_atual?.piquete : null)
    || animal.localizacao_atual

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
              href="/a?buscar=1"
              className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-semibold"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Voltar
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">Modo consulta</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Destaque: 1º do Ranking iABCZ */}
          {rankingPosicao === 1 && (
            <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white border-2 border-amber-300/50 ring-4 ring-amber-400/30">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur">
                  <TrophyIcon className="h-12 w-12 text-amber-100" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold uppercase tracking-wider opacity-90">1º Lugar no Ranking iABCZ</p>
                  <p className="text-2xl font-bold mt-0.5">Animal mais bem avaliado do rebanho</p>
                  <p className="text-sm mt-1 opacity-90 flex items-center gap-1">
                    <SparklesIcon className="h-4 w-4" />
                    iABCZ: {animal.abczg || '-'} • Quanto maior, melhor a genética
                  </p>
                </div>
                <div className="hidden sm:flex w-16 h-16 rounded-full bg-white/20 items-center justify-center text-3xl font-black">
                  1º
                </div>
              </div>
            </div>
          )}

          {/* Badge posição 2 ou 3 no ranking */}
          {rankingPosicao === 2 && (
            <div className="bg-gradient-to-r from-slate-400 to-slate-600 rounded-2xl shadow-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <TrophyIcon className="h-10 w-10 text-slate-200" />
                <div>
                  <p className="font-bold">2º no Ranking iABCZ</p>
                  <p className="text-sm opacity-90">Excelente avaliação genética</p>
                </div>
              </div>
            </div>
          )}
          {rankingPosicao === 3 && (
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 rounded-2xl shadow-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <TrophyIcon className="h-10 w-10 text-amber-200" />
                <div>
                  <p className="font-bold">3º no Ranking iABCZ</p>
                  <p className="text-sm opacity-90">Ótima avaliação genética</p>
                </div>
              </div>
            </div>
          )}

          {/* Badge posições 4º a 10º no ranking */}
          {rankingPosicao >= 4 && rankingPosicao <= 10 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">{rankingPosicao}º</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{rankingPosicao}º no Ranking iABCZ</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Top 10 • Boa avaliação genética</p>
                </div>
              </div>
            </div>
          )}

          {/* Banner de resumo em uma frase */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl shadow-lg p-5 text-white">
            <p className="text-sm font-medium opacity-90 mb-1">Resumo</p>
            <p className="text-base font-semibold leading-snug">
              {[
                animal.raca || 'Animal',
                mesesIdade != null && ` ${mesesIdade} meses`,
                locAtual && ` • ${locAtual}`,
                isPrenha && ' • Prenha',
                diasParaParto != null && diasParaParto < 90 && ` • Parto em ${diasParaParto} dias`,
                aptaReproducao && ' • Apta reprodução',
                animal.filhos?.length > 0 && ` • ${animal.filhos.length} cria(s)`,
                isInapto && ' • Inapto',
                isInapto && diasParaProximoExame != null && diasParaProximoExame > 0 && ` • Próx. exame em ${diasParaProximoExame} dias`,
                isInapto && diasParaProximoExame != null && diasParaProximoExame <= 0 && ' • Exame vencido - reagendar',
                ultExame && String(ultExame.resultado || '').toUpperCase().includes('APTO') && ' • Apto'
              ].filter(Boolean).join('')}
            </p>
          </div>

          {/* Cards de números rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(animal.abczg || animal.abczg === 0) && (
              <div className={`rounded-xl p-3 border text-center ${
                rankingPosicao === 1
                  ? 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 border-2 border-amber-400 dark:border-amber-500'
                  : rankingPosicao === 2
                  ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-700/50 border-2 border-slate-400 dark:border-slate-500'
                  : rankingPosicao === 3
                  ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 border-2 border-amber-600 dark:border-amber-700'
                  : rankingPosicao && rankingPosicao <= 10
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <p className={`text-2xl font-bold ${
                  rankingPosicao === 1 ? 'text-amber-600 dark:text-amber-400' :
                  rankingPosicao === 2 ? 'text-slate-600 dark:text-slate-300' :
                  rankingPosicao === 3 ? 'text-amber-700 dark:text-amber-300' :
                  rankingPosicao && rankingPosicao <= 10 ? 'text-blue-600 dark:text-blue-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {animal.abczg}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">iABCZ</p>
                {rankingPosicao && rankingPosicao <= 10 && (
                  <p className={`text-xs font-bold mt-0.5 ${
                    rankingPosicao === 1 ? 'text-amber-600 dark:text-amber-400' :
                    rankingPosicao === 2 ? 'text-slate-600 dark:text-slate-400' :
                    rankingPosicao === 3 ? 'text-amber-700 dark:text-amber-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {rankingPosicao}º ranking
                  </p>
                )}
              </div>
            )}
            {(animal.deca || animal.deca === 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{animal.deca}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">DECA</p>
              </div>
            )}
            {mesesIdade != null && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{mesesIdade}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">meses</p>
              </div>
            )}
            {animal.peso && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{animal.peso}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">kg</p>
              </div>
            )}
            {isPrenha && diasParaParto != null && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-emerald-400 dark:border-emerald-500 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{diasParaParto}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">dias p/ parto</p>
              </div>
            )}
            {animal.filhos?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{animal.filhos.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">cria(s)</p>
              </div>
            )}
            {diasNaFazenda != null && diasNaFazenda > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{diasNaFazenda}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">dias na fazenda</p>
              </div>
            )}
            {custoTotal > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(custoTotal)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">custos</p>
              </div>
            )}
            {isInapto && diasParaProximoExame != null && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-red-400 dark:border-red-500 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {diasParaProximoExame > 0 ? diasParaProximoExame : 'Vencido'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {diasParaProximoExame > 0 ? 'dias p/ próximo exame' : 'reagendar exame'}
                </p>
              </div>
            )}
          </div>

          {/* Countdown próximo exame andrológico - INAPTOS */}
          {isInapto && dataProximoExame && (
            <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-lg p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <AcademicCapIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Próximo exame andrológico previsto</p>
                  <p className="text-2xl font-bold">{dataProximoExame.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm mt-1 opacity-90">
                    {diasParaProximoExame != null && diasParaProximoExame > 0 && `Faltam ${diasParaProximoExame} dias`}
                    {diasParaProximoExame != null && diasParaProximoExame <= 0 && `Vencido há ${Math.abs(diasParaProximoExame)} dias`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Countdown de parto em destaque */}
          {isPrenha && previsaoParto && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <HeartIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Previsão de parto</p>
                  <p className="text-2xl font-bold">{previsaoParto.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm mt-1 opacity-90">
                    {diasGestacao != null && `${diasGestacao} dias de gestação`}
                    {diasParaParto != null && diasParaParto <= 30 && ` • Faltam ${diasParaParto} dias!`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Badge Apta reprodução */}
          {aptaReproducao && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800">
              <HeartIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <p className="text-sm font-semibold text-pink-800 dark:text-pink-300">Fêmea apta para reprodução (IA/TE)</p>
            </div>
          )}

          {/* Card principal */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <UserIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{nome}</h1>
                    {rankingPosicao === 1 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-sm font-bold shadow-lg">
                        <TrophyIcon className="h-4 w-4" />
                        1º iABCZ
                      </span>
                    )}
                    {rankingPosicao === 2 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-500 text-white text-sm font-bold shadow-lg">
                        <TrophyIcon className="h-4 w-4" />
                        2º iABCZ
                      </span>
                    )}
                    {rankingPosicao === 3 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-700 text-white text-sm font-bold shadow-lg">
                        <TrophyIcon className="h-4 w-4" />
                        3º iABCZ
                      </span>
                    )}
                    {rankingPosicao >= 4 && rankingPosicao <= 10 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-bold">
                        {rankingPosicao}º iABCZ
                      </span>
                    )}
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 font-semibold">
                    {animal.serie || '-'} {animal.rg || ''}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {examesAndrologicos.length > 0 && (() => {
                      const ult = examesAndrologicos[0]
                      const res = String(ult?.resultado || '').toUpperCase()
                      return (
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                          res.includes('APTO')
                            ? 'bg-white dark:bg-gray-700 border-2 border-green-500 text-green-800 dark:text-green-200'
                            : res.includes('INAPTO')
                            ? 'bg-white dark:bg-gray-700 border-2 border-red-500 text-red-800 dark:text-red-200'
                            : 'bg-white dark:bg-gray-700 border-2 border-amber-500 text-amber-900 dark:text-amber-200'
                        }`}>
                          Andrológico: {ult.resultado || 'Pendente'}
                        </span>
                      )
                    })()}
                    {animal.fivs?.length > 0 && (
                      <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-white dark:bg-gray-700 border-2 border-violet-500 text-violet-900 dark:text-violet-100 shadow-sm">
                        🧪 Doadora FIV • {animal.fivs.length} coleta{animal.fivs.length > 1 ? 's' : ''} • {totalOocitos} oócitos
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <InfoRow label="Sexo" value={animal.sexo} />
              <InfoRow label="Raça" value={animal.raca} />
              <InfoRow label="Pelagem" value={animal.pelagem} />
              <InfoRow label="Situação" value={animal.situacao} />
              <InfoRow label="Data nascimento" value={formatDate(animal.data_nascimento)} />
              {mesesIdade != null && (
                <InfoRow
                  label="Idade"
                  value={mesesIdade >= 12 ? `${anosIdade} anos (${mesesIdade} meses)` : `${mesesIdade} meses`}
                />
              )}
              <InfoRow label="Peso" value={animal.peso ? `${animal.peso} kg` : null} />
              {animal.sexo && (animal.sexo.toLowerCase().includes('m') || animal.sexo === 'M') && animal.ce && (
                <InfoRow label="CE (Circunferência Escrotal)" value={`${animal.ce} cm`} />
              )}
              <InfoRow label="Mãe" value={animal.mae} />
              <InfoRow label="Pai" value={animal.pai} />
              <InfoRow label="Avô materno" value={animal.avo_materno || animal.avoMaterno} />
              {(animal.abczg || animal.abczg === 0) && (
                <div className={`px-6 py-3 flex justify-between items-center border-t ${
                  rankingPosicao === 1 ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30' :
                  rankingPosicao === 2 ? 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-700' :
                  rankingPosicao === 3 ? 'bg-amber-50/30 dark:bg-amber-900/5 border-amber-100 dark:border-amber-800/20' :
                  rankingPosicao && rankingPosicao <= 10 ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30' :
                  'border-gray-100 dark:border-gray-700'
                }`}>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    rankingPosicao === 1 ? 'text-amber-800 dark:text-amber-200' :
                    rankingPosicao === 2 ? 'text-slate-700 dark:text-slate-300' :
                    rankingPosicao === 3 ? 'text-amber-800 dark:text-amber-200' :
                    rankingPosicao && rankingPosicao <= 10 ? 'text-blue-800 dark:text-blue-200' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    <TrophyIcon className="h-4 w-4" />
                    iABCZ (avaliação genética)
                  </span>
                  <span className={`text-lg font-bold ${
                    rankingPosicao === 1 ? 'text-amber-600 dark:text-amber-400' :
                    rankingPosicao === 2 ? 'text-slate-600 dark:text-slate-300' :
                    rankingPosicao === 3 ? 'text-amber-700 dark:text-amber-400' :
                    rankingPosicao && rankingPosicao <= 10 ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-900 dark:text-white'
                  }`}>
                    {animal.abczg}
                    {rankingPosicao && rankingPosicao <= 10 && (
                      <span className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${
                        rankingPosicao === 1 ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100' :
                        rankingPosicao === 2 ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' :
                        rankingPosicao === 3 ? 'bg-amber-300 dark:bg-amber-800 text-amber-900 dark:text-amber-100' :
                        'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
                      }`}>
                        {rankingPosicao}º ranking
                      </span>
                    )}
                  </span>
                </div>
              )}
              {(animal.deca || animal.deca === 0) && (
                <InfoRow label="DECA" value={animal.deca} />
              )}
              <InfoRow label="Brinco" value={animal.brinco} />
              <InfoRow label="Tatuagem" value={animal.tatuagem} />
              {(animal.valor_venda || animal.valorVenda) && (
                <InfoRow label="Valor venda" value={formatCurrency(animal.valor_venda || animal.valorVenda)} />
              )}
              <InfoRow label="Comprador/Destino" value={animal.comprador || animal.destino} />
              <InfoRow label="Receptora" value={animal.receptora} />
              {(animal.custo_aquisicao || animal.custoAquisicao) && (
                <InfoRow label="Custo aquisição" value={formatCurrency(animal.custo_aquisicao || animal.custoAquisicao)} />
              )}
              <InfoRow label="Observações" value={animal.observacoes} />
            </div>
          </div>

          {/* Exames Andrológicos - MACHOS */}
          {examesAndrologicos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSecao('exames')}
                className="w-full p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-b border-gray-200 dark:border-gray-700 text-left hover:from-blue-150 hover:to-indigo-150 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <h2 className="font-bold text-gray-900 dark:text-white">Exames Andrológicos</h2>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {examesAndrologicos.length} exame(s) registrado(s)
                      {diasDesdeExame != null && ` • Último há ${diasDesdeExame} dias`}
                      {isInapto && dataProximoExame && (
                        <span className="block mt-1 font-semibold text-red-700 dark:text-red-300">
                          Próximo previsto: {formatDate(dataProximoExame)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ultExame?.resultado && (
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                        String(ultExame.resultado).toUpperCase().includes('APTO')
                          ? 'bg-white dark:bg-gray-700 border-2 border-green-500 text-green-800 dark:text-green-200'
                          : String(ultExame.resultado).toUpperCase().includes('INAPTO')
                          ? 'bg-white dark:bg-gray-700 border-2 border-red-500 text-red-800 dark:text-red-200'
                          : 'bg-white dark:bg-gray-700 border-2 border-amber-500 text-amber-900 dark:text-amber-200'
                      }`}>
                        {ultExame.resultado}
                      </span>
                    )}
                    {secoesExpandidas.exames ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                  </div>
                </div>
              </button>
              <div className={`overflow-hidden transition-all ${secoesExpandidas.exames ? 'max-h-[999px]' : 'max-h-0'}`}>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {examesAndrologicos.map((ex, i) => (
                  <div key={ex.id || i} className="px-4 py-3 flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(ex.data_exame)}
                        {ex.ce != null && ex.ce !== '' && (
                          <span className="ml-2 text-xs font-normal text-gray-600 dark:text-gray-400">CE: {ex.ce}</span>
                        )}
                      </p>
                      {(ex.defeitos || ex.observacoes) && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {[ex.defeitos, ex.observacoes].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      {ex.veterinario && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Vet: {ex.veterinario}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 shadow-sm ${
                      String(ex.resultado || '').toUpperCase().includes('APTO')
                        ? 'bg-white dark:bg-gray-700 border-2 border-green-500 text-green-800 dark:text-green-200'
                        : String(ex.resultado || '').toUpperCase().includes('INAPTO')
                        ? 'bg-white dark:bg-gray-700 border-2 border-red-500 text-red-800 dark:text-red-200'
                        : 'bg-white dark:bg-gray-700 border-2 border-amber-500 text-amber-900 dark:text-amber-200'
                    }`}>
                      {ex.resultado || 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

          {/* Coletas FIV - FÊMEAS DOADORAS */}
          {animal.fivs && animal.fivs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border-2 border-violet-200 dark:border-violet-800 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSecao('fiv')}
                className="w-full p-4 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 border-b border-gray-200 dark:border-gray-700 text-left hover:from-violet-150 hover:to-fuchsia-150 dark:hover:from-violet-800/50 dark:hover:to-fuchsia-800/50 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CubeTransparentIcon className="h-6 w-6 text-violet-700 dark:text-violet-300" />
                    <h2 className="font-bold text-gray-900 dark:text-white">Coletas FIV</h2>
                  </div>
                  {secoesExpandidas.fiv ? (
                    <ChevronUpIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">
                  {animal.fivs.length} coleta(s) • {totalOocitos} oócitos totais
                  {mediaOocitos && ` • Média: ${mediaOocitos}/coleta`}
                </p>
              </button>
              <div className={`overflow-hidden transition-all ${secoesExpandidas.fiv ? 'max-h-[999px]' : 'max-h-0'}`}>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {animal.fivs.map((fiv, i) => (
                    <div key={fiv.id || i} className="px-4 py-3 bg-white dark:bg-gray-800">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatDate(fiv.data_fiv)}
                            {fiv.data_transferencia && (
                              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1 font-normal">
                                (TE: {formatDate(fiv.data_transferencia)})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Lab: {fiv.laboratorio || fiv.veterinario || '-'}
                          </p>
                          {fiv.touro && (
                            <p className="text-xs text-violet-700 dark:text-violet-400 mt-1 font-medium">
                              Touro: {fiv.touro}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-lg text-sm font-bold bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100 border border-violet-300 dark:border-violet-700 shrink-0">
                          {(fiv.quantidade_oocitos || 0)} oócitos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inseminações - FÊMEAS */}
          {animal.inseminacoes && animal.inseminacoes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSecao('inseminacoes')}
                className="w-full p-4 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 border-b border-gray-200 dark:border-gray-700 text-left hover:from-pink-150 hover:to-rose-150 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    <h2 className="font-bold text-gray-900 dark:text-white">Inseminações</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {taxaSucessoIA != null && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        taxaSucessoIA >= 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' :
                        taxaSucessoIA >= 25 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                      }`}>
                        {taxaSucessoIA}% prenhez
                      </span>
                    )}
                    {secoesExpandidas.inseminacoes ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {animal.inseminacoes.length} registro(s)
                  {taxaSucessoIA != null && ` • ${prenhas} prenha(s)`}
                </p>
              </button>
              <div className={`overflow-hidden transition-all ${secoesExpandidas.inseminacoes ? 'max-h-[999px]' : 'max-h-0'}`}>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {animal.inseminacoes.map((ia, i) => (
                  <div key={ia.id || i} className="px-4 py-3 flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(ia.data_ia || ia.data)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ia.touro_nome || ia.touro || '-'}
                      </p>
                      {ia.resultado_dg && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                          String(ia.resultado_dg).toLowerCase().includes('prenha') ? 'bg-green-100 text-green-800 dark:bg-green-900/40' :
                          String(ia.resultado_dg).toLowerCase().includes('vazia') ? 'bg-gray-100 text-gray-700 dark:bg-gray-700' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/40'
                        }`}>
                          DG: {ia.resultado_dg}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/40 shrink-0">
                      {ia.tipo === 'TE' ? 'TE' : 'IA'}
                    </span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

          {/* Gestações - FÊMEAS */}
          {animal.gestacoes && animal.gestacoes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSecao('gestacoes')}
                className="w-full p-4 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border-b border-gray-200 dark:border-gray-700 text-left hover:from-emerald-150 hover:to-teal-150 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="font-bold text-gray-900 dark:text-white">Gestações</h2>
                  </div>
                  {secoesExpandidas.gestacoes ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {animal.gestacoes.length} gestação(ões)
                  {(() => {
                    const concluidas = animal.gestacoes.filter(g => g.data_nascimento || g.data_parto).length
                    const emAndamento = animal.gestacoes.length - concluidas
                    if (concluidas > 0 || emAndamento > 0) {
                      return ` • ${concluidas} parto(s) • ${emAndamento} em andamento`
                    }
                    return ''
                  })()}
                </p>
              </button>
              <div className={`overflow-hidden transition-all ${secoesExpandidas.gestacoes ? 'max-h-[999px]' : 'max-h-0'}`}>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {animal.gestacoes.map((g, i) => (
                  <div key={g.id || i} className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {g.situacao || 'Em andamento'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(g.data_cobertura || g.data_cobertura_mae)} • {g.touro_nome || g.touro || '-'}
                    </p>
                    {(g.data_nascimento || g.data_parto) && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                        Parto: {formatDate(g.data_nascimento || g.data_parto)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

          {/* Reprodução - DG/IA/TE */}
          {(animal.resultado_dg || animal.resultadoDG || animal.data_te || animal.dataTE || animal.data_dg || animal.dataDG) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HeartIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Reprodução</h2>
              </div>
              <div className="space-y-2">
                {(animal.data_te || animal.dataTE) && (
                  <InfoRow label="Data TE/IA" value={formatDate(animal.data_te || animal.dataTE)} />
                )}
                {(animal.data_dg || animal.dataDG) && (
                  <InfoRow 
                    label="Data DG" 
                    value={formatDate(animal.data_dg || animal.dataDG)} 
                  />
                )}
                {(animal.resultado_dg || animal.resultadoDG) && (
                  <div className="px-0 py-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Resultado DG</span>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      String(animal.resultado_dg || animal.resultadoDG || '').toLowerCase().includes('prenha')
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {animal.resultado_dg || animal.resultadoDG}
                    </span>
                  </div>
                )}
                {String(animal.resultado_dg || animal.resultadoDG || '').toLowerCase().includes('prenha') && (animal.data_te || animal.dataTE) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Parto previsto: {new Date(new Date(animal.data_te || animal.dataTE).getTime() + (285 * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Linha do tempo de eventos */}
          {timeline.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-indigo-600/10 to-violet-600/10 dark:from-indigo-900/30 dark:to-violet-900/30 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Linha do Tempo</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Eventos recentes em ordem cronológica
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {timeline.map((e, i) => (
                  <div key={i} className="px-4 py-3 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        e.tipo === 'IA' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40' :
                        e.tipo === 'FIV' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40' :
                        e.tipo === 'Peso' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/40'
                      }`}>
                        {e.tipo.charAt(0)}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{e.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{formatDate(e.data)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Localização atual + histórico */}
          {(locAtual || (animal.localizacoes && animal.localizacoes.length > 0)) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSecao('localizacoes')}
                className="w-full p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 border-b border-gray-200 dark:border-gray-700 text-left hover:from-blue-150 hover:to-cyan-150 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Localização</h2>
                  </div>
                  {secoesExpandidas.localizacoes ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </div>
                {locAtual && (
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mt-1">
                    Atual: {locAtual}
                  </p>
                )}
              </button>
              <div className={`overflow-hidden transition-all ${secoesExpandidas.localizacoes ? 'max-h-[999px]' : 'max-h-0'}`}>
                {animal.localizacoes && animal.localizacoes.length > 1 && (
                  <div className="p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Histórico recente</p>
                    <div className="space-y-1">
                      {animal.localizacoes.slice(0, 6).map((l, i) => (
                        <div key={l.id || i} className="flex justify-between text-sm py-1">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{l.piquete}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {formatDate(l.data_entrada)}
                            {l.data_saida && ` → ${formatDate(l.data_saida)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {locAtual && (!animal.localizacoes || animal.localizacoes.length <= 1) && (
                  <p className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{locAtual}</p>
                )}
              </div>
            </div>
          )}

          {/* Filhos (Crias) - fêmeas que pariram */}
          {animal.filhos && animal.filhos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSecao('filhos')}
                className="w-full p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-b border-gray-200 dark:border-gray-700 text-left hover:from-amber-150 hover:to-orange-150 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Crias</h2>
                  </div>
                  {secoesExpandidas.filhos ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {animal.filhos.length} filho(s) registrado(s)
                </p>
              </button>
              <div className={`overflow-hidden transition-all ${secoesExpandidas.filhos ? 'max-h-[999px]' : 'max-h-0'}`}>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {animal.filhos.map((f, i) => {
                  const identificacao = `${f.nome || f.serie || '-'} ${f.rg || ''}`.trim()
                  const conteudo = (
                    <div className={`px-4 py-3 flex justify-between items-center gap-2 ${f.id ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 active:bg-amber-100 dark:active:bg-amber-900/30 transition-colors cursor-pointer' : ''}`}>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {identificacao || '-'}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {f.sexo || ''} • {formatDate(f.data_nascimento)}
                        </span>
                        {f.id && (
                          <ArrowTopRightOnSquareIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </span>
                    </div>
                  )
                  return f.id ? (
                    <Link key={f.id || i} href={`/consulta-animal/${f.id}`}>
                      {conteudo}
                    </Link>
                  ) : (
                    <div key={f.id || i}>{conteudo}</div>
                  )
                })}
              </div>
              </div>
            </div>
          )}

          {/* Protocolos Sanitários */}
          {animal.protocolos && animal.protocolos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-emerald-600/10 to-green-600/10 dark:from-emerald-900/30 dark:to-green-900/30 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Protocolos Sanitários</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {animal.protocolos.length} protocolo(s)
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {animal.protocolos.slice(0, 5).map((p, i) => (
                  <div key={p.id || i} className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {p.nome_protocolo || p.protocolo || p.tipo || 'Protocolo'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(p.data_inicio)}
                      {p.data_fim && ` — ${formatDate(p.data_fim)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pesagens recentes */}
          {animal.pesagens && animal.pesagens.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-slate-600/10 to-slate-500/10 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScaleIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Pesagens</h2>
                  </div>
                  {evolucaoPeso != null && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      parseFloat(evolucaoPeso) >= 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>
                      {parseFloat(evolucaoPeso) >= 0 ? '+' : ''}{evolucaoPeso} kg
                    </span>
                  )}
                </div>
                {evolucaoPeso != null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Evolução desde {formatDate(primeiraPesagem?.data)}
                  </p>
                )}
              </div>
              <div className="p-4 space-y-2">
                {animal.pesagens.slice(0, 6).map((p, i) => (
                  <div key={p.id || i} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{formatDate(p.data)}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{p.peso || p.peso_kg} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custos */}
          {custoTotal > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 dark:from-green-900/30 dark:to-emerald-900/30 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Custos</h2>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(custoTotal)}</p>
              </div>
              {Object.keys(custosPorTipo).length > 1 && (
                <div className="p-4 space-y-2">
                  {Object.entries(custosPorTipo)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([tipo, val]) => (
                      <div key={tipo} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{tipo}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(val)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* DNA */}
          {(animal.laboratorio_dna || animal.dna?.laboratorio || animal.data_envio_dna || animal.custo_dna) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-3">
                <BeakerIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">DNA</h2>
              </div>
              <div className="space-y-2">
                {(animal.laboratorio_dna || animal.dna?.laboratorio) && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Laboratório: {animal.laboratorio_dna || animal.dna?.laboratorio}
                  </p>
                )}
                {(animal.data_envio_dna || animal.dataEnvioDNA) && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Envio: {formatDate(animal.data_envio_dna || animal.dataEnvioDNA)}
                  </p>
                )}
                {(animal.custo_dna || animal.custoDNA) && (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Custo: {formatCurrency(animal.custo_dna || animal.custoDNA)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão fixo inferior */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/a?buscar=1"
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
