import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { QuestionSyncController } from './question-sync.controller';
import { QuestionSyncService } from './question-sync.service';

@Module({
  imports: [QuestionsModule],
  controllers: [QuestionSyncController],
  providers: [QuestionSyncService],
  exports: [QuestionSyncService],
})
export class QuestionSyncModule {}
