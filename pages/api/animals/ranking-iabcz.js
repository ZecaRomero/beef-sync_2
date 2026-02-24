import { query } from '../../../lib/database';

/**
 * Retorna o ranking dos animais por iABCZ (maior = melhor).
 * Ordena por abczg numérico DESC, limit 10.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Ordenar por abczg como número (maior primeiro), NULLS LAST
    const result = await query(
      `SELECT id, serie, rg, nome, abczg, deca, raca, sexo, situacao
       FROM animais
       WHERE situacao = 'Ativo' AND abczg IS NOT NULL AND TRIM(abczg) != ''
       ORDER BY 
         CASE 
           WHEN abczg ~ '^[0-9]+[.,]?[0-9]*$' 
           THEN (REPLACE(REPLACE(TRIM(abczg), ',', '.'), ' ', '')::numeric)
           ELSE NULL
         END DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );

    const rows = result.rows || [];
    const ranking = rows.map((r, i) => ({
      posicao: i + 1,
      id: r.id,
      serie: r.serie,
      rg: r.rg,
      identificacao: `${r.serie || ''}-${r.rg || ''}`.replace(/^-|-$/g, ''),
      nome: r.nome,
      abczg: r.abczg,
      deca: r.deca,
      raca: r.raca,
      sexo: r.sexo,
    }));

    return res.status(200).json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    console.error('Erro ao buscar ranking iABCZ:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar ranking',
      details: String(error?.message || error),
    });
  }
}
