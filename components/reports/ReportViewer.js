import React, { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Button from '../ui/Button'

export default function ReportViewer({ 
  reportType, 
  reportData, 
  onClose,
  period = {}
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(reportData || null)

  const fetchReportData = async () => {
    if (!reportType) return
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reports: [reportType],
          period,
          preview: false
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do relatório')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!reportData && reportType) {
      fetchReportData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType])

  const handleExport = async (format) => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reports: [reportType],
          period,
          format
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao exportar relatório')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${reportType}-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <XMarkIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchReportData} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {reportType ? reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Relatório'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {period.startDate && period.endDate && (
              <>
                {new Date(period.startDate).toLocaleDateString('pt-BR')} - {new Date(period.endDate).toLocaleDateString('pt-BR')}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<PrinterIcon className="h-4 w-4" />}
          >
            Imprimir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('pdf')}
            leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
          >
            PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('excel')}
            leftIcon={<DocumentTextIcon className="h-4 w-4" />}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            leftIcon={<XMarkIcon className="h-4 w-4" />}
          >
            Fechar
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {data ? (
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum dado disponível para exibição
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
