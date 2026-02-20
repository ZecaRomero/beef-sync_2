import { query } from '../../lib/database'

export default async function handler(req, res) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        await handleGet(req, res)
        break
      case 'POST':
        await handlePost(req, res)
        break
      case 'PUT':
        await handlePut(req, res)
        break
      case 'DELETE':
        await handleDelete(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('Erro na API de relatórios personalizados:', error)
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message })
  }
}

async function handleGet(req, res) {
  try {
    const { id, tipo, ativo } = req.query
    
    if (id) {
      // Buscar relatório específico
      const result = await query(
        'SELECT * FROM relatorios_personalizados WHERE id = $1',
        [id]
      )
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Relatório não encontrado' })
      }
      
      res.status(200).json(result.rows[0])
    } else {
      // Buscar lista de relatórios
      let sql = 'SELECT * FROM relatorios_personalizados'
      const params = []
      let paramCount = 0
      const conditions = []
      
      if (tipo) {
        conditions.push(`tipo = $${++paramCount}`)
        params.push(tipo)
      }
      
      if (ativo !== undefined) {
        conditions.push(`ativo = $${++paramCount}`)
        params.push(ativo === 'true')
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ')
      }
      
      sql += ' ORDER BY nome ASC'
      
      const result = await query(sql, params)
      res.status(200).json(result.rows)
    }
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    res.status(500).json({ message: 'Erro ao buscar relatórios', error: error.message })
  }
}

async function handlePost(req, res) {
  try {
    // Se for uma requisição de geração, não processar aqui
    // (deve ser tratada por /api/relatorios-personalizados/generate)
    if (req.body.relatorioId !== undefined || req.body.formato !== undefined) {
      return res.status(404).json({ 
        message: 'Endpoint não encontrado. Use /api/relatorios-personalizados/generate para gerar relatórios' 
      })
    }

    const {
      nome,
      descricao,
      tipo,
      parametros,
      sql_query,
      campos_exibicao,
      filtros,
      agrupamento,
      ordenacao
    } = req.body

    // Validações
    if (!nome || !tipo) {
      return res.status(400).json({ 
        message: 'Nome e tipo são obrigatórios',
        campos: { nome, tipo }
      })
    }

    // Validar tipo de relatório
    const tiposValidos = ['animais', 'reprodutivo', 'financeiro', 'estoque', 'customizado']
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ 
        message: `Tipo de relatório inválido. Valores aceitos: ${tiposValidos.join(', ')}` 
      })
    }

    const result = await query(
      `INSERT INTO relatorios_personalizados 
       (nome, descricao, tipo, parametros, sql_query, campos_exibicao, filtros, agrupamento, ordenacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nome,
        descricao || null,
        tipo,
        parametros || {},
        sql_query || null,
        campos_exibicao || [],
        filtros || {},
        agrupamento || {},
        ordenacao || {}
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao criar relatório:', error)
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message })
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query
    const {
      nome,
      descricao,
      tipo,
      parametros,
      sql_query,
      campos_exibicao,
      filtros,
      agrupamento,
      ordenacao,
      ativo
    } = req.body

    if (!id) {
      return res.status(400).json({ message: 'ID do relatório é obrigatório' })
    }

    let sql = 'UPDATE relatorios_personalizados SET updated_at = CURRENT_TIMESTAMP'
    const params = []
    let paramCount = 0

    if (nome !== undefined) {
      sql += `, nome = $${++paramCount}`
      params.push(nome)
    }

    if (descricao !== undefined) {
      sql += `, descricao = $${++paramCount}`
      params.push(descricao)
    }

    if (tipo !== undefined) {
      sql += `, tipo = $${++paramCount}`
      params.push(tipo)
    }

    if (parametros !== undefined) {
      sql += `, parametros = $${++paramCount}`
      params.push(parametros || {})
    }

    if (sql_query !== undefined) {
      sql += `, sql_query = $${++paramCount}`
      params.push(sql_query)
    }

    if (campos_exibicao !== undefined) {
      sql += `, campos_exibicao = $${++paramCount}`
      params.push(campos_exibicao || [])
    }

    if (filtros !== undefined) {
      sql += `, filtros = $${++paramCount}`
      params.push(filtros || {})
    }

    if (agrupamento !== undefined) {
      sql += `, agrupamento = $${++paramCount}`
      params.push(agrupamento || {})
    }

    if (ordenacao !== undefined) {
      sql += `, ordenacao = $${++paramCount}`
      params.push(ordenacao || {})
    }

    if (ativo !== undefined) {
      sql += `, ativo = $${++paramCount}`
      params.push(ativo)
    }

    sql += ` WHERE id = $${++paramCount} RETURNING *`
    params.push(id)

    const result = await query(sql, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Relatório não encontrado' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error)
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message })
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ message: 'ID do relatório é obrigatório' })
    }

    const result = await query(
      'DELETE FROM relatorios_personalizados WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Relatório não encontrado' })
    }

    res.status(200).json({ message: 'Relatório excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir relatório:', error)
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message })
  }
}
