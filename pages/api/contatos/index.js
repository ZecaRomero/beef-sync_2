import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tipo } = req.query // 'fornecedor', 'destino' ou 'todos' (default)

  try {
    let sql = ''
    let params = []

    if (tipo === 'fornecedor') {
      sql = `
        SELECT DISTINCT ON (fornecedor)
          fornecedor as nome, 
          cnpj_origem_destino as documento,
          endereco, bairro, cep, municipio, uf, telefone, incricao
        FROM notas_fiscais 
        WHERE fornecedor IS NOT NULL AND fornecedor != ''
        ORDER BY fornecedor, data_compra DESC
      `
    } else if (tipo === 'destino') {
      sql = `
        SELECT DISTINCT ON (destino)
          destino as nome, 
          cnpj_origem_destino as documento,
          endereco, bairro, cep, municipio, uf, telefone, incricao
        FROM notas_fiscais 
        WHERE destino IS NOT NULL AND destino != ''
        ORDER BY destino, data_compra DESC
      `
    } else {
      // Todos os contatos (union)
      sql = `
        SELECT DISTINCT ON (nome) * FROM (
          SELECT 
            fornecedor as nome, 
            cnpj_origem_destino as documento,
            endereco, bairro, cep, municipio, uf, telefone, incricao,
            data_compra
          FROM notas_fiscais 
          WHERE fornecedor IS NOT NULL AND fornecedor != ''
          UNION ALL
          SELECT 
            destino as nome, 
            cnpj_origem_destino as documento,
            endereco, bairro, cep, municipio, uf, telefone, incricao,
            data_compra
          FROM notas_fiscais 
          WHERE destino IS NOT NULL AND destino != ''
        ) as contatos
        ORDER BY nome, data_compra DESC
      `
    }

    const result = await query(sql, params)
    
    // Remover duplicatas de nome (o DISTINCT no SQL já deve cuidar da maioria, mas o UNION pode trazer duplicatas se o documento for diferente)
    // Vamos garantir nomes únicos para o autocomplete
    const uniqueContacts = []
    const seenNames = new Set()

    result.rows.forEach(row => {
      if (!seenNames.has(row.nome)) {
        seenNames.add(row.nome)
        uniqueContacts.push(row)
      }
    })

    return res.status(200).json({
      success: true,
      data: uniqueContacts
    })

  } catch (error) {
    console.error('Erro ao buscar contatos:', error)
    return res.status(500).json({ error: 'Erro ao buscar contatos' })
  }
}
