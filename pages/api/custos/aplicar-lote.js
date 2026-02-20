import databaseService from '../../../services/databaseService'
import { logger } from '../../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler, 
  HTTP_STATUS 
} from '../../../utils/apiResponse'
import { criarLoteManual } from '../../../utils/loteMiddleware'

async function aplicarMedicamentosLoteHandler(req, res) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST'])
  }

  try {
    const { 
      piquete, 
      animais_ids, // IDs dos animais selecionados manualmente
      medicamentos, 
      data, 
      observacoes,
      usuario = 'Sistema'
    } = req.body

    // Validações
    if ((!piquete || !piquete.trim()) && (!animais_ids || !Array.isArray(animais_ids) || animais_ids.length === 0)) {
      return sendValidationError(res, 'Piquete ou lista de animais é obrigatório', {
        required: ['piquete OU animais_ids'],
        provided: { piquete: !!piquete, animais_ids: Array.isArray(animais_ids) ? animais_ids.length : 0 }
      })
    }

    if (!medicamentos || !Array.isArray(medicamentos) || medicamentos.length === 0) {
      return sendValidationError(res, 'Pelo menos um medicamento deve ser informado', {
        required: ['medicamentos'],
        provided: { medicamentos: Array.isArray(medicamentos) ? medicamentos.length : 0 }
      })
    }

    if (!data) {
      return sendValidationError(res, 'Data da aplicação é obrigatória', {
        required: ['data'],
        provided: { data: !!data }
      })
    }

    let animaisNoPiquete = []

    // Se animais_ids foi fornecido, buscar esses animais diretamente
    if (animais_ids && Array.isArray(animais_ids) && animais_ids.length > 0) {
      const idsFiltrados = animais_ids.filter(id => id != null).map(id => parseInt(id))
      
      if (idsFiltrados.length === 0) {
        return sendValidationError(res, 'Nenhum ID de animal válido fornecido', {
          animais_ids
        })
      }

      // Buscar animais pelos IDs fornecidos
      const animaisResult = await databaseService.query(`
        SELECT 
          a.id as animal_id,
          a.serie,
          a.rg,
          a.raca,
          a.sexo
        FROM animais a
        WHERE a.id = ANY($1::int[])
          AND a.situacao = 'Ativo'
      `, [idsFiltrados])

      animaisNoPiquete = animaisResult.rows || []

      if (animaisNoPiquete.length === 0) {
        return sendError(res, 'Nenhum animal ativo encontrado com os IDs fornecidos', HTTP_STATUS.NOT_FOUND)
      }
    } 
    // Se piquete foi fornecido, buscar animais do piquete
    else if (piquete && piquete.trim()) {
      const localizacoesResult = await databaseService.query(`
        SELECT 
          l.*,
          a.serie,
          a.rg,
          a.raca,
          a.sexo
        FROM localizacoes_animais l
        JOIN animais a ON l.animal_id = a.id
        WHERE l.piquete ILIKE $1
          AND l.data_saida IS NULL
        ORDER BY l.data_entrada DESC
      `, [`%${piquete}%`])

      animaisNoPiquete = localizacoesResult.rows || []

      if (animaisNoPiquete.length === 0) {
        return sendError(res, `Nenhum animal encontrado no piquete "${piquete}"`, HTTP_STATUS.NOT_FOUND)
      }
    }

    // Validar medicamentos
    const medicamentosValidados = []
    for (const med of medicamentos) {
      if (!med.id || !med.nome) {
        return sendValidationError(res, 'Medicamento deve ter id e nome', {
          medicamento: med
        })
      }

      // Buscar informações do medicamento diretamente do banco
      try {
        let medicamentoInfo = null
        
        // Tentar buscar do banco de dados primeiro
        try {
          const medResult = await databaseService.query(`
            SELECT * FROM medicamentos 
            WHERE (id = $1 OR nome ILIKE $2)
              AND ativo = true
            LIMIT 1
          `, [med.id, `%${med.nome}%`])
          
          if (medResult.rows && medResult.rows.length > 0) {
            const medDb = medResult.rows[0]
            medicamentoInfo = {
              id: medDb.id,
              nome: medDb.nome,
              preco: parseFloat(medDb.preco) || 0,
              unidade: medDb.unidade,
              porAnimal: parseFloat(medDb.preco) || 0, // Usar preco como fallback
              tipoAplicacao: 'individual' // Padrão
            }
          }
        } catch (dbError) {
          logger.warn('Erro ao buscar medicamento do banco:', dbError)
        }

        // Se não encontrou na API, usar dados do costManager (via importação)
        if (!medicamentoInfo) {
          try {
            const costManagerModule = await import('../../../services/costManager')
            const costManager = costManagerModule.default || costManagerModule
            const medicamentosCostManager = costManager.medicamentos || {}
            
            const medKey = Object.keys(medicamentosCostManager).find(key => 
              key.toLowerCase().includes(med.nome.toLowerCase()) ||
              medicamentosCostManager[key].nome?.toLowerCase() === med.nome.toLowerCase()
            )
            
            if (medKey) {
              medicamentoInfo = {
                nome: medicamentosCostManager[medKey].nome || medKey.replace(/_/g, ' '),
                preco: medicamentosCostManager[medKey].preco,
                unidade: medicamentosCostManager[medKey].unidade,
                porAnimal: medicamentosCostManager[medKey].porAnimal,
                tipoAplicacao: medicamentosCostManager[medKey].tipoAplicacao || 'individual',
                animaisPorLote: medicamentosCostManager[medKey].animaisPorLote,
                custoPorLote: medicamentosCostManager[medKey].custoPorLote
              }
            }
          } catch (error) {
            logger.warn('Erro ao buscar medicamento do costManager:', error)
          }
        }

        if (!medicamentoInfo) {
          return sendValidationError(res, `Medicamento "${med.nome}" não encontrado`, {
            medicamento: med.nome
          })
        }

        // Calcular custo por animal baseado na quantidade aplicada e preço do medicamento
        let custoPorAnimal = 0
        const totalAnimais = animaisNoPiquete.length
        
        // Se tiver quantidade aplicada e quantidade do frasco, calcular proporcionalmente
        const quantidadeAplicada = parseFloat(med.quantidadeAplicada || med.quantidade || 0)
        const quantidadeFrasco = parseFloat(med.quantidadeFrasco || med.quantiaFras || 0)
        const precoFrasco = parseFloat(medicamentoInfo.preco || 0)
        
        if (quantidadeAplicada > 0 && quantidadeFrasco > 0 && precoFrasco > 0) {
          // Fórmula: (preço do frasco / quantidade total do frasco) * quantidade aplicada por animal
          custoPorAnimal = (precoFrasco / quantidadeFrasco) * quantidadeAplicada
        } else if (medicamentoInfo.tipoAplicacao === 'lote') {
          // Se for aplicação em lote, dividir o custo pelo número de animais
          const custoPorLote = med.custoPorLote || medicamentoInfo.custoPorLote || medicamentoInfo.preco
          const animaisPorLote = med.animaisPorLote || medicamentoInfo.animaisPorLote || totalAnimais
          custoPorAnimal = custoPorLote / animaisPorLote
        } else {
          // Usar custo fixo por animal se disponível, senão usar preço do medicamento
          custoPorAnimal = med.custoPorAnimal || medicamentoInfo.porAnimal || medicamentoInfo.preco
        }

        medicamentosValidados.push({
          id: med.id,
          nome: medicamentoInfo.nome || med.nome,
          custoPorAnimal: parseFloat(custoPorAnimal.toFixed(2)),
          quantidade: med.quantidade || quantidadeAplicada || 1,
          quantidadeAplicada: quantidadeAplicada,
          quantidadeFrasco: quantidadeFrasco,
          precoFrasco: precoFrasco,
          unidade: med.unidade || medicamentoInfo.unidade || 'UNIDADE',
          tipoAplicacao: medicamentoInfo.tipoAplicacao || 'individual'
        })
      } catch (error) {
        logger.error(`Erro ao validar medicamento ${med.nome}:`, error)
        return sendError(res, `Erro ao validar medicamento "${med.nome}": ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }

    // Criar lote para rastreamento
    const descricaoLote = piquete 
      ? `Aplicação de medicamentos no piquete ${piquete}`
      : `Aplicação de medicamentos em ${animaisNoPiquete.length} animal(is) selecionado(s)`
    
    const lote = await criarLoteManual({
      tipo_operacao: 'APLICACAO_MEDICAMENTOS_LOTE',
      descricao: descricaoLote,
      detalhes: {
        piquete: piquete || null,
        animais_ids: animais_ids || null,
        quantidade_animais: animaisNoPiquete.length,
        medicamentos: medicamentosValidados.map(m => ({
          nome: m.nome,
          custoPorAnimal: m.custoPorAnimal
        })),
        data_aplicacao: data
      },
      usuario,
      quantidade_registros: animaisNoPiquete.length * medicamentosValidados.length,
      modulo: 'SANIDADE',
      req
    })

    // Aplicar medicamentos e registrar custos para cada animal
    const resultados = {
      sucessos: [],
      erros: [],
      total_processados: 0,
      total_sucessos: 0,
      total_erros: 0,
      custo_total: 0
    }

    for (const animal of animaisNoPiquete) {
      const animalId = animal.animal_id || animal.id

      for (const medicamento of medicamentosValidados) {
        resultados.total_processados++

        try {
          // Verificar se o animal existe
          const animalDb = await databaseService.buscarAnimalPorId(parseInt(animalId))
          if (!animalDb) {
            resultados.erros.push({
              animal_id: animalId,
              medicamento: medicamento.nome,
              erro: 'Animal não encontrado'
            })
            resultados.total_erros++
            continue
          }

          // Criar custo para o animal
          const custoData = {
            animal_id: parseInt(animalId),
            tipo: 'Medicamento',
            subtipo: medicamento.nome,
            valor: medicamento.custoPorAnimal,
            data: data,
            observacoes: observacoes || `${piquete ? `Aplicação em lote - Piquete: ${piquete}` : 'Aplicação em lote - Animais selecionados'}. Medicamento: ${medicamento.nome}${medicamento.quantidadeAplicada ? ` (${medicamento.quantidadeAplicada} ${medicamento.unidade} aplicado por animal)` : medicamento.quantidade > 1 ? ` (${medicamento.quantidade} ${medicamento.unidade})` : ''}. Custo calculado: R$ ${medicamento.custoPorAnimal.toFixed(2)}`,
            detalhes: JSON.stringify({
              piquete,
              medicamento_id: medicamento.id,
              medicamento_nome: medicamento.nome,
              quantidade: medicamento.quantidade,
              quantidade_aplicada: medicamento.quantidadeAplicada,
              quantidade_frasco: medicamento.quantidadeFrasco,
              preco_frasco: medicamento.precoFrasco,
              unidade: medicamento.unidade,
              tipo_aplicacao: medicamento.tipoAplicacao,
              custo_calculado: medicamento.custoPorAnimal,
              lote_numero: lote.numero_lote
            })
          }

          const custo = await databaseService.adicionarCusto(parseInt(animalId), custoData)
          
          // Atualizar custo total do animal
          await databaseService.atualizarCustoTotalAnimal(parseInt(animalId))

          resultados.sucessos.push({
            animal_id: animalId,
            animal_serie: animalDb.serie,
            animal_rg: animalDb.rg,
            medicamento: medicamento.nome,
            custo: medicamento.custoPorAnimal
          })
          resultados.total_sucessos++
          resultados.custo_total += medicamento.custoPorAnimal

        } catch (error) {
          logger.error(`Erro ao aplicar medicamento ${medicamento.nome} no animal ${animalId}:`, error)
          resultados.erros.push({
            animal_id: animalId,
            medicamento: medicamento.nome,
            erro: error.message
          })
          resultados.total_erros++
        }
      }
    }

    const logMsg = piquete 
      ? `Medicamentos aplicados no piquete ${piquete}: ${resultados.total_sucessos} sucessos, ${resultados.total_erros} erros`
      : `Medicamentos aplicados em ${animaisNoPiquete.length} animal(is): ${resultados.total_sucessos} sucessos, ${resultados.total_erros} erros`
    
    logger.info(logMsg)

    return sendSuccess(res, {
      lote: lote.numero_lote,
      piquete: piquete || null,
      animais_processados: animaisNoPiquete.length,
      medicamentos_aplicados: medicamentosValidados.length,
      resultados,
      custo_total_lote: resultados.custo_total
    }, `Medicamentos aplicados com sucesso em ${resultados.total_sucessos} registro(s)`, HTTP_STATUS.CREATED)

  } catch (error) {
    logger.error('Erro ao aplicar medicamentos em lote:', error)
    return sendError(res, `Erro ao aplicar medicamentos: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export default asyncHandler(aplicarMedicamentosLoteHandler)

