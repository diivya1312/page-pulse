/** Jest configuration for the Page Pulse API (TypeScript, Node environment). */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/tests/**',
    '!server.ts',
  ],
  coverageDirectory: '../coverage',
  verbose: true,
  clearMocks: true,
};
