import { sendSuccess, sendError, sendMethodNotAllowed, asyncHandler } from '../../../utils/apiResponse'
import fs from 'fs'
import path from 'path'

const handler = async (req, res) => {
  if (req.method !== 'DELETE') {
    return sendMethodNotAllowed(res, ['DELETE'])
  }

  try {
    const { fileName } = req.body

    if (!fileName) {
      return sendError(res, 'Nome do arquivo é obrigatório', 400)
    }

    const backupDir = path.join(process.cwd(), 'backups')
    const filePath = path.join(backupDir, fileName)

    if (!fs.existsSync(filePath)) {
      return sendError(res, 'Arquivo de backup não encontrado', 404)
    }

    // Verificar se é um arquivo de backup válido (segurança)
    if (!fileName.includes('backup_') || (!fileName.endsWith('.json') && !fileName.endsWith('.sql'))) {
      return sendError(res, 'Arquivo não é um backup válido', 400)
    }

    const stats = fs.statSync(filePath)
    const fileSize = stats.size

    // Deletar arquivo
    fs.unlinkSync(filePath)

    return sendSuccess(res, {
      fileName,
      size: fileSize,
      deletedAt: new Date().toISOString()
    }, 'Backup deletado com sucesso')
  } catch (error) {
    return sendError(res, 'Erro ao deletar backup', 500, error.message)
  }
}

export default asyncHandler(handler)