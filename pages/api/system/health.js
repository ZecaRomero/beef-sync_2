const { query } = require('../../../lib/database')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const startTime = Date.now()
    
    // Testar conexão com banco
    const dbTest = await query('SELECT NOW() as timestamp, version()')
    const responseTime = Date.now() - startTime
    
    // Informações do sistema
    const systemInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      database: {
        connected: true,
        version: dbTest.rows[0].version.split(' ')[0] + ' ' + dbTest.rows[0].version.split(' ')[1],
        timestamp: dbTest.rows[0].timestamp
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }

    res.status(200).json(systemInfo)
  } catch (error) {
    console.error('Health check failed:', error)
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    })
  }
}