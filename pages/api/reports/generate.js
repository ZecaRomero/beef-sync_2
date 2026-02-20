import { query } from '../../../lib/database'
import { sendSuccess, sendValidationError, sendMethodNotAllowed, sendError, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, 'POST')
  }

  const { reports, period, sections, preview } = req.body

  if (!reports || !Array.isArray(reports) || reports.length === 0) {
    return sendValidationError(res, 'Tipos de relatório são obrigatórios')
  }

  if (!period || !period.startDate || !period.endDate) {
    return sendValidationError(res, 'Período é obrigatório')
  }

  const reportData = {}

  // Generate each requested report
  for (const reportType of reports) {
    switch (reportType) {
      case 'monthly_summary':
        reportData.monthly_summary = await generateMonthlySummary(period, sections?.[reportType])
        break
      case 'births_analysis':
        reportData.births_analysis = await generateBirthsAnalysis(period, sections?.[reportType])
        break
      case 'breeding_report':
        reportData.breeding_report = await generateBreedingReport(period, sections?.[reportType])
        break
      case 'financial_summary':
        reportData.financial_summary = await generateFinancialSummary(period, sections?.[reportType])
        break
      case 'inventory_report':
        reportData.inventory_report = await generateInventoryReport(period, sections?.[reportType])
        break
      case 'location_report':
        reportData.location_report = await generateLocationReport(period, sections?.[reportType])
        break
    }
  }

  // If preview, return simplified data
  if (preview) {
    const previewData = await generatePreviewData(period)
    return sendSuccess(res, previewData, 'Preview do relatório gerado com sucesso')
  }

  return sendSuccess(res, {
    data: reportData,
    period,
    generatedAt: new Date().toISOString()
  }, 'Relatório gerado com sucesso')
}

async function generatePreviewData(period) {
  try {
    // Get basic statistics for preview
    const totalAnimalsResult = await query(
      'SELECT COUNT(*) as total FROM animais WHERE created_at BETWEEN $1 AND $2',
      [period.startDate, period.endDate]
    )

    const birthsResult = await query(
      'SELECT COUNT(*) as total FROM nascimentos WHERE data BETWEEN $1 AND $2',
      [period.startDate, period.endDate]
    )

    const deathsResult = await query(
      'SELECT COUNT(*) as total FROM animais WHERE situacao = $1 AND updated_at BETWEEN $2 AND $3',
      ['Morto', period.startDate, period.endDate]
    )

    const salesResult = await query(
      'SELECT COUNT(*) as total FROM animais WHERE situacao = $1 AND updated_at BETWEEN $2 AND $3',
      ['Vendido', period.startDate, period.endDate]
    )

    return {
      totalAnimals: parseInt(totalAnimalsResult.rows[0]?.total || 0),
      births: parseInt(birthsResult.rows[0]?.total || 0),
      deaths: parseInt(deathsResult.rows[0]?.total || 0),
      sales: parseInt(salesResult.rows[0]?.total || 0)
    }
  } catch (error) {
    logger.error('Erro ao gerar preview:', error)
    return {
      totalAnimals: 0,
      births: 0,
      deaths: 0,
      sales: 0
    }
  }
}

