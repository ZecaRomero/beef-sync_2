/**
 * Utilitários para formatação de datas no padrão brasileiro (DD/MM/AAAA)
 * Usar em todo o app para garantir consistência
 */

/**
 * Formata uma data para o padrão brasileiro DD/MM/AAAA
 * @param {Date|string} date - Data a ser formatada
 * @param {boolean} includeTime - Se true, inclui hora (DD/MM/AAAA HH:mm)
 * @returns {string} Data formatada
 */
export function formatDateBR(date, includeTime = false) {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    
    // Verificar se é uma data válida
    if (isNaN(d.getTime())) return ''
    
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    }
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return ''
  }
}

/**
 * Formata uma data para o padrão de nome de arquivo (AAAA-MM-DD)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada para arquivo
 */
export function formatDateForFilename(date = new Date()) {
  try {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch (error) {
    console.error('Erro ao formatar data para arquivo:', error)
    return 'data-invalida'
  }
}

/**
 * Formata um período de datas para exibição
 * @param {Date|string} startDate - Data inicial
 * @param {Date|string} endDate - Data final
 * @returns {string} Período formatado (DD/MM/AAAA a DD/MM/AAAA)
 */
export function formatPeriodBR(startDate, endDate) {
  const start = formatDateBR(startDate)
  const end = formatDateBR(endDate)
  
  if (!start && !end) return ''
  if (!start) return `até ${end}`
  if (!end) return `desde ${start}`
  
  return `${start} a ${end}`
}

/**
 * Converte data do formato ISO para DD/MM/AAAA
 * @param {string} isoDate - Data no formato ISO (AAAA-MM-DD)
 * @returns {string} Data no formato DD/MM/AAAA
 */
export function isoToBR(isoDate) {
  if (!isoDate) return ''
  
  try {
    const [year, month, day] = isoDate.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Erro ao converter data ISO:', error)
    return ''
  }
}

/**
 * Converte data do formato DD/MM/AAAA para ISO (AAAA-MM-DD)
 * @param {string} brDate - Data no formato DD/MM/AAAA
 * @returns {string} Data no formato ISO
 */
export function brToISO(brDate) {
  if (!brDate) return ''
  
  try {
    const [day, month, year] = brDate.split('/')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Erro ao converter data BR para ISO:', error)
    return ''
  }
}

/**
 * Retorna a data atual no formato DD/MM/AAAA
 * @param {boolean} includeTime - Se true, inclui hora
 * @returns {string} Data atual formatada
 */
export function getCurrentDateBR(includeTime = false) {
  return formatDateBR(new Date(), includeTime)
}

/**
 * Calcula diferença em dias entre duas datas
 * @param {Date|string} date1 - Data inicial
 * @param {Date|string} date2 - Data final
 * @returns {number} Diferença em dias
 */
export function daysDifference(date1, date2) {
  try {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2 - d1)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch (error) {
    console.error('Erro ao calcular diferença de dias:', error)
    return 0
  }
}

/**
 * Formata data para exibição em relatórios Excel
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada DD/MM/AAAA
 */
export function formatDateForExcel(date) {
  return formatDateBR(date)
}

/**
 * Formata data e hora para exibição em relatórios
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data e hora formatadas DD/MM/AAAA HH:mm:ss
 */
export function formatDateTimeForReport(date) {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error)
    return ''
  }
}

/**
 * Valida se uma string está no formato DD/MM/AAAA
 * @param {string} dateStr - String de data
 * @returns {boolean} True se válida
 */
export function isValidBRDate(dateStr) {
  if (!dateStr) return false
  
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
  if (!regex.test(dateStr)) return false
  
  const [, day, month, year] = dateStr.match(regex)
  const date = new Date(year, month - 1, day)
  
  return date.getDate() === parseInt(day) &&
         date.getMonth() === parseInt(month) - 1 &&
         date.getFullYear() === parseInt(year)
}

// Exportar como default também
export default {
  formatDateBR,
  formatDateForFilename,
  formatPeriodBR,
  isoToBR,
  brToISO,
  getCurrentDateBR,
  daysDifference,
  formatDateForExcel,
  formatDateTimeForReport,
  isValidBRDate
}
