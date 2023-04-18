import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: ['http://localhost:8080', 'https://stagingsocket.wecontent.vn'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // app.useGlobalInterceptors(new TransformInterceptor());
  const PORT = process.env.NODE_ENV === 'development' ? 8001 : 8002;
  await app.listen(PORT, () => {
    Logger.log(`🚀 Listening at http://localhost:${PORT}/v1`);
  });
}
bootstrap();
