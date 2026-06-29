// server/tests/skillExtractor.test.js
'use strict';

// Mock the skillDictionary service so tests don't need a live MongoDB
jest.mock('../services/skillDictionary.service', () => {
  const MOCK_SKILLS = {
    'react':        { canonical: 'react',        category: 'frontend', weight: 1.5, aliases: ['react','reactjs','react.js'] },
    'node.js':      { canonical: 'node.js',      category: 'backend',  weight: 1.5, aliases: ['node.js','nodejs','node js','node'] },
    'mongodb':      { canonical: 'mongodb',      category: 'database', weight: 1.4, aliases: ['mongodb','mongo db','mongo'] },
    'graphql':      { canonical: 'graphql',      category: 'backend',  weight: 1.4, aliases: ['graphql','graph ql'] },
    'docker':       { canonical: 'docker',       category: 'devops',   weight: 1.5, aliases: ['docker','dockerfile','docker-compose'] },
    'kubernetes':   { canonical: 'kubernetes',   category: 'devops',   weight: 1.5, aliases: ['kubernetes','k8s'] },
    'jwt':          { canonical: 'jwt',          category: 'concept',  weight: 1.4, aliases: ['jwt','json web token'] },
    'rbac':         { canonical: 'rbac',         category: 'concept',  weight: 1.4, aliases: ['rbac','role based access control'] },
    'redis':        { canonical: 'redis',        category: 'database', weight: 1.4, aliases: ['redis'] },
    'prisma':       { canonical: 'prisma',       category: 'backend',  weight: 1.3, aliases: ['prisma','prisma orm'] },
    'socket.io':    { canonical: 'socket.io',    category: 'backend',  weight: 1.3, aliases: ['socket.io','socketio','socket io'] },
    'rest api':     { canonical: 'rest api',     category: 'backend',  weight: 1.4, aliases: ['rest api','restful api','restful','rest apis'] },
    'typescript':   { canonical: 'typescript',   category: 'language', weight: 1.5, aliases: ['typescript','type script'] },
    'javascript':   { canonical: 'javascript',   category: 'language', weight: 1.5, aliases: ['javascript','js'] },
    'python':       { canonical: 'python',       category: 'language', weight: 1.5, aliases: ['python','python3'] },
    'aws':          { canonical: 'aws',          category: 'cloud',    weight: 1.5, aliases: ['aws','amazon web services'] },
    'postgresql':   { canonical: 'postgresql',   category: 'database', weight: 1.4, aliases: ['postgresql','postgres','pgsql'] },
    'ci/cd':        { canonical: 'ci/cd',        category: 'devops',   weight: 1.4, aliases: ['ci/cd','cicd','ci cd'] },
    'apollo federation': { canonical: 'apollo federation', category: 'backend', weight: 1.3, aliases: ['apollo federation','apollo gateway'] },
  };

  const lookupMap = new Map();
  for (const [canonical, entry] of Object.entries(MOCK_SKILLS)) {
    lookupMap.set(canonical, entry);
    for (const alias of entry.aliases) {
      lookupMap.set(alias.toLowerCase(), entry);
    }
  }

  return {
    lookupSkill: (token) => lookupMap.get(token.toLowerCase()) || null,
    isReady: () => true,
    getDictionarySize: () => Object.keys(MOCK_SKILLS).length,
    getAllSkills: () => Object.values(MOCK_SKILLS),
  };
});

const { extractSkills, extractSkillsFromSections } = require('../services/skillExtractor.service');

// ─── extractSkills ─────────────────────────────────────────────────────────────
describe('extractSkills()', () => {
  test('detects React from text', () => {
    const skills = extractSkills('Built a dashboard using React and Redux', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('react');
  });

  test('detects Node.js from "NodeJS"', () => {
    const skills = extractSkills('Backend built with NodeJS and Express', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('node.js');
  });

  test('detects MongoDB from "Mongo DB"', () => {
    const skills = extractSkills('Database: Mongo DB and Redis', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('mongodb');
    expect(canonicals).toContain('redis');
  });

  test('detects GraphQL explicitly', () => {
    const skills = extractSkills('Implemented GraphQL API with Apollo', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('graphql');
  });

  test('detects JWT from acronym', () => {
    const skills = extractSkills('Secured routes using JWT authentication', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('jwt');
  });

  test('detects Kubernetes from K8s', () => {
    const skills = extractSkills('Deployed application to K8s cluster', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('kubernetes');
  });

  test('detects Socket.io', () => {
    const skills = extractSkills('Real-time features implemented with Socket IO', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('socket.io');
  });

  test('detects Prisma ORM', () => {
    const skills = extractSkills('Used Prisma ORM for database access', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('prisma');
  });

  test('does NOT extract generic words like "world", "right", "career"', () => {
    const skills = extractSkills('In the world of software, right career choices are essential to great work.', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).not.toContain('world');
    expect(canonicals).not.toContain('right');
    expect(canonicals).not.toContain('career');
    expect(canonicals).not.toContain('work');
    expect(canonicals).not.toContain('great');
  });

  test('does NOT extract "technology", "company", "team"', () => {
    const skills = extractSkills('Technology company with a great team.', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).not.toContain('technology');
    expect(canonicals).not.toContain('company');
    expect(canonicals).not.toContain('team');
  });

  test('detects REST API from "RESTful APIs"', () => {
    const skills = extractSkills('Built RESTful APIs with Express', 1.0);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('rest api');
  });

  test('handles empty text gracefully', () => {
    expect(extractSkills('', 1.0)).toHaveLength(0);
    expect(extractSkills(null, 1.0)).toHaveLength(0);
  });

  test('assigns section weight to found skills', () => {
    const skills = extractSkills('React developer', 1.5);
    const react = skills.find(s => s.canonical === 'react');
    expect(react?.sectionWeight).toBe(1.5);
  });

  test('counts occurrences for repeated skills', () => {
    const skills = extractSkills('React frontend. React components. React hooks. Node.js backend.', 1.0);
    const react = skills.find(s => s.canonical === 'react');
    expect(react?.occurrences).toBeGreaterThan(1);
  });
});

// ─── extractSkillsFromSections ────────────────────────────────────────────────
describe('extractSkillsFromSections()', () => {
  test('extracts from multiple weighted chunks', () => {
    const chunks = [
      { text: 'Skills: React, Node.js, MongoDB', weight: 1.5, section: 'skills' },
      { text: 'Worked with Docker and Kubernetes in production', weight: 1.3, section: 'experience' },
    ];
    const skills = extractSkillsFromSections(chunks);
    const canonicals = skills.map(s => s.canonical);
    expect(canonicals).toContain('react');
    expect(canonicals).toContain('node.js');
    expect(canonicals).toContain('mongodb');
    expect(canonicals).toContain('docker');
    expect(canonicals).toContain('kubernetes');
  });

  test('uses the highest section weight when a skill appears in multiple sections', () => {
    const chunks = [
      { text: 'React', weight: 0.7, section: 'summary' },
      { text: 'Built with React', weight: 1.5, section: 'skills' },
    ];
    const skills = extractSkillsFromSections(chunks);
    const react = skills.find(s => s.canonical === 'react');
    expect(react?.sectionWeight).toBe(1.5);
  });

  test('returns empty array for empty chunks', () => {
    expect(extractSkillsFromSections([])).toHaveLength(0);
  });
});
