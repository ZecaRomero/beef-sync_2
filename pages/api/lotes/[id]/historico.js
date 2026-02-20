import { query } from '../../../../lib/database'
import { sendSuccess, sendError, sendNotFound, sendMethodNotAllowed, asyncHandler } from '../../../../utils/apiResponse'
import logger from '../../../../utils/logger'

async function handler(req, res) {
  if (req.method === 'GET') {
    return await handleGet(req, res)
  } else {
    return sendMethodNotAllowed(res, ['GET'])
  }
}

async function handleGet(req, res) {
  try {
    const { id } = req.query

    if (!id) {
      return sendError(res, 'ID do lote é obrigatório', 400)
    }

    // Verificar se o lote existe
    const loteQuery = 'SELECT * FROM lotes_operacoes WHERE id = $1'
    const loteResult = await query(loteQuery, [id])

    if (loteResult.rows.length === 0) {
      return sendNotFound(res, 'Lote não encontrado')
    }

    const lote = loteResult.rows[0]

    // Buscar histórico de execução (simulado - você pode implementar uma tabela específica)
    const historico = [
      {
        timestamp: lote.data_criacao,
        acao: 'Lote criado',
        status: 'concluido',
        detalhes: `Lote ${lote.numero_lote} criado pelo usuário ${lote.usuario}`,
        usuario: lote.usuario
      }
    ]

    // Se tem data de início de processamento
    if (lote.data_inicio_processamento) {
      historico.push({
        timestamp: lote.data_inicio_processamento,
        acao: 'Processamento iniciado',
        status: 'pendente',
        detalhes: 'Início do processamento dos registros do lote',
        usuario: lote.usuario
      })
    }

    // Se tem data de conclusão
    if (lote.data_conclusao) {
      const duracao = new Date(lote.data_conclusao) - new Date(lote.data_criacao)
      const duracaoFormatada = formatDuration(duracao)
      
      historico.push({
        timestamp: lote.data_conclusao,
        acao: 'Processamento concluído',
        status: 'concluido',
        detalhes: `Lote processado com sucesso em ${duracaoFormatada}. ${lote.quantidade_registros} registros processados.`,
        usuario: lote.usuario
      })
    }

    // Se tem erro
    if (lote.erro_detalhes) {
      historico.push({
        timestamp: lote.data_erro || lote.data_criacao,
        acao: 'Erro no processamento',
        status: 'erro',
        detalhes: 'Erro durante o processamento do lote',
        erro: lote.erro_detalhes,
        usuario: lote.usuario
      })
    }

    // Adicionar eventos baseados nos detalhes do lote
    if (lote.detalhes) {
      try {
        const detalhes = typeof lote.detalhes === 'string' ? JSON.parse(lote.detalhes) : lote.detalhes
        
        // Eventos específicos baseados no tipo de operação
        if (lote.tipo_operacao === 'CADASTRO_ANIMAIS' && detalhes.animais_processados) {
          historico.push({
            timestamp: new Date(new Date(lote.data_criacao).getTime() + 30000), // 30s depois
            acao: 'Validação de dados',
            status: 'concluido',
            detalhes: `Validados ${detalhes.animais_processados} registros de animais`,
            usuario: lote.usuario
          })
        }

        if (lote.tipo_operacao === 'ENTRADA_NF' && detalhes.valor_total) {
          historico.push({
            timestamp: new Date(new Date(lote.data_criacao).getTime() + 60000), // 1min depois
            acao: 'Cálculo de impostos',
            status: 'concluido',
            detalhes: `Calculados impostos para valor total de R$ ${detalhes.valor_total}`,
            usuario: lote.usuario
          })
        }

        if (detalhes.arquivos_processados) {
          historico.push({
            timestamp: new Date(new Date(lote.data_criacao).getTime() + 15000), // 15s depois
            acao: 'Processamento de arquivos',
            status: 'concluido',
            detalhes: `Processados ${detalhes.arquivos_processados} arquivos`,
            usuario: lote.usuario
          })
        }

      } catch (error) {
        logger.warn('Erro ao processar detalhes do lote para histórico:', error)
      }
    }

    // Ordenar por timestamp
    historico.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    return sendSuccess(res, {
      lote,
      historico
    }, 'Histórico recuperado com sucesso')

  } catch (error) {
    logger.error('Erro ao buscar histórico do lote:', error)
    return sendError(res, 'Erro ao buscar histórico do lote', 500)
  }
}

function formatDuration(milliseconds) {
  if (milliseconds < 1000) return `${milliseconds}ms`
  if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}s`
  if (milliseconds < 3600000) return `${Math.round(milliseconds / 60000)}min`
  return `${Math.round(milliseconds / 3600000)}h`
}

export default asyncHandler(handler)