import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsModule } from '../questions/questions.module';
import { QuizAnswer } from './quiz-answer.entity';
import { QuizController } from './quiz.controller';
import { QuizSession } from './quiz-session.entity';
import { QuizService } from './quiz.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizSession, QuizAnswer]),
    QuestionsModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
