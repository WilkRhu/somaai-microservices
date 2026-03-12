import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const startTime = Date.now();

    this.logger.log(`[${method}] ${url} - Request started`);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logger.log(`[${method}] ${url} - Response: ${duration}ms`);
        return data;
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[${method}] ${url} - Error: ${error.message} (${duration}ms)`,
          error.stack,
        );
        throw error;
      }),
    );
  }
}
