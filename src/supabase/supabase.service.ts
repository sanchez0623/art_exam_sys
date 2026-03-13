import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createClient,
  type PostgrestError,
  type SupabaseClient,
} from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new InternalServerErrorException(
        '缺少 Supabase 配置，请检查 .env.local 中的 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY。',
      );
    }

    this.client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  throwIfError(
    error: PostgrestError | Error | null | undefined,
    tableName?: string,
  ): void {
    if (!error) {
      return;
    }

    const message = error.message.toLowerCase();
    if (message.includes('fetch failed')) {
      throw new InternalServerErrorException(
        `Supabase 请求失败，请检查网络、项目 URL，或避免一次性发送过长查询。当前表：${tableName ?? 'unknown'}`,
      );
    }

    if (
      message.includes('could not find the table') ||
      (message.includes('relation') && message.includes('does not exist'))
    ) {
      throw new InternalServerErrorException(
        `Supabase 表 ${tableName ?? ''} 尚未创建，请先执行迁移文件 art-history/supabase/migrations/20260309190000_exam_system_schema.sql。`.trim(),
      );
    }

    throw new InternalServerErrorException(error.message);
  }
}
