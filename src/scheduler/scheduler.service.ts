import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuestionSyncService } from '../question-sync/question-sync.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly questionSyncService: QuestionSyncService) {}

  /**
   * Automatically fetch the latest 10 questions from configured sources every day at 08:00.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async syncDailyQuestions() {
    this.logger.log('⏰ 定时任务：开始同步外部题源最新题目...');
    try {
      const summary = await this.questionSyncService.syncLatestQuestions(10);
      this.logger.log(
        `✅ 每日题目同步完成：新增 ${summary.insertedCount} 道，去重 ${summary.duplicateCount} 道。`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ 每日题目同步失败: ${message}`);
    }
  }
}
