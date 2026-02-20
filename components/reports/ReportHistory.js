
import React, { useEffect, useState } from 'react'

import { 
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../ui/Table'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'

export default function ReportHistory() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, sent, downloaded

  useEffect(() => {
    loadReportHistory()
  }, [])

  const loadReportHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/history')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true
    if (filter === 'sent') return report.status === 'sent'
    if (filter === 'downloaded') return report.status === 'downloaded'
    return true
  })

  const getStatusBadge = (status) => {
    const variants = {
      'sent': 'success',
      'downloaded': 'primary',
      'failed': 'danger',
      'pending': 'warning'
    }
    
    const labels = {
      'sent': 'Enviado',
      'downloaded': 'Baixado',
      'failed': 'Falhou',
      'pending': 'Pendente'
    }

    return (
      <Badge variant={variants[status] || 'neutral'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const downloadReport = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/history/${reportId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-${reportId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando histórico..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Histórico de Relatórios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize e baixe relatórios anteriores
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                filter === 'all'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                filter === 'sent'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
            >
              Enviados
            </button>
            <button
              onClick={() => setFilter('downloaded')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                filter === 'downloaded'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
            >
              Baixados
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={<DocumentTextIcon className="h-12 w-12" />}
          title="Nenhum relatório encontrado"
          description="Não há relatórios no histórico com os filtros selecionados."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Data/Hora</TableHeaderCell>
                <TableHeaderCell>Tipo de Relatório</TableHeaderCell>
                <TableHeaderCell>Período</TableHeaderCell>
                <TableHeaderCell>Destinatários</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Ações</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {report.types.map((type, index) => (
                        <Badge key={index} variant="neutral" size="sm">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(report.startDate).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(report.endDate).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{report.recipientCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReport(report.id)}
                        className="p-1"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Relatórios
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reports.length}
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Enviados
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'sent').length}
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Baixados
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'downloaded').length}
                </p>
              </div>
              <ArrowDownTrayIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Este Mês
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {reports.filter(r => {
                    const reportDate = new Date(r.createdAt)
                    const now = new Date()
                    return reportDate.getMonth() === now.getMonth() && 
                           reportDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}