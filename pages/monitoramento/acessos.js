import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  EyeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  NoSymbolIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function AcessosSistema() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mobileReportsDraft, setMobileReportsDraft] = useState(null)

  const loadData = async () => {
    setRefreshing(true)
    try {
      const [statsRes, logsRes, settingsRes] = await Promise.all([
        fetch('/api/access-log?stats=true'),
        fetch('/api/access-log?limit=30'),
        fetch('/api/system-settings')
      ])
      if (statsRes.ok) {
        const d = await statsRes.json()
        if (d.success && d.data) setStats(d.data)
      }
      if (logsRes.ok) {
        const d = await logsRes.json()
        if (d.success && d.data) setLogs(d.data)
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json()
        if (d.success && d.data) {
          setSettings(d.data)
          setMobileReportsDraft(null)
        }
      }
    } catch (e) {
      console.error('Erro ao carregar:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    // Atualizar a cada 10 segundos (mais frequente)
    const t = setInterval(loadData, 10000)
    return () => clearInterval(t)
  }, [])

  const TIPOS_RELATORIOS = [
    { key: 'pesagens', label: 'Pesagens' },
    { key: 'resumo_pesagens', label: 'Resumo de Pesagens' },
    { key: 'femeas_ia', label: 'Fêmeas que Fizeram IA' },
    { key: 'resumo_femeas_ia', label: 'Resumo de Fêmeas IA' },
    { key: 'inseminacoes', label: 'Inseminações' },
    { key: 'gestacoes', label: 'Gestações' },
    { key: 'nascimentos', label: 'Nascimentos' },
    { key: 'previsoes_parto', label: 'Previsões de Parto' },
    { key: 'exames_andrologicos', label: 'Exames Andrológicos' },
    { key: 'transferencias_embrioes', label: 'Transferências de Embriões' },
    { key: 'calendario_reprodutivo', label: '📅 Calendário Reprodutivo' },
    { key: 'mortes', label: 'Mortes' },
    { key: 'vacinacoes', label: 'Vacinações' },
    { key: 'estoque_semen', label: 'Estoque de Sêmen' },
    { key: 'abastecimento_nitrogenio', label: 'Abastecimento de Nitrogênio' },
    { key: 'animais_piquetes', label: 'Animais por Piquete' },
    { key: 'movimentacoes_financeiras', label: 'Movimentações Financeiras' },
    { key: 'ranking_animais_avaliados', label: 'Ranking dos Animais Avaliados' },
    { key: 'ranking_pmgz', label: '🏆 Ranking de Animais ' }
  ]

  const updateSetting = async (key, value) => {
    setSaving(true)
    setMessage('')
    try {
      const body = {}
      if (key === 'maintenance_mode') body.maintenance_mode = value
      if (key === 'block_access') body.block_access = value
      if (key === 'maintenance_message') body.maintenance_message = value
      if (key === 'mobile_reports_enabled') body.mobile_reports_enabled = value

      const res = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const d = await res.json()
      if (d.success && d.data) {
        setSettings(d.data)
        if (key === 'maintenance_message') {
          setMessage('✅ Mensagem salva com sucesso! Já está visível no mobile.')
        } else if (key === 'maintenance_mode' && value) {
          setMessage('Modo manutenção ativado. Usuários verão a tela de atualização.')
        } else if (key === 'block_access' && value) {
          setMessage('Acesso bloqueado. Apenas localhost pode acessar.')
        } else if (key === 'mobile_reports_enabled') {
          setMessage('✅ Relatórios mobile atualizados!')
        } else {
          setMessage('Configuração atualizada.')
        }
        setTimeout(() => setMessage(''), 5000)
      } else {
        setMessage('❌ Erro ao salvar.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (e) {
      setMessage('❌ Erro ao salvar.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Acessos ao Sistema | Beef-Sync</title>
      </Head>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <EyeIcon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            Acessos ao Sistema
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitoramento de acessos, incluindo celular e desktop. Controle de bloqueio e manutenção.
          </p>
        </div>

        {/* Destaque: Celulares */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <DevicePhoneMobileIcon className="h-10 w-10 text-emerald-100" />
            <h3 className="text-lg font-semibold">Acessos por celular</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-3xl font-bold">{stats?.hoje?.mobile ?? 0}</p>
              <p className="text-sm text-emerald-100">Hoje</p>
              <p className="text-xs text-emerald-200">{stats?.hoje?.celulares_unicos ?? 0} celular(es) diferente(s)</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.semana?.mobile ?? 0}</p>
              <p className="text-sm text-emerald-100">Esta semana</p>
              <p className="text-xs text-emerald-200">{stats?.semana?.celulares_unicos ?? 0} celular(es) diferente(s)</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.mes?.mobile ?? 0}</p>
              <p className="text-sm text-emerald-100">Este mês</p>
              <p className="text-xs text-emerald-200">{stats?.mes?.celulares_unicos ?? 0} celular(es) diferente(s)</p>
            </div>
          </div>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Hoje</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.hoje?.total ?? 0}</span>
              <div className="text-right text-sm">
                <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                  <DevicePhoneMobileIcon className="h-4 w-4" /> {stats?.hoje?.mobile ?? 0} celulares
                </p>
                <p className="text-blue-600 dark:text-blue-400 flex items-center gap-1 justify-end">
                  <ComputerDesktopIcon className="h-4 w-4" /> {stats?.hoje?.desktop ?? 0} desktop
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Esta semana</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.semana?.total ?? 0}</span>
              <div className="text-right text-sm">
                <p className="text-emerald-600 dark:text-emerald-400">{stats?.semana?.mobile ?? 0} celulares</p>
                <p className="text-blue-600 dark:text-blue-400">{stats?.semana?.desktop ?? 0} desktop</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Este mês</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.mes?.total ?? 0}</span>
              <div className="text-right text-sm">
                <p className="text-emerald-600 dark:text-emerald-400">{stats?.mes?.mobile ?? 0} celulares</p>
                <p className="text-blue-600 dark:text-blue-400">{stats?.mes?.desktop ?? 0} desktop</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles: Bloquear e Manutenção */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <NoSymbolIcon className="h-5 w-5 text-amber-600" />
            Controle de Acesso
          </h2>
          {message && (
            <div className={`mb-4 p-4 rounded-lg border-2 text-sm font-medium flex items-center gap-2 ${
              message.includes('✅') 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                : message.includes('❌')
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
            }`}>
              {message}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Bloquear uso do sistema</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Impede novos acessos (exceto localhost)</p>
              </div>
              <button
                onClick={() => updateSetting('block_access', !settings?.block_access)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  settings?.block_access ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition ${
                  settings?.block_access ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Modo manutenção / Atualização</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exibe tela de "Em atualização" para todos os usuários</p>
              </div>
              <button
                onClick={() => updateSetting('maintenance_mode', !settings?.maintenance_mode)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  settings?.maintenance_mode ? 'bg-amber-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition ${
                  settings?.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {settings?.maintenance_mode && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
                <label className="block text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  📱 Mensagem exibida no mobile
                </label>
                <textarea
                  value={settings?.maintenance_message || ''}
                  onChange={(e) => setSettings(s => ({ ...s, maintenance_message: e.target.value }))}
                  placeholder="Sistema em manutenção. Volte em breve."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none font-medium"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    💡 Esta mensagem será exibida para todos os usuários
                  </p>
                  <button
                    onClick={() => updateSetting('maintenance_message', settings?.maintenance_message)}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Salvando...' : '💾 Salvar mensagem'}
                  </button>
                </div>
              </div>
            )}

            {/* Relatórios visíveis no mobile */}
            <div className="mt-6 p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800">
              <div className="flex items-start gap-3">
                <ChartBarIcon className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-teal-900 dark:text-teal-200 mb-1">
                    Relatórios visíveis no mobile
                  </p>
                  <p className="text-sm text-teal-700 dark:text-teal-300 mb-3">
                    Marque os relatórios que usuários mobile podem visualizar em /mobile-relatorios
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {TIPOS_RELATORIOS.map(t => {
                      const enabled = mobileReportsDraft ?? settings?.mobile_reports_enabled ?? []
                      return (
                        <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled.includes(t.key)}
                            onChange={(e) => {
                              const current = mobileReportsDraft ?? settings?.mobile_reports_enabled ?? []
                              const next = e.target.checked
                                ? [...current, t.key]
                                : current.filter(k => k !== t.key)
                              setMobileReportsDraft(next)
                            }}
                            className="w-4 h-4 rounded border-teal-600 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
                        </label>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const next = mobileReportsDraft ?? settings?.mobile_reports_enabled ?? []
                      updateSetting('mobile_reports_enabled', next)
                      setMobileReportsDraft(null)
                    }}
                    disabled={saving || mobileReportsDraft === null}
                    className="mt-3 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Salvando...' : 'Salvar relatórios mobile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Classificação de Animais no PMGZ (Rankings) */}
            <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">🏆</div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Classificação de Animais no PMGZ
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Exibe rankings de iABCZ, Peso e CE na página /mobile-animal
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Rankings disponíveis:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>• Top 10 iABCZ (quanto maior, melhor)</li>
                      <li>• Top 10 Peso (maiores pesos registrados)</li>
                      <li>• Top 10 CE (maiores circunferências escrotais - machos)</li>
                    </ul>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    ℹ️ Esta funcionalidade está sempre ativa no /mobile-animal. Os rankings são calculados automaticamente com base nos dados dos animais.
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de ação rápida: Deslogar todos os celulares */}
            <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 dark:text-red-200 mb-1">
                    Deslogar todos os celulares
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Ativa o modo manutenção e força todos os usuários mobile a verem a tela de atualização. Use quando precisar fazer manutenção urgente.
                  </p>
                  <button
                    onClick={async () => {
                      if (!confirm('⚠️ Tem certeza? Todos os usuários mobile verão a tela de manutenção imediatamente e precisarão fazer login novamente.')) return
                      setSaving(true)
                      try {
                        // Gerar um novo token de sessão para invalidar todos os logins
                        const sessionToken = Date.now().toString()
                        
                        const res = await fetch('/api/system-settings', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            maintenance_mode: true,
                            session_token: sessionToken
                          })
                        })
                        const d = await res.json()
                        if (d.success && d.data) {
                          setSettings(d.data)
                          setMessage('✅ Modo manutenção ativado! Todos os celulares foram deslogados e precisarão fazer login novamente.')
                          setTimeout(() => setMessage(''), 5000)
                        } else {
                          setMessage('❌ Erro ao ativar modo manutenção.')
                          setTimeout(() => setMessage(''), 3000)
                        }
                      } catch (e) {
                        setMessage('❌ Erro ao ativar modo manutenção.')
                        setTimeout(() => setMessage(''), 3000)
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving || settings?.maintenance_mode}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <DevicePhoneMobileIcon className="h-5 w-5" />
                    {settings?.maintenance_mode ? '✓ Modo manutenção ativo' : '🚨 Deslogar todos os celulares'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Log de acessos recentes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-5 w-5 text-emerald-600" />
                Acessos mobile recentes
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Apenas celulares • Quem fizer login durante manutenção aparece com nome e telefone • Atualiza a cada 10s
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={refreshing}
              className={`px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2 ${refreshing ? 'animate-pulse' : ''}`}
              title="Atualizar agora"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            {logs.filter(log => log.is_mobile).length === 0 ? (
              <div className="p-8 text-center">
                <DevicePhoneMobileIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Nenhum acesso mobile registrado ainda.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Quando alguém acessar pelo celular, aparecerá aqui automaticamente.
                </p>
                <button
                  onClick={loadData}
                  className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
                >
                  Verificar novamente
                </button>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Usuário</th>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Telefone</th>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Dispositivo</th>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">IP</th>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Browser</th>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Sistema</th>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Aparelho</th>
                    <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.filter(log => log.is_mobile).map((log) => (
                    <tr key={log.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{log.user_name}</td>
                      <td className="px-4 py-2">
                        {log.telefone ? (
                          <a href={`tel:${log.telefone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono">
                            {log.telefone.length === 11
                              ? log.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                              : log.telefone.length === 10
                              ? log.telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
                              : log.telefone}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <DevicePhoneMobileIcon className="h-4 w-4" /> Celular
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400 font-mono text-xs" title={log.user_agent}>
                        {log.ip_address || log.hostname || '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{log.browser || '-'}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{log.os || '-'}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400" title={log.user_agent}>
                        {log.device || '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-500 whitespace-nowrap">
                        {log.access_time ? new Date(log.access_time).toLocaleString('pt-BR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
