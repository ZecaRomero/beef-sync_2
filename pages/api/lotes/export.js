import { query } from '../../../lib/database'
import { sendError, sendMethodNotAllowed, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'
import ExcelJS from 'exceljs'

async function handler(req, res) {
  if (req.method === 'GET') {
    return await handleGet(req, res)
  } else {
    return sendMethodNotAllowed(res, ['GET'])
  }
}

async function handleGet(req, res) {
  try {
    const {
      modulo = '',
      tipo_operacao = '',
      data_inicio = '',
      data_fim = '',
      search = '',
      status = ''
    } = req.query

    // Construir query com filtros
    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    if (modulo) {
      whereConditions.push(`modulo = $${paramIndex}`)
      queryParams.push(modulo)
      paramIndex++
    }

    if (tipo_operacao) {
      whereConditions.push(`tipo_operacao ILIKE $${paramIndex}`)
      queryParams.push(`%${tipo_operacao}%`)
      paramIndex++
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    if (data_inicio) {
      whereConditions.push(`data_criacao >= $${paramIndex}`)
      queryParams.push(data_inicio)
      paramIndex++
    }

    if (data_fim) {
      whereConditions.push(`data_criacao <= $${paramIndex}`)
      queryParams.push(data_fim + ' 23:59:59')
      paramIndex++
    }

    if (search) {
      whereConditions.push(`(numero_lote ILIKE $${paramIndex} OR descricao ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Buscar todos os lotes (sem paginação para export)
    const lotesQuery = `
      SELECT 
        numero_lote,
        modulo,
        tipo_operacao,
        descricao,
        usuario,
        quantidade_registros,
        status,
        data_criacao,
        data_conclusao,
        detalhes
      FROM lotes_operacoes
      ${whereClause}
      ORDER BY data_criacao DESC
    `

    const lotesResult = await query(lotesQuery, queryParams)
    const lotes = lotesResult.rows

    // Criar workbook Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Histórico de Lotes')

    // Definir colunas
    worksheet.columns = [
      { header: 'Número do Lote', key: 'numero_lote', width: 20 },
      { header: 'Módulo', key: 'modulo', width: 15 },
      { header: 'Tipo de Operação', key: 'tipo_operacao', width: 25 },
      { header: 'Descrição', key: 'descricao', width: 40 },
      { header: 'Usuário', key: 'usuario', width: 15 },
      { header: 'Quantidade', key: 'quantidade_registros', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Data de Criação', key: 'data_criacao', width: 20 },
      { header: 'Data de Conclusão', key: 'data_conclusao', width: 20 },
      { header: 'Duração', key: 'duracao', width: 15 }
    ]

    // Estilizar cabeçalho
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    // Adicionar dados
    lotes.forEach((lote, index) => {
      const duracao = lote.data_conclusao 
        ? formatDuration(new Date(lote.data_conclusao) - new Date(lote.data_criacao))
        : 'Em andamento'

      const row = worksheet.addRow({
        numero_lote: lote.numero_lote,
        modulo: lote.modulo,
        tipo_operacao: lote.tipo_operacao,
        descricao: lote.descricao,
        usuario: lote.usuario,
        quantidade_registros: lote.quantidade_registros,
        status: lote.status?.toUpperCase() || 'DESCONHECIDO',
        data_criacao: lote.data_criacao ? new Date(lote.data_criacao).toLocaleString('pt-BR') : '',
        data_conclusao: lote.data_conclusao ? new Date(lote.data_conclusao).toLocaleString('pt-BR') : '',
        duracao: duracao
      })

      // Colorir linha baseado no status
      const statusColor = getStatusColor(lote.status)
      if (statusColor) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: statusColor }
          }
        })
      }

      // Zebrar linhas
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          if (!cell.fill || !cell.fill.fgColor) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8F9FA' }
            }
          }
        })
      }
    })

    // Adicionar bordas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // Adicionar resumo no final
    const summaryStartRow = worksheet.rowCount + 3
    
    worksheet.addRow([])
    worksheet.addRow(['RESUMO'])
    worksheet.getCell(`A${summaryStartRow + 1}`).font = { bold: true, size: 14 }
    
    const totalLotes = lotes.length
    const totalConcluidos = lotes.filter(l => l.status === 'concluido').length
    const totalPendentes = lotes.filter(l => l.status === 'pendente').length
    const totalErros = lotes.filter(l => l.status === 'erro').length
    const totalRegistros = lotes.reduce((sum, l) => sum + (l.quantidade_registros || 0), 0)

    worksheet.addRow(['Total de Lotes:', totalLotes])
    worksheet.addRow(['Lotes Concluídos:', totalConcluidos])
    worksheet.addRow(['Lotes Pendentes:', totalPendentes])
    worksheet.addRow(['Lotes com Erro:', totalErros])
    worksheet.addRow(['Total de Registros:', totalRegistros])

    // Configurar resposta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="historico-lotes-${new Date().toISOString().split('T')[0]}.xlsx"`
    )

    // Enviar arquivo
    await workbook.xlsx.write(res)
    res.end()

  } catch (error) {
    logger.error('Erro ao exportar lotes:', error)
    return sendError(res, 'Erro ao exportar dados', 500)
  }
}

function formatDuration(milliseconds) {
  if (milliseconds < 1000) return `${milliseconds}ms`
  if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}s`
  if (milliseconds < 3600000) return `${Math.round(milliseconds / 60000)}min`
  return `${Math.round(milliseconds / 3600000)}h`
}

function getStatusColor(status) {
  switch (status) {
    case 'concluido':
      return 'D4EDDA' // Verde claro
    case 'erro':
      return 'F8D7DA' // Vermelho claro
    case 'pendente':
      return 'FFF3CD' // Amarelo claro
    default:
      return null
  }
}

export default asyncHandler(handler)