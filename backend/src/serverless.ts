import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express, Request, Response } from 'express';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

// Use require for express to ensure CommonJS compatibility
const express = require('express');

let cachedServer: Express | undefined;

async function bootstrapServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter, {
    bufferLogs: true,
  });

  configureApp(app);
  await app.init();

  cachedServer = expressApp;
  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  const server = await bootstrapServer();
  return server(req, res);
}
