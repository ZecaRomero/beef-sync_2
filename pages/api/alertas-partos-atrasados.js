import { query } from '../../lib/database'
import { sendSuccess, sendError } from '../../utils/apiResponse'

/**
 * API para verificar e gerar alertas de partos atrasados
 * Verifica transferências de embriões onde a data esperada de parto já passou
 * sem registro de nascimento
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    if (req.method === 'GET') {
      // Buscar alertas existentes
      const alertas = await query(`
        SELECT id, titulo, mensagem, prioridade, dados_extras, created_at, lida
        FROM notificacoes 
        WHERE tipo = 'nascimento' 
          AND prioridade = 'high'
          AND lida = false
        ORDER BY created_at DESC
      `)

      return sendSuccess(res, alertas.rows)
    }

    if (req.method === 'POST') {
      // Verificar e gerar novos alertas
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      // Buscar todas as transferências de embriões
      const transferencias = await query(`
        SELECT id, numero_te, data_te, receptora_nome, doadora_nome, touro, status
        FROM transferencias_embrioes 
        WHERE status = 'realizada' OR status = 'Realizada'
        ORDER BY data_te DESC
      `)

      let alertasGerados = 0
      const alertas = []

      for (const te of transferencias.rows) {
        // Calcular data esperada de parto (9 meses = 276 dias após a TE)
        const dataTE = new Date(te.data_te)
        const dataEsperadaParto = new Date(dataTE)
        dataEsperadaParto.setDate(dataEsperadaParto.getDate() + 276)

        // Verificar se a data esperada já passou
        if (hoje > dataEsperadaParto) {
          const diasAtraso = Math.floor((hoje - dataEsperadaParto) / (1000 * 60 * 60 * 24))

          // Verificar se existe gestação vinculada
          const gestacao = await query(`
            SELECT id, situacao
            FROM gestacoes 
            WHERE receptora_nome = $1 
              AND data_cobertura = $2
            ORDER BY id DESC
            LIMIT 1
          `, [te.receptora_nome, dataTE.toISOString().split('T')[0]])

          // Verificar se já existe nascimento
          let temNascimento = false
          if (gestacao.rows.length > 0) {
            const nascimento = await query(`
              SELECT id FROM nascimentos 
              WHERE gestacao_id = $1
              LIMIT 1
            `, [gestacao.rows[0].id])
            temNascimento = nascimento.rows.length > 0
          }

          // Se não tem nascimento e a data passou, gerar alerta
          if (!temNascimento) {
            // Verificar se já existe alerta para esta receptora
            const alertaExistente = await query(`
              SELECT id FROM notificacoes 
              WHERE tipo = 'nascimento' 
                AND titulo ILIKE '%${te.receptora_nome}%'
                AND lida = false
              LIMIT 1
            `)

            if (alertaExistente.rows.length === 0) {
              const novoAlerta = await query(`
                INSERT INTO notificacoes (
                  tipo, titulo, mensagem, prioridade, dados_extras, created_at
                ) VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING id
              `, [
                'nascimento',
                `Parto Atrasado - ${te.receptora_nome}`,
                `Receptora ${te.receptora_nome} deveria ter parido em ${dataEsperadaParto.toLocaleDateString('pt-BR')} (${diasAtraso} dia(s) atrás). TE realizada em ${dataTE.toLocaleDateString('pt-BR')}.`,
                'high',
                JSON.stringify({
                  receptora_nome: te.receptora_nome,
                  data_te: dataTE.toISOString(),
                  data_esperada_parto: dataEsperadaParto.toISOString(),
                  dias_atraso: diasAtraso,
                  te_id: te.id,
                  te_numero: te.numero_te,
                  gestacao_id: gestacao.rows[0]?.id || null
                })
              ])

              alertas.push(novoAlerta.rows[0])
              alertasGerados++
            }
          }
        }
      }

      return sendSuccess(res, {
        alertasGerados,
        alertas,
        totalVerificadas: transferencias.rows.length
      })
    }
  } catch (error) {
    console.error('Erro ao processar alertas de partos atrasados:', error)
    return sendError(res, 'Erro ao processar alertas', 500)
  }
}
