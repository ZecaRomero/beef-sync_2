/**
 * Funções de validação centralizadas
 */

/**
 * Valida CPF
 */
export function validateCPF(cpf) {
  if (!cpf) return false;
  
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj) {
  if (!cnpj) return false;
  
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

/**
 * Valida email
 */
export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length === 10 || digits.length === 11;
}

/**
 * Valida data
 */
export function validateDate(date) {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

/**
 * Valida se é um número positivo
 */
export function validatePositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Valida range de valores
 */
export function validateRange(value, min, max) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Valida campo obrigatório
 */
export function validateRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Valida comprimento mínimo
 */
export function validateMinLength(value, minLength) {
  if (!value) return false;
  return value.toString().length >= minLength;
}

/**
 * Valida comprimento máximo
 */
export function validateMaxLength(value, maxLength) {
  if (!value) return true; // Empty is valid for max length
  return value.toString().length <= maxLength;
}
