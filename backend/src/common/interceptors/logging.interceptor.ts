import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { method, originalUrl } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - startedAt;
          this.logger.log(`${method} ${originalUrl} ${response.statusCode} +${ms}ms`);
        },
        error: (err: { status?: number; message?: string }) => {
          const ms = Date.now() - startedAt;
          const status = err?.status ?? 500;
          this.logger.warn(
            `${method} ${originalUrl} ${status} +${ms}ms${err?.message ? ` — ${err.message}` : ''}`,
          );
        },
      }),
    );
  }
}
