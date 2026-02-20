const NFService = require('@/lib/NFService')

// GET /api/nf/[id] - Buscar NF por ID
// PUT /api/nf/[id] - Atualizar NF por ID
// DELETE /api/nf/[id] - Deletar NF por ID
async function handler(req, res) {
  const { method, query } = req
  const { id } = query
  
  if (!id) {
    return res.status(400).json({ error: 'ID da NF é obrigatório' })
  }
  
  try {
    switch (method) {
      case 'GET':
        // Buscar NF por ID
        const nf = await NFService.getNotaFiscalById(id)
        if (!nf) {
          return res.status(404).json({ error: 'NF não encontrada' })
        }
        res.status(200).json(nf)
        break
        
      case 'PUT':
        // Atualizar NF
        const nfAtualizada = await NFService.updateNotaFiscal(id, req.body)
        res.status(200).json(nfAtualizada)
        break
        
      case 'DELETE':
        // Deletar NF
        await NFService.deleteNotaFiscal(id)
        res.status(200).json({ message: 'NF excluída com sucesso' })
        break
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('Erro na API de NF:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
module.exports = handler