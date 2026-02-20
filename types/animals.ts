// Tipos para o domínio de animais
export interface Animal {
  id: string
  brinco: string
  nome?: string
  sexo: 'M' | 'F'
  raca: string
  peso?: number
  data_nascimento: string
  data_cadastro: string
  status: 'ativo' | 'vendido' | 'morto' | 'transferido'
  localizacao_id?: string
  pai_id?: string
  mae_id?: string
  observacoes?: string
  foto_url?: string
  created_at: string
  updated_at: string
}

export interface AnimalFormData {
  brinco: string
  nome?: string
  sexo: 'M' | 'F'
  raca: string
  peso?: number
  data_nascimento: string
  localizacao_id?: string
  pai_id?: string
  mae_id?: string
  observacoes?: string
}

export interface AnimalFilters {
  search?: string
  sexo?: 'M' | 'F' | 'all'
  raca?: string
  status?: 'ativo' | 'vendido' | 'morto' | 'transferido' | 'all'
  localizacao_id?: string
  idade_min?: number
  idade_max?: number
  peso_min?: number
  peso_max?: number
  orderBy?: string
}

export interface AnimalStats {
  total: number
  ativos: number
  machos: number
  femeas: number
  por_raca: Record<string, number>
  por_localizacao: Record<string, number>
  media_peso: number
  media_idade: number
}

// Tipos para nascimentos
export interface Nascimento {
  id: string
  animal_id: string
  mae_id: string
  pai_id?: string
  data_nascimento: string
  peso_nascimento?: number
  facilidade_parto: 'facil' | 'normal' | 'dificil' | 'cesariana'
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface NascimentoFormData {
  mae_id: string
  pai_id?: string
  data_nascimento: string
  peso_nascimento?: number
  facilidade_parto: 'facil' | 'normal' | 'dificil' | 'cesariana'
  observacoes?: string
  // Dados do animal recém-nascido
  brinco: string
  nome?: string
  sexo: 'M' | 'F'
  raca: string
}

// Tipos para gestação
export interface Gestacao {
  id: string
  animal_id: string
  touro_id?: string
  data_cobertura: string
  data_prevista_parto: string
  data_parto?: string
  tipo_cobertura: 'monta_natural' | 'inseminacao' | 'transferencia_embriao'
  status: 'confirmada' | 'suspeita' | 'vazia' | 'parida'
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface GestacaoFormData {
  animal_id: string
  touro_id?: string
  data_cobertura: string
  tipo_cobertura: 'monta_natural' | 'inseminacao' | 'transferencia_embriao'
  observacoes?: string
}

// Tipos para ocorrências
export interface Ocorrencia {
  id: string
  animal_id: string
  tipo: 'doenca' | 'tratamento' | 'vacinacao' | 'pesagem' | 'observacao' | 'outro'
  descricao: string
  data_ocorrencia: string
  custo?: number
  veterinario?: string
  medicamento?: string
  dosagem?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface OcorrenciaFormData {
  animal_id: string
  tipo: 'doenca' | 'tratamento' | 'vacinacao' | 'pesagem' | 'observacao' | 'outro'
  descricao: string
  data_ocorrencia: string
  custo?: number
  veterinario?: string
  medicamento?: string
  dosagem?: string
  observacoes?: string
}

// Tipos para localização
export interface Localizacao {
  id: string
  nome: string
  tipo: 'pasto' | 'curral' | 'estabulo' | 'hospital' | 'quarentena'
  capacidade?: number
  area_hectares?: number
  descricao?: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface LocalizacaoFormData {
  nome: string
  tipo: 'pasto' | 'curral' | 'estabulo' | 'hospital' | 'quarentena'
  capacidade?: number
  area_hectares?: number
  descricao?: string
  ativa: boolean
}

// Tipos para relatórios
export interface RelatorioAnimais {
  periodo: {
    inicio: string
    fim: string
  }
  estatisticas: AnimalStats
  nascimentos: number
  mortes: number
  vendas: number
  transferencias: number
  custos_total: number
  receitas_total: number
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Tipos para hooks
export interface UseAnimalsReturn {
  animals: Animal[]
  loading: boolean
  error: string | null
  stats: AnimalStats | null
  fetchAnimals: (filters?: AnimalFilters, pagination?: PaginationParams) => Promise<void>
  createAnimal: (data: AnimalFormData) => Promise<Animal>
  updateAnimal: (id: string, data: Partial<AnimalFormData>) => Promise<Animal>
  deleteAnimal: (id: string) => Promise<void>
  refreshStats: () => Promise<void>
}

export interface UseFormReturn<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  handleChange: (name: string, value: any) => void
  handleBlur: (name: string) => void
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>
  setFieldValue: (name: string, value: any) => void
  setFieldError: (name: string, error: string) => void
  resetForm: () => void
  validateForm: () => boolean
}