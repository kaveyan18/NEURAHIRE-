// server/tests/semanticMatcher.test.js
'use strict';

// Mock the embedder so tests don't require the actual model
jest.mock('../services/embedder', () => ({
  embed: jest.fn(),
  isEmbedderReady: jest.fn(),
  embedderFailed: jest.fn(() => false),
}));

const { embed, isEmbedderReady } = require('../services/embedder');
const { semanticMatch } = require('../services/semanticMatcher.service');

// Helper: build a minimal ExtractedSkill object
function skill(canonical, category = 'backend') {
  return { canonical, category, baseWeight: 1.0, sectionWeight: 1.0, occurrences: 1, raw: canonical, source: 'dictionary' };
}

// Helper: create a mock vector of length 4 (unit vectors for cosine test)
function vec(values) { return values; }

describe('semanticMatch() — direct matching', () => {
  beforeEach(() => {
    isEmbedderReady.mockReturnValue(false); // disable semantic layer for these tests
  });

  test('exact canonical match returns directMatch', async () => {
    const resume = [skill('react'), skill('node.js')];
    const jd     = [skill('react')];
    const { directMatches } = await semanticMatch(resume, jd);
    expect(directMatches).toContain('react');
  });

  test('non-matching skill goes to missing when embedder is off', async () => {
    const resume = [skill('react')];
    const jd     = [skill('graphql')];
    const { directMatches, missing } = await semanticMatch(resume, jd);
    expect(directMatches).not.toContain('graphql');
    expect(missing).toContain('graphql');
  });

  test('returns empty arrays for empty JD skills', async () => {
    const result = await semanticMatch([skill('react')], []);
    expect(result.directMatches).toHaveLength(0);
    expect(result.semanticMatches).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  test('multiple direct matches', async () => {
    const resume = [skill('react'), skill('node.js'), skill('mongodb')];
    const jd     = [skill('react'), skill('node.js')];
    const { directMatches } = await semanticMatch(resume, jd);
    expect(directMatches).toContain('react');
    expect(directMatches).toContain('node.js');
    expect(directMatches).not.toContain('mongodb'); // not in JD
  });
});

describe('semanticMatch() — semantic layer enabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isEmbedderReady.mockReturnValue(true);
    embed.mockResolvedValue(null); // default: safe fallback
  });


  test('recovers a semantic match above threshold', async () => {
    // Use names that are not in the alias table → won't be direct-matched
    const jdSkillObj     = { ...skill('apollo federation'), canonical: 'apollo federation' };
    const resumeSkillObj = { ...skill('graphql gateway'),   canonical: 'graphql gateway' };

    // identical unit vectors → cosine = 1.0 ≥ threshold 0.80
    embed.mockResolvedValueOnce([
      [1, 0, 0, 0],  // jd vector
      [1, 0, 0, 0],  // resume vector (identical → similarity = 1.0)
    ]);

    const { semanticMatches, missing } = await semanticMatch([resumeSkillObj], [jdSkillObj], 0.80);
    expect(semanticMatches.length).toBe(1);
    expect(semanticMatches[0].jdSkill).toBe('apollo federation');
    expect(semanticMatches[0].similarity).toBeGreaterThanOrEqual(0.80);
    expect(missing).toHaveLength(0);
  });

  test('does not recover a match below threshold', async () => {
    // Use names that are not in the alias table → won't be direct-matched
    const jdSkillObj     = { ...skill('terraform enterprise'), canonical: 'terraform enterprise' };
    const resumeSkillObj = { ...skill('aws cdk toolkit'),     canonical: 'aws cdk toolkit' };

    // orthogonal unit vectors → cosine = 0 < threshold 0.80
    embed.mockResolvedValueOnce([
      [1, 0, 0, 0],  // jd vector
      [0, 1, 0, 0],  // resume vector (orthogonal → similarity = 0)
    ]);

    const { semanticMatches, missing } = await semanticMatch([resumeSkillObj], [jdSkillObj], 0.80);
    expect(semanticMatches).toHaveLength(0);
    expect(missing).toContain('terraform enterprise');
  });

  test('gracefully handles embed() returning null', async () => {
    embed.mockResolvedValueOnce(null);
    const jd = [skill('redis')];
    const resume = [skill('memcached')];
    const { missing } = await semanticMatch(resume, jd, 0.80);
    expect(missing).toContain('redis');
  });

  test('gracefully handles embed() throwing', async () => {
    embed.mockRejectedValueOnce(new Error('model error'));
    const jd = [skill('redis')];
    const resume = [skill('memcached')];
    const { missing } = await semanticMatch(resume, jd, 0.80);
    expect(missing).toContain('redis');
  });
});
