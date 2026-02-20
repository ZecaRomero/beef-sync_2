import { useState, useEffect } from 'react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { useUserIdentification } from '../../hooks/useUserIdentification'
import {
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  ServerIcon,
  CodeBracketIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

export default function SystemInfo({ className = '' }) {
  const { isLocal, hostname, statusText } = useNetworkStatus()
  const userInfo = useUserIdentification()
  const [currentTime, setCurrentTime] = useState('')
  const [serverStatus, setServerStatus] = useState('online')

  useEffect(() => {
    // Atualizar horário a cada segundo
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'))
    }

    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    // Verificar status do servidor
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/healthz')
        setServerStatus(response.ok ? 'online' : 'offline')
      } catch (error) {
        setServerStatus('offline')
      }
    }

    checkServerStatus()
    const statusInterval = setInterval(checkServerStatus, 30000) // Verificar a cada 30s

    return () => {
      clearInterval(timeInterval)
      clearInterval(statusInterval)
    }
  }, [])

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Identificação do Usuário */}
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
        {userInfo?.isDeveloper ? (
          <CodeBracketIcon className="h-4 w-4 text-purple-300" />
        ) : userInfo?.isNetworkUser ? (
          <UsersIcon className="h-4 w-4 text-green-300" />
        ) : isLocal === true ? (
          <ComputerDesktopIcon className="h-4 w-4 text-blue-300" />
        ) : isLocal === false ? (
          <GlobeAltIcon className="h-4 w-4 text-green-300" />
        ) : (
          <ComputerDesktopIcon className="h-4 w-4 text-gray-300" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">
            {userInfo?.name || 'Carregando...'}
          </span>
          <span className="text-xs text-white/70">
            {statusText}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${
          userInfo === null || isLocal === null
            ? 'bg-gray-400'
            : userInfo?.isDeveloper
              ? 'bg-purple-400 animate-pulse'
              : userInfo?.isNetworkUser
                ? 'bg-green-400'
                : isLocal
                  ? 'bg-blue-400 animate-pulse'
                  : 'bg-green-400'
          }`} />
      </div>

      {/* Status do Servidor */}
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
        <ServerIcon className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white">
          Servidor
        </span>
        <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-400' : 'bg-red-400 animate-pulse'
          }`} />
      </div>

      {/* Horário Atual */}
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
        <ClockIcon className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white font-mono">
          {currentTime}
        </span>
      </div>

      {/* Hostname (apenas se não for localhost) */}
      {hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && (
        <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
          <span className="text-xs text-blue-100 font-mono">
            {hostname}
          </span>
        </div>
      )}
    </div>
  )
}