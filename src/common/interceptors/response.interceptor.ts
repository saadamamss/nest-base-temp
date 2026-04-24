import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) =>
        Object.prototype.hasOwnProperty.call(data, 'data')
          ? {
              success: true,
              ...(data as Record<string, unknown>),
              timestamp: new Date().toISOString(),
            }
          : {
              success: true,
              data: data,
              timestamp: new Date().toISOString(),
            },
      ),
    );
  }
}
