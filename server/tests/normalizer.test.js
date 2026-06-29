// server/tests/normalizer.test.js
'use strict';

const {
  normalizeText,
  normalizeSkillToken,
  applyAliasTable,
  isGenericWord,
  extractNgrams,
  tokenize,
} = require('../services/normalizer.service');

// ─── normalizeText ────────────────────────────────────────────────────────────
describe('normalizeText()', () => {
  test('strips HTML tags', () => {
    expect(normalizeText('<b>React</b> and <i>Node.js</i>')).toBe('React and Node.js');
  });

  test('collapses multiple spaces into one', () => {
    // normalizeText collapses horizontal whitespace
    const result = normalizeText('hello   world');
    expect(result).toBe('hello world');
  });

  test('returns empty string for null/undefined', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
    expect(normalizeText('')).toBe('');
  });

  test('normalizes line endings', () => {
    const input = 'line1\r\nline2\rline3';
    expect(normalizeText(input)).toContain('line1');
    expect(normalizeText(input)).toContain('line2');
    expect(normalizeText(input)).toContain('line3');
  });
});

// ─── normalizeSkillToken ──────────────────────────────────────────────────────
describe('normalizeSkillToken()', () => {
  // JavaScript variants
  test('NodeJS → node.js', () => {
    expect(normalizeSkillToken('NodeJS')).toBe('node.js');
  });
  test('Node JS → node.js', () => {
    expect(normalizeSkillToken('Node JS')).toBe('node.js');
  });
  test('node.js stays → node.js', () => {
    expect(normalizeSkillToken('Node.js')).toBe('node.js');
  });

  // React
  test('ReactJS → react', () => {
    expect(normalizeSkillToken('ReactJS')).toBe('react');
  });
  test('React.js → react', () => {
    expect(normalizeSkillToken('React.js')).toBe('react');
  });

  // REST
  test('RESTful APIs → rest api', () => {
    expect(normalizeSkillToken('RESTful APIs')).toBe('rest api');
  });
  test('REST APIs → rest api', () => {
    expect(normalizeSkillToken('REST APIs')).toBe('rest api');
  });
  test('Restful → rest api', () => {
    expect(normalizeSkillToken('Restful')).toBe('rest api');
  });

  // MongoDB
  test('Mongo DB → mongodb', () => {
    expect(normalizeSkillToken('Mongo DB')).toBe('mongodb');
  });

  // PostgreSQL
  test('Postgres → postgresql', () => {
    expect(normalizeSkillToken('Postgres')).toBe('postgresql');
  });

  // RBAC
  test('Role Based Access Control → rbac', () => {
    expect(normalizeSkillToken('Role Based Access Control')).toBe('rbac');
  });
  test('Role-Based Access Control → rbac', () => {
    expect(normalizeSkillToken('Role-Based Access Control')).toBe('rbac');
  });
  test('RBAC → rbac (lowercased)', () => {
    expect(normalizeSkillToken('RBAC')).toBe('rbac');
  });

  // OOP
  test('Object Oriented Programming → oop', () => {
    expect(normalizeSkillToken('Object Oriented Programming')).toBe('oop');
  });
  test('OOP → oop', () => {
    expect(normalizeSkillToken('OOP')).toBe('oop');
  });
  test('OOPS → oop', () => {
    expect(normalizeSkillToken('OOPS')).toBe('oop');
  });

  // JWT
  test('JSON Web Token → jwt', () => {
    expect(normalizeSkillToken('JSON Web Token')).toBe('jwt');
  });
  test('JWT Authentication → jwt', () => {
    expect(normalizeSkillToken('JWT Authentication')).toBe('jwt');
  });

  // Kubernetes
  test('K8s → kubernetes', () => {
    expect(normalizeSkillToken('K8s')).toBe('kubernetes');
  });
  test('k8s → kubernetes', () => {
    expect(normalizeSkillToken('k8s')).toBe('kubernetes');
  });

  // CI/CD
  test('CI/CD → ci/cd', () => {
    expect(normalizeSkillToken('CI/CD')).toBe('ci/cd');
  });
  test('CICD → ci/cd', () => {
    expect(normalizeSkillToken('CICD')).toBe('ci/cd');
  });
  test('Continuous Integration → ci/cd', () => {
    expect(normalizeSkillToken('Continuous Integration')).toBe('ci/cd');
  });

  // GitHub Actions
  test('GH Actions → github actions', () => {
    expect(normalizeSkillToken('GH Actions')).toBe('github actions');
  });

  // TypeScript
  test('Type Script → typescript', () => {
    expect(normalizeSkillToken('Type Script')).toBe('typescript');
  });

  // Python
  test('Python3 → python', () => {
    expect(normalizeSkillToken('Python3')).toBe('python');
  });
  test('Python 3 → python', () => {
    expect(normalizeSkillToken('Python 3')).toBe('python');
  });

  // AWS
  test('Amazon Web Services → aws', () => {
    expect(normalizeSkillToken('Amazon Web Services')).toBe('aws');
  });

  // GCP
  test('Google Cloud Platform → gcp', () => {
    expect(normalizeSkillToken('Google Cloud Platform')).toBe('gcp');
  });

  // Docker
  test('Docker-Compose → docker', () => {
    expect(normalizeSkillToken('Docker-Compose')).toBe('docker');
  });

  // Rails
  test('Ruby on Rails → rails', () => {
    expect(normalizeSkillToken('Ruby on Rails')).toBe('rails');
  });

  // Spring Boot
  test('SpringBoot → spring boot', () => {
    expect(normalizeSkillToken('SpringBoot')).toBe('spring boot');
  });

  // Socket.io
  test('Socket IO → socket.io', () => {
    expect(normalizeSkillToken('Socket IO')).toBe('socket.io');
  });
  test('SocketIO → socket.io', () => {
    expect(normalizeSkillToken('SocketIO')).toBe('socket.io');
  });

  // Prisma ORM
  test('Prisma ORM → prisma', () => {
    expect(normalizeSkillToken('Prisma ORM')).toBe('prisma');
  });

  // Handles empty/null gracefully
  test('empty string returns empty', () => {
    expect(normalizeSkillToken('')).toBe('');
  });
  test('null returns empty', () => {
    expect(normalizeSkillToken(null)).toBe('');
  });
});

