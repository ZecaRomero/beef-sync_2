import { query } from '../../lib/database'

export default async function handler(req, res) {
  try {
    // Buscar configuração salva
    const result = await query(
      'SELECT key, value FROM system_settings WHERE key = $1',
      ['mobile_reports_enabled']
    )

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Nenhuma configuração encontrada',
        enabled: [],
        raw: null
      })
    }

    const value = result.rows[0].value
    let enabled = []

    try {
      enabled = JSON.parse(value)
    } catch (e) {
      enabled = []
    }

    return res.status(200).json({
      success: true,
      enabled: enabled,
      raw: value,
      total: enabled.length
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
