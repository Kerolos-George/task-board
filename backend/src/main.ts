import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API:     http://localhost:${port}/api`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}
void bootstrap();
