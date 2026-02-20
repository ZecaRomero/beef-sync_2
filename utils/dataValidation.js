// Utilitários de validação de dados para o sistema Beef Sync

/**
 * Valida se um valor é um array válido
 * @param {any} value - Valor a ser validado
 * @returns {boolean} - True se for um array válido
 */
export const isValidArray = (value) => {
  return Array.isArray(value) && value.length >= 0
}

/**
 * Valida se um valor é um objeto válido
 * @param {any} value - Valor a ser validado
 * @returns {boolean} - True se for um objeto válido
 */
export const isValidObject = (value) => {
  return value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Valida se um valor é um número válido
 * @param {any} value - Valor a ser validado
 * @param {number} min - Valor mínimo (opcional)
 * @param {number} max - Valor máximo (opcional)
 * @returns {boolean} - True se for um número válido
 */
export const isValidNumber = (value, min = null, max = null) => {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  if (min !== null && num < min) return false
  if (max !== null && num > max) return false
  return true
}

/**
 * Valida se uma string é válida
 * @param {any} value - Valor a ser validado
 * @param {number} minLength - Tamanho mínimo (opcional)
 * @param {number} maxLength - Tamanho máximo (opcional)
 * @returns {boolean} - True se for uma string válida
 */
export const isValidString = (value, minLength = 0, maxLength = null) => {
  if (typeof value !== 'string') return false
  if (value.length < minLength) return false
  if (maxLength !== null && value.length > maxLength) return false
  return true
}

/**
 * Valida dados de animal
 * @param {any} animal - Dados do animal
 * @returns {boolean} - True se os dados são válidos
 */
export const validateAnimal = (animal) => {
  if (!isValidObject(animal)) return false
  
  // Campos obrigatórios
  const requiredFields = ['serie', 'rg', 'sexo', 'raca']
  for (const field of requiredFields) {
    if (!isValidString(animal[field], 1)) return false
  }
  
  // Campos opcionais com validação
  if (animal.peso && !isValidNumber(animal.peso, 0)) return false
  if (animal.custo_total && !isValidNumber(animal.custo_total, 0)) return false
  if (animal.valor_venda && !isValidNumber(animal.valor_venda, 0)) return false
  
  return true
}

/**
 * Valida dados de custo
 * @param {any} custo - Dados do custo
 * @returns {boolean} - True se os dados são válidos
 */
export const validateCusto = (custo) => {
  if (!isValidObject(custo)) return false
  
  // Campos obrigatórios
  if (!isValidString(custo.tipo, 1)) return false
  if (!isValidNumber(custo.valor, 0)) return false
  if (!isValidString(custo.data, 1)) return false
  
  return true
}

/**
 * Valida dados de nascimento
 * @param {any} nascimento - Dados do nascimento
 * @returns {boolean} - True se os dados são válidos
 */
export const validateNascimento = (nascimento) => {
  if (!isValidObject(nascimento)) return false
  
  // Campos obrigatórios
  const requiredFields = ['serie', 'rg', 'sexo', 'data_nascimento']
  for (const field of requiredFields) {
    if (!isValidString(nascimento[field], 1)) return false
  }
  
  // Campos opcionais com validação
  if (nascimento.peso && !isValidNumber(nascimento.peso, 0)) return false
  if (nascimento.custo_nascimento && !isValidNumber(nascimento.custo_nascimento, 0)) return false
  
  return true
}

/**
 * Valida dados de sêmen
 * @param {any} semen - Dados do sêmen
 * @returns {boolean} - True se os dados são válidos
 */
export const validateSemen = (semen) => {
  if (!isValidObject(semen)) return false
  
  // Campos obrigatórios
  if (!isValidString(semen.nome_touro || semen.serie, 1)) return false
  if (!isValidNumber(semen.quantidade_doses, 1)) return false
  if (!isValidNumber(semen.valor_unitario || semen.preco_por_dose, 0)) return false
  
  return true
}

/**
 * Sanitiza dados do localStorage
 * @param {string} key - Chave do localStorage
 * @param {any} defaultValue - Valor padrão
 * @returns {any} - Dados sanitizados
 */
export const sanitizeLocalStorageData = (key, defaultValue = null) => {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const data = localStorage.getItem(key)
    if (!data) return defaultValue
    
    const parsed = JSON.parse(data)
    return parsed
  } catch (error) {
    console.warn(`Erro ao carregar dados do localStorage (${key}):`, error)
    return defaultValue
  }
}

