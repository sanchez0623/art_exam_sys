import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { QuestionSyncModule } from './question-sync/question-sync.module';
import { QuestionsModule } from './questions/questions.module';
import { QuizModule } from './quiz/quiz.module';
import { AppSchedulerModule } from './scheduler/scheduler.module';
import { SeedModule } from './seed/seed.module';
import { SupabaseModule } from './supabase/supabase.module';

const isServerlessRuntime =
  process.env.NETLIFY === 'true' ||
  process.env.NETLIFY_LOCAL === 'true' ||
  typeof process.env.AWS_LAMBDA_FUNCTION_NAME === 'string';

@Module({
  imports: [
    SupabaseModule,
    ...(!isServerlessRuntime ? [ScheduleModule.forRoot()] : []),
    ...(!isServerlessRuntime
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            serveRoot: '/',
            exclude: ['/api/(.*)'],
          }),
        ]
      : []),
    QuestionsModule,
    QuestionSyncModule,
    QuizModule,
    ...(!isServerlessRuntime ? [AppSchedulerModule] : []),
    SeedModule,
  ],
})
export class AppModule {}
