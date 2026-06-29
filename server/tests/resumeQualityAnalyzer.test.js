// server/tests/resumeQualityAnalyzer.test.js
'use strict';

const { analyzeResumeQuality } = require('../services/resumeQualityAnalyzer.service');

const EMPTY = { experience: [], projects: [], skills: [], education: [], certifications: [], summary: [], other: [] };

function sections(overrides = {}) {
  return { ...EMPTY, ...overrides };
}

describe('analyzeResumeQuality() — output shape', () => {
  test('returns score, issues, strengths, contactLinks, wordCount', () => {
    const result = analyzeResumeQuality(sections());
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('contactLinks');
    expect(result).toHaveProperty('wordCount');
    expect(typeof result.score).toBe('number');
    expect(Array.isArray(result.issues)).toBe(true);
    expect(typeof result.contactLinks).toBe('object');
  });

  test('score is bounded 0–100', () => {
    const result = analyzeResumeQuality(sections({
      experience: ['Developed REST APIs using Node.js for enterprise clients'],
      skills:     ['React, Node.js, Docker, PostgreSQL'],
      education:  ['B.Tech Computer Science, IIT Delhi, 2023'],
    }));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('analyzeResumeQuality() — section presence', () => {
  test('missing essential sections are flagged', () => {
    const result = analyzeResumeQuality(sections({ skills: ['React, Node.js'] }));
    const issueText = result.issues.join(' ');
    expect(issueText).toMatch(/experience|education/i);
  });

  test('all essential sections present raises score vs missing them', () => {
    const complete = sections({
      experience: ['Developed and deployed REST APIs serving 10k daily users'],
      skills:     ['React, Node.js, PostgreSQL, Docker'],
      education:  ['B.S. Computer Science, 2023'],
      summary:    ['Full-stack software engineer with 2 years of experience'],
      projects:   ['Built a real-time chat app using Socket.io and Redis'],
    });
    const minimal = sections({
      skills: ['React, Node.js'],
    });
    expect(analyzeResumeQuality(complete).score).toBeGreaterThan(analyzeResumeQuality(minimal).score);
  });

  test('missing summary is flagged', () => {
    const result = analyzeResumeQuality(sections({
      experience: ['Developed APIs'],
      skills: ['Node.js'],
      education: ['B.S. CS'],
    }));
    expect(result.issues.some(i => /summary|objective/i.test(i))).toBe(true);
  });
});

describe('analyzeResumeQuality() — contact detection', () => {
  test('detects email address', () => {
    const result = analyzeResumeQuality(sections({
      other: ['john.doe@gmail.com | +91 9876543210 | linkedin.com/in/johndoe'],
    }));
    expect(result.contactLinks.email).toBe(true);
  });

  test('detects LinkedIn URL', () => {
    const result = analyzeResumeQuality(sections({
      other: ['linkedin.com/in/johndoe-dev'],
    }));
    expect(result.contactLinks.linkedin).toBe(true);
  });

  test('detects GitHub URL', () => {
    const result = analyzeResumeQuality(sections({
      other: ['github.com/johndoe'],
    }));
    expect(result.contactLinks.github).toBe(true);
  });

  test('missing LinkedIn is flagged as an issue', () => {
    const result = analyzeResumeQuality(sections({
      other: ['john.doe@gmail.com'],
    }));
    expect(result.issues.some(i => /linkedin/i.test(i))).toBe(true);
  });

  test('missing GitHub is flagged as an issue', () => {
    const result = analyzeResumeQuality(sections({
      other: ['john.doe@gmail.com'],
    }));
    expect(result.issues.some(i => /github/i.test(i))).toBe(true);
  });
});

describe('analyzeResumeQuality() — weak phrases', () => {
  test('"responsible for" is detected as a weak phrase', () => {
    const result = analyzeResumeQuality(sections({
      experience: ['Responsible for managing the database and API endpoints'],
    }));
    expect(result.issues.some(i => /weak|passive|responsible for/i.test(i))).toBe(true);
  });

  test('"helped with" is detected as a weak phrase', () => {
    const result = analyzeResumeQuality(sections({
      experience: ['Helped with the development of the backend API'],
    }));
    expect(result.issues.some(i => /weak|passive|helped/i.test(i))).toBe(true);
  });

  test('no weak phrases returns strength message', () => {
    const result = analyzeResumeQuality(sections({
      experience: ['Developed and optimized REST APIs reducing latency by 40%'],
    }));
    expect(result.strengths.some(s => /weak|passive/i.test(s))).toBe(true);
  });
});

describe('analyzeResumeQuality() — word count', () => {
  test('ideal word count (250–900) returns a strength', () => {
    const words = Array(400).fill('nodejs').join(' ');
    const result = analyzeResumeQuality(sections({ other: [words] }));
    expect(result.strengths.some(s => /word count|length/i.test(s))).toBe(true);
  });

  test('very short resume flags an issue', () => {
    // Empty sections → wordCount of 0, well below MIN_WORDS threshold of 250
    const result = analyzeResumeQuality(sections({}));
    expect(result.issues.some(i => /short|words/i.test(i))).toBe(true);
  });
});
