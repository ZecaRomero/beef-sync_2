const NFService = require('@/lib/NFService')

// GET /api/contabilidade/nfs - Buscar NFs para envio à contabilidade
// POST /api/contabilidade/nfs - Marcar NFs como enviadas
async function handler(req, res) {
  const { method } = req
  
  try {
    switch (method) {
      case 'GET':
        // Buscar NFs para contabilidade
        const { dataInicio, dataFim } = req.query
        
        if (!dataInicio || !dataFim) {
          return res.status(400).json({ 
            error: 'Data de início e fim são obrigatórias' 
          })
        }
        
        const nfs = await NFService.getNFsParaContabilidade(dataInicio, dataFim)
        res.status(200).json(nfs)
        break
        
      case 'POST':
        // Marcar NFs como enviadas para contabilidade
        const { ids } = req.body
        
        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ 
            error: 'Lista de IDs é obrigatória' 
          })
        }
        
        const promises = ids.map(id => NFService.marcarEnviadaContabilidade(id))
        await Promise.all(promises)
        
        res.status(200).json({ 
          message: `${ids.length} NFs marcadas como enviadas para contabilidade` 
        })
        break
        
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('Erro na API de contabilidade:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

module.exports = handler
