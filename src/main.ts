import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/exception/http-exception.filter';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = { key: '', cert: '' };
  if (process.env.NODE_DEV === 'true') {
    httpsOptions.key = fs.readFileSync('C:\\Testing\\localhost+1-key.pem').toString();
    httpsOptions.cert = fs.readFileSync('C:\\Testing\\localhost+1.pem').toString();
  }
  const optsObj = process.env.NODE_DEV === 'true' ? { httpsOptions } : {};
  const app = await NestFactory.create(AppModule, optsObj);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
