// server/tests/experienceAnalyzer.test.js
'use strict';

const { analyzeExperience } = require('../services/experienceAnalyzer.service');

const EMPTY = { experience: [], projects: [], skills: [], education: [], certifications: [], summary: [], other: [] };

function sections(expLines = [], other = {}) {
  return { ...EMPTY, experience: expLines, ...other };
}

describe('analyzeExperience() — no experience', () => {
  test('returns score 0 with a weakness when no experience section', () => {
    const result = analyzeExperience(sections([]));
    expect(result.score).toBe(0);
    expect(result.weaknesses.length).toBeGreaterThan(0);
    expect(result.weaknesses[0]).toMatch(/no experience section/i);
  });
});

describe('analyzeExperience() — action verbs', () => {
  test('bullets starting with strong verbs raise the action verb score', () => {
    const good = sections([
      'Developed a real-time chat system using WebSockets',
      'Implemented JWT authentication reducing login time by 30%',
      'Optimized database queries improving throughput by 2x',
      'Built and deployed microservices on AWS EKS',
      'Automated CI/CD pipeline using GitHub Actions',
    ]);
    const bad = sections([
      'Responsible for working on the backend system',
      'Helped the team with various tasks',
      'Was involved in the development process',
    ]);
    const goodResult = analyzeExperience(good);
    const badResult  = analyzeExperience(bad);
    expect(goodResult.score).toBeGreaterThan(badResult.score);
  });

  test('weak phrasing is penalized', () => {
    const result = analyzeExperience(sections([
      'Responsible for managing the database',
      'Helped with the API development',
      'Was involved in deploying the application',
    ]));
    expect(result.weaknesses.some(w => /weak|passive/i.test(w))).toBe(true);
  });
});

describe('analyzeExperience() — metrics', () => {
  test('quantified bullets raise the metric score', () => {
    const withMetrics = sections([
      'Reduced API latency by 40% through query optimization',
      'Scaled the platform to serve 50,000 daily active users',
      'Improved build time by 3x using parallel compilation',
    ]);
    const withoutMetrics = sections([
      'Developed API endpoints for the platform',
      'Worked on scaling the system',
      'Improved the build process',
    ]);
    expect(analyzeExperience(withMetrics).score).toBeGreaterThan(analyzeExperience(withoutMetrics).score);
  });

  test('recognizes percentage improvements', () => {
    const result = analyzeExperience(sections([
      'Reduced server costs by 60% by migrating to serverless architecture',
      'Increased test coverage from 45% to 85%',
    ]));
    expect(result.score).toBeGreaterThan(20);
  });
});

describe('analyzeExperience() — production signals', () => {
  test('production signals are rewarded', () => {
    const prod = sections([
      'Developed and maintained production APIs serving enterprise customers',
      'On-call engineer ensuring 99.9% uptime SLA',
    ]);
    const noProd = sections([
      'Developed a personal project using Node.js',
      'Created a web application for practice',
    ]);
    expect(analyzeExperience(prod).score).toBeGreaterThan(analyzeExperience(noProd).score);
  });
});

describe('analyzeExperience() — leadership', () => {
  test('leadership signals add to the score', () => {
    const withLeadership = sections([
      'Led a team of 4 engineers to redesign the authentication system',
      'Architected the event-driven microservices migration',
    ]);
    const withoutLeadership = sections([
      'Developed REST APIs using Node.js and Express',
      'Built UI components with React',
    ]);
    expect(analyzeExperience(withLeadership).score).toBeGreaterThan(analyzeExperience(withoutLeadership).score);
  });
});

describe('analyzeExperience() — output shape', () => {
  test('returns score, strengths, weaknesses', () => {
    const result = analyzeExperience(sections(['Developed REST API using Express']));
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('weaknesses');
    expect(typeof result.score).toBe('number');
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.weaknesses)).toBe(true);
  });

  test('score is bounded 0–100', () => {
    const result = analyzeExperience(sections([
      'Developed and optimized production APIs reducing latency by 40%',
      'Led cross-functional team of 6 engineers delivering 3 major features',
      'Automated CI/CD pipeline cutting deployment time from 30min to 5min',
      'Architected event-driven microservices serving 1M+ daily requests',
      'Built real-time WebSocket system handling 10k concurrent users',
    ]));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
