const { query } = require('../../../../lib/database')
const logger = require('../../../../utils/logger.cjs')
import LoteTracker from '../../../../utils/loteTracker'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  if (!id) {
    return res.status(400).json({
      error: 'ID do animal é obrigatório'
    })
  }

  try {
    switch (method) {
      case 'GET':
        await handleGet(req, res, id)
        break
      case 'POST':
        await handlePost(req, res, id)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({ error: `Método ${method} não permitido` })
    }
  } catch (error) {
    logger.error('Erro na API de localizações do animal:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}

// GET - Buscar histórico de localizações do animal
async function handleGet(req, res, animalId) {
  try {
    // Verificar se o animal existe
    const animalResult = await query(
      'SELECT id, serie, rg, raca, sexo FROM animais WHERE id = $1',
      [animalId]
    )

    if (animalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Animal não encontrado'
      })
    }

    // Buscar histórico de localizações
    const result = await query(`
      SELECT 
        l.*,
        CASE 
          WHEN l.data_saida IS NULL THEN 'Atual'
          ELSE 'Histórico'
        END as status_localizacao
      FROM localizacoes_animais l
      WHERE l.animal_id = $1
      ORDER BY l.data_entrada DESC, l.created_at DESC
    `, [animalId])

    // Buscar localização atual
    const localizacaoAtual = await query(`
      SELECT * FROM localizacoes_animais 
      WHERE animal_id = $1 AND data_saida IS NULL
      ORDER BY data_entrada DESC
      LIMIT 1
    `, [animalId])

    res.status(200).json({
      success: true,
      animal: animalResult.rows[0],
      localizacao_atual: localizacaoAtual.rows[0] || null,
      historico: result.rows,
      total: result.rows.length
    })

  } catch (error) {
    logger.error('Erro ao buscar localizações do animal:', error)
    res.status(500).json({ 
      error: 'Erro ao buscar localizações do animal',
      details: error.message 
    })
  }
}

// POST - Adicionar nova localização para o animal
async function handlePost(req, res, animalId) {
  const {
    piquete,
    data_entrada,
    motivo_movimentacao,
    observacoes,
    usuario_responsavel
  } = req.body

  // Validações
  if (!piquete || !data_entrada) {
    return res.status(400).json({
      error: 'Campos obrigatórios: piquete, data_entrada'
    })
  }

  try {
    // Verificar se o animal existe
    const animalResult = await query(
      'SELECT id, serie, rg FROM animais WHERE id = $1',
      [animalId]
    )

    if (animalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Animal não encontrado'
      })
    }

    // Finalizar localização anterior (se existir)
    await query(`
      UPDATE localizacoes_animais 
      SET data_saida = $1, updated_at = CURRENT_TIMESTAMP
      WHERE animal_id = $2 AND data_saida IS NULL
    `, [data_entrada, animalId])

    // Verificar localização anterior para rastreamento
    const localizacaoAnterior = await query(`
      SELECT piquete FROM localizacoes_animais 
      WHERE animal_id = $1 AND data_saida = $2
      ORDER BY data_entrada DESC 
      LIMIT 1
    `, [animalId, data_entrada])

    // Criar nova localização
    const result = await query(`
      INSERT INTO localizacoes_animais (
        animal_id, piquete, data_entrada, motivo_movimentacao, 
        observacoes, usuario_responsavel
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      animalId,
      piquete,
      data_entrada,
      motivo_movimentacao || null,
      observacoes || null,
      usuario_responsavel || null
    ])

    // Registrar operação no sistema de lotes
    try {
      const animal = animalResult.rows[0]
      const piquete_origem = localizacaoAnterior.rows[0]?.piquete || null
      
      await LoteTracker.registrarLocalizacao({
        animal_id: animalId,
        animal_identificacao: `${animal.serie}-${animal.rg}`,
        piquete_origem,
        piquete_destino: piquete,
        motivo: motivo_movimentacao || 'Localização registrada',
        usuario: usuario_responsavel || 'Sistema',
        req
      })
    } catch (trackError) {
      logger.error('Erro ao registrar no sistema de lotes:', trackError)
      // Não falhar a operação principal por erro no tracking
    }

    logger.info(`Nova localização criada para animal ${animalResult.rows[0].serie}${animalResult.rows[0].rg} no piquete ${piquete}`)

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Localização registrada com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao criar localização para animal:', error)
    res.status(500).json({ 
      error: 'Erro ao criar localização',
      details: error.message 
    })
  }
}