import { query } from '../../lib/database'
import { sendSuccess, sendError, sendValidationError, sendMethodNotAllowed, asyncHandler } from '../../utils/apiResponse'
import logger from '../../utils/logger'
import LoteTracker from '../../utils/loteTracker'

async function protocolosHandler(req, res) {
  if (req.method === 'GET') {
    return await handleGet(req, res)
  } else if (req.method === 'POST') {
    return await handlePost(req, res)
  } else if (req.method === 'PUT') {
    return await handlePut(req, res)
  } else if (req.method === 'DELETE') {
    return await handleDelete(req, res)
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

async function handleGet(req, res) {
  try {
    // Buscar medicamentos do PostgreSQL
    const medicamentosResult = await query('SELECT * FROM medicamentos WHERE ativo = true ORDER BY nome')
    
    // Buscar dados padrão dos protocolos (ainda usando costManager como base)
    const { default: costManager } = await import('../../services/costManager')
    
    return sendSuccess(res, {
      protocolos: costManager.protocolos,
      medicamentos: medicamentosResult.rows
    }, 'Protocolos encontrados com sucesso')
    
  } catch (error) {
    logger.error('Erro ao buscar protocolos:', error)
    return sendError(res, 'Erro ao buscar protocolos', 500)
  }
}

async function handlePost(req, res) {
  try {
    const { animal_id, protocolo_nome, medicamentos_aplicados, data_aplicacao, observacoes, usuario = 'Sistema' } = req.body
    
    // Validações
    if (!animal_id) {
      return sendValidationError(res, 'ID do animal é obrigatório')
    }
    
    if (!protocolo_nome) {
      return sendValidationError(res, 'Nome do protocolo é obrigatório')
    }
    
    if (!medicamentos_aplicados || !Array.isArray(medicamentos_aplicados)) {
      return sendValidationError(res, 'Lista de medicamentos aplicados é obrigatória')
    }
    
    // Verificar se o animal existe
    const animalResult = await query('SELECT id, serie, rg FROM animais WHERE id = $1', [animal_id])
    if (animalResult.rows.length === 0) {
      return sendError(res, 'Animal não encontrado', 404)
    }
    
    const animal = animalResult.rows[0]
    
    // Inserir protocolo aplicado
    const protocoloResult = await query(`
      INSERT INTO protocolos_aplicados (animal_id, protocolo_id, data_inicio, observacoes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [animal_id, 0, data_aplicacao || new Date().toISOString().split('T')[0], observacoes])
    
    const protocoloAplicado = protocoloResult.rows[0]
    
    // Registrar custos dos medicamentos
    let custoTotal = 0
    for (const medicamento of medicamentos_aplicados) {
      const custoResult = await query(`
        INSERT INTO custos (animal_id, tipo, subtipo, valor, data, observacoes, detalhes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        animal_id,
        'Medicamentos',
        medicamento.nome,
        medicamento.custo || 0,
        data_aplicacao || new Date().toISOString().split('T')[0],
        `Protocolo: ${protocolo_nome}`,
        JSON.stringify({
          protocolo_aplicado_id: protocoloAplicado.id,
          quantidade: medicamento.quantidade,
          unidade: medicamento.unidade
        })
      ])
      
      custoTotal += parseFloat(medicamento.custo || 0)
    }
    
    // Registrar no histórico de lançamentos
    try {
      await LoteTracker.registrarOperacao({
        tipo_operacao: 'APLICACAO_PROTOCOLO',
        descricao: `Protocolo ${protocolo_nome} aplicado no animal ${animal.serie}-${animal.rg} - Custo total: R$ ${custoTotal.toFixed(2)}`,
        modulo: 'PROTOCOLOS',
        detalhes: {
          animal_id,
          animal_identificacao: `${animal.serie}-${animal.rg}`,
          protocolo_nome,
          medicamentos_aplicados,
          custo_total: custoTotal,
          data_aplicacao,
          protocolo_aplicado_id: protocoloAplicado.id,
          timestamp: new Date().toISOString()
        },
        usuario,
        quantidade_registros: medicamentos_aplicados.length,
        status: 'concluido',
        req
      })
    } catch (trackError) {
      logger.error('Erro ao registrar no sistema de lotes:', trackError)
    }
    
    logger.info(`Protocolo ${protocolo_nome} aplicado no animal ${animal.serie}-${animal.rg}`)
    
    return sendSuccess(res, {
      protocolo_aplicado: protocoloAplicado,
      custo_total: custoTotal
    }, 'Protocolo aplicado com sucesso', 201)
    
  } catch (error) {
    logger.error('Erro ao aplicar protocolo:', error)
    return sendError(res, 'Erro ao aplicar protocolo', 500)
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query
    const { observacoes, status, usuario = 'Sistema' } = req.body
    
    if (!id) {
      return sendValidationError(res, 'ID do protocolo é obrigatório')
    }
    
    // Verificar se o protocolo existe
    const existingResult = await query('SELECT * FROM protocolos_aplicados WHERE id = $1', [id])
    if (existingResult.rows.length === 0) {
      return sendError(res, 'Protocolo não encontrado', 404)
    }
    
    // Atualizar protocolo
    const result = await query(`
      UPDATE protocolos_aplicados 
      SET 
        observacoes = COALESCE($1, observacoes),
        status = COALESCE($2, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [observacoes, status, id])
    
    const protocoloAtualizado = result.rows[0]
    
    // Registrar no histórico de lançamentos
    try {
      await LoteTracker.registrarOperacao({
        tipo_operacao: 'ATUALIZACAO_PROTOCOLO',
        descricao: `Protocolo ID ${id} atualizado`,
        modulo: 'PROTOCOLOS',
        detalhes: {
          protocolo_id: id,
          alteracoes: { observacoes, status },
          timestamp: new Date().toISOString()
        },
        usuario,
        quantidade_registros: 1,
        status: 'concluido',
        req
      })
    } catch (trackError) {
      logger.error('Erro ao registrar no sistema de lotes:', trackError)
    }
    
    return sendSuccess(res, {
      protocolo: protocoloAtualizado
    }, 'Protocolo atualizado com sucesso')
    
  } catch (error) {
    logger.error('Erro ao atualizar protocolo:', error)
    return sendError(res, 'Erro ao atualizar protocolo', 500)
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query
    const { usuario = 'Sistema' } = req.body
    
    if (!id) {
      return sendValidationError(res, 'ID do protocolo é obrigatório')
    }
    
    // Verificar se o protocolo existe
    const existingResult = await query('SELECT * FROM protocolos_aplicados WHERE id = $1', [id])
    if (existingResult.rows.length === 0) {
      return sendError(res, 'Protocolo não encontrado', 404)
    }
    
    const protocolo = existingResult.rows[0]
    
    // Remover protocolo
    await query('DELETE FROM protocolos_aplicados WHERE id = $1', [id])
    
    // Registrar no histórico de lançamentos
    try {
      await LoteTracker.registrarOperacao({
        tipo_operacao: 'EXCLUSAO_PROTOCOLO',
        descricao: `Protocolo ID ${id} removido`,
        modulo: 'PROTOCOLOS',
        detalhes: {
          protocolo_removido: protocolo,
          timestamp: new Date().toISOString()
        },
        usuario,
        quantidade_registros: 1,
        status: 'concluido',
        req
      })
    } catch (trackError) {
      logger.error('Erro ao registrar no sistema de lotes:', trackError)
    }
    
    return sendSuccess(res, null, 'Protocolo removido com sucesso')
    
  } catch (error) {
    logger.error('Erro ao remover protocolo:', error)
    return sendError(res, 'Erro ao remover protocolo', 500)
  }
}

export default asyncHandler(protocolosHandler)
