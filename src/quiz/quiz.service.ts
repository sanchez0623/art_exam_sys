import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtPeriod } from '../questions/question.entity';
import { QuestionsService } from '../questions/questions.service';
import { QuizAnswer } from './quiz-answer.entity';
import { QuizSession, QuizStatus } from './quiz-session.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizSession)
    private readonly sessionRepo: Repository<QuizSession>,
    @InjectRepository(QuizAnswer)
    private readonly answerRepo: Repository<QuizAnswer>,
    private readonly questionsService: QuestionsService,
  ) {}

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
    const session = this.sessionRepo.create({
      totalQuestions: questions.length,
      questionIds: JSON.stringify(questions.map((q) => q.id)),
      isScheduled: options?.isScheduled ?? false,
      status: QuizStatus.IN_PROGRESS,
    });
    return this.sessionRepo.save(session);
  }

  /** Get session with questions (for the frontend) */
  async getSessionWithQuestions(sessionId: number) {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException('考试场次不存在');

    const questionIds = JSON.parse(session.questionIds) as number[];
    const questions = await Promise.all(
      questionIds.map((id) => this.questionsService.findOne(id)),
    );

    // Get already-answered question ids
    const answered = await this.answerRepo.find({
      where: { sessionId },
      select: ['questionId', 'userAnswer', 'isCorrect'],
    });
    const answeredMap = new Map(answered.map((a) => [a.questionId, a]));

    return {
      session,
      questions: questions.filter(Boolean).map((q) => {
        const ans = answeredMap.get(q!.id);
        return {
          ...q,
          options: JSON.parse(q!.options) as string[],
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
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException('考试场次不存在');
    if (session.status === QuizStatus.COMPLETED) {
      throw new BadRequestException('该场考试已结束');
    }

    const question = await this.questionsService.findOne(questionId);
    if (!question) throw new NotFoundException('题目不存在');

    // Check duplicate answer
    const existing = await this.answerRepo.findOneBy({
      sessionId,
      questionId,
    });
    if (existing) throw new BadRequestException('该题已作答');

    const isCorrect =
      this.normalizeAnswer(userAnswer) ===
      this.normalizeAnswer(question.answer);

    const answerRecord = this.answerRepo.create({
      sessionId,
      questionId,
      userAnswer,
      isCorrect,
    });
    await this.answerRepo.save(answerRecord);

    // Update session counters
    session.answeredCount += 1;
    if (isCorrect) session.correctCount += 1;
    if (session.answeredCount >= session.totalQuestions) {
      session.status = QuizStatus.COMPLETED;
      session.completedAt = new Date();
    }
    await this.sessionRepo.save(session);

    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation,
    };
  }

  /** Complete a session early */
  async completeSession(sessionId: number): Promise<QuizSession> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException('考试场次不存在');
    session.status = QuizStatus.COMPLETED;
    session.completedAt = new Date();
    return this.sessionRepo.save(session);
  }

  /** List sessions with pagination */
  async listSessions(page = 1, limit = 10) {
    const [sessions, total] = await this.sessionRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { sessions, total, page, limit };
  }

  /** Get stats summary */
  async getStats() {
    const totalSessions = await this.sessionRepo.count();
    const completedSessions = await this.sessionRepo.count({
      where: { status: QuizStatus.COMPLETED },
    });
    const allAnswers = await this.answerRepo.find();
    const totalAnswered = allAnswers.length;
    const totalCorrect = allAnswers.filter((a) => a.isCorrect).length;
    const accuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    return {
      totalSessions,
      completedSessions,
      totalAnswered,
      totalCorrect,
      accuracy,
    };
  }
}
