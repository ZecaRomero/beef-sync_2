// API para integrar Notas Fiscais com Contabilidade
import { query } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Buscar todas as NFs de entrada e saída
      const nfEntradas = await query(`
        SELECT 
          nf.*,
          a.numero as animal_numero,
          a.nome as animal_nome,
          a.raca as animal_raca,
          a.sexo as animal_sexo,
          a.peso as animal_peso
        FROM notas_fiscais nf
        LEFT JOIN animais a ON nf.animal_id = a.id
        WHERE nf.tipo = 'entrada'
        ORDER BY nf.data_emissao DESC
      `)

      const nfSaidas = await query(`
        SELECT 
          nf.*,
          a.numero as animal_numero,
          a.nome as animal_nome,
          a.raca as animal_raca,
          a.sexo as animal_sexo,
          a.peso as animal_peso
        FROM notas_fiscais nf
        LEFT JOIN animais a ON nf.animal_id = a.id
        WHERE nf.tipo = 'saida'
        ORDER BY nf.data_emissao DESC
      `)

      // Calcular resumo fiscal
      const totalEntradas = nfEntradas.reduce((sum, nf) => sum + parseFloat(nf.valor || 0), 0)
      const totalSaidas = nfSaidas.reduce((sum, nf) => sum + parseFloat(nf.valor || 0), 0)
      const saldoFiscal = totalSaidas - totalEntradas

      const resumo = {
        totalEntradas,
        totalSaidas,
        saldoFiscal,
        qtdEntradas: nfEntradas.length,
        qtdSaidas: nfSaidas.length,
        explicacaoSaldo: saldoFiscal < 0 
          ? 'Saldo negativo indica que você teve mais despesas (entradas) que receitas (saídas) no período. Isso é normal quando você está investindo na compra de animais.'
          : 'Saldo positivo indica que você teve mais receitas (vendas) que despesas no período.'
      }

      res.status(200).json({
        success: true,
        resumo,
        nfEntradas,
        nfSaidas
      })

    } catch (error) {
      console.error('Erro ao buscar NFs para contabilidade:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ success: false, error: 'Método não permitido' })
  }
}