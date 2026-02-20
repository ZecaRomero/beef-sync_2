import databaseService from '../../../services/databaseService'
import logger from '../../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendMethodNotAllowed, 
  asyncHandler 
} from '../../../utils/apiResponse'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: 'error',
      message: 'Método não permitido',
      allowedMethods: ['GET']
    })
  }

  try {
    let piquetesCadastrados = { rows: [] }
    let piquetesUsados = { rows: [] }

    // Tentar buscar piquetes cadastrados da tabela piquetes (pode não existir ainda)
    try {
      const resultCadastrados = await databaseService.query(`
        SELECT nome 
        FROM piquetes 
        WHERE ativo = true
        ORDER BY nome ASC
      `)
      piquetesCadastrados = resultCadastrados || { rows: [] }
      logger.info(`Piquetes cadastrados encontrados: ${piquetesCadastrados.rows?.length || 0}`)
    } catch (error) {
      // Se a tabela não existir (erro 42P01), apenas logar e continuar
      if (error.code === '42P01') {
        logger.warn('Tabela piquetes não existe ainda, será criada automaticamente')
      } else {
        logger.warn('Erro ao buscar piquetes cadastrados:', error.message)
      }
      piquetesCadastrados = { rows: [] }
    }

    // Buscar piquetes únicos da tabela localizacoes_animais (para incluir piquetes usados mas não cadastrados)
    try {
      const resultUsados = await databaseService.query(`
        SELECT DISTINCT piquete 
        FROM localizacoes_animais 
        WHERE piquete IS NOT NULL AND piquete != ''
        ORDER BY piquete ASC
      `)
      piquetesUsados = resultUsados || { rows: [] }
      logger.info(`Piquetes usados encontrados: ${piquetesUsados.rows?.length || 0}`)
    } catch (error) {
      // Se a tabela não existir, apenas logar e continuar
      if (error.code === '42P01') {
        logger.warn('Tabela localizacoes_animais não existe ainda')
      } else {
        logger.warn('Erro ao buscar piquetes usados:', error.message)
      }
      piquetesUsados = { rows: [] }
    }

    // Combinar ambas as listas, removendo duplicatas
    const piquetesSet = new Set()
    
    // Adicionar piquetes cadastrados primeiro (prioridade)
    if (piquetesCadastrados?.rows && Array.isArray(piquetesCadastrados.rows)) {
      piquetesCadastrados.rows.forEach(row => {
        if (row?.nome && typeof row.nome === 'string' && row.nome.trim()) {
          piquetesSet.add(row.nome.trim())
        }
      })
    }
    
    // Adicionar piquetes usados (que não estão cadastrados)
    if (piquetesUsados?.rows && Array.isArray(piquetesUsados.rows)) {
      piquetesUsados.rows.forEach(row => {
        if (row?.piquete && typeof row.piquete === 'string' && row.piquete.trim()) {
          piquetesSet.add(row.piquete.trim())
        }
      })
    }

    const piquetes = Array.from(piquetesSet).sort()

    logger.info(`Total de piquetes únicos: ${piquetes.length}`)

    return res.status(200).json({
      status: 'success',
      data: {
        piquetes,
        count: piquetes.length,
        cadastrados: piquetesCadastrados.rows?.length || 0,
        usados: piquetesUsados.rows?.length || 0
      },
      message: 'Piquetes encontrados com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao buscar piquetes:', error)
    // Retornar array vazio em caso de erro, não quebrar a aplicação
    return res.status(200).json({
      status: 'success',
      data: {
        piquetes: [],
        count: 0,
        cadastrados: 0,
        usados: 0
      },
      message: 'Nenhum piquete encontrado',
      warning: error.message
    })
  }
}

