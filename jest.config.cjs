/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.test.ts',
    '!src/tool-definitions.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/tools/core/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './src/client.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/logger.ts': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  verbose: true,
  testTimeout: 10000,
  bail: false,
  errorOnDeprecated: true,
  maxWorkers: '50%'
};