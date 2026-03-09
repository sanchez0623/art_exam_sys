import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Question } from './questions/question.entity';
import { QuestionsModule } from './questions/questions.module';
import { QuizAnswer } from './quiz/quiz-answer.entity';
import { QuizSession } from './quiz/quiz-session.entity';
import { QuizModule } from './quiz/quiz.module';
import { AppSchedulerModule } from './scheduler/scheduler.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(process.cwd(), 'data', 'art_exam.db'),
      entities: [Question, QuizSession, QuizAnswer],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/(.*)'],
    }),
    QuestionsModule,
    QuizModule,
    AppSchedulerModule,
    SeedModule,
  ],
})
export class AppModule {}
