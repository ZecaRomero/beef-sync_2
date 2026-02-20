import { useUserIdentification } from '../../hooks/useUserIdentification'
import { 
  ComputerDesktopIcon, 
  GlobeAltIcon, 
  UserIcon,
  CodeBracketIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

export default function UserIdentificationBadge({ className = '', showDetails = true }) {
  const userInfo = useUserIdentification()

  const getUserIcon = () => {
    switch (userInfo.type) {
      case 'developer':
        return <CodeBracketIcon className="h-4 w-4" />
      case 'network':
        return <UsersIcon className="h-4 w-4" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  const getUserColor = () => {
    switch (userInfo.type) {
      case 'developer':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'network':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${getUserColor()}`}>
        {getUserIcon()}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {userInfo.name}
          </span>
          {showDetails && (
            <span className="text-xs opacity-75">
              {userInfo.role}
            </span>
          )}
        </div>
        
        {/* Indicador de status */}
        <div className={`w-2 h-2 rounded-full ${
          userInfo.isDeveloper 
            ? 'bg-purple-500 animate-pulse' 
            : userInfo.isNetworkUser 
            ? 'bg-green-500' 
            : 'bg-gray-500'
        }`} />
      </div>

      {showDetails && (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {userInfo.ip}
        </div>
      )}
    </div>
  )
}