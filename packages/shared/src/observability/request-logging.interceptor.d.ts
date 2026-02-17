import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class RequestLoggingInterceptor implements NestInterceptor {
    private readonly serviceName;
    private readonly logger;
    constructor(serviceName: string);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
