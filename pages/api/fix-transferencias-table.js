import { query } from '../../lib/database'
import logger from '../../utils/logger'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Adicionar colunas que podem estar faltando
    await query(`
      ALTER TABLE transferencias_embrioes 
      ADD COLUMN IF NOT EXISTS receptora_nome VARCHAR(255),
      ADD COLUMN IF NOT EXISTS doadora_nome VARCHAR(255),
      ADD COLUMN IF NOT EXISTS qualidade_embriao VARCHAR(100),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `)

    logger.info('Tabela transferencias_embrioes ajustada com sucesso')

    res.status(200).json({
      success: true,
      message: 'Tabela transferencias_embrioes ajustada com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao ajustar tabela transferencias_embrioes:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao ajustar tabela',
      error: error.message
    })
  }
}