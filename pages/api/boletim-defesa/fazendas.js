import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { nome, cnpj } = req.body

      if (!nome || !cnpj) {
        return res.status(400).json({
          success: false,
          message: 'Nome e CNPJ são obrigatórios'
        })
      }

      // Verificar se já existe
      const existente = await query(
        'SELECT id FROM boletim_defesa_fazendas WHERE cnpj = $1',
        [cnpj]
      )

      if (existente.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma fazenda cadastrada com este CNPJ'
        })
      }

      // Criar quantidades iniciais
      const quantidadesIniciais = {
        '0a3': { M: 0, F: 0 },
        '3a8': { M: 0, F: 0 },
        '8a12': { M: 0, F: 0 },
        '12a24': { M: 0, F: 0 },
        '25a36': { M: 0, F: 0 },
        'acima36': { M: 0, F: 0 }
      }

      // Inserir fazenda
      const result = await query(
        `INSERT INTO boletim_defesa_fazendas (nome, cnpj, quantidades, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, nome, cnpj, quantidades`,
        [nome, cnpj, JSON.stringify(quantidadesIniciais)]
      )

      return res.status(201).json({
        success: true,
        message: 'Fazenda cadastrada com sucesso',
        fazenda: result.rows[0]
      })
    } catch (error) {
      console.error('Erro ao cadastrar fazenda:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar fazenda',
        error: error.message
      })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      await query('DELETE FROM boletim_defesa_fazendas WHERE id = $1', [id])

      return res.status(200).json({
        success: true,
        message: 'Fazenda excluída com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir fazenda:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir fazenda',
        error: error.message
      })
    }
  }

  return res.status(405).json({ message: 'Método não permitido' })
}
