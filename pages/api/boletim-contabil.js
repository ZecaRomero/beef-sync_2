import databaseService from '../../services/databaseService'
import logger from '../../utils/logger'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { periodo, tipo, subtipo, startDate, endDate } = req.query
      
      if (periodo) {
        // Buscar movimentações de um período específico
        const filtros = {}
        if (tipo) filtros.tipo = tipo
        if (subtipo) filtros.subtipo = subtipo
        if (startDate) filtros.startDate = startDate
        if (endDate) filtros.endDate = endDate
        
        const movimentacoes = await databaseService.buscarMovimentacoes(periodo, filtros)
        const boletim = await databaseService.obterBoletimPeriodo(periodo)
        
        // Garantir que a localidade está incluída
        if (!boletim.localidade) {
          const boletimCompleto = await databaseService.query(`
            SELECT id, periodo, data_criacao, data_atualizacao, status, resumo, localidade
            FROM boletim_contabil 
            WHERE periodo = $1
          `, [periodo])
          if (boletimCompleto.rows.length > 0) {
            boletim.localidade = boletimCompleto.rows[0].localidade
          }
        }
        
        res.status(200).json({
          status: 'success',
          success: true,
          data: {
            boletim,
            movimentacoes
          },
          count: movimentacoes.length,
          timestamp: new Date().toISOString()
        })
      } else {
        // Listar todos os períodos disponíveis
        try {
          const result = await databaseService.query(`
            SELECT id, periodo, data_criacao, data_atualizacao, status, resumo, localidade
            FROM boletim_contabil 
            ORDER BY periodo DESC
          `)
          
          res.status(200).json({
            status: 'success',
            success: true,
            data: result.rows || [],
            count: (result.rows || []).length,
            timestamp: new Date().toISOString()
          })
        } catch (err) {
          logger.error('Erro ao listar boletins:', err)
          // Retornar lista vazia em vez de 500 - modal usa fallback localStorage
          res.status(200).json({
            status: 'success',
            success: true,
            data: [],
            count: 0,
            timestamp: new Date().toISOString()
          })
        }
      }
      
    } else if (req.method === 'POST') {
      const {
        periodo,
        tipo,
        subtipo,
        dataMovimento,
        animalId,
        valor,
        descricao,
        observacoes,
        localidade,
        dadosExtras
      } = req.body
      
      // Validar dados obrigatórios
      if (!periodo || !tipo || !subtipo || !dataMovimento) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos',
          required: ['periodo', 'tipo', 'subtipo', 'dataMovimento']
        })
      }
      
      const movimentacao = await databaseService.registrarMovimentacao({
        periodo,
        tipo,
        subtipo,
        dataMovimento,
        animalId,
        valor: valor || 0,
        descricao: descricao || '',
        observacoes: observacoes || '',
        localidade: localidade || null,
        dadosExtras: dadosExtras || {}
      })
      
      res.status(201).json({
        status: 'success',
        data: movimentacao,
        message: 'Movimentação registrada com sucesso',
        timestamp: new Date().toISOString()
      })
      
    } else if (req.method === 'PUT') {
      // Atualizar boletim (incluindo localidade)
      const { periodo, localidade, status } = req.body
      
      if (!periodo) {
        return res.status(400).json({
          status: 'error',
          message: 'Período é obrigatório'
        })
      }
      
      // Verificar se o boletim existe
      const boletimExistente = await databaseService.query(`
        SELECT id FROM boletim_contabil WHERE periodo = $1
      `, [periodo])
      
      if (boletimExistente.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Boletim não encontrado'
        })
      }
      
      // Atualizar boletim
      const updates = []
      const values = []
      let paramIndex = 1
      
      if (localidade !== undefined) {
        if (localidade && !['Pardinho', 'Rancharia'].includes(localidade)) {
          return res.status(400).json({
            status: 'error',
            message: 'Localidade deve ser "Pardinho" ou "Rancharia"'
          })
        }
        updates.push(`localidade = $${paramIndex}`)
        values.push(localidade || null)
        paramIndex++
      }
      
      if (status !== undefined) {
        updates.push(`status = $${paramIndex}`)
        values.push(status)
        paramIndex++
      }
      
      if (updates.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum campo para atualizar'
        })
      }
      
      updates.push(`data_atualizacao = CURRENT_TIMESTAMP`)
      values.push(periodo)
      
      const result = await databaseService.query(`
        UPDATE boletim_contabil 
        SET ${updates.join(', ')}
        WHERE periodo = $${paramIndex}
        RETURNING *
      `, values)
      
      res.status(200).json({
        status: 'success',
        success: true,
        data: result.rows[0],
        message: 'Boletim atualizado com sucesso',
        timestamp: new Date().toISOString()
      })
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).json({
        status: 'error',
        message: `Método ${req.method} não permitido`
      })
    }
    
  } catch (error) {
    logger.error('Erro na API de boletim contábil:', error)
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    })
  }
}