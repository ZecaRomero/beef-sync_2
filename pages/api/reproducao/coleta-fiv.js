import { query, pool } from '../../../lib/database'
import logger from '../../../utils/logger'
import { 
  sendSuccess, 
  sendValidationError, 
  sendNotFound, 
  sendMethodNotAllowed
} from '../../../utils/apiResponse'

export default async function coletaFivHandler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      await handleGet(req, res)
      break
    case 'POST':
      await handlePost(req, res)
      break
    case 'DELETE':
      await handleDelete(req, res)
      break
    default:
      return sendMethodNotAllowed(res, ['GET', 'POST', 'DELETE'])
  }
}

async function handleGet(req, res) {
  const { id, doadora_nome, laboratorio, veterinario, data_fiv } = req.query

  try {
    if (id) {
      const result = await query(
        `SELECT cf.*,
                EXISTS (
                  SELECT 1 FROM transferencias_embrioes te
                  WHERE te.data_te = cf.data_transferencia
                    AND (
                      (cf.doadora_id IS NOT NULL AND te.doadora_id = cf.doadora_id)
                      OR (te.data_fiv IS NOT NULL AND te.data_fiv = cf.data_fiv)
                    )
                ) AS te_exists,
                COALESCE((
                  SELECT COUNT(*) FROM transferencias_embrioes te
                  WHERE te.data_te = cf.data_transferencia
                    AND (
                      (cf.doadora_id IS NOT NULL AND te.doadora_id = cf.doadora_id)
                      OR (te.data_fiv IS NOT NULL AND te.data_fiv = cf.data_fiv)
                    )
                ), 0) AS te_count
         FROM coleta_fiv cf
         WHERE cf.id = $1`,
        [id]
      )

      if (result.rows.length === 0) {
        return sendNotFound(res, 'Coleta FIV não encontrada')
      }

      return sendSuccess(res, result.rows[0])
    }

    let queryText = `SELECT cf.*,
                            EXISTS (
                              SELECT 1 FROM transferencias_embrioes te
                              WHERE te.data_te = cf.data_transferencia
                                AND (
                                  (cf.doadora_id IS NOT NULL AND te.doadora_id = cf.doadora_id)
                                  OR (te.data_fiv IS NOT NULL AND te.data_fiv = cf.data_fiv)
                                )
                            ) AS te_exists,
                            COALESCE((
                              SELECT COUNT(*) FROM transferencias_embrioes te
                              WHERE te.data_te = cf.data_transferencia
                                AND (
                                  (cf.doadora_id IS NOT NULL AND te.doadora_id = cf.doadora_id)
                                  OR (te.data_fiv IS NOT NULL AND te.data_fiv = cf.data_fiv)
                                )
                            ), 0) AS te_count
                     FROM coleta_fiv cf`
    const queryParams = []
    const conditions = []

    if (doadora_nome) {
      conditions.push(`doadora_nome ILIKE $${queryParams.length + 1}`)
      queryParams.push(`%${doadora_nome}%`)
    }

    if (laboratorio) {
      conditions.push(`laboratorio ILIKE $${queryParams.length + 1}`)
      queryParams.push(`%${laboratorio}%`)
    }
    
    if (veterinario) {
      conditions.push(`veterinario ILIKE $${queryParams.length + 1}`)
      queryParams.push(`%${veterinario}%`)
    }

    if (data_fiv) {
      conditions.push(`data_fiv = $${queryParams.length + 1}`)
      queryParams.push(data_fiv)
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ')
    }

    queryText += ' ORDER BY data_fiv DESC, created_at DESC'

    const result = await query(queryText, queryParams)
    
    return sendSuccess(res, result.rows)

  } catch (error) {
    logger.error('Erro ao buscar coletas FIV:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    })
  }
}

async function handlePost(req, res) {
  const { 
    doadora_id,
    doadora_nome,
    laboratorio,
    veterinario,
    data_fiv,
    quantidade_oocitos,
    touro,
    observacoes,
    itens // Support for batch insert
  } = req.body

  if (!data_fiv || !laboratorio || !veterinario) {
    return sendValidationError(res, 'Data da FIV, laboratório e veterinário são obrigatórios')
  }

  // Calculate transfer date (FIV date + 7 days)
  const fivDate = new Date(data_fiv)
  const transferDate = new Date(fivDate)
  transferDate.setDate(transferDate.getDate() + 7)
  const data_transferencia = transferDate.toISOString().split('T')[0]

  // Handle batch insert
  if (itens && Array.isArray(itens) && itens.length > 0) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      const createdItems = []
      const createdTEs = []
      
      for (const item of itens) {
         if (!item.doadora_nome) continue;
         
         const { rows } = await client.query(
           `INSERT INTO coleta_fiv 
           (doadora_id, doadora_nome, laboratorio, veterinario, data_fiv, data_transferencia, quantidade_oocitos, touro, observacoes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
           [
             item.doadora_id || null, 
             item.doadora_nome, 
             laboratorio, 
             veterinario, 
             data_fiv, 
             data_transferencia, 
             item.quantidade_oocitos || 0, 
             item.touro || touro, 
             observacoes
           ]
         )
         const coleta = rows[0]
         createdItems.push(coleta)

         // Create TE automatically (pendente) if not exists
         const exists = await client.query(
           `SELECT 1 FROM transferencias_embrioes te
            WHERE te.data_te = $1
              AND (
                ($2 IS NOT NULL AND te.doadora_id = $2)
                OR ($3 IS NOT NULL AND te.doadora_nome ILIKE $3)
              )
            LIMIT 1`,
           [data_transferencia, coleta.doadora_id || null, coleta.doadora_nome || null]
         )
         if (exists.rows.length === 0) {
           const teDateStr = data_transferencia.replace(/-/g, '')
           const timeStr = Date.now().toString().slice(-6)
           const numeroTE = `TE-${teDateStr}-${timeStr}-1`
           const teResult = await client.query(
             `INSERT INTO transferencias_embrioes 
              (numero_te, data_te, doadora_id, doadora_nome, touro, local_te, tecnico_responsavel, status, data_fiv, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING *`,
             [
               numeroTE,
               data_transferencia,
               coleta.doadora_id || null,
               coleta.doadora_nome || null,
               coleta.touro || item.touro || null,
               laboratorio || null,
               veterinario || null,
               'pendente',
               data_fiv
             ]
           )
           createdTEs.push(teResult.rows[0])
         }
      }
      
      await client.query('COMMIT')
      logger.info(`Lote de ${createdItems.length} coletas FIV criado com sucesso (TEs criadas: ${createdTEs.length})`)
      return sendSuccess(res, { items: createdItems, tes: createdTEs }, 'Coletas FIV criadas com sucesso', 201)
      
    } catch (error) {
      await client.query('ROLLBACK')
      logger.error('Erro ao criar coletas FIV em lote:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar coletas FIV',
        error: error.message 
      })
    } finally {
      client.release()
    }
  }

  // Handle single insert (legacy/fallback)
  if (!doadora_nome) {
    return sendValidationError(res, 'Doadora é obrigatória')
  }

  try {
    const result = await query(
      `INSERT INTO coleta_fiv 
       (doadora_id, doadora_nome, laboratorio, veterinario, data_fiv, data_transferencia, quantidade_oocitos, touro, observacoes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [doadora_id || null, doadora_nome, laboratorio, veterinario, data_fiv, data_transferencia, quantidade_oocitos || 0, touro, observacoes]
    )

    const coleta = result.rows[0]

    // Create TE automatically (pendente) if not exists
    const teCheck = await query(
      `SELECT 1 FROM transferencias_embrioes te
       WHERE te.data_te = $1
         AND (
           ($2 IS NOT NULL AND te.doadora_id = $2)
           OR ($3 IS NOT NULL AND te.doadora_nome ILIKE $3)
         )
       LIMIT 1`,
      [data_transferencia, doadora_id || null, doadora_nome || null]
    )
    let teCreated = null
    if (teCheck.rows.length === 0) {
      const teDateStr = data_transferencia.replace(/-/g, '')
      const timeStr = Date.now().toString().slice(-6)
      const numeroTE = `TE-${teDateStr}-${timeStr}-1`
      const teResult = await query(
        `INSERT INTO transferencias_embrioes 
         (numero_te, data_te, doadora_id, doadora_nome, touro, local_te, tecnico_responsavel, status, data_fiv, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          numeroTE,
          data_transferencia,
          doadora_id || null,
          doadora_nome || null,
          touro || null,
          laboratorio || null,
          veterinario || null,
          'pendente',
          data_fiv
        ]
      )
      teCreated = teResult.rows[0]
    }

    logger.info(`Coleta FIV criada para doadora: ${doadora_nome} (TE automática: ${teCreated ? 'criada' : 'existente'})`)
    return sendSuccess(res, { coleta, te: teCreated }, 'Coleta FIV criada com sucesso', 201)

  } catch (error) {
    logger.error('Erro ao criar coleta FIV:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar coleta FIV',
      error: error.message 
    })
  }
}

async function handleDelete(req, res) {
  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID da coleta é obrigatório')
  }

  try {
    // Check for multiple IDs (comma separated)
    if (id.includes(',')) {
        const ids = id.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i))
        
        if (ids.length === 0) return sendValidationError(res, 'IDs inválidos')

        await query(
            'DELETE FROM coleta_fiv WHERE id = ANY($1)',
            [ids]
        )
        
        return sendSuccess(res, { count: ids.length }, 'Registros excluídos com sucesso')
    }

    const result = await query(
      'DELETE FROM coleta_fiv WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rowCount === 0) {
      return sendNotFound(res, 'Coleta não encontrada')
    }

    return sendSuccess(res, null, 'Coleta excluída com sucesso')

  } catch (error) {
    logger.error('Erro ao excluir coleta FIV:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir coleta',
      error: error.message 
    })
  }
}
