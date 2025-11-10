/**
 * Sistema de Logging Centralizado
 * Proporciona niveles de log estructurados para toda la aplicación
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Rojo
  WARN: '\x1b[33m',  // Amarillo
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m'  // Gris
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
  }

  /**
   * Formatea el mensaje de log con timestamp y color
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level] || '';
    let formattedMessage = `${color}[${timestamp}] [${level}]${RESET_COLOR} ${message}`;
    
    if (data) {
      formattedMessage += `\n${color}Data:${RESET_COLOR} ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  /**
   * Verifica si el nivel de log actual permite registrar este mensaje
   */
  shouldLog(level) {
    const levels = Object.keys(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Log de error - para errores críticos
   */
  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message, data));
    }
  }

  /**
   * Log de warning - para situaciones que requieren atención
   */
  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  /**
   * Log de información - para eventos importantes de la aplicación
   */
  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  /**
   * Log de debug - para información de depuración detallada
   */
  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }
}

// Exportar instancia única del logger
export const logger = new Logger();
export default logger;


