import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Buscar feedbacks não lidos (pendentes)
      const result = await query(`
        SELECT 
          id,
          nome,
          sugestao,
          audio_path,
          status,
          created_at
        FROM feedbacks
        WHERE status = 'pendente'
        ORDER BY created_at DESC
      `)

      const feedbacks = result.rows.map(f => ({
        id: f.id,
        tipo: 'feedback',
        titulo: `Novo feedback de ${f.nome}`,
        mensagem: f.sugestao ? f.sugestao.substring(0, 100) + (f.sugestao.length > 100 ? '...' : '') : 'Feedback com áudio',
        temAudio: !!f.audio_path,
        data: f.created_at,
        link: '/admin/feedbacks',
        lido: false
      }))

      return res.status(200).json({
        success: true,
        total: feedbacks.length,
        notificacoes: feedbacks
      })
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
