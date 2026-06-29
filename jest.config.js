// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/server/tests/**/*.test.js'],
  collectCoverageFrom: [
    'server/services/*.js',
    '!server/services/embedder.js', // skipped — requires heavy model download
  ],
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};
