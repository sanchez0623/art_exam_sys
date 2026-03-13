import { Body, Controller, Post } from '@nestjs/common';
import { QuestionSyncService } from './question-sync.service';

@Controller('api/questions')
export class QuestionSyncController {
  constructor(private readonly questionSyncService: QuestionSyncService) {}

  @Post('sync')
  async sync(@Body() body?: { count?: number }) {
    return this.questionSyncService.syncLatestQuestions(
      this.resolveRequestedCount(body?.count),
    );
  }

  private resolveRequestedCount(count?: number): number {
    if (typeof count !== 'number' || !Number.isFinite(count)) {
      return 10;
    }

    return Math.max(1, Math.min(50, Math.floor(count)));
  }
}
