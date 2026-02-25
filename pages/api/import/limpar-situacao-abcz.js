import { query } from '../../../lib/database';

/**
 * Limpa (zera) todas as situações ABCZ dos animais.
 * Útil antes de reimportar dados do Excel.
 * POST /api/import/limpar-situacao-abcz
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const result = await query(`
      UPDATE animais 
      SET situacao_abcz = NULL, updated_at = CURRENT_TIMESTAMP
    `);

    const total = result?.rowCount ?? 0;

    return res.status(200).json({
      success: true,
      message: `${total} animais tiveram Situação ABCZ limpa. Agora você pode importar novamente.`,
      total,
    });
  } catch (error) {
    console.error('❌ Erro ao limpar Situação ABCZ:', error);
    return res.status(500).json({
      error: 'Erro ao limpar Situação ABCZ',
      details: String(error?.message || error),
    });
  }
}
