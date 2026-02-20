'use client'

import React from 'react'
import { useRouter } from 'next/router'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useTabs } from '../../contexts/TabsContext'
import { cn } from '../../lib/utils'

export default function TabBar() {
  const router = useRouter()
  const { tabs, removeTab, navigateToTab } = useTabs()
  const currentPath = router.asPath?.split('?')[0] || router.pathname

  if (tabs.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.path
        return (
          <div
            key={tab.id}
            className={cn(
              'group flex items-center gap-1.5 px-4 py-2 rounded-t-lg border transition-all duration-200 min-w-0 max-w-[180px]',
              isActive
                ? 'bg-white dark:bg-gray-900 border-b-0 border-gray-200 dark:border-gray-700 shadow-sm -mb-px'
                : 'bg-gray-50 dark:bg-gray-800/80 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700/80'
            )}
          >
            <button
              onClick={() => navigateToTab(tab.path)}
              className="flex-1 min-w-0 text-left text-sm font-medium truncate focus:outline-none focus:ring-0"
            >
              <span className={cn(
                'truncate block',
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
              )}>
                {tab.label}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTab(tab.path)
              }}
              className={cn(
                'p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0',
                isActive ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100'
              )}
              title="Fechar"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
