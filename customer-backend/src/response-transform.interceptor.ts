import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface EnvelopeResponse<T> {
  status: { success: boolean; message: string };
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<EnvelopeResponse<unknown>> {
    return next.handle().pipe(
      map((data) => ({
        status: { success: true, message: 'success' },
        data: data ?? null,
      })),
    );
  }
}
