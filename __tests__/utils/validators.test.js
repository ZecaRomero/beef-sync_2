/**
 * Testes unitários para funções de validação
 */

const {
  validateCPF,
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateDate,
  validatePositiveNumber,
  validateRange,
  validateRequired,
  validateMinLength,
  validateMaxLength,
} = require('../../utils/validators');

describe('Validators', () => {
  describe('validateCPF', () => {
    test('deve validar CPF válido', () => {
      expect(validateCPF('111.444.777-35')).toBe(true);
    });

    test('deve rejeitar CPF inválido', () => {
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('123.456.789-00')).toBe(false);
      expect(validateCPF('')).toBe(false);
      expect(validateCPF(null)).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    test('deve validar CNPJ válido', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
    });

    test('deve rejeitar CNPJ inválido', () => {
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validateCNPJ('')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('deve validar email válido', () => {
      expect(validateEmail('teste@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('deve rejeitar email inválido', () => {
      expect(validateEmail('invalido')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('teste@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    test('deve validar telefone válido', () => {
      expect(validatePhone('(11) 98765-4321')).toBe(true);
      expect(validatePhone('11987654321')).toBe(true);
      expect(validatePhone('(11) 3456-7890')).toBe(true);
    });

    test('deve rejeitar telefone inválido', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateDate', () => {
    test('deve validar data válida', () => {
      expect(validateDate('2024-01-01')).toBe(true);
      expect(validateDate(new Date())).toBe(true);
    });

    test('deve rejeitar data inválida', () => {
      expect(validateDate('invalid')).toBe(false);
      expect(validateDate('')).toBe(false);
    });
  });

  describe('validatePositiveNumber', () => {
    test('deve validar número positivo', () => {
      expect(validatePositiveNumber(10)).toBe(true);
      expect(validatePositiveNumber('10.5')).toBe(true);
    });

    test('deve rejeitar número não positivo', () => {
      expect(validatePositiveNumber(0)).toBe(false);
      expect(validatePositiveNumber(-5)).toBe(false);
      expect(validatePositiveNumber('abc')).toBe(false);
    });
  });

  describe('validateRange', () => {
    test('deve validar número no range', () => {
      expect(validateRange(5, 1, 10)).toBe(true);
      expect(validateRange(1, 1, 10)).toBe(true);
      expect(validateRange(10, 1, 10)).toBe(true);
    });

    test('deve rejeitar número fora do range', () => {
      expect(validateRange(0, 1, 10)).toBe(false);
      expect(validateRange(11, 1, 10)).toBe(false);
    });
  });

  describe('validateRequired', () => {
    test('deve validar campo preenchido', () => {
      expect(validateRequired('texto')).toBe(true);
      expect(validateRequired(123)).toBe(true);
    });

    test('deve rejeitar campo vazio', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    test('deve validar comprimento mínimo', () => {
      expect(validateMinLength('texto', 3)).toBe(true);
      expect(validateMinLength('texto', 5)).toBe(true);
    });

    test('deve rejeitar comprimento menor', () => {
      expect(validateMinLength('ab', 3)).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    test('deve validar comprimento máximo', () => {
      expect(validateMaxLength('texto', 10)).toBe(true);
      expect(validateMaxLength('', 5)).toBe(true);
    });

    test('deve rejeitar comprimento maior', () => {
      expect(validateMaxLength('texto muito longo', 5)).toBe(false);
    });
  });
});
