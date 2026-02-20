/**
 * Handler centralizado de erros para APIs
 * Padroniza o tratamento de erros em toda a aplicação
 */

import { sendError, HTTP_STATUS } from './apiResponse'
import { logger } from './logger'

/**
 * Tipos de erro conhecidos
 */
export const ERROR_TYPES = {
  VALIDATION: 'ValidationError',
  CAST: 'CastError',
  DUPLICATE_KEY: 'DuplicateKeyError',
  NOT_FOUND: 'NotFoundError',
  UNAUTHORIZED: 'UnauthorizedError',
  FORBIDDEN: 'ForbiddenError',
  RATE_LIMIT: 'RateLimitError',
  DATABASE: 'DatabaseError',
  EXTERNAL_API: 'ExternalAPIError',
  FILE_UPLOAD: 'FileUploadError',
  BUSINESS_LOGIC: 'BusinessLogicError'
}

/**
 * Classe base para erros customizados
 */
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, type = 'AppError', details = null) {
    super(message)
    this.name = type
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
    this.timestamp = new Date().toISOString()
    
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Erros específicos
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_TYPES.VALIDATION, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado`, HTTP_STATUS.NOT_FOUND, ERROR_TYPES.NOT_FOUND)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_TYPES.FORBIDDEN)
  }
}

export class DuplicateKeyError extends AppError {
  constructor(field, value) {
    super(`${field} '${value}' já existe`, HTTP_STATUS.CONFLICT, ERROR_TYPES.DUPLICATE_KEY, { field, value })
  }
}

export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_TYPES.DATABASE, originalError)
  }
}

export class BusinessLogicError extends AppError {
  constructor(message, statusCode = HTTP_STATUS.BAD_REQUEST) {
    super(message, statusCode, ERROR_TYPES.BUSINESS_LOGIC)
  }
}

/**
 * Mapeia erros do PostgreSQL para erros da aplicação
 */
export const mapPostgresError = (error) => {
  // Violação de chave única
  if (error.code === '23505') {
    const match = error.detail?.match(/Key \((.+)\)=\((.+)\) already exists/)
    if (match) {
      return new DuplicateKeyError(match[1], match[2])
    }
    return new DuplicateKeyError('Campo', 'valor')
  }
  
  // Violação de chave estrangeira
  if (error.code === '23503') {
    return new ValidationError('Referência inválida - registro relacionado não encontrado')
  }
  
  // Violação de not null
  if (error.code === '23502') {
    const field = error.column || 'campo obrigatório'
    return new ValidationError(`${field} é obrigatório`)
  }
  
  // Erro de tipo de dados
  if (error.code === '22P02') {
    return new ValidationError('Formato de dados inválido')
  }
  
  // Erro de conexão
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new DatabaseError('Erro de conexão com o banco de dados')
  }
  
  return new DatabaseError(error.message, error)
}

/**
 * Handler principal de erros
 */
export const apiErrorHandler = (error, req, res, next) => {
  let appError = error
  
  // Se não é um erro da aplicação, mapear para um
  if (!(error instanceof AppError)) {
    // Erros do PostgreSQL
    if (error.code && typeof error.code === 'string') {
      appError = mapPostgresError(error)
    }
    // Erros de validação do Mongoose (se usado)
    else if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }))
      appError = new ValidationError('Dados inválidos', details)
    }
    // Erros de cast do Mongoose
    else if (error.name === 'CastError') {
      appError = new ValidationError(`ID inválido: ${error.value}`)
    }
    // Erro genérico
    else {
      appError = new AppError(
        error.message || 'Erro interno do servidor',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'UnknownError'
      )
    }
  }
  
  // Log do erro
  logger.error('Erro na API:', {
    message: appError.message,
    type: appError.name,
    statusCode: appError.statusCode,
    details: appError.details,
    stack: appError.stack,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    timestamp: appError.timestamp
  })
  
  // Se a resposta já foi enviada, não fazer nada
  if (res.headersSent) {
    return next(appError)
  }
  
  // Enviar resposta de erro padronizada
  return sendError(
    res,
    appError.message,
    appError.statusCode,
    appError.details,
    process.env.NODE_ENV === 'development' ? {
      stack: appError.stack,
      type: appError.name
    } : null
  )
}

/**
 * Handler para rotas não encontradas
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Rota ${req.originalUrl}`)
  next(error)
}

/**
 * Wrapper para capturar erros assíncronos
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validador de esquemas
 */
export const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false })
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))
      
      return next(new ValidationError('Dados inválidos', details))
    }
    
    req[property] = value
    next()
  }
}

/**
 * Utilitários para lançar erros
 */
export const throwIf = (condition, error) => {
  if (condition) {
    throw error
  }
}

export const throwIfNotFound = (data, resource = 'Recurso') => {
  if (!data) {
    throw new NotFoundError(resource)
  }
  return data
}

export const throwIfExists = (data, resource = 'Recurso') => {
  if (data) {
    throw new DuplicateKeyError(resource, 'valor')
  }
}

export default {
  ERROR_TYPES,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DuplicateKeyError,
  DatabaseError,
  BusinessLogicError,
  apiErrorHandler,
  notFoundHandler,
  catchAsync,
  validateSchema,
  throwIf,
  throwIfNotFound,
  throwIfExists,
  mapPostgresError
}