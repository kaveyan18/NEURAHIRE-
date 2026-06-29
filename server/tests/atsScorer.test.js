// server/tests/atsScorer.test.js
'use strict';

const { computeScore } = require('../services/atsScorer.service');

// Helper
function jdSkill(canonical, weight = 1.0) {
  return { canonical, baseWeight: weight, sectionWeight: 1.0, occurrences: 1, category: 'backend', raw: canonical, source: 'dictionary' };
}

const EMPTY_SECTIONS = { skills: [], experience: [], projects: [], education: [], certifications: [], summary: [], other: [] };

// Minimal mock section results
const EMPTY_EXP  = { score: 0,  strengths: [], weaknesses: [] };
const EMPTY_PROJ = { score: 0,  strengths: [], weaknesses: [] };
const EMPTY_QUAL = { score: 50, issues: [], strengths: [], contactLinks: {}, wordCount: 400 };
const EMPTY_ACH  = { score: 0,  achievements: [], strengths: [], weaknesses: [] };
const EMPTY_EDU  = { score: 50, degreeLevel: 'bachelors', relevant: true, strengths: [], weaknesses: [] };

function makeParams(overrides = {}) {
  return {
    directMatches: [],
    semanticMatches: [],
    missing: [],
    jdSkills: [],
    resumeSkills: [],
    jdPriority: { required: [], preferred: [], niceToHave: [] },
    experienceResult:   EMPTY_EXP,
    projectResult:      EMPTY_PROJ,
    qualityResult:      EMPTY_QUAL,
    achievementResult:  EMPTY_ACH,
    educationResult:    EMPTY_EDU,
    ...overrides,
  };
}

describe('computeScore() — shape', () => {
  test('returns finalATS and breakdown object', () => {
    const result = computeScore(makeParams());
    expect(result).toHaveProperty('finalATS');
    expect(result).toHaveProperty('breakdown');
    expect(result.breakdown).toHaveProperty('keywordCoverage');
    expect(result.breakdown).toHaveProperty('semanticMatch');
    expect(result.breakdown).toHaveProperty('experienceScore');
    expect(result.breakdown).toHaveProperty('projectScore');
    expect(result.breakdown).toHaveProperty('resumeQuality');
    expect(result.breakdown).toHaveProperty('achievementScore');
    expect(result.breakdown).toHaveProperty('educationScore');
    expect(result.breakdown).toHaveProperty('formattingScore');
  });

  test('finalATS is between 0 and 100', () => {
    const result = computeScore(makeParams());
    expect(result.finalATS).toBeGreaterThanOrEqual(0);
    expect(result.finalATS).toBeLessThanOrEqual(100);
    expect(Number.isInteger(result.finalATS)).toBe(true);
  });
});

describe('computeScore() — keyword coverage', () => {
  test('100% coverage when all JD skills are directly matched', () => {
    const jdSkills = [jdSkill('react'), jdSkill('node.js')];
    const result = computeScore(makeParams({
      directMatches: ['react', 'node.js'],
      jdSkills,
      resumeSkills: jdSkills,
    }));
    expect(result.breakdown.keywordCoverage).toBe(100);
  });

  test('0% coverage when no skills match', () => {
    const jdSkills = [jdSkill('kubernetes'), jdSkill('redis')];
    const result = computeScore(makeParams({
      directMatches: [],
      missing: ['kubernetes', 'redis'],
      jdSkills,
    }));
    expect(result.breakdown.keywordCoverage).toBe(0);
  });
});

describe('computeScore() — experience dimension', () => {
  test('high experience score raises finalATS', () => {
    const highExp = computeScore(makeParams({ experienceResult: { score: 90, strengths: [], weaknesses: [] } }));
    const lowExp  = computeScore(makeParams({ experienceResult: { score: 10, strengths: [], weaknesses: [] } }));
    expect(highExp.finalATS).toBeGreaterThan(lowExp.finalATS);
  });

  test('experience score is reflected in breakdown', () => {
    const result = computeScore(makeParams({ experienceResult: { score: 75, strengths: [], weaknesses: [] } }));
    expect(result.breakdown.experienceScore).toBe(75);
  });
});

describe('computeScore() — project dimension', () => {
  test('high project score raises finalATS', () => {
    const highProj = computeScore(makeParams({ projectResult: { score: 90, strengths: [], weaknesses: [] } }));
    const lowProj  = computeScore(makeParams({ projectResult: { score: 5,  strengths: [], weaknesses: [] } }));
    expect(highProj.finalATS).toBeGreaterThan(lowProj.finalATS);
  });
});

describe('computeScore() — required skill priority', () => {
  test('matching a required skill contributes more than a nice-to-have', () => {
    const jdSkills = [jdSkill('react', 1.0), jdSkill('redux', 1.0)];
    const jdPriority = {
      required: ['required: react'],
      preferred: [],
      niceToHave: ['nice to have: redux'],
    };
    const withReact = computeScore(makeParams({
      directMatches: ['react'], jdSkills, jdPriority,
    }));
    const withRedux = computeScore(makeParams({
      directMatches: ['redux'], jdSkills, jdPriority,
    }));
    expect(withReact.breakdown.keywordCoverage).toBeGreaterThan(withRedux.breakdown.keywordCoverage);
  });
});

describe('computeScore() — semantic coverage', () => {
  test('semantic match gives partial credit', () => {
    const jdSkills = [jdSkill('rest api')];
    const result = computeScore(makeParams({
      semanticMatches: [{ jdSkill: 'rest api', resumeSkill: 'restful', similarity: 0.91 }],
      jdSkills,
    }));
    expect(result.breakdown.semanticMatch).toBeGreaterThan(0);
  });
});

describe('computeScore() — no single category dominates', () => {
  test('even 100% keyword coverage cannot push finalATS to 100 alone', () => {
    const jdSkills = [jdSkill('react')];
    const result = computeScore(makeParams({
      directMatches: ['react'],
      jdSkills,
      resumeSkills: jdSkills,
      experienceResult:  { score: 0, strengths: [], weaknesses: [] },
      projectResult:     { score: 0, strengths: [], weaknesses: [] },
      qualityResult:     { score: 0, issues: [], strengths: [], contactLinks: {}, wordCount: 0 },
      achievementResult: { score: 0, achievements: [], strengths: [], weaknesses: [] },
      educationResult:   { score: 0, degreeLevel: 'none', relevant: false, strengths: [], weaknesses: [] },
    }));
    // keyword weight is 20%, so max from keywords alone ≈ 20
    expect(result.finalATS).toBeLessThanOrEqual(30);
  });
});
