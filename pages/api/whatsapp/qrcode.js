import { getQRCode, isWhatsAppReady } from '../../../utils/whatsappWebService'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const ready = await isWhatsAppReady()
    
    if (ready) {
      return res.status(200).json({
        success: true,
        ready: true,
        message: 'WhatsApp já está conectado e pronto!'
      })
    }
    
    // Tentar obter QR Code
    try {
      const qr = await getQRCode()
      
      if (qr) {
        return res.status(200).json({
          success: true,
          ready: false,
          qrCode: qr,
          message: 'Escaneie o QR Code com seu WhatsApp'
        })
      } else {
        return res.status(200).json({
          success: true,
          ready: false,
          message: 'Aguardando QR Code... Tente novamente em alguns segundos'
        })
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao obter QR Code. Verifique se whatsapp-web.js está instalado.'
      })
    }
  } catch (error) {
    console.error('Erro na API de QR Code:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

