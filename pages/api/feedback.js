const fs = require('fs')
const path = require('path')
const { query } = require('../../lib/database')

// Configuração para aumentar limite do body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

async function garantirTabelaFeedbacks() {
  try {
    const check = await query(`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feedbacks')
    `)
    if (check.rows[0].exists) return
    
    await query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        sugestao TEXT,
        audio_path VARCHAR(500),
        transcricao TEXT,
        status VARCHAR(50) DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await query(`CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC)`)
    console.log('Tabela feedbacks criada/verificada com sucesso')
  } catch (error) {
    console.error('Erro ao garantir tabela feedbacks:', error)
    // Não lançar erro para tentar continuar se a tabela já existir mas a verificação falhar
  }
}

export default async function handler(req, res) {
  console.log(`[API Feedback] ${req.method} request received`)
  
  try {
    await garantirTabelaFeedbacks()

    if (req.method === 'GET') {
      try {
        const result = await query(`
          SELECT * FROM feedbacks 
          ORDER BY created_at DESC
        `)
        return res.status(200).json({ success: true, data: result.rows })
      } catch (error) {
        console.error('Erro ao buscar feedbacks:', error)
        return res.status(500).json({ success: false, error: error.message })
      }
    }

    if (req.method === 'POST') {
      try {
        const { nome, sugestao, audioBase64 } = req.body
        
        console.log(`[API Feedback] POST payload: nome=${nome}, sugestao=${sugestao ? 'sim' : 'não'}, audio=${audioBase64 ? 'sim (' + audioBase64.length + ' chars)' : 'não'}`)

        if (!nome || !nome.trim()) {
          return res.status(400).json({ success: false, error: 'Nome é obrigatório' })
        }

        if (!sugestao && !audioBase64) {
          return res.status(400).json({ success: false, error: 'Sugestão ou áudio é obrigatório' })
        }

        let audioPath = null
        
        // Se tiver áudio em base64, salvar como arquivo
        if (audioBase64) {
          try {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'feedback')
            if (!fs.existsSync(uploadDir)) {
              console.log(`[API Feedback] Criando diretório: ${uploadDir}`)
              fs.mkdirSync(uploadDir, { recursive: true })
            }

            const fileName = `feedback_${Date.now()}.webm`
            const filePath = path.join(uploadDir, fileName)
            
            console.log(`[API Feedback] Salvando áudio em: ${filePath}`)
            
            // Remover prefixo data:audio/webm;base64, se existir
            const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '')
            const buffer = Buffer.from(base64Data, 'base64')
            fs.writeFileSync(filePath, buffer)
            
            audioPath = `/uploads/feedback/${fileName}`
            console.log(`[API Feedback] Áudio salvo com sucesso: ${audioPath}`)
          } catch (audioError) {
            console.error('[API Feedback] Erro ao salvar áudio:', audioError)
            // Continuar sem o áudio se houver erro, mas logar
          }
        }

        const result = await query(
          `INSERT INTO feedbacks (nome, sugestao, audio_path, status, created_at) 
           VALUES ($1, $2, $3, $4, NOW()) 
           RETURNING *`,
          [nome, sugestao || null, audioPath, 'pendente']
        )
        
        console.log(`[API Feedback] Feedback salvo no banco: ID ${result.rows[0].id}`)

        // Criar notificação para o administrador
        try {
          // Verificar se tabela notificacoes existe antes de tentar inserir
          const checkNotif = await query(`
            SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notificacoes')
          `)
          
          if (checkNotif.rows[0].exists) {
            await query(
              `INSERT INTO notificacoes (tipo, titulo, mensagem, prioridade, dados_extras)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                'sistema',
                'Novo Feedback Recebido',
                `Feedback de ${nome}: ${sugestao ? (sugestao.length > 50 ? sugestao.substring(0, 50) + '...' : sugestao) : 'Áudio recebido'}`,
                'medium',
                JSON.stringify({ feedback_id: result.rows[0].id, type: 'feedback' })
              ]
            )
          }
        } catch (notifyError) {
          console.error('[API Feedback] Erro ao criar notificação de feedback:', notifyError)
          // Não falhar a requisição se a notificação falhar
        }

        return res.status(201).json({ success: true, data: result.rows[0] })
      } catch (error) {
        console.error('[API Feedback] Erro crítico ao processar POST:', error)
        return res.status(500).json({ success: false, error: error.message || 'Erro ao salvar feedback' })
      }
    } 
    
    if (req.method === 'PUT') {
      // Atualizar feedback (adicionar transcrição ou mudar status)
      try {
        const { id, transcricao, status } = req.body

        const updates = []
        const values = []
        let paramCount = 1

        if (transcricao !== undefined) {
          updates.push(`transcricao = $${paramCount}`)
          values.push(transcricao)
          paramCount++
        }

        if (status !== undefined) {
          updates.push(`status = $${paramCount}`)
          values.push(status)
          paramCount++
        }

        values.push(id)

        const result = await query(
          `UPDATE feedbacks 
           SET ${updates.join(', ')}, updated_at = NOW()
           WHERE id = $${paramCount}
           RETURNING *`,
          values
        )

        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Feedback não encontrado' })
        }

        return res.status(200).json({ success: true, data: result.rows[0] })
      } catch (error) {
        console.error('Erro ao atualizar feedback:', error)
        return res.status(500).json({ success: false, error: error.message })
      }
    } 
    
    if (req.method === 'DELETE') {
      // Deletar feedback
      try {
        const { id } = req.query

        // Buscar o feedback para deletar o arquivo de áudio
        const feedback = await query('SELECT audio_path FROM feedbacks WHERE id = $1', [id])
        
        if (feedback.rows.length > 0 && feedback.rows[0].audio_path) {
          const audioPath = path.join(process.cwd(), 'public', feedback.rows[0].audio_path)
          if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath)
          }
        }

        await query('DELETE FROM feedbacks WHERE id = $1', [id])

        return res.status(200).json({ success: true, message: 'Feedback deletado com sucesso' })
      } catch (error) {
        console.error('Erro ao deletar feedback:', error)
        return res.status(500).json({ success: false, error: error.message })
      }
    }

    return res.status(405).json({ success: false, error: 'Método não permitido' })
    
  } catch (globalError) {
    console.error('[API Feedback] Global error:', globalError)
    return res.status(500).json({ success: false, error: 'Erro interno do servidor: ' + globalError.message })
  }
}
