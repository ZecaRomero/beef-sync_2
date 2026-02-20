#!/usr/bin/env node

/**
 * Script para criar tabela de serviços/custos cadastrados
 */

require('dotenv').config()
const { Pool } = require('pg')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'estoque_semen',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'jcromero85',
}

async function createServicosTable() {
  const pool = new Pool(dbConfig)
  
  try {
    console.log('🔧 Criando tabela de serviços cadastrados...')
    
    await pool.query(`
      -- Tabela de tipos de serviços/custos cadastrados
      CREATE TABLE IF NOT EXISTS tipos_servicos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        valor_padrao DECIMAL(12,2) NOT NULL,
        aplicavel_macho BOOLEAN DEFAULT true,
        aplicavel_femea BOOLEAN DEFAULT true,
        descricao TEXT,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_tipos_servicos_categoria ON tipos_servicos(categoria);
      CREATE INDEX IF NOT EXISTS idx_tipos_servicos_ativo ON tipos_servicos(ativo);

      -- Inserir alguns serviços padrão
      INSERT INTO tipos_servicos (nome, categoria, valor_padrao, aplicavel_macho, aplicavel_femea, descricao)
      VALUES 
        ('Exame Andrológico', 'Veterinários', 165.00, true, false, 'Exame reprodutivo para machos'),
        ('Diagnóstico de Prenhez', 'Veterinários', 80.00, false, true, 'Ultrassom ou palpação para diagnóstico de gestação'),
        ('Inseminação Artificial', 'Reprodução', 60.00, false, true, 'Procedimento de IA'),
        ('Transferência de Embrião', 'Reprodução', 250.00, false, true, 'Procedimento de TE'),
        ('Consulta Veterinária', 'Veterinários', 120.00, true, true, 'Consulta veterinária geral'),
        ('Vacina Obrigatória ABCZ', 'Medicamentos', 36.90, true, true, 'Vacinas obrigatórias para registro'),
        ('Vermífugo', 'Medicamentos', 18.00, true, true, 'Tratamento parasitário'),
        ('Castração', 'Manejo', 45.00, true, false, 'Procedimento de castração'),
        ('Descorna', 'Manejo', 30.00, true, true, 'Procedimento de descorna'),
        ('Casqueamento', 'Manejo', 40.00, true, true, 'Casqueamento para venda ou exposição'),
        ('Análise DNA Paternidade', 'DNA', 40.00, true, true, 'Teste de paternidade'),
        ('Análise DNA Genômica', 'DNA', 80.00, true, true, 'Teste genômico completo'),
        ('Antibiótico Tratamento', 'Medicamentos', 50.00, true, true, 'Tratamento com antibióticos'),
        ('Suplemento Vitamínico', 'Alimentação', 25.00, true, true, 'Suplementação vitamínica'),
        ('Ração Concentrada (kg)', 'Alimentação', 1.20, true, true, 'Ração concentrada por kg'),
        ('Sal Mineral (kg)', 'Alimentação', 3.50, true, true, 'Sal mineral por kg'),
        ('Ultrassonografia', 'Veterinários', 100.00, false, true, 'Exame de ultrassom reprodutivo'),
        ('Cirurgia Geral', 'Veterinários', 300.00, true, true, 'Procedimento cirúrgico geral'),
        ('Exame Laboratorial', 'Veterinários', 80.00, true, true, 'Exames laboratoriais diversos'),
        ('Brinco Identificação', 'Manejo', 15.00, true, true, 'Brinco de identificação eletrônico')
      ON CONFLICT DO NOTHING;
    `)
    
    console.log('✅ Tabela tipos_servicos criada com sucesso!')
    console.log('📊 20 serviços padrão inseridos')
    console.log('')
    console.log('🎯 Categorias disponíveis:')
    console.log('   - Veterinários')
    console.log('   - Reprodução')
    console.log('   - Medicamentos')
    console.log('   - Manejo')
    console.log('   - DNA')
    console.log('   - Alimentação')
    
    await pool.end()
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    await pool.end()
    process.exit(1)
  }
}

createServicosTable()

