import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { QuizModule } from '../quiz/quiz.module';
import { LocalDataImportService } from './local-data-import.service';
import { SeedService } from './seed.service';

@Module({
  imports: [QuestionsModule, QuizModule],
  providers: [SeedService, LocalDataImportService],
})
export class SeedModule {}