async function generateMonthlySummary(period, sections) {
  const summary = {}

  try {
    // Nascimentos
    if (!sections || sections.nascimentos !== false) {
      const nascimentosResult = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN sexo = 'M' THEN 1 END) as machos,
          COUNT(CASE WHEN sexo = 'F' THEN 1 END) as femeas,
          AVG(CASE WHEN custo_dna > 0 THEN custo_dna END) as peso_medio,
          COUNT(CASE WHEN observacao LIKE '%dificil%' THEN 1 END) as partos_dificeis
        FROM nascimentos 
        WHERE data BETWEEN $1 AND $2
      `, [period.startDate, period.endDate])

      summary.nascimentos = nascimentosResult.rows[0]
    }

    // Mortes
    if (!sections || sections.mortes !== false) {
      const mortesResult = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN sexo = 'Macho' THEN 1 END) as machos,
          COUNT(CASE WHEN sexo = 'Fêmea' THEN 1 END) as femeas
        FROM animais 
        WHERE situacao = 'Morto' AND updated_at BETWEEN $1 AND $2
      `, [period.startDate, period.endDate])

      summary.mortes = mortesResult.rows[0]
    }

    // Vendas
    if (!sections || sections.vendas !== false) {
      const vendasResult = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(valor_venda) as valor_total,
          AVG(valor_venda) as valor_medio
        FROM animais 
        WHERE situacao = 'Vendido' AND updated_at BETWEEN $1 AND $2
      `, [period.startDate, period.endDate])

      summary.vendas = vendasResult.rows[0]
    }

    // Compras
    if (!sections || sections.compras !== false) {
      const comprasResult = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(custo_total) as valor_total
        FROM animais 
        WHERE created_at BETWEEN $1 AND $2 AND custo_total > 0
      `, [period.startDate, period.endDate])

      summary.compras = comprasResult.rows[0]
    }

    // Gestação - comentado pois a tabela não existe
    /*
    if (!sections || sections.gestacao !== false) {
      const gestacaoResult = await query(`
        SELECT 
          COUNT(*) as femeas_gestantes,
          COUNT(CASE WHEN data_prevista_parto BETWEEN $2 AND $3 THEN 1 END) as partos_previstos_proximo_mes
        FROM gestacao 
        WHERE status = 'Gestante' AND data_cobertura BETWEEN $1 AND $2
      `, [period.startDate, period.endDate, getNextMonthRange(period.endDate)])

      summary.gestacao = gestacaoResult.rows[0]
    }
    */

    // Estatísticas gerais
    if (!sections || sections.estatisticas_gerais !== false) {
      const estatisticasResult = await query(`
        SELECT 
          COUNT(*) as total_rebanho,
          COUNT(CASE WHEN sexo = 'Macho' THEN 1 END) as total_machos,
          COUNT(CASE WHEN sexo = 'Fêmea' THEN 1 END) as total_femeas,
          COUNT(CASE WHEN situacao = 'Ativo' THEN 1 END) as ativos
        FROM animais
      `)

      summary.estatisticas_gerais = estatisticasResult.rows[0]
    }

    return summary
  } catch (error) {
    logger.error('Erro ao gerar resumo mensal:', error)
    return {}
  }
}

