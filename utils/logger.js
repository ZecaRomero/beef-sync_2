/**
 * Sistema de logging estruturado
 * Substitui console.log/error diretos com logging configurável
 * Compatível com CommonJS e ES6 modules
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

class Logger {
  constructor() {
    this.level = process.env.NODE_ENV === 'production' 
      ? LOG_LEVELS.WARN 
      : LOG_LEVELS.DEBUG;
    this.enabled = true;
  }

  setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      this.level = LOG_LEVELS[level];
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  _log(level, levelName, color, ...args) {
    if (!this.enabled || level < this.level) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${levelName}]`;

    if (typeof window !== 'undefined') {
      console.log(`%c${prefix}`, `color: ${color}; font-weight: bold`, ...args);
    } else {
      console.log(prefix, ...args);
    }
  }

  debug(...args) {
    this._log(LOG_LEVELS.DEBUG, 'DEBUG', '#6b7280', ...args);
  }

  info(...args) {
    this._log(LOG_LEVELS.INFO, 'INFO', '#3b82f6', ...args);
  }

  warn(...args) {
    this._log(LOG_LEVELS.WARN, 'WARN', '#f59e0b', ...args);
  }

  error(...args) {
    this._log(LOG_LEVELS.ERROR, 'ERROR', '#ef4444', ...args);
  }

  // Métodos específicos do domínio
  api(method, url, ...args) {
    this.debug(`[API] ${method} ${url}`, ...args);
  }

  db(operation, table, ...args) {
    this.debug(`[DB] ${operation} ${table}`, ...args);
  }

  component(name, action, ...args) {
    this.debug(`[${name}] ${action}`, ...args);
  }
}

// Criar instância única
const logger = new Logger();

// ES6 exports
export { logger, Logger, LOG_LEVELS };
export default logger;
