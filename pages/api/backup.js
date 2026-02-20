import { query } from '../../lib/database'
import fs from 'fs'
import path from 'path'
import logger from '../../utils/logger'

// Backup pode demorar com muitos dados - timeout de 5 minutos
export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
    responseLimit: false,
    externalResolver: true
  },
  maxDuration: 300
}

/**
 * API de Backup do Sistema
 * GET: Retorna dados de backup
 * POST: Cria backup e opcionalmente salva em arquivo
 */
export default async function handler(req, res) {
  const { method } = req

  try {
    logger.api(method, '/api/backup', { query: req.query, body: req.body })
    
    switch (method) {
      case 'GET':
        await handleGet(req, res)
        break
      case 'POST':
        await handlePost(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    logger.error('Erro na API de backup:', error)
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message })
  }
}

async function handleGet(req, res) {
  try {
    const { tipo = 'completo', formato = 'json' } = req.query
    logger.info('Gerando backup', { tipo, formato })

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
        logger.warn('Tipo de backup inválido', { tipo })
        return res.status(400).json({ message: 'Tipo de backup inválido' })
    }

    // Adicionar metadados do backup
    const backup = {
      metadata: {
        tipo,
        dataCriacao: new Date().toISOString(),
        versao: '1.0',
        totalRegistros: countTotalRecords(backupData),
        tabelas: Object.keys(backupData)
      },
      data: backupData
    }

    logger.info('Backup gerado com sucesso', { 
      tipo, 
      totalRegistros: backup.metadata.totalRegistros,
      tabelas: backup.metadata.tabelas.length
    })

    res.status(200).json(backup)
  } catch (error) {
    logger.error('Erro ao gerar backup:', error)
    res.status(500).json({ message: 'Erro ao gerar backup', error: error.message })
  }
}

async function handlePost(req, res) {
  try {
    const { tipo = 'completo', formato = 'json', salvarArquivo = false } = req.body
    logger.info('Criando backup', { tipo, formato, salvarArquivo })

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
        logger.warn('Tipo de backup inválido', { tipo })
        return res.status(400).json({ message: 'Tipo de backup inválido' })
    }

    // Adicionar metadados do backup
    const backup = {
      metadata: {
        tipo,
        dataCriacao: new Date().toISOString(),
        versao: '1.0',
        totalRegistros: countTotalRecords(backupData),
        tabelas: Object.keys(backupData)
      },
      data: backupData
    }

    // Se solicitado, salvar arquivo
    if (salvarArquivo) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')
      const fileName = `backup_${tipo}_${timestamp[0]}_${timestamp[1].split('-')[0]}.${formato}`
      const filePath = path.join(process.cwd(), 'backups', fileName)
      
      // Criar diretório se não existir
      const backupDir = path.join(process.cwd(), 'backups')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
        logger.info('Diretório de backup criado', { backupDir })
      }

      if (formato === 'json') {
        fs.writeFileSync(filePath, JSON.stringify(backup, null, 2))
        logger.info('Backup JSON salvo', { filePath })
      } else if (formato === 'sql') {
        const sqlContent = generateSQLBackup(backupData)
        fs.writeFileSync(filePath, sqlContent)
        logger.info('Backup SQL salvo', { filePath })
      }

      backup.metadata.arquivoSalvo = fileName
      backup.metadata.caminhoArquivo = filePath
      
      // Obter tamanho do arquivo
      const stats = fs.statSync(filePath)
      backup.metadata.tamanhoArquivo = stats.size
    }

    logger.info('Backup criado com sucesso', {
      tipo,
      totalRegistros: backup.metadata.totalRegistros,
      tabelas: backup.metadata.tabelas.length,
      arquivoSalvo: backup.metadata.arquivoSalvo
    })

    res.status(200).json(backup)
  } catch (error) {
    logger.error('Erro ao criar backup:', error)
    res.status(500).json({ message: 'Erro ao criar backup', error: error.message })
  }
}

/**
 * Gera backup completo de todas as tabelas do sistema
 */
