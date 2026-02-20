/**
 * Sistema de validação unificado com mensagens padronizadas
 */

import type { ValidationError, Animal, Custo, NotaFiscal } from '@/types';

// ============ VALIDADORES BASE ============

/**
 * Validar se um valor é obrigatório
 */
export function required(value: any, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} é obrigatório`,
    };
  }
  return null;
}

/**
 * Validar email
 */
export function email(value: string, fieldName: string): ValidationError | null {
  if (!value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} deve ser um email válido`,
    };
  }
  return null;
}

/**
 * Validar tamanho mínimo
 */
export function minLength(value: string, min: number, fieldName: string): ValidationError | null {
  if (!value) return null;
  
  if (value.length < min) {
    return {
      field: fieldName,
      message: `${fieldName} deve ter no mínimo ${min} caracteres`,
    };
  }
  return null;
}

/**
 * Validar tamanho máximo
 */
export function maxLength(value: string, max: number, fieldName: string): ValidationError | null {
  if (!value) return null;
  
  if (value.length > max) {
    return {
      field: fieldName,
      message: `${fieldName} deve ter no máximo ${max} caracteres`,
    };
  }
  return null;
}

/**
 * Validar valor mínimo
 */
export function min(value: number, minValue: number, fieldName: string): ValidationError | null {
  if (value === null || value === undefined) return null;
  
  if (value < minValue) {
    return {
      field: fieldName,
      message: `${fieldName} deve ser no mínimo ${minValue}`,
    };
  }
  return null;
}

/**
 * Validar valor máximo
 */
export function max(value: number, maxValue: number, fieldName: string): ValidationError | null {
  if (value === null || value === undefined) return null;
  
  if (value > maxValue) {
    return {
      field: fieldName,
      message: `${fieldName} deve ser no máximo ${maxValue}`,
    };
  }
  return null;
}

/**
 * Validar padrão regex
 */
export function pattern(value: string, regex: RegExp, fieldName: string, message?: string): ValidationError | null {
  if (!value) return null;
  
  if (!regex.test(value)) {
    return {
      field: fieldName,
      message: message || `${fieldName} está em formato inválido`,
    };
  }
  return null;
}

/**
 * Validar data
 */
export function validDate(value: any, fieldName: string): ValidationError | null {
  if (!value) return null;
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return {
      field: fieldName,
      message: `${fieldName} deve ser uma data válida`,
    };
  }
  return null;
}

/**
 * Validar se data não é futura
 */
export function notFutureDate(value: any, fieldName: string): ValidationError | null {
  if (!value) return null;
  
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Fim do dia de hoje
  
  if (date > today) {
    return {
      field: fieldName,
      message: `${fieldName} não pode ser uma data futura`,
    };
  }
  return null;
}

// ============ VALIDADORES ESPECÍFICOS ============

/**
 * Validar dados de animal
 */
export function validateAnimal(animal: Partial<Animal>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Campos obrigatórios
  const serieError = required(animal.serie, 'Série');
  if (serieError) errors.push(serieError);

  const rgError = required(animal.rg, 'RG');
  if (rgError) errors.push(rgError);

  const sexoError = required(animal.sexo, 'Sexo');
  if (sexoError) errors.push(sexoError);

  const racaError = required(animal.raca, 'Raça');
  if (racaError) errors.push(racaError);

  // Validações de formato
  if (animal.serie) {
    const seriePattern = pattern(animal.serie, /^[A-Z0-9]{1,10}$/, 'Série', 
      'Série deve conter apenas letras maiúsculas e números (máximo 10 caracteres)');
    if (seriePattern) errors.push(seriePattern);
  }

  // Validações de valor
  if (animal.peso !== undefined && animal.peso !== null) {
    const pesoMin = min(animal.peso, 0, 'Peso');
    if (pesoMin) errors.push(pesoMin);
    
    const pesoMax = max(animal.peso, 2000, 'Peso');
    if (pesoMax) errors.push(pesoMax);
  }

  // Validações de data
  if (animal.data_nascimento) {
    const dataError = validDate(animal.data_nascimento, 'Data de nascimento');
    if (dataError) errors.push(dataError);

    const futuroError = notFutureDate(animal.data_nascimento, 'Data de nascimento');
    if (futuroError) errors.push(futuroError);
  }

  // Validação de valores monetários
  if (animal.custo_total !== undefined && animal.custo_total !== null) {
    const custoMin = min(animal.custo_total, 0, 'Custo total');
    if (custoMin) errors.push(custoMin);
  }

  if (animal.valor_venda !== undefined && animal.valor_venda !== null) {
    const vendaMin = min(animal.valor_venda, 0, 'Valor de venda');
    if (vendaMin) errors.push(vendaMin);
  }

  return errors;
}

