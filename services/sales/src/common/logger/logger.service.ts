import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private logger = new Logger();

  log(context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `[${timestamp}] [${context}] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`,
    );
  }

  error(context: string, message: string, trace?: string, data?: any) {
    const timestamp = new Date().toISOString();
    this.logger.error(
      `[${timestamp}] [${context}] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`,
      trace,
    );
  }

  warn(context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    this.logger.warn(
      `[${timestamp}] [${context}] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`,
    );
  }

  debug(context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    this.logger.debug(
      `[${timestamp}] [${context}] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`,
    );
  }
}
