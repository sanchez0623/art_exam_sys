import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  CreateQuestionDto,
  QuestionsService,
} from '../questions/questions.service';
import { SupabaseService } from '../supabase/supabase.service';
import { QuizStatus } from '../quiz/quiz-session.entity';

type SqliteQuestionRow = {
  id: number;
  content: string;
  imageUrl: string | null;
  options: string;
  answer: string;
  explanation: string;
  type: string;
  period: string;
  source: string | null;
  difficulty: number;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
};

type SqliteSessionRow = {
  id: number;
  status: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  questionIds: string | null;
  isScheduled: number;
  createdAt: string;
  completedAt: string | null;
};

type SqliteAnswerRow = {
  id: number;
  sessionId: number;
  questionId: number;
  userAnswer: string | null;
  isCorrect: number;
  answeredAt: string;
};

@Injectable()
export class LocalDataImportService {
  private readonly logger = new Logger(LocalDataImportService.name);

  private readonly sqlitePath = join(process.cwd(), 'data', 'art_exam.db');

  private readonly questionTableName = 'exam_questions';

  private readonly sessionTableName = 'exam_quiz_sessions';

  private readonly answerTableName = 'exam_quiz_answers';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly questionsService: QuestionsService,
  ) {}

  async importFromSqlite() {
    if (
      process.env.NETLIFY === 'true' ||
      typeof process.env.AWS_LAMBDA_FUNCTION_NAME === 'string'
    ) {
      this.logger.log('ℹ️ Serverless 环境下跳过本地 SQLite 导入');
      return { importedQuestions: 0, importedSessions: 0, importedAnswers: 0 };
    }

    if (!existsSync(this.sqlitePath)) {
      this.logger.log('ℹ️ 未发现本地 SQLite 数据文件，跳过迁移导入');
      return { importedQuestions: 0, importedSessions: 0, importedAnswers: 0 };
    }

    const BetterSqlite3 = eval('require')(
      'better-sqlite3',
    ) as typeof import('better-sqlite3');
    const db = new BetterSqlite3(this.sqlitePath, { readonly: true });

    try {
      const sqliteTables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all() as Array<{ name: string }>;
      const tableNames = new Set(sqliteTables.map((table) => table.name));

      if (!tableNames.has('questions')) {
        return {
          importedQuestions: 0,
          importedSessions: 0,
          importedAnswers: 0,
        };
      }

      const sqliteQuestions = db
        .prepare('SELECT * FROM questions ORDER BY id ASC')
        .all() as SqliteQuestionRow[];
      const existingByContent = await this.questionsService.getContentIdMap();

      let importedQuestions = 0;
      const questionIdMap = new Map<number, number>();

      for (const row of sqliteQuestions) {
        const existingId = existingByContent.get(row.content);
        if (existingId) {
          questionIdMap.set(row.id, existingId);
          continue;
        }

        const dto: CreateQuestionDto = {
          content: row.content,
          imageUrl: row.imageUrl ?? undefined,
          options: JSON.parse(row.options) as string[],
          answer: row.answer,
          explanation: row.explanation,
          type: row.type as CreateQuestionDto['type'],
          period: row.period as CreateQuestionDto['period'],
          source: row.source ?? undefined,
          difficulty: row.difficulty,
          tags: row.tags ?? undefined,
        };

        const created = await this.questionsService.create(dto);
        questionIdMap.set(row.id, created.id);
        importedQuestions += 1;
      }

      let importedSessions = 0;
      let importedAnswers = 0;

      if (tableNames.has('quiz_sessions') && tableNames.has('quiz_answers')) {
        const { count: existingSessionCount, error: existingSessionsError } =
          await this.supabaseService.client
            .from(this.sessionTableName)
            .select('*', { count: 'exact', head: true });
        this.supabaseService.throwIfError(
          existingSessionsError,
          this.sessionTableName,
        );

        if ((existingSessionCount ?? 0) === 0) {
          const sqliteSessions = db
            .prepare('SELECT * FROM quiz_sessions ORDER BY id ASC')
            .all() as SqliteSessionRow[];
          const sqliteAnswers = db
            .prepare('SELECT * FROM quiz_answers ORDER BY id ASC')
            .all() as SqliteAnswerRow[];
          const sessionIdMap = new Map<number, number>();

          for (const row of sqliteSessions) {
            const questionIds = row.questionIds
              ? (JSON.parse(row.questionIds) as number[])
                  .map((questionId) => questionIdMap.get(questionId))
                  .filter(
                    (questionId): questionId is number =>
                      typeof questionId === 'number',
                  )
              : [];

            const { data, error } = await this.supabaseService.client
              .from(this.sessionTableName)
              .insert({
                status: row.status ?? QuizStatus.IN_PROGRESS,
                total_questions: row.totalQuestions,
                answered_count: row.answeredCount,
                correct_count: row.correctCount,
                question_ids: questionIds,
                is_scheduled: Boolean(row.isScheduled),
                created_at: row.createdAt,
                completed_at: row.completedAt,
              })
              .select('id')
              .single();

            this.supabaseService.throwIfError(error, this.sessionTableName);
            if (!data) {
              continue;
            }

            sessionIdMap.set(row.id, Number(data.id));
            importedSessions += 1;
          }

          for (const row of sqliteAnswers) {
            const mappedSessionId = sessionIdMap.get(row.sessionId);
            const mappedQuestionId = questionIdMap.get(row.questionId);

            if (!mappedSessionId || !mappedQuestionId) {
              continue;
            }

            const { error } = await this.supabaseService.client
              .from(this.answerTableName)
              .insert({
                session_id: mappedSessionId,
                question_id: mappedQuestionId,
                user_answer: row.userAnswer,
                is_correct: Boolean(row.isCorrect),
                answered_at: row.answeredAt,
              });

            this.supabaseService.throwIfError(error, this.answerTableName);
            importedAnswers += 1;
          }
        }
      }

      return { importedQuestions, importedSessions, importedAnswers };
    } finally {
      db.close();
    }
  }
}
