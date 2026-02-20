import databaseService from '../../../services/databaseService'
import logger from '../../../utils/logger'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Criar tabela se não existir
    await databaseService.query(`
      CREATE TABLE IF NOT EXISTS piquetes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(50) NOT NULL UNIQUE,
        area DECIMAL(10,2),
        capacidade INTEGER,
        tipo VARCHAR(50),
        observacoes TEXT,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar índices
    await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_piquetes_nome ON piquetes(nome)`)
    await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_piquetes_ativo ON piquetes(ativo)`)

    // Verificar se já existem piquetes
    const existentes = await databaseService.query(`SELECT COUNT(*) as count FROM piquetes`)
    const count = parseInt(existentes.rows[0].count)

    // Se não houver piquetes, criar alguns de exemplo
    if (count === 0) {
      const piquetesExemplo = [
        { nome: 'Piquete 1', capacidade: 50 },
        { nome: 'Piquete 2', capacidade: 50 },
        { nome: 'Piquete 3', capacidade: 50 },
        { nome: 'Piquete 4', capacidade: 50 },
        { nome: 'Piquete 5', capacidade: 50 },
        { nome: 'PJ 33/4', capacidade: 30 }
      ]

      for (const piquete of piquetesExemplo) {
        try {
          await databaseService.query(`
            INSERT INTO piquetes (nome, capacidade, ativo)
            VALUES ($1, $2, true)
            ON CONFLICT (nome) DO NOTHING
          `, [piquete.nome, piquete.capacidade])
        } catch (error) {
          logger.warn(`Erro ao inserir piquete ${piquete.nome}:`, error.message)
        }
      }

      logger.info(`${piquetesExemplo.length} piquetes de exemplo criados`)
    }

    // Buscar todos os piquetes ativos
    const result = await databaseService.query(`
      SELECT * FROM piquetes WHERE ativo = true ORDER BY nome
    `)

    return res.status(200).json({
      status: 'success',
      data: {
        piquetes: result.rows,
        count: result.rows.length,
        inicializados: count === 0
      },
      message: 'Piquetes inicializados com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao inicializar piquetes:', error)
    return res.status(200).json({
      status: 'success',
      data: {
        piquetes: [],
        count: 0,
        inicializados: false
      },
      message: 'Nenhum piquete encontrado',
      warning: error.message
    })
  }
}

