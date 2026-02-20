import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { nome } = req.query

    if (!nome) {
      return res.status(400).json({ message: 'Nome é obrigatório' })
    }

    const nomeTrim = nome.trim()
    let animal = null

    // Estratégia 1: Nome exato
    let result = await query(
      `SELECT id, serie, rg, nome, sexo, raca
       FROM animais 
       WHERE UPPER(nome) = UPPER($1)
       LIMIT 1`,
      [nomeTrim]
    )

    if (result.rows.length > 0) {
      animal = result.rows[0]
      console.log(`✅ Animal encontrado por nome exato: ${animal.serie}-${animal.rg}`)
    } else {
      // Estratégia 2: Série exata
      result = await query(
        `SELECT id, serie, rg, nome, sexo, raca
         FROM animais 
         WHERE UPPER(serie) = UPPER($1)
         LIMIT 1`,
        [nomeTrim]
      )

      if (result.rows.length > 0) {
        animal = result.rows[0]
        console.log(`✅ Animal encontrado por série: ${animal.serie}-${animal.rg}`)
      } else {
        // Estratégia 3: Extrair RG do nome (ex: "CJ SANT ANNA 13534" -> RG "13534")
        const possiveisRGs = nomeTrim.match(/\d{4,}/g)
        if (possiveisRGs && possiveisRGs.length > 0) {
          for (const rg of possiveisRGs) {
            result = await query(
              `SELECT id, serie, rg, nome, sexo, raca
               FROM animais 
               WHERE rg = $1 AND (serie LIKE 'CJCJ%' OR serie LIKE 'CJCA%' OR serie LIKE 'CJCS%' OR serie LIKE 'CJCC%')
               LIMIT 1`,
              [rg]
            )

            if (result.rows.length > 0) {
              animal = result.rows[0]
              console.log(`✅ Animal encontrado por RG extraído (${rg}): ${animal.serie}-${animal.rg}`)
              break
            }
          }
        }

        // Estratégia 4: Busca parcial no nome
        if (!animal) {
          result = await query(
            `SELECT id, serie, rg, nome, sexo, raca
             FROM animais 
             WHERE UPPER(nome) LIKE UPPER($1)
             LIMIT 1`,
            [`%${nomeTrim}%`]
          )

          if (result.rows.length > 0) {
            animal = result.rows[0]
            console.log(`✅ Animal encontrado por busca parcial: ${animal.serie}-${animal.rg}`)
          }
        }
      }
    }

    if (!animal) {
      console.log(`❌ Animal não encontrado: "${nomeTrim}"`)
      return res.status(404).json({ 
        success: false,
        message: 'Animal não encontrado',
        nome_buscado: nomeTrim
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: animal.id,
        serie: animal.serie,
        rg: animal.rg,
        nome: animal.nome,
        sexo: animal.sexo,
        raca: animal.raca
      }
    })
  } catch (error) {
    console.error('Erro ao buscar animal por nome:', error)
    res.status(500).json({ 
      message: 'Erro ao buscar animal', 
      error: error.message 
    })
  }
}