async function generateBirthsAnalysis(period, sections) {
  const analysis = {}

  try {
    // Nascimentos por pai
    if (!sections || sections.nascimentos_por_pai !== false) {
      const porPaiResult = await query(`
        SELECT 
          touro as pai,
          COUNT(*) as total_filhos,
          COUNT(CASE WHEN sexo = 'M' THEN 1 END) as machos,
          COUNT(CASE WHEN sexo = 'F' THEN 1 END) as femeas,
          AVG(custo_dna) as peso_medio
        FROM nascimentos 
        WHERE data BETWEEN $1 AND $2 AND touro IS NOT NULL AND touro != ''
        GROUP BY touro
        ORDER BY total_filhos DESC
      `, [period.startDate, period.endDate])

      analysis.nascimentos_por_pai = porPaiResult.rows
    }

    // Nascimentos por mãe
    if (!sections || sections.nascimentos_por_mae !== false) {
      const porMaeResult = await query(`
        SELECT 
          receptora as mae,
          COUNT(*) as total_filhos,
          COUNT(CASE WHEN sexo = 'M' THEN 1 END) as machos,
          COUNT(CASE WHEN sexo = 'F' THEN 1 END) as femeas,
          AVG(custo_dna) as peso_medio
        FROM nascimentos 
        WHERE data BETWEEN $1 AND $2 AND receptora IS NOT NULL AND receptora != ''
        GROUP BY receptora
        ORDER BY total_filhos DESC
      `, [period.startDate, period.endDate])

      analysis.nascimentos_por_mae = porMaeResult.rows
    }

    // Distribuição por sexo
    if (!sections || sections.distribuicao_sexo !== false) {
      const sexoResult = await query(`
        SELECT 
          sexo,
          COUNT(*) as total,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentual
        FROM nascimentos 
        WHERE data BETWEEN $1 AND $2
        GROUP BY sexo
      `, [period.startDate, period.endDate])

      analysis.distribuicao_sexo = sexoResult.rows
    }

    // Média de peso
    if (!sections || sections.media_peso !== false) {
      const pesoResult = await query(`
        SELECT 
          AVG(custo_dna) as peso_medio_geral,
          AVG(CASE WHEN sexo = 'M' THEN custo_dna END) as peso_medio_machos,
          AVG(CASE WHEN sexo = 'F' THEN custo_dna END) as peso_medio_femeas,
          MIN(custo_dna) as peso_minimo,
          MAX(custo_dna) as peso_maximo
        FROM nascimentos 
        WHERE data BETWEEN $1 AND $2 AND custo_dna IS NOT NULL
      `, [period.startDate, period.endDate])

      analysis.media_peso = pesoResult.rows[0]
    }

    // Dificuldades de parto
    if (!sections || sections.dificuldades_parto !== false) {
      const dificuldadesResult = await query(`
        SELECT 
          CASE 
            WHEN observacao LIKE '%dificil%' THEN 'Difícil'
            WHEN observacao LIKE '%normal%' THEN 'Normal'
            ELSE 'Não informado'
          END as dificuldade_parto,
          COUNT(*) as total,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentual
        FROM nascimentos 
        WHERE data BETWEEN $1 AND $2
        GROUP BY CASE 
          WHEN observacao LIKE '%dificil%' THEN 'Difícil'
          WHEN observacao LIKE '%normal%' THEN 'Normal'
          ELSE 'Não informado'
        END
        ORDER BY total DESC
      `, [period.startDate, period.endDate])

      analysis.dificuldades_parto = dificuldadesResult.rows
    }

    return analysis
  } catch (error) {
    logger.error('Erro ao gerar análise de nascimentos:', error)
    return {}
  }
}

async function generateBreedingReport(period, sections) {
  const report = {}

  try {
    // Fêmeas gestantes
    if (!sections || sections.femeas_gestantes !== false) {
      const gestantesResult = await query(`
        SELECT 
          COUNT(*) as total_gestantes,
          AVG(EXTRACT(DAY FROM (CURRENT_DATE::date - data_cobertura::date))) as dias_medio_gestacao
        FROM gestacao 
        WHERE status = 'Gestante'
      `)

      report.femeas_gestantes = gestantesResult.rows[0]
    }

    // Previsão de partos
    if (!sections || sections.previsao_partos !== false) {
      const previsaoResult = await query(`
        SELECT 
          DATE_TRUNC('month', data_prevista_parto) as mes,
          COUNT(*) as partos_previstos
        FROM gestacao 
        WHERE status = 'Gestante' AND data_prevista_parto >= CURRENT_DATE
        GROUP BY DATE_TRUNC('month', data_prevista_parto)
        ORDER BY mes
        LIMIT 6
      `)

      report.previsao_partos = previsaoResult.rows
    }

    // Taxa de prenhez
    if (!sections || sections.taxa_prenhez !== false) {
      const taxaResult = await query(`
        SELECT 
          COUNT(CASE WHEN status = 'Gestante' THEN 1 END) as gestantes,
          COUNT(CASE WHEN status = 'Vazia' THEN 1 END) as vazias,
          COUNT(*) as total_femeas,
          ROUND((COUNT(CASE WHEN status = 'Gestante' THEN 1 END) * 100.0 / COUNT(*)), 2) as taxa_prenhez
        FROM gestacao
      `)

      report.taxa_prenhez = taxaResult.rows[0]
    }

    return report
  } catch (error) {
    logger.error('Erro ao gerar relatório de reprodução:', error)
    return {}
  }
}

