/**
 * Sistema unificado de tratamento de erros
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL',
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Manter o stack trace correto
    Error.captureStackTrace(this, this.constructor);
    
    // Definir nome da classe
    this.name = this.constructor.name;
  }
}

// ============ ERROS ESPECÍFICOS ============

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorType.VALIDATION, 400, true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorType.DATABASE, 500, true, details);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorType.NETWORK, 503, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado', details?: any) {
    super(message, ErrorType.NOT_FOUND, 404, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito detectado', details?: any) {
    super(message, ErrorType.CONFLICT, 409, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticação necessária', details?: any) {
    super(message, ErrorType.AUTHENTICATION, 401, true, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Sem permissão', details?: any) {
    super(message, ErrorType.AUTHORIZATION, 403, true, details);
  }
}

// ============ HANDLERS ============

/**
 * Converter erro desconhecido em AppError
 */
export function normalizeError(error: unknown): AppError {
  // Já é AppError
  if (error instanceof AppError) {
    return error;
  }

  // Erro padrão do JavaScript
  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorType.UNKNOWN,
      500,
      false,
      { originalError: error }
    );
  }

  // Outro tipo de erro
  return new AppError(
    'Erro desconhecido',
    ErrorType.UNKNOWN,
    500,
    false,
    { originalError: error }
  );
}

/**
 * Handler para erros de API
 */
export function handleAPIError(error: unknown): {
  success: false;
  error: string;
  type: ErrorType;
  statusCode: number;
  details?: any;
} {
  const normalizedError = normalizeError(error);

  // Log do erro (em produção, usar sistema de logging apropriado)
  if (!normalizedError.isOperational) {
    console.error('Erro não operacional:', {
      message: normalizedError.message,
      type: normalizedError.type,
      stack: normalizedError.stack,
      details: normalizedError.details,
    });
  }

  return {
    success: false,
    error: normalizedError.message,
    type: normalizedError.type,
    statusCode: normalizedError.statusCode,
    details: normalizedError.details,
  };
}

/**
 * Handler para erros de PostgreSQL
 */
export function handleDatabaseError(error: any): AppError {
  // Erros comuns do PostgreSQL
  const pgErrors: Record<string, { message: string; type: ErrorType }> = {
    '23505': {
      message: 'Registro duplicado',
      type: ErrorType.CONFLICT,
    },
    '23503': {
      message: 'Violação de chave estrangeira',
      type: ErrorType.VALIDATION,
    },
    '23502': {
      message: 'Campo obrigatório não fornecido',
      type: ErrorType.VALIDATION,
    },
    '23514': {
      message: 'Violação de restrição de verificação',
      type: ErrorType.VALIDATION,
    },
    '42P01': {
      message: 'Tabela não encontrada',
      type: ErrorType.DATABASE,
    },
    '42703': {
      message: 'Coluna não encontrada',
      type: ErrorType.DATABASE,
    },
    '28P01': {
      message: 'Falha na autenticação',
      type: ErrorType.AUTHENTICATION,
    },
    '53300': {
      message: 'Muitas conexões',
      type: ErrorType.DATABASE,
    },
  };

  const pgError = pgErrors[error.code];
  
  if (pgError) {
    return new AppError(
      pgError.message,
      pgError.type,
      pgError.type === ErrorType.CONFLICT ? 409 : 500,
      true,
      {
        code: error.code,
        detail: error.detail,
        table: error.table,
        constraint: error.constraint,
      }
    );
  }

  // Erro genérico do banco
  return new DatabaseError(
    'Erro ao acessar banco de dados',
    {
      code: error.code,
      message: error.message,
    }
  );
}

/**
 * Função para retry de operações com backoff exponencial
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Wrapper para try-catch assíncrono
 */
export async function asyncTryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    
    if (errorHandler) {
      errorHandler(normalizedError);
    }
    
    return [null, normalizedError];
  }
}

/**
 * Criar mensagem de erro amigável para o usuário
 */
export function getUserFriendlyMessage(error: AppError): string {
  const friendlyMessages: Record<ErrorType, string> = {
    [ErrorType.VALIDATION]: 'Alguns dados fornecidos são inválidos. Por favor, verifique e tente novamente.',
    [ErrorType.DATABASE]: 'Erro ao acessar o banco de dados. Por favor, tente novamente.',
    [ErrorType.NETWORK]: 'Erro de conexão. Verifique sua internet e tente novamente.',
    [ErrorType.AUTHENTICATION]: 'Autenticação necessária. Por favor, faça login.',
    [ErrorType.AUTHORIZATION]: 'Você não tem permissão para realizar esta ação.',
    [ErrorType.NOT_FOUND]: 'O item solicitado não foi encontrado.',
    [ErrorType.CONFLICT]: 'Já existe um registro com estes dados.',
    [ErrorType.INTERNAL]: 'Erro interno do sistema. Por favor, tente novamente mais tarde.',
    [ErrorType.UNKNOWN]: 'Erro desconhecido. Por favor, tente novamente.',
  };

  // Retornar mensagem específica do erro ou mensagem genérica
  return error.message || friendlyMessages[error.type] || friendlyMessages[ErrorType.UNKNOWN];
}

