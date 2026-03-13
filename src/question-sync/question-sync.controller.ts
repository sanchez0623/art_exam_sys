import { Controller, Post } from '@nestjs/common';
import { QuestionSyncService } from './question-sync.service';

@Controller('api/questions')
export class QuestionSyncController {
  constructor(private readonly questionSyncService: QuestionSyncService) {}

  @Post('sync')
  async sync() {
    return this.questionSyncService.syncLatestQuestions(10);
  }
}