/**
 * Validar dados de custo
 */
export function validateCusto(custo: Partial<Custo>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Campos obrigatórios
  const animalError = required(custo.animal_id, 'ID do animal');
  if (animalError) errors.push(animalError);

  const tipoError = required(custo.tipo, 'Tipo de custo');
  if (tipoError) errors.push(tipoError);

  const valorError = required(custo.valor, 'Valor');
  if (valorError) errors.push(valorError);

  const dataError = required(custo.data, 'Data');
  if (dataError) errors.push(dataError);

  // Validações de valor
  if (custo.valor !== undefined && custo.valor !== null) {
    const valorMin = min(custo.valor, 0, 'Valor');
    if (valorMin) errors.push(valorMin);
  }

  // Validações de data
  if (custo.data) {
    const dataValidError = validDate(custo.data, 'Data');
    if (dataValidError) errors.push(dataValidError);

    const futuroError = notFutureDate(custo.data, 'Data');
    if (futuroError) errors.push(futuroError);
  }

  return errors;
}

/**
 * Validar dados de nota fiscal
 */
export function validateNotaFiscal(nf: Partial<NotaFiscal>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Campos obrigatórios
  const numeroError = required(nf.numero_nf, 'Número da NF');
  if (numeroError) errors.push(numeroError);

  const dataError = required(nf.data_compra, 'Data da compra');
  if (dataError) errors.push(dataError);

  const tipoError = required(nf.tipo, 'Tipo');
  if (tipoError) errors.push(tipoError);

  // Validações de formato
  if (nf.numero_nf) {
    const numeroLen = minLength(nf.numero_nf, 1, 'Número da NF');
    if (numeroLen) errors.push(numeroLen);
  }

  // Validações de valor
  if (nf.valor_total !== undefined && nf.valor_total !== null) {
    const valorMin = min(nf.valor_total, 0, 'Valor total');
    if (valorMin) errors.push(valorMin);
  }

  // Validações de data
  if (nf.data_compra) {
    const dataValidError = validDate(nf.data_compra, 'Data da compra');
    if (dataValidError) errors.push(dataValidError);
  }

  return errors;
}

/**
 * Validar RG de animal (formato brasileiro)
 */
export function validateRG(rg: string, fieldName: string = 'RG'): ValidationError | null {
  if (!rg) return null;
  
  // Aceitar formatos: 123456789, 12.345.678-9, etc
  const rgClean = rg.replace(/[.\-\s]/g, '');
  
  if (rgClean.length < 7 || rgClean.length > 20) {
    return {
      field: fieldName,
      message: `${fieldName} deve ter entre 7 e 20 caracteres`,
    };
  }

  return null;
}

/**
 * Validar série de animal
 */
export function validateSerie(serie: string, fieldName: string = 'Série'): ValidationError | null {
  if (!serie) return null;
  
  // Aceitar apenas letras maiúsculas e números
  if (!/^[A-Z0-9]+$/.test(serie)) {
    return {
      field: fieldName,
      message: `${fieldName} deve conter apenas letras maiúsculas e números`,
    };
  }

  if (serie.length > 10) {
    return {
      field: fieldName,
      message: `${fieldName} deve ter no máximo 10 caracteres`,
    };
  }

  return null;
}

/**
 * Função auxiliar para validar múltiplos campos
 */
export function validate(
  validators: Array<() => ValidationError | null>
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  validators.forEach(validator => {
    const error = validator();
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}

/**
 * Função para formatar erros de validação para exibição
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }

  return errors.map((error, index) => `${index + 1}. ${error.message}`).join('\n');
}

