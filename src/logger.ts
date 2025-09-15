/**
 * Logger Configuration
 * MBSS v3.0 Compliant Logging
 */

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix: string = '[XRP-MCP]') {
    this.prefix = prefix;
    this.level = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `${timestamp} ${this.prefix} [${level}] ${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        try {
          return `${baseMessage} ${JSON.stringify(data, this.replacer, 2)}`;
        } catch {
          return `${baseMessage} [Circular Reference]`;
        }
      }
      return `${baseMessage} ${data}`;
    }
    
    return baseMessage;
  }

  private replacer(key: string, value: any): any {
    // Handle BigInt serialization
    if (typeof value === 'bigint') {
      return value.toString();
    }
    // Handle circular references
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }
    return value;
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (this.level >= level) {
      const formattedMessage = this.formatMessage(levelName, message, data);
      
      // Use console.error for stderr output (MCP compliant)
      // This ensures logs don't interfere with stdio protocol
      console.error(formattedMessage);
    }
  }

  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, error);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  // Tool execution logging
  toolStart(toolName: string, args?: any): void {
    this.info(`Tool started: ${toolName}`, args);
  }

  toolSuccess(toolName: string, duration?: number): void {
    this.info(`Tool completed: ${toolName}`, { duration: `${duration}ms` });
  }

  toolError(toolName: string, error: any): void {
    this.error(`Tool failed: ${toolName}`, error);
  }

  // Network logging
  networkRequest(method: string, params?: any): void {
    this.debug(`Network request: ${method}`, params);
  }

  networkResponse(method: string, duration: number): void {
    this.debug(`Network response: ${method}`, { duration: `${duration}ms` });
  }

  networkError(method: string, error: any): void {
    this.error(`Network error: ${method}`, error);
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;

// Export class for testing
export { Logger };
