import { query } from '../../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'ID do animal é obrigatório' })
  }

  try {
    // Get animal data
    const animalResult = await query(
      'SELECT * FROM animais WHERE id = $1',
      [id]
    )

    if (animalResult.rows.length === 0) {
      return res.status(404).json({ message: 'Animal não encontrado' })
    }

    const animal = animalResult.rows[0]

    // Calculate ROI analysis
    const analysis = await calculateROIAnalysis(animal)

    res.status(200).json(analysis)

  } catch (error) {
    console.error('Erro ao calcular ROI:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

async function calculateROIAnalysis(animal) {
  try {
    // Calculate age in months
    const birthDate = animal.data_nascimento ? new Date(animal.data_nascimento) : null
    const ageInMonths = birthDate ? 
      Math.floor((new Date() - birthDate) / (1000 * 60 * 60 * 24 * 30)) : 
      animal.meses || 0

    // Get all costs for this animal
    const costsResult = await query(`
      SELECT 
        tipo,
        subtipo,
        valor,
        data,
        observacoes
      FROM custos 
      WHERE animal_id = $1
      ORDER BY data DESC
    `, [animal.id])

    // Calculate cost breakdown
    const costBreakdown = calculateCostBreakdown(costsResult.rows)
    const totalCosts = costBreakdown.reduce((sum, cost) => sum + cost.amount, 0)

    // Get current weight (latest weight record or estimated)
    const currentWeight = await getCurrentWeight(animal, ageInMonths)

    // Calculate market analysis
    const marketAnalysis = await getMarketAnalysis(animal)

    // Calculate suggested sale price based on weight, breed, and market
    const suggestedSalePrice = calculateSuggestedSalePrice(animal, currentWeight, marketAnalysis)

    // Calculate ROI
    const profit = suggestedSalePrice - totalCosts
    const roi = totalCosts > 0 ? ((profit / totalCosts) * 100) : 0

    // Determine if animal is a breeder
    const isBreeder = await isBreederAnimal(animal)

    // Get breeding value if applicable
    const breedingValue = isBreeder ? await calculateBreedingValue(animal) : 0

    return {
      animalId: animal.id,
      animalInfo: {
        serie: animal.serie,
        rg: animal.rg,
        sexo: animal.sexo,
        raca: animal.raca,
        situacao: animal.situacao
      },
      ageInMonths,
      currentWeight,
      totalCosts,
      costBreakdown,
      suggestedSalePrice,
      profit,
      roi,
      isBreeder,
      breedingValue,
      marketConditions: marketAnalysis,
      recommendation: generateRecommendation({
        roi,
        ageInMonths,
        currentWeight,
        isBreeder,
        marketAnalysis,
        animal
      }),
      marketPrice: marketAnalysis.averagePrice,
      marketTrend: marketAnalysis.trend,
      marketDemand: marketAnalysis.demand,
      profitabilityScore: calculateProfitabilityScore({
        roi,
        ageInMonths,
        currentWeight,
        marketAnalysis
      })
    }

  } catch (error) {
    console.error('Erro no cálculo de ROI:', error)
    throw error
  }
}

function calculateCostBreakdown(costs) {
  const breakdown = {}

  costs.forEach(cost => {
    const category = cost.tipo || 'Outros'
    if (!breakdown[category]) {
      breakdown[category] = 0
    }
    breakdown[category] += parseFloat(cost.valor || 0)
  })

  return Object.entries(breakdown).map(([category, amount]) => ({
    category,
    amount
  })).sort((a, b) => b.amount - a.amount)
}

async function getCurrentWeight(animal, ageInMonths) {
  try {
    // Try to get latest weight from nascimentos or weight records
    const weightResult = await query(`
      SELECT peso 
      FROM nascimentos 
      WHERE animal_id = $1 
      ORDER BY data_nascimento DESC 
      LIMIT 1
    `, [animal.id])

    if (weightResult.rows.length > 0 && weightResult.rows[0].peso) {
      // Estimate current weight based on birth weight and age
      const birthWeight = parseFloat(weightResult.rows[0].peso)
      return estimateCurrentWeight(birthWeight, ageInMonths, animal.sexo)
    }

    // If no birth weight, estimate based on breed and age
    return estimateWeightByBreedAndAge(animal.raca, ageInMonths, animal.sexo)

  } catch (error) {
    console.error('Erro ao calcular peso atual:', error)
    return estimateWeightByBreedAndAge(animal.raca, ageInMonths, animal.sexo)
  }
}

function estimateCurrentWeight(birthWeight, ageInMonths, sexo) {
  // Growth curves based on typical cattle development
  const growthRates = {
    'Macho': [
      { months: 0, multiplier: 1 },
      { months: 6, multiplier: 8 },
      { months: 12, multiplier: 15 },
      { months: 18, multiplier: 20 },
      { months: 24, multiplier: 24 },
      { months: 36, multiplier: 28 }
    ],
    'Fêmea': [
      { months: 0, multiplier: 1 },
      { months: 6, multiplier: 7 },
      { months: 12, multiplier: 12 },
      { months: 18, multiplier: 16 },
      { months: 24, multiplier: 18 },
      { months: 36, multiplier: 20 }
    ]
  }

  const rates = growthRates[sexo] || growthRates['Fêmea']
  
  // Find appropriate multiplier for age
  let multiplier = 1
  for (let i = 0; i < rates.length - 1; i++) {
    if (ageInMonths >= rates[i].months && ageInMonths < rates[i + 1].months) {
      // Linear interpolation between points
      const ratio = (ageInMonths - rates[i].months) / (rates[i + 1].months - rates[i].months)
      multiplier = rates[i].multiplier + (rates[i + 1].multiplier - rates[i].multiplier) * ratio
      break
    }
  }
  
  if (ageInMonths >= rates[rates.length - 1].months) {
    multiplier = rates[rates.length - 1].multiplier
  }

  return Math.round(birthWeight * multiplier)
}

function estimateWeightByBreedAndAge(raca, ageInMonths, sexo) {
  // Average weights by breed and sex
  const breedWeights = {
    'Nelore': { 'Macho': 450, 'Fêmea': 350 },
    'Brahman': { 'Macho': 500, 'Fêmea': 380 },
    'Gir': { 'Macho': 420, 'Fêmea': 320 },
    'Receptora': { 'Fêmea': 400 }
  }

  const baseWeight = breedWeights[raca]?.[sexo] || 
                    breedWeights['Nelore'][sexo] || 
                    350

  // Adjust for age (assuming adult weight at 24 months)
  const ageRatio = Math.min(ageInMonths / 24, 1)
  return Math.round(baseWeight * ageRatio)
}

async function getMarketAnalysis(animal) {
  try {
    // Get recent sales data for similar animals
    const salesResult = await query(`
      SELECT 
        AVG(valor_venda) as avg_price,
        COUNT(*) as sales_count,
        MAX(updated_at) as latest_sale
      FROM animais 
      WHERE situacao = 'Vendido' 
        AND raca = $1 
        AND sexo = $2
        AND updated_at >= NOW() - INTERVAL '6 months'
    `, [animal.raca, animal.sexo])

    const salesData = salesResult.rows[0]
    const averagePrice = parseFloat(salesData.avg_price || 0)
    const salesCount = parseInt(salesData.sales_count || 0)

    // Determine market trend (simplified)
    const trend = averagePrice > 0 ? 'up' : 'stable'
    
    // Determine demand based on recent sales
    let demand = 'medium'
    if (salesCount > 10) demand = 'high'
    else if (salesCount < 3) demand = 'low'

    return {
      averagePrice: averagePrice || getDefaultMarketPrice(animal),
      trend,
      demand,
      salesCount,
      confidence: salesCount > 5 ? 'high' : salesCount > 2 ? 'medium' : 'low'
    }

  } catch (error) {
    console.error('Erro na análise de mercado:', error)
    return {
      averagePrice: getDefaultMarketPrice(animal),
      trend: 'stable',
      demand: 'medium',
      salesCount: 0,
      confidence: 'low'
    }
  }
}

function getDefaultMarketPrice(animal) {
  // Default market prices by breed and sex (per kg)
  const pricePerKg = {
    'Nelore': { 'Macho': 18, 'Fêmea': 16 },
    'Brahman': { 'Macho': 20, 'Fêmea': 18 },
    'Gir': { 'Macho': 17, 'Fêmea': 15 },
    'Receptora': { 'Fêmea': 14 }
  }

  return pricePerKg[animal.raca]?.[animal.sexo] || 16
}

function calculateSuggestedSalePrice(animal, currentWeight, marketAnalysis) {
  const pricePerKg = marketAnalysis.averagePrice || getDefaultMarketPrice(animal)
  const basePrice = currentWeight * pricePerKg

  // Adjust for market conditions
  let adjustment = 1
  if (marketAnalysis.trend === 'up' && marketAnalysis.demand === 'high') {
    adjustment = 1.1 // 10% premium
  } else if (marketAnalysis.trend === 'down' || marketAnalysis.demand === 'low') {
    adjustment = 0.9 // 10% discount
  }

  return Math.round(basePrice * adjustment)
}

async function isBreederAnimal(animal) {
  try {
    // Check if animal has offspring
    const offspringResult = await query(`
      SELECT COUNT(*) as offspring_count
      FROM animais 
      WHERE (pai LIKE $1 OR mae LIKE $1)
    `, [`%${animal.serie}${animal.rg}%`])

    const offspringCount = parseInt(offspringResult.rows[0].offspring_count || 0)
    
    // Consider breeder if has offspring or is female over 18 months
    return offspringCount > 0 || (animal.sexo === 'Fêmea' && animal.meses >= 18)

  } catch (error) {
    console.error('Erro ao verificar reprodutor:', error)
    return false
  }
}

async function calculateBreedingValue(animal) {
  try {
    // Calculate breeding value based on offspring performance
    const offspringResult = await query(`
      SELECT 
        COUNT(*) as total_offspring,
        AVG(CASE WHEN situacao = 'Vendido' THEN valor_venda END) as avg_offspring_value
      FROM animais 
      WHERE (pai LIKE $1 OR mae LIKE $1)
    `, [`%${animal.serie}${animal.rg}%`])

    const data = offspringResult.rows[0]
    const totalOffspring = parseInt(data.total_offspring || 0)
    const avgOffspringValue = parseFloat(data.avg_offspring_value || 0)

    // Simple breeding value calculation
    return totalOffspring * avgOffspringValue * 0.1 // 10% of offspring value

  } catch (error) {
    console.error('Erro ao calcular valor reprodutivo:', error)
    return 0
  }
}

function generateRecommendation(data) {
  const { roi, ageInMonths, currentWeight, isBreeder, marketAnalysis, animal } = data

  // Breeding animals have different criteria
  if (isBreeder && animal.sexo === 'Fêmea' && ageInMonths < 60) {
    return {
      type: 'hold',
      reason: 'Fêmea reprodutora em idade produtiva - manter para reprodução',
      urgency: 'none',
      details: 'Valor reprodutivo supera valor de venda atual'
    }
  }

  // High ROI and good age
  if (roi >= 30 && ageInMonths >= 18 && ageInMonths <= 36) {
    return {
      type: 'immediate',
      reason: 'ROI excelente e idade ideal para venda',
      urgency: 'high',
      details: `ROI de ${roi.toFixed(1)}% com ${ageInMonths} meses de idade`
    }
  }

  // Good ROI but need to wait for better weight
  if (roi >= 15 && ageInMonths >= 15) {
    return {
      type: 'soon',
      reason: 'Bom ROI, considere vender nos próximos 2-3 meses',
      urgency: 'medium',
      details: 'Aguardar ganho de peso adicional pode melhorar o retorno'
    }
  }

  // Fair ROI, wait for better conditions
  if (roi >= 5 && ageInMonths >= 12) {
    return {
      type: 'wait',
      reason: 'ROI razoável, aguardar melhores condições de mercado',
      urgency: 'low',
      details: 'Mercado pode melhorar ou animal pode ganhar mais peso'
    }
  }

  // Poor ROI or too young
  return {
    type: 'hold',
    reason: 'Animal muito jovem ou ROI insuficiente',
    urgency: 'none',
    details: 'Aguardar crescimento e desenvolvimento'
  }
}

function calculateProfitabilityScore(data) {
  const { roi, ageInMonths, currentWeight, marketAnalysis } = data

  let score = 0

  // ROI component (40% of score)
  if (roi >= 30) score += 40
  else if (roi >= 15) score += 30
  else if (roi >= 5) score += 20
  else if (roi >= 0) score += 10

  // Age component (30% of score)
  if (ageInMonths >= 18 && ageInMonths <= 36) score += 30
  else if (ageInMonths >= 15 && ageInMonths <= 48) score += 20
  else if (ageInMonths >= 12) score += 10

  // Market conditions (30% of score)
  if (marketAnalysis.demand === 'high' && marketAnalysis.trend === 'up') score += 30
  else if (marketAnalysis.demand === 'medium' || marketAnalysis.trend === 'up') score += 20
  else if (marketAnalysis.demand === 'low' && marketAnalysis.trend === 'down') score += 5
  else score += 15

  return Math.min(score, 100)
}