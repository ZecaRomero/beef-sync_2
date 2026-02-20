import { query } from '../../lib/database'

export default async function handler(req, res) {
  try {
    console.log('🧪 Teste do calendário iniciado')
    
    const sqlReceptoras = `
      SELECT DISTINCT
        nf.id as nf_id,
        nf.numero_nf,
        nf.data_compra,
        nf.receptora_letra,
        nf.receptora_numero,
        nf.data_te,
        nf.fornecedor,
        item.dados_item->>'tatuagem' as tatuagem_item,
        item.id as item_id
      FROM notas_fiscais nf
      INNER JOIN notas_fiscais_itens item ON item.nota_fiscal_id = nf.id
      WHERE nf.eh_receptoras = true
        AND nf.tipo = 'entrada'
        AND (item.tipo_produto = 'bovino' OR item.tipo_produto IS NULL)
      ORDER BY nf.numero_nf, item.id
      LIMIT 5
    `
    
    const result = await query(sqlReceptoras)
    
    console.log(`📋 Encontradas ${result.rows.length} receptoras`)
    
    const eventos = []
    
    result.rows.forEach((row, index) => {
      const tatuagem = row.tatuagem_item || ''
      let letra = row.receptora_letra || ''
      let numero = row.receptora_numero || ''
      
      if (tatuagem) {
        const matchLetra = tatuagem.match(/^([A-Za-z]+)/)
        const matchNumero = tatuagem.match(/(\d+)/)
        if (matchLetra) letra = matchLetra[1].toUpperCase()
        if (matchNumero) numero = matchNumero[1]
      }
      
      const nomeReceptora = tatuagem || `${letra}${numero}`.trim()
      
      console.log(`Item ${index + 1}: ${nomeReceptora}`)
      
      if (row.data_compra) {
        eventos.push({
          titulo: `Chegada ${nomeReceptora}`,
          data: row.data_compra,
          tipo: 'Chegada'
        })
      }
      
      if (row.data_te) {
        const dataTE = new Date(row.data_te)
        const dataParto = new Date(dataTE)
        dataParto.setMonth(dataParto.getMonth() + 9)
        
        eventos.push({
          titulo: `Parto ${nomeReceptora}`,
          data: dataParto.toISOString().split('T')[0],
          tipo: 'Parto Previsto'
        })
      }
    })
    
    console.log(`✅ Total de eventos criados: ${eventos.length}`)
    
    res.status(200).json({
      success: true,
      receptoras: result.rows.length,
      eventos: eventos.length,
      dados: eventos
    })
  } catch (error) {
    console.error('❌ Erro:', error)
    res.status(500).json({ error: error.message })
  }
}
