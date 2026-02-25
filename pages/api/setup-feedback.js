import { query } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar se a tabela já existe
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'feedbacks'
      );
    `)

    const tableExists = checkTable.rows[0].exists

    if (tableExists) {
      const count = await query('SELECT COUNT(*) as total FROM feedbacks')
      return res.status(200).json({ 
        success: true, 
        message: 'Tabela de feedbacks já existe!',
        total_feedbacks: count.rows[0].total
      })
    }

    // Criar tabela de feedbacks
    await query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        sugestao TEXT,
        audio_path VARCHAR(500),
        transcricao TEXT,
        status VARCHAR(50) DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Criar índices
    await query(`
      CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
    `)

    return res.status(200).json({ 
      success: true, 
      message: 'Tabela de feedbacks criada com sucesso!' 
    })
  } catch (error) {
    console.error('Erro ao criar tabela:', error)
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Verifique se o PostgreSQL está rodando e as credenciais estão corretas'
    })
  }
}
