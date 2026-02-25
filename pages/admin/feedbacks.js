import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { 
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function AdminFeedbacks() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [audioAtual, setAudioAtual] = useState(null)
  const [transcricaoEditando, setTranscricaoEditando] = useState(null)
  const [transcricaoTexto, setTranscricaoTexto] = useState('')

  useEffect(() => {
    carregarFeedbacks()
  }, [])

  const carregarFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedback')
      const data = await response.json()
      if (data.success) {
        setFeedbacks(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const reproduzirAudio = (audioPath) => {
    if (audioAtual === audioPath) {
      setAudioAtual(null)
    } else {
      setAudioAtual(audioPath)
    }
  }

  const salvarTranscricao = async (id) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, transcricao: transcricaoTexto })
      })

      const data = await response.json()
      if (data.success) {
        setFeedbacks(feedbacks.map(f => f.id === id ? data.data : f))
        setTranscricaoEditando(null)
        setTranscricaoTexto('')
      }
    } catch (error) {
      console.error('Erro ao salvar transcrição:', error)
    }
  }

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: novoStatus })
      })

      const data = await response.json()
      if (data.success) {
        setFeedbacks(feedbacks.map(f => f.id === id ? data.data : f))
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const deletarFeedback = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este feedback?')) return

    try {
      const response = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setFeedbacks(feedbacks.filter(f => f.id !== id))
      }
    } catch (error) {
      console.error('Erro ao deletar feedback:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'em_analise': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'rejeitado': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente': return <ClockIcon className="h-4 w-4" />
      case 'concluido': return <CheckCircleIcon className="h-4 w-4" />
      case 'rejeitado': return <XCircleIcon className="h-4 w-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gerenciar Feedbacks | Beef-Sync</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feedbacks dos Usuários
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feedbacks.length} feedback(s) recebido(s)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Feedbacks */}
        <div className="max-w-7xl mx-auto space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Nenhum feedback recebido ainda</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {/* Header do Feedback */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {feedback.nome}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(feedback.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(feedback.status)}`}>
                      {getStatusIcon(feedback.status)}
                      {feedback.status === 'pendente' ? 'Pendente' :
                       feedback.status === 'em_analise' ? 'Em Análise' :
                       feedback.status === 'concluido' ? 'Concluído' :
                       feedback.status === 'rejeitado' ? 'Rejeitado' : feedback.status}
                    </span>
                    <button
                      onClick={() => deletarFeedback(feedback.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Sugestão */}
                {feedback.sugestao && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sugestão:
                    </p>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {feedback.sugestao}
                    </p>
                  </div>
                )}

                {/* Áudio */}
                {feedback.audio_path && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Áudio:
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => reproduzirAudio(feedback.audio_path)}
                        className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {audioAtual === feedback.audio_path ? (
                          <PauseIcon className="h-5 w-5" />
                        ) : (
                          <PlayIcon className="h-5 w-5" />
                        )}
                      </button>
                      <audio
                        src={feedback.audio_path}
                        controls
                        className="flex-1"
                        onPlay={() => setAudioAtual(feedback.audio_path)}
                        onPause={() => setAudioAtual(null)}
                      />
                    </div>
                  </div>
                )}

                {/* Transcrição */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transcrição / Descrição:
                  </p>
                  {transcricaoEditando === feedback.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={transcricaoTexto}
                        onChange={(e) => setTranscricaoTexto(e.target.value)}
                        placeholder="Descreva o que o usuário pediu..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => salvarTranscricao(feedback.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setTranscricaoEditando(null)
                            setTranscricaoTexto('')
                          }}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setTranscricaoEditando(feedback.id)
                        setTranscricaoTexto(feedback.transcricao || '')
                      }}
                      className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {feedback.transcricao || (
                        <span className="text-gray-400 italic">Clique para adicionar descrição...</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ações de Status */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => atualizarStatus(feedback.id, 'em_analise')}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium"
                  >
                    Em Análise
                  </button>
                  <button
                    onClick={() => atualizarStatus(feedback.id, 'concluido')}
                    className="px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium"
                  >
                    Concluído
                  </button>
                  <button
                    onClick={() => atualizarStatus(feedback.id, 'rejeitado')}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium"
                  >
                    Rejeitado
                  </button>
                  <button
                    onClick={() => atualizarStatus(feedback.id, 'pendente')}
                    className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium"
                  >
                    Pendente
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
