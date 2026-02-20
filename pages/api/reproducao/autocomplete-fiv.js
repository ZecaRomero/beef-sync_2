import { query } from '../../../lib/database'
import { sendSuccess, sendError, asyncHandler } from '../../../utils/apiResponse'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const [labs, vets] = await Promise.all([
      query(`SELECT DISTINCT laboratorio FROM coleta_fiv WHERE laboratorio IS NOT NULL AND laboratorio != '' ORDER BY laboratorio`),
      query(`SELECT DISTINCT veterinario FROM coleta_fiv WHERE veterinario IS NOT NULL AND veterinario != '' ORDER BY veterinario`)
    ])

    return sendSuccess(res, {
      laboratorios: labs.rows.map(r => r.laboratorio),
      veterinarios: vets.rows.map(r => r.veterinario)
    })

  } catch (error) {
    console.error('Autocomplete error:', error)
    return sendError(res, 'Erro ao buscar sugestões')
  }
}

export default asyncHandler(handler)