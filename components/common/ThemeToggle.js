
import React, { useEffect, useState } from 'react'

import { SunIcon, MoonIcon } from '../ui/Icons'

export default function ThemeToggle({ className = '' }) {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Verificar preferência salva ou sistema
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setDarkMode(isDark)
    updateTheme(isDark)
  }, [])

  const updateTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    updateTheme(newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  if (!mounted) {
    return null // Evitar flash no carregamento
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative group overflow-hidden rounded-xl p-3 
        bg-gradient-to-br ${darkMode ? 'from-indigo-600 to-purple-700' : 'from-yellow-400 to-orange-500'}
        shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110
        ${className}
      `}
      title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
      aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {/* Efeito de brilho */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer" />
      
      {/* Ícone */}
      <div className="relative">
        {darkMode ? (
          <MoonIcon className="h-5 w-5 text-white animate-fade-in" />
        ) : (
          <SunIcon className="h-5 w-5 text-white animate-fade-in" />
        )}
      </div>
      
      {/* Indicador de estado */}
      <div className={`
        absolute -bottom-1 -right-1 w-3 h-3 rounded-full 
        ${darkMode ? 'bg-purple-300' : 'bg-yellow-200'}
        animate-pulse
      `} />
    </button>
  )
}

// Componente Toggle mais simples (switch)
export function ThemeSwitch({ className = '' }) {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setDarkMode(isDark)
    updateTheme(isDark)
  }, [])

  const updateTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    updateTheme(newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-14 items-center rounded-full
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}
        ${className}
      `}
      aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {/* Bolinha do switch */}
      <span
        className={`
          inline-flex h-6 w-6 items-center justify-center transform rounded-full 
          bg-white shadow-md transition-transform duration-300
          ${darkMode ? 'translate-x-7' : 'translate-x-1'}
        `}
      >
        {darkMode ? (
          <MoonIcon className="h-4 w-4 text-indigo-600" />
        ) : (
          <SunIcon className="h-4 w-4 text-yellow-500" />
        )}
      </span>
    </button>
  )
}

