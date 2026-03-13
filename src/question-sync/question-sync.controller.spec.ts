import { QuestionSyncController } from './question-sync.controller';
import { QuestionSyncService } from './question-sync.service';

describe('QuestionSyncController', () => {
  it('always syncs exactly 10 questions for manual sync', async () => {
    const summary = {
      requestedCount: 10,
      fetchedCount: 10,
      insertedCount: 8,
      duplicateCount: 2,
      sourceSummaries: [],
      warnings: [],
    };
    const questionSyncService = {
      syncLatestQuestions: jest.fn().mockResolvedValue(summary),
    } as unknown as QuestionSyncService;
    const controller = new QuestionSyncController(questionSyncService);

    await expect(controller.sync()).resolves.toEqual(summary);
    expect(questionSyncService.syncLatestQuestions).toHaveBeenCalledWith(10);
  });
});
