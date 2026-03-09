import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Ensure the SQLite data directory exists
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🎨 艺术史自测系统已启动！`);
  console.log(`📖 访问地址: http://localhost:${port}\n`);
}
bootstrap().catch(console.error);
