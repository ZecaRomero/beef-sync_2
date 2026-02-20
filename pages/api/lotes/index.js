import { 
  sendSuccess, 
  sendError,
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler, 
  HTTP_STATUS 
} from '../../../utils/apiResponse'

const { pool } = require('../../../lib/database')
const { logger } = require('../../../utils/logger')

export default asyncHandler(async function handler(req, res) {
  if (req.method === 'POST') {
    // Handler POST para criar novos lotes
    const {
      tipo_operacao,
      modulo,
      quantidade_registros = 1,
      usuario = 'sistema',
      descricao,
      detalhes = {}
    } = req.body

    // Validar campos obrigatórios
    if (!tipo_operacao || !modulo) {
      return sendValidationError(res, 'Campos obrigatórios: tipo_operacao e modulo', {
        required: ['tipo_operacao', 'modulo'],
        provided: { 
          tipo_operacao: !!tipo_operacao, 
          modulo: !!modulo 
        }
      })
    }

    try {
      logger.info(`[API Lotes] POST criando lote - Tipo: ${tipo_operacao}, Módulo: ${modulo}`)
      
      // Verificar se a tabela existe
      await pool.query(`
        CREATE TABLE IF NOT EXISTS lotes_operacoes (
          id SERIAL PRIMARY KEY,
          numero_lote VARCHAR(20) UNIQUE NOT NULL,
          tipo_operacao VARCHAR(100) NOT NULL,
          descricao TEXT NOT NULL,
          detalhes JSONB,
          usuario VARCHAR(100),
          quantidade_registros INTEGER DEFAULT 1,
          modulo VARCHAR(50) NOT NULL,
          ip_origem INET,
          user_agent TEXT,
          status VARCHAR(20) DEFAULT 'concluido',
          data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Verificar se a função de gerar próximo lote existe
      // Verificar se a sequência existe, se não, criar e sincronizar
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'lotes_seq') THEN
            CREATE SEQUENCE lotes_seq START 1;
            
            PERFORM setval('lotes_seq', (
              SELECT COALESCE(MAX(CAST(SUBSTRING(numero_lote FROM 'LOTE-(\\d+)') AS INTEGER)), 0)
              FROM lotes_operacoes
              WHERE numero_lote ~ '^LOTE-\\d+$'
            ));
          END IF;
        END
        $$;
      `)

      await pool.query(`
        CREATE OR REPLACE FUNCTION gerar_proximo_lote() 
        RETURNS VARCHAR AS $$
        DECLARE
          novo_numero BIGINT;
        BEGIN
          novo_numero := nextval('lotes_seq');
          RETURN 'LOTE-' || LPAD(novo_numero::TEXT, 5, '0');
        END;
        $$ LANGUAGE plpgsql;
      `)

      // Inserir novo lote
      const insertQuery = `
        INSERT INTO lotes_operacoes 
        (numero_lote, tipo_operacao, descricao, detalhes, usuario, quantidade_registros, modulo, ip_origem, user_agent)
        VALUES (gerar_proximo_lote(), $1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `

      const ipOrigem = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
      const userAgent = req.headers['user-agent']

      const result = await pool.query(insertQuery, [
        tipo_operacao,
        descricao || `${tipo_operacao} - ${new Date().toLocaleString('pt-BR')}`,
        JSON.stringify(detalhes),
        usuario,
        quantidade_registros,
        modulo,
        ipOrigem,
        userAgent
      ])

      logger.info(`[API Lotes] Lote criado com sucesso: ${result.rows[0].numero_lote}`)
      
      return sendSuccess(res, {
        lote: result.rows[0]
      }, 'Lote criado com sucesso', HTTP_STATUS.CREATED)

    } catch (error) {
      logger.error('[API Lotes] Erro ao criar lote:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      })
      return sendError(res, 'Erro ao criar lote', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    }
  } else if (req.method === 'GET') {
    const {
      page = 1,
      limit = 10,
      modulo = '',
      tipo_operacao = '',
      data_inicio = '',
      data_fim = '',
      search = ''
    } = req.query

    // Validar parâmetros
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return sendValidationError(res, 'Parâmetros de paginação inválidos')
    }

    const offset = (pageNum - 1) * limitNum

    try {
      logger.info(`[API Lotes] GET requisição recebida - Página: ${pageNum}, Limite: ${limitNum}`)
      
      // Verificar se a tabela existe, se não, criar
      await pool.query(`
        CREATE TABLE IF NOT EXISTS lotes_operacoes (
          id SERIAL PRIMARY KEY,
          numero_lote VARCHAR(20) UNIQUE NOT NULL,
          tipo_operacao VARCHAR(100) NOT NULL,
          descricao TEXT NOT NULL,
          detalhes JSONB,
          usuario VARCHAR(100),
          quantidade_registros INTEGER DEFAULT 1,
          modulo VARCHAR(50) NOT NULL,
          ip_origem INET,
          user_agent TEXT,
          status VARCHAR(20) DEFAULT 'concluido',
          data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Construir query base
      let whereConditions = []
      let queryParams = []
      let paramIndex = 1

      // Filtro por módulo
      if (modulo) {
        whereConditions.push(`modulo = $${paramIndex}`)
        queryParams.push(modulo)
        paramIndex++
      }

      // Filtro por tipo de operação
      if (tipo_operacao) {
        whereConditions.push(`tipo_operacao ILIKE $${paramIndex}`)
        queryParams.push(`%${tipo_operacao}%`)
        paramIndex++
      }

      // Filtro por data
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

      // Filtro por busca (número do lote ou descrição)
      if (search) {
        whereConditions.push(`(numero_lote::text ILIKE $${paramIndex} OR descricao ILIKE $${paramIndex})`)
        queryParams.push(`%${search}%`)
        paramIndex++
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM lotes_operacoes 
        ${whereClause}
      `

      const countResult = await pool.query(countQuery, queryParams)
      const total = parseInt(countResult.rows[0].total)

      // Query principal com paginação
      const mainQuery = `
        SELECT 
          id,
          numero_lote,
          tipo_operacao,
          descricao,
          detalhes,
          usuario,
          quantidade_registros,
          modulo,
          ip_origem,
          user_agent,
          status,
          data_criacao
        FROM lotes_operacoes 
        ${whereClause}
        ORDER BY data_criacao DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `

      queryParams.push(limitNum, offset)
      const result = await pool.query(mainQuery, queryParams)

      // Calcular estatísticas
      const statsQuery = `
        SELECT 
          COUNT(*) as total_lotes,
          COUNT(DISTINCT modulo) as total_modulos,
          COUNT(DISTINCT tipo_operacao) as total_tipos,
          SUM(quantidade_registros) as total_registros,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as lotes_concluidos,
          COUNT(CASE WHEN status = 'erro' THEN 1 END) as lotes_erro,
          COUNT(CASE WHEN status = 'pendente' THEN 1 END) as lotes_pendentes
        FROM lotes_operacoes
        ${whereClause}
      `

      const statsResult = await pool.query(statsQuery, queryParams.slice(0, -2)) // Remove limit e offset
      const stats = statsResult.rows[0]

      const totalPages = Math.ceil(total / limitNum)

      logger.debug(`[API Lotes] Resposta: ${result.rows.length} lotes, Total: ${total}, Páginas: ${totalPages}`)

      return sendSuccess(res, {
        lotes: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        stats: {
          total_lotes: parseInt(stats.total_lotes),
          total_modulos: parseInt(stats.total_modulos),
          total_tipos: parseInt(stats.total_tipos),
          total_registros: parseInt(stats.total_registros) || 0,
          lotes_concluidos: parseInt(stats.lotes_concluidos),
          lotes_erro: parseInt(stats.lotes_erro),
          lotes_pendentes: parseInt(stats.lotes_pendentes)
        }
      })

    } catch (error) {
      logger.error('[API Lotes] Erro ao buscar lotes:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        params: { page, limit, modulo, tipo_operacao }
      })
      throw error
    }
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST'])
  }
})