/**
 * Sanitiza array de dados
 * @param {any} data - Dados a serem sanitizados
 * @param {function} validator - Função de validação
 * @returns {Array} - Array sanitizado
 */
export const sanitizeArray = (data, validator = null) => {
  if (!isValidArray(data)) return []
  
  return data.filter(item => {
    if (!item) return false
    if (validator && typeof validator === 'function') {
      return validator(item)
    }
    return true
  })
}

/**
 * Sanitiza dados de API
 * @param {any} response - Resposta da API
 * @param {string} dataKey - Chave dos dados na resposta
 * @param {function} validator - Função de validação
 * @returns {Array} - Dados sanitizados
 */
export const sanitizeApiResponse = (response, dataKey = 'data', validator = null) => {
  if (!isValidObject(response)) return []
  
  const data = response[dataKey]
  if (!isValidArray(data)) return []
  
  return sanitizeArray(data, validator)
}

/**
 * Valida configurações do sistema
 * @param {any} config - Configurações
 * @returns {boolean} - True se as configurações são válidas
 */
export const validateSystemConfig = (config) => {
  if (!isValidObject(config)) return false
  
  // Configurações obrigatórias
  const requiredConfigs = ['theme', 'language', 'currency']
  for (const configKey of requiredConfigs) {
    if (!isValidString(config[configKey], 1)) return false
  }
  
  return true
}

/**
 * Valida dados de protocolo
 * @param {any} protocolo - Dados do protocolo
 * @returns {boolean} - True se os dados são válidos
 */
export const validateProtocolo = (protocolo) => {
  if (!isValidObject(protocolo)) return false
  
  // Campos obrigatórios
  if (!isValidString(protocolo.nome, 1)) return false
  if (!isValidString(protocolo.sexo, 1)) return false
  if (!isValidString(protocolo.era, 1)) return false
  
  // Validar medicamentos se existirem
  if (protocolo.medicamentos && isValidArray(protocolo.medicamentos)) {
    for (const medicamento of protocolo.medicamentos) {
      if (!isValidObject(medicamento)) return false
      if (!isValidString(medicamento.nome, 1)) return false
      if (!isValidNumber(medicamento.quantidade, 1)) return false
    }
  }
  
  return true
}

/**
 * Valida dados de medicamento
 * @param {any} medicamento - Dados do medicamento
 * @returns {boolean} - True se os dados são válidos
 */
export const validateMedicamento = (medicamento) => {
  if (!isValidObject(medicamento)) return false
  
  // Campos obrigatórios
  if (!isValidString(medicamento.nome, 1)) return false
  if (!isValidNumber(medicamento.quantidade, 1)) return false
  if (!isValidString(medicamento.unidade, 1)) return false
  
  return true
}

/**
 * Valida dados de nota fiscal
 * @param {any} notaFiscal - Dados da nota fiscal
 * @returns {boolean} - True se os dados são válidos
 */
export const validateNotaFiscal = (notaFiscal) => {
  if (!isValidObject(notaFiscal)) return false
  
  // Campos obrigatórios
  if (!isValidString(notaFiscal.numero, 1)) return false
  if (!isValidString(notaFiscal.data, 1)) return false
  if (!isValidNumber(notaFiscal.valor, 0)) return false
  
  return true
}

/**
 * Valida dados de relatório
 * @param {any} relatorio - Dados do relatório
 * @returns {boolean} - True se os dados são válidos
 */
export const validateRelatorio = (relatorio) => {
  if (!isValidObject(relatorio)) return false
  
  // Campos obrigatórios
  if (!isValidString(relatorio.tipo, 1)) return false
  if (!isValidString(relatorio.periodo, 1)) return false
  
  return true
}

/**
 * Valida dados de backup
 * @param {any} backup - Dados do backup
 * @returns {boolean} - True se os dados são válidos
 */
export const validateBackup = (backup) => {
  if (!isValidObject(backup)) return false
  
  // Campos obrigatórios
  if (!isValidString(backup.data_backup, 1)) return false
  if (!isValidString(backup.versao, 1)) return false
  
  return true
}

// Exportar todas as funções de validação
export default {
  isValidArray,
  isValidObject,
  isValidNumber,
  isValidString,
  validateAnimal,
  validateCusto,
  validateNascimento,
  validateSemen,
  validateProtocolo,
  validateMedicamento,
  validateNotaFiscal,
  validateRelatorio,
  validateBackup,
  validateSystemConfig,
  sanitizeLocalStorageData,
  sanitizeArray,
  sanitizeApiResponse
}
