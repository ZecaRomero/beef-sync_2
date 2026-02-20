import { sendSuccess, sendError, sendMethodNotAllowed, asyncHandler } from '../../../utils/apiResponse'
import fs from 'fs'
import path from 'path'

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET'])
  }

  try {
    const { fileName } = req.query

    if (!fileName) {
      return sendError(res, 'Nome do arquivo é obrigatório', 400)
    }

    const backupDir = path.join(process.cwd(), 'backups')
    const filePath = path.join(backupDir, fileName)

    if (!fs.existsSync(filePath)) {
      return sendError(res, 'Arquivo de backup não encontrado', 404)
    }

    const stats = fs.statSync(filePath)
    const fileInfo = {
      name: fileName,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      format: path.extname(fileName).substring(1)
    }

    // Carregar metadados se for JSON
    let metadata = null
    let tableDetails = null

    if (path.extname(fileName) === '.json') {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const backup = JSON.parse(content)
        
        metadata = backup.metadata
        
        // Contar registros por tabela
        if (backup.data) {
          tableDetails = {}
          Object.entries(backup.data).forEach(([table, records]) => {
            tableDetails[table] = {
              count: Array.isArray(records) ? records.length : 0,
              hasData: Array.isArray(records) && records.length > 0
            }
          })
        }
      } catch (error) {
        return sendError(res, 'Erro ao ler arquivo de backup', 400, error.message)
      }
    }

    const response = {
      file: fileInfo,
      metadata,
      tableDetails,
      isValid: metadata !== null
    }

    return sendSuccess(res, response, 'Informações do backup carregadas')
  } catch (error) {
    return sendError(res, 'Erro ao obter informações do backup', 500, error.message)
  }
}

export default asyncHandler(handler)