/**
 * Testes unitários para funções de formatação
 */

const {
  formatCurrency,
  formatNumber,
  formatDate,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatPercentage,
  formatBytes,
  truncateText,
  capitalize,
  formatProperName,
} = require('../../utils/formatters');

describe('Formatters', () => {
  describe('formatCurrency', () => {
    test('deve formatar valores monetários corretamente', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00');
      expect(formatCurrency(0)).toBe('R$ 0,00');
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });

    test('deve tratar valores inválidos', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
    });
  });

  describe('formatNumber', () => {
    test('deve formatar números com decimais', () => {
      expect(formatNumber(1234.56, 2)).toBe('1.234,56');
      expect(formatNumber(1000, 0)).toBe('1.000');
    });
  });

  describe('formatCPF', () => {
    test('deve formatar CPF corretamente', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });

    test('deve tratar valores inválidos', () => {
      expect(formatCPF('')).toBe('');
      expect(formatCPF(null)).toBe('');
    });
  });

  describe('formatCNPJ', () => {
    test('deve formatar CNPJ corretamente', () => {
      expect(formatCNPJ('12345678000190')).toBe('12.345.678/0001-90');
    });
  });

  describe('formatPhone', () => {
    test('deve formatar telefone corretamente', () => {
      expect(formatPhone('1234567890')).toBe('(12) 3456-7890');
      expect(formatPhone('12345678901')).toBe('(12) 34567-8901');
    });
  });

  describe('formatPercentage', () => {
    test('deve formatar porcentagem', () => {
      expect(formatPercentage(10)).toBe('10,0%');
      expect(formatPercentage(10.5)).toBe('10,5%');
    });
  });

  describe('formatBytes', () => {
    test('deve formatar bytes em formato legível', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
    });
  });

  describe('truncateText', () => {
    test('deve truncar texto longo', () => {
      expect(truncateText('Este é um texto longo', 10)).toBe('Este é um ...');
    });

    test('não deve truncar texto curto', () => {
      expect(truncateText('Curto', 10)).toBe('Curto');
    });
  });

  describe('capitalize', () => {
    test('deve capitalizar primeira letra', () => {
      expect(capitalize('teste')).toBe('Teste');
      expect(capitalize('TESTE')).toBe('Teste');
    });
  });

  describe('formatProperName', () => {
    test('deve formatar nome próprio', () => {
      expect(formatProperName('joão silva')).toBe('João Silva');
      expect(formatProperName('MARIA SOUZA')).toBe('Maria Souza');
    });
  });
});
