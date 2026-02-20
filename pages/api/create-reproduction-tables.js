import { query } from '../../lib/database'
import logger from '../../utils/logger'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Criar tabela calendario_reprodutivo
    await query(`
      CREATE TABLE IF NOT EXISTS calendario_reprodutivo (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        animal_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
        data_evento DATE NOT NULL,
        tipo_evento VARCHAR(100),
        descricao TEXT,
        status VARCHAR(50) DEFAULT 'Agendado',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela genealogia
    await query(`
      CREATE TABLE IF NOT EXISTS genealogia (
        id SERIAL PRIMARY KEY,
        animal_id INTEGER REFERENCES animais(id) ON DELETE CASCADE,
        pai_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
        mae_id INTEGER REFERENCES animais(id) ON DELETE SET NULL,
        data_nascimento DATE,
        registro VARCHAR(100),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(animal_id)
      )
    `)

    // Criar índices para melhor performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_calendario_data_evento ON calendario_reprodutivo(data_evento);
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_calendario_animal_id ON calendario_reprodutivo(animal_id);
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_genealogia_animal_id ON genealogia(animal_id);
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_genealogia_pai_id ON genealogia(pai_id);
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_genealogia_mae_id ON genealogia(mae_id);
    `)

    logger.info('Tabelas de reprodução criadas com sucesso')

    res.status(200).json({
      success: true,
      message: 'Tabelas de reprodução criadas com sucesso',
      tables: ['calendario_reprodutivo', 'genealogia']
    })

  } catch (error) {
    logger.error('Erro ao criar tabelas de reprodução:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao criar tabelas de reprodução',
      error: error.message
    })
  }
}