import { useState, useEffect } from 'react'

export function useUserIdentification() {
  const [userInfo, setUserInfo] = useState(null) // Start with null to prevent hydration mismatch

  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    const hostname = window.location.hostname
    const port = window.location.port
    
    let userType, userName, userRole, isDev, isNetwork

    // Identificar tipo de usuário baseado no hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      userType = 'developer'
      userName = 'Zeca'
      userRole = 'Desenvolvedor'
      isDev = true
      isNetwork = false
    } else if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      userType = 'network'
      userName = 'Usuário da Rede'
      userRole = 'Usuário'
      isDev = false
      isNetwork = true
    } else {
      userType = 'external'
      userName = 'Usuário Externo'
      userRole = 'Visitante'
      isDev = false
      isNetwork = false
    }

    setUserInfo({
      type: userType,
      name: userName,
      role: userRole,
      hostname: hostname,
      ip: hostname,
      port: port,
      isDeveloper: isDev,
      isNetworkUser: isNetwork,
      fullUrl: window.location.origin,
      accessTime: new Date().toLocaleString('pt-BR')
    })

    // Log do acesso para monitoramento
    console.log(`🔐 Acesso identificado:`, {
      usuario: userName,
      tipo: userType,
      hostname: hostname,
      horario: new Date().toLocaleString('pt-BR')
    })

    // Registrar acesso na API (sem bloquear a interface)
    try {
      fetch('/api/access-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: userName,
          userType: userType,
          ipAddress: hostname,
          hostname: hostname,
          userAgent: navigator.userAgent,
          action: 'Acesso ao Sistema'
        })
      }).catch(error => {
        console.warn('Erro ao registrar acesso:', error)
      })
    } catch (error) {
      console.warn('Erro ao registrar acesso:', error)
    }
  }, [])

  return userInfo
}