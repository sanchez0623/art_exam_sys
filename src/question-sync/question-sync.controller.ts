import { Body, Controller, Post } from '@nestjs/common';
import { QuestionSyncService } from './question-sync.service';

@Controller('api/questions')
export class QuestionSyncController {
  constructor(private readonly questionSyncService: QuestionSyncService) {}

  @Post('sync')
  async sync(@Body() body?: { count?: number }) {
    return this.questionSyncService.syncLatestQuestions(body?.count ?? 10);
  }
}
