import { Module } from '@nestjs/common';
import { QuestionSyncModule } from '../question-sync/question-sync.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [QuestionSyncModule],
  providers: [SchedulerService],
})
export class AppSchedulerModule {}
