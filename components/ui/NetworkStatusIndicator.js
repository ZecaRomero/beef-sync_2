import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { useUserIdentification } from '../../hooks/useUserIdentification'
import { 
  GlobeAltIcon, 
  ComputerDesktopIcon,
  CodeBracketIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

export default function NetworkStatusIndicator({ className = '' }) {
  const { isLocal, hostname, statusText } = useNetworkStatus()
  const userInfo = useUserIdentification()

  const getUserIcon = () => {
    if (userInfo?.isDeveloper) {
      return <CodeBracketIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
    } else if (userInfo?.isNetworkUser) {
      return <UsersIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
    } else {
      return isLocal ? (
        <ComputerDesktopIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      ) : (
        <GlobeAltIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
      )
    }
  }

  const getUserColor = () => {
    if (userInfo?.isDeveloper) {
      return 'text-purple-600 dark:text-purple-400'
    } else if (userInfo?.isNetworkUser) {
      return 'text-green-600 dark:text-green-400'
    } else {
      return isLocal 
        ? 'text-blue-600 dark:text-blue-400' 
        : 'text-green-600 dark:text-green-400'
    }
  }

  const getStatusDot = () => {
    if (userInfo?.isDeveloper) {
      return 'bg-purple-500 animate-pulse'
    } else if (userInfo?.isNetworkUser) {
      return 'bg-green-500'
    } else {
      return isLocal ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
    }
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Identificação do Usuário */}
      <div className="flex items-center space-x-2">
        {getUserIcon()}
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${getUserColor()}`}>
            {userInfo?.name || 'Usuário'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {userInfo?.role || 'Carregando'}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
      </div>
      
      {/* Informações de Rede */}
      <div className="flex items-center space-x-2 text-xs">
        <span className={`font-medium ${getUserColor()}`}>
          {statusText}
        </span>
        <span className="text-gray-500 dark:text-gray-400 font-mono">
          {hostname}
        </span>
      </div>
    </div>
  )
}