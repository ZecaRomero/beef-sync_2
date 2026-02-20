import databaseService from '../../services/databaseService'
import logger from '../../utils/logger'
import boletimContabilService from '../../services/boletimContabilService'
import { withLoteTracking, LOTE_CONFIGS } from '../../utils/loteMiddleware'
import { asyncHandler } from '../../utils/apiResponse'

async function deathsHandler(req, res) {
  try {
    if (req.method === 'GET') {
      const { startDate, endDate, causa, animalId } = req.query
      const filtros = {}
      
      if (startDate) filtros.startDate = startDate
      if (endDate) filtros.endDate = endDate
      if (causa) filtros.causa = causa
      if (animalId) filtros.animalId = animalId
      
      const mortes = await databaseService.buscarMortes(filtros)
      
      res.status(200).json({
        status: 'success',
        data: mortes,
        count: mortes.length,
        timestamp: new Date().toISOString()
      })
      
    } else if (req.method === 'POST') {
      const {
        animalId,
        dataMorte,
        causaMorte,
        observacoes,
        valorPerda
      } = req.body
      
      // Validar dados obrigatórios
      if (!animalId || !dataMorte || !causaMorte) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos',
          required: ['animalId', 'dataMorte', 'causaMorte']
        })
      }
      
      // Buscar dados do animal
      const animal = await databaseService.buscarAnimalPorId(animalId)
      if (!animal) {
        return res.status(404).json({
          status: 'error',
          message: 'Animal não encontrado'
        })
      }
      
      // Registrar morte no banco
      const morteData = {
        animal_id: animalId,
        data_morte: dataMorte,
        causa_morte: causaMorte,
        observacoes: observacoes || '',
        valor_perda: valorPerda || animal.custo_total || 0,
        created_at: new Date().toISOString()
      }
      
      const morteRegistrada = await databaseService.registrarMorte(morteData)
      
      // Atualizar situação do animal para "Morto"
      await databaseService.atualizarSituacaoAnimal(animalId, 'Morto')
      
      // Registrar no boletim contábil via PostgreSQL
      try {
        const periodo = new Date(dataMorte).toISOString().slice(0, 7) // YYYY-MM
        const valorPerdaCalculado = valorPerda || animal.custo_total || 0
        
        await databaseService.registrarMovimentacao({
          periodo: periodo,
          tipo: 'saida',
          subtipo: 'morte',
          dataMovimento: dataMorte,
          animalId: animalId,
          valor: valorPerdaCalculado,
          descricao: `Morte do animal ${animal.serie} ${animal.rg}`,
          observacoes: observacoes || '',
          dadosExtras: {
            causa: causaMorte,
            serie: animal.serie,
            rg: animal.rg,
            sexo: animal.sexo,
            raca: animal.raca,
            peso: animal.peso
          }
        })
        
        logger.info('Morte registrada no boletim contábil PostgreSQL')
      } catch (boletimError) {
        logger.warn('Erro ao registrar no boletim contábil:', boletimError.message)
        // Não falha a operação se o boletim falhar
      }
      
      res.status(201).json({
        status: 'success',
        data: morteRegistrada,
        message: 'Morte registrada com sucesso',
        timestamp: new Date().toISOString()
      })
      
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({
        status: 'error',
        message: `Método ${req.method} não permitido`
      })
    }
    
  } catch (error) {
    logger.error('Erro na API de mortes:', error)
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    })
  }
}

// Determinar configuração de lote baseado no método
function getDeathLoteConfig(req) {
  switch (req.method) {
    case 'POST':
      return LOTE_CONFIGS.REGISTRO_MORTE
    default:
      return null
  }
}

export default asyncHandler(withLoteTracking(deathsHandler, getDeathLoteConfig))
