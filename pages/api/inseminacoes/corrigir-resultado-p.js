/**
 * API para corrigir registros de inseminação com resultado "P" para "Prenha"
 * Atualiza status_gestacao e resultado_dg onde o valor é "P" (abreviação de Prenha)
 */

import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Atualizar status_gestacao onde for 'P' ou 'p'
    const r1 = await query(
      `UPDATE inseminacoes SET status_gestacao = 'Prenha' 
       WHERE TRIM(COALESCE(status_gestacao, '')) IN ('P', 'p') 
       RETURNING id`
    )

    // Atualizar resultado_dg onde for 'P' ou 'p'
    const r2 = await query(
      `UPDATE inseminacoes SET resultado_dg = 'Prenha' 
       WHERE TRIM(COALESCE(resultado_dg, '')) IN ('P', 'p') 
       RETURNING id`
    )

    const atualizadosStatus = r1?.rowCount ?? r1?.rows?.length ?? 0
    const atualizadosResultado = r2?.rowCount ?? r2?.rows?.length ?? 0

    return res.status(200).json({
      success: true,
      message: 'Correção aplicada',
      atualizados: {
        status_gestacao: atualizadosStatus,
        resultado_dg: atualizadosResultado
      }
    })
  } catch (error) {
    console.error('Erro ao corrigir resultados:', error)
    return res.status(500).json({
      error: 'Erro ao corrigir registros',
      details: error.message
    })
  }
}
