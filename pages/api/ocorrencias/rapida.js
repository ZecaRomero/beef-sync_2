import databaseService from '../../../services/databaseService'
import logger from '../../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler 
} from '../../../utils/apiResponse'

export default asyncHandler(async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST'])
  }

  const {
    animalId,
    tipo,
    data,
    peso,
    local,
    ce, // Circunferência Escrotal (apenas machos)
    dg, // Diagnóstico de Gestação
    causaMorte, // Para mortes
    medicamento,
    dosagem,
    veterinario,
    proximaAplicacao,
    resultadoExame,
    observacoes
  } = req.body

  // Validações básicas
  if (!animalId || !tipo || !data) {
    return sendValidationError(res, 'Dados obrigatórios não fornecidos', {
      required: ['animalId', 'tipo', 'data'],
      provided: { animalId: !!animalId, tipo: !!tipo, data: !!data }
    })
  }

  try {
    // Buscar dados do animal
    const animal = await databaseService.buscarAnimalPorId(animalId)
    if (!animal) {
      return sendError(res, 'Animal não encontrado', 404)
    }

    // Preparar dados da ocorrência
    const ocorrenciaData = {
      animal_id: animalId,
      tipo: tipo,
      data: data,
      descricao: '',
      observacoes: observacoes || '',
      peso: peso || null,
      local: local || null,
      medicamento: medicamento || null,
      dosagem: dosagem || null,
      veterinario: veterinario || null,
      proxima_aplicacao: proximaAplicacao || null,
      responsavel: 'Sistema',
      created_at: new Date().toISOString()
    }

    // Adicionar campos específicos por tipo
    let descricao = ''
    
    switch (tipo) {
      case 'Pesagem':
        descricao = `Pesagem: ${peso} kg`
        ocorrenciaData.peso = peso
        break
        
      case 'Local':
        descricao = `Mudança de local: ${local}`
        ocorrenciaData.local = local
        // Atualizar localização do animal se necessário
        if (local) {
          try {
            // Primeiro tentar atualizar se existe
            const updateResult = await databaseService.query(`
              UPDATE localizacoes_animais 
              SET piquete = $1, data_entrada = $2, updated_at = NOW()
              WHERE animal_id = $3
            `, [local, data, animalId])
            
            // Se não atualizou nenhuma linha, inserir novo registro
            if (updateResult.rowCount === 0) {
              await databaseService.query(`
                INSERT INTO localizacoes_animais (animal_id, piquete, data_entrada, created_at)
                VALUES ($1, $2, $3, NOW())
              `, [animalId, local, data])
            }
          } catch (locError) {
            logger.warn('Erro ao atualizar localização:', locError.message)
            // Tentar inserir mesmo se der erro (pode ser que a constraint não exista ainda)
            try {
              await databaseService.query(`
                INSERT INTO localizacoes_animais (animal_id, piquete, data_entrada, created_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (animal_id) DO UPDATE SET
                  piquete = EXCLUDED.piquete,
                  data_entrada = EXCLUDED.data_entrada,
                  updated_at = NOW()
              `, [animalId, local, data])
            } catch (insertError) {
              logger.error('Erro ao inserir localização:', insertError.message)
            }
          }
        }
        break
        
      case 'CE':
        if (animal.sexo !== 'Macho') {
          return sendError(res, 'C.E só pode ser registrado para machos', 400)
        }
        descricao = `CE: ${ce} cm`
        ocorrenciaData.observacoes = `Circunferência Escrotal: ${ce} cm${observacoes ? '. ' + observacoes : ''}`
        break
        
      case 'DG':
        if (animal.sexo !== 'Fêmea') {
          return sendError(res, 'DG (Diagnóstico de Gestação) só pode ser registrado para fêmeas', 400)
        }
        descricao = `Diagnóstico de Gestação: ${dg}`
        ocorrenciaData.observacoes = `Diagnóstico de Gestação: ${dg}${observacoes ? '. ' + observacoes : ''}`
        break
        
      case 'Vacinação':
        descricao = `Vacinação: ${medicamento}`
        ocorrenciaData.medicamento = medicamento
        ocorrenciaData.dosagem = dosagem
        ocorrenciaData.veterinario = veterinario
        ocorrenciaData.proxima_aplicacao = proximaAplicacao
        break
        
      case 'Tratamento':
      case 'Medicamento':
        descricao = `${tipo}: ${medicamento}`
        ocorrenciaData.medicamento = medicamento
        ocorrenciaData.dosagem = dosagem
        ocorrenciaData.veterinario = veterinario
        break
        
      case 'Exame':
        descricao = `Exame${resultadoExame ? `: ${resultadoExame}` : ''}`
        ocorrenciaData.observacoes = `Resultado: ${resultadoExame || 'Pendente'}${observacoes ? '. ' + observacoes : ''}`
        ocorrenciaData.veterinario = veterinario
        break
        
      case 'Cirurgia':
        descricao = `Cirurgia${veterinario ? ` - ${veterinario}` : ''}`
        ocorrenciaData.veterinario = veterinario
        break
        
      case 'Observação':
        descricao = 'Observação'
        ocorrenciaData.veterinario = veterinario
        break
        
      case 'Morte':
        if (!causaMorte) {
          return sendValidationError(res, 'Causa da morte é obrigatória', {
            required: ['causaMorte']
          })
        }
        descricao = `Morte: ${causaMorte}`
        ocorrenciaData.observacoes = `Causa: ${causaMorte}${observacoes ? '. ' + observacoes : ''}`
        
        // Registrar morte na tabela de mortes
        try {
          await databaseService.registrarMorte({
            animal_id: animalId,
            data_morte: data,
            causa_morte: causaMorte,
            observacoes: observacoes || '',
            valor_perda: animal.custo_total || 0,
            created_at: new Date().toISOString()
          })
          
          // Atualizar situação do animal
          await databaseService.atualizarSituacaoAnimal(animalId, 'Morto')
          
          // Registrar no boletim contábil
          try {
            const periodo = new Date(data).toISOString().slice(0, 7)
            await databaseService.registrarMovimentacao({
              periodo: periodo,
              tipo: 'saida',
              subtipo: 'morte',
              dataMovimento: data,
              animalId: animalId,
              valor: animal.custo_total || 0,
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
          } catch (boletimError) {
            logger.warn('Erro ao registrar no boletim contábil:', boletimError.message)
          }
        } catch (morteError) {
          logger.error('Erro ao registrar morte:', morteError)
          // Continuar mesmo se falhar
        }
        break
        
      default:
        descricao = tipo
    }

    ocorrenciaData.descricao = descricao

    // Inserir ocorrência na tabela historia_ocorrencias
    const result = await databaseService.query(`
      INSERT INTO historia_ocorrencias (
        animal_id, tipo, data, descricao, observacoes, peso, local, 
        medicamento, dosagem, veterinario, proxima_aplicacao, responsavel, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      ocorrenciaData.animal_id,
      ocorrenciaData.tipo,
      ocorrenciaData.data,
      ocorrenciaData.descricao,
      ocorrenciaData.observacoes,
      ocorrenciaData.peso,
      ocorrenciaData.local,
      ocorrenciaData.medicamento,
      ocorrenciaData.dosagem,
      ocorrenciaData.veterinario,
      ocorrenciaData.proxima_aplicacao,
      ocorrenciaData.responsavel,
      ocorrenciaData.created_at
    ])

    const ocorrencia = result.rows[0]

    // Se for DG, atualizar animal com data_dg, resultado_dg e veterinario_dg
    if (tipo === 'DG' && dg) {
      try {
        const resultadoNormalizado = (() => {
          const v = String(dg).trim().toLowerCase()
          if (v.includes('posit') || v === 'prenha') return 'Prenha'
          if (v.includes('negativ') || v.includes('vazia') || v.includes('nao') || v === 'não') return 'Vazia'
          return dg
        })()
        await databaseService.query(`
          UPDATE animais 
          SET data_dg = $1, resultado_dg = $2, veterinario_dg = COALESCE($3, veterinario_dg), updated_at = NOW()
          WHERE id = $4
        `, [data, resultadoNormalizado, veterinario || null, animalId])
        logger.info(`Animal ${animal.serie}-${animal.rg} atualizado com DG: ${resultadoNormalizado} em ${data}`)
      } catch (dgError) {
        logger.warn('Erro ao atualizar DG no animal:', dgError.message)
      }
    }

    // Se for pesagem, atualizar peso do animal
    if (tipo === 'Pesagem' && peso) {
      try {
        await databaseService.query(`
          UPDATE animais 
          SET peso = $1, updated_at = NOW()
          WHERE id = $2
        `, [peso, animalId])
      } catch (pesoError) {
        logger.warn('Erro ao atualizar peso do animal:', pesoError.message)
      }
    }

    logger.info(`Ocorrência ${tipo} registrada para animal ${animal.serie}-${animal.rg}`)

    return sendSuccess(res, {
      ocorrencia,
      animal: {
        id: animal.id,
        serie: animal.serie,
        rg: animal.rg
      }
    }, 'Ocorrência registrada com sucesso')

  } catch (error) {
    logger.error('Erro ao registrar ocorrência:', error)
    return sendError(res, `Erro ao registrar ocorrência: ${error.message}`, 500)
  }
})