// ─── isGenericWord ────────────────────────────────────────────────────────────
describe('isGenericWord()', () => {
  const generic = ['world', 'right', 'career', 'place', 'action', 'state', 'good', 'best', 'great', 'company', 'team', 'work'];

  test.each(generic)('"%s" is a generic word', (word) => {
    expect(isGenericWord(word)).toBe(true);
  });

  const technical = ['react', 'node.js', 'mongodb', 'docker', 'kubernetes', 'jwt', 'rbac', 'graphql'];
  test.each(technical)('"%s" is NOT a generic word', (word) => {
    expect(isGenericWord(word)).toBe(false);
  });
});

// ─── tokenize ─────────────────────────────────────────────────────────────────
describe('tokenize()', () => {
  test('splits on whitespace', () => {
    const result = tokenize('react node.js mongodb');
    expect(result).toContain('react');
    expect(result).toContain('node.js');
    expect(result).toContain('mongodb');
  });

  test('splits on comma', () => {
    expect(tokenize('react,node.js')).toEqual(expect.arrayContaining(['react', 'node.js']));
  });

  test('filters empty tokens', () => {
    const result = tokenize('  react  ');
    expect(result.filter(t => t === '')).toHaveLength(0);
  });
});

// ─── extractNgrams ────────────────────────────────────────────────────────────
describe('extractNgrams()', () => {
  const tokens = ['node', 'js', 'rest', 'api'];

  test('produces unigrams', () => {
    expect(extractNgrams(tokens, 1)).toContain('node');
    expect(extractNgrams(tokens, 1)).toContain('api');
  });

  test('produces bigrams', () => {
    expect(extractNgrams(tokens, 2)).toContain('node js');
    expect(extractNgrams(tokens, 2)).toContain('rest api');
  });

  test('produces trigrams', () => {
    expect(extractNgrams(tokens, 3)).toContain('node js rest');
  });

  test('returns empty for empty tokens', () => {
    expect(extractNgrams([], 3)).toHaveLength(0);
  });
});
