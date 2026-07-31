import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

let cachedApp: NestExpressApplication | undefined;

async function bootstrapServer(): Promise<NestExpressApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  configureApp(app);
  await app.init();

  cachedApp = app;
  return app;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrapServer();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}
