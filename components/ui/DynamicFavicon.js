import { useEffect } from 'react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

export default function DynamicFavicon() {
  const { isLocal } = useNetworkStatus()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Encontrar o favicon atual
      let favicon = document.querySelector('link[rel="icon"]')
      
      if (!favicon) {
        // Criar um novo favicon se não existir
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        favicon.type = 'image/x-icon'
        document.head.appendChild(favicon)
      }

      // Definir o ícone baseado no status
      const iconPath = isLocal ? '/icon_local.ico' : '/Host_ico_rede.ico'
      favicon.href = iconPath

      // Também atualizar shortcut icon se existir
      const shortcutIcon = document.querySelector('link[rel="shortcut icon"]')
      if (shortcutIcon) {
        shortcutIcon.href = iconPath
      }

      // Atualizar o título da página para incluir o status
      const originalTitle = document.title.replace(' [Local]', '').replace(' [Rede]', '')
      const baseTitle = originalTitle || 'Beef-Sync'
      document.title = `${baseTitle} ${isLocal ? '[Local]' : '[Rede]'}`
    }
  }, [isLocal])

  return null // Este componente não renderiza nada visível
}