import { query } from '../../../lib/database'
import { sendSuccess, sendError, sendMethodNotAllowed, asyncHandler } from '../../../utils/apiResponse'
import fs from 'fs'
import path from 'path'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    // Listar backups disponíveis
    try {
      const backupDir = path.join(process.cwd(), 'backups')
      
      if (!fs.existsSync(backupDir)) {
        return sendSuccess(res, [], 'Nenhum backup encontrado')
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json') || file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(backupDir, file)
          const stats = fs.statSync(filePath)
          
          let metadata = null
          try {
            if (file.endsWith('.json')) {
              const content = fs.readFileSync(filePath, 'utf8')
              const backup = JSON.parse(content)
              metadata = backup.metadata
            }
          } catch (error) {
            // Ignorar erros de parsing
          }

          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            format: path.extname(file).substring(1),
            metadata
          }
        })
        .sort((a, b) => new Date(b.modified) - new Date(a.modified))

      return sendSuccess(res, files, 'Backups listados com sucesso')
    } catch (error) {
      return sendError(res, 'Erro ao listar backups', 500, error.message)
    }
  } else if (req.method === 'POST') {
    // Criar novo backup
    try {
      const { tipo = 'completo', formato = 'json' } = req.body

      let backupData = {}

      switch (tipo) {
        case 'completo':
          backupData = await generateCompleteBackup()
          break
        case 'animais':
          backupData = await generateAnimalsBackup()
          break
        case 'reprodutivo':
          backupData = await generateReproductiveBackup()
          break
        case 'comercial':
          backupData = await generateCommercialBackup()
          break
        case 'financeiro':
          backupData = await generateFinancialBackup()
          break
        default:
          return sendError(res, 'Tipo de backup inválido', 400)
      }

      // Criar metadados
      const backup = {
        metadata: {
          tipo,
          formato,
          dataCriacao: new Date().toISOString(),
          versao: '1.0',
          totalRegistros: countTotalRecords(backupData),
          tabelas: Object.keys(backupData)
        },
        data: backupData
      }

      // Salvar arquivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')
      const fileName = `backup_${tipo}_${timestamp[0]}_${timestamp[1].split('-')[0]}.${formato}`
      const backupDir = path.join(process.cwd(), 'backups')
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }
      
      const filePath = path.join(backupDir, fileName)

      if (formato === 'json') {
        fs.writeFileSync(filePath, JSON.stringify(backup, null, 2))
      } else {
        return sendError(res, 'Formato SQL não implementado via API', 400)
      }

      const stats = fs.statSync(filePath)

      return sendSuccess(res, {
        fileName,
        filePath: fileName,
        size: stats.size,
        metadata: backup.metadata
      }, 'Backup criado com sucesso')
    } catch (error) {
      return sendError(res, 'Erro ao criar backup', 500, error.message)
    }
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST'])
  }
}

// Funções auxiliares (mesmas do script de backup)
async function generateCompleteBackup() {
  const backup = {}
  const tabelas = [
    'animais', 'custos', 'gestacoes', 'nascimentos',
    'estoque_semen', 'protocolos_aplicados', 'transferencias_embrioes',
    'protocolos_reprodutivos', 'ciclos_reprodutivos', 'relatorios_personalizados',
    'notificacoes', 'notas_fiscais', 'servicos', 'naturezas_operacao',
    'origens_receptoras', 'localizacoes_animais', 'historia_ocorrencias'
  ]

  for (const tabela of tabelas) {
    try {
      const result = await query(`SELECT * FROM ${tabela} ORDER BY id`)
      backup[tabela] = result.rows
    } catch (error) {
      backup[tabela] = []
    }
  }

  return backup
}

async function generateAnimalsBackup() {
  const backup = {}
  const tabelas = ['animais', 'custos', 'gestacoes', 'nascimentos', 'localizacoes_animais', 'historia_ocorrencias']

  for (const tabela of tabelas) {
    try {
      const result = await query(`SELECT * FROM ${tabela} ORDER BY id`)
      backup[tabela] = result.rows
    } catch (error) {
      backup[tabela] = []
    }
  }

  return backup
}

async function generateReproductiveBackup() {
  const backup = {}
  const tabelas = [
    'transferencias_embrioes', 'protocolos_reprodutivos', 'ciclos_reprodutivos',
    'gestacoes', 'nascimentos', 'estoque_semen', 'protocolos_aplicados'
  ]

  for (const tabela of tabelas) {
    try {
      const result = await query(`SELECT * FROM ${tabela} ORDER BY id`)
      backup[tabela] = result.rows
    } catch (error) {
      backup[tabela] = []
    }
  }

  return backup
}

async function generateCommercialBackup() {
  const backup = {}
  const tabelas = ['notas_fiscais', 'servicos', 'naturezas_operacao', 'origens_receptoras']

  for (const tabela of tabelas) {
    try {
      const result = await query(`SELECT * FROM ${tabela} ORDER BY id`)
      backup[tabela] = result.rows
    } catch (error) {
      backup[tabela] = []
    }
  }

  return backup
}

async function generateFinancialBackup() {
  const backup = {}
  
  try {
    const animaisResult = await query(
      'SELECT id, serie, rg, custo_total, valor_venda FROM animais ORDER BY id'
    )
    backup.animais = animaisResult.rows

    const custosResult = await query('SELECT * FROM custos ORDER BY id')
    backup.custos = custosResult.rows

    const nfResult = await query('SELECT * FROM notas_fiscais ORDER BY id')
    backup.notas_fiscais = nfResult.rows

    const servicosResult = await query('SELECT * FROM servicos ORDER BY id')
    backup.servicos = servicosResult.rows
  } catch (error) {
    // Se alguma tabela não existir, continuar com array vazio
  }

  return backup
}

function countTotalRecords(backupData) {
  return Object.values(backupData).reduce((total, records) => {
    return total + (Array.isArray(records) ? records.length : 0)
  }, 0)
}

export default asyncHandler(handler)