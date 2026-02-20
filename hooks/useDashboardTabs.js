

import React, { useCallback, useState } from 'react'

export default function useDashboardTabs() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchResults, setSearchResults] = useState(null)
  const [showExportImport, setShowExportImport] = useState(false)
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false)

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  const handleSearch = useCallback((results, term, filters) => {
    setSearchResults({ results, term, filters })
    setActiveTab('search')
  }, [])

  const toggleExportImport = useCallback(() => {
    setShowExportImport(prev => !prev)
  }, [])

  const toggleAdvancedMenu = useCallback(() => {
    setShowAdvancedMenu(prev => !prev)
  }, [])

  return {
    activeTab,
    searchResults,
    showExportImport,
    showAdvancedMenu,
    handleTabChange,
    handleSearch,
    toggleExportImport,
    toggleAdvancedMenu
  }
}
