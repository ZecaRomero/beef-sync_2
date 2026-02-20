import { sendSuccess, sendValidationError, sendMethodNotAllowed, sendError, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

// Templates pré-definidos
const REPORT_TEMPLATES = [
  {
    id: 'executive_summary',
    name: 'Resumo Executivo',
    description: 'Visão geral completa para tomada de decisões estratégicas',
    category: 'Gestão',
    sections: [
      'header',
      'summary',
      'charts',
      'analysis'
    ],
    reportTypes: ['monthly_summary', 'financial_summary'],
    estimatedTime: '5-8 min',
    complexity: 'Médio',
    frequency: 'Mensal'
  },
  {
    id: 'financial_analysis',
    name: 'Análise Financeira Completa',
    description: 'Relatório detalhado de custos, receitas e rentabilidade',
    category: 'Financeiro',
    sections: [
      'header',
      'summary',
      'charts',
      'tables',
      'analysis'
    ],
    reportTypes: ['financial_summary'],
    estimatedTime: '8-12 min',
    complexity: 'Alto',
    frequency: 'Mensal'
  },
  {
    id: 'breeding_performance',
    name: 'Performance Reprodutiva',
    description: 'Análise completa do programa reprodutivo do rebanho',
    category: 'Reprodução',
    sections: [
      'header',
      'summary',
      'charts',
      'tables',
      'analysis'
    ],
    reportTypes: ['breeding_report', 'births_analysis'],
    estimatedTime: '6-10 min',
    complexity: 'Alto',
    frequency: 'Trimestral'
  },
  {
    id: 'location_tracking',
    name: 'Rastreamento e Localização',
    description: 'Monitoramento detalhado da movimentação dos animais',
    category: 'Operacional',
    sections: [
      'header',
      'summary',
      'charts',
      'tables'
    ],
    reportTypes: ['location_report'],
    estimatedTime: '4-6 min',
    complexity: 'Baixo',
    frequency: 'Semanal'
  }
]

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getTemplates(req, res)
    case 'POST':
      return createTemplate(req, res)
    case 'PUT':
      return updateTemplate(req, res)
    case 'DELETE':
      return deleteTemplate(req, res)
    default:
      return sendMethodNotAllowed(res, 'GET, POST, PUT, DELETE')
  }
}

async function getTemplates(req, res) {
  try {
    const { category, complexity } = req.query
    
    let templates = [...REPORT_TEMPLATES]
    
    // Filtrar por categoria se especificado
    if (category && category !== 'Todos') {
      templates = templates.filter(t => t.category === category)
    }
    
    // Filtrar por complexidade se especificado
    if (complexity) {
      templates = templates.filter(t => t.complexity === complexity)
    }
    
    // Carregar templates personalizados do localStorage/database
    // Por enquanto, retornar apenas os pré-definidos
    
    return sendSuccess(res, {
      templates,
      categories: [...new Set(REPORT_TEMPLATES.map(t => t.category))],
      complexities: [...new Set(REPORT_TEMPLATES.map(t => t.complexity))]
    }, 'Templates carregados com sucesso')
  } catch (error) {
    logger.error('Erro ao carregar templates:', error)
    return sendError(res, 'Erro interno do servidor')
  }
}

async function createTemplate(req, res) {
  try {
    const { name, description, category, sections, reportTypes, complexity, frequency } = req.body
    
    if (!name || !description || !category) {
      return sendValidationError(res, 'Nome, descrição e categoria são obrigatórios')
    }
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return sendValidationError(res, 'Pelo menos uma seção é obrigatória')
    }
    
    const newTemplate = {
      id: `custom_${Date.now()}`,
      name,
      description,
      category,
      sections,
      reportTypes: reportTypes || [],
      complexity: complexity || 'Médio',
      frequency: frequency || 'Mensal',
      estimatedTime: calculateEstimatedTime(sections),
      isCustom: true,
      createdAt: new Date().toISOString()
    }
    
    // Aqui você salvaria no banco de dados
    // Por enquanto, apenas retornar o template criado
    
    return sendSuccess(res, newTemplate, 'Template criado com sucesso')
  } catch (error) {
    logger.error('Erro ao criar template:', error)
    return sendError(res, 'Erro interno do servidor')
  }
}

async function updateTemplate(req, res) {
  try {
    const { id } = req.query
    const updates = req.body
    
    if (!id) {
      return sendValidationError(res, 'ID do template é obrigatório')
    }
    
    // Aqui você atualizaria no banco de dados
    // Por enquanto, apenas simular a atualização
    
    const updatedTemplate = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return sendSuccess(res, updatedTemplate, 'Template atualizado com sucesso')
  } catch (error) {
    logger.error('Erro ao atualizar template:', error)
    return sendError(res, 'Erro interno do servidor')
  }
}

async function deleteTemplate(req, res) {
  try {
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, 'ID do template é obrigatório')
    }
    
    // Verificar se é um template pré-definido (não pode ser deletado)
    const isBuiltIn = REPORT_TEMPLATES.some(t => t.id === id)
    if (isBuiltIn) {
      return sendValidationError(res, 'Templates pré-definidos não podem ser excluídos')
    }
    
    // Aqui você deletaria do banco de dados
    // Por enquanto, apenas simular a exclusão
    
    return sendSuccess(res, { id }, 'Template excluído com sucesso')
  } catch (error) {
    logger.error('Erro ao excluir template:', error)
    return sendError(res, 'Erro interno do servidor')
  }
}

function calculateEstimatedTime(sections) {
  // Calcular tempo estimado baseado no número de seções
  const baseTime = 3 // minutos base
  const timePerSection = 1.5 // minutos por seção
  
  const totalTime = baseTime + (sections.length * timePerSection)
  const minTime = Math.max(2, Math.floor(totalTime * 0.8))
  const maxTime = Math.ceil(totalTime * 1.2)
  
  return `${minTime}-${maxTime} min`
}

export default asyncHandler(handler)