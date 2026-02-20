import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'

// Tipos base para componentes UI
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

// Tipos para Button
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

// Tipos para Input
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: ReactNode
  variant?: 'default' | 'filled' | 'outlined'
}

// Tipos para Card
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface CardHeaderProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export interface CardBodyProps extends BaseComponentProps {
  noPadding?: boolean
}

// Tipos para Modal
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
}

// Tipos para Table
export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex?: string
  render?: (value: any, record: T, index: number) => ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowKey?: string | ((record: T) => string)
  onRowClick?: (record: T, index: number) => void
  emptyText?: string
}

// Tipos para Badge
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

// Tipos para Toast
export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Tipos para Layout
export interface LayoutProps extends BaseComponentProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onClose: () => void
}

export interface HeaderProps {
  darkMode: boolean
  toggleDarkMode: () => void
  onMenuClick: () => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

// Tipos para navegação
export interface NavigationItem {
  name: string
  href?: string
  icon: any
  color?: string
  children?: NavigationSubItem[]
}

export interface NavigationSubItem {
  name: string
  href: string
  description?: string
}

// Tipos para Dashboard
export interface DashboardStats {
  totalAnimals: number
  activeAnimals: number
  totalLocations: number
  todayEvents: number
  monthlyGrowth?: number
  alerts?: number
}

export interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
  loading?: boolean
}

// Tipos para formulários
export interface FormFieldProps {
  name: string
  label?: string
  required?: boolean
  error?: string
  helperText?: string
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends FormFieldProps {
  options: SelectOption[]
  placeholder?: string
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  loading?: boolean
  onSearch?: (query: string) => void
  value?: string | number | (string | number)[]
  onChange?: (value: string | number | (string | number)[]) => void
  className?: string
}