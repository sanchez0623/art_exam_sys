import { QuestionSyncController } from './question-sync.controller';
import { QuestionSyncService } from './question-sync.service';

describe('QuestionSyncController', () => {
  it('uses 10 as the default manual sync size', async () => {
    const summary = {
      requestedCount: 10,
      fetchedCount: 10,
      insertedCount: 8,
      duplicateCount: 2,
      sourceSummaries: [],
      warnings: [],
    };
    const syncLatestQuestions = jest.fn().mockResolvedValue(summary);
    const questionSyncService = {
      syncLatestQuestions,
    } as unknown as QuestionSyncService;
    const controller = new QuestionSyncController(questionSyncService);

    await expect(controller.sync()).resolves.toEqual(summary);
    expect(syncLatestQuestions).toHaveBeenCalledWith(10);
  });

  it('allows callers to request a custom sync count', async () => {
    const summary = {
      requestedCount: 5,
      fetchedCount: 5,
      insertedCount: 4,
      duplicateCount: 1,
      sourceSummaries: [],
      warnings: [],
    };
    const syncLatestQuestions = jest.fn().mockResolvedValue(summary);
    const questionSyncService = {
      syncLatestQuestions,
    } as unknown as QuestionSyncService;
    const controller = new QuestionSyncController(questionSyncService);

    await expect(controller.sync({ count: 5 })).resolves.toEqual(summary);
    expect(syncLatestQuestions).toHaveBeenCalledWith(5);
  });
});
