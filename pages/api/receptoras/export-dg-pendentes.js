import ExcelJS from 'exceljs'
import { query } from '../../../lib/database'

/**
 * GET: Exporta em Excel as receptoras que ainda faltam dar DG.
 * Retorna arquivo .xlsx para download.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const receptorasQuery = `
      SELECT 
        nf.id as nf_id,
        nf.numero_nf,
        nf.data_compra,
        nf.data_chegada_animais,
        nf.receptora_letra,
        nf.receptora_numero,
        nf.data_te,
        nf.fornecedor,
        CASE 
          WHEN COALESCE(nf.data_chegada_animais, nf.data_compra) IS NOT NULL THEN (COALESCE(nf.data_chegada_animais, nf.data_compra) + INTERVAL '15 days')::date
          ELSE NULL
        END as data_prevista_dg,
        item.dados_item::jsonb->>'tatuagem' as tatuagem_item,
        item.dados_item as dados_item_completo,
        item.id as item_id
      FROM notas_fiscais nf
      INNER JOIN notas_fiscais_itens item ON item.nota_fiscal_id = nf.id
      WHERE nf.eh_receptoras = true
        AND nf.tipo = 'entrada'
        AND (item.tipo_produto = 'bovino' OR item.tipo_produto IS NULL)
      ORDER BY data_prevista_dg ASC NULLS LAST, nf.numero_nf, item.id
    `
    const result = await query(receptorasQuery)
    const rows = result.rows || []

    const receptoras = []
    for (const row of rows) {
      let dadosItem = row.dados_item_completo
      if (typeof dadosItem === 'string') {
        try {
          dadosItem = JSON.parse(dadosItem)
        } catch {
          dadosItem = null
        }
      }
      const tatuagem = row.tatuagem_item || (dadosItem?.tatuagem) || ''
      let letra = row.receptora_letra || ''
      let numero = row.receptora_numero || ''
      if (tatuagem) {
        const matchLetra = tatuagem.match(/^([A-Za-z]+)/)
        const matchNumero = tatuagem.match(/(\d+)/)
        if (matchLetra) letra = matchLetra[1].toUpperCase()
        if (matchNumero) numero = matchNumero[1]
      }
      if (!numero && row.receptora_numero) numero = row.receptora_numero
      if (!letra && row.receptora_letra) letra = row.receptora_letra
      if (!numero) continue

      // Verificar se já fez DG (animal ou inseminação)
      let dataDG = null
      let resultadoDG = null
      try {
        const animalResult = await query(`
          SELECT id, data_dg, resultado_dg FROM animais
          WHERE serie = $1 AND rg = $2 LIMIT 1
        `, [letra, numero])
        if (animalResult.rows.length > 0) {
          const a = animalResult.rows[0]
          dataDG = a.data_dg
          resultadoDG = a.resultado_dg
          if (dataDG) {
            // Já fez DG - pular da lista de pendentes
            continue
          }
        }
        if (animalResult.rows.length > 0) {
          const insResult = await query(`
            SELECT data_dg FROM inseminacoes WHERE animal_id = $1 AND data_dg IS NOT NULL LIMIT 1
          `, [animalResult.rows[0].id])
          if (insResult.rows.length > 0) continue
        }
      } catch (e) {
        // manter na lista se der erro na busca
      }

      const dataChegada = row.data_chegada_animais || row.data_compra
      receptoras.push({
        letra,
        numero,
        tatuagemCompleta: tatuagem || `${letra}${numero}`,
        dataChegada,
        dataPrevistaDG: row.data_prevista_dg,
        dataTE: row.data_te,
        numeroNF: row.numero_nf,
        fornecedor: row.fornecedor
      })
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Beef-Sync'
    const sheet = workbook.addWorksheet('Receptoras pendentes DG')

    sheet.mergeCells('A1:H1')
    sheet.getCell('A1').value = 'Receptoras que faltam dar DG (Diagnóstico de Gestação)'
    sheet.getCell('A1').font = { size: 14, bold: true }
    sheet.getCell('A1').alignment = { horizontal: 'center' }
    sheet.addRow([])
    sheet.addRow(['Gerado em:', new Date().toLocaleString('pt-BR')])
    sheet.addRow([])

    const headerRow = sheet.addRow([
      'Receptora (Série-RG)',
      'Letra',
      'Número',
      'Data de Chegada',
      'Data Prevista DG (15 dias após chegada)',
      'Data TE',
      'NF',
      'Fornecedor'
    ])
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE91E63' }
    }

    for (const r of receptoras) {
      sheet.addRow([
        r.tatuagemCompleta,
        r.letra,
        r.numero,
        r.dataChegada ? new Date(r.dataChegada).toLocaleDateString('pt-BR') : '',
        r.dataPrevistaDG ? new Date(r.dataPrevistaDG).toLocaleDateString('pt-BR') : '',
        r.dataTE ? new Date(r.dataTE).toLocaleDateString('pt-BR') : '',
        r.numeroNF || '',
        r.fornecedor || ''
      ])
    }

    sheet.columns = [
      { width: 22 },
      { width: 8 },
      { width: 12 },
      { width: 16 },
      { width: 36 },
      { width: 14 },
      { width: 14 },
      { width: 28 }
    ]

    const filename = `Receptoras_pendentes_DG_${new Date().toISOString().split('T')[0]}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error('Erro ao exportar receptoras pendentes DG:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerar Excel',
      message: error.message
    })
  }
}
