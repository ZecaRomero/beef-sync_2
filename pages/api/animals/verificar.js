import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id, serie, rg } = req.query

  try {
    let result

    if (id) {
      const animalId = parseInt(id, 10)
      if (isNaN(animalId)) {
        // Se não é número, pode ser RG
        result = await query(
          `SELECT id, serie, rg, nome, data_nascimento, situacao 
           FROM animais 
           WHERE rg = $1`,
          [id]
        )
      } else {
        result = await query(
          `SELECT id, serie, rg, nome, data_nascimento, situacao 
           FROM animais 
           WHERE id = $1`,
          [animalId]
        )
      }
    } else if (rg) {
      // Buscar apenas por RG
      result = await query(
        `SELECT id, serie, rg, nome, data_nascimento, situacao 
         FROM animais 
         WHERE rg = $1`,
        [rg]
      )
    } else if (serie && rg) {
      result = await query(
        `SELECT id, serie, rg, nome, data_nascimento, situacao 
         FROM animais 
         WHERE serie = $1 AND rg = $2`,
        [serie, rg]
      )
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Forneça id, rg ou serie+rg' 
      })
    }

    if (result.rows.length === 0) {
      // Verificar se existe algum animal com ID próximo ou similar
      let sugestoes = []
      
      if (id) {
        const animalId = parseInt(id, 10)
        const buscaProximos = await query(
          `SELECT id, serie, rg, nome 
           FROM animais 
           WHERE id BETWEEN $1 AND $2 
           ORDER BY ABS(id - $3)
           LIMIT 5`,
          [animalId - 10, animalId + 10, animalId]
        )
        sugestoes = buscaProximos.rows
      }

      return res.status(404).json({
        success: false,
        message: 'Animal não encontrado',
        busca: id ? { id } : { serie, rg },
        sugestoes: sugestoes.length > 0 ? sugestoes : null,
        total_animais: (await query('SELECT COUNT(*) as total FROM animais')).rows[0].total
      })
    }

    const animal = result.rows[0]

    // Buscar informações adicionais
    const custos = await query(
      'SELECT COUNT(*) as total, SUM(valor) as total_valor FROM custos WHERE animal_id = $1',
      [animal.id]
    )

    const dna = await query(
      'SELECT laboratorio_dna, data_envio_dna, custo_dna FROM animais WHERE id = $1',
      [animal.id]
    )

    res.status(200).json({
      success: true,
      message: 'Animal encontrado',
      data: {
        ...animal,
        custos: {
          quantidade: parseInt(custos.rows[0].total || 0),
          total: parseFloat(custos.rows[0].total_valor || 0)
        },
        dna: dna.rows[0]?.laboratorio_dna ? {
          laboratorio: dna.rows[0].laboratorio_dna,
          data_envio: dna.rows[0].data_envio_dna,
          custo: parseFloat(dna.rows[0].custo_dna || 0)
        } : null
      }
    })
  } catch (error) {
    console.error('Erro ao verificar animal:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar animal',
      error: error.message
    })
  }
}
