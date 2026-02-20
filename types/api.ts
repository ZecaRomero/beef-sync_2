/**
 * Tipos TypeScript para respostas padronizadas da API
 */

export interface APIResponse<T = any> {
  success: boolean
  message: string
  timestamp: string
  data?: T
  errors?: ValidationError[] | string[] | Record<string, string>
  meta?: ResponseMeta
}

export interface ResponseMeta {
  pagination?: PaginationMeta
  filters?: Record<string, any>
  sorting?: SortingMeta
  performance?: PerformanceMeta
  [key: string]: any
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SortingMeta {
  field: string
  direction: 'asc' | 'desc'
}

export interface PerformanceMeta {
  executionTime: number
  queryCount?: number
  cacheHit?: boolean
}

export interface ValidationError {
  field: string
  message: string
  code?: string
  value?: any
}

export interface HealthCheckData {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version?: string
  environment?: string
  database?: {
    status: 'connected' | 'disconnected'
    responseTime?: number
  }
  cache?: {
    status: 'connected' | 'disconnected'
    hitRate?: number
  }
  services?: Record<string, {
    status: 'up' | 'down'
    responseTime?: number
  }>
}

export interface BatchOperationResult<T = any> {
  successful: T[]
  failed: Array<{
    item: any
    error: string
    index: number
  }>
  summary: {
    total: number
    successful: number
    failed: number
  }
}

// Tipos específicos para diferentes endpoints
export interface AnimalResponse extends APIResponse<Animal> {}
export interface AnimalsResponse extends APIResponse<Animal[]> {}

export interface NotaFiscalResponse extends APIResponse<NotaFiscal> {}
export interface NotasFiscaisResponse extends APIResponse<NotaFiscal[]> {}

export interface DashboardStatsResponse extends APIResponse<DashboardStats> {}

export interface ReportResponse extends APIResponse<{
  reportId: string
  downloadUrl?: string
  previewData?: any
}> {}

// Tipos para entidades principais
export interface Animal {
  id: string
  identificacao: string
  nome?: string
  sexo: 'M' | 'F'
  raca: string
  peso?: number
  data_nascimento?: string
  data_entrada?: string
  status: 'ativo' | 'vendido' | 'morto' | 'transferido'
  valor_compra?: number
  valor_atual?: number
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface NotaFiscal {
  id: string
  numero: string
  serie: string
  data_emissao: string
  tipo: 'entrada' | 'saida'
  fornecedor_cliente: string
  valor_total: number
  itens: NotaFiscalItem[]
  status: 'pendente' | 'processada' | 'cancelada'
  created_at: string
  updated_at: string
}

export interface NotaFiscalItem {
  id: string
  animal_id?: string
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_total: number
}

export interface DashboardStats {
  totalAnimals: number
  activeAnimals: number
  totalValue: number
  monthlyGrowth: number
  recentDeaths: number
  recentBirths: number
  pendingTasks: number
  alerts: Alert[]
}

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  read: boolean
}

// Tipos para filtros e parâmetros de consulta
export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface DateRangeFilter {
  startDate: string
  endDate: string
}

export interface AnimalFilters {
  status?: Animal['status']
  sexo?: Animal['sexo']
  raca?: string
  dateRange?: DateRangeFilter
  minWeight?: number
  maxWeight?: number
  minValue?: number
  maxValue?: number
}

// Tipos para operações específicas
export interface BulkDeleteRequest {
  ids: string[]
  reason?: string
}

export interface BulkUpdateRequest<T = any> {
  ids: string[]
  updates: Partial<T>
}

export interface ExportRequest {
  format: 'xlsx' | 'csv' | 'pdf'
  filters?: Record<string, any>
  fields?: string[]
  dateRange?: DateRangeFilter
}

export interface ImportRequest {
  file: File
  mapping: Record<string, string>
  options?: {
    skipDuplicates?: boolean
    updateExisting?: boolean
  }
}

// Tipos para relatórios
export interface ReportConfig {
  type: string
  title: string
  description?: string
  parameters: Record<string, any>
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    recipients: string[]
  }
}

export interface ReportData {
  config: ReportConfig
  data: any[]
  generatedAt: string
  totalRecords: number
  filters: Record<string, any>
}

// Tipos para notificações
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  expires_at?: string
}

// Tipos para autenticação (se necessário)
export interface AuthResponse extends APIResponse<{
  token: string
  user: User
  expiresIn: number
}> {}

export interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  created_at: string
  last_login?: string
}

// Tipos para configurações do sistema
export interface SystemConfig {
  version: string
  environment: string
  features: Record<string, boolean>
  limits: {
    maxAnimals: number
    maxFileSize: number
    maxExportRecords: number
  }
  integrations: Record<string, {
    enabled: boolean
    config: Record<string, any>
  }>
}

// Removendo export default pois contém apenas tipos/interfaces
// Use named exports para importar os tipos necessários