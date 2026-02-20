

// Sistema de temas personalizáveis para Beef Sync
import React, { useCallback, useEffect, useState } from 'react'

export default function useTheme() {
  const [theme, setTheme] = useState('light')
  const [accentColor, setAccentColor] = useState('blue')
  const [fontSize, setFontSize] = useState('medium')
  const [animations, setAnimations] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  // Temas disponíveis
  const themes = {
    light: {
      name: 'Claro',
      colors: {
        primary: 'blue',
        secondary: 'gray',
        background: 'white',
        surface: 'gray-50',
        text: 'gray-900',
        textSecondary: 'gray-600'
      }
    },
    dark: {
      name: 'Escuro',
      colors: {
        primary: 'blue',
        secondary: 'gray',
        background: 'gray-900',
        surface: 'gray-800',
        text: 'white',
        textSecondary: 'gray-300'
      }
    },
    auto: {
      name: 'Automático',
      colors: {
        primary: 'blue',
        secondary: 'gray',
        background: 'auto',
        surface: 'auto',
        text: 'auto',
        textSecondary: 'auto'
      }
    }
  }

  // Cores de destaque disponíveis
  const accentColors = {
    blue: { name: 'Azul', value: 'blue-600', gradient: 'from-blue-500 to-blue-600' },
    green: { name: 'Verde', value: 'green-600', gradient: 'from-green-500 to-green-600' },
    purple: { name: 'Roxo', value: 'purple-600', gradient: 'from-purple-500 to-purple-600' },
    red: { name: 'Vermelho', value: 'red-600', gradient: 'from-red-500 to-red-600' },
    orange: { name: 'Laranja', value: 'orange-600', gradient: 'from-orange-500 to-orange-600' },
    teal: { name: 'Verde-azulado', value: 'teal-600', gradient: 'from-teal-500 to-teal-600' }
  }

  // Tamanhos de fonte disponíveis
  const fontSizes = {
    small: { name: 'Pequeno', value: 'text-sm', scale: 0.875 },
    medium: { name: 'Médio', value: 'text-base', scale: 1 },
    large: { name: 'Grande', value: 'text-lg', scale: 1.125 },
    xlarge: { name: 'Muito Grande', value: 'text-xl', scale: 1.25 }
  }

  // Carregar configurações salvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('beef-sync-theme')
      const savedAccentColor = localStorage.getItem('beef-sync-accent-color')
      const savedFontSize = localStorage.getItem('beef-sync-font-size')
      const savedAnimations = localStorage.getItem('beef-sync-animations')
      const savedCompactMode = localStorage.getItem('beef-sync-compact-mode')

      if (savedTheme) setTheme(savedTheme)
      if (savedAccentColor) setAccentColor(savedAccentColor)
      if (savedFontSize) setFontSize(savedFontSize)
      if (savedAnimations !== null) setAnimations(savedAnimations === 'true')
      if (savedCompactMode !== null) setCompactMode(savedCompactMode === 'true')
    }
  }, [])

  // Aplicar tema ao documento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      
      // Aplicar tema
      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else if (theme === 'auto') {
        // Usar preferência do sistema
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }

      // Aplicar cor de destaque
      root.style.setProperty('--accent-color', `var(--${accentColor}-600)`)
      root.style.setProperty('--accent-color-light', `var(--${accentColor}-100)`)
      root.style.setProperty('--accent-color-dark', `var(--${accentColor}-700)`)

      // Aplicar tamanho da fonte
      const fontSizeScale = fontSizes[fontSize]?.scale || 1
      root.style.setProperty('--font-size-scale', fontSizeScale)

      // Aplicar animações
      if (!animations) {
        root.classList.add('no-animations')
      } else {
        root.classList.remove('no-animations')
      }

      // Aplicar modo compacto
      if (compactMode) {
        root.classList.add('compact-mode')
      } else {
        root.classList.remove('compact-mode')
      }

    }
  }, [theme, accentColor, fontSize, animations, compactMode])

  // Salvar configurações
  const saveSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('beef-sync-theme', theme)
      localStorage.setItem('beef-sync-accent-color', accentColor)
      localStorage.setItem('beef-sync-font-size', fontSize)
      localStorage.setItem('beef-sync-animations', animations.toString())
      localStorage.setItem('beef-sync-compact-mode', compactMode.toString())
    }
  }, [theme, accentColor, fontSize, animations, compactMode])

  // Alterar tema
  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme)
    saveSettings()
  }, [saveSettings])

  // Alterar cor de destaque
  const changeAccentColor = useCallback((newColor) => {
    setAccentColor(newColor)
    saveSettings()
  }, [saveSettings])

  // Alterar tamanho da fonte
  const changeFontSize = useCallback((newSize) => {
    setFontSize(newSize)
    saveSettings()
  }, [saveSettings])

  // Alternar animações
  const toggleAnimations = useCallback(() => {
    setAnimations(prev => !prev)
    saveSettings()
  }, [saveSettings])

  // Alternar modo compacto
  const toggleCompactMode = useCallback(() => {
    setCompactMode(prev => !prev)
    saveSettings()
  }, [saveSettings])

  // Resetar para padrão
  const resetToDefault = useCallback(() => {
    setTheme('light')
    setAccentColor('blue')
    setFontSize('medium')
    setAnimations(true)
    setCompactMode(false)
    saveSettings()
  }, [saveSettings])

  // Obter classes CSS para componentes
  const getThemeClasses = useCallback((component) => {
    const baseClasses = {
      button: `bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white`,
      card: `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`,
      input: `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`,
      text: `text-gray-900 dark:text-white`,
      textSecondary: `text-gray-600 dark:text-gray-400`,
      background: `bg-gray-50 dark:bg-gray-900`,
      surface: `bg-white dark:bg-gray-800`
    }

    return baseClasses[component] || ''
  }, [accentColor])

  // Obter configurações atuais
  const getCurrentSettings = useCallback(() => {
    return {
      theme: themes[theme],
      accentColor: accentColors[accentColor],
      fontSize: fontSizes[fontSize],
      animations,
      compactMode
    }
  }, [theme, accentColor, fontSize, animations, compactMode])

  // Verificar se é tema escuro
  const isDark = useCallback(() => {
    if (theme === 'dark') return true
    if (theme === 'light') return false
    if (theme === 'auto') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }, [theme])

  // Obter cor de destaque atual
  const getCurrentAccentColor = useCallback(() => {
    return accentColors[accentColor]
  }, [accentColor])

  // Obter tamanho da fonte atual
  const getCurrentFontSize = useCallback(() => {
    return fontSizes[fontSize]
  }, [fontSize])

  return {
    // Estado atual
    theme,
    accentColor,
    fontSize,
    animations,
    compactMode,
    
    // Configurações disponíveis
    themes,
    accentColors,
    fontSizes,
    
    // Funções de alteração
    changeTheme,
    changeAccentColor,
    changeFontSize,
    toggleAnimations,
    toggleCompactMode,
    resetToDefault,
    
    // Funções utilitárias
    getThemeClasses,
    getCurrentSettings,
    isDark,
    getCurrentAccentColor,
    getCurrentFontSize,
    
    // Salvar configurações
    saveSettings
  }
}
