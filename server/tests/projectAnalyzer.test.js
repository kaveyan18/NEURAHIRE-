// server/tests/projectAnalyzer.test.js
'use strict';

const { analyzeProjects } = require('../services/projectAnalyzer.service');

const EMPTY = { experience: [], projects: [], skills: [], education: [], certifications: [], summary: [], other: [] };

function sections(projLines = []) {
  return { ...EMPTY, projects: projLines };
}

describe('analyzeProjects() — no projects', () => {
  test('returns score 0 with a weakness when no projects', () => {
    const result = analyzeProjects(sections([]));
    expect(result.score).toBe(0);
    expect(result.weaknesses.some(w => /no projects/i.test(w))).toBe(true);
  });
});

describe('analyzeProjects() — stack breadth', () => {
  test('full-stack project scores higher than single-layer', () => {
    const fullStack = sections([
      'Built a SaaS app using React, Node.js, PostgreSQL, JWT auth',
      'Deployed on AWS EC2 with Docker and CI/CD via GitHub Actions',
      'Real-time notifications via Socket.io',
    ]);
    const singleLayer = sections([
      'Created a React UI for displaying weather data',
    ]);
    expect(analyzeProjects(fullStack).score).toBeGreaterThan(analyzeProjects(singleLayer).score);
  });

  test('mentions multiple stack layers', () => {
    const result = analyzeProjects(sections([
      'Stack: React (frontend), Express/Node.js (backend), MongoDB (database)',
      'Auth: JWT + OAuth2, Deployed on Vercel, GitHub Actions CI/CD',
    ]));
    expect(result.score).toBeGreaterThan(25);
    expect(result.strengths.some(s => /stack|layer/i.test(s))).toBe(true);
  });
});

describe('analyzeProjects() — deployment signals', () => {
  test('deployed projects score higher than non-deployed', () => {
    const deployed = sections([
      'Deployed e-commerce platform on AWS serving 500 users',
      'Live at https://myapp.vercel.app with CI/CD pipeline',
    ]);
    const notDeployed = sections([
      'Built a full-stack e-commerce app with React and Node.js',
    ]);
    expect(analyzeProjects(deployed).score).toBeGreaterThan(analyzeProjects(notDeployed).score);
  });
});

describe('analyzeProjects() — engineering depth', () => {
  test('engineering depth signals boost the score', () => {
    const deep = sections([
      'Built REST API with rate limiting, caching via Redis, and pagination',
      'Implemented WebSocket real-time messaging with 10k concurrent users',
      'Background job queue using Bull for email processing',
    ]);
    const shallow = sections([
      'Created a web application using React',
      'Added some features to the project',
    ]);
    expect(analyzeProjects(deep).score).toBeGreaterThan(analyzeProjects(shallow).score);
  });
});

describe('analyzeProjects() — generic project penalty', () => {
  test('todo app is penalized', () => {
    const generic = sections([
      'Built a Todo App using React and local storage',
    ]);
    const original = sections([
      'Built a collaborative document editor with real-time sync via WebSockets',
    ]);
    expect(analyzeProjects(original).score).toBeGreaterThan(analyzeProjects(generic).score);
  });

  test('weather app is penalized', () => {
    const result = analyzeProjects(sections([
      'Created a weather app using OpenWeatherMap API',
    ]));
    expect(result.weaknesses.some(w => /generic|tutorial/i.test(w))).toBe(true);
  });
});

describe('analyzeProjects() — AI bonus', () => {
  test('AI/ML integration gives a bonus', () => {
    const withAI = sections([
      'Built a RAG chatbot using LangChain, OpenAI GPT-4, and vector embeddings',
    ]);
    // Use a project description with no recognizable stack layers at all
    const withoutAI = sections([
      'Created a personal journaling application for note-taking',
    ]);
    expect(analyzeProjects(withAI).score).toBeGreaterThan(analyzeProjects(withoutAI).score);
    expect(analyzeProjects(withAI).strengths.some(s => /ai|ml/i.test(s))).toBe(true);
  });
});

describe('analyzeProjects() — output shape', () => {
  test('returns score, strengths, weaknesses', () => {
    const result = analyzeProjects(sections(['Built a web app using React and Node.js']));
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('weaknesses');
    expect(typeof result.score).toBe('number');
    expect(Array.isArray(result.strengths)).toBe(true);
  });

  test('score is bounded 0–100', () => {
    const result = analyzeProjects(sections([
      'Built a full-stack SaaS platform: React, Node.js, PostgreSQL, Redis, Docker',
      'Deployed on AWS ECS with CI/CD via GitHub Actions, 1000 daily users',
      'Real-time collaboration via WebSockets, JWT auth, rate limiting, caching',
    ]));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
