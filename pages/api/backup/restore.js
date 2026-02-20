import { query } from '../../../lib/database'
import logger from '../../../utils/logger'
import {
  sendSuccess,
  sendError,
  sendMethodNotAllowed,
  asyncHandler,
  HTTP_STATUS
} from '../../../utils/apiResponse'

/**
 * API de Restauração de Backup
 * POST: Restaura backup a partir de arquivo JSON ou SQL
 */
async function handleRestore(req, res) {
  try {
    if (req.method !== 'POST') {
      return sendMethodNotAllowed(res, req.method)
    }

    // Verificar se há arquivo no FormData
    if (!req.body || !req.body.file) {
      return sendError(res, 'Arquivo de backup não fornecido', HTTP_STATUS.BAD_REQUEST)
    }

    const file = req.body.file
    const fileName = file.filename || file.name || 'backup'
    const fileContent = file.data || file.content || file

    logger.info('Iniciando restauração de backup', { fileName, tamanho: fileContent?.length })

    let backupData
    let formato = 'json'

    // Determinar formato pelo nome do arquivo ou conteúdo
    if (fileName.endsWith('.json') || (typeof fileContent === 'string' && fileContent.trim().startsWith('{'))) {
      formato = 'json'
      try {
        backupData = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent
      } catch (error) {
        logger.error('Erro ao fazer parse do JSON', { error: error.message })
        return sendError(res, 'Arquivo JSON inválido', HTTP_STATUS.BAD_REQUEST)
      }
    } else if (fileName.endsWith('.sql') || (typeof fileContent === 'string' && fileContent.trim().startsWith('--'))) {
      formato = 'sql'
      backupData = typeof fileContent === 'string' ? fileContent : fileContent.toString()
    } else {
      return sendError(res, 'Formato de arquivo não suportado. Use JSON ou SQL.', HTTP_STATUS.BAD_REQUEST)
    }

    // Validar estrutura do backup JSON
    if (formato === 'json') {
      if (!backupData.metadata || !backupData.data) {
        return sendError(res, 'Arquivo de backup inválido. Estrutura de metadados não encontrada.', HTTP_STATUS.BAD_REQUEST)
      }
    }

    // Restaurar dados
    let registrosRestaurados = 0
    const tabelasRestauradas = []

    if (formato === 'json') {
      // Restaurar de JSON
      const data = backupData.data
      
      for (const [tableName, records] of Object.entries(data)) {
        if (!Array.isArray(records) || records.length === 0) {
          logger.debug(`Tabela ${tableName} vazia, pulando`)
          continue
        }

        try {
          // Limpar tabela antes de restaurar
          await query(`DELETE FROM ${tableName}`)
          logger.debug(`Tabela ${tableName} limpa`)

          // Inserir registros em lotes
          if (records.length > 0) {
            const columns = Object.keys(records[0])
            
            // Processar em lotes de 100 para evitar problemas de memória
            const batchSize = 100
            for (let i = 0; i < records.length; i += batchSize) {
              const batch = records.slice(i, i + batchSize)
              
              const values = batch.map(record => {
                const rowValues = columns.map(col => {
                  const value = record[col]
                  if (value === null || value === undefined) return 'NULL'
                  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
                  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
                  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
                  return value
                })
                return `(${rowValues.join(', ')})`
              })

              const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values.join(', ')}`
              await query(insertQuery)
            }
          }

          registrosRestaurados += records.length
          tabelasRestauradas.push(tableName)
          logger.info(`Tabela ${tableName} restaurada: ${records.length} registros`)
        } catch (error) {
          logger.error(`Erro ao restaurar tabela ${tableName}`, { error: error.message })
          // Continuar com outras tabelas mesmo se uma falhar
        }
      }
    } else {
      // Restaurar de SQL
      try {
        // Dividir o SQL em comandos individuais
        const commands = backupData
          .split(';')
          .map(cmd => cmd.trim())
          .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

        for (const command of commands) {
          if (command.trim()) {
            await query(command)
            registrosRestaurados++
          }
        }

        logger.info('Script SQL executado com sucesso', { comandos: commands.length })
        tabelasRestauradas.push('SQL executado')
      } catch (error) {
        logger.error('Erro ao executar script SQL', { error: error.message })
        return sendError(res, `Erro ao executar script SQL: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }

    logger.info('Backup restaurado com sucesso', {
      formato,
      registrosRestaurados,
      tabelasRestauradas: tabelasRestauradas.length
    })

    return sendSuccess(
      res,
      {
        formato,
        registrosRestaurados,
        tabelasRestauradas,
        metadata: formato === 'json' ? backupData.metadata : null
      },
      'Backup restaurado com sucesso',
      HTTP_STATUS.OK
    )
  } catch (error) {
    logger.error('Erro ao restaurar backup:', error)
    return sendError(res, `Erro ao restaurar backup: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

// Next.js API route handler
export default asyncHandler(async (req, res) => {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, req.method)
  }

  try {
    // Receber dados do arquivo (vem como texto ou base64 no body)
    const { fileContent, fileName, fileType } = req.body

    if (!fileContent) {
      return sendError(res, 'Conteúdo do arquivo não fornecido', HTTP_STATUS.BAD_REQUEST)
    }

    // Decodificar se for base64
    let content = fileContent
    if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
      // Remover prefixo data:application/json;base64, ou similar
      const base64Match = fileContent.match(/base64,(.+)/)
      if (base64Match) {
        content = Buffer.from(base64Match[1], 'base64').toString('utf8')
      }
    }

    req.body = {
      file: {
        name: fileName || 'backup.json',
        data: content,
        size: content.length
      }
    }

    return await handleRestore(req, res)
  } catch (error) {
    logger.error('Erro ao processar requisição de restauração:', error)
    return sendError(res, `Erro ao processar requisição: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})
