import {
  AUTHORITATIVE_SOURCES,
  SEED_QUESTIONS,
  attachAuthoritativeSourceMetadata,
  findAuthoritativeSource,
} from './questions.seed';

describe('SEED_QUESTIONS authoritative sources', () => {
  it('uses only the configured authoritative institutions', () => {
    const coveredInstitutions = new Set<string>();

    for (const question of SEED_QUESTIONS) {
      const authority = findAuthoritativeSource(question.source);

      expect(authority).toBeDefined();
      expect(question.source?.startsWith(authority!.institution)).toBe(true);
      expect(question.sourceSite).toBe(authority?.sourceSite);
      expect(question.sourceUrl).toBe(authority?.sourceUrl);
      expect(question.sourceUrl).toMatch(/^https:\/\//);

      coveredInstitutions.add(authority!.institution);
    }

    for (const institution of AUTHORITATIVE_SOURCES.map(
      ({ institution }) => institution,
    )) {
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

  it('preserves custom metadata for non-catalog sources', () => {
    const customQuestion = {
      content: '测试题目',
      options: ['A', 'B'],
      answer: '0',
      explanation: '测试解析',
      source: '某艺术机构自定义题',
      sourceSite: '自定义来源站点',
      sourceUrl: 'https://example.com/custom-source',
    };

    expect(attachAuthoritativeSourceMetadata(customQuestion)).toEqual(
      customQuestion,
    );
  });
});
