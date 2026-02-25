/**
 * API para Live Reload no desenvolvimento
 * Retorna o timestamp da última mudança - cliente compara e recarrega se mudou
 * Só funciona em NODE_ENV=development
 */
const fs = require('fs')
const path = require('path')

export default function handler(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not available' })
  }

  try {
    const filePath = path.join(process.cwd(), '.next', 'dev-reload-timestamp.json')
    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ timestamp: 0 })
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.status(200).json({ timestamp: data.timestamp || 0 })
  } catch (e) {
    res.status(200).json({ timestamp: 0 })
  }
}
