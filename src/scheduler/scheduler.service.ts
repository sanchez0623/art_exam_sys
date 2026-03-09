import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuizService } from '../quiz/quiz.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly quizService: QuizService) {}

  /**
   * Automatically create a daily quiz session at 08:00 every morning.
   * The scheduled session picks 10 random questions.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async createDailyQuiz() {
    this.logger.log('⏰ 定时任务：创建每日自动出题...');
    try {
      const session = await this.quizService.startSession({
        count: 10,
        isScheduled: true,
      });
      this.logger.log(`✅ 每日练习已创建，场次 ID: ${session.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ 每日练习创建失败: ${message}`);
    }
  }
}
