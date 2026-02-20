import { query } from '../../../lib/database'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    // Buscar todos os clientes/destinos únicos das notas fiscais de saída
    const clientesResult = await query(`
      SELECT 
        nf.destino as nome,
        nf.cnpj_origem_destino as cnpj_cpf,
        COUNT(DISTINCT nf.id) as total_notas,
        SUM(nf.valor_total) as valor_total,
        MIN(nf.data) as primeira_venda,
        MAX(nf.data) as ultima_venda,
        COUNT(DISTINCT nfi.id) as total_itens
      FROM notas_fiscais nf
      LEFT JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id
      WHERE nf.tipo = 'saida' 
        AND nf.destino IS NOT NULL 
        AND nf.destino != ''
      GROUP BY nf.destino, nf.cnpj_origem_destino
      ORDER BY valor_total DESC
    `)

    // Buscar dados da tabela fornecedores_destinatarios para complementar
    const clientesCadastrados = await query(`
      SELECT * FROM fornecedores_destinatarios
      WHERE tipo IN ('destinatario', 'cliente') AND ativo = true
      ORDER BY nome ASC
    `)

    // Combinar dados
    const clientesMap = new Map()
    
    // Adicionar clientes das notas fiscais
    clientesResult.rows.forEach(cliente => {
      clientesMap.set(cliente.nome, {
        nome: cliente.nome,
        cnpj_cpf: cliente.cnpj_cpf,
        total_notas: parseInt(cliente.total_notas || 0),
        valor_total: parseFloat(cliente.valor_total || 0),
        primeira_venda: cliente.primeira_venda,
        ultima_venda: cliente.ultima_venda,
        total_itens: parseInt(cliente.total_itens || 0),
        cadastrado: false
      })
    })

    // Adicionar/atualizar com dados cadastrados
    clientesCadastrados.rows.forEach(cadastrado => {
      const nome = cadastrado.nome
      if (clientesMap.has(nome)) {
        // Atualizar com dados cadastrados
        const existente = clientesMap.get(nome)
        clientesMap.set(nome, {
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
        // Adicionar cliente cadastrado sem notas fiscais
        clientesMap.set(nome, {
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

    const clientes = Array.from(clientesMap.values())

    return res.status(200).json({
      success: true,
      data: clientes,
      total: clientes.length
    })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar clientes',
      details: error.message
    })
  }
}
