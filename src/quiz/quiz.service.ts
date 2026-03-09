import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArtPeriod } from '../questions/question.entity';
import { QuestionsService } from '../questions/questions.service';
import { SupabaseService } from '../supabase/supabase.service';
import { QuizAnswer } from './quiz-answer.entity';
import { QuizSession, QuizStatus } from './quiz-session.entity';

@Injectable()
export class QuizService {
  private readonly sessionTableName = 'exam_quiz_sessions';

  private readonly answerTableName = 'exam_quiz_answers';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly questionsService: QuestionsService,
  ) {}

  private mapSession(row: Record<string, unknown>): QuizSession {
    return {
      id: Number(row.id),
      status: (row.status as QuizStatus) ?? QuizStatus.IN_PROGRESS,
      totalQuestions: Number(row.total_questions ?? 0),
      answeredCount: Number(row.answered_count ?? 0),
      correctCount: Number(row.correct_count ?? 0),
      questionIds: Array.isArray(row.question_ids)
        ? row.question_ids.map((id) => Number(id))
        : [],
      isScheduled: Boolean(row.is_scheduled),
      createdAt: new Date(String(row.created_at)),
      completedAt: row.completed_at ? new Date(String(row.completed_at)) : null,
    };
  }

  private mapAnswer(row: Record<string, unknown>): QuizAnswer {
    return {
      id: Number(row.id),
      sessionId: Number(row.session_id),
      questionId: Number(row.question_id),
      userAnswer: row.user_answer ? String(row.user_answer) : null,
      isCorrect: Boolean(row.is_correct),
      answeredAt: new Date(String(row.answered_at)),
    };
  }

  /** Start a new quiz session */
  async startSession(options?: {
    count?: number;
    period?: ArtPeriod;
    difficulty?: number;
    isScheduled?: boolean;
  }): Promise<QuizSession> {
    const count = options?.count ?? 10;
    const questions = await this.questionsService.getRandom(count, {
      period: options?.period,
      difficulty: options?.difficulty,
    });
    if (questions.length === 0) {
      throw new BadRequestException('题库中暂无符合条件的题目');
    }
    const { data, error } = await this.supabaseService.client
      .from(this.sessionTableName)
      .insert({
        total_questions: questions.length,
        question_ids: questions.map((q) => q.id),
        is_scheduled: options?.isScheduled ?? false,
        status: QuizStatus.IN_PROGRESS,
      })
      .select('*')
      .single();

    this.supabaseService.throwIfError(error, this.sessionTableName);
    return this.mapSession(data);
  }

  /** Get session with questions (for the frontend) */
  async getSessionWithQuestions(sessionId: number) {
    const { data: sessionRow, error: sessionError } = await this.supabaseService.client
      .from(this.sessionTableName)
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    this.supabaseService.throwIfError(sessionError, this.sessionTableName);
    const session = sessionRow ? this.mapSession(sessionRow) : null;
    if (!session) throw new NotFoundException('考试场次不存在');

    const questionIds = session.questionIds;
    const questions = await Promise.all(
      questionIds.map((id) => this.questionsService.findOne(id)),
    );

    // Get already-answered question ids
    const { data: answerRows, error: answersError } = await this.supabaseService.client
      .from(this.answerTableName)
      .select('question_id, user_answer, is_correct')
      .eq('session_id', sessionId);

    this.supabaseService.throwIfError(answersError, this.answerTableName);
    const answered = (answerRows ?? []).map((row) => ({
      questionId: Number(row.question_id),
      userAnswer: row.user_answer ? String(row.user_answer) : null,
      isCorrect: Boolean(row.is_correct),
    }));
    const answeredMap = new Map(answered.map((a) => [a.questionId, a]));

    return {
      session,
      questions: questions.filter(Boolean).map((q) => {
        const ans = answeredMap.get(q!.id);
        return {
          ...q,
          options: q!.options,
          userAnswer: ans?.userAnswer ?? null,
          isCorrect: ans?.isCorrect ?? null,
          // Only reveal answer/explanation if already answered
          answer: ans ? q!.answer : null,
          explanation: ans ? q!.explanation : null,
        };
      }),
    };
  }

  /** Normalize an answer string: split, trim each part, sort numerically, rejoin */
  private normalizeAnswer(answer: string): string {
    return answer
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .sort((a, b) => Number(a) - Number(b))
      .join(',');
  }

  /** Submit an answer for a question in a session */
  async submitAnswer(
    sessionId: number,
    questionId: number,
    userAnswer: string,
  ): Promise<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  }> {
    const { data: sessionRow, error: sessionError } = await this.supabaseService.client
      .from(this.sessionTableName)
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    this.supabaseService.throwIfError(sessionError, this.sessionTableName);
    const session = sessionRow ? this.mapSession(sessionRow) : null;
    if (!session) throw new NotFoundException('考试场次不存在');
    if (session.status === QuizStatus.COMPLETED) {
      throw new BadRequestException('该场考试已结束');
    }

    const question = await this.questionsService.findOne(questionId);
    if (!question) throw new NotFoundException('题目不存在');

    // Check duplicate answer
    const { data: existing, error: existingError } = await this.supabaseService.client
      .from(this.answerTableName)
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .maybeSingle();

    this.supabaseService.throwIfError(existingError, this.answerTableName);
    if (existing) throw new BadRequestException('该题已作答');

    const isCorrect =
      this.normalizeAnswer(userAnswer) ===
      this.normalizeAnswer(question.answer);

    const { error: insertAnswerError } = await this.supabaseService.client
      .from(this.answerTableName)
      .insert({
        session_id: sessionId,
        question_id: questionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
      });

    this.supabaseService.throwIfError(insertAnswerError, this.answerTableName);

    // Update session counters
    const answeredCount = session.answeredCount + 1;
    const correctCount = session.correctCount + (isCorrect ? 1 : 0);
    const completedAt = answeredCount >= session.totalQuestions ? new Date() : null;

    const { error: updateSessionError } = await this.supabaseService.client
      .from(this.sessionTableName)
      .update({
        answered_count: answeredCount,
        correct_count: correctCount,
        status:
          answeredCount >= session.totalQuestions
            ? QuizStatus.COMPLETED
            : QuizStatus.IN_PROGRESS,
        completed_at: completedAt ? completedAt.toISOString() : null,
      })
      .eq('id', sessionId);

    this.supabaseService.throwIfError(updateSessionError, this.sessionTableName);

    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation,
    };
  }

  /** Complete a session early */
  async completeSession(sessionId: number): Promise<QuizSession> {
    const { data: sessionRow, error: sessionError } = await this.supabaseService.client
      .from(this.sessionTableName)
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    this.supabaseService.throwIfError(sessionError, this.sessionTableName);
    const session = sessionRow ? this.mapSession(sessionRow) : null;
    if (!session) throw new NotFoundException('考试场次不存在');

    const completedAt = new Date();
    const { data, error } = await this.supabaseService.client
      .from(this.sessionTableName)
      .update({
        status: QuizStatus.COMPLETED,
        completed_at: completedAt.toISOString(),
      })
      .eq('id', sessionId)
      .select('*')
      .single();

    this.supabaseService.throwIfError(error, this.sessionTableName);
    return this.mapSession(data);
  }

  /** List sessions with pagination */
  async listSessions(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await this.supabaseService.client
      .from(this.sessionTableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    this.supabaseService.throwIfError(error, this.sessionTableName);
    return {
      sessions: (data ?? []).map((row) => this.mapSession(row)),
      total: count ?? 0,
      page,
      limit,
    };
  }

  /** Get stats summary */
  async getStats() {
    const [{ count: totalSessions, error: totalSessionsError }, { count: completedSessions, error: completedSessionsError }, { data: allAnswers, error: answersError }] = await Promise.all([
      this.supabaseService.client
        .from(this.sessionTableName)
        .select('*', { count: 'exact', head: true }),
      this.supabaseService.client
        .from(this.sessionTableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', QuizStatus.COMPLETED),
      this.supabaseService.client
        .from(this.answerTableName)
        .select('is_correct'),
    ]);

    this.supabaseService.throwIfError(totalSessionsError, this.sessionTableName);
    this.supabaseService.throwIfError(completedSessionsError, this.sessionTableName);
    this.supabaseService.throwIfError(answersError, this.answerTableName);

    const mappedAnswers = (allAnswers ?? []).map((row) => this.mapAnswer({
      id: 0,
      session_id: 0,
      question_id: 0,
      user_answer: null,
      is_correct: row.is_correct,
      answered_at: new Date().toISOString(),
    }));
    const totalAnswered = mappedAnswers.length;
    const totalCorrect = mappedAnswers.filter((a) => a.isCorrect).length;
    const accuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    return {
      totalSessions: totalSessions ?? 0,
      completedSessions: completedSessions ?? 0,
      totalAnswered,
      totalCorrect,
      accuracy,
    };
  }
}
