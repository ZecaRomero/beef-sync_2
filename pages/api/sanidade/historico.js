import logger from '../../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler,
  HTTP_STATUS 
} from '../../../utils/apiResponse'

// Usar o pool centralizado do databaseService
// Importar usando require para compatibilidade com CommonJS
const database = require('../../../lib/database')
const pool = database.pool

// Tipos de procedimentos sanitários válidos
const TIPOS_SANITARIOS = ['Vacinação', 'Exame', 'Tratamento', 'Cirurgia', 'vacinacao', 'exame', 'medicacao', 'tratamento']

// Mapear tipos de ocorrências para tipos sanitários
function mapearTipoSanitario(tipo) {
  const tipoLower = tipo?.toLowerCase() || ''
  
  if (tipoLower.includes('vacina')) return 'Vacinação'
  if (tipoLower.includes('exame')) return 'Exame'
  if (tipoLower.includes('medic') || tipoLower.includes('tratamento')) return 'Tratamento'
  if (tipoLower.includes('cirurg')) return 'Cirurgia'
  
  return tipo || 'Outro'
}

// GET - Listar histórico sanitário com filtros
async function handleGet(req, res) {
  const { filtroAnimal, filtroTipo, dataInicio, dataFim, limit = 1000, offset = 0 } = req.query
  
  let query = `
    SELECT 
      h.id,
      h.animal_id,
      COALESCE(a.serie || '/' || a.rg, 'Animal não encontrado') as animal,
      a.serie,
      a.rg as rgn,
      a.sexo,
      a.data_nascimento as nasc,
      h.tipo as tipo_original,
      COALESCE(h.descricao, h.observacoes, 'Sem descrição') as procedimento,
      h.observacoes,
      h.data,
      h.veterinario,
      CASE 
        WHEN h.tipo ILIKE '%vacina%' OR h.tipo = 'Vacinação' THEN 'Sucesso'
        WHEN h.tipo ILIKE '%exame%' OR h.tipo = 'Exame' THEN 
          CASE 
            WHEN h.observacoes ILIKE '%positivo%' OR h.descricao ILIKE '%positivo%' THEN 'Positivo'
            WHEN h.observacoes ILIKE '%negativo%' OR h.descricao ILIKE '%negativo%' THEN 'Negativo'
            ELSE 'Pendente'
          END
        WHEN (h.tipo ILIKE '%tratamento%' OR h.tipo ILIKE '%medic%' OR h.tipo = 'Tratamento') THEN 'Recuperado'
        ELSE 'Concluído'
      END as resultado,
      h.peso,
      h.medicamento,
      h.dosagem,
      h.abczg,
      h.deca,
      h.avo_materno,
      h.created_at,
      h.updated_at
    FROM historia_ocorrencias h
    INNER JOIN animais a ON h.animal_id = a.id
    WHERE (
      h.tipo ILIKE '%vacina%' OR 
      h.tipo ILIKE '%exame%' OR 
      h.tipo ILIKE '%tratamento%' OR 
      h.tipo ILIKE '%medic%' OR 
      h.tipo ILIKE '%cirurg%' OR
      h.tipo = 'Vacinação' OR 
      h.tipo = 'Exame' OR 
      h.tipo = 'Tratamento' OR 
      h.tipo = 'Cirurgia'
    )
  `
  
  const params = []
  let paramCount = 0
  
  // Filtro por animal (serie ou rg)
  if (filtroAnimal) {
    paramCount++
    query += ` AND (a.serie ILIKE $${paramCount} OR a.rg ILIKE $${paramCount} OR a.serie || '/' || a.rg ILIKE $${paramCount})`
    params.push(`%${filtroAnimal}%`)
  }
  
  // Filtro por tipo
  if (filtroTipo) {
    paramCount++
    const tipoFiltro = filtroTipo.toLowerCase()
    if (tipoFiltro === 'vacinação') {
      query += ` AND (h.tipo ILIKE $${paramCount} OR h.tipo = 'Vacinação')`
      params.push('%vacina%')
    } else if (tipoFiltro === 'exame') {
      query += ` AND (h.tipo ILIKE $${paramCount} OR h.tipo = 'Exame')`
      params.push('%exame%')
    } else if (tipoFiltro === 'tratamento') {
      query += ` AND (h.tipo ILIKE $${paramCount} OR h.tipo ILIKE '%medic%' OR h.tipo = 'Tratamento')`
      params.push('%tratamento%')
    } else if (tipoFiltro === 'cirurgia') {
      query += ` AND (h.tipo ILIKE $${paramCount} OR h.tipo = 'Cirurgia')`
      params.push('%cirurg%')
    }
  }
  
  // Filtro por data início
  if (dataInicio) {
    paramCount++
    query += ` AND h.data >= $${paramCount}`
    params.push(dataInicio)
  }
  
  // Filtro por data fim
  if (dataFim) {
    paramCount++
    query += ` AND h.data <= $${paramCount}`
    params.push(dataFim)
  }
  
  query += ` ORDER BY h.data DESC, h.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
  params.push(parseInt(limit), parseInt(offset))
  
  if (!pool) {
    logger.error('Pool de conexão não disponível')
    return sendError(res, 'Erro ao conectar com o banco de dados', HTTP_STATUS.SERVICE_UNAVAILABLE)
  }

  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    
    // Formatar resposta e mapear tipos
    const historico = result.rows.map(row => {
      const tipoSanitario = mapearTipoSanitario(row.tipo_original)
      
      return {
        id: row.id,
        animal: row.animal || `${row.serie || ''}/${row.rgn || ''}`.replace(/^\/|\/$/g, ''),
        animalId: row.animal_id,
        serie: row.serie || '',
        rgn: row.rgn || '',
        sexo: row.sexo || '',
        nasc: row.nasc || null,
        tipo: tipoSanitario,
        procedimento: row.procedimento || 'Sem descrição',
        observacoes: row.observacoes || '',
        data: row.data,
        veterinario: row.veterinario || 'Não informado',
        resultado: row.resultado || 'Concluído',
        peso: row.peso,
        medicamento: row.medicamento,
        dosagem: row.dosagem,
        abczg: row.abczg || '',
        deca: row.deca || '',
        avoMaterno: row.avo_materno || ''
      }
    })
    
    // Contar total de registros para paginação
    let countQuery = `
      SELECT COUNT(*) as total
      FROM historia_ocorrencias h
      INNER JOIN animais a ON h.animal_id = a.id
      WHERE (
        h.tipo ILIKE '%vacina%' OR 
        h.tipo ILIKE '%exame%' OR 
        h.tipo ILIKE '%tratamento%' OR 
        h.tipo ILIKE '%medic%' OR 
        h.tipo ILIKE '%cirurg%' OR
        h.tipo = 'Vacinação' OR 
        h.tipo = 'Exame' OR 
        h.tipo = 'Tratamento' OR 
        h.tipo = 'Cirurgia'
      )
    `
    
    const countParams = []
    let countParamCount = 0
    
    if (filtroAnimal) {
      countParamCount++
      countQuery += ` AND (a.serie ILIKE $${countParamCount} OR a.rg ILIKE $${countParamCount} OR a.serie || '/' || a.rg ILIKE $${countParamCount})`
      countParams.push(`%${filtroAnimal}%`)
    }
    
    if (filtroTipo) {
      countParamCount++
      const tipoFiltro = filtroTipo.toLowerCase()
      if (tipoFiltro === 'vacinação') {
        countQuery += ` AND (h.tipo ILIKE $${countParamCount} OR h.tipo = 'Vacinação')`
        countParams.push('%vacina%')
      } else if (tipoFiltro === 'exame') {
        countQuery += ` AND (h.tipo ILIKE $${countParamCount} OR h.tipo = 'Exame')`
        countParams.push('%exame%')
      } else if (tipoFiltro === 'tratamento') {
        countQuery += ` AND (h.tipo ILIKE $${countParamCount} OR h.tipo ILIKE '%medic%' OR h.tipo = 'Tratamento')`
        countParams.push('%tratamento%')
      } else if (tipoFiltro === 'cirurgia') {
        countQuery += ` AND (h.tipo ILIKE $${countParamCount} OR h.tipo = 'Cirurgia')`
        countParams.push('%cirurg%')
      }
    }
    
    if (dataInicio) {
      countParamCount++
      countQuery += ` AND h.data >= $${countParamCount}`
      countParams.push(dataInicio)
    }
    
    if (dataFim) {
      countParamCount++
      countQuery += ` AND h.data <= $${countParamCount}`
      countParams.push(dataFim)
    }
    
    const countResult = await client.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)
    
    logger.info(`Histórico sanitário recuperado: ${historico.length} de ${total} registros`)
    
    return sendSuccess(res, {
      data: historico,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }, 'Histórico sanitário recuperado com sucesso')
    
  } catch (error) {
    logger.error('Erro ao buscar histórico sanitário:', error)
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

async function historicoSanitarioHandler(req, res) {
  if (req.method === 'GET') {
    return await handleGet(req, res)
  } else {
    return sendMethodNotAllowed(res, req.method)
  }
}

export default asyncHandler(historicoSanitarioHandler)

