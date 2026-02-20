import databaseService from '../../services/databaseService'
import logger from '../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler 
} from '../../utils/apiResponse'

export default asyncHandler(async function handler(req, res) {
  if (req.method === 'GET') {
    // Buscar todos os piquetes
    try {
      const result = await databaseService.query(`
        SELECT * FROM piquetes 
        WHERE ativo = true
        ORDER BY nome ASC
      `)

      return sendSuccess(res, {
        piquetes: result.rows,
        count: result.rows.length
      }, 'Piquetes encontrados com sucesso')

    } catch (error) {
      logger.error('Erro ao buscar piquetes:', error)
      return sendError(res, `Erro ao buscar piquetes: ${error.message}`, 500)
    }
  }

  if (req.method === 'POST') {
    // Criar novo piquete
    try {
      const { nome, area, capacidade, tipo, observacoes, ativo = true } = req.body

      if (!nome || !nome.trim()) {
        return sendValidationError(res, 'Nome do piquete é obrigatório')
      }

      // Verificar se já existe
      const existe = await databaseService.query(`
        SELECT id FROM piquetes WHERE nome = $1
      `, [nome.trim()])

      if (existe.rows.length > 0) {
        // Se existe mas está inativo, ativar
        if (!ativo) {
          await databaseService.query(`
            UPDATE piquetes 
            SET ativo = true, updated_at = NOW()
            WHERE nome = $1
          `, [nome.trim()])
        }
        return sendSuccess(res, { 
          piquete: existe.rows[0],
          message: 'Piquete já existe'
        }, 'Piquete já cadastrado')
      }

      // Inserir novo piquete
      const codigo = req.body.codigo || nome.trim().toUpperCase().replace(/\s+/g, '_')
      const result = await databaseService.query(`
        INSERT INTO piquetes (codigo, nome, area_hectares, capacidade_animais, tipo, observacoes, ativo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `, [codigo, nome.trim(), area || null, capacidade || null, tipo || null, observacoes || null, ativo])

      logger.info(`Piquete "${nome}" criado com sucesso`)

      return sendSuccess(res, {
        piquete: result.rows[0]
      }, 'Piquete criado com sucesso')

    } catch (error) {
      logger.error('Erro ao criar piquete:', error)
      return sendError(res, `Erro ao criar piquete: ${error.message}`, 500)
    }
  }

  if (req.method === 'PUT') {
    // Atualizar piquete
    try {
      const { id, nome, area, capacidade, tipo, observacoes, ativo } = req.body

      if (!id) {
        return sendValidationError(res, 'ID do piquete é obrigatório')
      }

      const result = await databaseService.query(`
        UPDATE piquetes 
        SET nome = COALESCE($1, nome),
            area_hectares = COALESCE($2, area_hectares),
            capacidade_animais = COALESCE($3, capacidade_animais),
            tipo = COALESCE($4, tipo),
            observacoes = COALESCE($5, observacoes),
            ativo = COALESCE($6, ativo),
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `, [nome, area, capacidade, tipo, observacoes, ativo, id])

      if (result.rows.length === 0) {
        return sendError(res, 'Piquete não encontrado', 404)
      }

      return sendSuccess(res, {
        piquete: result.rows[0]
      }, 'Piquete atualizado com sucesso')

    } catch (error) {
      logger.error('Erro ao atualizar piquete:', error)
      return sendError(res, `Erro ao atualizar piquete: ${error.message}`, 500)
    }
  }

  if (req.method === 'DELETE') {
    // Desativar piquete (soft delete)
    try {
      const { id } = req.query

      if (!id) {
        return sendValidationError(res, 'ID do piquete é obrigatório')
      }

      const result = await databaseService.query(`
        UPDATE piquetes 
        SET ativo = false, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id])

      if (result.rows.length === 0) {
        return sendError(res, 'Piquete não encontrado', 404)
      }

      return sendSuccess(res, {
        piquete: result.rows[0]
      }, 'Piquete desativado com sucesso')

    } catch (error) {
      logger.error('Erro ao desativar piquete:', error)
      return sendError(res, `Erro ao desativar piquete: ${error.message}`, 500)
    }
  }

  return sendMethodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
})

