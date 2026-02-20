import databaseService from '../../../../services/databaseService'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendNotFound,
  sendMethodNotAllowed, 
  asyncHandler, 
  HTTP_STATUS 
} from '../../../../utils/apiResponse'
import logger from '../../../../utils/logger'

async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID do animal é obrigatório')
  }

  try {
    if (req.method === 'GET') {
      // Buscar custos de medicamentos do animal
      const custosMedicamentos = await databaseService.buscarCustosMedicamentosAnimal(parseInt(id))
      const custoTotal = await databaseService.calcularCustoTotalMedicamentosAnimal(parseInt(id))
      
      return sendSuccess(res, {
        custos: custosMedicamentos,
        total: custoTotal,
        quantidade: custosMedicamentos.length
      }, 'Custos de medicamentos recuperados com sucesso')
      
    } else if (req.method === 'POST') {
      // Registrar aplicação de medicamento
      const { 
        medicamentoId, 
        medicamentoNome,
        quantidadeAplicada,
        quantidadeFrasco,
        data,
        observacoes 
      } = req.body

      if (!medicamentoId && !medicamentoNome) {
        return sendValidationError(res, 'ID ou nome do medicamento é obrigatório')
      }

      if (!quantidadeAplicada || parseFloat(quantidadeAplicada) <= 0) {
        return sendValidationError(res, 'Quantidade aplicada deve ser maior que zero')
      }

      // Verificar se o animal existe
      const animal = await databaseService.buscarAnimalPorId(parseInt(id))
      if (!animal) {
        return sendNotFound(res, 'Animal não encontrado')
      }

      // Buscar informações do medicamento
      let medicamento = null
      if (medicamentoId) {
        const medResult = await databaseService.query(`
          SELECT * FROM medicamentos 
          WHERE id = $1 AND ativo = true
        `, [medicamentoId])
        
        if (medResult.rows.length > 0) {
          medicamento = medResult.rows[0]
        }
      } else if (medicamentoNome) {
        const medResult = await databaseService.query(`
          SELECT * FROM medicamentos 
          WHERE nome ILIKE $1 AND ativo = true
          LIMIT 1
        `, [`%${medicamentoNome}%`])
        
        if (medResult.rows.length > 0) {
          medicamento = medResult.rows[0]
        }
      }

      if (!medicamento) {
        return sendNotFound(res, 'Medicamento não encontrado')
      }

      // Calcular custo do medicamento
      const custoCalculado = databaseService.calcularCustoMedicamento(
        medicamento,
        quantidadeAplicada,
        quantidadeFrasco || null
      )

      // Registrar custo
      const custoData = {
        animal_id: parseInt(id),
        tipo: 'Medicamento',
        subtipo: medicamento.nome,
        valor: parseFloat(custoCalculado.toFixed(2)),
        data: data || new Date().toISOString().split('T')[0],
        observacoes: observacoes || `Aplicação de ${medicamento.nome} - ${quantidadeAplicada} ${medicamento.unidade || 'ml'}`,
        detalhes: JSON.stringify({
          medicamento_id: medicamento.id,
          medicamento_nome: medicamento.nome,
          quantidade_aplicada: parseFloat(quantidadeAplicada),
          quantidade_frasco: quantidadeFrasco ? parseFloat(quantidadeFrasco) : null,
          preco_frasco: parseFloat(medicamento.preco),
          unidade: medicamento.unidade,
          custo_calculado: parseFloat(custoCalculado.toFixed(2))
        })
      }

      const custo = await databaseService.adicionarCusto(parseInt(id), custoData)

      // Registrar na história de ocorrências
      try {
        await databaseService.query(`
          INSERT INTO historia_ocorrencias (
            animal_id, tipo, data, descricao, observacoes, 
            medicamento, dosagem
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          parseInt(id),
          'medicacao',
          data || new Date().toISOString().split('T')[0],
          `Aplicação de medicamento: ${medicamento.nome}`,
          observacoes || `Quantidade: ${quantidadeAplicada} ${medicamento.unidade || 'ml'}. Custo: R$ ${custoCalculado.toFixed(2)}`,
          medicamento.nome,
          `${quantidadeAplicada} ${medicamento.unidade || 'ml'}`
        ])
      } catch (histError) {
        logger.warn('Erro ao registrar na história de ocorrências:', histError)
        // Não bloquear o registro do custo se falhar a história
      }

      return sendSuccess(res, {
        custo,
        medicamento: medicamento.nome,
        quantidadeAplicada,
        custoCalculado: parseFloat(custoCalculado.toFixed(2))
      }, 'Medicamento aplicado e custo registrado com sucesso', HTTP_STATUS.CREATED)

    } else {
      return sendMethodNotAllowed(res, ['GET', 'POST'])
    }
  } catch (error) {
    logger.error('Erro na API de medicamentos do animal:', error)
    return sendError(res, `Erro ao processar solicitação: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export default asyncHandler(handler)