async function generateFinancialSummary(period, sections) {
  const summary = {}

  try {
    // Receitas
    if (!sections || sections.receitas !== false) {
      const receitasResult = await query(`
        SELECT 
          SUM(valor_venda) as total_vendas,
          COUNT(CASE WHEN situacao = 'Vendido' THEN 1 END) as animais_vendidos,
          AVG(valor_venda) as valor_medio_venda
        FROM animais 
        WHERE situacao = 'Vendido' AND updated_at BETWEEN $1 AND $2
      `, [period.startDate, period.endDate])

      summary.receitas = receitasResult.rows[0]
    }

    // Custos
    if (!sections || sections.custos !== false) {
      const custosResult = await query(`
        SELECT 
          SUM(valor) as total_custos,
          AVG(valor) as custo_medio,
          COUNT(*) as total_lancamentos
        FROM custos 
        WHERE data BETWEEN $1 AND $2
      `, [period.startDate, period.endDate])

      summary.custos = custosResult.rows[0]
    }

    return summary
  } catch (error) {
    logger.error('Erro ao gerar resumo financeiro:', error)
    return {}
  }
}

async function generateInventoryReport(period, sections) {
  const report = {}

  try {
    // Estoque de sêmen - estatísticas gerais
    if (!sections || sections.estoque_semen !== false) {
      const estoqueResult = await query(`
        SELECT 
          COUNT(*) as total_registros,
          COUNT(DISTINCT nome_touro) as total_touros,
          SUM(quantidade_doses) as total_doses,
          SUM(doses_disponiveis) as doses_disponiveis,
          SUM(doses_usadas) as doses_usadas,
          SUM(CASE WHEN doses_disponiveis <= 5 THEN 1 ELSE 0 END) as alertas_estoque_baixo,
          AVG(valor_compra) as valor_medio,
          SUM(valor_compra * quantidade_doses) as valor_total_estoque
        FROM estoque_semen
        WHERE status = 'disponivel'
      `)

      report.estoque_semen = estoqueResult.rows[0]
    }

    // Detalhes por touro
    if (!sections || sections.detalhes_touros !== false) {
      const tourosResult = await query(`
        SELECT 
          nome_touro,
          rg_touro,
          raca,
          localizacao,
          SUM(quantidade_doses) as total_doses,
          SUM(doses_disponiveis) as doses_disponiveis,
          SUM(doses_usadas) as doses_usadas,
          AVG(valor_compra) as valor_medio,
          COUNT(*) as total_entradas,
          MAX(data_compra) as ultima_compra
        FROM estoque_semen
        WHERE status = 'disponivel'
        GROUP BY nome_touro, rg_touro, raca, localizacao
        ORDER BY doses_disponiveis DESC
      `)

      report.detalhes_touros = tourosResult.rows
    }

    // Movimentações no período
    if (!sections || sections.movimentacoes_periodo !== false) {
      const movimentacoesResult = await query(`
        SELECT 
          nome_touro,
          tipo_operacao,
          quantidade_doses,
          valor_compra,
          data_compra,
          fornecedor,
          numero_nf
        FROM estoque_semen
        WHERE data_compra BETWEEN $1 AND $2
        ORDER BY data_compra DESC
      `, [period.startDate, period.endDate])

      report.movimentacoes_periodo = movimentacoesResult.rows
    }

    return report
  } catch (error) {
    logger.error('Erro ao gerar relatório de estoque:', error)
    return {}
  }
}

