import React, { useState, useRef, useEffect } from 'react'
import { SelectProps, SelectOption } from '../../types/components'
import { cn } from '../../lib/utils'

const Select: React.FC<SelectProps> = ({
  name,
  label,
  required = false,
  error,
  helperText,
  options,
  placeholder = 'Selecione uma opção',
  multiple = false,
  searchable = false,
  clearable = false,
  loading = false,
  onSearch,
  value,
  onChange,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(() => {
    if (multiple) {
      return Array.isArray(value) ? value.filter(v => typeof v === 'string' || typeof v === 'number') : []
    } else {
      return value !== undefined && (typeof value === 'string' || typeof value === 'number') ? [value] : []
    }
  })
  
  const selectRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtrar opções baseado na busca
  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focar no input de busca quando abrir
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return

    let newValues: (string | number)[]

    if (multiple) {
      if (selectedValues.includes(option.value)) {
        newValues = selectedValues.filter(v => v !== option.value)
      } else {
        newValues = [...selectedValues, option.value]
      }
    } else {
      newValues = [option.value]
      setIsOpen(false)
    }

    setSelectedValues(newValues)
    
    if (onChange) {
      const changeValue = multiple ? newValues : newValues[0]
      onChange({ target: { name, value: changeValue } } as any)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedValues([])
    if (onChange) {
      onChange({ target: { name, value: multiple ? [] : '' } } as any)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }

  const getDisplayValue = () => {
    if (selectedValues.length === 0) return placeholder

    if (multiple) {
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || selectedValues[0]
      }
      return `${selectedValues.length} selecionados`
    }

    const option = options.find(opt => opt.value === selectedValues[0])
    return option?.label || selectedValues[0]
  }

  const baseClasses = 'relative w-full'
  const triggerClasses = cn(
    'flex items-center justify-between w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border rounded-lg cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    error 
      ? 'border-red-500 dark:border-red-400' 
      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
    loading && 'cursor-wait',
    className
  )

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={baseClasses} ref={selectRef}>
        <div
          className={triggerClasses}
          onClick={() => !loading && setIsOpen(!isOpen)}
          {...props}
        >
          <span className={cn(
            'block truncate',
            selectedValues.length === 0 && 'text-gray-500 dark:text-gray-400'
          )}>
            {getDisplayValue()}
          </span>
          
          <div className="flex items-center space-x-1">
            {clearable && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            ) : (
              <svg 
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform duration-200',
                  isOpen && 'transform rotate-180'
                )} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma opção disponível'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm cursor-pointer transition-colors',
                      option.disabled 
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600',
                      selectedValues.includes(option.value) && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    )}
                    onClick={() => handleOptionClick(option)}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option.value)}
                        onChange={() => {}}
                        className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                    <span className="flex-1">{option.label}</span>
                    {!multiple && selectedValues.includes(option.value) && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <div className="text-sm">
          {error ? (
            <span className="text-red-600 dark:text-red-400">{error}</span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{helperText}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default Select