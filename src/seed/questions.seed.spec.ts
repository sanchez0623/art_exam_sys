import { AUTHORITATIVE_SOURCES, SEED_QUESTIONS } from './questions.seed';

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

    expect(coveredInstitutions).toEqual(
      new Set(AUTHORITATIVE_SOURCES.map(({ institution }) => institution)),
    );
  });
});
