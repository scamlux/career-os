import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger;

  constructor(private readonly serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest();

    if (request?.method && request?.url) {
      this.logger.log(`REQ ${request.method} ${request.url}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - started;
          if (request?.method && request?.url) {
            this.logger.log(`RES ${request.method} ${request.url} ${elapsed}ms`);
          }
        },
        error: (error: unknown) => {
          const elapsed = Date.now() - started;
          const message = error instanceof Error ? error.message : 'unknown error';
          this.logger.error(`ERR ${elapsed}ms ${message}`);
        }
      })
    );
  }
}
