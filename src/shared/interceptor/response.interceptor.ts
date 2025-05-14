import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { Routes } from '../constants/routes.const';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (request.url === Routes.HEALTH) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const { statusCode } = response;

        return {
          statusCode,
          path: request.url,
          data,
        };
      }),
    );
  }
}
