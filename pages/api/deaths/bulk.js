import databaseService from '../../../services/databaseService'
import { logger } from '../../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler 
} from '../../../utils/apiResponse'

export default asyncHandler(async (req, res) => {
  const { method } = req

  if (method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST'])
  }

  try {
    const { deaths } = req.body

    if (!Array.isArray(deaths) || deaths.length === 0) {
      return sendValidationError(res, 'Lista de óbitos é obrigatória e deve conter pelo menos um registro')
    }

    const createdDeaths = []
    const errors = []

    for (const deathData of deaths) {
      try {
        // 1. Resolver Animal ID se não fornecido
        let animalId = deathData.animalId
        let animal = null

        if (!animalId && (deathData.serie || deathData.rg)) {
          const filtros = {}
          if (deathData.serie) filtros.serie = deathData.serie
          if (deathData.rg) filtros.rg = deathData.rg
          
          const animaisEncontrados = await databaseService.buscarAnimais(filtros)
          
          if (animaisEncontrados.length === 1) {
            animal = animaisEncontrados[0]
            animalId = animal.id
          } else if (animaisEncontrados.length > 1) {
             // Tentar refinar
             const exato = animaisEncontrados.find(a => 
                (deathData.serie ? a.serie?.toUpperCase() === deathData.serie.toUpperCase() : true) &&
                (deathData.rg ? a.rg?.toString() === deathData.rg.toString() : true)
             )
             if (exato) {
                 animal = exato
                 animalId = animal.id
             } else {
                 throw new Error(`Múltiplos animais encontrados para Série: ${deathData.serie}, RG: ${deathData.rg}`)
             }
          } else {
            throw new Error(`Animal não encontrado para Série: ${deathData.serie}, RG: ${deathData.rg}`)
          }
        } else if (animalId) {
            animal = await databaseService.buscarAnimalPorId(animalId)
            if (!animal) {
                throw new Error(`Animal com ID ${animalId} não encontrado`)
            }
        } else {
            throw new Error('Identificação do animal (ID ou Série/RG) é obrigatória')
        }

        // 2. Validar dados obrigatórios
        if (!deathData.dataMorte || !deathData.causaMorte) {
            throw new Error('Data da morte e Causa da morte são obrigatórios')
        }

        // 3. Verificar se já existe morte para este animal
        const mortesExistentes = await databaseService.buscarMortes({ animalId: parseInt(animalId) })
        if (mortesExistentes.length > 0) {
            throw new Error(`Animal ${animal.serie} ${animal.rg} já possui registro de óbito`)
        }

        // 4. Preparar dados
        const valorPerdaCalculado = deathData.valorPerda ? parseFloat(deathData.valorPerda) : (animal.custo_total || 0)
        
        const morteToCreate = {
            animal_id: parseInt(animalId),
            data_morte: deathData.dataMorte,
            causa_morte: deathData.causaMorte,
            observacoes: deathData.observacoes || null,
            valor_perda: valorPerdaCalculado,
            created_at: new Date()
        }

        // 5. Criar registro
        const novaMorte = await databaseService.registrarMorte(morteToCreate)

        // 6. Atualizar status do animal
        await databaseService.atualizarSituacaoAnimal(parseInt(animalId), 'Morto')
        
        // 7. Sincronizar com historia_ocorrencias (Requisito explícito do usuário)
        try {
            await databaseService.query(`
                INSERT INTO historia_ocorrencias (
                  animal_id, tipo, data, descricao, observacoes, valor
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                parseInt(animalId),
                'morte',
                deathData.dataMorte,
                `Morte: ${deathData.causaMorte}`,
                deathData.observacoes || null,
                valorPerdaCalculado
            ])
            
        } catch (historiaError) {
            logger.warn('Erro ao sincronizar morte com historia_ocorrencias:', historiaError)
        }

        // 8. Sincronizar com Boletim Contábil (Para consistência com API existente)
        try {
          const periodo = new Date(deathData.dataMorte).toISOString().slice(0, 7) // YYYY-MM
          
          await databaseService.registrarMovimentacao({
            periodo: periodo,
            tipo: 'saida',
            subtipo: 'morte',
            dataMovimento: deathData.dataMorte,
            animalId: parseInt(animalId),
            valor: valorPerdaCalculado,
            descricao: `Morte do animal ${animal.serie} ${animal.rg}`,
            observacoes: deathData.observacoes || '',
            dadosExtras: {
              causa: deathData.causaMorte,
              serie: animal.serie,
              rg: animal.rg,
              sexo: animal.sexo,
              raca: animal.raca,
              peso: animal.peso
            }
          })
          
          logger.info(`Morte do animal ${animal.serie} ${animal.rg} registrada no boletim contábil`)
        } catch (boletimError) {
          logger.warn('Erro ao registrar no boletim contábil:', boletimError.message)
        }

        createdDeaths.push({
            ...novaMorte,
            animal_serie: animal.serie,
            animal_rg: animal.rg
        })

      } catch (error) {
        errors.push({
          data: deathData,
          error: error.message
        })
      }
    }

    return sendSuccess(res, {
      created: createdDeaths,
      errors: errors,
      summary: {
        total: deaths.length,
        successful: createdDeaths.length,
        failed: errors.length
      }
    }, `Processamento concluído: ${createdDeaths.length} óbitos registrados`)

  } catch (error) {
    logger.error('Erro na criação em lote de óbitos:', error)
    return sendError(res, 'Erro interno do servidor ao registrar óbitos em lote')
  }
})
