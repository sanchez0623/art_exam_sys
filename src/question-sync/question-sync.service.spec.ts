import { QuestionSyncService } from './question-sync.service';
import { QuestionsService } from '../questions/questions.service';

describe('QuestionSyncService', () => {
  const originalSourcesJson = process.env.EXAM_QUESTION_SOURCES_JSON;
  const originalSourcesPath = process.env.EXAM_QUESTION_SOURCES_PATH;

  afterEach(() => {
    if (originalSourcesJson === undefined) {
      delete process.env.EXAM_QUESTION_SOURCES_JSON;
    } else {
      process.env.EXAM_QUESTION_SOURCES_JSON = originalSourcesJson;
    }

    if (originalSourcesPath === undefined) {
      delete process.env.EXAM_QUESTION_SOURCES_PATH;
    } else {
      process.env.EXAM_QUESTION_SOURCES_PATH = originalSourcesPath;
    }

    jest.restoreAllMocks();
  });

  it('falls back to the tracked example config and syncs inline questions', async () => {
    delete process.env.EXAM_QUESTION_SOURCES_JSON;
    delete process.env.EXAM_QUESTION_SOURCES_PATH;

    const getContentHashSet = jest.fn().mockResolvedValue(new Set<string>());
    const bulkUpsert = jest.fn(async (questions: unknown[]) => questions.length);
    const buildContentHash = jest
      .fn()
      .mockImplementation((content: string) => `hash:${content}`);
    const questionsService = {
      getContentHashSet,
      bulkUpsert,
      buildContentHash,
    } as unknown as QuestionsService;
    const service = new QuestionSyncService(questionsService);
    const fetchSpy = jest.spyOn(global, 'fetch');

    const summary = await service.syncLatestQuestions(3);

    expect(summary).toMatchObject({
      requestedCount: 3,
      fetchedCount: 3,
      insertedCount: 3,
      duplicateCount: 0,
      warnings: [],
    });
    expect(summary.sourceSummaries).toEqual([
      expect.objectContaining({
        name: '仓库内置艺术史示例题源',
        fetchedCount: 12,
        acceptedCount: 3,
        duplicateCount: 0,
      }),
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(getContentHashSet).toHaveBeenCalledTimes(1);
    expect(bulkUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          source: '仓库内置题源',
          sourceSite: '仓库内置题源',
        }),
      ]),
    );
  });
});
