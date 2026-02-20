import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isLocal, setIsLocal] = useState(null) // Start with null to prevent hydration mismatch
  const [hostname, setHostname] = useState('')

  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    const currentHostname = window.location.hostname
    setHostname(currentHostname)
    
    // Detectar se é local ou rede
    const isLocalhost = currentHostname === 'localhost' || 
                       currentHostname === '127.0.0.1' || 
                       currentHostname.startsWith('192.168.') ||
                       currentHostname.startsWith('10.') ||
                       currentHostname.startsWith('172.')
    
    setIsLocal(isLocalhost)
  }, [])

  return {
    isLocal,
    hostname,
    iconPath: isLocal === null ? '/icon_local.ico' : (isLocal ? '/icon_local.ico' : '/Host_ico_rede.ico'),
    statusText: isLocal === null ? 'Carregando...' : (isLocal ? 'Local' : 'Rede')
  }
}