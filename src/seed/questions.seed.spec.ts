import {
  AUTHORITATIVE_SOURCES,
  SEED_QUESTIONS,
  attachAuthoritativeSourceMetadata,
} from './questions.seed';

describe('SEED_QUESTIONS authoritative sources', () => {
  it('uses only the configured authoritative institutions', () => {
    const coveredInstitutions = new Set<string>();

    for (const question of SEED_QUESTIONS) {
      const authority = AUTHORITATIVE_SOURCES.find(({ institution }) =>
        question.source?.includes(institution),
      );

      expect(authority).toBeDefined();
      expect(question.sourceSite).toBe(authority?.sourceSite);
      expect(question.sourceUrl).toBe(authority?.sourceUrl);
      expect(question.sourceUrl).toMatch(/^https:\/\//);

      coveredInstitutions.add(authority!.institution);
    }

    for (const institution of [
      '耶鲁大学',
      '哈佛大学',
      '考陶尔德艺术研究院',
      '斯莱德美术学院',
    ]) {
      expect(coveredInstitutions.has(institution)).toBe(true);
    }
  });

  it('leaves non-authoritative-source questions unchanged', () => {
    const customQuestion = {
      content: '测试题目',
      options: ['A', 'B'],
      answer: '0',
      explanation: '测试解析',
      source: '某艺术机构自定义题',
    };

    expect(attachAuthoritativeSourceMetadata(customQuestion)).toEqual(
      customQuestion,
    );
  });
});
