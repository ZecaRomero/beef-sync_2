import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Buscar todas as fazendas
      const fazendas = await query(`
        SELECT 
          id,
          nome,
          cnpj,
          quantidades,
          created_at,
          updated_at
        FROM boletim_defesa_fazendas
        ORDER BY nome
      `)

      return res.status(200).json({
        success: true,
        fazendas: fazendas.rows.map(f => ({
          id: f.id,
          nome: f.nome,
          cnpj: f.cnpj,
          quantidades: f.quantidades || {
            '0a3': { M: 0, F: 0 },
            '3a8': { M: 0, F: 0 },
            '8a12': { M: 0, F: 0 },
            '12a24': { M: 0, F: 0 },
            '25a36': { M: 0, F: 0 },
            'acima36': { M: 0, F: 0 }
          },
          createdAt: f.created_at,
          updatedAt: f.updated_at
        }))
      })
    } catch (error) {
      console.error('Erro ao buscar fazendas:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar fazendas',
        error: error.message
      })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { fazendaId, faixa, sexo, valor } = req.body

      // Buscar fazenda atual
      const fazendaResult = await query(
        'SELECT quantidades FROM boletim_defesa_fazendas WHERE id = $1',
        [fazendaId]
      )

      if (fazendaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Fazenda não encontrada'
        })
      }

      const quantidades = fazendaResult.rows[0].quantidades || {}
      
      // Atualizar quantidade
      if (!quantidades[faixa]) {
        quantidades[faixa] = { M: 0, F: 0 }
      }
      quantidades[faixa][sexo] = parseInt(valor) || 0

      // Salvar no banco
      await query(
        `UPDATE boletim_defesa_fazendas 
         SET quantidades = $1, updated_at = NOW() 
         WHERE id = $2`,
        [JSON.stringify(quantidades), fazendaId]
      )

      return res.status(200).json({
        success: true,
        message: 'Quantidade atualizada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar quantidade',
        error: error.message
      })
    }
  }

  return res.status(405).json({ message: 'Método não permitido' })
}
