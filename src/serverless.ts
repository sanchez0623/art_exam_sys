import type { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from './app.module';

let cachedHandler: Handler | null = null;

async function bootstrapServerless(): Promise<Handler> {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  await app.init();

  const handler = serverless(expressApp, {
    basePath: '/.netlify/functions/api',
  });

  return (event, context) => handler(event, context) as Promise<any>;
}

export async function getServerlessHandler(): Promise<Handler> {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServerless();
  }

  return cachedHandler;
}