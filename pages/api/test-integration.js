import databaseService from '../../services/databaseService'
import logger from '../../utils/logger'
import { sendSuccess, sendError, asyncHandler } from '../../utils/apiResponse'

export default asyncHandler(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  const results = {
    conexao: false,
    tabelas: {},
    apis: {},
    timestamp: new Date().toISOString()
  }

  try {
    // Testar conexão
    try {
      await databaseService.testConnection()
      results.conexao = true
    } catch (error) {
      results.conexao = false
      results.erroConexao = error.message
      return sendSuccess(res, results, 'Teste de integração concluído')
    }

    // Verificar tabelas principais
    const tabelasParaVerificar = [
      'animais',
      'historia_ocorrencias',
      'localizacoes_animais',
      'mortes',
      'movimentacoes_contabeis'
    ]

    for (const tabela of tabelasParaVerificar) {
      try {
        const count = await databaseService.getTableCount(tabela)
        results.tabelas[tabela] = {
          existe: true,
          registros: count
        }
      } catch (error) {
        results.tabelas[tabela] = {
          existe: false,
          erro: error.message
        }
      }
    }

    // Verificar colunas importantes na tabela historia_ocorrencias
    try {
      const colunas = await databaseService.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'historia_ocorrencias'
        ORDER BY ordinal_position
      `)
      results.tabelas.historia_ocorrencias.colunas = colunas.rows.map(c => ({
        nome: c.column_name,
        tipo: c.data_type
      }))
    } catch (error) {
      results.tabelas.historia_ocorrencias.erroColunas = error.message
    }

    // Verificar colunas importantes na tabela animais
    try {
      const colunasAnimais = await databaseService.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'animais'
        AND column_name IN ('nome', 'abczg', 'deca')
      `)
      results.tabelas.animais.colunasEspecificas = colunasAnimais.rows.map(c => ({
        nome: c.column_name,
        tipo: c.data_type
      }))
    } catch (error) {
      results.tabelas.animais.erroColunas = error.message
    }

    // Testar inserção de ocorrência (simulação)
    try {
      const testeQuery = await databaseService.query(`
        SELECT COUNT(*) as total 
        FROM historia_ocorrencias 
        WHERE created_at > NOW() - INTERVAL '1 day'
      `)
      results.apis.ocorrencias = {
        funcionando: true,
        ocorrenciasHoje: parseInt(testeQuery.rows[0].total)
      }
    } catch (error) {
      results.apis.ocorrencias = {
        funcionando: false,
        erro: error.message
      }
    }

    // Verificar constraint UNIQUE em localizacoes_animais
    try {
      const constraints = await databaseService.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'localizacoes_animais'
        AND constraint_type = 'UNIQUE'
      `)
      results.tabelas.localizacoes_animais.constraints = constraints.rows
    } catch (error) {
      results.tabelas.localizacoes_animais.erroConstraints = error.message
    }

    return sendSuccess(res, results, 'Teste de integração concluído')

  } catch (error) {
    logger.error('Erro no teste de integração:', error)
    return sendError(res, `Erro no teste: ${error.message}`, 500)
  }
})

