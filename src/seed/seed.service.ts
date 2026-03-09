import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';
import { LocalDataImportService } from './local-data-import.service';
import { SEED_QUESTIONS } from './questions.seed';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly questionsService: QuestionsService,
    private readonly localDataImportService: LocalDataImportService,
  ) {}

  async onApplicationBootstrap() {
    const importSummary = await this.localDataImportService.importFromSqlite();
    if (importSummary.importedQuestions > 0) {
      this.logger.log(
        `📥 已从本地 SQLite 导入 ${importSummary.importedQuestions} 道题目、${importSummary.importedSessions} 场考试、${importSummary.importedAnswers} 条答题记录到 Supabase`,
      );
    }

    const count = await this.questionsService.count();
    if (count === 0) {
      this.logger.log('🌱 数据库为空，正在导入初始题库...');
      const added = await this.questionsService.bulkUpsert(SEED_QUESTIONS);
      this.logger.log(`✅ 成功导入 ${added} 道题目`);
    } else {
      this.logger.log(`📚 题库已有 ${count} 道题目，跳过初始种子数据`);
    }
  }
}
