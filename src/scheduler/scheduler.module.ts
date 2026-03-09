import { Module } from '@nestjs/common';
import { QuizModule } from '../quiz/quiz.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [QuizModule],
  providers: [SchedulerService],
})
export class AppSchedulerModule {}
