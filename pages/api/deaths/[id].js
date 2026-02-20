import databaseService from '../../../services/databaseService'
import logger from '../../../utils/logger'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      status: 'error',
      message: 'ID da morte é obrigatório'
    })
  }

  try {
    if (req.method === 'GET') {
      // Buscar morte específica
      const morte = await databaseService.buscarMortePorId(parseInt(id))
      
      if (!morte) {
        return res.status(404).json({
          status: 'error',
          message: 'Registro de morte não encontrado'
        })
      }
      
      res.status(200).json({
        status: 'success',
        data: morte,
        timestamp: new Date().toISOString()
      })
      
    } else if (req.method === 'PUT') {
      // Atualizar registro de morte
      const {
        dataMorte,
        causaMorte,
        observacoes,
        valorPerda
      } = req.body
      
      // Validar dados obrigatórios
      if (!dataMorte || !causaMorte) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos',
          required: ['dataMorte', 'causaMorte']
        })
      }
      
      // Verificar se a morte existe
      const morteExistente = await databaseService.buscarMortePorId(parseInt(id))
      if (!morteExistente) {
        return res.status(404).json({
          status: 'error',
          message: 'Registro de morte não encontrado'
        })
      }
      
      // Atualizar dados
      const dadosAtualizacao = {
        data_morte: dataMorte,
        causa_morte: causaMorte,
        observacoes: observacoes || '',
        valor_perda: valorPerda ? parseFloat(valorPerda) : morteExistente.valor_perda,
        updated_at: new Date().toISOString()
      }
      
      const morteAtualizada = await databaseService.atualizarMorte(parseInt(id), dadosAtualizacao)
      
      logger.info(`Morte ${id} atualizada com sucesso`)
      
      res.status(200).json({
        status: 'success',
        data: morteAtualizada,
        message: 'Registro de morte atualizado com sucesso',
        timestamp: new Date().toISOString()
      })
      
    } else if (req.method === 'DELETE') {
      // Excluir registro de morte
      
      // Verificar se a morte existe
      const morteExistente = await databaseService.buscarMortePorId(parseInt(id))
      if (!morteExistente) {
        return res.status(404).json({
          status: 'error',
          message: 'Registro de morte não encontrado'
        })
      }
      
      // Restaurar situação do animal para "Ativo"
      if (morteExistente.animal_id) {
        await databaseService.atualizarSituacaoAnimal(morteExistente.animal_id, 'Ativo')
        logger.info(`Animal ${morteExistente.animal_id} restaurado para situação Ativo`)
      }
      
      // Excluir registro de morte
      await databaseService.excluirMorte(parseInt(id))
      
      logger.info(`Morte ${id} excluída com sucesso`)
      
      res.status(200).json({
        status: 'success',
        message: 'Registro de morte excluído com sucesso',
        data: {
          id: parseInt(id),
          animalRestaurado: morteExistente.animal_id
        },
        timestamp: new Date().toISOString()
      })
      
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).json({
        status: 'error',
        message: `Método ${req.method} não permitido`
      })
    }
    
  } catch (error) {
    logger.error(`Erro na API de morte ${id}:`, error)
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    })
  }
}