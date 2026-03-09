import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

function isAddressInUseError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EADDRINUSE';
}

async function bootstrap() {
  // Ensure the SQLite data directory exists
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });

  const app = await NestFactory.create(AppModule);
  const preferredPort = Number(process.env.PORT ?? 3000);
  let port = preferredPort;

  try {
    await app.listen(port);
  } catch (error) {
    if (!process.env.PORT && isAddressInUseError(error)) {
      port = preferredPort + 1;
      console.warn(`⚠️ 端口 ${preferredPort} 已被占用，自动切换到 ${port}`);
      await app.listen(port);
    } else {
      throw error;
    }
  }

  console.log(`\n🎨 艺术史自测系统已启动！`);
  console.log(`📖 访问地址: http://localhost:${port}\n`);
}
bootstrap().catch(console.error);
