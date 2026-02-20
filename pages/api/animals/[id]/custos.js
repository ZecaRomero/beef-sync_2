const databaseService = require('../../../../services/databaseService')

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      status: 'error',
      message: 'ID do animal é obrigatório'
    })
  }

  try {
    if (req.method === 'GET') {
      const custos = await databaseService.buscarCustosAnimal(id)
      
      res.status(200).json({
        status: 'success',
        data: custos,
        count: custos.length,
        timestamp: new Date().toISOString()
      })
    } else if (req.method === 'POST') {
      const custoSalvo = await databaseService.adicionarCusto(id, req.body)
      
      res.status(201).json({
        status: 'success',
        message: 'Custo adicionado com sucesso',
        data: custoSalvo,
        timestamp: new Date().toISOString()
      })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({
        status: 'error',
        message: `Método ${req.method} não permitido`,
        allowed: ['GET', 'POST']
      })
    }
  } catch (error) {
    console.error('Erro na API de custos:', error)
    
    let statusCode = 500
    let message = 'Erro interno do servidor'
    
    if (error.code === '23503') { // Violação de foreign key
      statusCode = 404
      message = 'Animal não encontrado'
    } else if (error.code === '23502') { // Violação de NOT NULL
      statusCode = 400
      message = 'Dados obrigatórios não fornecidos'
    }
    
    res.status(statusCode).json({
      status: 'error',
      message,
      error: {
        code: error.code,
        detail: error.detail,
        hint: error.hint
      },
      timestamp: new Date().toISOString()
    })
  }
}

