const { query } = require('../../lib/database')
const logger = require('../../utils/logger.cjs')
const { canDelete } = require('../../utils/permissions')

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
      case 'DELETE':
        await handleDelete(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).json({ error: `Método ${method} não permitido` })
    }
  } catch (error) {
    logger.error('Erro na API de locais:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}

// GET - Buscar todos os locais
async function handleGet(req, res) {
  try {
    // Primeiro, verificar se a tabela existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_disponiveis'
      );
    `)

    if (!tableExists.rows[0].exists) {
      // Criar tabela se não existir
      await query(`
        CREATE TABLE locais_disponiveis (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL UNIQUE,
          tipo VARCHAR(100) DEFAULT 'piquete',
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Inserir locais padrão
      const locaisPadrao = [
        'Piquete 1', 'Piquete 2', 'Piquete 3', 'Piquete 4', 'Piquete 5',
        'Pasto A', 'Pasto B', 'Pasto C', 'Pasto D',
        'Curral 1', 'Curral 2', 'Curral 3',
        'Enfermaria', 'Quarentena', 'Maternidade',
        'Área de Engorda', 'Área de Recria', 'Área de Cria'
      ]

      for (const local of locaisPadrao) {
        await query(
          'INSERT INTO locais_disponiveis (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING',
          [local]
        )
      }

      logger.info('Tabela locais_disponiveis criada e populada com dados padrão')
    }

    // Buscar todos os locais ativos
    const result = await query(`
      SELECT * FROM locais_disponiveis 
      WHERE ativo = true 
      ORDER BY nome ASC
    `)

    res.status(200).json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    logger.error('Erro ao buscar locais:', error)
    res.status(500).json({ 
      error: 'Erro ao buscar locais',
      details: error.message 
    })
  }
}

// POST - Criar novo local
async function handlePost(req, res) {
  const { nome, tipo } = req.body

  if (!nome || !nome.trim()) {
    return res.status(400).json({
      error: 'Nome do local é obrigatório'
    })
  }

  try {
    // Verificar se já existe
    const existingResult = await query(
      'SELECT id FROM locais_disponiveis WHERE nome = $1',
      [nome.trim()]
    )

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Já existe um local com este nome'
      })
    }

    // Criar novo local
    const result = await query(`
      INSERT INTO locais_disponiveis (nome, tipo) 
      VALUES ($1, $2) 
      RETURNING *
    `, [nome.trim(), tipo || 'piquete'])

    logger.info(`Novo local criado: ${nome.trim()}`)

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Local criado com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao criar local:', error)
    res.status(500).json({ 
      error: 'Erro ao criar local',
      details: error.message 
    })
  }
}

// DELETE - Remover local
async function handleDelete(req, res) {
  // Verificar permissão de exclusão
  if (!canDelete(req)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Esta ação é permitida apenas para o desenvolvedor (acesso local).',
      permissionRequired: true
    })
  }

  const { nome } = req.query

  if (!nome) {
    return res.status(400).json({
      error: 'Nome do local é obrigatório'
    })
  }

  try {
    // Verificar se há animais neste local
    const animaisResult = await query(`
      SELECT COUNT(*) as count 
      FROM localizacoes_animais 
      WHERE piquete = $1 AND data_saida IS NULL
    `, [nome])

    if (parseInt(animaisResult.rows[0].count) > 0) {
      return res.status(409).json({
        error: `Não é possível excluir "${nome}" pois há ${animaisResult.rows[0].count} animal(is) neste local atualmente`
      })
    }

    // Verificar se o local existe em locais_disponiveis ou piquetes
    let localEncontrado = false
    
    // 1. Tentar remover de locais_disponiveis
    const existingResult = await query(
      'SELECT id FROM locais_disponiveis WHERE nome = $1',
      [nome]
    )

    if (existingResult.rows.length > 0) {
      // Marcar como inativo ao invés de deletar (para manter histórico)
      await query(
        'UPDATE locais_disponiveis SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE nome = $1',
        [nome]
      )
      localEncontrado = true
    }

    // 2. Tentar remover de piquetes (novo sistema)
    try {
      const existingPiquete = await query(
        'SELECT id FROM piquetes WHERE nome = $1',
        [nome]
      )

      if (existingPiquete.rows.length > 0) {
        await query(
          'UPDATE piquetes SET ativo = false, updated_at = NOW() WHERE nome = $1',
          [nome]
        )
        localEncontrado = true
      }
    } catch (error) {
      // Ignorar erro se a tabela piquetes não existir
      logger.warn('Erro ao tentar remover de piquetes (pode não existir):', error.message)
    }

    if (!localEncontrado) {
      return res.status(404).json({
        error: 'Local não encontrado'
      })
    }

    logger.info(`Local removido: ${nome}`)

    res.status(200).json({
      success: true,
      message: 'Local removido com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao remover local:', error)
    res.status(500).json({ 
      error: 'Erro ao remover local',
      details: error.message 
    })
  }
}