async function generateLocationReport(period, sections) {
  const report = {}

  try {
    // Localização atual dos animais
    if (!sections || sections.localizacao_atual !== false) {
      const localizacaoAtualResult = await query(`
        SELECT 
          a.id,
          a.serie,
          a.rg,
          a.raca,
          a.sexo,
          a.situacao,
          l.piquete,
          l.data_entrada,
          l.motivo_movimentacao,
          l.usuario_responsavel,
          l.observacoes
        FROM animais a
        LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
        WHERE a.situacao = 'Ativo'
        ORDER BY l.piquete NULLS LAST, a.serie, a.rg
      `)

      report.localizacao_atual = localizacaoAtualResult.rows
    }

    // Histórico de movimentações no período
    if (!sections || sections.historico_movimentacoes !== false) {
      const historicoResult = await query(`
        SELECT 
          a.serie,
          a.rg,
          a.raca,
          l.piquete,
          l.data_entrada,
          l.data_saida,
          l.motivo_movimentacao,
          l.usuario_responsavel,
          (COALESCE(l.data_saida, CURRENT_DATE)::date - l.data_entrada::date) as dias_permanencia
        FROM localizacoes_animais l
        JOIN animais a ON l.animal_id = a.id
        WHERE l.data_entrada BETWEEN $1 AND $2
           OR l.data_saida BETWEEN $1 AND $2
        ORDER BY l.data_entrada DESC
      `, [period.startDate, period.endDate])

      report.historico_movimentacoes = historicoResult.rows
    }

    // Animais por piquete
    if (!sections || sections.animais_por_piquete !== false) {
      const porPiqueteResult = await query(`
        SELECT 
          l.piquete,
          COUNT(*) as total_animais,
          COUNT(CASE WHEN a.sexo = 'Macho' THEN 1 END) as machos,
          COUNT(CASE WHEN a.sexo = 'Fêmea' THEN 1 END) as femeas,
          STRING_AGG(DISTINCT a.raca, ', ') as racas
        FROM localizacoes_animais l
        JOIN animais a ON l.animal_id = a.id
        WHERE l.data_saida IS NULL AND a.situacao = 'Ativo'
        GROUP BY l.piquete
        ORDER BY total_animais DESC
      `)

      report.animais_por_piquete = porPiqueteResult.rows
    }

    // Movimentações recentes
    if (!sections || sections.movimentacoes_recentes !== false) {
      const recentesResult = await query(`
        SELECT 
          a.serie,
          a.rg,
          a.raca,
          l.piquete as piquete_origem,
          l.data_saida,
          l2.piquete as piquete_destino,
          l2.data_entrada,
          l2.motivo_movimentacao,
          l2.usuario_responsavel
        FROM localizacoes_animais l
        JOIN animais a ON l.animal_id = a.id
        LEFT JOIN localizacoes_animais l2 ON l2.animal_id = a.id 
          AND l2.data_entrada = l.data_saida
        WHERE l.data_saida BETWEEN $1 AND $2
        ORDER BY l.data_saida DESC
        LIMIT 50
      `, [period.startDate, period.endDate])

      report.movimentacoes_recentes = recentesResult.rows
    }

    // Animais sem localização
    if (!sections || sections.animais_sem_localizacao !== false) {
      const semLocalizacaoResult = await query(`
        SELECT 
          a.id,
          a.serie,
          a.rg,
          a.raca,
          a.sexo,
          a.data_nascimento,
          a.created_at
        FROM animais a
        LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
        WHERE a.situacao = 'Ativo' AND l.id IS NULL
        ORDER BY a.created_at DESC
      `)

      report.animais_sem_localizacao = semLocalizacaoResult.rows
    }

    // Estatísticas gerais de localização
    const estatisticasResult = await query(`
      SELECT 
        COUNT(DISTINCT a.id) as total_animais,
        COUNT(DISTINCT CASE WHEN l.id IS NOT NULL THEN a.id END) as animais_localizados,
        COUNT(DISTINCT CASE WHEN l.id IS NULL THEN a.id END) as animais_sem_localizacao,
        COUNT(DISTINCT l.piquete) as total_piquetes
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
      WHERE a.situacao = 'Ativo'
    `)

    report.estatisticas = estatisticasResult.rows[0]

    return report
  } catch (error) {
    logger.error('Erro ao gerar relatório de localização:', error)
    return {}
  }
}

function getNextMonthRange(endDate) {
  const date = new Date(endDate)
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0)
  return nextMonth.toISOString().split('T')[0]
}

// Export individual report generation functions for use in download API
export { 
  generateMonthlySummary, 
  generateBirthsAnalysis, 
  generateBreedingReport, 
  generateFinancialSummary,
  generateInventoryReport,
  generateLocationReport
}

export default asyncHandler(handler)