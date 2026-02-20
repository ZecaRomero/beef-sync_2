import { query } from '../../../lib/database'
import LoteTracker from '../../../utils/loteTracker'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({
          error: 'ID da nota fiscal é obrigatório para exclusão'
        })
      }

      const idStr = Array.isArray(id) ? id[0] : id
      const idInt = parseInt(idStr, 10)
      if (Number.isNaN(idInt)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      // Excluir itens relacionados primeiro (se existirem)
      await query('DELETE FROM notas_fiscais_itens WHERE nota_fiscal_id = $1', [idInt])

      const result = await query(
        'DELETE FROM notas_fiscais WHERE id = $1 RETURNING *',
        [idInt]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' })
      }

      const nfDeletada = result.rows[0]

      // Registrar operação no Sistema de Lotes
      try {
        await LoteTracker.registrarOperacao({
          tipo_operacao: 'EXCLUSAO_NF',
          descricao: `Exclusão de Nota Fiscal ${nfDeletada.numero_nf} - ${nfDeletada.tipo === 'entrada' ? 'Entrada' : 'Saída'} - ${nfDeletada.fornecedor || nfDeletada.destino || 'Sem identificação'}`,
          detalhes: {
            id: nfDeletada.id,
            numero_nf: nfDeletada.numero_nf,
            valor_total: nfDeletada.valor_total,
            tipo_produto: nfDeletada.tipo_produto,
            fornecedor: nfDeletada.fornecedor,
            destino: nfDeletada.destino
          },
          usuario: req.body.usuario || 'Sistema',
          quantidade_registros: 1,
          modulo: 'CONTABILIDADE',
          req
        })
      } catch (error) {
        console.error('Erro ao registrar lote da exclusão da NF:', error)
      }

      return res.status(200).json({
        success: true,
        message: 'Nota fiscal excluída com sucesso',
        id: result.rows[0].id
      })
    } catch (error) {
      console.error('Erro ao excluir nota fiscal:', error)
      return res.status(500).json({
        error: 'Erro ao excluir nota fiscal',
        details: error.message
      })
    }
  } else if (req.method === 'GET') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'ID da nota fiscal é obrigatório' })
      }

      const idStr = Array.isArray(id) ? id[0] : id
      const idInt = parseInt(idStr, 10)
      if (Number.isNaN(idInt)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      // Buscar NF
      const nfResult = await query('SELECT * FROM notas_fiscais WHERE id = $1', [idInt])

      if (nfResult.rows.length === 0) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' })
      }

      // Buscar itens da NF
      const itensResult = await query(
        'SELECT * FROM notas_fiscais_itens WHERE nota_fiscal_id = $1 ORDER BY id',
        [idInt]
      )

      // Converter dados_item (JSONB) para objeto
      const itens = itensResult.rows.map(row => {
        try {
          const dadosItem = typeof row.dados_item === 'string' 
            ? JSON.parse(row.dados_item) 
            : row.dados_item
          return {
            ...dadosItem,
            tipoProduto: row.tipo_produto
          }
        } catch (e) {
          return {
            tipoProduto: row.tipo_produto,
            dados_item: row.dados_item
          }
        }
      })

      return res.status(200).json({
        ...nfResult.rows[0],
        itens: itens,
        cnpjOrigemDestino: nfResult.rows[0].cnpj_origem_destino || ''
      })
    } catch (error) {
      console.error('Erro ao buscar nota fiscal:', error)
      return res.status(500).json({
        error: 'Erro ao buscar nota fiscal',
        details: error.message
      })
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' })
  }
}