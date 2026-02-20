import { query } from '../../../lib/database'
import logger from '../../../utils/logger'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    await query(`
      ALTER TABLE transferencias_embrioes 
      ADD COLUMN IF NOT EXISTS central VARCHAR(255),
      ADD COLUMN IF NOT EXISTS touro VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sexo_prenhez VARCHAR(50)
    `)

    logger.info('Colunas adicionadas à tabela transferencias_embrioes')

    res.status(200).json({
      success: true,
      message: 'Colunas adicionadas com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao adicionar colunas:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar colunas',
      error: error.message
    })
  }
}
