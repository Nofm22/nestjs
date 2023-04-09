import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app/app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: ['http://localhost:8080', 'https://stagingsocket.wecontent.vn'],
    credentials: true,
  });

  const PORT = process.env.PORT || 4001;
  await app.listen(PORT, () => {
    Logger.log(`Listening at http://localhost:${PORT}/api/v1`);
  });
}
bootstrap();
