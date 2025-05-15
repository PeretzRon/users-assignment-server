import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptor/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port')!;
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: 'health',
        method: RequestMethod.GET,
      },
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(port);
}

bootstrap();
