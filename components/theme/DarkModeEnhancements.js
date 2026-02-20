
import React, { useEffect, useState } from 'react'

import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  SwatchIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'

export default function DarkModeEnhancements() {
  const [theme, setTheme] = useState('system')
  const [accentColor, setAccentColor] = useState('blue')
  const [customColors, setCustomColors] = useState({
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#10B981',
    background: '#1F2937',
    surface: '#374151'
  })

  const themes = [
    { id: 'light', name: 'Claro', icon: SunIcon, description: 'Tema claro tradicional' },
    { id: 'dark', name: 'Escuro', icon: MoonIcon, description: 'Tema escuro padrão' },
    { id: 'system', name: 'Sistema', icon: ComputerDesktopIcon, description: 'Segue as preferências do sistema' }
  ]

  const accentColors = [
    { id: 'blue', name: 'Azul', color: '#3B82F6', class: 'blue' },
    { id: 'green', name: 'Verde', color: '#10B981', class: 'green' },
    { id: 'purple', name: 'Roxo', color: '#8B5CF6', class: 'purple' },
    { id: 'orange', name: 'Laranja', color: '#F59E0B', class: 'orange' },
    { id: 'red', name: 'Vermelho', color: '#EF4444', class: 'red' },
    { id: 'pink', name: 'Rosa', color: '#EC4899', class: 'pink' }
  ]

  useEffect(() => {
    // Carregar configurações salvas
    const savedTheme = localStorage.getItem('beefsync_theme') || 'system'
    const savedAccent = localStorage.getItem('beefsync_accent') || 'blue'
    const savedCustomColors = JSON.parse(localStorage.getItem('beefsync_custom_colors') || '{}')

    setTheme(savedTheme)
    setAccentColor(savedAccent)
    if (Object.keys(savedCustomColors).length > 0) {
      setCustomColors({ ...customColors, ...savedCustomColors })
    }

    // Aplicar tema
    applyTheme(savedTheme, savedAccent, savedCustomColors)
  }, [])

  const applyTheme = (newTheme, newAccent, customColors = {}) => {
    const root = document.documentElement

    // Remover classes de tema anteriores
    root.classList.remove('light', 'dark', 'auto')

    // Aplicar novo tema
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'dark' : 'light')
      root.classList.add('auto')
    } else {
      root.classList.add(newTheme)
    }

    // Aplicar cor de destaque
    root.classList.remove('blue', 'green', 'purple', 'orange', 'red', 'pink')
    root.classList.add(newAccent)

    // Aplicar cores customizadas
    if (Object.keys(customColors).length > 0) {
      Object.entries(customColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
    }

    // Salvar configurações
    localStorage.setItem('beefsync_theme', newTheme)
    localStorage.setItem('beefsync_accent', newAccent)
    if (Object.keys(customColors).length > 0) {
      localStorage.setItem('beefsync_custom_colors', JSON.stringify(customColors))
    }
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    applyTheme(newTheme, accentColor, customColors)
  }

  const handleAccentChange = (newAccent) => {
    setAccentColor(newAccent)
    applyTheme(theme, newAccent, customColors)
  }

  const handleCustomColorChange = (colorKey, value) => {
    const newCustomColors = { ...customColors, [colorKey]: value }
    setCustomColors(newCustomColors)
    applyTheme(theme, accentColor, newCustomColors)
  }

  const resetToDefaults = () => {
    setTheme('system')
    setAccentColor('blue')
    setCustomColors({
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#10B981',
      background: '#1F2937',
      surface: '#374151'
    })
    applyTheme('system', 'blue', {})
    localStorage.removeItem('beefsync_custom_colors')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <SwatchIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Personalização de Tema
        </h2>
      </div>

      <div className="space-y-8">
        {/* Seleção de Tema */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tema Base
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              return (
                <button
                  key={themeOption.id}
                  onClick={() => handleThemeChange(themeOption.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === themeOption.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${
                      theme === themeOption.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {themeOption.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {themeOption.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Cores de Destaque */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cor de Destaque
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleAccentChange(color.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  accentColor === color.id
                    ? 'border-gray-900 dark:border-white'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {color.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cores Customizadas */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cores Personalizadas
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor Primária
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.primary}
                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor Secundária
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.secondary}
                    onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#64748B"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor de Destaque
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.accent}
                    onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#10B981"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor de Fundo
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColors.background}
                    onChange={(e) => handleCustomColorChange('background', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.background}
                    onChange={(e) => handleCustomColorChange('background', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#1F2937"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview do Tema */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Preview do Tema
          </h3>
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Este é um exemplo de texto com o tema atual
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                  Botão Primário
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Botão Secundário
                </button>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Card de exemplo com fundo e bordas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Restaurar Padrões
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            As configurações são salvas automaticamente
          </div>
        </div>
      </div>
    </div>
  )
}
