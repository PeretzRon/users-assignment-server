import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
