import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const cause = exception.getResponse();

    const raw =
      typeof cause === 'object' && cause !== null
        ? (cause as { message?: string; hint?: string })
        : { message: String(cause) };
    const message = raw.message ?? 'Request failed';

    if (status === HttpStatus.UNAUTHORIZED && !raw.hint) {
      raw.hint =
        'Get a JWT from POST /api/auth/token with X-API-Key, then send Authorization: Bearer <token>. If you already do: ensure JWT_SECRET in customer-backend/.env exactly matches admin-backend/.env and restart.';
    }

    this.logger.warn(`${req.method} ${req.url} ${status}`, raw);
    const body = {
      status: { success: false, message },
      data: null,
      ...(raw.hint && { hint: raw.hint }),
    };
    res.status(status).json(body);
  }
}
