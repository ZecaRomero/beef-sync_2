import databaseService from '../../../services/databaseService'
import logger from '../../../utils/logger'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    logger.info('API: Buscando métricas avançadas do dashboard')

    // Buscar estatísticas básicas
    const basicStats = await databaseService.getSystemStats()

    // Calcular métricas avançadas
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    // Animais ativos (situação = 'Ativo')
    const animaisAtivos = await databaseService.query(`
      SELECT COUNT(*) as count 
      FROM animais 
      WHERE situacao = 'Ativo'
    `)
    
    // Receita total (soma de valor_venda de todos os animais)
    const receitaTotal = await databaseService.query(`
      SELECT COALESCE(SUM(valor_venda), 0) as total 
      FROM animais 
      WHERE valor_venda IS NOT NULL
    `)
    
    // Custos totais (soma de custo_total de todos os animais)
    const custosTotais = await databaseService.query(`
      SELECT COALESCE(SUM(custo_total), 0) as total 
      FROM animais 
      WHERE custo_total IS NOT NULL
    `)

    // Animais nascidos este mês
    const nascimentosEsteMes = await databaseService.query(`
      SELECT COUNT(*) as count 
      FROM nascimentos 
      WHERE EXTRACT(MONTH FROM data_nascimento) = $1 
      AND EXTRACT(YEAR FROM data_nascimento) = $2
    `, [currentMonth, currentYear])

    // Receita deste mês (aproximada baseada em vendas recentes)
    const receitaEsteMes = await databaseService.query(`
      SELECT COALESCE(SUM(valor_venda), 0) as total 
      FROM animais 
      WHERE EXTRACT(MONTH FROM created_at) = $1 
      AND EXTRACT(YEAR FROM created_at) = $2
      AND situacao = 'Vendido'
    `, [currentMonth, currentYear])

    // Sêmen disponível
    const semenDisponivel = await databaseService.query(`
      SELECT COUNT(*) as count 
      FROM estoque_semen 
      WHERE status = 'Disponível'
    `)

    // Calcular lucratividade
    const receita = parseFloat(receitaTotal.rows[0].total) || 0
    const custos = parseFloat(custosTotais.rows[0].total) || 0
    const lucratividade = custos > 0 ? ((receita - custos) / custos) * 100 : 0

    // Calcular crescimento mensal (simulado)
    const crescimentoMensal = Math.floor(Math.random() * 10) + 1
    const crescimentoReceita = Math.floor(Math.random() * 20) + 5
    const reducaoCustos = Math.floor(Math.random() * 15) + 2

    const metrics = {
      // Métricas básicas
      totalAnimals: basicStats.totalAnimals,
      activeAnimals: parseInt(animaisAtivos.rows[0].count),
      totalRevenue: receita,
      monthlyRevenue: parseFloat(receitaEsteMes.rows[0].total) || 0,
      totalCosts: custos,
      monthlyCosts: custos * 0.1, // Aproximação
      profitability: Math.round(lucratividade * 100) / 100,
      
      // Métricas de crescimento
      animalsPerMonth: parseInt(nascimentosEsteMes.rows[0].count),
      revenueGrowth: crescimentoReceita,
      costReduction: reducaoCustos,
      availableSemen: parseInt(semenDisponivel.rows[0].count),
      
      // Indicadores de performance (simulados)
      efficiency: Math.floor(Math.random() * 20) + 80, // 80-100%
      productivity: Math.floor(Math.random() * 15) + 85, // 85-100%
      quality: Math.floor(Math.random() * 20) + 75, // 75-95%
      
      // Metadados
      lastUpdated: new Date().toISOString(),
      period: {
        month: currentMonth,
        year: currentYear
      }
    }

    logger.info('Métricas avançadas calculadas com sucesso', {
      totalAnimals: metrics.totalAnimals,
      activeAnimals: metrics.activeAnimals,
      profitability: metrics.profitability
    })

    res.status(200).json(metrics)

  } catch (error) {
    logger.error('Erro ao buscar métricas avançadas:', error)
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
