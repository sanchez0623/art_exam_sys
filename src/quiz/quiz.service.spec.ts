import { BadRequestException } from '@nestjs/common';
import { ArtPeriod, QuestionType } from '../questions/question.entity';
import { QuestionsService } from '../questions/questions.service';
import { SupabaseService } from '../supabase/supabase.service';
import { QuizService } from './quiz.service';
import { QuizStatus } from './quiz-session.entity';

function createQuestion(id: number) {
  return {
    id,
    content: `Question ${id}`,
    imageUrl: null,
    options: ['A', 'B', 'C', 'D'],
    answer: '0',
    explanation: `Explanation ${id}`,
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: null,
    sourceSite: null,
    sourceUrl: null,
    sourcePublishedAt: null,
    contentHash: `hash-${id}`,
    difficulty: 1,
    tags: null,
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-01T00:00:00.000Z'),
  };
}

function createSupabaseService(sessionRow: Record<string, unknown>) {
  const updatePayloads: Array<Record<string, unknown>> = [];
  const sessionTable = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: sessionRow, error: null }),
    update: jest.fn().mockImplementation((payload: Record<string, unknown>) => {
      updatePayloads.push(payload);
      return {
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...sessionRow,
                total_questions: payload.total_questions,
                question_ids: payload.question_ids,
              },
              error: null,
            }),
          }),
        }),
      };
    }),
  };
  const answerTable = {
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockResolvedValue({ data: [], error: null }),
  };

  return {
    updatePayloads,
    service: {
      client: {
        from: jest.fn((tableName: string) =>
          tableName === 'exam_quiz_sessions' ? sessionTable : answerTable,
        ),
      },
      throwIfError: jest.fn((error) => {
        if (error) {
          throw error;
        }
      }),
    } as unknown as SupabaseService,
  };
}

describe('QuizService addMoreQuestions', () => {
  it('appends only unseen questions to the existing session', async () => {
    const sessionRow = {
      id: 99,
      status: QuizStatus.IN_PROGRESS,
      total_questions: 2,
      answered_count: 1,
      correct_count: 1,
      question_ids: [1, 2],
      is_scheduled: false,
      created_at: '2026-03-01T00:00:00.000Z',
      completed_at: null,
    };
    const { service: supabaseService, updatePayloads } =
      createSupabaseService(sessionRow);
    const questionsService = {
      findAll: jest.fn().mockResolvedValue([
        createQuestion(1),
        createQuestion(2),
        createQuestion(3),
        createQuestion(4),
      ]),
    } as unknown as QuestionsService;
    const service = new QuizService(supabaseService, questionsService);

    const result = await service.addMoreQuestions(99, {
      count: 10,
      period: ArtPeriod.MODERN,
    });

    expect(questionsService.findAll).toHaveBeenCalledWith({
      period: ArtPeriod.MODERN,
      difficulty: undefined,
    });
    expect(result.questions.map((question) => question.id).sort((a, b) => a - b)).toEqual([
      3, 4,
    ]);
    expect(result.questions.every((question) => question.answer === null)).toBe(true);
    expect(updatePayloads).toHaveLength(1);
    expect(updatePayloads[0].total_questions).toBe(4);
    expect((updatePayloads[0].question_ids as number[]).slice(0, 2)).toEqual([1, 2]);
    expect([...(updatePayloads[0].question_ids as number[]).slice(2)].sort((a, b) => a - b)).toEqual([
      3, 4,
    ]);
    expect(result.session.totalQuestions).toBe(4);
  });

  it('throws when there are no additional unseen questions to append', async () => {
    const sessionRow = {
      id: 100,
      status: QuizStatus.IN_PROGRESS,
      total_questions: 2,
      answered_count: 0,
      correct_count: 0,
      question_ids: [1, 2],
      is_scheduled: false,
      created_at: '2026-03-01T00:00:00.000Z',
      completed_at: null,
    };
    const { service: supabaseService } = createSupabaseService(sessionRow);
    const questionsService = {
      findAll: jest.fn().mockResolvedValue([createQuestion(1), createQuestion(2)]),
    } as unknown as QuestionsService;
    const service = new QuizService(supabaseService, questionsService);

    await expect(service.addMoreQuestions(100, { count: 10 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
