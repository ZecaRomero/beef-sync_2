

/**
 * Hook para gerenciar atalhos de teclado
 * 
 * @param {Object} shortcuts - Objeto com os atalhos { 'ctrl+k': callback }
 * @param {boolean} enabled - Se os atalhos estão habilitados
 */
import React, { useCallback, useEffect } from 'react'

export default function useKeyboardShortcuts(shortcuts, enabled = true) {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return

    // Ignorar se estiver digitando em input/textarea
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      return
    }

    // Construir a chave do atalho
    const keys = []
    if (event.ctrlKey) keys.push('ctrl')
    if (event.altKey) keys.push('alt')
    if (event.shiftKey) keys.push('shift')
    if (event.metaKey) keys.push('meta')
    
    const key = event.key.toLowerCase()
    if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      keys.push(key)
    }

    const shortcutKey = keys.join('+')

    // Executar callback se existir
    if (shortcuts[shortcutKey]) {
      event.preventDefault()
      shortcuts[shortcutKey]()
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Atalhos padrão do sistema
export const DEFAULT_SHORTCUTS = {
  // Navegação
  'ctrl+h': { action: '/', description: 'Ir para Home' },
  'ctrl+d': { action: '/dashboard', description: 'Ir para Dashboard' },
  'ctrl+a': { action: '/animals', description: 'Ir para Animais' },
  'ctrl+s': { action: '/semen', description: 'Ir para Estoque de Sêmen' },
  'ctrl+n': { action: '/nascimentos', description: 'Ir para Nascimentos' },
  'ctrl+r': { action: '/reports', description: 'Ir para Relatórios' },
  
  // Ações
  'ctrl+k': { action: 'search', description: 'Buscar' },
  'ctrl+p': { action: 'add', description: 'Adicionar Novo' },
  'ctrl+b': { action: 'backup', description: 'Fazer Backup' },
  'ctrl+shift+t': { action: 'theme', description: 'Alternar Tema' },
  
  // Ajuda
  'ctrl+/': { action: 'help', description: 'Mostrar Atalhos' },
  'esc': { action: 'close', description: 'Fechar Modal/Cancelar' },
}

