import { query } from '../../../lib/database'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    // Buscar todos os fornecedores únicos das notas fiscais de entrada
    const fornecedoresResult = await query(`
      SELECT 
        nf.fornecedor as nome,
        nf.cnpj_origem_destino as cnpj_cpf,
        COUNT(DISTINCT nf.id) as total_notas,
        SUM(nf.valor_total) as valor_total,
        MIN(nf.data) as primeira_compra,
        MAX(nf.data) as ultima_compra,
        COUNT(DISTINCT nfi.id) as total_itens
      FROM notas_fiscais nf
      LEFT JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id
      WHERE nf.tipo = 'entrada' 
        AND nf.fornecedor IS NOT NULL 
        AND nf.fornecedor != ''
      GROUP BY nf.fornecedor, nf.cnpj_origem_destino
      ORDER BY valor_total DESC
    `)

    // Buscar dados da tabela fornecedores_destinatarios para complementar
    const fornecedoresCadastrados = await query(`
      SELECT * FROM fornecedores_destinatarios
      WHERE tipo = 'fornecedor' AND ativo = true
      ORDER BY nome ASC
    `)

    // Combinar dados
    const fornecedoresMap = new Map()
    
    // Adicionar fornecedores das notas fiscais
    fornecedoresResult.rows.forEach(fornecedor => {
      fornecedoresMap.set(fornecedor.nome, {
        nome: fornecedor.nome,
        cnpj_cpf: fornecedor.cnpj_cpf,
        total_notas: parseInt(fornecedor.total_notas || 0),
        valor_total: parseFloat(fornecedor.valor_total || 0),
        primeira_compra: fornecedor.primeira_compra,
        ultima_compra: fornecedor.ultima_compra,
        total_itens: parseInt(fornecedor.total_itens || 0),
        cadastrado: false
      })
    })

    // Adicionar/atualizar com dados cadastrados
    fornecedoresCadastrados.rows.forEach(cadastrado => {
      const nome = cadastrado.nome
      if (fornecedoresMap.has(nome)) {
        // Atualizar com dados cadastrados
        const existente = fornecedoresMap.get(nome)
        fornecedoresMap.set(nome, {
          ...existente,
          id: cadastrado.id,
          endereco: cadastrado.endereco,
          municipio: cadastrado.municipio,
          estado: cadastrado.estado,
          telefone: cadastrado.telefone,
          email: cadastrado.email,
          observacoes: cadastrado.observacoes,
          cadastrado: true
        })
      } else {
        // Adicionar fornecedor cadastrado sem notas fiscais
        fornecedoresMap.set(nome, {
          id: cadastrado.id,
          nome: cadastrado.nome,
          cnpj_cpf: cadastrado.cnpj_cpf,
          endereco: cadastrado.endereco,
          municipio: cadastrado.municipio,
          estado: cadastrado.estado,
          telefone: cadastrado.telefone,
          email: cadastrado.email,
          observacoes: cadastrado.observacoes,
          total_notas: 0,
          valor_total: 0,
          total_itens: 0,
          cadastrado: true
        })
      }
    })

    const fornecedores = Array.from(fornecedoresMap.values())

    return res.status(200).json({
      success: true,
      data: fornecedores,
      total: fornecedores.length
    })
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar fornecedores',
      details: error.message
    })
  }
}