async function generateCompleteBackup() {
  logger.debug('Iniciando backup completo')
  const backup = {}

  const tabelas = [
    'animais',
    'custos',
    'gestacoes',
    'nascimentos',
    'estoque_semen',
    'protocolos_aplicados',
    'transferencias_embrioes',
    'protocolos_reprodutivos',
    'ciclos_reprodutivos',
    'relatorios_personalizados',
    'notificacoes',
    'notas_fiscais',
    'servicos',
    'naturezas_operacao',
    'origens_receptoras'
  ]

  for (const tabela of tabelas) {
    try {
      logger.db('SELECT', tabela, '*')
      const result = await query(`SELECT * FROM ${tabela} ORDER BY id`)
      backup[tabela] = result.rows
      logger.debug(`Tabela ${tabela}: ${result.rows.length} registros`)
    } catch (error) {
      logger.warn(`Tabela ${tabela} não encontrada ou vazia`, { error: error.message })
      backup[tabela] = []
    }
  }

  return backup
}

// Gerar backup de animais
async function generateAnimalsBackup() {
  const backup = {}

  backup.animais = (await query('SELECT * FROM animais ORDER BY id')).rows
  backup.custos = (await query('SELECT * FROM custos ORDER BY id')).rows
  backup.gestacoes = (await query('SELECT * FROM gestacoes ORDER BY id')).rows
  backup.nascimentos = (await query('SELECT * FROM nascimentos ORDER BY id')).rows

  return backup
}

// Gerar backup reprodutivo
async function generateReproductiveBackup() {
  const backup = {}

  backup.transferencias_embrioes = (await query('SELECT * FROM transferencias_embrioes ORDER BY id')).rows
  backup.protocolos_reprodutivos = (await query('SELECT * FROM protocolos_reprodutivos ORDER BY id')).rows
  backup.ciclos_reprodutivos = (await query('SELECT * FROM ciclos_reprodutivos ORDER BY id')).rows
  backup.gestacoes = (await query('SELECT * FROM gestacoes ORDER BY id')).rows
  backup.nascimentos = (await query('SELECT * FROM nascimentos ORDER BY id')).rows
  backup.estoque_semen = (await query('SELECT * FROM estoque_semen ORDER BY id')).rows
  backup.protocolos_aplicados = (await query('SELECT * FROM protocolos_aplicados ORDER BY id')).rows

  return backup
}

// Gerar backup comercial
async function generateCommercialBackup() {
  const backup = {}

  backup.notas_fiscais = (await query('SELECT * FROM notas_fiscais ORDER BY id')).rows
  backup.servicos = (await query('SELECT * FROM servicos ORDER BY id')).rows
  backup.naturezas_operacao = (await query('SELECT * FROM naturezas_operacao ORDER BY id')).rows
  backup.origens_receptoras = (await query('SELECT * FROM origens_receptoras ORDER BY id')).rows

  return backup
}

// Gerar backup financeiro
async function generateFinancialBackup() {
  const backup = {}

  backup.animais = (await query('SELECT id, serie, rg, custo_aquisicao, custo_total, valor_venda FROM animais ORDER BY id')).rows
  backup.custos = (await query('SELECT * FROM custos ORDER BY id')).rows
  backup.notas_fiscais = (await query('SELECT * FROM notas_fiscais ORDER BY id')).rows
  backup.servicos = (await query('SELECT * FROM servicos ORDER BY id')).rows

  return backup
}

// Contar total de registros
function countTotalRecords(backupData) {
  return Object.values(backupData).reduce((total, records) => {
    return total + (Array.isArray(records) ? records.length : 0)
  }, 0)
}

// Gerar SQL de backup
function generateSQLBackup(backupData) {
  let sql = '-- Backup do Sistema Beef-Sync\n'
  sql += `-- Gerado em: ${new Date().toISOString()}\n\n`

  for (const [tableName, records] of Object.entries(backupData)) {
    if (records.length === 0) continue

    sql += `-- Tabela: ${tableName}\n`
    sql += `DELETE FROM ${tableName};\n`

    if (records.length > 0) {
      const columns = Object.keys(records[0])
      const values = records.map(record => {
        const rowValues = columns.map(col => {
          const value = record[col]
          if (value === null) return 'NULL'
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
          return value
        })
        return `(${rowValues.join(', ')})`
      })

      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`
      sql += values.join(',\n') + ';\n\n'
    }
  }

  return sql
}
