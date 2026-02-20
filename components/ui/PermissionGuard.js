import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'

/**
 * Componente para proteger ações baseado em permissões
 * 
 * @param {boolean} permission - Permissão necessária
 * @param {ReactNode} children - Conteúdo a ser exibido se tiver permissão
 * @param {ReactNode} fallback - Conteúdo alternativo se não tiver permissão
 * @param {boolean} showTooltip - Mostrar tooltip explicativo se não tiver permissão
 */
export default function PermissionGuard({ 
  permission, 
  children, 
  fallback = null,
  showTooltip = true 
}) {
  const { getPermissionMessage } = usePermissions()

  if (permission) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showTooltip) {
    return (
      <div className="relative group">
        <div className="opacity-50 cursor-not-allowed">
          {children}
        </div>
        <div className="hidden group-hover:block absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          {getPermissionMessage('excluir')}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Wrapper para desabilitar botões baseado em permissões
 */
export function PermissionButton({ permission, children, disabled, ...props }) {
  const { getPermissionMessage } = usePermissions()
  const isDisabled = disabled || !permission

  return (
    <button
      {...props}
      disabled={isDisabled}
      title={isDisabled ? getPermissionMessage('excluir') : props.title}
      className={`${props.className || ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

