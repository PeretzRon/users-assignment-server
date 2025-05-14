import { Request, Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      status >= 400 && status < 500
        ? exception instanceof HttpException
          ? exception.getResponse()
          : 'Client error'
        : 'Internal server error';

    this.logger.error(
      `Error occurred: ${JSON.stringify({
        status,
        path: request.url,
        error: exception instanceof Error ? exception.stack : exception,
      })}`,
    );

    response.status(status).json({
      statusCode: status,
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message,
    });
  }
}
